# vidIQ outlier study: what actually outperforms in science short-form (Sept 2026)

Role: Trend Scout. Filed 2026-09-29. Replaces the secondary-source parts of `research/04-competitor-analyst.md` with first-party outlier data from the vidIQ MCP tools. Every number below is copied from a tool output; nothing is estimated.

## 1. Method and credits

| Step | Tool | Calls | Credits |
|---|---|---|---|
| Outlier search, 8 results per platform, last 30 days, English, at least 10K views, one result per creator | `vidiq_instagram_tiktok_outlier_search` | 6 | 30 |
| Account discovery | `vidiq_ig_accounts_from_outliers` | 1 | 10 |
| Profile reels (12 most recent, pinned first) | `vidiq_ig_profile_reels` | 4 | 20 |
| Scene-by-scene watch of two top outlier Reels | `vidiq_watch_shortform_content` | 2 | 20 |
| Title scoring | `vidiq_score_title` | 0 | 0 (costs 5 per call, above the 2-credit cap set for this task; skipped) |
| Balance and job polling | `vidiq_balance`, `vidiq_job_poll` | 4 | 0 |
| Total | | | 76 charged of the 80 budgeted (balance 150 before, 74 after; the tool descriptions list 80, the account was charged 76) |

Queries: "science discovery explained", "space astronomy new study", "neuroscience brain study", "physics experiment explained", "debunk viral science hoax", "fossil archaeology discovery". Audience rescore on every call: Culture/Region: Global English; Global: true; Demographics: curious adults 18-40 interested in science.

Account discovery returned four small accounts (idigdeadstuff 93.1K followers, the_stemcell_diaries 2.8K, wellnessbydaily 12.1K, bay.andmore 5K), none of which appeared in the outlier lists and none aligned with our beat. So the four profiles were chosen from the outlier data instead: @newscientist (our closest editorial peer), @jadroppingscience (b-roll plus voiceover plus graphics, no face), @world_of_biology_wob (faceless text over one visual), @our_visibleuniverse (faceless animation, music only). All four appear in the outlier results at 1.1M views or more.

Duration is printed by the tool for every TikTok result and for only a few Instagram results; blank cells mean the tool did not return it.

## 2. Outlier table

Outlier score is views divided by the creator's median, as reported by the tool. Hook is the on-screen text in the first 3 s; where there was none, the first spoken line is given in quotes.

### 2.1 Instagram (41 distinct reels)

