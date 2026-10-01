# StrikeLab YC-Readiness Plan: October 2026 → the application

**Date:** 2026-10-01 (runway week 3)
**Owner:** the founder decides and talks to people. Agents build and draft.
**Status:** Living document. Re-score §2 at every gate (G1–G6) and rewrite the plan when a score is wrong.

This plan answers one question: **what has to be true, and be provable, on the day a YC partner reads the application or sits across from us in the interview?** It does not replace the operating plans. It adds the YC layer on top of them and says where the two meet.

| Scope | Document (stays authoritative) |
|---|---|
| Strategy, proof thresholds | `specs/2026-09-13-strikelab-yc-company-design.md` |
| Phases, gates G1–G7, build queue Q1–Q30, revenue ladder, legal L1–L9 | `plans/2026-09-29-mega-plan.md` |
| Day by day to the Oct 16 go/no-go | `plans/2026-09-30-sprint-to-go-no-go.md` |
| Weekly instruments (CRM, scorecard, kits) | `docs/gtm/` |
| **This plan** | What YC scores, the gap, the application work, the interview, the fallbacks |

If this plan and the mega plan disagree on dates or gates, the mega plan wins. This plan owns the YC-specific tracks (§4) and the readiness scores (§2).

---

## 1. The honest verdict

**The product is far ahead of the company.** 23 lessons, a cohort operating system, a scorecard, 346 tests and CI. Almost none of that is what a YC partner decides on. They decide on:

1. **Are real people using it, and is it growing?** (Today: no leader contacts, no cohort. This is the whole gap.)
2. **Does the founder understand something others don't?** (Partly written down, not yet earned from interviews.)
3. **Is the market big, and is there a path from the wedge to it?** (A $199 club license is a wedge, not a business, and the mega plan §8 says so.)
4. **Will the founder work on this full time?** (Open. A student founder must answer this honestly and concretely.)

Everything else (more lessons, more features, a prettier site) moves the application's needle by approximately zero until 1 has numbers. So:

> **YC-ready means: 5 cohorts run by outside leaders, activation and retention numbers on a chart, ≥ 2 organizations paying or committed in writing, and a founder who can explain why this becomes a large company. The work in this plan is building and then proving that, on a schedule.**

**Two rules that follow:**
- **Don't apply on narrative alone.** The spec (§7) and mega plan (G6) already say this. A weak application can be re-sent, but only after the numbers exist.
- **Draft the application now anyway (Y8).** Writing "Describe your traction" with an empty answer is the cheapest way to see exactly which gaps matter. We update it monthly.

---

## 2. The YC readiness scorecard

Scored 0–5 by the founder with the agent's help. **5 = a partner would not need to ask.** Re-score at every gate and paste the table into `decision-log.md`.

| # | Dimension | What a partner looks for | Today (Oct 1) | G3 (Dec 20) | G5 (Mar 28) | Apply (Apr 25) |
|---|---|---|---|---|---|---|
| D1 | **Traction** | Real users, repeat use, a growing number, shown by cohort and source | **0** | 2 | 3 | 4 |
| D2 | **Customer insight** | Specific things learned from many conversations that others don't know | **1** | 2 | 3 | 4 |
| D3 | **Revenue / willingness to pay** | Money collected, or dated and priced commitments from authorized buyers | **0** | 0 | 3 | 4 |
| D4 | **Market and path to big** | A believable route from clubs → districts → sponsors/pipeline; bottom-up sizing with sources | **2** | 2 | 3 | 4 |
| D5 | **Founder** | Built the thing, shipped fast, understands the user, honest and clear | **4** | 4 | 4 | 5 |
| D6 | **Commitment and team** | Full-time plan, solo-founder plan or cofounder, advisors | **2** | 2 | 3 | 4 |
| D7 | **Product and demo** | A working product shown in under 2 minutes with real data | **4** | 4 | 4 | 5 |
| D8 | **Execution speed** | A visible record of fast iteration on customer feedback | **3** | 4 | 4 | 5 |
| D9 | **Company hygiene** | Incorporated, IP assigned, cap table clean, no legal surprises, privacy defensible | **1** | 1 | 3 | 4 |
| D10 | **Application and interview** | Clear, matter-of-fact writing; a video; fluent answers to hard questions | **2** | 2 | 3 | 5 |

