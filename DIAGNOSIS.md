# StrikeLab under YC partner scrutiny

**As of October 23, 2026.** This diagnosis is based on the current `origin/master` product, the public pages at strikelab.dev, the schema and routes, and the founder's stated baseline. The older local `feat/perf-budget` checkout has uncommitted work and a different, paid-club pitch; it is preserved separately. A deployed page proves a flow exists, not that a student used it. The public site shows no verified student outcome or paying customer, and I could not verify production counts from the connected Supabase account.

## What this product is

StrikeLab teaches high-school students quant finance through free investing, options, and quant-investing lessons. The first few investing lessons have short sessions; later options and quant lessons have exercises that run real Python through Pyodide in a worker. A Market Lab gives immediate model experiments. The newer product tries to turn learning into a repeat loop: prepare with lessons, enter a time-limited season challenge, submit code and an explanation, get a server score, then show a handle-only rank and a verified record. A club leader can invite students, see a chapter board and use a six-week plan and scorecard. The current site makes clubs free and proposes a $349 parent-paid Intensive; that conflicts with the $199/$499 club-and-school model in the request.

The credible wedge is **students build and defend models, rather than watch finance explanations or pick stocks in a simulator**. The code and server scoring can make that tangible. The leader's job is to give students a reason to return weekly and see who needs help. This wedge is still a hypothesis until students come back and leaders choose to run it.

## Ranked reasons a partner might pass

| Rank | Risk | Evidence and why this rank matters |
|---|---|---|
| 1 | **No demonstrated demand or learning outcome.** | The founder reports about 500 visits, unknown users/completions, no pilot clubs, and no revenue. The repo has sample club scorecards and capstones, correctly labeled as examples, but no dated production baseline or student work shared with consent. A polished UI cannot substitute for people using it. One real cohort with a denominator, repeat activity, work samples, and a leader's decision would change the application more than any feature. |
| 2 | **The promised return loop is inaccessible on a cold visit.** | `/seasons` promises timed, individually scored work but currently says challenges will appear when scheduled; the season begins November 30, after the application deadline. Its primary action asks for an account before a visitor can try the distinctive challenge. The first lesson and Market Lab work without signup, but neither shows how a season submission differs from a course or video. A visitor can leave before understanding the wedge. |
| 3 | **The buyer and revenue story contradicts the live product.** | The request describes $199/year clubs and $499/year per school instructor after a pilot. Current `/pricing`, `/clubs`, and `/pilot` say clubs and leaders are free, with an optional $349 parent-facing Intensive waitlist. This may be a deliberate pivot, but the site and YC answer must describe one actual offer. No code can choose the buyer or prove willingness to pay. |
| 4 | **Evidence plumbing exists, but the baseline is unverified and incomplete for the new loop.** | SQL and timestamped lesson/cohort tables exist, but the production migration state and database are unverified. Anonymous sessions save locally; Vercel custom events are documented as unavailable on the free plan. Existing baseline SQL predates seasons and the Intensive. Without a dated aggregate export, even honest counts stay “unknown,” and funnel claims risk mixing local events, sample data, and actual students. |
| 5 | **One advertised Python practice path can give false feedback.** | `PracticeProblem` calls the asynchronous runtime without awaiting either run, so it can show “All tests passed” before Python or tests fail. This is narrower than the demand problem, but false learning feedback directly damages the product's core claim. The 23 lesson routes and Pyodide runtime need a full post-change regression check. |

The deeper disagreement with the original framing: this is no longer simply a paid six-week club curriculum. Current master presents a free competition and verified-work loop, with a different possible buyer. The biggest application gain is actual use, not more curriculum, animation, or a price table.

## Plan, in order

1. **Make the current evidence boundary explicit (ranks 1, 3, 4).** Keep this diagnosis and a decision log in the repo. Add a read-only aggregate query that counts real accounts, timestamped learning, club adoption, and season activity with clear denominators and no student-identifying output. Run it only against the confirmed production project; record unknown where access is absent. This serves the application by making an honest baseline possible, but does not create traction.
2. **Let a cold visitor try the distinctive work (rank 2).** Add a no-account practice challenge on `/seasons` using an existing season template and the existing Pyodide runtime. Make it clear that it is practice: no timer, official score, rank, account, or saved submission. Link it from the student entry. This serves product understanding and tests whether a visitor will do the model-building work; it does not claim a live season has started.
3. **Repair false Python feedback (rank 5).** Await both code and test execution, surface errors, and prevent a stale run from showing a pass. Verify the practice challenge and all lesson pages, and execute representative Python exercises. Build after each code change and commit each slice with the diagnosis rank in the message.

## Deliberately outside this pre-deadline slice

- No new lessons, markets, social features, or large design refresh: there are already 23 lessons and enough surface area to learn whether anyone cares.
- No public traction counter, student testimonials, or case study without verified production data, consent, as-of date, and denominators.
- No automatic switch back to paid clubs or forward to the Intensive as the sole model. The founder must reconcile the offer; changing copy alone would hide the decision.
- No claim that a practice pass is an official season score. Official scores remain server-side, tied to authenticated timed submissions.
- No production schema mutation or migration deployment without identifying the live project and checking its migration state.

## What success would prove

Before November 2, a cold visitor should understand the build-and-prove loop and run real Python without creating an account. The founder should be able to insert actual production counts into the application with source, as-of date, and definitions, or say unknown. After launch, only real students returning for weekly challenges and a leader choosing to repeat or pay can validate the company thesis.

## Implementation and verification

- `bdf8c1e` adds the decision log, aggregate evidence query, and a database test. The query passed against the repository's migration-backed test schema. **No production count was retrieved.**
- `648490e` and `f9f4d9d` add a playable, no-account practice challenge, put it in the student entry path, and label its limits. A browser test failed the unfinished starter and passed a correct solution using real Pyodide.
- `4b4b88e` fixes the asynchronous generated-practice check so success waits for Python and the test. A unit test verifies an asynchronous test failure propagates instead of reporting a pass.
- After merging the October 23 Market Lab release from `master`, the final local build generated all 23 lesson routes. A Pyodide test executed all 14 coding starters and parsed their check programs; 9 investing lessons use sessions and knowledge checks instead of Python exercises. The full unit/database suite passed (545 tests in 98 files), as did 22 focused browser tests for Market Lab, starting point, sessions, Python recovery, and practice. These are local checks, not production usage or a school-network rehearsal.
