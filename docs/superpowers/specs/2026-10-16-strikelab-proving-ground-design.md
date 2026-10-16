# StrikeLab as a proving ground: company and product design

**Date:** 2026-10-16. **Status:** approved section by section in a brainstorming session with the founder; awaiting review of this written version.
**Supersedes** the club-lab-first strategy in `2026-09-13-strikelab-yc-company-design.md` on *what the company is*. That spec's proof discipline (no invented numbers, explicit thresholds, kill rules) still applies. `docs/PLAN.md` will be updated to point here once this spec is approved.

## 1. Inputs from the founder (the facts this design rests on)

| Question | Answer |
|---|---|
| Why StrikeLab exists | "I'm the student it's for." |
| What that student wanted most | A path into quant/finance: proof they can do the real work |
| Founder's situation for the next 12 months | Under 18, in high school; a parent must sign anything |
| Goal for the next 6 months | Real users and revenue, and YC |
| Reachable in 30 days | Students like the founder, teachers/club advisors, parents, finance/quant people |
| Team | Founder (product, email outreach, defenses) + a teammate who does outreach that is **not** email |

**A constraint no strategy removes:** accelerators such as YC and PearX normally require founders who can sign contracts. The founder reads each program's current eligibility rules from the source (not from this document) and applies the moment they allow. Until then the goal is a company that is obviously fundable on that day.

## 2. The company in one line

**StrikeLab is where high schoolers prove they can do real quant work, through seasons of timed challenges and a defended capstone, and earn a record that firms and programs trust.**

### Who it is for
A strong high-school student (math team, AMC/AIME, CS, investing club) who wants a path into quant or finance and has no way to show ability: too young for internships; grades and contests don't show they can price an option or test a strategy honestly.

### Who pays, in order
1. **Parents, now:** a six-week **intensive** with mentor review that ends in a capstone the student defends live.
2. **Sponsors, next:** trading firms, banks and fintechs fund a **season** (title sponsorship, prizes) for brand and early talent visibility. **They see aggregate results only.**
3. **Later, 18+ only:** paid, consented introductions to internships and programs. Not built or sold now; a lawyer reviews it before it exists.

**Clubs are chapters, not customers.** A club plays a season together using the existing club-lab tooling, free. The $199/$499 license stays on the site but is not actively sold.

**Not targeted:** beginners seeking general financial literacy (free incumbents own it); schools as buyers.

### Why this beats the alternatives considered
| Direction | Verdict |
|---|---|
| A. Club lab as the business | Kept only as the chapter toolkit: no budget holder, slow sales, small ceiling |
| B. Parent-paid intensive as the whole business | Kept as the first revenue product inside this design; alone it reads as a tutoring business |
| **C. Proving ground (this design)** | Same product, centered on what the founder-as-user wanted; a different payer (sponsors) can fund a free product; rankings create network effects |

## 3. Product

### The loop
1. **Train (exists):** 23 lessons, in-browser Python (now in a Web Worker with time limits), free and self-paced.
2. **Compete in seasons (rebuilt from the removed weekly challenges):** short seasons (Season 1: three weeks, Nov 30 to Dec 20), one timed challenge a week.
3. **Prove (exists + new step):** the capstone, plus a 10-minute live **defense**; passing marks it verified.
4. **The record (new):** one page per student listing seasons and placings, challenges solved, verified capstone. Private until the student shares it.
5. **Chapters (exists):** a club plays a season together; chapter leaderboard.
6. **Intensive (mostly exists):** a small cohort on the existing cohort system, with mentor review, the defense, and a parent checkout.

**Not building now:** sponsor dashboards, recruiting features, mobile apps, new lesson tracks.

### Components (each small, with one job)

| Unit | Does | Built from |
|---|---|---|
| `seasons` data model | Seasons, their weekly challenges and time windows | New migration; challenge content restored from git (`src/lib/challenges.ts` at `e0ea88f^`, 5 challenges) and rewritten as parameterized templates |
| Challenge parameters | Each student gets deterministic, randomized inputs: `params = f(challenge_id, user_id, season_secret)`; the tests use the same params | New pure module, unit-tested |
| Timed attempt | `start_attempt()` RPC stamps `started_at` server-side; submissions after `started_at + limit` are rejected | New migration + RPC; AI tutor and hints are blocked for an open attempt (extends the 0023 class policy pattern) |
| Official scoring | The browser shows a preview; the **official** score comes from the server re-running the submitted code in Pyodide under Node with the student's params. Score = tests passed, time used, and a rubric score for the written "explain why" (reviewed by a person in Season 1) | New server route. **Risk:** Pyodide in a serverless function may be too slow or large; if so, fall back to a queue processed by a script run by the founder, and rely on the defense for top placings |
| Handles | Public leaderboards show a chosen handle, never a real name; uniqueness and a basic word filter | New column + validation |
| Leaderboards | Season board and chapter board, from official scores only; a top-10 placing appears on a record only after a short defense | Rebuilt from the removed leaderboard (handles replace anonymity) |
| Defense sign-off | A reviewer marks a capstone or top placing as verified, with date and reviewer; requires a recorded parent consent for a minor's call | New table + small reviewer page (founder-only at first, like `/admin/metrics`) |
| Record page | Read-only page per student, private by default; share link like capstone sharing (revocable token) | New page reusing the capstone share pattern |
| Intensive waitlist | Public page with the price; collects a parent email and student grade; no payment | New page + table; data map updated |
| Intensive checkout | Parent pays when a cohort fills | Existing Stripe code, **only after** a parent is the Stripe account holder and terms are reviewed |

