# New scene specs for the Visual Engineer

Filed 2026-09-28 by the Creative Director, consolidated from the eight storyboards written this cycle (`reel-betel-teeth`, `reel-avatar-bci`, `reel-brain-gamble`, `reel-ai-navier-stokes`, `reel-13-atoms-string-breaking`, `reel-planet-backwards`, `reel-lz-dark-matter`, `carousel-project-anchor-debunk`). Every scene below goes in `production/visuals/scenes/<name>.mjs` under the rules in `production/visuals/README.md`: `{ kind, init(ctx), draw(t) }`, no `Math.random`, no `Date`, no state carried between `draw` calls, seeded `rng`, `noise` and `fbm` from `ctx`, one warm light source, lower third under 12 percent luminance before the house grade, under 200k triangles, options through `--var`. Every scene composes relative to the frame so it renders at 9:16 and 4:5. The full spec for each scene (materials, camera, what varies with t, the alpha layer) is in the storyboard named in its row; this file is the build order and the shared options.

Eight new scenes. Ordered by how many posts reuse each, then by calendar date of first use.

| Order | Scene | Kind | Posts that use it | First needed | Options (`--var`) | Subject-only alpha layer |
|---|---|---|---|---|---|---|
| 1 | `cortex-array` | three.js | `reel-avatar-bci` (12 Oct), `reel-brain-gamble` (15 Oct): 2 posts | 12 Oct | `view=array` (default) / `close` / `cable` / `patches`; `lit=0/1/2` (patches); `close=1` (patches, 2x closer); `grid=on/off` | The electrode film with discs and cable; in `patches`, the two glowing patches and a soft disc of surface under them |
| 2 | `decoder-screen` | 2D | `reel-avatar-bci`, `reel-brain-gamble`: 2 posts | 12 Oct | `view=traces` (default) / `hand` / `hallway` | The monitor with its screen content and bezel |
| 3 | `xenon-vessel` | three.js | `reel-lz-dark-matter` (11 Oct): 1 post | 11 Oct | `view=interior` (default) / `pmt` / `exterior`; `flash=<seconds>` (omit for none) | The PMT honeycomb (plus the flash sphere and halo when set); in `exterior`, the vessel with jacket and cables |
| 4 | `eclipse-corona` | 2D | `carousel-project-anchor-debunk` (10 Oct): 1 post; also the natural plate for future sky-event tentpoles | 10 Oct | `view=totality` (default) / `diamond` | The Moon's disc plus the inner corona to 1.4 radii (and the bead in `diamond`) |
| 5 | `tooth-macro` | three.js | `reel-betel-teeth` (14 Oct): 1 post | 14 Oct | `view=crown` (default) / `groove` / `pair` | The tooth (both crowns in `pair`) |
| 6 | `turbulent-flow` | 2D | `reel-ai-navier-stokes` (17 Oct): 1 post, gated on a fact-check row | 17 Oct | `view=ink` (default) / `vortex` / `forced` / `free` | The plume (tracers plus density layer) |
| 7 | `ion-chain` | three.js | `reel-13-atoms-string-breaking` (19 Oct): 1 post | 19 Oct | `view=chain` (default) / `single` / `trap`; `n=13` (0 allowed) | The ions with their halos |
| 8 | `tilted-orbit` | three.js | `reel-planet-backwards` (22 Oct): 1 post | 22 Oct | `view=wide` (default) / `planet` / `equator`; `tilt=136` (degrees) | The planet with its rim and, in `wide`, the ring; never the star |

Where the full spec lives: `cortex-array` and `decoder-screen` in `reel-avatar-bci.md` (with the `patches`, `close` and `hallway` options added by `reel-brain-gamble.md`); `xenon-vessel` in `reel-lz-dark-matter.md`; `eclipse-corona` in `carousel-project-anchor-debunk.md`; `tooth-macro` in `reel-betel-teeth.md`; `turbulent-flow` in `reel-ai-navier-stokes.md`; `ion-chain` in `reel-13-atoms-string-breaking.md`; `tilted-orbit` in `reel-planet-backwards.md`.

## Existing scenes reused this cycle

| Scene and args | Post |
|---|---|
| `earth-limb --var view=globe --t 1.0` (9:16) | `reel-planet-backwards` PB-02 ("our solar system") |
| `earth-limb --w 1080 --h 1350 --t 1.0` and `--var view=globe` (4:5) | `carousel-project-anchor-debunk` PA-01, PA-02 |

