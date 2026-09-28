# Storyboard: reel-avatar-bci

Spec: `scripts/reel-avatar-bci.json`. Voice: `production/assets/voice/reel-avatar-bci-voice.mp3` (54.2 s, about 134 wpm). Fact-check: `research/05-fact-check.md` row 5, GREEN on journal, date and n; wording AMBER ("gestures such as nodding and waving", not "body language"; no gender in the hook). Post type: mechanism reveal, brain lane. Bed A. Calendar: 12 Oct.

Logline: a high-density ECoG implant and machine-learning decoders let paralysed participants speak and gesture through an on-screen avatar at the same time; three participants, two in real time, restricted vocabulary, wired, in a lab.

Track cut: remove the last three sentences, "But it is the first time speech and gestures have been decoded together like this.", "Nature Neuroscience, fourteenth of September." and "Source in the caption." (about 43.4 to 54.2 s), at the silence before "But". The "first time" claim is not in the fact-check row, so cutting it is also the cautious choice; the end card carries the journal. Cut track about 43.1 s; total with the end card about 44.6 s. The Reel now ends on "a demonstration, not a treatment you can go and get", which is the why-it-matters already spoken.

Timings are estimates from word counts against the track length. The Editor aligns every row to the words JSON.

## Hook frame (0.0 s)

In frame: AB-01, the folded surface of a brain, pale pink-grey with a wet sheen, crossing the upper half of the 9:16 frame, with a thin flexible electrode array lying on it: a translucent film carrying a dense grid of tiny gold discs, each one catching one warm lamp from the upper left, the film's ribbon cable leaving the frame at the upper right, cool cyan fill from the right, the lower third falling to black. No face, no skull, no person: a surface and a device. What moves: push-in from scale 1.00 toward 1.08 centred on the array; the parallax plate on the array moves at 1.5 times the drift so the grid appears to float over the folds. Voice at 0.0 s: "Paralysed and unable to speak." Hook line up by 0.3 s, six words: **Their avatar talks and waves. Paralysed.** Motif at 0.0 s. Ambience: a faint room-tone hum with a monitor whine, minus 24 dB, under the hook still only.

## Scene table

| Time (s) | On screen | Camera move | On-screen text (6 words max) | Voice (verbatim) | Sound |
|---|---|---|---|---|---|
| 0.0 to 2.4 | AB-01 electrode array on the brain surface, parallax on | Push-in 1.00 to 1.05, focus [0.55, 0.40] | Hook line: Their avatar talks and waves. Paralysed. | Paralysed and unable to speak. | Motif; bed A in; room-tone ambience |
| 2.4 to 6.6 | AB-02 a dark lab monitor at an angle showing a low-poly wireframe hand raised in a wave, cyan lines, no face | Drift right 5 percent, focus on the hand | Straight from their brain | Their avatar talks and waves, straight from their brain. | none |
| 6.6 to 11.5 | AB-01 again | Push-in 1.05 to 1.10 | Brain-computer interface, UCSF | This is a brain-computer interface from the Chang lab at UCSF. | none |
| 11.5 to 16.1 | AB-03 the array close, individual gold discs, the film edge, the wet folds under it | Drift left 5 percent, focus on the discs | ECoG: a high-density implant | A high-density implant called ECoG records signals from the brain. | none |
| 16.1 to 24.1 | Cross-section wipe (0.40 s, upward) into the lineage plate over AB-04 (the monitor showing multi-channel traces), scrim 0.75 | Push-in 1.00 to 1.06 under the plate | Mechanism labels: Brain signals; Speech; Gestures | Machine-learning decoders turn those signals into speech and into gestures, like nodding and waving, | Thud at 16.1; ticks as each branch lands; two ticks on the pulses |
| 24.1 to 26.5 | AB-02 the wireframe hand, plate gone (the window closes at 8 s) | Push-in 1.00 to 1.08 | Both at the same time | and an on-screen avatar performs both at the same time. | none |
| 26.5 to 28.5 | AB-03 array close | Drift right 3 percent | The honest part | Now the honest part. | none |
| 28.5 to 31.6 | AB-04 traces monitor | Push-in 1.00 to 1.06 | Big number "3" slams at 28.6 s as "Three" is spoken, flips at 30.0 s to "n = 3", exits 31.5 s | Three participants, two of them driving | Thud on the slam; tick on the flip |
| 31.6 to 34.6 | AB-04 continues | Push-in 1.06 to 1.10 | 2 in real time | the avatar in real time, with a restricted | none |
| 34.6 to 38.1 | AB-05 the array's ribbon cable running to a connector block on the bench, a coiled lead, one warm lamp | Drift left 5 percent | Restricted vocabulary. Wired. A lab. | vocabulary, over a wired connection, in a lab. | none |
| 38.1 to 43.1 | AB-01 array on the surface | Push-out 1.10 to 1.02 | A demonstration, not a treatment | This is a demonstration, not a treatment you can go and get. | Motif (payoff) at 38.1 |
| 43.1 to 44.6 | End card: AB-01 held at 1.02, then push-in to 1.04 | Push-in continues | Source line (36 px): Nature Neuroscience, 14 Sept 2026. Brosler et al., Chang lab, UCSF. Note: Images: generated illustrations. | (silence) | Settle; bed fades 1.5 s |

