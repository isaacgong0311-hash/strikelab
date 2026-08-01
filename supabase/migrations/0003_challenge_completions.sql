-- StrikeLab weekly-challenge completions, backing the real leaderboard.
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

create table if not exists public.challenge_completions (
  user_id         uuid not null references auth.users (id) on delete cascade,
  challenge_id    text not null,
  display_name    text,
  elapsed_seconds integer not null,
  xp              integer not null,
  completed_at    timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

alter table public.challenge_completions enable row level security;

-- Leaderboard rows (name, time, xp) are shown to every visitor, signed in or
-- not — same as the old placeholder data was always public.
drop policy if exists "Completions publicly viewable" on public.challenge_completions;
create policy "Completions publicly viewable"
  on public.challenge_completions for select
  using (true);

drop policy if exists "Users insert own completion" on public.challenge_completions;
create policy "Users insert own completion"
  on public.challenge_completions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own completion" on public.challenge_completions;
create policy "Users update own completion"
  on public.challenge_completions for update
  using (auth.uid() = user_id);

create index if not exists challenge_completions_leaderboard_idx
  on public.challenge_completions (challenge_id, elapsed_seconds asc);