### Data flow (one challenge)
Student opens challenge, then `start_attempt` stamps the start time and returns their params. The student codes in the browser (worker) and sees a preview. On submit, the server checks the window, stores code and explanation, re-runs it with the params, and stores the official score. The leaderboard reads official scores. A top-10 placing is held until a defense is signed off, then appears on the record.

### Error handling
- Late submission: rejected with the window's end time shown; nothing stored as official.
- Official re-run fails or times out: the attempt is marked "pending review", not failed, and the founder is alerted (existing ops alert).
- Database unreachable: the same honest messages used on the join page; no silent zero scores.
- Preview and official score disagree: the official score wins, the attempt is flagged for a look.

### Testing
- Pure modules (params, scoring, window checks): unit tests.
- Every new table and RPC: PGlite tests with row-level security on, like the existing `*.db.test.ts` files (students can't read others' code or set their own scores; reviewers only via the founder gate).
- One browser test per student-facing page (season, attempt flow, record), including accessibility.
- A seeded rehearsal season (extending `npm run rehearsal:seed`) before Season 1.

## 4. Money (starting guesses to test, not facts)

| Rung | Offer | Target | When |
|---|---|---|---|
| Intensive | 6 weeks, 8 to 12 students, founder + one paid college mentor. **$349**, sold through a waitlist that shows the price; charge only when a cohort fills | 10 paid seats, about $3,500 | January cohort |
| Seasons | Free | 100 students, 5 chapters in Season 1 | Nov 30 to Dec 20 |
| Sponsors | Title sponsor per season, $2k to $10k plus prizes | 1 signed letter of intent | By Feb 28 |
| 18+ introductions | Paid, consented | Not built | After legal review |

**Prerequisite for any payment:** a parent as the Stripe account holder, and terms and refund policy reviewed.

## 5. Getting users (students first, adults follow)

| Channel | Owner |
|---|---|
| Chapter 1 at the founder's school (labeled founder-run) | Founder |
| Communities where these students already are: AoPS, competition-math and USACO Discords, Reddit, following each community's rules. Pitch: "a free 3-week quant season, ranked, with a verified record at the end" | **Teammate** |
| Social and short video; in-person club visits | **Teammate** |
| Parents: intensive waitlist via school parent channels and events, after Season 1 has results | **Teammate** |
| Teachers/club advisors by email: "let your club play a free 3-week season" (target 5 chapters) | Founder (agent drafts) |
| Finance/quant people by email, asked to **judge or write one challenge** first (judges now, sponsor contacts later) | Founder (agent drafts) |

## 6. Trust and integrity

1. **No real names in public.** Handles only; schools shown only if a chapter leader opts in; records private until shared.
2. **Sponsors see aggregates only.** No student data goes to any firm; individual introductions only after 18 with explicit opt-in, after legal review.
3. **Anti-cheating that assumes AI exists:** per-student randomized parameters, server-timed windows, AI tutor off during attempts, rubric-scored explanations, live defense for a verified capstone and for any top-10 placing.
4. **Parent consent** for payment and for any live call with a minor; calls are never one-on-one and private (two adults present, or recorded with consent).
5. **Existing safeguards stay:** 13+, row-level security, the data map (updated with every new table), self-serve deletion, AI tutor off by default for classes.

## 7. The next 90 days

| By | Founder | Teammate | Agent |
|---|---|---|---|
| **Oct 31** | Chapter 1 at school; ask 3 finance people to judge; read YC/PearX eligibility rules | Start community posts and in-person visits | Seasons data model, params, timed attempts, handles, chapter board; intensive waitlist page |
| **Nov 29** | Review the 3 Season 1 challenges (agent drafted them; a judge may write a replacement); 5 chapters | Pre-season sign-ups toward 100 | Official scoring, record page, defense sign-off, rehearsal season |
| **Dec 20** | Run Season 1 (Nov 30 to Dec 20) | Keep sign-ups and chapters going | Fixes from Season 1 only |
| **January** | Intensive #1 | Parent waitlist push | Parent checkout, once a parent holds the Stripe account |
| **Feb 28** | 1 sponsor letter of intent; Season 2 | Season 2 recruitment | Season 2 |

### Kill rules (decided now)
- **Under 30 students in Season 1:** the message or channel is wrong; fix that before building more.
- **0 paid seats from a 50-person waitlist:** the price or payer is wrong.
- **Firms won't even judge or sponsor:** stay parent-paid; drop the sponsor rung for now.

### What the application will say (once eligible)
"Season 1: N students from M schools. X% came back for Season 2. $Y from intensives. A sponsor signed for Season 3. I was the student this is for." Every number links to its source, as before.

## 8. What changes in the existing plans
- The club lab becomes the chapter toolkit; the build plan's club-pilot tasks (T2.6, T5.4, T5.11, and pricing changes) are paused, not deleted.
- The weekly challenges and leaderboard removed on 2026-10-16 come back as seasons, rebuilt (handles, randomized params, official scoring), not restored as they were.
- `docs/PLAN.md` gets rewritten around this spec after approval; the build plan's hardening work (T3) stays done and still applies.
