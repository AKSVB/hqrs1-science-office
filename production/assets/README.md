# Generated assets

Stills are generated with ElevenLabs Creative (flux-2-pro by default; gpt-image-2 when rendered text or diagrams are needed; bytedance-seedream-5-pro for photoreal product-style shots). Always set model parameters aspect_ratio "9:16" (Reels) or "4:5" (carousels) and resolution "2K"; the prompt alone does not control aspect ratio. One still costs about 270 credits. Music beds (eleven_music_v2) cost about 900 credits per 45 s; sound effects about 50 credits each.

Layout: `assets/<post-name>/<scene>-<slug>.png` plus `prompts.json` recording model, parameters and prompt for every file, so a still can be regenerated. `tests/` holds calibration renders.

Prompting (FLUX): subject first, natural prose, 30 to 80 words, no negative prompts, describe lighting and lens, leave the lower third dark and empty for captions, "no text, no letters, no watermark".