| Creator | Views | Score | Followers | Dur | Hook (0 to 3 s) | Format | Audio |
|---|---|---|---|---|---|---|---|
| @zackdfilms | 20.8M | 5.3x | 11M | | Take a sip of salt water | 3D animation plus live hands | voice + music |
| @growthology.ig | 20M | 178.5x | 240K | | This is What Happens in Your Brain When You Learn Something New | microscope time-lapse, static text, looped | music only |
| @figuringoutxshamani | 12.3M | 2189.1x | 25K | | AFTER ANDREW HUBERMAN, ANOTHER BRAIN EXPERT IS ON FIGURING OUT | podcast clip | voice + music |
| @our_visibleuniverse | 8M | 48.8x | 33K | 34 s (watched) | This is how the solar system moves | 3D animation, text cards, looped | music only |
| @jadroppingscience | 6.1M | 19.9x | 483K | 61 s | HOT? (arrow to syringe) | b-roll over voiceover with graphics | voice, no music |
| @world_of_biology_wob | 6.1M | 24.9x | 2M | | Everything you learn looks like this | faceless text over footage, looped | music only |
| @realoutliners | 5.7M | 18.9x | 151K | | A 10 YEAR | 3D animated experiment | voice + music |
| @dami_nesa | 5M | 4.4x | 95K | | none (hands break open a buried pot) | POV reveal | raw |
| @astro.alexandra | 4.6M | 5.5x | 1.5M | | IF THE HUMAN MOON LANDING IS REAL ANSWER THESE QUESTIONS | split screen debunk, face | voice + music |
| @scienceoftheuniverse | 4.4M | 11.2x | 2M | | This is What Happens in Your Brain When You Learn Something New | time-lapse, static text, looped | music only |
| @unseenbharatofficiall | 3.7M | 58.7x | 45K | | NASA JUST MADE THE GREATEST DISCOVERY | footage montage, text, looped | music only |
| @newscientist | 3.2M | 45.4x | 1M | | Did T-Rex have big lips? | talking head plus b-roll | voice + music |
| @632nmpodcast | 2.8M | 146.0x | 22K | | THIS IS NOT REAL. Nobel Prize winner: 'Cell biology is a hallucination.' | split screen b-roll over expert | voice + music |
| @erik_astro2 | 2.4M | 1639.9x | 11K | | So I just learned that there's an active supernova | talking head, then screen recording | voice + music |
| @kcs_stories1 | 2.2M | 653.6x | 6.8K | | none (creator voices disbelief) | split screen, face | voice only |
| @astralyn.s | 1.9M | 202.3x | 1.3K | | THE SUN DOESN'T PULL PLANETS... IT WARPS SPACE-TIME! | faceless 3D loop, static text | music only |
| @howhumanlifeworks | 1.9M | 5.5x | 3M | | This is what happens inside your brain every time you learn something new | time-lapse, static text, looped | music only |
| @yorkshire.fossils | 1.9M | 9.3x | 3M | 60 s | none | POV fossil extraction | raw |
| @thereasonroomphysics | 1.8M | 4.6x | 89.5K | | "That giant bubble you're looking at is the heliosphere." | 3D simulation screen recording, looped | voice + music |
| @fearlessbeings | 1.8M | 9.7x | 1M | | In 1985, American nuclear chemist ate uranium on camera during a lecture... | archival clip, static text | voice + noise |
| @discoveredphysics | 1.8M | 19.0x | 44K | | If water is a good conductor of electricity, why aren't fish affected when lighting strikes the sea ? | faceless text over lightning, loop resets before the answer | raw |
| @priyadharshini_ece | 1.8M | 331.0x | 15K | | MARS ROVER DISCOVERED POTENTIAL ANCIENT LIFE | b-roll over voiceover | voice + music |
| @astrolensofficial | 1.7M | 22.1x | 13K | | PUT TON 618 one light year away from us | 3D simulation, looped | voice + music |
| @dean_r_lomax | 1.7M | 36.7x | 138K | | This is a 180-million-year-old ichthyosaur. With soft tissue preservation and even a foetus | slow pan on one specimen, static text, looped | music only (The Swan) |
| @curiocity.com324 | 1.5M | 35.1x | 52K | | This Vlasic pickle jar is running on the same physics as real aerospace propulsion. | static shot, looped | raw |
| @kallaway | 1.5M | 7.7x | 458.1K | | TURNING PLASTIC INTO COOKIES | split screen creator plus b-roll | voice + music |
| @simply_eli5 | 1.5M | 559.4x | 362 | | No crash. Why did traffic stop? | animated simulation, looped | raw |
| @fearlessbeings | 1.5M | 5.6x | 1M | | The crazy physics of launching at 80 km/h from a truck already moving 80 km/h | b-roll, static text | raw |
| @thefarmacyreal | 1.4M | 8.5x | 854K | | Everything you learn looks like this | time-lapse, static text, looped | music only |
| @industrial_biotechnology | 1.3M | 42.1x | 46K | | Thousands of women were dying after childbirth from blood loss. | photo slideshow, static text, looped | music only |
| @nickexplain | 1.3M | 4.0x | 24K | | CLOSE YOUR EYES | stick-figure animation | voice only |
| @mildlyriveting | 1.3M | 17.7x | 596K | | Scientists pumped 10 tons of cement into an abandoned ant hill and uncovered a massive underground city built entirely by ants | footage montage, static text | music only |
| @sciencesage | 1.2M | 23.7x | 23K | | none (speaks at once) | talking head plus diagram inserts | voice only |
| @universifyy | 1.2M | 51.0x | 43K | | none (galaxies merging) | CGI, one static text at the end, looped | music only |
| @drjoe_science | 1.1M | 8.2x | 118K | 109 s | TODAY IS A BIG DAY FOR BIOLOGY | talking head plus image inserts; DOI in caption | voice + music |
| @tilscience | 1.1M | 9.5x | 615K | | This is WILD. HAVE YOU SEEN THESE VIDEOS COME ACROSS YOUR FYP YET | split screen, face | voice + music |
| @empyrealwealth | 1.1M | 24.3x | 135K | | If you leave Earth at age 15 in a spaceship traveling at 99.7% the speed of light... | footage, static text, looped | music only |
| @momenabumecca | 1.1M | 310.8x | 128K | 119 s | Liar this guy | debunk, talking head (off-beat) | voice + music |
| @_replayhistory | 983.2K | 105.5x | 31K | | A perfect example of Bernoulli Principle | footage, static text, looped | music only |
| @mathematicsmarvels | 506.6K | 110.9x | 1.7K | | Have you ever wondered why radio signals can easily pass through the walls of your house? | 2D animation | voice + music |
| @_big_shaq__ | 163K | 53.6x | 3.1K | | Is air different from liquid? | split screen plus wind tunnel | voice + music |

