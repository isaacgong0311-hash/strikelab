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

## Weekly (30 minutes, same slot)
Contacts, replies, calls, yeses, payer split (`npm run pipeline`); the single biggest bottleneck; one decision, logged in `docs/gtm/decision-log.md`.
