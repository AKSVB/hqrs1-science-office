# Storyboard: reel-brain-gamble

Spec: `scripts/reel-brain-gamble.json`. Voice: `production/assets/voice/reel-brain-gamble-voice.mp3` (47.3 s, about 152 wpm). Fact-check: `research/06-fact-check-wave2.md` row 11, AMBER (six patients already implanted for surgical monitoring; two OFC patches about 2 cm apart; "predicts the choice about half a second before it is made"; a video game; no free-will claim; never "before you know it"). Post type: mechanism reveal, brain lane. Bed A. Calendar: 15 Oct.

Logline: in six patients already implanted for epilepsy monitoring, two neighbouring patches of orbitofrontal cortex about 2 cm apart did opposite jobs and together predicted a risky choice in a video game about half a second before it was made.

Track cut: remove "That is the finding from a study in Nature Neuroscience, published on the fifteenth of September." (about 6.2 to 12.1 s) at the silences either side, and "Source in the caption." (about 45.8 to 47.3 s). The end card carries the journal. Cut track about 39.2 s; total with the end card about 40.7 s.

Timings are estimates from word counts against the track length. The Editor aligns every row to the words JSON.

## Hook frame (0.0 s)

In frame: BG-01, the folded pink-grey surface of a brain crossing the upper half of the 9:16 frame, wet sheen, no electrode film, one amber patch glowing softly on a ridge at the left of centre and, a short distance to its right, a cyan patch, both breathing; one warm lamp from the upper left, cool fill from the right, the lower third black. No skull, no face, no person. What moves: push-in from scale 1.00 toward 1.08 centred between the two patches; the parallax plate on the two patches moves at 1.5 times the drift. Voice at 0.0 s: "A brain signal can predict your gamble..." Hook line up by 0.3 s, six words: **Your gamble, readable 0.5 s early**. Motif at 0.0 s. No ambience.

## Scene table

| Time (s) | On screen | Camera move | On-screen text (6 words max) | Voice (verbatim) | Sound |
|---|---|---|---|---|---|
| 0.0 to 3.0 | BG-01 two patches on the surface, parallax on | Push-in 1.00 to 1.05, focus [0.5, 0.40] | Hook line: Your gamble, readable 0.5 s early | A brain signal can predict your gamble | Motif; bed A in |
| 3.0 to 6.2 | BG-01 continues | Push-in 1.05 to 1.08 | Big number "0.5 s" slams at 3.2 s as "half a second" is spoken, flips at 4.6 s to "500 ms", exits 5.9 s | about half a second before the choice is made. | Thud on the slam; tick on the flip |
| 6.2 to 9.6 | BG-02 a ribbon electrode film on the surface, gold discs, the cable leaving at the upper right | Drift right 5 percent | 6 patients, implanted for monitoring | Six patients, already fitted with electrodes for surgical monitoring, | none |
| 9.6 to 13.6 | BG-03 a dark monitor showing a schematic corridor in perspective, two doorways | Push-in 1.00 to 1.08, focus on the vanishing point | A video game | played a video game with hallways, bombs and treasure chests. | none |
| 13.6 to 16.1 | BG-03 continues | Push-in 1.08 to 1.12 | Take the risk, or avoid | Take the risk, or avoid it. | none |
| 16.1 to 21.3 | Cross-section wipe (0.40 s, upward) into the dual-trace plate over BG-01 at scrim 0.75; the two patches are drawn as the two trace heads | Drift left 4 percent under the plate | Mechanism labels: Take the risk; Avoid; ~2 cm apart | In the orbitofrontal cortex, two patches about two centimetres apart did opposite jobs. | Thud at 16.1; one tick as each patch lights |
| 21.3 to 26.4 | Dual-trace plate continues over BG-01; the amber trace rises on "risky", the cyan on "safe" | Drift continues | Mechanism labels as above | One became active before a risky choice, the other before a safe one. | Ticks as each trace lifts |
| 26.4 to 31.2 | Hard cut to BG-04 (the two patches, closer, both lit) with the plate continuing at `enter` 0: the countdown runs to the choice line | Push-in 1.00 to 1.06 under the plate | Mechanism labels: Signal; Choice; readout counts down | Together, they predicted the decision roughly half a second before it was made. | Ticks as the readout counts (under 12); one thud at the choice line |
| 31.2 to 35.9 | BG-03 corridor monitor, plate gone | Push-out 1.10 to 1.00 | 6 patients. One video game. | Six patients, one video game, and no claim about free will. | Motif (payoff) at 31.5 |
| 35.9 to 39.2 | BG-01 two patches | Push-in 1.08 to 1.12 | UCSF and UC Berkeley | Starkweather, Chang and Knight, at UCSF and UC Berkeley. | none |
| 39.2 to 40.7 | End card: BG-01 held at 1.12 | Push-in continues to 1.14 | Source line (36 px): Nature Neuroscience, 15 Sept 2026. Starkweather, Chang, Knight; UCSF and UC Berkeley. Note: Images: generated illustrations. | (silence) | Settle; bed fades 1.5 s |

Wording guard: no frame says "before you know it" or "before you do". The label at 31.2 s says "6 patients. One video game." and the caption band carries "no claim about free will" from the voice.

## Mechanism animation (second hook, 16.1 to 31.2 s, with a hard-cut return at 26.4 s)

Type: NEW renderer type `dual-trace`, described exactly here (an extension of the existing `telegraph` idea to two traces on a shared clock).

