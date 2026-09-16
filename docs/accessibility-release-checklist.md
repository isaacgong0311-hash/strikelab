# Accessibility Release Checklist

Automated checks are necessary but not sufficient. Complete this matrix for each migrated core journey before release.

- Keyboard: complete every task without a pointer; confirm no traps, logical order, visible focus, Escape behavior, and focus restoration.
- VoiceOver + Safari: verify page titles, headings, landmarks, navigation, forms, quizzes, dialogs, dynamic outputs, chart summaries, and errors.
- Reflow: test at 320 CSS pixels and at 200% and 400% browser zoom. Only intentional code/data regions may scroll horizontally.
- Appearance: test default, enhanced contrast, forced colors, and common color-vision simulations. Confirm status never depends on color.
- Motion: test device Reduce Motion and the in-product override. Essential content must remain visible with JavaScript disabled.
- Input: verify 24px minimum targets, 44px preferred primary targets, keyboard alternatives to sliders/dragging, touch, and landscape orientation.
- Forms: verify visible labels, autocomplete, requirements, associated field errors, focused error summaries, loading names, and recovery copy.
- Regression: verify lesson completion, XP/streak updates, Pyodide runs, chart updates, paper trades, authentication, settings, and subscription routes.

Release requires no critical or serious axe findings on covered states and WCAG 2.2 AA conformance for the migrated route.
