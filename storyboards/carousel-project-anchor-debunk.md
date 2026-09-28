# Storyboard: carousel-project-anchor-debunk

Spec: `scripts/carousel-project-anchor-debunk.json`. Fact-check: NONE. Neither `research/05-fact-check.md` nor `research/06-fact-check-wave2.md` has a row for this story; the hoax's own figures (7 seconds, 14:33 UTC, 12 August 2026, "$89 billion") are quoted from the spec as the claim, and the only factual statements (no such NASA document existed; NASA and observatory officials debunked it; a real total solar eclipse on 12 August 2026 seen from Spain, Iceland and Greenland) are from the spec's trend-memo sources. GATE: build it, but it ships on 10 Oct only after the Fact-Checker files a row confirming the debunk sources and the eclipse visibility line. Format: carousel, 9 slides, 1080 x 1350 (4:5). No voice. Trending audio allowed, low (a debunk is a card post). Calendar: 10 Oct.

Why this carousel is a debunk template: the claim is quoted once, in its own words, on one slide; the physics answer is the compare device; the number slide is honest (zero documents); the eclipse slide gives the reader the real thing that happened that day; the last idea slide is reusable for every dated doom post.

Logline: Earth did not lose gravity for seven seconds on 12 August 2026; the "Project Anchor" posts cited a leaked NASA document that never existed, gravity is a property of mass with no off switch, and the real event that day was a total solar eclipse.

## Cover (slide 1)

In frame: PA-01, the curved limb of Earth from low orbit, the thin blue atmosphere line along the curve, the sun breaking over the limb at the upper right, the night side below, the curve running out of the frame on the right so the cover feels cropped. Plate-scrim on. Kicker "Debunk". Title in `.h1.xl`, in the vertical middle third (y 450 to 900), five words: **Earth did not lose gravity**. Sub-line (`.body`): "The 'Project Anchor' hoax of 12 August 2026, and what physics says. Not a paper: NASA and observatory debunks, August 2026." "SWIPE" pill top right. Handle and "1 / 9" in the foot. The cover carries no journal because there is none; the sub-line says so.

## Slide table

