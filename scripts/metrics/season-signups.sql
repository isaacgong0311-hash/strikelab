-- Season 1 run-up: where players come from and who recruits them.
-- Run in the production Supabase SQL editor. Aggregates and public handles
-- only: no names or emails.
--
-- Kill rule (docs/gtm/season-1-outreach.md): under 30 students in Season 1
-- means the message or channel is wrong. This shows which channel is working.

-- 1. Sign-ups since Nov 1 by channel. Friend invites (?src=friend-<handle>)
--    are grouped together; section 2 breaks them out.
with recent as (
  select p.id, p.handle,
         case
           when p.signup_source like 'friend-%' then 'friend invite'
           else coalesce(nullif(p.signup_source, ''), '(none)')
         end as channel
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.created_at >= timestamptz '2026-11-01 00:00:00 America/New_York'
)
select channel,
       count(*) as signups,
       count(*) filter (where handle is not null) as picked_a_handle,
       count(*) filter (where exists (
         select 1 from public.season_attempts a where a.user_id = recent.id)) as started_a_challenge
from recent
group by channel
order by signups desc;

-- 2. Top inviters: how many sign-ups each student's link brought in.
select substring(p.signup_source from 8) as inviter_handle,
       count(*) as friends_signed_up,
       count(*) filter (where p.handle is not null) as friends_with_a_handle
from public.profiles p
where p.signup_source like 'friend-%'
group by 1
order by 2 desc
limit 25;
