-- Normalized, server-timestamped lesson completions: the source of truth for
-- cohort activation, week-N activity and retention (docs/gtm/metric-glossary.md).
--
-- Rows are written ONLY by a trigger on public.progress, never by clients:
-- useProgress upserts the progress row straight from the browser, so hooking
-- the API route would miss almost every real completion. The trigger diffs
-- the `completed` array and stamps each newly seen lesson with the database
-- clock, so a client can't choose its own completed_at.
--
-- Completions that already exist when this runs are recorded with a NULL
-- completed_at ("before tracking began") rather than an invented timestamp.
-- Metrics must ignore NULL rows. Because the primary key already holds them,
-- a later re-sync of the same lesson can't give them a fake "now" either.
--
-- Known limitation: a learner who completes lessons signed-out and signs in
-- later is stamped at sync time. Acceptable for free pilots, where students
-- join signed-in; revisit before any credential depends on these timestamps.

create table if not exists public.lesson_completions (
  user_id      uuid not null references auth.users (id) on delete cascade,
  lesson_id    text not null check (char_length(lesson_id) between 1 and 64),
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

create index if not exists lesson_completions_completed_at_idx
  on public.lesson_completions (completed_at);

alter table public.lesson_completions enable row level security;

drop policy if exists "Users read own lesson completions" on public.lesson_completions;
create policy "Users read own lesson completions"
  on public.lesson_completions for select
  using (auth.uid() = user_id);

-- A teacher can read completions for students in a class they own. (Server
-- routes use the admin client after verifying ownership; this policy keeps
-- session-bound reads possible without widening anything else.) Uses the
-- recursion-safe helper from 0015.
drop policy if exists "Teachers read class member completions" on public.lesson_completions;
create policy "Teachers read class member completions"
  on public.lesson_completions for select
  using (public.teaches_student(user_id));

-- No insert/update/delete policies: only the trigger below writes rows.

create or replace function public.record_lesson_completions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lesson_completions (user_id, lesson_id, completed_at)
  select new.user_id, ids.lesson_id, now()
  from (
    select distinct value as lesson_id
    from jsonb_array_elements_text(
      case when jsonb_typeof(new.completed) = 'array' then new.completed else '[]'::jsonb end
    )
  ) ids
  where char_length(ids.lesson_id) between 1 and 64
    and (
      tg_op = 'INSERT'
      or not coalesce(old.completed, '[]'::jsonb) ? ids.lesson_id
    )
  on conflict (user_id, lesson_id) do nothing;
  return new;
end;
$$;

revoke all on function public.record_lesson_completions() from public;

drop trigger if exists progress_record_lesson_completions on public.progress;
create trigger progress_record_lesson_completions
  after insert or update of completed on public.progress
  for each row execute function public.record_lesson_completions();

-- Existing completions: recorded, but with no timestamp (see header).
insert into public.lesson_completions (user_id, lesson_id, completed_at)
select p.user_id, ids.lesson_id, null
from public.progress p
cross join lateral (
  select distinct value as lesson_id
  from jsonb_array_elements_text(
    case when jsonb_typeof(p.completed) = 'array' then p.completed else '[]'::jsonb end
  )
) ids
where char_length(ids.lesson_id) between 1 and 64
on conflict (user_id, lesson_id) do nothing;
