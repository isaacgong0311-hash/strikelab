# Per-Cohort Pilot Runbook

One copy of the checklist below per cohort. Copy it into a new section at the bottom of this file headed `## Cohort <letter>: <club>, <school>`, and tick boxes as you go. Timings are relative to kickoff (T-0 = the first meeting). The steps come from master plan G1; the detail lives in the linked docs.

---

## Checklist template

```
## Cohort ?: [club], [school]

Leader: [name, email, phone] · Approval path: A / B / C · Expected students: ?
Kickoff (T-0): [date] · Meeting day and time: [..] · Break weeks: [..]
Scorecard: /dashboard/class/[id]

### T-14 (two weeks before)
- [ ] Approval done, or confirmed not needed (CRM notes say how)
- [ ] Start date and break weeks confirmed against the school calendar
- [ ] Leader has the facilitator guide (docs/gtm/facilitator-guide.md or the class page)
- [ ] IT allowlist sent (kickoff-kit.md §1), if the school has a filter
- [ ] Parent note sent or ready (kickoff-kit.md §4)

### T-7
- [ ] Cohort launched in /teach with the right start date and break weeks
- [ ] Device and network test passed at the school (kickoff-kit.md §2), logged in the CRM
- [ ] Join cards printed, or the link ready for the projector
- [ ] Leader has sent students the "we start next week" message

### T-0 (kickoff)
- [ ] Kickoff runbook followed (kickoff-kit.md §3)
- [ ] Joined: ___ / expected ___ · Finished inv-1 in the room: ___
- [ ] Note to the leader within 24h: who hasn't joined or started
- [ ] Kickoff interview with the leader (interview-log.csv)
- [ ] Observation notes started (pilot-observation-notes.md)

### Weekly (same day each week)
- [ ] Wk1  check-in (10 min) · scorecard read · needs-help list sent to the leader
- [ ] Wk2  check-in · 2–3 student interviews (consented, 15 min each)
- [ ] Wk3  check-in · Python works on school devices (Black-Scholes week)
- [ ] Wk4  check-in · 2–3 student interviews · week-4 retention read
- [ ] Wk5  check-in · capstone briefing: show both example capstones (/demo/capstone/…)
- [ ] Wk6  check-in · attend or observe presentations · capstones submitted: ___

### After
- [ ] T+7   Program-completed metric final (scorecard + CSV export saved)
- [ ] T+7   End-of-pilot interview with the leader: run it again? pay? who else should run it? (interview-log.csv, CRM referral_from)
- [ ] T+9   Referral asks sent within 48h of the interview
- [ ] T+14  Pilot report written (pilot-report-template.md) · decision-log entries · thank-you sent

Support log (every request, with minutes spent):
| Date | From | Request | Minutes | Resolution |
|---|---|---|---|---|
```

---

## Rules that apply to every cohort

- **Reply to the leader within 24 hours on school days** (master plan G3). Every request goes in the support log. It measures leader burden, which decides whether the pilot can scale.
- **The Monday scorecard ritual** (master plan C3) covers all running cohorts at once: run `scripts/metrics/weekly-scorecard.sql`, paste the numbers into `weekly-scorecard.md`, name the single biggest bottleneck, pick **one** change.
- **Consent before quotes.** No student quote, name or capstone leaves this repo without the consent described in master plan E8.
- **Founder-supported cohorts are labelled** (work plan §7, Plan B) in the heading, the report and every combined table.
