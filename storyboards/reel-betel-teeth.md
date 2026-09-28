# Storyboard: reel-betel-teeth

Spec: `scripts/reel-betel-teeth.json`. Voice: `production/assets/voice/reel-betel-teeth-voice.mp3` (48.3 s, about 143 wpm). Fact-check: `research/05-fact-check.md` row 2, AMBER ("up to 25,000", "may be the earliest evidence", n = 2, betel is a mild stimulant and the fourth most widely used psychoactive substance). Post type: debunk (the headline versus the range). Bed A. Calendar: 14 Oct, Trial Reel.

Logline: two forager skeletons from Sulawesi carry a new tooth-wear pattern and traces of arecoline from betel nut; the older one is dated 16,000 to 25,000 years, and the headlines quote the top of the range.

Track cut: remove the last two sentences, "Griffith University, Science Advances, ninth of September." and "Source in the caption." (about 43.7 to 48.3 s), at the silence before "Griffith". The end card carries both. Cut track about 43.3 s; total with the end card about 44.8 s.

Timings below are estimates from word counts against the track length. The Editor aligns every row to the words JSON before render and moves cuts to the nearest word boundary.

## Hook frame (0.0 s)

In frame: BT-01, a single human molar seen through a macro lens, its crown filling the upper middle of the 9:16 frame, the enamel ivory-cream with dark fissures between four cusps and a flat worn facet on one side, lit by one warm amber lamp raking from the upper left so every groove throws a shadow, a cool cyan fill from the right, black velvet below fading to nothing in the lower third. What moves: push-in from scale 1.00 toward 1.08 centred on the worn facet; the parallax plate on the tooth moves at 1.5 times the drift so the dust motes in the beam slide behind it. Voice at 0.0 s: "The headline says humans got high...". First text line, up by 0.3 s, five words: **The headline says 25,000 years**. Motif at 0.0 s. No ambience (a bench in silence).

## Scene table

| Time (s) | On screen | Camera move | On-screen text (6 words max) | Voice (verbatim) | Sound |
|---|---|---|---|---|---|
| 0.0 to 2.4 | BT-01 molar crown, parallax plate on | Push-in 1.00 to 1.05, focus [0.5, 0.40] | Hook line: The headline says 25,000 years | The headline says humans got high | Motif; bed A in |
| 2.4 to 5.6 | BT-01 continues | Push-in 1.05 to 1.08 | Big number "25,000" counts up from 2.4 s as "twenty five thousand" is spoken; flips at 3.9 s to "16,000 to 25,000"; exits 5.6 s | twenty five thousand years ago. Here is what | Thud on the landing; one tick on the flip |
| 5.6 to 7.7 | BT-02 worn facet under raking light | Drift left 4 percent | (none) | is actually behind it. | none |
| 7.7 to 13.4 | Cross-section wipe (0.40 s, upward) into the timeline plate over BT-03 (two teeth side by side on dark cloth), scrim 0.75 | Push-in 1.00 to 1.06 under the plate | Mechanism labels: Younger, about 7,000 yr; Older, 16,000 to 25,000 yr | Two forager skeletons from Sulawesi, in Indonesia. Two. That is the whole sample. | Thud at 7.7; one tick as each mark lights (two ticks) |
| 13.4 to 18.2 | BT-02 worn facet, plate gone | Push-in 1.00 to 1.10, focus on the striations | A wear pattern never described | Their teeth show a wear pattern nobody had described before, | none |
| 18.2 to 22.4 | BT-01 molar crown | Drift right 5 percent | Arecoline, from betel nut | plus chemical traces of arecoline, which comes from betel nut, | none |
| 22.4 to 26.1 | BT-03 two teeth | Push-out 1.06 to 1.00 | Fourth most used psychoactive substance | today the world's fourth most used psychoactive substance, a mild stimulant. | none |
| 26.1 to 27.6 | BT-02 facet | Drift left 3 percent | The date | Now the date. | none |
| 27.6 to 36.4 | Hard cut back to the timeline plate over BT-03 at scrim 0.8; the range fills from 16,000 to 25,000 and the "headline" mark lights at the top | Drift right 4 percent under the plate | Mechanism labels: 16,000 yr; 25,000 yr, the headline | The older skeleton is dated somewhere between sixteen thousand and twenty five thousand years. The headlines quote the top of that range. | Ticks as the readout climbs (under 12); one tick as the headline mark lights at 33.3 |
| 36.4 to 43.3 | BT-01 molar crown, plate gone | Push-in 1.08 to 1.12 | May be the earliest evidence | Even so, the authors say it may be the earliest evidence of drug use found so far. | Motif (payoff) at 36.8 |
| 43.3 to 44.8 | End card: BT-01 held at 1.12 | Push-in continues to 1.14 | Source line (36 px): Science Advances, 9 Sept 2026. Brumm, Griffith University; Papke, University of Florida. Note: Images: generated illustrations. | (silence) | Settle; bed fades 1.5 s |

