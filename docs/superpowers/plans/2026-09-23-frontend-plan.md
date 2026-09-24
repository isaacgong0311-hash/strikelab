# StrikeLab Frontend Plan: from "learning site" to "company a YC partner gets in 10 seconds"

**Date:** 2026-09-23 (runway week 2)
**Status:** Decisions made 2026-09-23 (founder delegated them; see `docs/gtm/decision-log.md`): headline A, `/clubs` buyer page with `/for-schools` redirected, text-only founder note, founder-written example capstones, Pro hidden until the five-pilot gate.
**Parent plan:** `2026-09-22-master-plan.md`. This plan covers everything a visitor, leader, student or investor *sees*. Its tasks slot into the master calendar and never outrank pilot-critical work (Workstream A).
**Related:** `docs/ui-system.md` (tokens, accessibility rules), `2026-09-16-duolingo-grade-product-plan.md` (in-lesson polish).

---

## 1. What "YC-worthy" means for a frontend

YC partners spend minutes, not hours. Before and during an interview they will:

1. **Open the site and decide in about 10 seconds what the company does and for whom.** If the answer is fuzzy, everything else is discounted.
2. **Click into the product.** A working product they can touch beats any pitch. A product they can't touch without signing up mostly doesn't get touched.
3. **Look for evidence**: real numbers, real users, real work. Anything that smells inflated ("most popular", "trusted by", vanity stats) costs more credibility than it earns.
4. **Watch the demo video** from the application.

The same three things convert the *actual* customer, a club leader or teacher: clarity ("what would my club do each week?"), the product itself ("show me the teacher view"), and proof ("did it work anywhere?").

So the frontend's job is to be **clear, demonstrable and honest**, in that order, for three audiences:

| Audience | What they need | Where today | Where they should land |
|---|---|---|---|
| **Club leader / teacher** (buyer and distributor) | "Can I run this with zero prep, and will it make my club better?" | A `/for-schools` page selling a $499 license | A clubs-first homepage → a clickable demo → a 3-minute self-serve pilot setup |
| **Student** (user) | "Is this fun, and will I build something real?" | A consumer homepage ("Invest like the pros") | Try lesson 1 with no signup, or join via their leader's link |
| **YC partner / investor** | "What is this, is anyone using it, is the founder unusually good?" | Same consumer homepage | The same clubs-first homepage, the public demo, real outcomes as they arrive, a tight demo video |

---

## 2. Audit (2026-09-23, current production)

| # | Finding | Evidence | Severity |
|---|---|---|---|
| **F1** | **The homepage sells a different company.** The hero is "Invest like the pros" for individual students. Nothing above the fold mentions clubs, teachers, the six-week lab, capstones or outcomes. That's the strategy's wedge, and the product now fully supports it. | `src/app/HomeClient.tsx` hero; nav; footer | Critical |
| **F2** | **No pilot funnel.** A leader can't start a pilot or even ask for one. `/for-schools` sells a "$499/year site license, 30 seats, monthly training calls" with "Request a quote", which contradicts the strategy's offer (free pilots, then $499 per school or $199 per club). | `/for-schools`, `/pricing` | Critical |
| **F3** | **Unearned claims.** Pro is labeled "MOST POPULAR" with no subscribers. The stat row counts "0 INSTALLS". The announcement bar says "Paper-trading sandbox just shipped" (months old). School promises "monthly teacher training calls" and "curriculum alignment guide" that may not exist yet. Pro lists "coming soon" items. | `PricingClient.tsx`, `Nav.tsx:187`, homepage stats | High |
| **F4** | **Navigation serves browsers, not buyers.** Primary nav is Dashboard, Lessons, Playground, Sandbox, Challenges. There's no "For clubs", no demo, no pilot. | `src/components/Nav.tsx` | High |
| **F5** | **Teacher setup is buried.** Creating a class lives in Settings. There's no teacher home, no guided setup, and no "I lead a club" choice at sign-up. | `SettingsClient.tsx` `ClassroomSettings` | High |
| **F6** | **No way to try the teacher experience without an account.** The scorecard, leader toolkit and cohort home are the best demo StrikeLab has, and they're invisible to anyone who isn't a signed-in teacher with students. | none | High |
| **F7** | **No proof surfaces.** No student work, outcomes or quotes. Right now there's nothing true to show, but there are also no *slots* ready to fill the day pilot data exists. | none | Medium (grows each week) |
| **F8** | **Two visual languages.** Dark "terminal" marketing hero vs the light v3 app. A 4,219-line `globals.css` next to tokens and CSS modules. `--font-mono` resolves to nothing site-wide (fix in progress in a separate session). | `globals.css`, `tokens.css` | Medium |
| **F9** | **Performance and funnel are unmeasured.** No LCP budget or Lighthouse check in CI, and no marketing funnel events. | CI config, `analytics.ts` | Medium |
| **F10** | **Tone risk for minors.** "Invest like the pros" reads like a trading or influencer product to a parent, principal or DPA reviewer. StrikeLab's real appeal is rigor and building things. | homepage | Medium |

