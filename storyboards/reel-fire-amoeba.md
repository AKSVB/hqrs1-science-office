# Storyboard: reel-fire-amoeba

Spec: `scripts/reel-fire-amoeba.json`. Voice: `production/assets/voice/reel-fire-amoeba-voice.mp3` (42.6 s, about 155 wpm). Fact-check: `research/05-fact-check.md` row 8, GREEN. Post type: mechanism reveal. Bed A.

Logline: a single-celled eukaryote in a Lassen hot stream divides at 145 F, survived a five-minute spike to 158 F, and moved the heat record for complex life from 140 F.

Track cut: remove the last sentence, "Source in the caption." (about 40.9 to 42.6 s), at the silence before it. The end card carries the source. Cut track about 40.9 s; total with the end card about 42.4 s.

Timings below are estimates from word counts against the track length. The Editor aligns every row to the words JSON before render and moves cuts to the nearest word boundary.

## Hook frame (0.0 s)

In frame: FA-01, a translucent amoeba lit from within in amber, floating in dark blue-green hot-spring water, steam curling across the top of the frame, tiny bubbles rising around it, the cell centred in the upper middle of the 9:16 frame, the lower third dark water. What moves: push-in from scale 1.00 toward 1.10 centred on the cell; the parallax plate on the cell moves at 1.5 times the drift so the steam appears to slide behind it. Voice at 0.0 s: "Something is reproducing...". First text line, up by 0.3 s, six words: **Something is reproducing at 145 F**. Motif at 0.0 s; hot-spring simmer ambience at minus 24 dB.

## Scene table

| Time (s) | On screen | Camera move | On-screen text (6 words max) | Voice (verbatim) | Sound |
|---|---|---|---|---|---|
| 0.0 to 2.6 | FA-01 amoeba in the pool, parallax plate on | Push-in 1.00 to 1.06, focus [0.5, 0.42] | Hook line: Something is reproducing at 145 F | Something is reproducing at one hundred and forty five | Motif; bed A in; simmer ambience |
| 2.6 to 6.8 | FA-02 macro of the cell edge, membrane and granules | Drift left 5 percent | Big number "145 F" slams at 2.7 s, flips to "63 C" at 3.9 s, exits 4.6 s; then label: Not a bacterium | degrees Fahrenheit. And it is not a bacterium. | Thud on the slam; one tick on the flip |
| 6.8 to 10.6 | FA-04 cell interior, nucleus visible, cyan back-light | Push-in 1.00 to 1.10, focus on the nucleus | A complex cell, like yours | It is an amoeba, a complex cell like the ones in your body, | none |
| 10.6 to 15.4 | FA-03 Lassen hot stream, steam, volcanic rock, dawn | Tilt-up (drift from focus [0.5, 0.65] to [0.5, 0.4]) | Lassen Volcanic National Park | found in a hot stream in Lassen Volcanic National Park. | Ambience swells 2 dB, then out |
| 15.4 to 17.9 | FA-01 again | Push-in 1.06 to 1.12 | Incendiamoeba cascadensis | Meet Incendiamoeba cascadensis, the fire amoeba. | Soft tick as the name lands |
| 17.9 to 22.5 | Cross-section wipe (0.40 s, upward) into the thermometer plate over FA-05 (a cell pinching in two), scrim 0.75 | Drift right 4 percent under the plate | Mechanism labels: Old limit 140 F; Divides 145 F | It divides at one hundred and forty five degrees, | Thud at 17.9; ticks as the readout climbs |
| 22.5 to 27.3 | Thermometer plate continues over FA-06 (the cell contracted into a dense protective ball, bubbles) on a hard cut; the five-minute timer runs | Push-in 1.00 to 1.08 under the plate | Mechanism labels: Spike 158 F; 5 min; Protective state | and it survived a five-minute spike to one hundred and fifty eight in a protective state. | Ticks; one soft settle as the cursor drops back |
| 27.3 to 31.9 | Thermometer plate holds over FA-06 at scrim 0.8; the 140 F reference line pulses cyan, the cursor rests at 145 | Drift left 3 percent | Old limit: 140 F | The old limit for complex life was about one hundred and forty. | One tick when the 140 line lights |
| 31.9 to 36.2 | FA-02 macro, plate gone | Push-out 1.10 to 1.00 | 140 F to 145 F | The record moved by only a few degrees, but it moved. | none |
| 36.2 to 40.9 | FA-03 Lassen stream | Drift right 5 percent | Syracuse University, in Cell | The study, from Syracuse University, is in the journal Cell this month. | Motif (payoff) at 36.2 |
| 40.9 to 42.4 | End card: FA-01 held at scale 1.12 | Push-in continues 1.12 to 1.14 | Source line (36 px): Cell, 22 Sept 2026. Rappaport, Oliverio, Syracuse University. Note: Images: generated illustrations. | (silence) | Settle; bed fades 1.5 s |

## Mechanism animation (second hook, 17.9 to 31.9 s)

Type: `thermometer` (exists in the renderer) with a timer readout added.

What is drawn: a vertical scale on the left half of the plate, 560 px tall, from 32 F at the bottom to 212 F at the top, grey `--line` rail 6 px, tick marks every 20 F at 28 px. Three reference marks on the right of the rail, each a short line and a 28 px label: "Old limit 140 F" (cyan; the fungi and red algae detail stays in the voice and caption), "Divides 145 F" (amber), "Spike 158 F" (amber, drawn later). A 64 px amber readout to the right of the rail follows the cursor.

