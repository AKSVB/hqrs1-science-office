#!/usr/bin/env node
// Carousel renderer: JSON spec -> one 1080x1350 PNG per slide.
// Usage: node render.mjs <spec.json> [outdir]   (needs playwright installed locally or globally)
// Slide types: cover | statement | number | list | compare | source | cta | plate-diagram
// Any slide may carry bg: { image, focus:[x,y], scrim:0-1 }: a photo plate (cover-fit, focus point as object-position)
//   under the style-bible .plate-scrim. Paths resolve relative to the spec, then to the repository root.
// plate-diagram: { kicker, title, visual, at, len } draws one mechanism plate from production/reel/visuals.mjs as a static
//   frame at local time `at` (default: its final state) over the dark field, one .h2 line above it.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require("playwright"); } catch { return require("/opt/node22/lib/node_modules/playwright"); } })();
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildVisual, visualCss, visualRuntime } from "../reel/visuals.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const specPath = process.argv[2];
if (!specPath) { console.error("usage: render.mjs <spec.json> [outdir]"); process.exit(1); }
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const specDir = dirname(resolve(specPath));
const outdir = resolve(process.argv[3] || resolve(here, "../out", basename(specPath, ".json")));
mkdirSync(outdir, { recursive: true });
const asset = (p) => { const a = resolve(specDir, p); if (existsSync(a)) return a; const b = resolve(root, p); return existsSync(b) ? b : a; };

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Inline markup: **bold**, *accent*, _amber_, [[fact]] and {{myth}}
const rich = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/\*(.+?)\*/g, '<span class="hl">$1</span>')
  .replace(/_(.+?)_/g, '<span class="hl-2">$1</span>')
  .replace(/\[\[(.+?)\]\]/g, '<span class="fact">$1</span>')
  .replace(/\{\{(.+?)\}\}/g, '<span class="myth">$1</span>');

const handle = spec.handle || "@hqrs_1";
const total = spec.slides.length;
const foot = (i) => `<div class="foot"><span class="handle">${esc(handle)}</span><span>${i + 1} / ${total}</span></div>`;
const swipe = (i) => (i === 0 ? `<div class="swipe">SWIPE &rarr;</div>` : "");
const plate = (s) => {
  if (!s.bg) return "";
  const bg = typeof s.bg === "string" ? { image: s.bg } : s.bg;
  const p = asset(bg.image);
  if (!existsSync(p)) { console.warn(`warning: plate image not found, using the dark field: ${p}`); return ""; }
  const f = Array.isArray(bg.focus) ? bg.focus : [0.5, 0.5];
  return `<div class="plate"><img src="${pathToFileURL(p).href}" style="object-position:${f[0] * 100}% ${f[1] * 100}%"></div><div class="plate-scrim" style="opacity:${bg.scrim ?? 1}"></div>`;
};

const popoutHtml = (s, cover) => {
  const sub = s.subject || {};
  const p = sub.image ? asset(sub.image) : null;
  if (p && !existsSync(p)) console.warn(`warning: subject image not found: ${p}`);
  const x = sub.x ?? 140, y = sub.y ?? 120, w = sub.w ?? 800, rot = sub.rot ?? 0;
  const shadow = sub.shadow ?? 1;
  const subj = p && existsSync(p) ? `<div class="po-subject" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg);filter:drop-shadow(0 ${44 * shadow}px ${70 * shadow}px rgba(0,0,0,${0.75 * shadow})) drop-shadow(0 ${8 * shadow}px ${14 * shadow}px rgba(0,0,0,0.5))"><img src="${pathToFileURL(p).href}"></div>` : "";
  const pos = (s.text && s.text.top != null) ? `top:${s.text.top}px` : `bottom:${(s.text && s.text.bottom) ?? 170}px`;
  const align = (s.text && s.text.align) || "left";
  return `
    <div class="po-panel${cover ? " cover" : ""}"></div>
    ${subj}
    <div class="po-text" style="${pos};text-align:${align}">
      ${s.kicker ? `<div class="kicker">${rich(s.kicker)}</div>` : ""}
      ${s.big ? `<div class="po-big" style="font-size:${String(s.big).replace(/[*_]/g, "").length > 9 ? 150 : String(s.big).replace(/[*_]/g, "").length > 6 ? 180 : 210}px">${rich(s.big)}</div>` : ""}
      ${s.claim ? `<div class="po-claim${cover ? " xl" : ""}">${rich(s.claim)}</div>` : ""}
      ${s.body ? `<div class="po-body">${rich(s.body)}</div>` : ""}
      ${s.source ? `<div class="po-source">${rich(s.source)}</div>` : ""}
    </div>`;
};

