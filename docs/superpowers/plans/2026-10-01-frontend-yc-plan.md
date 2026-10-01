# Frontend Plan, YC Lens: October 2026 → the application

**Date:** 2026-10-01
**Status:** Active. This **adds to** `2026-09-30-frontend-work-plan.md` (FW-1…FW-22); it does not replace it. That plan still owns the styling refactor, the Lighthouse budgets and the leader surfaces. This one re-checks what has shipped and adds the screens a YC partner, an investor or a school IT reviewer actually sees.
**Fits inside:** the mega plan's gates and the readiness plan (`2026-10-01-yc-readiness-plan.md`). **Code freeze is Fri Oct 23.** Frontend work never outranks getting a leader.

---

## 0. Summary

1. **Three of the seven pre-freeze items have shipped** since the Sep 30 audit (hero fix, banner scoped to visitors, footer in the clubs voice). **Four are still open:** the focused lesson player (FW-3), the honest empty dashboard (FW-4), the kickoff live view in `/demo` (FW-6), and the Chromebook check (FW-7).
2. **A YC partner gives the site about a minute.** They read the hero, click the demo, maybe open `/about`, and leave. The frontend job is to make that minute work: a sentence they can repeat, a demo that shows the real product without signing up, and nothing broken or exaggerated.
3. **The biggest YC-specific gap is not a page that's missing; it's honesty plumbing.** The site must show real numbers the moment they exist, with a source, and show *nothing* until they do. That is one small component and one data file (FY-3), safe to build now because it renders nothing while empty.
4. **A few robustness gaps** (no `error.tsx`, no founder metrics page) matter more once outside people use the product. They're cheap.

---

## 1. Status of the Sep 30 plan (checked against the code, Oct 1)

| Item | State | Evidence |
|---|---|---|
| FW-1 Hero fix | **Shipped** | The homepage was rebuilt on Sep 30 (decision log); the scorecard now sits in its own section beside the phone |
| FW-2 Banner only where it belongs | **Shipped** (verify on phone) | `Nav.tsx`: `ANNOUNCE_PATHS` and `!user` gate the announcement bar |
| FW-3 Focused lesson player | **Open** | `Nav` is mounted in `layout.tsx` for every route, including `/learn/*`; no player-specific bar |
| FW-4 Honest empty dashboard | **Open** | `DashboardClient.tsx:166` still renders "Welcome back" with no name |
| FW-5 Footer in the clubs voice | **Shipped** | `Footer.tsx`: "Free for students", "Runs in your browser", "Private by default" |
| FW-6 Kickoff live view in `/demo` | **Open** | `/demo` renders `CohortScorecard`, `CohortHomeView` and `LeaderToolkit`, not `KickoffLive` |
| FW-7 Chromebook (1366×768) sweep | **Open** | No such viewport in the Playwright config |
| FW-8 to FW-22 | Per the Sep 30 phases | Unchanged |

---

## 2. The partner's minute (the one scenario this plan designs for)

A YC partner or investor follows a link from the application. In order:

| Seconds | What they do | What must be true |
|---|---|---|
| 0–10 | Read the hero | The one-sentence description is the first thing they see and it matches the application word for word |
| 10–30 | Click "See the demo" | The demo loads fast with **no signup**, and the first screen is the scorecard with a clear "sample data" label |
| 30–50 | Click through the six weeks and the student view | Nothing breaks, nothing is fabricated, and the kickoff live view shows why leaders would want it |
| 50–60 | Look for proof | Either real numbers with sources, or an honest line about where the pilots are. **Never** a placeholder, a made-up logo or an unsourced quote |
| After | Check `/about`, `/pricing`, `/privacy` | The founder story is plain and specific; pricing matches the application; the privacy page says what is true |

The 10-second test (FW-22) uses the same path. **Target: 4 of 5 strangers can say what StrikeLab is and who it's for after 10 seconds.**

---

## 3. The work

Estimates are **agent build hours / founder review minutes.** Every item ships as a PR with lint, unit tests, Playwright (including axe) and the build passing, plus screenshots at 375px and 1366px in the PR description.

### Phase A: before the code freeze (now → Tue Oct 20)

Finish the four open Sep 30 items first (they fix what students and leaders see on day one), then the YC-specific safety items.

