# YC evidence snapshot

Use this when writing a dated application answer or investor update. Counts alone are not proof of learning quality or demand.

1. Confirm the database belongs to the deployment at `strikelab.dev`. The connected account available on October 23, 2026 listed only an inactive project; its counts must not be used as production traction.
2. Run `scripts/metrics/check-migrations.sql` in the **production** SQL editor. If any migration required by `scripts/metrics/yc-evidence.sql` is missing, mark dependent metrics **unavailable**. Do not silently treat a missing table as zero.
3. Run `scripts/metrics/yc-evidence.sql` read-only. Save the UTC timestamp, project reference, query commit, and aggregate output in a restricted folder. Do not commit student data or a raw production export.
4. Use `scripts/metrics/weekly-scorecard.sql` for cohort-level activation and retention. Its denominator is enrolled students in each launched cohort. Do not calculate retention from the cumulative aggregate query.
5. Check Stripe or invoices separately for money actually collected. A waitlist email, signup, created club, or active subscription row is not revenue. Count a pilot only when a real leader and meeting date are confirmed.
6. For any quoted student work or leader words, record consent, source, date, and context in a private claim ledger before including them in YC material.

**Known coverage limits:** Anonymous lesson progress lives on the device and is not included in database counts. Some older lesson completions have no trustworthy timestamp. Signed-out progress synced on sign-in can acquire the sync date. The snapshot counts unique accounts for each activity separately and does not assert that every registered user visited a lesson or that every waitlist entry is a buyer.

**Application wording while access is unavailable:** “We have about 500 site visits, but have not yet verified registered-user or completion counts in the production database. We have no pilot clubs or revenue.” Replace only with dated production evidence.
