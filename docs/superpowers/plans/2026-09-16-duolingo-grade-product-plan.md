# Duolingo-Grade Product Plan

**Date:** 2026-09-16
**Status:** Draft for founder review
**Relates to:** `docs/superpowers/specs/2026-09-13-strikelab-yc-company-design.md` (YC strategy), `docs/ui-system.md`, `docs/ui-accessibility-audit.md`

## 1. What "like Duolingo" means here

Duolingo doesn't look professional because of the green owl. It looks professional because of five things, and StrikeLab should copy those, not the surface:

1. **Nothing is ever broken or inconsistent.** Every number is right, every screen has loading, empty and error states, and nothing flashes, hangs or goes invisible.
2. **The core loop is tiny and tactile.** A lesson takes 3 to 5 minutes, shows one idea per screen, needs an answer every 20 to 40 seconds, gives feedback right away and ends with a moment worth celebrating.
3. **Habit mechanics are fair and exact.** Streaks follow the learner's local day, a streak freeze keeps one missed day from wiping out a month, and reminders arrive at the right time.
4. **Review is automatic.** Things you got wrong come back later, and a "Practice" button always has something useful in it.
5. **Every decision gets measured.** Each screen fires clean events, funnels are watched every week, and changes ship behind flags.

**How this fits the YC strategy:** that strategy froze curriculum breadth, native mobile and AI personalization, and it says that "a polished application without that evidence is not success." So this plan only adds polish that pushes up the pilot metrics that decide the company: **activation (60%+), week-four retention (40%+), and capstone completion (35%+)**. Each phase below names the metric it serves. Leagues, a mascot and native apps wait until after the five-pilot gate (§8).

## 2. Current state (audited 2026-09-16)

### Strong foundations to keep
- There's already a Duolingo-style winding path (`src/app/lessons/LessonsClient.tsx`, `PathScenery`), plus XP, levels, streaks, a heatmap, 12 achievements, certificates, a daily-mission card on the dashboard, and classes, assignments and cohorts.
- Raw material for bite-sized steps already exists: `QUIZZES` (`src/lib/quizzes.ts`), `Checkpoint`, `PracticeProblem`, `FormulaSandbox`, `PayoffDiagram`, `BinomialTree`, and Pyodide exercises with test functions.
- An uncommitted UI/a11y system is in progress: `src/styles/tokens.css`, `foundation.css`, `src/components/ui/*`, the Playwright + axe setup and the audit docs.

### Gaps that make it feel less professional than Duolingo
| # | Finding | Evidence | Why it matters |
|---|---|---|---|
| G1 | **Lesson body invisible on production.** On strikelab.dev/lesson/1, the section containers stayed at `opacity: 0` after scrolling, leaving blank screens under the header. | Checked in a browser on 2026-09-16. The prereq box and quiz rendered, but the section wrappers didn't. | This is the single worst first impression. The uncommitted a11y branch says it fixes this, but it isn't shipped. |
| G2 | **Streak day is computed in UTC.** `toDateStr()` in `src/lib/useProgress.ts` uses `toISOString()`. | A Texas student finishing a lesson at 7:30pm CDT gets credit for *tomorrow*, so streaks break or double-count. | Duolingo's credibility rests on the streak being exact. |
| G3 | **Lessons are 15-minute HTML walls.** `Lesson.content` is a single HTML string with a quiz and exercise at the end. | `src/lib/lessons.ts`, `duration: "15 min"` | High drop-off on the first session, and activation fails right here. |
| G4 | **Inconsistent numbers in public copy.** The README says 22 lessons and a 6-lesson investing track. The code has 23 lessons and 9 investing lessons, and the "All-Star" badge says 23. The homepage stat row showed `0 / 2 / $0` before the counters animated. | README, `achievements.ts`, homepage screenshot | Small inconsistencies read as amateur. |
| G5 | **No reminders or re-engagement.** There's no email provider, web-push setup or PWA manifest. | No `manifest` or mail library in `src/` | Duolingo's retention engine is mostly notifications. |
| G6 | **No review or spaced repetition.** Once a lesson is complete, its content never comes back. | — | Week-four retention and real learning both suffer. |
| G7 | **Analytics are thin.** Vercel Analytics custom events (`src/lib/analytics.ts`) have no user-level funnels, retention curves or flags. | — | You can't iterate the way Duolingo does without them. |
| G8 | **Two style systems.** A 4,100-line legacy `globals.css` runs alongside the new tokens and UI primitives. | `src/app/globals.css` | Visual drift between routes. |

