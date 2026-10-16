# Build plan: from "not YC-worthy" to evidence a partner can read

**Date:** 2026-10-15. **Companion:** `2026-10-15-yc-worthiness-review.md` (the findings this plan answers). **If this disagrees with the mega plan or the YC-readiness plan, this plan wins on sequencing and the cap on documents; they still own the metric definitions and proof thresholds.**

**Owner key:** **F** = founder (only you can do it), **A** = agent (Claude can do it with no outside accounts), **F+A** = both. ⚖ = needs a qualified adult/lawyer. **Effort** is `human / agent`, rough. **[needs F]** marks agent tasks that wait on a founder decision.

## 0. The five rules of this plan

1. **Evidence first.** At least half of your working hours go to conversations with leaders, teachers, parents and sponsors, every week, until Gate C. Code does not substitute.
2. **Documentation freeze.** No new plan, spec or strategy document until Gate B, except the one consolidated plan (T10.1) and weekly logs. The repo already holds about 520 KB of planning.
3. **Test the payer, not just the product.** Every call ends with the money question (T1.7), and three payer hypotheses run in parallel (T2).
4. **Cut before adding.** Remove or hide what does not serve the six-week club story (T4) before building anything new.
5. **Every claim has a source or comes out.** Public pages, trust documents and the application only state what was checked.

## 1. The master picture

```
        WEEK 0-1                 WEEKS 2-4               WEEKS 5-10              WEEKS 11-24
 T0 Facts/decisions ──┐
 T1 Demand engine ────┼──► first cohort(s) ──► data ──► T6 retention loop ──► T7 proof ──► T9 application
 T2 Payer tests ──────┤                          │
 T3 Hardening ────────┘ (must finish before      └──► decide the payer (Gate B/C)
 T4 Cut sprawl            any live cohort)
 T5 Funnel and copy
 T8 Founder/legal ⚖ (runs alongside; blocks T9 and any paid ask)
 T10 One plan, doc diet (week 1, then weekly)
```

| Track | Purpose | Tasks | Mostly |
|---|---|---|---|
| T0 | Facts and decisions that steer everything | 7 | F |
| T1 | Demand engine: contacts, interviews, Cohort 0 | 11 | F with A tools |
| T2 | Three payer experiments | 8 | F+A |
| T3 | Hardening before the first live cohort | 12 | A |
| T4 | Cut the sprawl | 8 | A |
| T5 | Funnel, copy, proof page | 11 | A |
| T6 | Retention loop (data-gated) | 7 | A |
| T7 | Proof and measurement | 6 | F+A |
| T8 | Founder, company, legal | 9 | F ⚖ |
| T9 | Application and interview (sequenced late) | 7 | F+A |
| T10 | One plan, documentation diet | 5 | A |
| | **Total** | **91** | |

## 2. Gates and kill criteria

| Gate | Date | Must be true | If not |
|---|---|---|---|
| **G1** (existing) | Oct 16 | Decision logged using `docs/gtm/g1-decision-pack.md` | Plan B (spring starts) |
| **A: ready to be seen** | Oct 31 | T0 done; T3.1 to T3.6 merged and green; **40 real contacts logged**; 8+ conversations held; YC facts known; Cohort 0 sponsor yes/no | Stop all non-T1/T3 work until fixed |
| **B: first evidence** | Nov 30 | A cohort is running (Cohort 0 counts, labeled); 25 conversations; each payer hypothesis has a first result; the single biggest retention bottleneck is named | Re-plan the segment (competition teams, DECA/FBLA, parents) before building more |
| **C: it works without you** | Jan 31 | 3+ cohorts; at least 1 run mostly by the leader; week-4 retention measured; **one payer hypothesis has a priced yes or is killed** | Change the buyer before the product (mega plan G5 rule) |
| **D: paid proof** | Mar 31 | ≥ 2 organizations or families paid or signed a dated, priced commitment | Do not apply on narrative alone |
| **Apply** | See T9.1 | Application checklist (YC-readiness plan §9), YC deadline checked within a week | Wait for the next batch |

