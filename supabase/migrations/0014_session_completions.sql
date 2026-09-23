-- Bite-sized lesson sessions (/learn/[sessionId]): one row per learner per
-- session, recording the FIRST completion. Re-runs are tracked by analytics
-- events, not here, so accuracy/duration describe the learner's first pass.
-- Written best-effort by the client, so the app keeps working (local-only)
-- before this runs.

create table if not exists public.session_completions (
  user_id      uuid not null references auth.users (id) on delete cascade,
  session_id   text not null check (char_length(session_id) between 1 and 64),
  completed_at timestamptz not null default now(),
  accuracy     real not null check (accuracy >= 0 and accuracy <= 1),
  duration_ms  integer not null check (duration_ms >= 0),
  primary key (user_id, session_id)
);

alter table public.session_completions enable row level security;

drop policy if exists "Users read own session completions" on public.session_completions;
create policy "Users read own session completions"
  on public.session_completions for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own session completions" on public.session_completions;
create policy "Users insert own session completions"
  on public.session_completions for insert
  with check (auth.uid() = user_id);

create index if not exists session_completions_completed_at_idx
  on public.session_completions (completed_at);
