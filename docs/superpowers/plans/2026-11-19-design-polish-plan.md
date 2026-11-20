# Design polish work plan (Nov 19, 2026)

**Status:** [PR #85](https://github.com/isaacgong0311-hash/strikelab/pull/85) open (mono kickers, flatter step numeral) — not yet merged. Pre-launch rehearsal walkthrough done; migrations `0025`/`0026` applied to production; rehearsal data cleaned up.

**Why this plan exists:** Isaac said the site "still looks AI-generated." An audit against `refined-ui` (mono-only type, one accent color, flat hairline surfaces, no glow/gradient/glassmorphism, consistent radii) found the design system in `docs/ui-system.md` / `src/styles/tokens.css` is already fairly disciplined — single brand green, self-hosted fonts, no gradient text, no glow. The two real misses so far (kicker font, filled-circle step badges) are in #85. This plan is the backlog for finding the rest, one screen at a time, instead of guessing at a full redesign.

**Stop-doing list still holds** (`docs/PLAN.md`): no new tracks, no new strategy docs, no features before the scorecard names them. This plan is visual-only — same pages, same copy, same behavior, closer to the existing token system.

## How to work this list

1. Pick one row. Load it in the browser (local dev against prod data, read-only) at 1280px.
2. Check it against the `refined-ui` tells: mono-in-headline, bubbly radius (`rounded-2xl`+), glassmorphism/blur, glow/neon shadow, gradient text, emoji-as-UI, 3+ decorative accents, background noise, bouncy motion, centered-template silhouette.
3. Fix in the shared CSS module where possible (one change, many pages), not per-page overrides.
4. Screenshot before/after, open a small PR, ask before merging.

## Backlog

| # | Where | What to check | Why it's on the list |
|---|---|---|---|
| 1 | `/dashboard` (logged in) | The active-challenge hero is a dark-to-brand-green gradient banner card. Confirm it's a flat two-tone split, not a blurred gradient; check radius against the rest of the page's cards. | Dark gradient hero banners are a common generic-dashboard tell if the gradient is soft/blurred rather than a crisp block. |
| 2 | `/dashboard` achievements | Milestone badges (`⊗ First Strike`, `≡ Parity Pro`, etc.) — confirm they're plain glyphs on flat cards, not icons in tinted circles (the same tell #85 just fixed for step numbers). | Same filled-circle-icon pattern may repeat here. |
| 3 | `/lessons` track icons (`∑`, `∂`, `β`) | Confirm these render as plain mono glyphs, not icons inside colored circular badges. | Same pattern again — check once, fix once if needed. |
| 4 | `/record` | Already fixed functionally (migrations applied). Re-check visually once a real season attempt exists: season/capstone/certificate cards for nested box-in-box styling vs. hairline-separated sections. | Flagged in `docs/ui-system.md` as still using legacy `record.module.css` in places. |
| 5 | Market Lab experiments | Already looked closest to "designed" (mono numbers, single green line, no glow). Spot-check the other two experiments beyond Volatility for the same restraint. | Confirm the good pattern is consistent, not a one-off. |
| 6 | `/clubs`, `/pilot` | Same shared `marketing.module.css` as home/pricing, so #85's fixes apply automatically — confirm no page-specific CSS re-adds a circle badge or off-palette accent. | Lowest-risk check, shared component already fixed. |
| 7 | Pricing cards (`/pricing`) | Three-card grid with a highlighted "Clubs" card and a checkmark list — functional convention, not inherently wrong, but confirm the `cardAccent` highlight isn't a glow (`box-shadow: 0 0 0 1px brand, shadow-1` — check it reads as a crisp outline, not a halo). | Borderline case already in code; worth a visual check, not necessarily a fix. |
| 8 | Nav collapses behind a menu button below 1360px | Carried over from `docs/superpowers/plans/2026-11-16-remodel-work-plan.md` (R2, not started) — a 1280/1366px laptop shows no nav links at all. | Not an "AI slop" tell, but a real polish/usability gap found in the same pass; cheap to fix alongside this work. |
| 9 | Homepage length (~7,850px desktop / ~11,981px phone, ~14 sections) | Same carried-over R2 item. Not touched by #85. | Long scroll-everything homepages are their own "generic template" tell distinct from the color/shape checklist. |

## Explicitly not in scope here
- Lesson content length / "reach the first Run sooner" (R4) — functional pacing, not visual, tracked separately in the Nov 16 plan.
- Anything requiring a new component, new copy claim, or new integration — stop-doing list.