What's already strong and worth keeping: the code-block hero visual idea (real code, real test pass), the learning path, the session player, the Greek visualizer, no-signup access to lessons, and the accessibility foundation (axe suite, reduced motion, keyboard play-through).

---

## 3. Positioning and message

**Company sentence** (from the strategy, used verbatim somewhere visible):
> StrikeLab gives ambitious high-school clubs a ready-to-run technical-finance lab where students learn by coding real market models and finish with work they can show.

**Message hierarchy** (every page should be answerable in this order):
1. **What:** a six-week technical-finance lab your club can run.
2. **For whom:** math, CS, investing, econ and DECA clubs and teachers, ages 13–18.
3. **Why it's different:** students *code* real models (Black-Scholes, backtests) instead of playing a stock game, and finish with a capstone they can show.
4. **Why it's easy:** zero prep for the leader (weekly plan, messages, scorecard), free for students.
5. **Proof:** outcomes and student work (as they exist).

**Hero headline candidates** (pick one, or A/B test two once analytics lands):
- A. **"A six-week quant lab your club can run tomorrow."**
  Sub: "Students code real market models (option pricing, backtests, risk) in the browser, and finish with a capstone they can show. You get a weekly plan and a scorecard. Free for students."
- B. **"Your students won't just learn finance. They'll build it."**
  Sub: same idea, leading with the student outcome.
- C. **"The technical-finance lab for high-school clubs."** Plain and category-defining. The safest for YC's "explain it simply" test.

Recommendation: **A** for the homepage (a concrete, testable promise), with **C** as the `<title>` and meta description. Keep "Invest like the pros"-style copy off the homepage; if it's worth keeping for SEO, move it to a student-facing curriculum page.

**Voice:** plain, specific, calm, with no hype. Numbers only when they're true and sourced. Talk to the leader as a busy professional and the student as a capable builder. Nothing that sounds like trading, get-rich or gambling.

---

## 4. Information architecture

**Signed-out primary nav:**

| Item | Page | Purpose |
|---|---|---|
| For clubs & teachers | `/clubs` (merges `/for-schools` + `/for-teachers`) | The buyer page: how a pilot runs, week by week |
| Demo | `/demo` | Click through the teacher and student views with sample data, no signup |
| Curriculum | `/lessons` | The path, with the six-week lab highlighted |
| Pricing | `/pricing` | Honest tiers, pilots free |
| **Start a free pilot** (button) | `/pilot` → teacher setup | Primary CTA |
| Try a lesson (secondary) | `/learn/inv-1.1` | Student CTA, no signup |

Playground, Sandbox, Challenges, Roadmap, Blog and About move to the footer and to the signed-in nav. They're good, but they aren't the pitch.

