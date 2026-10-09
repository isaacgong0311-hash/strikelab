# Weekly Scorecard

Fill this in once a week, every week. Until the first cohort runs, fill in the **pipeline** rows (definitions in `metric-glossary.md`; `npm run pipeline` prints them from `crm.csv`); once a cohort is running, fill in both. Ten minutes, same day each week (Friday afternoon is a good habit). Terms are defined in `metric-glossary.md`.

Copy the row template below to the bottom of the log each week — don't edit past weeks.

## Row template

```
### Week of YYYY-MM-DD

| Pipeline | Value |
|---|---|
| Contacts touched (cumulative) | |
| Warm share of contacts | |
| Replies (cumulative) | |
| Calls held (cumulative) | |
| Verbal yeses with a date | |
| Locked pilots | |
| Leaders by approval path (A / B / C) | |
| Founder hours: GTM / product / review / pilot support | |

| Metric | Value |
|---|---|
| Cohorts currently running | |
| Total enrolled (all cohorts) | |
| Activated this week (new) | |
| Active this week (any assigned lesson completed) | |
| Week-4 retained (cohorts in week 4+) | |
| Capstone submissions (cumulative) | |
| Leaders reporting they'll run it again (cumulative) | |
| Referrals received (cumulative) | |
| Paying / committed orgs (cumulative) | |

**Biggest bottleneck this week:** ...

**One change going into next week:** ...

**Decision-log entries this week:** (link the row in decision-log.md, if any)
```

## Log

### Week of 2026-09-14 (Phase 0 baseline)

| Metric | Value |
|---|---|
| Cohorts currently running | 0 |
| Total enrolled (all cohorts) | — see baseline-template.md |
| Activated this week (new) | — not measurable until Phase 1 ships |
| Active this week | — not measurable until Phase 1 ships |
| Week-4 retained | — not measurable until Phase 1 ships |
| Capstone submissions (cumulative) | 0 |
| Leaders reporting they'll run it again | 0 |
| Referrals received | 0 |
| Paying / committed orgs | 0 |

**Biggest bottleneck this week:** No cohort operating system yet — can't launch a real pilot until Phase 1 ships (student cohort home, completion timestamps, capstone).

**One change going into next week:** Finish and land the Phase 1 engineering slice, then recruit the first pilot leader.

### Week of 2026-10-05 (from the repo only, written Fri Oct 9)

`npm run pipeline` as of 2026-10-09:

| Metric | Value |
|---|---|
| Contacts touched (cumulative) | 0 |
| Replies (cumulative) | 0 |
| Calls held (cumulative) | 0 |
| Verbal yeses with a date | 0 |
| Locked pilots | 0 |
| Leaders by approval path (A / B / C) | 0 / 0 / 0 |
| Cohorts currently running | 0 |
| Capstone submissions (cumulative) | 0 |
| Paying / committed orgs | 0 |

These come from `crm.csv`, which has no real rows. If outreach is happening somewhere else, the numbers above are wrong; paste the rows into `crm.csv`.

**Gate, one week out (Fri Oct 16):** target was about 35 contacted and 5 calls held by today (sprint plan §3). Actual: 0 and 0. Plan B (a teacher-sponsored Cohort 0) in the sprint plan §6 is the next move if no calls are held by next Friday.

**Engineering state:** #39 merged Oct 7. #40 is green (CI, preview) and waiting on the founder's merge; #37 waits on #40 and has a 13-file reconciliation checklist in the work plan. Staging does not exist (no Supabase project), so the signed-in smoke test and the staging checks have not run. Done this week: the printable leave-behind, `npm run smoke`, an IT-allowlist re-check, measured first-run Python load times, and `docs/NORTH_STAR.md`.

**Biggest bottleneck this week:** distribution. Zero conversations with leaders are logged, so there is no evidence about what a leader needs.

**One change going into next week:** one logged outreach action a day, before any other work, starting with an in-person ask at the founder's own school using `/pilot/leave-behind`.

**Decision-log entries this week:** 2026-10-05 (work plan), 2026-10-07 (challenges free), 2026-10-08 (verification work).