| Slide | Type | On screen | Text |
|---|---|---|---|
| 1 | cover (plate PA-01) | Earth's limb cropped at the right edge, plate-scrim | Kicker: Debunk. Title: Earth did not lose gravity. Sub: The 'Project Anchor' hoax of 12 August 2026, and what physics says. Not a paper: NASA and observatory debunks, August 2026. |
| 2 | mechanism (dark field, `plate-diagram` from the reel renderer's `telegraph` type at its final frame) | The flat-line diagram (below) | Kicker: The physics. `.h2`: Gravity has no *off switch*. Labels: Earth's gravity, 12 Aug; 14:33 UTC, the claim; 00:00 to 24:00 UTC. |
| 3 | number (plate PA-02) | `.num` "0" cyan 220 px over the whole Earth at plate-scrim | Kicker: The document. `.h2`: NASA documents called Project Anchor. Body: No such document existed. NASA and local observatory officials publicly debunked the claim. |
| 4 | statement (no plate) | The claim, quoted, in `--myth` colour for the quoted phrase only | Kicker: The claim. Title: A leaked "$89 billion NASA document" predicted a 7-second gravity loss. Body: At 14:33 UTC on 12 August 2026, it said. A specific time, a fake document with a huge price tag, and a real event the same day: it spread across TikTok, Facebook and Instagram. |
| 5 | compare | Existing myth versus data cards, no plate | Kicker: Myth vs physics. Myth: Gravity can switch off for 7 seconds. Data: Gravity is a property of mass. It cannot be switched off. Body: As long as Earth has mass, Earth has gravity. There is no off switch and no schedule. |
| 6 | statement (plate PA-03 at plate-scrim) | The eclipse: the black disc of the Moon, the corona streaming around it, a warm bead at the limb | Kicker: The real science that day. Title: There *was* a total solar eclipse on 12 August. Body: Seen from Spain, Iceland and Greenland. Real, spectacular, and not a gravity switch. |
| 7 | list (no plate) | Three items | Kicker: Next time. Title: How to spot the next one. Items: Exact date, exact time, huge dollar figure: **be suspicious**; Check the agency's own website for the document; Ask what law of physics would have to break. |
| 8 | source | Existing source type | Items as in the spec (the Geo.tv report of NASA's debunk; the Yahoo fact check; the Factually.co account of how it spread and who debunked it). Note: Not a research paper. A dated hoax and its debunks, August 2026. Images: generated illustrations. |
| 9 | cta | Existing cta type, no plate | Title: One verified science story a day. Body: No hype, source on the last slide, every time. Ask: Save this for the next dated doom post. Send it to the friend who shared it. |

Slide order change from the spec: the spec's nine slides become cover, mechanism, number, claim, compare, eclipse, spot-the-next, source, cta (nine), per the carousel system. The spec's "No such NASA document existed" statement becomes the number slide, and its "Why it spread" list folds into the claim slide's body (the three ingredients are now one sentence there). Wording is otherwise unchanged. The claim is quoted on one slide only (slide 4), and the myth line on the compare slide is the spec's.

## Mechanism diagram (slide 2)

What is drawn: on the dark field, a horizontal grey `--line` time axis across the plate labelled at its ends "00:00" and "24:00 UTC" (28 px, muted; the label "00:00 to 24:00 UTC" counts as one), the day of 12 August 2026. Above it, one cyan line (6 px, round caps) runs dead flat from the left edge to the right edge: "Earth's gravity, 12 Aug" (28 px). Under the axis, one amber tick at 14:33 (60.6 percent of the rail) with the label "14:33 UTC, the claim" (28 px, amber); above the tick, where the hoax said the line would drop for seven seconds, nothing happens: the line does not dip, and a faint `--sim-dim` bracket seven "seconds" wide (drawn at a visible 24 px, since seven seconds is 0.008 percent of the day and would be invisible; a 28 px note "not to scale" sits under the bracket, the third label) marks where the dip was claimed. No readout, no number besides the time and the axis ends.

This is the reel renderer's `telegraph` type (a flat trace with no `drop`) frozen at its final frame, with one addition: `marks:[{frac,label,colour,bracketPx,note}]` for the tick and bracket under the axis. If the story is later cut as a Reel, the animation is the trace drawing left to right across the day at 160 px per second of plate time with the readout showing the clock, and at 14:33 the trace simply continues; that non-event is the mechanism.

What it does not claim: it does not plot a measurement of g. The flat line is the definition of what "gravity is a property of mass" means over a day (nothing in the claim's mechanism could change Earth's mass), and the slide's `.h2` says exactly that. It does not mark the eclipse, because the spec gives no time for it.

## The big number

"0" on slide 3, `.num` 220 px cyan, static (carousels do not animate), with the `.h2` "NASA documents called Project Anchor". It is the post's one number slide and its one big number. The hoax's "7 seconds" and "$89 billion" appear only inside the quoted claim (slide 4) and the myth card (slide 5), never as a number slide.

## End (slides 8 and 9)

Slide 8 source, with "Images: generated illustrations" added to the note line. Slide 9 the standard cta. No plate on either.

## PLATES LIST (3 renders: 2 existing, 1 new scene, all 4:5, free)

| ID | Scene and args | Status | Used in |
|---|---|---|---|
| PA-01 | `earth-limb --w 1080 --h 1350 --t 1.0 --seed 1` (the limb view; its horizon runs out of the right edge, which is the cover's crop) | EXISTS | Slide 1 (cover) |
| PA-02 | `earth-limb --var view=globe --w 1080 --h 1350 --t 1.0 --seed 1` | EXISTS | Slide 3 (number) |
| PA-03 | `eclipse-corona --var view=totality --w 1080 --h 1350 --t 1.0 --seed 41` | NEW SCENE | Slide 6 |

Both Earth plates are native 4:5 renders (the scenes compose relative to the frame), not crops of the 9:16 renders.

### NEW SCENE SPEC: `eclipse-corona` (2D canvas)

- Name and options: `eclipse-corona`, `--var view=totality` (default) | `diamond`.
- What is drawn: a total solar eclipse at totality. The Moon: a perfectly black disc (`#03050c`, darker than the field so it reads as a hole) of radius 0.19 of frame width, centred at 0.5 of width and 0.40 of height. The corona: radial streamers built from a seeded `fbm` sampled in polar coordinates (angle times 3, radius times 6, plus t times 0.05), thresholded and stretched radially so they read as long filaments: brightest at the limb (pale white-cyan, #eaf6ff), fading with radius to nothing by 2.4 lunar radii, with two longer equatorial streamers (at 0 and 180 degrees, 3.5 radii) and shorter polar plumes; drawn additively in six passes of increasing blur (0, 2, 6, 14, 30, 60 px) so the inner corona is sharp and the outer is a soft glow. The one warm source: three small prominences at the limb (seeded angles, each a 6 to 10 px bead of warm pink-red #ff6a5a with a 20 px amber-pink glow) so the frame has a single warm accent; nothing else is warm. Field: `--bg` lifted to `--grade-black`, a faint seeded star scatter (120 points, under 2 px, 20 percent opacity) outside 2.5 radii. Lower third under 12 percent luminance: the corona is masked below 0.68 of frame height.
  - `totality`: as above.
  - `diamond`: the same, with a single brilliant bead at the limb at 40 degrees (upper right): a white core 14 px with an 80 px warm-white flare and four thin diffraction spikes at 45 degrees, the corona 40 percent dimmer as the bead dominates. The bead is the warm source in this view; the prominences are off.
- Lighting: implied by the corona and prominences; no external light.
- Camera: fixed, the disc at 0.40 of frame height, the corona filling the upper two thirds.
- What varies with t: the corona's `fbm` phase drifts slowly (streamers shimmer, never move as a whole), the prominences pulse plus or minus 10 percent at seeded rates near 0.4 Hz, and in `diamond` the bead's flare grows from 0.7 to 1.0 over the first 2 s. The disc never moves (totality is a still moment).
- Subject-only alpha layer: the Moon's disc plus the inner corona to 1.4 radii (and the bead in `diamond`); no stars.
- Budget: 2D only; about 2 s per frame.

Caption: unchanged from the spec, with "Sources on slide 8." kept, plus "Images are generated illustrations." before the hashtags.

Renderer note for the Graphics desk: this carousel needs the `bg` plate field on cover, number and statement slides and the `plate-diagram` slide type, both already requested by `carousel-organoids-5-years.md`; nothing new beyond the `telegraph.marks` addition in the reel renderer.
