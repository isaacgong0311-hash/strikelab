# StrikeLab YC-Readiness Company Design

**Date:** 2026-09-13  
**Status:** Founder-approved strategy; ready for implementation planning after review

## 1. Executive summary

StrikeLab should stop behaving like a curriculum feature project and start behaving like a measurable early-stage company. The immediate wedge is a founder-supported, six-week technical-finance program for high-school math, coding, investing, economics, and competition clubs. Club leaders and teachers distribute the product; students use it free; schools and clubs become the first payer after the initial free pilots prove repeat use and learning outcomes.

The first product phase is a pilot operating system around the product that already exists: cohort onboarding, a fixed six-week program, scheduled assignments, a student cohort home, timestamped progress, synced work, one capstone artifact, and an instructor outcome scorecard. New curriculum breadth, live market data, mobile apps, generalized course authoring, district integrations, and a recruiting marketplace are deferred.

The long-term company is a merit-based technical-finance talent pipeline. StrikeLab earns that expansion by first producing a dense pool of students whose code, models, and capstones demonstrate real ability. Learning is the wedge; inspectable work, competitions, credentials, and recruiting can become later layers only after cohort retention is strong.

## 2. Current-state assessment

### What is already strong

- A differentiated, working product: 23 browser-based lessons, Python exercises, interactive finance tools, a paper-trading sandbox, achievements, certificates, challenges, auth, payments plumbing, and teacher/classroom workflows.
- Authentic founder-market fit: the product was built by a high-school student for ambitious students who lack early access to quantitative finance.
- High shipping velocity and credible technical ownership: the founder built the application rather than outsourcing it.
- A healthy basic engineering base: 71 automated tests pass and the Next.js production build succeeds.
- A plausible product wedge: students implement pricing and backtesting models instead of consuming generic financial-literacy content or merely playing a stock-market game.

### What is missing from a real startup

| Area | Status | Missing proof or capability |
|---|---|---|
| Meaningful users | Red | Fewer than 20 people have completed a lesson or joined a class; cumulative traffic is not a substitute for active usage. |
| Retention | Red | There is no cohort-level activation, week-four retention, or completion record with durable timestamps. |
| Customer discovery | Red | There is no maintained interview repository, objection log, lost-pilot analysis, or evidence that roadmap priorities come from repeated customer pain. |
| Distribution | Red | Marketing drafts exist, but no repeatable acquisition channel, weekly pipeline, or conversion funnel has been proven. |
| Revenue | Red | Pricing and Stripe architecture exist, but willingness to pay is unproven and production payment readiness has not been verified in this review. |
| Market narrative | Yellow | “Quant curriculum for high schoolers” sounds narrow; the venture-scale thesis is the technical-finance talent pipeline, but it is not yet supported by user artifacts or employer demand. |
| Product readiness | Yellow | The product lacks a cohort-first student experience, completion timestamps, synced exercise work, a capstone, and a reliable instructor outcome view. |
| Engineering operations | Yellow | Tests and build pass, but lint fails in the roster branch, static chart rendering warns during build, the documented Stripe event-ordering risk remains, and there is no end-to-end cohort test. |
| School trust | Yellow/Red | The site has plain-language privacy and terms pages, but no professionally reviewed school agreement/DPA, retention schedule, incident process, or explicit consent workflow for sharing minors' work. |
| Founder commitment | Yellow | YC accepts solo and student founders, but expects full-time work during and after the batch. The founder currently plans to remain enrolled in school. |
| Narrative hygiene | Red | Public pages disagree with shipped reality: the school page says teacher dashboards are unavailable, while classroom rostering is live; the roadmap still labels assignment grading as planned while it is implemented on the current branch. |

YC's public guidance emphasizes a clear, matter-of-fact explanation, specific founder achievements, genuine insight, a demo, and progress toward product-market fit. YC also says solo founders can apply, while noting that solo companies are harder, and says enrolled students must be ready to work full-time if accepted. Sources: [How to Apply](https://www.ycombinator.com/howtoapply), [YC FAQ](https://www.ycombinator.com/faq), and [What Happens at YC](https://www.ycombinator.com/about.html).

