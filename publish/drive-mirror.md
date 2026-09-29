# Google Drive mirror

Folder: **hqrs1 science office** — https://drive.google.com/drive/folders/1QqbD4vYQcHefM3PnDZyA2oIs_NP4jpIe
Created 2026-09-29 by the Publisher desk via the Google Drive connector. Owner: anjanikumar0891@gmail.com.

## What is on Drive

```
hqrs1 science office/
  README.txt                                  post list: date, source line, caption file
  reels/
    reel-13-atoms-string-breaking-caption.txt
    reel-ai-navier-stokes-caption.txt
    reel-avatar-bci-caption.txt
    reel-betel-teeth-caption.txt
    reel-brain-gamble-caption.txt
    reel-fire-amoeba-caption.txt
    reel-lz-dark-matter-caption.txt
    reel-planet-backwards-caption.txt
    reel-quantum-jump-sound-caption.txt
    reel-two-brains-caption.txt
    reel-youngest-planet-caption.txt
  carousels/
    organoids/caption.txt
    project-anchor/caption.txt
    youngest-planet/caption.txt
```

Subfolder links: reels https://drive.google.com/drive/folders/1aU23SBTTIsuKsoJ-vFLtu8qKdKSD6awA · carousels https://drive.google.com/drive/folders/1io16YNnTf68QXvnqyX2IAG-Z_u5MkJ1Z

## Not mirrored (binary upload limit)

The Drive connector's `create_file` accepts file content only inline in the tool call (`textContent` or `base64Content`); there is no path or URL upload. The smallest binary output, `reel-quantum-jump-sound/contact-sheet.png` (658,885 bytes), is 878,516 characters as base64, which is beyond what one tool call can carry, so no binary file was attempted. Skipped:

| Kind | Files | Sizes |
|---|---|---|
| Reel videos | 11 x `production/out/reel-*/reel-*.mp4` (13-atoms, ai-navier-stokes, avatar-bci, betel-teeth, brain-gamble, fire-amoeba, lz-dark-matter, planet-backwards, quantum-jump-sound, two-brains, youngest-planet) | 15.6 to 57.7 MB |
| Carousel slides | `carousel-organoids-popout/slide-01..07.png`, `carousel-project-anchor-popout/slide-01..08.png`, `carousel-youngest-planet-popout/slide-01..07.png` (22 files) | 0.73 to 1.48 MB |
| Contact sheets | 11 x `production/out/reel-*/contact-sheet.png` | 0.66 to 2.16 MB |

`reel-fire-amoeba.proof/` was excluded by design. Note: the brief expected 9 reels; `production/out` holds 11 finished reel folders, all mirrored.

To finish the mirror, drag the `.mp4` and `slide-NN.png` files into the matching Drive folders from a desktop Drive client or the web UI; the folder structure and captions are already in place.
