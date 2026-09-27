#!/usr/bin/env node
// Scene-plate generator: renders deterministic frames of a named code-drawn scene to PNG.
// No paid generation: every pixel comes from the scene modules in ./scenes and the public-domain textures in ./textures.
//
// Usage:
//   node render-plate.mjs <scene> <out.png> [--t seconds] [--w 1080 --h 1920] [--seed n] [--no-grade]
//   node render-plate.mjs <scene> --frames N --fps 30 --out-dir dir [--t0 seconds] [--w --h --seed]
//   node render-plate.mjs --list
//   --var key=value (repeatable) passes scene options, e.g. --var variant=dividing, --var view=planet; see README.md.
//
// A scene is production/visuals/scenes/<name>.mjs exporting { kind: "2d" | "three", init(ctx), draw(t) }.
//   ctx: { W, H, seed, rng(), noise(x,y[,z]), fbm(x,y,z,oct), canvas, g (2d context, kind 2d), THREE + renderer (kind three),
//          textures: { name: file:// url }, hasTexture(name), loadTexture(name), loadImage(url), opts: { from --var } }
// draw(t) must be a pure function of t (and the seed): the harness re-runs it for every frame with no carried state
// other than what init built. After draw the harness applies the house finish: 6 percent vignette and 2 percent
// seeded monochrome grain (STYLE_BIBLE 6.4), then reports lower-third luminance (must be under 12 percent).
import { createRequire } from "node:module";
import { readFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require("playwright"); } catch { return require("/opt/node22/lib/node_modules/playwright"); } })();

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (f) => { const i = args.indexOf(f); return i > -1 ? args[i + 1] : null; };
const has = (f) => args.includes(f);
const scenesDir = resolve(here, "scenes");
const listScenes = () => readdirSync(scenesDir).filter(f => f.endsWith(".mjs")).map(f => basename(f, ".mjs"));
if (has("--list") || !args[0]) { console.log(listScenes().join("\n")); process.exit(0); }

const scene = args[0];
const scenePath = resolve(scenesDir, `${scene}.mjs`);
if (!existsSync(scenePath)) { console.error(`unknown scene "${scene}". Scenes: ${listScenes().join(", ")}`); process.exit(1); }
const W = +(opt("--w") ?? 1080), H = +(opt("--h") ?? 1920);
const seed = +(opt("--seed") ?? 1);
const t = +(opt("--t") ?? 0);
const frames = opt("--frames") ? +opt("--frames") : 0;
const fps = +(opt("--fps") ?? 30);
const t0 = +(opt("--t0") ?? 0);
const outDir = opt("--out-dir");
const grade = !has("--no-grade");
const outPng = args[1] && !args[1].startsWith("--") ? resolve(args[1]) : null;
const opts = {}; args.forEach((a, i) => { if (a === "--var" && args[i + 1]) { const m = args[i + 1].match(/^([^=]+)=(.*)$/); if (m) opts[m[1]] = m[2]; } });
if (!frames && !outPng) { console.error("need an output png, or --frames N --out-dir dir"); process.exit(1); }
if (frames && !outDir) { console.error("--frames needs --out-dir"); process.exit(1); }

// Public-domain textures on disk (see sources.json; files in ../assets/textures). Missing ones are simply absent from ctx.textures.
const texDir = resolve(here, "../assets/textures");
const textures = {};
if (existsSync(texDir)) for (const f of readdirSync(texDir)) if (/\.(png|jpe?g)$/i.test(f)) textures[basename(f).replace(/\.(png|jpe?g)$/i, "")] = pathToFileURL(resolve(texDir, f)).href;

