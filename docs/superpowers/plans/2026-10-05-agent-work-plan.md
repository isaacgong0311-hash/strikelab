# Agent Work Plan: Oct 5 → the Oct 23 code freeze

**Date:** 2026-10-05 (Monday, runway week 4). **Gate:** Fri Oct 16. **Freeze:** Fri Oct 23.
**Owner:** the founder decides and talks to people. The agent builds, verifies and reports.
**Authority:** `2026-09-29-mega-plan.md` wins on dates and gates; `2026-09-30-sprint-to-go-no-go.md` wins on the day-by-day. This plan only says what the *agent* does in that window and what it needs from the founder. It adds no new strategy.

---

## 1. Where we are (Oct 5, from the repo, not from memory)

| Fact | Source | So what |
|---|---|---|
| **0 leader contacts logged.** The CRM has only the two `EXAMPLE` rows; the scoreboard target for today is about 20 contacted and 2 calls booked | `npm run pipeline`, `crm.csv`, sprint §3 | The gate (a leader's yes by Oct 16) is the only thing that matters, and the repo shows it hasn't started. If outreach is tracked elsewhere, the numbers need to get here |
| **Three big draft PRs are open and none is merged:** #37 (43 files, since Sep 30), #39 (50 files, since Oct 1), #40 (97 files, since Oct 1) | GitHub | Nothing since #38 has reached production, and the freeze is 18 days out |
| **They overlap.** #39 merges cleanly into `master`. #40 conflicts with #39 in 2 places (trivial). **#37 doesn't merge with current `master` (7 conflicts) and conflicts with #40 in 12 files** | trial merges of each pair | The merge order matters, and #37 is the problem |
| **#37 and #40 made opposite calls on `/challenges`.** #37 (logged Sep 30): free for everyone, Pro gate removed. #40: Pro hidden, challenge shown but not runnable | `decision-log.md` on #37's branch | One has to win. #37's is already in the decision log and removes the dead end entirely |
| Supabase isn't set up: no hosted project, so no staging, so no P6 smoke test | the Oct 5 request | P1 (migrations) and P5 (staging) both wait on the founder creating a project |
| CI is green on #40's head; 406 unit tests, 92 browser tests, axe clean | CI | The code is in good shape. Getting it merged and exercised against a real backend is the gap |

## 2. The honest read

1. **The bottleneck is distribution, not product.** The YC-readiness plan says it in §1 and the data agrees: everything outside the founder's circle is zero. No agent work moves D1–D3 until a leader says yes.
2. **My last two days were off the critical path.** The sprint plan's rule for the agent in this window is "react, not build" and its ignore-list names CSS consolidation and polish. I did a user's-eye review and three batches of fixes because I was asked to, and I should have said so before starting. Some of it is real value (a formula regression I caused, a dead-end upsell, sign-up errors, a traceback shown to beginners). Some of it (page-title scale, lesson typography) is polish that can wait.
3. **I created integration debt by not checking open PRs first.** #37 had already fixed `/challenges` and `/roadmap`; I fixed the first differently and edited the second. That is a process failure, not bad luck, and §6 fixes the process.

## 3. Who does what

| | Founder | Agent |
|---|---|---|
| **The gate** | Outreach every day, first. Calls. The yes. Approval path. The adult who can sign a pilot agreement (L1) | Nothing on the critical path is blocked on code. Prepare materials that make each conversation easier (A2). Weekly numbers (A7) |
| **Merging** | Clicks merge, in the order in §4 | Keeps each PR mergeable (conflicts, CI) so merging is a click, within the same day |
| **Production** | Creates the Supabase project; sets keys in Vercel (P1, P4, P5) | Tooling is done (`SUPABASE_SETUP.md`, `npm run supabase:check`). Runs the checks and reports once the project exists and the environment has access |
| **Decisions** | The five in §7 | Recommends, then implements the answer |

## 4. The agent work queue

Ordered by what it unblocks. **A0 and A1 are the only items on the critical path of "something reaches production before the freeze".**

| ID | Work | Why it matters to the gate | Done when | Blocked by | Size |
|---|---|---|---|---|---|
| **A0** | **Land #39, then #40.** Founder merges #39 (clean). Agent merges `master` into #40, resolves its 2 conflicts, confirms CI, the same day. Founder skims the "Before you merge" box on #40 and merges | Everything after this builds on current `master`; today three branches fork from it | `master` has #39 and #40; the tour-font follow-up (BV-T9) is done in the next PR | Founder merge | Founder 5 min; agent 30 min |
| **A1** | **Reconcile #37.** After A0, restart my branch from `master`, bring #37's two commits in, resolve the 12 conflicts in favor of #37's product decisions (free challenges, focused player, honest dashboard, `/roadmap` retired), delete my duplicates (the `PRO_SALES_OPEN` flag, the first-visit dashboard change, the roadmap contrast fix), and open one PR that supersedes #37 | #37 holds product decisions already logged and the first-paint fix that explains our lab LCP. It must not rot | One mergeable PR; #37 closed as superseded; decision-log row for the challenges call | A0 (**D1 decided 2026-10-07: free**) | Agent, about half a day |
| **A2** | **Printable leave-behind** for in-person asks (the sprint plan offered this "if you ask"): one Letter page, the pilot in six lines, a QR to `/pilot?src=leave_behind`, your contact | Walking into a classroom is the best channel; leaving something with a link and a QR turns a 2-minute chat into a visit to `/pilot` that the `?src=` records | `/pilot/leave-behind` prints on one page; a test checks the QR and the source tag | none | Agent, 2h. **In #40's branch today** |
| **A3** | **Smoke test as code. Public half done Oct 8 (`npm run smoke`, plan `2026-10-08-post-deploy-smoke.md`); the signed-in half waits on staging.** Turn `docs/gtm/smoke-test.md` into a Playwright spec that runs against a staging URL (`PLAYWRIGHT_BASE_URL`), so P6 is one command after every deploy, not 45 minutes by hand | The freeze is the last chance to catch a pilot-breaking bug; a repeatable test is how we know at 3 a.m. on a kickoff day | Spec passes against staging; the manual doc says "or run `npm run smoke`" | **Staging exists (founder: Supabase)** | Agent, half a day, once unblocked |
| **A4** | **Verify what #40 changed on the pilot path against a real backend.** #40 touched sign-up and sign-in validation, the session player (resume, retry cap), the mobile menu and lesson pages, all tested without a database | These are the surfaces a student hits in week 1. The unit and browser tests can't see a real sign-up | A3's spec plus the manual checks in the "Before you merge" box pass on staging | Staging | Folded into A3 |
| **A5** | **BV-T9:** point the demo tour's code font back at `var(--sl-font-code)` | Small follow-up that needs both #39 and #40 merged | Merged | A0 | 10 min |
| **A6** | **Staging seed script (Q16):** 10 fake students across 3 weeks so the scorecard and `/admin/metrics` can be rehearsed with real-looking data | A rehearsal with two accounts is too thin to trust the scorecard | Seed runs on staging; scorecard SQL returns plausible numbers | Staging; only if the founder wants it | Agent, 3h |
| **A7** | **Friday report:** run `npm run pipeline`, paste it into `weekly-scorecard.md`, list open PRs by age, CI state, and which P-items are done | A weekly number nobody had to ask for. It is how the founder sees the gate approaching | Posted every Friday, starting Oct 9 | none | Agent, 20 min a week |

### A1 dry run (Oct 7): what reconciling #37 will take

A trial merge of #37 onto #40 plus #39 (in a throwaway copy, nothing pushed) conflicts in **13 files, 27 hunks**. D1 is decided (free), so #37's product calls win everywhere they touch. Redo this on the real `master` once #40 merges; the list below is the checklist.

| File (hunks) | Resolution |
|---|---|
| `src/app/challenges/ChallengesClient.tsx` (5) | Take #37's. Delete `src/lib/proSales.ts` with it: those two are the only users of `PRO_SALES_OPEN` |
| `tests/challenges.spec.ts` (no conflict, but wrong after the above) | Rewrite for the free behaviour: Run works signed out, no "Unlock with Pro" anywhere |
| `src/app/dashboard/DashboardClient.tsx` (4) | Take #37's honest dashboard; drop my first-visit change and adapt or drop `tests/first-visit.spec.ts` |
| `src/app/roadmap/page.tsx` (modify/delete) | Delete it (#37 retires `/roadmap`); drop my contrast fix and `/roadmap` from the accessibility and phone route lists |
| `src/app/globals.css` (5), `src/app/pg-ch.css` (1), `src/app/learn/[sessionId]/session.module.css` (2) | Keep both: #37's removal of unused rules plus my type-scale and lesson-typography additions. Check `tests/fonts.spec.ts` and `tests/page-titles.spec.ts` afterwards |
| `src/app/layout.tsx` (2), `src/app/demo/page.tsx` (2), `src/app/demo/demo.module.css` (1), `src/app/teach/[id]/invite/KickoffLive.tsx` (2) | Keep both sides; the demo ones overlap with #39's kickoff panel and need a look in the browser |
| `tests/accessibility/core.spec.ts` (1), `tests/chromebook.spec.ts` (add/add) | Union of the route lists |
| `docs/gtm/decision-log.md` (1) | Keep both sets of rows |

Then: the full unit and browser suites, `npm run lhci`, and a look at `/challenges`, `/dashboard` and `/demo` at 375 and 1366px, before opening the one PR that supersedes #37.

### Parked until after the gate (each has a trigger)

| Parked | Trigger to resume |
|---|---|
| Rest of the type scale (45 font sizes, 414 small text elements), the player's visual layer, dark mode, sandbox preview (the remaining user's-eye review items) | Gate passes and a pilot is locked. Then they are post-freeze polish, and only blocking fixes land during the first cohort's week 1 |
| The order step (BV-P1) | W10 trigger in the roadmap |
| New lessons, session conversions, performance work, CSS consolidation | Sprint §8: not before Oct 16 |

## 5. Calendar

| Day | Founder (after the daily outreach action) | Agent |
|---|---|---|
| **Mon Oct 5** | Answer §7; create the Supabase project if you can | This plan; A2 (leave-behind); the "Before you merge" box on #40 |
| **Tue Oct 6** | Merge #39 | A0: update #40 against `master`, CI green |
| **Wed Oct 7** | Skim and merge #40; add the Supabase keys | A5; start A1 once #40 is in |
| **Thu Oct 8** | ~~Confirm D1 (challenges)~~ Done Oct 7: free | A1 PR open |
| **Fri Oct 9** | Merge the A1 PR; P6 smoke test on staging if it exists | A7 report #1; A3 spec if staging exists |
| **Sat–Sun Oct 10–11** | Rehearsal part 1 (sprint plan) | Fix whatever it finds within a day, as a small PR with a test |
| **Mon–Wed Oct 12–14** | Lock the yes (dates, rooms, rosters); rehearsal part 2 | Fixes; A6 if wanted |
| **Thu Oct 15** | Pre-gate check (sprint §7) | Confirm: all PRs merged, CI green on `master`, `npm run supabase:check` passes on production values |
| **Fri Oct 16** | **Gate.** Decision in `decision-log.md` | A7 report with the final numbers |
| **Oct 19–23** | Kickoff prep | Blocking fixes only. **Everything planned must be merged by Wed Oct 21**, leaving two days of buffer before the freeze |

## 6. How the agent works from here

1. **Check before building.** Open PRs, the decision log and the plans, every time, before starting anything. #37 is why.
2. **One theme per PR, and small.** Over about 25 files needs a reason (generated files, a codemod). #40 is 97 files because it grew in place; that is the failure to avoid.
3. **Nothing off the critical path before the gate without a line in `decision-log.md`** saying who asked and what it displaces.
4. **Every user-visible change has a test that fails without it,** and says what was *not* verified (no backend, no real device).
5. **Say what I got wrong, early.** Include it in the PR, not a footnote.
6. **Never present a guess as a fact.** Anything unverified is labelled, with where to check.
7. **Escalate, don't debug alone:** a migration error, a dashboard-only step, or a decision that changes a logged one goes to the founder with the exact error and a recommendation.

## 7. Decisions needed (with a recommendation)

| # | Question | Recommendation |
|---|---|---|
| **D1** | `/challenges`: **free for everyone** (#37, logged Sep 30) or **Pro hidden and paused** (#40)? | **Decided 2026-10-07: free** (#37). It's already in the decision log, it removes the dead end instead of explaining it, and "free for students" is the pricing story. Check Stripe for active Pro subscribers (#37's founder action) |
| **D2** | Merge order #39 → #40 → reconciled #37, with the follow-up PR from my restarted branch? | Yes. It is the order with the fewest conflicts |
| **D3** | Is about 12 hours a week real through Oct 16? | If it's about 8, keep outreach and drop P4 and P7 to after the gate (sprint Q4) |
| **D4** | Create the Supabase project this week? | Yes: P1 and P5 are on the gate checklist, and A3/A4 wait on it |
| **D5** | Where is outreach tracked? The repo's CRM shows 0 | If it's a spreadsheet or notes, paste the rows into `crm.csv` weekly, or tell me where to read them |

## 8. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| No leader says yes by Oct 16 | The main risk. Not an engineering risk | The sprint plan's Plan B (a Cohort 0 sponsored by a teacher) and §6 "if you fall behind" |
| A big PR merges with a regression on the pilot path (sign-up, sessions) | Medium: #40 touched them, tested without a backend | A3/A4 on staging before the freeze; the "Before you merge" checklist; every change is its own revertable commit |
| #37 reconciliation drags | Medium: 12 conflicts and product decisions | Start right after A0; D1 answered by Thu |
| Staging isn't created in time | Depends on D4 | A3 and A4 slip; the manual P6 remains the fallback |
| Review bandwidth: one person, three PRs | High | A0 is a click for #39 and a skim for #40; no new PRs open until the queue is empty |

## 9. What this plan is not

It is not a product roadmap (that is `2026-10-02-best-version-roadmap.md`, parked until the gate), and it does not replace the founder's daily outreach, which this whole window exists to protect.