## 3. Guiding rules

- **Evidence first.** A phase ships when its metric check is in place, not only when the UI looks good.
- **Pilot lessons first.** Convert the Quant Foundations cohort lessons (`inv-1`, `inv-2`, `inv-5`, `1`, `2`, `3`, `4`–`7`, `q3`) to the new format before touching the other 11.
- **Progressive enhancement** (global CLAUDE.md). Content must render with JS and animation stripped out, and celebrations only add to a finished state.
- **Free tooling by default.** PostHog free tier (1M events/month), Resend free tier (3k emails/month), Web Push through a service worker at no cost, and Supabase and Vercel already in place. Any paid step gets flagged.
- **Teen and school context.** Nothing public by default, no loss-aversion dark patterns (no hearts or lives that block learning), and sound off by default because this gets used in classrooms.

## 4. Phases

Durations are in **build-weeks of about 10 focused hours**. The YC strategy budgets 4–5 coding hours a week, so at that pace each phase takes about twice as long in calendar time. Phases 0–2 are the ones that matter before the first pilot.

---

### Phase 0: Polish floor (1 build-week) · *serves: activation*

Goal: nothing on the site looks broken or contradicts itself.

1. **Land the in-progress UI/a11y branch.** Split it into reviewable commits (tokens/foundation → UI primitives → route migrations → tests), run `npm run lint && npm test && npm run build && npm run test:a11y`, then merge.
2. **Fix G1 on production.** Check `/lesson/[id]` with JS disabled, with reduced motion on, and in a background tab where the observer never fires. Add a Playwright test that asserts the lesson section text is visible (`opacity: 1`, in the viewport) without scrolling tricks.
3. **Fix G2 (streak timezone).** Build date keys from local calendar parts (`getFullYear/getMonth/getDate`), store the user's IANA timezone on the profile, and compute streaks server-side in that timezone during sync. Add unit tests for 11:30pm local, DST changes and travel.
4. **Fix G4.** Derive every public count (lessons, tracks, badges) from `TRACKS`/`ACHIEVEMENTS` rather than hard-coding it. Server-render the homepage stats with their final values and let the animation only enhance them. Update the README.
5. **Add a state audit.** For each of the 8 flows in `ui-accessibility-audit.md`, confirm designed loading, empty and error states (skeletons, not spinners) and record gaps as issues.

**Done when:** every route passes the axe suite, a lesson reads correctly with JS disabled, streak tests pass across timezones, and no hard-coded counts are left.

**Progress (2026-09-16):**
- [x] G1: the real cause was `.lesson-content` mounting *after* `V2Animator`'s effect, so it was never observed and never got `.in`. Tall elements also couldn't reach the 15% threshold. Now only elements explicitly marked `data-sl-reveal="pending"` are hidden, the threshold is 0, and anything already on or above the screen reveals right away. `tests/reveal.spec.ts` fails on the old behaviour and passes now.
- [x] Playwright was hitting `127.0.0.1` while Next dev serves `localhost`, so the cross-origin dev check blocked hydration and **every browser test ran without JS**. `playwright.config.ts` now uses `localhost`, and all 16 tests pass with the page hydrated.
- [x] G2 client side: `src/lib/progress/streak.ts` uses local-day keys, and `useProgress` and `ActivityHeatmap` use it (12 timezone/DST tests).
- [x] G2 server side: `progress.timezone` (migration 0013) is saved separately and best-effort on sign-in, and `GET /api/progress` reports the streak on the learner's local day. **Run migration 0013 in Supabase.**
- [x] G4: FAQ, homepage stats and achievement totals come from `TRACKS`, All-Star ignores retired lesson ids, and the README counts are fixed.
- [ ] Split the UI/a11y branch into commits and merge.
- [ ] Loading/empty/error state audit.

