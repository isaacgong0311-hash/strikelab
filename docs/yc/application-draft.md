# YC Application Draft (v0.5, 2026-10-15)

**Status:** v0.5. Product claims re-verified against the repo on 2026-10-15 (table at the end); founder answers still open (list at the end). Rough on purpose. Its job is to show which answers we can't write yet.
**Questions below are by theme, not verbatim.** The live form could not be fetched from the agent environment. Before each rewrite, open ycombinator.com/apply, paste the current questions over the headings, and keep the answers.
**Markers:** `[NEEDS FOUNDER]` = only the founder can answer. `[NO PROOF YET]` = a claim that needs data we don't have. `[SOURCE]` = a number that must link to the data room.
**Rules (plan Y8.8):** every figure links to a source; bad numbers are stated plainly with what changed; nothing invented. Update at each gate (G3, G4, G5).

---

## Company

**One-sentence description**
StrikeLab gives high-school clubs a ready-to-run six-week technical-finance lab where students code real market models and finish with work they can show.

**What does the company do?** (≤ 50 words)
Students write Black-Scholes pricing, the Greeks and backtests in Python in the browser, no install. A club leader launches a six-week cohort in minutes and sees who is active and who needs help. Each student ends with a capstone: real code and a result.

**Link / demo:** strikelab.dev, `/demo`. `[Record 2-minute video: plan Y4.1]`

**Where do you live / where is the company based?** `[NEEDS FOUNDER]`

**Stage / how long working on it?** `[NEEDS FOUNDER: start date, hours per week]`

## Progress

**What have you built?**
- 23 browser-based lessons across three tracks (investing fundamentals, options pricing, quant investing), each ending in a Python exercise graded by unit tests, run client-side with Pyodide.
- A pilot operating system: cohort launch from a six-week template with break weeks, invite links, a student cohort home, server-timestamped completions, synced code across devices, private capstones with revocable sharing, a leader scorecard and CSV export.
- A paper-trading sandbox, challenges, certificates, and Stripe plumbing (not yet used for pilots).
- Engineering: 392 automated tests (13 of the 66 test files run against the real database migrations with row-level security on), 55 browser tests including accessibility, and CI with Lighthouse performance and layout-shift budgets. `[SOURCE: recheck counts at submission]`

**How long did it take, and who built it?** Built solo by the founder, a high-school student. `[NEEDS FOUNDER: dates, hours, what the founder did vs. used AI tools for. Be specific and honest; YC will ask.]`

**Are people using it? Describe traction.**
`[NO PROOF YET]` As of 2026-10-01: no leader-run cohort has started. Fewer than 20 people have completed a lesson or joined a class (company design spec §2).
*Target text after the pilots:* "N cohorts run by M outside leaders; X students activated (Y% of enrolled); Z% retained in week 4; K capstones submitted; L of M leaders asked to run it again; P organizations paid or committed in writing. Growth: [weekly chart]." Every figure `[SOURCE: scorecard, by cohort and source]`.

**Revenue / money collected / commitments:** `[NO PROOF YET]` $0. Pilots free by design; list price $199/yr per club, $499/yr per school instructor. Target: ≥ 2 paid or dated, priced commitments by Mar 28.

**How many active users and how fast is it growing?** `[NO PROOF YET]` North-star metric: students who submit a capstone in a leader-run cohort. Chart weekly.

**Did you do anything unusual to get users?** `[NEEDS FOUNDER]` Candidate story: walking into teachers' classrooms; asking every leader for an introduction. Use only what really happened.

## Idea

**Why did you pick this idea? How do you know people need it?**
`[NEEDS FOUNDER: personal story, in plain words, 150 words max, no superlatives (plan Y5.5).]` Evidence to cite once it exists: the top three pains from leader conversations, ranked (plan Y2.5).

**What's new about what you make? What do you understand that others don't?**
Draft thesis, to be tested against interviews: the existing options teach students to *click* (stock simulators) or *recite* (financial-literacy curricula). Code-first finance makes the *work product* the credential: a student implementing Black-Scholes produces something a teacher can inspect. And leader time is the scarcest resource in any club, so the product's job is zero-prep delivery, not more content.
`[NO PROOF YET: replace with 3–5 specific things learned from ≥ 30 conversations (plan Y2.2). Delete anything a generic edtech pitch would also say.]`

**Who are your competitors? What do you understand about them that they don't?**
`[See docs/yc/competition-map.md (figures re-checked against search results 2026-10-15; the founder still opens each link).]` Starting set from the company design spec §2: stock-market simulators and financial-literacy curricula (teacher dashboards, standards alignment, classroom join flows), and learning-to-opportunity programs such as Forage and QuantConnect's Quant League. Positioning: StrikeLab wins on rigorous, code-first technical finance and inspectable student work, not on generic investing content or on having a simulator.

**How do you make money? How much?**
Rung 1: club and school licenses ($199 / $499 per year), which prove willingness to pay and are the distribution engine. Rung 2: district agreements. Rung 3: parent-paid summer cohorts. Rung 4: sponsor-funded seats for schools that lack quant exposure. Rung 5 (later, opt-in only): verified student portfolios for programs and employers. Source: mega plan §8. State plainly that license revenue alone is small and which rung has evidence. `[NO PROOF YET beyond rung 1 hypothesis]`

