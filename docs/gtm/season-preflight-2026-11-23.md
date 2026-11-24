# Season 1 pre-flight: production rehearsal (Nov 23, 2026)

Run on the production database (`strikelabco`, `urmfsymdmmzstbelqryw`), with Isaac's go-ahead. Everything ran against a hidden season (`rehearsal-2026`), dated Feb 2027 so that strikelab.dev kept showing Season 1, using three fake students (`@rehearsal.invalid`) with no password. No emails were sent. All rehearsal data was then deleted.

## How

- Each student was impersonated inside the database: the request's JWT claims were set and the transaction switched to the `authenticated` role. That calls the real `start_attempt`, `submit_attempt`, `season_leaderboard`, `set_record_sharing` and `get_shared_record` functions under real RLS.
- Scoring used the scorer's own code: `createScorer`, `outcome`, `getTemplate` and `deriveParams` from `scripts/seasons/`. It ran on the submitted attempts, and the results were written back the way `score.mjs` writes them. `npm run season:score` itself was not run, because it needs the production service-role key in `.env.local` (see "Not verified").
- The verification row was inserted with the same columns `src/app/api/admin/verify/route.ts` writes.

## Passed

| Check | Result |
|---|---|
| Start, resume, one attempt per student | ok |
| Submit, then resubmit | `already_submitted` |
| Submit after the deadline | `too_late` |
| Student B reads A's attempt | 0 rows |
| Scores: correct / wrong / correct without a handle | 80 / 0 / 80 (speed is 0 when correctness is 0) |
| Leaderboard as a signed-out visitor | A #1 (80), B #2 (0); the no-handle student is absent; handles only |
| Verification stored; A sees only their own | ok |
| Share link as a signed-out visitor | handle and verified placing only; unknown token returns 0 rows; revoked link returns 0 rows |
| Signed-out visitor reads the verifications table | refused (42501) |
| Live page `strikelab.dev/r/<token>` | 200; "@rehearsal_a", issuer, "Verified Nov 24, 2026", "Final placing #1", topics tested; no name or email; no LinkedIn link for visitors |
| strikelab.dev `/seasons` and calendar during the rehearsal | showed only Season 1 |
| Cleanup | counts identical to before: 10 users, 10 profiles, 1 season, 3 challenges, 0 attempts / verifications / shares / rate limits; 0 rehearsal rows left |

## Found

1. **Fixed in this PR:** the leaderboard column "Solved" counted scored attempts, so a 0-point week showed as "Solved: 1". It is now labelled "Weeks scored". Ranking ties are broken by the same count. Changing that would need a migration, so it waits until after the freeze if wanted.
2. **Noted, not changed:** `start_attempt` (migration 0024) doesn't require a handle. The website's start route does (#94), so normal students can't start without one. Someone calling the database function directly would be scored but left off the board. This is low risk and not worth a schema change during the freeze.

## Not verified

- `npm run season:score` end to end. Put `SUPABASE_SERVICE_ROLE_KEY` and the production `SEASON_PARAM_SECRET` in `.env.local` (placeholders are there), then run `npm run season:score`. It should print "Nothing to score."
- Whether `SEASON_PARAM_SECRET` and `FOUNDER_USER_IDS` are set in Vercel. The agent has no access to read them.
- The signed-in pages in a browser with real sign-in. These are covered by the seeded browser tests in CI, not by this rehearsal.
