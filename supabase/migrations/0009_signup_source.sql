-- Track where a signup came from (?src=reddit, ?src=aops, ?src=discord, etc.)
-- so growth posts can be measured instead of guessed at.

alter table public.profiles add column if not exists signup_source text;

-- Re-create the new-user trigger to also capture signup_source from
-- raw_user_meta_data (set by the client at signup time). OAuth signups
-- don't carry this metadata — those get backfilled by the auth callback
-- route from a short-lived cookie instead.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, signup_source)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name'
    ),
    new.raw_user_meta_data ->> 'signup_source'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