The label "2 in real time" (31.6 to 34.6) names the second verified count; it is a label, not a second big number. At no frame are more than the caption band and one other element on screen.

## Mechanism animation (second hook, 16.1 to 24.1 s)

Type: `lineage` (exists in the renderer), used as a two-branch decoder tree.

What is drawn: a root node at the left third of the plate labelled "Brain signals" (28 px, muted) drawn as a cluster of 24 short cyan ticks in a 6 by 4 grid (the ECoG channels, schematic, not a channel count), from which one cyan trunk line (6 px, round caps) runs right and splits once into two branches: the upper branch cyan, ending at the label "Speech"; the lower branch amber, ending at the label "Gestures". `depth` 2, `labels` ["Speech", "Gestures"], `colours` ["cyan", "amber"], `baseline` off. No readout: nothing in this sentence is a quantity, and a plate without a number is allowed (the quantum-jump staircase has none).

What changes over time: 16.1 to 16.5 wipe in, the channel grid ticks fade up; 16.5 to 19.3 the trunk and then the two branches draw on left to right (`growStart` 0.4, `growDur` 2.8, ease-out), a tick as each branch tip lands (two ticks); 21.0, on "nodding", a pulse ring (`pulses` side 1, the amber branch) expands from the Gestures tip; 22.2, on "waving", a second pulse on the same branch; 23.0 a pulse on the Speech tip (side 0) so both outputs have fired by the time the voice says "both". 24.1 the window closes on a hard cut to AB-02 while the voice finishes the sentence, because the sentence runs 10 s and the window is capped at 8 s.

Numbers used: none on the plate. The 3 and 2 come later as the big number and a label.

## The big number

"3", slam-in at 28.6 s as "Three" is spoken, amber 200 px, 4 px shake, hold 1.4 s, unit flip at 30.0 s to "n = 3" (a format change of the same count), hold to 31.4 s, exit at 31.5 s with the 6-frame fade. Thud on the slam, tick on the flip. One big number in the Reel; "2 in real time" is a label.

## End card (43.1 to 44.6 s)

AB-01 held at its final zoom so the loop closes on the hook still. Source line: "Nature Neuroscience, 14 Sept 2026. Brosler et al., Chang lab, UCSF." Note line: "Images: generated illustrations." Handle. Settle SFX, bed fade. Caption band empty.

## PLATES LIST (5 renders from two new scenes, 9:16, free)

