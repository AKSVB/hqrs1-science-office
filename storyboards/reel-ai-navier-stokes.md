# Storyboard: reel-ai-navier-stokes

Spec: `scripts/reel-ai-navier-stokes.json`. Voice: `production/assets/voice/reel-ai-navier-stokes-voice.mp3` (47.9 s, about 143 wpm). Fact-check: NONE. Neither `research/05-fact-check.md` nor `research/06-fact-check-wave2.md` has a row for this story; every number below (about 10,000 agents, about 88 hours, 17 hours in Lean, 25 Fields Medalists, the $1M prize, 8 and 11 September) is from the spec only, marked `facts_from_secondary_coverage`. GATE: this Reel is storyboarded so it can be built, but it does not render for publication until the Fact-Checker files a row and the numbers on screen are checked against it. Post type: debunk pacing (a contested claim). Bed B (news peg). Calendar: 17 Oct.

Logline: OpenAI announced a multi-agent proof addressing forced versions of the Navier-Stokes equations and said it would not claim the prize; three days later 25 Fields Medalists called AI benchmark mathematics a severe misalignment; not peer-reviewed, a priority dispute reported.

Track cut: remove the last two sentences, "We will follow it." and "Sources in the caption." (about 44.4 to 47.9 s), at the silence before "We". Then a tempo stretch of 1.02 (allowed to 1.05, no pitch change), so the cut track runs about 43.2 s; total with the end card about 44.7 s. The Reel ends on "Big claim, big pushback.", which is the verdict already spoken; the "we will follow it" promise moves to the caption.

Timings are estimates from word counts against the stretched track. The Editor aligns every row to the words JSON.

## Hook frame (0.0 s)

In frame: NS-01, dark ink curling through water seen from the side, a single thick amber-lit plume folding into two spiral vortices in the upper middle of the 9:16 frame, fine filaments trailing off into a blue-black field, one warm light from the upper left inside the plume, the lower third dark still water. This is the honest subject: the Navier-Stokes equations describe exactly this motion. What moves: the plume itself (the plate is a sequence, the flow advances in every frame) plus a push-in from 1.00 toward 1.06 on the vortex pair. No parallax plate (the subject has no clean edge). Voice at 0.0 s: "An AI, quote, solved, unquote...". Hook line up by 0.3 s, six words: **An AI "solved" a $1M problem**. Motif at 0.0 s. No ambience.

## Scene table

| Time (s) | On screen | Camera move | On-screen text (6 words max) | Voice (verbatim) | Sound |
|---|---|---|---|---|---|
| 0.0 to 2.9 | NS-01 ink plume, flowing | Push-in 1.00 to 1.04, focus [0.5, 0.40] | Hook line: An AI "solved" a $1M problem | An AI, quote, solved, unquote, a million | Motif; bed B in |
| 2.9 to 5.7 | NS-02 a tight vortex, the core lit amber | Drift right 5 percent | The headline | dollar maths problem. That is the headline. | none |
| 5.7 to 8.3 | NS-01 again | Push-in 1.04 to 1.08 | The contested version | Here is the contested version. | none |
| 8.3 to 16.3 | Cross-section wipe (0.40 s, upward) into the hours timeline plate over NS-02 at scrim 0.75 | Drift left 4 percent under the plate | Mechanism labels: ~10,000 agents; Proof, ~88 h; 8 Sept | On September eighth, OpenAI announced that a system of around ten thousand agents, running for about eighty eight hours, | Thud at 8.3; ticks as the readout counts hours (under 12) |
| 16.3 to 19.5 | NS-03 a forced flow: a bright injection point at the upper left stirring the field, plate gone (the window closes at 8 s) | Push-in 1.00 to 1.08, focus on the injection point | Forced versions of Navier-Stokes | produced a proof addressing forced versions of the Navier-Stokes equations, | none |
| 19.5 to 23.7 | Hard cut back to the timeline plate over NS-02 at scrim 0.8; the cursor runs on from 88 to 105 h | Drift right 3 percent under the plate | Mechanism labels: Proof, ~88 h; Lean, +17 h | with a further seventeen hours to formalise it in Lean. | Ticks as the cursor runs; one tick as the Lean mark lights |
| 23.7 to 26.6 | NS-03 forced flow | Drift left 4 percent | Forced | Forced versus unforced | none |
| 26.6 to 29.8 | NS-04 the same flow with no injection, decaying, dimmer | Push-out 1.06 to 1.00 | Unforced | matters here, and OpenAI itself says it will not claim the prize. | none |
| 29.8 to 36.7 | NS-02 vortex | Push-in 1.00 to 1.08 | Big number "25" counts up at 31.2 s as "twenty five" is spoken, flips at 32.6 s to "25 Fields Medalists", exits 34.2 s; then label: "Severe misalignment", 11 Sept | Three days later, twenty five Fields Medalists published a statement calling AI benchmark mathematics a severe misalignment. | Thud on the landing; tick on the flip |
| 36.7 to 41.7 | NS-04 decaying flow | Drift right 5 percent | Not peer-reviewed. Priority dispute reported. | The work is not peer-reviewed, and a priority dispute has been reported. | Motif (payoff) at 36.7 |
| 41.7 to 43.2 | NS-01 ink plume | Push-in 1.08 to 1.12 | Big claim. Big pushback. | Big claim, big pushback. | none |
| 43.2 to 44.7 | End card: NS-01 held at 1.12 | Push-in continues to 1.14 | Source line (36 px): Not peer-reviewed. OpenAI announcement, 8 Sept 2026; Nature news d41586-026-02842-5; Fields Medalists' statement, 11 Sept 2026. Note: Images: generated illustrations. | (silence) | Settle; bed fades 1.5 s |

