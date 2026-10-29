# StrikeLab investor readiness and execution plan

**As of:** October 9, 2026. For what to do next, [`docs/PLAN.md`](PLAN.md) wins; this plan keeps the evidence and claim rules.  
**Owner:** Isaac; assign a directly responsible owner for each lane when a second founder is confirmed  
**Horizon:** now through April 2027, with a rolling weekly review  
**Operating objective:** prove that reachable leaders launch cohorts, students learn and persist, and a buyer repeats at a sustainable price. Make every external claim traceable to evidence.

This plan is the investor-facing operating layer over the existing [founder plan](STRIKELAB_FOUNDER_WORK_PLAN.md), [engineering master plan](superpowers/plans/2026-09-22-master-plan.md), and [frontend plan](superpowers/plans/2026-09-30-frontend-work-plan.md). Those documents contain useful details; their old dates and completed-status statements are not current proof. The founder plan was already present as an untracked file when this plan was written, so it is preserved as-is.

## 0. Executive decision

Three possible paths are available:

| Approach | Benefit | Failure mode | Decision |
|---|---|---|---|
| Lead with a deck and broad market story | Quick to assemble | Investors cannot verify demand, outcomes, or economics | Do only after the evidence packet exists |
| Build more curriculum and polish first | Visible product progress | Adds scope before the first buyer and retention loop are proven | Defer except observed pilot blockers |
| Run narrow, measurable, founder-supported pilots | Produces customer, learning, and payment evidence | Requires manual outreach and careful operations | **Chosen critical path** |

The six-week technical-finance lab for clubs and instructors remains the wedge. Students remain free. The $199 club and $499 instructor annual prices are offer hypotheses until a real authorized buyer pays or commits. Do not count software features, sample capstones, demo data, verbal enthusiasm, or a scheduled call as traction.

## 1. Evidence standard and current truth

### What the repo demonstrates

- A Next.js 16.2.6 / React 19 app with lessons, browser coding, cohort launch, teacher and student views, capstones, scorecards, demo fixtures, Stripe plumbing, Supabase migrations, and automated tests.
- SQL for baseline, leader funnel, cohort scorecard, and migration checks in `scripts/metrics/`.
- A public six-week offer and two proposed annual prices on `/clubs`, `/pilot`, and `/pricing`.

### What is not demonstrated by the repo

- Production migration status, live environment configuration, data recovery, email delivery, or a full production teacher-to-student rehearsal.
- A real customer interview or real lead in the committed CRM; the two CRM rows and one interview row are explicitly examples.
- Actual cohort activation, retention, capstone outcomes, paid renewals, revenue, or unit economics. The baseline is blank. **Unknown is not zero.**

### Claim classes

| Class | Allowed wording | Evidence required |
|---|---|---|
| Built | “The product includes…” | Working route, test, and current production confirmation before saying “live” |
| Observed | “In cohort X, N of D students…” | Dated server export, metric definition, cohort dates, exclusion notes |
| Reported | “A leader said…” | Dated interview note and permission for quotation |
| Commercial | “Paid”, “committed”, “pipeline” | Stripe/invoice receipt, signed dated purchase step, or CRM status respectively; never merge the categories |
| Forecast | “We expect…” | Labeled assumption, formula, scenario, and sensitivity; never presented as historic fact |

**Evidence rule:** every deck chart, application answer, case study, and investor email gets an entry in the [claim ledger](investor/claim-ledger.md) with source, owner, as-of date, denominator, and sharing permission. Keep identifiable student data and customer contact details out of public Git and investor materials. Use a restricted data room for underlying records.

## 2. The investor question tree

An investor should be able to answer these in five minutes, then inspect the proof:

1. **Who is the buyer and user?** A club leader or instructor decides to run the lab; a 13+ student learns. Test whether an independent club leader, teacher, or school budget owner can actually approve and pay.
2. **What painful job is solved?** The leader needs a credible program with little preparation and visible student outcomes; the student needs an engaging route from beginner to explainable code and a capstone.
3. **Why this product?** A code-first six-week format plus saved work, cohort pacing, and teacher visibility. Validate this in side-by-side buyer interviews; do not claim uniqueness without evidence.
   Use the [dated competitive snapshot](investor/competitive-snapshot.md) to ask about actual substitutes rather than presenting a feature checklist as proof of differentiation.
