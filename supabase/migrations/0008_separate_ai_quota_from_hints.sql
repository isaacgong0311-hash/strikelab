-- Separates the general AI-action daily budget from the hint daily cap, and
-- makes both atomic.
--
-- Bug: src/lib/ai/quota.ts's consumeAiQuota() (used by chat, explain,
-- review, practice, sandbox-insight, sandbox-trade-idea — cap 25/day) and
-- src/app/api/ai/hint/route.ts's consumeHintQuota() (cap 20/day) both read
-- and write the SAME public.hint_usage row per user, keyed only by user_id
-- with no feature column. Two independently-named, independently-capped
-- budgets were accidentally sharing one counter — heavy hint use eats into
-- (and can block) unrelated AI features and vice versa, in a way that
-- depends on which cap happens to get checked first. quota.ts's own comment
-- describes the general budget as covering "tutor chat, code review,
-- explain-this, practice generation" — hints were never meant to be part of
-- that pool.
--
-- Fix: a dedicated public.ai_usage table for the general budget (same shape
-- as hint_usage, which keeps its original hint-only job), plus one atomic
-- upsert-with-cap function per table so the check-then-increment can't race
-- either (same class of bug as 0007_sandbox_atomic_trades.sql — two
-- concurrent requests reading the same pre-increment count and both being
-- allowed through). The `RETURNING ... WHERE` combination below is what
-- makes it atomic: a request that would exceed the cap simply returns no
-- row (Postgres skips ON CONFLICT DO UPDATE rows whose WHERE is false and
-- excludes them from RETURNING), so "did I get incremented" and "am I under
-- the cap" collapse into a single statement instead of a separate
-- read-then-decide-then-write.
--
-- Run this in the Supabase SQL Editor after 0001-0007. src/lib/ai/quota.ts
-- and src/app/api/ai/hint/route.ts call these RPCs by name — both AI
-- surfaces will error until this has been run.

create table if not exists public.ai_usage (
  user_id uuid primary key references auth.users (id) on delete cascade,
  day     date not null default current_date,
  count   integer not null default 0
);

alter table public.ai_usage enable row level security;

drop policy if exists "AI usage viewable by owner" on public.ai_usage;
create policy "AI usage viewable by owner"
  on public.ai_usage for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own AI usage" on public.ai_usage;
create policy "Users insert own AI usage"
  on public.ai_usage for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own AI usage" on public.ai_usage;
create policy "Users update own AI usage"
  on public.ai_usage for update
  using (auth.uid() = user_id);

-- ─── Atomic "consume if under cap" for the general AI budget ──────────────
-- p_cost varies by feature (see AI_COST in src/lib/ai/quota.ts).
create or replace function public.consume_ai_quota(
  p_user_id uuid,
  p_cost    integer,
  p_cap     integer
) returns table (new_count integer, allowed boolean)
language plpgsql
as $$
declare
  v_count integer;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'not_authorized';
  end if;

  insert into public.ai_usage (user_id, day, count)
  values (p_user_id, current_date, p_cost)
  on conflict (user_id) do update
  set count = case when ai_usage.day <> current_date then p_cost else ai_usage.count + p_cost end,
      day = current_date
  where ai_usage.day <> current_date or ai_usage.count + p_cost <= p_cap
  returning ai_usage.count into v_count;

  if v_count is null then
    select au.count into v_count from public.ai_usage au where au.user_id = p_user_id;
    return query select v_count, false;
  else
    return query select v_count, true;
  end if;
end;
$$;

grant execute on function public.consume_ai_quota(uuid, integer, integer) to authenticated;

-- ─── Atomic "consume if under cap" for hints (always cost 1) ──────────────
create or replace function public.consume_hint_quota(
  p_user_id uuid,
  p_cap     integer
) returns table (new_count integer, allowed boolean)
language plpgsql
as $$
declare
  v_count integer;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'not_authorized';
  end if;

  insert into public.hint_usage (user_id, day, count)
  values (p_user_id, current_date, 1)
  on conflict (user_id) do update
  set count = case when hint_usage.day <> current_date then 1 else hint_usage.count + 1 end,
      day = current_date
  where hint_usage.day <> current_date or hint_usage.count < p_cap
  returning hint_usage.count into v_count;

  if v_count is null then
    select hu.count into v_count from public.hint_usage hu where hu.user_id = p_user_id;
    return query select v_count, false;
  else
    return query select v_count, true;
  end if;
end;
$$;

grant execute on function public.consume_hint_quota(uuid, integer) to authenticated;
