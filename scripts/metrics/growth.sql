-- Weekly growth across every launched cohort (YC plan Y1.1): the chart a
-- partner asks for first. One row per calendar week (Monday start), oldest
-- first, from the week of the first launched cohort to the current week.
-- Run in the Supabase SQL editor and paste into docs/gtm/weekly-scorecard.md.
--
--   cohorts_launched      cumulative cohorts with a start date
--   enrolled_cum          cumulative students who joined a launched cohort
--   active_students       distinct students who completed an assigned lesson that week
--   capstones_cum         cumulative submitted capstones (the north star)
--   capstones_wow_pct     week-over-week growth of capstones_cum (NULL when the previous week is 0)
--   active_wow_pct        week-over-week change in active_students (NULL when the previous week is 0)
--
-- Weeks are UTC calendar weeks (date_trunc), not cohort weeks, so cohorts in
-- different timezones line up on one chart. Completions with unknown
-- timestamps (NULL) never count.

with cohorts as (
  select id, starts_on from public.classes
  where template_id is not null and starts_on is not null
),
bounds as (
  select date_trunc('week', min(starts_on))::date as first_week,
         date_trunc('week', now())::date as last_week
  from cohorts
),
weeks as (
  select generate_series(b.first_week, b.last_week, interval '7 days')::date as week_start
  from bounds b
  where b.first_week is not null
),
active as (
  select date_trunc('week', lc.completed_at)::date as week_start,
         count(distinct lc.user_id) as n
  from public.lesson_completions lc
  join public.class_members m on m.student_id = lc.user_id
  join cohorts k on k.id = m.class_id
  join public.assignments a on a.class_id = k.id and a.lesson_id = lc.lesson_id and a.week_number is not null
  where lc.completed_at is not null
  group by 1
),
series as (
  select w.week_start,
         (select count(*) from cohorts k where date_trunc('week', k.starts_on)::date <= w.week_start) as cohorts_launched,
         (select count(*) from public.class_members m join cohorts k on k.id = m.class_id
           where m.joined_at < w.week_start + 7) as enrolled_cum,
         coalesce(a.n, 0) as active_students,
         (select count(*) from public.capstone_submissions c join cohorts k on k.id = c.class_id
           where c.status = 'submitted' and c.submitted_at < w.week_start + 7) as capstones_cum
  from weeks w
  left join active a on a.week_start = w.week_start
)
select week_start, cohorts_launched, enrolled_cum, active_students, capstones_cum,
       round(100.0 * (capstones_cum - lag(capstones_cum) over (order by week_start))
             / nullif(lag(capstones_cum) over (order by week_start), 0), 1) as capstones_wow_pct,
       round(100.0 * (active_students - lag(active_students) over (order by week_start))
             / nullif(lag(active_students) over (order by week_start), 0), 1) as active_wow_pct
from series
order by week_start;
