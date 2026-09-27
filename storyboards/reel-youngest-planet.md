# Storyboard: reel-youngest-planet

Spec: `scripts/reel-youngest-planet.json`. Voice: `production/assets/voice/reel-youngest-planet-voice.mp3` (48.6 s, about 152 wpm). Fact-check: `research/05-fact-check.md` row 7, AMBER (mass wording applied: "roughly Jupiter's mass, models give about 2 to 4"). Post type: mechanism reveal, space lane. Bed A.

Logline: Elias 2-24 b, under one million years old, is the youngest planet ever found, still embedded in its birth disk about 55 au from its star, and it was found in archival Keck data.

Track cut: remove the last two sentences, "The paper is in the Astrophysical Journal Letters." and "Source in the caption." (about 43.6 to 48.6 s), at the silence before "The paper". The end card carries the journal. Cut track about 43.6 s; total with the end card about 45.1 s.

Timings are estimates from word counts against the track length; the Editor aligns every row to the words JSON.

## Hook frame (0.0 s)

In frame: YP-01, the curved limb of Earth from low orbit, the thin blue line of the atmosphere along the top of the curve, the sun just breaking over the edge at upper right, the night side below fading to black, the planet's curve crossing the upper half of the 9:16 frame, the lower third black space. What moves: push-in 1.00 toward 1.08 on the sunrise point; the parallax plate is off (wide subject). Voice at 0.0 s: "Earth is four and a half billion years old." Hook line up by 0.3 s, five words: **Earth: 4.5 billion years old**. Motif at 0.0 s. No ambience (space).

## Scene table

| Time (s) | On screen | Camera move | On-screen text (6 words max) | Voice (verbatim) | Sound |
|---|---|---|---|---|---|
| 0.0 to 3.6 | YP-01 Earth's limb at sunrise | Push-in 1.00 to 1.08, focus [0.7, 0.3] | Hook line: Earth: 4.5 billion years old | Earth is four and a half billion years old. | Motif; bed A in |
| 3.6 to 6.5 | YP-02 the newborn planet, dull red, inside a dark gap in a dusty disk, close | Push-in 1.00 to 1.10, focus on the planet | Big number: "< 1,000,000" slams at 4.6 s, flips to "under 1 million years" at 5.6 s, exits 6.5 s | This planet is not even one million. | Thud on the slam; tick on the flip |
| 6.5 to 12.0 | YP-03 wide view of the disk around the young star, a dark gap ring, the planet a point of warm light inside the gap | Drift right 5 percent, focus on the gap | Elias 2-24 b | It is called Elias 2-24 b, and it is the youngest planet ever found. | none |
| 12.0 to 16.4 | Age ruler plate (log ruler, new type) over YP-03 at scrim 0.75, hard cut, no wipe | Drift continues | Mechanism labels: Elias 2-24 b, under 1 Myr; PDS 70 and WISPIT 2, over 5 Myr; Earth, 4.5 Gyr | The previous record holders are all over five million years old. | Ticks as each mark lights |
| 16.4 to 22.6 | YP-04 the planet close, banded, faint streams of disk material falling onto it | Push-in 1.00 to 1.10 | Jupiter-mass; models say 2 to 4 | It is roughly Jupiter's mass, though the models give anything from about two to four Jupiters. | none |
| 22.6 to 25.8 | YP-03 wide disk | Push-out 1.08 to 1.00 | About 450 light-years away | It sits about four hundred and fifty light-years away, | none |
| 25.8 to 33.3 | Cross-section wipe (0.40 s, upward) into the orbit and ruler plate over YP-04 at scrim 0.75 | Drift left 4 percent under the plate | Mechanism labels: star; disk; 55 au | still embedded in the disk of material it formed from, about fifty five astronomical units out from its star. | Thud at 25.8; ticks as the ruler counts |
| 33.3 to 36.2 | YP-05 the two Keck domes on the summit at night under stars | Tilt-up (focus [0.5, 0.6] to [0.5, 0.4]) | No new telescope | Nobody pointed a new telescope at it. | Motif (payoff) at 33.3 |
| 36.2 to 39.7 | YP-06 the segmented hexagonal primary mirror inside the dome | Push-in 1.00 to 1.10 | Bernardi, Universidad Diego Portales | The team, led by Andrea Bernardi at Universidad Diego Portales, | none |
| 39.7 to 43.6 | YP-02 the newborn planet again | Push-in 1.10 to 1.14 | Archival Keck data, 2018, 2020 | found it in archival data from the Keck Observatory. | none |
| 43.6 to 45.1 | End card: YP-02 held at 1.14 | Push-in continues to 1.16 | Source line: Astrophysical Journal Letters, 16 Sept 2026. Bernardi, Cieza, Universidad Diego Portales. Note: Images: generated illustrations. | (silence) | Settle; bed fades 1.5 s |

## Mechanism animations

### A. Age ruler (12.0 to 16.4 s; new renderer type `ruler-log`)

What is drawn: a horizontal ruler 936 px wide on a grey `--line` rail, logarithmic in years, from 100,000 years at the left to 10 billion years at the right, with unlabelled minor ticks at each decade. Three marks, each a vertical 6 px line with a 28 px label above it: "Elias 2-24 b, under 1 Myr" (amber, drawn at 1 million with a short amber bracket pointing left to show "under"), "PDS 70, WISPIT 2, over 5 Myr" (cyan, at 5 million with a bracket pointing right), "Earth, 4.5 Gyr" (cyan, at 4.5 billion). No bars, no filled area.