---

### Phase 1: Bite-sized lesson sessions (3 build-weeks) · *serves: activation, week-4 retention*

Goal: turn each long lesson into a **unit of 3–5 short sessions**, each about 4 minutes, that feel like Duolingo.

**Content model** (new, alongside `Lesson` for backward compatibility):
```ts
interface Session {
  id: string;            // "3.2"
  lessonId: string;      // "3"
  title: string;
  steps: Step[];         // 8–15 steps
}
type Step =
  | { kind: "explain"; html: string; visual?: LessonVisual }          // ≤ 80 words
  | { kind: "mcq"; question; options; correct; explanation }          // reuse QuizQuestion
  | { kind: "numeric"; prompt; answer; tolerance; unit?; explanation } // "Intrinsic value = ?"
  | { kind: "slider-target"; prompt; sandbox: FormulaSandboxConfig; target; tolerance } // "Drag σ until the call is worth $5"
  | { kind: "order"; prompt; items; correctOrder }                    // order the steps of a derivation
  | { kind: "predict-chart"; prompt; options; chart }                  // "Which payoff diagram is a long put?"
  | { kind: "code"; exercise: Lesson["exercise"] };                   // Pyodide, final session only
```

**Session player** (`src/app/learn/[sessionId]/`):
- Full-screen, distraction-free layout: a progress bar and close (×) at the top, one step in the middle, and a sticky **Check** button at the bottom.
- A feedback sheet slides up in green ("Nice!" plus the explanation) or red (the correct answer plus the explanation), then **Continue**. Keyboard: `Enter` checks or continues, `1–4` picks an option.
- Missed items go back into the same session queue until answered correctly, which is how Duolingo does it without hearts.
- **Session complete screen:** XP earned, accuracy %, time, and streak flame animation if this was the first session today, then "Next session" or "Back to path." Motion comes from CSS/WAAPI and respects `data-motion`.
- Sound effects are optional (the correct/incorrect/complete sounds are about 3 small files), off by default, and toggled in Settings.
- Resume mid-session from localStorage, and sync to Supabase when signed in.

**Path integration:** each path node becomes a lesson with a ring showing the fraction of sessions done. Tapping it opens a popover ("Session 2 of 4 · Start") like Duolingo's node tooltip. The final code exercise stays a special "lab" node.

**Content work:** break up the 11 pilot lessons. Explanatory HTML becomes `explain` steps, `QUIZZES` become `mcq` steps, and new `numeric`/`slider-target` steps get written for the math-heavy ideas. Budget about 2–3 hours per lesson. Add a `scripts/lint-sessions.ts` check (step count, word limits, every `mcq` has an explanation, numeric answers verified by running the formula).

**Data:** add `session_completions(user_id, session_id, completed_at, accuracy, duration_ms)`, which fits the YC doc's normalized, timestamped completion model. A lesson counts as complete when all its sessions are done, and `progress.completed` stays updated for compatibility.

**Done when:** the median session lasts 3–6 minutes in analytics, the first-session completion rate for new visitors is instrumented, and Playwright covers keyboard-only and screen-reader runs through one session.

