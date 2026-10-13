# Impact Ledger: depth and reach

**Purpose:** one honest record of what StrikeLab has done, that serves the YC application, college applications (including Stanford) and any scholarship or grant form. The same numbers go everywhere. If a number isn't in this file with a source, it doesn't go in an application.

**Rules**
- **Reach** counts real people and organizations, taken from the database or a signed agreement. It does not count page views, sign-ups by the founder's own accounts, or "interested."
- **Depth** is what the founder personally did, over time, with evidence you can check. It is not a list of technologies.
- Admissions readers and YC partners both discount inflated numbers. A small true number with a source beats a big vague one. A reader who finds one overstatement stops trusting the rest.
- Nothing here predicts an admissions outcome. This file makes the true story easy to tell.

Last updated: 2026-10-13.

## Depth (what the founder built and sustained)

| Fact | Evidence | Verified |
|---|---|---|
| Started building 2026-08-06; 136 commits over 23 distinct days by 2026-10-13 | `git log` | Yes |
| 23 lessons across 3 tracks (9 investing, 11 options pricing, 3 quant), each with a Python exercise graded in the browser | `src/lib/investingLessons.ts`, `lessons.ts`, `quantLessons.ts` | Yes |
| Cohort system for clubs: launch template, invite link, scorecard (activation, weekly activity, week-4 retention), CSV export | `src/app/teach`, `src/app/cohort`, `scripts/metrics` | Yes |
| 390 automated unit tests in 65 files; lint and build pass | `claims-audit.md` | Yes |
| Browser-side Python (Pyodide), self-hosted so school filters don't break lessons | `scripts/copy-pyodide.mjs`, `tests/python.spec.ts` | Yes |
| Privacy by design: public data map, private leaderboard, no student names shown | `/trust`, migration 0022 | Yes |
| Which parts the founder wrote alone vs. with AI tools | | **Founder must state this. Be specific.** |
| Earlier work, competitions, other projects | | **Founder to list, with links** |

## Reach (who has actually used it)

| Measure | Today | Source |
|---|---|---|
| Clubs or classes that have run a cohort | 0 | `docs/gtm/cohorts.csv` (empty) |
| Students who completed at least one lesson in a leader-run cohort | 0 | `/admin/metrics` |
| Independent learners who have used the lessons | Unknown, "fewer than 20" per the company spec | Pull a count from the database and record the date |
| Schools / districts reached | 0 | CRM |
| Leaders contacted | 0 real contacts logged | `crm.csv` |

**This is the gap.** Depth is already strong. Reach is where every reader will look, and it is zero. Reach is the thing the next three weeks can change, and only by getting real clubs to run it.

## How reach gets recorded

1. Each Friday, copy the numbers from `/admin/metrics` into this table with the date.
2. Every cohort gets a row in `cohorts.csv` the day it starts, including who ran it.
3. Anything quoted from a student or leader needs their written consent (`docs/gtm/`).
4. Round Rock ISD campuses: log each in the CRM; a campus counts only when someone there has agreed to run a cohort or has used it.

## Draft activity-list entries (edit; use only what stays true)

Common App fields have hard character limits: position 50, organization 100, description 150. These drafts use only verified facts and **must be updated as reach changes.** Do not mention pilots, clubs or students until they exist.

| Field | Draft | Chars |
|---|---|---|
| Position | Founder and sole developer, StrikeLab | 37 |
| Description | Built StrikeLab, a free platform where students code finance models in the browser: 23 lessons, club cohort tools, 390 tests. Seeking pilot clubs. | 146 |

Hours per week and weeks per year must come from you, honestly.

## Questions only the founder can answer

1. What grade are you in? This decides which deadlines apply.
2. What else belongs under depth: competitions (you mention an AIME qualifier on `/about`), prior projects, teaching or tutoring?
3. Which decision are you making first: Stanford, YC, or both? They don't conflict until YC asks you to work full time and defer school. Stanford allows a deferral request after admission, but ask Stanford directly before planning around it.