The competitive market reinforces the need for a narrow technical wedge. Financial-literacy curricula and stock simulators already offer teacher dashboards, standards alignment, real or simulated portfolios, and classroom join flows. StrikeLab must win on rigorous, code-first technical finance and student work that demonstrates ability—not on generic investing content or the existence of a simulator. Longer term, products such as Forage and QuantConnect's Quant League validate the learning-to-opportunity model, but StrikeLab must not build that marketplace layer before it has retained student cohorts.

## 3. Company and product design

### Positioning and customer

**Company sentence:** StrikeLab gives ambitious high-school clubs a ready-to-run technical-finance lab where students learn by coding real market models and finish with work they can show.

- **Primary user:** motivated high-school students in math, coding, investing, economics, DECA, and competition clubs.
- **Distribution user:** the club leader or teacher who creates the cohort, schedules the program, and keeps students accountable.
- **First payer:** the school or club after the first five free pilots.
- **Initial geography:** founder-reachable local schools and clubs before broad online acquisition.
- **Long-term customer:** schools and youth programs first; finance employers and sponsors become possible only after StrikeLab has a credible talent pool.

### Six-week Quant Foundations Lab

The pilot uses one fixed template rather than a generalized course builder:

1. **Markets and risk:** `inv-1`, `inv-2`, and `inv-5`; orient students and establish a first successful activity.
2. **Options and payoffs:** `1` and `2`; understand calls, puts, and no-arbitrage relationships.
3. **Pricing:** `3`; implement and test Black-Scholes.
4. **Risk sensitivities:** `4`, `5`, `6`, and `7`; divide lessons among students or teams and compare the Greeks.
5. **Research discipline:** `q3`; backtest without look-ahead or survivorship bias.
6. **Capstone:** submit a model or strategy with code, output, and a short written defense; present it to the cohort.

The facilitator guide defines one 45–60 minute meeting per week, optional independent work between meetings, discussion prompts, expected outputs, common failure points, and a five-minute closing check-in. Pilot observations may change the lesson selection or pacing, but the application should not support arbitrary teacher-authored courses in this phase.

### Instructor experience

- Create a class/cohort, choose the Quant Foundations template, set a start date and timezone, and receive a join link/code.
- Automatically create the six weekly modules and their assignment due dates.
- See enrolled, activated, active-this-week, week-four retained, lesson completion, capstone submission, and students needing help.
- Open a student's synced exercise submission and capstone when educationally necessary.
- Export a cohort outcome CSV and access the facilitator guide.
- Complete lightweight kickoff, weekly, and end-of-pilot feedback forms.

### Student experience

- Join a cohort through a code/link and land on a cohort home rather than the generic dashboard.
- See the current week's work, due date, progress, and next action; the rest of the public curriculum remains available.
- Continue saved exercise code across devices after signing in.
- Submit one capstone containing a title, thesis/question, code, result summary or chart, and reflection.
- Keep all work private to the student and instructor by default. An unlisted public share link requires an explicit opt-in and must be reversible.

### Evidence-quality data

The current aggregate `progress.completed` array remains temporarily for backward compatibility and fast rendering. New cohort measurement uses normalized records:

- A unique lesson-completion record per user and lesson with `completed_at`; historical aggregate completions are not backfilled into cohort metrics with invented timestamps.
- Saved lesson submissions with code, `updated_at`, and optional `last_passed_at`, readable only by the student and an authorized instructor for the student's cohort.
- Cohort metadata for template, start/end dates, timezone, and status.
- Assignment schedule metadata for week, position, and due date.
- Capstone submission data with private/unlisted visibility and a revocable share token.
- A server-derived cohort metrics view or service; client-supplied metric totals are never trusted.

Core definitions:

- **Enrolled:** a signed-in student joined the cohort.
- **Activated:** an enrolled student completed the first assigned lesson within seven days of joining or the cohort start, whichever is later.
- **Week N active:** at least one assigned lesson was completed during that cohort week.
- **Week-four retained:** an activated student was active during week four.
- **Program completed:** all required modules and the capstone were completed by seven days after the cohort end date.
- **Leader reuse:** recorded from the end-of-pilot interview, not inferred from clicks.
- **Paid proof:** money collected or a dated, priced commitment from an authorized buyer; a vague statement of interest does not count.

### Privacy and trust constraints

- Continue the 13+ product boundary and collect only the data needed for authentication, progress, instructor reporting, support, and submissions.
- Do not make names, code, rankings, or capstones public by default.
- Provide account deletion and capstone unpublish flows that actually delete or revoke the relevant data.
- Document retention, subprocessors, incident handling, and school-request procedures before converting pilots into contracted school customers.
- Obtain qualified legal review of the privacy policy, terms, pilot agreement, and any school DPA before claiming compliance. U.S. Department of Education guidance says schools should evaluate approval and control of student PII, limits on use/redisclosure, and appropriate agreements when using education vendors; this design is product guidance, not legal advice. Source: [Protecting Student Privacy](https://studentprivacy.ed.gov/faq/i-want-use-online-tool-or-application-part-my-course-however-i-am-worried-it-violation-ferpa).

## 4. Go-to-market operating system

### Founder time allocation

For a sustainable 10–15 hour school-week schedule:

- 4–5 hours: outreach, interviews, and pilot recruitment.
- 4–5 hours: fix the single largest measured product bottleneck.
- 2 hours: pilot support and session observation.
- 1 hour: metric review, decision log, and next-week planning.

No week should be entirely coding. Feature work without a named pilot problem and success metric does not enter the active sprint.

### Pilot offer

- Five founder-supported pilots are free.
- Each pilot targets 10–25 students, runs six weeks, and meets 45–60 minutes weekly.
- StrikeLab supplies the platform, facilitator guide, kickoff, and direct support.
- The leader supplies the meeting time, student recruitment, school approval where required, and weekly feedback.
- After five free pilots, the offer becomes $499/year for a school instructor license or $199/year for a small independent club. Manual invoicing and fulfillment are acceptable for the first customers.

### Pipeline and discovery

- Maintain a simple CRM with organization, leader, segment, source, last contact, next action, objection, pilot status, expected student count, and referral.
- Contact founder-reachable local math, coding, investing, economics, DECA, and competition-club leaders first.
- Each leader receives a kickoff interview, a ten-minute weekly check-in, and an end-of-pilot reuse/payment interview.
- Interview at least five students per cohort during or immediately after the program.
- Store notes as observations, direct quotations where consented, pain severity, current workaround, requested outcome, and resulting decision. Do not turn every feature request into a roadmap item.

### Proof thresholds

By the end of the five free pilots:

- At least five cohorts completed and 50 students activated.
- At least 60% of enrolled students activate.
- At least 40% of activated students are retained in week four.
- At least 35% of activated students complete the capstone.
- At least four of five leaders say they will run the program again.
- At least three leaders introduce another qualified leader.
- At least two organizations pay or sign a dated, priced commitment for the next term.
- Outcomes can be shown by cohort and acquisition source, not only as cumulative totals.

Decision rules:

- Low enrollment-to-activation means fix joining, onboarding, or the first-session experience.
- Low week-four retention means fix pacing, accountability, facilitator support, or the student value proposition.
- Strong student usage with weak leader reuse means reduce instructor burden and improve outcome visibility.
- Five successful free pilots with no paid commitments means change the buyer, offer, or price before adding curriculum.
- Fewer than five pilots after roughly 100 qualified contacts and 20 leader conversations means the segment or pitch is not urgent/reachable enough.

## 5. Delivery sequence

### Phase 0 — Company baseline (weeks 1–2)

- Freeze unrelated roadmap work and label the Quant Foundations pilot as the only active product bet.
- Fix the current lint failure, build warning, stale public copy, and roadmap drift.
- Create the metric glossary, weekly scorecard, CRM, interview repository, decision log, pilot one-pager, facilitator-guide outline, and pilot agreement checklist.
- Verify production Supabase, Sentry, analytics, email, and Stripe configuration without exposing credentials.
- Record the honest baseline: meaningful users, active users, completed lessons, cohorts, revenue, and acquisition sources.

### Phase 1 — Pilot operating system (weeks 3–6)

- Ship cohort template/start-date support and scheduled assignments.
- Ship the student cohort home and instructor outcome scorecard.
- Add normalized completion timestamps and synced lesson submissions.
- Add the private-by-default capstone and CSV export.
- Add automated coverage for authorization, metrics, migrations, and the teacher-to-student cohort journey.
- Rehearse the full six-week program with test accounts before onboarding a real cohort.

### Phase 2 — Two design-partner pilots (weeks 7–14)

- Run two local cohorts with founder observation and weekly interviews.
- Review the scorecard weekly and change only the largest funnel constraint.
- Produce one internal pilot report per cohort covering outcomes, failures, support load, and exact next changes.

### Phase 3 — Three repeat pilots (weeks 15–24)

- Run three more cohorts using the revised program.
- Reduce founder rescue work and verify that leaders can operate from the guide.
- Publish consented, anonymized outcomes, capstones, testimonials, and one concise case study.
- Collect referrals and build the next-term qualified pipeline.

### Phase 4 — Paid proof and YC application (weeks 25–32)

- Ask qualified pilot organizations to renew and new organizations to start at the stated annual prices.
- Close at least two paid or contractually committed customers before automating billing or seat administration.
- Prepare a one-sentence company description, founder video, two-minute demo, cohort metrics, revenue, user quotations, competitive explanation, market expansion thesis, cap table/legal facts, and the honest full-time-commitment answer.
- Apply after proof even if the founder remains enrolled, but do not imply immediate full-time availability without a concrete family/school arrangement.

## 6. Explicitly deferred work

Until the five-pilot decision gate, do not build:

- Additional VaR, GARCH, Monte Carlo, interview-prep, or broad personal-finance tracks.
- Real-time market data, multi-asset expansion, native mobile/desktop distribution, or generalized course authoring.
- Google Classroom/Canvas/SIS integrations, district administration, SSO, or automated school procurement.
- A public talent marketplace, employer dashboard, recruiter search, job board, or sponsor marketplace.
- Sophisticated AI personalization, automated grading, or new generic chatbot features.
- A national competition; reuse the existing challenge surface only when a pilot specifically needs it.

## 7. Acceptance and stop/go criteria

The strategy succeeds when StrikeLab can show that reachable leaders repeatedly start cohorts, students stay active and produce credible work, leaders want to repeat, and at least two buyers commit money at a stated price. A polished application without that evidence is not success.

At week 14, continue only if one of the first two cohorts meets both activation and week-four retention targets or interviews identify a specific, testable fix. At week 24, proceed to paid conversion only if at least four leaders want to repeat and the combined cohorts meet the retention threshold. If student outcomes are strong but school willingness to pay is weak, test parent-funded advanced cohorts or sponsor-funded access as a new design cycle rather than silently changing the model.

## 8. Assumptions

- The founder remains enrolled in high school and can sustain 10–15 hours per week.
- Local clubs and teachers are the fastest reachable pilot segment.
- The first five pilots are free; schools/clubs are the first intended payer afterward.
- Existing lessons remain the content base; pilot evidence may adjust pacing and selection but not trigger a broad content expansion.
- Initial sales and invoicing can be manual.
- No cofounder is recruited merely to improve a YC application. A cofounder is considered only if there is demonstrated working chemistry, complementary ownership, and a shared full-time path.
- Legal and privacy readiness must be reviewed by a qualified professional before making compliance claims or signing material school contracts.
