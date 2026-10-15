# Rehearsal cohort seed (Q16)

One command builds a launched cohort in **week 4** with 10 clearly fake students ("Rehearsal Student 03 (fake)", `@rehearsal.invalid` emails) so you can rehearse the kickoff (G2) and the Monday scorecard on realistic data. For a **staging or local** Supabase project only.

## Run it

```bash
# 1. Sign up in the target project with the account that should own the cohort.
# 2. Dry run (prints what it would do, writes nothing):
npm run rehearsal:seed -- --teacher you@example.com --host <project>.supabase.co
# 3. Write it:
npm run rehearsal:seed -- --teacher you@example.com --host <project>.supabase.co --apply
# Replace an old one / remove everything it made:
npm run rehearsal:seed -- --teacher you@example.com --host <host> --reset --apply
npm run rehearsal:seed -- --host <host> --clean --apply
```

Needs `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (they must be the **staging** project's).

## Safety

- You must pass `--host` and it must match the configured project, so you always name where it writes.
- Put your production host in `REHEARSAL_PROTECTED_HOSTS` (comma-separated) in `.env.local`; the script then refuses it outright. **Do this once.**
- It only touches the class with join code `RHSL42` and users `@rehearsal.invalid`. Nothing is written under a real person's name.

## What the ten students look like

| # | Story |
|---|---|
| 01 | Ahead of schedule, capstone submitted |
| 02 | On track, mid week 4, capstone draft |
| 03 | On track, steady |
| 04 | Behind: one lesson short of week 2 |
| 05 | Stuck on week 1, quiet for 12 days |
| 06, 07 | Joined, never finished a lesson |
| 08 | Did week 1, dropped off 15 days ago |
| 09 | Joined in week 2, caught up on week 1 |
| 10 | Joined today |

Expect the scorecard to show a mix of activated and not, a "needs help" list, and one capstone. Tested against the real migrations in `src/lib/gtm/rehearsalSeed.db.test.ts`.

## Not yet verified

The planner is tested against the full schema in PGlite. The `--apply` path (Supabase admin API: create users, insert rows) has not been run against a hosted project; do a dry run first and tell the agent about anything odd. Node prints a harmless `MODULE_TYPELESS_PACKAGE_JSON` warning because the script imports `template.ts` directly.
