# Storyboard: carousel-organoids-5-years

Spec: `scripts/carousel-organoids-5-years.json`. Fact-check: `research/05-fact-check.md` row 6, GREEN ("about 425,000 cells from about 110 organoids"; "aged on schedule" tied to DNA-methylation clocks; "knows how old it is" only with "in effect"; some organoids to about seven years). Format: carousel, 9 slides, 1080 x 1350 (4:5). No voice. Trending audio allowed, low.

Why this carousel and not the skeleton DNA edits: the organoid is a single photogenic object that can be cropped at the frame edge on the cover (the "incomplete" cover rule), the story has one clean big number (5 years) and a real mechanism to draw (the methylation clock reading against dish time), and it is scheduled first (8 Oct). The skeleton story has stronger numbers but its hero image is a joint cross-section, which reads as medical stock, and its mechanism (a reporter assay) draws poorly. It stays next in line.

Logline: cortical organoids kept alive for five years matured through fetal-like, newborn-like and early-childhood-like stages, and their DNA-methylation clocks matched the time spent in the dish.

## Cover (slide 1)

In frame: OR-01, a pale pink-white brain organoid, a rounded lumpy sphere a few millimetres across with a faintly folded surface, sitting in clear medium in a glass dish, lit by one warm lamp from the upper left with cool blue fill from the dish edge. The organoid is prompted to sit at the upper right so the frame edge cuts off about a third of it; the cover feels cropped. Plate-scrim on. Kicker "Neuroscience". Title in `.h1.xl`, in the vertical middle third (y 450 to 900), five words: **Alive in a dish: 5 years**. Sub-line (`.body`): "And by its DNA-methylation clock it knows, in effect, how old it is. Nature, August 2026." "SWIPE" pill top right. Handle and "1 / 9" in the foot.

## Slide table

| Slide | Type | On screen | Text |
|---|---|---|---|
| 1 | cover (plate OR-01) | Organoid cropped at the right edge, plate-scrim | Kicker: Neuroscience. Title: Alive in a dish: 5 years. Sub: And by its DNA-methylation clock it knows, in effect, how old it is. Nature, August 2026. |
| 2 | mechanism (dark field, new slide type `plate-diagram` or a frame exported from the reel renderer) | The clock diagram (below) at its final state | Kicker: The clock. `.h2`: Methylation clocks matched *dish time*. Labels: dish time; clock age; 0 to 5 yr. |
| 3 | number (plate OR-02) | `.num` "5 yr" cyan 220 px over the multi-well plate still at plate-scrim | Kicker: Time in the dish. `.h2`: cortical organoids, still growing. Body: Lab-grown clusters of brain cells from the Arlotta lab at Harvard and the Broad Institute. Some kept to about seven years. |
| 4 | list (plate OR-03 at plate-scrim) | The staged organoid section still, dimmed | Kicker: The stages. `.h2`: They matured *on schedule*. Items: A **fetal-like** stage; A **newborn-like** stage; An **early-childhood-like** stage. |
| 5 | number (plate OR-04) | `.num` "~425k" over the DNA still at plate-scrim | Kicker: The dataset. `.h2`: cells profiled. Body: From about 110 organoids, combining new and earlier data. Faravelli, Arlotta and colleagues. |
| 6 | compare | Existing myth versus data cards, no plate | Kicker: Careful. Myth: These are tiny thinking brains. Data: They resemble brain tissue in gene expression, not in function. Body: The match is molecular. Function was not shown. |
| 7 | statement (plate OR-01, different crop, at plate-scrim 0.85) | The organoid, centred and dim | Kicker: Why people argue. `.h2`: The ethics question comes up *every time*. Body: As organoids get older and more lifelike, the debate about how to treat them grows with them. |
| 8 | source | Existing source type | Items as in the spec: Arlotta lab, Harvard and Broad Institute. Nature, 19 August 2026. Article s41586-026-10877-x; the Nature URL; the NIH release URL. Note: Numbers as reported in coverage. Our desk has not yet opened the paper. Images: generated illustrations. |
| 9 | cta | Existing cta type, no plate | Title: One verified science story a day. Body: No hype, source on the last slide, every time. Ask: Save this. Send it to the friend who thinks mini-brains can think. |

Slide order change from the spec: the clock (spec slide 4) moves to slide 2 as the mechanism slide, and the "5 yr" number (spec slide 2) moves to slide 3, per the carousel system (cover, mechanism, number). Wording is unchanged except the added "Some kept to about seven years" on slide 3, which is in the fact-check row.