| ID | Scene and args | Status | Used in |
|---|---|---|---|
| AB-01 | `cortex-array --var view=array --seed 2 --frames 90 --fps 30 --out-dir production/assets/reel-avatar-bci/AB-01-seq` (3 s loop; `--t 1.0` for the cover check) | NEW SCENE | Hook 0.0 to 2.4; 6.6 to 11.5; 38.1 to 43.1; end card |
| AB-02 | `decoder-screen --var view=hand --seed 2 --t 1.0` | NEW SCENE | 2.4 to 6.6; 24.1 to 26.5 |
| AB-03 | `cortex-array --var view=close --seed 2 --t 1.0` | NEW SCENE | 11.5 to 16.1; 26.5 to 28.5 |
| AB-04 | `decoder-screen --var view=traces --seed 4 --frames 90 --fps 30 --out-dir production/assets/reel-avatar-bci/AB-04-seq` (the traces scroll, so a sequence) | NEW SCENE | 16.1 to 24.1 (under the plate); 28.5 to 34.6 |
| AB-05 | `cortex-array --var view=cable --seed 2 --t 1.0` | NEW SCENE | 34.6 to 38.1 |

No existing free plate fits. Both new scenes are shared with `reel-brain-gamble` (see `NEW-SCENES.md`).

### NEW SCENE SPEC: `cortex-array` (three.js)

