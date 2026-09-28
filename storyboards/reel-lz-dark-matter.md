# Storyboard: reel-lz-dark-matter

Spec: `scripts/reel-lz-dark-matter.json`. Voice: `production/assets/voice/reel-lz-dark-matter-voice.mp3` (47.6 s, about 164 wpm). Fact-check: `research/05-fact-check.md` row 9, GREEN if framed (one event, 248 keV nuclear recoil, 2.84 tonne-year exposure, 3.4 sigma local, 2.6 sigma global, about 0.5 percent chance from known backgrounds, 220 live days, above 200 GeV if a WIMP, "Not a discovery", preprint not yet peer-reviewed); wave 2 carried it unchanged. Post type: mechanism reveal, physics lane, with the debunk rule that "Not a discovery" is on screen. Bed A. Calendar: 11 Oct.

Logline: the LZ experiment reported one nuclear-recoil event at 248 keV in 220 live days; known backgrounds produce such an event about 0.5 percent of the time, 2.6 sigma global, far short of a discovery, and the paper is a preprint.

Track cut: remove "Here is what the LZ experiment reported on the first of September." (about 6.1 to 10.1 s) at the silences either side, and "Source in the caption." (about 46.3 to 47.6 s). The label at 5.7 s carries "LZ experiment, 1 Sept 2026" and the end card carries the source. Cut track about 41.6 s; total with the end card about 43.1 s. The preprint sentence stays in the voice.

Timings are estimates from word counts against the track length. The Editor aligns every row to the words JSON.

## Hook frame (0.0 s)

In frame: LZ-01, the inside of a tall cylindrical detector seen looking down its axis: a honeycomb of round dark photomultiplier faces at the bottom, each with a faint cyan reflection, under a column of perfectly clear liquid that shimmers very slightly, the walls a pale grey metal, a single warm amber reflection running around a metal ring near the top of the frame from one lamp, the honeycomb filling the upper middle of the 9:16 frame and the lower third falling to black. What moves: the liquid's shimmer (in the plate) and a push-in from 1.00 toward 1.08 on the centre of the honeycomb; the parallax plate on the honeycomb moves at 1.5 times the drift. There is no flash in the hook: the flash lands on "Once." Voice at 0.0 s: "Dark matter may have just hit a detector." Hook line up by 0.3 s, six words: **Dark matter may have hit. Once.** Motif at 0.0 s. Ambience: a deep, almost inaudible cavern hum, minus 24 dB, under the hook still only.

## Scene table