**Signed-in nav** depends on role:
- **Cohort student:** "This week" (`/cohort/[id]`) · Path · Practice (later) · Playground
- **Teacher:** "My classes" (`/teach`) · Demo · Curriculum · Facilitator guide
- **Independent learner:** today's nav

---

## 5. Workstreams

Estimates are **agent build hours / founder review hours**. Every task follows `docs/ui-system.md`:
- server-rendered content, with motion only as enhancement;
- axe clean and keyboard complete;
- 375px without horizontal scroll;
- a co-located CSS module, with no new `globals.css` selectors.

### FE-1 · Truth pass (week 2–3) · 3h / 1h · *do first: cheapest credibility win*

- [ ] Remove "MOST POPULAR" from Pro. Replace it with nothing, or with a true label like "For interview prep".
- [ ] Replace the homepage stat row (`3 · 23 · $0 · 0 installs`). Show only things that are both true and meaningful, e.g. "6-week program · 23 lessons · runs in any browser · free for students". Later, swap in real outcome numbers (FE-7).
- [ ] Remove the stale "sandbox just shipped" announcement. Use the bar only for real news (e.g. "Now enrolling fall pilots"), or drop it.
- [ ] Pricing: add the **Club tier ($199/yr)**, and state that **pilots are free**. Remove promises not yet delivered (monthly training calls, alignment guide, "coming soon" items), or label them exactly as they are ("coming soon, not included yet").
- [ ] `/for-schools`: lead with the free pilot, not the license. Point "Request a quote" at the pilot flow (FE-3).
- [ ] Record the pricing and offer decision in `docs/gtm/decision-log.md`.

**Done when:** every claim on `/`, `/pricing` and `/clubs` can be pointed to in the product or the data.

### FE-2 · Clubs-first homepage (week 3–4) · 10h / 3h

Section by section. Each section has one job; together they answer the message hierarchy in §3.

1. **Hero.** Headline A + sub. CTAs: **Start a free pilot** (primary) and **See the teacher view** (to `/demo`), plus a text link "Student? Try lesson 1, no signup".
   - Visual: a real product composite, the cohort home (student) overlapping the scorecard (teacher), rendered from fixture data through the real components, not a screenshot. On small screens, show the cohort home only.
   - Server-rendered. Motion is a subtle entrance only.
2. **"How a pilot works"**, in three steps with the real UI: launch in 3 minutes (date, breaks, invite link) → students work one short step at a time → you see who's active and who needs a nudge.
3. **The six weeks.** Week cards (Markets and risk → Capstone), each with what students *build* that week, not just topics.
4. **What students build.** Two founder-made example capstones, clearly labeled "Example", rendered with the real `CapstoneView`: an option priced with a defended volatility, and an honest backtest. Real student work replaces them once consent exists (FE-6).
5. **Zero prep for the leader.** The toolkit (weekly plan, copy-ready message, nudge) and the scorecard, with one line each and a real UI crop.
6. **Why code, not a stock game.** A short comparison: simulators and financial-literacy curricula versus StrikeLab (students implement models, inspectable work, a capstone). Name the category, not competitors.
7. **Trust, for principals and parents.** 13+; private by default; no ads; no public profiles or leaderboards for minors; delete anytime; link to privacy.
8. **Founder note.** Two or three sentences in the founder's voice: why this exists (the zip-code line is good), who built it. A real photo is optional.
9. **Proof slot (FE-7).** Hidden until real data exists; never placeholder numbers.
10. **Final CTA.** Start a free pilot / Book a 15-minute call / Try a lesson.

Keep the newsletter in the footer. The current "Greeks" section moves to `/lessons` or the curriculum page; it's great content but the wrong spot.

**Acceptance:**
- A 5-second test with 3 teachers and 2 non-finance adults: each can say what StrikeLab is and who it's for.
- LCP under 2.0s on mobile 4G.
- Axe clean.
- Works with JS off.

