# Production Readiness Checklist

I can't verify any of this myself — this session has no production credentials (only a local `GROQ_API_KEY` is set in `.env.local`). Everything below has to be checked by hand in the relevant dashboard. Check the box once you've confirmed it in production, not just in code.

## Supabase

- [ ] All 13 migrations through `supabase/migrations/0013_progress_timezone.sql` are applied to the production database (`0001_init` → `0013_progress_timezone`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set in the production environment (Vercel project settings, not just `.env.local`)
- [ ] RLS is enabled on every table that holds student data, and a quick manual test confirms a student can't read another student's row
- [ ] The `launch_cohort` RPC's `SECURITY INVOKER` + `auth.uid()` ownership check actually blocks a non-owner in production, not just in the route test

## Stripe

- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, and `STRIPE_SCHOOL_PRICE_ID` are set to **live** (not test) values
- [ ] The production webhook endpoint is registered in the Stripe dashboard and pointed at the deployed `/api/stripe/webhook` URL
- [ ] A real test purchase (or Stripe's test-mode-in-production tooling) confirms checkout → webhook → entitlement actually lands
- [ ] The event-ordering risk flagged in `docs/superpowers/specs/2026-09-13-strikelab-yc-company-design.md` (engineering-ops row) has been checked, not just documented

## Sentry

- [ ] `NEXT_PUBLIC_SENTRY_DSN` is set in production
- [ ] A deliberate test error shows up in the Sentry dashboard within a few minutes

## Email / notifications

- [ ] `OPS_DISCORD_WEBHOOK_URL` is set and a test notification actually arrives
- [ ] Password reset / auth emails are being delivered (check Supabase auth email settings, not just that the API call succeeds)

## Site config

- [ ] `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_BASE_URL` point at the real production domain, not `localhost`
- [ ] `GROQ_API_KEY` is set in production (separately from the local dev key)

## Sign-off

- [ ] Once every box above is checked, update `baseline-template.md` with real numbers — that's the honest Phase 0 baseline this whole plan is measured against.
