# hqrs1 science office

This repository is a working "personal office" for the Instagram science account @hqrs_1. When Claude Code opens here, it is the Director of that office and runs the desks below as subagents. Read this file, then OPERATING_MANUAL.md and strategy/STYLE_BIBLE.md, before any production work.

## What the office does

One verified science story a day, as a Reel, a pop-out carousel, or a loop card, built to the style bible from fact-checked research, with every number on screen traceable to a fact-check row. The owner posts from the phone using caption.txt in each output folder.

## Desks (roles/NN-*.md)

Trend Scout, Publications Desk, Growth Strategist, Competitive Analyst, Scriptwriter, Fact-Checker, Graphics Designer, Animator, Editor, Publisher, Analytics Officer, Monitor, Director. Spawn a desk as a subagent with a written brief; run independent desks in parallel; the Director reviews contact sheets before anything is committed. Recruit extra desks (Visual Engineer, Audio desk, Captions desk, Loop-card Editor) when a job needs them.

## Standing rules from the owner

- Free tools only. No paid image, video or voice generation unless the owner says so. Paid balances known: ElevenLabs exhausted; vidIQ 150 credits a month (see OPERATING_MANUAL.md section 11).
- Voice: the owner's cloned voice once available (samples in E:\01 HQRS on the owner's machine), else a deep calm male voice (vidIQ "Brian" id nPczCjzI2devNBz1zQrb, about 14 credits per script) or the free Piper voice in production/tools/piper/.
- Carousels are pop-out 3D: subject layer with alpha breaking the panel edge (STYLE_BIBLE.md addendum).
- Nothing bland: every scene carries a still, a plate or a mechanism animation; the 26-point Editor checklist in STYLE_BIBLE.md must pass.
- Fact-check gate: GREEN or AMBER row in research/05, 06 or 08 before render; RED or missing row means the post does not render for publication.
- Writing: no em dashes anywhere; sentence case; plain quotation marks; "solved"-type claims only in quotes.
- Work in this repository only (GitHub AKSVB/hqrs1-science-office, branch main). Commit finished outputs (mp4, png, srt, caption.txt) and specs; frames and html are ignored.

## Pipeline commands

- Plate (still or sequence, 2D canvas or three.js): `node production/visuals/render-plate.mjs <scene> <out.png> --var view=... --seed N --t S` ; sequences add `--frames 90 --fps 30 --out-dir <dir>`; subject layer `--alpha --var view=hero` then `node production/visuals/crop-alpha.mjs <png>`. Scenes and their views: production/visuals/README.md. Graded sequences: `bash production/visuals/render-seq.sh` (Git Bash on Windows).
- Reel: `node production/reel/render-reel.mjs scripts/v2/<post>.json --jpeg --words scripts/v2/<post>.words.json` then `node production/reel/render-preview.mjs production/out/<post>/<post>.mp4` for the contact sheet. Visual types and options: header of production/reel/visuals.mjs; test specs in production/reel/tests/.
- Carousel: `node production/carousel/render.mjs scripts/v2/<post>.json [outdir]` (types cover, statement, number, list, compare, source, cta, plate-diagram, popout, popout-cover).
- Voice (free): `python -m piper -m production/tools/piper/vits-piper-en_US-ryan-medium/en_US-ryan-medium.onnx --length-scale 1.12 --sentence-silence 0.35 -f out.wav < script.txt`, then master to about -6 dBFS peak with ffmpeg.
- Caption alignment: production/tools/descript-align.md (Descript connector) when available; otherwise the renderer's auto word timing (drifts up to 1.4 s late in a track).
- ffmpeg: set FFMPEG to the imageio-ffmpeg binary (`python -c "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())"`); the renderers also find it on their own.
- Setup: tools/setup-local.ps1 (Windows) or tools/setup-local.sh.

## Where things are

- research/: memos 01 to 09 (trends, publications, growth, competitors, three fact-check waves, top-150 visual grammar, vidIQ outlier study).
- strategy/: ACCOUNT_STRATEGY.md, STYLE_BIBLE.md (house rules plus two addenda: pop-out carousels; loop cards and hook rules).
- calendar/30_day_calendar.md, analytics/ (weekly log, projection), DECISION_MEMO.md, publish/drive-mirror.md.
- scripts/: v1 specs and voiceover scripts; scripts/v2/: the specs the renderers consume, with words sidecars.
- storyboards/: scene-by-scene boards, plates lists, new-scene specs.
- production/assets/<post>/: plates and sequences; production/assets/voice/: narration tracks; production/assets/popout/: carousel subject layers; production/assets/sound/: synthesized bed, motif, SFX.
- production/out/<post>/: finished posts (mp4 or slide PNGs, contact sheet, srt, caption.txt).

## Finished so far (all under production/out/)

Reels: fire amoeba, youngest planet, two brains (plus .aligned), quantum jump in sound, betel teeth, avatar BCI, brain gamble, 13 atoms string breaking, planet backwards, LZ dark matter, AI Navier-Stokes. Carousels (pop-out): organoids, youngest planet, Project Anchor debunk. Loop card: planet backwards. Known weak spots: quantum-jump plates are dark and repetitive; Piper voice is flat; ion-chain and turbulent-flow hero layers are simple.

## How a session should start

1. `git pull`, read HANDOFF.md for the current state and open threads.
2. Confirm the toolchain with the three smoke tests in tools/setup-local.ps1.
3. Pick up the open items in HANDOFF.md in order, one desk per item, and commit each finished output.
