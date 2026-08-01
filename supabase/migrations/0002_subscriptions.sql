-- StrikeLab subscriptions + AI hint usage tracking.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

-- ─── Subscriptions ──────────────────────────────────────────────────────────
-- Written only by the Stripe webhook (via the service-role client, which
-- bypasses RLS). Regular users can only read their own row — there is no
-- insert/update policy for the anon/authenticated roles, so a signed-in user
-- can never grant themselves Pro from the browser.
create table if not exists public.subscriptions (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id  text unique,
  stripe_subscription_id text,
  plan                text,
  status              text,
  current_period_end  timestamptz,
  updated_at          timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Subscriptions viewable by owner" on public.subscriptions;
create policy "Subscriptions viewable by owner"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ─── AI hint usage (daily cap) ──────────────────────────────────────────────
create table if not exists public.hint_usage (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  day        date not null default current_date,
  count      integer not null default 0
);

alter table public.hint_usage enable row level security;

drop policy if exists "Hint usage viewable by owner" on public.hint_usage;
create policy "Hint usage viewable by owner"
  on public.hint_usage for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own hint usage" on public.hint_usage;
create policy "Users insert own hint usage"
  on public.hint_usage for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own hint usage" on public.hint_usage;
create policy "Users update own hint usage"
  on public.hint_usage for update
  using (auth.uid() = user_id);