What is drawn: a horizontal grey `--line` time axis across the plate, 6 px, with the time-to-choice running left to right from minus 1.0 s at the left edge to plus 0.3 s at the right; a vertical cyan reference line at 0 labelled "Choice" (28 px, muted) sitting at 77 percent of the plate width; unlabelled ticks every 0.25 s. Two traces start flat at the left: the upper one amber (`--sim-move`, 6 px, round caps) with a 28 px label "Take the risk" at its left end, the lower one cyan (`--sim-line`) labelled "Avoid". At the left end of each trace a small filled circle (radius 16, the patch, with the amber glow on the amber one). Between the two circles a thin `--sim-dim` bracket with the label "~2 cm apart" (28 px). A 64 px amber readout in the upper right reads the time to the choice as a countdown with one decimal, "1.0 s" to "0.0 s". Three labels at most on the plate at any time: the Animator hides "~2 cm apart" once the countdown starts.

What changes over time:
- 16.1 to 16.5: wipe in; the axis, the Choice line and both patch circles draw on (ease-out).
- 17.0: the amber patch lights (tick); 18.2: the cyan patch lights (tick); "~2 cm apart" bracket draws between them. Both traces are flat at their baselines; the readout is blank.
- 21.3 to 26.4 (the "opposite jobs" sentence): on "risky" (about 23.2 s) the amber trace draws forward from its baseline and rises over 0.4 s to a plateau (a smooth step up of 60 px) while the cyan trace stays flat (tick); on "safe" (about 25.4 s) the amber trace resets flat and the cyan trace draws forward and rises to its plateau (tick). No clock yet: this shows which patch fires for which choice, not when.
- 26.4 (hard cut to BG-04 behind, plate continues with `enter` 0): the countdown starts. Both traces redraw flat from the left at 220 px per plate second; the readout counts down from "1.0 s" with ticks at each 0.1 s (ten ticks). At readout "0.5 s" (about 28.0 s, as "half a second" is spoken) the amber trace lifts to its plateau and a 28 px label "Signal" appears above that point; the cyan trace stays flat (a risky trial is shown; the caption band and the previous window carry the other case). At "0.0 s" (about 30.2 s) the trace heads reach the Choice line; a thud; the readout holds "0.0 s" and the label "Choice" pulses cyan once.
- 31.2: the plate exits on a hard cut.

Spec for the Animator, `dual-trace` fields: `min`, `max` (seconds relative to the event), `event:{value,label}`, `traces:[{label,colour,step:{at,height}}]`, `bracket:{label,show,hide}`, `countdown:{at,from,to,dur,decimals,unit}`, `rate` (px/s), `signalLabel:{at,text}`. Every frame is a pure function of local time. Add an example to `production/reel/demo-v2.json`.

Numbers used: about 2 cm, about 0.5 s (the countdown's marked value), 6 patients (label). The 1.0 s start of the countdown is the axis scale, not a finding, and is unlabelled apart from the running readout. All from the fact-check row.

## The big number

"0.5 s", slam-in at 3.2 s as "half a second" is spoken, amber 200 px, hold 1.4 s, unit flip at 4.6 s to "500 ms" (a conversion true by definition), hold to 5.8 s, exit at 5.9 s. Thud on the slam, tick on the flip. This is the only big number; the countdown readout at 28.0 s is a 64 px simulation readout. "6 patients" is a label. The spec's counter visuals (0.5 s twice, 6 patients) collapse into this one number plus labels, per the style bible.

## End card (39.2 to 40.7 s)

BG-01 held at its final zoom so the loop closes on the hook still. Source line: "Nature Neuroscience, 15 Sept 2026. Starkweather, Chang, Knight; UCSF and UC Berkeley." Note line: "Images: generated illustrations." Handle. Settle SFX, bed fade. Caption band empty.

## PLATES LIST (4 renders from the two scenes shared with reel-avatar-bci, 9:16, free)

| ID | Scene and args | Status | Used in |
|---|---|---|---|
| BG-01 | `cortex-array --var view=patches --var lit=2 --seed 7 --frames 90 --fps 30 --out-dir production/assets/reel-brain-gamble/BG-01-seq` (3 s loop, the patches breathe) | NEW SCENE (shared) | Hook 0.0 to 6.2; 16.1 to 26.4 (under the plate); 35.9 to 39.2; end card |
| BG-02 | `cortex-array --var view=array --seed 7 --t 1.0` | NEW SCENE (shared) | 6.2 to 9.6 |
| BG-03 | `decoder-screen --var view=hallway --seed 7 --t 1.0` | NEW SCENE (shared) | 9.6 to 16.1; 31.2 to 35.9 |
| BG-04 | `cortex-array --var view=patches --var lit=2 --seed 7 --t 2.0` rendered with `--var close=1` (the `patches` view 2 times closer; add this option to the scene) | NEW SCENE (shared) | 26.4 to 31.2 (under the plate) |

Both scenes are specified in full in `storyboards/reel-avatar-bci.md` and consolidated in `NEW-SCENES.md`; this Reel adds two options: `view=patches` with `lit=0|1|2` and `close=1`, and `decoder-screen --var view=hallway`.

Caption: line 1 the hook, line 2 "Nature Neuroscience, 15 Sept 2026. Starkweather, Chang, Knight; UCSF and UC Berkeley.", then the spec body (six patients implanted for surgical monitoring, a video game with bombs and treasure chests, two OFC patches about 2 cm apart, about 0.5 s before the choice was made) and hashtags.
