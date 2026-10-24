-- YC evidence snapshot: aggregates only, no names, emails, handles, code, or
-- student rows. Run read-only in the confirmed production Supabase SQL editor
-- AFTER check-migrations.sql confirms 0014, 0016, 0019, 0024, and 0025.
-- Save the result privately with its UTC as_of time. Never paste a row from a
-- demo, test, staging, or inactive project into the YC application.
--
-- These counts are not a matched funnel: a person may appear in several rows.
-- Anonymous local lesson/session progress is absent. A lesson completed before
-- migration 0016 has no trustworthy completion date and is excluded from the
-- timestamped metrics. Signed-out work synced later may be dated at sign-in.

with snapshot as (select now() as as_of_utc),
metrics as (
  select 'registered_accounts'::text as metric, count(*)::bigint as value
  from auth.users
  union all
  select 'accounts_with_any_lesson_completion', count(distinct user_id)
  from public.lesson_completions
  union all
  select 'accounts_with_dated_lesson_completion', count(distinct user_id)
  from public.lesson_completions where completed_at is not null
  union all
  select 'dated_lesson_completions', count(*)
  from public.lesson_completions where completed_at is not null
  union all
  select 'accounts_with_dated_lesson_completion_last_30d', count(distinct user_id)
  from public.lesson_completions where completed_at >= now() - interval '30 days'
  union all
  select 'accounts_with_completed_short_session', count(distinct user_id)
  from public.session_completions
  union all
  select 'clubs_created', count(*) from public.classes
  union all
  select 'clubs_with_at_least_one_student', count(distinct class_id)
  from public.class_members
  union all
  select 'distinct_students_joined_to_clubs', count(distinct student_id)
  from public.class_members
  union all
  select 'launched_six_week_cohorts', count(*)
  from public.classes where template_id is not null and starts_on is not null
  union all
  select 'private_capstones_submitted', count(*)
  from public.capstone_submissions where submitted_at is not null
  union all
  select 'season_challenges_scheduled', count(*) from public.season_challenges
  union all
  select 'accounts_that_started_season_challenge', count(distinct user_id)
  from public.season_attempts
  union all
  select 'accounts_that_submitted_season_challenge', count(distinct user_id)
  from public.season_attempts where submitted_at is not null
  union all
  select 'officially_scored_season_attempts', count(*)
  from public.season_attempts where official_score is not null
  union all
  select 'parent_intensive_waitlist_emails', count(*)
  from public.intensive_waitlist
  union all
  select 'verified_work_items', count(*) from public.verifications
)
select snapshot.as_of_utc, metrics.metric, metrics.value
from snapshot cross join metrics
order by metrics.metric;