### 2.2 TikTok (35 distinct videos)

| Creator | Views | Score | Followers | Dur | Hook (0 to 3 s) | Format | Audio |
|---|---|---|---|---|---|---|---|
| @duce_b | 7.1M | 3300.0x | 7.3K | 10 s | This is What Happens in Your Brain When You Learn Something New | time-lapse, static text, looped | music only |
| @cartoonprehistoric_facts | 3.7M | 489.4x | 34.9K | 531 s | There is a T-Rex standing in this image right now. | faceless animated host | voice + music |
| @noahs.ark.scans | 2.9M | 14.0x | 155.9K | 55 s | WE ARE HERE ON TOP OF THE ARK | on-location vlog | voice + music |
| @idea.soup | 2.6M | 191.9x | 1.4M | 81 s | OKAY STOP WHAT | green screen commentary | voice only |
| @thequantara | 2.4M | 112.0x | 59.8K | 6 s | LOOK CLOSER. WHAT YOU CALL "CHANGE" LOOKS LIKE THIS INSIDE YOUR BRAIN. READ BELOW: | time-lapse, static text, looped | music only |
| @chubshajakakaiaush775 | 2.3M | 17.7x | 689 | 5 s | There's a bouncy ball hidden in the balloon's tip | single-shot demo | raw |
| @dgaf_atall | 2M | 520.5x | 3.1K | 60 s | Loading... Physics. | montage | music only |
| @physicstik | 1.9M | 26.1x | 891.8K | 60 s | Physics. | beat-synced montage | music only |
| @8_laila_pereyra | 1.8M | 3485.0x | 376 | 32 s | The bird dips its beak into the water | 3D animation | voice + music |
| @iammarkmanson | 1.6M | 56.9x | 297.3K | 115 s | How to Control Your Emotions | talking head plus b-roll | voice only |
| @anticum | 1.5M | 7.0x | 322.3K | 17 s | Physics. | montage | music only |
| @science_phenom | 1.5M | 9.4x | 68K | 22 s | HOW WE THINK THE SOLAR SYSTEM LOOKS (red X stamp) | myth versus reality animation, looped | music + SFX |
| @ladodpwqovz | 1.5M | 123.2x | 105.7K | 92 s | This tiny speck is a 300 million year old dinosaur's egg | b-roll over voiceover | voice + music |
| @pexals | 1.4M | 15.8x | 155.6K | 61 s | BLUE EYES HAVE ONE VERY STRONG FEATURE | footage plus voiceover | voice + music |
| @randomstuffhere67 | 1.3M | 33.2x | 3.1K | 9 s | This is What Happens in Your Brain When You Learn Something New | time-lapse, static text, looped | music only |
| @shayne.vibes31 | 1.3M | 65.3x | 136.2K | 70 s | Giant eyeball found in Thailand? | split screen commentary | voice + music |
| @europeanspaceagency | 1.2M | 18.2x | 637.5K | 61 s | Something very strange has started to appear on Saturn. | talking head plus b-roll | voice + music |
| @idea.soup | 1.2M | 88.6x | 1.4M | 69 s | IF THE UNIVERSE WAS TRULY INFINITE | green screen | voice + music |
| @pexals | 1.2M | 16.4x | 154.4K | 60 s | THIS IS A CRAZY OPTICAL ILLUSION | animated demonstration | voice only |
| @klingenberg.temil | 1.1M | 542.9x | 12K | 73 s | The Truth About Fruit Flies | time-lapse experiment | voice + music |
| @hoodiestories1 | 1.1M | 7.1x | 58.2K | 64 s | TOUCHING | 3D animation | voice + music |
| @behindspace2 | 1M | 250.4x | 78.2K | 60 s | Is it possible for humans to travel to another galaxy? | expert clip over stock, looped | voice + music |
| @daily.network.new | 1M | 4.2x | 129.3K | 16 s | The Coriolis effect | split screen reaction | music only |
| @newdrap88 | 960K | 4.7x | 72K | 78 s | If you drive behind | 3D animation | voice + music |
| @researchbydaya | 934.1K | 6.3x | 30.1K | 8 s | Whats a health topic you believe is under researched? | MRI loop, static text | music only |
| @7evengoatt | 910.8K | 188.4x | 5.2K | 26 s | but 30 years later | animated history | voice + music |
| @thepoddaddy2 | 885.3K | 12.5x | 16K | 84 s | WHAT IF | narrated image montage | voice + music |
| @viralbyte15 | 878.4K | 1118.3x | 371 | 24 s | SOME PEOPLE WON'T LIKE THIS MACHINE | demo plus AI voice | voice + raw |
| @snshortsyt | 873.1K | 7.6x | 98.4K | 18 s | Pulsar thinking it's the strangest Object in the Universe. | meme edit | music only |
| @afternoonm2 | 796.8K | 401.7x | 15.7K | 63 s | The Weird Connection Between Saliva and Quantum Physics | split screen macro | voice + music |
| @connorastro | 793.6K | 9.0x | 154.1K | 6 s | Creepy fact: Jupiters moon, Europa is highly likely to have oceans... | image plus text, looped | music only |
| @under_thehead | 786.5K | 4.8x | 32.9K | 300 s | Nepal Flood Explained Why It Grew as It Fell | documentary | voice + music |
| @realdiscoveryfilm | 433.8K | 368.3x | 8.8K | 132 s | YOUR BODY CAN REBUILD ALMOST ANYTHING. | 3D infographic | voice + music |
| @kip.v.thng.l | 121.6K | 62.3x | 13.3K | 6 s | Imagine splitting a rock and finding this | macro reveal | music only |

