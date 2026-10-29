# YC Application Draft (v0.7, 2026-10-27), Winter 2027

**Deadline:** Monday, Nov 2, 2026, 8pm PT (10pm in Texas). Decisions by Dec 11 for on-time applications. Both confirmed on ycombinator.com/apply on Oct 27.
**Status:** v0.7. The order below follows the most recent public question list for the YC form. Each heading is marked `[VERIFY ON LIVE FORM]`: the live form needs a login, so before pasting, open it, check each question's wording and character limit, and move the answers to match. Product claims re-checked on Oct 27 against production (table near the end). The plan for the next six days is in [`w27-submission-plan.md`](w27-submission-plan.md).
**What changed since v0.6:** reordered to match the form; product claims updated for production commit `307ad68` (Market Lab, free clubs, $349 Intensive waitlist, no $199/$499 prices); tests re-counted (95 files, 541 tests); Season 1 found **not scheduled in the production database** (see claims table); new questions added (tech stack, other ideas, batch choice, Early Decision); all founder-only items collapsed into one checklist.
**Markers:** `[NEEDS FOUNDER]` = only the founder can answer, and this draft won't write it. `[NO PROOF YET]` = the claim needs data we don't have. `[UNVERIFIED]` = couldn't be checked from this network or the repo.
**Rules:** follow [`docs/investor/claim-ledger.md`](../investor/claim-ledger.md). Unknown is not zero. No invented traction. Every number has a source and a date. Describe production only, not branches that aren't deployed.

---

## Read before you start (internal notes, don't paste)

**What YC's own pages say (checked Oct 27):**
- FAQ: "You can certainly apply when you are a full-time student or employee", and founders are expected "to commit to working full-time on their company during the batch and afterwards if accepted."
- FAQ: you don't need to incorporate before applying. Solo founders are accepted regularly, though YC says a cofounder helps.
- FAQ: about 40% of funded companies in a batch are just an idea; most have no revenue.
- The FAQ page doesn't state a minimum age. If you have a question about your own eligibility, read the current pages yourself, and ask YC if you're unsure. This draft doesn't answer it for you.
- **Early Decision** (ycombinator.com/early-decision): for students who want to finish school first. If you're accepted, YC funds you right away and holds a place in a later batch. On the form you'd choose **"A batch after Winter 2027"** instead of Winter 2027. See "Batch choice" below.

**Which batch?** This decides how you answer the full-time question, so do it first (checklist item 1).

---

## Founders `[VERIFY ON LIVE FORM]`

**Founder profile** (name, email, age, school, education, work history, links). `[NEEDS FOUNDER]` Fill this in yourself. Use exactly the facts YC asks for.

**Who writes code, or does other technical work on your product? Was any of it done by a non-founder? Please explain.**
Facts you can use (from git history, Oct 27): the repo started May 7, 2026; production `master` has 279 commits on 46 different days; 184 of those commits carry a "Co-Authored-By: Claude" line, because AI coding tools wrote much of the code under the founder's direction. `[NEEDS FOUNDER]` In your own words: who wrote and reviewed the code, what you decided and what the tools did, and whether anyone besides you (the outreach teammate, anyone else) touched the product.

**Are you looking for a cofounder?** `[NEEDS FOUNDER]` (decide whether the outreach teammate is a cofounder; see checklist item 6.)

**Please tell us about an impressive thing you've built or achieved.** `[NEEDS FOUNDER]` StrikeLab counts, but this answer is stronger with something else (a competition, another project, with links). If StrikeLab is the answer, pick one verifiable fact from the claims table, not a list.

**Tell us about the time you most successfully hacked some (non-computer) system to your advantage.** `[NEEDS FOUNDER]` It has to be a real story from your life; don't use a product story here.