**Kill and pivot rules (written now so they are not argued later):**
- 100 contacts, fewer than 3 cohorts: the club wedge is wrong. Switch to the partner channel (T2.5) or parent-paid (T2.1).
- Leaders like it but 0 of 10 would pay or find a payer: leader is a channel, not a buyer. Make the payer hypothesis with the best signal primary.
- Week-4 retention under 40% after one fix cycle: it is a product problem; stop outreach scale-up and fix the named bottleneck.

## 3. T0. Facts and decisions (week 0, all F)

| # | Task | Effort | Done when |
|---|---|---|---|
| T0.1 | **Read YC's own FAQ and Early Decision page; email YC if unclear:** can an under-18 apply, can a high schooler use Early Decision, what is the full-time expectation? | 1 h | A dated note in `decision-log.md` quoting the source |
| T0.2 | ~~Identify `hogri`~~ **Done 2026-10-16: it is Isaac** (alternate git identity). No second contributor; `.mailmap` added | n/a | Done |
| T0.3 | **Write your authorship paragraph:** what you decided and built vs. what Claude wrote. Specific, honest, 150 words | 1 h | A paragraph you can say aloud |
| T0.4 | **Parents conversation:** full-time commitment, adult signatory, what happens to school | 1 to 2 h | Two written sentences each; feeds T8.1, T8.2 |
| T0.5 | **Decide delete vs. flag for the sprawl** (T4): delete is simpler; flags keep optionality | 15 min | Choice logged |
| T0.6 | **Pick the payer hypotheses** to test (default: H1 leader/school, H2 parents, H3 sponsor, H4 partner channel) and their kill thresholds | 30 min | Logged |
| T0.7 | **Name the weekly review slot** (30 min, same time each week) | 5 min | In your calendar |

## 4. T1. Demand engine (F, with A tools)

The cheapest thing in this plan and the one that matters most.

| # | Task | Owner | Effort | Trigger | Done when |
|---|---|---|---|---|---|
| T1.1 | Replace the EXAMPLE rows; **log every contact the same day** in `crm.csv` | F | 5 min per contact | Now | `npm run pipeline` shows real numbers |
| T1.2 | Draft **5 outreach variants per segment** (investing club advisor, math team coach, CS teacher, econ teacher, DECA/FBLA advisor), each with a `?src=` tag so replies are attributable | A | 0 / 1 h | Now | Variants in `docs/gtm/outreach-kit.md`; src tags unique |
| T1.3 | **Volume:** at least 15 new contacts a week; **40 by Oct 31, 100 by Nov 30** | F | 6 h/week | Now | Pipeline matches |
| T1.4 | **Cohort 0:** ask one teacher at your own school to sponsor (teacher is leader of record; label "founder-supported" everywhere) | F | 2 h | Oct 16 | A yes/no and a date, or Plan B logged |
| T1.5 | **Classroom and club visits:** walk into two clubs a week and show `/demo` for 3 minutes | F | 2 h/week | Now | Counted in the CRM as `source: visit` |
| T1.6 | **Interview script v2:** current practice, last failed attempt, who would pay, "what would make you say no" | A | 0 / 1 h | Now | `docs/gtm/interview-log.csv` columns updated |
| T1.7 | **The money question at the end of every call:** "If this worked, who would pay $199: you, a parent, a sponsor, or nobody?" Log the answer | F | 0 | Every call | `payer` column filled for every call |
| T1.8 | **Add `payer` and `willing_to_pay` columns** to `crm.csv` and `interview-log.csv`, and to `npm run pipeline` with a test | A | 0 / 1 h | Now | Pipeline prints "payer split" |
| T1.9 | **30 leader conversations by Dec 20, 15 student conversations by Feb 28** | F | 3 h/week | Now | Counts from the log |
| T1.10 | **Call rehearsal:** agent plays a skeptical teacher ("I have no budget", "our IT will block it", "my kids can't code"); you practice the answers | F+A | 30 min x 3 | Before first calls | Answers shorter and specific |
| T1.11 | **Lost-deal log:** every "no" or "not now" gets a one-line reason | F | 1 min each | Now | Reasons in CRM |

## 5. T2. Payer experiments (F+A)

Test who pays *before* building any payment flow. Everything is a conversation, a page or a form.

