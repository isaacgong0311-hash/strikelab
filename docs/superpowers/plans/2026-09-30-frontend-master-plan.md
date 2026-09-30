# StrikeLab Frontend Master Plan: Sep 30, 2026 → Sep 2027

**Date:** 2026-09-30 (runway week 3), written after #36 (the homepage for both students and club leaders) merged.
**Status:** Active. This is the single frontend plan.
- It **absorbs** `2026-09-30-frontend-work-plan.md`. That plan's audit (A1–A12) and item numbers (FW-1 to FW-22) stay valid and are referenced here. Where the two disagree, this plan wins.
- `2026-09-23-frontend-plan.md` still holds for voice and principles. Its clubs-only positioning is replaced by §2 below.

**Fits inside:** the mega plan's gates (`2026-09-29-mega-plan.md`) and the sprint (`2026-09-30-sprint-to-go-no-go.md`). **Code freeze is Fri Oct 23.** Frontend work never outranks getting a leader.

---

## 0. Summary

**One product, two ways in.** A student can find StrikeLab alone, or be brought in by a club leader or teacher. Either way they land on the same lessons, player, playground and capstone. The frontend's job is to make both entrances obvious and make the path after them feel like one well-made product.

**Five things decide the next year:**

1. **One lesson player.** Only 3 of 23 lessons have the bite-sized player. The other 20, including 9 of the 12 lessons in the six-week lab, open a long-form page with a different design, so a cohort student switches experiences in week 2 of their pilot. Writing sessions a week ahead of each cohort, and then for the whole curriculum, is the biggest quality lever we have (§5, workstream S1).
2. **A real home for independent students.** Cohort students have a cohort home that says what to do this week. Independent students get a stats dashboard that says "Welcome back" to first-time visitors. Give them a "your path" home with one next step (S1).
3. **Consistent messages.** The Challenges page still says "Unlock with Pro → Start free trial". Meanwhile the pricing page says students never pay, and Pro is paused. `/roadmap` still says teachers create classes in Settings and that mobile layout is "in progress". Fix these before any leader or parent reads them (S7, before the freeze).
4. **One visual system.** Styling is spread across four systems: `globals.css` (4,219 lines), 406 inline style objects, Tailwind utilities in 31 files, and only 13 CSS modules. That spread causes slow first paint and screens that don't match. Winter-break work (S4).
5. **Test what signed-in users see.** CI can't sign in, so the screens leaders and students use most have no automated visual checks. Render them on `/demo` with sample data and screenshot-test them there (S5).

**Timeline in one line:**
- **Now → Oct 23:** fix what first-week users see and remove contradictions.
- **Oct 26 → Dec 20:** measured fixes only, plus sessions written one week ahead of the cohort.
- **Winter:** one visual system and the 2.0s load budget.
- **Spring:** proof, paid conversion, and the student home.
- **Apr:** YC-ready demo.
- **Summer:** the whole curriculum in the player.

---

## 1. Where we are (Sep 30)

### Shipped

| Area | What exists | PR |
|---|---|---|
| Homepage | A front door for both audiences: "I'm a student" (start lesson 1) and "I lead a club or teach" (free pilot). The student sections are back, a section for leaders was added, and every number on the page is computed | #36 |
| Leaders | `/clubs`, `/pilot`, `/pricing`, `/demo`, role choice at sign-up, `/teach/new`, invite page with QR card and kickoff live view, `/teach` class cards, scorecard | #31, #32, #35 |
| Students | Bite-sized player at `/learn/*` (69 sessions across inv-1, inv-2 and inv-5), long-form lessons at `/lesson/*`, playground, sandbox, cohort home, capstone editor, progress synced when signed in and saved on the device when not | Earlier PRs |
| Measurement | `?src=` attribution, funnel events, leader-funnel SQL, `npm run pipeline` | #33, #35 |
| Quality | axe on core public routes, Playwright journeys, Lighthouse budgets in CI, Sentry after load, Python served from strikelab.dev | #34, #35 |

