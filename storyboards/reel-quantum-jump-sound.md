# Storyboard: reel-quantum-jump-sound

Spec: `scripts/reel-quantum-jump-sound.json`. Voice: `production/assets/voice/reel-quantum-jump-sound-voice.mp3` (52.0 s, about 135 wpm, the slowest track). Fact-check: `research/05-fact-check.md` row 3, GREEN (Science 393, 1217-1220, 17 Sept 2026; T1 = 2.1 ms; jumps between the first excited state and the ground state; ions 1986, photons 2007; "first direct real-time observation"). Post type: mechanism reveal, physics. Bed A.

Logline: at the quantum scale sound comes in packets, phonons, that sit on fixed energy steps; Stanford physicists watched single phonons jump between two of those steps in real time, in a resonator that rings for about two milliseconds.

Track cut: remove the last two sentences, "The result is in the journal Science, published on the seventeenth of September." and "Source in the caption." (about 44.2 to 52.0 s). The end card carries the journal and date. Cut track about 44.2 s; total with the end card about 45.7 s. The Editor may apply a 1.05 tempo stretch (no pitch change) to bring the total near 43.5 s; not more.

Timings are estimates from word counts against the track length; the Editor aligns every row to the words JSON.

## Hook frame (0.0 s)

In frame: QJ-01, the rim of a brass bell just after being struck, the rim edge softened by vibration blur, tiny ripples of reflected light along it, a dark studio background, the rim curving through the upper middle of the 9:16 frame, the lower third dark. What moves: push-in 1.00 toward 1.10 on the blurred rim; parallax plate on the bell. Voice at 0.0 s: "Sound does not fade away smoothly." Hook line up by 0.3 s, six words: **Sound does not fade. It jumps.** Motif at 0.0 s; a single bell strike SFX at 0.0 s (generated, "one soft strike on a small brass bell, ringing, 3 s"), minus 20 dB.

## Scene table

| Time (s) | On screen | Camera move | On-screen text (6 words max) | Voice (verbatim) | Sound |
|---|---|---|---|---|---|
| 0.0 to 2.8 | QJ-01 bell rim, vibration blur, parallax on | Push-in 1.00 to 1.08, focus on the rim | Hook line: Sound does not fade. It jumps. | Sound does not fade away smoothly. | Motif; bell strike; bed A in |
| 2.8 to 5.6 | QJ-02 extreme macro of a silicon chip with a suspended patterned beam, cold blue with one gold reflection | Push-in 1.00 to 1.10, focus on the beam | At the smallest scale | At the smallest scale, it jumps. | none |
| 5.6 to 8.9 | QJ-01 bell rim, different crop | Pan right 5 percent | Vibration is energy | Sound is vibration, and vibration is energy. | none |
| 8.9 to 13.8 | Cross-section wipe (0.40 s, upward) into the staircase plate over QJ-02 at scrim 0.75; two steps drawn, a glowing dot appears on the lower step | Drift left 4 percent under the plate | Mechanism labels: ground state; first excited state; phonon | At the quantum level that energy comes in packets called phonons. | Thud at 8.9; tick when the dot appears |
| 13.8 to 19.1 | Staircase plate continues: the dot drifts upward toward the gap between the steps and snaps onto the upper step, twice, showing it cannot rest between them | Drift continues | Fixed steps, nothing between | A phonon can only sit on fixed energy steps, never in between. | Tick on each snap (two) |
| 19.1 to 24.0 | QJ-04 the gold-plated stages of a dilution refrigerator, hanging open, cold mist | Tilt-up (focus [0.5, 0.6] to [0.5, 0.35]) | Stanford, Safavi-Naeini lab | Physicists at Stanford, in the Safavi-Naeini lab, built a tiny mechanical resonator | Cryostat hum ambience, minus 24 dB |
| 24.0 to 27.5 | QJ-03 the chip on its gold sample mount inside the fridge | Push-in 1.00 to 1.10 | Big number: "2 ms" slams at 25.6 s, flips to "0.002 s" at 26.6 s, exits 27.5 s | that rings for about two milliseconds, | Thud on the slam; tick on the flip |
| 27.5 to 33.0 | Hard cut back to the plate over QJ-02 at scrim 0.8: the staircase on the left, a live telegraph trace on the right; the dot sits on the upper step, the trace runs flat, then the dot drops to the lower step and the trace steps down at the same instant | Push-in 1.00 to 1.06 under the plate | Watched in real time | and watched single phonons jump between those steps in real time. | Ticks as the timer runs; one thud on the jump |
| 33.0 to 37.3 | QJ-03 chip on its mount | Push-out 1.10 to 1.00 | First direct real-time observation | It is the first direct real-time observation of a quantum jump in sound. | Motif (payoff) at 33.0 |
| 37.3 to 41.0 | Timeline plate over QJ-04 at scrim 0.8, hard cut: three ticks light in turn | Drift right 3 percent | Mechanism labels: ions 1986; photons 2007; sound 2026 | Quantum jumps were seen in ions in 1986, in photons in 2007, | Tick per mark (two here) |
| 41.0 to 44.2 | QJ-01 bell rim | Push-in 1.08 to 1.12 | Sound, 2026 | and now in sound. | Tick on the third mark's cue; bell strike again at 41.0, minus 24 dB |
| 44.2 to 45.7 | End card: QJ-01 held at 1.12 | Push-in continues to 1.14 | Source line: Science 393, 1217. 17 Sept 2026. Makihara, Szakiel, Safavi-Naeini; Stanford. Note: Images: generated illustrations. | (silence) | Settle; bed fades 1.5 s |