What changes over time:
- 17.9 to 18.3: wipe in, rail and the 140 mark draw on (ease-out).
- 18.3 to 21.0: an amber fill rises from the bottom of the rail (32 F) to 145 F; the readout ticks 60, 80, 100, 120, 140, 145 (six ticks). At 140 the cyan "Old limit" line flashes once. At 145 the "Divides 145 F" mark draws on and the fill holds.
- 22.5 (hard cut to FA-06 behind): the fill jumps from 145 to 158 over 0.4 s; the "Spike 158 F" mark draws on; a 64 px timer under the readout counts 0:00 to 5:00 over 2.8 s (ticks at each minute, five ticks); at 5:00 the fill drops back to 145 over 0.8 s and the timer fades. The label "Protective state" sits beside the 158 mark for the timer's duration.
- 27.3 to 31.9: cursor rests at 145; the 140 line pulses cyan once per second; the readout shows "145 F" static.
- 31.9: plate exits on a hard cut.

Numbers used: 140 F, 145 F, 158 F, 5 minutes, all from the fact-check row; the 32 F and 212 F rail ends are the scale, unlabelled. 147 F (still active) and 176 F (lethal) are in the fact-check row and may be added as dim marks if the plate is not crowded; default is off.

## The big number

"145 F", slam-in at 2.7 s as "forty five" is spoken, amber 200 px, hold 1.2 s, unit flip at 3.9 s to "63 C" (the conversion in the fact-check row), hold 0.7 s, exit at 4.6 s. Thud on the slam, tick on the flip. No other text element while it is up.

## End card (40.9 to 42.4 s)

FA-01 held at its final zoom so the loop closes on the hook still. Source line: "Cell, 22 Sept 2026. Rappaport, Oliverio, Syracuse University." Note line: "Images: generated illustrations." Handle. Settle SFX, bed fade. Caption band empty.

## Stills list (6, all 9:16, flux-2-pro, resolution 2K)

| File | Prompt | Aspect | Used in |
|---|---|---|---|
| `assets/reel-fire-amoeba/FA-01-amoeba-in-pool.png` | A single translucent amoeba glowing softly amber from within, floating in dark teal hot-spring water, its lobed body filling the upper middle of the frame, fine steam drifting across the top, small bubbles rising around it, dark volcanic rock at the edges, photographed as an extreme macro with a shallow depth of field, cool ambient light with one warm glow from the cell, the lower third of the frame dark still water, no text, no letters, no watermark. | 9:16 | Hook 0.0 to 2.6; 15.4 to 17.9; end card |
| `assets/reel-fire-amoeba/FA-02-cell-edge-macro.png` | The rippling edge of a translucent amoeba seen through a research microscope at very high magnification, granular cytoplasm and a thin membrane in sharp focus, amber light glowing through the cell from behind, the surrounding water a deep blue-black with drifting motes, the cell edge crossing the upper half of the frame diagonally, shallow depth of field, the lower third of the frame dark and empty, no text, no letters, no watermark. | 9:16 | 2.6 to 6.8; 31.9 to 36.2 |
| `assets/reel-fire-amoeba/FA-03-lassen-hot-stream.png` | A steaming hot stream cutting through grey and rust-coloured volcanic rock in a mountain valley at dawn, thick white steam rising from the water and catching low warm light, pale mineral crusts along the banks, conifers dark on the ridge behind, wisps of steam curling into a cold blue sky, photographed with a wide lens from low on the bank, the lower third of the frame in deep shadow, no text, no letters, no watermark. | 9:16 | 10.6 to 15.4; 36.2 to 40.9 |
| `assets/reel-fire-amoeba/FA-04-cell-interior.png` | The interior of a single amoeba seen in cross-section under a fluorescence microscope, a round nucleus glowing softly at the centre, surrounding organelles and vacuoles as faint cyan and pale shapes in a translucent body, dark blue background, one warm amber highlight along the membrane on the upper right, shallow depth of field, the cell in the upper two thirds of the frame and the lower third dark and empty, no text, no letters, no watermark. | 9:16 | 6.8 to 10.6 |
| `assets/reel-fire-amoeba/FA-05-cell-dividing.png` | A translucent amoeba caught in the act of dividing, its body pinched into two lobes joined by a thin bridge, both lobes glowing amber from within, suspended in dark teal hot-spring water with rising bubbles and faint steam above, extreme macro photograph, shallow depth of field, cool ambient light from above and one warm glow from the cell, the lower third of the frame dark water, no text, no letters, no watermark. | 9:16 | 17.9 to 22.5 (under the thermometer plate) |
| `assets/reel-fire-amoeba/FA-06-protective-state.png` | A single amoeba contracted into a dense, rounded, thick-walled ball, its amber glow dimmed to a deep ember at the core, surrounded by vigorous small bubbles and swirling steam in near-boiling teal water, dark volcanic grit below, extreme macro photograph, shallow depth of field, cold blue rim light and one warm ember at the centre, the lower third of the frame dark and empty, no text, no letters, no watermark. | 9:16 | 22.5 to 31.9 (under the thermometer plate) |

Caption (unchanged from the spec except line order): line 1 the hook, line 2 "Cell, 22 Sept 2026. Rappaport, Oliverio and colleagues, Syracuse University.", then the spec body and hashtags.
