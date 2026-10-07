# Two-Minute Demo Script (v0, 2026-10-01)

**Readiness plan item Y4.1.** The demo for the YC application video, investor calls and leader calls. It runs on `strikelab.dev/demo?view=tour` ("Watch the six weeks"), which plays the real product on a sample club, so it works without signing in and can't break on a live database.

**Rules:** every screen in the demo is either sample data that says "sample data" on screen, or real data from a leader who has consented in writing. Never present the sample club as a real one. Re-record once real numbers exist (FW-20).

## Before you record

- Open `strikelab.dev/demo?view=tour` in a clean browser window at about 1280×800, zoom 100%, no extensions or bookmarks bar.
- Turn off notifications. Pause the tour (it autoplays) and click **1 Set up**.
- Have the backup ready (see the end): a screen recording of the same tour, made the day before.

## The script (about 2:00)

| Time | Screen | Say (in your own words; this is the shape, not a script to read) |
|---|---|---|
| 0:00–0:12 | `/demo?view=tour`, step 1 visible | "StrikeLab is a six-week lab that high-school clubs run, where students code real finance models and finish with work they can show. I'm [name], [one plain sentence on who you are and why you built it]. " |
| 0:12–0:25 | **1 Set up** | "A club leader picks a start date. StrikeLab schedules all six weeks, skips break weeks, and makes one join link. Setup takes about three minutes; the leader needs no finance background." |
| 0:25–0:40 | **2 Kickoff**, press **Play** | "At the first meeting, students join with the link and the leader watches who's in and who's stuck, live. Activation is won in that room." |
| 0:40–0:55 | **3 A student's week** | "Every student sees one next step and this week's due date. It runs on any school Chromebook; there's nothing to install." |
| 0:55–1:15 | **4 Write the code** | "This is the point: in week 3 students implement Black-Scholes themselves, in Python in the browser, and tests check their answer. Simulators teach clicking; this teaches the model." |
| 1:15–1:35 | **5 Week 3**, then **6 Week 4** | "The leader gets a scorecard: who's activated, who's falling behind, and week-4 retention measured from real completion dates. No grading." |
| 1:35–1:50 | **7 Capstone** | "Every student finishes with a capstone: a question, code that answers it, and an honest result. Private by default; sharing is the student's choice." |
| 1:50–2:00 | **8 Outcome**, then stop | "[Real numbers once they exist: N cohorts, X% activation, Y% week-4, Z capstones.] Until then: we're running our first pilots this fall." |

## What not to say

- No unsourced numbers (readiness plan Y8.8). Before pilots end, say "first pilots this fall", not a user count.
- Don't call it financial literacy or a stock game (see `competition-map.md`).
- Don't promise features that aren't built (live market data, district dashboards, SSO).

## If the demo breaks

1. **Site down or slow:** switch to the backup recording. Say "here's a recording of the same thing" and keep going.
2. **Tour doesn't autoplay:** that's expected with reduced motion turned on; step through with **Next →**.
3. **Asked to show a real class:** only with the leader's written consent, on their own account, never by switching to the founder metrics page (it shows every cohort).

## Recording checklist

- [ ] One take under 2:10, no cuts mid-sentence
- [ ] Watched by two people who don't know StrikeLab; both can say what it is and who it's for afterward (the 10-second test, FY-8)
- [ ] Sample data visible as "sample data" in every frame where it appears
- [ ] Saved with the date in the file name; linked from `application-draft.md`
