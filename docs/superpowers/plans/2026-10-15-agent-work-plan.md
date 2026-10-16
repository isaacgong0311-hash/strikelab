# Agent work plan: what Claude can do on StrikeLab without the founder

**Date:** 2026-10-15 (the day before the G1 go/no-go)
**Owner:** the agent does everything here. The founder reviews PRs and answers `[NEEDS FOUNDER]` markers.
**Source:** carved out of the mega plan §7 (build queue) and the YC-readiness plan §7 ("what the agent can do right now"). If this file disagrees with those, they win.

## Baseline (checked 2026-10-15)

`tsc --noEmit` clean, `eslint` clean, `vitest`: 65 files / 390 tests passing. No `TODO`/`FIXME` in `src/`. The product is ahead of the company, so the rule from the mega plan holds: **no features to look bigger.** Everything below either removes risk, reduces founder hours, or prepares proof.

## What I will not do

Contact leaders, run interviews, incorporate, sign for Stripe, make legal calls, invent users/quotes/metrics, or touch anything whose build-queue trigger has not fired (Q11, Q12, Q15, Q18–Q30). Nothing ships on `master` after the Oct 23 freeze unless the scorecard names it.

## Batch 1: do now (no trigger needed, low risk, one PR each)

| # | Task | Why | Done when |
|---|---|---|---|
| A1 | **Y9.2 numbers audit.** Plans/docs say "346 tests"; reality is 390. Check every public count (lessons, tests, tracks) in `README.md`, `/about`, `/pilot`, `/clubs`, `docs/yc/*` against the repo and fix the drift | A wrong number in an application is the cheapest credibility loss there is | One PR; a grep-able list of every number and its source |
| A2 | **Q16 staging seed script.** One command creates a rehearsal cohort with ~10 fake students in varied states (not started, stuck, finished, capstone in), clearly labeled as fake | The founder rehearses the kickoff (G2) and Monday scorecard on realistic data | `npm run seed:rehearsal` works against a local/PGlite DB; has a test; refuses to run against production |
| A3 | **Smoke-test gaps.** Run `tests/` (Playwright e2e + a11y) locally, list failures and flakes, fix the ones caused by code | Q4 ("rehearsal blockers") is waiting on the founder; this finds some first | Green e2e/a11y run, or a written list of what needs an env I don't have |
| A4 | **Lighthouse budgets.** Run `lhci` on `/`, `/demo`, `/learn`, `/cohort` and record against `lighthouserc.json` | Y9.3 and Q13: keep the budgets enforced before the freeze | Numbers pasted into the PR; regressions fixed or logged |
| A5 | **Money-path re-read.** Re-verify `docs/money-paths-audit.md` items marked fixed (migration 0020, `23505` handler) still have tests | Y9.4: must hold before the first payment | Each claim maps to a test name |
| A6 | **Dependency and security pass.** `npm audit`, Next 16 deprecation notices (per `AGENTS.md`), the `vite-tsconfig-paths` warning vitest prints | Cheap hygiene, no behavior change | Only safe bumps; lint/tests/build green |

## Batch 2: document work for the founder to fill in

| # | Task | Notes |
|---|---|---|
| B1 | **Application v0 → v0.5.** `docs/yc/application-draft.md` has 18 `[NEEDS FOUNDER]` markers. I'll re-verify every product claim against the repo, tighten the prose, and group the markers into a one-page question list for the founder | Y8.1. I do not answer the markers |
| B2 | **Interview bank.** Add the missing sections (items 40+ target), tighten wording, and be ready to play the skeptical partner in chat | Y8.5/Y8.6. Founder writes every answer |
| B3 | **Source-check pass** on `competition-map.md` and `market-sizing.md`: mark each figure as sourced / unsourced / blocked, build the checklist the founder walks through | Y3.1/Y3.2 say every figure waits on the founder's check |
| B4 | **Gate G1 pack.** A one-page decision sheet for Oct 16 pulled from `crm.csv`, `npm run pipeline`, and the readiness scores | Saves the founder an hour tonight |

