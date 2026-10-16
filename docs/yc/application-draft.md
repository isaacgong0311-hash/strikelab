# YC Application Draft (v0.6, 2026-10-16)

**Status:** v0.6. Rewritten around the proving-ground design (`docs/superpowers/specs/2026-10-16-strikelab-proving-ground-design.md`), which replaces the club-lab pitch of v0.5. Product claims re-verified against the repo on 2026-10-16 (table at the end); founder answers still open (list at the end). Its job is still to show which answers we can't write yet.
**Eligibility first.** The founder is under 18 and in high school. YC and PearX normally need founders who can sign contracts. Read each program's current rules on its own site, not here, and apply only when they allow it. Until then this draft is the record of what would be true on that day.
**Questions below are by theme, not verbatim.** Before each rewrite, open the live form, paste its current questions over the headings, and keep the answers.
**Markers:** `[NEEDS FOUNDER]` = only the founder can answer. `[NO PROOF YET]` = a claim that needs data we don't have. `[SOURCE]` = a number that must link to the data room.
**Rules (plan Y8.8):** every figure links to a source; bad numbers are stated plainly with what changed; nothing invented.

---

## Company

**One-sentence description**
StrikeLab is where high schoolers prove they can do real quant work, through seasons of timed challenges and a defended capstone, and earn a record that firms and programs can trust.

**What does the company do?** (≤ 50 words)
Students learn quant finance by writing Python in the browser, then compete in free seasons of timed challenges, each with their own randomized numbers and the AI tutor off, scored by the server. A capstone defended live becomes a verified record. Parents pay for a six-week intensive; sponsors fund seasons.

**Link / demo:** strikelab.dev/seasons, strikelab.dev/intensive, strikelab.dev/demo. `[Record a 2-minute video after Season 1: a real attempt, start to official score]`

**Where do you live / where is the company based?** `[NEEDS FOUNDER]`

**Stage / how long working on it?** `[NEEDS FOUNDER: start date, hours per week]`

## Progress

**What have you built?**
- **Train:** 23 browser lessons in three tracks; Python runs in the student's browser (Pyodide in a Web Worker, with a time limit), graded by tests, no install.
- **Compete (new, Oct 2026):** seasons of weekly timed challenges. The server stamps the start time and rejects late submissions; each student's numbers come from a keyed hash of their ID, so answers can't be copied; the AI tutor is blocked during an open attempt; leaderboards show handles only and use official scores only; a club gets a private chapter board.
- **Official scoring:** submitted code is re-run in Python on our side with the student's own numbers and a hidden test; infinite loops are stopped; anything unclear goes to a person instead of scoring 0.
- **Season 1 scheduled:** three challenges (put-call parity, Black-Scholes, option delta), Nov 30 to Dec 20.
- **Intensive waitlist** with the price shown ($349), parent email only, no payment taken.
- **Chapter toolkit** (from the earlier club product): cohorts, invite links, scorecard, private capstones with revocable sharing.
- **Engineering:** 480 automated tests in 80 files (14 run against the real database migrations with row-level security on), browser tests with accessibility checks, CI with performance and layout-shift budgets. `[SOURCE: recheck counts at submission]`

**How long did it take, and who built it?** The founder, a high-school student, with AI coding tools. `[NEEDS FOUNDER: dates, hours, what you did vs. what the tools did. Be specific and honest; YC will ask.]`

**Are people using it? Describe traction.**
`[NO PROOF YET]` As of 2026-10-16 Season 1 has not run. Fewer than 20 people have completed a lesson or joined a class (re-check before submitting).
*Target text after Season 1:* "Season 1: N students from M schools in K chapters; X% finished all three challenges; Y came back for Season 2; Z placed in the top 10 and passed a live defense." Kill rule set in advance: under 30 students means the message or channel was wrong. Every figure `[SOURCE: database query, by ?src= tag]`.