### Numbers this plan moves

| Measure | Now | Source |
|---|---|---|
| Lessons with the bite-sized player | **3 of 23** (lab: 3 of 12) | `src/lib/sessions/content/`, `src/lib/cohorts/template.ts` |
| `globals.css` | 4,219 lines | `wc -l` |
| Inline `style={{…}}` objects | 406. The most are in `LessonClient` (36), `DashboardClient` (33), `SettingsClient` (27) and `about` (27) | grep |
| Files using Tailwind utilities | 31 | grep |
| CSS modules | 13 | find |
| Other global stylesheets | `pg-ch.css` (379 lines), `sandbox.css` (316 lines) | `src/app/` |
| Simulated mobile LCP on `/learn`, `/cohort` | 2.6–3.7s, against a 2.0s budget | Lighthouse, #35 log |
| Signed-in screens with automated visual or axe checks | 0 of 5 | `tests/` |
| Unused dependencies | `@splinetool/react-spline` and `@splinetool/runtime`: `SplineScene` is imported nowhere | grep |

---

## 2. Who the frontend serves

Four people. Every item in §5 names at least one of them.

| Person | How they arrive | What they must be able to do in the first 5 minutes | What keeps them |
|---|---|---|---|
| **Independent student** (13–18, alone) | Search, a friend, a link, the homepage "I'm a student" door | Start lesson 1 without an account, run real code, finish a session | A clear next step, visible progress, streaks that forgive, a capstone worth showing |
| **Cohort student** (brought in by a leader) | The join link or QR code at kickoff | Join in under a minute, see "this week", finish the first session in the room | The cohort home, the leader's nudges, the capstone deadline |
| **Leader** (club leader or teacher) | Outreach, the homepage "I lead a club" door, `/clubs` | Understand the six weeks, see the demo, book a pilot, create a class, print the invite | The scorecard, no prep burden, students who show up |
| **Evaluator** (parent, principal, IT, investor) | Forwarded link, `/about`, `/pricing`, `/privacy`, `/demo` | Answer "is this safe, real and free for students?" | Honest numbers, privacy by default, no contradictions |

**What this means for navigation:**
- **Signed-out visitors:** learning links first, then one door for leaders (shipped).
- **Signed-in students:** "Continue" first. Everything else is one level down.
- **Leaders:** "My classes" first (shipped).
- **Cohort students:** their cohort home is their home.

---

## 3. Principles (they decide the trade-offs)

1. **The pilot is the product until Dec 20.** Before then, a change has to help a named person at a named moment in a pilot. After Dec 20, the independent-student path gets equal weight.
2. **One player, one path, one look.** A student should never feel they walked into a different app. New learning content goes into the bite-sized player. The long-form page is where a student goes to read the whole lesson, not a second way to learn it.
3. **Honest by construction.** No number, logo, quote or price on a public page without a source file or computing code. No mention of a paid tier that doesn't exist.
4. **Private by default for minors.** No student names in public, no public leaderboards, and no showcase without explicit, reversible opt-in (plus guardian consent under 13 wherever that applies).
5. **Server-rendered first, motion as enhancement:**
   - axe clean;
   - keyboard complete;
   - no sideways scroll at 375px;
   - checked at 1366×768 (the school Chromebook).
6. **New styles go in co-located CSS modules on tokens (`src/styles/tokens.css`).** Never add to `globals.css`, inline styles or Tailwind. Every migrated file leaves the code better than it found it.
7. **Measure, then change.** During pilots, the weekly scorecard picks the one screen to fix.

---

## 4. Information architecture

### Route inventory and verdicts

