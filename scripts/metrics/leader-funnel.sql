-- Leader funnel (frontend plan FE-11, master plan C1): sign-up → class
-- created → cohort launched → first student joined, by where the leader
-- came from (profiles.signup_source, set from ?src= at sign-up).
-- Run in the Supabase SQL editor. src/lib/cohorts/metricsSql.db.test.ts
-- runs it against a known dataset.
--
-- A leader is anyone who chose "club leader or teacher" at sign-up
-- (auth user metadata signup_role) or owns at least one class, so leaders
-- from before the sign-up question still count. Times are medians in
-- minutes (hours for the first student) from sign-up, over the leaders who
-- reached that step. The last row is every source together.

with leaders as (
  select p.id,
         p.created_at as signed_up_at,
         coalesce(nullif(p.signup_source, ''), '(none)') as src
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.raw_user_meta_data ->> 'signup_role' = 'leader'
     or exists (select 1 from public.classes c where c.teacher_id = p.id)
),
steps as (
  select l.*,
         (select min(c.created_at) from public.classes c where c.teacher_id = l.id) as class_created_at,
         (select min(c.launched_at) from public.classes c where c.teacher_id = l.id) as launched_at,
         (select min(m.joined_at)
            from public.class_members m
            join public.classes c on c.id = m.class_id
           where c.teacher_id = l.id) as first_join_at
  from leaders l
)
select case when grouping(src) = 1 then 'All sources' else src end as source,
       count(*) as leaders,
       count(class_created_at) as created_class,
       count(launched_at) as launched_cohort,
       count(first_join_at) as first_student_joined,
       count(*) filter (where first_join_at <= signed_up_at + interval '7 days') as first_student_within_7d,
       round(100.0 * count(*) filter (where first_join_at <= signed_up_at + interval '7 days') / nullif(count(*), 0)) as pct_first_student_within_7d,
       round((percentile_cont(0.5) within group (order by extract(epoch from class_created_at - signed_up_at) / 60))::numeric, 1) as median_min_to_class,
       round((percentile_cont(0.5) within group (order by extract(epoch from launched_at - signed_up_at) / 60))::numeric, 1) as median_min_to_launch,
       round((percentile_cont(0.5) within group (order by extract(epoch from first_join_at - signed_up_at) / 3600))::numeric, 1) as median_hours_to_first_student
from steps
group by rollup (src)
order by grouping(src), count(*) desc, src;