Why these numbers: D5 and D7 are high because the founder built a differentiated working product. D1 and D3 are zero because nothing outside the founder's circle has used it or paid. Every gate in the mega plan exists to move D1–D3; this plan makes sure D4–D10 move with them rather than being left to the last month.

**The bar to apply:** no dimension below 3, D1 ≥ 4, and a written answer to every item in §9. If D1 is below 3 on Apr 25, wait for the next batch (G6).

---

## 3. The calendar (YC track beside the pilot track)

The pilot calendar is in the mega plan §5. This table adds only the YC deliverables.

| When | Pilot track (existing) | YC track (this plan) |
|---|---|---|
| **Oct 1–16** | Outreach, production checks, **G1** | Y8: application v0 drafted (rough, ugly, complete) by Oct 31. Y2: interview log running from the first call. Y6: name the adult signatory |
| **Oct 17–25** | Rehearsal, **G2**, freeze | Y4: record a rough founder video v0 (2 min, throwaway). Y6: decide the company-formation timing |
| **Oct 26–Dec 20** | First cohorts, **G3** | Y1: the weekly growth chart. Y2: 15+ conversations logged. Y3: competition map. Y8: v1 of the application after G3. First monthly investor-style update (Nov 1) |
| **Dec 21–Jan 3** | Winter build | Y5: the commitment and school plan, written and agreed with parents. Y3: the market-sizing worksheet with sources |
| **Jan 4–Feb 28** | Cohorts C–E, **G4** | Y7: the first paid asks. Y9: data room folder. Y8: first mock interview. Consent for quotes and a case study |
| **Mar 1–28** | Paid proof, **G5** | Y6: formation and Stripe in the right name, if not done. Y8: application v2; mock interviews ×5 |
| **Mar 29–Apr 25** | Apply, **G6** | Final video and demo; 10 mock interviews total; submit. **Check the real YC deadlines at ycombinator.com/apply when this phase starts** |

**Early-submit option (decide at G3, Dec 20):** if a cohort hits the thresholds (activation ≥ 60%, week-4 ≥ 40%) *and* a leader has asked to pay, consider submitting to the next batch rather than waiting for Apr 25. Strong early numbers beat a polished late application. The cost of waiting is a batch.

---

## 4. The tracks

IDs are Y1–Y9. **Owner** is F (founder) or A (agent). **Trigger** is when it starts. Done-when is a thing you can check.

### Y1. Traction engine: growth you can chart (owner F, with A tooling)

The pilot plan produces the traction. This track makes it *legible* to someone who has 10 minutes.

| # | Task | Owner | Trigger | Done when |
|---|---|---|---|---|
| Y1.1 | **Pick the one growth metric and chart it weekly.** Default: *students who submitted a capstone in a leader-run cohort* (the north star). Backup before any capstone exists: *activated students in leader-run cohorts*. Plot cumulative and week over week in the Friday scorecard | F | Oct 9 | A chart exists in `weekly-scorecard.md` with ≥ 3 points |
| Y1.2 | **(Done 2026-10-01: `leader_source` on `weekly-scorecard.sql`, new `growth.sql`.)** **Everything by cohort and by source.** `?src=` attribution is already stored; confirm the scorecard splits by source and by leader-run vs founder-run | A | Q10 trigger | The metrics page shows both splits |
| Y1.3 | **Leader-run vs founder-run flag.** YC will ask "does it work without you?" Record for every cohort who actually ran the weekly meetings | F | Oct 26 | Every cohort row says who ran it |
| Y1.4 | **Weekly founder update** to 3–5 advisors/supporters: three numbers, one lesson, one ask. This also builds the paper trail YC asks about | F | Nov 1 | 4 consecutive updates sent |
| Y1.5 | **A referral ledger.** Each leader asked "who else should run this?" within 48 hours of the end-of-pilot interview; referrals logged in `crm.csv` with `source: referral` | F | First end-of-pilot interview | ≥ 3 referrals recorded (a proof threshold) |

### Y2. Customer insight: earn the "insight" answer (owner F)

The most common weakness in student/edtech applications is a thesis that was never tested against many conversations.

