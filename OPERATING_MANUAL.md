# Operating manual: hqrs_1 content office

Version 1.0, 2026-09-27.

## 1. Mission and positioning

Mission: make @hqrs_1 the most trusted daily science account on Instagram, and grow it as fast as the evidence allows.

Positioning (from the research desks, see `research/`):
- One verified science story a day. Every post cites its source on the last slide or in the caption. Source-citing is rare on short-form science and is a differentiator, not a cost (JCOM 2026 study in `research/01-trend-scout.md`).
- One repeatable format before widening. Accounts that held one format for years grew (physicsfun, Zack D Films); accounts that drifted stalled (AsapSCIENCE, Physics Girl). See `research/04-competitor-analyst.md` section 6.
- Reels for reach, carousels for saves, roughly 3:2 per week. Reels average ~31% reach rate, carousels the highest engagement and saves (Socialinsider 2026, in `research/03-growth-strategist.md`).
- Two open gaps a new account can own: a daily paper-of-the-day carousel with a Reel cut-down, and a bilingual English/Hindi line with burned-in captions in both scripts. No verified large incumbent in either.

## 2. Org chart and responsibilities

Each role has a standing brief in `roles/`. The brief is the prompt to re-run that desk each week.

| # | Role | Owns | Delivers | SLA |
|---|---|---|---|---|
| 1 | Trend Scout | What is spreading on Instagram/TikTok/Shorts in science now | Weekly trend memo: 10+ stories, formats, hooks, audio, feature changes | Monday 09:00 |
| 2 | Publications Desk | Nature, Science, Cell, NEJM, PNAS, arXiv, press offices | Weekly list of 15-20 candidate stories scored V/S with URLs and caveats | Monday 09:00 |
| 3 | Growth Strategist | Ranking signals, cadence, benchmarks, growth math | Monthly update to `research/03-growth-strategist.md`; growth table refresh | First Monday of month |
| 4 | Competitive Analyst | What top and fast-growing science accounts do | Monthly competitor memo; ad-hoc teardown of any post over 1M views in the niche | First Monday of month |
| 5 | Scriptwriter | Hooks, scene timing, captions, voiceover | JSON specs in `scripts/` that render without error | Tuesday 18:00 |
| 6 | Fact-Checker | Every number and claim on screen | GREEN/AMBER/RED verdict per story with two independent sources per number | Tuesday 18:00 |
| 7 | Graphics Designer | Brand kit, carousel layout, cover thumbnails | Rendered carousels; brand.css changes with before/after renders | Thursday 12:00 |
| 8 | Animator | Reel scenes and visual types, motion | Rendered MP4s; new visual types in render-reel.mjs when a story needs one | Thursday 12:00 |
| 9 | Editor | Final cut: voiceover, audio levels, captions, cover frame, file specs | QC-passed files in `production/out/`, one folder per post | Thursday 18:00 |
| 10 | Publisher / Community | Posting, Trial Reels, Stories, replies, DMs, collabs | Posts at slot; all comments answered within 60 min; weekly collab | Daily |
| 11 | Analytics Officer | Instagram Insights, the weekly log, projections | `analytics/weekly_log.csv` filled; projection run; anomalies flagged | Sunday 18:00 |
| 12 | Monitor (Chief of Staff) | Tracks every desk against SLA, escalates slips, keeps the task board | Monday status report; blocked-items list | Monday 08:00 |
| 13 | Director | Final calls on what ships, format changes, kill/double-down | `DECISION_MEMO.md` updated weekly | Monday 10:00 |

The account owner is above the Director: nothing is posted without the owner's approval until the owner delegates it explicitly.

## 3. The daily pipeline

```
intake -> score -> script -> fact-check gate -> render -> editor QC gate -> schedule -> publish -> reply window -> log
```

