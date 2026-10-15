# Session Build Plan: Oct 13 → Oct 23 freeze, aimed at YC

**Date:** 2026-10-13 (runway week 6; G1 go/no-go Fri Oct 16; code freeze Fri Oct 23)
**Scope:** what an agent can finish in this working session and the next few, and what it hands the founder.
**Authority:** this plan sits under `2026-10-01-yc-readiness-plan.md` and `2026-09-29-mega-plan.md`. If they disagree on dates or gates, they win.

---

## 1. Where we really are (checked against the repo today)

| Fact | Evidence |
|---|---|
| Product is ahead of the company | 23 lessons, cohort system, `/demo` tour, `/trust`, `/admin/metrics`, proof strip (renders nothing while empty) |
| **Traction is still zero** | `docs/gtm/crm.csv` has 2 rows, `interview-log.csv` is empty, `cohorts.csv` is empty |
| The application has 18 gaps only the founder can fill | `grep "NEEDS FOUNDER" docs/yc/application-draft.md` |
| Deadline risk may be nearer than the plan assumes | One aggregator lists the **Winter 2027 on-time deadline as Nov 2, 2026** (decisions by Dec 11). Unconfirmed, because ycombinator.com was unreachable from this environment. The readiness plan assumes Apr 25, 2027 |
| Dependencies are not installed in this container | `node_modules/` missing, so nothing has been run here yet |

**The honest read:** more code does not move YC odds. D1 (traction) is 0 and every other dimension waits on it. So this session has one job: **make the founder's next 10 days produce leader conversations, and keep everything a partner would look at true and working.** Code work is limited to rehearsal safety and verification, and must land by Tue Oct 20.

---

## 2. Work packages (in order)

Owner: **A** = agent in this session, **F** = founder. Each has a check you can verify.

### S0. Baseline and truth audit (A, ~1.5h) — do first
1. `npm ci`, then lint, `vitest run`, `next build`. Read `node_modules/next/dist/docs/` before touching any Next code (AGENTS.md).
2. Record real numbers: test count, lesson count, route list. Compare against every public claim in `README.md`, `/about`, `/clubs`, `/pricing`, `/trust`, `docs/yc/application-draft.md` (readiness Y9.2). The readiness plan cites "346 tests"; confirm or correct.
3. Fix or remove any claim that doesn't match. No compliance claims (FERPA, COPPA).

**Done when:** a short table "claim → source → status" is committed to `docs/yc/claims-audit.md`, and lint, tests and build are green or the failures are listed.

### S1. Founder fill-in sheet (A drafts, F answers in 30 min) — highest leverage
Collapse the 18 `[NEEDS FOUNDER]` markers, the readiness plan §11 decisions and the YC deadline question into **one page of plain questions** (`docs/yc/founder-questions.md`), grouped: *you alone* / *you with a parent* / *needs an adult signatory*. Also add evidence the repo can supply for D8 (execution speed): first-commit date, commit count and cadence from `git log`, stated factually.

**Done when:** a founder can answer the page in one sitting, and `application-draft.md` is bumped to v0.2 with the repo-derived facts filled in and everything else still marked.

### S2. YC timing decision packet (A, ~30m)
Re-verify the Winter 2027 date and the current form from a source I can reach. If unreachable, say so and give the founder the exact link and the three things to read. Lay out two options plainly:
- **Early submit** (Nov 2, if real): possible only with a thin application; honest about zero traction; lower odds, low cost, useful feedback.
- **Wait for proof** (readiness plan, Apr 2027): stronger, as the plan intends.

The agent recommends; the founder decides at G1 (Oct 16) and logs it in `decision-log.md`.

**Done when:** `docs/yc/timing-options.md` exists with the verified date or an explicit "unverified".

### S3. Outreach throughput (A prepares, F contacts) — the real bottleneck
The agent cannot contact anyone. It can remove friction:
1. Run `npm run pipeline` against `crm.csv`; produce today's "follow up" list and the weekly count against the sprint target.
2. Build a **prospect shortlist** of local math, CS, investing, economics and DECA/FBLA clubs from **public school pages only** (club name, school, public advisor listing, source link). Needs the founder's **state or district** first. Founder verifies each row before it enters the CRM.
3. Tighten `outreach-kit.md` messages to the one-sentence description; add `?src=` tracked links per channel so source attribution works from the first click.

**Done when:** ≥ 20 verified prospects ready in `crm.csv` format, tracked links documented, and the founder has a one-page "send these today" list.

### S4. Rehearsal safety, pre-freeze only (A, ~4h; by Tue Oct 20)
Only what protects the first kickoff (mega plan Q4, Q16):
1. **Staging seed script** (Q16): a rehearsal cohort with 10 fake students in varied states, one command, clearly named so it can't be mistaken for real data.
2. Run `docs/gtm/smoke-test.md` end to end in Playwright; log each failure as a fix or a known issue (Q4).
3. Confirm the demo fallback path for a bad school network (self-hosted Python, Q1).

