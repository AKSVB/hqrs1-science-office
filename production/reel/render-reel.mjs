#!/usr/bin/env node
// Reel renderer: JSON timeline -> 1080x1920 H.264 MP4 (+ SRT captions).
// Frames are captured deterministically via window.seek(t), so output is reproducible.
// Usage: node render-reel.mjs <spec.json> [out.mp4] [--fps 30] [--jpeg]
// Visual types per scene: text | counter | bars | dots | scale | list
import { createRequire } from "node:module";
import { readFileSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require("playwright"); } catch { return require("/opt/node22/lib/node_modules/playwright"); } })();

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const specPath = args[0];
if (!specPath) { console.error("usage: render-reel.mjs <spec.json> [out.mp4] [--fps 30]"); process.exit(1); }
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const fpsIdx = args.indexOf("--fps");
const fps = fpsIdx > -1 ? Number(args[fpsIdx + 1]) : 30;
const useJpeg = args.includes("--jpeg");
const name = basename(specPath, ".json");
const outMp4 = resolve(args[1] && !args[1].startsWith("--") ? args[1] : resolve(here, "../out", name, `${name}.mp4`));
const outdir = dirname(outMp4);
const framesDir = resolve(outdir, "frames");
mkdirSync(outdir, { recursive: true });
if (existsSync(framesDir)) rmSync(framesDir, { recursive: true });
mkdirSync(framesDir);

// Needs a full ffmpeg (libx264 + aac). Playwright's bundled ffmpeg is too stripped down.
// Resolution order: $FFMPEG, imageio-ffmpeg's static binary (pip install imageio-ffmpeg), ffmpeg on PATH.
const ffmpegCandidates = [process.env.FFMPEG, (() => { const r = spawnSync("python3", ["-c", "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())"]); return r.status === 0 ? r.stdout.toString().trim() : null; })(), "ffmpeg"].filter(Boolean);
const ffmpeg = ffmpegCandidates.find(c => { const r = spawnSync(c, ["-hide_banner", "-encoders"]); return r.status === 0 && r.stdout.toString().includes("libx264"); });
if (!ffmpeg) throw new Error("ffmpeg with libx264 not found. Run: pip install imageio-ffmpeg");

const duration = spec.duration ?? Math.max(...spec.scenes.map(s => s.end));
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, '<span class="hl">$1</span>');