1. Intake. Trend Scout and Publications Desk file candidates into the Monday memo. Each candidate carries: one-sentence finding, venue and date, URL, "so what", visual hook, one-line Reel hook, caveats.
2. Score. V (Instagram virality potential, 1-10) and S (scientific solidity, 1-10). Ship threshold: V+S >= 14 and S >= 6. A story with S <= 5 ships only as an explicit "contested" piece, never as a finding.
3. Script. Scriptwriter writes the JSON spec. Rules: first scene is the false-sounding claim, stated as a claim, not a question; at most 12 words on screen per scene; 30-60 s for explainers; end card; caption under 60 words naming the journal and year; 3-5 hashtags; no em dashes; no "you won't believe".
4. Fact-check gate. Each number on screen needs two independent sources. Verdicts: GREEN ships; AMBER ships with the caveat written into the on-screen copy (not only the caption); RED does not ship. The Fact-Checker's memo is filed under `research/` with the date.
5. Render. Graphics renders carousels; Animator renders Reels. Both check every frame against the safe zones in `production/brand.css`.
6. Editor QC gate (checklist below).
7. Schedule. Publisher schedules in the Instagram app or Meta Business Suite at the slot in `calendar/`. New hooks or new formats go out as Trial Reels first (once each; repeated identical trials can be reach-limited per Mosseri, 25 Sep 2026).
8. Publish and reply. Publisher answers every comment in the first 60 minutes with a real sentence, asks one specific question in the caption, reshares the post to Stories with a poll or question sticker.
9. Log. Analytics Officer records the post in `analytics/weekly_log.csv` after 24 h and again after 7 days.

### Editor QC checklist (all must pass)

- Reel: 1080x1920, H.264, yuv420p, 30 fps, under 60 s unless the Director approved longer; no watermark from any other app; no black bars.
- Style bible compliance (`strategy/STYLE_BIBLE.md`): subject in frame and moving at 0.0 s; photoreal or mechanism visual in every scene; no text-only scene over 2 s; at most two text elements at once; contact sheet reviewed.
- Carousel: 1080x1350 PNGs, 6-10 slides, cover text sits in the vertical middle third so it survives the 3:4 grid crop.
- Hook visible and readable in frame 1; skip risk judged by watching the first 3 seconds cold.
- Captions burned in; SRT exported; voiceover and on-screen text promise the same thing.
- Voiceover muxed with `--audio` (Bomani voice, one take); Reel length equals narration plus the 2.5 s end card; under 60 s.
- Source slide or source line present and matches the Fact-Checker's memo.
- Alt text written for every slide (Publisher pastes it at upload).
- Handle @hqrs_1 on every slide and frame, outside Instagram's UI overlays.
- Caption: first line carries the hook and the key term; under 60 words for Reels, under 80 for carousels; one specific question; 3-5 hashtags; no engagement bait.

## 4. Cadence

Weekly output target: 5 Reels (1-2 as Trial Reels), 2 carousels, 2-4 Stories a day, 1 collab post. Buffer's 2M-post dataset found reach per post rises with frequency up to 10+ posts a week with no fatigue penalty; Mosseri's own guidance is a few feed posts a week plus daily Stories. Start at 7 feed posts a week and hold it for 8 weeks before judging.