| Route | Audience | Verdict | Notes |
|---|---|---|---|
| `/` | All | **Keep** (just shipped) | FW-22: the 10-second test before YC |
| `/lessons` | Students | **Keep, evolve** | The path map. Becomes the independent home's "full map" (FW-26) |
| `/learn/[sessionId]` | Students | **Invest** | The one player. Focused mode (FW-3); every lesson eventually (FW-23, FW-30) |
| `/lesson/[id]` | Students | **Demote to reference** | "Read the full lesson" from the player. Restyle to match once migrated (FW-10) |
| `/playground` | Students | **Keep** | Free-play Python. Link to it from sessions |
| `/sandbox` | Students | **Keep** | Paper trading. Currently a plain global stylesheet (`sandbox.css`); migrate in winter |
| `/challenges` | Students | **Fix now** | Remove the Pro gating copy (FW-24). Decide free vs retire (§9) |
| `/achievements` | Students | **Fold** | Into the student home (FW-26); the old URL redirects |
| `/certificate/[id]` | Students | **Keep** | Public (noindex) and shows the student's display name. FW-27 confirms it exists only when the student claims it |
| `/dashboard` | Students | **Replace** | Becomes the independent student's "your path" home (FW-26). Leaders' links move to `/teach` |
| `/cohort/[classId]`, `/capstone` | Cohort students | **Invest** | Covered by `/demo` screenshots (FW-8) |
| `/join/[code]` | Cohort students | **Keep** | Measured at kickoff |
| `/teach`, `/teach/new`, `/teach/[id]/invite` | Leaders | **Invest** | The class page moves here (FW-12) |
| `/dashboard/class/[id]/*` | Leaders | **Move** | To `/teach/[id]` with redirects (FW-12) |
| `/clubs`, `/pilot`, `/for-teachers` | Leaders | **Merge 2 → 1** | `/for-teachers` pitches assigning single lessons; `/clubs` pitches the six-week lab. Move the first into a section of the second, then redirect (FW-28) |
| `/demo`, `/demo/capstone/[slug]` | Leaders, evaluators | **Invest** | Sales tool and visual test surface (FW-6, FW-8) |
| `/pricing` | All | **Keep** | Gets checkout when the first leader pays (FW-18) |
| `/about`, `/faq`, `/privacy`, `/terms` | Evaluators | **Keep** | `/about` gets real numbers before YC (FW-21) |
| `/roadmap` | — | **Retire or rewrite now** | Stale and contradictory (FW-24). Recommended: redirect to `/about` |
| `/blog`, `/blog/[slug]` | Search | **Keep, low priority** | Only for SEO pages leaders search for (FW-19) |
| `/settings` | Signed-in | **Keep** | Already points leaders to `/teach/new`, and has a join-by-code form (FW-29 surfaces it) |
| `/success` | Stripe return | **Keep** | Check the copy when checkout returns (FW-18) |
| Auth routes | All | **Keep** | Name label and resend shipped |

### Navigation targets

| Who | Primary (in order) | Secondary (in the menu) |
|---|---|---|
| Signed-out | Lessons · Playground · For clubs & teachers · Demo · Pricing, plus the button "Start lesson 1" | About, FAQ |
| Student | **Continue** (button) · Lessons · Playground · Sandbox | Challenges (if kept), Pricing, About |
| Cohort student | **This week** (the cohort home) · Lessons · Playground | the same |
| Leader | My classes · Curriculum · Demo | Dashboard (until FW-26), Pricing |

The signed-in student nav drops "Roadmap" and the "Pro" tag. That's FW-25.

---

## 5. The work, by workstream

Estimates are **agent build hours / founder review minutes**. Every item ships as a PR with lint, unit tests, Playwright (including axe) and the build passing. Any visual change also gets screenshots at 375px and 1366px in the PR description. Items FW-1 to FW-22 are from the work plan. **FW-23 onward are new.**

### S1 · Learning experience (students, both kinds)