const threeUrl = pathToFileURL(resolve(here, "../../node_modules/three/build/three.module.js")).href;
const html = `<!doctype html><html><head><meta charset="utf-8">
<script type="importmap">{"imports":{"three":"${threeUrl}"}}</script>
<style>html,body{margin:0;background:#060913;overflow:hidden}canvas{display:block}#out{position:absolute;left:0;top:0}#work{position:absolute;left:0;top:0;visibility:hidden}</style>
</head><body>
<canvas id="out" width="${W}" height="${H}"></canvas>
<canvas id="work" width="${W}" height="${H}"></canvas>
<script type="module">
  import * as THREE from "three";
  import * as mod from "${pathToFileURL(scenePath).href}";
  const W = ${W}, H = ${H}, SEED = ${seed};
  // mulberry32: small, fast, deterministic.
  const mulberry = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  // Seeded 3D value noise with a permutation table; fbm on top. Shared by every scene so the look is consistent.
  const makeNoise = (seed) => {
    const r = mulberry(seed * 7919 + 13); const P = new Uint8Array(512); const base = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; }
    for (let i = 0; i < 512; i++) P[i] = base[i & 255];
    const G = new Float32Array(256); for (let i = 0; i < 256; i++) G[i] = r();
    const fade = (u) => u * u * u * (u * (u * 6 - 15) + 10);
    const lerp = (a, b, q) => a + (b - a) * q;
    const v = (x, y, z) => G[P[P[P[x & 255] + (y & 255)] + (z & 255)]];
    const noise = (x, y = 0, z = 0) => {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
      const u = fade(xf), w = fade(yf), s = fade(zf);
      const x00 = lerp(v(xi, yi, zi), v(xi + 1, yi, zi), u), x10 = lerp(v(xi, yi + 1, zi), v(xi + 1, yi + 1, zi), u);
      const x01 = lerp(v(xi, yi, zi + 1), v(xi + 1, yi, zi + 1), u), x11 = lerp(v(xi, yi + 1, zi + 1), v(xi + 1, yi + 1, zi + 1), u);
      return lerp(lerp(x00, x10, w), lerp(x01, x11, w), s);
    };
    const fbm = (x, y = 0, z = 0, oct = 5, gain = 0.5, lac = 2.0) => { let a = 0, amp = 1, f = 1, n = 0; for (let i = 0; i < oct; i++) { a += amp * noise(x * f, y * f, z * f); n += amp; amp *= gain; f *= lac; } return a / n; };
    return { noise, fbm };
  };
  const out = document.getElementById("out"), work = document.getElementById("work");
  const og = out.getContext("2d", { willReadFrequently: true });
  const kind = mod.kind || "2d";
  const ctx = { W, H, seed: SEED, rng: mulberry(SEED), ...makeNoise(SEED), canvas: work, textures: ${JSON.stringify(textures)}, THREE, opts: ${JSON.stringify(opts)} };
  ctx.hasTexture = (n) => !!ctx.textures[n];
  ctx.loadImage = (url) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
  ctx.loadTexture = (name) => new Promise((res, rej) => { if (!ctx.textures[name]) return rej(new Error("no texture " + name)); new THREE.TextureLoader().load(ctx.textures[name], res, undefined, rej); });
  if (kind === "2d") ctx.g = work.getContext("2d");
  else {
    ctx.renderer = new THREE.WebGLRenderer({ canvas: work, antialias: true, alpha: false, powerPreference: "low-power", preserveDrawingBuffer: true });
    ctx.renderer.setPixelRatio(1); ctx.renderer.setSize(W, H, false);
  }
  // Grain tile: one seeded 256x256 monochrome noise tile, offset per frame by a seeded hash of the frame time.
  const grainTile = document.createElement("canvas"); grainTile.width = grainTile.height = 256;
  { const gg = grainTile.getContext("2d"), id = gg.createImageData(256, 256), r = mulberry(SEED * 31 + 7);
    for (let i = 0; i < id.data.length; i += 4) { const n = Math.round(128 + (r() + r() + r() - 1.5) * 2 * 40); id.data[i] = id.data[i + 1] = id.data[i + 2] = n; id.data[i + 3] = 255; } gg.putImageData(id, 0, 0); }
  const finish = (t) => {
    // 6 percent vignette.
    const vg = og.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.55);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.30)");
    og.fillStyle = vg; og.fillRect(0, 0, W, H);
    // 2 percent grain: an overlay at 4 percent alpha of a signed +/-40 tile is about 2 percent of full scale.
    const fr = Math.floor(t * 30), ox = (fr * 97) % 256, oy = (fr * 61) % 256;
    og.save(); og.globalCompositeOperation = "overlay"; og.globalAlpha = 0.22;
    for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) og.drawImage(grainTile, x, y);
    og.restore();
  };
  let ready = false, err = null;
  try { await mod.init(ctx); ready = true; } catch (e) { err = String(e && e.stack || e); }
  window.plateReady = () => ({ ready, err });
  window.plateDraw = (t, grade) => {
    try {
      mod.draw(t);
      og.globalCompositeOperation = "source-over"; og.globalAlpha = 1;
      og.drawImage(work, 0, 0);
      if (grade) finish(t);
      // Lower-third luminance check (mean Y of the bottom third, as a fraction).
      const id = og.getImageData(0, Math.floor(H * 2 / 3), W, H - Math.floor(H * 2 / 3)).data; let sum = 0;
      for (let i = 0; i < id.length; i += 16) sum += 0.2126 * id[i] + 0.7152 * id[i + 1] + 0.0722 * id[i + 2];
      return { lum: sum / (id.length / 16) / 255 };
    } catch (e) { return { err: String(e && e.stack || e) }; }
  };
</script></body></html>`;

