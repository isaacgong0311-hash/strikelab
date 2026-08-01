-- StrikeLab paper-trading sandbox: persistent virtual account + positions + trades.
-- Run this in the Supabase SQL Editor (or via `supabase db push`), after 0001_init.sql.

-- ─── Accounts (one row per user, starting cash balance) ────────────────────────
create table if not exists public.sandbox_accounts (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  cash_balance numeric(14,2) not null default 100000,
  updated_at   timestamptz not null default now()
);

alter table public.sandbox_accounts enable row level security;

drop policy if exists "Sandbox account viewable by owner" on public.sandbox_accounts;
create policy "Sandbox account viewable by owner"
  on public.sandbox_accounts for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own sandbox account" on public.sandbox_accounts;
create policy "Users insert own sandbox account"
  on public.sandbox_accounts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own sandbox account" on public.sandbox_accounts;
create policy "Users update own sandbox account"
  on public.sandbox_accounts for update
  using (auth.uid() = user_id);

-- ─── Positions (open + closed, one row per lot) ─────────────────────────────────
create table if not exists public.sandbox_positions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  symbol       text not null,
  asset_type   text not null check (asset_type in ('stock','call','put')),
  side         text not null check (side in ('long','short')),
  qty          integer not null check (qty > 0),
  avg_cost     numeric(12,4) not null,
  strike       numeric(10,2),
  expiry       date,
  opened_at    timestamptz not null default now(),
  closed_at    timestamptz,
  close_price  numeric(12,4),
  realized_pnl numeric(14,4)
);

create index if not exists sandbox_positions_user_open_idx
  on public.sandbox_positions (user_id, closed_at);

alter table public.sandbox_positions enable row level security;

drop policy if exists "Positions viewable by owner" on public.sandbox_positions;
create policy "Positions viewable by owner"
  on public.sandbox_positions for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own positions" on public.sandbox_positions;
create policy "Users insert own positions"
  on public.sandbox_positions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own positions" on public.sandbox_positions;
create policy "Users update own positions"
  on public.sandbox_positions for update
  using (auth.uid() = user_id);

-- ─── Trades (append-only fill log) ──────────────────────────────────────────────
create table if not exists public.sandbox_trades (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  symbol      text not null,
  asset_type  text not null check (asset_type in ('stock','call','put')),
  direction   text not null check (direction in ('buy','sell')),
  qty         integer not null,
  fill_price  numeric(12,4) not null,
  strike      numeric(10,2),
  expiry      date,
  executed_at timestamptz not null default now()
);

create index if not exists sandbox_trades_user_idx on public.sandbox_trades (user_id, executed_at desc);

alter table public.sandbox_trades enable row level security;

drop policy if exists "Trades viewable by owner" on public.sandbox_trades;
create policy "Trades viewable by owner"
  on public.sandbox_trades for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own trades" on public.sandbox_trades;
create policy "Users insert own trades"
  on public.sandbox_trades for insert
  with check (auth.uid() = user_id);