| # | Hypothesis / task | Owner | Effort | Success signal | Kill |
|---|---|---|---|---|---|
| T2.1 | **H2: parent-paid.** One-page offer "Winter Quant Lab, 6 weeks, online, 12 students, $X". A drafts the offer and a waitlist page (no payment yet); F sends it to 20 parents/students from the self-serve traffic and own network | F+A | 2 h / 2 h | 10 deposits-of-interest at the stated price | 0 of 20 |
| T2.2 | Parent-paid pre-sale mechanics (Stripe, refunds, guardian consent) **only after** T2.1 hits its signal and T8 is done ⚖ | A | 1 d | n/a | n/a |
| T2.3 | **H3: sponsor.** Draft 20 short emails to recruiting/university-outreach contacts at trading firms, banks, local advisors: ask for a 15-minute call about sponsoring seats for a school cohort or final competition, not money yet | A drafts, F sends | 1 h / 3 h | 2 calls, 1 written interest | 0 calls after 20 emails |
| T2.4 | One-page **sponsor pitch** (what a sponsor gets: aggregate anonymous outcomes only, brand on a competition, a shortlist only with consent) | A | 0 / 1 h | Used in calls | n/a |
| T2.5 | **H4: partner channel.** Approach DECA/FBLA chapter advisors and AMC/Wharton team advisors as *distribution* ("keep your game, add this for the students who want the math") | F | 3 h | 3 chapter advisors run a pilot | 0 of 10 reply |
| T2.6 | **H1: leader/school price test.** In calls, state the price in the first minute and ask for a commitment at the end of the pilot (existing Y7.1) | F | 0 | Recorded yes/no/not-now | n/a |
| T2.7 | **Decision at Dec 20:** one payer hypothesis becomes primary, the others are paused | F | 1 h | Logged in `decision-log.md` | n/a |
| T2.8 | Update `pricing` and `/clubs` to match the winning payer (not before) | A | 0 / 2 h | After T2.7 | n/a |

## 6. T3. Hardening before the first live cohort (agent, in priority order)

Every task ships as one PR with lint, types, unit tests and (where noted) a browser test. Nothing here needs a founder decision unless marked.

| # | Task | Why | Effort | Acceptance |
|---|---|---|---|---|
| **T3.1** | **Stripe webhook:** return 500 on `missing`/`error` so Stripe retries; handle `subscription.created` before the customer row exists (look up by subscription metadata / client reference). Replay out-of-order events in PGlite | Silent loss of a paid subscription (E3) | 0.5 d / 1 h | New test fails on `master`, passes after; `money-paths-audit.md` corrected |
| **T3.2** | **Join code from `crypto`** (`crypto.randomInt`); existing codes keep working; correct the "34 symbols, 1.5 billion" claim in the security review to "32 symbols, about 1.07 billion"; add the firewall-rule note to the runbook | E4 | 2 h / 30 min | Unit test; doc corrected |
| **T3.3** | **Python in a Web Worker** with a 10-second watchdog: terminate and restart the interpreter, show a friendly message; keep the self-hosted runtime and CDN fallback | `while True:` freezes the tab (E1) | 2 to 3 d / half a day | Browser test: infinite loop recovers; existing `tests/python.spec.ts` still passes |
| **T3.4** | **Pre-warm for kickoff:** cache the runtime in the service worker after the first successful load and add a "load the lab now" step to the kickoff kit | 13 MB cold load on school Wi-Fi | 1 d / 2 h | Cold vs. warm load times recorded in the kickoff kit |
| **T3.5** | **AI tutor hardening:** server-force message roles to `user`/`assistant`; fixed safety preamble the client cannot override; input/output screening; **per-class off switch** (migration `0023`, default on for independents, off for cohorts unless the leader enables it); update the privacy page to say student code goes to the provider | E2, minors | 2 d / half a day | Tests: a `system` role from the client is dropped; the switch disables the route; privacy page accurate. **[needs F]** provider data terms (T8.8) |
| **T3.6** | **Age and teacher attestations:** "I am 13 or older" at sign-up; "I am a teacher/advisor" on `/teach/new`; **CSP in report-only mode** | E5 | 1 d / 2 h | Tests; wording reviewed in T8.5 ⚖ |
| T3.7 | **Join page tells the truth:** distinguish "invite code not found" from "server not configured" from "database unreachable" | E6: misreported errors during a live kickoff | 2 h / 30 min | Three states, tested |
| T3.8 | **Rate limiting policy:** fail closed for join, sign-up and AI routes (fail open for read-only); documented | E6 | 0.5 d / 1 h | Test with a failing limiter |
| T3.9 | **Kickoff "site is down" plan:** a printable offline agenda and what to say, in `kickoff-kit.md`; uptime monitor and Supabase point-in-time recovery **[needs F: accounts and billing]** | E6 | 1 d / 1 h | Plan exists; monitor URL logged |
| T3.10 | **Missing tests:** `/api/classes/join` route, `loadCohortScorecard` (against PGlite), cohort home view logic | E7 | 3 d / 1 d | Coverage on those three; no mocks of the database |
| T3.11 | **Staging environment:** a separate Supabase project, the seed script (`npm run rehearsal:seed`) run against it, and one authenticated browser journey (teacher launches, student joins, scorecard updates) **[needs F: create the project, add `REHEARSAL_PROTECTED_HOSTS`]** | E7: nothing tests the whole path with real auth | 2 d / 1 d | Journey test green in CI against staging |
| T3.12 | **Content fixes:** the 2-year LEAPS vega figure and the box-spread description. Then T8.9 (expert review of all 23 lessons) | E9 | 1 h / 30 min | Numbers recomputed from the lesson's own code |