Considered and rejected: `protoplanetary-disk --var view=planet` for GJ 3090 b (a Jupiter-textured giant in a disk; the story is a sub-Neptune around a mature red dwarf); `resonator` for the ion-trap device shot (another experiment's hardware); `hot-stream` for the fluid (a landscape, not a flow field).

## Render list per post (plates to produce, all free)

| Post | Renders | Sequences (`--frames 90 --fps 30` unless noted) | Stills |
|---|---|---|---|
| reel-betel-teeth | 3 | BT-01 | BT-02, BT-03 |
| reel-avatar-bci | 5 | AB-01, AB-04 | AB-02, AB-03, AB-05 |
| reel-brain-gamble | 4 | BG-01 | BG-02, BG-03, BG-04 |
| reel-ai-navier-stokes | 4 | NS-01, NS-02, NS-03, NS-04 (the flow must move) | none |
| reel-13-atoms-string-breaking | 4 | SB-01 | SB-02, SB-03, SB-04 |
| reel-planet-backwards | 4 | PB-01 | PB-02 (exists), PB-03, PB-04 |
| reel-lz-dark-matter | 4 | LZ-01, LZ-02 (`--frames 105`, `flash=0.3`) | LZ-02b, LZ-03 |
| carousel-project-anchor-debunk | 3 | none | PA-01, PA-02 (exist), PA-03 |

Total: 31 renders, 13 of them sequences. At about 3 s per frame a 90-frame sequence is about 5 minutes; the 13 sequences are about 65 minutes of render time, the stills a few minutes. Output paths follow the existing convention: `production/assets/<post>/<ID>-<slug>.png` and `production/assets/<post>/<ID>-seq/`, then `production/assets/grade.sh` on every still and frame (`--space` for `tilted-orbit`, the one space scene, so deep space is not lifted above `#0a1224`).

## Reel-renderer additions requested by these storyboards (Animator, not the Visual Engineer)

These are mechanism plates in `production/reel/visuals.mjs`, listed here so the two desks can see the whole build. Each needs an example in `production/reel/demo-v2.json`.

| Addition | Kind | Storyboard | What |
|---|---|---|---|
| `dual-trace` | new type | `reel-brain-gamble` | Two traces (amber, cyan) on a shared time-to-event axis with a countdown readout, a step on each trace at a given time, a bracket label between the two trace heads, an event line. Fields: `min`, `max`, `event:{value,label}`, `traces:[{label,colour,step:{at,height}}]`, `bracket:{label,show,hide}`, `countdown:{at,from,to,dur,decimals,unit}`, `rate`, `signalLabel:{at,text}`. |
| `string-break` | new type | `reel-13-atoms-string-breaking` | Thirteen sites, two end charges, a string that stretches and breaks into pairs, in `uniform` mode (pairs everywhere at once) or `edge` mode (pairs at the ends first, spreading inward, with a wavefront). Fields: `sites`, `mode`, `pull:{t0,dur,px}`, `breakAt`, `pairs:[{t,sites}]`, `labels`, `wavefront`. |
| `orbit.obliquity` | option on an existing type | `reel-planet-backwards` | `obliquity:{from,to,at,dur}` rotates the orbit ellipse in the plate plane about the star; the dash pattern flips to the retrograde dash when the sweep crosses 90 degrees. |
| `timeline` options | options on an existing type | `reel-betel-teeth` | `cursor` optional; `readout` as text keyed to `ticks[].at`; `bracket` between two tick values. |
| `flash` options | options on an existing type | `reel-lz-dark-matter` | `readoutAt` (the readout lands on the spoken word, not on the flash); `labels:[{text,at,corner}]` (max two). |
| `telegraph.marks` | option on an existing type | `carousel-project-anchor-debunk` | `marks:[{frac,label,colour,bracketPx,note}]`: a tick and a bracket under the time axis of a flat trace. |

## Gates carried from the storyboards

- `reel-ai-navier-stokes` and `carousel-project-anchor-debunk` have no fact-check row in `research/05` or `research/06`. Both are storyboarded and may be built, but neither renders for publication until the Fact-Checker files a row; their numbers on screen are from the specs only.
- Every other post uses only numbers from its fact-check row, and each storyboard names the sentences cut from the voice track so the Reel sits at or under 45 s with the 1.5 s end card. Nothing is added to the science.
