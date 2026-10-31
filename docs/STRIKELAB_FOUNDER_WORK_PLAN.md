# StrikeLab: founder work plan

**Updated:** October 3, 2026. For what to do next, [`docs/PLAN.md`](PLAN.md) wins; this plan keeps the founder lanes and YC reasoning.  
**Owners:** Isaac and a second founder/collaborator (assign names to lanes in the first working session)  
**Planning horizon:** October 2026 through April 2027  
**Goal:** Build a product that club leaders choose to run again, students finish, and organizations pay for. Use that evidence to make a clear YC application.

This is the operating plan for the two founders. The [master plan](superpowers/plans/2026-09-22-master-plan.md) and [frontend plan](superpowers/plans/2026-09-30-frontend-work-plan.md) remain engineering backlogs. This document changes one major decision in the older strategy: **apply to YC when the founders are ready, without waiting for five completed pilots.** YC currently says early applications are welcome. The current Winter 2027 on-time deadline is **November 2, 2026, 8 p.m. Pacific**. Recheck the [official application page](https://www.ycombinator.com/apply) before submission.

## 1. The bet

**Buyer:** The person who runs a high-school math, coding, investing, economics, or similar club and can get the tool approved or obtain approval. Start with founder-reachable leaders around Round Rock/Austin. Treat a school teacher, an independent club leader, and a district buyer as different buyers until interviews show otherwise.

**User:** A 13+ student who can start with little or no finance or Python knowledge.

**Job:** Give the leader a credible six-week technical-finance program they can run with minimal prep, and give each student a piece of working code and a capstone they can explain.

**Current offer:** Five founder-supported, six-week pilots at no cost; public prices afterward are $199/year per independent club and $499/year per school instructor. These are hypotheses to validate in paid conversations, not proven willingness to pay. Keep students free.

**The one-sentence pitch:** “StrikeLab gives high-school clubs a ready-to-run six-week quant finance lab where students code real models and finish with work they can show.”

**Why this wedge:** StrikeLab already has lessons, a browser Python environment, cohort launch and student/teacher views. The missing proof is that a reachable leader will start a group, students will stay, and a buyer will pay. Do not expand the curriculum to solve a distribution problem.

## 2. What is known today

| Area | Evidence in this repository | Status to use in external claims |
|---|---|---|
| Learning product | 23 lessons in the README; browser exercises, sessions, playground, sandbox | Built in code; verify the live journey on a student device |
| Cohort product | Teacher setup, invites, student home, scorecard, capstone and automated journey coverage are present | Built in code; production migrations and a real rehearsal still need verification |
| Marketing | Clubs, pilot, demo and pricing pages exist; public prices are visible | Live status and conversion are not confirmed here |
| Customer discovery | `docs/gtm/crm.csv` contains only two `EXAMPLE` contacts; interview log contains one `EXAMPLE` interview | **No real customer evidence recorded in the repo** |
| Traction and revenue | Baseline template is blank; weekly scorecard has only a pre-pilot entry | Unknown; do not turn blanks into zeros or claims |
| Production readiness | Every box in `docs/gtm/production-readiness-checklist.md` is still unchecked | Unverified, even though code and tests exist |

The immediate constraint is **getting real leaders and students through the product**, with a safe and measurable production setup. Visual refinement matters where it removes confusion or makes the product trustworthy; it is not the primary milestone.

## 3. Founders: divide ownership before dividing equity

Assign one directly responsible owner for each lane. A second person can help, but the owner closes the loop and updates the shared record.

| Lane | Owner to assign | Weekly result |
|---|---|---|
| Customer development | Founder A | Qualified leader contacts, calls, objections, dated next steps, pilot commitments |
| Product and reliability | Founder B | Working teacher/student journeys, fixes to the largest observed blocker, releases |
| Pilot delivery | Founder A, with Founder B at kickoff | Leaders supported, meetings observed, student feedback, support log |
| Metrics and trust | Founder B | Production checklist, weekly cohort metrics, access checks, incident response |
| YC and company decisions | Both | Honest application, role/commitment agreement, weekly decision log |

If the friend is stronger at outreach or facilitation, swap lanes A and B. Do a four-week working trial: each person owns a lane, ships their weekly result, and handles one difficult customer problem together. At the end, decide whether this is a cofounder relationship, a collaborator relationship, or a different split. Record responsibilities, contribution expectations, decision rights and ownership discussions in writing; get qualified advice before issuing equity or signing school contracts. Being friends alone does not settle company roles.

**Working cadence:** Monday, 30 minutes to choose one customer goal and one product bottleneck. Wednesday, 15-minute unblock. Friday, 30 minutes to update the CRM, scorecard and decision log. Each founder posts what shipped, what customers said, and the next dated action. Protect school/work commitments by reducing feature work first; keep promised customer follow-ups.

## 4. The scorecard that decides what to build

Use [metric definitions](gtm/metric-glossary.md), server-derived cohort data, and one weekly entry in [the scorecard](gtm/weekly-scorecard.md). Track every cohort separately as well as totals. A launch, registration, or page view alone is weak evidence.

| Funnel | Measure each Friday | Initial target or decision use |
|---|---|---|
| Reach | Qualified leaders contacted, replies, discovery calls, pilots booked | First 100 targeted contacts and 20 conversations are a **diagnostic target**, not a claim that this funnel will convert |
| Leader setup | Pilot yes → class launched → first student joined; time for a new leader to share an invite | Under 3 minutes for setup is a usability target; identify where leaders need founder help |
| Student activation | Enrolled → first assigned lesson completed in 7 days | ≥60% across pilots is the current hypothesis gate |
| Learning persistence | Activated → an assigned lesson completed in program week 4 | ≥40% is the current hypothesis gate; also inspect each cohort's small sample size |
| Outcome | Activated → capstone submitted; quality of a student's explanation | ≥35% submission target, plus a human review of a sample of work |
| Customer value | Leader says they will run it again; leader introduction to another qualified leader | Aim for ≥4/5 reuse and ≥3 referrals after five pilots; record what they actually say |
| Commercial proof | Money collected or a dated, priced commitment from an authorized buyer | Aim for two organizations; separately track sales cycle and founder support hours |

**Do not use these thresholds as pass/fail statistics on one small cohort.** Use the individual journeys and interviews to explain the number. If the data pipeline is broken, mark the metric unknown and fix measurement before quoting it.

## 5. The next 72 hours: reset reality

- [ ] **Together:** Hold a 60-minute founder session. Assign the five lanes above, weekly hours, decision maker for pricing/product, and the four-week trial review date. Put the decisions in `docs/gtm/decision-log.md`.
- [ ] **Customer owner:** Replace the `EXAMPLE` rows in `docs/gtm/crm.csv` and `docs/gtm/interview-log.csv` with real entries. Make a first list of 30 reachable leaders, including warm introductions and the name of the person who can approve the tool. Do not add real student PII to the repo.
- [ ] **Product owner:** Work through `docs/gtm/production-readiness-checklist.md` in the actual dashboards. Apply and verify missing database migrations in order, starting with the RLS recursion fix where needed. Record each check's date and evidence. Test sign-up, join, completion, scorecard, code sync, capstone, account deletion and emails with test accounts.
- [ ] **Together:** Run the existing six-week facilitator guide as a rehearsal with one teacher account and one student account on a non-production project. Time setup and first lesson; log every failure and confusing step. Fix blockers before recruiting students.
- [ ] **Customer owner:** Send five personal, specific outreach messages to warm leaders and ask for a 15-minute call. Log the send and next action. This is authorized work for the founders, not an instruction for an agent to send messages.
- [ ] **Metrics owner:** Fill `docs/gtm/baseline-template.md` from production Supabase and Stripe. Put “unknown” where access or definitions prevent a trustworthy number.

## 6. October 2026: get the first real cohort and prepare YC

### Week of October 5: find the buyer and finish the pilot path

**Customer:** Add 30 total qualified organizations; contact at least 15. Seek five discovery calls. Ask how they currently plan meetings, how many students attend, what approval is needed, who controls money, and what would make them repeat. Show the live demo only after hearing their problem. Ask for a specific pilot date and a specific next action, rather than a vague “interested.”

**Product:** Complete the production checks, baseline, and full teacher → student rehearsal. Check the first run on a low-powered Chromebook or comparable device and a phone, on a real school network if a partner permits it. Ship only critical failures in joining, saving work, scorecard accuracy, access control or capstone. Verify the current frontend/performance work against the [frontend backlog](superpowers/plans/2026-09-30-frontend-work-plan.md).

**YC:** Each founder writes their own concrete “what have you built/achieved?” notes. Together draft a plain-language description, the problem insight, what is built, live usage (even if zero), and why this team can solve it. Confirm whether both can work full-time during a YC batch; if not, evaluate YC's Early Decision route and state availability honestly.

### Week of October 12: turn conversations into commitments

**Customer:** Reach 45 cumulative contacts and roughly 10 calls; these are effort targets. Aim for at least one leader who agrees to a start date, expected roster, weekly meeting time and approval path. Send the one-page pilot offer and facilitator guide after a conversation. Follow up within two school days.

**Product:** Have an outside leader attempt to create a cohort and share an invite with no founder navigation. Observe silently. Fix the largest blocker. Have two students attempt the first lesson; record the exact point where they stop or ask for help. Avoid adding features based on a request that has not appeared in actual use.

**YC:** Prepare a 1-minute founders-only video using bullet points, and a separate short product demo. YC asks for all founders in the application video and says the demo belongs in a separate field. Draft the application early enough for a cold reader to tell what the company does in one sentence.

### Week of October 19: readiness gate

**Customer:** Secure the first pilot's named leader, date, roster target and approval. Prepare a second pilot. If contacts are not converting, review the exact objections and change the pitch or segment before expanding the product.

**Product:** Run a supervised rehearsal from invite link to first completed lesson, teacher scorecard and capstone submission. Test permissions, recovery from a network failure, and the leader's ability to find a student who needs help. Freeze nonessential changes before kickoff. A pilot should start only after the student data and basic path have been checked in production.

**YC:** Have the near-final answers reviewed by someone who knows neither StrikeLab nor finance. Remove any claim that cannot be backed by production data or a named conversation. Recheck the live application page for the deadline and requirements.

### Week of October 26: launch and submit

Run the first cohort with a founder at the kickoff. Have students join and finish the first assigned lesson while everyone is together. Record activation by the next Friday. Start a weekly 10-minute leader check-in and two consented student conversations per cohort during the program. Submit a truthful YC application **by November 2, 8 p.m. Pacific** if applying to Winter 2027. Do not hold the application for an arbitrary number of pilots; update YC later if traction changes materially.

**October decision gate:** At least one real cohort has a date and the live path is safe and measurable. If there is no pilot date, shift most effort to customer conversations. If the live path fails, delay student onboarding until the blocker is fixed.

## 7. November–December 2026: prove the learning loop

Run one or two cohorts at a time. Every cohort gets a named founder contact, a weekly leader check-in, visible scorecard, and a support response within one school day. Keep outreach going at a sustainable 5–10 qualified leaders per week so spring is not dependent on a single school. Confirm each partner's holiday weeks in the cohort schedule.

| Program moment | Founder action | Product evidence |
|---|---|---|
| Before start | Approval, roster, date, skip weeks, school-network test, leader guide | Join link and first lesson work on their device |
| Week 1 | Attend kickoff; watch every student reach the first lesson | 7-day activation by cohort and source |
| Weeks 2–3 | Observe confusion; speak with 2–3 students | Completion and saved code across devices |
| Week 4 | Ask why students did or did not return; help leader follow up | Week-4 retention and support hours |
| Weeks 5–6 | Brief capstone, observe presentations, collect opted-in feedback | Capstones submitted; quality review of sample work |
| 7–14 days after | Ask leader whether they would repeat, pay at the stated price, and introduce another leader | Dated answer, paid next step, referral, pilot report |

At the end of each cohort, write a two-page report: enrollment and funnel numbers, what students built, leader burden in hours, three observed failures, student/leader words with permission, and the next product change. This report is for decisions first and marketing only with explicit consent.

**December decision gate:** If students activate but do not persist, change pacing, weekly accountability or the learning experience. If students persist but leaders would not repeat, reduce leader work and improve visibility. If neither works, revisit whether six weeks and this customer segment are the right entry point. Do not hide behind cumulative totals.

## 8. January–April 2027: repeatability and paid proof

**January–February:** Run three more cohorts only if the first pilots show a specific reason to repeat. Try to have at least one start outside the founders' immediate personal network. Give a leader the guide and setup flow without a founder doing the work; measure the support hours still required. Ask for referrals at the end of each pilot. Publish a case study only with the required permission and real cohort-level numbers.

**February–March:** Ask the buyer for a paid next-term commitment at the already stated price. Find out who can authorize purchase, when budgets are set, whether a club can buy independently, and what paperwork blocks the sale. Manual invoices or purchase orders are enough for first customers. Compare annual price with founder support hours and hosting costs; a low price that requires heavy weekly founder work is not a repeatable business. If outcome is strong but the buyer cannot pay, test one alternative buyer/offer at a time and record the decision.

**March–April:** Keep a concise investor/customer packet: live product, 1-minute founder video, separate product demo, cohort-by-cohort funnel, actual revenue/commitments, support burden, consented outcomes, direct customer quotes, competition and a credible expansion thesis. Refresh the YC application or apply to a future batch as appropriate. YC is one possible source of funding; the operating goal remains customers who get value and renew.

**Five-pilot evidence target:** 5 completed cohorts, 50 activated students, ≥60% enrolled-to-activated, ≥40% activated-to-week-4, ≥35% activated-to-capstone, 4/5 leaders wanting to repeat, 3 qualified referrals, and 2 paid or dated priced commitments. These are ambitious decision targets inherited from the prior strategy, not forecasts or YC admission criteria.

## 9. Product priority order

1. **Trust and basic correctness:** production migrations, RLS and authorization, account deletion, recovery from failed saves, error monitoring, backups, incident process, honest content and billing. With minors and school partners, these are launch blockers where student data is at stake.
2. **Leader setup and weekly use:** a leader can set a date, account for breaks, invite students, see who needs help, and understand outcomes without asking a founder.
3. **Student first lesson and persistence:** join through authentication, obvious next step, useful feedback, code that survives device changes, and a capstone that feels worth finishing.
4. **Proof and conversion:** cohort reports, consented outcomes, pricing clarity, an easy buyer conversation and a manual payment path.
5. **Polish tied to a measured problem:** mobile speed, accessibility, visual clarity and confidence at the exact screens customers use.

Put a feature in an active sprint only if it has a named customer, observed friction, expected metric change, owner and check date. The [existing master backlog](superpowers/plans/2026-09-22-master-plan.md) has implementation detail. New tracks, real-time market data, district integrations, national competitions, and a talent marketplace stay outside the active plan until customer evidence unlocks them.

## 10. Acquisition and pricing experiments

**Start with manual distribution.** Warm introductions to club leaders, teachers and local program organizers beat a broad social campaign now. Test two messages: (A) “ready-to-run six-week club program with almost no prep,” and (B) “students finish a real code portfolio piece.” Use the same call to action: a 15-minute conversation. Tag the source and log the actual next action in the CRM. After roughly 20 conversations, compare which problem leaders volunteered before seeing the demo.

**Qualify a pilot:** A named leader, a real group, a meeting slot, expected student count, approval path, and willingness to speak each week. A friendly sign-up without these is a lead, not a pilot.

**Price test:** State the post-pilot price before kickoff. At the end, ask a concrete question: would the authorized buyer commit to run this again at that price next term, and what date could that decision happen? Log “yes,” “no,” and “needs approval” separately. Do not count hypothetical interest as revenue. If five pilots produce strong student outcomes but no buyer commitment, change the buyer/offer/pricing thesis before building more curriculum.

## 11. YC preparation and funding

YC's current [FAQ](https://www.ycombinator.com/faq/) says founders can apply early and need not have revenue. It also says student founders may apply, while founders accepted to a batch are expected to work full-time during and after it; [Early Decision](https://www.ycombinator.com/apply) may fit a later start. The [application page](https://www.ycombinator.com/apply) currently lists Winter 2027's November 2 deadline and January–March in-person program. These facts can change, so check them when applying.

The application should answer directly: what you make, who urgently wants it, what you have built, what people have done in it, what has been paid, what you learned that a generic finance course misses, why the founders are unusually equipped, and what could make the market large beyond the first club wedge. Do not substitute a polished deck for specific observations. Prepare a **1-minute founders-only video** and a separate demo per [YC's video instructions](https://www.ycombinator.com/video). Be explicit about school/full-time availability, incorporation and any uncertainty.

Keep spending low until a pilot proves demand. Use the existing free-tier stack where reliable, manual outreach and manual invoicing. Paid legal review is likely justified before material school contracts or claims about student-data compliance; record its actual cost before committing. Do not raise money solely to finish a long feature list. Funding should accelerate a customer loop that has begun to work.

## 12. Stop/go rules and risks

| Signal | Decision |
|---|---|
| No pilot after ~100 relevant contacts and ~20 real leader conversations | Change the target segment, message or offer; do not solve with more UI |
| Pilot promised but school approval blocks student accounts | Use the approval/data checklist and delay onboarding; test an independent club route if suitable |
| Activation below target | Watch joining and lesson one; fix the first concrete failure |
| Week-4 weak in multiple cohorts | Interview drop-offs; test schedule, facilitator support or session format one at a time |
| Outcomes good, leader workload high | Simplify setup, agendas, scorecard and support burden before adding curriculum |
| Leaders repeat but no one pays | Identify actual budget holder and test buyer/price/offer; keep “would pay” separate from commitment |
| Product breaks during a pilot | Respond to the leader, protect student data, log incident, fix the blocker, then resume |

The biggest company risk is spending two founders' time building more product before any leader commits. The biggest trust risk is treating a tested code path as a verified production system. Every Friday, make the next week's plan from customer evidence and real operational checks.

## 13. Links and source of truth

- Product and local setup: [README](../README.md)
- Existing implementation backlog: [master plan](superpowers/plans/2026-09-22-master-plan.md), [frontend work plan](superpowers/plans/2026-09-30-frontend-work-plan.md)
- Customer and metrics records: [GTM instruments](gtm/README.md), [CRM](gtm/crm.csv), [interview log](gtm/interview-log.csv), [weekly scorecard](gtm/weekly-scorecard.md)
- Trust check: [production readiness](gtm/production-readiness-checklist.md), [pilot agreement checklist](gtm/pilot-agreement-checklist.md)
- External guidance: [YC apply](https://www.ycombinator.com/apply), [YC FAQ](https://www.ycombinator.com/faq/), [YC video](https://www.ycombinator.com/video), [YC on recruiting early users manually](https://www.ycombinator.com/library/96-do-things-that-don-t-scale), [U.S. Department of Education on education-service providers and FERPA](https://studentprivacy.ed.gov/resources/responsibilities-third-party-service-providers-under-ferpa)
