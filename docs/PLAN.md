# StrikeLab: the plan on one page

**Updated:** 2026-10-16. **This page wins** over the older plans in `docs/superpowers/plans/` on what to do next. They still hold the detail: metric definitions (`docs/gtm/metric-glossary.md`), proof thresholds (the company-design spec), the build queue (mega plan §7).

## Where we are
**Direction (2026-10-16): StrikeLab is a proving ground.** Free four-week seasons of timed challenges, a defended capstone and a verified record; parents pay for a January intensive; sponsors fund seasons later; clubs are chapters. Spec: `docs/superpowers/specs/2026-10-16-strikelab-proving-ground-design.md`. Build plan for the Oct 31 milestone: `docs/superpowers/plans/2026-10-16-seasons-and-waitlist.md` (built: `/seasons`, timed attempts, handles, leaderboards, `/intensive` waitlist).

## This week (in this order)
1. **Founder:** apply migration `0024` (the one-file bundle), set `SEASON_PARAM_SECRET` in Vercel, start Chapter 1 at your school, email 3 finance people asking them to judge, read YC's and PearX's eligibility rules yourself.
2. **Teammate:** community posts and in-person visits pointing to `/seasons` (`docs/gtm/marketing-lead-onboarding.md`).
3. **Agent (Nov 29 milestone):** official server-side scoring, the record page, defense sign-off, a rehearsal season.

## Next gate
**Oct 31:** Chapter 1 started, 3 judges asked, eligibility rules read, seasons live on the site. **Nov 29:** 100 sign-ups and 5 chapters for Season 1 (Nov 30 to Dec 20). Kill rules are in the spec, section 7. Full gate list and kill rules: `docs/superpowers/plans/2026-10-15-build-plan-to-yc.md` §2.

## Open decisions
| Decision | Owner | Needed by |
|---|---|---|
| ~~Delete or hide the extras~~ **Decided 2026-10-16: delete.** Done: Electron, Capacitor, Spline, archive, sandbox, challenges, leaderboard, their AI routes | Isaac | Done |
| Which payer to test first: leader/school, parent, sponsor, partner org (default: all four, small) | Isaac | Oct 23 |
| Does YC take under-18s / Early Decision for high schoolers | Isaac (read the source) | Oct 31 |
| Role and arrangement with the new teammate (and a written contributor/IP agreement) | Isaac + teammate + a parent | Before they commit code or copy |

## Kill rules (decided in advance)
- 100 contacts, fewer than 3 cohorts: the club wedge is wrong; switch to the partner channel or parent-paid.
- Leaders like it but 0 of 10 would pay or find a payer: leaders are a channel, not a buyer; make the best-signal payer primary.
- Week-4 retention under 40% after one fix cycle: it is a product problem; stop scaling outreach and fix the named bottleneck.

## Stop-doing list
No new strategy documents. No new tracks. No new integrations. No features before the scorecard names them. No claim on a public page without a source.

## Working agreement with the agent (decided 2026-11-20; wins over the older "ask before merging" rule)

**Standing permission.** The agent ships the whole loop without stopping to ask: implement, test, commit, push, open a PR, wait for green CI (GitHub `test` plus the Vercel preview), merge to master, then smoke-test production. Never merge on red. The `ship` skill (`.claude/skills/ship/SKILL.md`) is that loop.

**Still ask first, every time:**
- Applying a database migration. Isaac does it by hand in Supabase. Code must tolerate it being unapplied, and the final message lists which to apply and in what order.
- Sending any message to a real person (email, Discord, DM, outreach, YC form).
- Money: Stripe live keys, prices, refunds, any paid service. Default to free tools.
- Production data writes or deletes, and running the rehearsal seed against anything but staging or local.
- Force-push, history rewrites, deleting branches that hold unmerged work.
- Minor or major dependency upgrades (patch bumps for a security advisory are fine).
- Anything in Isaac's own voice: YC personal answers, videos, outreach text sent under his name.
- Any public claim without a dated source (`docs/investor/claim-ledger.md`).

**Freeze Nov 27 to Dec 1.** Only fixes for something a real student or leader hit. No refactors, no polish, no dependency changes.

**Backlog the agent pulls from, in order.** When told "keep going" with no other direction, take the first unchecked item, ship it, then take the next.
1. [ ] Season 1 pre-flight on a staging build (`season-preflight` skill): invite, join, handle, timed attempt, official score, record page, defense sign-off. Fix what breaks. *(Nov 22: code blockers fixed in #94; production has the Season 1 rows. Still unverified end to end: a signed-in attempt through scoring and /record on staging.)*
2. [x] R4: reach the first Run sooner on lessons, and check coding on a phone *(#96, Nov 22)* (`docs/superpowers/plans/2026-11-16-remodel-work-plan.md`).
3. [x] Design polish rows 4, 5, 6 *(remodel v2: #93, #95, #96, #98, #99, #101)* (`polish-ui` skill, `docs/superpowers/plans/2026-11-19-design-polish-plan.md`).
4. [ ] Draft PR #79: rebase or close with a one-line reason.
5. [ ] Triage the `npm audit` findings beyond Next: which are production dependencies, which are dev-only.
6. [ ] Delete legacy `globals.css` selectors as pages move to tokens (R5). *(About 1,400 lines gone across #93, #96, #98, #100; settings, dashboard db-*, playground pg-* remain.)*

**Tools in the repo.** Skills: `ship`, `season-preflight`, `polish-ui`, `season-watch`, `fan-out`. Subagents (`.claude/agents/`): `qa-walkthrough`, `pr-reviewer`, `season-doctor`, `claims-auditor`.

## Weekly (30 minutes, same slot)
Contacts, replies, calls, yeses, payer split (`npm run pipeline`); the single biggest bottleneck; one decision, logged in `docs/gtm/decision-log.md`.
