# Storyboard: reel-two-brains

Spec: `scripts/reel-two-brains.json`. Voice: `production/assets/voice/reel-two-brains-voice.mp3` (47.5 s, about 143 wpm). Fact-check: `research/05-fact-check.md` row 1, AMBER ("two cell lineages that never mix, traced in mouse embryos"; not "two organs"; the caveat is spoken and on screen). Post type: mechanism reveal, brain lane. Bed A.

Logline: two stem-cell lineages, Otx2 and Gbx2, build the brain and stay separate from gastrulation onward, traced in mouse embryos, with the same split in chicks, zebrafish and acorn worms.

Track cut: remove the second sentence, "That is the finding from Stanford this month." (about 4.6 to 8.0 s), at the silences on both sides, and the last sentence, "Source in the caption." (about 45.6 to 47.5 s). Stanford goes on the end card. Cut track about 42.2 s; total with the end card about 43.7 s. Times below are in the cut track. The Editor listens to the join at 4.6 s; if it is audible, regenerate the first two sentences as one line instead.

Timings are estimates from word counts against the track length; the Editor aligns every row to the words JSON.

## Hook frame (0.0 s)

In frame: TB-01, a mouse embryo under a fluorescence microscope, the developing brain region at the head end glowing in two colours that meet at a sharp boundary, cyan toward the front, amber toward the back, the rest of the embryo a faint grey outline on a black field, the embryo curled across the upper middle of the 9:16 frame, the lower third black. What moves: push-in 1.00 toward 1.08 on the colour boundary; parallax plate on the embryo. Voice at 0.0 s: "Your brain is built by two cell lineages...". Hook line up by 0.3 s, five words: **Two lineages build your brain**. Motif at 0.0 s. No ambience.

## Scene table

| Time (s) | On screen | Camera move | On-screen text (6 words max) | Voice (verbatim) | Sound |
|---|---|---|---|---|---|
| 0.0 to 2.8 | TB-01 embryo, two-colour brain region, parallax on | Push-in 1.00 to 1.06, focus on the boundary | Hook line: Two lineages build your brain | Your brain is built by two cell lineages | Motif; bed A in |
| 2.8 to 4.6 | TB-01 continues; a dashed cyan line draws along the colour boundary over 0.4 s (code overlay) | Push-in 1.06 to 1.09 | They never mix | that never mix. | Tick as the line completes |
| 4.6 to 8.5 | TB-02 early mouse embryo at gastrulation, dark-field microscopy, a cup-shaped cluster of cells | Push-in 1.00 to 1.10 | Mouse embryo, at gastrulation | In the mouse embryo, two separate populations of stem cells build the brain, | none |
| 8.5 to 12.8 | Cross-section wipe (0.40 s, upward) into the lineage plate over TB-02 at scrim 0.8 | Drift right 4 percent under the plate | Mechanism labels: gastrulation; Otx2; Gbx2 | and they are separate from gastrulation onward. | Thud at 8.5; ticks as each tree starts |
| 12.8 to 18.1 | TB-03 the front of the embryonic brain, forebrain and midbrain, glowing cyan | Drift left 5 percent | Otx2: forebrain and midbrain | One group, marked by a gene called Otx2, builds the forebrain and midbrain. | none |
| 18.1 to 21.6 | TB-04 the hindbrain region, glowing amber | Drift right 5 percent | Gbx2: hindbrain | The other, marked by Gbx2, builds the hindbrain. | none |
| 21.6 to 25.4 | Lineage plate returns on a hard cut over TB-01 at scrim 0.8, trees fully grown, the base of each trunk pulsing in its colour | Push-in 1.00 to 1.06 | Different chromatin states, from the start | They carry different chromatin states from the earliest stages. | One tick per pulse, two total |
| 25.4 to 29.5 | TB-05 zebrafish embryo, transparent, the eye and brain visible | Push-in 1.00 to 1.10 | Chick, zebrafish, acorn worm | The same split shows up in chicks, zebrafish and acorn worms, | none |
| 29.5 to 34.3 | TB-06 acorn worm on dark sand | Drift left 4 percent | Big number: "550,000,000" counts up over 1.2 s from 30.4 s, flips to "550 million years" at 32.0 s, exits 33.6 s | lineages that diverged around five hundred and fifty million years ago. | Ticks on the count (nine), tick on the flip |
| 34.3 to 39.2 | TB-01 embryo | Push-in 1.09 to 1.13 | One caveat (34.3 to 35.6), then: Two lineages, traced in mice | One caveat. The paper describes two cell lineages, traced in mice. | Motif (payoff) at 34.3 |
| 39.2 to 42.2 | TB-01 held | Push-in 1.13 to 1.15 | "Two organs" is press framing | Two organs is the press release talking. | none |
| 42.2 to 43.7 | End card: TB-01 held at 1.15 | Push-in continues to 1.16 | Source line: Nature Neuroscience, 18 Sept 2026. Dundes, Jokhai, Loh; Stanford Medicine. Note: Images: generated illustrations. | (silence) | Settle; bed fades 1.5 s |

## Mechanism animation (second hook, 8.5 to 12.8 s, returns 21.6 to 25.4 s)

Type: `lineage` (exists in the renderer; seeded branching, two colours), with a root marker added.

