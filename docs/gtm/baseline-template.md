# Honest Baseline — Phase 0

Fill in real numbers pulled from the actual dashboards, not estimates. This is the number the whole plan is measured against improving — an inflated baseline just makes week 32 look like more progress than it was.

| Metric | Value | Where to get it | As of |
|---|---|---|---|
| Total registered users | unknown | Supabase `auth.users` count | unknown |
| Users who completed ≥1 lesson | unknown | Supabase `progress` table, `completed` array non-empty | unknown |
| Total lesson completions (cumulative) | unknown | Sum of `progress.completed` array lengths | unknown |
| Classes created | unknown | Supabase `classes` table count | unknown |
| Students enrolled in a class | unknown | Supabase `class_members` table count | unknown |
| Cohorts launched via the new launch flow | unknown | `classes` rows with `template_id` set; code exists, production count unverified | unknown |
| Paying subscribers | unknown | Stripe dashboard, active subscriptions | unknown |
| MRR | unknown | Stripe dashboard | unknown |
| Acquisition sources represented | unknown | `profiles.signup_source` from the first `?src=` at sign-up | unknown |

## Instructions

1. Run through `production-readiness-checklist.md` first — a baseline pulled from a half-configured production environment isn't honest either.
2. Pull each number directly from Supabase/Stripe, not from memory or a prior pitch deck.
3. Add a dated baseline entry to `weekly-scorecard.md`; leave the historical September entry unchanged. Use only verified numbers in investor material.
4. Re-run this exact table at the start of Phase 4 (paid proof) to show real delta, not narrative.