The word "solved" appears on screen only inside quotation marks (hook line). "Contested" is spoken and in the band; the label at 5.7 s names it.

## Mechanism animation (second hook, 8.3 to 16.3 s; returns 19.5 to 23.7 s)

Type: `timeline` (exists in the renderer).

What is drawn: a horizontal grey `--line` rail 936 px wide, linear in hours from 0 at the left to 120 at the right, unlabelled minor ticks every 10 h. Two marks with 28 px labels above: "Proof, ~88 h" (amber) at 88 and "Lean, +17 h" (cyan) at 105. A third label, "~10,000 agents" (28 px, muted), sits at the left end above the rail as the name of what is running; it is a count from the spec, not a plotted quantity. A 64 px amber readout above the cursor reads hours with no decimals and the unit " h".

What changes over time:
- 8.3 to 8.7: wipe in, the rail draws on left to right; the "~10,000 agents" label and "8 Sept" appear (the Animator counts "8 Sept" and "~10,000 agents" as the labels group with "Proof, ~88 h": three, the maximum).
- 8.7 to 14.3: the cursor (amber, with the glow) runs from 0 to 88 over 5.6 s with ease-in-out; the readout ticks at each 10 h (nine ticks); at 88 the amber mark lights and the readout holds "88 h". This lands roughly as "eighty eight hours" is spoken (about 13.5 to 14.5 s).
- 14.3 to 16.3: hold. 16.3 the window closes on a hard cut (8 s cap; the sentence runs on).
- 19.5 (hard cut return, `enter` 0): the same rail with the cursor at 88. 20.4 to 22.4, as "seventeen hours" is spoken, the cursor runs from 88 to 105 (ticks at 90 and 100), the cyan "Lean, +17 h" mark lights (tick), the readout holds "105 h" for 0.6 s, then rolls once to "88 + 17 h" (arithmetic on two spec numbers; the sum is shown as a sum so the two reported figures stay visible). 23.7 the plate exits on a hard cut.

Numbers used: about 10,000; about 88 h; 17 h; 105 h as 88 + 17; 8 Sept. All from the spec. The 120 h rail end is the scale, unlabelled. The Fact-Checker's row, when filed, replaces any of these that differ.

## The big number

"25", count-up from 0 to 25 over 0.8 s starting at 31.2 s as "twenty five" is spoken, amber 200 px, ticks on each digit change (under 12), hold to 32.6 s, then one flip to "25 Fields Medalists" at 120 px (a format change: the same count with its noun), hold to 34.1 s, exit at 34.2 s. Thud on the landing, tick on the flip. This is the only big number; "$1M" is in the hook line, and the hours are simulation readouts.

## End card (43.2 to 44.7 s)

NS-01 held at its final zoom so the loop closes on the hook still. Source line (two lines): "Not peer-reviewed. OpenAI announcement, 8 Sept 2026; Nature news d41586-026-02842-5; Fields Medalists' statement, 11 Sept 2026." Note line: "Images: generated illustrations." Handle. Settle SFX, bed fade. Caption band empty. There is no journal line because there is no paper; the source line says so first.

## PLATES LIST (4 renders from one new scene, 9:16, free)