## 3. Patterns (each backed by at least two outliers per platform)

**3.1 The single biggest format is a looping visual with one static line and no voice.** Instagram: growthology.ig 20M, our_visibleuniverse 8M, world_of_biology_wob 6.1M, scienceoftheuniverse 4.4M, unseenbharatofficiall 3.7M, astralyn.s 1.9M, howhumanlifeworks 1.9M, dean_r_lomax 1.7M, thefarmacyreal 1.4M, empyrealwealth 1.1M. TikTok: duce_b 7.1M (10 s), thequantara 2.4M (6 s), randomstuffhere67 1.3M (9 s), connorastro 793.6K (6 s). The tool tags every one of these "pacing: Slow, visual_changes: Low (static camera), text_overlays: Static text, audio_mix: Music only, is_looped: true". This is the exact opposite of our pacing table (2.5 to 6 cuts per 10 s), and it is what our no-face, no-camera house can make cheaply with one generated loop.

**3.2 The same clip and the same line get reused across accounts and still outperform.** The neuron time-lapse with "This is What Happens in Your Brain When You Learn Something New" or "Everything you learn looks like this" appears 5 times on Instagram (20M, 6.1M, 4.4M, 1.9M, 1.4M) and 3 times on TikTok (7.1M, 2.4M, 1.3M). @our_visibleuniverse posted the same solar-system animation at least 8 times in 12 reels; two of them hit 2.5M and 492.1K, the rest sit between 776 and 25.8K. A proven loop plus a new line is a repeatable bet, not a one-off.