**Optional: attach a coding agent session you're particularly proud of.** `[VERIFY ON LIVE FORM]` Third-party guides report that YC added this optional question in 2026, taking a markdown or text transcript. If it's on the form: choose one real session where *you* made the key decisions (for example, catching a wrong approach or setting the design), export it unedited, and read it end to end for private data (keys, emails, student names) before attaching. Don't let AI write or tidy it up.

## Founder video `[VERIFY ON LIVE FORM]`

**One-minute video of the founder(s), talking to camera.** Not a product demo. Outline (you say it in your own words; no script is written here):
1. Who you are and what StrikeLab is, in one sentence (10 s).
2. Why you're building it: your reason, in plain words (20 s).
3. One specific thing you learned from real users or from building it (20 s).
4. What happens next, with a date (10 s).
Record it on Oct 30 (see plan). One take is fine. No slides, no music, no screen recording.

## Company `[VERIFY ON LIVE FORM]`

**Company name:** StrikeLab

**Describe what your company does in 50 characters or less.**
Pick one (character counts checked):
- "High schoolers learn quant finance by coding it" (47)
- "Hands-on quant finance for high schoolers" (41)

**Company URL:** https://strikelab.dev

**Demo video (optional upload).** A separate screen recording of the product, recorded Oct 31. Script in the plan. Check the form's length and size limits before recording; keep it under 3 minutes either way.

**Link to the product.** https://strikelab.dev/lab (Market Lab, works with no signup), then https://strikelab.dev/lessons. If the form asks for a login, create a fresh demo student account and give those details; never give the founder or admin account.

**What is your company going to make? Please describe your product and what it does or will do.**
StrikeLab teaches high-school students quantitative finance by having them do it. In Market Lab, a student predicts what happens to an option's price, changes one input, sees the pricing curve move, and writes down why. In the lessons (23 of them, in three tracks) they write the Python behind it in the browser, checked by tests, with nothing to install. Starting Nov 30, free seasons of weekly timed challenges let students prove what they can do: each student gets their own numbers, the AI tutor is off during an attempt, and scores are computed on our server and shown under a handle. A student's verified results become a record they control and can share. Students and clubs use it free; clubs get their own board, a six-week lab plan and a scorecard. Parents can join a waitlist for a six-week mentored Intensive at $349. We take no payment until a cohort fills.

**Where do you live now, and where would the company be based after YC?** `[NEEDS FOUNDER]`

## Progress `[VERIFY ON LIVE FORM]`

**How far along are you?**
Production (strikelab.dev, deployed Oct 22, commit `307ad68`) has: Market Lab with three guided experiments, live pricing curves, a notebook saved in the browser and CSV export; 23 lessons with in-browser Python graded by tests; a searchable lesson hub; free club chapters with invite links, a six-week plan and a scorecard; the seasons system (timed windows, per-student numbers, tutor lock, handle-only leaderboards, club boards); student records with founder-verified results and revocable share links; and the Intensive waitlist. Season 1 runs Nov 30 to Dec 20 with three challenges (put-call parity, Black-Scholes, option delta). Engineering: 558 automated tests in 97 files, 15 of which run against the real database migrations with row-level security on.
`[NO PROOF YET]` Usage: say only what the production query run on Oct 29 shows (checklist item 3). Season 1 is scheduled in production (checked Oct 28) but hasn't started: write "Season 1 opens Nov 30", not "Season 1 is live".

**How long have each of you been working on this? How much of that has been full-time?**
Fact you can use: first commit May 7, 2026. `[NEEDS FOUNDER]` Hours per week, and what full-time means for you (school year vs. summer). Don't round up.

**What tech stack are you using, or planning to use, to build this product? Include AI models and AI coding tools you use.**
Next.js 16 and React 19 (TypeScript) on Vercel; Supabase Postgres with row-level security; Python runs in the student's browser through Pyodide (WebAssembly) in a Web Worker with a time limit, self-hosted so school web filters don't break it; official season scores are computed server-side by re-running the student's code with their own numbers. The in-lesson AI tutor uses Llama 3.3 70B through Groq. Tests: Vitest and Playwright with accessibility checks; CI with Lighthouse budgets. AI coding tools: `[NEEDS FOUNDER: name the ones you actually use, e.g. Claude Code and Codex, and roughly how]`.