## Mechanism diagram (slide 2, and the source of the number on slide 3)

What is drawn: on the dark field, a horizontal grey `--line` ruler labelled "dish time" from 0 to 5 yr with a tick and a 28 px label at each year. Above it, a stylised DNA double strand drawn as two interleaved cyan sine curves across the full width (6 px, round caps), with small amber dots (12 px) sitting on the strand: the methyl marks. The dots are sparse at the left (year 0) and dense at the right (year 5), increasing steadily. Above the strand a second ruler labelled "clock age" with the same 0 to 5 yr ticks in amber. A thin vertical amber line joins the same year on both rulers at three points (about year 1, year 3, year 5), showing that the clock reading and the dish time line up. Three 28 px labels: "dish time", "clock age", "methyl marks". No numbers except the year ticks. This is the reel-style mechanism plate frozen at its final frame; if the story is later cut as a Reel, the animation is the dots accumulating left to right over 5 s with the readout counting 0 to 5 yr.

What it does not claim: it does not plot data. The increasing density is the definition of what a methylation clock reads (the spec's caveat notes this line is definitional), and the alignment of the two rulers is the finding as reported. The stage names (fetal-like, newborn-like, early-childhood-like) are not placed on the ruler because the coverage gives no year for each; they stay as a list on slide 4.

## The big number

"5 yr" on slide 3, `.num` 220 px cyan, static (carousels do not animate). The ~425k on slide 5 is a second number slide, allowed on carousels because the number is the dataset size, not a second claim; the Graphics desk keeps it at `.num` but with the kicker making clear it is the dataset.

## End (slides 8 and 9)

Slide 8 source, with the "Images: generated illustrations" note added to the existing note line. Slide 9 the standard cta. No still on either.

## Stills list (4, all 4:5, flux-2-pro, resolution 2K)

| File | Prompt | Aspect | Used in |
|---|---|---|---|
| `assets/carousel-organoids-5-years/OR-01-organoid-in-dish.png` | A single pale pink-white brain organoid, a lumpy sphere a few millimetres across with a faintly folded surface, resting in clear medium in a shallow glass dish, placed toward the upper right so its edge runs out of frame, lit by one warm lamp from the upper left with cool blue reflections off the glass rim, macro lens, shallow depth of field, the dark bench fading to black across the lower third, no text, no letters, no watermark. | 4:5 | Slide 1 (cover), slide 7 (recropped by the plate focus, not by cutting the file) |
| `assets/carousel-organoids-5-years/OR-02-multiwell-plate-incubator.png` | A clear multi-well culture plate seen from a low angle inside a dim incubator, each round well holding a small pale organoid in pink-tinted medium, condensation beads on the lid, a soft amber indicator glow from the incubator wall and cool blue light from one side, macro lens with shallow depth of field so only the nearest wells are sharp, the plate crossing the upper half of the frame, the lower third dark, no text, no letters, no watermark. | 4:5 | Slide 3 |
| `assets/carousel-organoids-5-years/OR-03-organoid-section-layers.png` | A thin stained cross-section of a brain organoid seen under a fluorescence microscope, concentric layers of cells glowing in cyan and a warm amber band around a central cavity, the tissue forming a rounded rosette shape, black background, fine cellular detail in the layers, shallow depth of field with a gentle bloom on the brightest cells, the section filling the upper two thirds of the frame and the lower third black, no text, no letters, no watermark. | 4:5 | Slide 4 (dimmed plate) |
| `assets/carousel-organoids-5-years/OR-04-dna-methyl-marks.png` | A DNA double helix rendered as a physical model in cool blue-grey glass, small warm amber beads attached at intervals along the strand, the helix running diagonally across the upper half of the frame and falling out of focus at both ends, lit by one warm lamp catching the beads and a cold rim light on the glass, black background, macro lens, shallow depth of field, the lower third dark, no text, no letters, no watermark. | 4:5 | Slide 5 |

Caption: unchanged from the spec, with "Source on slide 8." kept, plus "Images are generated illustrations." before the hashtags.

Renderer note for the Graphics desk: `render.mjs` needs a `bg` field (image path plus an optional focus point) on cover, number, statement and list slides, drawing the `.plate` and `.plate-scrim` from the style bible additions under the existing text stack, and a `plate-diagram` slide type that takes an SVG file exported from the reel renderer at a given t. Both are additive.
