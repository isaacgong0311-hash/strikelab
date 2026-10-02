# The Best Version of StrikeLab: Craft and Learning Roadmap

**Date:** 2026-10-02
**Status:** Proposed. This **adds to** `2026-10-01-frontend-yc-plan.md` and `2026-09-30-frontend-work-plan.md`; it does not replace them. Those plans own sequencing, the gates and the Lighthouse budgets. This one sets the quality bar for **type, the visual system, the lesson player and the product**, backs each item with research, and slots every item into their windows and triggers.
**Fits inside:** the mega plan's gates. **Code freeze is Fri Oct 23.** Frontend work never outranks getting a leader.
**Step-level plans (ready to execute):**
- `2026-10-02-type-foundation-plan.md`: BV-T1, T2, T3, T8 (batch 1, before the freeze)
- `2026-10-02-math-typesetting-plan.md`: BV-T4 and BV-P4
- `2026-10-02-order-step-plan.md`: BV-P1

---

## 0. Summary

1. **The bones are right.** StrikeLab already has a Duolingo-shaped session player, a credible teacher demo, axe-clean pages and Lighthouse budgets in CI. What separates it from the best learning products now is craft in the details students read every minute, and interactivity inside the lessons.
2. **Five gaps, measured on Oct 2** (production build, 34 routes, 320/375/1366px):
   - **Type is undisciplined.** 48 distinct font sizes are in use, and 16% of text is under 12px (some at 8–9px).
   - **Fonts are half-delivered.** Google's font files strip the OpenType features our CSS asks for. Greek letters, arrows and maths symbols fall back to system fonts (600 elements). Weights 800/900 are requested but never loaded. The code editor doesn't use the code font at all.
   - **Maths is typed as plain text.** For example, `d₁ = [ln(S/K) + (r + σ²/2)·T] / (σ·√T)` appears on one line, in a product about formulas.
   - **Lessons are read, not done.** 3 of 23 lessons have sessions, and every step is text, multiple choice or a typed number. No step asks a student to manipulate, predict or order anything.
   - **Opening a coding lesson downloads 5.8 MB of Python** within half a second, whether or not the student runs code. `/lesson/3` weighs 6.7 MB in Lighthouse (performance 0.48). A club opening it together pulls about 145 MB through the school network.
3. **The fixes are cheap where it matters, and verified:**
   - **Fonts:** self-hosting two fonts is *smaller* than today (fonts on `/` fall from 117.6 KB to 93.5 KB) and fixes coverage and features together. A trial build passed 38/38 Playwright tests, with 98.9% of elements unchanged in size.
   - **Maths:** build-time KaTeX adds no JavaScript.
   - **Ordering step:** it reuses the existing engine.
4. **When:**
   - **Before the freeze:** the type foundation, as one PR of about 5 agent hours.
   - **In the first two pilot weeks**, if approved: lesson 3 gets Python on demand and typeset maths, before cohort A reaches it.
   - **Everything else** lands in Phase B behind triggers, or in the winter build next to FW-10.

---

## 1. The bar: what "best" means here

Every row is measurable. `scripts/audit/type-audit.mjs` (added by the type-foundation plan) prints the type rows, so any PR can show before and after.