No new features. Anything larger waits for the scorecard (readiness Y4.4).

**Done when:** seed command works on a clean database, smoke test passes or its failures are written down, one PR merged by Oct 20.

### S5. Interview readiness (A drafts, F speaks) — capped at ~1.5h/week
1. ~~Grow `interview-bank.md` to 40 questions~~ Already 50 questions (checked 2026-10-13). Only the founder's answers are missing.
2. One mock "skeptical partner" round in chat on the hardest five: *why would a school pay, why solo, will you work full time, why not a stock simulator, how big can this get.* Output: three sentences of feedback per answer, no flattery.

**Done when:** one mock round recorded in `docs/yc/mock-interviews.md`. Needs the founder's spoken answers; not started.

### S6. G1 packet for Fri Oct 16 (A, ~45m)
Pre-fill the decision-log row, the readiness §2 score table with evidence per dimension, and the three open decisions (adult signatory, advisors, early submit). The founder edits scores they disagree with.

**Done when:** a pasteable G1 entry exists; the founder changes only what's wrong.

### S7. Hygiene (A, ~20m)
`graphify update .` after any code change (CLAUDE.md); keep every change on branch `claude/dreamy-mendel-ry3duq` in a draft PR; no direct commits to `master`.

---

## 3. What I need from the founder (blocking)

1. **State or district** (S3 prospect list).
2. **Answers to `founder-questions.md`** (S1).
3. **Decision on early submit vs. wait** by Fri Oct 16 (S2).
4. **Name of an adult signatory**, a parent is fine (readiness Y6.1).

If only one thing gets done by Friday, do the first and last of these and send five messages to leaders.

---

## 4. Not doing in this session

- New lessons, tracks, themes, mascots, or a bigger landing page.
- Any invented user, quote, logo, student work or metric. Examples stay labeled "Example".
- Q11, Q12, Q15, Q17–Q30. Each has a trigger (an observed need or a paying buyer) that hasn't fired.
- Incorporation, Stripe, privacy or legal judgments (⚖ items need a qualified adult).
- Fixing `--font-mono` (noted in the frontend plan change log). It adds a font download to every page and wants its own change, after the freeze.

---

## 5. Order and time

| Order | Package | Agent time | Founder time |
|---|---|---|---|
| 1 | S0 baseline and claims audit | 1.5h | 5m review |
| 2 | S1 founder sheet + application v0.2 | 1.5h | 30m answering |
| 3 | S2 timing options | 0.5h | 10m deciding |
| 4 | S3 outreach list and links | 2h | 20m verifying, then sending |
| 5 | S6 G1 packet | 0.75h | 10m |
| 6 | S4 rehearsal safety | 4h | 15m review |
| 7 | S5 interview bank + mock | 1.5h | 30m speaking |

About 12 agent hours, roughly 2 founder hours, before the freeze.

---

## 6. Risks

| Risk | Response |
|---|---|
| The environment can't reach ycombinator.com | Say "unverified"; give the founder the link and what to read; never rely on an aggregator for a deadline |
| Time goes to the plan instead of the leaders | The founder's first action each day is outreach (sprint plan §1); this plan only feeds it |
| An early application exposes zero traction | S2 states this plainly; the founder chooses with the costs in view |
| Seed data confused with real data | Fixed fake prefix, test asserts it, never run against production |

---

## 7. Change log

| Date | Change |
|---|---|
| 2026-10-13 | Created. |

---

## 8. Stanford overlay (added 2026-10-13)

The founder plans to attend Stanford and wants to improve **depth** (sustained, personal work) and **reach** (real people served). This is the same work as the YC plan, with one change in emphasis: the application dimension that matters most is verified reach.

**What changes**
- New artifact: `docs/yc/impact-ledger.md`, one source of truth for depth and reach that feeds both YC and college forms.
- Reach (real clubs and students) is zero today and is the only number that moves outcomes. S3, the G1 packet and the outreach list are therefore the highest-priority work, ahead of anything else in this plan.
- The YC "full-time" question (Y5.1) must be answered with the college plan in view. Don't promise either one yet.

**What does not change**
- No invented users, quotes or numbers. Nothing in the ledger is projected.
- Code freeze Oct 23 stands.

**Deadlines to check (unverified for 2026–27; confirm on admission.stanford.edu):** Restrictive Early Action Nov 1 (non-binding; art-portfolio track Oct 15), Regular Decision Jan 5. Which one applies depends on the founder's grade, which this plan doesn't know. Question 1 in the ledger asks.

| Change log | |
|---|---|
| 2026-10-13 | Added §8 and `impact-ledger.md`. |
