# StrikeLab Work Plan: Weeks 3–8 (Sep 29 – Nov 8), from "built" to "piloting"

**Date:** 2026-09-29 (runway week 3 of 32)
**Status:** Adopted 2026-09-29. **Day-level schedule for Sep 30 – Oct 16 superseded by `2026-09-30-sprint-to-go-no-go.md`** (same gates, re-cut targets). Agent tasks AG1–AG8 are done (see §12); founder tasks are open.
**Horizon:** 2026-09-28 → 2026-11-08 (runway weeks 3–8), with the decisions that shape weeks 9–32
**Relation to other docs:** The strategy (`specs/2026-09-13-strikelab-yc-company-design.md`) and the master plan (`plans/2026-09-22-master-plan.md`) are still authoritative for *what* and *why*. This plan replaces the master plan's §11 "Next 10 days". It also re-sequences weeks 3–8 around what's true today. Where the two disagree about these six weeks, this plan wins. Task IDs from the master plan (A1, D7, F2, …) and the frontend plan (FE-4, …) are reused so the history stays connected.

---

## 0. The short version

1. **Engineering is about two weeks ahead of the master plan, and go-to-market is about two weeks behind it.** Every agent-doable task before the first kickoff is built. But the repo shows **zero real leader contacts, zero interviews, an empty baseline and an unchecked production checklist**. The master plan wanted 15 outreach messages in week 2 and three leader calls by the end of week 3. **The critical path is no longer code. It's leader commitments and production verification.**
2. **The fall has a hard deadline.** A six-week cohort with a Thanksgiving break week has to **kick off by Mon Nov 2** to finish before mid-December finals. Oct 26 is safer. Counting back two weeks for approval and setup, **a leader has to say yes, with a date, by about Fri Oct 16.** That's 13 working days from today.
3. **So for the next three weeks, about 60% of founder hours go to outreach and calls.** About 25% goes to making production provably work: migrations, sign-up email and Google sign-in on school accounts. The rest is review. Agents land the open PR stack, fix the two things that would break a real kickoff (page speed on Chromebooks, sign-up email delivery), and then the code freezes on **Fri Oct 23**.
4. **There's one new gate, "Fall go/no-go", on Fri Oct 16.** If no leader has committed by then, run **Plan B** (§7): at most one founder-supported "Cohort 0", counted separately so it never inflates the proof, and a full push on spring cohorts. Don't use the freed time to build features.
5. **Three production risks could quietly ruin a kickoff, and nobody has checked them yet** (§5.2):
   - Migrations 0013–0021 may not be applied, even though the code that depends on them is live.
   - Supabase's built-in email sender isn't built for 20 students signing up in one room.
   - Many school-managed Google accounts for under-18 students can't sign in to third-party apps until the district allows it.

---

## 1. Where things stand (checked 2026-09-29)

