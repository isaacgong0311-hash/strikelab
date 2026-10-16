-- Rehearsal season (proving-ground spec §3 "Testing"): a private dress
-- rehearsal of Season 1 for the founder and a few friends before Nov 30.
-- All three challenges open now for 10 days, so one person can play the whole
-- loop in an afternoon: start, submit, run `npm run season:score`, check the
-- board, record a defense, share a record.
--
-- Rehearsal seasons never appear on /seasons by default or on any record.
-- Open it at /seasons?season=rehearsal-2026. Paste into the Supabase SQL
-- editor after migration 0025. Running it again re-opens the windows from now.
--
-- To clean up afterwards (removes its attempts and defenses too):
--   delete from public.seasons where id = 'rehearsal-2026';

insert into public.seasons (id, title, starts_on, ends_on, is_rehearsal)
values ('rehearsal-2026', 'Rehearsal season', current_date, current_date + 10, true)
on conflict (id) do update
  set title = excluded.title, starts_on = excluded.starts_on, ends_on = excluded.ends_on, is_rehearsal = true;

insert into public.season_challenges (id, season_id, week, template_slug, opens_at, closes_at, time_limit_minutes)
values
  ('rehearsal-2026-w1', 'rehearsal-2026', 1, 'put-call-parity',    now(), now() + interval '10 days', 60),
  ('rehearsal-2026-w2', 'rehearsal-2026', 2, 'black-scholes-call', now(), now() + interval '10 days', 60),
  ('rehearsal-2026-w3', 'rehearsal-2026', 3, 'call-delta',         now(), now() + interval '10 days', 60)
on conflict (id) do update
  set template_slug = excluded.template_slug, opens_at = excluded.opens_at,
      closes_at = excluded.closes_at, time_limit_minutes = excluded.time_limit_minutes;
