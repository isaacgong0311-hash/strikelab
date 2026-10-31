# Market Lab and Learning Hub

Build a complete predict → experiment → explain learning loop around the existing pricing engine, with three guided missions and a free experiment mode. Students adjust scenarios, compare against a baseline, save six experiments locally, export their model assumptions and results, and resume their lab notebook. This is learning software; use model prices, not invented live quotes or trading recommendations.

Replace the decorative lesson path with a searchable learning workspace: track filters, progress, compact lesson cards, and direct links to labs and code. Put a functioning lab preview in a stronger homepage hero, with clear student and leader routes. Keep the six-week club offer and existing auth, curriculum, and progress data.

Implementation: pure model/scenario functions, a validated versioned notebook store, a shared accessible SVG chart with data-table equivalent, client lab workspace, redesigned lesson hub and homepage. No schema or provider changes. Test numerical invariants, mission checks, persistence validation and curriculum destinations; run lint, typechecking and browser journeys when available.

Deploy target: existing `strikelab` project, `prj_ALMhyx5SfPvenS9gMgE5rnZEwycc`, team `team_deCgtgnJVM6xbFeffPxmT4uF`. Connector project lookup returns 403 for team access; the requested authorization tool is not exposed. Scoped CLI project inspection also fails due network restrictions. Do not relink, create a duplicate project, or deploy stale Git contents.

## Release reconciliation

The working checkout is `feat/perf-budget` at `08efc9e`, behind production source. Current `origin/master` is `46fea7e` and includes seasons, records, Intensive pricing and Next.js 16.4.1. Shipping the old checkout wholesale would remove those features. The release was therefore prepared from current master under `/tmp/strikelab-release-20261021`, preserving the existing working tree and unrelated uncommitted changes.

Release PR: https://github.com/isaacgong0311-hash/strikelab/pull/69. Branch: `feat/market-lab-workspace-20261021`. The branch includes only the 43 scoped implementation/test files, not environment files or unrelated dirty work. The first Vercel preview build passed. CI's browser suite caught a chart SVG title hydration issue; it was fixed in `b3777c0` with a server-render regression test. The first CI run otherwise passed lint, unit tests and 79 browser journeys. Final checks and production release are tracked on the PR.

Local verification: 63 targeted tests, targeted lint, CSS Modules purity and release source typechecking pass. Local dependencies are from the older checkout and lack the current master Pyodide package, so the isolated release typecheck excludes only its pre-existing Pyodide test; remote CI installs production's unchanged dependencies and runs the full suite.

## Release checks passed

Full GitHub CI passed on `b3777c0`: lint, unit suite, browser journeys/accessibility, production build, and Lighthouse budgets. PR #69 merged into master as `307ad68ee2e8e76311eb67dc14475e40a7c9f9bd`. The new UI and Market Lab are now in the production branch; Vercel deployment readiness is checked separately. The local older feature branch and unrelated dirty work have not been overwritten by the master-based release.

Production deployment succeeded for merge `307ad68` (Vercel deployment `7qXPep2dbuzGTaskAJkqikujQYCv`, GitHub Vercel status success). Public routes: https://strikelab.dev/, https://strikelab.dev/lab, https://strikelab.dev/lessons. Final release includes 80 passing browser journeys; fixture-dependent journeys retain their existing skips.