const builders = {
  cover: (s) => `
    <div class="stack grow center">
      ${s.kicker ? `<div class="kicker">${rich(s.kicker)}</div>` : ""}
      <div class="h1 xl">${rich(s.title)}</div>
      ${s.sub ? `<div class="body">${rich(s.sub)}</div>` : ""}
    </div>`,
  statement: (s) => `
    <div class="stack grow center">
      ${s.kicker ? `<div class="kicker">${rich(s.kicker)}</div>` : ""}
      <div class="h2">${rich(s.title)}</div>
      ${s.body ? `<div class="body">${rich(s.body)}</div>` : ""}
    </div>`,
  number: (s) => `
    <div class="stack grow center">
      ${s.kicker ? `<div class="kicker">${rich(s.kicker)}</div>` : ""}
      <div class="num">${rich(s.number)}</div>
      <div class="h2">${rich(s.title)}</div>
      ${s.body ? `<div class="body">${rich(s.body)}</div>` : ""}
      ${s.bars ? `<div class="stack" style="gap:22px;margin-top:20px">${s.bars.map(b => `
        <div><div class="small" style="display:flex;justify-content:space-between;margin-bottom:10px"><span>${rich(b.label)}</span><span>${rich(b.value)}</span></div>
        <div class="bar"><i style="width:${Number(b.pct)}%"></i></div></div>`).join("")}</div>` : ""}
    </div>`,
  list: (s) => `
    <div class="stack grow" style="justify-content:flex-start;padding-top:20px">
      ${s.kicker ? `<div class="kicker">${rich(s.kicker)}</div>` : ""}
      <div class="h2">${rich(s.title)}</div>
      <div class="list" style="margin-top:20px">${(s.items || []).map((t, i) => `
        <div class="item"><div class="n">${i + 1}</div><div class="t">${rich(t)}</div></div>`).join("")}</div>
    </div>`,
  compare: (s) => `
    <div class="stack grow center" style="gap:40px">
      ${s.kicker ? `<div class="kicker">${rich(s.kicker)}</div>` : ""}
      <div class="card"><span class="pill myth">MYTH</span><div class="h2" style="margin-top:26px">${rich(s.myth)}</div></div>
      <div class="card" style="border-color:var(--fact)"><span class="pill fact">WHAT THE DATA SAYS</span><div class="h2" style="margin-top:26px">${rich(s.fact)}</div>
        ${s.body ? `<div class="body" style="margin-top:22px">${rich(s.body)}</div>` : ""}</div>
    </div>`,
  source: (s) => `
    <div class="stack grow center">
      <div class="kicker">Sources</div>
      <div class="h2">${rich(s.title || "Where this comes from")}</div>
      <div class="list" style="margin-top:10px">${(s.items || []).map((t, i) => `
        <div class="item"><div class="n">${i + 1}</div><div class="t" style="font-size:32px">${rich(t)}</div></div>`).join("")}</div>
      ${s.note ? `<div class="small">${rich(s.note)}</div>` : ""}
    </div>`,
  cta: (s) => `
    <div class="stack grow center">
      <div class="kicker">${rich(s.kicker || "One more thing")}</div>
      <div class="h1">${rich(s.title)}</div>
      ${s.body ? `<div class="body">${rich(s.body)}</div>` : ""}
      <div class="card" style="margin-top:30px"><div class="body strong">${rich(s.ask || "Save this. Send it to the friend who needs it.")}</div>
        <div class="small" style="margin-top:14px">Follow ${esc(handle)} for one verified science story a day.</div></div>
    </div>`,
  // popout: a full-bleed plate, an inset window panel, and a subject layer (transparent PNG) composited above the
  // panel edge so it breaks the frame; text in the panel's lower area, never under the subject.
  // { bg, subject: { image, x, y, w, rot, shadow }, kicker, claim, big, body, source, text: { top | bottom } }
  popout: (s) => popoutHtml(s, false),
  "popout-cover": (s) => popoutHtml(s, true),
  "plate-diagram": (s) => `
    <div class="stack grow center" style="gap:30px">
      ${s.kicker ? `<div class="kicker">${rich(s.kicker)}</div>` : ""}
      ${s.title ? `<div class="h2">${rich(s.title)}</div>` : ""}
      <div class="plate-vis" data-at="${s.at ?? 999}" data-len="${s.len ?? 6}">${buildVisual(s.visual || {})}</div>
      ${s.body ? `<div class="body">${rich(s.body)}</div>` : ""}
    </div>`,
};

