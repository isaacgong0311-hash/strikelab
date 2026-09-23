-- Stripe doesn't guarantee webhook delivery order (money-paths audit,
-- Sprint 1.2). Record the `created` time of the event that last wrote each
-- subscription row, so an older customer.subscription.updated arriving late
-- can't overwrite newer status/plan. The webhook updates with
-- `where last_event_created is null or last_event_created <= <event.created>`
-- in the same statement, so the check and the write are atomic.

alter table public.subscriptions
  add column if not exists last_event_created bigint;
