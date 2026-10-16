# Public numbers audit (Y9.2), 2026-10-15

Every count we state publicly, and where it comes from. Re-run at each gate.

| Claim | Where stated | Source of truth | Result |
|---|---|---|---|
| 23 lessons, three tracks | README, `/about`, `docs/yc/application-draft.md`, `docs/gtm/outreach-drafts/*` | `src/lib/lessons.ts` (11 options) + `investingLessons.ts` (9) + `quantLessons.ts` (3) | OK |
| 9 / 11 / 3 per track | README, `docs/gtm/outreach-drafts/aops_post.md` | same files | OK |
| Tests | `2026-10-01-yc-readiness-plan.md` (living) | `npm test`: 65 files, 390 tests | Fixed (said 346) |
| Tests in dated plans (317, 327, 337, 346) | older plans | Snapshots at their dates | Left as history |
| Browser tests | sprint plan: 38/38 | `tests/` has 30 `test(` blocks in 8 files; some are parameterized, so not re-verified here | Not verified, needs a Playwright run (A3) |

## Flag for the founder (not changed)

`docs/gtm/outreach-drafts/cold_dm_templates.md` (moved from `marketing/`) said the core curriculum is free, a "$9/mo Pro tier" exists, and a school license is "not built yet". The pilot story is now free cohorts and a $199 club license in the plan. Check that outreach drafts match what you are actually offering before sending.

**Resolved 2026-10-16:** the pricing lines in the outreach drafts were corrected and the folder moved to `docs/gtm/outreach-drafts/` (build plan T4.3). The drafts still mention the paper-trading sandbox; a note at the top says to remove those sentences before sending.
