# loop-spacetime: sourced assets (Sourcing desk, 30 Sept 2026)

Budget note: owner switched to FREE TOOLS ONLY mid-task. Credits spent before that
instruction: vidIQ 15 (voiceover 14 + B-roll search 1). OpenArt: 0 spent (no
generation submitted; cheapest video mode is 50 credits against a 40-credit balance,
and the free-only instruction arrived before the 10-credit still was submitted).

| File | Source / tool | Licence | Cost | Prompt / chain |
|---|---|---|---|---|
| loop-spacetime-brian-vidiq-m.mp3 (46.3 s, mono, 192 kbps) | vidIQ vidiq_voiceover_generate, voice "Brian" nPczCjzI2devNBz1zQrb, job job_3587290d-2024-4bc4-96ec-430bad0dbd7d, voiceoverId d6bcc3aa-7081-4371-abae-a21d59e080b3 | vidIQ generated media (per vidIQ terms) | 14 vidIQ credits | Script: section 3 of scripts/loop-spacetime.md verbatim (612 chars). Mastered: volume -5.146 dB -> peak -6.25 dBFS. NOTE: runs 46.3 s, over the 40 s slot; edit needs a ~14% tighten or cuts. |
| loop-spacetime-piper-m.mp3 (40.4 s, mono, 192 kbps; also at production/assets/voice/) | Piper TTS, en_US-ryan-medium, --length-scale 1.12 --sentence-silence 0.35 | MIT model (Piper), free | 0 | Same script. Mastered: volume -6 dB -> peak -5.95 dBFS. Fits the 40 s slot. |
| bed-piano-synth.mp3 (35.4 s, stereo; also at production/assets/sound/) | numpy + ffmpeg synthesis (no generator) | in-house, free | 0 | A minor loop, 4 chords x 8.75 s: Am, F, C, Em (returns to Am, loopable). Per chord: soft sustained pad (sine + 3rd/5th odd partials, 1.5 s fades) plus a slow broken-chord "piano" figure, one note per 1.09 s, each note 5 partials with slight inharmonicity, exp decay 1.4/s. ffmpeg chain: lowpass f=4500, aecho 0.7:0.5:180|360:0.25|0.12, volume +6 dB, pan mono->stereo. Result: RMS -18.26 dBFS, peak -4.78 dBFS. No drums. Fallback: production/assets/sound/bed-a-synth.mp3. |
| unsplash-nasa-cme-2012-JHyiw_dpALk.jpg (400x400 only) | Unsplash, photographer NASA (@nasa), https://unsplash.com/photos/the-sun-with-a-corona-mass-ejection-JHyiw_dpALk ; SDO image of the 31 Aug 2012 CME | Unsplash License (free, no attribution required; credit "NASA on Unsplash" recommended). Underlying NASA imagery is public domain. | 0 | Cover/end-card candidate. Only the 400 px S3 mirror was reachable; full-resolution images.unsplash.com and unsplash.com/download were blocked by the egress proxy (HTTP 000 / CONNECT rejected). Re-download at full size from an unrestricted machine. |
| unsplash-corona-2017-jcorl-OxuTDHuYWBE.jpg (400x326 only) | Unsplash, Joseph Corl (@jcorl), https://unsplash.com/photos/a-solar-eclipse-is-seen-in-the-dark-sky-OxuTDHuYWBE ; 2017 totality with corona | Unsplash License | 0 | End-card plate candidate for the 1919 eclipse line (a modern eclipse, not 1919; no 1919 plates exist on Unsplash). Same low-res caveat. |
| unsplash-eclipse-2024-merittthomas-I5YTknpBoMQ.jpg (400x600 only, 9:16-friendly) | Unsplash, Meritt Thomas (@merittthomas), https://unsplash.com/photos/a-solar-eclipse-is-seen-in-the-dark-sky-I5YTknpBoMQ ; 2024 totality, Houlton, Maine | Unsplash License | 0 | Portrait end-card candidate. Same low-res caveat. |

## Found but not downloadable (blocked host)
- vidIQ vidiq_generate_broll "sun surface solar flare prominence" (1 credit): 4 Pexels clips by Nicola Narracci, all 10 s; the portrait one is https://www.pexels.com/video/dramatic-solar-surface-close-up-with-flares-37944582/ (1080x1920, mp4 https://videos.pexels.com/video-files/37944582/16100873_360_640_30fps.mp4). Pexels licence, credit required. videos.pexels.com and www.pexels.com returned HTTP 000 (proxy CONNECT rejected). Recommended hook shot; fetch from an unrestricted machine.

## Unavailable
- NASA public domain: svs.gsfc.nasa.gov, images-api.nasa.gov, sdo.gsfc.nasa.gov, www.nasa.gov all HTTP 000, proxy message "gateway answered 403 to CONNECT (policy denial or upstream failure)". No SDO clip or still obtained.
- vidIQ music bed: vidiq_generate_music costs 25 credits per track, above the 15-credit gate; not called.
- vidIQ generated video: cost is only quoted at submit (charged on submit); not called; then free-only rule.
- OpenArt: balance 40 credits, Free plan; every video mode 50 credits or more (not affordable); no still generated after the free-only instruction. Upgrade URL from the tool: https://openart.ai/pricing?utm_source=mcp
- No video was sourced, so no 1080x1920 H.264 conversion was performed.
