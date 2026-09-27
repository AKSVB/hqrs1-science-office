#!/usr/bin/env node
// Reel renderer v2: JSON timeline -> 1080x1920 H.264 MP4 (+ SRT captions, words JSON; contact sheet via render-preview.mjs).
// Every frame is a pure function of t through window.seek(t), so output is reproducible.
//
// Usage: node render-reel.mjs <spec.json> [out.mp4] [--fps 30] [--jpeg]
//          [--audio voice.mp3] [--fit-audio]            voice track; scenes are stretched to the voice length (+0.6 s), end card keeps its length
//          [--music bed.mp3] [--sfx hit.mp3@1.2,whoosh.mp3@8]  music at -18 dB with a 1.5 s fade-out, SFX at -8 dB placed with adelay
//          [--auto-words]                                 word-by-word captions spread over the voice from spec.voiceover_script
//          [--words words.json]                           explicit [{word,start,end}] (else spec.words, else <spec>.words.json)
//
// Scene fields: start, end, kicker, caption, visual, layout, plus v2:
//   bg: { image, move: push-in|push-out|pan-left|pan-right|tilt-up|drift, from, to, focus:[x,y], scrim:0-1 }
//   transition: cut (default) | fade | wipe-up      big: { text, at }     (kinetic number: slam-in + 4 px shake)
// Visual types: text | counter | bars | dots | grid | scale | list | staircase | lineage | orbit | thermometer | flash | timeline | compare
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
if (!specPath || specPath.startsWith("--")) { console.error("usage: render-reel.mjs <spec.json> [out.mp4] [--fps 30] [--jpeg] [--audio voice.mp3] [--music bed.mp3] [--sfx file@sec,...] [--auto-words] [--words words.json]"); process.exit(1); }
const opt = (flag) => { const i = args.indexOf(flag); return i > -1 ? args[i + 1] : null; };
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const specDir = dirname(resolve(specPath));
const fps = opt("--fps") ? Number(opt("--fps")) : 30;
const useJpeg = args.includes("--jpeg");
const audioIdx = args.indexOf("--audio");
const fitAudio = args.includes("--fit-audio") || audioIdx > -1;
const musicPath = opt("--music") ? resolve(opt("--music")) : (spec.music ? resolve(specDir, spec.music) : null);
const sfxArg = opt("--sfx");
const autoWords = args.includes("--auto-words");
const wordsArg = opt("--words");
const name = basename(specPath, ".json");
const outMp4 = resolve(args[1] && !args[1].startsWith("--") ? args[1] : resolve(here, "../out", name, `${name}.mp4`));
const outdir = dirname(outMp4);
const framesDir = resolve(outdir, "frames");
mkdirSync(outdir, { recursive: true });
if (existsSync(framesDir)) rmSync(framesDir, { recursive: true });
mkdirSync(framesDir);
const warn = (m) => console.warn("warning: " + m);

// Needs a full ffmpeg (libx264 + aac). Playwright's bundled ffmpeg is too stripped down.
// Resolution order: $FFMPEG, imageio-ffmpeg's static binary (pip install imageio-ffmpeg), ffmpeg on PATH, the known static path.
const imageioFfmpeg = (() => { const r = spawnSync("python3", ["-c", "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())"]); return r.status === 0 ? r.stdout.toString().trim() : null; })();
const ffmpegCandidates = [process.env.FFMPEG, imageioFfmpeg, "ffmpeg", "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2"].filter(Boolean);
const ffmpeg = ffmpegCandidates.find(c => { const r = spawnSync(c, ["-hide_banner", "-encoders"]); return r.status === 0 && r.stdout.toString().includes("libx264"); });
if (!ffmpeg) throw new Error("ffmpeg with libx264 not found. Run: pip install imageio-ffmpeg");
const mediaDuration = (p) => {
  const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]);
  let d = probe.status === 0 ? parseFloat(probe.stdout.toString()) : NaN;
  if (!Number.isFinite(d)) { const r = spawnSync(ffmpeg, ["-hide_banner", "-i", p]); const m = r.stderr.toString().match(/Duration: (\d+):(\d+):(\d+\.\d+)/); if (m) d = (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]); }
  if (!Number.isFinite(d)) throw new Error("could not read media duration: " + p);
  return d;
};

