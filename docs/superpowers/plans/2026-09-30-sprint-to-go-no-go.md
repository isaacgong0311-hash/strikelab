# Sprint to the Fall Go/No-Go: Wed Sep 30 → Fri Oct 16

**Date:** 2026-09-30 (runway week 3, Wednesday)
**Status:** Active. This replaces the day-level schedule in `2026-09-29-work-plan-to-first-kickoff.md` §4 for weeks 3–5. That plan's gates, task details (G1–G6, P1–P7) and Plan B are unchanged, and this sprint points to them rather than repeating them.
**Length:** 17 days, ending at the gate.

---

## 0. Why a new plan

Yesterday's plans were written while there was still engineering to do. **Now there isn't.** The agent tasks (AG1–AG8) and the pre-freeze build queue (Q1–Q3, Q5) are done and verified:
- 346 tests, 38/38 browser tests, and the performance budgets pass;
- everything is waiting in PRs #32 → #35.

Every item left on the critical path needs *you*: a person to talk to, a dashboard to open, or a PR to merge.

And the calendar has moved. Monday and Tuesday passed with zero contacts, so the week-3 targets from the work plan (20 contacts and 3 calls booked by Fri Oct 2) no longer fit. **The gate date does not move:** a six-week cohort with a Thanksgiving break week must start by Nov 2, so a leader has to say yes by Oct 16 (work plan §2). This plan fits the same work into the days that are left, and puts outreach first on every day.

---

## 1. The one rule

**Every day, the first thing you do for StrikeLab is one outreach action.** A message, a conversation, a follow-up. Only after that do you touch dashboards, PRs or docs. If a day only has 15 minutes, those 15 minutes go to outreach.

The reason: every other item on this list can be done in an evening, and none of them matters without a leader. A leader's yes takes days of back-and-forth that can't be compressed at the end.

---

## 2. Your unfair advantage: you're at school every day

The outreach kit is written for email, but **your best channel is walking into a teacher's classroom at lunch or after class**. You see the most likely pilot leaders in person five days a week. A 2-minute conversation ("I built something and I'd love your advice on whether your club could use it") beats ten emails. It also skips the reply-rate problem entirely.

**The in-person ask (2 minutes):**
1. "Do you have two minutes? I built a six-week lab where students code real finance models, like option pricing, in the browser, and finish with a project they can show."
2. "I'm looking for two clubs to run it with this fall, free, and I'd run it with you. Could your [club] be one?"
3. If they're interested: "Can I show you the teacher view for 10 minutes this week? When's good?" Put it on the calendar right there.
4. If not: "Who else here do you think would want this?" (This is the introduction ask.)

Log it in `crm.csv` that evening with `source: own_school` or `own_teacher`.

---

## 3. The scoreboard (targets, re-cut)

Run `npm run pipeline` every Friday, and any evening you want to see where you are.

| By | Contacts touched | Calls or meetings held | Verbal yes (date ≤ Nov 2) | Locked pilot |
|---|---|---|---|---|
| **Fri Oct 2** | 10 | 1 booked | — | — |
| **Sun Oct 4** | 20 | 2 booked | — | — |
| **Fri Oct 9** | 35 | 5 held | **1** | — |
| **Fri Oct 16 (gate)** | 45 | 8–10 held | 2 | **≥ 1** |

"Contacts touched" includes in-person asks. Warm contacts (own school, own teachers, introductions) should be at least 70% of the total until Oct 9.

---

## 4. Day by day

Time boxes assume about 12 hours a week: about 1.5 hours on a school day and 2–3 on a weekend day. **Bold** items are the ones that matter if the day goes badly.

### Week 3: set up the pipeline, find out what production is

