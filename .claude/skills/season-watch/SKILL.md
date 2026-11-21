---
name: season-watch
description: Watch StrikeLab production while a season is live. Check deployments, runtime errors and logs, triage blockers, and prepare the numbers for Isaac's weekly check-in and the Dec 6 and Dec 20 reports. Use daily from Nov 30 to Dec 20, or when asked "how is production", "any errors", "weekly report".
---

# Season watch

Season 1: Nov 30 to Dec 20, 2026. Plan: `docs/ISAAC_AND_CLAUDE_WORK_PLAN.md` Phase 3. Claude watches errors and fixes blockers the same day; Isaac does leader check-ins and sends anything to real people.

## Daily check (read only)
1. Vercel MCP `list_deployments` for `strikelab`: latest production deployment is READY, on the SHA you expect. Note any failed or canceled builds.
2. `get_runtime_errors` for the last 24 hours. Group by route and message. Then `get_runtime_logs` for the top two.
3. Smoke test with `web_fetch_vercel_url`: `/`, `/seasons`, `/seasons/practice`, `/sign-up`, `/seasons/calendar.ics`. Expect 200 and the page's key text.
4. Sentry: if a connector is available, read new issues. If not, say so. Do not claim "no errors" from Vercel alone.

## Triage
- **Blocker** (a student cannot sign up, start, submit, or see their score; scoring wrong; hidden tests leaked): stop other work. Reproduce, fix on a branch, add a regression test, use the `ship` skill. Freeze rules (Nov 27 to Dec 1) allow this. If it needs a rollback, `request_rollback` to the previous READY deployment first.
- **Degraded** (slow, ugly, one browser): log it in the backlog in `docs/PLAN.md`, fix after the season week unless it recurs.
- **Noise** (bots, 404 probes): ignore, but note the count.

## Weekly and milestone numbers
Production SQL is Isaac's job (the Supabase connector here does not see production). Prepare, do not run:
- `scripts/metrics/season-signups.sql` and `scripts/metrics/weekly-scorecard.sql`: tell Isaac which to paste into the Supabase SQL editor, and what shape of output to paste back.
- **Dec 6:** the week-1 count, students with an official score. Write the draft update, numbers only, each with its query and date. Isaac sends it.
- **Dec 20:** the Season 1 report. Funnel with denominators, failures, and the next change. Every figure reconciles to a raw query Isaac ran. Never turn a blank into a zero.

## Report
Short: production state, errors worth knowing about, what you fixed (PR links), what needs Isaac (SQL to run, a leader to call), and the date of the next check.