| # | Item | Why | Acceptance | Est. | When |
|---|---|---|---|---|---|
| FW-3 | **Focused lesson player:** the player's own bar (✕, progress, text size) replaces the site header on `/learn/*` | A3: about 110px of a phone screen goes to the site header, and its links lead out of the lesson | Content starts ≤ 64px from the top at 375px; ✕ returns to the cohort home or the path; axe clean | 3h / 10m | Phase A |
| FW-4 | **Honest empty state:** "Start here" for new visitors, "Welcome back" only for returning ones, real icons | A4 | New visitor sees no "Welcome back" | 2h / 5m | Phase A |
| **FW-23** | **Sessions one week ahead of the cohort:** write bite-sized sessions for the lab's weeks 2–3 (lessons 1, 2 and 3), then weeks 4–6 (lessons 4–7, q3, q4). Each is merged at least 7 days before the pilot cohort reaches it. Content only: no new step types, no engine changes | 9 of the lab's 12 lessons open the long-form page, so a cohort student switches players in week 2 | Every lab lesson has sessions before the cohort's week begins; `content.test.ts` passes; each lesson's long-form page links "Read the full lesson" | ~4h per lesson / 15m review per lesson (checking the math) | Lessons 1–3 by Nov 2; the rest a week ahead of use |
| **FW-26** | **Your-path home for independent students:** replace `/dashboard` with one screen containing:<br>- the next session (one button);<br>- the path so far;<br>- a streak with a freeze;<br>- the three most recent achievements;<br>- a link to the full map.<br>Level, XP and "solved by difficulty" panels move below the fold or go. `/achievements` redirects here | Independent students have no equivalent of the cohort home; the dashboard is a stats page | A new visitor sees one clear next step above the fold at 375px and 1366px; returning users land on their next session in one click | 6h / 20m | Winter (Phase C) |
| **FW-29** | **Joining a club from inside the app:** the join-by-code form already exists, but only in Settings. Put a "Have a class code?" field on the student home and in the menu, using the same API | Independent students who later join a club shouldn't need to find Settings or the invite link | The field joins the class and lands on the cohort home; bad codes get a friendly error; rate limit respected | 1.5h / 5m | Phase B (if leaders ask) or C |
| **FW-30** | **The whole curriculum in the player:** sessions for the remaining 11 lessons outside the lab (inv-3, 4, 6–9; lessons 8–11; q1) | Principle 2: one player | 23 of 23 lessons have sessions; `/lesson/*` is reference only | ~4h per lesson | Summer 2027 |
| FW-14 | **Icons and motion spec** | A4 remainder | No glyph icons left; motion tokens used everywhere | 3h / 10m | Phase C |

### S2 · Cohort and leader experience

| # | Item | Why | Acceptance | Est. | When |
|---|---|---|---|---|---|
| FW-6 | **Kickoff live view in `/demo`**: a stepper plays 0 → 10 students joining | A9: the most persuasive leader feature is invisible until a real kickoff | On `/demo`; labelled sample data; no network calls; axe clean | 2h / 10m | Phase A |
| FW-12 | **Leader surfaces under `/teach`**: the class page moves to `/teach/[id]`, with tabs for scorecard, toolkit, roster, assignments and capstones | A10: two mental models | Old links redirect; the journey test passes | 5h / 20m | Phase C |
| FW-13 | **In-app facilitator guide v2**, based on pilot observation notes | Mega plan Q14 | Leaders stop asking for the PDF | 3h / 20m | Phase C |
| — | Measured fixes on join, cohort home and scorecard wording | Whatever the weekly scorecard names | Fixed within the week | as needed | Phase B |

### S3 · Acquisition and conversion (visitors, leaders, evaluators)

| # | Item | Why | Acceptance | Est. | When |
|---|---|---|---|---|---|
| **FW-28** | **One leaders' page:** add an "Or assign single lessons" section to `/clubs` with the unique content from `/for-teachers`, then redirect `/for-teachers` to `/clubs` | Two leaders' pages split search traffic and outreach links, and `/for-teachers` still uses the old styling (Tailwind plus inline styles) | `/for-teachers` returns 308 to `/clubs`; sitemap updated; no internal links to the old URL | 1h / 5m | Phase A |
| FW-9 | **Titles and meta:** one pattern, "Page — StrikeLab"; the homepage is the only exception | A11 | Every title matches the pattern | 0.5h | Phase B |
| FW-15 | **Proof components** (outcome strip, quote cards), rendered only from sourced data | Honest proof | Only after ≥ 1 cohort completes, with consent | 4h | Phase D |
| FW-16 | Case-study page | A leader's consent | — | 3h | Phase D |
| FW-18 | **Paid conversion** on `/pricing` ("Request an invoice", Club checkout) | The first leader says yes to paying | A leader can pay or request an invoice without a call | 4h | Phase D |
| FW-19 | SEO pages leaders search for | Only after the W24 gate, and only if outreach isn't the bottleneck | — | 6h | Phase D |
| FW-22 | **10-second test** of the homepage with 5 people, then adjust | The homepage now serves two audiences; check that both understand it | ≥ 4 of 5 can say what it is and who it's for | 2h + founder 1h | Before YC |

