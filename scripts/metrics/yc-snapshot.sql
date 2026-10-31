-- One-paste, read-only snapshot for the YC application and founder updates
-- (docs/yc/w27-submission-plan.md, Thursday). Aggregates only: no names,
-- emails or ids. Paste into the production Supabase SQL editor; it returns one
-- row per number, so the editor's single result grid shows everything.
-- A table that doesn't exist yet reads MISSING instead of failing the query.
-- Copy the rows into the draft with today's date and "source: production query".
with counts(ord, metric, sql) as (
  values
    ( 1, 'registered users',                         'select count(*) from auth.users'),
    ( 2, 'signed up in the last 30 days',            'select count(*) from auth.users where created_at > now() - interval ''30 days'''),
    ( 3, 'signed in during the last 30 days',        'select count(*) from auth.users where last_sign_in_at > now() - interval ''30 days'''),
    ( 4, 'users with a completed lesson',            'select count(*) from public.progress where jsonb_array_length(completed) > 0'),
    ( 5, 'lesson completions (all time)',            'select coalesce(sum(jsonb_array_length(completed)), 0) from public.progress'),
    ( 6, 'timestamped completions, last 30 days',    'select count(*) from public.lesson_completions where completed_at > now() - interval ''30 days'''),
    ( 7, 'clubs (classes) created',                  'select count(*) from public.classes'),
    ( 8, 'students in a club',                       'select count(*) from public.class_members'),
    ( 9, 'cohorts launched',                         'select count(*) from public.classes where template_id is not null'),
    (10, 'capstones submitted',                      'select count(*) from public.capstone_submissions where status = ''submitted'''),
    (11, 'season handles set',                       'select count(*) from public.profiles where handle is not null'),
    (12, 'season challenges scheduled',              'select count(*) from public.season_challenges'),
    (13, 'season attempts started',                  'select count(*) from public.season_attempts'),
    (14, 'Intensive waitlist sign-ups (parents)',    'select count(*) from public.intensive_waitlist'),
    (15, 'active subscriptions in db (check Stripe)','select count(*) from public.subscriptions where status in (''active'', ''trialing'')')
)
select ord, metric,
       case when to_regclass(substring(sql from 'from ([a-z_.]+)')) is null then 'MISSING'
            else (xpath('/row/n/text()', query_to_xml('select (' || sql || ') as n', false, true, '')))[1]::text
       end as value,
       current_date as as_of
from counts
order by ord;