4. **Why now?** Gather current primary market evidence and buyer language. Do not invent a macro trend to fill a slide.
5. **Does distribution work?** Named channel, qualified-lead definition, contact-to-call, call-to-pilot, pilot-to-repeat, and support hours.
6. **Does the learning loop work?** Enrolled-to-activated, week-four retention, capstone submission, and a human quality rubric with sample work.
7. **Will anyone pay?** Actual buyer, procurement path, price, date, receipt or signed step, and renewal behavior.
8. **Can it scale?** Marginal infrastructure cost, AI cost, founder support time, gross margin, payback logic, concentration risk, and a repeatable low-cost channel.
9. **Can the team execute?** Shipped milestones, founder roles/availability, customer response speed, and decisions changed by evidence.
10. **Can schools trust it?** Access boundaries, deletion, subprocessors, incident response, data retention, agreement path, and evidence of production checks.

## 3. Workstream A — production truth and student trust

**Outcome:** an outside leader can use the live system with students without relying on unverified migration, access, or recovery assumptions.

| ID | Task | Deliverable and acceptance evidence | Priority / dependency |
|---|---|---|---|
| A1 | Reconcile all migration files with the production checklist and SQL check | Checklist names the latest migration and records each production result; SQL rows match the files | P0; first |
| A2 | Apply missing migrations in order in a controlled window | Dated migration log, before/after SQL output, rollback or restore plan | P0; after A1; requires production access |
| A3 | Verify RLS and owner checks with two student accounts and one teacher account | Recorded attempts: own work allowed, another student's work denied, non-owner launch denied | P0; after A2 |
| A4 | Rehearse sign-up, invite, first lesson, save/reopen code, scorecard, capstone, deletion, and email | Device, browser, timestamps, result, issue link, retest result | P0; after A2 |
| A5 | Verify monitoring, alert delivery, backups, and restore | Test event in Sentry/ops channel; documented backup and timed restore rehearsal | P0 before student onboarding |
| A6 | Review school-facing privacy terms and data processing path with qualified counsel where a school requires it | Signed-off policy and agreement process; no unsupported compliance badge | P0 before contracted school use |
| A7 | Maintain a small incident runbook | Severity, first response owner, containment, notification decision, evidence retention, postmortem | P1 before pilot |
| A8 | Audit all public product, price, safety, and outcome claims | Claim ledger entries; removed or qualified claims without production proof | P1 before investor outreach |

**Exit gate:** A1–A5 pass with dated evidence. If a student-data boundary fails, stop onboarding until corrected. A code test is useful evidence, but not a production verification.

**A1/A3 local progress, October 9:** `check-migrations.sql` now covers every migration file, and `rls-audit.sql` covers every public table created by those files. Tests enforce exact coverage and detect a removed schema signal or disabled RLS. The [name-only Vercel audit](gtm/production-config-audit-2026-10-09.md) found missing payment and ops webhook keys; the absent site URL variables are optional under the current code. The intended live Supabase project is not yet identified, so A1, A3, and the deployed checks remain open.

## 4. Workstream B — customer discovery and pilot pipeline

**Outcome:** a first reachable segment agrees to a real start date, then repeats or points to a specific reason it will not.

1. Build a list of 30 reachable leaders, tagged by club/teacher segment, channel, organization, approval path, and a dated next action. Keep personal contact data in a restricted CRM rather than committing it to a public repository.
2. Run 20 discovery conversations before asserting the buyer problem. Ask about current meetings, preparation time, student drop-off, project outputs, budget holder, approval process, and what would make them run the program again. Capture exact language with permission.
3. Test two messages separately: “ready-to-run six-week club program” and “students finish a code portfolio piece.” Use the same 15-minute-call request. Log sends, replies, calls, qualified pilots, and reasons for no response.
4. Qualify a pilot only with a named leader, real group, start date, meeting slot, expected roster, approval path, and willingness to share weekly observations. A signup without these is a lead.
5. State the proposed post-pilot annual price before kickoff. At the end ask the authorized buyer for a dated yes/no/approval step. Track a purchase order, invoice, payment, and renewal separately.
6. After each pilot, ask for a warm introduction to one similar leader. Log whether the introduction becomes a qualified contact.