- Name and options: `cortex-array`, `--var view=array` (default) | `close` | `cable` | `patches`; `--var lit=0|1|2` (used by `patches`: how many patches glow); `--var grid=on|off` (default on; `patches` defaults to off).
- What is drawn: a brain-like surface, not a whole brain: a large sphere segment (SphereGeometry radius 3, 256 by 256, only the cap facing the camera) displaced by two octaves of `fbm` into rounded ridges (gyri) with narrow valleys (sulci), the valleys darkened by an ambient-occlusion term computed from the displacement (deeper is darker and slightly redder). Material: MeshPhysicalMaterial, base pink-grey #c9a1a6, roughness 0.28, clearcoat 0.6 (the wet sheen), a thin translucent red rim (Fresnel emissive 6 percent) so it reads as living tissue without any anatomy being identifiable. Over it, when `grid` is on, a flexible electrode film: a thin PlaneGeometry (0.9 by 0.9, 96 segments) conformed to the surface (its vertices sampled from the same displacement plus 0.02), material transparent polyurethane (opacity 0.35, roughness 0.15), carrying a 16 by 16 grid of small gold discs (CylinderGeometry, radius 0.012, instanced, MeshStandardMaterial metalness 1, roughness 0.3, colour #d9b24a) and one ribbon cable (a flat extruded curve, same transparent film with fine gold traces as a canvas texture) leaving the film at its upper right edge and running out of frame. The 16 by 16 count is schematic and is never spoken or labelled; no channel number appears on screen.
  - `array`: the film sits on the upper middle of the surface, the surface crossing the upper half of the 9:16 frame diagonally, the cable leaving at the upper right.
  - `close`: the camera 3 times closer on the film edge, six to eight discs sharp across the upper half, the folds visible under the translucent film, the rest blurred (far pass blurred 20 px in 2D).
  - `cable`: the camera pulls back and pans right: the ribbon cable runs from the film to a dark connector block (a rounded box with a row of 20 gold pins) on a black bench surface, a coiled grey lead leaving the block toward the lower right and disappearing into the dark; the film is small at the upper left.
  - `patches`: no film. Two soft glowing patches on the surface, each a radial gradient about 0.18 units wide (schematic, no scale is drawn or implied), the left one amber (#ffb020) and the right one cyan (#4fe3f0), placed on neighbouring gyri; `lit=0` draws neither, `lit=1` the amber only, `lit=2` both. Their spacing is a composition choice; the "about 2 cm" number lives only on the mechanism plate.
- Lighting: one warm key (amber point light, intensity 2.0, upper left, 35 degrees elevation), a cool cyan fill at 0.3 from the right, hemisphere 0.1; the gold discs are the warm reflections. Lower third fades to black through a dark gradient plane; under 12 percent luminance before the grade.
- Camera: 50 mm equivalent for `array` and `cable`, 90 mm macro for `close`, 50 mm for `patches`; subject centred at 0.40 of frame height.
- What varies with t: a 4 percent slow dolly over 3 s, a very slow pulse of the wet sheen (specular intensity plus or minus 5 percent at 0.9 Hz, the surface "breathing" with blood flow), in `patches` the glow of each lit patch breathes plus or minus 15 percent at 0.5 Hz, and 30 dust motes in the key beam. No geometry animates.
- Subject-only alpha layer: the electrode film with its discs and cable in `array`, `close` and `cable`; the two patches plus a soft disc of the surface under them in `patches`. Never the whole surface.
- Budget: about 130k triangles (surface) plus 256 instanced discs; well under 200k.

### NEW SCENE SPEC: `decoder-screen` (2D canvas)

- Name and options: `decoder-screen`, `--var view=traces` (default) | `hand` | `hallway`.
- What is drawn: a dark lab monitor seen from a low angle at the upper left of the frame, its bezel a thin dark grey rounded rectangle with a faint warm reflection along its top edge from one lamp out of frame, the screen surface itself the `--bg-2` field with a 3 percent scanline texture, sitting on a black bench that falls to nothing in the lower third; a coiled grey cable leaves the monitor's base toward the right. The monitor is drawn in perspective (a quadrilateral, the content canvas mapped onto it with `drawImage` through a `setTransform` skew) so it reads as an object, not a flat UI.
  - `traces`: the screen shows 16 horizontal neural traces, cyan (#4fe3f0) at 2 px, each a seeded `fbm` of x scrolled left at 90 px per second, with occasional 40 ms amber spikes (seeded, about 1 per second across all traces); a thin muted time axis at the bottom of the screen with unlabelled ticks. No numbers, no letters anywhere on the screen.
  - `hand`: the screen shows a low-poly wireframe of an open hand and forearm, 180 triangles, cyan edges at 2 px with a 20 percent cyan fill, raised in a wave with the palm toward the viewer; no face, no head, no body. Three small amber discs at the fingertips and wrist (tracked points, schematic). The wireframe is drawn from a fixed vertex list in the scene file (no external model).
  - `hallway`: the screen shows a schematic corridor in one-point perspective: floor and wall edges as cyan lines converging to a vanishing point at the upper centre, two doorways as brighter rectangles at the left and right, no icons, no objects, no letters. This is the video-game setting for `reel-brain-gamble` drawn as geometry only; the "bombs and treasure chests" stay in the voice.
- Lighting: one warm lamp implied from the upper left (the bezel highlight and a soft amber pool on the bench under the monitor's left corner); the screen's own cyan glow is the cool fill, bleeding 60 px onto the bezel and bench. Lower third under 12 percent luminance.
- Camera: fixed low three-quarter view, the monitor occupying the upper 55 percent of the frame, slight perspective.
- What varies with t: `traces` scroll continuously (pure function of t, seeded spikes); `hand` rotates the wrist plus or minus 12 degrees at 0.7 Hz, a wave; `hallway` drifts the vanishing point 1 percent at 0.2 Hz; all views add a 2 percent flicker of the screen glow at 8 Hz and a 3 percent slow drift of the whole monitor (the Ken Burns base move is applied on top by the reel renderer).
- Subject-only alpha layer: the monitor with its screen content and bezel; no bench, no cable.
- Budget: 2D only, under 2 s per frame.

Caption: line 1 the hook, line 2 "Nature Neuroscience, 14 Sept 2026. Brosler et al., Chang lab, UCSF.", then the spec body (three participants, two in real time, restricted vocabulary, wired, in a lab) and hashtags. The word "first" does not appear in the caption either.