| ID | Scene and args | Status | Used in |
|---|---|---|---|
| NS-01 | `turbulent-flow --var view=ink --seed 11 --frames 90 --fps 30 --out-dir production/assets/reel-ai-navier-stokes/NS-01-seq` (3 s loop, the flow advances) | NEW SCENE | Hook 0.0 to 2.9; 5.7 to 8.3; 41.7 to 43.2; end card |
| NS-02 | `turbulent-flow --var view=vortex --seed 11 --frames 90 --fps 30 --out-dir production/assets/reel-ai-navier-stokes/NS-02-seq` | NEW SCENE | 2.9 to 5.7; 8.3 to 16.3 and 19.5 to 23.7 (under the plate); 29.8 to 36.7 |
| NS-03 | `turbulent-flow --var view=forced --seed 13 --frames 90 --fps 30 --out-dir production/assets/reel-ai-navier-stokes/NS-03-seq` | NEW SCENE | 16.3 to 19.5; 23.7 to 26.6 |
| NS-04 | `turbulent-flow --var view=free --seed 13 --frames 90 --fps 30 --out-dir production/assets/reel-ai-navier-stokes/NS-04-seq` (same seed as NS-03: the same flow without the forcing) | NEW SCENE | 26.6 to 29.8; 36.7 to 41.7 |

No existing free plate fits (the hot stream is water but a landscape, not a flow field). A fluid is the right subject for the equations; there is no image of the proof, the agents or the mathematicians and none is faked.

### NEW SCENE SPEC: `turbulent-flow` (2D canvas)

- Name and options: `turbulent-flow`, `--var view=ink` (default) | `vortex` | `forced` | `free`.
- What is drawn: a two-dimensional fluid field rendered as ink in water. The field is a seeded, divergence-free velocity field built from curl noise (the curl of a 3-octave `fbm` potential, sampled at (x, y, t times 0.12)), so streamlines close and never pile up; 24,000 tracer particles (seeded positions) are advected through it with a fixed-step integrator from t = 0 (every frame recomputes from the seed to time t, so a frame is a pure function of t; cap at 180 steps and fade tracers older than 6 s to keep it under 4 s per frame). Tracers are drawn as short motion-blurred strokes (length proportional to speed, 1 to 3 px wide, additive), coloured by their age: young tracers warm amber (#ffb020) near the source, ageing through pale cream to the cool blue-grey of the field (#4fe3f0 at 25 percent), so the one warm light in the frame is the freshest ink. Under the tracers a soft density layer (the same particles splatted at 40 px radius, blurred) gives the plume its body. Background `--bg` with a 4 percent radial lift behind the plume.
  - `ink`: one plume released from a point at the upper centre at t = 0, folding into a pair of counter-rotating spirals in the upper middle of the frame by t = 1.5 s; filaments trail toward the edges.
  - `vortex`: the camera 2 times closer on one spiral, its core the brightest amber, arms filling the upper half.
  - `forced`: as `ink`, plus a continuous source at the upper left (a small bright disc, 18 px, amber) that injects new tracers and a rotating force term (the potential gets an added time-varying dipole at the source), so the flow keeps stirring and never settles. This is "forced" in the equations' sense: an external force term.
  - `free`: the identical seed and initial plume with no source and no force term, so the flow decays: tracers age to cool grey and speeds fall, the frame dimming by t = 3 s. Rendered with the same `--seed` as `forced` so the pair reads as one flow with and without the push.
- Lighting: implied: the amber of the freshest ink is the single warm source; everything else is the cool field. Lower third under 12 percent luminance (tracers are clipped by a gradient mask below 0.68 of frame height).
- Camera: fixed orthographic view of the field, subject centred at 0.40 of frame height; `vortex` scales by 2 about the spiral's core.
- What varies with t: the whole field (advection, ageing, the source in `forced`, the decay in `free`) and a 1 percent slow drift of the density layer. Nothing else.
- Subject-only alpha layer: the plume (tracers plus density layer), no background lift. Used only if a parallax plate is ever wanted; this Reel does not use one.
- Budget: 2D only; about 3 to 4 s per frame at 24,000 tracers.

Caption: line 1 the hook, line 2 the source line verbatim ("Not peer-reviewed. OpenAI announcement, 8 Sept 2026; Nature news d41586-026-02842-5; Fields Medalists' statement, 11 Sept 2026."), then the spec body with "We will follow it." added at the end of the body, and hashtags.
