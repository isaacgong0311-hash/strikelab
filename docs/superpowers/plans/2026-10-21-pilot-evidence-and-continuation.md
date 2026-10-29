# Pilot Evidence and Continuation Implementation Plan

**Goal:** Connect the starting-point check to continued practice and make existing pilot participation evidence easier for leaders to inspect and export.

**Architecture:** Reuse the existing analytics wrapper and server-derived cohort metrics. Keep only a validated learning destination in browser storage; never store diagnostic answers or claim that participation proves learning gains. No new database schema, paid provider, or authentication flow.

**Tech stack:** Next.js 16.2, React 19, TypeScript, Vitest, Playwright, CSS modules.

## Tasks

- [x] Add a versioned, allowlisted recommendation store in `src/lib/learningNextStep.ts`. Support blocked storage, malformed data, cross-tab updates, clearing, and advancing to the next session after actual completion. Test the storage and transition rules.
- [x] Add starting-point lifecycle events to `src/lib/analytics.ts`. Track a run start, completed check, recommended-lesson click, and actual recommended lesson/session starts separately; analytics failures must not block learning. Do not send answers, scores, names, or persistent run IDs.
- [x] Refactor `src/app/start/StartingPoint.tsx` for readable feedback, focus, retry, and saved-next-step behavior. Add a small continuation card on the homepage. Update short-session completion and lesson start handlers to maintain the next step without awarding extra progress.
- [x] Add `src/lib/cohorts/evidence.ts` to export only aggregate counts and measurement windows from `CohortMetrics`, with explicit sample-data labels, pending and preliminary states, and no student or class identifiers. Add tests covering empty, immature, mature, and sample cohorts.
- [x] Extend `CohortScorecard.tsx` with a private student completion table, measurement definitions, and an aggregate summary download beside the existing roster CSV. Label sample exports in the demo.
- [x] Update privacy copy and metric definitions to describe browser storage, lifecycle events, and export limits accurately.
- [x] Run targeted Vitest, ESLint, TypeScript, and browser journeys if local port permissions permit. Report blocked checks precisely; do not imply deployment or customer validation.

## Acceptance criteria

- A returning learner sees their suggested next step and can clear it. Storage unavailability never blocks the check or lessons.
- Session continuation advances only after completing the saved session, and finishing the last session directs to its full lesson; existing curriculum completion remains authoritative.
- The aggregate export retains numerator, denominator, date windows, pending activation, and provisional retention states. Future weeks export as unmeasured, never zero.
- The export has no roster entries, class names, emails, student IDs, or capstone content. Small cohorts still require discretion before sharing aggregate numbers.
- Existing uncommitted edits outside this scope remain untouched.

## Validation results

- 117 tests pass across starting-point recommendations, bookmark storage and transitions, event payloads, aggregate evidence, existing cohort metrics, and session content/engine behavior.
- Targeted ESLint and TypeScript checks pass.
- The existing teacher print stylesheet failed CSS Modules purity validation during a Webpack build. Its hide rule is now scoped to a body containing the local print-card class; isolated CSS Modules processing passes. Other pages no longer inherit an unconditional hide-all print rule.
- Browser tests were attempted but the dev server cannot listen in this environment (`listen EPERM`). New journeys cover saved-step persistence/clearing, blocked storage, sample summary download, and advancing the saved step after a real session. Their execution remains unverified.
- The production build cannot fetch Google Fonts (`ENOTFOUND fonts.googleapis.com`). Full build success remains unverified; no font substitution or deployment was performed.