### FE-3 · Pilot funnel (week 4) · 6h / 1.5h

- **`/pilot`**: the one-pager (`docs/gtm/pilot-one-pager.md`) as a page. What the pilot is, what the leader commits to (45–60 minutes a week for six weeks, weekly feedback), what StrikeLab provides, the price after pilots stated up front, and FAQs (approval, devices, privacy, cost).
- Two doors from the page:
  1. **Set it up yourself** (sign up as a leader, then FE-4's setup). This is the self-serve path YC loves to see work.
  2. **Talk first**: book a 15-minute call. A free Cal.com booking link, embedded, with `?src=` carried into the booking notes.
- Every CTA carries `?src=` (homepage, clubs page, outreach emails) so the CRM and funnel know where leaders came from.

**Done when:** a leader can go from an outreach email to a launched cohort with an invite link without talking to the founder, *and* can book a call if they'd rather.

### FE-4 · Teacher setup + teacher home (week 4–5) · 10h / 3h

- **Role choice at sign-up:** "I'm a student" / "I lead a club or teach a class". Store it on the profile, and use it for nav and landing.
- **Guided setup (`/teach/new`)**, three screens:
  1. Name your class.
  2. First meeting date and break weeks. Reuse the launch panel logic and show the end date.
  3. The invite link, plus a copy-ready first message and a one-page printable "join" card with a QR code.
  Target time to first invite link: **under 3 minutes.**
- **Teacher home (`/teach`):** each class as a card with this week, activation, who needs help, and one next action ("Send this week's message"). Class creation moves out of Settings, which keeps a link to it.
- **Empty states that teach:**
  - No students yet: show the invite link and the printable card.
  - Before start: countdown and "what to do at kickoff".
  - Finished: export CSV and "run it again".

**Metric:** leader sign-up → class created → cohort launched → first student joined, with the median time for each step.

### FE-5 · Public demo (week 5–6) · 8h / 2h · *highest YC leverage per hour*

- **`/demo`**: a read-only "Demo Club" built entirely from fixtures with the real components (`CohortHomeView`, `CohortScorecard`, `LeaderToolkit`, `CapstoneView`). There's no database and no account.
  - The fixtures are pure functions (`buildStudentCohortView`, `computeCohortMetrics`), so the demo can't drift from the product.
- Tabs: **Teacher view** (scorecard, toolkit, capstones) · **Student view** (cohort home, a short session, the capstone editor in read-only mode).
- A persistent banner: "Sample data. Start a free pilot to see your own club."
- Anything that would write (copy message, open capstone) works locally; nothing is saved.
- The fixtures are obviously fictional ("Demo Club", invented first names) and never presented as real users.

**Why it matters:** it answers "can I see it?" for leaders and YC partners in one click. It's also the backbone of the demo video (FE-12).

### FE-6 · Student showcase (week 12+, after consent) · 6h / 2h

- A capstone owner can opt in to "List in the StrikeLab showcase". This is separate from the unlisted share link. It needs guardian consent for under-18s (master plan E8), stays anonymous by default, and a first name plus club is optional and explicit.
- **`/showcase`**: a gallery of consented capstones, filterable by prompt, each opening in `CapstoneView`.
- Moderation: nothing appears until the founder approves it (a simple approved flag set from a private admin action).
- Feeds the homepage "What students build" section once there are 3 or more real entries.

### FE-7 · Proof components (built week 6, visible when true) · 4h / 1h

- A small set of components that render **only from real data**:
  - an outcome strip (cohorts run, students activated, week-4 retention, capstones submitted, pulled from the C2 queries by hand or a nightly job);
  - a leader quote card (with consent, name and club, and a photo optional);
  - a case-study page template.
- A hard rule in code review: **no hardcoded outcome numbers, logos or quotes without a source file in `docs/gtm/`.**
- The first case study after pilots A/B (master plan week 21–23): the problem, what the club did, the numbers, one capstone, and the leader quote.

### FE-8 · Student experience in the pilot (continuous, pilot-driven)

Owned by the master plan's Workstream B and the Duolingo-grade plan; listed here so frontend priorities don't compete with it:
- A cohort student's signed-in home is `/cohort/[id]` (the dashboard's primary CTA already points there).
- Chromebook and phone checks every release: session player, cohort home, capstone editor.
- A capstone submit moment (a short celebration, with progressive enhancement), and a "what's next" after week 6.
- Fix whatever the pilot scorecard and observation notes say first. That list beats this one.