const tStart0 = Date.now();
const sceneMod = await import(pathToFileURL(scenePath).href);
const gl = (sceneMod.kind || "2d") === "three";
const browser = await chromium.launch({ args: [...(gl ? ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] : ["--disable-gpu"]), "--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on("pageerror", e => console.error("page error:", e.message));
page.on("console", m => { if (m.type() === "error" || m.type() === "warning") console.error("console:", m.text()); });
const tmpHtml = resolve(here, ".plate.html");
const { writeFileSync, unlinkSync } = await import("node:fs");
writeFileSync(tmpHtml, html);
await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: "load" });
await page.waitForFunction(() => typeof window.plateReady === "function", null, { timeout: 120000 });
const st = await page.evaluate(() => window.plateReady());
if (has("--profile")) console.log(`  init ${((Date.now() - tStart0) / 1000).toFixed(2)} s`);
if (!st.ready) { console.error("scene init failed:", st.err); await browser.close(); process.exit(1); }
const out = await page.$("#out");
const profile = has("--profile");
const renderOne = async (tt, path) => {
  const a = Date.now();
  const r = await page.evaluate(({ tt, grade }) => window.plateDraw(tt, grade), { tt, grade });
  if (r.err) { console.error("draw failed:", r.err); await browser.close(); process.exit(1); }
  const b = Date.now();
  await out.screenshot({ path, type: "png" });
  if (profile) console.log(`  draw ${((b - a) / 1000).toFixed(2)} s, screenshot ${((Date.now() - b) / 1000).toFixed(2)} s`);
  return r.lum;
};
const tStart = Date.now();
if (frames) {
  mkdirSync(outDir, { recursive: true });
  let lumMax = 0;
  for (let f = 0; f < frames; f++) {
    const lum = await renderOne(t0 + f / fps, resolve(outDir, `f${String(f).padStart(5, "0")}.png`));
    lumMax = Math.max(lumMax, lum);
    if (f % 15 === 0) process.stdout.write(`frame ${f}/${frames}\r`);
  }
  console.log(`\n${scene}: ${frames} frames at ${fps} fps -> ${outDir} in ${((Date.now() - tStart) / 1000).toFixed(1)} s; lower-third luminance max ${(lumMax * 100).toFixed(1)}% ${lumMax < 0.12 ? "OK" : "OVER 12%"}`);
} else {
  mkdirSync(dirname(outPng), { recursive: true });
  const lum = await renderOne(t, outPng);
  console.log(`${scene} t=${t} seed=${seed} ${W}x${H} -> ${outPng} in ${((Date.now() - tStart) / 1000).toFixed(1)} s; lower-third luminance ${(lum * 100).toFixed(1)}% ${lum < 0.12 ? "OK" : "OVER 12%"}`);
}
await browser.close();
try { unlinkSync(tmpHtml); } catch {}
