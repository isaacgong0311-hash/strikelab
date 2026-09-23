# StrikeLab Master Plan: Pilot OS → Five Pilots → Paid Proof → YC

**Date:** 2026-09-22 (runway week 2 of 32)
**Status:** Draft for founder review
**Horizon:** 2026-09-21 → 2027-04-25 (runway weeks 2–32)
**Supersedes:** the *sequencing* in every earlier plan. The detailed specs stay authoritative for *how* each piece works:

| Doc | Role after this plan |
|---|---|
| `specs/2026-09-13-strikelab-yc-company-design.md` | Strategy, proof thresholds, stop/go gates. **Unchanged, and this plan implements it.** |
| `plans/2026-09-13-cohort-launch-foundation.md` | Done (commit `7cfdafe`). Reference only. |
| `plans/2026-09-14-cohort-student-experience.md` | Task-level detail for Workstream A. Migration numbers corrected below (§12). |
| `plans/2026-09-16-duolingo-grade-product-plan.md` | Task-level detail for Workstream B, **re-sequenced** here so that it serves the pilots rather than running ahead of them. |
| `docs/gtm/*` | The instruments Workstreams F and G use every week. |
| `strikelab-runway.html` | Checkbox view of the same 32 weeks. |

---

## 1. What winning looks like

The YC strategy defines success as evidence, not features. By **2027-04-25** StrikeLab should be able to put this table in front of a partner:

| Proof | Threshold (from strategy §4) | Measured from |
|---|---|---|
| Cohorts completed | ≥ 5 | `classes.template_id` + end date |
| Students activated | ≥ 50 total | `lesson_completions` (server-timestamped) |
| Enrolled → activated | ≥ 60% | same |
| Activated → week-4 retained | ≥ 40% | same |
| Activated → capstone submitted | ≥ 35% | `capstone_submissions` |
| Leaders who'll run it again | ≥ 4 of 5 | end-of-pilot interview (human record) |
| Qualified leader referrals | ≥ 3 | CRM `referral_from` |
| Paying or dated, priced commitments | ≥ 2 orgs | Stripe / signed note |
| Outcomes by cohort and source | yes | scorecard + CSV |

**One sentence:** StrikeLab gives ambitious high-school clubs a ready-to-run technical-finance lab where students learn by coding real market models and finish with work they can show.

---

## 2. Honest status as of 2026-09-22

### Shipped
- 23 lessons, Pyodide exercises, interactive tools, paper-trading sandbox, XP/streaks/achievements, certificates, challenges, auth, Stripe plumbing, AI tutor with atomic quotas.
- Teacher side: classes, join codes, roster with CSV export, lesson assignments with completion, and **cohort launch** (fixed six-week template, `launch_cohort` RPC, teacher panel).
- Polish floor (Duolingo Phase 0): the reveal bug is fixed, streaks follow the learner's local day on both client and server, public counts come from `TRACKS`, and there's a student-first UI system with an axe suite.
- Bite-sized sessions (Duolingo Phase 1, two slices): engine, player, content lint, `inv-1` and `inv-2` converted, path rings, and Supabase sync of session results (branch `feat/session-sync`, **not merged yet**).

### Not shipped, and the pilots can't run without it
This is the critical finding of this review. **The pilot operating system from the 2026-09-14 plan hasn't been started.** Recent effort went into Duolingo polish, which the strategy ranks below measurability.

| Missing | Why a pilot needs it |
|---|---|
| `lesson_completions` with server timestamps | Activation and retention can't be measured at all without it. It's the whole point of the pilots. |
| Student cohort home | A student who joins lands on a generic dashboard with no "this week" or next action. |
| Instructor scorecard + cohort CSV | Leader reuse depends on the leader seeing outcomes. |
| Synced exercise code | Code lives in `localStorage` (`LessonClient.tsx:36`), so a student who switches from a school Chromebook to home loses their work. |
| Capstone | Needed by cohort week 6, and it's the artifact the whole thesis rests on. |
| End-to-end cohort rehearsal | Nobody has run the teacher → student → scorecard journey. |

### Three design problems found in this review
1. **Client progress writes bypass the API route.** The 2026-09-14 plan records completions in `POST /api/progress`, but `useProgress.markComplete` upserts the `progress` row directly from the browser (`src/lib/useProgress.ts`). Completions recorded only in the route would miss almost every real completion. **Fix:** a Postgres trigger on `progress` that diffs `completed` arrays and inserts `lesson_completions` rows with `now()`. It's server-timestamped, covers every write path, and doesn't need an extra client call (§A1).
2. **Holidays break the contiguous schedule.** `buildCohortSchedule` assumes six consecutive weeks. A cohort starting late October runs into Thanksgiving (Nov 23–29), which would make every later due date and "week N active" wrong. **Fix:** skip-weeks in the template and RPC (§A7).
3. **Migration numbers collide.** `0013` was planned for `lesson_completions` but shipped as `progress_timezone`, and `0014` is now `session_completions`. The ledger in §12 renumbers everything that's still planned.

