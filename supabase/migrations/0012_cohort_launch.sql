-- Cohort launch foundation for the fixed six-week Quant Foundations Lab.
-- Existing classes and manual assignments remain valid: every new column is
-- nullable, and a class is considered a cohort only after template_id is set.

alter table public.classes
  add column if not exists template_id text,
  add column if not exists starts_on date,
  add column if not exists timezone text,
  add column if not exists launched_at timestamptz;

alter table public.assignments
  add column if not exists week_number smallint,
  add column if not exists position smallint,
  add column if not exists due_on date;

alter table public.assignments
  add constraint assignments_week_number_check
    check (week_number is null or week_number between 1 and 6),
  add constraint assignments_position_check
    check (position is null or position > 0);

create index if not exists assignments_class_schedule_idx
  on public.assignments (class_id, week_number, position);

-- Launching touches both the class metadata and every scheduled assignment.
-- Keeping those writes inside one Postgres function prevents a failed request
-- from leaving behind a class marked as launched with only part of its plan.
-- Re-launch is intentionally idempotent and updates the fixed schedule.
create or replace function public.launch_cohort(
  p_class_id uuid,
  p_template_id text,
  p_starts_on date,
  p_timezone text,
  p_schedule jsonb
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

  if jsonb_typeof(p_schedule) <> 'array' or jsonb_array_length(p_schedule) = 0 then
    raise exception 'invalid_schedule' using errcode = '22023';
  end if;

  update public.classes
  set template_id = p_template_id,
      starts_on = p_starts_on,
      timezone = p_timezone,
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

revoke all on function public.launch_cohort(uuid, text, date, text, jsonb) from public;
grant execute on function public.launch_cohort(uuid, text, date, text, jsonb) to authenticated;
