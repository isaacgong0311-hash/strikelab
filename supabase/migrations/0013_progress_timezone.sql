-- Learner's IANA timezone (e.g. "America/Chicago"), so server-side readers
-- (the progress API today, reminder emails next) can judge streaks and
-- "active today" on the learner's local calendar day, matching the client.
-- Nullable: rows without it fall back to UTC. Written by a separate
-- best-effort update, so progress sync keeps working before this runs.

alter table public.progress
  add column if not exists timezone text;

alter table public.progress
  drop constraint if exists progress_timezone_length_check;

alter table public.progress
  add constraint progress_timezone_length_check
    check (timezone is null or char_length(timezone) between 1 and 64);
