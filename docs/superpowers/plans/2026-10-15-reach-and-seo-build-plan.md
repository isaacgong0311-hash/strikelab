# Build Plan: reach beyond one town, SEO, and a better app

**Date:** 2026-10-15
**Replaces the emphasis of:** `2026-10-13-session-yc-build-plan.md` §S3 (local Round Rock outreach). The founder asked to stop local outreach and look for underserved places and online reach, plus more SEO and app work. The rest of the 10-13 plan (claims audit, G1 packet, impact ledger) stays as it is.
**Constraints that stay:** no invented users, quotes or numbers; no contact with anyone from this session; no student demographic collection; code freeze for the pilot-critical flows is **Fri Oct 23** (sign-up, join, cohort, lesson player, scorecard). Additive content and docs are outside the freeze. App changes are scheduled around it, below.

---

## 1. What I found (checked today)

| Area | State | Evidence |
|---|---|---|
| SEO foundations | **Already strong.** Sitemap with real dates, robots that block previews, per-page metadata (42 files), JSON-LD for Course, FAQ, Breadcrumb, BlogPosting, LearningResource | `src/app/sitemap.ts`, `robots.ts`, `components/JsonLd.tsx` |
| SEO content | 12 blog posts, **all options and quant**. Nothing aimed at beginners, teens or club leaders, though 9 of 23 lessons are investing fundamentals | `content/blog/` |
| Speed | Largest contentful paint 2.4–3.5s, JS 206–216 KB on every page tested (`claims-audit.md`) | Lighthouse, Oct 13 |
| Weight for low-bandwidth users | The in-browser Python runtime is 14 MB in `public/pyodide`. Fine on a school network, hard on a slow connection or a capped phone plan | `du public/pyodide` |
| Underserved reach | No plan, and no data on who the product reaches | — |

SEO is not the bottleneck. **Content that matches what beginners and club leaders actually search, and speed on weak connections, are.**

---

## 2. Workstream A: reach in underserved communities (without cold-contacting anyone)

**Principle:** reach people through organizations that already serve them and through search, not through a list of strangers. Everything below is organization-level and public. The founder or a trusted adult sends any message.

| # | Task | Owner | Done when |
|---|---|---|---|
| A1 | **Partner map:** national and Texas organizations that serve underrepresented or under-resourced students and have clubs, chapters or libraries (youth-serving nonprofits, library systems, state business and tech student organizations, college-access programs). Each row: what it is, how it reaches students, a public source link, and what a free, no-install, browser-based program would offer them. No people's names or emails | Agent | `docs/gtm/partners-underserved.csv` with sources, every row marked unverified until the founder checks |
| A2 | **School-level targeting from public data, not guesses:** use the federal and Texas public school datasets (for example Title I status, locale) to shortlist *campuses*, never students. Only campuses, never individuals | Agent | A method note and a shortlist, each row sourced |
| A3 | **Make the product work where the connection is weak** (see C2, C3): a size budget for the Python runtime, a clear "this will download X MB" step, and a no-Python reading path for lessons | Agent | Measured before and after on a throttled connection |
| A4 | **Plain-language and translated entry points.** Start with a Spanish-language *landing and club guide*, reviewed by a fluent speaker before it goes live. No machine-only translation published | Agent drafts, founder finds a reviewer | Reviewer sign-off recorded; `hreflang` set |
| A5 | **Measure reach honestly.** Count clubs, classes, students and campuses from the database. Do **not** collect race, income or similar about students. Campus-level context (such as Title I) comes from public data in the CRM only | Agent | Impact ledger reach table filled from real data |

**Do not:** claim the product "serves underrepresented students" until a named partner has actually run it. Say "designed to work on Chromebooks and slow connections" only after C2 proves it.

---

## 3. Workstream B: SEO that brings the right people

Target readers: (1) a teen who wants to understand investing, (2) a student who wants to start a club, (3) a teacher or advisor, (4) a parent. Those are people searching in plain language, not "gamma scalping."

