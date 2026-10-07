# The Numbers Card

**Readiness plan item Y8.7.** The numbers to know cold, updated every Friday. In a YC interview, a number you have to look up reads as a number you don't watch. Each row says where the number comes from, so updating this takes about ten minutes.

**Rule:** copy numbers exactly from the source. If a number is bad, it stays bad here; write what you changed next to it.

| # | Number | Definition | Where it comes from | This week | Last week |
|---|---|---|---|---|---|
| 1 | Cohorts launched | Classes with a start date (leader-run and founder-run counted separately) | `/admin/metrics` KPI row; `docs/gtm/cohorts.csv` for who ran it | | |
| 2 | Students enrolled | Joined a launched cohort | `/admin/metrics` KPI row | | |
| 3 | Activation | Finished the first assigned lesson within 7 days of joining or the start | `/admin/metrics` cohorts table ("Activated"); definitions in `docs/gtm/metric-glossary.md` | | |
| 4 | Week-4 retention | Activated students active in program week 4 | `/admin/metrics` cohorts table | | |
| 5 | Capstones submitted (north star) | Submitted capstones in launched cohorts | `/admin/metrics` hero number and chart | | |
| 6 | Active this week | Students who finished an assigned lesson this week | `/admin/metrics` KPI row | | |
| 7 | Leader reuse | Leaders who said they'll run it again (end-of-pilot interview) | `docs/gtm/interview-log.csv` | | |
| 8 | Referrals | Leaders introduced by another leader | `npm run pipeline` (source `referral`) | | |
| 9 | Paid or committed orgs | Money received, or a signed, dated, priced commitment | `docs/gtm/crm.csv` status `committed`/`paid`; proof in the data room | | |
| 10 | Support hours per cohort | Founder time spent unblocking a cohort | `npm run support` | | |
| 11 | Pipeline | Contacts touched → calls held → verbal yes → locked | `npm run pipeline` | | |

**Week-over-week growth** for 5 and 6 is in the `/admin/metrics` weekly table. Quote the trend over at least four weeks, not one week's jump.