### Operational debt
- Migrations 0013 and 0014 haven't been applied in production. Every box on `docs/gtm/production-readiness-checklist.md` is unchecked. The baseline is unfilled.
- Stripe webhook event ordering (money-paths audit, Sprint 1.2) and the certificate `23505` → 500 (Sprint 1.1b) are open.
- `/challenges` fails the axe suite on master (`listitem`), and a spawned task is queued for it.
- Playwright doesn't run in CI (`.github/workflows/ci.yml` runs lint, test and build only).
- The CRM and interview log hold only `EXAMPLE` rows: **zero real pilot conversations so far.**

---

## 3. Operating principles

1. **The pilot is the product.** Any task that doesn't make a named pilot run, get measured, or convert waits. When unsure, ask: *does this move activation, week-4 retention, capstone completion, leader reuse, or paid proof?*
2. **Just-in-time engineering.** Build each capability *before the first cohort needs it*, not all of it before launch. The capstone has to exist by cohort week 5, not by kickoff (§4).
3. **Founder hours are the scarce resource.** At 10–15 h/week: 4–5 h GTM, 4–5 h product, 2 h pilot support, 1 h review. Coding agents (Claude Code / Codex) do most implementation. **The founder's product hours go to review, rehearsal and decisions, not typing.** Each engineering task below lists agent build time and founder review time separately.
4. **Evidence over polish.** A task is done when its metric can be read, not when it looks good.
5. **Progressive enhancement** (global CLAUDE.md). Content renders with JS and animation stripped out, and celebrations only add to a state that's already complete.
6. **Private by default, minors first.** 13+ only, nothing public without explicit and reversible opt-in, no loss-aversion dark patterns, sound off, quiet hours.
7. **Free by default.** Every paid item is flagged in §10.
8. **Write decisions down.** Real decisions go to `docs/gtm/decision-log.md`, plan status goes in these docs, and there's one branch per task with a PR. Nothing important lives only in chat.

---

## 4. The calendar

Week 1 = Mon 2026-09-14. **School calendars vary**, so confirm each partner school's holidays at kickoff. The dates below assume a typical Central Texas calendar.

### Just-in-time build order for the first cohorts (start ≈ Oct 26–Nov 2)

| Needed by | Capability | Workstream task |
|---|---|---|
| Before any real student joins (wk 6) | Server-timestamped completions, cohort home, join → cohort landing, skip-weeks, scorecard v1, prod readiness, RLS verified | A1, A3, A4, A7, D1–D3 |
| Cohort week 1 | `inv-5` in sessions (week 1 = inv-1, inv-2, inv-5) | B1 |
| Cohort week 3 (Black-Scholes code) | Synced exercise code across devices | A2 |
| Cohort week 4 | "Students needing help" list working from real data | A4 |
| Cohort week 5 | Capstone submit, instructor view, share/revoke | A5 |
| Cohort week 6 + 7 days | Program-completed metric, cohort CSV v2, pilot report template | A4, G6 |

### Week-by-week

| Wk | Dates | Phase | Engineering (agent-built, founder-reviewed) | GTM / pilots (founder) | Ops, trust, legal | Milestone / gate |
|---|---|---|---|---|---|---|
| 2 | Sep 21–27 | 0 close-out | Merge `feat/session-sync`; A1 `lesson_completions` trigger; fix `/challenges` axe | Build target list (F1, 60 orgs); first 15 outreach emails; replace CRM examples | D1 prod readiness pass; apply 0013–0015; fill baseline | Baseline recorded |
| 3 | Sep 28–Oct 4 | 1 Pilot OS | A3 cohort home + join landing; A7 skip-weeks | +15 outreach; 3 leader calls; kickoff interview script ready | E1 data map; E2 retention schedule | ≥ 3 leader conversations logged |
| 4 | Oct 5–11 | 1 | A4 scorecard v1 + cohort CSV; C1 event taxonomy + PostHog | +15 outreach; 3–4 calls; pilot agreement draft from checklist | D4 Stripe ordering fix; D5 cert race fix | ≥ 1 verbal pilot yes |
| 5 | Oct 12–18 | 1 | A2 synced exercise code; B1 `inv-5` sessions; A6 automated e2e journey | Follow-ups; lock 2 pilot start dates; school approval requests out | E3 privacy page + subprocessors; E5 deletion flow verified | 2 start dates on calendar |
| 6 | Oct 19–25 | 1 | A6 manual rehearsal (6 simulated weeks with test accounts); bug-fix only; **code freeze Friday** | Kickoff logistics; send facilitator guide; confirm rosters | D6 Playwright in CI; D7 uptime + alert test | **Gate W6: pilot-readiness (§6)** |
| 7 | Oct 26–Nov 1 | 2 Design partners | A5 capstone (build) | **Cohort A kickoff**; kickoff interviews; observe session 1 | Incident runbook (D8) | Cohort A live |
| 8 | Nov 2–8 | 2 | A5 capstone (review + ship); fix #1 funnel issue | **Cohort B kickoff**; weekly check-ins start | — | Both cohorts live |
| 9 | Nov 9–15 | 2 | Fix largest measured bottleneck only | Student interviews (≥ 2 per cohort); keep outreach at 5/wk for spring | — | First scorecard with real activation |
| 10 | Nov 16–22 | 2 | Bottleneck fix; B2 convert the next pilot lesson if sessions are winning | Check-ins; capstone briefing to leaders | — | Capstone live before cohort wk 5 |
| 11 | Nov 23–29 | 2 | Light week (Thanksgiving skip week) | Spring-pilot outreach push: teachers plan January now | — | — |
| 12 | Nov 30–Dec 6 | 2 | Bottleneck fix; pilot-report tooling (G6) | Cohort A capstone week; observe presentations | — | First capstones submitted |
| 13 | Dec 7–13 | 2 | Bottleneck fix | Cohort B capstone week; end-of-pilot interviews A | — | — |
| 14 | Dec 14–20 | 2 | — | End-of-pilot interviews B; pilot reports A+B | — | **Gate W14 (§6)** |
| 15–16 | Dec 21–Jan 3 | Break | Program revision from pilot reports; B/C items the evidence justifies (reminders, review queue, etc.) | Light outreach; confirm 3 spring leaders | Refresh the legal/DPA pack | Revised program v2 frozen by Jan 3 |
| 17 | Jan 4–10 | 3 Repeat pilots | Rehearse v2 with test accounts | Kickoff prep ×3; referral asks | — | 3 start dates locked |
| 18–20 | Jan 11–31 | 3 | Bottleneck fixes; reduce founder rescue work | **Cohorts C, D, E kick off** (staggered a week apart) | — | 5 cohorts total started |
| 21–23 | Feb 1–21 | 3 | Bottleneck fixes; case-study page (H4) | Check-ins; student interviews; next-term pipeline (≥ 10 qualified) | Consent collection for testimonials | — |
| 24 | Feb 22–28 | 3 | — | End-of-pilot interviews; combined report | — | **Gate W24 (§6)** |
| 25–28 | Mar 1–28 | 4 Paid proof | Only what a paying buyer needs (invoice, seat list, school-tier provisioning by hand) | Renewal and paid asks to all 5; new orgs at list price; manual invoices | DPA signatures where schools require them | ≥ 2 paid/committed |
| 29–32 | Mar 29–Apr 25 | 4 YC | Demo polish on the real journey; demo video | YC packet (I1–I8); apply | Cap table / legal facts check | **Application submitted** |

