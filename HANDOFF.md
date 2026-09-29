# Handoff to the local office (29 September 2026)

The cloud session that built this office is being retired. Everything it produced is in this repository; nothing lives only in the cloud. This file is the state of play and the prompt to paste into a local Claude Code session.

## Move steps for the owner (Windows)

1. Mirror the repo: run `tools\sync-to-local.ps1` (clones to D:\hqrs1-science-office, or pulls if it exists).
2. Install the toolchain: in PowerShell, from D:\hqrs1-science-office, run `powershell -ExecutionPolicy Bypass -File tools\setup-local.ps1`. It installs Node 22, Python 3.11, Git, Playwright Chromium, Piper, a static ffmpeg, and runs three smoke tests (a carousel, a 5 s voice line, a 3D plate).
3. Open Claude Code in that folder (`claude` in the terminal, or the desktop app pointed at the folder). CLAUDE.md loads automatically.
4. Paste the resume prompt at the bottom of this file.
5. Connectors: the local session can use the same connectors (vidIQ, Descript, Google Drive, Gmail, Canva, and others) if they are enabled for the local Claude app. Connect @hqrs_1 in the vidIQ app to unlock publishing and owner insights.

## Voice clone (first job locally)

Samples: E:\01 HQRS (owner's voice). The local machine can reach Hugging Face, which the cloud could not, so a free clone is possible there:
- Prep: convert samples to 24 kHz mono WAV, trim silence, normalise to -3 dBFS, cut a clean 30 to 90 s reference with no music or room noise.
- Engine, in order of preference: F5-TTS (pip `f5-tts`, works on CPU, faster with a GPU), Chatterbox (pip `chatterbox-tts`), Coqui XTTS v2 (`coqui-tts`). Any of these is zero-shot: reference WAV plus script text in, narration out.
- Alternative with no local model: create the clone in the vidIQ app (voiceover, clone voice) and generate with `vidiq_voiceover_generate`; about 14 credits per 45 s script from the 150 monthly credits.
- After cloning: re-narrate the Navier-Stokes Reel first (its Piper track is the flattest), rebuild the words sidecar (Descript procedure in production/tools/descript-align.md, or the renderer's auto timing), re-render, and compare.

## Open items, in order

1. Voice clone as above, then re-narrate the Reels that use Piper (fire amoeba, youngest planet, two brains, quantum jump, Navier-Stokes).
2. Loop cards 2 and 3: loop-youngest-planet (protoplanetary-disk wide sequence) and loop-eclipse-gravity (eclipse-corona), to the spec in scripts/v2/loop-planet-backwards.json and the loop-card rules in STYLE_BIBLE.md. The first loop card is finished in production/out/loop-planet-backwards/.
3. Apply the revised hook lines from research/09-vidiq-outliers.md (section: current versus proposed hook lines) to each Reel's cover and caption line 1.
4. Re-light the quantum-jump Reel plates (resonator mount view is too dark even at exposure 3) or replace scenes 1, 5, 6, 8, 9 with brighter beam views.
5. Renderer fix: production/brand.css `.scrim` darkens only the top and bottom of the frame, so mechanism plates over bright imagery are unreadable. The three affected Reels use dimmed plate copies as a workaround; a proper fix is a flat scrim option in the renderer.
6. Descript alignment for every voiced Reel before publishing (only two brains is aligned so far).
7. Publishing: once @hqrs_1 is connected in vidIQ, publish from the calendar (calendar/30_day_calendar.md) and start the weekly analytics log (analytics/weekly_log.csv).
8. Google Drive mirror: the folder "hqrs1 science office" (publish/drive-mirror.md) holds captions and the index; drag the mp4 and slide PNG files in from the local clone.

## Budgets and accounts

- vidIQ: 74 of 150 credits left this month; renews 28 October.
- ElevenLabs: quota exhausted (about 159 credits); voice Bomani (3TTKYlYj1FFtGcSNKlJv) was the chosen paid voice.
- Descript: drive "Anjani Kumar S V B's Drive"; direct upload works via import_media plus a PUT of the file.

## Resume prompt (paste into the local Claude Code session)

You are the Director of the hqrs1 science office in this repository. Read CLAUDE.md, HANDOFF.md, OPERATING_MANUAL.md and strategy/STYLE_BIBLE.md. Confirm the toolchain with the smoke tests in tools/setup-local.ps1. Then work through the open items in HANDOFF.md in order, starting with the voice clone from the samples in E:\01 HQRS: analyse the samples, prepare a clean reference, set up a free cloning engine, produce a test narration of scripts/reel-ai-navier-stokes.json, and send it to me for an ear check before re-narrating anything else. Spawn one desk per item, review every contact sheet before committing, commit finished outputs to main, and report with paths and what remains weak. Free tools only, no em dashes, every on-screen number from a fact-check row.
