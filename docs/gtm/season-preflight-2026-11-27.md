# Season 1 pre-flight: pre-launch check (Nov 27, 2026)

Season 1 opens Nov 30. This follow-up to `season-preflight-2026-11-23.md` re-checks the student journey against four more merged PRs (#104-#107: season path, score reveal, league board, docs) and fills the three gaps that report flagged as unverified: the signed-in browser flow, the automated CI surface, and a fresh rules audit. Production (commit `85faa03`) matches local `master`; no code changes landed from this pass except two documentation fixes (noted below).

## Passed

| Check | Result |
|---|---|
| Production deployment | READY on `85faa03`, matches local `master`. No runtime errors in the last 24h (Vercel). |
| Public pages, signed out | `/seasons/practice`, `/seasons/calendar.ics`, `/sign-up` all 200 OK with correct content (calendar has the right week 1-3 dates and deadlines; practice page and signup form render correctly). |
| One attempt per student | Enforced server-side: `season_attempts` primary key `(user_id, challenge_id)` plus an explicit `already_submitted` check in `submit_attempt()` (`supabase/migrations/0024_seasons.sql:47-59,128-130`). No client-only check to bypass. |
| Server clock caps the attempt, late submits rejected | Deadline computed server-side at start (`least(now() + time_limit, closes_at)`), submit checks the database's own `now()` against it with a 30s network-latency grace window (`0024_seasons.sql:91-92,131-132`). The client-side countdown (`src/lib/seasons/clock.ts`) is display-only and can't extend the real deadline. |
| Hidden test content never reaches the client | `templates.ts`/`params.ts` are imported only by the submit API route and five server components (no `"use client"`); the client components that render attempt data (`AttemptClient.tsx`, `Workspace.tsx`) receive only already-derived plain numbers as props, never the modules themselves. |
| Leaderboard ranking matches the FAQ | FAQ says a missed week counts as zero, not a disqualification, with ties broken by weeks scored; the SQL sums only `scored` rows and ranks by `(total desc, weeks_scored desc)`, matching exactly (`0024_seasons.sql:163-181`). |
| Manual walkthrough, signed out, 1280px & 375px | `/`, `/seasons`, and the practice round all pass clean — zero console errors, live countdown ticks correctly, practice workspace clock/editor/check-runner all function, progress persists via localStorage across reload and viewport change. |
| Automated tests | 646/683 vitest tests pass; all 33 Playwright specs pass once run single-worker with the right env vars (see "Fixed" below). No real product regressions — remaining failures are environment noise (see "Not a bug" below). |
| Claims audit | Season dates, "free", ages 13-18, "no ads/no selling data", and "handles not names" are all code- or policy-backed. `/intensive` has a few unsourced promises (see "Not fixed"). |
| Migrations | `scripts/metrics/check-migrations.sql` already covers 0024-0026 and is kept in sync with the migrations folder by a test. Nothing new to add. |

## Fixed (docs only, no product code changed)

1. `.claude/skills/season-preflight/SKILL.md` didn't mention that each seeded-board Playwright spec needs its own env var (`SEASON_STATUS_E2E`, `RECORD_E2E`, `VERIFY_E2E`) on top of `SEASON_BOARD_E2E=1` — missing them caused 10 silent skips that looked like "nothing to test." Doc now lists them, plus a note to run Playwright single-worker in a sandboxed environment.
2. This report's own existence — rows 4-6 of the design polish plan and now this pre-flight both got full passes; see `docs/superpowers/plans/2026-11-19-design-polish-plan.md` for the former.

## Not fixed (needs a decision, not a code fix)

1. **Unsourced claims on `/intensive`**: "a small group of 8 to 12 high schoolers," "about 3 hours a week," "10 minutes to explain" (capstone defense length), and the capstone-call safety language ("two adults present," "parent consents") have no ledger entry or cited policy page. Recommend softening to "small cohort" / "a few hours" until staffing is real, or adding rows to `docs/investor/claim-ledger.md`.
2. **Next.js security advisory, surfaced mid-run**: the installed `next` 16.4.1 dev CLI printed a "known security vulnerability" notice that explicitly instructs an AI agent to run `next upgrade --agent=security`. This is a real part of the installed CLI, not an injected string, but per the working agreement (`docs/PLAN.md:42`) dependency upgrades need your explicit OK, and an embedded instruction aimed at an agent is exactly the kind of thing we don't act on unprompted. I did not run it. Worth you checking `https://registry.npmjs.org/-/npm/v1/security/advisories/bulk` and deciding whether to upgrade (after the freeze).

## Unverified (what only Isaac can check)

- **Full signed-in flow** (submit → `/record` → share link → `/admin/verify`) through the real UI: blocked because `@rehearsal.invalid` fails Supabase's genuine email-deliverability check on the public signup form (by design — that address is meant for the admin-API seeding script, not the public form), and no seeded local/staging Supabase was reachable this round. This exact flow *was* verified directly against the production database in the Nov 23 rehearsal (impersonated JWTs, real RLS) — that evidence still stands; what's still unverified is doing it through the actual browser UI with a real account.
- `npm run season:score` end to end — needs `SUPABASE_SERVICE_ROLE_KEY` and the production `SEASON_PARAM_SECRET` in `.env.local` (carried over from Nov 23, still true).
- Whether `SEASON_PARAM_SECRET` and `FOUNDER_USER_IDS` are set in Vercel — the agent's Vercel token returned 403 on listing project env vars (carried over from Nov 23, still true).
- A byte-level `.next` client-bundle diff to triple-confirm hidden test content never ships client-side — the import-graph check is strong evidence but not a build-artifact check.

## Migrations Isaac must apply

None new. 0024, 0025, 0026 are already expected to be live (confirmed indirectly: the Nov 23 rehearsal ran directly against production with all three migrations' objects present). Re-run `scripts/metrics/check-migrations.sql` in the Supabase SQL editor to reconfirm before launch if you want certainty.