**Check the YC deadline for the batch you're targeting at ycombinator.com/apply when Phase 4 starts. Don't plan around a remembered date.** If the proof exists earlier, apply earlier. If it doesn't exist by week 32, don't apply on narrative alone (strategy §7).

---

## 5. Workstreams

Estimates are **agent build hours / founder review hours**. `F` = founder-only (outreach, dashboards, legal, decisions). Every engineering task ends with `npm run lint && npm test && npm run build`, the relevant Playwright spec, a plan-doc checkbox update and a PR.

### Workstream A: Pilot operating system (critical path)

**A1. Server-timestamped lesson completions** · wk 2 · 3h / 1h
- Migration `0016_lesson_completions.sql` (shipped): `lesson_completions(user_id, lesson_id, completed_at default now(), primary key(user_id, lesson_id))`.
- An `after insert or update of completed on progress` trigger (`security definer`, fixed `search_path`) inserts one row per lesson id that's in `new.completed` and wasn't in `old.completed`, `on conflict do nothing`. The timestamp comes from the DB clock, never the client.
- RLS: the owner reads their own rows. The teacher of a class the student belongs to reads rows through a `class_members` + `classes.teacher_id` join, mirroring the roster policy.
- **No backfill with invented timestamps.** Historical completions stay only in the aggregate array (strategy §3).
- Tests: SQL behavior checked through a local Supabase or a documented manual script. A unit test covers the TS reader.
- Acceptance: completing a lesson signed-in (via the long-form page *and* via the last session) creates exactly one row. Re-completing or merging devices never moves `completed_at`.
- Note: the client can still forge a completion by writing `progress.completed`. That's acceptable for free pilots and gets written down as a known limitation. Revisit before any credential has stakes.

**A2. Synced exercise code** · wk 5 · 5h / 1.5h
- Migration `0018_lesson_submissions.sql` follows the 2026-09-14 plan, Task 2.
- `LessonClient` loads cloud code first when signed in, falls back to local, then to the starter code. Saves are debounced about 3s and show an inline "Saved · Not saved, retrying" status, and local edits are never dropped when the network fails.
- `last_passed_at` is set when tests pass, which gives the scorecard a "code passing" column.
- Acceptance: write code on device A, open on device B and see it. Offline edits survive a reload.

**A3. Student cohort home** · wk 3 · 5h / 1.5h
- `/cohort/[classId]`, server-rendered: current week title, this week's lessons with done marks (from `lesson_completions`), due date, **one next-action button**, and a link to the capstone once cohort week 5 opens.
- The next action prefers the bite-sized session when one exists (`resumeSession`), otherwise the long-form lesson.
- The join flow (`/api/classes/join`) lands a cohort member here, and the dashboard shows a "Your cohort" card linking to it.
- Empty, loading and error states are designed (B5), and it has an axe test.
- Acceptance: a student who joins from a code on a phone is one tap from their first lesson.