// Scene markup. Each scene is absolutely positioned inside .safe and toggled by seek(t).
const sceneHtml = (s, i) => {
  const v = s.visual || { type: "text" };
  let vis = "";
  if (v.type === "counter") vis = `<div class="v-counter"><div class="num" data-from="${v.from ?? 0}" data-to="${v.to}" data-decimals="${v.decimals ?? 0}" data-suffix="${esc(v.suffix ?? "")}" data-prefix="${esc(v.prefix ?? "")}"></div>${v.label ? `<div class="v-label">${rich(v.label)}</div>` : ""}</div>`;
  if (v.type === "bars") vis = `<div class="v-bars">${v.items.map(b => `<div class="v-bar"><div class="v-bar-h"><span>${rich(b.label)}</span><span>${rich(b.value)}</span></div><div class="bar"><i data-pct="${b.pct}"></i></div></div>`).join("")}</div>`;
  if (v.type === "dots") vis = `<div class="v-dots" data-n="${v.n ?? 100}" data-lit="${v.lit ?? 1}" data-cols="${v.cols ?? 10}"></div>${v.label ? `<div class="v-label">${rich(v.label)}</div>` : ""}`;
  if (v.type === "scale") vis = `<div class="v-scale"><div class="v-circle a" data-r="${v.a.r}"><span>${rich(v.a.label)}</span></div><div class="v-circle b" data-r="${v.b.r}"><span>${rich(v.b.label)}</span></div></div>`;
  if (v.type === "list") vis = `<div class="v-list">${v.items.map((t, k) => `<div class="v-item" data-k="${k}"><div class="n">${k + 1}</div><div class="t">${rich(t)}</div></div>`).join("")}</div>`;
  return `<section class="scene" data-i="${i}" data-start="${s.start}" data-end="${s.end}" data-layout="${s.layout || (vis ? "split" : "center")}">
    ${s.kicker ? `<div class="kicker">${rich(s.kicker)}</div>` : ""}
    <div class="caption">${rich(s.caption)}</div>
    ${vis}
  </section>`;
};

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${pathToFileURL(resolve(here, "../brand.css")).href}">
<style>
  body { width:1080px; height:1920px; overflow:hidden; }
  .scene { position:absolute; inset:0; display:none; flex-direction:column; justify-content:center; gap:44px; opacity:0; }
  .scene.on { display:flex; }
  .scene .kicker { text-align:center; }
  .v-counter { text-align:center; }
  .v-counter .num { font-size:250px; }
  .v-label { font: 500 40px/1.3 var(--font-body); color: var(--ink-2); text-align:center; margin-top:10px; }
  .v-bars { display:flex; flex-direction:column; gap:34px; }
  .v-bar-h { display:flex; justify-content:space-between; font: 500 36px/1 var(--font-body); color: var(--ink-2); margin-bottom:14px; }
  .bar { height:22px; border-radius:11px; }
  .v-dots { display:grid; gap:14px; justify-content:center; }
  .v-dots i { display:block; width:64px; height:64px; border-radius:50%; background: var(--line); }
  .v-dots i.lit { background: var(--accent-2); box-shadow: 0 0 30px rgba(255,176,32,0.6); }
  .v-scale { position:relative; height:620px; display:flex; align-items:flex-end; justify-content:center; gap:60px; }
  .v-circle { border-radius:50%; background: rgba(79,227,240,0.15); border: 4px solid var(--accent); display:flex; align-items:center; justify-content:center; font: 600 32px/1.2 var(--font-body); text-align:center; color: var(--ink); }
  .v-circle.b { border-color: var(--accent-2); background: rgba(255,176,32,0.12); }
  .v-list { display:flex; flex-direction:column; gap:28px; }
  .v-item { display:flex; gap:26px; align-items:flex-start; opacity:0; transform: translateY(24px); }
  .v-item .n { flex:0 0 68px; height:68px; border-radius:16px; background: var(--surface); border:2px solid var(--line); display:flex; align-items:center; justify-content:center; font:700 34px var(--font-display); color: var(--accent); }
  .v-item .t { font: 500 42px/1.3 var(--font-body); color: var(--ink-2); padding-top:8px; }
  .v-item .t b { color: var(--ink); }
  .orbit { position:absolute; inset:0; pointer-events:none; }
  .orbit i { position:absolute; width:6px; height:6px; border-radius:50%; background: var(--accent); opacity:0.35; }
  .brand { position:absolute; left:72px; bottom:470px; font:600 32px/1 var(--font-body); color: var(--ink-2); }
  .brand::before { content:""; display:inline-block; width:14px; height:14px; border-radius:50%; background: var(--accent); margin-right:14px; vertical-align:middle; }
  .endcard { position:absolute; inset:0; display:none; flex-direction:column; align-items:center; justify-content:center; gap:30px; padding: 0 90px; background: var(--bg); opacity:0; }
  .endcard.on { display:flex; }
</style></head><body>
<div class="frame">
  <div class="orbit">${Array.from({ length: 60 }, (_, k) => `<i data-k="${k}"></i>`).join("")}</div>
  <div class="progress"><i id="prog"></i></div>
  <div class="safe">${spec.scenes.map(sceneHtml).join("")}</div>
  <div class="brand">${esc(spec.handle || "@hqrs_1")}</div>
  <div class="endcard"><div class="kicker">${esc(spec.end?.kicker || "Follow for more")}</div><div class="h1" style="text-align:center">${rich(spec.end?.title || "One verified science story a day")}</div><div class="body" style="text-align:center">${rich(spec.end?.body || "Source in the caption.")}</div><div class="pill" style="margin-top:20px">${esc(spec.handle || "@hqrs_1")}</div></div>