**Revenue / money collected / commitments:** `[NO PROOF YET]` $0. Intensive waitlist opens to parents after Season 1; target 10 paid seats ($349) for January, charged only once a cohort fills and only after a parent holds the Stripe account and the terms are reviewed. Sponsor target: one signed letter of intent by Feb 28.

**How many active users and how fast is it growing?** `[NO PROOF YET]` North-star metric: students with an official score in a season. Second: students who return for the next season.

**Did you do anything unusual to get users?** `[NEEDS FOUNDER]` Use only what really happened (chapter at your school, community posts, judges recruited).

## Idea

**Why did you pick this idea? How do you know people need it?**
`[NEEDS FOUNDER: 150 words, your own words.]` The fact to build it on: "I'm the student it's for." You wanted a path into quant or finance and had no way to show you could do the work: too young for internships, and grades and contests don't show that you can price an option or test a strategy honestly.

**What's new about what you make? What do you understand that others don't?**
Draft thesis, to be tested in Season 1:
1. For a high schooler, the bottleneck into quant isn't content (free content is everywhere); it's **credible proof**. A record is only worth something if it's hard to fake.
2. AI makes take-home work worthless as proof. So the format has to assume AI exists: per-student numbers, server-timed windows, the tutor off, and a short live defense before anything counts as verified.
3. Students will do this for free if it's ranked and seasonal (the way they do AMC and USACO), so the people who pay are the ones who want the outcome: parents (an intensive) and firms (brand and early visibility, aggregates only).
`[NO PROOF YET: replace with what Season 1 actually showed.]`