**Progress (2026-09-16 to 2026-09-22), first two slices:**
- [x] Engine (`src/lib/sessions/engine.ts`): multiple-choice and numeric grading (accepts `$`, `%`, commas), a retry queue for missed questions, progress and first-try accuracy, all unit tested.
- [x] Content lint (`src/lib/sessions/content.test.ts`): unique ids, 5–15 steps, at least 2 questions, paragraphs of 50 words or fewer, valid answer keys, and worked numeric answers recomputed.
- [x] `inv-1` converted into 3 sessions (6/6/10 steps), reusing its existing quiz questions.
- [x] Player at `/learn/[sessionId]` (prerendered, `noindex`, canonical is the long-form lesson): progress bar, number-key answers, Enter from anywhere, red/green feedback bar with focus management, and a complete screen with accuracy, time and session dots.
- [x] XP is awarded once, through `markComplete`, when the last session of an unfinished lesson ends.
- [x] "Learn this in N short sessions" callout on lesson pages, which resumes at the first unfinished session.
- [x] `session_start` / `step_answered` / `session_complete` events.
- [x] Playwright: full keyboard run with a retry, Check disabled until answered, axe scan of the feedback state, 404, and XP awarded only once.
- [x] Session results sync to Supabase (`session_completions`, migration 0014). The first completion is kept on both sides, pushed when a session finishes and reconciled on sign-in. It's best-effort, so sessions stay local-only until **migration 0014 is run in Supabase**.
- [x] Path nodes for unfinished lessons with sessions show a sessions-done ring and link to the next unfinished session. "Recommended next" does too.
- [ ] Step kinds `slider-target`, `order`, `predict-chart`, `code`.
- [x] `inv-2` converted (3 sessions, 6/7/7 steps). The content lint now also rejects `**` in questions, options and explanations, which render as plain text.
- [ ] Convert the remaining pilot lessons: `inv-5`, `1`, `2`, `3`, `4`–`7`, `q3`.

---

### Phase 2: Habit loop (2 build-weeks) · *serves: week-4 retention*

1. **Onboarding flow** (before signup, like Duolingo): *Why are you here?* (club/class · curious · interview prep) → *How much do you know?* (never traded · know stocks · know options) → *Daily goal* (5 / 10 / 15 min) → **start the first session right away with no account** → prompt to save progress after the session-complete screen. Cohort join links skip straight to the cohort home.
2. **Daily goal ring** in the nav, filled by session minutes or XP. It replaces the static "Daily mission" card.
3. **Streak system v2:** local-day streaks (from Phase 0), **1 streak freeze** earned per 7-day streak (max 2 held), a "streak repaired" state, and a calendar view in the dashboard heatmap. Cohort meeting days count, so a student who shows up to club doesn't lose the streak.
4. **Reminders.** Pick one channel first:
   - **Email via Resend (free tier):** a "your streak ends at midnight" nudge at the user's chosen hour, only if nothing is done today; a weekly recap (XP, sessions, what's due in the cohort); and one-click unsubscribe. Schedule with a Vercel Cron hitting `/api/cron/reminders`.
   - **PWA + Web Push** (free): `app/manifest.ts`, service worker, permission ask *after* the second completed session, never on first visit.
   Students under 18 get guardian- and school-appropriate copy, and no guilt-trip messaging.
5. **Celebrations:** streak milestones (3, 7, 14, 30), a level-up modal, and a badge unlock toast. Each one fires once, is dismissible and gets announced through the `LiveRegion`.

**Done when:** D1/D7 retention and reminder-to-session conversion show up in analytics, and the reminder cron has tests for timezone and quiet hours (no sends from 9pm to 7am local).

---

### Phase 3: Practice and review (1.5 build-weeks) · *serves: learning outcomes, week-4 retention*

- A **review queue** using a Leitner scheme (boxes 1–5, intervals 1/3/7/14/30 days) keyed by step id, filled by every missed `mcq`/`numeric`/`slider-target` and a sample of correct ones.
- A **Practice button** on the path and dashboard ("12 items to review") that runs a 5-minute mixed session through the same player and earns XP.
- **"Legendary" re-run** of a finished lesson at a harder step mix for bonus XP, which gives a pilot student something to do when ahead of the cohort.
- **Teacher value:** the cohort scorecard shows the three most-missed concepts this week, and that becomes the discussion prompt for the next club meeting.

---

### Phase 4: Measure like Duolingo (1 build-week, can run alongside Phase 1)

