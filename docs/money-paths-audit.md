# Money & quota paths audit

Sprint 0.2 deliverable (see the Runway to 500 plan, Phase 0). Every code path
that mutates a ledger, a quota counter, or a paid entitlement, and whether
it's guarded against concurrent/duplicate requests by a DB constraint, an
atomic statement, or nothing.

| Path | Table(s) | Guard | Verdict |
|---|---|---|---|
| AI action quota — `consumeAiQuota()` ([src/lib/ai/quota.ts](../src/lib/ai/quota.ts)), used by `chat`, `explain`, `review`, `practice`, `sandbox-insight`, `sandbox-trade-idea` | `public.ai_usage` | `consume_ai_quota()` RPC — single `INSERT ... ON CONFLICT ... WHERE ... RETURNING` ([0008](../supabase/migrations/0008_separate_ai_quota_from_hints.sql)) | **Safe.** Check-and-increment is one statement; a losing concurrent request gets zero rows back, not a stale read. |
| Hint quota — [src/app/api/ai/hint/route.ts](../src/app/api/ai/hint/route.ts) | `public.hint_usage` | `consume_hint_quota()` RPC, same pattern | **Safe.** Same atomic upsert-with-cap shape as AI quota; separated from it in 0008 specifically because the two caps used to share one counter. |
| Sandbox trade open — [src/lib/sandbox/db.ts](../src/lib/sandbox/db.ts) `executeTrade()` → `execute/route.ts` | `sandbox_accounts`, `sandbox_positions`, `sandbox_trades` | `sandbox_open_position()` RPC — single `UPDATE ... WHERE cash_balance >= p_cost RETURNING` ([0007](../supabase/migrations/0007_sandbox_atomic_trades.sql)) | **Safe.** A losing concurrent request can't observe a stale balance — the WHERE clause is the check. |
| Sandbox trade close — `close/route.ts` | `sandbox_positions`, `sandbox_accounts`, `sandbox_trades` | `sandbox_close_position()` RPC — `UPDATE ... WHERE closed_at IS NULL RETURNING` | **Safe.** Double-close (double-click, two tabs) matches zero rows on the second call and raises `position_not_found` instead of crediting cash twice. |
| Certificate issuance — [src/app/api/certificates/issue/route.ts](../src/app/api/certificates/issue/route.ts) | `public.certificates` | App-level check-then-insert (`SELECT existing` → `INSERT` if none), backed by a `UNIQUE (user_id, track_id)` constraint ([0005](../supabase/migrations/0005_certificates.sql)) | **Data is safe, UX isn't.** The unique constraint means a genuine double-submit can never create two certificates — but the route doesn't catch the resulting unique-violation (Postgres `23505`), so the *losing* concurrent request surfaces as a generic 500 instead of returning the same `id` the way a sequential retry would. Low frequency (needs two near-simultaneous submits), but a one-line fix. **→ carried into Phase 1 as Sprint 1.1b.** |
| Stripe subscription state — [src/app/api/stripe/webhook/route.ts](../src/app/api/stripe/webhook/route.ts) `linkCustomerToUser()` / `updateByCustomerId()` | `public.subscriptions` | `upsert(onConflict: user_id)` / `update().eq("stripe_customer_id", ...)` — no event-id ledger, no ordering check | **Naturally idempotent, but not ordering-safe.** Replaying the exact same event twice is harmless (same fields, same result). The real gap: Stripe does not guarantee delivery order, so an older `customer.subscription.updated` event arriving *after* a newer one would silently overwrite current status/plan with stale data. No `event.created` / subscription version check exists to reject a stale event. **→ Phase 1, Sprint 1.2.** |
| Stripe checkout → account link | `public.subscriptions` | `upsert(onConflict: user_id)` | **Safe.** Upsert by primary key; replay writes the same row. |

## Summary

Two of the three concurrency bugs a solo dev would expect to find here were
**already fixed** before this audit — migrations 0007 and 0008 both closed a
read-then-write race with the same atomic-SQL pattern, and both are covered
by the reasoning in their own migration comments. That's the right instinct
and it shows up in the code.

What's left, in priority order:

1. **Stripe webhook event ordering** (Sprint 1.2) — the one path here with a
   real, if narrow, correctness gap. Out-of-order delivery is rare but not
   exotic (Stripe retries on any non-2xx, and retries don't preserve order
   relative to new events).
2. **Certificate issue race UX** (Sprint 1.1b) — data integrity is already
   guaranteed by the unique constraint; this is a graceful-degradation fix,
   not a data-safety one.
3. No concurrency *tests* exist yet for any of the atomic RPCs above — the
   SQL is correct by inspection, but nothing in CI would catch a regression
   if a future migration touched these functions. Sprint 1.1 in the plan adds
   one.