### S4 · Design system and performance

| # | Item | Why | Acceptance | Est. | When |
|---|---|---|---|---|---|
| **FW-31** | **Remove dead weight:** delete `SplineScene` and the two `@splinetool` packages. Audit `V2Animator` (loaded in the root layout on every page) and keep it only if it's measurably needed | Unused code in the install; anything loaded in the root layout costs every page | Packages gone; lockfile regenerated with npm 11; build and e2e pass; Lighthouse doesn't regress | 1h / 5m | Phase A |
| FW-10 | **Consolidate styling** route by route, in order of traffic:<br>1. `/learn`<br>2. `/cohort`<br>3. `/lesson`<br>4. `/dashboard` (replaced by FW-26)<br>5. `/teach`<br>6. `/`<br>7. `/sandbox` and `/playground` (`sandbox.css`, `pg-ch.css`)<br>8. the rest<br>Tailwind leaves the app | A6, A7 | By Jan 3:<br>- `globals.css` < 1,500 lines<br>- inline styles < 100<br>- no Tailwind in migrated routes<br>- no change in the FW-8 screenshots<br>By Mar 31: `globals.css` < 1,000; Tailwind and `tailwind-merge` removed | 12h + 6h / 60m | Phase C, finished in D |
| FW-11 | **Hit the load budgets:** split critical CSS per route, subset fonts, then **make LCP and marketing-JS budgets errors in CI** | A7 | `/learn/*` and `/cohort/*` simulated mobile LCP ≤ 2.0s; marketing JS ≤ 180 KB; CI enforces both | 4h / 15m | Phase C |
| **FW-32** | **A UI kit page** (`/dev/ui`, not linked, blocked in `robots.ts`): every component in `src/components/ui` in every state, in light and high-contrast. It's what the screenshot tests and new work build on | New screens get built from the kit instead of fresh CSS | The page renders every ui component; axe clean; screenshots in FW-8 | 3h / 10m | Phase C |

### S5 · Quality and observability

| # | Item | Why | Acceptance | Est. | When |
|---|---|---|---|---|---|
| FW-7 | **Chromebook check:** add 1366×768 to the screenshot sweep and fix anything clipped | A12: most cohort students are on Chromebooks | A committed screenshot set; nothing clipped | 1.5h / 10m | Phase A |
| FW-8 | **Visual regression on `/demo`:** teacher and student tabs at 375 and 1366px, in CI | A8: covers signed-in screens without a database | CI fails on unintended visual change | 2h | Phase B |
| **FW-33** | **Player funnel per session:** step reached, time on step, drop-off, hint used. Sent to the existing analytics, with no personal data | Tells us which step confuses students, before observation notes do | A scorecard row shows the three worst steps each week | 3h / 10m | Phase B (before week 2 of the first cohort) |
| **FW-34** | **Low-memory run:** the Python and lesson journeys in Playwright with CPU throttled 4× and an emulated 4 GB device | School Chromebooks are slow; Pyodide is heavy | The first code run completes in under 15s on the throttled profile; if not, the loading state explains the wait | 2h / 10m | Phase A (with FW-7) |

### S6 · Trust surfaces (evaluators and minors)