| # | Task | Owner | Trigger | Done when |
|---|---|---|---|---|
| Y2.1 | **Interview log discipline.** Use `interview-log.csv` for every leader call: what they do today, what failed last time, what would make them say no, their exact words (with consent) | F | First call | 15 rows by Dec 20, 30 by Feb 28 |
| Y2.2 | **A "non-obvious things we've learned" list.** After every 5 interviews, write down what surprised you. These become the application's insight answer. Cut anything a generic edtech pitch would also say | F + A drafts | Oct 26 | 5 specific, surprising, sourced items by Feb 28 |
| Y2.3 | **Lost-pilot log.** Every "no" or "not now" gets a one-line reason in the CRM. The reasons are the best evidence of where the segment is | F | Now | Every closed-lost row has a reason |
| Y2.4 | **5 student interviews per cohort** (already in the spec). Ask what they'd tell a friend and what they'd drop | F | Each cohort's week 4 | ≥ 5 per cohort |
| Y2.5 | **The pain-severity ranking.** Once 20 leader conversations exist, rank the top 3 problems by how often and how hard they bite. The product claim must match the top one | A drafts, F decides | 20 conversations | A one-page ranking referenced in the application |

### Y3. Market and "why this gets big" (owners A research, F judges)

The mega plan §8 already states the ladder (clubs → districts → summer cohorts → sponsored seats → talent pipeline). A partner will push on *which rung is real and how big it is.*

| # | Task | Owner | Trigger | Done when |
|---|---|---|---|---|
| Y3.1 | **Bottom-up market sizing worksheet** (spreadsheet): number of US high schools × share with a relevant club (math, CS, investing, econ, DECA/FBLA, competitions) × price × realistic penetration. **Every input sourced with a link; anything unsourced is marked as an assumption.** Do not publish numbers we can't source | A | Dec 21 | A sheet with a source column; the founder has checked each source |
| Y3.2 | **Competition map.** Stock simulators, financial-literacy curricula, coding platforms, quant-competition programs, and "internships for teens" products: what each does, price, who buys, and what StrikeLab does that they don't. The spec §2 names the starting set | A | Nov 15 | One page, each claim sourced; reviewed by the founder |
| Y3.3 | **The "why now / why us" paragraphs** (one each, ≤ 80 words). Why now: browser-based Python (WebAssembly) makes code-first finance teachable with no install; students and teachers want proof of ability, not certificates. Why us: a student founder who is the user and built the product alone. Tighten only after interviews confirm | F | Dec 20 | Two paragraphs the founder can say without notes |
| Y3.4 | **The big-company story in 5 sentences.** Wedge → repeated cohorts → district agreements → sponsored seats → verified record of what students can build. State plainly which parts are unproven, and the evidence that would prove each | F | Jan 31 | Written, read aloud to two outsiders, edited |
| Y3.5 | **Talent-pipeline reality check.** Talk to 3–5 people at finance firms or quant programs about whether a verified student portfolio would change a decision. Even three conversations beats an untested claim | F | Feb 1 | Notes in the interview log; the claim stays, shrinks or is cut |

### Y4. Product and demo that sells itself (owner A, reviewed by F)

The product is already good. The job is to make it **hold up under a partner's 10-minute test** and to reduce founder rescue work.

| # | Task | Owner | Trigger | Done when |
|---|---|---|---|---|
| Y4.1 | **The 2-minute demo script** on the real journey: leader creates a cohort → students join → a student ships a pricing function → the scorecard updates → a capstone. Uses real (consented) or clearly-labeled example data. Never fabricated student work | A drafts, F records | Oct 25 (v0); Apr 1 (final) | A script with timings, a recording, and a "what if the demo fails" fallback |
| Y4.2 | **The live product never embarrasses us.** Uptime monitor, Sentry alerts (P4), staging (P5), the smoke test (P6), and a bad-network fallback for the demo (Python bundle served from strikelab.dev, already done in Q1) | F + A | G2 | The checks in `production-readiness-checklist.md` all pass |
| Y4.3 | **(Done 2026-10-01: `docs/gtm/cohorts.csv`, `support-log.csv`, `npm run support`. Y1.3 is the `run_by` column.)** **A support-hours log per cohort.** Track every founder minute spent unblocking a cohort. YC will ask how much hand-holding it takes; the mega plan's target is falling hours per cohort | F | Cohort A | A number per cohort in the scorecard |
| Y4.4 | **The `burden` items from the build queue** (Q10–Q12, Q14, Q17), taken only when the scorecard says so. Don't add features to look bigger | A | Per queue triggers | See mega plan §7 |
| Y4.5 | **A public proof page** (Q18/Q19): outcomes strip and one consented case study. Only after consent (E8). Nothing invented | A | Consent from ≥ 1 leader | Live and every number links to its source |

