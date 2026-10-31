# Investor claim ledger

**Opened:** October 9, 2026. This is a register of what StrikeLab can substantiate, not a pitch. Review before every investor, YC, school, or press use. A claim can move to “verified live” only with dated deployment evidence. A code path or demo fixture proves implementation, not real usage.

## Status key

- **Code verified:** implementation exists in the repository; local quality gates and a deployed journey may still be pending.
- **Live verified:** checked on the deployed production environment with a date and evidence link.
- **Customer observed:** real, dated customer or cohort evidence with numerator/denominator and permission where needed.
- **Commercial verified:** reconciled signed commitment, invoice, Stripe receipt, or bank record. State which one.
- **Unknown:** evidence has not been collected or is inaccessible. Do not convert unknown to zero.
- **Hypothesis:** a proposed price, target, forecast, or positioning that has not been validated.

## Current claims

| ID | Draft claim | Status on Oct 9 | Repository evidence | Evidence required before stronger wording | Owner / review |
|---|---|---|---|---|---|
| C01 | StrikeLab has a six-week Quant Foundations cohort template and launch flow. | Code verified | [`src/lib/cohorts/template.ts`](../../src/lib/cohorts/template.ts), [`src/app/api/classes/[id]/launch/route.ts`](../../src/app/api/classes/%5Bid%5D/launch/route.ts) | Live leader launch on production, migrations `0012` and `0017`, test account record | Product owner / before demo |
| C02 | Students can save work, complete assigned lessons, and submit a capstone. | Code verified | [`src/lib/submissions/sync.ts`](../../src/lib/submissions/sync.ts), [`src/app/api/capstone/[classId]/route.ts`](../../src/app/api/capstone/%5BclassId%5D/route.ts), migrations `0016`, `0018`, `0019` | Production cross-device student rehearsal and access check | Product owner / before pilot |
| C03 | Teachers can see a server-derived cohort scorecard. | Code verified | [`src/lib/cohorts/loadScorecard.ts`](../../src/lib/cohorts/loadScorecard.ts), [`src/lib/cohorts/metrics.ts`](../../src/lib/cohorts/metrics.ts) | Deployed teacher rehearsal, SQL/app reconciliation, migration check | Metrics owner / before quoting outcome |
| C04 | The public offer is a free six-week pilot, then $199 per club or $499 per instructor annually. | Code verified as displayed offer; price acceptance is a hypothesis | [`src/app/pricing/page.tsx`](../../src/app/pricing/page.tsx), [`src/app/clubs/page.tsx`](../../src/app/clubs/page.tsx) | Buyer conversation at stated price and commercial record | Customer owner / monthly |
| C05 | Real leaders have launched pilot cohorts. | Unknown | CRM contains `EXAMPLE` rows only; baseline is blank | Named leader, launch date, production cohort ID in restricted record | Customer owner / weekly |
| C06 | Students activate, persist to week four, or complete capstones at a stated rate. | Unknown | Metrics code exists; no verified production export in repo | Cohort export, dates, mature windows, numerator/denominator, definition version | Metrics owner / weekly |
| C07 | Buyers will repeat or refer StrikeLab. | Unknown | No real end-of-pilot interview recorded | Dated leader answer and actual qualified introduction | Customer owner / after each pilot |
| C08 | StrikeLab has paying organizations or recurring revenue. | Unknown | Stripe plumbing exists; production baseline and receipts are absent here | Stripe/invoice/bank reconciliation, payer and period; separate cash from commitment | Finance owner / monthly |
| C09 | StrikeLab meets a school or district's privacy requirements. | Unknown | Privacy copy and RLS code exist; production and agreement checks are open | School-specific review, signed terms where required, live access/deletion checks | Trust owner / before school contract |
| C10 | The initial club segment is a repeatable, profitable acquisition channel. | Hypothesis | Offer and outreach instruments exist, no real funnel or cost records | Multiple independent cohorts, contact-to-payment funnel, support/cost ledger | Founders / five-pilot gate |

## How to add a metric or quote

Add a row with: exact wording; source query or interview document; as-of date; cohort/segment; numerator and denominator; inclusion/exclusion rules; owner; permission to share; last review date. Store raw student records and personally identifiable contact data in a restricted system, not this repo. A public summary may link to a restricted evidence ID without exposing the underlying record.

## Publication check

Before sending a deck or application, read every sentence against this ledger. Mark a claim as built, live, observed, paid, or forecast in the actual copy. Remove a rate if its denominator, measurement window, or migration status is unknown. If the claim changed since the last deck, update the deck and this ledger together.