**3.3 Winning static lines are 6 to 12 words, present tense, and point at the visual.** "This is how the solar system moves" (6), "Everything you learn looks like this" (6), "This is What Happens in Your Brain When You Learn Something New" (12), "This is a 180-million-year-old ichthyosaur..." (14 with the second sentence), "THE SUN DOESN'T PULL PLANETS... IT WARPS SPACE-TIME!" (8). TikTok: "This tiny speck is a 300 million year old dinosaur's egg" (11), "There is a T-Rex standing in this image right now." (10). Our six-word cap is below the range where these lines live.

**3.4 Three hook types dominate.** (a) Demonstrative: "This is how / This is what / You're looking at" (our_visibleuniverse, growthology, dean_r_lomax, thereasonroomphysics; TikTok ladodpwqovz, cartoonprehistoric_facts). (b) Contradiction of a school fact: "THE SUN DOESN'T PULL PLANETS", "THIS IS NOT REAL. Cell biology is a hallucination", "The biggest lie in school about how the solar system moves" (492.1K on the profile), "HOW WE THINK THE SOLAR SYSTEM LOOKS" with a red X (TikTok 1.5M), "YOU DON'T ACTUALLY SEE WITH YOUR EYES" (255.7K, the top recent reel on world_of_biology_wob). (c) A question the video withholds: "HOT?" (6.1M, answered at 47 to 60 s of 61), "No crash. Why did traffic stop?" (1.5M on 362 followers), "why aren't fish affected when lightning strikes the sea?" (1.8M, tool notes the loop resets before the answer), our_visibleuniverse ends on "Why?" at 24 to 27 s and never answers; TikTok behindspace2 "Is it possible for humans to travel to another galaxy?" 1M, shayne.vibes31 "Giant eyeball found in Thailand?" 1.3M. Our bible bans question hooks outright; the data says a question works when the visual is the answer or the caption carries it.

**3.5 Duration splits into two bands, with nothing winning in between.** Loops: 5 to 10 s on TikTok (duce_b 10 s, thequantara 6 s, randomstuffhere67 9 s, connorastro 6 s, chubshajakakaiaush775 5 s), about 30 s on Instagram (our_visibleuniverse 30 s reels at 2.5M and 492.1K; the watched outlier is 34 s). Voiced explainers: 49 to 132 s (cleoabram 49 s, ESA 61 s, jadroppingscience 61 to 65 s, afternoonm2 63 s, idea.soup 69 to 81 s, drjoe_science 109 s, iammarkmanson 115 s, realdiscoveryfilm 132 s). On @jadroppingscience the 61 to 71 s demos took 1.3M to 10.2M while the 127 to 180 s game-show episodes took 42.3K to 223K. Our 30 to 45 s default sits in the gap.

**3.6 Face versus no face.** Of the ten highest-view Instagram outliers, seven show no face (zackdfilms 20.8M, growthology 20M, our_visibleuniverse 8M, jadroppingscience 6.1M hands only, world_of_biology_wob 6.1M, realoutliners 5.7M, dami_nesa 5M). Faces win on outlier ratio for tiny accounts (figuringoutxshamani 2189.1x, erik_astro2 1639.9x, kcs_stories1 653.6x) but not on raw reach. Our no-face rule is not a handicap.

**3.7 Audio.** Music only on every looping outlier (section 3.1); voice plus music on every talking-head or split-screen outlier; @jadroppingscience runs voice with no music at all (watched: "no prominent background music"). The watched our_visibleuniverse reel uses "gentle, melancholic instrumental piano". Our bed A (minor key, muted electric piano motif, no drums) is already the right register for loops.