What changes over time: 12.0 to 12.6 the rail draws on left to right; 12.6 the Earth mark lights (tick); 13.4 the PDS 70 and WISPIT 2 mark lights (tick); 14.4 the Elias mark lights and pulses amber (tick); a 64 px amber readout above the Elias mark reads "under 1 Myr" and holds. Nothing else moves. A log scale is the honest version of the spec's "not to scale" bar ladder, and the spec's caveat line is no longer needed on screen.

### B. Orbit and ruler (25.8 to 33.3 s; renderer type `orbit` plus a ruler count)

What is drawn: the star at centre (the existing `starg` glow), a faint dusty disk drawn as a wide translucent cyan annulus at 20 percent opacity, a darker gap ring in the annulus at the planet's radius, the planet as an amber dot with a short trail on a tilted orbit (tilt 60 degrees, prograde). Labels: "star" at the centre (28 px, muted), "disk" on the annulus, "55 au" at the ruler's end.

What changes over time: 25.8 to 26.2 wipe in, the star and disk fade up; 26.2 to 31.0 the planet moves along its orbit at one revolution per 9 s; 27.4 to 30.4 a straight amber ruler line draws from the star to the planet while the 64 px readout counts 0 to 55 au (ticks at 10, 20, 30, 40, 50, 55, six ticks) and holds at "55 au"; 31.0 the readout unit rolls once to "55 x Earth to Sun" (the definition of the astronomical unit, no new fact) and holds; 33.3 the plate exits on a hard cut. The disk annulus and gap are illustrative and are drawn at the planet's radius only; no disk dimensions are shown or implied.

## The big number

"< 1,000,000", slam-in at 4.6 s as "one million" is spoken, amber 200 px (the "<" at 60 percent size), hold 1.0 s, unit flip at 5.6 s to "under 1 million years" (format flip; the 200 px figure becomes two words at 120 px), hold 0.9 s, exit at 6.5 s. Thud on the slam, tick on the flip. This is the post's one big number; the 450 ly and 55 au are a label and a simulation readout, not big numbers.

## End card (43.6 to 45.1 s)

YP-02 held at its final zoom; the loop returns to YP-01's Earth, which is a deliberate contrast cut (old world to new world) rather than a match. Source line: "Astrophysical Journal Letters, 16 Sept 2026. Bernardi, Cieza, Universidad Diego Portales." Note: "Images: generated illustrations." Handle. Settle, bed fade.

## Stills list (6, all 9:16, flux-2-pro, resolution 2K)

| File | Prompt | Aspect | Used in |
|---|---|---|---|
| `assets/reel-youngest-planet/YP-01-earth-limb-sunrise.png` | The curved limb of planet Earth seen from low orbit, a thin luminous blue line of atmosphere along the curve, the sun breaking over the edge at the upper right as a small hard flare, swirls of cloud and dark ocean on the day side, the night side fading to black below, photographed with a medium telephoto lens from a spacecraft window, deep black space filling the lower third of the frame, no text, no letters, no watermark. | 9:16 | Hook 0.0 to 3.6 |
| `assets/reel-youngest-planet/YP-02-newborn-planet-in-gap.png` | A newly formed giant planet glowing a dull deep red like cooling iron, seen close from inside a dark cleared gap in a vast protoplanetary disk, thick dusty orange-brown bands of disk above and below the gap, faint threads of gas drawn toward the planet, the planet in the upper centre of the frame, cinematic wide lens, one warm light from the planet, a cold faint glow from the star, the lower third dark, no text, no letters, no watermark. | 9:16 | 3.6 to 6.5; 39.7 to 43.6; end card |
| `assets/reel-youngest-planet/YP-03-disk-wide-gap.png` | A young star at the centre of a wide swirling protoplanetary disk seen from a slight angle, the disk dusty ochre and brown with a dark ring-shaped gap far out from the star, a single small point of warm light inside the gap, the outer disk fading into a blue-black field, rendered like an infrared observatory image, the disk filling the upper two thirds, the lower third dark space, no text, no letters, no watermark. | 9:16 | 6.5 to 12.0; 12.0 to 16.4 (under the ruler plate); 22.6 to 25.8 |
| `assets/reel-youngest-planet/YP-04-planet-accretion-close.png` | A giant gas planet still forming, its banded cloud tops a deep red-orange with darker storm belts, thin glowing streams of disk material spiralling down onto it from a faint dusty ring, the planet's limb in the upper half of the frame lit by its own heat, a cold distant star as a small point of light at the top edge, cinematic telephoto lens, the lower third of the frame fading to black, no text, no letters, no watermark. | 9:16 | 16.4 to 22.6; 25.8 to 33.3 (under the orbit plate) |
| `assets/reel-youngest-planet/YP-05-keck-domes-night.png` | Two large white observatory domes side by side on a bare volcanic summit at night, the Milky Way arching above them in a clear dark sky, thin cirrus on the horizon, a faint red glow of instrument light at the base of one dome, cinder and rock in the foreground, photographed with a wide lens on a long exposure, the summit occupying the middle of the frame and the lower third dark ground, no text, no letters, no watermark. | 9:16 | 33.3 to 36.2 |
| `assets/reel-youngest-planet/YP-06-segmented-mirror.png` | The primary mirror of a large telescope seen from inside its dome, a wide dish made of many hexagonal mirror segments fitted together, each segment reflecting faint blue-grey light from the open dome slit above, the steel truss structure rising around it, a mist of cold night air, photographed with a wide lens from the observing floor, the mirror in the upper two thirds of the frame and the lower third in deep shadow, no text, no letters, no watermark. | 9:16 | 36.2 to 39.7 |

Caption: line 1 the hook, line 2 "Astrophysical Journal Letters, 16 Sept 2026. Bernardi, Cieza and colleagues, Universidad Diego Portales.", then the spec body and hashtags.
