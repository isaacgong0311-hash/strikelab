-- Season 1 schedule (proving-ground spec §7): Monday Nov 30 to Sunday Dec 20,
-- 2026, one challenge a week, 60 minutes per attempt. Windows run Monday
-- 00:00 to Sunday 23:59 US Eastern. Paste into the Supabase SQL editor after
-- migration 0024. Safe to run again: it updates rows in place.
--
-- Content lives in src/lib/seasons/templates.ts (template_slug below).
-- Don't change a template's numbers or tests once its week has opened.

insert into public.seasons (id, title, starts_on, ends_on)
values ('s1-2026', 'Season 1', '2026-11-30', '2026-12-20')
on conflict (id) do update
  set title = excluded.title, starts_on = excluded.starts_on, ends_on = excluded.ends_on;

insert into public.season_challenges (id, season_id, week, template_slug, opens_at, closes_at, time_limit_minutes)
values
  ('s1-2026-w1', 's1-2026', 1, 'put-call-parity',    timestamptz '2026-11-30 00:00:00 America/New_York', timestamptz '2026-12-06 23:59:00 America/New_York', 60),
  ('s1-2026-w2', 's1-2026', 2, 'black-scholes-call', timestamptz '2026-12-07 00:00:00 America/New_York', timestamptz '2026-12-13 23:59:00 America/New_York', 60),
  ('s1-2026-w3', 's1-2026', 3, 'call-delta',         timestamptz '2026-12-14 00:00:00 America/New_York', timestamptz '2026-12-20 23:59:00 America/New_York', 60)
on conflict (id) do update
  set template_slug = excluded.template_slug, opens_at = excluded.opens_at,
      closes_at = excluded.closes_at, time_limit_minutes = excluded.time_limit_minutes;