**A4. Instructor scorecard + cohort CSV** · wk 4 (v1), wk 12 (v2) · 6h / 2h · **v1 shipped 2026-09-22** (`src/lib/cohorts/metrics.ts`, formula-safe CSV)
- `src/lib/cohorts/metrics.ts`: a pure `computeCohortMetrics` exactly per `docs/gtm/metric-glossary.md`, with boundary tests (late joiner, active in week 2 but not week 4, skip weeks).
- The roster route returns only aggregates computed on the server.
- The scorecard shows enrolled, activated %, active this week, week-4 retained %, capstones, and **students needing help** (overdue work and no activity in 7 days).
- v2 adds program-completed, the capstone column and code-passing to the cohort CSV.
- Acceptance: numbers match a hand count on the rehearsal cohort.

**A5. Private-by-default capstone** · wk 7–8 · 8h / 3h
- Migration `0019_capstone_submissions.sql` follows the 2026-09-14 plan, Task 5, plus `updated_at` and draft/submitted status (students iterate).
- The form has title, thesis, code (pre-filled from their Pyodide workspace), result summary, optional chart image and reflection. Autosave drafts.
- There's an instructor view. Opening a student's capstone is an explicit action and gets logged.
- Share: explicit opt-in creates an unlisted token, and revoking it 404s immediately. A student under 18 sees copy suggesting they check with a parent or guardian before sharing (E4).
- Acceptance: the tests in the 2026-09-14 plan, plus revocation verified end-to-end in Playwright.

**A6. Cohort journey coverage + rehearsal** · wk 5–6 · 4h / 4h
- Automated: teacher launches, student joins, completes week 1, is activated, reaches week 4 (time travel by launching with a past `starts_on`), submits a capstone, and the scorecard and CSV reflect all of it.
- Manual: two real accounts (teacher + student) on a **non-prod** Supabase project, walked through all six weeks with the facilitator guide open. Log every rough edge as an issue, and fix only the ones that block.

**A7. Skip weeks (holidays)** · wk 3 · 3h / 1h
- The template and `launch_cohort` accept `skip_weeks: string[]` (Mondays). The schedule, due dates, "current week" and the week-N metric windows all skip them.
- The teacher panel shows a "Skip a week" control at launch and while the cohort is running (recompute future due dates only).
- Acceptance: a cohort starting Oct 26 with Nov 23 skipped ends the week of Dec 7, and the metrics treat Nov 30 as week 5.

**A8. Join-flow and onboarding friction** · wk 5 · 2h / 1h
- Join by link (`/join/CODE`) without typing the code, and sign-up keeps the pending join through auth (including after email confirmation). Measure join → first lesson started.
- The first-run screen for a cohort student is three lines: what this is, what's due this week, Start.

**A9. Leader tools that remove founder rescue work** · wk 17 · 4h / 1h
- A printable weekly agenda from the facilitator guide per cohort week, a copy-paste "this week" message for the leader to send students, and a one-click "nudge inactive students" email draft (a mailto link, no sending infrastructure needed yet).

### Workstream B: Learning experience (Duolingo plan, re-sequenced)

**B0. Merge the session sync slice** · wk 2 · 0h / 0.5h. PR from `feat/session-sync`, then apply migration 0014.

**B1. `inv-5` in sessions** · wk 5 · 3h / 1h. This completes cohort week 1 in the bite-sized format, which is where activation is won or lost.

**B2. Further conversions, only if sessions are winning.** Decide at week 10 by comparing session completion against long-form completion for the week 1 lessons. If sessions win, convert `1` and `2` (cohort week 2) for the spring cohorts during winter break. If they don't, stop converting and put that time into A and G. **Budget: 2–3h per lesson including answer verification.**

**B3. New step kinds.** Only `slider-target` has a pilot case (Black-Scholes intuition, cohort week 3). `order`, `predict-chart` and `code` wait until after week 24.

**B4. Session-level teacher signal.** Add an instructor read policy on `session_completions`, and put per-session first-try accuracy in the scorecard ("hardest session this week" becomes the discussion prompt). Winter break, if pilot leaders asked for it.

**B5. Loading, empty and error state audit** · wk 3–5, alongside A3/A4. Every new cohort surface ships with its states designed. Legacy routes wait.

**B6. Habit loop (Duolingo Phase 2).** **Only if week-4 retention in pilots A/B is under 40%** and interviews point at forgetting rather than value, pacing or accountability:
- the email "this week's work is due Friday" reminder (Resend free tier, Vercel Cron, quiet hours, one-click unsubscribe), sent to cohort students only;
- the daily goal ring and streak freeze.
- Build it during winter break for the spring cohorts.

**B7. Review queue / practice (Duolingo Phase 3).** Post-gate by default. Pull it forward only if leaders report that students forget earlier weeks by the capstone.

**B8. Brand and craft pass (Duolingo Phase 5).** Post-gate, except the performance budget: `/cohort/*` and `/learn/*` need LCP under 2.0s on mobile 4G before the first kickoff, because Chromebooks and phones are the real devices.

### Workstream C: Measurement

