# Style bible: @hqrs_1

Version 1.0, 2026-09-27. Creative Director. Binding for every Reel, carousel and Story frame from this date. Derived from `research/07-top150-visual-grammar.md` section 5 and adapted to what the office can make: generated photoreal stills (flux-2-pro, true 9:16 or 4:5), code-driven animation (`production/reel/render-reel.mjs`, `production/carousel/render.mjs`), one voice (Rhea), generated music beds and sound effects. No camera, no lab, no AI video, no stock imagery. Every token named here is from `production/brand.css`; additions are listed in section 6.3 and extend the file, they do not change it.

The one-sentence standard: a photoreal subject already moving at frame 1, a real mechanism drawn live at the second hook, one big number, one voice, one source line. If a frame does not do one of those five jobs it is cut.

## 1. Hook frame rules (0.0 to 1.0 s)

1. Frame 1 is a generated still of the subject, filling the canvas. No logo, no title card, no fade-in, no black. The still is already moving at frame 1 (Ken Burns push-in from scale 1.00, or a lateral drift), so the first frame and the frame at 0.5 s differ.
2. The voice starts at 0.0 s. The first sentence contains a verb of change or a claim that sounds false ("Something is reproducing at 145 degrees", "Sound does not fade, it jumps", "Earth is 4.5 billion years old. This planet is not even one million"). Never "Have you ever wondered", never a question the video does not answer.
3. One hook line of text, six words at most, is fully on screen by 0.3 s (appears at 0.1 s, 6-frame rise, no typewriter). It is a claim, not a label. It sits in the hook box (section 4.2), inside the vertical middle third so the 3:4 grid crop keeps it. It leaves by 1.5 s at the latest and is replaced by nothing or by a scene label.
4. The karaoke caption band is live from the first spoken word. So the maximum on screen in the first second is: the still, the hook line, the caption band. Nothing else. No kicker, no journal name, no handle animation.
5. Motion by 0.5 s: the push-in has visibly changed the frame, or the subject's glow, steam or particles (baked into the still) read as movement under the drift. A still with no depth cue does not qualify as a hook plate.
6. The 2 s musical motif starts at 0.0 s under the voice.
7. Test before render: the hook still with the hook line, scaled to 25 percent, must still read. If the subject is not identifiable at 25 percent the still is regenerated with a tighter crop.
8. Cover frame for the grid is the frame at 0.8 s (hook line fully up). The Editor picks it; the cover never gets extra text.

## 2. The visual layer stack (back to front)

| Layer | Name | What it is | Rule |
|---|---|---|---|
| 1 | Base plate | Generated photoreal still, 9:16 (1080 x 1920 at least; 2K from the generator), graded per section 6.4 | One per scene; Ken Burns move for the whole scene: push-in 1.00 to 1.08 to 1.12, push-out, or drift of 4 to 6 percent of frame width. Never a zoom over 12 percent. Focus point set on the subject. |
| 2 | Parallax plate (optional, hook and payoff only) | A second copy of the same still, masked to the subject with a soft radial mask, moved at 1.5 times the base drift | Adds depth to the hook. Used only when the subject is a clean, centred object against a dark field. Never on wide landscapes. |
| 3 | Scrim | The `.scrim` gradient from brand.css | Always on when text or a mechanism sits over the still. Strength 0.45 under captions only, 0.70 to 0.80 under a mechanism plate, 0.94 at the very bottom for the UI zone. |
| 4 | Mechanism plate | Code-drawn animation on the dark field: thermometer, staircase, lineage, orbit, timeline, flash, ruler, compare, and new types added by the Animator | The second hook lives here (section 3.1, 3.2). One accent colour for lines (cyan), one for the moving element and numbers (amber). Width 936 px (x 72 to 1008), height 560 to 620 px, vertically centred in the safe area above the caption band. |
| 5 | Number plate | Kinetic figure: count-up, slam-in, unit flip | One number at a time. The big number (section 3.3) uses `.big` at 200 px amber. Simulation readouts use 64 px amber inside the mechanism plate. |
| 6 | Text plate | Hook line, scene labels | One element at a time, six words at most, `.caption` style. |
| 7 | Caption plate | Word-by-word karaoke, `.cap-band` at y 1170 to 1400 | Always on during narration. Section 5. |
| 8 | Chrome | Handle `@hqrs_1` at 28 px muted, x 72, baseline y 1444 (between the caption band and the Instagram UI zone). Source line on the end card only | The handle is small text, not a logo, and does not count as a text element. |

