#!/usr/bin/env node
// Carousel renderer: JSON spec -> one 1080x1350 PNG per slide.
// Usage: node render.mjs <spec.json> [outdir]   (needs playwright installed locally or globally)
// Slide types: cover | statement | number | list | compare | source | cta
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require("playwright"); } catch { return require("/opt/node22/lib/node_modules/playwright"); } })();
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const specPath = process.argv[2];
if (!specPath) { console.error("usage: render.mjs <spec.json> [outdir]"); process.exit(1); }
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const outdir = resolve(process.argv[3] || resolve(here, "../out", basename(specPath, ".json")));
mkdirSync(outdir, { recursive: true });

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
};

const page = (inner, i) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${pathToFileURL(resolve(here, "../brand.css")).href}"></head>
<body><div class="slide">${swipe(i)}${inner}${foot(i)}</div></body></html>`;

const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
const manifest = [];
for (let i = 0; i < total; i++) {
  const s = spec.slides[i];
  const build = builders[s.type];
  if (!build) throw new Error(`unknown slide type: ${s.type}`);
  const html = page(build(s), i);
  const htmlFile = resolve(outdir, `slide-${String(i + 1).padStart(2, "0")}.html`);
  writeFileSync(htmlFile, html);
  await pg.goto(pathToFileURL(htmlFile).href, { waitUntil: "networkidle" });
  await pg.evaluate(() => document.fonts.ready);
  const file = resolve(outdir, `slide-${String(i + 1).padStart(2, "0")}.png`);
  await pg.screenshot({ path: file, type: "png" });
  manifest.push(file);
  console.log("wrote", file);
}
await browser.close();
if (spec.caption) writeFileSync(resolve(outdir, "caption.txt"), spec.caption.trim() + "\n");
writeFileSync(resolve(outdir, "manifest.json"), JSON.stringify({ spec: specPath, slides: manifest }, null, 2));