// Audio: from --audio <file> or spec.audio (relative to the spec). With --fit-audio (implied by --audio)
// every scene is stretched or squeezed so the scenes end when the voice ends, plus a short tail; the end card keeps its length.
const audioPath = audioIdx > -1 ? resolve(args[audioIdx + 1]) : (spec.audio ? resolve(specDir, spec.audio) : null);
let duration = spec.duration ?? Math.max(...spec.scenes.map(s => s.end));
const endSeconds = spec.end ? (spec.end.seconds ?? 2.5) : 0;
const audioDur = audioPath ? mediaDuration(audioPath) : NaN;
if (fitAudio && audioPath) {
  const scenesEnd = Math.max(...spec.scenes.map(s => s.end));
  const factor = (audioDur + 0.6) / scenesEnd;
  for (const sc of spec.scenes) {
    sc.start = +(sc.start * factor).toFixed(3); sc.end = +(sc.end * factor).toFixed(3);
    // Local-time cues (big.at, flash.at, staircase jumps) are authored against the unscaled scene; scale them too.
    if (sc.big && Number.isFinite(sc.big.at)) sc.big.at = +(sc.big.at * factor).toFixed(3);
    if (sc.visual?.type === "flash" && Number.isFinite(sc.visual.at)) sc.visual.at = +(sc.visual.at * factor).toFixed(3);
    if (sc.visual?.type === "staircase" && Array.isArray(sc.visual.jumps)) for (const j of sc.visual.jumps) j.t = +(j.t * factor).toFixed(3);
  }
  duration = +(scenesEnd * factor + endSeconds).toFixed(3);
  console.log(`fit to audio: ${audioDur.toFixed(2)} s voice, scenes scaled x${factor.toFixed(3)}, total ${duration} s`);
}
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, '<span class="hl">$1</span>');
const attr = (o) => esc(JSON.stringify(o)).replace(/"/g, "&quot;");

// Word-by-word captions. Priority: --words file, spec.words, <spec>.words.json sidecar, --auto-words from the voiceover script.
// Auto mode spreads words over the voice track weighted by letter count, with short pauses at punctuation.
const autoWordTimes = (text, total) => {
  const toks = text.trim().split(/\s+/).filter(Boolean);
  const lead = 0.25, tail = 0.35, span = Math.max(1, total - lead - tail);
  const wts = toks.map(w => { const letters = w.replace(/[^\p{L}\p{N}]/gu, "").length || 1; const pause = /[.!?]$/.test(w) ? 5 : /[,;:]$/.test(w) ? 2.2 : 0; return { letters: letters + 1.2, pause }; });
  const sum = wts.reduce((a, b) => a + b.letters + b.pause, 0);
  let cur = lead; const out = [];
  toks.forEach((w, i) => { const d = span * wts[i].letters / sum, p = span * wts[i].pause / sum; out.push({ word: w, start: +cur.toFixed(3), end: +(cur + d).toFixed(3) }); cur += d + p; });
  return out;
};
let words = null;
const sidecar = resolve(specDir, `${name}.words.json`);
if (wordsArg) words = JSON.parse(readFileSync(resolve(wordsArg), "utf8"));
else if (Array.isArray(spec.words) && spec.words.length) words = spec.words;
else if (existsSync(sidecar)) words = JSON.parse(readFileSync(sidecar, "utf8"));
else if (autoWords) {
  if (!spec.voiceover_script) warn("--auto-words needs spec.voiceover_script; skipping word captions");
  else if (!Number.isFinite(audioDur)) warn("--auto-words needs --audio (or spec.audio) to know the voice length; skipping word captions");
  else words = autoWordTimes(spec.voiceover_script, audioDur);
}
if (words) words = words.filter(w => w && typeof w.word === "string" && Number.isFinite(+w.start) && Number.isFinite(+w.end)).map(w => ({ word: w.word, start: +w.start, end: +w.end }));
if (words && !words.length) words = null;
// Group into caption lines of 3-5 words, breaking early at punctuation.
const chunkWords = (ws) => {
  const chunks = []; let cur = [];
  for (const w of ws) { cur.push(w); if (cur.length >= 4 || (cur.length >= 3 && /[.!?;:]$/.test(w.word))) { chunks.push(cur); cur = []; } }
  if (cur.length) { if (cur.length === 1 && chunks.length && chunks[chunks.length - 1].length < 5) chunks[chunks.length - 1].push(cur[0]); else chunks.push(cur); }
  return chunks;
};
const chunks = words ? chunkWords(words) : [];
const karaoke = chunks.length > 0;

// Backgrounds: resolve image paths relative to the spec; a missing file falls back to the brand gradient with a warning.
for (const sc of spec.scenes) {
  if (!sc.bg) continue;
  if (typeof sc.bg === "string") sc.bg = { image: sc.bg };
  if (sc.bg.image) {
    const p = resolve(specDir, sc.bg.image);
    if (existsSync(p)) sc.bg.src = pathToFileURL(p).href;
    else { warn(`background image not found, using gradient: ${p}`); sc.bg.src = null; }
  }
}

// Deterministic PRNG for build-time geometry (lineage trees).
const rnd = (k) => { const x = Math.sin(k * 9301 + 49297) * 233280; return x - Math.floor(x); };
const VW = 936; // safe-area width
const svgOpen = (type, h, data) => `<svg class="vis vis-${type}" viewBox="0 0 ${VW} ${h}" data-h="${h}" data-p="${attr(data)}" xmlns="http://www.w3.org/2000/svg">`;

const buildLineage = (v) => {
  const H = 560, depth = Math.min(7, Math.max(3, v.depth ?? 5));
  const sides = [{ x: 234, min: 30, max: 440, col: v.colours?.[0] || "var(--accent)" }, { x: 702, min: 496, max: 906, col: v.colours?.[1] || "var(--accent-2)" }];
  const segs = [];
  sides.forEach((side, si) => {
    let seed = si * 1000 + 7;
    const branch = (x, y, ang, len, d, order) => {
      if (d >= depth) return;
      let nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len;
      nx = Math.min(side.max, Math.max(side.min, nx)); ny = Math.max(24, ny);
      segs.push({ s: si, x1: x, y1: y, x2: nx, y2: ny, birth: (order + rnd(seed++) * 0.6) / depth, w: Math.max(3, 14 - d * 2.2) });
      const spread = 0.42 + rnd(seed++) * 0.3;
      branch(nx, ny, ang - spread * (0.7 + rnd(seed++) * 0.6), len * 0.72, d + 1, order + 1);
      branch(nx, ny, ang + spread * (0.7 + rnd(seed++) * 0.6), len * 0.72, d + 1, order + 1);
    };
    branch(side.x, H - 70, -Math.PI / 2, 150, 0, 0);
  });
  const labels = v.labels || ["A", "B"];
  return `${svgOpen("lineage", H, {})}
    ${segs.map(g => `<line class="seg" data-x1="${g.x1.toFixed(1)}" data-y1="${g.y1.toFixed(1)}" data-x2="${g.x2.toFixed(1)}" data-y2="${g.y2.toFixed(1)}" data-b="${g.birth.toFixed(3)}" x1="${g.x1.toFixed(1)}" y1="${g.y1.toFixed(1)}" x2="${g.x1.toFixed(1)}" y2="${g.y1.toFixed(1)}" stroke="${sides[g.s].col}" stroke-width="${g.w}" stroke-linecap="round"/>`).join("")}
    <line x1="468" y1="20" x2="468" y2="${H - 60}" stroke="rgba(255,255,255,0.12)" stroke-width="2" stroke-dasharray="8 12"/>
    <text class="lab" x="234" y="${H - 14}" fill="${sides[0].col}" style="fill:${sides[0].col}">${esc(labels[0])}</text>
    <text class="lab" x="702" y="${H - 14}" style="fill:${sides[1].col}">${esc(labels[1])}</text>
  </svg>`;
};

const buildStaircase = (v) => {
  const H = 560, n = Math.min(8, Math.max(2, v.levels ?? 4));
  const labels = v.labels || Array.from({ length: n }, (_, k) => `E${k}`);
  const ys = Array.from({ length: n }, (_, k) => H - 80 - k * ((H - 160) / (n - 1)));
  const start = v.jumps?.[0]?.from ?? v.start ?? 0;
  return `${svgOpen("staircase", H, { n, ys, start, jumps: v.jumps || [] })}
    <defs><radialGradient id="ballg"><stop offset="0" stop-color="#fff"/><stop offset="0.35" stop-color="#ffb020"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/></radialGradient></defs>
    ${ys.map((y, k) => `<g class="lvl" data-k="${k}"><line x1="170" x2="786" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="6" stroke-linecap="round"/><text class="lab-l" x="140" y="${y + 12}">${esc(labels[k] ?? "")}</text></g>`).join("")}
    <circle class="ring" cx="468" cy="${ys[start]}" r="0" fill="none" stroke="var(--accent-2)" stroke-width="4" opacity="0"/>
    <circle class="glow" cx="468" cy="${ys[start]}" r="70" fill="url(#ballg)" opacity="0.7"/>
    <circle class="ball" cx="468" cy="${ys[start]}" r="22" fill="#fff"/>
    ${v.label ? `<text class="lab" x="468" y="${H - 14}">${esc(v.label)}</text>` : ""}
  </svg>`;
};

const buildOrbit = (v) => {
  const H = 620, tilt = v.tilt ?? 55;
  const planets = v.planets || [{ r: v.r ?? 300, size: v.size ?? 22, period: v.period ?? 6, retrograde: !!v.retrograde, colour: v.colour || "var(--accent)", label: v.label || "" }];
  const k = Math.max(0.12, Math.cos(tilt * Math.PI / 180));
  return `${svgOpen("orbit", H, { tilt: k, planets, starSpin: v.starSpin ?? 8 })}
    <defs><radialGradient id="starg"><stop offset="0" stop-color="#fff"/><stop offset="0.3" stop-color="#ffd27a"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/></radialGradient></defs>
    ${planets.map(p => `<ellipse cx="468" cy="${H / 2}" rx="${p.r}" ry="${(p.r * k).toFixed(1)}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3" stroke-dasharray="${p.retrograde ? "14 10" : "none"}"/>`).join("")}
    <circle cx="468" cy="${H / 2}" r="110" fill="url(#starg)" opacity="0.8"/>
    <circle cx="468" cy="${H / 2}" r="52" fill="#ffe4a8"/>
    <g class="spin"><path class="spin-arc" fill="none" stroke="var(--accent-2)" stroke-width="5" stroke-linecap="round"/><polygon class="spin-arrow" points="0,0 -20,-11 -20,11" fill="var(--accent-2)"/></g>
    ${planets.map((p, i) => `<g class="pl" data-i="${i}"><path class="trail" fill="none" stroke="${p.colour || "var(--accent)"}" stroke-width="6" stroke-linecap="round" opacity="0.55"/><circle class="body" r="${p.size ?? 22}" fill="${p.colour || "var(--accent)"}"/><text class="lab-s" style="fill:${p.colour || "var(--accent)"}">${esc(p.label || "")}</text></g>`).join("")}
    ${v.caption ? `<text class="lab" x="468" y="${H - 14}">${esc(v.caption)}</text>` : ""}
  </svg>`;
};

const buildThermometer = (v) => {
  const H = 600, min = v.min ?? 0, max = v.max ?? 100, top = 40, bot = H - 130, x = 300;
  const yOf = (val) => bot - (bot - top) * (val - min) / (max - min);
  const markers = (v.markers || []).map(m => ({ ...m, y: yOf(m.value), ly: yOf(m.value) })).sort((a, b) => b.value - a.value);
  for (let i = 1; i < markers.length; i++) if (markers[i].ly - markers[i - 1].ly < 36) markers[i].ly = markers[i - 1].ly + 36; // label collision pass, tick stays true
  return `${svgOpen("thermometer", H, { min, max, fill: v.fill ?? max, top, bot, unit: v.unit || "", decimals: v.decimals ?? 0 })}
    <rect x="${x - 36}" y="${top - 20}" width="72" height="${bot - top + 40}" rx="36" fill="rgba(255,255,255,0.08)" stroke="var(--line)" stroke-width="4"/>
    <circle cx="${x}" cy="${bot + 50}" r="62" fill="rgba(255,255,255,0.08)" stroke="var(--line)" stroke-width="4"/>
    <circle cx="${x}" cy="${bot + 50}" r="48" fill="var(--myth)"/>
    <rect class="merc" x="${x - 20}" y="${bot}" width="40" height="0" rx="20" fill="var(--myth)"/>
    ${markers.map(m => `<g class="mk" data-v="${m.value}"><line x1="${x + 40}" x2="${x + 80}" y1="${m.y.toFixed(1)}" y2="${m.ly.toFixed(1)}" stroke="var(--muted)" stroke-width="4"/><text class="lab-l mk-t" x="${x + 100}" y="${(m.ly + 11).toFixed(1)}">${esc(m.label)}</text></g>`).join("")}
    <text class="val" x="${x - 60}" y="${bot}" text-anchor="end"></text>
  </svg>`;
};

const buildFlash = (v) => {
  const H = 580, cols = 10, rows = 6, pad = 70;
  const fx = 60 + (v.x ?? 0.62) * 816, fy = 30 + (v.y ?? 0.45) * (H - 130);
  const pmts = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pmts.push({ x: pad + c * ((VW - 2 * pad) / (cols - 1)), y: 60 + r * ((H - 200) / (rows - 1)) });
  return `${svgOpen("flash", H, { at: v.at ?? 1.2, fx, fy })}
    <rect x="30" y="10" width="${VW - 60}" height="${H - 90}" rx="34" fill="#03050c" stroke="var(--line)" stroke-width="4"/>
    ${pmts.map(p => `<circle class="pmt" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="14" fill="rgba(79,227,240,0.14)" data-d="${Math.hypot(p.x - fx, p.y - fy).toFixed(1)}"/>`).join("")}
    <circle class="ring" cx="${fx}" cy="${fy}" r="0" fill="none" stroke="var(--accent-2)" stroke-width="5" opacity="0"/>
    <circle class="core" cx="${fx}" cy="${fy}" r="0" fill="#fff" opacity="0"/>
    <text class="lab readout" x="468" y="${H - 22}" opacity="0"><tspan style="fill:var(--accent-2)">${esc(v.readout || "")}</tspan>${v.label ? `<tspan> ${esc(v.label)}</tspan>` : ""}</text>
    <text class="lab waiting" x="468" y="${H - 22}">${esc(v.waiting || "listening")}</text>
  </svg>`;
};

const buildTimeline = (v) => {
  const H = 380, min = v.min ?? 0, max = v.max ?? 100, x0 = 70, x1 = VW - 70, ay = 200;
  const xOf = (val) => x0 + (x1 - x0) * (val - min) / (max - min);
  const ticks = (v.ticks || []).map((tk, i) => ({ ...tk, x: xOf(tk.value), up: i % 2 === 0 }));
  return `${svgOpen("timeline", H, { min, max, x0, x1, from: v.cursor?.from ?? min, to: v.cursor?.to ?? max, unit: v.unit || "", decimals: v.decimals ?? 0 })}
    <line x1="${x0}" x2="${x1}" y1="${ay}" y2="${ay}" stroke="var(--line)" stroke-width="8" stroke-linecap="round"/>
    <line class="done" x1="${x0}" x2="${x0}" y1="${ay}" y2="${ay}" stroke="var(--accent)" stroke-width="8" stroke-linecap="round"/>
    ${ticks.map(tk => `<g class="tk" data-v="${tk.value}"><line x1="${tk.x.toFixed(1)}" x2="${tk.x.toFixed(1)}" y1="${ay - 22}" y2="${ay + 22}" stroke="var(--muted)" stroke-width="5" stroke-linecap="round"/><text class="lab-s tk-t" x="${tk.x.toFixed(1)}" y="${tk.up ? ay - 44 : ay + 62}">${esc(tk.label)}</text></g>`).join("")}
    <g class="cur"><line x1="0" x2="0" y1="${ay - 54}" y2="${ay + 54}" stroke="var(--accent-2)" stroke-width="8" stroke-linecap="round"/><rect x="-110" y="${ay - 150}" width="220" height="72" rx="36" fill="var(--accent-2)"/><text class="cur-t" x="0" y="${ay - 102}"></text></g>
    ${v.label ? `<text class="lab" x="468" y="${H - 14}">${esc(v.label)}</text>` : ""}
  </svg>`;
};

const buildCompare = (v) => {
  const H = 560, items = (v.items || []).slice(0, 4), mode = v.mode || "circles", n = Math.max(1, items.length);
  const defCol = ["var(--accent)", "var(--accent-2)", "var(--fact)", "var(--myth)"];
  const slot = VW / n;
  return `${svgOpen("compare", H, { mode, n, H })}
    ${items.map((it, i) => { const cx = slot * i + slot / 2, col = it.colour || defCol[i % 4], size = Math.max(2, Math.min(100, it.size ?? 50));
      const shape = mode === "bars"
        ? `<rect class="shape" data-size="${size}" x="${cx - Math.min(150, slot * 0.32)}" width="${Math.min(300, slot * 0.64)}" y="${H - 120}" height="0" rx="18" fill="${col}" fill-opacity="0.22" stroke="${col}" stroke-width="4"/>`
        : `<circle class="shape" data-size="${size}" cx="${cx}" cy="${H - 120}" r="0" fill="${col}" fill-opacity="0.18" stroke="${col}" stroke-width="4"/>`;
      return `<g class="cmp" data-i="${i}">${shape}<text class="val-s" x="${cx}" y="${H - 120}" style="fill:${col}">${esc(it.value ?? "")}</text><text class="lab" x="${cx}" y="${H - 50}">${esc(it.label ?? "")}</text></g>`; }).join("")}
  </svg>`;
};

// Scene markup. Each scene is a full-frame section (background + scrim + content in the safe area) toggled by seek(t).
const sceneHtml = (s, i) => {
  const v = s.visual || { type: "text" };
  let vis = "";
  if (v.type === "counter") vis = `<div class="v-counter"><div class="num" data-from="${v.from ?? 0}" data-to="${v.to}" data-decimals="${v.decimals ?? 0}" data-suffix="${esc(v.suffix ?? "")}" data-prefix="${esc(v.prefix ?? "")}"></div>${v.label ? `<div class="v-label">${rich(v.label)}</div>` : ""}</div>`;
  if (v.type === "bars") vis = `<div class="v-bars">${v.items.map(b => `<div class="v-bar"><div class="v-bar-h"><span>${rich(b.label)}</span><span>${rich(b.value)}</span></div><div class="bar"><i data-pct="${b.pct}"></i></div></div>`).join("")}</div>`;
  if (v.type === "dots" || v.type === "grid") vis = `<div class="v-dots" data-n="${v.n ?? 100}" data-lit="${v.lit ?? 1}" data-cols="${v.cols ?? 10}" style="--dot:${esc(v.colour || v.color || "var(--accent-2)")}"></div>${v.label ? `<div class="v-label">${rich(v.label)}</div>` : ""}`;
  if (v.type === "scale") vis = `<div class="v-scale"><div class="v-circle a" data-r="${v.a.r}"><span>${rich(v.a.label)}</span></div><div class="v-circle b" data-r="${v.b.r}"><span>${rich(v.b.label)}</span></div></div>`;
  if (v.type === "list") vis = `<div class="v-list">${v.items.map((t, k) => `<div class="v-item" data-k="${k}"><div class="n">${k + 1}</div><div class="t">${rich(t)}</div></div>`).join("")}</div>`;
  if (v.type === "staircase") vis = buildStaircase(v);
  if (v.type === "lineage") vis = buildLineage(v);
  if (v.type === "orbit") vis = buildOrbit(v);
  if (v.type === "thermometer") vis = buildThermometer(v);
  if (v.type === "flash") vis = buildFlash(v);
  if (v.type === "timeline") vis = buildTimeline(v);
  if (v.type === "compare") vis = buildCompare(v);
  const bg = s.bg || {};
  const scrim = bg.scrim ?? (bg.src ? 0.55 : 0);
  const focus = Array.isArray(bg.focus) ? bg.focus : [0.5, 0.5];
  const move = bg.move || "push-in";
  const defFrom = move === "push-out" ? 1.15 : move === "drift" ? 1.06 : 1.0, defTo = move === "push-out" ? 1.0 : move === "drift" ? 1.14 : 1.15;
  const bgHtml = bg.src ? `<div class="bg" data-move="${esc(move)}" data-from="${bg.from ?? defFrom}" data-to="${bg.to ?? defTo}" data-fx="${focus[0]}" data-fy="${focus[1]}"><img src="${bg.src}" style="transform-origin:${focus[0] * 100}% ${focus[1] * 100}%"></div>` : "";
  const big = s.big ? `<div class="big" data-at="${s.big.at ?? 0}" data-hold="${s.big.hold ?? 1.2}"><span>${rich(s.big.text)}</span></div>` : "";
  return `<section class="scene" data-i="${i}" data-start="${s.start}" data-end="${s.end}" data-tr="${esc(s.transition || spec.transition || "cut")}" data-layout="${s.layout || (vis ? "split" : "center")}">
    ${bgHtml}
    ${scrim > 0 ? `<div class="scrim" style="opacity:${scrim}"></div>` : ""}
    <div class="safe"><div class="content">
      ${s.kicker ? `<div class="kicker">${rich(s.kicker)}</div>` : ""}
      ${s.caption ? `<div class="caption">${rich(s.caption)}</div>` : ""}
      ${vis}
    </div>${big}</div>
  </section>`;
};

const bandHtml = chunks.map((c, ci) => `<div class="cap-line" data-c="${ci}" data-start="${c[0].start}" data-end="${c[c.length - 1].end}">${c.map(w => `<span class="w" data-s="${w.start}" data-e="${w.end}">${esc(w.word)}</span>`).join(" ")}</div>`).join("");

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${pathToFileURL(resolve(here, "../brand.css")).href}">
<style>
  body { width:1080px; height:1920px; overflow:hidden; }
  .stage { position:absolute; inset:0; }
  .scene { position:absolute; inset:0; display:none; }
  .scene.on { display:block; }
  .scene .safe { display:block; }
  .scene .content { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; gap:40px; opacity:0; }
  body.karaoke .scene .safe { bottom: 760px; }
  body.karaoke .scene .content { gap:32px; }
  body.karaoke .caption { font-size:58px; }
  .scene .kicker { text-align:center; }
  .v-counter { text-align:center; }
  .v-counter .num { font-size:250px; }
  .v-label { font: 500 40px/1.3 var(--font-body); color: var(--ink-2); text-align:center; margin-top:10px; }
  .v-bars { display:flex; flex-direction:column; gap:34px; }
  .v-bar-h { display:flex; justify-content:space-between; font: 500 36px/1 var(--font-body); color: var(--ink-2); margin-bottom:14px; }
  .bar { height:22px; border-radius:11px; }
  .v-dots { display:grid; gap:12px; justify-content:center; --dot: var(--accent-2); }
  .v-dots i { display:block; width:52px; height:52px; border-radius:50%; background: var(--line); }
  .v-dots i.lit { background: var(--dot); box-shadow: 0 0 30px color-mix(in srgb, var(--dot) 60%, transparent); }
  .v-scale { position:relative; height:620px; display:flex; align-items:flex-end; justify-content:center; gap:60px; }
  body.karaoke .v-scale { height:500px; }
  .v-circle { border-radius:50%; background: rgba(79,227,240,0.15); border: 4px solid var(--accent); display:flex; align-items:center; justify-content:center; font: 600 32px/1.2 var(--font-body); text-align:center; color: var(--ink); }
  .v-circle.b { border-color: var(--accent-2); background: rgba(255,176,32,0.12); }
  .v-list { display:flex; flex-direction:column; gap:28px; }
  .v-item { display:flex; gap:26px; align-items:flex-start; opacity:0; transform: translateY(24px); }
  .v-item .n { flex:0 0 68px; height:68px; border-radius:16px; background: var(--surface); border:2px solid var(--line); display:flex; align-items:center; justify-content:center; font:700 34px var(--font-display); color: var(--accent); }
  .v-item .t { font: 500 42px/1.3 var(--font-body); color: var(--ink-2); padding-top:8px; }
  .v-item .t b { color: var(--ink); }
  .vis { width:100%; height:auto; max-height:660px; display:block; overflow:visible; }
  body.karaoke .vis { max-height:540px; }
  .vis text { font-family: var(--font-body); }
  .vis .lab { font: 600 34px var(--font-body); fill: var(--ink-2); text-anchor: middle; }
  .vis .lab-l { font: 600 30px var(--font-body); fill: var(--ink-2); text-anchor: start; }
  .vis .lab-s { font: 600 28px var(--font-body); fill: var(--ink-2); text-anchor: middle; }
  .vis .val { font: 700 44px var(--font-display); fill: var(--ink); }
  .vis .val-s { font: 700 40px var(--font-display); fill: var(--ink); text-anchor: middle; }
  .vis .cur-t { font: 700 34px var(--font-display); fill: var(--bg); text-anchor: middle; }
  .vis-staircase .lab-l { text-anchor: end; }
  .vis-staircase .lvl.now line { stroke: var(--accent-2); }
  .vis-staircase .lvl.now text { fill: var(--accent-2); }
  .vis-thermometer .mk.hit line { stroke: var(--accent-2); }
  .vis-thermometer .mk.hit text { fill: var(--ink); }
  .vis-timeline .tk.hit line { stroke: var(--accent); }
  .vis-timeline .tk.hit text { fill: var(--ink); }
  .vis-orbit .lab-s { text-anchor: middle; font-size: 26px; }
  .big { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; }
  .big span { font: 700 200px/1 var(--font-display); letter-spacing:-0.04em; color: var(--accent-2); text-align:center; text-shadow: 0 10px 60px rgba(0,0,0,0.75), 0 0 40px rgba(255,176,32,0.35); white-space:nowrap; }
  .orbit { position:absolute; inset:0; pointer-events:none; }
  .orbit i { position:absolute; width:6px; height:6px; border-radius:50%; background: var(--accent); opacity:0.35; }
  .brand { position:absolute; left:72px; bottom:470px; font:600 32px/1 var(--font-body); color: var(--ink-2); text-shadow: 0 2px 12px rgba(0,0,0,0.7); }
  .brand::before { content:""; display:inline-block; width:14px; height:14px; border-radius:50%; background: var(--accent); margin-right:14px; vertical-align:middle; }
  .endcard { position:absolute; inset:0; display:none; flex-direction:column; align-items:center; justify-content:center; gap:30px; padding: 0 90px; background: var(--bg); opacity:0; }
  .endcard.on { display:flex; }
  .cap-line { display:none; }
  .cap-line.on { display:block; }
</style></head><body class="${karaoke ? "karaoke" : ""}">
<div class="frame"><div class="stage">
  <div class="orbit">${Array.from({ length: 60 }, (_, k) => `<i data-k="${k}"></i>`).join("")}</div>
  ${spec.scenes.map(sceneHtml).join("")}
  <div class="progress"><i id="prog"></i></div>
  <div class="brand">${esc(spec.handle || "@hqrs_1")}</div>
  ${karaoke ? `<div class="cap-band">${bandHtml}</div>` : ""}
  <div class="endcard"><div class="kicker">${esc(spec.end?.kicker || "Follow for more")}</div><div class="h1" style="text-align:center">${rich(spec.end?.title || "One verified science story a day")}</div><div class="body" style="text-align:center">${rich(spec.end?.body || "Source in the caption.")}</div><div class="pill" style="margin-top:20px">${esc(spec.handle || "@hqrs_1")}</div></div>
</div></div>
<script>
  const DUR = ${duration};
  const ENDCARD = ${endSeconds};
  const TR = 0.4; // fade / wipe length
  const W = 1080, H = 1920;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, q) => a + (b - a) * q;
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeInOut = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const scenes = [...document.querySelectorAll(".scene")];
  const stage = document.querySelector(".stage");
  const orbitLayer = document.querySelector(".orbit");
  const capLines = [...document.querySelectorAll(".cap-line")];
  const dots = document.querySelectorAll(".v-dots");
  dots.forEach(d => {
    const n = +d.dataset.n, cols = +d.dataset.cols, rows = Math.ceil(n / cols);
    let size = Math.min(52, Math.floor((936 - 12 * (cols - 1)) / cols));
    size = Math.min(size, Math.floor((560 - 12 * (rows - 1)) / rows));
    d.style.gridTemplateColumns = "repeat(" + cols + ", " + size + "px)";
    for (let k = 0; k < n; k++) { const i = document.createElement("i"); i.style.width = i.style.height = size + "px"; d.appendChild(i); }
  });
  const orbitDots = [...document.querySelectorAll(".orbit i")];
  const rnd = (k) => { const x = Math.sin(k * 9301 + 49297) * 233280; return x - Math.floor(x); };
  const num = (x, d) => x.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  // Ken Burns: returns {s, tx, ty} for a background at scene progress q (0..1, linear).
  const kenBurns = (bg, q) => {
    const move = bg.dataset.move, from = +bg.dataset.from, to = +bg.dataset.to, fx = +bg.dataset.fx, fy = +bg.dataset.fy;
    let s = lerp(from, to, q), tx = 0, ty = 0;
    const rangeX = (s) => [-(1 - fx) * W * (s - 1), fx * W * (s - 1)], rangeY = (s) => [-(1 - fy) * H * (s - 1), fy * H * (s - 1)];
    if (move === "pan-left" || move === "pan-right" || move === "tilt-up" || move === "tilt-down") {
      s = Math.max(from, to, 1.12);
      const [xa, xb] = rangeX(s), [ya, yb] = rangeY(s);
      if (move === "pan-left") tx = lerp(xa, xb, q);
      if (move === "pan-right") tx = lerp(xb, xa, q);
      if (move === "tilt-up") ty = lerp(ya, yb, q);
      if (move === "tilt-down") ty = lerp(yb, ya, q);
    } else if (move === "drift") {
      const [xa, xb] = rangeX(s), [ya, yb] = rangeY(s);
      tx = lerp(0.45 * xa, 0.45 * xb, q); ty = lerp(0.3 * yb, 0.3 * ya, q);
    }
    return { s, tx, ty };
  };

  window.seek = (t) => {
    document.getElementById("prog").style.width = (100 * clamp(t / DUR, 0, 1)) + "%";
    let parX = 0, parY = 0, shakeX = 0, shakeY = 0;
    const ecOn = ENDCARD > 0 && t >= DUR - ENDCARD;
    scenes.forEach((sc, idx) => {
      const s = +sc.dataset.start, e = +sc.dataset.end;
      const next = scenes[idx + 1];
      const ext = (next ? next.dataset.tr !== "cut" : ENDCARD > 0) ? TR : 0; // stay underneath an incoming fade / wipe / end card
      const on = t >= s && t < e + ext && (ecOn ? idx === scenes.length - 1 : true);
      sc.classList.toggle("on", on);
      if (!on) return;
      const local = t - s, len = e - s;
      // Incoming transition on the whole layer.
      const tr = sc.dataset.tr, q0 = clamp(local / TR, 0, 1);
      sc.style.opacity = tr === "fade" && idx > 0 ? q0 : 1;
      sc.style.clipPath = tr === "wipe-up" && idx > 0 ? "inset(" + (100 * (1 - easeOut(q0))).toFixed(2) + "% 0 0 0)" : "none";
      // Background Ken Burns, progress linear over the scene.
      const bg = sc.querySelector(".bg");
      if (bg) {
        const q = clamp(local / len, 0, 1), kb = kenBurns(bg, q);
        bg.firstElementChild.style.transform = "translate(" + kb.tx.toFixed(2) + "px," + kb.ty.toFixed(2) + "px) scale(" + kb.s.toFixed(4) + ")";
        parX = -3 * (kb.tx === 0 ? 0 : Math.sign(kb.tx) * Math.min(1, Math.abs(kb.tx) / 60));
        parY = (kb.tx === 0 && kb.ty === 0) ? -3 * q : -3 * (kb.ty === 0 ? 0 : Math.sign(kb.ty) * Math.min(1, Math.abs(kb.ty) / 60));
      }
      // Content entrance (fade + rise), no fade-out: scenes cut.
      const content = sc.querySelector(".content");
      const fadeIn = idx === 0 ? 1 : clamp(local / 0.35, 0, 1); // scene 0 is on from frame 0 so the hook reads in the cover frame
      let contentOpacity = fadeIn;
      content.style.transform = "translateY(" + (24 * (1 - easeOut(fadeIn))) + "px)";
      const p = easeOut(clamp(local / Math.min(1.6, len * 0.7), 0, 1));
      sc.querySelectorAll(".v-counter .num").forEach(n => {
        const from = +n.dataset.from, to = +n.dataset.to, d = +n.dataset.decimals;
        n.textContent = n.dataset.prefix + num(from + (to - from) * p, d) + n.dataset.suffix;
        const finalLen = (n.dataset.prefix + num(to, d) + n.dataset.suffix).length;
        n.style.fontSize = Math.min(250, Math.floor(1500 / Math.max(finalLen, 1))) + "px";
      });
      sc.querySelectorAll(".bar i").forEach(b => b.style.width = (+b.dataset.pct * p) + "%");
      sc.querySelectorAll(".v-dots").forEach(d => { const lit = Math.round(+d.dataset.lit * p); [...d.children].forEach((c, k) => c.classList.toggle("lit", k < lit)); });
      sc.querySelectorAll(".v-circle").forEach(c => { const r = +c.dataset.r * (0.2 + 0.8 * p); c.style.width = c.style.height = r + "px"; });
      sc.querySelectorAll(".v-item").forEach(it => { const q = easeOut(clamp((local - 0.3 - +it.dataset.k * 0.45) / 0.4, 0, 1)); it.style.opacity = q; it.style.transform = "translateY(" + (24 * (1 - q)) + "px)"; });

      // Staircase: ball sits still, then jumps discretely between levels.
      sc.querySelectorAll(".vis-staircase").forEach(v => {
        const P = JSON.parse(v.dataset.p); let lvl = P.start, y = P.ys[lvl], ringR = 0, ringO = 0;
        for (const j of P.jumps) {
          if (local < j.t) break;
          const q = clamp((local - j.t) / 0.16, 0, 1); lvl = j.to;
          y = lerp(P.ys[j.from], P.ys[j.to], easeOut(q)) - 46 * Math.sin(Math.PI * q);
          const rq = clamp((local - j.t) / 0.5, 0, 1); ringR = 26 + 90 * easeOut(rq); ringO = 1 - rq;
        }
        const glow = 62 + 6 * Math.sin(local * 5);
        v.querySelector(".ball").setAttribute("cy", y); v.querySelector(".glow").setAttribute("cy", y); v.querySelector(".glow").setAttribute("r", glow);
        const ring = v.querySelector(".ring"); ring.setAttribute("cy", P.ys[lvl]); ring.setAttribute("r", ringR); ring.setAttribute("opacity", ringO);
        v.querySelectorAll(".lvl").forEach(l => l.classList.toggle("now", +l.dataset.k === lvl));
      });
      // Lineage: branching trees grow over the first 80% of the scene.
      sc.querySelectorAll(".vis-lineage").forEach(v => {
        const g = clamp(local / (len * 0.8), 0, 1);
        v.querySelectorAll(".seg").forEach(l => { const q = easeOut(clamp((g - +l.dataset.b) / 0.14, 0, 1)); l.setAttribute("x2", lerp(+l.dataset.x1, +l.dataset.x2, q)); l.setAttribute("y2", lerp(+l.dataset.y1, +l.dataset.y2, q)); l.setAttribute("opacity", q > 0 ? 1 : 0); });
      });
      // Orbit: planets on tilted ellipses; the star's spin arrow shows the prograde direction.
      sc.querySelectorAll(".vis-orbit").forEach(v => {
        const P = JSON.parse(v.dataset.p), cy = +v.dataset.h / 2, cx = 468, sr = 78, sk = P.tilt;
        const a0 = 2 * Math.PI * local / P.starSpin;
        let d = ""; for (let k = 0; k <= 10; k++) { const a = a0 + (k / 10) * Math.PI / 2; d += (k ? " L " : "M ") + (cx + sr * Math.cos(a)).toFixed(1) + " " + (cy + sr * sk * Math.sin(a)).toFixed(1); }
        v.querySelector(".spin-arc").setAttribute("d", d);
        const ae = a0 + Math.PI / 2, ax = cx + sr * Math.cos(ae), ay = cy + sr * sk * Math.sin(ae), tang = Math.atan2(sr * sk * Math.cos(ae), -sr * Math.sin(ae)) * 180 / Math.PI;
        v.querySelector(".spin-arrow").setAttribute("transform", "translate(" + ax.toFixed(1) + " " + ay.toFixed(1) + ") rotate(" + tang.toFixed(1) + ")");
        v.querySelectorAll(".pl").forEach(g => {
          const pl = P.planets[+g.dataset.i], dir = pl.retrograde ? -1 : 1, rx = pl.r, ry = pl.r * sk;
          const th = dir * 2 * Math.PI * local / (pl.period || 6) - Math.PI / 2;
          const x = cx + rx * Math.cos(th), y = cy + ry * Math.sin(th);
          const b = g.querySelector(".body"); b.setAttribute("cx", x); b.setAttribute("cy", y);
          const lab = g.querySelector(".lab-s"); lab.setAttribute("x", x); lab.setAttribute("y", y - (pl.size || 22) - 14);
          let tr = ""; for (let k = 0; k <= 12; k++) { const a = th - dir * (k / 12) * 0.9; tr += (k ? " L " : "M ") + (cx + rx * Math.cos(a)).toFixed(1) + " " + (cy + ry * Math.sin(a)).toFixed(1); }
          g.querySelector(".trail").setAttribute("d", tr);
        });
      });
      // Thermometer: mercury rises to the target; markers light as they are passed.
      sc.querySelectorAll(".vis-thermometer").forEach(v => {
        const P = JSON.parse(v.dataset.p), val = P.min + (P.fill - P.min) * p, y = P.bot - (P.bot - P.top) * (val - P.min) / (P.max - P.min);
        const m = v.querySelector(".merc"); m.setAttribute("y", y); m.setAttribute("height", Math.max(0, P.bot - y + 20));
        const vt = v.querySelector(".val"); vt.setAttribute("y", y + 14); vt.textContent = num(val, P.decimals) + P.unit;
        v.querySelectorAll(".mk").forEach(k => k.classList.toggle("hit", val >= +k.dataset.v - 1e-9));
      });
      // Flash: a single recoil flash at P.at, an expanding ring, nearby sensors light, then the readout.
      sc.querySelectorAll(".vis-flash").forEach(v => {
        const P = JSON.parse(v.dataset.p), q = local - P.at, core = v.querySelector(".core"), ring = v.querySelector(".ring");
        v.querySelector(".waiting").setAttribute("opacity", q < 0 ? 0.6 + 0.3 * Math.sin(local * 6) : 0);
        if (q < 0) { core.setAttribute("opacity", 0); ring.setAttribute("opacity", 0); v.querySelector(".readout").setAttribute("opacity", 0); v.querySelectorAll(".pmt").forEach(c => c.setAttribute("fill", "rgba(79,227,240,0.14)")); return; }
        const cq = clamp(q / 0.12, 0, 1); core.setAttribute("r", 8 + 70 * easeOut(cq)); core.setAttribute("opacity", q < 0.12 ? 1 : Math.max(0.35, 1 - (q - 0.12) / 0.8));
        const rq = clamp(q / 0.6, 0, 1); ring.setAttribute("r", 300 * easeOut(rq)); ring.setAttribute("opacity", 1 - rq);
        v.querySelectorAll(".pmt").forEach(c => { const dd = +c.dataset.d, lit = clamp(1 - dd / 320, 0, 1) * clamp(1 - (q - 0.1) / 1.2, 0.25, 1); c.setAttribute("fill", "rgba(255,176,32," + (0.14 + 0.86 * lit).toFixed(3) + ")"); });
        v.querySelector(".readout").setAttribute("opacity", clamp((q - 0.5) / 0.3, 0, 1));
      });
      // Timeline: cursor sweeps from cursor.from to cursor.to; passed ticks light up.
      sc.querySelectorAll(".vis-timeline").forEach(v => {
        const P = JSON.parse(v.dataset.p), val = lerp(P.from, P.to, easeInOut(clamp(local / (len * 0.85), 0, 1)));
        const x = P.x0 + (P.x1 - P.x0) * (val - P.min) / (P.max - P.min);
        v.querySelector(".cur").setAttribute("transform", "translate(" + x.toFixed(1) + " 0)");
        v.querySelector(".cur-t").textContent = num(val, P.decimals) + P.unit;
        v.querySelector(".done").setAttribute("x2", Math.max(P.x0, x));
        v.querySelectorAll(".tk").forEach(k => k.classList.toggle("hit", val >= +k.dataset.v - 1e-9));
      });
      // Compare: circles / bars animate to their sizes.
      sc.querySelectorAll(".vis-compare").forEach(v => {
        const P = JSON.parse(v.dataset.p);
        v.querySelectorAll(".cmp").forEach(g => {
          const sh = g.querySelector(".shape"), size = +sh.dataset.size, q = 0.08 + 0.92 * p, valT = g.querySelector(".val-s");
          if (P.mode === "bars") { const h = 400 * size / 100 * q; sh.setAttribute("height", h); sh.setAttribute("y", P.H - 120 - h); valT.setAttribute("y", P.H - 120 - h - 20); }
          else { const r = 200 * Math.sqrt(size / 100) * q; sh.setAttribute("r", r); sh.setAttribute("cy", P.H - 120 - r); valT.setAttribute("y", P.H - 120 - r + 14); }
        });
      });
      // Kinetic number: slam in with a 120 ms overshoot and a 4 px shake for 150 ms; holds "hold" s, then fades out and the content returns.
      const big = sc.querySelector(".big");
      if (big) {
        const at = +big.dataset.at, hold = +big.dataset.hold, q = local - at;
        if (q < 0 || q > hold + 0.25) big.style.opacity = 0;
        else {
          const land = 0.18;
          const scl = q < land ? lerp(1.6, 0.94, easeOut(q / land)) : q < land + 0.12 ? lerp(0.94, 1.0, easeInOut((q - land) / 0.12)) : 1.0;
          big.style.opacity = Math.min(clamp(q / 0.08, 0, 1), clamp((hold + 0.25 - q) / 0.25, 0, 1));
          const txt = big.firstElementChild;
          txt.style.transform = "scale(" + scl.toFixed(4) + ")";
          txt.style.fontSize = Math.min(200, Math.floor(1700 / Math.max(txt.textContent.length, 1))) + "px";
          const sq = q - land;
          if (sq >= 0 && sq < 0.15) { const f = Math.floor(sq * 120); shakeX = 4 * (rnd(f * 2 + idx * 97) * 2 - 1) * (1 - sq / 0.15); shakeY = 4 * (rnd(f * 2 + 1 + idx * 97) * 2 - 1) * (1 - sq / 0.15); }
          contentOpacity = fadeIn * (1 - 0.85 * Math.min(clamp(q / 0.15, 0, 1), clamp((hold + 0.25 - q) / 0.25, 0, 1)));
        }
      }
      content.style.opacity = contentOpacity;
    });
    orbitDots.forEach((el, k) => {
      const speed = 8 + rnd(k) * 20, y = ((rnd(k + 1) * 1920) + t * speed) % 2000 - 40;
      el.style.transform = "translate(" + (rnd(k + 2) * 1080) + "px," + (1920 - y) + "px) scale(" + (0.6 + rnd(k + 3) * 1.4) + ")";
    });
    orbitLayer.style.transform = "translate(" + parX.toFixed(2) + "px," + parY.toFixed(2) + "px)";
    stage.style.transform = "translate(" + shakeX.toFixed(2) + "px," + shakeY.toFixed(2) + "px)";
    // Word-by-word caption band: current chunk shown, current word amber and 1.08x, past white, future dimmed.
    if (capLines.length) {
      let cur = null;
      for (const l of capLines) { const s = +l.dataset.start, e = +l.dataset.end; if (t >= s - 0.05 && t < e + 0.35) { cur = l; break; } }
      capLines.forEach(l => l.classList.toggle("on", l === cur));
      if (cur) {
        let lastSpoken = null;
        cur.querySelectorAll(".w").forEach(w => { if (t >= +w.dataset.s) lastSpoken = w; });
        cur.querySelectorAll(".w").forEach(w => {
          const s = +w.dataset.s, e = +w.dataset.e, isNow = w === lastSpoken, past = !isNow && t >= e;
          w.classList.toggle("now", isNow); w.classList.toggle("past", past); w.classList.toggle("next", !isNow && !past);
          const pop = isNow ? lerp(1.0, 1.08, easeOut(clamp((t - s) / 0.1, 0, 1))) : 1;
          w.style.transform = "scale(" + pop.toFixed(3) + ")";
        });
      }
    }
    const ec = document.querySelector(".endcard");
    ec.classList.toggle("on", ecOn);
    if (ecOn) ec.style.opacity = clamp((t - (DUR - ENDCARD)) / TR, 0, 1);
  };