**Who are your competitors? What do you understand about them that they don't?**
See `docs/yc/competition-map.md` (written for the club pitch; update for seasons). The relevant ones now: math and CS competitions (AMC/AIME, USACO), which prove ability but not quant work; quant competitions for older students (for example QuantConnect's Quant League) and virtual work experience (for example Forage); stock-market simulators and financial-literacy curricula, which teach clicking or reciting. Positioning: the only one built for high schoolers that produces a verified, hard-to-fake record of real quant work. `[NEEDS FOUNDER: open each link and check this is still true.]`

**How do you make money? How much?**
1. **Parents, now:** a six-week intensive, $349, 8 to 12 students, mentor review and a defended capstone. Target $3,500 from the first cohort.
2. **Sponsors, next:** a title sponsor per season ($2k to $10k plus prizes) for brand and early visibility; sponsors see aggregates only.
3. **Later, 18+ only:** paid, consented introductions to internships and programs, after legal review. Not built.
Clubs are chapters and play free. All prices are starting guesses to test. `[NO PROOF YET]`

**How big can this get? Market size.**
`[NEEDS FOUNDER: redo docs/yc/market-sizing.md for this model.]` The inputs to size: US high schoolers aiming at quant, finance and CS (the AMC/AIME and USACO populations are a sourced proxy); the share of families who pay for enrichment at this price; and what firms already spend on university recruiting and brand events. Don't state a number until each input links to a source.

**Why will this be a large company, not a small one?** (five sentences)
Draft, every link unproven: Free seasons bring in the students firms want to reach. Rankings and chapters make each season bigger than the last. Parents pay for the intensive that gets their student to a verified capstone. Firms pay to sponsor seasons, which keeps them free. Once students turn 18, a trusted record becomes the way programs and firms find them. `[NEEDS FOUNDER: rewrite in your words and mark what Season 1 proved.]`

**Category:** Education / EdTech (consumer, with sponsor revenue). `[confirm against live form]`

## Founder(s)

**Who writes the code? Who's the "business" person?** One founder does both. `[NEEDS FOUNDER]`

**Tell us about something impressive you've built or done.**
StrikeLab itself, plus `[NEEDS FOUNDER: competitions, other projects, with links]`. Candidate (every part is verifiable in the repo): "Built and shipped a 23-lesson, browser-based quant-finance platform with a cohort system as a solo high-school student."

**Hard problem you solved with a hack / unusual approach:**
Candidate, verifiable in the repo: running a Python interpreter (Pyodide/WebAssembly) in the student's browser so exercises need no install and no server-side code execution, then self-hosting the runtime so school filters that block CDNs don't break lessons (build queue Q1). `[NEEDS FOUNDER: confirm and tell it in your own words.]`

**Are you working on this full time? Willing to relocate / work full time during the batch?**
`[NEEDS FOUNDER + PARENTS: plan Y5.1. Answer honestly; do not imply availability that doesn't exist. YC expects enrolled students to be ready to work full time if accepted.]`

**Team:** the founder (product, code, email outreach, defenses) and a teammate who runs non-email outreach (communities, club visits, parents). `[NEEDS FOUNDER: is the teammate a cofounder? Run the 4 to 6 week trial in docs/gtm/marketing-lead-onboarding.md first; write down roles and any equity; anyone under 18 needs a parent involved.]`

**Age / legal ability to sign:** `[NEEDS FOUNDER + PARENTS: state plainly; adult signatory plan Y6.1.]`

**Cap table / incorporation / IP:** `[NO PROOF YET: not incorporated; plan Y6.2–6.3.]` Say exactly that, with the date it will change.

## Equity / legal

- Incorporated? Entity, state, date: `[not yet; Y6.2]`
- Anyone else with equity or IP claims on the code/content? `[NEEDS FOUNDER: confirm none; IP assignment at formation, Y6.2]`
- Fundraising so far: `[NEEDS FOUNDER: none unless stated]`
- Any legal proceedings or school/IP restrictions on the founder's work? `[NEEDS FOUNDER: check whether the school or any competition has rules about student work ownership]`

## Curious / other

**What convinced you to apply to YC? How did you hear about it?** `[NEEDS FOUNDER]`
**Anything else we should know?** Use for the honest weak spot: "Season 1 ran Nov 30 to Dec 20; here is exactly what happened." Never use it to excuse a missing number.

## Video (1 min, founder, plain)

Outline only; script after G3: who I am (10 s) · what I built, shown on screen (20 s) · what I learned from leaders, one specific thing (20 s) · what I'll do next (10 s). Plan Y8.4.

---

## Gap list (what blocks a strong submission)

| Gap | Plan item | Earliest it can close |
|---|---|---|
| Eligibility (age, signing) | founder reads the rules | Ongoing |
| Any traction | Season 1 | Dec 20 |
| Return rate | Season 2 | Feb 28 |
| Paid proof | Intensive #1 | January |
| Sponsor interest | 1 letter of intent | Feb 28 |
| Market sizing, competitor map for the new model | Y3.1–3.2 | Dec 21 |
| Commitment plan | Y5.1 | Dec 21 |
| Company, IP, signatory | Y6 | Mar 1 |
| Video, demo | Y4.1, Y8.4 | Apr 10 |

---

## Product claims, verified against the repo (2026-10-15; seasons rows 2026-10-16)

| Claim in this draft | Verified against | Result |
|---|---|---|
| 23 lessons, three tracks (9 / 11 / 3) | `src/lib/investingLessons.ts`, `lessons.ts`, `quantLessons.ts` | ✅ |
| Python exercises graded by unit tests, run in the browser, no install; runtime self-hosted | `src/lib/pythonRuntime.ts`; `tests/python.spec.ts` (passes with the CDN blocked) | ✅ |
| Cohort launch from a six-week template with break weeks | `src/lib/cohorts/template.ts`, `components/cohort/BreakWeeksPicker.tsx`, `launchCohort.db.test.ts` | ✅ |
| Invite links, cohort home, scorecard, CSV export | `/teach/[id]/invite`, `cohort` pages, `CohortScorecard.tsx`, `cohortCsvRows` | ✅ |
| Server-timestamped completions | migration `0016`, `lessonCompletions.db.test.ts` | ✅ |
| Code synced across devices | `lesson_submissions` (migration `0018`), `src/lib/submissions/sync.ts` | ✅ |
| Private capstones with revocable sharing | migration `0019`, `api/capstone/[classId]/share` (token minted in the DB; `enabled: false` kills the link) | ✅ |
| Paper-trading sandbox, challenges, certificates | `api/sandbox`, `api/challenges`, `api/certificates` | ✅ exist; not part of the pilot pitch |
| Stripe plumbing, not used for pilots | `api/stripe/*`; webhook ordering fix covered by `applyEvent.test.ts` | ✅ |
| List price $199 per club / $499 per school instructor | `src/app/pricing/page.tsx` | ✅ |
| Seasons: server-timed windows, late submissions rejected, AI tutor blocked during an attempt, handle-only boards from official scores, chapter board for members and teacher only | migration `0024`, `src/lib/seasons/seasons.db.test.ts` | ✅ |
| Per-student numbers from a keyed hash | `src/lib/seasons/params.ts`, `params.test.ts` | ✅ |
| Official scoring re-runs code with the student's numbers; loops stopped; unclear cases go to review | `scripts/seasons/score-core.mjs`, `scoring.test.ts` | ✅ run by the founder (`npm run season:score`), not automatic yet |
| Season 1: three challenges, Nov 30 to Dec 20 | `supabase/seed/season-1.sql`, `season1Seed.db.test.ts` | ✅ in the repo; live only after the seed is run in production |
| Intensive waitlist, price shown, no payment | `src/app/intensive/`, `api/intensive/waitlist` | ✅ |
| Tests (2026-10-16) | `npm test`: 80 files, 480 tests, 14 database test files | ✅ |
| Tests (2026-10-15, superseded) | `npm test`: 66 files, 392 tests; `playwright`: 55 passed | ✅ (was "~346") |
| "CI with accessibility and Lighthouse budgets" | `lighthouserc.json`: errors on layout shift, page weight and performance score; **LCP ≤ 2.0 s and script size are warnings only, and both are currently missed** (LCP 2.4–3.1 s on a throttled lab run) | ⚠ worded as "performance and layout-shift budgets"; don't claim LCP |
| "Row-level security tests for every database policy" | 13 `*.db.test.ts` files cover classes, capstones, completions, submissions, deletion, rate limits, leaderboard; **no check that literally every policy has a test** | ⚠ reworded above; don't say "every" unless audited |
| Fewer than 20 people have completed a lesson or joined a class | Not checkable from the repo (needs the production database) | `[NEEDS FOUNDER: current number]` |

## Founder question list (all `[NEEDS FOUNDER]` items, grouped)

Answer in your own words; the agent will not write these. **New for v0.6:** (a) is the teammate a cofounder, and on what terms? (b) your 150-word "I'm the student it's for" story; (c) which program's eligibility rules you checked, and what they say. About 60–90 minutes in total.

**Facts only you know (10 min)**
1. Where do you live; where would the company be based?
2. When did you start StrikeLab, and about how many hours a week?
3. Who else has equity or IP claims on the code or content? Any school or competition rules about who owns student work?
4. Any money raised so far?

**The story (30 min, plain words, no superlatives)**
5. Why this idea; how do you know people need it? (150 words max, plan Y5.5)
6. What did you do vs. what did AI tools do? YC will ask. Be specific.
7. Something impressive you built or did besides StrikeLab, with links.
8. The "hack" story: is the in-browser Python runtime really the hardest problem you solved? Tell it your way.
9. Did you do anything unusual to get users? Only what actually happened.
10. Why YC, and how did you hear about it?

**Commitment and people (needs your parents, plan Y5.1/Y5.2/Y6.1)**
11. Full time? Relocate? What happens to school if you are accepted?
12. Solo founder: why, and who fills the gaps (named advisors)?
13. Age and legal ability to sign; who is the adult signatory?

**Judgment calls**
14. How much of the market-size math do you want to say, given that licenses alone top out at a few million dollars?
15. The five-sentence "why this gets big" story (plan Y3.4), marking what is unproven.
16. Confirm or replace the sourced inputs in `market-sizing.md` (priority: I2, I4/I5, I6).

**Numbers that only exist after the pilots** (leave blank until real): cohorts run, students activated, week-4 retention, capstones, leaders who would run it again, paid or committed.