| # | Task | Owner | Done when |
|---|---|---|---|
| B1 | **Club-leader guide:** `/guides/start-a-high-school-investing-club`, with a first-meeting agenda, a six-week outline linking to the existing cohort, and a printable checklist. It answers the exact search a sponsor makes | Agent | Page live, in the sitemap, `Article` + `HowTo`-style structured data only where the content really is steps |
| B2 | **Beginner cluster, six posts:** how the stock market works, what an ETF is, stocks vs. bonds, compound interest with a Python snippet, what a Roth IRA is for a teen with a job, common first-time mistakes. Each ties to an existing lesson. Facts checked against primary sources, no advice, no promises of returns | Agent | Six `.mdx` posts with sources and `relatedLesson` set |
| B3 | **Glossary** of 30 terms (strike, delta, beta, diversification...), short, accurate, each linking to the lesson. No thin duplicate pages | Agent | `/glossary` with one anchor per term and `DefinedTermSet` data |
| B4 | **Internal linking and metadata pass:** every lesson links to its related posts and back; unique titles and descriptions; per-post Open Graph images | Agent | Link audit script passes |
| B5 | **Search Console and sitemap submission** | **Founder** | Verification file exists (`google...html` in `public/`). Founder confirms it's submitted and sends me the coverage report |
| B6 | **Core Web Vitals:** see C1 | Agent | Lighthouse warnings cleared or explained |

**Honest limit:** SEO takes months. Nothing here will move your numbers by Oct 23, and I'll say so every time. Do not report "traffic" as traction.

---

## 4. Workstream C: the app

Only changes with a stated reason. Order matters because of the freeze.

| # | Task | Why | When |
|---|---|---|---|
| C1 | **Performance:** find what ships 206 KB of JS and delays the main content. Candidates: the 3D Spline scene component and chart libraries on first load. Defer or lazy-load what's below the fold | Lighthouse warnings on all five pages | After Oct 23 for shared layout; before for pages outside the pilot path |
| C2 | **Low-bandwidth mode:** show the Python download size before the first Run, cache it for offline reuse, and let a student read a lesson without Python | Underserved connections and school filters | Additive; can ship now behind the existing runtime |
| C3 | **Throttled-network test:** Playwright test that the lesson still reads on "slow 3G" and fails gracefully when Python can't load | Proves C2 | With C2 |
| C4 | **Readability and accessibility pass** on the new guides: reading level, contrast, keyboard, screen-reader labels | Same bar as the rest of the site | With B |
| C5 | **Share cards:** a clean preview when a teacher or student shares a lesson, guide or demo link | Word of mouth is the main reach channel for clubs | After B1 |
| C6 | **Anything the pilot reveals** | Only the scorecard decides | After the first cohort |

**Not doing:** new tracks, a new theme, gamification experiments, anything needing new student data.

---

## 5. Order for the next sessions

| Step | What | Verifiable result |
|---|---|---|
| 1 | A1 partner map (research, sources) | A sourced CSV the founder can check |
| 2 | B1 club-leader guide | A page, sitemap entry, structured data validated, axe clean |
| 3 | B2 first three beginner posts | Three posts, sourced, linked to lessons |
| 4 | C2 + C3 low-bandwidth mode and test | Test passes on throttled network |
| 5 | B3 glossary, B4 linking pass | Link audit passes |
| 6 | C1 performance, after the freeze | Lighthouse warnings cleared |
| 7 | A4 Spanish guide, once a reviewer exists | Reviewer sign-off |

Each step ends with lint, unit tests, the relevant browser tests and a build.

---

## 6. What I need from the founder

1. Confirm the target: Texas only, US-wide, or online-only. It changes A1 and A2.
2. Someone fluent in Spanish who can review (A4), or say to skip Spanish.
3. Submit the sitemap in Search Console (B5), 10 minutes.
4. Say whether the "do not edit pilot-critical flows after Oct 23" rule stands.

---

## 7. Change log

| Date | Change |
|---|---|
| 2026-10-15 | Created. |
| 2026-10-15 | Built: A1 partner map v0; B1 club-leader guide; B2 six beginner posts (drafted by the agent under the founder's byline, **founder read-through needed before merge**); B4 link-integrity test (per-post Open Graph images already existed); C2/C3 Data Saver / 2G visitors no longer download Python on page open (loads on first Run), with a browser test. Not built: B3 glossary, A4 Spanish, C1 performance (after freeze), C5 share cards. |