Counting rule for text: at any frame, at most two of {hook line, scene label, big number, mechanism labels group, caption band} are visible. The caption band is almost always one of the two, so in practice: caption band plus one other thing.

Transitions: hard cut by default. `fade` (0.3 s) only into the end card. `wipe-up` only for the cross-section wipe (section 3.2). No other transitions exist in this house.

## 3. The five signature devices

Every Reel uses all five. A viewer must recognise the account by the third post.

### 3.1 The live simulation window

What: a code-drawn, parameterised animation of the actual process in the story, rendered on the dark field inside the mechanism plate, 4 to 8 s long, starting at the second hook (between 8 and 20 s into the Reel, at the sentence where the mechanism is first spoken).

Build rules for the Animator:
- Every frame is a pure function of t through `window.seek(t)`; nothing is randomised at render time (seeded values only).
- Field: transparent over the scrimmed still (scrim 0.70 to 0.80), so the photoreal subject stays faintly visible behind the drawing. Not a flat black box.
- Lines: cyan `--accent`, 4 to 6 px, round caps. Reference or "old" lines: `--line` grey, 6 px. The moving element (ball, cursor, planet, fill): amber `--accent-2` with a soft glow (radial gradient, 70 px, opacity 0.7).
- Labels: 28 px `--font-body`, `--muted`, at most three on the plate, never a sentence. A label names a thing ("Old limit, 140 F"), not a claim.
- Readout: one live number, 64 px `--font-display` amber, ticking with the animation, at most one unit. It changes only when the physical quantity changes. A soft tick SFX on each value change (section 7).
- Timing: the drawing enters over 0.6 s (lines draw on with ease-out), the process runs for the rest of the window, nothing loops inside the window. If the voice sentence is shorter than 4 s the window still runs 4 s; if longer than 8 s the window closes on a cut to a still and the plate returns later if needed.
- The numbers in the window are the verified numbers from the spec and the fact-check row, nothing else. Arithmetic on two verified numbers (a difference, a unit conversion by definition) is allowed; a new fact is not.
- Existing types in `render-reel.mjs`: thermometer, staircase, lineage, orbit, timeline, flash, compare, counter, dots, scale. New types are added to the renderer with an example in `production/reel/demo-v2.json`. Bars exist but are never the main visual (section 12).

### 3.2 The cross-section wipe

What: the single transition that opens the simulation window. A vertical wipe, bottom to top, from the photoreal still to the mechanism plate over that same still.

