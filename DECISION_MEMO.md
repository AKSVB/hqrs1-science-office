# Decision memo

The Director's calls, dated. One line of reasoning per call and what evidence would change it. The account owner approves each section before anything ships.

## 2026-09-27: launch decisions

Context. Four research memos filed (`research/01` to `04`). Production pipeline built and tested: carousel renderer, reel renderer, brand kit, fonts. One story (cell turnover, Sender and Milo 2021) rendered as both a Reel and a carousel. The account itself could not be inspected from this environment (instagram.com blocked; the handle does not surface in web search), so every number about the account is unknown until the owner shares Insights.

Calls.

1. Positioning: "one verified science story a day, source on the last slide." Reason: source-citing is rare in short-form science and the paper-of-the-day slot is unoccupied on Instagram (research 01 and 04). Would change if: after 30 days sends per reach on source-cited posts trail an uncited control by more than half.

2. Lanes: human body and brain first, space second. Reason: highest saves (body) and highest verified view counts plus a tentpole calendar (space); both have steady Nature and Science flow. Would change if: day-60 data shows another lane out-sending both.

3. Format: Reels 30-50 s with the false-sounding claim in frame 1 and one animated number device; carousels 7-9 slides with a source slide. Split 5 Reels to 2 carousels a week. Reason: Reels for reach (~31% reach rate), carousels for saves (highest engagement); the office renders both from one spec. Would change if: carousels out-send Reels, then shift to 3:4.

4. Cadence: 7 feed posts a week, held for 8 weeks before judging. Reason: Buffer's 2M-post data shows reach per post rising with frequency and no fatigue penalty; the pipeline can sustain it. Would change if: quality gates start failing under the load, in which case drop to 5 and keep the gates.

5. Trial Reels for every new hook, once each. Reason: Instagram's own data on non-follower reach; Mosseri's 25 Sep warning on repeated trials. Requires a professional account with 1,000+ followers; until then, use the 24-hour non-follower share as the test.

6. Bilingual Hindi/English line: recommended, pending the owner's confirmation that they read and write Hindi. Reason: no verified large incumbent for Hindi science video on Instagram; Hindi science YouTubers have millions of subscribers and small Instagram footprints; unofficial Hindi dubs of the largest science animator exist. Would change if: the owner is not a Hindi speaker, in which case the line waits for a collaborator.

7. Launch post: the cell-turnover Reel (rendered, fact-check pending on the exact percentages). Reason: evergreen, personal, myth-busting, and it demonstrates the format.

8. Guardrails adopted as written in the manual: original content only, no engagement bait, no automation, caveats on screen, health claims with sample size on screen.

9. Analytics: weekly log and projection tool in use from the first post. The growth table is rebuilt from observed data after two weeks; until then the base assumption (9 follows per 1,000 non-follower views) stands and is labelled as such.

Fact-check outcomes and story-level calls (memo filed as `research/05-fact-check.md`):

- GREEN, ship as written: quantum jumps of sound (date corrected to 17 Sept), fire amoeba (spike wording applied), organoids (about 425,000 cells), avatar BCI (gesture wording applied), cell turnover (bars labelled "by number of cells"), LZ dark matter (only as "not a discovery").
- AMBER, shipped with the caveat on screen: two brain lineages (no "two organs"), betel teeth (range and n = 2 on screen, "may be the earliest"), youngest planet (mass model-dependent), Uhackatik crater (field-confirmed, registration pending).
- RED, pulled from the calendar: sealed cuneiform letters (June paper, single-source details), rice-paper battery (unsupported "3 days" figure, wrong journal). Both return only after someone opens the paper.
- Standing rule confirmed by this cycle: the Fact-Checker found real errors in one third of the desk's top stories. No story ships without its row in a fact-check memo.
- Environment call: the Fact-Checker could not open any publisher. Next cycle needs the web-search allowance raised and nature.com, science.org, cell.com, arxiv.org, pubmed.ncbi.nlm.nih.gov and eurekalert.org allowed through the proxy; the owner sets this in the environment's network settings.

What the owner must supply for the next cycle: a screenshot or export of Insights (followers, last 10 posts' views, non-follower share, follows from posts, most active times), confirmation on the Hindi line, the posting time zone, and a yes or no on the bio and pinned-post changes in `strategy/ACCOUNT_STRATEGY.md` section 5.