### FE-9 · One visual language (week 15–16 break, then continuous) · 12h / 3h

- Marketing moves to the v3 token system with CSS modules: homepage, `/clubs`, `/pilot`, `/pricing`, `/demo`. Pick **one** hero treatment. Recommendation: light, calm surfaces with the dark "code moment" as an accent card, not a full-bleed terminal page.
- **Motion spec** in `tokens.css`: 3 durations and 2 easings, entrance only on first view, respects `data-motion`. Keep the Spline hero off the marketing path unless it earns its megabyte in an A/B test.
- **Icon set:** Lucide (free), replacing ∑ ∂ β λ ƒ glyph "icons", while keeping math symbols where they *are* the content.
- Delete migrated `globals.css` sections as each route moves. Targets: under 2,500 lines by week 16 and under 1,000 by week 28.
- Dark mode: only after pilots, if students ask.

### FE-10 · Performance budget and quality gates (week 5–6) · 4h / 1h

- **Budgets, mobile on a mid-range device over 4G:**
  - LCP < 2.0s on `/`, `/clubs`, `/pilot`, `/demo`, `/cohort/*`, `/learn/*`
  - CLS < 0.05
  - Initial JS < 180 KB gzipped for marketing routes
- **Lighthouse CI** (free GitHub Action) on PRs for those routes, failing when a budget is blown.
- Pyodide loads only on routes that run code. Recharts and CodeMirror are dynamic-imported. Fonts are subset and preloaded (after the font-variable fix lands).
- The axe suite covers every new route (it already runs in CI).

### FE-11 · Funnel instrumentation (with master plan C1, week 4–6) · 3h / 0.5h

Events:
- **Marketing:** `hero_cta{target}`, `demo_open{view}`, `pilot_page_view{src}`, `pilot_call_booked`
- **Leader:** `teacher_signup`, `class_created`, `cohort_launched`, `invite_copied`
- **Student:** `student_joined` (join) → `session_start`, `session_complete` (existing)

Dashboards:
- visitor → pilot start → first student joined, by `src`
- demo engagement → pilot start

No personal data in events; minors are never identified in analytics.

### FE-12 · SEO, sharing and YC assets (week 6 and week 29–32) · 6h / 4h