</div>
<script>
  const DUR = ${duration};
  const ENDCARD = ${spec.end ? (spec.end.seconds ?? 2.5) : 0};
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const scenes = [...document.querySelectorAll(".scene")];
  const dots = document.querySelectorAll(".v-dots");
  dots.forEach(d => { const n = +d.dataset.n; d.style.gridTemplateColumns = "repeat(" + d.dataset.cols + ", 64px)"; for (let k = 0; k < n; k++) d.appendChild(document.createElement("i")); });
  const orbitDots = [...document.querySelectorAll(".orbit i")];
  const rnd = (k) => { const x = Math.sin(k * 9301 + 49297) * 233280; return x - Math.floor(x); };
  window.seek = (t) => {
    document.getElementById("prog").style.width = (100 * clamp(t / DUR, 0, 1)) + "%";
    orbitDots.forEach((el, k) => {
      const speed = 8 + rnd(k) * 20, y = ((rnd(k + 1) * 1920) + t * speed) % 2000 - 40;
      el.style.transform = "translate(" + (rnd(k + 2) * 1080) + "px," + (1920 - y) + "px) scale(" + (0.6 + rnd(k + 3) * 1.4) + ")";
    });
    const ecOn = ENDCARD > 0 && t >= DUR - ENDCARD;
    scenes.forEach(sc => {
      const s = +sc.dataset.start, e = +sc.dataset.end, on = !ecOn && t >= s && t < e;
      sc.classList.toggle("on", on);
      if (!on) return;
      const local = t - s, len = e - s;
      const fadeIn = clamp(local / 0.35, 0, 1), fadeOut = clamp((e - t) / 0.25, 0, 1);
      sc.style.opacity = Math.min(fadeIn, fadeOut);
      sc.style.transform = "translateY(" + (24 * (1 - easeOut(fadeIn))) + "px)";
      const p = easeOut(clamp(local / Math.min(1.6, len * 0.7), 0, 1));
      sc.querySelectorAll(".v-counter .num").forEach(n => {
        const from = +n.dataset.from, to = +n.dataset.to, d = +n.dataset.decimals;
        n.textContent = n.dataset.prefix + (from + (to - from) * p).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) + n.dataset.suffix;
        const finalLen = (n.dataset.prefix + to.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) + n.dataset.suffix).length;
        n.style.fontSize = Math.min(250, Math.floor(1500 / Math.max(finalLen, 1))) + "px";
      });
      sc.querySelectorAll(".bar i").forEach(b => b.style.width = (+b.dataset.pct * p) + "%");
      sc.querySelectorAll(".v-dots").forEach(d => { const lit = Math.round(+d.dataset.lit * p); [...d.children].forEach((c, k) => c.classList.toggle("lit", k < lit)); });
      sc.querySelectorAll(".v-circle").forEach(c => { const r = +c.dataset.r * (0.2 + 0.8 * p); c.style.width = c.style.height = r + "px"; });
      sc.querySelectorAll(".v-item").forEach(it => { const q = easeOut(clamp((local - 0.3 - +it.dataset.k * 0.45) / 0.4, 0, 1)); it.style.opacity = q; it.style.transform = "translateY(" + (24 * (1 - q)) + "px)"; });
    });
    const ec = document.querySelector(".endcard");
    ec.classList.toggle("on", ecOn);
    if (ecOn) ec.style.opacity = clamp((t - (DUR - ENDCARD)) / 0.4, 0, 1);
  };
</script></body></html>`;

const htmlFile = resolve(outdir, `${name}.html`);
writeFileSync(htmlFile, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(htmlFile).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const nFrames = Math.ceil(duration * fps);
const ext = useJpeg ? "jpeg" : "png";
const t0 = Date.now();
for (let f = 0; f < nFrames; f++) {
  await page.evaluate((t) => window.seek(t), f / fps);
  await page.screenshot({ path: resolve(framesDir, `f${String(f).padStart(5, "0")}.${ext}`), type: ext, ...(useJpeg ? { quality: 92 } : {}) });
  if (f % 60 === 0) process.stdout.write(`frame ${f}/${nFrames}\r`);
}
await browser.close();
console.log(`\ncaptured ${nFrames} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

// Captions as SRT for accessibility and for pasting into Instagram's caption editor.
const srtTime = (t) => { const ms = Math.round(t * 1000); const h = Math.floor(ms / 3.6e6), m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1000) % 60, x = ms % 1000; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(x).padStart(3, "0")}`; };
writeFileSync(resolve(outdir, `${name}.srt`), spec.scenes.map((s, i) => `${i + 1}\n${srtTime(s.start)} --> ${srtTime(s.end)}\n${s.caption.replace(/\*/g, "")}\n`).join("\n"));
if (spec.voiceover_script) writeFileSync(resolve(outdir, `${name}-voiceover.txt`), spec.voiceover_script.trim() + "\n");
if (spec.caption) writeFileSync(resolve(outdir, "caption.txt"), spec.caption.trim() + "\n");

const ff = [ "-y", "-framerate", String(fps), "-i", resolve(framesDir, `f%05d.${ext}`) ];
if (spec.audio) ff.push("-i", resolve(dirname(specPath), spec.audio), "-shortest");
ff.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-crf", "18", "-r", String(fps), "-movflags", "+faststart");
if (spec.audio) ff.push("-c:a", "aac", "-b:a", "192k");
ff.push(outMp4);
const r = spawnSync(ffmpeg, ff, { stdio: ["ignore", "ignore", "pipe"] });
if (r.status !== 0) { console.error(r.stderr.toString().split("\n").slice(-15).join("\n")); process.exit(1); }
rmSync(framesDir, { recursive: true });
console.log("wrote", outMp4);
