-- Per-class switch for the AI tutor (build plan T3.5).
--
-- The tutor sends a student's question and code to a third-party model. A
-- club leader or school should decide whether their students can use it, so
-- the default for any class is OFF; the leader turns it on from the class
-- page. Independent students (in no class) are unaffected.
--
-- ai_tutor_allowed() answers for the signed-in user: false when they belong
-- to ANY class whose leader has not enabled the tutor (the most protective
-- reading when someone is in several classes). Existing classes start OFF.

alter table public.classes
  add column if not exists ai_tutor_enabled boolean not null default false;

create or replace function public.ai_tutor_allowed()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.class_members m
    join public.classes c on c.id = m.class_id
    where m.student_id = auth.uid()
      and not c.ai_tutor_enabled
  );
$$;

revoke all on function public.ai_tutor_allowed() from public;
grant execute on function public.ai_tutor_allowed() to authenticated;