Posting slots (owner's local time; adjust after 2 weeks of Insights "most active times"): Reels 18:30 on weekdays, 11:00 on weekends; carousels 08:00. Stories spread through the day.

Cross-posting: the clean master MP4 (no watermark) goes natively to YouTube Shorts and TikTok with a platform-specific first line. Shorts had the strongest reach at every account size in Socialinsider's 69M-video study.

## 5. KPIs and thresholds

Primary (ranking signals in Mosseri's stated order): average watch time and retention curve; sends per reach (shares); likes per reach. Growth: non-follower share of views; follows per 1,000 non-follower views (native in Insights since April 2026); saves per reach for carousels.

Targets for the first 60 days, to be replaced by the account's own baselines after two weeks of data:

| Metric | Floor | Good | Double-down |
|---|---|---|---|
| Reel views / followers | 0.3 | 1.0 | 3.0 |
| Non-follower share of Reel views | 40% | 60% | 75% |
| Skip rate (first 3 s) | worst quartile = rework | median | best quartile |
| Average watch time / length | 33% | 50% | 70% |
| Sends per reach | 0.5% | 1% | 2% |
| Saves per reach (carousel) | 1% | 2% | 4% |
| Follows per 1,000 non-follower views | 3 | 9 | 20 |
| Comment reply time | 60 min | 30 min | 15 min |

Decision rules:
- Double down on a format when its median Reel beats the trailing 8-week median views by 2x and sits in the top quartile on sends per reach and follows per 1,000 views.
- Kill or rework a format after 4-6 posts if skip rate is in the worst quartile, watch time under a third of length, sends below median, and follows per 1,000 under half the base rate.
- Never judge a format on likes.

Growth model (from `research/03-growth-strategist.md`): new followers = non-follower views x follow rate. At the base assumption of 9 follows per 1,000 non-follower views and 60% non-follower share, +1,000 followers in 12 weeks needs about 15k total views a week; +10,000 in 26 weeks needs about 71k a week; +100,000 in 52 weeks needs about 355k a week. `analytics/projection.mjs` recomputes this from the account's own log.

## 6. Guardrails

- Original content only. Instagram removed reposters from recommendation surfaces for Reels (July 2025) and photos and carousels (30 April 2026). Watermarks, credit tags, screenshots and speed changes do not count as edits. Re-cut agency footage only with our own narration, annotation and analysis.
- No engagement bait ("tag 3 friends", "like for A comment for B"). Ask one real question.
- No follow/unfollow, automation, bought followers.
- Reels under 3 minutes; over that they are reportedly not recommended to non-followers.
- AI-generated visuals are labelled and are our own; the script is always ours.
- Health and medicine: no "cure", no dosing advice, sample size on screen when under 10.
- Never state a preprint or a press-release claim as settled. AMBER copy carries its caveat on screen.
- Hoaxes are covered as debunks with the hoax's headline in frame 1 and the verdict in frame 2.

## 7. Weekly rhythm

| Day | Desk | Output |
|---|---|---|
| Mon | Monitor 08:00; Scout + Publications 09:00; Director 10:00 | Status, memos, 7 picks, decision memo |
| Tue | Scriptwriter + Fact-Checker | 7 specs, 7 verdicts |
| Wed | Graphics + Animator | Renders for Thu-Sun |
| Thu | Editor; Graphics + Animator | QC pass; renders for Mon-Wed |
| Fri | Publisher | Week's schedule locked; collab arranged |
| Sat | Publisher | Trial Reel review (24 h and 72 h) |
| Sun | Analytics Officer 18:00 | Log filled, projection run, anomalies flagged |

## 8. Tentpole calendar (next 90 days, for pre-built explainers)

- Starship Flight 14, first ship-catch attempt: NET 28 Sep 2026.
- Saturn opposition: 4 Oct 2026 (brightest of the year, rings visible in binoculars).
- Nobel Prizes: Physiology or Medicine, Physics, Chemistry are announced in the first full week of October; prepare a "what they found, in 40 seconds" template for each.
- Orionid meteor shower peak: around 21 Oct.
- Leonid meteor shower peak: around 17 Nov.
- Geminid meteor shower peak: around 13-14 Dec.
- Any JWST or Mars-mission release: same-day explainer with our own annotation.

Confirm each date with the Publications Desk the week before.

## 9. Escalation

The Monitor escalates to the Director when: a desk misses its SLA by more than a day; a fact-check returns RED on a story already scheduled; a post's skip rate is in the worst quartile two days running; or any comment thread raises a factual correction. The Director's response goes into `DECISION_MEMO.md` the same day and, if a correction is warranted, into a pinned comment on the post within 24 hours.

## 10. Storage rule

GitHub (`AKSVB/hqrs1-science-office`) is the archive of record while the account's cloud credits last. The owner keeps a mirror on the local D: drive at `D:\hqrs1-science-office` by running `tools/sync-to-local.ps1` after each cycle (macOS/Linux: `tools/sync-to-local.sh`). Once cloud credits are exhausted, the local folder becomes the working copy: all new renders, assets and memos are saved there first, and the Editor notes the switch in `DECISION_MEMO.md`. Generated media that would exceed GitHub's comfortable size (large PNG batches, MP4s over 50 MB) goes only to the local folder from that point on, with the spec and prompts still committed so any asset can be regenerated.
