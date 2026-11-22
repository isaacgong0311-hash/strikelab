# Season 1 launch checklist (Isaac only, before Mon Nov 30, 2026)

Season 1 opens at 00:00 New York time on Nov 30 (05:00 UTC). These steps need production access, so only Isaac can do them. No secret values belong in this file, in git, or in chat.

1. **Check Season 1 is in production.** In the production Supabase SQL editor, run [`scripts/metrics/season-1-check.sql`](../../scripts/metrics/season-1-check.sql). Expect three rows (weeks 1 to 3), each with state `ok`: opens Nov 30, Dec 7 and Dec 14 at 00:00, closes Dec 6, Dec 13 and Dec 20 at 23:59.
2. **If any row isn't `ok`:** paste [`supabase/seed/season-1.sql`](../../supabase/seed/season-1.sql) into the same SQL editor and run it (safe to run twice), then run step 1 again. If step 1 errors because `season_challenges` doesn't exist, run `scripts/metrics/check-migrations.sql` and apply the missing migrations first.
3. **Set two variables in Vercel** (project `strikelab`, Production environment), then redeploy:
   - `SEASON_PARAM_SECRET`: a long random string. It decides every student's numbers, so set it once and never change it during the season.
   - `FOUNDER_USER_IDS`: your own Supabase user id (Supabase → Authentication → Users), so `/admin/seasons` and `/admin/verify` open for you.
4. **Fill in `.env.local` on your laptop** so the scorer can reach production: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the same `SEASON_PARAM_SECRET` as step 3. If it differs from Vercel by one character, every score is computed on the wrong numbers.
5. **Dry-run the scorer.** Run `npm run season:score`. Before the season it should print `Nothing to score.`; a `Missing ...` line means step 4 is incomplete, and an error reading attempts means the URL or key is wrong. It writes nothing without `--apply`.
6. **Score every day from Nov 30 to Dec 21.** Run `npm run season:score`, read the lines it prints, then `npm run season:score -- --apply`. Students are told scores usually post within a day. Anything marked `pending_review` (a timeout or a broken test) shows up in `/admin/seasons` for you to look at.
