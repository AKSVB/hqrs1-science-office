#!/usr/bin/env node
// Reel renderer v2: JSON timeline -> 1080x1920 H.264 MP4 (+ SRT captions, words JSON; contact sheet via render-preview.mjs).
// Every frame is a pure function of t through window.seek(t), so output is reproducible.
//
// Usage: node render-reel.mjs <spec.json> [out.mp4] [--fps 30] [--jpeg]
//          [--audio voice.mp3] [--fit-audio]            voice track; scenes are stretched to the voice length (+ spec.audio_tail), end card keeps its length
//          [--music bed.mp3] [--sfx hit.mp3@1.2,whoosh.mp3@8]  music at -18 dB with a 1.5 s fade-out, SFX at -8 dB placed with adelay
//          [--auto-words]                                 word-by-word captions spread over the voice from spec.voiceover_script
//          [--words words.json]                           explicit [{word,start,end}] (else spec.words, else <spec>.words.json)
//          [--html-only]                                  write the page and stop (QC: open it and call window.seek(t))
//
// Spec fields: handle, duration, style ("bible" turns on the style-bible layout, see below), audio, fit_audio (true: fit the scenes
//   to spec.audio as --audio does), audio_start, audio_end (trim the voice track, seconds), audio_tail (default 0.6, 0 in bible mode),
//   music, sfx: [{path, at, db, scene}] or ["path@sec"] (with `scene`, `at` is local to that scene and follows it when fitted), end, scenes.
//   Paths resolve relative to the spec first, then to the repository root, so "production/assets/..." works from any spec folder.
// Scene fields: start, end, kicker, caption, captions, visual, layout, plus v2:
//   bg: { image, move: push-in|push-out|pan-left|pan-right|tilt-up|tilt-down|drift, from, to, amount (pan/tilt travel as a fraction of the frame),
//         focus:[x,y], scrim:0-1, parallax:true (a second copy masked to the subject, moving at 1.5x) }
//       or bg: { sequence: "dir-of-frames", fps: 30, ...same move fields }: an animated plate from production/visuals/render-plate.mjs
//         (--frames N --out-dir dir); the frame shown is indexed by the scene's local time and loops; the Ken Burns move applies on top.
//   transition: cut (default) | fade | wipe-up (0.40 s upward wipe with a 2 px cyan edge)
//   caption + label_in / label_out (local seconds; 6-frame rise and fade), or captions: [{ text, in, out }]
//   big: { text | count:{from,to,decimals}, at, hold, exit, flip:{ at, text, size } }   (kinetic number: slam-in or count-up + 4 px shake, one unit flip)
// Visual types: text | counter | bars | dots | grid | scale | list, and the mechanism plates from visuals.mjs:
//   staircase | lineage | orbit | thermometer | flash | timeline | compare | ruler-log | telegraph | trace | methyl-clock
// End card: { seconds (default 2.5, or 1.5 when short:true), source, note, bg (same shape as a scene bg), kicker, title, body }.
//   With `source` the card is the style-bible card: the still held under a .source-line and the handle, nothing else.
// Style-bible layout (style: "bible"): labels bottom-anchored at y 1150 (x 72 to 1008), mechanism plates centred in y 480 to 1150,
//   big numbers centred in y 560 to 1150, the handle as .handle-reel, the hook line rising at 0.1 s, plates fading in over 0.6 s.
import { createRequire } from "node:module";
import { readFileSync, mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { buildVisual, isOverlay, visualCss, visualRuntime, esc, attr } from "./visuals.mjs";
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require("playwright"); } catch { return require("/opt/node22/lib/node_modules/playwright"); } })();

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const args = process.argv.slice(2);
const specPath = args[0];
if (!specPath || specPath.startsWith("--")) { console.error("usage: render-reel.mjs <spec.json> [out.mp4] [--fps 30] [--jpeg] [--audio voice.mp3] [--music bed.mp3] [--sfx file@sec,...] [--auto-words] [--words words.json]"); process.exit(1); }
const opt = (flag) => { const i = args.indexOf(flag); return i > -1 ? args[i + 1] : null; };
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const specDir = dirname(resolve(specPath));
const asset = (p) => { const a = resolve(specDir, p); if (existsSync(a)) return a; const b = resolve(root, p); return existsSync(b) ? b : a; };
const bible = spec.style === "bible";
const fps = opt("--fps") ? Number(opt("--fps")) : 30;
const useJpeg = args.includes("--jpeg");
const audioIdx = args.indexOf("--audio");
const fitAudio = args.includes("--fit-audio") || audioIdx > -1 || spec.fit_audio === true;
const musicPath = opt("--music") ? resolve(opt("--music")) : (spec.music ? asset(spec.music) : null);
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

