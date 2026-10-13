# Public Claims Audit

**Checked:** 2026-10-13, against branch `claude/dreamy-mendel-ry3duq` (readiness plan Y9.2).
**Rule:** a number goes in the application or on a public page only if this table can point to where it came from.

## Baseline

| Check | Result |
|---|---|
| `npm run lint` | Clean |
| `vitest run` | 390 tests in 65 files, all pass |
| `next build` | Succeeds |
| Playwright (55 browser tests incl. axe accessibility, Chromebook sweep, Python-with-CDN-blocked) | 54 pass on the first run against `next dev`. `reveal.spec.ts` "lesson body becomes visible after scrolling" timed out once on a cold dev-server compile (3s poll) and passed on rerun, so treat it as timing-sensitive on dev, not a failure. Run with a system Chromium because the installed browser build is older than the one Playwright expects |
| Lighthouse budgets | **Not run.** Run `npm run lhci` against a production build before the freeze (Oct 23) |

## Claims

| Claim | Where | Source of truth | Status |
|---|---|---|---|
| 23 lessons | README, `/about`, application draft | 9 in `investingLessons.ts` + 11 in `lessons.ts` + 3 in `quantLessons.ts` | Correct |
| Three tracks | README, application draft | `tracks.ts` | Correct |
| "22 lessons total" | `/about` timeline, Aug 2026 entry | Historical entry; the next entry says 23 | Fine as history |
| ~346 tests | Application draft, readiness plan Y9.3, sprint plan | `vitest run` gives 390 | **Stale. Application draft fixed; the two plan docs are dated snapshots and left as they were** |
| No leader-run cohort started | Application draft, README | `cohorts.csv` empty, `crm.csv` 2 rows | Correct |
| No FERPA/COPPA/"compliant" claims | `/clubs`, `/pricing`, `/trust`, components, `dataMap.ts` | grep for `ferpa|coppa|compliant` finds only a comment forbidding them | Correct |
| 38/38 browser tests | Sprint plan | Now 55 browser tests; 54 pass first run, all pass on rerun | Stale count, was correct then |

## Not yet checked

Lighthouse budgets. Next pass.