| Day | Outreach (first) | Then | Done when |
|---|---|---|---|
| **Wed Sep 30** (today) | **Write your warm-20 list into `crm.csv`** (names, `status: to_contact`, `source`), and delete the two `EXAMPLE` rows (30 min). **Send 5 warm messages** to the people you won't see in person (`outreach-kit.md` §2) (30 min) | Create the free Cal.com link, and set `NEXT_PUBLIC_PILOT_CALL_URL` in Vercel → Settings → Environment Variables (Production) (15 min) | 20 names in the CRM, 5 marked `contacted` |
| **Thu Oct 1** | **3 in-person asks at school** (§2) | Supabase SQL editor: run `scripts/metrics/check-migrations.sql` and just *read* the result (5 min). Write down which migrations are `MISSING` | 8 contacted; you know what production is missing |
| **Fri Oct 2** | **2 more in-person asks + day-3 follow-ups** on Wednesday's emails | Review and **merge #32** (30 min; the review notes are on the PR). Then run `npm run pipeline` and paste the output into `weekly-scorecard.md` | 10 contacted; #32 merged; the first pipeline row logged |
| **Sat Oct 3** | 5 new contacts (introductions from Thursday and Friday, or tier-4 cold) | **P1: apply the missing migrations**, 0015 first, then in order through 0022 (45 min, `production-readiness-checklist.md` P1). **P2: pick the sign-up email fix** and set it up: Resend plus custom SMTP, or confirmation off (45 min). **P3:** Google OAuth consent screen set to "In production" (10 min) | All 22 migrations `applied`; sign-up email decided and working |
| **Sun Oct 4** | Day-7 follow-ups; 5 new contacts | Merge #33, #34, #35 in order once I've got each one green (15 min of clicking; see §5). Plan next week's calls | 20 contacted, 2 calls booked, and all four PRs merged |

### Week 4: conversations and the first yes

Every weekday: **3–4 new contacts or follow-ups first**, then calls, then one production item.

| Day | Beyond outreach and calls | Done when |
|---|---|---|
| **Mon Oct 5** | Walk the leader flow on production (sign up from `/pilot` → invite page → print the card), then delete the test account (20 min) | The leader flow works in production |
| **Tue Oct 6** | **P4:** a Sentry test error, a Discord alert test, and a free uptime monitor (45 min) | Alerts proven |
| **Wed Oct 7** | **P5:** create the staging Supabase project and apply every migration; point Vercel Preview at it (45 min) | Staging exists |
| **Thu Oct 8** | **P7:** run `baseline.sql` and fill `baseline-template.md` (30 min) | Baseline recorded |
| **Fri Oct 9** | `npm run pipeline` → scorecard. **If there's no verbal yes yet, see §6** | 35 contacted, 5 calls held, 1 yes |

**On every call:** follow `outreach-kit.md` §3 exactly. Ask all five qualifying questions, and offer to set up the class right there in `/teach/new`. **Send the approval packet (§5 of the kit) within the hour of any yes.**

### Weekend Oct 10–11: rehearse

| Day | Work | Done when |
|---|---|---|
| **Sat Oct 10** | **P6 smoke test on staging** (`docs/gtm/smoke-test.md`, 45 min), then **rehearsal part 1**: weeks 1–3 with a teacher and a student test account (1.5h). Send me anything that breaks | The smoke test passes, or its failures are reported to me |
| **Sun Oct 11** | Follow-ups; start paperwork for any path-C (district-review) leaders, aimed at January | The spring pipeline has started |

### Week 5: lock it, then decide

| Day | Work | Done when |
|---|---|---|
| **Mon Oct 12** | For each yes: approval confirmed or submitted, meeting day and room, roster estimate, school calendar checked (Thanksgiving + finals) | Dates are real, not hoped |
| **Tue Oct 13** | Book the **school-device test** for week 6 with the leader (`kickoff-kit.md` §2), and send IT the allowlist (§1 of the kit) if the school filters | Test on the calendar |
| **Wed Oct 14** | Rehearsal part 2 (weeks 4–6 plus capstone share and revoke) on staging (1.5h) | The rehearsal is done |
| **Thu Oct 15** | Pre-gate check: go through §7 below | You know which way Friday goes |
| **Fri Oct 16** | **Gate.** Write the decision in `decision-log.md` with the pipeline numbers. Pass → kickoff prep (work plan week 6). Fail → Plan B (work plan §7) | Decision logged |

---

## 5. What I (the agent) do during the sprint

Nothing on the critical path is waiting on code, so I'll **react, not build**:

| When | I do |
|---|---|
| You merge #32 | The same day: retarget #33 → `master`, get its CI green (including the Lighthouse check, which runs there for the first time), then #34, then #35. You only click merge |
| The smoke test or a rehearsal finds a problem | Fix it within a day, with a test, as a small PR |
| A leader asks for something specific | Tell you honestly whether it's a before-kickoff item or an after-kickoff one |
| Code freeze, **Fri Oct 23** | After it: only blocking fixes, until the first cohort's week 1 is done |

