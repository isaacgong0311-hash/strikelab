# StrikeLab Frontend Work Plan: Sep 30, 2026 → Apr 2027

**Date:** 2026-09-30 (runway week 3)
**Status:** Active. This replaces the *sequencing* of `2026-09-23-frontend-plan.md`, whose positioning, voice, information architecture and principles (§1, §3, §4, §8) still hold. Where the two disagree about what to do next, this plan wins.
**Update, same day:** the homepage now serves **both** independent students and club leaders (decision log 2026-09-30): two doors in the hero, the old student sections restored, and a section for leaders. That shipped FW-1 (the hero no longer has an overlapping card; the scorecard sits beside the phone in the leaders' section), FW-2 (the banner shows only on marketing pages, to signed-out visitors) and FW-5 (the footer copy). Every number on the homepage is computed (`src/lib/marketing/heroExample.ts`, tested).
**Fits inside:** the mega plan's gates and the sprint (`2026-09-30-sprint-to-go-no-go.md`). **Code freeze is Fri Oct 23.** Frontend work never outranks getting a leader.

---

## 0. Summary

1. **The pilot-critical frontend is built.** Visitors, leaders and students each have a complete path. Leaders go from the homepage to `/pilot`, then `/teach/new`, the invite link, the kickoff live view, and the scorecard. Students go from the invite link to sign-up, the cohort home, bite-sized lessons, synced code, and the capstone.
2. **Today's audit found 12 issues.** Five are small, visible flaws on the exact screens leaders and students hit first, and are worth fixing before the freeze:
   - the homepage hero hides its own button;
   - the leader-only banner shows up mid-lesson for students;
   - the lesson player carries the full site header on phones;
   - the empty dashboard says "Welcome back" to first-time visitors;
   - the footer still speaks to the old consumer positioning.
3. **The structural problem is styling:** four systems at once. That's the root cause of slow first paint and inconsistent screens, and it's winter-break work, not now.
4. **Signed-in screens have no automated visual coverage** (CI has no database). The fix is cheap: render them on `/demo` with sample data, which also makes the demo a better sales tool.

---

## 1. What's shipped (as of Sep 30)

| Area | Shipped | Where |
|---|---|---|
| Positioning | Clubs-first homepage, `/clubs`, `/pilot`, honest pricing, visitor nav | #31 (FE-1, FE-2, FE-3) |
| Proof you can touch | `/demo` teacher and student views, example capstones | #31 (FE-5) |
| Leader setup | Role choice at sign-up, `/teach/new`, invite page with QR card, `/teach` class cards | #32 (FE-4) · **merged today** |
| Measurement | `?src=` attribution, funnel events, leader-funnel SQL | #33 (FE-11) · **merged today** |
| Quality gates | Lighthouse budgets in CI | #34 (FE-10) · merging |
| Speed and resilience | Sentry after load, lazy Supabase, Python served from strikelab.dev, "check your email" with resend, sign-up name label | #35 |
| Kickoff | Live view on the invite page | #35 |
| Accessibility | axe suite on core routes, reduced motion, keyboard play-through | Earlier PRs |

---

## 2. Audit (Sep 30)

**Method:**
- screenshots of 17 public routes at 375px (phone) and 1280px (desktop) from a production build;
- a horizontal-overflow check on every route;
- Lighthouse medians from yesterday;
- a count of the styling systems in use.

Signed-in screens were reviewed through `/demo`, which renders the same components with sample data.

**What's good:** no route scrolls sideways at 375px. Lessons, pricing, sign-up, the playground and `/demo` read well at both sizes. There are no console errors apart from expected local-only ones. The page title and meta are clubs-first.

| # | Finding | Evidence | Who sees it | Severity |
|---|---|---|---|---|
| **A1** | **The homepage hero hides its own button.** The "teacher scorecard" chip overlaps the student card's **Start** button, so the first product screenshot a leader or YC partner sees has a covered button | Desktop `/` at 1280px | Every desktop visitor | **High** (first impression) |
| **A2** | **The leader-only announcement bar shows to everyone**, including signed-in students mid-lesson, on the cohort home and on the teacher's own pages. On phones it wraps to two lines and leaves a stray "·" | `Nav.tsx:205`; phone screenshots of every route | Every student, every visit | **High** (noise on the student path) |
| **A3** | **The bite-sized lesson player keeps the full site header** (banner plus nav): about 110px of a phone screen, plus links out of a focused task. Duolingo-style players hide site navigation behind the ✕ | Phone `/learn/inv-1.1` | Every cohort student in week 1 | **High** (activation screen) |
| **A4** | **The empty dashboard says "Welcome back"** to someone who has never been here, and its stat icons are placeholder glyphs (✓ △ ◆ ◉) | `DashboardClient.tsx:166`; desktop `/dashboard` | New and signed-out visitors | Medium |
| **A5** | **The footer speaks to the old positioning:** "A browser-based quant finance curriculum for high schoolers… Built by a freshman AIME qualifier", with a "Free forever" chip next to paid Club and School tiers | `Footer.tsx:63-66` | Everyone | Medium (a mixed message to leaders) |
| **A6** | **Four styling systems:** `globals.css` (4,219 lines, about 810 selectors), 13 CSS modules on tokens, 406 inline `style={{…}}` objects (the most in `LessonClient`, `DashboardClient` and `SettingsClient`), plus Tailwind utilities in 25 files | Counts from `src/` | Maintainers; indirectly everyone (render-blocking CSS) | Medium now, High by spring |
| **A7** | **Slow first paint on slow networks.** Simulated mobile LCP is 2.6–3.7s against the 2.0s budget. What's left after #35 is React/Next plus **44 KB of render-blocking CSS** (mostly `globals.css`) | Lighthouse (#35 execution log) | Students on Chromebooks and phones | Medium |
| **A8** | **Signed-in screens have no automated visual or axe coverage:** `/teach`, the invite page with its live view, `/cohort/*`, the capstone editor. CI has no database, so tests can't sign in | `tests/` covers public routes only | — | Medium (regressions go unseen until a leader hits them) |
| **A9** | **The kickoff live view isn't in `/demo`.** It's the most persuasive leader feature ("watch your students join in real time"), and it's invisible until a real kickoff | `/demo` teacher tab | Leaders, investors | Medium (a sales asset) |
| **A10** | **The class page is legacy.** Leaders manage a class at `/dashboard/class/[id]` (7 components, about 1,000 lines) while everything else for leaders lives under `/teach`. Two mental models | Routes | Leaders | Low now; Medium when leaders multiply |
| **A11** | **Page-title punctuation is inconsistent:** "StrikeLab: the technical-finance lab…" vs "For clubs and teachers — StrikeLab" | `<title>` values | Search results, tabs | Low |
| **A12** | **The Chromebook viewport is unchecked.** School Chromebooks are usually 1366×768 and low on memory; screenshots and budgets cover 375 and 1280 only | Test config | Most cohort students | Medium (unknown) |

---

## 3. Principles (unchanged, restated because they decide trade-offs)

- **The pilot is the product.** A frontend change needs a named person (a leader, a student, an investor) and a named moment it helps.
- **Server-rendered content; motion only as enhancement;** axe clean; keyboard complete; 375px with no sideways scroll (`docs/ui-system.md`).
- **Honest by construction:** no number, logo or quote on a public page without a source file (frontend plan FE-7).
- **Private by default for minors:** no names in public; nothing public without explicit, reversible opt-in.
- **New styles go in co-located CSS modules on tokens.** Never add to `globals.css`, inline styles or Tailwind.

---

## 4. The work

Estimates are **agent build hours / founder review minutes**. Every item ships as a PR with lint, unit tests, Playwright (including axe) and the build passing, plus a screenshot at 375px and 1366px in the PR description.

### Phase A: before the code freeze (now → Fri Oct 23)

Only items that fix what leaders and students see in the first minutes, each under a day, each low-risk.

| # | Item | Fixes | Change | Acceptance | Est. |
|---|---|---|---|---|---|
| **FW-1** | **Hero fix** | A1 | Reposition the scorecard chip so it never covers the student card's button, at any width from 1024 to 1600px; the student card shows its full CTA | Screenshots at 1024, 1280 and 1440px show the button uncovered; no layout shift (CLS budget holds) | 1h / 5m |
| **FW-2** | **Banner only where it belongs** | A2 | Show the announcement bar only to signed-out visitors on marketing routes (`/`, `/clubs`, `/pilot`, `/pricing`, `/demo`, `/about`, `/faq`, `/for-teachers`, `/lessons`). One line at 375px (shorter copy on phones, no orphan "·") | Not rendered on `/learn/*`, `/lesson/*`, `/cohort/*`, `/teach/*`, sign-in or sign-up; one line at 375px; Playwright checks both | 1.5h / 5m |
| **FW-3** | **Focused lesson player** | A3 | On `/learn/*`, replace the site header with the player's own bar (✕ to exit, progress, a text-size control). The ✕ goes to the cohort home for cohort students, and to the learning path otherwise | Content starts ≤ 64px from the top at 375px; the ✕ is keyboard-reachable and labelled; exit returns to the right place; axe clean | 3h / 10m |
| **FW-4** | **Honest empty dashboard** | A4 | For no progress: "Start here" copy with one button (the first session), and "Sign in to sync" when signed out. "Welcome back" only for returning users. Swap the glyphs for real icons (inline SVG, no new dependency) | New visitor sees no "Welcome back"; a returning user still does; icons have accessible names or are hidden from screen readers | 2h / 5m |
| **FW-5** | **Footer in the clubs voice** | A5 | Tagline: "The technical-finance lab for high-school clubs. Free for students." Chips: "Free for students", "Runs in any browser", "Private by default". The founder line moves to `/about` | No "Free forever" next to paid tiers; the copy matches the homepage | 0.5h / 5m |
| **FW-6** | **Kickoff live view in `/demo`** | A9, part of A8 | The demo teacher tab gets a "Kickoff day" panel rendering the real `KickoffLive` component from sample data (a stepper that plays 0 → 10 students joining) | Visible on `/demo`; labelled sample data; no network calls; axe clean | 2h / 10m |
| **FW-7** | **Chromebook check** | A12 | Add 1366×768 to the Playwright screenshot sweep for `/`, `/demo`, `/learn/inv-1.1`, `/lesson/3`, `/cohort` (via `/demo`) and sign-up. Fix anything clipped | A committed screenshot set; nothing clipped or overlapping | 1.5h / 10m |

**Total:** about 11.5 agent hours and **under an hour of founder review**. It can land in two PRs:
- FW-1, FW-2, FW-4, FW-5: small, visual;
- FW-3, FW-6, FW-7: the player and the demo.

**Target: merged by Tue Oct 20**, leaving three days before the freeze.

**Not in Phase A, deliberately:** A6 (the styling refactor is too broad to risk before a kickoff), A10 (moving the class page would churn the leader flow right before leaders use it), and anything that changes lesson content.

### Phase B: during the fall pilots (Oct 26 → Dec 20): measured fixes only

The weekly scorecard names one bottleneck, and frontend work happens only when that bottleneck is a screen. Fix it within the week.

| Likely candidates | Signal that triggers it |
|---|---|
| Join and sign-up friction (copy, error states, the resend flow) | Join → first session under 80% in the room at kickoff |
| Cohort home clarity ("what do I do this week?") | Students ask the leader what's due; week-2 activity drops |
| Session player step types that confuse (from observation notes) | The same step id shows up in 3+ observation-note rows |
| The capstone editor on Chromebooks | Capstone drafts started but not submitted by week 6 |
| Leader card or scorecard wording | A leader asks the same question twice |

**Also during Phase B (low risk, no behavior change):**
- **FW-8 · Visual regression on `/demo`** (A8): Playwright screenshot comparisons of the teacher and student tabs at 375 and 1366px, run in CI. The demo renders the same components signed-in users see, so a broken scorecard or cohort home shows up here first. (2h)
- **FW-9 · Title and meta consistency** (A11): one pattern, "Page — StrikeLab", with the homepage as the only exception. (0.5h)

### Phase C: winter build (Dec 21 → Jan 3): one visual system, and the 2.0s budget

Nobody is in a cohort, so bigger refactors are safe.

| # | Item | Fixes | Change | Acceptance | Est. |
|---|---|---|---|---|---|
| **FW-10** | **Consolidate styling (FE-9)** | A6, A7 | Route by route, in order of traffic (`/learn`, `/cohort`, `/lesson`, `/`, `/teach`, `/dashboard`, the rest): move styles into CSS modules on tokens, remove the inline style objects, delete the migrated `globals.css` sections. Tailwind leaves the app | `globals.css` under 1,500 lines by Jan 3 (from 4,219); inline styles under 100 (from 406); no Tailwind classes in migrated routes; no visual change in the FW-8 screenshots | 12h / 45m |
| **FW-11** | **Hit the budgets** | A7 | With `globals.css` smaller, split the critical CSS per route, subset fonts, and check what `/learn` and `/cohort` load before first paint. Then **turn the Lighthouse LCP and marketing-JS warnings into errors** | `/learn/*` and `/cohort/*` simulated mobile LCP ≤ 2.0s; marketing JS ≤ 180 KB; CI enforces both | 4h / 15m |
| **FW-12** | **Leader surfaces under `/teach`** | A10 | Move the class page to `/teach/[id]` (redirect the old URL), reusing its components; the scorecard, toolkit, roster, assignments and capstones become tabs | Old links redirect; every leader action is reachable from `/teach`; the journey test passes | 5h / 20m |
| **FW-13** | **In-app facilitator guide v2** | Mega plan Q14 | The weekly guide from pilot observation notes, shown on the class page for the current week | Leaders stop asking for the PDF | 3h / 20m |
| **FW-14** | **Icons and motion spec** | A4 remainder | One icon set (Lucide, free), three durations and two easings in tokens, entrance-only motion, respecting reduced motion | No glyph icons left; motion tokens used everywhere | 3h / 10m |

### Phase D: spring cohorts and paid proof (Jan → Mar)

| # | Item | Trigger | Est. |
|---|---|---|---|
| **FW-15** | Proof components (FE-7): outcome strip and quote cards, rendered only from sourced data | ≥ 1 cohort complete, with consent | 4h |
| **FW-16** | Case-study page | A leader's consent (E8) | 3h |
| **FW-17** | Student showcase (FE-6): opt-in, anonymous by default, founder-approved | Guardian consent flow ready; ≥ 3 consented capstones | 6h |
| **FW-18** | Pricing page for paid conversion: "Request an invoice" and Club checkout (mega plan Q20, Q21) | The first leader says yes to paying | 4h |
| **FW-19** | SEO pages leaders actually search for ("finance club curriculum", "AP Stats finance project") (FE-12) | After the W24 gate; only if outreach isn't the bottleneck | 6h |

### Phase E: YC application (late Mar → Apr)

| # | Item | Est. |
|---|---|---|
| **FW-20** | Demo polish on the real journey; a 2-minute video recorded on `/demo` plus a consented real cohort (FE-12) | 4h + founder 3h |
| **FW-21** | `/about` with the founder story and real, sourced numbers | 2h + founder 1h |
| **FW-22** | Homepage re-check against the 10-second test with 5 people; hero numbers only if sourced | 2h + founder 1h |

---

## 5. Quality gates (what CI enforces, and when that tightens)

| Gate | Today | After Phase A | After Phase C |
|---|---|---|---|
| axe (serious/critical = 0) | Core public routes, `/teach` | + `/demo` kickoff panel, focused player | + every `/teach/*` tab |
| Playwright journeys | Sessions, reveal, teacher setup, Python | + banner scope, player exit | + class page under `/teach` |
| Visual regression | — | — | `/demo` at 375 and 1366px (FW-8) |
| Lighthouse | CLS, bytes and score are errors; LCP and JS are warnings | Same | **LCP ≤ 2.0s and marketing JS ≤ 180 KB become errors** |
| Styling | — | No new `globals.css` selectors (review rule) | A lint check that fails on new inline `style={{` in migrated routes |

---

## 6. Success measures

| Measure | Now | Target | By |
|---|---|---|---|
| Visible flaws on first screens (A1–A5) | 5 | 0 | Oct 20 |
| Signed-in screens with automated visual or axe coverage | 0 of 5 | 5 of 5 (via `/demo`) | Dec 20 |
| `/learn` and `/cohort` simulated mobile LCP | 2.6–3.2s | ≤ 2.0s | Jan 3 |
| `globals.css` lines | 4,219 | < 1,500 (then < 1,000 by Mar) | Jan 3 |
| Inline style objects | 406 | < 100 | Jan 3 |
| Kickoff: join → first session done in the room | unmeasured | ≥ 80% | First kickoff |
| 10-second test ("what is this, for whom?") | untested | ≥ 4 of 5 | Before YC |

---

## 7. Not doing

- Dark mode, a rebrand, a mascot, a WebGL or Spline hero: they don't move any gate.
- A native app: the mega plan's unlock condition hasn't been met.
- Redesigning lesson pages before pilot observation notes say what's wrong with them.
- Public leaderboards or student names anywhere.
- New marketing pages before the W24 gate. Outreach is the channel.

---

## 8. Decisions for the founder

1. **Approve Phase A (FW-1 to FW-7)** so it lands before the freeze? *Recommended: yes.* It's about 11 agent hours, under an hour of your review, and nothing risky.
2. **The banner copy** once it's scoped to visitors: keep "Now enrolling free pilots for this school year", or switch to something time-bound like "Fall pilots start Oct 26 · 2 spots left"? The second line is only acceptable if it's true, so update it whenever it changes.
3. **The founder line:** move "Built by a freshman AIME qualifier" from the footer to `/about` (recommended), or cut it?
