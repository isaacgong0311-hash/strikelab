# Honest Baseline — Phase 0

Fill in real numbers pulled from the actual dashboards, not estimates. This is the number the whole plan is measured against improving — an inflated baseline just makes week 32 look like more progress than it was.

| Metric | Value | Where to get it | As of |
|---|---|---|---|
| Total registered users | | Supabase `auth.users` count | |
| Users who completed ≥1 lesson | | Supabase `progress` table, `completed` array non-empty | |
| Total lesson completions (cumulative) | | Sum of `progress.completed` array lengths | |
| Classes created | | Supabase `classes` table count | |
| Students enrolled in a class | | Supabase `class_members` table count | |
| Cohorts launched via the new launch flow | | `classes` rows with `template_id` set (0 until Phase 1 ships and the first cohort launches) | |
| Paying subscribers | | Stripe dashboard, active subscriptions | |
| MRR | | Stripe dashboard | |
| Acquisition sources represented | | `classes.signup_source` / marketing UTM data, if tracked | |

## Instructions

1. Run through `production-readiness-checklist.md` first — a baseline pulled from a half-configured production environment isn't honest either.
2. Pull each number directly from Supabase/Stripe, not from memory or a prior pitch deck.
3. Paste this filled-in table into the first entry of `weekly-scorecard.md` and into the StrikeLab Runway artifact's proof-threshold inputs.
4. Re-run this exact table at the start of Phase 4 (paid proof) to show real delta, not narrative.