**Funnel math:** `qualified contacts → conversations → eligible pilots → launched cohorts → repeat intent → priced commitment → cash → renewal`. Record counts and denominator for every transition. Record outreach hours and founder support hours per stage. Do not extrapolate a conversion rate from a handful of warm contacts without an uncertainty note.

**Exit gate for the first segment:** at least one cohort launched, a known approval path, and evidence of whether the leader would run it again. After roughly 100 relevant contacts and 20 conversations without a qualified pilot, change segment, message, or offer before adding features.

## 5. Workstream C — student learning and outcome proof

**Outcome:** a student starts, returns, and produces inspectable work they can explain.

| Stage | Measure | Source and rule | Pilot target / interpretation |
|---|---|---|---|
| Join | Enrolled students | `class_members`, unique student per cohort | Record actual denominator |
| Start | First assigned lesson completed within 7 eligible days | `lesson_completions` and cohort timezone | 60% is a hypothesis, not a promise |
| Persist | Activated student with an assigned completion in program week 4 | Server-derived cohort scorecard | 40% hypothesis; inspect each drop-off |
| Finish | Activated student submitting a capstone | `capstone_submissions` | 35% hypothesis; review quality too |
| Learn | Can explain model assumptions and a limitation | Human rubric on a consented sample | Record rubric and reviewer, not just completion |

Tasks:

- Run the first teacher/student journey on a Chromebook-class device and a phone. Time from invite to first useful result and record where help was needed.
- Observe two first sessions without coaching. Fix the largest confusion or save failure before polishing later lessons.
- Interview at least two consented students per active cohort during the program and a mix of completers/non-completers afterward. Ask for a walkthrough of their code, not only a satisfaction score.
- Use `scripts/metrics/weekly-scorecard.sql` weekly. Include cohort dates, break weeks, roster size, metric maturity, and missing-data notes.
- Preserve example capstones as explicitly founder-made examples. Publish student work only with a separate affirmative sharing decision and the required parent/school approval path.
- Produce a two-page report for every completed pilot: funnel, work sample quality, leader burden, support load, failures, exact next changes, and whether the buyer repeats.

**Exit gate:** at least one finished cohort report whose counts reconcile to raw server-derived data. A demo cohort is never counted.

## 6. Workstream D — product and engineering roadmap tied to evidence

**Rule:** active sprint work needs an observed user problem, named owner, expected metric effect, acceptance check, and review date. The [master plan](superpowers/plans/2026-09-22-master-plan.md) and [frontend plan](superpowers/plans/2026-09-30-frontend-work-plan.md) provide engineering detail. Use the current code as the final status check, since older plans contain stale “not shipped” entries.

| Order | Product task | Trigger | Acceptance check |
|---|---|---|---|
| D1 | Fix any access, data loss, join, completion, or billing correctness bug | Production rehearsal or pilot failure | Reproduce, fix, retest, log incident if needed |
| D2 | Reduce leader setup friction | Timed external setup exceeds 3 minutes or leader asks for help | New leader launches and shares invite unaided |
| D3 | Improve first lesson clarity and persistence | Students stall before first completion | Two observed first sessions and improved completion |
| D4 | Make weekly scorecard and next action obvious | Leader cannot identify a student needing help | Leader can answer without founder explanation |
| D5 | Improve capstone completion and quality | Week-5/6 drop-off or weak defenses | Higher completion and rubric evidence in next cohort |
| D6 | Improve mobile, accessibility, and speed on the affected path | Measured issue or blocked user | Device test, a11y check, performance budget |
| D7 | Add automation only after manual workflow repeats | Founder support hours do not fall across pilots | Measured time saved without worsening outcomes |

