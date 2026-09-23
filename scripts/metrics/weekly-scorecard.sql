-- Weekly scorecard: one row per launched cohort, with the SAME definitions
-- as src/lib/cohorts/metrics.ts (docs/gtm/metric-glossary.md).
-- Run in the Supabase SQL editor every Monday and paste into
-- docs/gtm/weekly-scorecard.md. src/lib/cohorts/metricsSql.db.test.ts runs
-- this against the app's TypeScript metrics so the two can't drift.
--
-- Days are calendar days in each cohort's timezone. Break weeks
-- (classes.skip_weeks) aren't program weeks. Completions with unknown
-- timestamps (NULL, recorded before tracking began) never count here.

with cohorts as (
  select c.id, c.name, c.starts_on, coalesce(c.timezone, 'UTC') as tz,
         coalesce(c.skip_weeks, '{}') as skip_weeks,
         (now() at time zone coalesce(c.timezone, 'UTC'))::date as today
  from public.classes c
  where c.template_id is not null and c.starts_on is not null
),
weeks as (
  select class_id, week, starts_on, starts_on + 6 as ends_on
  from (
    select k.id as class_id, k.starts_on + b * 7 as starts_on,
           row_number() over (partition by k.id order by b) as week
    from cohorts k
    cross join generate_series(0, 8) as b
    where not ((k.starts_on + b * 7) = any (k.skip_weeks))
  ) blocks
  where week <= 6
),
first_lesson as (
  select distinct on (class_id) class_id, lesson_id
  from public.assignments
  where week_number is not null
  order by class_id, week_number, position
),
members as (
  select m.class_id, m.student_id, k.tz, k.today, k.starts_on,
         (m.joined_at at time zone k.tz)::date as joined_on
  from public.class_members m
  join cohorts k on k.id = m.class_id
),
done as (
  select m.class_id, m.student_id, lc.lesson_id, (lc.completed_at at time zone m.tz)::date as day
  from members m
  join public.lesson_completions lc on lc.user_id = m.student_id and lc.completed_at is not null
  join public.assignments a on a.class_id = m.class_id and a.lesson_id = lc.lesson_id and a.week_number is not null
),
students as (
  select m.*,
         greatest(m.joined_on, m.starts_on) + 7 as activation_deadline,
         (select d.day from done d join first_lesson f on f.class_id = d.class_id and f.lesson_id = d.lesson_id
           where d.class_id = m.class_id and d.student_id = m.student_id) as first_day
  from members m
),
flags as (
  select s.*,
         (s.first_day is not null and s.first_day <= s.activation_deadline) as activated,
         (not (s.first_day is not null and s.first_day <= s.activation_deadline) and s.today <= s.activation_deadline) as pending,
         exists (
           select 1 from done d join weeks w on w.class_id = d.class_id and w.week = 4
           where d.class_id = s.class_id and d.student_id = s.student_id and d.day between w.starts_on and w.ends_on
         ) as active_week4,
         exists (
           select 1 from done d join weeks w on w.class_id = d.class_id
           where d.class_id = s.class_id and d.student_id = s.student_id
             and s.today between w.starts_on and w.ends_on and d.day between w.starts_on and w.ends_on
         ) as active_now
  from students s
)
select
  k.name as cohort,
  k.today as as_of,
  coalesce((select 'week ' || w.week from weeks w where w.class_id = k.id and k.today between w.starts_on and w.ends_on),
           case when k.today < k.starts_on then 'not started'
                when k.today > (select max(ends_on) from weeks w where w.class_id = k.id) then 'finished'
                else 'break' end) as status,
  count(f.student_id) as enrolled,
  count(*) filter (where f.activated) as activated,
  count(*) filter (where f.pending) as activation_pending,
  round(100.0 * count(*) filter (where f.activated) / nullif(count(f.student_id), 0)) as activated_pct,
  case when exists (select 1 from weeks w where w.class_id = k.id and k.today between w.starts_on and w.ends_on)
       then count(*) filter (where f.active_now) end as active_this_week,
  case when (select starts_on from weeks w where w.class_id = k.id and w.week = 4) <= k.today
       then count(*) filter (where f.activated and f.active_week4) end as week4_retained,
  case when (select starts_on from weeks w where w.class_id = k.id and w.week = 4) <= k.today
       then round(100.0 * count(*) filter (where f.activated and f.active_week4)
                  / nullif(count(*) filter (where f.activated), 0)) end as week4_retained_pct
from cohorts k
left join flags f on f.class_id = k.id
group by k.id, k.name, k.today, k.starts_on
order by k.starts_on, k.name;
