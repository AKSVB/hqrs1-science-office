# Exact caption alignment with Descript

Our word sidecars (`scripts/v2/<reel>.words.json`) are letter-weighted estimates and
drift up to ~1.4 s late in a 40 s track (measured on reel-two-brains: mean 0.39 s,
max 1.38 s at "550 million years"). Descript's transcription gives real timings.
This is the standard procedure; it took ~3 minutes end to end for a 39 s track.

## Steps

1. **Import the mastered narration mp3 directly** (no Drive upload needed).
   `mcp__Descript__import_media` with `project_name`, and
   `add_media: {"<reel>-piper-m.mp3": {"content_type": "audio/mpeg", "file_size": <bytes>, "language": "en"}}`
   plus `add_compositions: [{"name": "<reel>", "clips": [{"media": "<reel>-piper-m.mp3"}]}]`.
   The response returns `upload_urls.<key>.upload_url`. PUT the file to it:
   `curl -X PUT -H 'Content-Type: application/octet-stream' --upload-file <mp3> '<upload_url>'` (expect HTTP 200).
   `file_size` must equal the real byte size (`stat -c %s`). Use the mp3, not the 20 MB mp4:
   the audio is what we align and it uploads in seconds.
2. **Wait for transcription**: `mcp__Descript__wait_for_job` with the returned `job_id`
   until `job_state: stopped`, `result.status: success` (about 25 s for 40 s of audio).
3. **Export twice** with `mcp__Descript__export_transcript` (`project_id`, `include_speaker_labels: off`):
   - `format: srt` -> save as `<scratch>/descript-<reel>.srt` (cue boundaries, gives sentence ends).
   - `format: txt`, `timecodes: {"frequency_seconds": 0.25}` -> save as `<scratch>/descript-<reel>.tc025.txt`.
     Descript has no word-level JSON export; the 0.25 s timecode markers are the
     word-level source. They print as HH:MM:SS only, so the converter recovers the
     sub-second position by counting markers (N-th marker = N x 0.25 s) and resyncs on
     the printed second.
4. **Convert** to our sidecar schema, keeping our tokens (spelling, punctuation and the
   band substitutions such as `"550 million years"` as one token):
   `python3 production/tools/descript-words.py scripts/v2/<reel>.words.json <scratch>/descript-<reel>.srt <scratch>/descript-<reel>.tc025.txt scripts/v2/<reel>.words.descript.json`
   It exits with a `token mismatch` message if Descript heard different words; fix the
   base sidecar spelling (or the transcript text) and rerun. It prints the mean/max shift
   versus the estimate.
5. **Render into a separate folder** (the renderer takes an explicit output path):
   `node production/reel/render-reel.mjs scripts/v2/<reel>.json production/out/<reel>.aligned/<reel>.mp4 --jpeg --words scripts/v2/<reel>.words.descript.json`
6. **Spot-check** 4 frames at word boundaries against the old render, then, if it is
   better, copy `<reel>.words.descript.json` over `<reel>.words.json` and re-render normally.

## Notes
- Word starts are quantised to 0.25 s (or finer if you use a smaller `frequency_seconds`;
  0.1 s also works but the export is longer). Ends are the next word's start, capped at
  the SRT cue end so the last word of a sentence does not hang through the pause.
- Descript rewrites numbers as digits ("550 million") and normalises punctuation; the
  converter compares only letters and digits, so that is harmless.
- Reference run: project https://web.descript.com/4a9be0f0-fd19-4ce0-b020-f18335d22dc4 (reel-two-brains, 2026-09-29).
