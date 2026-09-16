# Core UI and accessibility audit

This document is the migration record for StrikeLab's student-first UI refresh.
It protects product behavior while the legacy global stylesheet is retired route
by route. The release checklist lives in `docs/accessibility-release-checklist.md`.

## Protected behavior

The redesign must not change lesson URLs or curriculum data, authentication,
progress persistence, XP or streak calculations, certificates, subscriptions,
Pyodide execution, option pricing, simulated order execution, watchlists, or AI
quota behavior. Visual refactors should keep those paths behind their existing
hooks and API routes. Teacher administration receives the shared shell and form
standards only in this cycle.

## Route inventory

| Flow | Primary states | Accessibility contract after migration |
| --- | --- | --- |
| Home | signed out/in, curriculum disclosures, newsletter success | One `h1`, ordered content sections, labeled disclosure regions, visible server-rendered copy, distinct student and teacher actions |
| Learning path | current, complete, available, coming soon | Ordered curriculum, state expressed with text and shape, overall progress name/value, mobile DOM order matches reading order |
| Lesson | reading, checkpoint, quiz, code run, tutor stream, completion | Breadcrumb and TOC structure, grouped questions, polite results, internally scrolling code/data, focus-managed completion dialog |
| Playground | Python loading, ready, running, output, chart error | Code → parameters → execute → output → charts, labeled sliders with units and current values, textual chart summaries, live execution state |
| Sandbox | signed out/loading, quote search, invalid/valid order, confirmation, positions/history, API failure | Labeled order fields, keyboard listbox and tabs, cost preview, confirmation before close, signed and labeled gains/losses, recoverable errors |
| Dashboard | signed out, first use, populated, loading/error | Recommended next action first, named progress values, keyboard tabs, activity text detail, consistent empty/error state |
| Authentication | sign in/up, reset request, reset, loading/error | Persistent labels, autocomplete, described password requirements, focused error summary, stable button names |
| Settings | profile, accessibility, integrations, classes | Semantic sections, labeled fields, live save status, versioned local preferences and device-settings reset |

## Baseline findings addressed

- Essential landing and lesson content could begin hidden behind animation
  classes. Content is now visible by default and animation is enabled only after
  observers attach; reduced-motion preferences disable it.
- The desktop navigation pattern was reused on mobile without dialog-level focus
  management. The drawer now contains focus, closes with Escape or backdrop,
  restores focus, locks body scrolling, and makes background content inert.
- Several dropdowns used partial `menu` semantics without implementing the menu
  keyboard model. They now use ordinary button/link popover semantics.
- Checkpoints and quizzes lacked explicit question grouping and reliable result
  announcements. They now use `fieldset`/`legend` and polite status regions.
- Charts, rings, and heatmaps conveyed meaning visually. Core charts now include
  text summaries and dashboard visualizations expose equivalent progress/detail.
- Playground sliders did not expose full names, units, and current values. Each
  control now has a visible label, description, and `aria-valuetext`.
- Sandbox selection and positions/history controls lacked complete keyboard
  patterns. Symbol results implement listbox navigation and view switching uses
  arrow-key tabs.
- Authentication errors were visually placed but not focused or associated as a
  submission summary. Shared focused alerts now announce failures.
- Legacy microcopy opacity produced sub-AA contrast, and the mobile home shell
  overflowed at 320px. The semantic text ramp and narrow-shell rules correct both.

## Visual specification

- Plus Jakarta Sans is the display face, Inter is the interface/body face, and
  JetBrains Mono is reserved for code and numeric data.
- Light neutral canvases and high-contrast white cards carry most content. Dark
  surfaces are reserved for the home hero, final call to action, editors, and
  other feature moments.
- Green remains the brand/action color. Blue, amber, and rust are limited to
  informational, warning, and error/data meaning. No status relies on color alone.
- Radius, elevation, focus, spacing, motion, and semantic data colors come from
  `src/styles/tokens.css`; route styling should use CSS modules as it migrates.
- Motion supplies feedback and spatial continuity. It never gates content and
  must have a reduced-motion equivalent.

## Remaining migration discipline

The compatibility aliases in `src/styles/tokens.css` intentionally keep secondary
routes stable. When a core route is moved to a CSS module, remove only the legacy
selectors proven unused by that route. Do not delete the compatibility layer until
all core routes pass the automated and manual release matrix.
