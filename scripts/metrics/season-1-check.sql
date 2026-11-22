-- Is Season 1 scheduled in this database? Read-only.
-- Run in the production Supabase SQL editor before Nov 30, 2026
-- (docs/gtm/season-1-launch-checklist.md, step 1).
--
-- Expect three rows, weeks 1 to 3, each with state 'ok'. Times are New York.
-- Any other state: paste supabase/seed/season-1.sql into the SQL editor, run
-- it (safe to run twice), then run this again. An error saying
-- public.season_challenges doesn't exist means migration 0024 isn't applied.
-- season1Seed.db.test.ts runs this against the seed.
select e.id as challenge,
       e.week,
       to_char(c.opens_at at time zone 'America/New_York', 'YYYY-MM-DD HH24:MI') as opens_at_eastern,
       to_char(c.closes_at at time zone 'America/New_York', 'YYYY-MM-DD HH24:MI') as closes_at_eastern,
       c.time_limit_minutes,
       case
         when s.id is null then 'MISSING: no season row s1-2026'
         when c.id is null then 'MISSING'
         when c.season_id <> 's1-2026' or c.week <> e.week or c.template_slug <> e.template_slug
           or c.opens_at <> e.opens_at or c.closes_at <> e.closes_at or c.time_limit_minutes <> 60
           then 'WRONG: differs from the seed'
         when s.starts_on <> date '2026-11-30' or s.ends_on <> date '2026-12-20'
           then 'WRONG: season dates differ from the seed'
         else 'ok'
       end as state
from (values
  ('s1-2026-w1', 1, 'put-call-parity',    timestamptz '2026-11-30 00:00:00 America/New_York', timestamptz '2026-12-06 23:59:00 America/New_York'),
  ('s1-2026-w2', 2, 'black-scholes-call', timestamptz '2026-12-07 00:00:00 America/New_York', timestamptz '2026-12-13 23:59:00 America/New_York'),
  ('s1-2026-w3', 3, 'call-delta',         timestamptz '2026-12-14 00:00:00 America/New_York', timestamptz '2026-12-20 23:59:00 America/New_York')
) as e(id, week, template_slug, opens_at, closes_at)
left join public.season_challenges c on c.id = e.id
left join public.seasons s on s.id = 's1-2026'
order by e.week;