const page = (inner, i, s) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${pathToFileURL(resolve(here, "../brand.css")).href}">
<style>
  .slide > .stack { position: relative; z-index: 2; }
  .slide > .foot, .slide > .swipe { z-index: 5; }
  .slide .plate, .slide .plate-scrim { z-index: 1; }
  .plate-vis { width: 912px; }
  /* pop-out system */
  .po-panel { position:absolute; left:84px; right:84px; top:84px; bottom:84px; border-radius:38px; border:2px solid rgba(79,227,240,0.75);
    background: linear-gradient(180deg, rgba(6,9,19,0.10) 0%, rgba(6,9,19,0.55) 55%, rgba(6,9,19,0.86) 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.55); z-index:2; }
  .po-panel.cover { border-color: rgba(255,255,255,0.55); }
  .po-subject { position:absolute; z-index:3; pointer-events:none; }
  .po-subject img { width:100%; height:auto; display:block; }
  .po-text { position:absolute; left:150px; right:150px; z-index:4; display:flex; flex-direction:column; gap:22px; }
  .po-claim { font: 700 92px/1.02 var(--font-display); letter-spacing:-0.02em; color:var(--ink); text-shadow: 0 4px 30px rgba(0,0,0,0.7); text-wrap: balance; }
  .po-claim.xl { font-size: 108px; }
  .po-big { font: 700 210px/0.95 var(--font-display); letter-spacing:-0.04em; color:var(--accent-2); text-shadow: 0 6px 40px rgba(0,0,0,0.7); }
  .po-body { font: 500 38px/1.3 var(--font-body); color:var(--ink-2); text-shadow: 0 2px 16px rgba(0,0,0,0.7); max-width: 780px; }
  .po-source { font: 500 28px/1.35 var(--font-body); color:var(--muted); }
  .slide > .po-panel, .slide > .po-subject, .slide > .po-text { }
  ${visualCss}
  .vis { max-height: 720px; }
</style></head>
<body><div class="slide">${plate(s)}${swipe(i)}${inner}${foot(i)}</div>
<script>(${visualRuntime.toString()})();</script></body></html>`;

const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
pg.on("pageerror", (e) => console.error("page error:", e.message));
const manifest = [];
for (let i = 0; i < total; i++) {
  const s = spec.slides[i];
  const build = builders[s.type];
  if (!build) throw new Error(`unknown slide type: ${s.type}`);
  const html = page(build(s), i, s);
  const htmlFile = resolve(outdir, `slide-${String(i + 1).padStart(2, "0")}.html`);
  writeFileSync(htmlFile, html);
  await pg.goto(pathToFileURL(htmlFile).href, { waitUntil: "networkidle" });
  await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => null))));
  // A mechanism plate is one static frame of the Reel animation at local time `at`.
  await pg.evaluate(() => document.querySelectorAll(".plate-vis").forEach(w => w.querySelectorAll(".vis").forEach(v => window.updateVisual(v, +w.dataset.at, +w.dataset.len))));
  const file = resolve(outdir, `slide-${String(i + 1).padStart(2, "0")}.png`);
  await pg.screenshot({ path: file, type: "png" });
  manifest.push(file);
  console.log("wrote", file);
}
await browser.close();
if (spec.caption) writeFileSync(resolve(outdir, "caption.txt"), spec.caption.trim() + "\n");
writeFileSync(resolve(outdir, "manifest.json"), JSON.stringify({ spec: specPath, slides: manifest }, null, 2));
