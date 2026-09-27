#!/usr/bin/env node
// Contact sheet for Editor QC: 12 frames (4x3) at even intervals from a rendered Reel.
// Usage: node render-preview.mjs <reel.mp4> [--out sheet.png] [--cols 4] [--rows 3] [--width 270]
// Default output: production/out/<name>/contact-sheet.png (next to the MP4 when it already lives in production/out/<name>/).
import { existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const mp4 = args[0];
if (!mp4 || mp4.startsWith("--")) { console.error("usage: render-preview.mjs <reel.mp4> [--out sheet.png] [--cols 4] [--rows 3] [--width 270]"); process.exit(1); }
const opt = (f, d) => { const i = args.indexOf(f); return i > -1 ? args[i + 1] : d; };
const cols = +opt("--cols", 4), rows = +opt("--rows", 3), width = +opt("--width", 270);
const name = basename(mp4, ".mp4");
const outPng = resolve(opt("--out", basename(dirname(resolve(mp4))) === name ? resolve(dirname(resolve(mp4)), "contact-sheet.png") : resolve(here, "../out", name, "contact-sheet.png")));
mkdirSync(dirname(outPng), { recursive: true });

const STATIC = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2";
const ok = (c) => c && spawnSync(c, ["-hide_banner", "-version"]).status === 0;
const ffmpeg = [process.env.FFMPEG, "ffmpeg", (() => { const r = spawnSync("python3", ["-c", "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())"]); return r.status === 0 ? r.stdout.toString().trim() : null; })(), existsSync(STATIC) ? STATIC : null].find(ok);
if (!ffmpeg) throw new Error("no ffmpeg found (PATH, $FFMPEG, imageio-ffmpeg)");

// Duration and fps from ffmpeg's own stream info (ffprobe is often absent).
const info = spawnSync(ffmpeg, ["-hide_banner", "-i", resolve(mp4)]).stderr.toString();
const dm = info.match(/Duration: (\d+):(\d+):(\d+\.\d+)/), fm = info.match(/([\d.]+) fps/);
if (!dm) throw new Error("could not read duration of " + mp4);
const dur = (+dm[1]) * 3600 + (+dm[2]) * 60 + (+dm[3]), fps = fm ? +fm[1] : 30;
const total = Math.max(1, Math.round(dur * fps)), tiles = cols * rows;
const step = Math.max(1, Math.floor((total - 1) / (tiles - 1)));
const vf = `select=not(mod(n\\,${step})),scale=${width}:-2,tile=${cols}x${rows}:padding=6:margin=6:color=0x060913`;
const r = spawnSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-i", resolve(mp4), "-vf", vf, "-vsync", "vfr", "-frames:v", "1", outPng], { stdio: ["ignore", "inherit", "pipe"] });
if (r.status !== 0) { console.error(r.stderr.toString()); process.exit(1); }
console.log(`wrote ${outPng} (${tiles} frames, every ${step} of ${total}, ${dur.toFixed(2)} s @ ${fps} fps; tile i is t = i*${(step / fps).toFixed(2)} s)`);