**Things I could build, but only if you ask:**
- **The staging seed script (Q16):** fills staging with a demo cohort of 10 fake students, if rehearsing with two accounts is too thin to trust the scorecard.
- ~~**A printable one-page leave-behind** for in-person asks.~~ **Built (Oct 5):** open `/pilot/leave-behind` and print it on Letter (turn off "Headers and footers" in the print dialog). Its QR goes to `/pilot?src=leave_behind`, so anyone who signs up after scanning it is tagged `leave_behind` by first-touch attribution (`src/lib/attribution.ts`). Log the conversation itself in `crm.csv` as usual; the tag only counts what the sheet converts.

Nothing else gets built before the gate.

---

## 6. If you fall behind

| Signal | Do this |
|---|---|
| **Sun Oct 4: fewer than 10 contacts** | Push every P-item except P1 (migrations) to next week. The following week is outreach only, and every school day includes 3 in-person asks |
| **Fri Oct 9: no calls held yet** | Ask each of your own teachers directly: "Who in this building runs a club that would want this?" At the same time, **ask one teacher whether they'd sponsor a Cohort 0 if no outside club commits** (Plan B, work plan §7). Asking early costs nothing and saves a week |
| **A yes needs district review (path C)** | Don't drop it: start the paperwork and aim it at January. Keep looking for a path-A club for the fall |
| **Exam or heavy school week** | 15 minutes of outreach a day, nothing else. Replies to leaders never wait |
| **Production work goes wrong** (a migration errors, email won't send) | Stop and send me the exact error. Don't debug it alone; it's not the best use of your hours |

---

## 7. The gate on Fri Oct 16: pre-check (Thursday)

Pass means **all** of these:
- [ ] ≥ 1 leader said yes with a week-1 date on or before **Mon Nov 2**
- [ ] Their approval path is A (none needed), or B with the answer expected by **Fri Oct 23**
- [ ] P1 done: all 22 migrations applied in production
- [ ] P2 done: 5 test sign-ups get their email within a minute, or confirmation is off and logged
- [ ] The smoke test passed on staging

If the first two pass but a P-item doesn't, **it's still a pass**: finish the P-item before the Oct 23 readiness gate. If either of the first two fails, it's Plan B: log it, pick Cohort 0 or spring-only, and move outreach to January starts.

---

## 8. Ignore until Oct 16

All of it is written down and waiting in the mega plan. None of it helps get a leader by Friday the 16th:
- performance work beyond what shipped;
- CSS consolidation;
- new lessons or session conversions;
- reminders, the showcase, or proof pages;
- the YC application;
- company formation.

The one exception is legal item L1: **find out this week which adult (a parent) would sign a pilot agreement** if a school asks for one. It's a single conversation, and a school may ask the day after a yes.

---

## 9. Which document, when

| You need to… | Open |
|---|---|
| Write a message, run a call, handle an objection, send the approval packet | `docs/gtm/outreach-kit.md` |
| Log a contact / see your numbers | `docs/gtm/crm.csv` → `npm run pipeline` |
| Fix production (migrations, email, Google, alerts, staging, baseline) | `docs/gtm/production-readiness-checklist.md` |
| Test the whole journey | `docs/gtm/smoke-test.md` |
| Prepare a school (IT allowlist, device test, kickoff day, parent note) | `docs/gtm/kickoff-kit.md` |
| Answer "what data do you keep?" | `docs/trust/data-map.md` |
| Run a cohort week by week | `docs/gtm/pilot-runbook.md` + `facilitator-guide.md` |
| See the big picture | `docs/superpowers/plans/2026-09-29-mega-plan.md` |

---

## 10. Four answers needed from you this week

1. **Merge #32** (Friday at the latest). Everything else in the PR chain waits on it.
2. **Sign-up email:** Resend plus custom SMTP (recommended), or turn confirmation off for the pilot?
3. **The adult signatory** for pilot agreements (L1): which parent?
4. **Your hours:** is about 12 hours a week realistic through Oct 16? If it's closer to 8, keep the outreach time and cut P4 and P7 to the week after the gate.