**Are people using your product? How many active users or customers? How many are paying?**
`[NO PROOF YET]` Unknown as of Oct 27. Not checkable from the repo, and Vercel Web Analytics isn't enabled for this project, so there's no traffic count either. On Oct 29, run [`scripts/metrics/baseline.sql`](../../scripts/metrics/baseline.sql) against production and paste the result here with the date: registered users, users with at least one completed lesson, total completions, clubs created, students in a club, signups by source. Answer with those numbers, even if they're small. Leave out "Fewer than 20" from v0.6 unless the query confirms it.
Paying: `[NEEDS FOUNDER: confirm from the Stripe dashboard.]` Nothing is for sale on the production site (students and clubs are free; the Intensive is a waitlist with no payment), so expect $0. Write $0 only after checking.

**Do you have revenue?** Same as above: `[NEEDS FOUNDER: confirm in Stripe]`.

**If you are applying with the same idea as a previous batch, did anything change? If you applied with a different idea, why did you pivot?** `[NEEDS FOUNDER]` Only if you applied before. If you did, the honest change is the move from a paid club tool ($199/$499) to free seasons + paid Intensive.

**If you have already participated or committed to participate in an incubator, accelerator or pre-accelerator, please tell us about it.** `[NEEDS FOUNDER]`

## Idea `[VERIFY ON LIVE FORM]`

