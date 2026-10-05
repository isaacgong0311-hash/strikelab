# User's-eye review: findings and fix plan (2026-10-05)

**Goal:** find everything a real user would find broken, confusing or unappealing, then fix it in order of how much it costs them.

This sits beside the [best-version roadmap](2026-10-02-best-version-roadmap.md). The roadmap owns the type, visual-system and lesson-design work (B1–B15). This review adds what the roadmap does not cover: flows, error states, dead ends, copy and accessibility seen from the user's seat. Where a finding is already a roadmap item, it says so and does not duplicate the fix.

## How it was checked

A production build (`next build && next start`) driven by Playwright and Chromium:

- **Reach:** 28 routes at 375×812 (phone, touch) and 1366×768 (Chromebook), with a screenshot of each.
- **Per page:** console errors, failed requests, sideways scroll, broken images, missing alt text, tap-target sizes, text under 12px, and a full axe run.
- **Journeys, driven like a user:**
  - a student: home → lessons → a lesson → the session player, answering wrong on purpose and then right, through to the finish screen;
  - the exercise runner, pressed on untouched starter code;
  - sign-up with empty and bad input;
  - the mobile menu and display-preferences panel;
  - the 404 page, keyboard tab order and dark mode;
  - a teacher: home → clubs → pilot → demo → for-teachers.

**Not covered** (this build has no Supabase): signed-in flows, real class data, email, billing. Dashboards were seen only in their signed-out state. No physical phone or screen reader was used. The `/_vercel/insights` 404 and the leaderboard 503 seen in the sweep are local-only and are not findings.

## What is already good

Worth keeping while changing everything else:

- the homepage's two-door hero ("I'm a student" / "I lead a club") and its clear first action;
- the session player's question screens and the kind wrong-answer copy;
- visible 3px focus rings and a working skip link;
- no page scrolls sideways at either width, and no broken images;
- the 404 page is helpful and on brand;
- pricing is honest and short.

## Findings

Severity: **S1** broken, wrong or a regression; **S2** confusing or unappealing; **S3** polish.

### Broken or wrong (S1)

| ID | Finding | Evidence | Fix |
|---|---|---|---|
| **U1** | Typeset formulas that scroll are not keyboard-reachable on a phone. **Regression from PR #40**: the 320px overflow fix made `.katex-display` a scroll container, and the maths test only runs at desktop width | axe `scrollable-region-focusable` (serious) on `/lesson/3` at 375px | Give each display formula `tabindex="0"`, `role="group"` and a label; add a 375px axe check to `tests/math.spec.ts` |
| **U2** | The first Run on starter code shows a 10-line Python traceback naming Pyodide internals (`/lib/python312.zip/_pyodide/_base.py`), ending in `AssertionError: ITM call`. Every coding lesson does this | `/lesson/1`, press Run on the untouched starter | Show only the student's frame and the message, say "A test failed: ITM call" in plain words, keep the full trace behind a "Show details" toggle |
| **U3** | Reloading mid-session restarts it at step 1. Progress lives only in memory | Answered 2 steps, reloaded: back to "Companies need money" | Persist the run (queue, position, results) per session in `sessionStorage`; clear it on finish or exit |
| **U4** | `/challenges` pushes "Upgrade to compete →" and shows PRO tags, while `/pricing` says Pro is "paused for new sign-ups" | `ChallengesClient.tsx` (`isPro` branches) vs the pricing FAQ | Hide the upgrade call to action and the PRO tag unless the viewer already subscribes; one flag, so reopening sales is a one-line change |
| **U5** | The mobile menu starts 32px too high on pages with the announcement bar, so the header covers the top of the first item ("Lessons"). The panel also has `overflow: visible`, so on a short phone the bottom items can't be reached | Menu panel top y=60, header bottom y=92 at 375px; panel is 580px tall on a 640px screen | Anchor the panel to the header's real bottom edge; give it `max-height` and `overflow-y: auto` |

### Confusing or unappealing (S2)