## Mechanism animation (second hook, 8.9 to 19.1 s; returns 27.5 to 33.0 s)

Type: `staircase` (exists in the renderer) with `levels` 2, plus a new `telegraph` sub-plate on the return.

What is drawn (8.9 to 19.1): two horizontal grey `--line` steps in the left two thirds of the plate, 6 px, round caps, the lower step labelled "ground state" and the upper step "first excited state" at 28 px on the left. Only two steps, because the fact-check row confirms jumps between exactly these two states; the spec's four-step schematic is dropped. The phonon is the existing white ball with the amber glow, radius 22 px, labelled "phonon" once at 28 px beside it when it first appears.

What changes over time (8.9 to 19.1): 8.9 to 9.3 wipe in, both steps draw on; 10.2 the ball appears on the lower step with a tick; 13.8 to 16.4 the ball rises slowly toward the midpoint between the steps, stops at 40 percent of the gap, and snaps to the upper step over 4 frames with a tick and a one-frame amber ring; 16.4 to 18.4 it drifts back down to 60 percent of the gap and snaps to the lower step with a tick; 18.4 to 19.1 hold. The snaps are the rule "never in between" made visible; there is no number on this plate.

What is drawn on the return (27.5 to 33.0): the same staircase on the left third; on the right two thirds a telegraph trace: a horizontal time axis (grey), a cyan line drawn left to right in real time at 160 px per second of plate time, sitting at the upper level (aligned with the first excited step) and, at the jump, dropping vertically to the lower level in one frame and continuing flat. A 64 px amber readout above the trace counts elapsed time in milliseconds from 0.0 ms, with ticks every 0.5 ms.

What changes over time (27.5 to 33.0): 27.5 the plate cuts in with the ball on the upper step and the trace starting; 27.5 to 29.9 the trace runs flat at the upper level while the readout counts 0.0 to 2.1 ms (a slowed clock, 2.1 ms of plate time shown over 2.4 s; the label "slowed" sits under the readout at 28 px so nobody reads the clock as real time); at 29.9 the ball drops to the lower step and the trace steps down in the same frame, with a thud and an amber flash ring on the ball; 29.9 to 33.0 the trace runs flat at the lower level, the readout holds at "2.1 ms" and a 28 px label "one jump" appears at the step in the trace. The 2.1 ms is T1 from the fact-check row; the jump landing at the T1 mark is a schematic choice (a lifetime is a mean, not a fixed moment), and the label "slowed" plus the caption's wording keep it honest. If the Fact-Checker prefers, the readout counts to "about 2 ms" instead.