**C1. Event taxonomy + product analytics** · wk 4 · 3h / 1h
- Write the taxonomy into `docs/gtm/metric-glossary.md`: `join_started`, `join_completed`, `cohort_home_viewed`, `lesson_started`, `session_start`, `step_answered{kind,correct}`, `session_complete{accuracy,duration}`, `lesson_completed`, `code_run{passed}`, `capstone_draft_saved`, `capstone_submitted`, `share_link_created/revoked`.
- PostHog free tier (1M events/month), identified by Supabase user id, with cohort id and `src` as properties. **Session replay, autocapture of inputs and code content stay off. No names, no emails.** Check its privacy terms against E3 before enabling.
- If PostHog feels heavy, Vercel Analytics custom events are enough for pilots, because the metrics that count come from Postgres (C2), not analytics.

**C2. Source-of-truth metrics in SQL** · wk 4 · 2h / 0.5h
- `scripts/metrics/*.sql`: saved queries for every scorecard row and every baseline row. The Monday review runs these instead of eyeballing dashboards. Numbers pasted into `weekly-scorecard.md` must come from these queries.

**C3. Weekly scorecard ritual** · every Monday, 30 min, F. Run C2, paste into the scorecard, name the single biggest bottleneck, pick one change, and log any decision.

**C4. Funnel view** · wk 9. Visitor → join → first step → first session/lesson → activated → week 4 → capstone, split by cohort and source.

**C5. Feature flags** · as needed. An env or DB-row flag per cohort for the session player and reminders, so a struggling cohort can fall back to the long-form lessons.

### Workstream D: Reliability, security, operations

| # | Task | When | Est. | Owner |
|---|---|---|---|---|
| D1 | Walk `production-readiness-checklist.md` end to end; fill `baseline-template.md` | wk 2 | 2h | F |
| D2 | Apply migrations 0013, 0014, 0015 in prod, then each new one before its feature deploys. Keep a ledger (§12) | ongoing | — | F |
| D3 | RLS verification: a scripted check that student B can't read A's progress, completions, submissions or capstone, and a teacher can't read a non-member. Run it against non-prod before each migration | wk 5 | 3h / 1h | A |
| D4 | Stripe webhook ordering: store `event.created` / subscription `current_period` and reject stale updates (money-paths Sprint 1.2) | wk 4 | 2h / 0.5h | A |
| D5 | Certificate `23505` returns the existing id instead of a 500 (Sprint 1.1b) | wk 4 | 0.5h | A |
| D6 | Playwright (session, reveal, a11y, cohort journey) runs in CI on PRs. Free on GitHub Actions for public repos; within the free minutes for private | wk 6 | 2h / 0.5h | A |
| D7 | Uptime monitor on `/`, `/cohort/*` and `/api/progress` with a free-tier monitor, plus a Sentry test error and Discord ops alert confirmed | wk 6 | 1h | F |
| D8 | Incident runbook in `docs/gtm/incident-runbook.md`: who to tell (leader within 24h if student data is involved), how to roll back (Vercel instant rollback), how to disable a feature (C5) | wk 7 | 1h | A+F |
| D9 | Supabase backups: confirm what the free tier keeps. Weekly manual `pg_dump` of pilot tables to an encrypted local drive during pilots | wk 6 | 1h | F |
| D10 | Concurrency tests for the atomic RPCs (money-paths item 3) | post-gate | 3h | A |
| D11 | Pre-pilot security review: `/security-review` on the cohort branch, rate limits on join and capstone endpoints | wk 6 | 2h / 1h | A |

### Workstream E: Trust, privacy, legal

The goal is to be credible to a teacher and an assistant principal, not compliant on paper. **None of this is legal advice.**

| # | Task | When | Owner |
|---|---|---|---|
| E1 | Data map: every table, which fields are PII, who can read it (RLS), retention. One page in `docs/trust/data-map.md` | wk 3 | A drafts, F reviews |
| E2 | Retention schedule: e.g. pilot data kept 12 months after the cohort ends unless the school asks otherwise, and deletion within 30 days of a request | wk 3 | F decides |
| E3 | Privacy page and subprocessor list (Supabase, Vercel, Sentry, Groq, Stripe, PostHog if adopted, Resend if adopted) match reality | wk 5 | A drafts, F approves |
| E4 | Minor-safe sharing: capstone share needs explicit opt-in with guardian-check copy, is revocable, and has no public names or leaderboards by default | with A5 | A |
| E5 | Account deletion really deletes (progress, completions, submissions, capstones, class memberships), and it's tested | wk 5 | A |
| E6 | Pilot agreement from `pilot-agreement-checklist.md`. **First ask whether the school has its own DPA or uses the Student Data Privacy Consortium's standard agreement; signing theirs is usually easier than bringing your own** | wk 4–6 | F |
| E7 | Qualified legal review before any *paid* school contract (§10) | wk 24–26 | F |
| E8 | Testimonial and case-study consent form (student + guardian for under-18s, plus the leader) | wk 12 | F |

### Workstream F: Go-to-market

**Funnel math** (strategy decision rule): about 100 qualified contacts → about 20 leader conversations → 5 pilots. For this to hold by week 6 for two pilots and week 17 for three more, keep **≥ 15 contacts/week in weeks 2–5**, then ≥ 5/week.

