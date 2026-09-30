# production/visuals: code-rendered scene plates

No paid generation. Every plate here is drawn by code (2D canvas or three.js in headless Chromium) plus the four
public-domain NASA textures in `production/assets/textures/` (listed with URLs and licence in `sources.json`).
The plates stand in for the flux-2-pro stills named in `storyboards/*.md`; the one paid still,
`production/assets/reel-fire-amoeba/FA-02-cell-edge-macro.png`, is the quality bar.

## Usage

```
node production/visuals/render-plate.mjs <scene> <out.png> [--t seconds] [--w 1080 --h 1920] [--seed n] [--var key=value ...]
node production/visuals/render-plate.mjs <scene> --frames N --fps 30 --out-dir <dir> [--t0 seconds] [--w --h --seed --var]
node production/visuals/render-plate.mjs --list
```

- `--t` is scene time in seconds; every frame is a pure function of `t` and `--seed` (default 1), so two renders of
  the same arguments are pixel-identical. `--frames N` writes `f00000.png ... f000(N-1).png`, frame `k` at
  `t0 + k / fps`.
- `--w --h` default to 1080 x 1920 (Reels); use `--w 1080 --h 1350` for carousel plates. Scenes compose relative
  to the frame, so the subject stays in the upper two thirds at either aspect.
- `--var key=value` passes a scene option (see the table); repeatable.
- `--no-grade` skips the house finish. By default the harness applies the style-bible finish after the scene draws:
  6 percent edge vignette and 2 percent seeded monochrome grain (STYLE_BIBLE 6.4), then prints the mean luminance
  of the lower third, which must be under 12 percent for the caption band. All scenes pass at their default `t`.
- `--profile` prints init, draw and screenshot times.
- Speed: 2D scenes 1 to 4 s per frame, three.js scenes about 3 s per frame (SwiftShader). A 3 s sequence at 30 fps
  is about 3 to 5 minutes.

Scene modules live in `scenes/<name>.mjs` and export `{ kind: "2d" | "three", init(ctx), draw(t) }`.
`ctx` gives `W, H, seed, rng()` (mulberry32), `noise(x,y,z)` and `fbm(x,y,z,octaves)` (seeded value noise),
`canvas`, `g` (2D context) or `THREE` + `renderer`, `textures` (name to file URL), `loadTexture(name)`, and
`opts` (from `--var`). Shared 2D helpers are in `scenes/_lib.mjs`. Rules for a new scene: no `Math.random`, no
`Date`, no state carried between `draw` calls, one warm light source, lower third dark, under 200k triangles.

## Scenes

