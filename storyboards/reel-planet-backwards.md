# Storyboard: reel-planet-backwards

Spec: `scripts/reel-planet-backwards.json`. Voice: `production/assets/voice/reel-planet-backwards-voice.mp3` (50.2 s, about 154 wpm). Fact-check: `research/06-fact-check-wave2.md` row 16, GREEN (hook AMBER: "tilted about 136 degrees, past sideways, into backwards", never "completely backward"; "first retrograde planet found around a red dwarf", not "first backwards planet ever"). Post type: mechanism reveal, space lane. Bed A. Calendar: 22 Oct, Trial Reel.

Logline: GJ 3090 b, a sub-Neptune 73 light-years away, orbits its red dwarf on a path tilted about 136 degrees to the star's spin, past sideways into backwards; the first retrograde planet found around a red dwarf, with no known companion to explain it.

Track cut: remove the last three sentences, "Yann Carteret and colleagues, University of Geneva, with the NIRPS spectrograph in Chile.", "Astronomy and Astrophysics, September twenty twenty six." and "Source in the caption." (about 40.7 to 50.2 s), at the silence before "Yann". The end card carries the credit and the journal. Cut track about 40.4 s; total with the end card about 41.9 s. The Reel ends on "no known companion explains how it got there", the open question already spoken as a statement.

Timings are estimates from word counts against the track length. The Editor aligns every row to the words JSON.

## Hook frame (0.0 s)

In frame: PB-01, a small deep-orange star with a soft flare, and a hazy blue-grey planet on a thin bright orbit line that is tilted steeply, the planet at the near side of its path in the upper middle of the 9:16 frame, the star behind it at the upper left, the orbit a glowing ellipse cutting across the star's faint equatorial band at a sharp angle, stars behind, the lower third black space. What moves: the planet is already moving along the orbit in the plate (a sequence), plus a push-in from 1.00 toward 1.08 on the planet; the parallax plate on the planet moves at 1.5 times the drift. Voice at 0.0 s: "There is a planet orbiting its star backwards, and tilted." Hook line up by 0.3 s, six words: **This planet orbits its star backwards**. Motif at 0.0 s. No ambience (space).

## Scene table

