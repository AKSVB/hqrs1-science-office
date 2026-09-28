#!/usr/bin/env node
// Crop transparent PNGs to their alpha bounding box (plus a margin) so subject layers can be placed by their real size.
// Usage: node crop-alpha.mjs <in.png> [<in2.png> ...] [--margin 24] [--suffix -crop]
// Writes <name><suffix>.png next to each input and prints the crop box and final size.
import { createRequire } from "node:module";
import { resolve, dirname, basename, extname } from "node:path";
import { pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require("playwright"); } catch { return require("/opt/node22/lib/node_modules/playwright"); } })();
const args = process.argv.slice(2);
const opt = (f, d) => { const i = args.indexOf(f); return i > -1 ? args[i + 1] : d; };
const margin = +opt("--margin", 24), suffix = opt("--suffix", "-crop");
const files = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
const page = await browser.newPage();
await page.setContent("<html><body style='margin:0;background:transparent'></body></html>");
for (const f of files) {
  const { readFileSync } = await import("node:fs");
  const src = "data:image/png;base64," + readFileSync(resolve(f)).toString("base64"); // data URL: file:// images cannot be decoded from a blank page
  const r = await page.evaluate(async ({ src, margin }) => {
    const im = new Image(); im.src = src; await im.decode();
    const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
    const g = c.getContext("2d"); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    if (x1 < 0) return null;
    x0 = Math.max(0, x0 - margin); y0 = Math.max(0, y0 - margin); x1 = Math.min(c.width - 1, x1 + margin); y1 = Math.min(c.height - 1, y1 + margin);
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const o = document.createElement("canvas"); o.width = w; o.height = h; o.getContext("2d").drawImage(c, x0, y0, w, h, 0, 0, w, h);
    return { x0, y0, w, h, data: o.toDataURL("image/png") };
  }, { src, margin });
  if (!r) { console.log(`${f}: fully transparent, skipped`); continue; }
  const out = resolve(dirname(f), basename(f, extname(f)) + suffix + ".png");
  const { writeFileSync } = await import("node:fs");
  writeFileSync(out, Buffer.from(r.data.split(",")[1], "base64"));
  console.log(`${basename(f)} -> ${basename(out)}  box x${r.x0} y${r.y0} ${r.w}x${r.h}`);
}
await browser.close();