| Scene | Kind | Options (`--var`) | What it draws |
|---|---|---|---|
| `hotspring-amoeba` | 2D | `variant=pool` (default), `dividing`, `ball` | Translucent amoeba (metaball core with lobed pseudopods, granular cytoplasm, amber glow from the core, bright membrane) in dark teal hot-spring water; lumpy mineral crust along the top and right bank; bubbles at three depths; layered steam wisps; drifting motes; slow camera drift and breathe. `dividing` pinches the body into two lobes joined by a bridge (FA-05); `ball` contracts it into a dense sphere (FA-06). |
| `cell-edge-macro` | 2D | none | Extreme close-up of the membrane crossing the upper half diagonally with rounded lobes (signed-distance edge), dense granules, vacuoles and dense organelles, amber back light, thin bright membrane with a refractive inner line, bokeh motes, depth of field at both ends. |
| `hot-stream` | 2D | none | Wide lens from low on the bank: cold dawn sky, conifer ridge, the sun about to break over the ridge at the upper left, the stream winding toward the camera in perspective, basalt and rust banks with silica and sulphur crust at the water line, caustics on the water, steam rising off the channel and catching the warm light, near bank in shadow. |
| `protoplanetary-disk` | three.js | `view=wide` (default), `planet` | Young star with sprite glow, procedural disk (fbm density, spiral waves, a cleared gap at the planet's orbit) as a textured plane plus three particle layers (fine additive grains, opaque brown dust, far haze), the planet on the NASA Jupiter map tinted deep red with a heat glow and faint accretion streams, NASA Tycho star map behind. `wide` is the disk seen from about 30 degrees above the plane; `planet` is inside the gap lane looking at the planet with the disk wall behind it. |
| `earth-limb` | three.js | `view=limb` (default), `globe` | Earth from low orbit looking over the horizon: night side in the lower half, the limb across the upper half with a thin blue atmosphere shell, the sun breaking over the limb at the upper right. Surface is the NASA relief map reclassified in a shader (ocean, land, ice) with procedural clouds and cloud shadows. `globe` is the whole Earth from further out for the scale ladder. |
| `embryo-lineage` | 2D | `stage=two` (default), `early`, `cyan`, `amber` | Two dividing cell populations (cyan Otx2, amber Gbx2) as translucent spheres with nuclei and bright membranes, three depth layers with blur, fluorescence bloom, a faint curled embryo outline, a soft dark seam at the boundary they never cross. Cells divide on a schedule in `t`. `early` is one silver-blue cluster (TB-02); `cyan` and `amber` are single populations close (TB-03, TB-04). |
| `resonator` | three.js | `view=beam` (default), `mount`; `exposure=` (tone-mapping exposure, default 1.0; the far mount view reads best at 3) | Lithium-niobate beam with a row of holes suspended over a trench in a dark silicon chip, transmissive material, a standing wave on the beam (fundamental plus a faint third harmonic), one gold electrode along the trench (the warm reflection), a meandering superconducting trace and pads, cold blue spot key and cyan rim, fog. The quantum ladder is drawn by the reel renderer, not here. |
| `organoid-dish` | three.js | `view=cover` (default), `centre`, `wells` | Lumpy translucent organoid (displaced sphere: lobes, folds, fine bumps) with a wrap-lit subsurface-style shader (pale pink-white, red transmission at the rim, wet specular) in a glass dish with a bevelled rim; one warm lamp upper left, cool blue fill; bench falls to black. `cover` places it at the upper right with its edge past the frame; `centre` is the same organoid centred; `wells` is a multi-well plate with seven organoids. |
| `cortex-array` | three.js | `view=array` (default), `close`, `cable`, `patches`, `hero`; `lit=0/1/2` (patches); `close=1` (patches, 2x closer); `grid=on/off` | Folded wet pink-grey cortical surface (a displaced sphere cap: elongated gyri from anisotropic ridged fbm, sulci darker and redder, capillary lines, clearcoat sheen, red Fresnel rim) with a translucent electrode film conformed to the folds (bridging the sulci), a 16 by 16 grid of instanced gold discs, gold traces and a ribbon cable leaving at the upper right. `close` is a 90 mm macro on the film edge with depth of field; `cable` pulls back to the connector block (20 gold pins) and a coiled lead on a bench; `patches` drops the film for an amber and a cyan glow on neighbouring gyri (`lit` sets how many glow). One amber key upper left, cool fill, dust in the beam; the sheen breathes at 0.9 Hz. |
| `decoder-screen` | 2D | `view=traces` (default), `hand`, `hallway`, `hero` | A dark lab monitor from a low three-quarter angle, its screen content strip-mapped in perspective, a warm highlight along the top of the bezel, the screen's cyan glow bleeding onto the bezel and bench, its reflection in the bench, a coiled cable to the right. `traces`: 16 scrolling fbm neural traces with amber 40 ms spikes and an unlabelled time axis; `hand`: a low-poly wireframe hand and forearm (fixed vertex list, about 100 triangles) waving at 0.7 Hz with three amber tracked points; `hallway`: a one-point-perspective corridor with two doorways. No letters or numbers anywhere. |
| `xenon-vessel` | three.js | `view=interior` (default), `pmt`, `exterior`, `hero`; `flash=<seconds>` | A cylindrical liquid detector: brushed-metal wall with copper field-shaping rings, 61 dark glass PMT faces in a hexagonal holder at the top and bottom, a clear column with a faintly rippling surface, one amber lamp, a cyan fill from below. `interior` looks down the axis from just under the liquid surface; `pmt` is a 70 mm view 0.3 units above the bottom array with depth of field; `exterior` is the closed vessel with an outer jacket, domed top, bands, cables and a rock wall in a dark cavern. `flash` fires one cool white-cyan scintillation (core, light, expanding halo) at that second, fully faded 1.5 s later. |
| `eclipse-corona` | 2D | `view=totality` (default), `diamond`, `hero` | Total solar eclipse: a black Moon disc darker than the field, a corona of radial fbm streamers (long equatorial streamers, short polar plumes) drawn additively in six blur passes, three pink-red prominences pulsing at the limb as the single warm accent (`diamond` replaces them with the diamond-ring bead and four spikes, corona 40 percent dimmer), 120 faint stars outside 2.5 radii. The corona is masked below 0.68 of frame height. |
| `tooth-macro` | three.js | `view=crown` (default), `groove`, `pair`, `hero` | One molar crown from primitives: a rounded box displaced into four cusps with a neck waist, an ivory-cream enamel texture (per-face materials: fissures on the occlusal face only), a flat worn facet cut into the lingual side carrying 120 striation lines as a bump map, wet clearcoat and a warm Fresnel rim, in a black matte cup on dark cloth. Amber key raking from the upper left, cyan fill, 40 dust motes. `groove` is a 2.5x closer macro on the facet with the far side blurred; `pair` is two crowns, the further one 0.8 scale and dimmer from another seed. |
| `turbulent-flow` | 2D | `view=ink` (default), `vortex`, `forced`, `free`, `hero` | Ink in water: 24,000 seeded tracers advected from t = 0 through a divergence-free field (a counter-rotating vortex pair plus curl noise, sampled on grids at 0.25 s keyframes), drawn as short additive strokes coloured by freshness (amber core through cream to cool blue-grey) over a blurred density layer. `vortex` is 2x closer on the inked spiral; `forced` adds a source at the upper left with a rotating force term; `free` is the same seed with no source and the field decaying, so the frame dims and cools by 3 s. Masked below 0.68 of frame height. |
| `ion-chain` | three.js | `view=chain` (default), `single`, `trap`, `hero`; `n=13` (0 allowed) | A linear ion trap: two gold rails into the dark, a dark chip with thin segmented electrodes, a faint violet laser sheet, and `n` ions on the axis as emissive cores with breathing additive halos and weak near-white point lights. Amber key raking along the rails, dim environment for the metal. `single` is a 120 mm view on the seventh ion with its neighbours blurred; `trap` pulls back and up so the chip fills the upper half. |
| `tilted-orbit` | three.js | `view=wide` (default), `planet`, `equator`, `hero`; `tilt=136` (degrees) | A red dwarf (limb-darkened shader with an fbm mottle, an equatorial band, two flares hinting at the spin, additive glow) and a blue-grey sub-Neptune with a cyan Fresnel rim on a thin cyan orbit ring tilted by `tilt` to the star's equator (the tilt axis lies in the equatorial plane, yawed toward camera-left), a brighter trail arc behind the planet, NASA Tycho star map dimmed behind. The planet completes one orbit per 9 s in the retrograde sense for tilts over 90 degrees. `planet` is 85 mm close on the planet with the star beyond its limb; `equator` sits 3 degrees above the equatorial plane. The star's own light is the only light. |
| `spacetime-well` | three.js | `view=wide` (default), `flat`, `tilt`, `hero`; `wellDepth=1`; `speed=1` (orbits per 10 s, keep integer); `ray=1` | A limb-darkened orange-white Sun (baked fbm granulation with a periodic shimmer, additive glow) resting at the bottom of a Flamm-paraboloid well `y = -k / sqrt(r^2 + a^2)` cut into a cyan 60 x 60 grid (a 240 x 240 plane displaced in the vertex shader; the lines are drawn analytically in the fragment shader with fwidth anti-aliasing, so they fade to a haze instead of moire where cells drop under two pixels), brighter near the well with a faint outward pulse; a small blue-grey planet with a cyan Fresnel rim on a circular orbit riding the curved surface with a fading trail; NASA Tycho map dimmed behind. One orbit takes exactly 10 s and every other motion has a 10 s (or divisor) period, so `--frames 300 --fps 30` loops seamlessly (`--t0` shifts the phase). `flat` is the same scene with the grid flat (the textbook picture); `tilt` dips the camera to 7 degrees so the depression reads in profile; `hero` is the Sun plus the inner well for `--alpha`. `ray=1` adds a thin cyan photon path skimming the Sun at 0.69 radii, bent 30 degrees by the well, with a pulse travelling along it every 5 s. The Sun's own light is the only warm thing. |

## Storyboard stills to scenes

| Storyboard still | Scene and args | Notes |
|---|---|---|
| `reel-fire-amoeba/FA-01-amoeba-in-pool.png` | `hotspring-amoeba` (default), `--t 1.0`; sequence `--frames 90 --fps 30` | Rendered as `production/assets/reel-fire-amoeba/FA-01-seq/` (3 s loop) for the hook and end card |
| `reel-fire-amoeba/FA-02-cell-edge-macro.png` | paid still exists; `cell-edge-macro --t 1.0` is the code stand-in | Use the paid still where it exists |
| `reel-fire-amoeba/FA-03-lassen-hot-stream.png` | `hot-stream --t 1.0` | |
| `reel-fire-amoeba/FA-04-cell-interior.png` | `cell-edge-macro --t 2.0` (the vacuole side) | No dedicated interior scene yet; the macro edge carries organelles |
| `reel-fire-amoeba/FA-05-cell-dividing.png` | `hotspring-amoeba --var variant=dividing --t 1.0` | |
| `reel-fire-amoeba/FA-06-protective-state.png` | `hotspring-amoeba --var variant=ball --t 1.0` | |
| `reel-youngest-planet/YP-01-earth-limb-sunrise.png` | `earth-limb --t 1.0` | |
| `reel-youngest-planet/YP-02-newborn-planet-in-gap.png` | `protoplanetary-disk --var view=planet --t 1.0` | |
| `reel-youngest-planet/YP-03-disk-wide-gap.png` | `protoplanetary-disk --t 1.0` | |
| `reel-youngest-planet/YP-04-planet-accretion-close.png` | `protoplanetary-disk --var view=planet --t 4.0` | Same view as YP-02, later on the orbit |
| `reel-youngest-planet/YP-05-keck-domes-night.png` | none | Not built (observatory exterior); use the disk wide view or a dark field |
| `reel-youngest-planet/YP-06-segmented-mirror.png` | none | Not built |
| `reel-two-brains/TB-01-embryo-two-colours.png` | `embryo-lineage --t 4.0` | |
| `reel-two-brains/TB-02-embryo-gastrulation.png` | `embryo-lineage --var stage=early --t 3.0` | |
| `reel-two-brains/TB-03-forebrain-midbrain-cyan.png` | `embryo-lineage --var stage=cyan --t 3.0` | |
| `reel-two-brains/TB-04-hindbrain-amber.png` | `embryo-lineage --var stage=amber --t 3.0` | |
| `reel-two-brains/TB-05-zebrafish-embryo.png` | none | Not built. Editor substitute in the Reel: `TB-05-sub-embryo-split.png` = `embryo-lineage --t 2.5 --seed 5` (the split itself); the label was rewritten so it names no animal |
| `reel-two-brains/TB-06-acorn-worm.png` | none | Not built. Editor substitute: `TB-06-sub-early-embryo.png` = `embryo-lineage --var stage=early --t 6.0 --seed 6` (under the big number, no label) |
| `reel-quantum-jump-sound/QJ-01-bell-rim-struck.png` | none | Not built. Editor substitute: `QJ-01-sub-resonator-beam.png` = `resonator --t 1.0 --seed 1` (the resonator is the thing that rings; hook, last scene, end card) |
| `reel-quantum-jump-sound/QJ-02-chip-suspended-beam.png` | `resonator --t 1.0` | |
| `reel-quantum-jump-sound/QJ-03-chip-on-gold-mount.png` | `resonator --var view=mount --var exposure=3 --t 1.0` | Partial: the chip from above, no wire bonds or cryostat stage yet; dark without the exposure lift |
| `reel-quantum-jump-sound/QJ-04-dilution-fridge-stages.png` | none | Not built. Editor substitute: `QJ-04-sub-chip-mount.png` = `resonator --var view=mount --var exposure=3 --t 2.0 --seed 4` (and `-b` = `--t 4.0 --seed 5` under the timeline) |
| `carousel-organoids-5-years/OR-01-organoid-in-dish.png` | `organoid-dish --w 1080 --h 1350 --t 1.0` (cover); `--var view=centre` for slide 7 | |
| `carousel-organoids-5-years/OR-02-multiwell-plate-incubator.png` | `organoid-dish --var view=wells --w 1080 --h 1350 --t 1.0` | |
| `carousel-organoids-5-years/OR-03-organoid-section-layers.png` | none | Not built |
| `carousel-organoids-5-years/OR-04-dna-methyl-marks.png` | none | Not built |
| `reel-betel-teeth/BT-01-seq/` | `tooth-macro --var view=crown --seed 3 --frames 90 --fps 30` | 3 s loop; cover check `--t 1.0`. Editor A: used as rendered in `scripts/v2/reel-betel-teeth.json`, no substitutions (BT-01 hook, scene 5, last scene and end card; BT-02 four shots; BT-03 under both timeline windows and one push-out) |
| `reel-betel-teeth/BT-02-worn-facet.png` | `tooth-macro --var view=groove --seed 3 --t 1.0` | The striations read faintly; the facet is a flat band crossing the upper half |
| `reel-betel-teeth/BT-03-two-teeth.png` | `tooth-macro --var view=pair --seed 5 --t 2.0` | |
| `reel-betel-teeth/BT-03-two-teeth-dim.png` | BT-03 blended 60 % towards the frame ink #060913 with ffmpeg (`overlay` of `color=c=0x060913@0.6`), no re-render | Editor fix desk 2026-09-28: sits under both timeline windows (scenes 3 and 8). The renderer's `.scrim` is a gradient (0.22 to 0.30 of its opacity across the middle of the frame), so bg.scrim 0.75 to 0.8 barely dims a plate behind the mechanism; the dim copy is the workaround |
| `reel-avatar-bci/AB-01-seq/` | `cortex-array --var view=array --seed 2 --frames 90 --fps 30` | 3 s loop |
| `reel-avatar-bci/AB-02-avatar-hand.png` | `decoder-screen --var view=hand --seed 2 --t 1.0` | |
| `reel-avatar-bci/AB-03-array-close.png` | `cortex-array --var view=close --seed 2 --t 1.0` | |
| `reel-avatar-bci/AB-04-seq/` | `decoder-screen --var view=traces --seed 4 --frames 90 --fps 30` | The traces scroll |
| `reel-avatar-bci/AB-05-cable-connector.png` | `cortex-array --var view=cable --seed 2 --t 1.0` | Editor A: all five AB plates used as rendered in `scripts/v2/reel-avatar-bci.json`, no substitutions; AB-04-seq also carries the 'Chang lab, UCSF' shot and the big number |
| `reel-brain-gamble/BG-01-seq/` | `cortex-array --var view=patches --var lit=2 --seed 7 --frames 90 --fps 30` | The patches breathe |
| `reel-brain-gamble/BG-02-array-on-surface.png` | `cortex-array --var view=array --seed 7 --t 1.0` | |
| `reel-brain-gamble/BG-03-corridor-monitor.png` | `decoder-screen --var view=hallway --seed 7 --t 1.0` | |
| `reel-brain-gamble/BG-04-two-patches-close.png` | `cortex-array --var view=patches --var lit=2 --var close=1 --seed 7 --t 2.0` | Editor A: all four BG plates used as rendered in `scripts/v2/reel-brain-gamble.json`, no substitutions; BG-04 sits under the 'opposite jobs' window and BG-02 under the countdown (the storyboard had BG-04 under the countdown) |
| `reel-brain-gamble/BG-01-seq-dim/`, `BG-02-array-on-surface-dim.png`, `BG-04-two-patches-close-dim.png` | the same plates blended 60 % towards #060913 with ffmpeg (per frame for the sequence), no re-render | Editor fix desk 2026-09-28: under the three dual-trace windows (scenes 5, 6, 7); see the BT-03-dim row for why the scrim alone does not do it |
| `reel-ai-navier-stokes/NS-01-seq/` to `NS-04-seq/` | `turbulent-flow --var view=ink|vortex --seed 11`, `--var view=forced|free --seed 13`, each `--frames 90 --fps 30` | Gated on a fact-check row; the flow advances in every frame |
| `reel-ai-navier-stokes/NS-01-seq-b/` to `NS-04-seq-b/` | the same four, `render-seq.sh <dir> 150 turbulent-flow ... --t0 1.0` (5 s from t = 1.0) | Editor 2026-09-28: the Reel uses these; from t = 0 the ink is a bare blob for the first second and the 3 s loop restarted mid-scene, so the plume is released 1 s before the loop starts and the loop is longer than every scene but two |
| `reel-ai-navier-stokes/NS-02-seq-b-dim/` | NS-02-seq-b blended 60 % towards #060913 with ffmpeg per frame, no re-render | Editor fix desk 2026-09-28: under both hours-timeline windows (scenes 4 and 6); the spec now points every NS scene and the end card at the `-seq-b` dirs (the earlier render had still used `NS-0x-seq`, so the hook opened on the t = 0 ink blob) |
| `reel-13-atoms-string-breaking/SB-01-seq/` | `ion-chain --var view=chain --var n=13 --seed 17 --frames 90 --fps 30` | The ions shimmer |
| `reel-13-atoms-string-breaking/SB-02-single-ion.png` | `ion-chain --var view=single --var n=13 --seed 17 --t 1.0` | |
| `reel-13-atoms-string-breaking/SB-03-trap-wide.png`, `SB-04-trap-empty.png` | `ion-chain --var view=trap --var n=13 --seed 17 --t 1.0`; `--var n=0` for SB-04 | |
| `reel-planet-backwards/PB-01-seq/` | `tilted-orbit --var view=wide --var tilt=136 --seed 21 --frames 90 --fps 30` | Graded with `--space` |
| `reel-planet-backwards/PB-02-earth-globe.png` | none usable | `earth-limb --var view=globe` renders a back-lit night side with a hairline crescent at every `t` (the globe view puts the sun behind the Earth from the camera). Editor B substitute: `PB-02-sub-earth-limb.png` = `earth-limb --t 2.0 --seed 3`, space grade (Earth's limb at sunrise; the label 'Our planets: one direction' stands) |
| `reel-planet-backwards/PB-03-planet-close.png`, `PB-04-equator-crossing.png` | `tilted-orbit --var view=planet --var tilt=136 --seed 21 --t 1.0`; `--var view=equator --t 2.0` | Graded with `--space` |
| `reel-lz-dark-matter/LZ-01-seq/` | `xenon-vessel --var view=interior --seed 31 --frames 90 --fps 30` | No flash |
| `reel-lz-dark-matter/LZ-02-seq/` | `xenon-vessel --var view=pmt --var flash=0.3 --seed 31 --frames 105 --fps 30` | 3.5 s; the flash lands at 0.3 s and is gone by 1.5 s; the lower third exceeds 12 percent only while the flash lights the near faces |
| `reel-lz-dark-matter/LZ-02b-pmt-faces.png`, `LZ-03-vessel-exterior.png` | `xenon-vessel --var view=pmt --seed 31 --t 0.1`; `--var view=exterior --t 1.0` | |
| `carousel-project-anchor-debunk/PA-03-eclipse-totality.png` | `eclipse-corona --var view=totality --w 1080 --h 1350 --t 1.0 --seed 41` | Gated on a fact-check row |
| `popout/anchor-bg-1..8.png`, `popout/anchor-eclipse-*-subject-crop.png`, `popout/anchor-earth-globe-*-keyed-crop.png` | pop-out carousel `carousel-project-anchor-popout`: `earth-limb` (limb, globe) and `eclipse-corona` (totality, diamond) at `--w 1080 --h 1350` for the backgrounds; `eclipse-corona --alpha` (totality seed 41, diamond seeds 43 and 47, hero seeds 45 and 49) then `crop-alpha.mjs` for the subjects | Editor 2026-09-28. `earth-limb` has no `layer=subject` option, so `--alpha` returns an opaque frame; its two globe subjects were keyed to a circle fitted to the atmosphere rim (scratchpad `earth-key.mjs`), which gives a dark disc with a lit rim. A hero view with a subject layer is wanted for `earth-limb` |
| `loop-spacetime/SW-01-wide.png`, `SW-02-flat.png`, `SW-03-tilt.png`, `SW-04-ray.png` | `spacetime-well --var view=wide|flat|tilt --t 2.0 --seed 1`; `--var view=wide --var ray=1` for SW-04; each graded with `grade.sh --space` | Reel "The Sun does not pull the planets, it warps space-time". SW-02 is the contrast card, SW-03 the reveal, SW-04 the light-bending card |
| `loop-spacetime/SW-01-seq/` | `render-seq.sh --space production/assets/loop-spacetime/SW-01-seq 300 spacetime-well --var view=wide --seed 1` | 10 s seamless loop (one orbit per 10 s; frame 299 leads into frame 0 with no jump). About 5 s per frame on SwiftShader, 25 to 30 minutes in all |
| `popout/spacetime-sun-subject.png`, `-crop.png` | `spacetime-well --alpha --var view=hero --t 2.0 --seed 1` then `crop-alpha.mjs` | The Sun nested in the inner well on transparent (a depth-only pass hides the Sun's lower half inside the bowl) |

`render-new-scenes.sh stills` renders and grades every still above; `render-seq.sh <out-dir> <frames> <scene> [args]`
renders a sequence and grades it to JPEG frames (the `FA-01-seq` convention); `--alpha --var view=hero` on any of
the eight new scenes gives the pop-out subject layer.

## Animated plates in the reel renderer

`render-reel.mjs` accepts `bg: { sequence: "<dir>", fps: 30, move, from, to, focus, scrim, parallax }` on any scene
and on the end card. The directory holds the frames from `--frames`; the frame shown is indexed by the scene's
local time (`floor(local * fps) mod n`, so it loops) and the usual Ken Burns move applies on top. Frames are decoded
once at page load so `seek(t)` stays synchronous. `production/visuals/test-sequence.json` is a 6 s check
(two scenes plus the end card over the 3 s FA-01 loop):

```
node production/reel/render-reel.mjs production/visuals/test-sequence.json production/out/test-sequence/test-sequence.mp4
```

## Files

- `render-plate.mjs`: the harness (Chromium via Playwright; CPU raster for 2D, SwiftShader WebGL for three.js).
- `scenes/_lib.mjs`: shared 2D helpers (seeded fields, blits, glows, bubbles, steam).
- `scenes/_three.mjs`: shared three.js helpers: `Post` (an HDR render target composited through one fullscreen pass that does depth-of-field, the lower-third fade, ACES and sRGB; with `--alpha` it keeps straight alpha), `Motes` (seeded dust in the key beam), `makeSprite`, `rimPatch` (a Fresnel emissive rim for physical materials) and `setLens` (mm to vertical fov for a portrait frame).
- `scenes/*.mjs`: the seventeen scenes.
- `render-seq.sh`, `render-new-scenes.sh`: sequence rendering with the house grade to JPEG frames, and the batch for the eight scenes added on 28 Sept.
- `sources.json`: provenance of the NASA textures in `production/assets/textures/`.
- `test-sequence.json`: the reel-renderer check for `bg.sequence`.
- Renders for review: `production/out/plates/*.png` and `production/out/plates/variants/*.png`.