### Timeline plate (37.3 to 41.0)

Type: `timeline` (exists). A horizontal rail from 1980 to 2030, three marks: "ions 1986" (cyan), "photons 2007" (cyan), "sound 2026" (amber). The cursor moves from 1986 to 2007 to 2026 with a tick at each mark; the amber mark lights at 41.0 as the cut to the bell lands, so the last light is on the bell, not the plate.

## The big number

"2 ms", slam-in at 25.6 s as "two milliseconds" is spoken, amber 200 px, hold 1.0 s, unit flip at 26.6 s to "0.002 s" (definitional), hold 0.9 s, exit at 27.5 s. Thud on the slam, tick on the flip. This is the post's one big number; the 2.1 ms readout on the plate is a simulation readout. The years on the timeline are labels.

## End card (44.2 to 45.7 s)

QJ-01 held at its final zoom; the loop closes on the hook bell. Source line: "Science 393, 1217. 17 Sept 2026. Makihara, Szakiel, Safavi-Naeini; Stanford." Note: "Images: generated illustrations." Handle. Settle, bed fade.

## Stills list (4, all 9:16, flux-2-pro, resolution 2K)

| File | Prompt | Aspect | Used in |
|---|---|---|---|
| `assets/reel-quantum-jump-sound/QJ-01-bell-rim-struck.png` | The rim of a small brass bell an instant after being struck, the polished edge softened by vibration blur so it appears doubled, a dark charcoal studio background, lit by one warm lamp from the upper left and a faint cool rim light from the right, extreme macro, very shallow depth of field, the rim curving through the upper middle of the frame, the lower third dark and empty, no text, no letters, no watermark. | 9:16 | Hook 0.0 to 2.8; 5.6 to 8.9; 41.0 to 44.2; end card |
| `assets/reel-quantum-jump-sound/QJ-02-chip-suspended-beam.png` | An extreme macro photograph of a silicon microchip with a tiny suspended beam etched with a repeating pattern of holes, standing free over a dark trench, the silicon a cold blue-grey with fine crystalline texture, one thin gold electrode catching a warm reflection, the beam running diagonally across the upper half of the frame, shallow depth of field with its far end softly blurred, the lower third in deep shadow, no text, no letters, no watermark. | 9:16 | 2.8 to 5.6; 8.9 to 19.1 and 27.5 to 33.0 (under the staircase plate) |
| `assets/reel-quantum-jump-sound/QJ-03-chip-on-gold-mount.png` | A small dark silicon chip on a gold-plated copper sample holder, fine wire bonds arcing from its edges, sitting at the base of a cylindrical cryostat stage among gold surfaces and coaxial cables, a faint frost bloom on the metal, lit by one warm work lamp from above with cold blue ambient light from the sides, macro lens, the chip in the upper centre of the frame, the lower third dark, no text, no letters, no watermark. | 9:16 | 24.0 to 27.5; 33.0 to 37.3 |
| `assets/reel-quantum-jump-sound/QJ-04-dilution-fridge-stages.png` | The open interior of a dilution refrigerator, a tall stack of circular gold-plated plates hanging from thin rods, dense bundles of coaxial cables and copper braids running between the stages, faint cold mist at the lowest plate, a dark laboratory behind, lit by one warm lamp from the upper right with cool blue fill, medium lens from slightly below, the stack filling the upper two thirds of the frame, the lower third dark, no text, no letters, no watermark. | 9:16 | 19.1 to 24.0; 37.3 to 41.0 (under the timeline plate) |

Caption: line 1 the hook, line 2 "Science 393, 1217-1220, 17 Sept 2026, DOI 10.1126/science.aeh7535. Makihara, Szakiel, Safavi-Naeini and colleagues, Stanford.", then the spec body and hashtags.
