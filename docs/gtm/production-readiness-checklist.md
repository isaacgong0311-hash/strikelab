# Production Readiness Checklist

Agents can't check any of this: it needs the Supabase, Vercel, Google Cloud, Stripe and Sentry dashboards. Check a box only once you've confirmed it **in production**, not just in code. Run it before the first real pilot, then again after any infrastructure change.

The P-numbers match `docs/superpowers/plans/2026-09-29-work-plan-to-first-kickoff.md` §5.2. Time estimates assume you've never opened that dashboard page before.

## P1. Migrations (about 1.5h)

Production is already running code that expects every migration through 0021, and this release adds 0022 (the challenge leaderboard stops showing names publicly). The app degrades rather than crashing when one is missing, but a missing 0015 makes every signed-in read of classes, members and assignments error, and a missing 0016 makes activation unmeasurable.

- [ ] In the Supabase SQL editor, run `scripts/metrics/check-migrations.sql`. It lists all 22 migrations as `applied` or `MISSING`.
- [ ] Apply each `MISSING` file from `supabase/migrations/`. Easiest is `npx supabase link --project-ref <ref>` then `npx supabase db push`, which applies them all in order (see `SUPABASE_SETUP.md`). By hand, paste each into the SQL editor; **if 0015 is missing, apply it first**, then the rest in number order. Every migration is written to be safe to re-run.
- [ ] Re-run the check. **Pass:** all 22 rows say `applied`.
- [ ] Signed in as a real user on strikelab.dev, open `/dashboard`, a class page (`/dashboard/class/<id>`), `/cohort/<id>` and `/teach`. None of them shows an error, and nothing new appears in Sentry.

From now on, apply each new migration here *before* merging the PR that depends on it (master plan §12).

## P2. Sign-up email that works for a whole room (about 1h)

Students sign up with email and a password, then confirm through a link (`src/app/sign-up/[[...sign-up]]/page.tsx`). Supabase's built-in email sender is meant for development: it's tightly rate-limited, and on current projects it may only deliver to your own team's addresses. Twenty students signing up within five minutes at a kickoff would hit that limit.

- [ ] Open **Authentication → Emails → SMTP settings** and **Authentication → Rate limits**. Write down what's configured now.
- [ ] Choose one, and log the choice in `decision-log.md`:
  - **Custom SMTP (recommended).** Create a free Resend account (check its current free-tier limits; it's been about 100 emails a day), verify `strikelab.dev` as a sending domain with the DNS records it gives you, and enter its SMTP details in Supabase. Then raise the "emails sent per hour" rate limit to at least 60.
  - **Turn off "Confirm email"** (Authentication → Providers → Email) for the pilot period. Sign-up then logs the student straight in. The trade-off is that a mistyped email breaks password reset for that student. Acceptable for a supervised kickoff; revisit before any paid contract.
- [ ] Brand the confirmation email: change the sender name to "StrikeLab", and make the subject say what it is ("Confirm your StrikeLab account").
- [ ] **Pass:** 5 test sign-ups within 5 minutes (use `you+1@…`, `you+2@…` if your provider supports plus-addressing) all receive the email within a minute, or confirmation is off and logged.

## P3. Google sign-in (about 30 min, plus the week-6 school test)

- [ ] Google Cloud Console → **APIs & Services → OAuth consent screen**: publishing status is **In production**. In "Testing", only listed test users can sign in, and everyone else sees an error.
- [ ] The app name and logo are StrikeLab's, and the authorized domain includes `strikelab.dev`.
- [ ] Supabase → Authentication → URL configuration: the site URL is `https://strikelab.dev`, and the redirect allow-list includes `https://strikelab.dev/**` (the callback is always called with a `?next=` query, so use a pattern; add your preview pattern if you test on previews). Test it: sign up with a real address and follow the confirmation email. If the link lands on the home page instead of your dashboard, the allow-list rejected it.
- [ ] **Know the school-account limit:** many districts block students under 18 from signing in to third-party apps with their school Google account unless the admin has allowed the app. Until the device test at a partner school (work plan §5.4) proves Google works *there*, students sign up with email at kickoff.

## P4. Keys, alerts and uptime (about 45 min)

- [ ] Vercel → Project → Settings → Environment Variables (Production) has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (= `https://strikelab.dev`), `GROQ_API_KEY`, `NEXT_PUBLIC_SENTRY_DSN` and `OPS_DISCORD_WEBHOOK_URL`.
- [ ] Optional: `NEXT_PUBLIC_PILOT_CALL_URL` = your Cal.com link, so `/pilot` "Talk first" books a call instead of opening email.
- [ ] `FOUNDER_USER_IDS` = your own Supabase user id (Supabase → Authentication → Users → your row → UID). It unlocks `/admin/metrics` for you only; everyone else gets a 404. Sign in and open `strikelab.dev/admin/metrics` to check.
- [ ] **Sentry:** trigger a test error (for example, temporarily open a URL that throws on a preview deploy, or use Sentry's "send test event"). It shows up in the dashboard within a few minutes.
- [ ] **Discord ops alert:** a test message reaches the channel (Settings → Discord in the app, or a request error on a preview).
- [ ] **Uptime:** a free monitor (e.g. UptimeRobot or Better Stack's free tier) on `/`, `/cohort` and `/api/progress`, alerting your phone.
- [ ] **Stripe:** either live keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_SCHOOL_PRICE_ID`) with the webhook pointed at `https://strikelab.dev/api/stripe/webhook` and one real test purchase landing, **or** log "Stripe deferred: pilots are free" in `decision-log.md`. Nothing in the pilot charges money.

## P5. A non-prod Supabase project (about 45 min)

Rehearsals and smoke tests should never touch real student data.

- [ ] Create a second Supabase project (the free tier allows two), called e.g. `strikelab-staging`.
- [ ] Apply every migration in order (0001 → 0022) and run `check-migrations.sql`: all `applied`.
- [ ] Vercel → Environment Variables: set the three Supabase variables for the **Preview** environment to the staging project's values, so preview deploys use staging.
- [ ] Apply the same P2 email choice there too, or turn confirmation off on staging.

## P6. Smoke test

- [ ] Run `docs/gtm/smoke-test.md` on staging (week 5) and on production with throwaway accounts (week 6). Every step passes.

## P7. Baseline (about 45 min)

- [ ] Run `scripts/metrics/baseline.sql` in production, and fill `baseline-template.md` with today's date.
- [ ] Copy the numbers into the first row of `weekly-scorecard.md`.

## Sign-off

- [ ] P1–P7 done. Record the date in `decision-log.md` ("Production verified for pilots").