Build rules:
- Duration 12 frames at 30 fps (0.40 s), ease-out (`easeOut(q)` in the renderer, the existing `wipe-up`).
- The incoming scene is clipped with `inset(top 0 0 0)` shrinking from 100 percent to 0. The leading edge carries a 2 px cyan line at 60 percent opacity, and 40 px above it a soft cyan glow that fades to nothing (the "section cut" look).
- The outgoing still is not replaced: the incoming scene uses the same still (or the story's mechanism still), so what changes is the scrim deepening to 0.75 and the drawing appearing. The subject stays where it was.
- Sound: one low thud (section 7) starting on frame 1 of the wipe. Nothing else.
- Always upward, always 0.40 s, always with the thud. It is used once per Reel, at the second hook. A Reel that needs a second mechanism scene returns to the plate on a hard cut, never a second wipe.
- On carousels the same device becomes slide 2: the mechanism slide is a frame exported from this plate at its final state (section 10).

### 3.3 One big number

What: exactly one kinetic number per post, in the display face, counted or slammed in, with its unit flipping once.

Build rules:
- `.big`: 200 px `--font-display` 700, amber, centred in the safe area, drop shadow and amber glow as in the renderer. Slam-in: scale 1.3 to 1.0 over 8 frames with the 4 px shake, then hold. Count-up variant: digits run from 0 (or the "from" value) to the target over 0.8 to 1.2 s with ease-out, ticks on each hundred or each digit change (whichever is under 12 ticks total).
- It appears at the moment the number is spoken, never before the word starts, and holds 1.4 to 2.5 s, then exits with a 6-frame fade. The caption band stays; no other text element is on screen while the big number is up.
- Unit flip: after the hold, the unit (and the figure if needed) flips once through a 6-frame vertical roll to a second reading of the same quantity. Allowed flips: a verified conversion given in the fact-check row (145 F to 63 C), a conversion true by definition (55 au to 55 times the Earth-Sun distance; 2 ms to 0.002 s), or a format change (550,000,000 to 550 million). Not allowed: any comparison that introduces a number not in the fact-check row (no football pitches, no "as long as a bus").
- One per post. Simulation readouts (3.1) are not big numbers; they live inside the plate at 64 px. If the storyboard has two candidates, the one spoken first wins.

### 3.4 The source stamp

What: the fixed-position source line on the end card, and the same line as the first line of the post caption after the hook.

Build rules:
- End card, last 1.5 s: the payoff still held, a `.source-line` (section 6.3) at 36 px `--font-body`, `--ink-2`, left-aligned at x 72, baseline y 1360, at most two lines: journal, date; authors, institution. Below it at 28 px `--muted`: "Images: generated illustrations" whenever any still depicts a specimen, an organism, a device or an astronomical object. The handle sits at its usual position.
- The journal and date come from the fact-check row, not from the press release.
- Caption text: line 1 is the hook, line 2 is the source line verbatim, then the body. Hashtags last.
- Carousels: the source slide (second to last) uses the existing `source` type; the cover carries the journal and date in the sub-line.
- Nothing else identifies the account: no logo, no watermark, no animated follow prompt.

### 3.5 The voice and the bed

What: one voice (Rhea, ElevenLabs, one take per Reel, tracks in `production/assets/voice/`) and one signature music bed with a 2 s motif.

Build rules:
- Voice: 145 to 165 words per minute for explainers; existing tracks run 135 to 155 wpm. Tempo may be stretched up to 1.05 without pitch change; never faster. Voice peaks at about minus 6 dBFS.
- Sentences may be cut from an existing track at silence boundaries (the storyboard names which). Nothing is added to the science; a re-generated line is only for a mispronunciation.
- Bed: `eleven_music_v2`, one bed for explainers ("hqrs-bed-a"), one for news pegs and sky events ("hqrs-bed-b"). Brief for bed A: 84 bpm, minor key, a low sustained synth pad, a soft sub pulse on beats 1 and 3, a single four-note motif on a muted electric piano in the first 2 s and again at a marked payoff point, no drums, no lead melody, 60 s, ends on the motif. Bed B: 100 bpm, the same motif, a light shaker, otherwise identical. The motif is the audio logo: it is the first 2 s of the bed at 0.0 s, and the renderer places it again at the payoff (the sentence before the end card) via `--sfx motif.mp3@<t>`.
- Bed level minus 18 dB under the voice (renderer default), 1.5 s fade-out into the end card.

## 4. Text plates: hook line and scene labels

### 4.1 What may be text
- Hook line (0.1 to 1.5 s): six words, a claim.
- Scene label: six words, names what is on screen or the key term of the sentence being spoken. Not a sentence, not a repeat of the caption band. One per scene, appearing at the cut, leaving at the next cut (6-frame rise and fade).
- Big number (3.3).
- Mechanism labels (3.1), counted as one group.
- Caption band (5).

### 4.2 Positions on the 1080 x 1920 canvas
- Instagram UI zones (brand.css `.safe`): top 0 to 260, bottom 1480 to 1920. Nothing readable there.
- Hook box and label box: x 72 to 1008, y 900 to 1150, text bottom-anchored at y 1150, `.caption` (64 px `--font-display` 700, white, text shadow). Four words or fewer may use 76 px (section 6.3).
- Big number: centred in y 560 to 1150.
- Mechanism plate: x 72 to 1008, y 480 to 1150.
- Caption band: y 1170 to 1400 (brand.css `.cap-band`).
- Handle: x 72, baseline y 1444.
- End card source line: x 72, baseline y 1360 (the caption band is empty on the end card).
- Grid crop check: the 3:4 crop keeps y 240 to 1680, so every text plate above survives.

## 5. Caption system

- Word-by-word karaoke from the aligned words JSON (`--words`, produced by the Editor from the voice track; `--auto-words` is only a preview). One line of 3 to 5 words in the band, the current word in amber (`.w.now`), spoken words white, unspoken words at 42 percent (`.w.next`). The line advances when its last word ends; no scrolling.
- Style: brand.css `.cap-line` (60 px `--font-display` 700, translucent box at 45 percent, 24 px radius). No outline stroke; the box and shadow do the legibility work.
- Numbers in the band are digits ("145 F", "550 million"), not words, even when the voice says the words. Units follow the fact-check spelling.
- Capitalisation as in prose; no all-caps captions; no emoji.
- The band is empty during the end card and during any silence over 0.8 s.
- Static full-sentence text appears only as the hook line and the end card source line. Never a paragraph on screen.
- SRT is exported from the same words JSON and must match the band line by line (Editor check).

## 6. Colour and type

### 6.1 Tokens (from brand.css, unchanged)
- Field: `--bg` #060913, `--bg-2` #0d1426, `--surface` #121a30, `--line` #22304f.
- Ink: `--ink` #f5f7fa, `--ink-2` #b6c0d3, `--muted` #7d889e.
- Cyan `--accent` #4fe3f0: mechanism lines, reference marks, carousel numbers (`.num`), the kicker, the `.hl` word.
- Amber `--accent-2` #ffb020: the moving element in a simulation, all kinetic numbers on Reels, the current caption word, the `.hl-2` word.
- `--fact` #3ddc97 and `--myth` #ff4d6d: only on the compare (myth versus data) device, never for decoration.
- Type: `--font-display` Space Grotesk for hook lines, labels, numbers and captions; `--font-body` Inter for source lines, mechanism labels and carousel body.

### 6.2 Sizes
- Hook line and scene label 64 px (76 px allowed at four words or fewer). Caption band 60 px. Big number 200 px. Simulation readout 64 px. Mechanism labels 28 px. Source line 36 px. Handle 28 px. Carousel: `.h1` 96 (cover 118), `.h2` 68, `.body` 42, `.num` 220, `.small` 28.
- Nothing under 28 px anywhere.

### 6.3 Additions to brand.css (append; do not edit existing rules)

```css
/* Style bible v1 additions (2026-09-27). Reels. */
:root {
  --sim-line: var(--accent);                 /* mechanism lines */
  --sim-dim: rgba(79,227,240,0.35);          /* secondary mechanism lines */
  --sim-move: var(--accent-2);               /* the moving element and readouts */
  --grade-black: #0a1224;                    /* lifted black point for graded stills */
  --grade-warm: #ffb020;                     /* the single warm light in every still */
}
.caption.short { font-size: 76px; }          /* hook line or label of four words or fewer */
.source-line { position: absolute; left: 72px; right: 72px; bottom: 560px; font: 400 36px/1.3 var(--font-body); color: var(--ink-2); }
.source-line .note { display: block; margin-top: 10px; font-size: 28px; color: var(--muted); }
.handle-reel { position: absolute; left: 72px; top: 1416px; font: 600 28px/1 var(--font-body); color: var(--muted); }
.wipe-edge { position: absolute; left: 0; right: 0; height: 2px; background: var(--accent); opacity: 0.6; box-shadow: 0 -40px 40px rgba(79,227,240,0.25); }
/* Carousel slides with a photo plate (cover, number, statement): */
.slide .plate { position: absolute; inset: 0; }
.slide .plate img { width: 1080px; height: 1350px; object-fit: cover; }
.slide .plate-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(6,9,19,0.35) 0%, rgba(6,9,19,0.55) 45%, rgba(6,9,19,0.96) 100%); }
```

The Graphics desk adds `plate` support to `render.mjs` (a `bg` field on cover, number and statement slides) and the Animator adds `.source-line`, `.handle-reel` and the wipe edge to the reel renderer. Existing renders are unaffected.

### 6.4 Grading rule for stills
Every generated still is graded before it enters a scene so the grid reads as one account: black point lifted to `--grade-black` (never pure black), shadows tinted toward the cyan-blue field, midtones neutral, one warm light source per frame (amber, from the subject or a single lamp), saturation capped so that no hue except the amber light exceeds the cyan accent in intensity, a 6 percent vignette, and 2 percent fine grain. The full recipe is in `storyboards/README.md`. Stills that come out with two competing warm sources, a daylight-white sky or a bright lower third are regenerated, not rescued in the grade.

### 6.5 Prompting rule for stills
Subject first, natural prose, 40 to 80 words, lighting and lens named, the lower third dark and empty (for the caption band), "no text, no letters, no watermark" at the end. Aspect ratio is a parameter (`aspect_ratio` 9:16 for Reels, 4:5 for carousels, resolution 2K); the prompt does not control it. No faces, no people, no brand marks, no real named individuals. Specimens and instruments are described physically, not by brand.

## 7. Sound identity

| Cue | Spec | When |
|---|---|---|
| Motif | First 2 s of the bed, the four-note figure | 0.0 s, and at the payoff sentence |
| Bed A / Bed B | Section 3.5 | Whole Reel, minus 18 dB, fade 1.5 s into the end card |
| Thud | Generated SFX: "a single low soft impact, felt more than heard, 120 ms, no reverb tail" | Frame 1 of the cross-section wipe; also when the big number slams |
| Tick | Generated SFX: "a soft short mechanical tick, wooden, 40 ms" | Each readout change in a simulation and each digit group of a count-up; never more than 12 per window |
| Settle | Generated SFX: "a low soft resonant tone fading over 1.2 s" | Start of the end card |
| Ambience | One generated ambient loop per story where it fits the subject (a simmering hot spring, a cryostat hum, an open-air night); minus 24 dB | Under the hook and payoff stills only |

No whooshes on cuts. No risers. No trending audio over the voice; trending audio is allowed only on carousels and silent card Reels. Voice peaks about minus 6 dBFS; the mix is checked on phone speakers.

## 8. Pacing tables by post type

Cuts include hard cuts and the wipe; a Ken Burns move inside a shot is not a cut. Every shot must have internal motion (the base plate move at minimum). No shot over 5 s unless a simulation is running in it.

| Post type | Length (incl. 1.5 s end card) | Cuts per 10 s | Second hook at | Shot length | Notes |
|---|---|---|---|---|---|
| Mechanism reveal (default explainer) | 30 to 45 s | 2.5 to 4 | 8 to 20 s | 2 to 5 s; simulation window 4 to 8 s | Scripts of 90 to 120 words. Stills at most 6. |
| News peg (paper of the day, fast) | 18 to 30 s | 4 to 6 | 6 to 10 s | 1.5 to 3 s | Claim, still, why-it-matters, mechanism or number, source. Stills at most 4. |
| Image drop (one spectacular subject) | 8 to 15 s | 2 to 3 | none | 3 to 5 s | One or two stills, one label each, one big number, source. No mechanism plate. |
| Simulation short | 12 to 20 s | 1 to 2 | 0 s | one continuous plate | The simulation is the hook. One still under it. |
| Debunk | 30 to 45 s | 4 to 5 | 8 to 12 s | 2 to 4 s | The claim is quoted as a label for 3 s at most, then the verified data in the plate. Compare device allowed. |
| Sky event (tentpole) | 15 to 25 s | 3 to 4 | 5 to 8 s | 2 to 4 s | Date, time and magnitude as the big number sequence; a sky-position plate as the mechanism. |
| Carousel | 7 to 9 slides | n/a | slide 2 | n/a | Section 10. |

Guardrails: first cut by 3.0 s (a hook sentence longer than 3 s is split across two shots of the same subject). Nothing under 1.5 s except the wipe itself. The end card is 1.5 s (renderer `end.seconds` 1.5).

## 9. Lengths

- Default Reel: 30 to 45 s including the end card. The verified scripts run 110 to 125 words at Rhea's pace, which lands at 40 to 50 s; storyboards name the sentences to cut so the track sits at or under 45 s. Cuts remove the journal sentence and "Source in the caption" first, since the end card and the caption carry both.
- Image drops 8 to 15 s. News pegs 18 to 30 s.
- One longer piece per week, 60 to 90 s, only for a mechanism series episode approved by the Director.
- Never over 60 s without the Director's line in `DECISION_MEMO.md`.

## 10. End card

- Last 1.5 s. The payoff still (the hook still at its final zoom, so the loop closes) held with the base plate move continuing.
- Elements: the `.source-line` (journal, date; authors, institution), the "Images: generated illustrations" note when applicable, the handle. Nothing else. No "follow", no arrow, no question.
- Fade 0.3 s in; hard end. The loop is the call to action.
- The caption band is empty. The bed fades over the card; the settle SFX plays at its start.
- News pegs end with the why-it-matters already spoken; never on an open question.

## 11. Carousel system (1080 x 1350, 4:5)

Slide order: cover, mechanism, number, then one idea per slide, compare (myth versus data) where a myth exists, source, save-and-send. 7 to 9 slides.

- Cover: the hero still full-bleed with the subject cropped by the frame edge (the still is prompted so the subject runs out of frame on the right or top), `.plate-scrim` on, a five-word claim in `.h1.xl` placed in the vertical middle third (y 450 to 900), the journal and date in the sub-line at `.body`, the kicker naming the field. "SWIPE" pill top right. The cover must feel incomplete without the swipe.
- Mechanism slide (slide 2): the dark field, the mechanism plate exported at its final state from the Reel renderer (or drawn to the same rules in `render.mjs`), at most three labels, one `.h2` line above it. This is the cross-section wipe frozen.
- Number slide (slide 3): `.num` 220 px cyan over a still at plate-scrim, one `.h2` line, one `.body` line. The number is the post's big number. No bars.
- Idea slides: `statement` or `list` type; a still may sit behind at plate-scrim when one exists; at most three list items; no item over 20 words.
- Compare slide: existing `compare` type, myth in `--myth`, data in `--fact`; the body line names the caveat.
- Source slide: existing `source` type, the fact-check journal line first.
- Last slide: existing `cta` type with the save-and-send ask; no still.
- Handle bottom-left and counter bottom-right on every slide (brand.css `.foot`).
- Stills per carousel: at most 6, and the cover still is always one of them. Slides 4 onward may reuse Reel stills at 4:5 only if regenerated at 4:5 (no cropping a 9:16 still to 4:5).

## 12. What we never do

- Text-only scenes longer than 2 s. A scene is text-only when no still, no simulation and no big number is on screen.
- Bar charts as the main visual. Bars may appear only as a secondary element inside a carousel number slide with two or three items, never in a Reel.
- "Have you ever wondered", "You won't believe", "scientists are baffled", or any question hook.
- Watermark-style logos, badges, corner marks, or the handle at more than 28 px. The handle is text.
- More than two text elements on screen at once (section 2, counting rule).
- A fade or dissolve between scenes. Cuts and the one wipe only.
- A zoom over 12 percent, a pan that shows the edge of the still, or a still with visible generation artefacts (extra limbs, text-like glyphs, duplicated organelles).
- Faces or people in stills; brand names; real named individuals as images.
- A number on screen that is not in the spec or the fact-check row.
- Trending audio over the voice; whooshes on cuts; music louder than minus 18 dB under voice.
- Pure black backgrounds (#000000); flat text on the dark field with no still behind it for more than 2 s (the rejected first-generation look).
- Two big numbers, two wipes, two voices, two beds.
- Emoji in any frame or caption. Em dashes anywhere.
- Cropping a 9:16 still to 4:5 or the reverse. Regenerate.

## 13. Per-scene checklist (Editor)

Tick every line for every scene; one failure sends the scene back with the line number.

Scene identity
1. Scene has a still, a simulation or a big number on screen for its whole length (no text-only over 2 s).
2. Scene length 1.5 to 5 s, or up to 8 s with a running simulation.
3. Base plate move present (push-in 8 to 12 percent, push-out, or 4 to 6 percent drift); focus point on the subject; no still edge visible.

Text
4. At most two text elements on screen at any frame (caption band plus one other).
5. Hook line or label is six words or fewer, `.caption` style, inside x 72 to 1008 and y 900 to 1150.
6. Label names a thing or a term; it is not a sentence and does not repeat the band.
7. No text inside y 0 to 260 or y 1480 to 1920.
8. Every number on screen matches the spec or the fact-check row exactly (value, unit, spelling).

Caption band
9. Band words match the voice words; digits for numbers; current word amber; 3 to 5 words per line.
10. SRT line for this window equals the band line.

Mechanism (when present)
11. Wipe is upward, 0.40 s, thud on frame 1, used once in the Reel.
12. Lines cyan, moving element and readout amber, at most three labels at 28 px, one readout at 64 px.
13. Readout changes only when the quantity changes; ticks under 12 per window.
14. Frame is reproducible: render two frames at the same t and diff them.

Big number (when present)
15. Appears at the spoken word, holds 1.4 to 2.5 s, one unit flip from the allowed list, then exits. No other text element while it is up.
16. It is the only big number in the Reel.

Sound
17. Voice peaks around minus 6 dBFS; bed at minus 18 dB; motif at 0.0 s and at the payoff; settle at the end card.
18. No SFX on a plain cut.

Still quality
19. Still is graded to the recipe (lifted black, cool shadows, one warm source, vignette, grain) and sits in the same palette as the neighbouring scenes.
20. No artefacts, no faces, no glyphs; lower third dark and empty before the scrim.
21. Aspect ratio native (9:16 for Reels, 4:5 for carousels), not cropped from the other.

Whole post (once)
22. Hook: subject in frame 1 moving, hook line up by 0.3 s, voice at 0.0 s, first cut by 3.0 s, readable at 25 percent.
23. End card 1.5 s: source line from the fact-check row, "Images: generated illustrations" if applicable, handle, nothing else; loop closes on the hook still.
24. Total length inside the pacing table band; under 60 s.
25. Caption text: hook line 1, source line 2, one specific question, 3 to 5 hashtags, under 60 words for Reels and 80 for carousels.
26. Alt text written for the cover frame and every carousel slide.

## Addendum, 28 Sept 2026: the pop-out carousel is the carousel standard

Every carousel is built with the pop-out system (`production/carousel/render.mjs`, slide types `popout-cover` and `popout`): a full-bleed graded plate, an inset window panel with a 2 px edge, and a 3D subject rendered as a transparent layer (`render-plate.mjs --alpha --var view=hero`, then `crop-alpha.mjs`) composited above the panel edge so it breaks the frame, with a contact shadow. Text sits in the panel's lower area and never under the subject: kicker, one claim of at most seven words, at most one big number per carousel, a source line on the last content slide. Cover: subject cut by the frame edge, five-word claim. Backgrounds vary per slide (different scene view, t and seed); subjects vary per slide (different t and seed, rotation between -35 and 40 degrees). Reference decks: `production/out/carousel-organoids-popout`, `production/out/carousel-youngest-planet-popout`. Text-card slides are not used.