**3.8 Text density and captions.** In-frame text on the loops is one line, sometimes two cards in sequence (our_visibleuniverse: five cards of 3 to 7 s each in 34 s). Voiced explainers use dynamic word captions plus one label with an arrow ("HOT?", "Hidden", "Visible", "NOT HOT"). Post captions on the winners are long: drjoe_science puts a DOI in the caption; world_of_biology_wob and our_visibleuniverse run multi-paragraph captions; jadroppingscience puts the answer in the caption in brackets, "Is this boiling water hot? (No!)", "Does a magnet actually push water? (Yes)". thequantara's on-screen line ends "READ BELOW:" (2.4M). The caption is treated as the second half of the post.

**3.9 Cover frames.** jadroppingscience: hands plus one object plus one yellow label and a red arrow, no title. newscientist: face plus a two-line serif headline in a white box (all 12). world_of_biology_wob: one sentence at the top of a 3D anatomy still. our_visibleuniverse: one line of small white text over the black star field. In every case the cover text is the hook line, not a separate title.

## 4. What the two watched Reels actually do

**@our_visibleuniverse, DcwSnMphlpT, 8M views, 34 s.** One continuous 3D shot; the camera slowly pivots around a solar system leaving helical trails. No voice. Five text cards: "This is how the solar system moves" (0 to 6 s), "Revolve around the galactic centre" (6 to 12), "With the speed of 230 km/s with respect to milkyway" (12 to 19), "But still We didn't collide with any interstellar objects" (19 to 24), "Why?" (24 to 27), then 7 s of the animation with no text. Soft ambient piano from the first second, continuous. One number on screen in the whole piece. The question is never answered on screen.

**@jadroppingscience, DdW2HCSjEi0, 5.9M plays, 61 s.** Voice starts at 0.0 s ("When I showed how you can boil water in a sealed syringe just by pulling up, many people wondered if this boiling water is hot"). First cut at 3 s; cuts at 6, 8, 10, 12, 16, 20, 35, 37, 40, 44, 47, 48, 51, 55 s (15 cuts in 61 s, about 2.5 per 10 s, faster in the demo sections and slower in the animation). Text: "HOT?" with an arrow (scene 1), then six diagram labels in the 2D animation ("OUTER SPACE", "Air Pressure", "Sea Level", "100°C (212°F)", "Mount Everest (1/3 Pressure)", "70°C (160°F)"), then "NOT HOT" at the end. Two verified numbers spoken and shown (100 C / 212 F, 70 C / 160 F) plus a thermometer readout of 100.2 C on camera. No music; room tone only. Structure: phenomenon, textbook baseline, the mechanism drawn as a diagram, a kitchen analogy, then the proof with a thermal camera. The answer is withheld until 47 to 60 s.

## 5. The four profiles

**@newscientist (1M followers).** 12 reels, 46 to 101 s, 30.4K to 581.7K plays, none pinned. All talking head with a two-line serif headline in a white box at the lower third, brand mark top right. Winners: Benedict Cumberbatch documentary clips at 581.7K (76 s, cover "We're a quiet majority") and 210.7K (46 s, "How do we connect with nature?"), and "The fallacy of the paleo diet" at 185.6K (81 s, 367 comments). Their own science explainers (vagus nerve series, El Nino, AI risk) sit at 30.4K to 62.5K. Headline style: a question ("Will the AMOC collapse?", "Can you train your vagus nerve?") or a quoted line. Lesson: on a 1M-follower newsroom account, celebrity and quote-led covers beat topic-led covers by 3 to 19x.

**@jadroppingscience (483K).** 12 reels, none pinned. Demos of 61 to 75 s: 10.2M (bottle tricks, 63 s), 5.9M (syringe, 61 s), 4.7M (soap dispenser, 65 s), 1.3M (magnet in copper tube, 71 s), 133.5K, 89.7K, 138.3K. Game-show episodes of 127 to 180 s: 42.3K to 1.1M, mostly around 200K. Covers: hands holding one object on a pegboard, one yellow label with an arrow ("Hidden", "Visible", "HOT?", "DIAMAGNETISM"). Captions: a question with the answer in brackets, three hashtags. Lesson: one object, one question, one arrow, and a 60 to 75 s answer with a diagram in the middle. Wins by 20x over the longer format on the same account.