| Area | Bar | Now (Oct 2) | Why this bar |
|---|---|---|---|
| Distinct text sizes | ≤ 10 (a 9-step scale plus code) | 48 | A modular scale is what makes a page read as designed ([Utopia](https://utopia.fyi/blog/css-modular-scales/)) |
| Text under 12px | 0, legal lines excepted | 601 of 3,726 elements (16%) | Teens dislike tiny text as much as adults and skip it ([NN/g](https://www.nngroup.com/articles/usability-of-websites-for-teenagers/)) |
| Lesson body size | ≥ 17px | 15.36px | 16–19px for readers with dyslexia ([BDA style guide](https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/style-guide/BDA-Style-Guide-2023.pdf?v=1680514568)) |
| Lesson line length | 60–75 characters | 78–102 at 1366px (39–43 on phones) | 45–75 is the consensus range; WCAG 1.4.8 caps it at 80 ([overview](https://en.wikipedia.org/wiki/Line_length)) |
| Glyphs painted by a system font | 0, except about a dozen rare symbols none of our fonts carry (≡ ⊞ ⟲ ✶ ✦ ⏱ ∄ …) | 600 elements | A Greek letter in Times next to Inter looks broken |
| Weights requested but not loaded | 0 | 207 elements (Inter 800/900, Jakarta 400) | The design asks for weights it never gets |
| Faux styles | 0 headings | Every lesson `h2` (Jakarta has no italic) | Synthesized italics are slanted, not drawn |
| Code font | JetBrains Mono everywhere code appears, no ligatures | Editor in system mono; ligatures on in code blocks | Beginners must see `<=` and `!=`, not `≤` and `≠` |
| Maths | Typeset (fractions, radicals, scripts), with MathML for screen readers | Plain text | It's a product about formulas |
| Interactive steps | ≥ 1 per session that isn't multiple choice or a typed number | 0 of 60 steps | Learning by doing beats reading ([Brilliant](https://brilliant.org/about/), [PhET + POE](https://scie-journal.com/index.php/SiLeT/article/view/34)) |
| Mobile LCP | ≤ 2.0s (FW-11) | 3.2–3.8s simulated | Unchanged from the existing plan |
| Font bytes per page | ≤ 100 KB, three families | 117.6 KB on `/` (after PR #40) | School networks and Chromebooks |

---

## 2. Audit: what was found (Oct 2)

**Method:**
- a production build of `claude/lucid-allen-n4y95p` (PR #40 applied);
- every text element on 34 routes at 320, 375 and 1366px;
- the fonts Chrome actually painted with (DevTools `CSS.getPlatformFontsForNode`);
- fonts inspected with fontTools;
- screenshots at 1366×768 and 375×812;
- Lighthouse (5 URLs × 3 runs, plus a 7-run A/B on the font).

| # | Finding | Evidence | Severity |
|---|---|---|---|
| **B1** | **48 text sizes.** CSS declares 79 distinct `font-size` values, plus Tailwind `text-[9px]`, `text-[10px]` and `text-[11px]` | Crawl at 1366px; `grep font-size` | High (the root cause of "assembled, not designed") |
| **B2** | **16% of text is under 12px**, down to 8px. The worst routes are `/dashboard` (80 elements), `/lesson/3` (55) and `/lesson/inv-1` (39) | Crawl | High on student routes |
| **B3** | **Google's font files lack the features our CSS uses.** Inter's latin file has no `ss02` (I/l/1) and no `zero`; JetBrains Mono's has no `zero`. The `"zero" 1` rules in `globals.css` (NUMERALS block) do nothing | fontTools `GSUB` table of the served files | Medium |
| **B4** | **JetBrains Mono's ligatures are switched on** for `code`, `pre` and the editor (`"calt" 1`), so `<=` renders as `≤` | `globals.css` NUMERALS block; JetBrains Mono's `calt` holds all ligatures ([wiki](https://github.com/JetBrains/JetBrainsMono/wiki/OpenType-features)) | Medium (wrong for beginners) |
| **B5** | **Greek, arrows and maths symbols fall back to system fonts.** The latin files contain no Greek, →, ✓, √, ∑ or ∂. Stacks ending in a bare `var(--font-display)` have no generic family, so those glyphs land in Times-like Liberation Serif | 124 elements in Liberation Serif, 131 in DejaVu Sans | High (looks broken; Greek is the product) |
| **B6** | **The code editor isn't in the code font.** CodeMirror keeps its default `font-family: monospace`, so the editor is Cousine on ChromeOS, Consolas on Windows and DejaVu Sans Mono on Linux | 344 elements in DejaVu Sans Mono | High (the editor is the product) |
| **B7** | **Weights not loaded:** Inter is loaded at 400–700 but 196 elements ask for 800/900; Jakarta at 500–800 but 11 ask for 400. Both are variable fonts, so the fix costs no bytes | Crawl; one file per subset serves every weight | Low (decide, then encode in the scale) |
| **B8** | **Lesson reading measure:** body text is 15.36px at 78–102 characters per line on a Chromebook, and every section `h2` is a synthesized italic | `/lesson/3`, `.lesson-content` | Medium (lessons are where students read) |
| **B9** | **Maths is plain text** inside `<blockquote>`, using Unicode subscripts and `<sup>` | `src/lib/lessons.ts`, lesson 3 | High for the quant track |
| **B10** | **Mono is overused:** 20% of text elements render in JetBrains Mono, including links ("View learning path"), breadcrumbs and 9–10px uppercase labels with wide tracking | Crawl; dashboard and lesson screenshots | Medium (legibility; all-caps hurts word shape per the BDA guide) |
| **B11** | **Hero period:** in "Learn quant finance by building it." the period sits visibly detached at display size | 2× crop; Jakarta's period has a wide advance at weight 800 | Low (first screen) |
| **B12** | **Session steps are text-only:** 27 explain, 25 multiple-choice and 8 numeric steps across 9 sessions; the planned `order`, `slider-target`, `predict-chart` and `code` kinds are not built | `src/lib/sessions/content/*` | High (activation and learning) |
| **B13** | **A new visitor's dashboard shows ten zero-value widgets** under the "Start here" card | `/dashboard` at 1366px | Low (students in cohorts land on the cohort home) |
| **B14** | **Styling debt** (already owned by FW-10): 4,221-line `globals.css`, 406 inline style objects in 60 files, 140 distinct hex colours, 28 border radii, and two radius scales (`--r-*` and `--sl-radius-*`) | Counts from `src/` | Medium now, High by spring |
| **B15** | **Coding lessons load the Python runtime on open:** `pyodide.asm.wasm` (3.2 MB) and `python_stdlib.zip` (2.3 MB) start about 0.4s after load. `PyodideLoader` in `LessonClient.tsx` mounts with the page, although its comment says "as soon as the exercise is on screen"; `/challenges` does the same | Lighthouse on `/lesson/3`: 6.7 MB total, performance 0.48 (budget 900 KB). Cached for a year afterwards, but the first open is the classroom moment | **High** (pilot week 3: 25 students × 5.8 MB at once) |

**What's good:**
- No route scrolls sideways at 320, 375 or 1366px.
- The player's feedback loop (check → green or red sheet → retry later) already matches Duolingo's.
- The teacher demo is clear and honest.
- axe passes on every core route.

---

## 3. What to borrow, and from whom

| Source | What they do | What StrikeLab takes | Item |
|---|---|---|---|
| **Duolingo** | Two faces with strict jobs: Feather Bold for headlines and buttons, DIN Next Rounded for body, never mixed in one sentence ([Fonts In Use](https://fontsinuse.com/uses/59497/duolingo-app)) | A written role table: Jakarta for headings and display numbers, Inter for everything people read and press, JetBrains Mono for code and data only | BV-T7 |
| **Duolingo** | One idea per screen, instant feedback sheet, missed items return | Already built; extend the feedback with *why this option is wrong* | BV-P5 |
| **Brilliant** | No videos; every concept is a manipulable interactive with immediate feedback ([About](https://brilliant.org/about/), [Rive case study](https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations)) | A predict step and a manipulate step built from the existing `PayoffDiagram` and `FormulaSandbox` | BV-P2, P3 |
| **Execute Program** | Courses are mostly live code examples, with spaced-repetition review built in ([Why EP](https://www.executeprogram.com/why-ep)) | Code steps inside sessions; a review queue | BV-P6, P7 |
| **Parsons problems** | Ordering shuffled code lines is as effective as writing code and takes less time; distractors hurt young novices ([Ericson et al.](https://www.semanticscholar.org/paper/Solving-parsons-problems-versus-fixing-and-writing-Ericson-Margulieux/2f1b7c75a3cc2f33fc34575bbe77eeb1f336debc)) | An `order` step (procedures, then code lines), no distractors at first | BV-P1 |
| **Worked-example fading** | Full example → partly blanked → blank, which beats example-problem pairs for novices ([Renkl & Atkinson](https://www.researchgate.net/publication/2398854_From_Studying_Examples_to_Solving_Problems_Fading_Worked-Out_Solution_Steps_Helps_Learning)) | Code exercises that fade from complete to blank across a session | BV-P6 |
| **Predict-Observe-Explain** | Predict, then see it change, then explain; effective with PhET simulations ([PhET + POE](https://scie-journal.com/index.php/SiLeT/article/view/34)) | Predict the payoff before the chart moves | BV-P2 |
| **Dunlosky et al. (2013)** | Practice testing and distributed practice are the two techniques rated "high utility" ([AFT summary](https://www.aft.org/ae/fall2013/dunlosky)) | Review queue (Leitner first) | BV-P7 |
| **Duolingo research** | A learned forgetting model improved recall about 16% over fixed intervals ([Settles & Meeder, ACL 2016](https://aclanthology.org/P16-1174/)) | Start with fixed Leitner boxes; earn the model with data | BV-P7 |
| **Shute (2008)** | Formative feedback should be specific, timely and non-evaluative; elaborated feedback explains why ([Review of Educational Research](https://journals.sagepub.com/doi/10.3102/0034654307313795)) | Per-option explanations | BV-P5 |
| **Desmos Classroom** | Teacher pacing, "pause class" and snapshots of student work ([Desmos blog](https://blog.desmos.com/articles/introducing-the-new-desmos-activity-dashboard/)) | Meeting mode: the leader keeps the room on one session | BV-X2 |
| **Kahoot / Gimkit** | A projector lobby: a big join code, and players visibly arriving ([comparison](https://learnclash.com/blog/kahoot-vs-gimkit)) | Projector mode for the kickoff live view (counts, never names) | BV-X1 |
| **Seeing Theory** | Probability taught through explorable visuals ([Brown CS](https://blog.cs.brown.edu/2018/01/22/seeing-theory-teaching-statistics-through-interactive-web-based-visualizations/)) | A manipulate step for N(d) and the normal curve | BV-P3 |
| **NN/g, teenagers** | Teens read less, give up faster and dislike small text ([report](https://www.nngroup.com/reports/teenagers-on-the-web/)) | 12px floor; shorter copy on student screens | BV-T7 |
| **BDA style guide** | 16–19px body, 1.5 line height, avoid all caps and italics in running text | Lesson typography; eyebrow rules | BV-T6, T7 |
| **web.dev on fonts** | WOFF2, subset to what you use, fallback metrics to avoid shift, preload only the first font needed ([web.dev](https://web.dev/learn/performance/optimize-web-fonts)) | Self-hosted subsets with size-adjusted fallbacks | BV-T1 |
| **KaTeX / MathML** | Chrome 109+ renders MathML natively but needs a maths font (Latin Modern Math is 379 KiB) ([Giles Thomas](https://www.gilesthomas.com/2025/02/mathml-fonts-on-chromium-based-browsers)); KaTeX renders at build time and can emit MathML too ([Temml/KaTeX](https://temml.org/)) | KaTeX at build time, HTML plus MathML | BV-T4 |

---

## 4. Craft rules (added to the existing frontend rules)

- **Three faces, three jobs.**
  - **Plus Jakarta Sans:** headings and big display numbers.
  - **Inter:** everything people read or press.
  - **JetBrains Mono:** code, formulas written as code, data tables, and the eyebrow label.
  - Never mono for links or sentences.
- **Sizes come from the scale.** After BV-T5 a test fails on any new raw `font-size` in a CSS module.
- **Nothing under 12px.** Uppercase only for eyebrows of three words or fewer, with tracking ≤ 0.08em.
- **Every stack ends in a generic family**, and display stacks fall back to Inter before system fonts (Inter carries the Greek that Jakarta lacks). Use the `--sl-font-*` tokens, never the raw `--font-*` variables.
- **Numbers that update or get compared use tabular figures.**
- **Maths is TeX in the content, rendered at build time.** No images, no client-side MathJax.
- **No faux styles.** If a weight or style isn't loaded, don't ask for it.
- **Keyboard first for manipulatives.** Every drag has buttons or a native range input that reaches the same states.

---

## 5. The work

Estimates are **agent build hours / founder review minutes**, as in the other plans. Every item ships as a PR with lint, unit tests, Playwright (including axe), build and Lighthouse passing, plus screenshots at 375px and 1366px. Typography PRs also include the audit script's before/after output.

### Workstream T: Typography

| # | Item | Change | Acceptance | Window | Est. |
|---|---|---|---|---|---|
| **BV-T1** | **Self-hosted, feature-complete fonts** | `scripts/fonts/build_fonts.py` cuts pinned Inter 4.1 and JetBrains Mono 2.304 to the weights and characters we render: Greek, arrows, maths, sub/superscripts, ✓ ✗ ▶ ⌘. It keeps `tnum`, `zero`, `ss02`, `case` and `frac`, and drops ligatures. `next/font/local` replaces `next/font/google` for those two; Jakarta stays on Google | Fonts on `/` ≤ 100 KB (trial: 93.5 KB, from 117.6 KB); `tests/fonts.spec.ts` passes; ≥ 98% of elements keep their size | **Now → freeze** | 3h / 10m |
| **BV-T2** | **Stacks and coverage** | `fallback` arrays on the two local fonts add generic families; `--sl-font-display` falls back to Inter; 96 bare `var(--font-display)` uses switch to the token; JetBrains Mono gains box drawing for the `# ── Helpers ──` dividers | System-painted glyphs drop from 600 elements to the handful showing rare symbols none of our fonts carry (trial: 15 elements, all ≡ ⊞ ⟲ ✶ ✦ ⏱ ∄ ∓ ʳᵀ) | **Now → freeze** | 1h / 5m |
| **BV-T3** | **The code font where code is** | The editor theme sets `.cm-scroller` to `--sl-font-code`; `"calt"` comes off code; slashed zero only on code | The editor paints in JetBrains Mono; `<=` shows as two characters | **Now → freeze** | 0.5h / 5m |
| **BV-T8** | **Optical polish** | The hero period gets `margin-inline-start: -0.06em` | The 2× crop shows the period set like a letter | **Now → freeze** | 0.25h / 2m |
| **BV-T4** | **Maths typesetting** | KaTeX renders `<span class="tex">` and `<div class="tex-block">` at build time (HTML + MathML); lesson 3's formulas convert first | `/lesson/3` shows a real fraction for d₁; screen readers get MathML; no KaTeX JS in the client bundle; malformed TeX fails the build; nothing scrolls sideways at 320px (d₂ is 345px wide, so display maths scrolls inside its block) | **Phase B, weeks 1–2** if approved (before cohort A reaches lesson 3), else Phase C | 4h / 15m, then 1h per lesson |
| **BV-T5** | **The type scale** | Nine tokens in `tokens.css` (below); map every size to its nearest step, never below 12px; a test fails on raw `font-size` in CSS modules; weights become tokens too, and 800 maps to 700 unless the founder picks otherwise (decision 2) | ≤ 10 sizes on the audit; the guard test is in CI | **Phase C, with FW-10** | 6h / 20m |
| **BV-T6** | **Lesson reading typography** | `.lesson-content`: 17px body, `max-width: 68ch`, line height 1.65, upright 700 `h2` (no synthesized italic), 1.25em between paragraphs | 60–75 characters per line at 1366px; no faux italic | **Phase C**, or Phase B if observation notes flag reading | 2h / 10m |
| **BV-T7** | **Small-text floor and mono roles** | Raise the 601 sub-12px elements; links and sentences move to Inter; eyebrows stay mono at 12px with ≤ 0.08em tracking | 0 elements under 12px; mono share under 12% of text | **Phase C** | 4h / 15m |
| **BV-T9** | **Demo tour code font** | Once PR #39 and PR #40 have both merged, `src/app/demo/tour.module.css` `.code` and `.joinLink` go back to `var(--sl-font-code)` and the workaround comment is deleted | No visual regression on `/demo`; no new font file | After both merge | 0.25h |

**The scale for BV-T5.** Nine steps. The display steps are fluid between 320px and 1366px (Utopia-style `clamp()`).

| Token | Size | Use |
|---|---|---|
| `--sl-text-2xs` | 0.75rem (12px) | Eyebrows, meta, chip labels. The floor |
| `--sl-text-xs` | 0.8125rem (13px) | Captions, table headers, badges |
| `--sl-text-sm` | 0.875rem (14px) | Secondary UI, nav, buttons |
| `--sl-text-md` | 1rem (16px) | UI body, inputs |
| `--sl-text-lg` | 1.0625rem (17px) | Reading body (lessons, session steps) |
| `--sl-text-xl` | 1.25rem (20px) | Ledes, `h3`, card titles |
| `--sl-text-2xl` | clamp(1.375rem, 1.13rem + 1.2vw, 1.75rem) | Player questions, section `h2` |
| `--sl-text-3xl` | clamp(1.75rem, 1.2rem + 2.4vw, 2.625rem) | Page `h1`, marketing `h2` |
| `--sl-text-4xl` | clamp(2.25rem, 1.4rem + 4vw, 4rem) | The hero only |

**Mapping rule:** take the nearest step, ties go up, and nothing goes below `2xs`. Code keeps 0.85rem in the editor (one exception, documented).

### Workstream V: Visual system (extends FW-10 and FW-14)

| # | Item | Change | Acceptance | Window | Est. |
|---|---|---|---|---|---|
| **BV-V1** | **Colour tokens** | Replace the 140 raw hex values with semantic tokens; a test forbids hex outside `tokens.css`, `editorTheme.ts` and the OG image | 0 raw hex in migrated files | Phase C | 5h / 15m |
| **BV-V2** | **One radius scale** | Fold `--r-*` into `--sl-radius-*`; 28 values become 6 | ≤ 6 radii in the audit | Phase C | 2h / 5m |
| **BV-V3** | **Primitives and a specimen page** | `Button`, `Card`, `Stat`, `Eyebrow`, `Badge` and `Callout` in `src/components/ui/`, shown on a `noindex` page at `/dev/ui` that FW-8's visual tests screenshot | Each primitive has one Playwright visual baseline; axe clean | Phase C | 5h / 15m |
| **BV-V4** | Icons | = FW-14 (Lucide, no glyph icons) | per FW-14 | Phase C | per FW-14 |
| **BV-V5** | **Motion tokens and one celebration** | Three durations and two easings in tokens (FW-14); a CSS-only session-complete moment (scale-in badge, a short shimmer on XP) that respects reduced motion | No JS animation library; reduced motion shows the end state | Phase C | 2h / 10m |
| **BV-V6** | **The new visitor's dashboard** | Replace the ten zero widgets with the "Start here" card and a three-node path preview; stats appear after the first finished session | A new visitor sees no "0" stat | Phase B trigger: analytics show sign-ups landing on `/dashboard`; else Phase C | 2h / 10m |

### Workstream P: The lesson player

| # | Item | Change | Acceptance | Window | Est. |
|---|---|---|---|---|---|
| **BV-P1** | **Order step (Parsons)** | A new `order` step kind: shuffled items, reordered with up and down buttons (keyboard first), graded by the engine, then one step authored in `inv-5.3` | Unit tests for grading and the shuffle; Playwright solves it by keyboard; axe clean | Trigger: the mega plan's W10 check says sessions beat long-form (B2); else Phase C | 4h / 15m |
| **BV-P2** | **Predict-then-see step** | A multiple-choice step with a `reveal` that animates `PayoffDiagram` after the answer ("Which shape is a long put?") | Reveal works with reduced motion (end state); keyboard only | Phase C | 5h / 15m |
| **BV-P3** | **Manipulate step** | `slider-target`: "drag σ until the call is worth $5", reusing `FormulaSandbox` with a native range input; graded within a tolerance | Reaches the target by keyboard; the answer is checked by computing the formula | Phase C | 5h / 15m |
| **BV-P4** | **Typeset formulas in steps** | `ExplainStep.formulaTex`, rendered on the server by BV-T4's renderer | Part of the maths plan | With BV-T4 | 1h |
| **BV-P5** | **Why this option is wrong** | Optional `optionExplanations` on multiple-choice steps; a wrong answer shows the reason for *that* option, then the general explanation | Content lint: if present, one per option | Phase B trigger: the same step id missed by ≥ 3 students in a week | 2h, plus content |
| **BV-P6** | **Code steps with faded examples** | A `code` step running Python in the player (Pyodide loads on the first code step only): complete example, then 1–2 blanks, then the full exercise | Pyodide not fetched by sessions without code steps; works on a 4 GB Chromebook | Phase D | 8h / 20m |
| **BV-P7** | **Review queue** | Duolingo plan Phase 3: Leitner boxes (1/3/7/14/30 days) keyed by step id; a "Practice" session through the same player | 5-minute practice session works signed out (local) and signed in (synced) | Trigger: week-4 retention < 40% (G3) | 6h / 20m |
| **BV-P8** | **Convert the remaining pilot lessons** | Mega plan B2, now with ≥ 1 interactive step (P1–P3) per session | The content lint enforces it | B2 trigger | 2–3h per lesson |

### Workstream X: The whole product

| # | Item | Change | Acceptance | Window | Est. |
|---|---|---|---|---|---|
| **BV-X1** | **Projector mode for kickoff** | `?present=1` on the invite page: the join code and QR at about a third of the screen height, live counts in large type ("12 joined · 9 finished session 1"), high contrast, **no student names** | Readable from the back of a classroom (code ≥ 96px at 1366×768); axe clean | **Before the freeze only if** the rehearsal (Q4) shows the leader projecting; else Phase B | 2h / 10m |
| **BV-X2** | **Meeting mode** | Desmos-style pacing: the leader picks "this week's session" and the cohort home shows only it, with a "we're on step N" banner | One click to start, one to end | Trigger: a leader asks twice to keep the room together | 6h / 20m |
| **BV-X3** | **Chromebook-class speed** | Add a Lighthouse run with the desktop preset and 4× CPU throttling for `/learn/inv-1.1` and `/playground`; measure Pyodide memory on a 4 GB device during the school device test (typical school devices: Celeron N4500, 4 GB, 1366×768) | Recorded in the device-test notes; regressions fail CI after one baseline week | Phase B | 2h / 15m |
| **BV-X4** | Onboarding | = Duolingo plan Phase 2 (unchanged trigger) | per that plan | per that plan | — |
| **BV-X5** | **Craft re-audit before the application** | Re-run the audit script and the screenshot sweep on production; every row in §1 met or explained | A written pass in the application checklist (FY-9) | Phase E | 1h / 15m |
| **BV-X6** | **Load Python when it's needed** | In `LessonClient` and `ChallengesClient`, start `loadPythonRuntime()` when the exercise comes within one screen of the viewport (`IntersectionObserver`, `rootMargin: "100% 0px"`), or on the first focus of the editor, whichever is first. Skip the early warm-up when `navigator.connection?.saveData` is set. `/playground` keeps loading at once, because the editor is the page. Then add `/lesson/3` to `lighthouserc.json` | `/lesson/3` under the 900 KB budget with no scrolling; the first Run still works ("Starting Python…", then results); `tests/python.spec.ts` passes | **Phase B, weeks 1–2** (before cohort A reaches lesson 3) | 2h / 10m |

---

## 6. Sequence

| Batch | Window | Items | Agent / founder | Why now |
|---|---|---|---|---|
| **1. Type foundation** | Now → Oct 20 | BV-T1, T2, T3, T8 | 5h / 25m | Lighter pages than today, the editor in the right font, Greek drawn properly, and no layout change (trial: 38/38 tests, 98.9% of elements unchanged) |
| **2. Lesson 3, ready for the pilot** | Oct 26 – Nov 8 (if approved) | BV-X6 (Python on demand), then BV-T4 and BV-P4 for lesson 3 only | 7h / 30m | Cohort A reaches Black-Scholes in week 3, all at once, on a school network |
| **3. Triggered** | Phase B | BV-X1, X3, P5, V6, P1 (W10) | per trigger | Only what the scorecard or a leader asks for |
| **4. One system** | Dec 21 – Jan 3 | BV-T5, T6, T7, V1, V2, V3, V5, P2, P3 (with FW-10, FW-14) | about 40h / 2h | Nobody is in a cohort |
| **5. Learning depth** | Jan – Mar | BV-P6, P7, P8, X2 | per trigger | Spring cohorts, program v2 |
| **6. Proof** | Late Mar – Apr | BV-X5 | 1h / 15m | The partner's minute |

---

## 7. Quality gates added by this plan

| Gate | Added by | Fails when |
|---|---|---|
| `tests/fonts.spec.ts` | BV-T1 | Text on a core route is painted by a system font (except the known symbols), the editor isn't JetBrains Mono, or `/` loads more than 3 font files or 100 KB of fonts |
| `scripts/audit/type-audit.mjs` | BV-T1 | Not a CI gate: run before and after every typography PR, with the output in the PR |
| Type scale test | BV-T5 | A CSS module declares a raw `font-size` |
| Small-text check | BV-T7 | Any computed font size under 12px on core routes |
| Lighthouse on `/lesson/3` | BV-X6 | A coding lesson breaks the existing budgets (it can't be added before BV-X6: the Python runtime alone is 5.8 MB) |
| Content lint | BV-P1, P5, P8 | An order step has duplicates or fewer than 3 items, or a converted session has no interactive step |

---

## 8. Success measures

| Measure | Now | Target | By |
|---|---|---|---|
| Font bytes on `/` | 117.6 KB | ≤ 100 KB | Oct 20 (batch 1) |
| Elements painted by a system font | 600 | ≤ 15, all rare symbols none of our fonts carry | Oct 20 |
| Editor in the code font | no | yes | Oct 20 |
| Typeset formulas in lesson 3 | 0 | all | Nov 8 (if approved) |
| `/lesson/3` page weight (Lighthouse) | 6.7 MB | under 900 KB | Nov 8 |
| Distinct text sizes | 48 | ≤ 10 | Jan 3 |
| Text under 12px | 16% | 0 | Jan 3 |
| Lesson characters per line (1366px) | 78–102 | 60–75 | Jan 3 |
| Sessions with an interactive step | 0 of 9 | every converted session | Mar 1 |
| Mobile LCP (`/learn`, `/cohort`) | 2.6–3.8s | ≤ 2.0s (FW-11) | Jan 3 |

---

## 9. Not doing

Everything in the Sep 30 plan §7 still holds: dark mode, a rebrand, a mascot, a WebGL hero, a native app, public leaderboards, and redesigning lessons before observation notes. Also:

- **A custom or paid typeface.** Jakarta, Inter and JetBrains Mono are right; the work is using them properly.
- **A JavaScript animation runtime** (Rive, Lottie). Brilliant uses Rive, but on a 4 GB Chromebook CSS is enough for one celebration.
- **Client-side MathJax**, or native MathML with a 379 KiB maths font.
- **Drag-only interactions.** Every manipulative has a keyboard path first.
- **Hearts, lives or gems.** Missed items come back; nothing blocks learning.
- **AI-written steps without a computed check.** Every numeric answer and target is recomputed in the content lint, as today.

---

## 10. Decisions for the founder

1. **Approve batch 1 (BV-T1, T2, T3, T8) before the freeze?** *Recommended: yes.* About 5 agent hours and 25 minutes of your review. Pages get lighter than today, the editor finally uses the code font, and Greek renders properly. The trial build passed every Playwright suite with 98.9% of elements unchanged in size.
2. **Weight 800.** 196 elements ask for Inter 800/900 and render at 700, which is the look everyone has seen.
   - *Recommended:* keep that look. Batch 1 loads 400–700, and BV-T5 maps 800 to 700 in the scale.
   - *The alternative:* load 800 and review heavier buttons and labels.
3. **Lesson 3 before cohort A reaches it** (Phase B, weeks 1–2): load Python on demand (BV-X6), then typeset its maths (BV-T4)? *Recommended: yes, both, BV-X6 first.*
   - **BV-X6** removes a 5.8 MB download that every student currently makes the moment the lesson opens.
   - **BV-T4** is contained to how one lesson renders.
   - The alternative is to wait for winter and accept the classroom download in week 3.
4. **The order step:** wait for the W10 sessions check (*recommended*, per mega plan B2), or build it in winter regardless?
5. **Mono eyebrows:** keep the mono eyebrow as a brand mark at 12px with tighter tracking (*recommended*), or move eyebrows to Inter semibold?

---

## 11. Sources

- Duolingo type: [Fonts In Use](https://fontsinuse.com/uses/59497/duolingo-app)
- Brilliant: [About](https://brilliant.org/about/), [Rive case study](https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations)
- Execute Program: [Why EP](https://www.executeprogram.com/why-ep)
- Desmos Classroom: [Activity dashboard](https://blog.desmos.com/articles/introducing-the-new-desmos-activity-dashboard/), [Teacher dashboard in class](https://blog.desmos.com/articles/how-do-you-use-the-teacher-dashboard-in-class/)
- Kahoot and Gimkit: [comparison](https://learnclash.com/blog/kahoot-vs-gimkit)
- Parsons problems: [Ericson, Margulieux et al.](https://www.semanticscholar.org/paper/Solving-parsons-problems-versus-fixing-and-writing-Ericson-Margulieux/2f1b7c75a3cc2f33fc34575bbe77eeb1f336debc), [Adaptive Parsons problems](https://www.researchgate.net/publication/326918129_Evaluating_the_Efficiency_and_Effectiveness_of_Adaptive_Parsons_Problems)
- Worked-example fading: [Renkl & Atkinson](https://www.researchgate.net/publication/2398854_From_Studying_Examples_to_Solving_Problems_Fading_Worked-Out_Solution_Steps_Helps_Learning)
- Predict-Observe-Explain with PhET: [SiLeT](https://scie-journal.com/index.php/SiLeT/article/view/34), [PER Central](https://www.per-central.org/items/perc/2719.pdf)
- Learning techniques: [Dunlosky et al. 2013 (AFT summary)](https://www.aft.org/ae/fall2013/dunlosky)
- Spaced repetition: [Settles & Meeder, ACL 2016](https://aclanthology.org/P16-1174/)
- Feedback: [Shute 2008](https://journals.sagepub.com/doi/10.3102/0034654307313795)
- Seeing Theory: [Brown CS blog](https://blog.cs.brown.edu/2018/01/22/seeing-theory-teaching-statistics-through-interactive-web-based-visualizations/)
- Teen users: [NN/g article](https://www.nngroup.com/articles/usability-of-websites-for-teenagers/), [NN/g report](https://www.nngroup.com/reports/teenagers-on-the-web/)
- Dyslexia-friendly text: [BDA Style Guide 2023](https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/style-guide/BDA-Style-Guide-2023.pdf?v=1680514568)
- Line length: [overview](https://en.wikipedia.org/wiki/Line_length)
- Fluid type scales: [Utopia](https://utopia.fyi/blog/css-modular-scales/)
- Web fonts: [web.dev](https://web.dev/learn/performance/optimize-web-fonts)
- JetBrains Mono features: [wiki](https://github.com/JetBrains/JetBrainsMono/wiki/OpenType-features)
- Inter features: [rsms/inter](https://github.com/rsms/inter/)
- Maths on the web: [MathML fonts in Chromium](https://www.gilesthomas.com/2025/02/mathml-fonts-on-chromium-based-browsers), [Temml](https://temml.org/), [MathML in browsers](https://mathml.igalia.com/)
- School Chromebooks: [typical N4500 / 4 GB / 1366×768 configuration](https://www.pcworld.com/article/608636/best-chromebooks.html)

---

## 12. Change log

| Date | Change |
|---|---|
| 2026-10-02 | All three step-level plans validated by applying their code verbatim, then reverting: type foundation (57/57 Playwright on dev), maths (99 unit and 10 Playwright tests; added a 320px overflow fix the trial exposed), order step (97 unit and 8 Playwright tests). |
| 2026-10-02 | Added B15 and BV-X6 after validating the maths plan: Lighthouse showed `/lesson/3` at 6.7 MB because the Python runtime loads on open. |
| 2026-10-02 | Created from the Oct 2 audit and research. Batch 1 validated by a trial build: 38/38 Playwright tests, fonts on `/` 117.6 → 93.5 KB, system-painted elements 600 → 15. The trial was reverted; batch 1 is still to do. |