**How big can this get? Market size.**
Draft from `docs/yc/market-sizing.md` (inputs re-checked 2026-10-15; the private-school count I2 is still unconfirmed and the founder opens each link): about 27,000 US high schools; if 25–50% have a club that could host the lab, at a $300 blended price that is $2.0M–$4.1M a year **if every one paid**, and roughly $0.1M–$0.6M at a mature 5–15% paying share. So licenses are the wedge and the proof of willingness to pay; districts, sponsored seats and summer cohorts are what could make it large, and the pilots are what will size them. `[NEEDS FOUNDER: confirm the sourced inputs; decide how much of this to say.]`

**Why will this be a large company, not a small one?** (five sentences)
`[NEEDS FOUNDER: plan Y3.4. Wedge → repeated cohorts → district agreements → sponsored seats → verified record of what students can build. Mark which links are unproven.]`

**Category / what category does the company fall into:** Education / EdTech (and B2B2C to schools and clubs). `[confirm against live form]`

## Founder(s)

**Who writes the code? Who's the "business" person?** One founder does both. `[NEEDS FOUNDER]`

**Tell us about something impressive you've built or done.**
StrikeLab itself, plus `[NEEDS FOUNDER: competitions, other projects, with links]`. Candidate (every part is verifiable in the repo): "Built and shipped a 23-lesson, browser-based quant-finance platform with a cohort system as a solo high-school student."

**Hard problem you solved with a hack / unusual approach:**
Candidate, verifiable in the repo: running a Python interpreter (Pyodide/WebAssembly) in the student's browser so exercises need no install and no server-side code execution, then self-hosting the runtime so school filters that block CDNs don't break lessons (build queue Q1). `[NEEDS FOUNDER: confirm and tell it in your own words.]`

**Are you working on this full time? Willing to relocate / work full time during the batch?**
`[NEEDS FOUNDER + PARENTS: plan Y5.1. Answer honestly; do not imply availability that doesn't exist. YC expects enrolled students to be ready to work full time if accepted.]`

**Solo founder: why, and who fills the gaps?** `[NEEDS FOUNDER: plan Y5.2/5.4: named advisors, helpers ladder in mega plan §11.]`

**Age / legal ability to sign:** `[NEEDS FOUNDER + PARENTS: state plainly; adult signatory plan Y6.1.]`

**Cap table / incorporation / IP:** `[NO PROOF YET: not incorporated; plan Y6.2–6.3.]` Say exactly that, with the date it will change.

## Equity / legal

- Incorporated? Entity, state, date: `[not yet; Y6.2]`
- Anyone else with equity or IP claims on the code/content? `[NEEDS FOUNDER: confirm none; IP assignment at formation, Y6.2]`
- Fundraising so far: `[NEEDS FOUNDER: none unless stated]`
- Any legal proceedings or school/IP restrictions on the founder's work? `[NEEDS FOUNDER: check whether the school or any competition has rules about student work ownership]`

## Curious / other

**What convinced you to apply to YC? How did you hear about it?** `[NEEDS FOUNDER]`
**Anything else we should know?** Use for the honest weak spot: "No cohort has run yet; here is the plan and the date of the first one." Delete this line and replace it with the real numbers when they exist.

## Video (1 min, founder, plain)

Outline only; script after G3: who I am (10 s) · what I built, shown on screen (20 s) · what I learned from leaders, one specific thing (20 s) · what I'll do next (10 s). Plan Y8.4.

---

## Gap list (what blocks a strong submission)

| Gap | Plan item | Earliest it can close |
|---|---|---|
| Any traction | Y1, pilots | Dec 20 (G3) |
| Insight from conversations | Y2 | Feb 28 |
| Paid proof | Y7 | Mar 28 (G5) |
| Market sizing, competitor map | Y3.1–3.2 | Dec 21 |
| Commitment plan | Y5.1 | Dec 21 |
| Company, IP, signatory | Y6 | Mar 1 |
| Video, demo | Y4.1, Y8.4 | Apr 10 |

---

## Product claims, verified against the repo (2026-10-15)

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
| Tests | `npm test`: 66 files, 392 tests; `playwright`: 55 passed | ✅ (was "~346") |
| "CI with accessibility and Lighthouse budgets" | `lighthouserc.json`: errors on layout shift, page weight and performance score; **LCP ≤ 2.0 s and script size are warnings only, and both are currently missed** (LCP 2.4–3.1 s on a throttled lab run) | ⚠ worded as "performance and layout-shift budgets"; don't claim LCP |
| "Row-level security tests for every database policy" | 13 `*.db.test.ts` files cover classes, capstones, completions, submissions, deletion, rate limits, leaderboard; **no check that literally every policy has a test** | ⚠ reworded above; don't say "every" unless audited |
| Fewer than 20 people have completed a lesson or joined a class | Not checkable from the repo (needs the production database) | `[NEEDS FOUNDER: current number]` |

## Founder question list (all `[NEEDS FOUNDER]` items, grouped)

Answer in your own words; the agent will not write these. About 60–90 minutes in total.

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