// Audio: from --audio <file> or spec.audio (relative to the spec or the repo root). audio_start / audio_end trim the track
// (a storyboard's "cut the last sentence"). With --fit-audio (implied by --audio and by spec.audio) every scene is stretched or
// squeezed so the scenes end when the voice ends, plus a short tail; the end card keeps its length.
const audioPath = audioIdx > -1 ? resolve(args[audioIdx + 1]) : (spec.audio ? asset(spec.audio) : null);
if (audioPath && !existsSync(audioPath)) throw new Error("voice track not found: " + audioPath);
let duration = spec.duration ?? Math.max(...spec.scenes.map(s => s.end));
const endSeconds = spec.end ? (spec.end.seconds ?? (spec.end.short ? 1.5 : 2.5)) : 0;
const audioStart = spec.audio_start ?? 0;
const audioFull = audioPath ? mediaDuration(audioPath) : NaN;
const audioEnd = Number.isFinite(spec.audio_end) ? Math.min(spec.audio_end, audioFull) : audioFull;
const audioDur = audioPath ? audioEnd - audioStart : NaN;
const audioTail = spec.audio_tail ?? (bible ? 0 : 0.6);
// Local-time cues (big.at, keys[].t, markers[].at, jumps[].t, timer.at, ...) are authored against the unscaled scene; scale them too.
const TIME_KEYS = new Set(["t", "at", "t0", "dur", "exit", "hold", "appear", "draw", "in", "out", "growStart", "growDur", "enter"]);
const scaleTimes = (o, f, parent) => {
  if (Array.isArray(o)) { o.forEach(x => scaleTimes(x, f, parent)); return; }
  if (!o || typeof o !== "object") return;
  for (const k of Object.keys(o)) {
    if (k === "bg" || k === "start" || k === "end") continue;
    if (TIME_KEYS.has(k) && Number.isFinite(o[k])) o[k] = +(o[k] * f).toFixed(3);
    else if (typeof o[k] === "object") scaleTimes(o[k], f, k);
  }
};
let sceneFactor = 1;
if (fitAudio && audioPath) {
  const scenesEnd = Math.max(...spec.scenes.map(s => s.end));
  const factor = sceneFactor = (audioDur + audioTail) / scenesEnd;
  for (const sc of spec.scenes) {
    sc.start = +(sc.start * factor).toFixed(3); sc.end = +(sc.end * factor).toFixed(3);
    scaleTimes(sc, factor);
  }
  duration = +(scenesEnd * factor + endSeconds).toFixed(3);
  console.log(`fit to audio: ${audioDur.toFixed(2)} s voice${audioStart || audioEnd !== audioFull ? ` (trimmed ${audioStart}-${audioEnd.toFixed(2)} of ${audioFull.toFixed(2)})` : ""}, scenes scaled x${factor.toFixed(3)}, total ${duration} s`);
}
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, '<span class="hl">$1</span>');

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