- Add **PostHog (free tier)** next to Vercel Analytics, identified by Supabase user id, with cohort id and acquisition source (`?src=`) as person properties. Don't capture names or code content.
- Define the **event taxonomy** in `docs/gtm/metric-glossary.md`: `onboarding_step`, `session_start`, `step_answered{kind,correct}`, `session_complete{accuracy,duration}`, `streak_extended`, `streak_frozen`, `reminder_sent/opened`, `practice_start`.
- Build **dashboards**: the new-visitor funnel (landing → first step → first session complete → signup → D1 → D7), cohort retention curves and session length distribution.
- Use **feature flags** for the session player, onboarding and reminders, so the old lesson page stays as a fallback during the first pilot.
- Adopt **one experiment at a time**, logged in `docs/gtm/decision-log.md`: hypothesis, metric, sample, result.

---

### Phase 5: Brand and craft pass (1.5 build-weeks) · *serves: trust with teachers and parents*

- **One visual language:** finish migrating routes off `globals.css` per `docs/ui-system.md`, set the deletion target to under 1,000 lines, and add Playwright screenshot tests for the path, session, dashboard and cohort home.
- **Motion spec:** 3 durations (120/200/320ms), 2 easings and a spring for celebrations. Write it into `tokens.css` and document it.
- **Illustration and icon set:** replace the scattered math glyphs and emoji with a consistent icon family (for example Lucide, which is free) plus 6–8 simple custom spot illustrations for the empty, success and error states. A mascot stays optional and is deferred (§8).
- **Voice and tone guide:** short, encouraging and precise, with no hype. Every error message says what happened and what to do.
- **Performance budget:** LCP under 2.0s on mobile 4G for `/`, `/lessons` and `/learn/*`. Lazy-load Pyodide only for `code` steps and preload it on the lab node.

---

## 5. Suggested calendar

| Build-week | Work | Pilot milestone |
|---|---|---|
| 1 | Phase 0 polish floor | — |
| 2–4 | Phase 1 session player + 11 pilot lessons converted; Phase 4 instrumentation in parallel | Rehearse cohort with test accounts |
| 5–6 | Phase 2 habit loop (onboarding, goal ring, streak v2, email reminders) | **First design-partner cohort starts** |
| 7–8 | Phase 3 practice/review, then fix whatever the cohort 1 scorecard shows | Weekly scorecard review |
| 9–10 | Phase 5 brand/craft pass; convert remaining 11 lessons | Second cohort |

Calendar time is roughly 2x build-weeks at the YC-plan pace of 4–5 coding hours a week.

## 6. Success metrics

| Metric | Today | Target after Phase 2 |
|---|---|---|
| New visitor → first session complete | not measured | ≥ 45% |
| First session complete → signup | not measured | ≥ 30% |
| Cohort activation (YC definition) | no cohorts yet | ≥ 60% |
| Cohort week-4 retention | — | ≥ 40% |
| Median session length | ~15 min lesson | 3–6 min |
| D7 retention (non-cohort signups) | not measured | ≥ 20% |
| Axe violations on core routes | in progress | 0 |
| Mobile LCP on `/learn/*` | not measured | < 2.0s |

## 7. Risks

- **Content conversion is the bottleneck, not code.** Converting 11 lessons at about 2–3 hours each is about 30 hours. Mitigation: convert in pilot-schedule order, and generate draft steps from the existing HTML with Claude, then check every answer by computing it.
- **Gamification can cheapen a rigorous product.** Keep the celebrations short, keep the code lab as the real test of learning, and never award XP for skipping ahead.
- **Two lesson formats during migration.** Feature-flag the new player per lesson, and delete the old renderer once all 23 lessons are converted.
- **Minors and notifications.** Reminders are opt-in, quiet hours are enforced, unsubscribe works in one click and messages carry no personal data.

## 8. Deliberately deferred (until after the five-pilot gate)

- **Leagues and public leaderboards.** A cohort-scoped, opt-in weekly XP board is the most allowed before the gate.
- **A mascot** and character animation (Rive/Lottie).
- **Native iOS/Android apps**, even though `capacitor.config.ts` exists. The PWA covers installs and push.
- **Hearts or lives**, gems and a shop, or any monetized gamification.
- AI-adaptive difficulty. The Leitner queue is enough for now.
- Converting non-pilot tracks before the pilot lessons prove the format.