## 7. T4. Cut the sprawl (agent; waits on T0.5)

Rule: anything not serving the six-week club story either goes or sits behind a flag that is **off in cohort mode**. Every PR updates the trust page and data map so they stay true.

| # | Task | Effort | Acceptance |
|---|---|---|---|
| T4.1 | Remove Electron, Capacitor and their scripts/deps | 2 h / 30 min | `package.json` smaller; build, tests green |
| T4.2 | Remove Spline (`@splinetool/*`, `SplineScene`) | 2 h / 30 min | Home still renders; script size drops |
| T4.3 | Move `marketing/` outreach drafts into `docs/gtm/outreach-drafts/` and **fix the stale pricing** (the `$9/mo Pro` and "school license not built" lines); delete `archive/` (history keeps it) or move it to its own repo | 2 h / 1 h | No stale price anywhere |
| T4.4 | Paper-trading sandbox + extra AI routes (`sandbox-insight`, `sandbox-trade-idea`, etc.) + challenges + leaderboard: delete **or** put behind `FEATURES` flags off for cohorts, hidden from nav | 1 d / 2 h | Routes 404 or are flagged; sitemap updated |
| T4.5 | Hide Pro/Stripe checkout from visitors (licenses stay) | 2 h / 30 min | No Pro upsell in the cohort path |
| T4.6 | Fold `/for-teachers` into `/clubs` (308), drop `/roadmap`, `/achievements` from nav, hide the newsletter on teacher pages | 3 h / 1 h | Redirects tested |
| T4.7 | **Re-run Lighthouse** after T4.1 to T4.6; the budget warnings (LCP over 2.0 s, script over 184 KB) should clear | 1 h / 30 min | Numbers in the PR |
| T4.8 | Fix the README: lead with the pilot, state the license/pricing plainly (it still says "Free, open source" next to a paid plan), correct the contact address | 1 h / 30 min | README matches reality |

## 8. T5. Funnel, copy and proof (agent unless noted)