// Backgrounds: resolve image paths relative to the spec (then the repo root); a missing file falls back to the brand gradient with a warning.
const prepBg = (sc) => {
  if (!sc.bg) return;
  if (typeof sc.bg === "string") sc.bg = { image: sc.bg };
  if (sc.bg.sequence) {
    // Animated plate: a directory of frames (f00000.png ...) rendered by production/visuals/render-plate.mjs.
    const dir = asset(sc.bg.sequence);
    const files = existsSync(dir) ? readdirSync(dir).filter(f => /\.(png|jpe?g)$/i.test(f)).sort() : [];
    if (!files.length) { warn(`background sequence has no frames, using gradient: ${dir}`); sc.bg.src = null; return; }
    sc.bg.frames = files.map(f => pathToFileURL(resolve(dir, f)).href);
    sc.bg.fps = sc.bg.fps ?? 30;
    sc.bg.src = sc.bg.frames[0];
    return;
  }
  if (sc.bg.image) {
    const p = asset(sc.bg.image);
    if (existsSync(p)) sc.bg.src = pathToFileURL(p).href;
    else { warn(`background image not found, using gradient: ${p}`); sc.bg.src = null; }
  }
};
spec.scenes.forEach(prepBg);
if (spec.end) prepBg(spec.end);

const bgHtml = (bg) => {
  if (!bg?.src) return "";
  const focus = Array.isArray(bg.focus) ? bg.focus : [0.5, 0.5];
  const move = bg.move || "push-in";
  const defFrom = move === "push-out" ? 1.15 : move === "drift" ? 1.06 : 1.0, defTo = move === "push-out" ? 1.0 : move === "drift" ? 1.14 : 1.15;
  const img = (cls) => `<img class="${cls}" src="${bg.src}" style="transform-origin:${focus[0] * 100}% ${focus[1] * 100}%${cls === "par" ? `;-webkit-mask-image:radial-gradient(circle at ${focus[0] * 100}% ${focus[1] * 100}%, #000 0, #000 16%, transparent 44%);mask-image:radial-gradient(circle at ${focus[0] * 100}% ${focus[1] * 100}%, #000 0, #000 16%, transparent 44%)` : ""}">`;
  const seq = bg.frames ? ` data-frames="${attr(bg.frames)}" data-seqfps="${bg.fps}"` : "";
  return `<div class="bg" data-move="${esc(move)}" data-from="${bg.from ?? defFrom}" data-to="${bg.to ?? defTo}" data-amount="${bg.amount ?? ""}" data-fx="${focus[0]}" data-fy="${focus[1]}"${seq}>${img("base")}${bg.parallax ? img("par") : ""}</div>`;
};
const wordCount = (s) => String(s).replace(/[*_]/g, "").trim().split(/\s+/).filter(Boolean).length;

// Scene markup. Each scene is a full-frame section (background + scrim + content in the safe area) toggled by seek(t).
const sceneHtml = (s, i) => {
  const v = s.visual || { type: "text" };
  let vis = "";
  if (v.type === "counter") vis = `<div class="v-counter"><div class="num" data-from="${v.from ?? 0}" data-to="${v.to}" data-decimals="${v.decimals ?? 0}" data-suffix="${esc(v.suffix ?? "")}" data-prefix="${esc(v.prefix ?? "")}"></div>${v.label ? `<div class="v-label">${rich(v.label)}</div>` : ""}</div>`;
  if (v.type === "bars") vis = `<div class="v-bars">${v.items.map(b => `<div class="v-bar"><div class="v-bar-h"><span>${rich(b.label)}</span><span>${rich(b.value)}</span></div><div class="bar"><i data-pct="${b.pct}"></i></div></div>`).join("")}</div>`;
  if (v.type === "dots" || v.type === "grid") vis = `<div class="v-dots" data-n="${v.n ?? 100}" data-lit="${v.lit ?? 1}" data-cols="${v.cols ?? 10}" style="--dot:${esc(v.colour || v.color || "var(--accent-2)")}"></div>${v.label ? `<div class="v-label">${rich(v.label)}</div>` : ""}`;
  if (v.type === "scale") vis = `<div class="v-scale"><div class="v-circle a" data-r="${v.a.r}"><span>${rich(v.a.label)}</span></div><div class="v-circle b" data-r="${v.b.r}"><span>${rich(v.b.label)}</span></div></div>`;
  if (v.type === "list") vis = `<div class="v-list">${v.items.map((t, k) => `<div class="v-item" data-k="${k}"><div class="n">${k + 1}</div><div class="t">${rich(t)}</div></div>`).join("")}</div>`;
  const overlay = isOverlay(v) ? buildVisual(v) : "";
  if (!overlay) vis = vis || buildVisual(v);
  const bg = s.bg || {};
  const scrim = bg.scrim ?? (bg.src ? 0.55 : 0);
  const caps = (s.captions || (s.caption ? [{ text: s.caption, in: s.label_in, out: s.label_out }] : [])).map((c, k) => {
    const cin = c.in ?? (bible && i === 0 && k === 0 ? 0.1 : 0);
    return `<div class="caption${bible && wordCount(c.text) <= 4 ? " short" : ""}" data-in="${cin}" data-out="${c.out ?? ""}">${rich(c.text)}</div>`;
  }).join("");
  const B = s.big;
  const bigText = (t) => { const m = String(t).match(/^([<>~])\s*(.*)$/); return m ? `<i class="sm">${esc(m[1])}</i> ${rich(m[2])}` : rich(t); };
  const big = B ? `<div class="big" data-at="${B.at ?? 0}" data-hold="${B.hold ?? 1.2}" data-exit="${B.exit ?? ""}" data-count="${B.count ? attr(B.count) : ""}" data-dur="${B.dur ?? 1.0}" data-flip="${B.flip ? attr({ at: B.flip.at, size: B.flip.size ?? null }) : ""}"><span class="a">${B.count ? "" : bigText(B.text)}</span>${B.flip ? `<span class="b" style="${B.flip.size ? `font-size:${B.flip.size}px` : ""}">${bigText(B.flip.text)}</span>` : ""}</div>` : "";
  const tr = s.transition || spec.transition || "cut";
  return `<section class="scene" data-i="${i}" data-start="${s.start}" data-end="${s.end}" data-tr="${esc(tr)}" data-layout="${s.layout || (vis ? "split" : "center")}">
    ${bgHtml(bg)}
    ${scrim > 0 ? `<div class="scrim" style="opacity:${scrim}"></div>` : ""}
    ${overlay}
    <div class="safe"><div class="content">
      ${s.kicker ? `<div class="kicker">${rich(s.kicker)}</div>` : ""}
      ${caps}
      ${vis}
    </div>${big}</div>
    ${tr === "wipe-up" ? `<div class="wipe-edge"></div>` : ""}
  </section>`;
};

const bandHtml = chunks.map((c, ci) => `<div class="cap-line" data-c="${ci}" data-start="${c[0].start}" data-end="${c[c.length - 1].end}">${c.map(w => `<span class="w" data-s="${w.start}" data-e="${w.end}">${esc(w.word)}</span>`).join(" ")}</div>`).join("");
const E = spec.end || {};
const endcardHtml = E.source
  ? `<div class="endcard still">${bgHtml(E.bg)}<div class="scrim" style="opacity:${E.bg?.scrim ?? 0.7}"></div><div class="source-line">${rich(E.source)}${E.note ? `<span class="note">${rich(E.note)}</span>` : ""}</div></div>`
  : `<div class="endcard"><div class="kicker">${esc(E.kicker || "Follow for more")}</div><div class="h1" style="text-align:center">${rich(E.title || "One verified science story a day")}</div><div class="body" style="text-align:center">${rich(E.body || "Source in the caption.")}</div><div class="pill" style="margin-top:20px">${esc(spec.handle || "@hqrs_1")}</div></div>`;

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
  .bg img.par { position:absolute; inset:0; }
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
  ${visualCss}
  body.karaoke .vis { max-height:540px; }
  body.karaoke .vis.overlay { max-height:none; }
  .big { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; }
  .big span { position:absolute; font: 700 200px/1 var(--font-display); letter-spacing:-0.04em; color: var(--accent-2); text-align:center; text-shadow: 0 10px 60px rgba(0,0,0,0.75), 0 0 40px rgba(255,176,32,0.35); white-space:nowrap; }
  .big span .sm { font-style:normal; font-size:60%; vertical-align:8%; }
  .orbit { position:absolute; inset:0; pointer-events:none; }
  .orbit i { position:absolute; width:6px; height:6px; border-radius:50%; background: var(--accent); opacity:0.35; }
  .handle-reel { text-shadow: 0 2px 12px rgba(0,0,0,0.7); z-index: 5; }
  .endcard { position:absolute; inset:0; display:none; flex-direction:column; align-items:center; justify-content:center; gap:30px; padding: 0 90px; background: var(--bg); opacity:0; }
  .endcard.on { display:flex; }
  .endcard.still { display:none; padding:0; background: var(--bg); }
  .endcard.still.on { display:block; }
  .endcard.still .source-line { text-shadow: 0 2px 12px rgba(0,0,0,0.8); }
  .wipe-edge { display:none; z-index: 4; }
  .cap-line { display:none; }
  .cap-line.on { display:block; }
  /* Style-bible layout: labels bottom-anchored at y 1150, plates in y 480-1150, big numbers in y 560-1150. */
  body.bible .scene .safe { bottom: 760px; }
  body.bible .scene .content { top: 220px; bottom: 10px; justify-content:center; gap:0; }
  body.bible .scene .content .caption { position:absolute; left:0; right:0; bottom:0; font-size:64px; opacity:0; }
  body.bible .scene .content .caption.short { font-size:76px; }
  body.bible .big { top: 300px; bottom: 10px; }
  body.bible .cap-band { z-index: 3; }
</style></head><body class="${karaoke ? "karaoke" : ""}${bible ? " bible" : ""}">
<div class="frame"><div class="stage">
  <div class="orbit">${Array.from({ length: 60 }, (_, k) => `<i data-k="${k}"></i>`).join("")}</div>
  ${spec.scenes.map(sceneHtml).join("")}
  ${endcardHtml}
  <div class="progress"><i id="prog"></i></div>
  <div class="handle-reel">${esc(spec.handle || "@hqrs_1")}</div>
  ${karaoke ? `<div class="cap-band">${bandHtml}</div>` : ""}
</div></div>
<script>(${visualRuntime.toString()})();</script>
<script>
  const DUR = ${duration};
  const ENDCARD = ${endSeconds};
  const BIBLE = ${bible};
  const TR = 0.4; // wipe length (12 frames at 30 fps)
  const FADE = BIBLE ? 0.3 : 0.4; // scene fade / end-card fade
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
  // With data-amount (a fraction of the frame) a pan or tilt travels exactly that far at the smallest scale that hides the edges.
  const kenBurns = (bg, q) => {
    const move = bg.dataset.move, from = +bg.dataset.from, to = +bg.dataset.to, fx = +bg.dataset.fx, fy = +bg.dataset.fy, amt = bg.dataset.amount === "" ? null : +bg.dataset.amount;
    let s = lerp(from, to, q), tx = 0, ty = 0;
    const rangeX = (s) => [-(1 - fx) * W * (s - 1), fx * W * (s - 1)], rangeY = (s) => [-(1 - fy) * H * (s - 1), fy * H * (s - 1)];
    if (move === "pan-left" || move === "pan-right" || move === "tilt-up" || move === "tilt-down") {
      if (amt !== null) {
        const f = (move === "pan-left" || move === "pan-right") ? fx : fy;
        s = Math.max(from, to, 1 + amt / (2 * Math.max(0.05, Math.min(f, 1 - f))) + 0.005);
        const dx = amt * W / 2, dy = amt * H / 2;
        if (move === "pan-left") tx = lerp(dx, -dx, q);
        if (move === "pan-right") tx = lerp(-dx, dx, q);
        if (move === "tilt-up") ty = lerp(-dy, dy, q);
        if (move === "tilt-down") ty = lerp(dy, -dy, q);
      } else {
        s = Math.max(from, to, 1.12);
        const [xa, xb] = rangeX(s), [ya, yb] = rangeY(s);
        if (move === "pan-left") tx = lerp(xa, xb, q);
        if (move === "pan-right") tx = lerp(xb, xa, q);
        if (move === "tilt-up") ty = lerp(ya, yb, q);
        if (move === "tilt-down") ty = lerp(yb, ya, q);
      }
    } else if (move === "drift") {
      const [xa, xb] = rangeX(s), [ya, yb] = rangeY(s);
      tx = lerp(0.45 * xa, 0.45 * xb, q); ty = lerp(0.3 * yb, 0.3 * ya, q);
    }
    return { s, tx, ty };
  };
  // Frame sequences: the frame is indexed by local time (looping); decoded once at load so seek stays synchronous.
  const seqFrames = new Map();
  window.preloadSequences = () => Promise.all([...document.querySelectorAll(".bg[data-frames]")].map(bg => {
    const urls = JSON.parse(bg.dataset.frames); const imgs = urls.map(u => { const im = new Image(); im.src = u; return im; }); seqFrames.set(bg, imgs);
    return Promise.all(imgs.map(im => im.decode().catch(() => null)));
  }));
  const applyBg = (bg, q, local = 0) => {
    if (bg.dataset.frames) {
      const imgs = seqFrames.get(bg) || (seqFrames.set(bg, JSON.parse(bg.dataset.frames).map(u => { const im = new Image(); im.src = u; return im; })), seqFrames.get(bg));
      const n = imgs.length, idx = ((Math.floor(Math.max(0, local) * +bg.dataset.seqfps) % n) + n) % n, src = imgs[idx].src;
      bg.querySelectorAll("img").forEach(im => { if (im.src !== src) im.src = src; });
    }
    const kb = kenBurns(bg, q);
    bg.querySelector(".base").style.transform = "translate(" + kb.tx.toFixed(2) + "px," + kb.ty.toFixed(2) + "px) scale(" + kb.s.toFixed(4) + ")";
    const par = bg.querySelector(".par"); // parallax plate: the subject moves at 1.5x the base drift
    if (par) par.style.transform = "translate(" + (1.5 * kb.tx).toFixed(2) + "px," + (1.5 * kb.ty).toFixed(2) + "px) scale(" + (1 + 1.5 * (kb.s - 1)).toFixed(4) + ")";
    return kb;
  };
  const ec = document.querySelector(".endcard");
  const ecBg = ec.querySelector(".bg");

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
      // Incoming transition on the whole layer. The wipe carries a 2 px cyan edge (the "section cut").
      const tr = sc.dataset.tr, q0 = clamp(local / (tr === "fade" ? FADE : TR), 0, 1);
      sc.style.opacity = tr === "fade" && idx > 0 ? q0 : 1;
      const wiping = tr === "wipe-up" && idx > 0 && q0 < 1;
      sc.style.clipPath = wiping ? "inset(" + (100 * (1 - easeOut(q0))).toFixed(2) + "% 0 0 0)" : "none";
      const edge = sc.querySelector(".wipe-edge");
      if (edge) { edge.style.display = wiping ? "block" : "none"; edge.style.top = (H * (1 - easeOut(q0))).toFixed(1) + "px"; }
      // Background Ken Burns, progress linear over the scene.
      const bg = sc.querySelector(".bg");
      if (bg) {
        const q = clamp(local / len, 0, 1), kb = applyBg(bg, q, local);
        parX = -3 * (kb.tx === 0 ? 0 : Math.sign(kb.tx) * Math.min(1, Math.abs(kb.tx) / 60));
        parY = (kb.tx === 0 && kb.ty === 0) ? -3 * q : -3 * (kb.ty === 0 ? 0 : Math.sign(kb.ty) * Math.min(1, Math.abs(kb.ty) / 60));
      }
      // Content entrance (fade + rise), no fade-out: scenes cut. In bible mode each label has its own 6-frame rise and fade.
      const content = sc.querySelector(".content");
      const fadeIn = BIBLE || idx === 0 ? 1 : clamp(local / 0.35, 0, 1); // scene 0 is on from frame 0 so the hook reads in the cover frame
      let contentOpacity = fadeIn;
      content.style.transform = BIBLE ? "none" : "translateY(" + (24 * (1 - easeOut(fadeIn))) + "px)";
      let labelUp = 0;
      sc.querySelectorAll(".content .caption").forEach(c => {
        if (!BIBLE) return;
        const cin = +c.dataset.in, cout = c.dataset.out === "" ? null : +c.dataset.out;
        const a = easeOut(clamp((local - cin) / 0.2, 0, 1)), b = cout === null ? 1 : clamp((cout - local) / 0.2, 0, 1);
        const o = local >= cin ? a * b : 0;
        c.style.opacity = o; c.style.transform = "translateY(" + (24 * (1 - a)).toFixed(1) + "px)"; labelUp = Math.max(labelUp, o);
      });
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
      // Mechanism plates (visuals.mjs): one pure function of local time per plate.
      sc.querySelectorAll(".vis").forEach(v => window.updateVisual(v, local, len));

      // Kinetic number: slam in (or count up) with a 4 px shake, hold, one unit flip (6-frame vertical roll), then a 6-frame fade.
      const big = sc.querySelector(".big");
      if (big) {
        const at = +big.dataset.at, hold = +big.dataset.hold, exit = big.dataset.exit === "" ? at + hold + 0.25 : +big.dataset.exit, q = local - at;
        const count = big.dataset.count ? JSON.parse(big.dataset.count) : null, dur = +big.dataset.dur;
        const flip = big.dataset.flip ? JSON.parse(big.dataset.flip) : null;
        if (q < 0 || local > exit + 0.2) big.style.opacity = 0;
        else {
          const land = 0.18;
          const a = big.querySelector(".a"), b = big.querySelector(".b");
          if (count) { const cq = easeOut(clamp(q / dur, 0, 1)); a.textContent = num(count.from + (count.to - count.from) * cq, count.decimals ?? 0) + (count.suffix || ""); }
          const scl = count ? 1 : q < land ? lerp(1.6, 0.94, easeOut(q / land)) : q < land + 0.12 ? lerp(0.94, 1.0, easeInOut((q - land) / 0.12)) : 1.0;
          big.style.opacity = Math.min(clamp(q / 0.08, 0, 1), clamp((exit + 0.2 - local) / 0.2, 0, 1));
          const fq = flip ? clamp((local - flip.at) / 0.2, 0, 1) : 0;
          a.style.fontSize = Math.min(200, Math.floor(1700 / Math.max(a.textContent.length, 1))) + "px";
          a.style.transform = "scale(" + scl.toFixed(4) + ") translateY(" + (-0.5 * fq * 200).toFixed(1) + "px)"; a.style.opacity = 1 - fq;
          if (b) { b.style.transform = "translateY(" + (0.5 * (1 - fq) * 200).toFixed(1) + "px)"; b.style.opacity = fq; if (!flip.size) b.style.fontSize = Math.min(200, Math.floor(1700 / Math.max(b.textContent.length, 1))) + "px"; }
          const sq = q - land;
          if (!count && sq >= 0 && sq < 0.15) { const f = Math.floor(sq * 120); shakeX = 4 * (rnd(f * 2 + idx * 97) * 2 - 1) * (1 - sq / 0.15); shakeY = 4 * (rnd(f * 2 + 1 + idx * 97) * 2 - 1) * (1 - sq / 0.15); }
          if (!BIBLE) contentOpacity = fadeIn * (1 - 0.85 * Math.min(clamp(q / 0.15, 0, 1), clamp((exit + 0.2 - local) / 0.25, 0, 1)));
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
    // Word-by-word caption band: current chunk shown, current word amber and 1.08x, past white, future dimmed. Empty on the end card.
    if (capLines.length) {
      let cur = null;
      if (!ecOn) for (const l of capLines) { const s = +l.dataset.start, e = +l.dataset.end; if (t >= s - 0.05 && t < e + 0.35) { cur = l; break; } }
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
    ec.classList.toggle("on", ecOn);
    if (ecOn) {
      ec.style.opacity = clamp((t - (DUR - ENDCARD)) / FADE, 0, 1);
      if (ecBg) applyBg(ecBg, clamp((t - (DUR - ENDCARD)) / ENDCARD, 0, 1), t - (DUR - ENDCARD)); // the payoff still keeps its base-plate move
    }
  };
</script></body></html>`;

const htmlFile = resolve(outdir, `${name}.html`);
writeFileSync(htmlFile, html);
if (args.includes("--html-only")) { rmSync(framesDir, { recursive: true }); console.log("wrote", htmlFile, "(--html-only: no frames, no mux; open it and call window.seek(t))"); process.exit(0); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => { console.error("page error:", e.message); });
await page.goto(pathToFileURL(htmlFile).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => null))));
await page.evaluate(() => window.preloadSequences ? window.preloadSequences() : null);
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
const plainCaption = (s) => (s.captions ? s.captions.map(c => c.text).join(" ") : String(s.caption ?? "")).replace(/\*/g, "");
const srt = karaoke
  ? chunks.map((c, i) => `${i + 1}\n${srtTime(c[0].start)} --> ${srtTime(c[c.length - 1].end)}\n${c.map(w => w.word).join(" ")}\n`).join("\n")
  : spec.scenes.map((s, i) => `${i + 1}\n${srtTime(s.start)} --> ${srtTime(s.end)}\n${plainCaption(s)}\n`).join("\n");
writeFileSync(resolve(outdir, `${name}.srt`), srt);
if (words) writeFileSync(resolve(outdir, `${name}.words.json`), JSON.stringify(words, null, 1));
if (spec.voiceover_script) writeFileSync(resolve(outdir, `${name}-voiceover.txt`), spec.voiceover_script.trim() + "\n");
if (spec.caption) writeFileSync(resolve(outdir, "caption.txt"), spec.caption.trim() + "\n");

// Mux. Voice 0 dB; music -18 dB (fixed duck) with a 1.5 s fade-out at the end, looped if short; SFX -8 dB (or their own db) placed with adelay.
const sfx = (sfxArg ? sfxArg.split(",") : (spec.sfx || [])).map(s => {
  let pth, at, db = -8;
  if (typeof s === "string") { const m = s.trim().match(/^(.*)@([\d.]+)$/); if (!m) { warn(`sfx entry needs path@seconds, skipping: ${s}`); return null; } pth = m[1]; at = +m[2]; }
  else {
    pth = s.path; at = +s.at; if (Number.isFinite(s.db)) db = s.db;
    // Scene-relative cue: { scene: i, at: local seconds }. It follows the scene when the timeline is fitted to the voice.
    if (Number.isInteger(s.scene) && spec.scenes[s.scene]) at = +(spec.scenes[s.scene].start + at * sceneFactor).toFixed(3);
    else if (s.scene === "end") at = +(duration - endSeconds + at).toFixed(3); // relative to the end card
  }
  if (!pth || !Number.isFinite(at)) { warn(`sfx entry needs path and at, skipping: ${JSON.stringify(s)}`); return null; }
  const p = sfxArg ? resolve(process.cwd(), pth) : asset(pth); if (!existsSync(p)) { warn(`sfx file not found, skipping: ${p}`); return null; }
  return { path: p, at, db };
}).filter(Boolean);
if (musicPath && !existsSync(musicPath)) warn(`music file not found, skipping: ${musicPath}`);
const music = musicPath && existsSync(musicPath) ? musicPath : null;
const ff = ["-y", "-framerate", String(fps), "-i", resolve(framesDir, `f%05d.${ext}`)];
const filters = [], mix = []; let ai = 1;
if (audioPath) { ff.push("-i", audioPath); filters.push(`[${ai}:a]aresample=48000,atrim=${audioStart}:${audioEnd.toFixed(3)},asetpts=PTS-STARTPTS,volume=0dB,apad,atrim=0:${duration}[va]`); mix.push("[va]"); ai++; }
if (music) { ff.push("-stream_loop", "-1", "-i", music); const db = audioPath ? -18 : -10; filters.push(`[${ai}:a]aresample=48000,volume=${db}dB,atrim=0:${duration},afade=t=out:st=${Math.max(0, duration - 1.5).toFixed(3)}:d=1.5[ma]`); mix.push("[ma]"); ai++; }
sfx.forEach((s, k) => { ff.push("-i", s.path); filters.push(`[${ai}:a]aresample=48000,volume=${s.db}dB,adelay=${Math.round(s.at * 1000)}:all=1,apad,atrim=0:${duration}[s${k}]`); mix.push(`[s${k}]`); ai++; });
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
