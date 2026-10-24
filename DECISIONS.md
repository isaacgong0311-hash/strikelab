# Decisions requiring founder or account access

## D1 — Which offer is the YC application describing?

**Observed October 23, 2026:** The founder's brief says clubs are $199/year and schools $499/year per instructor after a free six-week pilot. Current production pages and `origin/master` instead make clubs free and sell a proposed $349 parent-facing Intensive. The season starts November 30, after the Winter 2027 application deadline.

**Recommendation:** Describe the **currently deployed free club/season product** truthfully, and state that the Intensive is a waitlist and an unproven revenue experiment. Mention the former club prices only as a tested or abandoned hypothesis if there is evidence for that history. Choose one intended buyer and update the site and application together before submission. Do not imply booked Intensive revenue or paid clubs.

**Founder decision:** Confirm whether the free-club/parent-Intensive pivot is intentional, or direct a return to the paid club/school offer. The code work in this branch follows the current deployed product while this remains open.

## D2 — Confirm production data and migration state

**Observed October 23, 2026:** The connected Supabase account lists one inactive project (`supabase-byzantine-mirror`), which is not established as the database behind strikelab.dev. Production user and completion counts therefore remain unknown. No data was changed or exported.

**Recommendation:** Connect or identify the actual production Supabase project, run `scripts/metrics/check-migrations.sql` and the aggregate query added in this work, and save a dated, private export. Verify lesson and season tables before using their counts. Keep student identities out of the application and repo. If the app uses another database, document that source instead.

**Founder action:** Supply production-project access or run the read-only queries in the production SQL editor. Separately confirm any Stripe receipts or Intensive payments in Stripe; database subscription status alone is not revenue.

## D3 — Get external usage evidence

**Observed October 23, 2026:** No pilot club, real student work sample, or retention cohort could be verified from available sources.

**Recommendation:** Before the application, recruit one reachable leader, schedule a real meeting, watch students complete a first task, and record enrollment, activation, support burden, and a dated leader follow-up. Ask permission before sharing student work or quotations. A small honest cohort is stronger than a larger synthetic demo.

**Founder action:** Outreach, school approval, and consent require the founder's relationships and accounts. This branch makes the product easier to experience but cannot manufacture that evidence.