| Time (s) | On screen | Camera move | On-screen text (6 words max) | Voice (verbatim) | Sound |
|---|---|---|---|---|---|
| 0.0 to 2.9 | PB-01 the tilted orbit, wide, parallax on | Push-in 1.00 to 1.05, focus [0.5, 0.40] | Hook line: This planet orbits its star backwards | There is a planet orbiting its star | Motif; bed A in |
| 2.9 to 4.0 | PB-01 continues | Push-in 1.05 to 1.08 | (none) | backwards, and tilted. | none |
| 4.0 to 9.8 | PB-02 Earth as a whole globe from far out, the sun at the upper right, the terminator crossing it | Drift right 5 percent (the globe's rotation is in the plate) | Our planets: one direction | Every planet in our solar system goes round in the same direction the Sun spins. | none |
| 9.8 to 15.8 | Cross-section wipe (0.40 s, upward) into the orbit plate over PB-01 at scrim 0.75: the orbit starts aligned with the star's spin and tilts over until the planet runs against it | Drift left 4 percent under the plate | Mechanism labels: Star spin; Orbit; GJ 3090 b | This one does not. G J three zero nine zero b sits seventy three light-years | Thud at 9.8; one tick when the orbit crosses sideways; one thud when the direction reverses |
| 15.8 to 18.2 | PB-03 the planet close: a hazy blue-grey limb, the small red star behind it, plate gone | Push-in 1.00 to 1.08, focus on the limb | 73 light-years, a red dwarf | away, around a red dwarf star. | none |
| 18.2 to 21.5 | PB-03 continues | Push-in 1.08 to 1.12 | 2.2 x Earth's radius | It is about two point two times Earth's radius, | none |
| 21.5 to 24.2 | PB-04 the planet from further out, the star's equatorial band visible, the orbit line crossing it | Drift right 4 percent | 4.5 x Earth's mass | four and a half times its mass, | none |
| 24.2 to 27.3 | PB-01 wide | Push-out 1.08 to 1.00 | A 2.9-day year | and its year lasts two point nine days. | none |
| 27.3 to 33.1 | PB-04 the star's band and the crossing orbit | Push-in 1.00 to 1.08, focus on the crossing | Big number "136°" slams at 30.3 s as "thirty six degrees" is spoken, flips at 31.7 s to "136 degrees", exits 33.0 s | Its orbit is tilted about one hundred and thirty six degrees: past sideways, into backwards. | Thud on the slam; tick on the flip |
| 33.1 to 37.0 | PB-01 wide | Drift left 4 percent | First retrograde planet, red dwarf | It is the first retrograde planet found around a red dwarf, | Motif (payoff) at 33.1 |
| 37.0 to 40.4 | PB-03 planet close | Push-in 1.08 to 1.12 | No known companion | and no known companion explains how it got there. | none |
| 40.4 to 41.9 | End card: PB-01 held at 1.12 | Push-in continues to 1.14 | Source line (36 px): Astronomy & Astrophysics, Sept 2026; arXiv 2609.24870. Carteret, University of Geneva; NIRPS, La Silla. Note: Images: generated illustrations. | (silence) | Settle; bed fades 1.5 s |

Wording guard: no frame says "completely backward" or "180 degrees"; the label at 33.1 s says "red dwarf" in the same breath as "first". The scene labels 18.2 to 27.3 carry the three verified size numbers one at a time, one label per scene, each at a cut.

## Mechanism animation (second hook, 9.8 to 15.8 s)

Type: `orbit` (exists in the renderer) with one addition, an obliquity sweep, described exactly here.

What is drawn: the star at the centre of the plate (the existing star glow, drawn deep orange for a red dwarf, radius 78) with its spin arc and arrow (existing `starSpin`, the arrow running left to right across the near side, the star's equator drawn as a faint horizontal `--sim-dim` band through the star). One planet (existing `planets`, `r` 300, `size` 22, colour amber, `label` "GJ 3090 b") on an orbit ellipse (existing, rx 300, ry 300 times `tilt` 0.32) with the amber trail. Labels: "Star spin" beside the arrow, "Orbit" at the ellipse's left end, "GJ 3090 b" beside the planet (three, the maximum). No readout on this plate: the angle is spoken later and lands as the big number.

New field `obliquity:{from:0,to:136,at,dur}`: the orbit ellipse (and the planet's path on it) is rotated in the plate plane about the star by the current angle, sweeping from `from` to `to` with ease-in-out over `dur` starting at `at`. The planet keeps the same parametric sense along its ellipse throughout. In a 2D projection this is exact: rotating the path by more than 90 degrees reverses the horizontal component of the planet's velocity on the near side, so once the sweep passes 90 the planet visibly runs against the star's spin arrow. The ellipse's dash pattern switches from solid to the existing retrograde dash (`retrograde` becomes true) at the frame the sweep crosses 90 degrees.

What changes over time:
- 9.8 to 10.2: wipe in; star, spin arrow, equator band and the orbit ellipse draw on with `obliquity` at 0 (the orbit aligned with the spin, the planet moving the same way as the arrow).
- 10.2 to 11.3 ("This one does not."): the planet completes about a third of a revolution prograde (period 6 s) so the viewer sees agreement first.
- 11.3 to 14.3: the sweep runs 0 to 136 degrees over 3.0 s; a tick at 90 (sideways, about 13.3 s); a thud at the frame the sweep crosses 90 and the dash pattern flips; the planet keeps moving throughout, its trail bending with the path.
- 14.3 to 15.8: hold at 136; the planet runs against the arrow. 15.8 the plate exits on a hard cut.

Numbers used: 136 degrees (the sweep's end, unlabelled on the plate; it lands as the big number at 30.3 s). Period 6 s and radius 300 px are drawing scale, not the 2.9-day year or an orbital distance; the plate does not label distance. The star's tilt value 0.32 is the projection angle, not the obliquity.

## The big number

"136°", slam-in at 30.3 s as "thirty six degrees" is spoken, amber 200 px, 4 px shake, hold 1.4 s, unit flip at 31.7 s to "136 degrees" (a format change), hold to 32.9 s, exit at 33.0 s. Thud on the slam, tick on the flip. This is the only big number; "73 light-years", "2.2 x Earth's radius", "4.5 x Earth's mass" and "A 2.9-day year" are scene labels. The obliquity's stated uncertainty (+24, minus 18) is in the fact-check row and may be spoken by the caption; it is not put on screen as a second figure.

## End card (40.4 to 41.9 s)

PB-01 held at its final zoom so the loop closes on the hook still. Source line (two lines): "Astronomy & Astrophysics, Sept 2026; arXiv 2609.24870. Carteret, University of Geneva; NIRPS, La Silla." Note line: "Images: generated illustrations." Handle. Settle SFX, bed fade. Caption band empty.

## PLATES LIST (4 renders: 3 from one new scene, 1 existing, 9:16, free)

| ID | Scene and args | Status | Used in |
|---|---|---|---|
| PB-01 | `tilted-orbit --var view=wide --var tilt=136 --seed 21 --frames 90 --fps 30 --out-dir production/assets/reel-planet-backwards/PB-01-seq` (3 s loop, the planet moves along the orbit) | NEW SCENE | Hook 0.0 to 4.0; 9.8 to 15.8 (under the plate); 24.2 to 27.3; 33.1 to 37.0; end card |
| PB-02 | `earth-limb --var view=globe --t 1.0 --seed 1` | EXISTS | 4.0 to 9.8 |
| PB-03 | `tilted-orbit --var view=planet --var tilt=136 --seed 21 --t 1.0` | NEW SCENE | 15.8 to 21.5; 37.0 to 40.4 |
| PB-04 | `tilted-orbit --var view=equator --var tilt=136 --seed 21 --t 2.0` | NEW SCENE | 21.5 to 24.2; 27.3 to 33.1 |

The `protoplanetary-disk` planet view was considered for the close-up and rejected: it is a Jupiter-textured gas giant in a disk, and GJ 3090 b is a 2.2 Earth-radius sub-Neptune around a mature red dwarf. The existing `earth-limb` globe stands in for "our solar system" honestly (it is Earth).

### NEW SCENE SPEC: `tilted-orbit` (three.js)

- Name and options: `tilted-orbit`, `--var view=wide` (default) | `planet` | `equator`; `--var tilt=136` (the orbit's angle to the star's equator, degrees).
- What is drawn: a red dwarf: a sphere (radius 0.5) with an emissive deep-orange surface (#ff6a2a shading to #b8301a at the limb, a 2-octave `fbm` mottle at 8 percent so it is not flat), a faint horizontal equatorial band (a slightly brighter ring texture, 4 percent, so the spin axis reads), and an additive sprite glow (radius 1.6, orange to transparent) plus two faint short flares along the equator (the spin direction hint, not a claim). This is the one warm light source; the whole frame's warmth comes from it. A planet: a sphere (radius 0.11, so about a fifth of the star for legibility; not to scale and never labelled as such) with a hazy blue-grey atmosphere: MeshPhysicalMaterial base #7f95a8, a cool Fresnel rim (#4fe3f0 at 25 percent), a 3-octave `fbm` cloud band texture at low contrast, the day side lit by the star's orange point light and the night side falling to `--grade-black`. The orbit: a thin ring (TorusGeometry, tube 0.006, radius 1.6) rendered as a cyan additive line at 45 percent with a brighter 30-degree arc behind the planet (its trail), the whole ring rotated by `tilt` degrees about the axis that lies in the star's equatorial plane and points toward the camera-left, so the ring crosses the equator band at that angle. The planet moves along the ring. Stars: the existing NASA Tycho star map from `production/assets/textures/` on a far sphere, dimmed to 35 percent.
  - `wide`: the camera at 12 degrees above the equator plane, 6 units out, the star at the upper left third and the ring filling the upper middle of the frame, the planet on the near side of the ring at frame 1.
  - `planet`: the camera 0.5 units from the planet, its limb crossing the upper half of the frame, the star behind it and to the left as a small hot disc with its glow, the ring passing out of frame.
  - `equator`: the camera at 3 degrees above the equator plane and 3.5 units out, so the star's equatorial band is a near-horizontal line and the ring cuts across it steeply; the planet is near the crossing.
- Lighting: the star's own point light (orange, intensity 3, decay 2) is the only light besides a 0.03 hemisphere; there is no second warm source; the planet's rim is the cool accent.
- Camera: 35 mm equivalent for `wide` and `equator`, 85 mm for `planet`; the star and ring centred at 0.40 of frame height.
- What varies with t: the planet's position along the ring (one revolution per 9 s, the parametric direction chosen so that in `wide` and `equator` the planet moves against the equatorial flares on the near side, matching the retrograde sense; this is presentation, the plate does not measure anything), the star's mottle rotating slowly (one turn per 60 s, in the direction of the flares), the glow breathing plus or minus 4 percent at 0.3 Hz, and a 3 percent slow dolly over 3 s.
- Subject-only alpha layer: the planet with its rim and, in `wide`, the ring; never the star or the star map.
- Budget: under 30k triangles; about 3 s per frame.

Caption: line 1 the hook, line 2 "Astronomy & Astrophysics, Sept 2026; arXiv 2609.24870. Carteret, University of Geneva; NIRPS, La Silla.", then the spec body (73 light-years, 2.2 Earth radii, 4.5 Earth masses, a 2.9-day year, obliquity about 136 degrees, first retrograde planet found around a red dwarf) and hashtags.
