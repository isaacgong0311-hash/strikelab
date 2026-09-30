-- Which StrikeLab migrations are applied? Each row should say "applied".
-- Run in the Supabase SQL editor before and after applying migrations.
-- One row per file in supabase/migrations/ (a test keeps the two in sync).
-- Each check looks for one object that only that migration creates.
select m.migration,
       case when m.present then 'applied' else 'MISSING' end as state
from (values
  ('0001_init',                     to_regclass('public.progress') is not null),
  ('0002_subscriptions',            to_regclass('public.subscriptions') is not null),
  ('0003_challenge_completions',    to_regclass('public.challenge_completions') is not null),
  ('0004_sandbox',                  to_regclass('public.sandbox_accounts') is not null),
  ('0005_certificates',             to_regclass('public.certificates') is not null),
  ('0006_discord_webhook',          exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'discord_webhook_url')),
  ('0007_sandbox_atomic_trades',    exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'sandbox_open_position')),
  ('0008_separate_ai_quota',        to_regclass('public.ai_usage') is not null),
  ('0009_signup_source',            exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'signup_source')),
  ('0010_classes',                  to_regclass('public.class_members') is not null),
  ('0011_assignments',              to_regclass('public.assignments') is not null),
  ('0012_cohort_launch',            exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'launch_cohort')),
  ('0013_progress_timezone',        exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'progress' and column_name = 'timezone')),
  ('0014_session_completions',      to_regclass('public.session_completions') is not null),
  ('0015_fix_class_rls_recursion',  to_regprocedure('public.is_class_member(uuid)') is not null),
  ('0016_lesson_completions',       to_regclass('public.lesson_completions') is not null),
  ('0017_cohort_skip_weeks',        exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'classes' and column_name = 'skip_weeks')),
  ('0018_lesson_submissions',       to_regclass('public.lesson_submissions') is not null),
  ('0019_capstone_submissions',     to_regclass('public.capstone_submissions') is not null),
  ('0020_subscription_event_order', exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'subscriptions' and column_name = 'last_event_created')),
  ('0021_rate_limits',              to_regclass('public.rate_limits') is not null),
  ('0022_private_challenge_board',  to_regprocedure('public.challenge_leaderboard(text, integer)') is not null)
) as m(migration, present);