**F1. Target list** · wk 2 · 3h F
- Sources, in order: the founder's own school and district; nearby districts' club directories (math, CS, investing, economics, DECA, FBLA, Science Olympiad, Math Club/MAO, robotics); the teachers of AP CS, AP Stats, AP Macro and personal finance; and local chapters of national orgs.
- 60 organizations into `crm.csv` with segment, source and a named leader. Delete the `EXAMPLE` rows.

**F2. Outreach system** · wk 2 onward
- Channels: warm intros first (own teachers → their colleagues), then personalized email, then in person at club fairs.
- Template: the one-pager (`pilot-one-pager.md`), three sentences plus the ask ("15 minutes to show you a six-week program your club can run with zero prep"), and a follow-up at days 3 and 7.
- Track every touch in the CRM the same day.

**F3. Leader conversation script** · wk 3
- Discovery first: current club format, what students want to show colleges, time available, who approves tools.
- Demo second: the cohort launch in 60 seconds, the student home, one session.
- Close: a proposed start date and a named approval step.
- Log it in `interview-log.csv` with a pain score.

**F4. Objection library** · living doc
- "No time": 45 minutes a week, and the guide is scripted.
- "Approval": the school's DPA plus the data map.
- "Students aren't coders": week 1 has no code, and the Python is scaffolded.
- "Cost": free for the pilot, list price stated up front so there are no surprises.

**F5. Pricing and the paid ask** · wk 24–28
- Stated from day 1: pilots are free, then $499/yr per school instructor and $199/yr per independent club.
- The ask comes in the end-of-pilot interview with a dated, priced next-term commitment. Invoices are manual (Stripe invoice or a school PO), with no seat automation until ≥ 2 paying.
- Budget timing matters: school purchasing for next year often happens in spring, so ask by March.

**F6. Referral loop.** Every end-of-pilot interview ends with "Who else should run this?" Log it in `referral_from`, and ask within 48 hours while it's fresh.

**F7. Spring pipeline.** From week 9, keep ≥ 10 qualified contacts warm for January starts. Teachers plan spring clubs in December.

### Workstream G: Pilot operations

**G1. Per-cohort runbook** (put it in `docs/gtm/pilot-runbook.md`):

| When | Step |
|---|---|
| T-14 days | Agreement or approval done; start date and skip weeks set; leader has the facilitator guide; roster size estimate in the CRM |
| T-7 | Launch the cohort (A7 skip weeks included); test the join link on a school device *and* network (filters block things); send the leader the "week 1" message |
| T-0 | Kickoff (founder present); students join in the room; everyone completes the first session together, **so activation happens in the room** |
| Weekly | 10-minute leader check-in (same day each week); scorecard reviewed; students-needing-help list sent to the leader |
| Cohort wk 2 & 4 | Interview 2–3 students (15 minutes, consented) |
| Cohort wk 5 | Capstone briefing; examples of a good capstone (founder-made) |
| Cohort wk 6 | Presentations observed; capstones submitted |
| T+7 | Program-completed metric final; end-of-pilot leader interview (reuse, pay, refer) |
| T+14 | Pilot report written (G6); decision-log entries; thank-you plus referral ask |

**G2. Kickoff kit:** slides (a Slides artifact or Google Slides), a join-code card, a one-page "what is this" for parents, and a Chromebook/network test checklist.