### Y5. Founder, commitment and team (owner F with parents)

The spec §2 flags this honestly: YC expects accepted founders to work on the company full time during and after the batch, and the founder plans to stay enrolled in school. This is the question that most needs a real answer *before* the interview, not during it.

| # | Task | Owner | Trigger | Done when |
|---|---|---|---|---|
| Y5.1 | **Write the commitment plan.** What happens to school if accepted: deferral, graduation timeline, parental support and approval, living and travel logistics, and whether the founder is of age to sign. One honest page. Do not imply availability that doesn't exist | F + parents | Dec 21 | A one-page plan the parents have read and agreed with |
| Y5.2 | **The solo-founder position.** Solo founders can apply (spec §2). Prepare the answer to "why solo and who fills the gaps?": named advisors, the first-helper ladder (mega plan §11), and the evidence the product got built alone | F | Jan 31 | A 60-second answer |
| Y5.3 | **Cofounder rule (from the spec §8):** only if there's demonstrated working chemistry, complementary ownership and a shared full-time path. Never add one just for the application. If someone like that exists, start a 4–6 week trial project, not a title | F | Whenever a real candidate appears | A decision logged |
| Y5.4 | **2–3 advisors who'll vouch.** A teacher advisor (mega plan §14), a startup-literate adult, and ideally a pilot leader who'd talk to YC if asked. Ask for a 30-minute monthly call and permission to name them | F | Nov 1 | 3 named advisors and a first call each |
| Y5.5 | **The founder story, in plain words.** What was seen, what was built, who it helped. Specific achievements beat adjectives (the YC guidance quoted in the spec §2) | F + A edits | Jan 31 | 150 words, no superlatives, every claim checkable |

### Y6. Company, legal and cap table (owner F + adult signatory; ⚖ = qualified review needed)

The mega plan §10 (L1–L9) is the source. The YC-specific deadlines:

| # | Task | When | Notes |
|---|---|---|---|
| Y6.1 | **Name the adult signatory** (L1) | Oct 9 | Needed for any path-B/C pilot agreement. Ask a parent this week |
| Y6.2 | **Decide the formation timeline** (L3, L4): Delaware C-corp is the usual shape for venture-backed companies. Incorporation, officers, founder stock and vesting, IP assignment, bank account. An adult incorporator/officer and a lawyer are needed ⚖ | Decide Oct 25; form by Mar 1 or at the first paid contract, whichever is first | Don't form until the trigger fires, but know the cost and the person before it does |
| Y6.3 | **Stripe account in the right name** (L2) ⚖ | Before the first payment | A parent is likely the account representative while the founder is a minor |
| Y6.4 | **Privacy and terms reviewed** (L6) ⚖ | Before the first paid contract | No "FERPA compliant" or "COPPA compliant" claims until a qualified reviewer says so. The data map (`docs/trust/data-map.md`) is the starting point |
| Y6.5 | **Consents** (L7): leader + student + guardian for any quote, capstone or case study | Before anything goes public | One-page templates in `docs/gtm/` |
| Y6.6 | **Data room folder.** One place (private) with: incorporation docs, IP assignment, signed pilot agreements, DPAs, privacy policy and terms, the data map, security review, metrics exports, pilot reports, consents | Jan 31 | Every item a partner or investor could ask for is one link away |
| Y6.7 | **Trademark search for "StrikeLab"** (L9) | Before any brand spend | A free search first |

### Y7. Revenue and paid proof (owner F; A builds the minimum)

Mega plan §8 and G5 are the source. YC-relevant refinements:

| # | Task | Owner | Done when |
|---|---|---|---|
| Y7.1 | **State the price in the first call** (already policy) and ask for the commitment at the end-of-pilot interview, in writing | F | Every end-of-pilot interview has a recorded yes/no/not-now to price |
| Y7.2 | **What counts as paid proof** (spec §3): money collected, or a dated, priced commitment from an authorized buyer. "Sounds interesting" never counts. Keep the signed or emailed proof in the data room | F | ≥ 2 by Mar 28 |
| Y7.3 | **Manual first.** Q20 (invoice request) and Q21 (Club checkout) only after a leader says yes to paying. Don't automate billing before demand | A | Per queue triggers |
| Y7.4 | **Unit economics sheet:** support hours per cohort, hosting cost per student, conversion free → paid, renewal intent. A partner will ask these in the first five minutes | F | Filled after cohort A, updated each cohort |
| Y7.5 | **Plan for the "$199 is small" objection.** Prepare the answer: license prices are the proof of willingness to pay; the larger rungs (district, sponsored seats) are the plan; show which rung has evidence | F | Rehearsed in a mock interview |

### Y8. The application and the interview (owner F; A drafts and plays the interviewer)

| # | Task | Owner | When | Done when |
|---|---|---|---|---|
| Y8.1 | **Application v0.** Write a full answer to every question on the current YC form (fetch it fresh from ycombinator.com/apply; do not rely on memory). Empty or weak answers are the point: they show the gaps | F + A | Oct 31 | A complete document at `docs/yc/application-draft.md` |
| Y8.2 | **The one-sentence company description.** Current candidate: *StrikeLab gives high-school clubs a ready-to-run technical-finance lab where students code real market models and finish with work they can show.* Test: could a stranger repeat it after hearing it once? | F | Nov 15, revisit each gate | Said aloud to 5 non-experts without changing it |
| Y8.3 | **Application v1 / v2 / final** after G3, G4, G5. Each version replaces guesses with numbers and drops anything unproven | F + A | Dec 21, Mar 1, Apr 15 | Diff of each version in git |
| Y8.4 | **The founder video.** Plain, short, no script-reading: who you are, what you built, what you learned from leaders. v0 is throwaway (Oct 25); the final is recorded in April | F | Oct 25, Apr 10 | Watched by two outsiders with no notes asking to cut anything |
| Y8.5 | **The hard-questions bank.** At least 40 questions, with written 30-second answers: *Why would a school pay? Why not use a stock simulator? What if the teacher stops? What happens to minors' data? Why can't a competitor copy this? How big can this get? Why solo? Will you work full time? What have you learned that surprised you? What's your growth rate? What would make you quit?* The agent generates the first list; the founder writes every answer | A drafts, F answers | Jan 31 | 40 questions with answers in `docs/yc/interview-bank.md` |
| Y8.6 | **Mock interviews.** 10 sessions of 10 minutes, with an agent in a "skeptical partner" role and at least 3 with real people who have started companies. Record, listen back, cut filler | F + A | 1 by Feb 28, 10 by Apr 20 | Answers are short, specific and honest about gaps |
| Y8.7 | **The "numbers on one page" card.** The 8–10 numbers you must know cold, updated every Friday: cohorts, students activated, activation %, week-4 %, capstones, leader reuse, referrals, paid/committed, support hours per cohort, weekly growth | F | Dec 20 | You can recite it with no notes |
| Y8.8 | **Honesty rule.** Every figure in the application links to a source in the data room. When a number is bad, say so and say what you changed. A partner trusts a founder who names the weak spot first | F | Always | No unsourced claim |

### Y9. Engineering hygiene for diligence (owner A)

YC partners rarely read the code, but investors, school IT reviewers and technical advisors will skim the repo and the trust docs.