## Batch 3: only when a trigger fires (I will not start these on my own)

| Item | Trigger |
|---|---|
| Q11 needs-help digest | A leader asks "who should I nudge?" twice |
| Q12 pilot-report generator | The first cohort ends |
| Q14 / Q17 facilitator guide v2, burden reducers | Pilot reports name them |
| Q18 / Q19 proof components, case study | Written consent from a leader |
| Q20 / Q21 invoice request, Club checkout | A leader says yes to paying |
| Anything on the "single largest measured bottleneck" | The Monday scorecard names it |

## How I work

- One branch/PR per task, off `master`, each with lint + tsc + tests (+ build when UI changes) run before pushing.
- After code changes, `graphify update .` per `CLAUDE.md`.
- Docs-only PRs for Batch 2; I flag anything unsourced instead of smoothing it over.
- Failures get reported with output, not summarized away.

## Suggested order

A1 → A5 → A3 → A4 → A6 → A2 → B4 → B3 → B1 → B2. A1, A5 and B4 are the quick wins before G1.

## Progress log

| Date | Task | Result |
|---|---|---|
| 2026-10-15 | **A1** numbers audit | 23 lessons (9+11+3) confirmed. Fixed "346 tests" → 390 in the living YC plan. Audit in `docs/yc/numbers-audit-2026-10-15.md`. Flagged outdated pricing language in `marketing/cold_dm_templates.md` for the founder |
| 2026-10-15 | **A5** money paths | Both fixes map to code and tests; caveat added: the ordering test uses a fake Supabase client, so replay out-of-order events on staging before the first payment |
| 2026-10-15 | **B4** G1 pack | `docs/gtm/g1-decision-pack.md`. CRM has 0 real contacts on file; the pack says so plainly |
| 2026-10-15 | **A6** security | `next` 16.2.6 had critical advisories (incl. `next/og` ImageResponse RCE; the app uses `opengraph-image.tsx`). Bumped `next` and `eslint-config-next` to 16.4.1. tsc, lint, 390 tests, `next build` pass. Remaining 10 audit items are transitive (`js-yaml`, `nanoid`, `browserslist`, …); `npm audit fix` crashes on an npm 10.9.4 bug (`edgesOut`), so they need a newer npm or hand-pinned overrides |
| 2026-10-15 | **A3** browser tests | Playwright 55/55 passed on Next 16.4.1 (e2e, accessibility, Chromebook, no-JS, CDN-blocked Python) |
| 2026-10-15 | **A4** Lighthouse | No errors. Warnings only: LCP 2.4–3.1 s (budget 2.0 s) and script size 192–202 KB (budget 184 KB). Compared with 16.2.6 on the same machine, script size fell from 206–283 KB and LCP was equal or better, so the bump didn't cause them. Lab numbers on a sandbox CPU, so use for comparison, not as absolutes |
| 2026-10-15 | **A2** rehearsal seed | `npm run rehearsal:seed` (`scripts/rehearsal/`, how-to in `docs/gtm/rehearsal-seed.md`). Planner tested against the real schema in PGlite (the test caught future-dated timestamps; fixed). Host-confirmation and protected-host guards tested. The `--apply` path via the Supabase admin API has not run against a hosted project |
| 2026-10-15 | Search Console export (founder upload) | Summary and 3 founder checks in `docs/gtm/search-console-2026-10-15.md`. 30 pages discovered but not crawled; low priority before G1 |
| 2026-10-15 | **B3** source check | Every figure in `competition-map.md` and `market-sizing.md` re-checked against search results that quote the source (no primary page reachable). Corrected SIFMA (600k annual, not 750k) and NGPF (123k+ teachers, not 150k+); DECA chapters conflict (4,492 vs 4,364); I2 private-school count and AP Statistics not found. Founder still opens each link |
| 2026-10-15 | **B1** application | Draft is v0.5: every product claim verified against the repo (table at the end), test count fixed, two claims softened ("every policy" tested; LCP budget is only a warning and is missed). The 18 `[NEEDS FOUNDER]` items are now a 16-question list |
| 2026-10-15 | **B2** interview bank | v0.5: fact sheets for the 14 questions the repo can answer, a follow-up table, and a mock-interview protocol. Honest gaps stated: no moderation or report button, no failover if Supabase/Vercel is down, no Google/Clever sign-in |
| 2026-10-15 | Internal-linking pass (from Search Console) | **No code change.** The footer already links `/clubs`, `/pilot`, `/demo`, `/trust`, `/blog` on every page, so linking isn't why 30 pages are "discovered, not indexed" |
| 2026-10-15 | Flag: contact address | Every page, the privacy policy and the terms use `hello@strikelab.app`, while the site is `strikelab.dev`. Founder: confirm that mailbox exists and is read |