**Why did you pick this idea to work on? Do you have domain expertise in this area? How do you know people need what you're making?**
`[NEEDS FOUNDER]` Your own words, about 150 words. This draft doesn't write your story. Things a partner will look for: a specific moment, what you tried before building, and what you've seen students or club leaders actually do (not what they said they'd do). If you've watched someone use it, say what happened.

**Who are your competitors? What do you understand about your business that they don't?**
Draft (check each name yourself; see [`competition-map.md`](competition-map.md), written for the earlier club pitch):
- Math and CS contests (AMC/AIME, USACO) prove ability, but not quant work.
- Stock-market games and financial-literacy courses teach clicking buy or reciting definitions, not building the model.
- Quant competitions and virtual work experience (for example QuantConnect, Forage) are mostly for college students.
- General coding sites (for example Codecademy) teach Python, but not finance.
What we think we understand (a hypothesis, not proven yet): content is free everywhere, and what a high schooler lacks is **proof** they can do the work. With AI, take-home work proves little, so proof has to be built around that: per-student numbers, timed windows, the tutor off, and a short live conversation before anything counts as verified. `[NO PROOF YET: Season 1 tests this.]`

**How do or will you make money? How much could you make?**
1. **Parents:** the six-week Intensive, $349, 8 to 12 students, with mentor review and a defended capstone. Waitlist only today; no payment taken.
2. **Sponsors (later):** a title sponsor per season, for brand and early visibility; sponsors see aggregate results only. No sponsor yet.
3. Students and clubs stay free.
All prices are guesses to test `[NO PROOF YET]`. "How much could you make": `[NEEDS FOUNDER]`. Only state a number if every input in [`market-sizing.md`](market-sizing.md) has a source. That file was written for the club-license model, so it needs redoing for this one. If you can't do it in time, say what you'd need to believe instead of a made-up total.

**Which category best applies to your company?** Education / EdTech. `[VERIFY ON LIVE FORM: pick from its list]`

**If you had any other ideas you considered applying with, please list them.** `[NEEDS FOUNDER]` Real alternatives you considered, not invented ones.

## Equity `[VERIFY ON LIVE FORM]`

**Have you formed any legal entity yet?** `[NEEDS FOUNDER]` As far as the repo shows, no. Say exactly that if it's true.
**Planned equity split among founders and others:** `[NEEDS FOUNDER]` (depends on checklist item 6).
**Have you taken any investment? Are you currently fundraising?** `[NEEDS FOUNDER]`
**Anyone else with a claim on the code or content (school rules, contests, contributors)?** `[NEEDS FOUNDER]` Answer only if the form asks.

## Curious `[VERIFY ON LIVE FORM]`

**What convinced you to apply to Y Combinator? Did someone encourage you to apply? Have you been to any YC events?** `[NEEDS FOUNDER]`
**How did you hear about Y Combinator?** `[NEEDS FOUNDER]`

## Batch choice `[VERIFY ON LIVE FORM]`

**Which batch do you want to apply for?** `[NEEDS FOUNDER]` The choices reported on YC's Early Decision page are **Winter 2027** or **A batch after Winter 2027**.
- **Winter 2027** means committing to work on StrikeLab full-time during the batch (roughly January to March) and after. Choose it only if that's actually possible for you.
- **A batch after Winter 2027 (Early Decision)** is meant for students who want to finish school first. If accepted, YC funds now and holds your spot for a later batch. If you can't commit full-time from January to March, this is the honest choice, and the rest of this application stays the same.
Whatever you choose, answer every availability question the same way and without overstating. This draft doesn't answer it for you.

---

## Founder checklist (about 60 minutes)

Everything above marked `[NEEDS FOUNDER]` is here. Do it in this order, because the first item changes some of the rest. Write answers in your own words, straight into the live form or a copy of this file. Nobody else, including AI, writes items 1, 2, 4 or 5.

| # | Item | Time | Who |
|---|---|---|---|
| 1 | **Batch choice + availability.** Read YC's FAQ and Early Decision pages yourself. Decide: Winter 2027 (full-time Jan to Mar) or "A batch after Winter 2027". Discuss with your parents. | 10 min | You + parents |
| 2 | **Founder profile.** Name, age, school, location, links, where the company would be based. Facts only. | 5 min | You |
| 3 | **Facts you look up.** (a) Run `scripts/metrics/baseline.sql` on production and paste the numbers with the date. (b) Confirm revenue in Stripe. (c) Legal entity: yes/no. (d) Any investment or incubator: yes/no. | 10 min | You |
| 4 | **Why this idea** (about 150 words) and **why YC / how you heard**. | 15 min | You |
| 5 | **Impressive thing** and **non-computer hack**: one real story each. | 10 min | You |
| 6 | **Team.** Is the outreach teammate a cofounder? If yes, their profile and planned split; if no, answer "solo" and say who helps. Anyone under 18 needs a parent involved. | 5 min | You (+ teammate) |
| 7 | **Short fills.** Hours per week and full-time history; AI coding tools you use; who did what in the code; other ideas; category; pick the one-liner. | 5 min | You |

Number-dependent sentences (the market-size estimate, any user counts) stay out unless item 3 or a sourced input backs them.

---

## Product claims, verified (Oct 27, 2026)

Checked against production commit `307ad68` (Vercel production deployment `dpl_7qXPep2dbuzGTaskAJkqikujQYCv`, READY, created Oct 22). Live pages were read through Vercel's deployment fetch, because strikelab.dev is blocked on this network. Tests were run at `307ad68`.

| Claim in this draft | Checked against | Result |
|---|---|---|
| 23 lessons in three tracks (9 / 11 / 3) | `src/lib/investingLessons.ts`, `lessons.ts`, `quantLessons.ts` | ✅ |
| Python runs in the browser (Pyodide in a Web Worker, time limit), graded by tests, self-hosted runtime | `src/lib/pythonRuntime.ts`, `tests/python.spec.ts` | ✅ code (unchanged since v0.6) |
| Market Lab: three guided experiments (volatility, time, direction), predict → change → explain, live curves, browser-saved notebook, CSV export, no signup | `src/app/lab/`, `src/lib/marketLab.ts`, `marketLabNotebook.ts`; commit `86663fa` | ✅ code + deployed |
| Searchable lesson hub with track filters and resume | `src/app/lessons/LessonsClient.tsx`, `src/lib/learningHub.ts` | ✅ |
| Homepage leads with experiments ("Learn finance. Change the inputs. See it click.") and "Train, compete, prove it." | `src/app/HomeView.tsx` | ✅ (lab-first hero; seasons are a section, not the headline) |
| Students and clubs free; Intensive $349, six weeks, waitlist only, payment only after a cohort fills | `src/app/pricing/page.tsx`, `src/app/intensive/` | ✅ The $199/$499 club prices from v0.6 are **gone**; don't use them |
| Clubs: free chapter board, invite link, six-week lab, scorecard | `src/app/pricing/page.tsx`, `src/app/clubs/`, `src/lib/cohorts/` | ✅ |
| Seasons: server-timed windows, late submissions rejected, AI tutor off during an attempt, handle-only boards from official scores, club board | migration `0024`, `src/lib/seasons/seasons.db.test.ts`, deployed `/seasons` copy | ✅ code |
| Per-student numbers from a keyed hash | `src/lib/seasons/params.ts`, `params.test.ts` | ✅ |
| Official scores computed server-side by re-running code with the student's numbers | `scripts/seasons/score-core.mjs`, `score-worker.mjs` | ✅ but run by the founder (`npm run season:score`), **not automatic**. Don't say "instant" |
| **Season 1: three challenges, Nov 30 to Dec 20** | `supabase/seed/season-1.sql`; deployed `/seasons` | ✅ **Scheduled in production (checked Oct 28).** strikelab.dev/seasons lists Week 1 put-call parity (opens Nov 30), Week 2 Black-Scholes (Dec 7) and Week 3 delta (Dec 14), each 60 minutes. That list renders only from `season_challenges` rows (`src/app/seasons/page.tsx`), so migration `0024` and the seed are in the production database. On Oct 27 it showed the "appear here when the season is scheduled" fallback. Say "opens Nov 30", not "live" |
| Records: founder-verified results (capstone, placing), parent consent flag, revocable share links | migration `0025`, `src/app/record/`, `src/app/r/[token]`, `src/app/admin/verify` | ✅ code; whether `0025` is applied in production is `[UNVERIFIED]` |
| AI tutor (Llama 3.3 70B via Groq) | `src/app/api/ai/hint/route.ts` | ✅ |
| Tests | `npx vitest run` at `e5ebe32` (production, Oct 28): **97 files, 558 tests, all passed**; 15 `*.db.test.ts` files; 22 Playwright spec files (not run this pass) | ✅ (was 95 / 541 on Oct 27, 80 / 480 / 14 on Oct 16) |
| "CI with performance budgets" | `lighthouserc.json`: some budgets are errors, some only warnings | ⚠ Say "Lighthouse budgets in CI"; don't claim LCP targets |
| Usage numbers (users, completions, clubs) | Needs the production database; Vercel Web Analytics isn't enabled (API returned "not found") | `[NO PROOF YET]` Checklist item 3 |
| Revenue | Needs Stripe | `[NEEDS FOUNDER]` |
| Git history: first commit May 7, 2026; 279 commits on 46 days; 184 with a Claude co-author line | `git log` at `307ad68` | ✅ |

**Changes after `307ad68`:** GitHub master moved on Oct 27 (`0b9fd7e`, PR #66: AI practice problems said "All tests passed!" for wrong answers), and more PRs (#60, #61, #63, #65) were merging and deploying while this was checked. **Update Oct 28:** production is `e5ebe32` (Vercel READY) and includes #66 and those PRs, plus #76 (scoring copy, rehearsal season seed) and #77 (editor indents 4 spaces, readable Python errors, Market Lab fixes). Still re-run this table on Oct 31 against whatever is then in production, and try one AI practice problem with a wrong answer before demoing it.