</script></body></html>`;

const htmlFile = resolve(outdir, `${name}.html`);
writeFileSync(htmlFile, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(htmlFile).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => null))));
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

// Captions as SRT for accessibility and for pasting into Instagram's caption editor. With word timings the SRT follows the caption band.
const srtTime = (t) => { const ms = Math.round(t * 1000); const h = Math.floor(ms / 3.6e6), m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1000) % 60, x = ms % 1000; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(x).padStart(3, "0")}`; };
const srt = karaoke
  ? chunks.map((c, i) => `${i + 1}\n${srtTime(c[0].start)} --> ${srtTime(c[c.length - 1].end)}\n${c.map(w => w.word).join(" ")}\n`).join("\n")
  : spec.scenes.map((s, i) => `${i + 1}\n${srtTime(s.start)} --> ${srtTime(s.end)}\n${String(s.caption ?? "").replace(/\*/g, "")}\n`).join("\n");
writeFileSync(resolve(outdir, `${name}.srt`), srt);
if (words) writeFileSync(resolve(outdir, `${name}.words.json`), JSON.stringify(words, null, 1));
if (spec.voiceover_script) writeFileSync(resolve(outdir, `${name}-voiceover.txt`), spec.voiceover_script.trim() + "\n");
if (spec.caption) writeFileSync(resolve(outdir, "caption.txt"), spec.caption.trim() + "\n");

