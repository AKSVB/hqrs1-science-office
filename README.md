# hqrs_1 content office

A working office for the Instagram science account @hqrs_1. Thirteen roles, one pipeline, one goal: publish one verified science story a day in a repeatable format, measure what moves non-follower reach, and scale what works.

Everything here is runnable. Research memos are filed under `research/`, scripts as JSON specs under `scripts/`, and the renderers under `production/` turn a spec into Instagram-ready PNG carousels (1080x1350) or H.264 Reels (1080x1920) with burned-in captions, an SRT file and a voiceover script.

## Layout

```
.
  README.md                 this file
  OPERATING_MANUAL.md       roles, cadence, gates, KPIs, decision rules
  DECISION_MEMO.md          the Director's calls for the first 30 days
  roles/                    standing brief for each desk (re-run weekly)
  research/                 dated memos from the research desks
  strategy/                 account strategy, positioning, bio, formats
  calendar/                 30-day content calendar
  scripts/                  JSON specs, one per post, ready to render
  analytics/                weekly Insights log template + projection tool
  production/
    brand.css               design tokens and layout classes (single source of truth)
    fonts/                  Inter and Space Grotesk, local woff2
    carousel/render.mjs     spec.json -> slide-01.png ... + caption.txt
    reel/render-reel.mjs    spec.json -> name.mp4 + name.srt + voiceover.txt + caption.txt
    out/                    rendered assets (PNG, MP4, SRT, captions are committed; frames are not)
```

## Render something

```bash
# needs node 22+, playwright (global install is fine), and a full ffmpeg
pip install imageio-ffmpeg           # one-time, provides a static ffmpeg with libx264
cd production/carousel && node render.mjs ../../scripts/carousel-organoids-5-years.json
cd production/reel     && node render-reel.mjs ../../scripts/reel-two-brains.json --jpeg
```

Output lands in `production/out/<spec-name>/`. Upload the PNGs as a carousel, or the MP4 as a Reel. Paste `caption.txt`.

Voiceover: every Reel spec carries a `voiceover_script`. The office generates the audio with ElevenLabs (voice "Bomani - Nightfall Narrator" (deep, calm male; owner decision 2026-09-27; a clone of the owner's voice replaces it once a sample is supplied), model eleven_multilingual_v2, one take, about 500 to 750 credits per Reel; the account allows two generations at a time), saves it as `production/out/<name>/<name>-voice.mp3`, and renders with

```bash
node render-reel.mjs ../../scripts/<name>.json --jpeg --audio ../out/<name>/<name>-voice.mp3
```

`--audio` muxes the track and stretches the scene timings so the scenes end when the narration ends; the end card keeps its length. Without `--audio` the Reel renders silent at the spec's own timings, for Instagram's text-to-speech or a recorded voice.

## Weekly loop (short version)

1. Monday: Trend Scout and Publications Desk file memos. Director picks 7 stories.
2. Tuesday: Scriptwriter writes specs. Fact-Checker returns GREEN/AMBER/RED per story.
3. Wednesday to Thursday: Graphics and Animation render. Editor runs the QC checklist.
4. Every day: Publisher posts at the scheduled slot, replies to every comment within the hour, posts 2 to 4 Stories.
5. Sunday: Analytics Officer fills `analytics/weekly_log.csv`, runs `node analytics/projection.mjs`, Monitor reports, Director updates the decision memo.

The full cadence, gates and thresholds are in `OPERATING_MANUAL.md`.
