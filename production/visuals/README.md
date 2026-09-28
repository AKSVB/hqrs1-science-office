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
- `scenes/*.mjs`: the eight scenes.
- `sources.json`: provenance of the NASA textures in `production/assets/textures/`.
- `test-sequence.json`: the reel-renderer check for `bg.sequence`.
- Renders for review: `production/out/plates/*.png` and `production/out/plates/variants/*.png`.