| # | Task | Effort | Measure |
|---|---|---|---|
| T5.1 | **Point every outreach link at `/clubs?src=<tag>`**, never the homepage; keep `/` student-led, but promote the scorecard mock above the Greeks section and make the leader door equal weight | 0.5 d / 2 h | `/clubs` to `/pilot` rate |
| T5.2 | **Preview before sign-up on `/pilot`:** show the sample scorecard and invite message; let a leader type class name and date first, hold it in the browser, create the account after | 2 d / 1 d | `/pilot` visit to account created |
| T5.3 | **Timezone from the browser** (`Intl`), not America/Chicago | 1 h / 15 min | Wizard test |
| T5.4 | **Honest proof block:** "Recruiting N clubs for spring 2027" (your real number), a named advisor and a quote **only with written consent**; empty stays empty | 1 h / 1 h **[needs F]** | n/a |
| T5.5 | **Copy fixes:** "Zero prep" becomes the real prep minutes (measure in Cohort 0 first); remove the promise to help with district data agreements until someone can; "any laptop or Chromebook" gets the phone caveat; the "10 to 25 students" claim gets data or comes out | 2 h / 1 h | Every claim has a source |
| T5.6 | **Accessibility statement** on `/trust`: tested level, date, tool, known gaps (editor, charts), only after a real audit run | 1 d / 3 h | No claim beyond what ran |
| T5.7 | **Teacher-facing one-pager PDF** for principals and IT (data map, subprocessors, allowlist, accessibility) | 0.5 d / 1 h | Attached to outreach |
| T5.8 | **10-second test:** show `/clubs` to 5 strangers; target 4 of 5 can say what it is and who it's for | F, 2 h | Result logged |
| T5.9 | Loading and failure states for `/learn/[sessionId]` and `/lesson/[id]` (Python failed to load, slow network) | 0.5 d / 2 h | Browser tests |
| T5.10 | **Attribution check:** every `?src=` tag reaches the metrics page and the weekly chart | 3 h / 1 h | Splits match a hand count |
| T5.11 | Only after T2.7: rewrite `/pricing` and `/clubs` to match the primary payer | 0.5 d / 2 h | n/a |

## 9. T6. Retention loop (agent; build only what Cohort 0 data names)

The reviewers agree the in-session experience is strong and the between-meetings experience is weak. **Do not build these speculatively.** Each starts when the scorecard says week-4 retention or overdue work is the bottleneck.

