# Season rehearsal (before Nov 30)

A full dress rehearsal of Season 1 on the live site, with you and two or three friends, so the first real week isn't the first time anything runs. About one afternoon.

## Before you start (once)

1. Run the migration bundle (`supabase/apply-all-migrations.sql`) in the Supabase SQL editor, then `scripts/metrics/check-migrations.sql`. Every row, including `0025_records_and_defenses`, should say **applied**.
2. Set `SEASON_PARAM_SECRET` in Vercel (Sensitive) and in `.env.local` (the same value).
3. Set `FOUNDER_USER_IDS` in Vercel to your own Supabase user id, so `/admin/defenses` and `/admin/metrics` open for you (and 404 for everyone else).

## Rehearse

1. Paste `supabase/seed/season-rehearsal.sql` into the SQL editor. All three challenges open now for 10 days.
2. Open `/seasons?season=rehearsal-2026`. It says "Rehearsal season (practice only, not on any record)". The normal `/seasons` page doesn't show it.
3. Each person: pick a handle, open a challenge, check the timer starts and the AI tutor is off, submit code and an explanation.
4. Score it: `npm run season:score` (dry run), check the numbers look right, then `npm run season:score -- --apply`.
5. Reload `/seasons?season=rehearsal-2026` and check the leaderboard.
6. Open `/admin/defenses`. The top finishers appear under "waiting for a defense". Record one test sign-off (tick consent only if it is true for the call you actually held).
7. Each person: open `/record`. Rehearsal scores never appear there; that is correct. Create a share link, open it in a private window, then stop sharing and check the old link 404s.

Write down anything confusing or broken in `docs/gtm/decision-log.md` and tell the agent.

## Clean up

```sql
delete from public.seasons where id = 'rehearsal-2026';
```

This removes the rehearsal's challenges, attempts and any placing defenses recorded for it.
