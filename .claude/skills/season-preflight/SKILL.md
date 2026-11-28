---
name: season-preflight
description: Rehearse and verify the full Season 1 student journey (invite, join, handle, practice, timed attempt, official score, record page, defense sign-off) and report what is broken or unverified. Use before the Nov 27 freeze, after any change to seasons, scoring or records, and when asked to "rehearse", "pre-flight" or "check the season".
---

# Season pre-flight

Goal: prove the season works for a real student, and find what breaks before one does. Season 1 opens Nov 30, 2026 and runs three challenges to Dec 20. The plan's gate is "Season 1 verified on production by Nov 27".

## Safety rules
- Never run the rehearsal seed (`npm run rehearsal:seed`) against production. It refuses hosts listed in `REHEARSAL_PROTECTED_HOSTS`; confirm production is listed before any `--apply`. Only local or staging Supabase.
- Production Supabase SQL is Isaac's job. The Supabase connector here may only see an inactive project, not production (`urmfsymdmmzstbelqryw`). Do not guess at production data; list the exact query and say Isaac runs it.
- Never write real-looking student data. Fake users are `@rehearsal.invalid`.

## Fan out (run these in parallel with subagents)
1. **Automated surface.** `npx vitest run` (seasons, records, scoring, clock, handle, invite) and the browser specs: `tests/season-workspace.spec.ts`, `practice.spec.ts`, `seasons.spec.ts`, `season-status.spec.ts`, `record.spec.ts`, `shared-record.spec.ts`, `admin-verify.spec.ts`, `after-signup.spec.ts`. The seeded-board specs all need `SEASON_BOARD_E2E=1` (starts `tests/fixtures/start-season-board.mjs` on port 3113) *plus their own spec-specific var*, or they silently skip: `season-status.spec.ts` needs `SEASON_STATUS_E2E=1`, `record.spec.ts` and `shared-record.spec.ts` need `RECORD_E2E=1`, `admin-verify.spec.ts` needs `VERIFY_E2E=1`. Run Playwright single-worker in a sandboxed environment — the default parallel config can cause false timeouts under resource contention.
2. **Manual walk** with the `qa-walkthrough` subagent at 1280px and 375px, signed out: `/` → `/seasons` → practice round → sign-up → handle → attempt page. Then, if a local or staging Supabase with the seed is available, signed in: submit an attempt, open `/record`, share link, `/admin/verify`.
3. **Rules audit** with the `season-doctor` subagent: one attempt per student, server clock caps the attempt at the week's close, late submits rejected, hidden tests never reach the client (`src/lib/seasons/templates.ts`, `params.ts` must not be imported by any client file), leaderboard ranking matches the FAQ in `src/lib/seasons/faq.ts`.
4. **Production state** (read only): Vercel MCP `list_deployments` (latest production is READY on the expected SHA), `get_runtime_errors` for the last 24h, then `web_fetch_vercel_url` for `/seasons`, `/seasons/practice`, `/seasons/calendar.ics`, `/sign-up`. Check migrations 0024, 0025, 0026 are what production expects: write out `scripts/metrics/check-migrations.sql` for Isaac to run, do not run SQL you cannot reach.
5. **Claims** with the `claims-auditor` subagent on `/seasons`, `/`, `/intensive`: every number or promise has a source in `docs/investor/claim-ledger.md` or the code.

## Fix loop
For each failure: reproduce, find the cause, fix on a branch, add a regression test, then use the `ship` skill. One PR per root cause. Batch only fixes that touch the same files.

## Output
Write `docs/gtm/season-preflight-<date>.md` (no personal data), then summarize in chat:
- **Passed** (with the command or page that proved it)
- **Broken, fixed** (PR links)
- **Broken, not fixed** (why, and what is needed)
- **Unverified** (what only Isaac can check: production SQL, Stripe, Supabase dashboard, a real device)
- **Migrations Isaac must apply**, in order, or "none"
