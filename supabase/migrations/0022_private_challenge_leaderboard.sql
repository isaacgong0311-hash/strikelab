-- Challenge completions stop being public (work plan 2026-09-29, AG8).
--
-- 0003 gave challenge_completions a `using (true)` select policy, so anyone
-- holding the public anon key could list every row: user ids plus the name a
-- student typed at sign-up. /challenges then showed those names to signed-out
-- visitors. That contradicts what the homepage, /clubs and the pilot packet
-- promise ("no public profiles or leaderboards for students"), and it's the
-- wrong default for 13-18 year olds.
--
-- Now: students read only their own rows, and the leaderboard comes from
-- challenge_leaderboard(), which returns rank, time and XP, plus whether the
-- row is the caller's, and never a name or an id. The copied names are
-- removed; nothing reads them any more.

drop policy if exists "Completions publicly viewable" on public.challenge_completions;
drop policy if exists "Users read own completions" on public.challenge_completions;
create policy "Users read own completions"
  on public.challenge_completions for select
  using (auth.uid() = user_id);

update public.challenge_completions set display_name = null where display_name is not null;

create or replace function public.challenge_leaderboard(p_challenge_id text, p_limit integer default 10)
returns table (rank integer, elapsed_seconds integer, xp integer, is_you boolean)
language sql
stable
security definer
set search_path = public
as $$
  select r.rank, r.elapsed_seconds, r.xp, r.is_you
  from (
    select (row_number() over (order by c.elapsed_seconds, c.completed_at))::integer as rank,
           c.elapsed_seconds,
           c.xp,
           coalesce(c.user_id = auth.uid(), false) as is_you
    from public.challenge_completions c
    where c.challenge_id = p_challenge_id
  ) r
  -- The top N for everyone, plus the caller's own row wherever it ranks.
  where r.rank <= least(greatest(p_limit, 1), 50) or r.is_you
  order by r.rank;
$$;

revoke all on function public.challenge_leaderboard(text, integer) from public;
grant execute on function public.challenge_leaderboard(text, integer) to anon, authenticated;
