# Account strategy: @hqrs_1

Version 1.0, 2026-09-27. Built from the four research memos in `office/research/`. Every claim traces to a cited source there; assumptions are labelled.

## 1. Where the account stands

The office could not open instagram.com from this environment, and the handle does not surface in web search, so the current follower count, post history and Insights are unknown. The plan below assumes an account under 1,000 followers with no fixed format. Two things change once the owner pastes Insights into `office/analytics/weekly_log.csv`: the posting slots (from "most active times") and the growth table (from the observed follow rate).

## 2. What the evidence says growth requires

Ranking on Reels is per post, not per account. Mosseri has named the three signals that carry the most weight: watch time, likes per reach and sends per reach, with sends weighing more for non-follower reach. Non-follower views are now about half of all views on Instagram. So a small account grows by making posts that get watched to the end and sent to a friend, not by accumulating likes.

Reels are the reach format (about 31% average reach rate, twice any other format). Carousels get the highest engagement and the most saves. Education is the top-engaging industry on Instagram (2.10% median engagement rate, driven by carousel infographics and tutorial Reels).

Original content is enforced. Since 30 April 2026 accounts that mostly repost, including photos and carousels, are dropped from recommendation surfaces. Watermarks and credits do not make a post original. Our own narration, annotation and graphics do.

Accounts that grew held one format for years. Accounts that drifted stalled.

## 3. Positioning

The line: one verified science story a day. Source on the last slide, every time.

Why this line: it is the gap. The generic @science handle (2M) is run by a meme group; a study of TikTok science influencers found they rarely credit sources; no Instagram account built around one peer-reviewed paper a day surfaced in search. @sciencemagazine grew from 200K to 517K on research imagery alone. The audience for rigour exists and is unserved in short form.

Field focus for the first 90 days: the human body and the brain, with space as the second lane. Reasons: body content has the highest saves because it is personal (Institute of Human Anatomy, 21M cross-platform); space has the highest verified view counts and a tentpole calendar; both lanes have a steady flow of Nature and Science papers. Physics demos and chemistry are excluded for now because they need lab footage the office cannot produce. The Director revisits the lanes at day 60 with data.

Format: 
- Reel, 30-50 s: false-sounding claim in frame 1, three to four numbered beats with a counter, bars, dots or a list animation, one line of consequence, end card. Burned-in captions, voiceover, source in caption.
- Carousel, 7-9 slides: cover with a 3-6 word title in the middle third, one idea per slide, a myth-vs-data slide where a myth exists, a source slide, a save-and-send slide.
- Every story ships as both when the story carries it: the Reel for reach, the carousel for saves, posted on different days.

Voice: plain, precise, no hype, numbers on screen, caveats on screen. Second person. Short sentences. The caption teaches; the picture stops the scroll.

Bilingual line (decision pending owner input): a Hindi/English version of each Reel with burned-in captions in both scripts. No verified large incumbent exists on Instagram for Hindi science video; Hindi science YouTubers have millions of subscribers but small Instagram footprints. Instagram's Edits app added bilingual captions in 15 languages in September 2026. If the owner reads and writes Hindi, this is the single largest untapped lane the research found.

## 4. Cadence and slots

Weekly: 5 Reels, 2 carousels, 2-4 Stories a day, 1 collab. Start at 7 feed posts a week and hold for 8 weeks.

Trial Reels for every new hook or format, once each, with auto-share on. Eligibility reportedly needs a professional account with 1,000+ followers; until then post directly and use the 24-hour non-follower share as the test.

Cross-post the clean master to YouTube Shorts (strongest reach at every account size in Socialinsider's 69M-video study) and TikTok.

## 5. Profile

Bio (150 characters max):
"One verified science story a day. Source on the last slide. Human body, brain, space. Ask me anything in the comments."

Category: Education. Name field: "hqrs_1 | Science, verified daily" (the name field is searchable). Link: a single page listing sources for the last 30 posts (a public Google Doc or Notion page is enough at first). Pinned posts: the best Reel, the best carousel, and the "how we verify" carousel. Highlights: Sources, Corrections, Ask.

Grid: every cover designed with the title in the vertical middle third so the 3:4 grid crop keeps it readable.

## 6. Growth math (base case)

new followers = non-follower views x follow rate

At the research base assumption of 9 follows per 1,000 non-follower views and 60% non-follower share:

| Goal | Horizon | Total views needed per week | Per Reel at 5/week |
|---|---|---|---|
| +1,000 | 12 weeks | ~15k | ~3k |
| +10,000 | 26 weeks | ~71k | ~14k |
| +100,000 | 52 weeks | ~355k | ~70k |

The pessimistic rate (3 per 1,000) triples the views needed; the optimistic (20 per 1,000) more than halves them. The only benchmark found for the follow rate is one creator's self-reported log, so the first two weeks of Insights matter more than any of these numbers. `office/analytics/projection.mjs` recomputes the table from the log.

Practical reading: 1k comes from consistent 3-5k-view Reels. 10k needs a repeatable 10-20k-view format or a few 100k+ outliers. 100k needs several 1M+ Reels or a sustained 50k average. This is why the office optimises sends per reach and follows per 1,000 views, and why the tentpole calendar matters: event weeks are where outliers happen (NASA added 4.6M followers in the Artemis II week).

## 7. The first 30 days

Week 1: launch the format. Post the cell-turnover Reel and carousel (already rendered and fact-checked), then one story a day from the verified list. Set up the bio, highlights, pinned posts. Start the weekly log.

Week 2: first Insights read. Fix posting slots. Compute the observed follow rate. First collab.

Week 3: tentpoles. Nobel week explainers (one per prize, same day), Saturn opposition post, Orionids preview. First Hindi/English test if approved.

Week 4: first format review. Compare Reel vs carousel sends per reach and follows per 1,000. Apply the double-down or kill rules. Director updates the decision memo.

## 8. What would change this plan

- Observed follow rate under 3 per 1,000 after 20 posts: the hook style is wrong; rework the first 3 seconds before anything else.
- Non-follower share under 40%: the topic is not legible to the ranking system; put the field name in the first caption line, alt text and spoken audio.
- Carousels out-sending Reels: shift the split to 3:4 and cut Reels from carousels rather than the reverse.
- A tentpole post at 10x median: build a standing template for that event type and schedule the next one.