What is drawn: a horizontal grey `--line` baseline near the bottom of the plate labelled "gastrulation" at 28 px, centred. From two points on that line, 234 px and 702 px from the left edge of the plate, two branching trees grow upward: the left tree cyan, labelled "Otx2" under its root, the right tree amber, labelled "Gbx2". A vertical dashed grey divider between them from the baseline to the top of the plate (the existing 8 12 dash). The trees never cross the divider (the existing side clamps enforce it). Depth 5.

What changes over time: 8.5 to 8.9 wipe in, the baseline and the divider draw on; 8.9 the two root points light with a tick each; 8.9 to 12.4 the segments grow in birth order (ease-out per segment, the existing `data-b` timing), the cyan tree slightly ahead of the amber; 12.4 to 12.8 the plate holds fully grown. On the return at 21.6 the plate is already fully grown; the base of each trunk pulses once in its own colour at 22.2 and 23.4 (the "different chromatin states" beat is spoken, not drawn; the pulse is only emphasis). No readout number in this plate; it draws a topology, not a quantity.

What the numbers do: none. The 550 million years is the big number in a later scene.

## The big number

"550,000,000", count-up from 0 starting at 30.4 s as "five hundred and fifty million" begins, 1.2 s with ease-out and nine ticks, hold to 32.0 s, format flip to "550 million years" (two words at 120 px), hold 1.6 s, exit at 33.6 s. No other text element while it is up. This is the post's one big number.

## End card (42.2 to 43.7 s)

TB-01 held at its final zoom; the loop closes on the hook still. Source line: "Nature Neuroscience, 18 Sept 2026. Dundes, Jokhai, Loh; Stanford Medicine." Note: "Images: generated illustrations." Handle. Settle, bed fade.

## Stills list (6, all 9:16, flux-2-pro, resolution 2K)

| File | Prompt | Aspect | Used in |
|---|---|---|---|
| `assets/reel-two-brains/TB-01-embryo-two-colours.png` | A mouse embryo under a fluorescence microscope, its curled body a faint grey translucent outline on a black field, the developing brain at the head end glowing in two colours that meet at a crisp boundary, cool cyan toward the front of the head and warm amber toward the back, fine cellular texture, shallow depth of field, the embryo filling the upper middle of the frame, the lower third black and empty, no text, no letters, no watermark. | 9:16 | Hook 0.0 to 4.6; 21.6 to 25.4 (under the plate); 34.3 to 42.2; end card |
| `assets/reel-two-brains/TB-02-embryo-gastrulation.png` | A very early mouse embryo at the gastrulation stage, a small elongated cup-shaped cluster of cells with a visible inner cavity, photographed in dark-field microscopy so the cells glow pale silver-blue against pure black, individual rounded cells resolved on the surface, one subtle warm highlight along one side of the cluster, shallow depth of field, the embryo in the upper half of the frame and the lower third black, no text, no letters, no watermark. | 9:16 | 4.6 to 8.5; 8.5 to 12.8 (under the plate) |
| `assets/reel-two-brains/TB-03-forebrain-midbrain-cyan.png` | The front of a developing embryonic brain seen in close-up under a fluorescence microscope, the forebrain and midbrain vesicles glowing a luminous cyan with fine cellular grain, the rest of the tissue a faint dark grey, a black background, the glowing tissue curving across the upper two thirds of the frame, shallow depth of field with a soft bloom on the brightest cells, the lower third of the frame black and empty, no text, no letters, no watermark. | 9:16 | 12.8 to 18.1 |
| `assets/reel-two-brains/TB-04-hindbrain-amber.png` | The hindbrain of a developing embryo seen in close-up under a fluorescence microscope, a segmented tube-like region glowing warm amber with fine cellular grain, tapering into the faint grey outline of the spinal cord, black background, the glowing tissue crossing the upper two thirds of the frame diagonally, shallow depth of field with a soft bloom on the brightest cells, the lower third of the frame black and empty, no text, no letters, no watermark. | 9:16 | 18.1 to 21.6 |
| `assets/reel-two-brains/TB-05-zebrafish-embryo.png` | A transparent zebrafish embryo a few days old photographed through a stereo microscope, its large dark eye and the clear tissue of its developing brain visible through the skin, a yolk sac below, faint cyan and amber highlights within the head from the illumination, the body curving across the upper middle of the frame on a black field, shallow depth of field, the lower third of the frame black and empty, no text, no letters, no watermark. | 9:16 | 25.4 to 29.5 |
| `assets/reel-two-brains/TB-06-acorn-worm.png` | An acorn worm, a soft pale orange marine worm with a rounded acorn-shaped proboscis and a darker collar behind it, lying half-buried in dark fine sand on the seafloor, lit by a single warm beam from above with cold blue water fading to black behind, fine particles drifting in the light, macro underwater photograph with shallow depth of field, the animal in the upper half of the frame and the lower third dark sand, no text, no letters, no watermark. | 9:16 | 29.5 to 34.3 |

Caption: line 1 the hook, line 2 "Nature Neuroscience, 18 Sept 2026. Dundes, Jokhai, Loh and colleagues, Stanford Medicine.", then the spec body (including the "two organs is press framing" line) and hashtags.