// Mux. Voice 0 dB; music -18 dB (fixed duck) with a 1.5 s fade-out at the end, looped if short; SFX -8 dB placed with adelay.
const sfx = (sfxArg ? sfxArg.split(",") : (spec.sfx || []).map(s => typeof s === "string" ? s : `${s.path}@${s.at}`)).map(s => {
  const m = String(s).trim().match(/^(.*)@([\d.]+)$/); if (!m) { warn(`sfx entry needs path@seconds, skipping: ${s}`); return null; }
  const p = resolve(sfxArg ? process.cwd() : specDir, m[1]); if (!existsSync(p)) { warn(`sfx file not found, skipping: ${p}`); return null; }
  return { path: p, at: +m[2] };
}).filter(Boolean);
if (musicPath && !existsSync(musicPath)) warn(`music file not found, skipping: ${musicPath}`);
const music = musicPath && existsSync(musicPath) ? musicPath : null;
const ff = ["-y", "-framerate", String(fps), "-i", resolve(framesDir, `f%05d.${ext}`)];
const filters = [], mix = []; let ai = 1;
if (audioPath) { ff.push("-i", audioPath); filters.push(`[${ai}:a]aresample=48000,volume=0dB,apad,atrim=0:${duration}[va]`); mix.push("[va]"); ai++; }
if (music) { ff.push("-stream_loop", "-1", "-i", music); const db = audioPath ? -18 : -10; filters.push(`[${ai}:a]aresample=48000,volume=${db}dB,atrim=0:${duration},afade=t=out:st=${Math.max(0, duration - 1.5).toFixed(3)}:d=1.5[ma]`); mix.push("[ma]"); ai++; }
sfx.forEach((s, k) => { ff.push("-i", s.path); filters.push(`[${ai}:a]aresample=48000,volume=-8dB,adelay=${Math.round(s.at * 1000)}:all=1,apad,atrim=0:${duration}[s${k}]`); mix.push(`[s${k}]`); ai++; });
if (mix.length) {
  filters.push(mix.length === 1 ? `${mix[0]}anull[aout]` : `${mix.join("")}amix=inputs=${mix.length}:duration=longest:normalize=0[aout]`);
  ff.push("-filter_complex", filters.join(";"), "-map", "0:v", "-map", "[aout]");
}
ff.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-crf", "18", "-r", String(fps), "-movflags", "+faststart");
if (mix.length) ff.push("-c:a", "aac", "-b:a", "192k", "-shortest");
ff.push(outMp4);
const r = spawnSync(ffmpeg, ff, { stdio: ["ignore", "ignore", "pipe"] });
if (r.status !== 0) { console.error(r.stderr.toString().split("\n").slice(-15).join("\n")); process.exit(1); }
rmSync(framesDir, { recursive: true });
console.log("wrote", outMp4, mix.length ? `(audio: ${[audioPath && "voice", music && "music", sfx.length && `${sfx.length} sfx`].filter(Boolean).join(", ")})` : "(silent)");