Hook line check: "The headline says 25,000 years" is five words; it is the claim quoted as a headline, which the debunk pacing row allows for 3 s at most (it leaves at 1.5 s).

## Mechanism animation (second hook, 7.7 to 13.4 s; returns 27.6 to 36.4 s)

Type: `timeline` (exists in the renderer) with two small additions noted below.

What is drawn: a horizontal grey `--line` rail 936 px wide, linear in years before present, from 0 at the right to 30,000 at the left (so "older" reads leftward, deeper in time), unlabelled minor ticks every 5,000 years at 28 px. Three marks, each a 6 px vertical line with a 28 px label above: "Younger, about 7,000 yr" (cyan) at 7,000; "Older, 16,000 to 25,000 yr" (cyan) drawn as two short lines at 16,000 and 25,000 joined by a dim `--sim-dim` bracket above them; "The headline" (amber) at 25,000, drawn on the return only. A 64 px amber readout above the rail.

First visit (7.7 to 13.4): 7.7 to 8.1 wipe in, the rail draws on right to left (ease-out); 8.6 the younger mark lights (tick), readout "1 individual"; 10.7, on the word "Two", the older bracket lights (tick), readout rolls to "2 individuals" and holds. No cursor. This is the sample size drawn as two objects on a scale, not as a bar and not as a chart; the readout is the n.

Return (27.6 to 36.4, hard cut, `enter` 0): the same rail with both marks lit and the readout blank. 27.6 to 31.6 the cursor (amber, with the glow) travels from 16,000 to 25,000 and the `.done` segment fills the rail between them, so the range becomes a bright band; the readout counts 16,000 up to 25,000 in the renderer's grouped digits with ticks at each 2,000 (five ticks). 31.6 to 33.3 hold at 25,000. 33.3, on "The headlines quote the top", the amber "The headline" mark at 25,000 lights and pulses once per second while the 16,000 mark stays cyan and the band stays lit; the readout holds "25,000 yr". 36.4 the plate exits on a hard cut.

Additions to `timeline` for the Animator: (1) `cursor` optional, so the first visit draws marks with no cursor; (2) `readout` may be given as text (`"1 individual"`, `"2 individuals"`) keyed to `ticks[].at`, in addition to the numeric cursor readout; (3) a `bracket` between two tick values, drawn as the `--sim-dim` line above the rail. All three are small and additive.

Numbers used: about 7,000; 16,000; 25,000; n = 2. All from the fact-check row. The rail end at 30,000 is the scale, unlabelled.

## The big number