| # | Task | Owner | When | Done when |
|---|---|---|---|---|
| Y9.1 | **(Done 2026-10-01: `finpath/` and `SUBMISSION.md` moved to `archive/`; README leads with the pilot. Electron/Capacitor stay because `package.json` scripts use them; `marketing/` holds outreach drafts.)** **Repo tells one story.** The repo root also holds `finpath/` (a separate hackathon app), `marketing/`, Electron/Capacitor files, `SUBMISSION.md`. Move the unrelated pieces to an `archive/` folder or a separate repo, and make `README.md` open with the pilot product and the proof | A | Winter build (Dec 21) | README answers: what is it, who runs it, what has it proven, how to try it in 2 minutes |
| Y9.2 | **Public numbers match the repo.** Test counts, lesson counts, "23 lessons" etc. checked against reality before any public claim | A | Each gate | A one-line check in the gate checklist |
| Y9.3 | **Keep CI green and the budgets enforced.** 346 tests, accessibility, Lighthouse budgets | A | Always | No red `master` |
| Y9.4 | **(Already fixed: migration 0020 and the `23505` handler; audit doc updated 2026-10-01.)** **Close the known risks in `docs/money-paths-audit.md`.** The Stripe webhook ordering gap and the certificate race are documented; fix them before the first payment | A | Before Q20/Q21 | Fixed with tests |
| Y9.5 | **Security and privacy posture one-pager** for school IT: where data lives, who can see it, retention, deletion, subprocessors, incident process. Built from `docs/trust/` | A | Before a district-review pilot | One page, no compliance claims without Y6.4 |
| Y9.6 | **A backup and restore drill** for the production database; Supabase Pro only when the trigger in the mega plan §13 fires | F + A | Before cohort A | A restore tested once |

---

## 5. The weekly rhythm (YC additions)

The Monday scorecard ritual already exists. Add three things:

- **Friday (30 min):** update the readiness scores that changed (§2), the numbers card (Y8.7), and the growth chart (Y1.1).
- **Last Friday of the month (45 min):** send the founder update (Y1.4); re-read application v-current and mark every sentence that became true, or became false.
- **Every gate:** re-score §2, log it in `decision-log.md`, and decide whether to change the plan before changing the product.

**The rule that protects the founder's time** (spec §4): no week is all coding. Y1–Y2 and Y8 take about 3 hours a week and are not optional. If hours run short, cut Y4.4 and Y9 first, never Y1 or Y2.

---

## 6. What the next 14 days look like (YC track only)

The outreach sprint stays the priority (sprint plan §1: the first action every day is outreach). These are the few YC items that fit in the gaps:

| By | Item |
|---|---|
| **Fri Oct 2** | Skim this plan; tell the agent which scores in §2 look wrong |
| **Fri Oct 9** | Y6.1 name the adult signatory. Y1.1 pick the growth metric. Y2.3 lost-pilot log rule added to the CRM |
| **Sun Oct 11** | Ask a teacher and one startup-literate adult to be advisors (Y5.4) |
| **Fri Oct 16** | G1 decision logged with the §2 scores re-assessed |
| **Oct 17–31** | Y8.1 application v0 (agent drafts from the repo and docs; founder fills the gaps in their own words). Y4.1 demo script v0 |

---

## 7. What the agent can do right now (and what it can't)

**Can do on request, with no external accounts:**
1. Draft application v0 from the repo and docs, with `[NEEDS FOUNDER]` markers on every claim only the founder can make (Y8.1).
2. Build the interview bank and run mock interviews in chat (Y8.5, Y8.6).
3. Prepare the competition map and sizing worksheet *shell*; the founder verifies every source (Y3.1, Y3.2).
4. Reorganize the repo for the investor/IT reader (Y9.1).
5. Add the cohort-source and leader-run splits and the support-hours field to the metrics, if the scorecard doesn't show them yet (Y1.2, Y1.3, Y4.3).

**Can't do, and shouldn't pretend to:**
- Contact leaders, hold calls, or collect the interviews that make D1 and D2 real.
- Incorporate, open a bank account, sign for Stripe, or judge legal questions (⚖ items).
- Decide the school/commitment plan (Y5.1) or add a cofounder.
- Invent users, quotes, capstones, metrics or testimonials. Examples stay labeled "Example" until consented real work exists.

---

## 8. Risks specific to the YC goal