| # | Item | Change | Acceptance | Est. |
|---|---|---|---|---|
| **FW-3** | Focused lesson player *(carried)* | On `/learn/*`, hide the site header and show the player's own bar (✕, progress). ✕ goes to the cohort home for cohort students, else the learning path | Content starts ≤ 64px from the top at 375px; ✕ reachable by keyboard and labelled; axe clean | 3h / 15m |
| **FW-4** | Honest empty dashboard *(carried)* | "Start here" with one button for no progress; "Sign in to sync" when signed out; "Welcome back" only for returning users; inline SVG icons | A new visitor never sees "Welcome back"; a returning user still does | 2h / 10m |
| **FW-6** | Kickoff live view in `/demo` *(carried)* | A "Kickoff day" panel renders the real `KickoffLive` component from sample data, with a stepper from 0 to 10 students joined, labelled sample data, no network calls | Visible on `/demo`; axe clean | 2h / 10m |
| **FW-7** | Chromebook sweep *(carried)* | Add 1366×768 to the screenshot sweep for `/`, `/demo`, `/learn/inv-1.1`, `/lesson/3`, sign-up | Committed screenshots; nothing clipped | 1.5h / 10m |
| **FY-1** | **Error and recovery screens** | Add `src/app/error.tsx` and `global-error.tsx` (report to Sentry, offer "Try again" and "Go home"); a per-route `loading` state for `/teach` and `/cohort`; a clear offline/Python-failed message in the lesson player | Forced runtime error shows a friendly page, not a blank screen; one Playwright test per screen | 3h / 10m |
| **FY-2** | **Link previews and metadata audit** | Check `opengraph-image.tsx` and the `layout.tsx` Open Graph and Twitter metadata against the new homepage sentence; make the preview show the one-sentence description; set one title pattern ("Page — StrikeLab"; the homepage is the only exception) (FW-9) | Pasting the URL into a messaging app and a social card shows the right text and image | 1.5h / 5m |
| **FY-3** | **The proof data file and component** | `src/lib/proof/data.ts` holds sourced entries only (value, label, cohort, source file path, as-of date). A `ProofStrip` component renders **nothing** when there are no entries; a unit test fails the build if any entry lacks a source or a date, or if a number is rounded up. Wire it into the homepage and `/about` | With no entries, the pages look as they do today; with a test entry, the strip renders with its source link; the lint test fails on an unsourced entry | 3h / 15m |

**Total:** about 16 agent hours, **under an hour of founder review.**
**Two PRs:** (1) FW-3, FW-4, FW-6, FW-7; (2) FY-1, FY-2, FY-3.
**Target: merged by Tue Oct 20, three days before the freeze.**

### Phase B: during the fall pilots (Oct 26 → Dec 20)

Only what the scorecard or an observation note asks for (Sep 30 plan §4, Phase B). Add:

| # | Item | Trigger | Est. |
|---|---|---|---|
| **FY-4** | **Founder metrics page** (`/admin/metrics`, founder emails only; mega plan Q10). Charts: the weekly growth series, per-cohort activation and retention, support hours, the leader funnel. Built from `growth.sql`, `weekly-scorecard.sql`, `leader-funnel.sql` and the CSVs; read the `dataviz` skill before writing the charts; no names, aggregates only | The first real cohort is running | 6h / 20m |
| **FY-5** | **A sign-up and join journey on a throwaway account**, run by hand on a phone and a school-sized laptop each week of the pilot, with screenshots in `pilot-observation-notes.md` | Always, during pilots | 30m of founder time a week |
| **FW-8** | Visual regression on `/demo` at 375 and 1366px (carried) | — | 2h |

### Phase C: winter build (Dec 21 → Jan 3)

The Sep 30 plan's FW-10 to FW-14 (consolidate styling, hit the 2.0s budget, leader surfaces under `/teach`, the in-app facilitator guide, icons and motion). **Not repeated here.** One YC-specific addition:

| # | Item | Change | Acceptance | Est. |
|---|---|---|---|---|
| **FY-6** | **Guided demo** | A "Watch the six weeks" mode on `/demo`: a 90-second auto-advancing walkthrough (weeks 1 to 6 → capstone → scorecard) with pause, captions and reduced-motion respected. This is what the 2-minute demo video (Y4.1) records | Completes in about 90 seconds, keyboard operable, no autoplay for reduced-motion users; axe clean | 5h / 20m |

### Phase D: proof and the paid ask (Jan → Mar)

