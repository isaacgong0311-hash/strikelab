-- Discord integration (roadmap Q4 2026: "auto-post lesson completions and
-- achievements to school CS/math clubs"). Discord's incoming webhooks need
-- no OAuth app or bot — a user creates one in their server's channel
-- settings and pastes the URL here.
--
-- Lives on `profiles`, not a new table: it's a single optional per-user
-- setting, and `profiles` already has owner-scoped RLS policies from
-- 0001_init.sql (auth.uid() = id for select/update) that cover it with no
-- new policy needed.
alter table public.profiles
  add column if not exists discord_webhook_url text;