| ID | Finding | Evidence | Fix |
|---|---|---|---|
| **U6** | The player shows "1/3" beside a progress bar. It is the session number, but reads as a step count, and never changes while the bar moves | `SessionPlayer.tsx:263`; stays "1/3" through all 9 steps | Remove the visible fraction; keep "Session 1 of 3" for screen readers |
| **U7** | A missed question re-queues with no limit, so a stuck student loops until they guess right | `engine.ts:63`; 16 steps walked with deliberately wrong answers, still going | After two misses on the same step, show the explanation and move on without re-queueing |
| **U8** | The wrong-answer panel covers the last option on a phone, so a student can't see the right answer they are being told about | 375×812, miss on a 4-option question: option 4 is under the panel | Pad the stage by the panel's height while feedback is showing |
| **U9** | The finish screen pays nothing back (no XP, no streak) and never asks an anonymous student to save their progress, at the moment they are most likely to say yes | Finish screen after a session | Show XP earned; for signed-out students add a "Save your progress: free account" action |
| **U10** | The whole product has two generations of page headings: 8 H1 sizes across 21 routes (26, 28, 30, 32, 36, 40, 44, 64px), two weights (600, 800) and line-heights from 1.02 to 1.50. Home, pricing, clubs, pilot, demo, dashboard and the player are one style; lessons, lesson, playground, sandbox, about, faq, for-teachers, blog, roadmap, sign-in and achievements are the other | Per-route H1 measurement | Roadmap **BV-T5** (type scale). This review adds the per-route evidence and orders the pages |
| **U11** | Display headings crush word spaces: −0.03em tracking at weight 800 with 0 word-spacing. "Don't just read it. Run it." reads as "Don'tjust readit. Runit." | Home, pilot, clubs at both widths | Add word-spacing on tight display styles; relax the tracking |
| **U12** | Tap targets: footer links are 16px tall; the announcement bar is an 11px, 16px-tall link; at least 20 controls per page are under 24px | Sweep, every route on mobile | 44px hit areas via padding, with no visual change |
| **U13** | Sign-up validation is the browser's default bubble. It covers the first radio button, and errors are not announced or styled | Submit empty, then with `nope` / `123` | Inline, labelled error messages, linked with `aria-describedby`, in a live region |
| **U14** | The "Aa" button suggests text size but opens motion and contrast settings only | Header at every width | Use a label or icon that says "Display"; text size is a possible later addition |
| **U15** | `/for-teachers`, `/about` and `/faq` have no call to action above the fold. For a teacher, `/for-teachers` is the page that should say "Start a free pilot" | Per-route check | Add the pilot action and a short "what you get" line to `/for-teachers` first |
| **U16** | A new student's dashboard, and the top of `/lessons`, lead with zeros: streak 0, XP 0, 0/23 | `/dashboard`, `/lessons` signed out | Roadmap **BV-V6**. Until then, hide zero stats and lead with "Start lesson 1" |
| **U17** | Lesson reading column: median 86 characters a line at 15.4px with a 1.85 line-height | Type audit | Roadmap **BV-T6** |
| **U18** | Contrast failures: `/lessons` "soon" tags 2.73:1 (9px bold); `/roadmap` status labels 3.2–3.8:1 | axe `color-contrast` (serious) | Darken the three tokens to 4.5:1 |

### Polish (S3)

| ID | Finding | Evidence | Fix |
|---|---|---|---|
| **U19** | `/dashboard` has a scroll area (`.ah`) that keyboard users can't reach | axe `scrollable-region-focusable` | `tabindex="0"` and a label |
| **U20** | The lesson table of contents is an unlabelled `nav`, which collides with the main nav | axe `landmark-unique` on every lesson | `aria-label="On this page"` |
| **U21** | "Run Tests" shows a `Ctrl/⌘ + Enter` hint on touch phones, which have no such key | `/lesson/1` at 375px | Hide the hint where the pointer is coarse |
| **U22** | On the home page, "six-week" breaks at its hyphen ("six–" / "week lab") | `/` at 375px | Non-breaking hyphen |
| **U23** | `/sandbox` says the same thing twice in its first screen (Black-Scholes, $100,000) and hides the product behind sign-up before showing any of it | `/sandbox` signed out | Cut the duplicate; show a read-only preview first. Product decision, so batch C |
| **U24** | Player on a 1366px screen: a narrow text column on the left with the Continue button at the far right, and a large empty area | `/learn/inv-1.1` | Roadmap **B12/BV-P2**: give steps a visual; align Continue under the content |
| **U25** | No dark mode: a dark OS preference gets the light page | `prefers-color-scheme: dark` | Product decision: support it or declare it out of scope |
| **U26** | Two marketing stylesheets are preloaded but unused on `/` and `/clubs` (6 KB) | Console "preloaded … not used" | Investigate which route-group CSS leaks; low value |

## Plan

Batches are ordered by what they cost a user. Each fix keeps its own test, and `npm run lint`, `tsc`, unit tests, Playwright and Lighthouse stay green.

### Batch A: broken and wrong, plus the cheap fixes (this PR)

U1 U2 U3 U4 U5 U6 U7 U8 U11 U12 U18 U19 U20 U21 U22. Acceptance:
- axe is clean on `/lesson/3`, `/dashboard`, `/lessons` and `/roadmap` at 375 and 1366px;
- a failed Run shows at most four lines and no Pyodide paths;
- reload keeps the student's place;
- `/challenges` offers no purchase;
- the menu shows its first item in full on every page;
- the player has no visible "1/3" and no endless retry.

### Batch B: the student's first minute (next PR)

U9 U13 U14 U15 U16, then the player's visual layer (U24). Needs a small design pass for the finish screen, the dashboard's empty state and the form errors. Acceptance: a first-time visitor sees no zeros, gets a reward at the end of a session and a reason to sign up.

### Batch C: one type system, then the decisions

U10 U17 (BV-T5, BV-T6) as one change across all routes, so the two generations of pages become one. Then the product calls: U23 (sandbox preview), U25 (dark mode), U26.

### Decisions needed from the founder

| # | Question | Default |
|---|---|---|
| 1 | Show the paused Pro product anywhere? | No: hide upgrade prompts until sales reopen (U4) |
| 2 | Cap retries per question at two? | Yes (U7); the answer is shown, so nothing is skipped silently |
| 3 | Support dark mode this year? | No, until the colour tokens (BV-V1) exist |
| 4 | Let signed-out visitors try the sandbox read-only? | Yes, in batch C |

## Re-running the check

`scripts/audit/journey-sweep.mjs` repeats the per-page part of this review (console, tap targets, small text, axe, H1 style) so a fix can be shown before and after:

```bash
npm run build && npm start &
CHROMIUM_PATH=/opt/pw-browsers/chromium node scripts/audit/journey-sweep.mjs
```