| # | Item | Trigger |
|---|---|---|
| **FW-15 / FY-3 live** | Real outcome strip and quote cards | ≥ 1 cohort complete with consent; entries added to the proof file by the founder |
| **FW-16** | Case-study page | A leader's written consent |
| **FW-18** | "Request an invoice" and Club checkout on `/pricing` | The first leader says yes to paying |
| **FY-7** | **Security and privacy one-pager page** (`/trust`) for school IT: data collected, who can see it, retention, deletion, subprocessors, the incident process. Source: `docs/trust/data-map.md` and the security review. **No compliance claims** (FERPA, COPPA) until the reviewer in readiness plan Y6.4 says so | Before the first district-review pilot |

### Phase E: the application (late Mar → Apr)

| # | Item | Change | Est. |
|---|---|---|---|
| **FW-20** | Demo polish and the recorded 2-minute video | Records the guided demo (FY-6) | 4h + founder 3h |
| **FW-21** | `/about` with the founder story and real, sourced numbers | The proof strip supplies the numbers; the founder writes the story (readiness plan Y5.5) | 2h + founder 1h |
| **FW-22 / FY-8** | **10-second test and a cold-visitor test.** Five strangers, one task each ("what is this?", "find the price", "find how a teacher starts") on a phone | Fix the top three failures | 2h + founder 1h |
| **FY-9** | **Freeze the application path.** One week before submitting: no layout changes to `/`, `/demo`, `/about`, `/pricing`; only fixes. Re-run axe, Lighthouse and the screenshot sweep on the production URL | A written pass on the checklist | 2h |

---

## 4. Rules for every frontend change

Unchanged from the Sep 30 plan §3, plus two YC rules:

- **No number, logo, quote or student work on a public page without a source file.** `ProofStrip` is how the rule is enforced in code. Example content stays labelled "Example" until consented real work exists.
- **Sample data is always labelled.** Demo and fixture screens say "sample data" in text, not only in a tooltip.
- New styles go in CSS modules on tokens. Never add to `globals.css`, inline styles or Tailwind.
- The partner's minute (§2) is part of review: for any change to `/`, `/demo`, `/about` or `/pricing`, walk it on a phone before merging.

---

## 5. Quality gates and success measures

| Measure | Now | Target | By |
|---|---|---|---|
| Open pre-freeze items (FW-3, 4, 6, 7) | 4 | 0 | Oct 20 |
| Routes with a friendly error screen | 0 | all app routes (FY-1) | Oct 20 |
| Link preview matches the homepage sentence | unchecked | yes (FY-2) | Oct 20 |
| Public numbers without a source | unknown | 0, enforced by test (FY-3) | Oct 20 |
| Signed-in screens with automated visual or axe coverage | 0 of 5 | 5 of 5 via `/demo` | Dec 20 |
| `/learn` and `/cohort` simulated mobile LCP | 2.6–3.2s | ≤ 2.0s | Jan 3 |
| 10-second test | untested | ≥ 4 of 5 | Before the application |
| Guided demo length | none | about 90s, recorded | Apr 1 |

---

## 6. Not doing

Same list as the Sep 30 plan §7 (dark mode, a rebrand, a mascot, WebGL hero, a native app, public leaderboards or student names, redesigning lessons before observation notes, new marketing pages before the W24 gate), plus:

- **A fake "as seen in" or "trusted by" strip**, or any counter that isn't read from real data.
- **A public leaderboard or "top students" showcase** before consent and the Sep 30 plan's FW-17 triggers.
- **A "try as a teacher" sandbox with real accounts.** The demo with sample data does the job; a live sandbox adds database and abuse risk before there's demand.

---

## 7. Decisions for the founder

1. **Approve Phase A** (FW-3, FW-4, FW-6, FW-7, FY-1, FY-2, FY-3) for a merge by Oct 20? *Recommended: yes.* About 16 agent hours, under an hour of your review.
2. **The homepage sentence** is the single most reused line: the hero, the link preview, the application and the video. Lock it now as the readiness plan's candidate ("StrikeLab gives high-school clubs a ready-to-run technical-finance lab where students code real market models and finish with work they can show"), or change it in both places together.
3. **The founder line on `/about`** (age, AIME qualifier): keep it plain and specific, with a link to the work. Decide how much to say about school and commitment before the application; it must match readiness plan Y5.1.

---

## 8. Change log

| Date | Change |
|---|---|
| 2026-10-01 | Created. Status of FW-1 to FW-7 checked against the code. |