| Time (s) | On screen | Camera move | On-screen text (6 words max) | Voice (verbatim) | Sound |
|---|---|---|---|---|---|
| 0.0 to 2.7 | LZ-01 looking down into the vessel, parallax on | Push-in 1.00 to 1.05, focus [0.5, 0.40] | Hook line: Dark matter may have hit. Once. | Dark matter may have just hit a detector. | Motif; bed A in; cavern hum |
| 2.7 to 5.7 | LZ-02 close on a few photomultiplier faces in the liquid; at 3.0 s one point of cool white light flashes in the liquid and fades over 0.8 s (baked into the plate sequence at `flash=0.3`) | Push-in 1.00 to 1.06, focus on the flash point | Big number "1" slams at 3.0 s on "Once", flips at 4.4 s to "1 event", exits 5.6 s | Once. But this is not a discovery. | Thud on the slam (the flash and the number land together); tick on the flip |
| 5.7 to 6.1 | LZ-02 continues | Push-in continues | Not a discovery | (silence before the next sentence) | none |
| 6.1 to 14.1 | Cross-section wipe (0.40 s, upward) into the flash plate over LZ-01 at scrim 0.75 | Drift left 4 percent under the plate | Mechanism labels: 220 live days; 2.84 tonne-years; readout 248 keV | One event, a nuclear recoil at two hundred and forty eight kilo electron volts, over two hundred and twenty live days and a two point eight four tonne-year exposure. | Thud at 6.1; one tick on the flash; one tick as the readout lands; one tick per label |
| 14.1 to 16.1 | LZ-03 the vessel from outside: a tall pale cylinder in a dark cavern, cables, one warm lamp, plate gone | Drift right 5 percent | LZ experiment, 1 Sept 2026 | (end of the sentence and the silence) | none |
| 16.1 to 21.1 | LZ-03 continues | Push-in 1.00 to 1.08 | ~0.5% from known backgrounds | Known backgrounds produce an event like this about half a percent of the time. | none |
| 21.1 to 24.5 | LZ-02 photomultiplier faces, no flash (a still from the sequence before the flash, `--t 0.1`) | Drift left 4 percent | Not the chance it is real | That is not the chance dark matter is real. | none |
| 24.5 to 27.8 | LZ-02 continues | Push-in 1.00 to 1.06 | Chance ordinary physics did this | It is the chance ordinary physics did this anyway. | none |
| 27.8 to 33.5 | Hard cut to the sigma plate (timeline) over LZ-01 at scrim 0.8 | Drift right 4 percent under the plate | Mechanism labels: Local, 3.4 sigma; Global, 2.6 sigma | In sigma: three point four local, two point six global. Far short of a discovery. | Ticks as the cursor runs (under 12) |
| 33.5 to 38.9 | LZ-01 looking down, plate gone | Push-out 1.08 to 1.00 | If a WIMP: above 200 GeV | If it were a WIMP, its mass would be above two hundred G E V. | none |
| 38.9 to 41.6 | LZ-03 vessel from outside | Push-in 1.00 to 1.06 | Preprint. Not a discovery. | The paper is a preprint, not yet peer-reviewed. | Motif (payoff) at 38.9 |
| 41.6 to 43.1 | End card: LZ-01 held at 1.08 | Push-in continues to 1.10 | Source line (36 px): arXiv preprint, submitted to Physical Review Letters, 2026; not yet peer-reviewed. LZ dark matter experiment, press releases 1 Sept 2026. Note: Images: generated illustrations. | (silence) | Settle; bed fades 1.5 s |

