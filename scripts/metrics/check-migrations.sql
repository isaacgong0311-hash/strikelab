-- Which StrikeLab migrations are applied? Each row should say "applied".
-- Run in the Supabase SQL editor before and after applying migrations.
select m.migration,
       case when m.present then 'applied' else 'MISSING' end as state
from (values
  ('0013_progress_timezone',        exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'progress' and column_name = 'timezone')),
  ('0014_session_completions',      to_regclass('public.session_completions') is not null),
  ('0015_fix_class_rls_recursion',  to_regprocedure('public.is_class_member(uuid)') is not null),
  ('0016_lesson_completions',       to_regclass('public.lesson_completions') is not null),
  ('0017_cohort_skip_weeks',        exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'classes' and column_name = 'skip_weeks')),
  ('0018_lesson_submissions',       to_regclass('public.lesson_submissions') is not null),
  ('0019_capstone_submissions',     to_regclass('public.capstone_submissions') is not null),
  ('0020_subscription_event_order', exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'subscriptions' and column_name = 'last_event_created'))
) as m(migration, present);
