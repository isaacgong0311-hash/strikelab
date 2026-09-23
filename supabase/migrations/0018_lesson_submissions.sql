-- Exercise code synced across devices (master plan A2). A student who
-- starts Black-Scholes on a school Chromebook can finish it at home.
-- One row per learner per lesson: the latest code, when it was saved, and
-- when it last passed the lesson's tests.
--
-- The client writes this directly (RLS: own rows only) and treats failures
-- as "saved on this device only", so the app works before this runs.

create table if not exists public.lesson_submissions (
  user_id        uuid not null references auth.users (id) on delete cascade,
  lesson_id      text not null check (char_length(lesson_id) between 1 and 64),
  code           text not null check (char_length(code) <= 50000),
  updated_at     timestamptz not null default now(),
  last_passed_at timestamptz,
  primary key (user_id, lesson_id)
);

alter table public.lesson_submissions enable row level security;

drop policy if exists "Users read own submissions" on public.lesson_submissions;
create policy "Users read own submissions"
  on public.lesson_submissions for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own submissions" on public.lesson_submissions;
create policy "Users insert own submissions"
  on public.lesson_submissions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own submissions" on public.lesson_submissions;
create policy "Users update own submissions"
  on public.lesson_submissions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- A teacher can read the code of students in their classes, for the
-- "open a student's work when educationally necessary" flow. Read-only.
drop policy if exists "Teachers read class member submissions" on public.lesson_submissions;
create policy "Teachers read class member submissions"
  on public.lesson_submissions for select
  using (public.teaches_student(user_id));