Defer new tracks, real-time market feeds, a generalized course authoring platform, native apps, district integrations, national competitions, and a talent marketplace until the first wedge shows demand and repeatability. Revisit the list at the five-pilot gate; do not quietly add it to an active sprint.

## 7. Workstream E — measurement, economics, and finance

**Measurement contract:** the [metric glossary](gtm/metric-glossary.md) defines cohort metrics; the SQL and app must agree. Each report carries an as-of date, source query/version, cohort IDs, numerator, denominator, and the treatment of pending windows or missing timestamps.

Build these private operating sheets from real records:

1. **Baseline:** registered users, meaningful users, completed lessons, classes, launched cohorts, active subscriptions, Stripe money collected, and source tags. Fill [baseline template](gtm/baseline-template.md) only after production verification. Mark unavailable values “unknown.”
2. **Weekly cohort scorecard:** one row per cohort plus total, with enrollment, activation, week-four retention, capstone, support tickets, and leader check-in. Never average percentages across cohorts without weighting by denominator.
3. **Commercial ledger:** organization, buyer, pilot start/end, proposed price, commitment status, contract value, collected cash, refunds, renewal date, and source. Distinguish booked, billed, collected, and recurring revenue.
4. **Cost ledger:** hosting, Supabase, AI calls, monitoring, payment fees, support time, and sales time. Put founder time in both a cash view and a fully loaded sensitivity view.
5. **Unit economics:** annual revenue per paying organization minus variable infrastructure/payment/support cost; gross margin; acquisition time and cash; payback under realistic conversion. Show a low/base/high scenario with assumptions, not a single precise forecast.
6. **Cash runway:** monthly opening cash, receipts, committed expenses, discretionary expenses, closing cash, and runway at current and planned burn. Keep the founder's personal cash needs separate from product gross margin.
7. **Market sizing:** first bottom-up reachable market from countable clubs/teachers × credible price × reachable conversion, then adjacent segments. Cite dated primary sources and label assumptions. No unsourced “$X billion TAM.”

**Price experiment:** hold the public price constant for the first few offers so buying objections are interpretable. Record whether the budget owner can pay by club funds, instructor budget, school purchase order, or another path. Change one variable at a time and write the reason in the decision log.

## 8. Workstream F — narrative, diligence, and fundraising

**One-sentence description:** “StrikeLab gives high-school clubs a ready-to-run six-week quant finance lab where students code real models and finish with work they can show.” Use this as a testable draft. Replace it if real buyers use a better description.

### Minimum investor packet

| Artifact | Content | Source / review gate |
|---|---|
| One-page company brief | Problem, buyer/user, product, why current alternatives fall short, current traction, ask | Every claim in ledger |
| Live demo | Leader launches, student joins and completes, leader sees outcomes, capstone | Rehearsed on deployed build |
| 10–12 slide deck | Company, problem, wedge, product, traction, learning proof, distribution, economics, competition, team, roadmap, ask | No unsupported market or revenue claim |
| Cohort appendix | By-cohort funnel and work quality, dates, denominators, support load | Export and pilot reports |
| Finance appendix | Actual cash/revenue and clearly labeled scenarios | Reconciled to Stripe/bank/bookkeeping |
| Trust packet | Privacy terms, subprocessor inventory, access/deletion tests, incident path, school agreement process | Reviewed for factual accuracy |
| Data room index | Current incorporation/cap table/IP facts, contracts, financial records, key product/security evidence | Restricted access; no student PII |
| Founder narrative | What each founder built, why this problem, roles, availability, major course corrections | Founder-verified |

