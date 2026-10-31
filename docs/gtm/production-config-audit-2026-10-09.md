# Production configuration name audit

**Date:** October 9, 2026  
**Scope:** Vercel project `strikelab`, production environment variable **names and types only**. Checked with the scoped Vercel CLI after the connector returned 403. No secret values were read, copied, or stored. This audit does not prove that a production deployment has received the current variables or that any integration works.

| Variable | Production name present? | Meaning for the readiness checklist |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Check that it targets the intended project and test auth/data access at runtime. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Test browser auth and RLS; presence alone is insufficient. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Verify only server routes use it and run the authorized teacher journey. |
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | Send a deliberate test error and confirm it arrives. |
| `GROQ_API_KEY` | Yes, listed as Config | Review whether this key is stored with the intended Vercel visibility/type; test quota and failure behavior. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | No | Paid checkout and webhook readiness are unverified and cannot be signed off. Free pilots need no payment details, but paid conversion needs these before use. |
| `STRIPE_PRO_PRICE_ID`, `STRIPE_SCHOOL_PRICE_ID` | No | Verify the current offer and payment route before accepting paid customers. |
| `OPS_DISCORD_WEBHOOK_URL` | No | Name a manual incident responder and channel for pilots; add and test an alert path before relying on automation. |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BASE_URL` | No | Not a configuration blocker: canonical URLs are fixed in `src/lib/site.ts`; `NEXT_PUBLIC_BASE_URL` is an optional Stripe redirect override. Verify deployed links and metadata on the actual domain. |

The Supabase connector exposes one inactive project with a generic name. Its identity has **not** been matched to the Vercel production environment because the Vercel Supabase URL is hidden as a secret. No production SQL was run and the database baseline remains unknown.

## Immediate follow-up

1. Identify the intended Supabase production project from the deployment owner or Vercel dashboard, without placing secret values in this repo.
2. Run [`check-migrations.sql`](../../scripts/metrics/check-migrations.sql) on that project and save redacted results in a restricted operational log. A fingerprint is not a full migration or RLS verification.
3. Run [`rls-audit.sql`](../../scripts/metrics/rls-audit.sql), then rehearse the deployed teacher/student journey with test accounts, including save/reopen, capstone, scorecard, access denial, and deletion.
4. Before accepting payment, configure and test Stripe checkout, webhook, entitlement, and invoice flow. For a free pilot, record the manual incident contact and verify deployed URL behavior first.