| Area | State | Evidence | What it means |
|---|---|---|---|
| **Code health** | Green | `master` at `afdf1ca`: lint clean, 42 test files / 317 tests pass (including PGlite migration and RLS tests), and `next build` succeeds | Nothing is broken. There's no reason to write new product code before the gate except the items in §5.3 |
| **Production deploy** | `afdf1ca` is live (Vercel, deployed from PR #31) | Vercel deployments list | Code that reads the tables and functions from migrations 0015–0021 is **already serving users** |
| **Production database** | **Unknown** | No agent can see it. `production-readiness-checklist.md` is unchecked and stale: it only goes up to migration 0013 | If 0015 isn't applied, every signed-in read of classes, members and assignments errors. If 0016 isn't applied, activation can't be measured. Checking this is the #1 founder task this week |
| **Open PRs** | [#32](https://github.com/isaacgong0311-hash/strikelab/pull/32) FE-4 teacher setup → [#33](https://github.com/isaacgong0311-hash/strikelab/pull/33) FE-11 funnel → [#34](https://github.com/isaacgong0311-hash/strikelab/pull/34) FE-10 Lighthouse, **stacked**, open 5 days, all `clean`. Plus [#1](https://github.com/isaacgong0311-hash/strikelab/pull/1), a stale draft from May | GitHub | #32 is what lets a leader go from `/pilot` to an invite link without Settings. CI has never run on #33 or #34 because they don't target `master`. Stacked PRs get more painful to merge the longer they wait |
| **Page speed** | Mobile LCP **3.5–4.6s** on `/`, `/clubs`, `/pilot`, `/demo`, `/learn/inv-1.1`, against a 2.0s budget | PR #34's first measurement | Master plan B8 requires under 2.0s on `/learn/*` and `/cohort/*` **before the first kickoff**, because students use Chromebooks and phones. The cause is known: `@sentry/nextjs` (about 130 KB gzipped with react-dom) and `supabase-js` (about 63 KB) load on every page |
| **Sign-up at kickoff** | Email and password with a confirmation link, or Google OAuth | `src/app/sign-up/[[...sign-up]]/page.tsx:55-87` | The kickoff plan has 10–25 students joining in the same room at the same time. That depends on either (a) confirmation emails arriving within a minute, or (b) Google sign-in working for school accounts. Neither has been tested (§5.2, P2–P3) |
| **School networks** | Pyodide loads from `cdn.jsdelivr.net`, and the app talks to `*.supabase.co` | `LessonClient.tsx:732`, `ChallengesClient.tsx:43`, `PlaygroundClient.tsx:199` | A school web filter that blocks either one breaks the lessons. The T-7 device test (master plan G1) has to cover it, and IT needs an allowlist (§5.4) |
| **Pipeline** | `crm.csv` and `interview-log.csv` hold only `EXAMPLE` rows | `docs/gtm/` | Zero measured progress toward "100 contacts → 20 conversations → 5 pilots" |
| **Baseline** | Empty | `baseline-template.md` | "Paid proof" at week 32 has nothing to be measured against |
| **Pilot call link** | Not set. `/pilot` "Talk first" falls back to email | Decision log 2026-09-23 | It's a 15-minute setup, and it removes friction from every outreach message |
| **Decision log** | Nothing since 2026-09-23 | `decision-log.md` | Fine for now. The Fall go/no-go (§6) will be the next entry |

> **If outreach is happening outside the repo** (texts, an email thread, a notebook), the plan still holds: copy it into `crm.csv` by Friday so the weekly numbers are real. A pipeline that only lives in chat can't be measured.

---

## 2. The critical path, worked out

### 2.1 Why the fall deadline is Nov 2

Cohort weeks with the Thanksgiving break week (Nov 23) skipped:

| Kickoff | Program weeks W1–W6 (Mondays; the Nov 23 break skipped) | Capstone week | Verdict |
|---|---|---|---|
| **Oct 26** | Oct 26 · Nov 2 · Nov 9 · Nov 16 · *(break)* · Nov 30 · Dec 7 | **Dec 7** | **Best.** The capstone lands before finals, and the program-completed window (+7 days) closes Dec 18 |
| **Nov 2** | Nov 2 · Nov 9 · Nov 16 · *(break)* · Nov 30 · Dec 7 · Dec 14 | **Dec 14** | **Last viable.** Capstone presentations collide with many schools' finals weeks |
| Nov 9 | Nov 9 · Nov 16 · *(break)* · Nov 30 · Dec 7 · Dec 14 · Dec 21 | Dec 21, in winter break | **Not viable.** Either the capstone falls in the break, or a three-week gap sits right before it |

**Confirm each partner school's real calendar at the first call.** A school with a whole-week fall break, or finals in early December, moves these dates.

### 2.2 Counting back from kickoff

| Date | Oct 26 kickoff | Nov 2 kickoff |
|---|---|---|
| T-14: approval done, date locked, leader has the facilitator guide | Mon Oct 12 | Mon Oct 19 |
| T-7: cohort launched in the app, school-device and network test done | Mon Oct 19 | Mon Oct 26 |
| **Verbal yes + known approval path needed by** | **Fri Oct 9** | **Fri Oct 16** |

**So Fri Oct 16 is the real fall deadline.** Treat Oct 9 as the target and Oct 16 as the last chance.

### 2.3 Pipeline math for that deadline

The master plan's ratios are about 100 contacts → 20 conversations → 5 pilots, or roughly 20 contacts and 4 conversations per pilot. To have **two** fall commitments by Oct 16 on those ratios takes about **8–10 conversations**, which means about **40 contacts in the next 12 days**. That's twice the master plan's rate. It's only realistic if most of the list is **warm**: people who already know the founder, the founder's school, or someone who can introduce them. Warm contacts convert at several times the rate of cold email, so the list has to start there.

**Target for this window:** 40 contacts touched → 10 calls held → **2 verbal yeses with dates → at least 1 approved pilot by Oct 16.**

### 2.4 Approval paths, ordered by speed

Qualify this on every first call, because it decides whether the fall is possible at all:

| Path | Typical speed | Fall-viable? |
|---|---|---|
| **A. No approval needed.** The club meets after school, students use personal accounts, and the sponsor confirms school policy allows it | Days | Yes: prioritize these |
| **B. Sponsor or principal sign-off only.** The one-pager, data map and privacy page are enough | 1–2 weeks | Yes, if it starts this week |
| **C. District vendor or data-privacy review.** Many Texas districts use the Texas Student Privacy Alliance (TXSPA/SDPC) agreement; ask whether theirs does, because signing their standard form is faster than bringing your own | 2–8+ weeks | **Rarely for fall.** Start now, and aim it at January |

Path C leaders aren't wasted. **Start their paperwork now; they're the spring cohorts.**

---

## 3. Priorities for the next six weeks

When two things compete, the higher one wins. Use this every day.

1. **Leader commitments** (founder). Nothing else matters if no cohort runs.
2. **Production truth** (founder, with agents helping). Migrations applied, sign-up email delivered, Google sign-in tested on a school account, alerts firing. A kickoff that fails at sign-up burns the leader, and leaders are the scarce asset.
3. **Land the PR stack, then freeze** (agents build, the founder reviews). Merge #32, #33 and #34 this week. Code freeze Fri Oct 23.
4. **Kickoff-day reliability** (agents). Page speed on `/learn/*` and `/cohort/*`, the school-network allowlist and the kickoff runbook.
5. **Everything else waits.** That includes the Duolingo work (B2+), the FE-9 visual pass, SEO pages, the showcase, new lessons, the "Talk first" scheduler polish, and any feature a real leader hasn't asked for.

**Founder hours, assuming about 12 a week** (scale proportionally if different):

| Weeks | Outreach and calls | Production truth / rehearsal | PR review and decisions | Pilot support |
|---|---|---|---|---|
| 3–5 | **7h** | 3h | 2h | — |
| 6 | 4h | 6h (rehearsal, device test) | 2h | — |
| 7–8 (pilots live) | 3h (spring pipeline) | 1h | 2h | **6h** |

**Exam-week rule** (master plan J): if school squeezes a week, drop PR review first, then production work, and **never** drop replies to a leader.

---

## 4. Week by week

Each week has one goal, the founder's tasks, the agents' tasks, and an exit test you can check on Friday. Task details are in §5.

### Week 3 · Sep 28 – Oct 4 · "Start the pipeline, find out what production really is"

**Founder**
- [ ] **Mon (30 min):** read this plan and mark changes. Log the adoption in `decision-log.md`.
- [ ] **Mon–Tue (2h):** write the **warm-20 list** (G1) and send the first **10 personal messages** (G3 templates).
- [ ] **Tue (15 min):** create the free Cal.com link and set `NEXT_PUBLIC_PILOT_CALL_URL` in Vercel (G2).
- [ ] **Wed (1.5h):** **P1 migrations.** Run `check-migrations.sql`, apply what's missing in ledger order (0015 first), and re-run it.
- [ ] **Wed (45 min):** **P2 sign-up email** and **P3 Google sign-in**: check the settings and decide (§5.2).
- [ ] **Thu–Fri (2h):** 10 more messages (20 total). Start the cold list (G1) toward 40.
- [ ] **Fri (1h):** review and merge **#32**, then do the preview smoke test of the leader flow (AG1).
- [ ] **Fri (15 min):** replace the CRM `EXAMPLE` rows and add a week-3 pipeline row to the scorecard (§8).

**Agents** (a branch and PR each)
- [ ] **AG1** Land the stack: retarget #33, then #34, to `master` once their parent merges, get CI green, and fix anything CI finds. Close #1, since `@vercel/analytics` is already installed and wired up in `src/lib/analytics.ts`.
- [ ] **AG2** Make the docs true: update the production-readiness checklist to migration 0021 with the P2/P3 checks, remove the stale "capstone not measurable" section from the metric glossary, add pipeline rows to the scorecard template, and mark this plan in master plan §11.
- [ ] **AG3** Outreach kit in `docs/gtm/outreach-kit.md`: the email, text and intro-ask templates from G3, the call agenda, the qualifying questions and the new objections (G4–G5).

**Exit test (Fri Oct 2):** ≥ 20 real contacts in the CRM · ≥ 3 calls booked · `check-migrations.sql` shows 0001–0022 applied in prod · a decision recorded on P2 and P3 · #32 merged.

### Week 4 · Oct 5 – 11 · "Conversations, and the first yes"

**Founder**
- [ ] 20 more contacts (40 total), plus day-3 and day-7 follow-ups on week 3's messages.
- [ ] **4–6 calls** (15 minutes each) using the call agenda. Show `/demo`, then set up a class live with `/teach/new` so the leader sees the invite link appear in under 3 minutes.
- [ ] For every warm "yes": identify the approval path (§2.4) **on the call**, and send the approval packet the same day (G6).
- [ ] P4: Sentry test error, Discord ops alert test, and live Stripe keys confirmed, or explicitly skipped because nothing is charged during pilots. Log whichever it is.
- [ ] P5: create the **non-prod Supabase project** (the free tier allows two) and apply all migrations there.
- [ ] P7: fill `baseline-template.md` using `baseline.sql`.
- [ ] Review the AG4 and AG5 PRs.

**Agents**
- [ ] **AG4** Page speed on the student path (§5.3).
- [ ] **AG5** Sign-up resilience (§5.3): a clear "check your email" state with a **resend** button, and a signed-out rate limit on join lookups.
- [ ] **AG6** Kickoff kit docs: IT allowlist, device and network test, kickoff-day runbook, parent note, and incident runbook (D8).

**Exit test (Fri Oct 9):** ≥ 40 contacts · ≥ 6 calls held · **≥ 1 verbal yes with a date ≤ Nov 2 and a known approval path** · baseline filled · non-prod project exists.

### Week 5 · Oct 12 – 18 · "Lock dates. Fall go/no-go on Friday."

**Founder**
- [ ] Turn verbal yeses into **locked dates**: approval submitted or confirmed not needed, meeting day and room, roster estimate, and the school calendar checked for break weeks.
- [ ] 10 more contacts, focused on **spring (Path C) leaders**. Start their paperwork now.
- [ ] **Rehearsal part 1 (2h):** on non-prod, with two accounts (teacher and student), walk the facilitator guide's weeks 1–3 using the P6 smoke-test script. Log rough edges as issues and fix only the ones that block.
- [ ] **Fri Oct 16: Fall go/no-go gate** (§6). Record the result in `decision-log.md`.

**Agents**
- [ ] Fix blocking issues from rehearsal only.
- [ ] **AG7** Pilot operations templates: the per-cohort runbook (G1), the observation-notes template (G4) and the pilot-report template (G6). These are needed by week 8, and it's cheap to do them now.

**Exit test (Fri Oct 16):** gate passed → ≥ 1 pilot with a locked date, and the kickoff plan is on the calendar. **Or** gate failed → Plan B is chosen and logged (§7).

### Week 6 · Oct 19 – 25 · "Rehearse, test on a real school device, freeze"

**Founder**
- [ ] **Rehearsal part 2 (2h):** weeks 4–6 on non-prod, including capstone submit, share and revoke. Check the scorecard numbers against a hand count.
- [ ] **Launch the real cohort in production** (T-7 for Oct 26), with the break weeks set.
- [ ] **School-device test (1h), at the school, on the school network:** a student device joins by link, signs up (with the method chosen in P2/P3), runs a Python exercise (which proves Pyodide loads), and completes `inv-1` session 1. Check the completion row with SQL. Send IT the allowlist if anything is blocked.
- [ ] Send the leader the week-1 message (from the leader toolkit) and the kickoff logistics.
- [ ] **P6 production smoke test** with throwaway accounts, then delete them (account deletion is self-serve).
- [ ] **Fri Oct 23: code freeze.** From here to kickoff, only fixes for a blocking bug found in the device test.

**Agents**
- [ ] Blocking fixes only. Before the freeze, run `/security-review` on the pilot surfaces (master plan D11, follow-up).

**Exit test (Fri Oct 23): W6 pilot-readiness gate** (§6).

### Week 7 · Oct 26 – Nov 1 · "Cohort A kickoff: activation happens in the room"

**Founder**
- [ ] **Kickoff (T-0), founder present:** students join in the room and everyone finishes the first session together. The kickoff runbook (AG6) has the minute-by-minute plan and the fallbacks.
- [ ] Same day: read the scorecard. Anyone who isn't enrolled or started gets a note to the leader within 24 hours.
- [ ] Kickoff interview with the leader (15 minutes, logged in `interview-log.csv`).
- [ ] Keep outreach at 5 a week: spring leaders plus a possible Cohort B for Nov 2.
- [ ] **Mon (30 min):** first real weekly-scorecard ritual (master plan C3).

**Agents**
- [ ] On call for pilot bugs, with same-day fixes for anything that stops students (master plan G3 SLA). Otherwise stay frozen.

### Week 8 · Nov 2 – 8 · "Second cohort (if any), first real numbers"

**Founder**
- [ ] Cohort B kickoff if it's on the calendar (same runbook).
- [ ] Cohort A week-2 check-in (10 minutes), and a list of students who need help sent to the leader.
- [ ] Interview 2–3 students in Cohort A (consented, 15 minutes each).
- [ ] Monday scorecard: name **the single biggest bottleneck** and pick **one** change (master plan §6 decision rules).

**Agents**
- [ ] Fix the one bottleneck named in the scorecard, and nothing else.
- [ ] Code freeze lifts only for that fix plus bugs.

**After week 8** the master plan's calendar takes over again (weeks 9–14 as written), shifted by however many weeks kickoff slipped, with the W14 gate moved to match.

---

## 5. Task detail

### 5.1 Go-to-market (founder)

**G1. The warm-20 list, then the 40.** Write names, not categories. In order:
1. Teachers and club sponsors at the founder's own school (math, CS, economics, AP Stats, AP CS, personal finance, DECA/FBLA, investing club, Math Club/MAO, Science Olympiad, robotics).
2. Those teachers' colleagues at other schools. Ask each warm contact: "Who else runs a club like this?"
3. Teachers the founder has had in past years, plus parents' and friends' networks at nearby schools.
4. Then the cold list: club directories at nearby district high schools.

Each row in `crm.csv` gets segment, source, a named leader, `status`, and the **approval path (A/B/C) once known**. Put the path in `notes` until the CSV gets a column.

**G2. Pilot call link.** Create a free Cal.com event (15 minutes, with a question field "Where did you hear about StrikeLab?") and set `NEXT_PUBLIC_PILOT_CALL_URL` in the Vercel production environment. Check that `/pilot` → "Talk first" opens it.

**G3. Messages** (full versions go in `docs/gtm/outreach-kit.md`, AG3). Principles:
- Personal, from the founder's own address, one person at a time.
- **Three sentences and one ask.** Name the club.
- Include the `/demo` link with `?src=` (e.g. `?src=email-warm`) so the funnel attributes it once #33 merges.
- Say the price after the pilot plainly. That reads as honest, not as a sales pitch.

Warm email, as a draft:

> Hi [name], I built StrikeLab, a free six-week lab where club students code real finance models (option pricing, a backtest) in the browser and finish with a project they can show. I'd love to run it with the [club] this fall, with me supporting every week. It's about 45 minutes a week and zero prep for you. Could I show you in 15 minutes? [Cal link] · Demo: strikelab.dev/demo?src=email-warm

Also draft: a text version for teachers the founder knows personally, an "intro ask" for a warm contact to forward, and day-3 and day-7 follow-ups (one line each, adding one new fact per follow-up, e.g. the teacher view or an example capstone).

**G4. Call agenda (15 minutes).**
- **0–4 min, discovery:** how the club runs now, what students want to show colleges, the meeting day and length, how many students.
- **4–9 min, demo:** `/demo` teacher view (scorecard, toolkit), then the student view (cohort home, one session), then an example capstone.
- **9–12 min, qualify** (these questions are what the go/no-go gate runs on):
  1. "When would week 1 be?" (It has to be on or before Nov 2 for fall.)
  2. "What does your school require before students use an outside website?" (Answer maps to path A, B or C.)
  3. "What do students sign in with at school: personal email, or a school Google account?" (This feeds P2/P3.)
  4. "Any breaks between now and mid-December?"
  5. "Who else would need to say yes?"
- **12–15 min, close:** propose a date. Offer to set up the class right now in `/teach/new` so they leave with an invite link. Log the call in the CRM and interview log the same day, including a pain score.

**G5. New objections to add to the library.**
- "Our district needs a DPA": "Send me your district's standard agreement (many Texas districts use TXSPA). I'll sign yours rather than bring my own. Meanwhile here's our data map and privacy page." Mark it path C, and target January.
- "Can I see it first?": `/demo`, no account needed.
- "Students will just copy the code": explain that exercises test behavior, the capstone asks for a written defense, and leaders see who ran what.

**G6. The approval packet** (send the same day as a yes): the one-pager, the privacy page link, the subprocessor list, the data map (E1; draft it now if it doesn't exist), "13+ only, private by default, delete anytime", and the founder's contact details.

### 5.2 Production truth (founder; agents draft the checklists)

Agents can't do these, because they need dashboard access. Each has a clear pass test.

**P1. Migrations applied, in order (week 3, 1.5h).**
1. In the Supabase SQL editor, run `scripts/metrics/check-migrations.sql`.
2. Apply whatever is missing, in ledger order (master plan §12): **0015 first**, because without it every signed-in class read errors. Then 0013, 0014, 0016–0022.
3. Re-run the check. **Pass:** every migration through 0022 shows as applied.
4. Then as a real signed-in user in production, open `/dashboard`, a class page and `/cohort/[id]` with no errors (check Sentry too).

**P2. Sign-up email that works for a whole room (week 3 decision, week 4 fix).**
- **Risk:** Supabase's built-in email sender is meant for development. It's tightly rate-limited, and on current projects it may only deliver to your own team's addresses. Check **Authentication → Emails / SMTP** and **Rate limits** in the dashboard. Twenty students signing up within five minutes would hit the limit, and students would sit waiting for an email that never arrives.
- **Options** (choose one and log it):
  1. **Custom SMTP (recommended).** Resend's free tier (check its current limits; it's been about 100 emails a day), sending from a verified `strikelab.dev` address. Then raise Supabase's email rate limit. School spam filters are also kinder to a verified domain. About 1h.
  2. **Turn off "Confirm email"** for the pilot period. Sign-up then gives a session immediately (the code handles this at `page.tsx:71`). The trade-off: emails aren't verified, and a typo breaks password reset. Acceptable for a supervised in-room kickoff; revisit before paid.
  3. Rely on Google sign-in only. That's risky: see P3.
- **Pass:** 25 sign-ups within 10 minutes on non-prod (scripted, or a few friends) all receive and complete the confirmation, or option 2 is on and logged.

**P3. Google sign-in on school accounts (week 3 check, week 6 real test).**
- In Google Cloud, the OAuth consent screen must be **"In production"**, not "Testing". In Testing, only listed test users can sign in.
- **School-managed accounts for students under 18 are often blocked** from signing in to third-party apps unless the district admin has allowed that app. Assume a school Google account will fail until it's tested on the partner school's real account.
- **Plan for kickoff:** students sign up with email (P2). Offer Google only if the device test at that school (week 6) shows it works.
- **Pass:** a decision is logged, and the week-6 device test confirms that the chosen method works at that school.

**P4. Alerts and keys (week 4, 45 min).**
- A Sentry test error arrives in the dashboard.
- `OPS_DISCORD_WEBHOOK_URL` fires a test message.
- `NEXT_PUBLIC_SITE_URL` is the real domain.
- Stripe is live or explicitly deferred (no pilot charges money).
- Uptime: a free monitor on `/`, `/cohort` and `/api/progress` (D7).

**P5. Non-prod Supabase project (week 4, 45 min).** Apply all migrations there, and point a Vercel **preview** environment at it so rehearsals and smoke tests never touch real student data.

**P6. Smoke test script (agents write it in AG2; the founder runs it in weeks 5 and 6).** A 20-minute click path with SQL checks at each step:
1. Leader signs up from `/pilot`, reaches `/teach/new`, and gets an invite link.
2. A student opens the link on a phone, signs up and lands on the cohort home.
3. The student finishes `inv-1` session 1. **Check:** one `lesson_completions` row with a server timestamp.
4. The scorecard shows the student as enrolled or activated.
5. Capstone draft, then submit. The teacher sees it (and the view is logged). The student shares it, then revokes, and the link returns 404.
6. Both test accounts delete themselves. **Check:** their rows are gone.

**P7. Baseline (week 4, 45 min).** Run `baseline.sql` and fill `baseline-template.md` with the date. It's the number week 32 is measured against, so fill it in before any pilot adds to it.

### 5.3 Engineering (agents build; the founder reviews)

Estimates are agent build hours / founder review hours. Each task ends with `npm run lint && npm test && npm run build`, the relevant Playwright spec, a PR, and a checkbox update in this doc.

| # | Task | When | Est. | Acceptance |
|---|---|---|---|---|
| **AG1** | **Land the PR stack.** Founder reviews #32 (the biggest: 29 files); merge. Retarget #33 to `master`, run CI, fix, merge. Same for #34. Close #1 with a note. After #32 merges: the founder runs the leader flow once on the preview deploy (sign up as leader from `/pilot`, reach the invite page, print the join card) | wk 3 | 2h / 2h | All three merged with green CI. The leader flow was walked once on a real deploy |
| **AG2** | **Make the docs true.** `production-readiness-checklist.md` up to 0021, plus P2, P3 and P5. Metric glossary (capstone is measurable now). Pipeline rows in the scorecard template (§8). P6 smoke-test script with SQL checks. Master plan §11 points here | wk 3 | 1.5h / 0.5h | A founder could run each checklist without asking a question |
| **AG3** | **Outreach kit** (G3–G5) in `docs/gtm/outreach-kit.md` | wk 3 | 1h / 0.5h | The founder sends from it without rewriting |
| **AG4** | **Student-path page speed.** (1) Load the Sentry browser SDK lazily, or keep it off signed-out marketing routes (errors still reach Sentry once it loads; check the current `@sentry/nextjs` lazy-loading guidance in `node_modules`). (2) Keep `supabase-js` out of the initial bundle for signed-out visitors: server-render the signed-in state the nav needs, and import the browser client only when it's needed. (3) Re-measure with PR #34's Lighthouse setup | wk 4 | 6h / 1.5h | **Must:** `/learn/inv-1.1` and `/cohort/*` median mobile LCP ≤ 2.5s and marketing JS down ≥ 100 KB gzipped, with Sentry still catching a test error. **Want:** ≤ 2.0s, and the LHCI warnings for those routes turned into errors at the level reached |
| **AG5** | **Sign-up resilience.** (1) The "check your email" state: plain copy ("Check your inbox and spam folder; the email comes from …"), a **Resend email** button (with a cooldown), and a hint to ask the club leader if nothing arrives within 2 minutes. (2) ~~An IP-based limit on signed-out invite lookups~~: decided against on 2026-09-29 (§12) | wk 4 | 3h / 1h | A Playwright test covers the resend state. A unit test shows the limiter blocks the N+1th lookup within the window. No PII is stored |
| **AG6** | **Kickoff kit docs** (§5.4) | wk 4 | 2h / 1h | The founder can run the kickoff from these docs alone |
| **AG7** | **Pilot operations templates:** `pilot-runbook.md` (G1), an observation-notes template keyed by lesson and step id (G4), and `pilot-report-template.md` (G6) | wk 5 | 1.5h / 0.5h | Ready before Cohort A week 1 ends |
| **AG8** | **Pre-freeze security review:** `/security-review` on the invite, join, capstone share, teacher view and account deletion routes | wk 6 | 1h / 0.5h | Findings fixed, or recorded with a reason |

**Deliberately not in this window:** Duolingo B2+ conversions, reminders or streak-freeze (B6; only if week-4 retention says so), FE-6 showcase, FE-7 proof components, FE-9 visual consolidation, FE-12 SEO pages, dark mode, new lessons, and anything native. Unlock conditions are in master plan §9.

### 5.4 Kickoff kit (AG6 drafts; the founder uses it)

**IT allowlist** (one page to hand to a school's IT contact), covering every host a student device loads:
- `strikelab.dev`
- the production `*.supabase.co` project host
- `cdn.jsdelivr.net` (the Python runtime)
- `accounts.google.com`, only if Google sign-in is used
- the Sentry ingest host
- Vercel analytics, served first-party

AG6 finds the exact list by loading `/learn/inv-1.1`, `/lesson/[id]` and `/cohort/[id]` with the network log open. Nothing from Groq, because that's called server-side.

**Device and network test** (for T-7, on the school network):
1. The join link opens.
2. Sign-up works with the chosen method (P2/P3).
3. A Python exercise runs. **This is the Pyodide check. If it hangs, jsdelivr is blocked.**
4. `inv-1` session 1 completes.
5. The completion row appears (SQL).
6. Time how long the first lesson takes to open.

**Kickoff-day runbook (T-0):**
- **Timeline:**
  - **−15 min:** projector and join card up, founder signed in as leader on a second device, scorecard open.
  - **0–10 min:** what this is (three lines from the cohort home).
  - **10–20 min:** everyone joins.
  - **20–40 min:** first session together.
  - **40–45 min:** what's due this week, and close.
- **Fallbacks:**
  - Email not arriving: switch to option 2 in P2 on the spot. Decide in advance who can flip it and how long it takes.
  - Pyodide blocked: week 1's sessions don't need code. Carry on and fix the allowlist before week 3.
  - A student under 13: they don't sign up, and the leader handles it.
- **Afterwards:** scorecard check within 2 hours, and a note to the leader within 24 hours.

**Parent note** (one page): what the club is doing, 13+ only, what data is stored and why, private by default, how to delete, and the founder's contact.

**Incident runbook (D8):**
- **Roll back:** Vercel instant rollback to the previous production deploy (`isRollbackCandidate` deploys are listed in the dashboard).
- **Disable a feature:** env flag.
- **Who to tell:** the leader within 24 hours if student data is involved.
- **What to write down:** timeline, impact, fix, prevention.

---

## 6. Gates for this window

| Gate | When | Pass | If it fails |
|---|---|---|---|
| **Week-3 check** | Fri Oct 2 | ≥ 20 contacts, ≥ 3 calls booked, P1 done | Next week, move 3h from production work to outreach. Warm intros only; no new cold lists until the warm list is exhausted |
| **Fall go/no-go** *(new)* | **Fri Oct 16** | ≥ 1 leader with a verbal yes, a **start date ≤ Nov 2**, and approval either not needed (path A) or expected by Oct 23 (path B) | **Plan B** (§7). Log it in `decision-log.md` with the pipeline numbers |
| **W6 pilot readiness** (master plan, updated) | Fri Oct 23 | #32–#34 merged; AG4 "must" met; P1–P6 passed; rehearsal parts 1 and 2 done, with the scorecard matching a hand count; school-device test passed; ≥ 1 pilot with a locked date and approval | Slip kickoff to Nov 2 if the date allows. **Never launch without P1 (0016 applied)**: an unmeasured pilot wastes the pilot. Never launch without a working sign-up (P2) either |
| **First real scorecard** | Mon after Cohort A week 1 | Activation for Cohort A is readable from the database and matches a hand count | Stop and fix measurement before anything else |

After this window, the master plan's gates apply (W10 format check, W14 continue, W24 paid conversion, W32 apply), shifted by any kickoff slip.

---

## 7. Plan B: no fall pilot by Oct 16

Missing the fall isn't fatal, but three reactions would be: pretending it didn't happen, filling the time with features, or inflating a substitute into proof.

**B-1. Consider one "Cohort 0"** if, and only if, a teacher at the founder's own school will **sponsor** it: they're the leader of record, and the founder supports the sessions.
- It runs the same program and measurement, starting on or before Nov 2.
- **It's reported separately** in every table and never pooled with independent pilots, because a founder-supported cohort proves student activation, retention and capstone completion but **not** leader reuse or leader burden.
- Label it "founder-supported" in the pilot report and in any YC material.
- **Don't** recruit a public online cohort of minors. Guardian consent, moderation and privacy work for strangers under 18 costs more than it teaches at this stage.

**B-2. Put all GTM into spring.**
- Teachers plan spring clubs in November and December, and path C approvals take weeks, so start them now.
- Target: 5 dated spring starts between **Jan 11 and Feb 1**, which is enough to reach the W24 gate on Feb 28 (as in the master plan, but with no fall cohorts behind it).
- Keep outreach at the 15-a-week pace through Nov 20.

**B-3. Keep product frozen except**
- whatever Cohort 0 shows (if it runs);
- the winter-break items the master plan already allows (weeks 15–16).

**B-4. Re-plan the back half at W14** (Dec 20), with honest numbers.
- With only spring cohorts, leader-reuse evidence comes from one term, and paid asks move into late March.
- Check the actual YC deadlines then. Applying later with real numbers beats applying on time with a narrative (strategy §7).

---

## 8. What to measure in this window

Pilot metrics don't exist until a cohort runs, so for weeks 3–6 **the scorecard tracks the pipeline**. Add these rows to the weekly scorecard (AG2) and fill them every Friday from `crm.csv`:

| Metric | Wk 3 target | Wk 4 target | Wk 5 target |
|---|---|---|---|
| Contacts touched (cumulative) | 20 | 40 | 50 |
| Warm share of contacts | ≥ 70% | ≥ 60% | — |
| Replies | 6 | 14 | 18 |
| Calls held (cumulative) | 1–3 | 6 | 10 |
| Verbal yeses with a date ≤ Nov 2 | 0 | 1 | 2 |
| Approved / locked pilots | 0 | 0 | ≥ 1 |
| Spring (path C) leaders in progress | — | 1 | 3 |
| Founder hours: GTM / product / review | 7 / 3 / 2 | 7 / 3 / 2 | 7 / 3 / 2 |

**Leading indicators to act on:**
- **Reply rate below 20% after 20 messages:** the message is wrong. Rewrite it around the leader's pain (G4 discovery answers) and add more warm intros.
- **Calls with no yes:** the offer or the timing is wrong. Ask directly, "What would make this a yes?", and log the answer as an objection.
- **Yeses stuck in approval:** that's a path C problem. Move those leaders to spring and look harder for path A leaders for the fall.

---

## 9. Risks for this window

The master plan's risk register still applies. New or changed here:

| Risk | Likelihood | Impact | Mitigation | Early signal |
|---|---|---|---|---|
| Production is missing migrations while dependent code is live | **Unknown → verify** | Critical (signed-in class pages error; activation unmeasurable) | P1 this week | Sentry errors on `/dashboard` or class routes |
| Confirmation emails don't arrive for a room of students | **High** on default Supabase email | Critical at kickoff | P2 custom SMTP or confirmation off; AG5 resend; T-0 fallback | Any sign-up in testing waits more than 60s for email |
| School Google accounts can't sign in | High for under-18 school accounts | High | Email is the default; Google only after the device test | "This app is blocked" during the test |
| School filter blocks jsdelivr or Supabase | Medium → **Low for Python** (served from strikelab.dev since mega plan Q1) | High (lessons don't run) | IT allowlist; T-7 test; week 1 doesn't need code | Exercise spinner never finishes in the device test |
| Slow first load on Chromebooks | High (LCP 3.5–4.6s measured) | Medium (friction exactly where activation happens) | AG4 | Lighthouse; the timed test at T-7 |
| No fall leader by Oct 16 | **Medium-High** (zero contacts at week 3) | High | Warm-first outreach at 2× the pace; path-A qualification; Plan B ready | < 3 calls by Oct 2 |
| Stacked PRs drift into conflicts | Medium | Low-Medium | AG1 this week | Any new commit to `master` before they merge |
| A founder-supported Cohort 0 inflates the proof | Medium if Plan B | High for YC credibility | Report it separately, always labeled | Any combined table that doesn't split it out |
| Kickoff lands in exam season | Medium | Medium | Calendar check on the first call; Oct 26 preferred | Leader mentions exams, homecoming or a fall break |

---

## 10. Decisions the founder needs to make this week

Each has a recommendation, so they can be decided in one sitting. Log them in `decision-log.md`.

1. **Adopt this plan and the Fall go/no-go gate (Oct 16)?** *Recommendation: yes.* The master plan's W6 gate alone comes too late to change course: by Oct 25, the last fall start date is a week away.
2. **Sign-up email: custom SMTP or turn off confirmation for the pilot?** *Recommendation: custom SMTP (Resend free tier, `strikelab.dev` sender), and keep "turn off confirmation" as the kickoff-day fallback.*
3. **Google sign-in at kickoff?** *Recommendation: email by default; offer Google only where the device test proves it works.*
4. **Who are the first 10 warm contacts?** Names, today. Nothing else in this plan moves until this list exists.
5. **Is a sponsored Cohort 0 at your own school possible if Plan B triggers?** Knowing now saves a week later.
6. **Weekly hours through Oct 25:** is 12 realistic? If it's closer to 8, cut production work to P1–P3 and P6, and keep outreach at 6h.

---

## 11. One-page checklist

**Founder**
- [ ] Adopt the plan and log it (§10.1)
- [ ] Warm-20 list and 10 messages (wk 3), 40 contacts (wk 4), 50 (wk 5)
- [ ] Cal.com link and `NEXT_PUBLIC_PILOT_CALL_URL` (G2)
- [ ] P1 migrations · P2 email · P3 Google · P4 alerts · P5 non-prod · P6 smoke test · P7 baseline
- [ ] Merge #32, then #33, then #34, and walk the leader flow on the preview
- [ ] ≥ 6 calls held by Oct 9; ≥ 1 locked pilot by Oct 16
- [ ] Rehearsal parts 1 and 2 on non-prod
- [ ] School-device test at T-7
- [ ] Fall go/no-go (Oct 16) and W6 readiness (Oct 23) logged
- [ ] Kickoff; first Monday scorecard

**Agents**
- [x] AG1 verify the PR stack; close #1 (merging #32–#34 is the founder's call)
- [x] AG2 make the docs true, plus the smoke-test script and pipeline scorecard rows
- [x] AG3 outreach kit
- [x] AG4 student-path page speed (partly: see §12)
- [x] AG5 sign-up resilience (the signed-out join limiter was deliberately not built: see §12)
- [x] AG6 kickoff kit (allowlist, device test, T-0 runbook, parent note, incident runbook) and data map
- [x] AG7 pilot operations templates
- [x] AG8 pre-freeze security review
- [ ] Code freeze Fri Oct 23; after kickoff, fix only the named bottleneck

---

## 12. Execution log

### 2026-09-29: agent tasks AG1–AG8

Everything below is on branch `claude/gracious-mayer-z05kz3` (PR #35), stacked on #34.

**AG1: PR stack.**
- #32 → #33 → #34 (head `27d1e74`) all pass locally: lint; 44 files / 327 tests; build; Playwright 36/36.
- Review found nothing blocking. The notes are on #32.
- #1 (a stale Vercel Analytics install) is closed.
- **Merging is yours**, in order: #32; then retarget #33 to `master` and merge once CI is green; then the same for #34; then #35.

**AG2: docs.**
- `production-readiness-checklist.md` rewritten as runbook steps P1–P7.
- `check-migrations.sql` now covers all 22 migrations. A test fails if a new migration file isn't added to it.
- Metric glossary corrected, with the pipeline terms added.
- Pipeline rows added to the scorecard template.
- New `smoke-test.md`: the whole journey with SQL checks.

**AG3:** `docs/gtm/outreach-kit.md`.

**AG4: page speed.** Two changes:
- Sentry now loads after the page does (`src/lib/monitoring.ts`). Errors before that are buffered and replayed. **Verified:** an error thrown after load still reached a Sentry ingest endpoint.
- `supabase-js` loads only when a session cookie exists (`src/lib/supabase/lazy.ts`).

The JetBrains Mono font is no longer preloaded. Lighthouse (mobile, simulated slow 4G, median of 3):

| Route | LCP before → after | Initial JS before → after (transferred) | Score before → after |
|---|---|---|---|
| `/` | 5.0s → 3.7s | 460 → 324 KB | 0.81 → 0.89 |
| `/clubs` | 4.0s → 3.2s | 336 → 200 KB | 0.87 → 0.93 |
| `/pilot` | 3.7s → 3.2s | 336 → 200 KB | 0.89 → 0.93 |
| `/demo` | 5.0s → 3.5s | 343 → 206 KB | 0.81 → 0.91 |
| `/learn/inv-1.1` | 3.3s → 2.9–3.2s | 460 → 324 KB | 0.92 → 0.93 |

- Next's own first-load numbers are now the same (about 200 KB) on every route. The extra 124 KB Lighthouse shows on `/` and `/learn` is `<Link>` prefetching the lesson page's chart code after load, not part of the initial load.
- **The "must" target (≤ 2.5s on `/learn`) is not met.** What remains is React/Next itself and 44 KB of render-blocking CSS (`globals.css`), which is FE-9's consolidation work. Not worth doing before kickoff.
- In a real browser (4× CPU slowdown, no network throttling), LCP is 0.4–0.65s on these routes. The simulated number is dominated by bytes on a slow 4G model.
- **Before kickoff, time the page on the partner school's actual Chromebook** (kickoff kit §2 step 6). That's the number that matters.

**AG5: sign-up.**
- "Check your email" now has sender and spam-folder help, a **Resend email** button with a 60-second cooldown, and a pointer to the club leader.
- **Not built: a signed-out rate limit on invite lookups.** The code space is about 1.5 billion values, a hit reveals only a class name, and joining still needs an account and is rate-limited. A database limiter keyed by IP would need a new table for little gain. If abuse shows up, add a Vercel Firewall rule on `/join/*`.
- The resend screen has no automated test, because Playwright runs without Supabase and that state needs a real sign-up. `smoke-test.md` step 1 covers it.

**AG6:** `docs/gtm/kickoff-kit.md`:
- the IT allowlist, measured by recording every host the browser contacts on the invite, session, lesson and cohort pages;
- the device and network test;
- the T-0 runbook with fallbacks;
- the parent note;
- the incident runbook.

Also `docs/trust/data-map.md`, for the approval packet.

**AG7:** `pilot-runbook.md`, `pilot-observation-notes.md`, `pilot-report-template.md`.

**AG8:** `docs/trust/security-review-2026-09-29.md`.
- **High, fixed:** the weekly challenge leaderboard was public with students' sign-up names and user ids readable through the public API key. That contradicted the homepage's "no public leaderboards for students". Migration `0022` (**apply it in production**) and the new route show times only.
- **Low, fixed:** students' emails were sent to Sentry; now only the account id is.