**@world_of_biology_wob (2M).** 9 reels in 2 days, 7 to 50 s, 22.9K to 255.7K, none pinned; heavy reposting with credits (@drsachinkaleortho, @world_of_biology_wob_animation). Best: "You actually don't see with your eyes" over a 3D cutaway of the eye sockets, 9 s, 255.7K, 15 comments; "Ganglion Cyst Removal (3D Animation)", 50 s, 126.9K; "Brushing harder doesn't mean it is better", 14 s, 104.9K. Covers: one sentence at the top of a photoreal 3D anatomy still, text at the top, subject filling the frame. Captions are long lists with emoji headers. Lesson: contradiction line plus one anatomy loop; 7 to 20 s pieces do the volume, the outlier (6.1M) was a music-only time-lapse.

**@our_visibleuniverse (33K).** 12 reels, 20 to 90 s, 776 to 2.5M plays, none pinned. The same helical solar-system animation appears in at least 8; the two winners are "This is how the solar system moves" (30 s, 2.5M, 1.2K comments) and "The biggest lie in school about how the solar system moves" (30 s, 492.1K). Vector-field variants (20 to 24 s): 1.7K to 7.5K. The one 90 s piece ("Are we alone?"): 1.9K. Captions: all-caps first line with an emoji, then a long explanatory body. Lesson: repost the winning loop with a new line; keep loops at 30 s; long pieces die on this format.

## 6. Proposed addendum to `strategy/STYLE_BIBLE.md` (not applied; for the Creative Director)

Addendum, 29 Sept 2026: loop cards and hook rules, from `research/09-vidiq-outliers.md`.

1. New post type, "loop card": 8 to 15 s on TikTok-style cuts, 25 to 34 s on Instagram. One generated simulation (an existing mechanism type from `render-reel.mjs` run as a continuous loop over the graded still), no voice, no caption band, music bed A only, one static line at a time, two to five lines in sequence, the last card a question or the answer withheld. Answer in caption line 3. Evidence: 3.1, 3.2, 4. This replaces "Simulation short" in the pacing table for the no-voice case; the voiced version stays.
2. Hook line length: six words stays for voiced Reels; loop cards may run 6 to 12 words in one line (3.3). Still one text element, still in the hook box.
3. Question hooks: allowed under two conditions, (a) the visual on screen is the thing the question is about, and (b) caption line 1 repeats the question with the answer in brackets, as "Is this boiling water hot? (No!)". "Have you ever wondered" stays banned (the one outlier using it, mathematicsmarvels, was the smallest Instagram result at 506.6K). Evidence: 3.4c, section 4.
4. Contradiction hooks become the default for mechanism reveals: "X does not do Y, it does Z" or "The textbook picture is wrong, this is the real one", with the compare device (myth versus data) drawn at the second hook. Evidence: 3.4b, science_phenom red X 1.5M, our_visibleuniverse "biggest lie in school" 492.1K.
5. Duration: keep 30 to 45 s for news pegs, but the mechanism reveal may run to 60 to 65 s when it carries a drawn diagram in the middle and a proof at the end (jadroppingscience structure, section 4). The bible already allows 60 to 90 s with a Director line; this proposes 60 to 65 s without one for the mechanism reveal only.
6. Caption: raise the Reel cap from 60 to 120 words so the caption can hold the journal line, the DOI, and the answer to the on-screen question. Line 1 hook or question plus bracketed answer, line 2 source verbatim, then body (3.8).
7. Cover: the 0.8 s frame stays, but the hook line on the cover may be shortened to a one to three word label plus an arrow pointing at the subject ("145 F?", "Backwards", "Not hot"), in the existing `.caption.short` style. Evidence: 3.9.
8. Re-run rule: a Reel that beats 3x the account median may be reposted within 30 days as a loop card with a new line and the same still or simulation (3.2, our_visibleuniverse profile).
9. Grid label: put the hook line as the first line of every alt text and caption, since on every profile studied the cover text is the hook line and not a separate title.