- **Pages for how leaders search:** "finance club curriculum", "quant club activities for high school", "AP Statistics project finance", "DECA finance prep with Python". One honest, useful page each, linking to `/clubs` and `/demo`.
- **Open Graph:** a clubs-first OG image; per-capstone OG images for shared links (title and prompt, never the student's name); `Course` structured data for the six-week lab.
- **YC assets (week 29–32):**
  - a 2-minute demo video recorded on `/demo` and a real cohort (with consent): hook in 10 seconds, the teacher flow, the student flow, a capstone, the metrics;
  - a screenshot set;
  - a crisp `/about` with the founder story and the real numbers;
  - the homepage re-checked against §1.

---

## 6. Calendar (maps to the master plan's weeks)

| Week | Dates | Frontend work | Why then |
|---|---|---|---|
| 2–3 | Sep 21–Oct 4 | **FE-1 truth pass**, draft homepage copy (pick a headline) | Outreach starts now; leaders will click the site from the first email |
| 3–4 | Sep 28–Oct 11 | **FE-2 homepage**, **FE-3 `/pilot`**, `?src=` on every CTA | The outreach push needs a page that converts |
| 4–5 | Oct 5–18 | **FE-4 teacher setup and home**, role choice at sign-up | Pilot leaders set up their classes before the week-6 gate |
| 5–6 | Oct 12–25 | **FE-5 `/demo`**, **FE-10 budgets and Lighthouse CI**, **FE-11 events**, FE-7 components (hidden) | Demo for late outreach; measurement before the first kickoff |
| 7–14 | Oct 26–Dec 20 | Pilot-driven fixes only (FE-8); SEO pages (FE-12) if there's time | Pilots are live: fix what the scorecard shows |
| 15–16 | Dec 21–Jan 3 | **FE-9 visual consolidation**, FE-6 showcase (if consent is collected) | Winter break: bigger refactors while no cohort is running |
| 17–24 | Jan 4–Feb 28 | Real outcome numbers and first quotes into FE-7; case study (week 21–23) | Spring cohorts; proof starts to exist |
| 25–28 | Mar | Pricing page for paid conversion; club/school checkout or invoice request | Paid-proof phase |
| 29–32 | Mar 29–Apr 25 | **FE-12 YC assets**: demo video, screenshots, `/about`, final homepage pass | Application |

Founder time: most tasks are agent-built. The founder's part is choosing the headline (week 2), reviewing the homepage and demo (weeks 3–6, about 2h each), and recording the demo video (week 30).

---

## 7. Success metrics

| Metric | Target | Measured by |
|---|---|---|
| 5-second test: can say what StrikeLab is and who it's for | ≥ 4 of 5 people | Manual test (week 4, week 29) |
| Homepage → pilot start (setup begun or call booked), from outreach traffic | ≥ 10% | FE-11 events by `src` |
| Leader sign-up → first student joined | ≥ 70% within 7 days | FE-11 + `class_members` |
| Time from sign-up to invite link | median < 3 min | FE-11 |
| Demo view → pilot start | ≥ 15% | FE-11 |
| Mobile LCP on key routes | < 2.0s | Lighthouse CI |
| Axe serious/critical on covered routes | 0 | Playwright (CI) |
| Unsourced claims on public pages | 0 | FE-1 checklist, review rule |

---

## 8. Principles and anti-patterns

**Do:**
- Show the real product (real components with fixture data) instead of mockups.
- One primary CTA per audience per page.
- Say exactly what's true, including "no pilots have finished yet" if asked.
- Private by default for minors; make trust visible to principals and parents.
- Premium but calm (21st.dev / Skiper-grade craft, per the global notes). Motion is enhancement; content renders with JS off.

**Don't:**
- Fake anything: testimonials, logos, "trusted by", user counts, "most popular".
- Use a hype or trading tone ("invest like the pros", "get rich", countdowns).
- Build a 3D or WebGL hero that costs a second of LCP to say nothing.
- Rebrand, add a mascot, or build a native app before the five-pilot gate.
- Redesign lesson content pages before pilots show what's actually wrong with them.
- Put public leaderboards or student names anywhere without explicit, reversible consent.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Repositioning scares off independent students (current SEO traffic) | Keep "Try a lesson, no signup" prominent; keep the curriculum pages student-friendly; watch lesson traffic after launch |
| The demo drifts from the real product | Build it only from real components and pure view functions; add a Playwright test on `/demo` |
| Homepage work eats pilot-critical time | FE-1 and FE-2 are the only pre-kickoff frontend items besides FE-3/4/5; everything else waits until after week 6 |
| Proof sections stay empty and look odd | They're hidden until real data exists, and the page still works without them |
| Legal or privacy concerns with the showcase | Opt-in, anonymous by default, guardian consent, founder approval; do it only after E8 |

---

## 10. Status (2026-09-23)

Shipped on `feat/clubs-first`:
- [x] **FE-1 truth pass.** "Most popular", the "0 installs" stat and the stale announcement are gone. Pricing is Student / Club $199 / School $499 with pilots free and Pro paused. Undelivered promises (training calls, alignment guide, SSO, real-time data) are removed.
- [x] **FE-2 clubs-first homepage** with the real cohort home as the hero visual (sample data, labeled), the six weeks, example capstones, leader tools, comparison, trust, a founder note, FAQ and CTAs.
- [x] **FE-3 `/pilot`** with two doors: set it up now (sign-up returns to class setup) or talk first (`NEXT_PUBLIC_PILOT_CALL_URL`, email until it's set).
- [x] **FE-5 `/demo`** (teacher and student views) and `/demo/capstone/[slug]`.
- [x] **Navigation and IA:** visitors see For clubs & teachers · Demo · Curriculum · Pricing · Start a free pilot. `/clubs` replaces `/for-schools` (308 redirect). The footer has a "For clubs" group, and the sitemap is updated.
- [x] Settings → Billing (Manage billing) for existing subscribers. There was no way to reach the Stripe portal before.
- [x] The old homepage's Black-Scholes snippet claimed $3.47 for inputs that price at about $9.8. It's gone with the old hero, and the example capstone's numbers are now checked by a test.

Shipped on `feat/teach`:
- [x] **FE-4 teacher setup and home.** Sign-up asks "student or club leader/teacher" (preselected from context) and stores `signup_role` in user metadata, so no migration. `/teach/new` has two screens (name, then dates and break weeks), and `/teach/[id]/invite` is the third: the invite link, a copy-ready first message, a printable join card with a server-rendered QR code, and a kickoff checklist. `/teach` shows one card per class with where it is in the six weeks, honest numbers and one next action. Leaders' nav leads with "My classes". `/pilot` "Set it up now" goes to `/teach/new?src=pilot`, and class creation moved out of Settings.

Shipped on `feat/funnel`:
- [x] **FE-11 funnel measurement, Postgres-first.** `scripts/metrics/leader-funnel.sql` gives leader sign-up → class → launch → first student, with medians and the 7-day rate by source, and a PGlite test covers it. First-touch `?src=` is captured with the UTM params and stored at sign-up, and every pilot CTA tags itself. Marketing events (`hero_cta`, `demo_open`, `pilot_page_view`, `pilot_call_click`, `invite_copied`) go through `trackMarketing` and are inert until a paid Vercel plan. Definitions are in `docs/gtm/metric-glossary.md`.

Next: FE-10 (Lighthouse CI budgets), then FE-6/7 once pilots produce consented work and real numbers.

## 11. First 10 days (through 2026-10-02)

**Founder**
- [ ] Pick the hero headline (A, B or C in §3) and approve the voice rules.
- [ ] Decide the pricing page: confirm the Club tier ($199) and "pilots free", and which School promises to keep.
- [ ] Create a free Cal.com link for pilot calls.

**Agents (branch + PR each)**
- [ ] FE-1 truth pass (pricing labels, stat row, announcement bar, for-schools offer).
- [ ] FE-2 homepage, built with real components and fixtures; 5-second test script in `docs/gtm/`.
- [ ] FE-3 `/pilot` page with both doors and `?src=` plumbing.
- [ ] Navigation update: For clubs & teachers · Demo · Curriculum · Pricing · Start a free pilot.

---

## 12. Open questions for the founder (all decided 2026-09-23, see the decision log)

1. **Headline:** A, B or C, or your own? It's the single most important sentence on the site.
2. **Is `/for-teachers` worth keeping separately** (AP alignment angle), or should it merge into `/clubs`?
3. **Founder story:** comfortable with a short first-person note and photo on the homepage? For a student founder, it's a real asset with YC and with teachers.
4. **Example capstones:** OK for the founder to write two exemplar capstones (clearly labeled "Example") for the homepage and demo?
5. **Keep Pro at all** before the five-pilot gate? It muddies the "free for students, clubs pay" story. Hiding it (not deleting it) might be cleaner.