Prepare a YC application independently of whether five pilots finish. As checked October 9, the [official YC apply page](https://www.ycombinator.com/apply) lists Winter 2027's on-time deadline as November 2, 2026 at 8 p.m. Pacific; confirm it again before submission. [YC's FAQ](https://www.ycombinator.com/faq/) says early and pre-revenue applications are welcome and accepted founders are expected to work full-time during and after the batch. The founder video and product demo should follow YC's current instructions. Submit only founder-approved, sourced answers.

**Fundraising rule:** raise to accelerate a working customer loop. State use of funds as milestones (more pilots, validated sales process, trust operations, lower support burden), with a cash plan. Do not describe a feature backlog as proof of market demand. Get qualified legal/tax advice for incorporation, securities, equity, school contracts, and privacy obligations rather than treating this plan as legal advice.

## 9. Workstream G — founder operating system

| Cadence | Owner | Required output |
|---|---|---|
| Daily during pilot | Pilot owner | Blocker queue, leader response, next action, any incident |
| Monday, 30 minutes | Founders | One customer goal, one product bottleneck, named owner, due date |
| Wednesday, 15 minutes | Founders | Unblock only; no roadmap reset without evidence |
| Friday, 30 minutes | Customer + metrics owners | CRM, cohort scorecard, cash/cost ledger, decision log, next experiment |
| End of every cohort | Both | Two-page pilot report and repeat/pay conversation |
| Monthly | Both | Claim audit, runway scenario, segment decision, investor packet refresh |

The second founder's status, equity, and responsibility split should be decided from a four-week working trial and documented agreement, not assumed from friendship. Define who owns customers, product, pilot operations, metrics/trust, and company decisions. Track weekly hours and missed commitments. Record the full-time availability answer honestly.

## 10. Dated execution sequence

### October 9–12: establish a trustworthy baseline

- [x] Audit the current repo and distinguish built product from live/customer evidence.
- [x] Create this plan and a claim ledger that starts with only defensible claims.
- [x] Bring readiness checklist and metric glossary up to migration 0021 and current capstone implementation.
- [ ] Run local lint, tests, typecheck/build; record exact result and branch without claiming production readiness.
- [ ] Assign owners and a four-week founder trial date in `docs/gtm/decision-log.md`.
- [ ] With authorized access, verify production migrations/configuration and fill baseline; leave anything inaccessible as unknown.
- [ ] List 30 real reachable leaders in a private CRM and send five personalized messages through the founder's chosen channel.

### October 13–18: first outside-user rehearsal

- [ ] Complete the full production teacher/student journey with test accounts and a real device/network check.
- [ ] Have one outside leader set up without navigation and two students attempt the first lesson; log times and observed failures.
- [ ] Fix the largest access, join, save, or comprehension blocker and retest the exact path.
- [ ] Complete five discovery calls or record the actual funnel and change outreach if calls are not booking.
- [ ] Draft the one-page company brief and YC answers with the claim ledger open.

### October 19–25: pilot commitment gate

- [ ] Secure a named leader, group, start date, roster target, approval path, and post-pilot price conversation.
- [ ] Rehearse invite → first completion → scorecard → capstone and check data boundaries.
- [ ] Freeze nonessential product changes before cohort kickoff.
- [ ] Review YC materials with a reader unfamiliar with finance; revise confusing or unsourced claims.

### October 26–November 2: first live cohort and application decision

- [ ] Attend kickoff and record actual joined/activated counts after the seven-day window matures.
- [ ] Set weekly leader check-ins and a support response owner.
- [ ] If applying for Winter 2027, reconfirm deadline and submit an honest application by the official time. Do not wait for an arbitrary pilot count.

### November–December: complete and learn from first cohorts

- [ ] Keep one or two cohorts active at a time with weekly metrics and interviews.
- [ ] Produce a dated report for each completed cohort, including lost students and support time.
- [ ] Ask the authorized buyer to repeat at the stated price; collect a concrete next step.
- [ ] Test one product or pacing change per major failure pattern in the next cohort.

### January–April 2027: repeatability and paid proof

- [ ] Run additional cohorts only when the prior ones provide a specific repeat hypothesis.
- [ ] Have a leader outside the immediate founder network launch with less help; compare support hours.
- [ ] Collect payment or dated priced commitments from actual budget owners and record procurement time.
- [ ] Build the full diligence packet from reconciled cohort, commercial, finance, trust, and founder records.
- [ ] Reassess customer segment, price, and expansion thesis at the five-pilot evidence gate.

## 11. Decision gates and honest interpretation

| Gate | Desired signal | If missing |
|---|---|---|
| First pilot | Named leader and date; safe measured production path | Fix trust blocker or change outreach/offer; avoid broad feature work |
| First cohort | Students activate and submit explainable work | Watch exact drop-offs and revise onboarding, pacing, or lesson one |
| Two cohorts | Repeated week-four participation and leader desire to reuse | Separate student value problem from leader workload problem |
| Five cohorts | Target: 50 activated, 60% activation, 40% week-four retention, 35% capstone, 4/5 repeat intent, 3 referrals, 2 paid/dated priced commitments | Treat thresholds as hypotheses on small samples; identify the failed link, do not obscure with aggregate growth |
| Paid scale | Collected revenue with support cost and a replicable buyer path | Revisit segment, buyer, price, and delivery model before hiring or expanding |

Every gate report shows counts and percentages, the number of cohorts, source mix, exact observation window, missing data, and a narrative of what changed. A green result on five small warm cohorts is an encouraging signal, not statistical certainty.

## 12. Risk register

| Risk | Early warning | Mitigation and owner |
|---|---|---|
| Production drift | Checklist/SQL disagrees with migrations or deployment | A1/A2; product owner updates dated evidence after each release |
| Student-data exposure | Cross-account read or public artifact without clear choice | Stop onboarding, contain, investigate, correct; trust owner |
| Invented traction | Demo/example data enters deck or outdated plan claims are quoted | Claim ledger and second-person review; founder |
| School procurement delay | Teacher enthusiastic, no authorized budget path | Qualify buyer and approval before pilot; customer owner |
| Founder-led service disguised as software | Support hours stay high | Measure hours per cohort and automate only repeated bottleneck |
| Cohort novelty wears off | Activation high, week-four low | Observe week 2–4 and test pacing/accountability |
| Price does not cover service | Margin negative after realistic support | Reprice, change buyer, or reduce support load |
| Runway and schedule slip | No pilot date while feature work grows | Weekly customer goal and cash review; both founders |
| Founder alignment | Unclear ownership or full-time availability | Four-week trial, written roles, independent advice |

## 13. First implementation slice in this session

The first slice is intentionally about evidence integrity, since the current repo has a stale readiness checklist and a metric glossary that still says capstones are unshipped.

- [x] Write this plan against the current repository and primary YC guidance.
- [x] Correct the production-readiness checklist to enumerate the actual 21 migrations and require dated verification rather than treating schema fingerprints as full proof.
- [x] Correct the metric glossary, baseline template, and scorecard guidance so current code capability and unknown production state are clearly separate.
- [x] Add a source-linked investor claim ledger with unknown traction/revenue clearly marked.
- [x] Add a source-backed competitive snapshot and questions for buyer interviews.
- [x] Make the teacher scorecard report “not measurable” when the capstone or another required query fails.
- [x] Run the local quality gates and report results, remaining external checks, and next concrete product task.

**Local result, October 9:** `npm test` passed 334/334; `npx tsc --noEmit` passed; `npm run build` passed with expected warnings that the local `STRIPE_SECRET_KEY` is unset; `npm run lint` passed with one pre-existing warning in `render_mp4.mjs`. The lint config now excludes a nested generated worktree so the root command finishes. These results establish local build health, not deployed readiness. The next product task is a production teacher/student rehearsal and migration check before the first real pilot.

## Source and review notes

- Product state: current repository files and local tests, as of October 9, 2026.
- YC dates and early-application guidance: [official application](https://www.ycombinator.com/apply), [official FAQ](https://www.ycombinator.com/faq/). Recheck before submission.
- School vendor guidance: [U.S. Department of Education, responsibilities of third-party service providers](https://studentprivacy.ed.gov/resources/responsibilities-third-party-service-providers-under-ferpa). Use qualified advice for an actual agreement and jurisdiction-specific duties.
- No market-size, revenue, retention, or live deployment claim is established by this plan.