## Build log: Wave 1 of the build plan (2026-10-16)

| Task | Result |
|---|---|
| **T3.1** Stripe webhook | Throws (so the route answers 500 and Stripe redelivers) when a subscription update finds no row or errors; same for an unconfigured database. New route test replays the exact out-of-order case and fails on the old code |
| **T3.2** Join codes | `crypto.getRandomValues` instead of `Math.random`; code-space numbers corrected in the security review and decision log (32 symbols, about 1.07B). Invite pattern now matches the real alphabet |
| **T3.3** Python in a Web Worker | `public/python-worker.js` + `src/lib/pythonRuntime.ts`: 10 s limit per run, runaway code is stopped and explained, next Run starts fresh Python; main-thread fallback if Workers are missing. Verified in a real browser: `while True:` typed in the editor is stopped and the next Run works. 10 unit tests with a fake worker |
| **T3.4** Warm-up | `/warmup` page (and a row in the kickoff kit) so 25 students download the 13 MB runtime at the start, not mid-exercise |
| **T3.5** AI tutor | Server drops client `system`/other roles (and non-array bodies) for every AI route; tutor prompt gains boundaries for minors and an untrusted-input rule; **migration `0023`** adds `classes.ai_tutor_enabled` (default **off**) and `ai_tutor_allowed()`; both quota functions honor it (fail closed, except before 0023 exists); leader toggle on the class page; privacy page and data map updated. **Still open, needs the founder:** the provider's data-retention terms (T8.8) and any output moderation beyond the prompt |
| **T3.7** Join page | Distinguishes "invite doesn't match", and "we can't reach the database" (which used to say the invite was wrong) |
| **T3.9** Site-down plan | Screen-free kickoff agenda for the leader added to the kickoff kit. **Still open, needs the founder:** an uptime monitor and database point-in-time recovery |
| **T3.12** Content | Two lesson errors fixed after recomputing the numbers (LEAPS vega, box spread). **Still open:** expert review of all 23 lessons (T8.9) |
| **T4.3** | Outreach drafts moved to `docs/gtm/outreach-drafts/`, stale pricing replaced |
| **T5.3** | Timezone defaults to the leader's own (wizard and class page) |
| **T1.8** | `payer` and `willing_to_pay` columns in the CRM and interview log; `npm run pipeline` prints the payer split and the yes/maybe/no tally |
| **T10.1** | `docs/PLAN.md` is the one-page plan; README points to it. (The 12 older plans were not moved: links across the docs would break.) |
| Teammate | `docs/gtm/marketing-lead-onboarding.md` |

**Migration to apply before the next deploy:** `supabase/migrations/0023_class_ai_tutor.sql` (run `scripts/metrics/check-migrations.sql` afterwards). Until it is applied the code behaves as before.

**Not started (and why):** T3.6 age and teacher attestations (wording needs a qualified reviewer), T3.8 rate-limit fail-closed policy (a taste call: it would lock students out if the limiter table is missing), T3.10 and T3.11 (tests that need a staging Supabase project), T4.1 to T4.2, T4.4 to T4.8 (waiting on the delete-or-hide decision), T5.1, T5.2, T5.4 to T5.11.

Checks at this point: `tsc` clean, `eslint` 0 errors (2 known warnings), 430 unit tests and 57 browser tests (including accessibility) passing.
