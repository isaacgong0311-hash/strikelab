# StrikeLab remodel work plan (Nov 16, 2026)

**Status (Nov 16):** R1 is built on `feat/season-r1` (see "R1 progress" below). R2 to R5 not started. The findings come from a walkthrough of a local production build of master (`82be696`) at 1280px and 375px, signed out; signed-in pages were read in code only.

## R1 progress

**Done**
- Attempt workspace (`src/components/seasons/Workspace.tsx`): two panes, a slim top bar with a sticky timer that follows the server's clock (`Date` header), warnings at 10, 5 and 1 minute (announced politely), draft autosave on the device (scoped by user and challenge), readable Python errors, the student's old function cleared before each run, a live explanation counter, a confirm step before the one submission, and a time-up state. The site header is replaced by the workspace's own bar on `/seasons/<id>` pages (`isPlayerPath`).
- Practice round at `/seasons/practice`: no account, 15 minutes, own random numbers, checked in the browser in real Python, not scored or saved. It lives in client-safe modules, and a test fails if any browser-side seasons file imports the hidden official tests (`templates.ts`, `params.ts`).
- `/seasons`: phase pill ("Opens in N days", "Live now", "Season ended"), a practice-round button, challenge cards with a "Train first" lesson link, kept every heading and section the tests pin.
- Tests: unit tests for the clock, drafts, practice problem (real Python), train links and season phase; 10 browser tests (`tests/season-workspace.spec.ts`) including the timed workspace with its two API calls stubbed; `/seasons/practice` added to the axe route list.

**Not done / not verified**
- The three challenge cards and the "Train first" links are only visible with a season in the database, so they were not seen in a browser locally. The seeded-database browser tests that cover the signed-in `/seasons` states run in CI, not locally (Google Fonts are blocked on this network in dev mode).
- No FAQ section on `/seasons` yet. No change to the explanation-points question: the scorer writes correctness (70) and speed (10) only, so no 100-point breakdown is shown anywhere.

**Finding for Isaac: builds intermittently stop on a security advisory.** `next build` on Next 16.4.1 sometimes exits 1 with `SecurityFatalError` and passes when rerun (about every other build locally). The advisory is real: GHSA-mfr8-8qww-v76h (moderate, vulnerable `>=16.3.0 <=16.4.4`), about information disclosure when a `"use cache"` function is called through `unstable_cache()`. This repo uses neither. If the same stop happens in Vercel's build, a deploy would fail until retried. Decision needed: upgrade Next (a separate PR with its own testing), or leave it and retry builds. Nothing was upgraded here.

**Goal:** more real students playing Season 1 (opens Nov 30) and coming back each week. This plan changes how existing pages work and look. It adds no new tracks, strategy or integrations (`docs/PLAN.md` stop-doing list still holds).

## What the walkthrough found

| # | Finding | Where |
|---|---|---|
| 1 | The season pages are the plainest on the site, and every outreach link points at `/seasons`. A visitor can't try a challenge before signing up, and a signed-up student has nothing season-related to do before Nov 30. | `src/app/seasons/page.tsx` |
| 2 | The timed attempt page keeps the student's code only in memory. A reload or tab crash during the 60 minutes loses it while the clock keeps running. | `src/app/seasons/[challengeId]/AttemptClient.tsx` |
| 3 | On that page the timer is one line of text that scrolls away, there is no warning near the deadline, late submissions are rejected by the server, Python errors show raw, and the 20-character minimum explanation is only enforced after submitting. The countdown uses the student's clock, not the server's. | same file; `api/seasons/challenges/[id]/submit/route.ts` |
| 4 | Navigation links are hidden behind a menu button below 1360px wide, so a 1280px laptop (measured) and likely a 1366px Chromebook show no links. | `globals.css:1578` |
| 5 | The homepage is 7,850px tall on desktop and 11,981px on a phone, with about 14 sections. The hero sells "Learn finance" and the Market Lab; the company direction is the proving ground. The header button "Start lesson 1" opens "What is a stock?". | `src/app/HomeView.tsx`, `Nav.tsx` |
| 6 | Lesson 1 of the options track is about 4,800px of reading before the first Run button. | `/lesson/1` |
| 7 | Builds fetch Google Fonts. One Vercel preview build failed on that step today and passed on a retry. | `src/app/layout.tsx` |
| 8 | A 4,027-line legacy `globals.css` sits beside the token files and 35 CSS modules. | `src/app/globals.css` |

## Phases

### R1. The season experience (first)
1. **Attempt workspace.** Rebuild the attempt page as a focused two-pane workspace (brief and your numbers; editor, checks, explanation). Add: draft autosave on the device, keyed by user and challenge, restored on resume and cleared on submit; a sticky timer that follows the server clock (the `Date` response header) with warnings at 10, 5 and 1 minute; readable Python errors (`friendlyPythonError`); a live character count for the explanation; clearing the old function before each preview run so a stale definition can't pass.
2. **Practice round** at `/seasons/practice`, no account needed. A separate warm-up problem (forward price by no-arbitrage), own random numbers, a 15-minute local timer, scored in the browser and labelled as practice. It must live in its own client-safe module: `src/lib/seasons/templates.ts` holds the official tests and must never be imported by a client component. Add a test that enforces this.
3. **`/seasons` page.** Hero with a live countdown and two buttons (create account, try the practice round); three challenge cards with dates, status and the lesson to train on; how a season works; the record you earn; leaderboard; club strip; season FAQ built from existing approved copy. Keep the current `h1`, the "How a season works" heading and the invite banner (tests and outreach copy depend on them).
- **Check before publishing:** whether explanation points are added to `official_score`. The scorer writes correctness (70) and speed (10) only; don't print a 100-point breakdown on a public page until this is confirmed.
- **Done when:** unit tests for drafts, timer and practice scoring; a browser test for the practice flow in real Python; `/seasons/practice` added to the accessibility route list; signed-in states checked with the seeded fixture (`tests/fixtures/start-season-board.mjs`, extended with `start_attempt` and `submit_attempt`).

### R2. Navigation and first screen
- Show nav links from about 960px; trim the signed-in link set so it fits.
- Homepage: lead with Train, Compete, Prove; keep the Market Lab widget as the interactive hook; cut to roughly half the length; point the header button somewhere that fits a math-team student.

### R3. After sign-up
- Student home shows season status, the practice round and a short checklist (handle, practice, calendar, invite).
- Sign-up page says "play Season 1" when the visitor came from `/seasons`.

### R4. Lessons
- Reach the first Run sooner (a jump-to-exercise control, or exercise first), and check coding on a phone.

### R5. Foundations
- Self-host the three fonts with `next/font/local` so builds and local dev don't depend on Google Fonts.
- Delete legacy `globals.css` selectors as each page moves to tokens and modules.

## Rules for every phase
- Content renders without JavaScript or animation; motion only enhances (`docs/ui-system.md`).
- No public claim without a source; no invented numbers.
- Each phase ships as its own PR with green CI, checked in a browser at 1280px and 375px. Ask before merging.
