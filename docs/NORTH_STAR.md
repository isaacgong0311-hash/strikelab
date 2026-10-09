# StrikeLab: the one page

If you only read one file in this repo, read this. Everything else is detail for one of the four boxes below.

## The end goal

**Students who submit a capstone in a club that someone else runs.** (The north star from `docs/superpowers/plans/2026-09-29-mega-plan.md` §3.) It can't be faked: it needs a real club leader, real students who show up, and a finished project.

The next proof point, in dates:

| Date | What has to be true |
|---|---|
| **Fri Oct 16** | At least one club leader has said yes to running the six-week lab, with a first meeting on or before Mon Nov 2 |
| **Mon Nov 2** | That club's first meeting happens and students are signed in |
| **About Dec 14** | The cohort finishes: students submit capstones, and the leader says whether they'd run it again |

If the Oct 16 line isn't met, nothing else in this repo matters yet, and the fallback is in the sprint plan (§6 and the work plan's Plan B).

## How real startups work (the loop)

1. **One goal** (above) and **one number** that says if it's working.
2. **Talk to the people who would use it, every day.** For you: club leaders and teachers. That is the job. It can't be delegated, and it can't be built around.
3. **Build only what those conversations ask for**, or what removes a reason someone said no.
4. **Check the number weekly** (Friday: `npm run pipeline`), and change course when it doesn't move.

The mistake in this repo so far is step 3 happening without step 2: lots of building, 0 conversations logged. That is why it feels like building without an end goal. The product is in good shape; the evidence about what leaders want does not exist yet.

## The number this month

**Leaders contacted, then calls held, then yeses** (`npm run pipeline`). As of Oct 8: 0, 0, 0. Target by Fri Oct 16: about 45 contacted, 8–10 calls, at least 1 locked pilot.

## Who does what

| You (founder) | Me (agent) |
|---|---|
| One outreach action a day, before anything else: a message, a classroom ask, a follow-up | Keep every PR mergeable, and the checks green |
| Log it in `docs/gtm/crm.csv` the same evening | Make each conversation cheaper: the leave-behind sheet, the demo, the allowlist, the smoke check |
| Click merge, and answer the decisions in `docs/superpowers/plans/2026-10-05-agent-work-plan.md` §7 | Build what a leader asks for, within a day, with a test |
| Create the Supabase project (`SUPABASE_SETUP.md`) | Report honestly on Fridays, including when the number is 0 |

## The rule for new work

**Before building anything, name the conversation it comes from, or the "no" it removes.** If there isn't one, it goes on the parked list in the work plan, not in the queue. The 20 plan files in `docs/superpowers/plans/` are the record of what was thought of; this page and the work plan say what is happening.

## Which file when

| You want to | Open |
|---|---|
| Know what to do today | This page, then `docs/gtm/outreach-kit.md` |
| See the numbers | `npm run pipeline` |
| Know what I'm doing and what I need from you | `docs/superpowers/plans/2026-10-05-agent-work-plan.md` |
| Run the Oct 16 sprint day by day | `docs/superpowers/plans/2026-09-30-sprint-to-go-no-go.md` |
| Log a decision | `docs/gtm/decision-log.md` |
