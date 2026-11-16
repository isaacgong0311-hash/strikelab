-- Season invites: a student shares strikelab.dev/seasons?src=friend-<handle>,
-- and the friend's sign-up stores that tag in profiles.signup_source (0009).
-- This lets the inviter see how many people joined through their link, as a
-- count only: never who they are. Handles are public already (0024).
--
-- The app tolerates this migration being unapplied: /seasons hides the count
-- when the function is missing.

create or replace function public.my_invite_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.profiles friend
  join public.profiles me on me.id = auth.uid()
  where me.handle is not null
    and friend.id <> me.id
    and friend.signup_source = 'friend-' || me.handle;
$$;
revoke all on function public.my_invite_count() from public;
grant execute on function public.my_invite_count() to authenticated;
