-- Per-user rate limits for write endpoints (master plan D11): joining a
-- class by code (guessing codes), creating/launching classes, capstone
-- saves and sharing, and account deletion. One row per user per bucket
-- with a fixed window; consume_rate_limit() checks and counts in one
-- statement, so concurrent requests can't both slip under the limit
-- (same pattern as consume_ai_quota in 0008).

create table if not exists public.rate_limits (
  user_id      uuid not null references auth.users (id) on delete cascade,
  bucket       text not null check (char_length(bucket) between 1 and 64),
  window_start timestamptz not null default now(),
  count        integer not null default 0,
  primary key (user_id, bucket)
);

alter table public.rate_limits enable row level security;
-- No policies: only consume_rate_limit() touches this table.

create or replace function public.consume_rate_limit(p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  insert into public.rate_limits as r (user_id, bucket, window_start, count)
  values (auth.uid(), p_bucket, now(), 1)
  on conflict (user_id, bucket) do update
    set window_start = case when r.window_start <= now() - make_interval(secs => p_window_seconds) then now() else r.window_start end,
        count = case when r.window_start <= now() - make_interval(secs => p_window_seconds) then 1 else r.count + 1 end
  returning r.count into v_count;
  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated;
