---
name: polish-ui
description: Take one row of the StrikeLab design-polish backlog (or one named screen), audit it against the token system and the "looks AI-generated" tells, fix it in shared CSS, and ship it with before/after screenshots. Use for "polish", "make it look less generic", "work the design backlog", or any visual cleanup.
---

# Polish one screen

Backlog: `docs/superpowers/plans/2026-11-19-design-polish-plan.md` (rows 4, 5, 6 open). Rules: `docs/ui-system.md`. Tokens: `src/styles/tokens.css`, `src/styles/foundation.css`.

This is visual only: same pages, same copy, same behavior. No new components, claims or integrations. During the Nov 27 to Dec 1 freeze, do not run this skill.

## The bar
Isaac wants an agency-grade look, not a template default, and he has said the site "still looks AI-generated". The audit target is restraint:
- Mono-only labels via `--sl-font-code`; headlines in `--sl-font-display`. No mono in headlines.
- One accent (the brand green). No second accent, no rainbow.
- Flat hairline surfaces. No glow, neon shadow, glassmorphism or blur, gradient text, noise.
- Consistent radii from the tokens (`--sl-radius-*`). No `rounded-2xl` bubbles.
- No icons in tinted circles, no emoji as UI, no bouncy motion, no centered-template silhouette on every section.
- Content renders without JavaScript or animation. Motion only enhances. Never hide content behind an observer.

## Steps
1. Pick the first open row (or the screen named). Mark it in the plan doc when done.
2. Start the dev server with `preview_start` (name `strikelab`). If styles look stale, stop it and `rm -rf .next/dev`, then restart.
3. Screenshot before at 1280px and 375px (`resize_window`). Also dark mode if the page supports it. Save under `docs/pr-screenshots/<branch>/`.
4. List every tell you find with the file and selector. Prefer fixing the shared CSS module so one change fixes many pages. Delete legacy `globals.css` selectors you replace; do not stack overrides.
5. Re-screenshot after. Confirm: console clean, focus rings still visible, targets at least 24px, contrast still passes, no layout shift.
6. `npx playwright test tests/accessibility` for the route you touched.
7. Use the `ship` skill. Put the before and after images in the PR body.

## Done when
The page passes every item in "The bar", the after screenshots are attached, a11y tests pass, and the plan row is checked off with a one-line note of what changed.