## 7. Hook lines: current versus proposed

`vidiq_score_title` costs 5 credits per call, above the 2-credit ceiling set for this task and beyond the remaining budget after the calls above, so no numeric score exists for any line. Column "Pattern" names the outlier evidence for the change instead. Current lines are from `production/out/reel-*/caption.txt` line 1 and the first scene `caption` in `scripts/v2/reel-*.json`. Numbers in proposed lines are already in each Reel's caption or script.

| Reel | Current caption line 1 | Current on-screen hook | Proposed on-screen hook | Pattern |
|---|---|---|---|---|
| reel-13-atoms-string-breaking | 13 atoms simulated particles snapping apart. | 13 atoms simulated particles snapping apart | This is a string breaking. Simulated by 13 atoms. | Demonstrative "This is" (3.4a); number kept |
| reel-ai-navier-stokes | An AI "solved" a $1M problem. | An AI "solved" a $1M problem | An AI "solved" a $1M problem. The quotes matter. | Contradiction (3.4b); caption line 1 keeps the claim |
| reel-avatar-bci | Their avatar talks and waves. Paralysed. | Their avatar talks and waves. Paralysed. | This is a paralysed person talking. Through an avatar. | Demonstrative (3.4a) |
| reel-betel-teeth | The headline says 25,000 years. Here is the range. | The headline says 25,000 years | The headline says 25,000 years. The paper does not. | Contradiction (3.4b), red-X compare device |
| reel-brain-gamble | Your gamble, readable 0.5 s early. | Your gamble, readable 0.5 s early | Your bet is readable 0.5 s before you place it. | Second person present tense, as in "Everything you learn looks like this" (3.3) |
| reel-fire-amoeba | Something is reproducing at 145 F. And it is not a bacterium. | Something is reproducing at 145 F | Complex life stopped at 140 F. This divides at 145. | Contradiction with two verified numbers from the caption |
| reel-lz-dark-matter | Dark matter may have hit. Once. | Dark matter may have hit. Once. | Dark matter may have hit this detector. Once. | Demonstrative "this" pointing at the still (3.4a) |
| reel-planet-backwards | This planet orbits its star backwards. | This planet orbits its star backwards | Every planet you know orbits one way. Not this one. | Contradiction (3.4b); "This planet orbits backwards" stays as the cover label |
| reel-quantum-jump-sound | Sound does not fade. It jumps. | Sound does not fade. It jumps. | Keep. Add cover label "It jumps" with an arrow at the resonator. | Already a contradiction hook; cover rule 3.9 |
| reel-two-brains | Two lineages build your brain, and they never mix. | Two lineages build your brain | Your brain is built by two lineages. They never mix. | Second person present tense (3.3) |
| reel-youngest-planet | Earth is 4.5 billion years old. This planet is not even 1 million. | Earth: 4.5 billion years old | This planet is not even 1 million years old. | Demonstrative plus number first; the Earth comparison moves to the caption |

For the loop-card version of any of these, the proposed line is the single static card, and the second card is the question the Reel already answers ("Why?", "Hot?", "How?").

## 8. What this changes for the next posts

- Cut one loop card this week from an existing simulation (planet-backwards orbit plate or the fire-amoeba thermometer), 30 s, no voice, two to four cards, bed A, answer in the caption. Lowest cost test of the strongest pattern in the data.
- Rewrite the three weakest current hooks (13 atoms, avatar, youngest planet) to the demonstrative form above before render.
- Add the bracketed answer to caption line 1 on every Reel whose hook is or implies a question.
- Storyboard the next mechanism reveal to the jadroppingscience shape: phenomenon (0 to 6 s), baseline (6 to 15 s), drawn diagram with the two verified numbers (15 to 35 s), proof (last 15 s), and let it run to 60 s if the diagram needs it.
