-- Atomic RPCs for opening/closing sandbox positions.
--
-- Why: src/lib/sandbox/db.ts previously read sandbox_accounts.cash_balance,
-- computed a new balance in application code, then wrote it back in a
-- separate statement (a classic read-then-write race). Two trades submitted
-- close together (double-click, two tabs) could both read the same stale
-- balance, both pass the "sufficient funds" check, and both write — letting
-- a user spend more simulated cash than they have, or double-close the same
-- position and get credited twice. Low real-world severity (simulated
-- money), but a genuine correctness bug worth closing.
--
-- Fix: move the balance mutation into a single Postgres statement per
-- operation (UPDATE ... WHERE cash_balance >= cost / WHERE closed_at IS
-- NULL, both RETURNING the new state), wrapped in a plpgsql function so the
-- position row, trade log row, and cash balance all commit in one
-- transaction. The P&L math itself stays in TypeScript (src/lib/pricing.ts,
-- src/lib/sandbox/db.ts) as the single source of truth — these functions
-- only take already-computed numbers and apply them atomically, so there's
-- no duplicated pricing logic to drift out of sync in SQL.
--
-- Deliberately SECURITY INVOKER (the default — not specified below): these
-- functions run with the calling user's own permissions, so the existing
-- RLS policies from 0004_sandbox.sql ("owner can insert/update own rows")
-- still apply and still do the real access control. p_user_id is compared
-- against auth.uid() as a belt-and-suspenders check, not the primary guard.
--
-- Run this in the Supabase SQL Editor after 0001-0006, same as every prior
-- migration in this directory. src/lib/sandbox/db.ts calls these by name
-- (supabase.rpc("sandbox_open_position" / "sandbox_close_position")) — the
-- app will error on every trade until this has been run.

create or replace function public.sandbox_open_position(
  p_user_id    uuid,
  p_symbol     text,
  p_asset_type text,
  p_side       text,
  p_qty        integer,
  p_fill_price numeric,
  p_cost       numeric,
  p_strike     numeric default null,
  p_expiry     date default null
) returns table (position_id uuid, cash_balance numeric)
language plpgsql
as $$
declare
  v_position_id uuid;
  v_new_balance numeric;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'not_authorized';
  end if;

  -- Lazily create the account row (mirrors the old getOrCreateAccount()),
  -- harmless if it already exists.
  insert into public.sandbox_accounts (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  -- The atomic part: read-and-check-and-debit in one statement. If another
  -- concurrent request already spent this user down below p_cost, this
  -- WHERE clause matches zero rows and v_new_balance stays null below —
  -- there's no window between "check balance" and "write balance" for a
  -- second request to land in.
  update public.sandbox_accounts
  set cash_balance = cash_balance - p_cost,
      updated_at = now()
  where user_id = p_user_id
    and cash_balance >= p_cost
  returning cash_balance into v_new_balance;

  if v_new_balance is null then
    raise exception 'insufficient_funds';
  end if;

  insert into public.sandbox_positions
    (user_id, symbol, asset_type, side, qty, avg_cost, strike, expiry)
  values
    (p_user_id, p_symbol, p_asset_type, p_side, p_qty, p_fill_price, p_strike, p_expiry)
  returning id into v_position_id;

  insert into public.sandbox_trades
    (user_id, symbol, asset_type, direction, qty, fill_price, strike, expiry)
  values
    (p_user_id, p_symbol, p_asset_type,
     case when p_side = 'long' then 'buy' else 'sell' end,
     p_qty, p_fill_price, p_strike, p_expiry);

  return query select v_position_id, v_new_balance;
end;
$$;

grant execute on function public.sandbox_open_position(
  uuid, text, text, text, integer, numeric, numeric, numeric, date
) to authenticated;

create or replace function public.sandbox_close_position(
  p_user_id      uuid,
  p_position_id  uuid,
  p_close_price  numeric,
  p_realized_pnl numeric,
  p_cash_delta   numeric
) returns table (cash_balance numeric)
language plpgsql
as $$
declare
  v_position public.sandbox_positions%rowtype;
  v_new_balance numeric;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'not_authorized';
  end if;

  -- WHERE closed_at IS NULL is the atomic guard against double-close: if
  -- two concurrent requests race to close the same position, only the first
  -- UPDATE actually matches a row. The second matches zero rows, so
  -- `if not found` below fires for it instead of crediting cash twice.
  update public.sandbox_positions
  set closed_at = now(),
      close_price = p_close_price,
      realized_pnl = p_realized_pnl
  where id = p_position_id
    and user_id = p_user_id
    and closed_at is null
  returning * into v_position;

  if not found then
    raise exception 'position_not_found';
  end if;

  insert into public.sandbox_trades
    (user_id, symbol, asset_type, direction, qty, fill_price, strike, expiry)
  values
    (p_user_id, v_position.symbol, v_position.asset_type,
     case when v_position.side = 'long' then 'sell' else 'buy' end,
     v_position.qty, p_close_price, v_position.strike, v_position.expiry);

  update public.sandbox_accounts
  set cash_balance = cash_balance + p_cash_delta,
      updated_at = now()
  where user_id = p_user_id
  returning cash_balance into v_new_balance;

  return query select v_new_balance;
end;
$$;

grant execute on function public.sandbox_close_position(
  uuid, uuid, numeric, numeric, numeric
) to authenticated;