"Not a discovery" is on screen twice (5.7 s and 38.9 s), per the required copy. "Xenon" and "10 tonnes" appear nowhere on screen (the spec's rule: the memo gives only the exposure); the vessel is drawn as a liquid detector without naming the liquid.

## Mechanism animations

### A. The flash (second hook, 6.1 to 14.1 s; renderer type `flash`, exists)

What is drawn: the existing `flash` plate: a dark rounded field with a 10 by 6 grid of photomultiplier discs (cyan at 14 percent), the "listening" label pulsing under it, then one event: a white core with an expanding amber ring at `x` 0.62, `y` 0.45, and the discs nearest the event lighting amber in proportion to their distance and fading over 1.2 s. Readout: "248 keV" with the label "one nuclear recoil" (existing `readout` and `label` fields). Two more 28 px labels, "220 live days" and "2.84 tonne-years", at the lower corners of the plate.

What changes over time: 6.1 to 6.5 wipe in, the grid fades up, "listening" pulses; 6.6, on "One event", the flash fires (`at` 0.5 local, a tick); the ring expands over 0.6 s and the near discs light and fade; 9.0, as "two hundred and forty eight" is spoken, the readout "248 keV" appears (addition to the type: `readoutAt`, local seconds, so the number lands on the word rather than on the flash; a tick); 10.6, on "two hundred and twenty live days", the label "220 live days" appears (tick); 12.6, on "two point eight four", the label "2.84 tonne-years" appears (tick). 14.1 the plate exits on a hard cut (the 8 s cap; the sentence's last words run over the LZ-03 still).

Additions to `flash` for the Animator: `readoutAt` and `labels:[{text,at,corner}]` (max two); both additive.

### B. The sigma rail (27.8 to 33.5 s; renderer type `timeline`, exists; hard-cut return)

What is drawn: a horizontal grey `--line` rail from 0 at the left to 4 at the right in sigma, unlabelled minor ticks every 0.5, the unit " sigma", one decimal. Two marks with 28 px labels: "Local, 3.4 sigma" (cyan, `--sim-dim` dimmed until lit) at 3.4 and "Global, 2.6 sigma" (amber) at 2.6. No threshold mark is drawn anywhere: the fact-check row gives no discovery threshold, so the rail's right end at 4 is a scale, unlabelled, and no "5" appears.

What changes over time: 27.8 the rail draws on (`enter` 0.4); 28.6, on "three point four local", the local mark lights cyan (tick), no cursor yet; 30.0, on "two point six global", the cursor (amber, glow) runs from 0 to 2.6 over 1.0 s with ticks at each 0.5 (five ticks) and the readout reads "2.6 sigma"; the global mark lights amber and the `.done` segment stays lit to 2.6 while the local mark sits further right, dimmer. 31.5 to 33.5 hold on "Far short of a discovery"; the cursor does not move. 33.5 the plate exits on a hard cut. Local versus global is the point of the plate: the honest number is the one the cursor stops at.

Numbers used: 248 keV, 220 live days, 2.84 tonne-years, 3.4 sigma local, 2.6 sigma global. About 0.5 percent and above 200 GeV are scene labels. All from row 9.

## The big number

"1", slam-in at 3.0 s exactly as "Once" is spoken and the baked flash fires in LZ-02, amber 200 px, 4 px shake, hold 1.4 s, unit flip at 4.4 s to "1 event" (a format change), hold to 5.5 s, exit at 5.6 s. Thud on the slam, tick on the flip. This is the only big number; 248 keV is the plate readout, 2.6 sigma is the rail readout, 0.5 percent and 200 GeV are labels. The spec's five counters collapse to this per the style bible.

## End card (41.6 to 43.1 s)

LZ-01 held at its final zoom so the loop closes on the hook still. Source line (two lines): "arXiv preprint, submitted to Physical Review Letters, 2026; not yet peer-reviewed. LZ dark matter experiment, press releases 1 Sept 2026." Note line: "Images: generated illustrations." Handle. Settle SFX, bed fade. Caption band empty. No authors are named because the fact-check row names none.

## PLATES LIST (4 renders from one new scene, 9:16, free)

| ID | Scene and args | Status | Used in |
|---|---|---|---|
| LZ-01 | `xenon-vessel --var view=interior --seed 31 --frames 90 --fps 30 --out-dir production/assets/reel-lz-dark-matter/LZ-01-seq` (3 s loop, the liquid shimmers; no flash) | NEW SCENE | Hook 0.0 to 2.7; 6.1 to 14.1 and 27.8 to 33.5 (under the plates); 33.5 to 38.9; end card |
| LZ-02 | `xenon-vessel --var view=pmt --var flash=0.3 --seed 31 --frames 105 --fps 30 --out-dir production/assets/reel-lz-dark-matter/LZ-02-seq` (3.5 s, one flash at 0.3 s that is fully faded by 1.5 s; the scene at 2.7 s starts at frame 0 so the flash lands at 3.0 s) | NEW SCENE | 2.7 to 6.1 |
| LZ-02b | `xenon-vessel --var view=pmt --seed 31 --t 0.1` (the same view, no flash) | NEW SCENE | 21.1 to 27.8 |
| LZ-03 | `xenon-vessel --var view=exterior --seed 31 --t 1.0` | NEW SCENE | 14.1 to 21.1; 38.9 to 41.6 |

No existing free plate fits. The scene is named for the liquid because that is what the detector is; the word does not appear on screen, per the spec.

### NEW SCENE SPEC: `xenon-vessel` (three.js)

- Name and options: `xenon-vessel`, `--var view=interior` (default) | `pmt` | `exterior`; `--var flash=<seconds>` (omit for no flash).
- What is drawn: a tall cylindrical two-phase liquid detector reduced to its honest parts. The vessel wall: an open cylinder (CylinderGeometry radius 1.0, height 2.4, 96 segments, open ends, back-face rendered) in a pale brushed metal (MeshStandardMaterial #b9c2cc, metalness 0.9, roughness 0.45) with a faint ring of thin horizontal field-shaping rings (instanced tori every 0.08 units, copper-toned #b87333 at low intensity) down its inside; at the top and bottom, a hexagonally packed array of photomultiplier faces: 61 discs (a 5-ring hexagonal packing, radius 0.09 each, CylinderGeometry) with dark grey glass faces (MeshPhysicalMaterial #1d2431, roughness 0.05, clearcoat 1, reflecting the environment) set in a dark grey holder plate. The count is a packing choice and is never spoken or labelled. The liquid: a transparent column (a second cylinder, MeshPhysicalMaterial transmission 0.95, ior 1.4, thickness 1.5, colour #e8f4ff), its surface a plane with a 1-octave `fbm` ripple at 0.5 percent amplitude (the shimmer). One warm source: an amber lamp (point light, upper left, intensity 1.6) that lands as a single warm reflection on the top field-shaping ring and the upper vessel wall, and nowhere else. Cool fill: a cyan hemisphere at 0.12 from below so the PMT faces carry faint cyan reflections. The flash: at `flash` seconds a small white-cyan sphere (radius 0.02, emissive #eaffff) plus a point light (cool white, intensity rising to 4 over 120 ms, decaying to 0 over 800 ms with ease-out) and an additive halo sprite expanding from 0 to 0.5 units over 600 ms at falling opacity, placed in the liquid at 62 percent of the frame width and 45 percent of the plate height as seen by the camera; the PMT faces nearest the flash brighten through the reflected light. The flash is drawn cool, not warm, so the one-warm-source rule holds and the scintillation is not dressed as fire.
  - `interior`: the camera inside the vessel near the top, looking down the axis: the bottom PMT honeycomb fills the upper middle of the frame through the liquid, the walls converge around it, the top ring's warm reflection crosses the upper edge, the lower third is the near wall falling to black.
  - `pmt`: the camera 0.3 units above the bottom array at a 20-degree tilt, four to six faces sharp across the upper half of the frame, the liquid above them, the rest blurred (far pass blurred 20 px in 2D).
  - `exterior`: the vessel from outside in a dark cavern: the pale cylinder (closed, with an outer jacket cylinder radius 1.3 and a domed top) standing on a dark frame, a few thick grey cables leaving its top toward the upper right, rock walls as a dark displaced plane behind (`fbm`, `--grade-black`), the amber lamp at the upper left making one warm highlight down the jacket's edge, the lower third dark floor.
- Lighting: as above: one amber lamp, a cyan hemisphere fill, the flash's own cool light when it fires. Lower third under 12 percent luminance.
- Camera: 24 mm equivalent for `interior` (the wide look down), 70 mm for `pmt`, 35 mm for `exterior`; subject at 0.40 of frame height.
- What varies with t: the liquid surface ripple (seeded `fbm`, slow), a very faint drift of the transmitted refraction, the flash (only when `flash` is set), a 2 percent slow dolly over 3 s. No other motion: a sealed detector does not move.
- Subject-only alpha layer: `interior` and `pmt`: the PMT honeycomb (and the flash sphere and halo when present); `exterior`: the vessel with its jacket and cables, no rock.
- Budget: under 120k triangles (the 122 PMTs are instanced); about 3 to 4 s per frame.

Caption: line 1 the hook, line 2 "arXiv preprint, submitted to Physical Review Letters, 2026; not yet peer-reviewed. LZ dark matter experiment, 1 Sept 2026.", then the spec body (one nuclear recoil at 248 keV, 2.84 tonne-years, 220 live days, about 0.5 percent from known backgrounds, 2.6 sigma global, not a discovery) and hashtags.