| # | Task | Trigger |
|---|---|---|
| T6.1 | Finish-the-week moment on the cohort home (what you did, what's next) | First cohort finishes week 1 |
| T6.2 | Re-entry after a missed week: "Here's the smallest way back in" | Overdue students observed |
| T6.3 | "At the next meeting" line (the leader sets it in two taps) | Leaders ask |
| T6.4 | **Needs-help digest** (build-queue Q11): a copy-ready message to nudge the behind students | A leader asks "who should I nudge?" twice |
| T6.5 | **Reminders** (Q15): weekly note email, quiet hours, one-click unsubscribe, cohort students only | Week-4 retention under 40% and interviews point to forgetting |
| T6.6 | **Week-4 scaffolding** for the Greeks: hint ladder, worked example, "explain one to the group" task | Week-4 drop-off |
| T6.7 | Measure each change: week-4 active rate, overdue-to-complete within 3 days | Every release |

## 10. T7. Proof and measurement

| # | Task | Owner | Done when |
|---|---|---|---|
| T7.1 | Weekly growth chart (north star: students who submit a capstone in a leader-run cohort; backup: activated students) | A | 3+ points by Nov 30 |
| T7.2 | Consent templates (leader, student, guardian) in one page each ⚖ | A drafts | A lawyer or school contact has read them |
| T7.3 | Unit economics sheet: support hours per cohort, hosting cost per student, conversion to paid | F+A | Filled after Cohort 0 |
| T7.4 | Pilot report generator (Q12) | A | After the first cohort ends |
| T7.5 | Public outcomes strip and one case study (Q18/19) | A | Only with written consent; every number links to its source |
| T7.6 | Support-hours log filled for every cohort | F | `npm run support` shows the number |

## 11. T8. Founder, company and legal (F; ⚖ needs a qualified adult)

| # | Task | Notes |
|---|---|---|
| T8.1 | Written **commitment plan** (school, deferral, parents) | One honest page; the partner will ask early |
| T8.2 | **Name the adult signatory** | Needed for any pilot agreement, Stripe, formation |
| T8.3 | Decide **formation** timing (Delaware C-corp is the usual shape) ⚖ | Don't form before the trigger; know the person and cost |
| T8.4 | **IP assignment / licensing** for anyone who contributes code or copy **from now on** (the new teammate); `hogri` turned out to be Isaac, so nothing is owed for past commits ⚖ | Clean ownership before any investor looks |
| T8.5 | **Privacy and terms review** by a qualified person; COPPA/FERPA questions ⚖; reviews the age and teacher attestation wording | No compliance claims until then |
| T8.6 | **Stripe account in the right name** ⚖ | Before the first payment |
| T8.7 | **Three advisors** who will vouch (teacher, startup-literate adult, a pilot leader) | 30-minute monthly call each |
| T8.8 | **Provider data terms** for the AI tutor's model host: retention, training use, a data-processing agreement | Feeds T3.5 and the privacy page |
| T8.9 | **A finance-literate reviewer** for the 23 lessons (a teacher or college student) | List of corrections back to the agent |

## 12. T9. Application and interview (sequenced late on purpose)

| # | Task | Rule |
|---|---|---|
| T9.1 | **Choose the route** after T0.1: (a) regular application when Gate D holds; (b) Early Decision if high schoolers qualify; (c) build evidence now and apply at 18 / after graduation. The rest of this plan is the same work under all three | Decide at Gate A |
| T9.2 | Application: update `docs/yc/application-draft.md` only at Gates B, C, D | Max 90 min a week |
| T9.3 | Answer the 16-question list at the end of the draft in your own words | Before Gate B |
| T9.4 | Interview bank: answer in your own words; mock interviews with the agent (10 minutes each) | Start after Gate A; 10 total before applying |
| T9.5 | Founder video v1 (throwaway) and final | v1 at Gate B, final at apply time |
| T9.6 | Numbers card recited cold | Before the interview |
| T9.7 | Check the real YC deadlines and form within a week of submitting | Do not trust any earlier copy |

## 13. T10. One plan, documentation diet (agent, week 1)

| # | Task | Done when |
|---|---|---|
| T10.1 | **Consolidate the 12 plan/spec files into one `docs/PLAN.md`** (current truth: this week, next gate, open decisions, kill rules); move the rest to `docs/archive/` with a pointer | PLAN.md fits two screens |
| T10.2 | Fix remaining drift in the living docs (numbers, "tests for every policy" wording in `docs/trust/data-map.md`, contact address) | `numbers-audit` re-run is clean |
| T10.3 | **Weekly review** (30 min): contacts, replies, calls, yeses, payer split, bottleneck, one decision | Row added to the decision log each week |
| T10.4 | **Stop-doing list** in `PLAN.md`: no new strategy docs, no new tracks, no new integrations, no features before the scorecard names them | Enforced by the agent |
| T10.5 | Agent rule: at the end of any session, report conversations held, not files written | In the session summary |

## 14. Sequencing: who does what first

**Wave 1: this week, agent works while you talk to people (no founder input needed):**
T3.1, T3.2, T3.7, T3.8 (small, high-risk-reduction), T3.12 (content fixes), T1.2, T1.6, T1.8, T10.1, T10.2, T4.3 (stale pricing), T5.3.

**Wave 2: after a few founder decisions (T0.5, T0.6) and before Gate A:**
T3.3, T3.4, T3.5, T3.6, T4.1 to T4.8, T5.1, T5.5, T3.10.

**Wave 3: needs your accounts or time (staging, billing, partners):**
T3.9, T3.11, T5.2, T5.4, T2.1 to T2.5, T7.2.

**Founder first week (in order):** T0.1 and T0.2 (1.25 hours), T1.1 and T1.3 (log and send the first 15 contacts), T1.4 (ask your school's teacher), T0.4.

## 15. Where your hours go (target mix)

| Activity | Share of founder hours |
|---|---|
| Outreach, visits, interviews, payer questions (T1, T2) | 50% |
| Supporting live cohorts | 20% |
| Decisions, reviews, parents, legal (T0, T8, T10.3) | 15% |
| Application and interview prep (T9) | at most 10% until Gate C |
| School | the rest. Do not trade it away for this plan |

## 16. Risks to this plan

| Risk | Mitigation |
|---|---|
| Outreach feels slower than building, so the plan drifts back to code | Rule 1; T10.5 reports conversations, not commits |
| An agent task quietly widens | Each task lists acceptance; one PR each |
| The YC route is ruled out for now | T9.1 (b)/(c): the same evidence work still produces a company |
| The wedge is wrong | Kill rules in section 2 decide in days, not months |
| Hardening delays outreach | Wave 1 and 2 run in parallel with your calls; no live cohort starts before T3.1 to T3.6 are merged |
| The agent's reports are wrong | Every reviewer claim above is tagged; verify before acting on anything marked [R] |