**G3. Support SLA:** reply to the leader within 24h on school days. Log every support request (it's a signal for A9).

**G4. Observation notes:** during meetings, log confusion points by lesson and step id, which links directly to B2/B7 decisions.

**G5. Facilitator guide v2:** revise after pilots A/B from observation notes, before the spring cohorts.

**G6. Pilot report template:** enrollment, activation, week-4, capstone, support load in hours, the top 3 failures, the exact next changes, and quotes (consented).

### Workstream H: Public narrative and site

- **H1** (wk 2–3): an accuracy pass on `/for-schools`, `/for-teachers`, `/pricing`, `/roadmap`, `/faq` and the README against what's actually shipped. Remove anything that promises what doesn't exist. Add the pilot offer.
- **H2** (wk 4): a `/pilot` page with the one-pager as a page and a "Start a pilot" contact route (mailto is fine). Tracked with `?src=`.
- **H3** (wk 6): a 90-second demo video of the real teacher → student journey, reusing `demo-video/` tooling. It works for outreach now and for YC later.
- **H4** (wk 21–23): case study and anonymized outcomes page (consent per E8).
- **Don't:** blog volume, SEO campaigns, social growth pushes before week 24. The channel is direct outreach.

### Workstream I: YC application packet (weeks 29–32)

| # | Item |
|---|---|
| I1 | One-sentence description (§1) and a 50-word version |
| I2 | Metrics table (§1) generated from C2 queries, with cohort-level detail |
| I3 | 2-minute demo video of the real product (H3 updated) |
| I4 | Founder video: specific achievements, why this founder, one real insight from the pilots |
| I5 | 3–5 consented leader and student quotes; one capstone example |
| I6 | Competition and "why now": code-first and inspectable work versus simulators and financial-literacy curricula |
| I7 | Expansion thesis: clubs → schools → technical-finance talent pipeline, *stated as earned by pilots, not assumed* |
| I8 | An honest answer on commitment and school status, legal and cap-table facts. No overclaiming about full-time availability |

### Workstream J: Founder operating system

- **Monday (1h):** C3 scorecard, bottleneck, this week's 3 commitments (1 GTM, 1 product, 1 pilot/ops).
- **Friday (15 min):** check off tasks here, log decisions, and send one line to the next week's self in the scorecard.
- **Agent workflow:** each task becomes a branch and a PR, with the plan doc path in the prompt. Agents update checkboxes here, a coding session never ends without lint, test and build passing, and it never merges without founder review.
- **Protect school:** if a week has exams, drop product work first and keep outreach and pilot support. A pilot missed because of an exam is fine; a leader left without replies is not.
- **Time log:** a rough hours split in the scorecard each week, so the 4–5 / 4–5 / 2 / 1 split stays honest.

---

## 6. Decision gates

| Gate | When | Pass criteria | If it fails |
|---|---|---|---|
| **W6 Pilot readiness** | Oct 25 | A1, A3, A4 v1, A6, A7, A8, B1, D1–D3, D6, D11 done; rehearsal passes; ≥ 1 signed or approved pilot with a date | Slip the kickoff one week (never launch without A1: unmeasured pilots waste the pilot). If no pilot is committed, move product hours to outreach |
| **W10 Format check** | Nov 22 | Session vs long-form completion compared for week-1 lessons | Stop B2 conversions if sessions don't outperform |
| **W14 Continue** (strategy §7) | Dec 20 | ≥ 1 of cohorts A/B hits activation ≥ 60% *and* week-4 ≥ 40%, **or** interviews name a specific, testable fix | Pause new pilots; run a 2-week fix cycle on the named constraint; re-pitch the segment if leader interest is weak |
| **W24 Paid conversion** | Feb 28 | ≥ 4 leaders want to repeat; combined cohorts clear retention | Don't ask for money on weak outcomes; fix the value problem first. If outcomes are strong but pay is weak, test parent- or sponsor-funded access as a new design cycle |
| **W32 Apply** | Apr 25 | Proof table (§1) mostly met, with honest gaps named | Keep running pilots; apply to the next batch with better numbers |

**Decision rules** (strategy §4) for any weekly bottleneck: low activation means fix joining and the first session (A8, B1, G1 T-0). Low week-4 means fix pacing and accountability (A7, A9, G1 weekly). Strong student use with weak leader reuse means reduce instructor burden (A4, A9). Good pilots with no payment means change the buyer, offer or price.

---

## 7. Metric tree

```
Paid proof (≥2 orgs)
└─ Leader reuse (≥4/5) ← scorecard visibility (A4), low burden (A9, G3)
   └─ Student outcomes
      ├─ Activation ≥60%      ← join friction (A8), first session in the room (G1), inv-1/2/5 sessions (B1)
      ├─ Week-4 retention ≥40% ← schedule fit (A7), weekly nudges (A9/B6), cohort home next action (A3)
      └─ Capstone ≥35%        ← synced code (A2), capstone flow (A5), examples + briefing (G1)
Pipeline (100 → 20 → 5)       ← target list (F1), outreach cadence (F2), referrals (F6)
```

Leading indicators to watch weekly: join → first lesson started within 24h, first-session completion rate, median session length, students-needing-help count, and support hours per cohort.

---

## 8. Risk register

| Risk | Likelihood | Impact | Mitigation | Early signal |
|---|---|---|---|---|
| No leader commits by week 6 | Med-High | Critical | Start outreach this week; warm intros; lower the ask (one meeting a week, founder runs kickoff) | < 5 conversations by wk 4 |
| Founder time squeezed by school | High | High | Agents build; the founder reviews; cut product before GTM; the exam-week rule (J) | Scorecard hours < 8/wk two weeks in a row |
| School blocks the tool (network filter, approval) | Med | High | Test on a school device at T-7; school DPA path (E6); data map ready | IT asks for a DPA |
| Activation measured wrong | Med | Critical | A1 trigger + A4 boundary tests + a hand count during rehearsal | Scorecard ≠ hand count |
| Students lose code across devices | High until A2 | Med | A2 before cohort week 3 | Support requests |
| Holiday breaks distort metrics | High | Med | A7 skip weeks | Due dates on break weeks |
| Scope creep into Duolingo polish or curriculum | High (it already happened) | High | This plan's gates; a feature needs a named pilot problem | Branches without a pilot reason |
| Privacy incident with minors' data | Low | Critical | Private by default, RLS checks (D3), runbook (D8), minimal PII | Any RLS test failure |
| Stripe or billing edge case at paid conversion | Low | Med | D4; manual invoicing for the first customers | — |
| Pilots succeed but nobody pays | Med | High | State the price up front; ask for a dated commitment; spring budget timing; parent/sponsor fallback | Leaders dodge the price question |
| Single-founder bus factor | Med | Med | Everything in the repo and docs; runbooks; no knowledge that lives only in chat | — |

---

## 9. Explicitly not doing (until the five-pilot gate)

This is the strategy §6 list, plus the Duolingo deferrals. Each has an **unlock condition**:

| Deferred | Unlocks when |
|---|---|
| New tracks (VaR, GARCH, Monte Carlo, interview prep, personal finance) | ≥ 2 paying orgs ask for the same content |
| Real-time market data, multi-asset | A pilot capstone needs it *and* free data suffices |
| Native mobile/desktop (Capacitor/Electron) | PWA install rate proves demand and push is needed |
| LMS/SIS integrations, SSO, district admin | A paying district requires it contractually |
| Talent marketplace, employer dashboard | ≥ 100 capstones, and employers ask |
| AI personalization, automated grading, new chat features | Teachers name grading time as the #1 burden |
| Leagues, public leaderboards, mascot, hearts/gems | Never public for minors by default; revisit cohort-scoped boards post-gate |
| National competition | Existing challenges are used by ≥ 3 cohorts unprompted |
| Converting all 23 lessons to sessions | W10 check says sessions win *and* pilots are covered |

---

## 10. Budget

Everything runs on free tiers unless listed here.

| Item | Cost | Needed when | Free alternative |
|---|---|---|---|
| Domain renewal (strikelab.dev) | ~$10–20/yr | yearly | — |
| Legal review of the paid-school contract and privacy terms | **Paid**: varies widely, often hundreds to low thousands | before the first *paid* contract (wk 24–26) | School's own DPA or a standard state/SDPC agreement; university law-clinic or startup legal clinics; defer until money is on the table |
| Stripe fees | % per payment | on payment | School PO / check with no fees |
| Supabase Pro (backups, no pausing) | **Paid**, monthly | only if the free tier pauses or backups are insufficient during pilots | Weekly manual dumps (D9) |
| Printing kickoff kits | small | wk 7, 17 | Digital only |
| PostHog / Resend / uptime monitor / Sentry | $0 at pilot scale | wk 4–6 | — |

---

## 11. Next 10 days (through 2026-10-02)

**Founder**
- [ ] Review this plan; mark changes; log the adoption in `decision-log.md`
- [ ] Merge `feat/session-sync` (B0)
- [ ] D1: production readiness checklist; apply migrations 0013 and 0014 in Supabase (0015 when A1 lands)
- [ ] Fill `baseline-template.md` with real numbers (C2 queries will help)
- [ ] F1: 60-organization target list in `crm.csv`; delete `EXAMPLE` rows
- [ ] F2: send the first 15 outreach messages; aim for 3 calls booked
- [ ] Confirm the partner schools' fall holidays (feeds A7)

**Agents (each a branch plus PR)**
- [x] A1 `lesson_completions` trigger + RLS (`0016`, PGlite-tested). **Found and fixed:** class/roster/assignment RLS recursed on every signed-in read (`0015`)
- [x] A7 skip weeks in template, RPC (`0017`) and teacher panel
- [x] A3 cohort home (`/cohort/[id]`), invite links (`/join/CODE`) through sign-up/sign-in with a sanitized `next` (also closes an open redirect in `/auth/callback`), dashboard and Settings route cohort students home
- [ ] Fix `/challenges` axe `listitem` (queued task)
- [ ] H1 public-copy accuracy pass
- [ ] C2 `scripts/metrics/*.sql` baseline and scorecard queries

---

## 12. Migration ledger

| # | File | Status |
|---|---|---|
| 0001–0012 | init → cohort_launch | Shipped; **verify applied in prod** (D1) |
| 0013 | `progress_timezone` | Shipped in code; **apply in prod** |
| 0014 | `session_completions` | On `feat/pilot-os`; apply after merge |
| 0015 | `fix_class_rls_recursion` | On `feat/pilot-os`. **Apply first.** Without it every signed-in read of classes/class_members/assignments errors |
| 0016 | `lesson_completions` (+ trigger) | On `feat/pilot-os` (A1) |
| 0017 | `cohort_skip_weeks` (+ launch_cohort v2) | On `feat/pilot-os` (A7) |
| 0018 | `lesson_submissions` | Planned, A2 |
| 0019 | `capstone_submissions` | Planned, A5 |
| 0020 | Stripe event-ordering column(s) | Planned, D4 |

Every migration now runs in CI through `supabase/testing/db.ts` (PGlite). A migration that doesn't apply cleanly fails `npm test`.

Rule: a migration is applied to a non-prod project and RLS-checked (D3) before prod, and the feature that depends on it deploys *after* it's applied. Client code that touches a new table stays best-effort (warn, don't break) until the migration is confirmed, the way 0013 and 0014 already work.

---

## 13. Open questions for the founder

1. **Who are the first three leaders to contact this week?** Warm names beat any list.
2. **Kickoff dates:** is a late-October start realistic at your school, or does the calendar (homecoming, exams) push it to Nov 2 or 9? That moves the W6 gate.
3. **PostHog or Vercel Analytics only** for pilots? (The recommendation is Postgres-first metrics either way. PostHog only if funnel detail is worth the privacy review.)
4. **Supabase project:** is there a separate non-prod project for rehearsal (A6, D3)? If not, create one (free tier allows two projects).
5. **Capstone scope:** is one fixed prompt (e.g. "price an option and defend your volatility assumption") better than open choice for first-time students? Recommendation: offer two fixed prompts plus an open option.
6. **Weekly hours:** is 10–15 still realistic this semester? If it's closer to 8, cut to one pilot in the fall and three in the spring, and move the W14 gate accordingly.
