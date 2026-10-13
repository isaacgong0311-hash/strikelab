# Public Claims Audit

**Checked:** 2026-10-13, against branch `claude/dreamy-mendel-ry3duq` (readiness plan Y9.2).
**Rule:** a number goes in the application or on a public page only if this table can point to where it came from.

## Baseline

| Check | Result |
|---|---|
| `npm run lint` | Clean |
| `vitest run` | 390 tests in 65 files, all pass |
| `next build` | Succeeds |
| Playwright / axe / Lighthouse | **Not run in this audit.** Rerun before the freeze (Oct 23) |

## Claims

| Claim | Where | Source of truth | Status |
|---|---|---|---|
| 23 lessons | README, `/about`, application draft | 9 in `investingLessons.ts` + 11 in `lessons.ts` + 3 in `quantLessons.ts` | Correct |
| Three tracks | README, application draft | `tracks.ts` | Correct |
| "22 lessons total" | `/about` timeline, Aug 2026 entry | Historical entry; the next entry says 23 | Fine as history |
| ~346 tests | Application draft, readiness plan Y9.3, sprint plan | `vitest run` gives 390 | **Stale. Application draft fixed; the two plan docs are dated snapshots and left as they were** |
| No leader-run cohort started | Application draft, README | `cohorts.csv` empty, `crm.csv` 2 rows | Correct |
| 38/38 browser tests | Sprint plan | Not rerun | Unverified |

## Not yet checked

`/clubs`, `/pricing`, `/trust` copy for compliance wording (FERPA, COPPA); Lighthouse budgets; the Playwright suite. Next pass.
