# G1 decision pack: Fall go/no-go, Fri 2026-10-16

Prepared 2026-10-15 from the repo only. Every number below is read from `docs/gtm/crm.csv` via `npm run pipeline`. If you have been talking to people and not logging them, **update `crm.csv` first and re-run `npm run pipeline`**; this pack is only as true as the CRM.

## The gate (mega plan §5, P0)

**GO** if at least 1 leader has a start date on or before Nov 2 and an approval path that clears by Oct 23.
**Otherwise Plan B** (work plan §7).

## What the CRM says today

| Metric | Value |
|---|---|
| Contacts touched | 0 (the two rows in `crm.csv` are labeled EXAMPLE) |
| Replies / calls held | 0 / 0 |
| Verbal yeses with a date | 0 |
| Locked pilots | 0 |

Against the sprint targets (week 4: 40 contacts touched, 14 replies) this is a miss by the numbers on file. Do not argue with it tomorrow; log the truth.

## Decision tree

1. **Is there any real leader with a date ≤ Nov 2 and an approval that clears by Oct 23?**
   - Yes → **GO.** Log it, send the kickoff kit, run the rehearsal (G2) next week.
   - No → step 2.
2. **Will a teacher at your own school sponsor a founder-supported Cohort 0** (they are leader of record; start on or before Nov 2)?
   - Yes → **Plan B-1.** Report it separately from independent pilots, label it "founder-supported" everywhere, including YC material.
   - No → **Plan B-2 only.** All outreach to spring: 5 dated starts between Jan 11 and Feb 1; G3 moves to Feb 28, G4 to Apr 11.
3. Either way: product stays frozen from Oct 23, outreach pace stays at 15 a week through Nov 20, re-plan at Dec 20.

## What a NO-GO changes for YC

Per the YC-readiness plan §10: the application moves a batch; early-submit is off. Say so plainly rather than softening it.

## Readiness scores to re-assess (YC plan §2, today's column)

| Dimension | Plan said (Oct 1) | Evidence today | Founder to confirm |
|---|---|---|---|
| D1 Traction | 0 | No cohort, no real contacts on file | ☐ |
| D2 Insight | 1 | `interview-log.csv` has 1 row (example) | ☐ |
| D3 Revenue | 0 | None | ☐ |
| D4 Market | 2 | `market-sizing.md` v0, sources unchecked | ☐ |
| D7 Product/demo | 4 | Green tests, `/demo` tour, script v0 | ☐ |
| D9 Hygiene | 1 | Signatory (Y6.1) due Oct 9: still open? | ☐ |

## Paste-ready decision-log row

| Date | Decision | Evidence / trigger | Alternative considered | Revisit when |
|---|---|---|---|---|
| 2026-10-16 | **[GO / Plan B-1 / Plan B-2]**: _[fill in]_ | G1: _[n]_ leaders with a date ≤ Nov 2; CRM shows _[n]_ contacts, _[n]_ replies, _[n]_ calls | _[the other branch]_ | Oct 23 (freeze) / Dec 20 (re-plan) |

## Questions only you can answer

1. Any real conversations not yet in `crm.csv`?
2. Is there a teacher at your school who would sponsor Cohort 0?
3. Has an adult signatory been named (Y6.1)?