| Risk | Signal | Response |
|---|---|---|
| **Application polish substitutes for traction** | More time on the video than on outreach | The sprint rule stands: outreach first, every day. Y8 gets capped at about 1.5 hours a week until G3 |
| **The wedge sounds small** | Partners ask "how is this venture-scale?" | Y3.4 and Y7.5 prepared; show evidence for the rung that's real, state the others as plans |
| **"Student founder" read as a risk, not an asset** | Questions about age, school, parents, signing authority | Y5.1 and Y6.1 answered concretely; the age is stated plainly and the evidence of shipping does the arguing |
| **Metrics don't hold up** | Activation or retention far under the thresholds | Don't hide it: show the fix cycle and the change in numbers (the mega plan's G3 rule). Delay the application rather than defend weak data |
| **Overstating privacy or compliance** | Marketing says "compliant" without a review | Y6.4: no claims until reviewed |
| **Founder overload** | < 8 hours a week for two weeks | Cut product work first, then Y9, then Y3; never cut outreach or interviews |
| **Missing the batch window** | A strong cohort finishes right after a deadline | Check deadlines at the start of P5 (and at G3 for the early-submit option) |

---

## 9. The "apply" checklist

Submit only when **every box is true** (or the gap is written down and has an honest explanation):

**Traction**
- [ ] ≥ 5 cohorts completed, ≥ 50 activated students (spec §4)
- [ ] Activation ≥ 60%, week-4 retention ≥ 40%, capstone ≥ 35% of activated, shown by cohort and source
- [ ] ≥ 2 cohorts were run mostly by the leader, not the founder
- [ ] A weekly growth chart with ≥ 8 points
- [ ] ≥ 4 of 5 leaders say they'd run it again; ≥ 3 referrals

**Revenue**
- [ ] ≥ 2 organizations paid or signed a dated, priced commitment, with the proof in the data room
- [ ] A unit economics sheet with real numbers

**Insight and market**
- [ ] ≥ 30 logged leader conversations and ≥ 15 student interviews
- [ ] 5 specific things learned that a generic edtech pitch would miss
- [ ] A sourced competition map and a sourced bottom-up sizing sheet
- [ ] The "why this gets big" story in five sentences, with the unproven parts marked

**Founder and company**
- [ ] A written, parent-approved commitment plan (Y5.1)
- [ ] A clear solo-founder answer (or a cofounder who passed a real trial)
- [ ] ≥ 3 advisors who agreed to be named
- [ ] Incorporation, IP assignment and Stripe sorted, or a written plan with dates (Y6)
- [ ] Privacy, terms and pilot agreement reviewed by a qualified person (Y6.4)

**Application and interview**
- [ ] Application final; every number linked to a source
- [ ] Founder video watched by two outsiders
- [ ] A working 2-minute demo that doesn't break on a bad network
- [ ] 10 mock interviews done; the numbers card recited cold
- [ ] The real YC deadline and form checked within the last week

---

## 10. If it doesn't go to plan

Mirrors the mega plan's gates; only the YC consequence is stated here.

| Event | YC consequence |
|---|---|
| G1 fails (no fall pilot) | The application moves a batch. Plan B (mega plan §7) keeps a Cohort 0 and starts spring outreach now |
| G3 fails (no cohort hits the thresholds) | Fix cycle; the early-submit option is off; target the batch after G4 |
| G4 fails | Don't ask for money on weak outcomes; delay the application until the numbers hold |
| G5 fails (nobody pays) | Change the buyer before the product (mega plan §4). Applying without paid proof is possible only if usage is strong and the buyer experiments are documented, and the application must say so plainly |
| G6 fails (proof table mostly unmet) | Keep running cohorts; apply to the next batch with better numbers. Applying on narrative alone is worse than waiting |

**A good "no" is still progress.** Every dimension in §2 that moved is real, and the company can continue as a small, profitable program or on non-dilutive funding (mega plan §11, §12).

---

## 11. Decisions for the founder this week

1. **Adopt this plan** as the YC layer on top of the mega plan (recommended). Log it in `decision-log.md`.
2. **Agree the §2 scores**, or tell the agent which are wrong.
3. **Who's the adult signatory** (Y6.1)? Ask a parent before Oct 9.
4. **The early-submit option** (§3): leave it open until G3, or rule it out now?
5. **Start application v0 now** (recommended), or wait until after G1?

---

## 12. Change log

| Date | Change |
|---|---|
| 2026-10-01 | Created. |
