# StrikeLab: the plan on one page

**Updated:** 2026-10-16. **This page wins** over the older plans in `docs/superpowers/plans/` on what to do next. They still hold the detail: metric definitions (`docs/gtm/metric-glossary.md`), proof thresholds (the company-design spec), the build queue (mega plan §7).

## Where we are
The product is built and tested. **No leader-run cohort has started, no leader has been interviewed, nobody has paid.** An independent review (`docs/superpowers/plans/2026-10-15-yc-worthiness-review.md`) concluded that is the problem, not the product.

## This week (in this order)
1. **Founder (Isaac):** read YC's FAQ and Early Decision page (T0.1); say who `hogri` is (T0.2); talk to parents (T0.4); log the first 15 real contacts in `docs/gtm/crm.csv` (T1.1, T1.3); ask one teacher at your own school to sponsor Cohort 0 (T1.4).
2. **Marketing lead:** `docs/gtm/marketing-lead-onboarding.md`. Message variants, 15 contacts, the money question on every call.
3. **Agent:** hardening before any live cohort (webhook, Python worker, AI tutor), then cutting what doesn't serve the six-week club story. Progress log: `docs/superpowers/plans/2026-10-15-agent-work-plan.md`.

## Next gate
**Gate A, Oct 31:** 40 real contacts logged, 8+ conversations held, YC facts known, hardening merged, a Cohort 0 yes or no. Full gate list and kill rules: `docs/superpowers/plans/2026-10-15-build-plan-to-yc.md` §2.

## Open decisions
| Decision | Owner | Needed by |
|---|---|---|
| Delete or hide the extras (sandbox, challenges, Electron, Capacitor, Spline) | Isaac | Before T4 starts |
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