| # | Item | Why | Acceptance | Est. | When |
|---|---|---|---|---|---|
| **FW-27** | **Public-surface audit:** every page that can show student work or a name (`/certificate/[id]`, `/capstone/[token]`, the showcase later) is opt-in, reversible, and shows no full name by default | Principle 4; a principal will check | Checklist in `docs/trust/data-map.md` updated; a Playwright test checks a certificate without opt-in returns 404 | 2h / 15m | Phase B |
| FW-17 | **Student showcase:** opt-in, anonymous by default, approved by the founder | Proof for students and leaders | Only after guardian consent flow and ≥ 3 consented capstones | 6h | Phase D |
| FW-21 | **`/about`** with the founder story and real, sourced numbers. The founder line moves here from the footer (done in #36) | Evaluators | Every number has a source | 2h + founder 1h | Phase E |

### S7 · Remove contradictions (before any leader or parent reads them)

| # | Item | Why | Acceptance | Est. | When |
|---|---|---|---|---|---|
| **FW-24** | **Remove the dead Pro offer and the stale roadmap:**<br>- `/challenges` drops "Unlock with Pro → Start free trial", the Pro badges and the archive paywall. All challenges are free (or the page is retired; §9);<br>- `/roadmap` redirects to `/about`, or is rewritten from current facts | The pricing page says students never pay; Pro is paused. `/roadmap` says classes are made in Settings and mobile is "in progress" | No "Pro", "free trial" or "Unlock" text anywhere a student can reach; `/roadmap` is gone or true; a unit test checks there's no Pro copy on public routes | 2h / 10m | Phase A |
| **FW-25** | **Signed-in student nav:** "Continue" button first; drop "Roadmap" and the "Pro" tag; Challenges only if kept | §4 navigation targets | Nav matches §4 for each role; Playwright checks each role's links | 1.5h / 5m | Phase A |

---

## 6. Phases

### Phase A · Now → code freeze (Fri Oct 23): first-week screens and contradictions

Only small, low-risk items that change what leaders and students see in their first minutes.

| PR | Items | Est. |
|---|---|---|
| A-1 · "Nothing contradicts itself" | FW-24, FW-25, FW-28 | 4.5h |
| A-2 · "The first session feels right" | FW-3, FW-4 | 5h |
| A-3 · "Leaders can see kickoff day" | FW-6 | 2h |
| A-4 · "Works on a school Chromebook" | FW-7, FW-34, FW-31 | 4.5h |

**Total:** about 16 agent hours and about 1 hour of founder review, **merged by Tue Oct 20**.

Also in Phase A, and not code: **FW-23 lessons 1–3 drafted.** Their sessions are content. They merge after the freeze only under the content exception in §8.

### Phase B · Fall pilots (Oct 26 → Dec 20): measured fixes, content a week ahead

- **FW-23:** sessions for each lab week, merged 7 days before the cohort reaches it.
- **FW-33:** the player funnel, live before week 2 so it measures the new sessions.
- **FW-8:** visual regression on `/demo`.
- **FW-9:** titles.
- **FW-27:** public-surface audit.
- **One measured fix a week**, chosen by the scorecard (S2).

### Phase C · Winter build (Dec 21 → Jan 3): one visual system, the 2.0s budget, the student home

Nobody is in a cohort, so this is the window for bigger changes:
- FW-10 (first pass)
- FW-11
- FW-12
- FW-13
- FW-14
- FW-26
- FW-32
- FW-29 (if not done earlier)

### Phase D · Spring cohorts and paid proof (Jan → Mar)

- FW-10 (finish)
- FW-15
- FW-16
- FW-17
- FW-18
- FW-19 (only after the W24 gate)

### Phase E · YC application (late Mar → Apr)

- **FW-20:** demo polish and a 2-minute video.
- **FW-21:** `/about` with sourced numbers.
- **FW-22:** the 10-second test.

### Phase F · Summer (May → Aug 2027): the whole curriculum in one player

- **FW-30:** all 23 lessons in the player.
- **Refresh from a year of observation notes:** the steps students got stuck on, rewritten.
- **Fall 2027 launch polish** for renewing and new leaders.

---

## 7. Quality gates (what CI enforces, and when that tightens)

| Gate | Today | After Phase A | After Phase C | After Phase D |
|---|---|---|---|---|
| axe (serious/critical = 0) | Core public routes, `/teach` | + focused player, `/demo` kickoff | + every `/teach/*` tab, the student home, `/dev/ui` | same |
| Playwright journeys | Sessions, reveal, teacher setup, Python | + nav per role, no Pro copy, player exit, throttled Python | + class page under `/teach`, the student home | + checkout |
| Visual regression | — | — | `/demo` and `/dev/ui` at 375 and 1366px | same |
| Lighthouse | CLS, bytes and score are errors; LCP and JS are warnings | same | **LCP ≤ 2.0s and marketing JS ≤ 180 KB become errors** | same |
| Styling | — | Review rule: no new `globals.css`, inline style or Tailwind | Lint fails on new `style={{` in migrated routes | Tailwind removed from the build |

---

## 8. Rules for working during pilots

- **Code freeze (Oct 23 → the end of each cohort's week 1):** no changes to join, sign-up, the cohort home or the player's engine.
- **The content exception:** new or edited sessions may merge during a cohort **only** when:
  - they touch nothing but `src/lib/sessions/content/`;
  - `content.test.ts` passes;
  - they're merged at least 7 days before the cohort reaches that week;
  - the founder has checked the math.
- **One visible change a week at most** on screens a cohort uses, announced to the leader in that week's message.
- **Rollback:** every PR during a pilot can be reverted on its own. Vercel's instant rollback is the first step if anything breaks during class time.

---

## 9. Decisions for the founder

1. **Challenges:** make all challenges free (recommended; it costs nothing, and interview-style problems suit independent students), or retire the page? Either way, the Pro copy goes in Phase A.
2. **`/roadmap`:** redirect it to `/about` (recommended), or rewrite it? A public roadmap is a promise you have to keep true every week.
3. **FW-23 pace:** will you review the math in one lesson's sessions (about 15 minutes each) every week during the pilot? If not, the lab stays long-form after week 1 and FW-26 goes first in winter instead.
4. **Where the independent-student push starts:** winter break (recommended; the pilot comes first until Dec 20), or now, alongside the pilot?

---

## 10. Success measures

| Measure | Now | Target | By |
|---|---|---|---|
| Contradictions on public pages (Pro offer, stale roadmap, two leaders' pages) | 3 | 0 | Oct 20 |
| Lab lessons in the player | 3 of 12 | 12 of 12 | A week before each cohort reaches them (Dec 20 for the first) |
| All lessons in the player | 3 of 23 | 23 of 23 | Aug 2027 |
| Kickoff: join → first session done in the room | unmeasured | ≥ 80% | First kickoff |
| Independent students: first visit → first session completed | unmeasured (funnel events exist) | ≥ 40% | Measured from Phase B; target by Mar |
| Independent students: week-2 return | unmeasured | ≥ 25% | Mar |
| Signed-in screens with automated visual or axe checks | 0 of 5 | 5 of 5 | Jan 3 |
| `/learn`, `/cohort` simulated mobile LCP | 2.6–3.7s | ≤ 2.0s, enforced | Jan 3 |
| `globals.css` lines | 4,219 | < 1,500, then < 1,000 | Jan 3, then Mar 31 |
| Inline style objects | 406 | < 100 | Jan 3 |
| 10-second test ("what is this, and who is it for?") | untested | ≥ 4 of 5 for **both** audiences | Before YC |

---

## 11. Not doing

- Dark mode, a rebrand, a mascot, a 3D or WebGL hero (the Spline code is being removed, not used).
- A native app: the mega plan's condition for one hasn't been met.
- Public leaderboards or student names anywhere without opt-in.
- A paid student tier. Students don't pay; that's the promise on every page.
- New marketing pages before the W24 gate. Outreach is the channel.
- Redesigning lessons before observation notes or the player funnel (FW-33) say what's wrong.