"25,000", count-up from 0 to 25,000 over 0.9 s starting at 2.4 s as "twenty five thousand" is spoken, amber 200 px, ticks on each digit group (under 12), hold to 3.9 s, then one flip (6-frame vertical roll) to "16,000 to 25,000" at 120 px on one line (the same quantity, the skeleton's date, read honestly as the range from the fact-check row; a format change of the same reading, not a new number), hold to 5.4 s, exit at 5.6 s with the 6-frame fade. Thud on the landing, tick on the flip. This is the only big number; the "2" in the plate is a simulation readout at 64 px.

## End card (43.3 to 44.8 s)

BT-01 held at its final zoom so the loop closes on the hook still. Source line: "Science Advances, 9 Sept 2026. Brumm, Griffith University; Papke, University of Florida." Note line: "Images: generated illustrations." Handle. Settle SFX, bed fade. Caption band empty.

## PLATES LIST (3 renders, all from one new scene, 9:16, free)

| ID | Scene and args | Status | Used in |
|---|---|---|---|
| BT-01 | `tooth-macro --var view=crown --seed 3 --frames 90 --fps 30 --out-dir production/assets/reel-betel-teeth/BT-01-seq` (3 s loop; single still `--t 1.0` for the cover check) | NEW SCENE | Hook 0.0 to 5.6; 18.2 to 22.4; 36.4 to 43.3; end card |
| BT-02 | `tooth-macro --var view=groove --seed 3 --t 1.0` | NEW SCENE | 5.6 to 7.7; 13.4 to 18.2; 26.1 to 27.6 |
| BT-03 | `tooth-macro --var view=pair --seed 5 --t 2.0` | NEW SCENE | 7.7 to 13.4 (under the plate); 22.4 to 26.1; 27.6 to 36.4 (under the plate) |

No existing free plate fits (the eight existing scenes are an amoeba, a hot stream, a disk, Earth, an embryo, a chip, an organoid). One new scene with three views covers the whole Reel.

### NEW SCENE SPEC: `tooth-macro` (three.js)

- Name and options: `tooth-macro`, `--var view=crown` (default) | `groove` | `pair`.
- What is drawn: one human molar built from primitives: a rounded box (BoxGeometry, 64 segments per side, corners rounded by normalising toward a sphere at radius 0.55) displaced along its normals by low-frequency `fbm` to raise four cusps on the top face and a slight waist at the neck; the top face carries a canvas-drawn occlusal texture: ivory-cream enamel (#e8dcc4 base, warmer #d9c39a toward the neck), dark fissure lines between the cusps drawn as three branching polylines 4 to 8 px wide in a deep brown-grey, and one flat worn facet on the lingual side (a plane cut into the displacement at 12 degrees) carrying fine parallel striations (120 lines, 1 px, alternating plus and minus 6 percent luminance) so raking light reads them as micro-relief. Material: MeshPhysicalMaterial, roughness 0.35, clearcoat 0.4 (wet enamel), a faint subsurface tint by mixing a warm emissive of 4 percent near the rim (Fresnel term in a small onBeforeCompile patch, no external shader files). The root is not shown: the crown sits in a shallow dark matte cup (a black torus segment) that reads as the dark cloth of a bench. Background: `--grade-black` #0a1224 vignetted to near black; no horizon.
  - `crown`: the crown fills the upper middle of the frame, seen from 30 degrees above, the worn facet toward the camera at the left.
  - `groove`: the camera is 2.5 times closer, on the worn facet, so the striations and the nearest fissure cross the upper half of the frame diagonally; depth of field is simulated by rendering the far third of the tooth to a second pass and blurring it 18 px in 2D before compositing.
  - `pair`: two crowns side by side on the cloth, the nearer one lower left at 1.0 scale, the further one upper right at 0.8 scale and 35 percent dimmer, the further one with a slightly different `fbm` seed so they are not twins; nothing is implied about which is older.
- Lighting: one warm key (amber #ffb020 point light, intensity 2.2, upper left, 25 degrees above the surface so it rakes across the facet), one cool fill (cyan-blue #4fe3f0 at 0.25 from the right), a dim hemisphere at 0.08. Lower third under 12 percent luminance before the grade.
- Camera: 60 mm equivalent macro, subject at 0.42 of frame height in `crown` and `pair`, at 0.45 in `groove`; a 2 percent slow dolly over 3 s baked in so a hook loop already moves.
- What varies with t: the dolly (2 percent over 3 s, then hold), 40 dust motes drifting slowly through the key beam (seeded positions, sinusoidal drift, additive 2D layer), a 3 percent slow breathe in the key intensity. No geometry changes with t.
- Subject-only alpha layer: the tooth (both crowns in `pair`) with its shading, no cup, no motes, no background; the parallax plate uses it in the hook.
- Budget: about 60k triangles per crown; 2D texture 2048 px; under 4 s per frame in SwiftShader.

Caption: line 1 the hook, line 2 "Science Advances, 9 Sept 2026. Brumm, Griffith University; Papke, University of Florida.", then the spec body and hashtags. Caveats stay as in the spec: n = 2, the date is a range, "may be".
