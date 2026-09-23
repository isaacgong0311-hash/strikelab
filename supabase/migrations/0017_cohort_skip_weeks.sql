-- Holiday skip weeks for cohorts (master plan A7). A skipped week is a
-- break: nothing is due, and it doesn't count as a cohort week for
-- activation or retention. The app computes the schedule from
-- (starts_on, skip_weeks) in src/lib/cohorts/template.ts; this stores the
-- skip list next to starts_on so metrics can rebuild the same week windows.

alter table public.classes
  add column if not exists skip_weeks date[] not null default '{}';

alter table public.classes
  drop constraint if exists classes_skip_weeks_check;
alter table public.classes
  add constraint classes_skip_weeks_check check (cardinality(skip_weeks) <= 3);

-- Replace the 5-argument launch function with one that also takes the skip
-- list. The old signature is dropped so PostgREST never has to choose
-- between overloads.
drop function if exists public.launch_cohort(uuid, text, date, text, jsonb);

create or replace function public.launch_cohort(
  p_class_id uuid,
  p_template_id text,
  p_starts_on date,
  p_timezone text,
  p_schedule jsonb,
  p_skip_weeks date[] default '{}'
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.classes c
    where c.id = p_class_id and c.teacher_id = auth.uid()
  ) then
    raise exception 'class_not_found' using errcode = 'P0002';
  end if;

  if p_template_id <> 'quant-foundations-v1' then
    raise exception 'unknown_template' using errcode = '22023';
  end if;

  if p_starts_on is null or nullif(btrim(p_timezone), '') is null then
    raise exception 'invalid_cohort_metadata' using errcode = '22023';
  end if;

  if coalesce(cardinality(p_skip_weeks), 0) > 3
     or exists (select 1 from unnest(p_skip_weeks) d where d <= p_starts_on) then
    raise exception 'invalid_skip_weeks' using errcode = '22023';
  end if;

  if jsonb_typeof(p_schedule) <> 'array' or jsonb_array_length(p_schedule) = 0 then
    raise exception 'invalid_schedule' using errcode = '22023';
  end if;

  update public.classes
  set template_id = p_template_id,
      starts_on = p_starts_on,
      timezone = p_timezone,
      skip_weeks = coalesce(p_skip_weeks, '{}'),
      launched_at = now()
  where id = p_class_id and teacher_id = auth.uid();

  insert into public.assignments (
    class_id,
    lesson_id,
    week_number,
    position,
    due_on
  )
  select
    p_class_id,
    item.lesson_id,
    item.week_number,
    item.position,
    item.due_on
  from jsonb_to_recordset(p_schedule) as item(
    lesson_id text,
    week_number smallint,
    position smallint,
    due_on date
  )
  on conflict (class_id, lesson_id) do update
  set week_number = excluded.week_number,
      position = excluded.position,
      due_on = excluded.due_on;
end;
$$;

revoke all on function public.launch_cohort(uuid, text, date, text, jsonb, date[]) from public;
grant execute on function public.launch_cohort(uuid, text, date, text, jsonb, date[]) to authenticated;
