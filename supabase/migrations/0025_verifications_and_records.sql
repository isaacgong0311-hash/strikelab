-- Verified claims and revocable record links. Founder routes write verification
-- rows with the server-only admin client after isFounder; browsers can only read
-- their own rows. A shared record reveals a handle and verified claims only.

create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('capstone', 'placing')),
  subject_id text not null,
  -- Keep the reviewer id for the audit trail without blocking reviewer account deletion.
  reviewer_id uuid not null,
  verified_at timestamptz not null default now(),
  parent_consent_recorded boolean not null,
  notes text check (char_length(notes) <= 2000),
  unique (user_id, kind, subject_id)
);

alter table public.verifications enable row level security;
drop policy if exists "Students read own verifications" on public.verifications;
create policy "Students read own verifications"
  on public.verifications for select to authenticated
  using ((select auth.uid()) = user_id);

-- New public tables may not be exposed by Supabase's Data API defaults.
-- Grant the one client operation explicitly; no client write grant or policy.
revoke all on public.verifications from anon, authenticated;
grant select on public.verifications to authenticated;

create table if not exists public.record_shares (
  user_id uuid primary key references auth.users (id) on delete cascade,
  token uuid not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public.record_shares enable row level security;
drop policy if exists "Students read own record share" on public.record_shares;
create policy "Students read own record share"
  on public.record_shares for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.record_shares from anon, authenticated;
grant select on public.record_shares to authenticated;

-- An active link is idempotent. After revocation, enabling sharing rotates the
-- token, so a previously revoked URL can never become valid again.
create or replace function public.set_record_sharing(p_enabled boolean)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_token uuid;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if p_enabled is null then
    raise exception 'invalid_share_state' using errcode = '22023';
  end if;

  if not p_enabled then
    update public.record_shares
    set revoked_at = coalesce(revoked_at, now())
    where user_id = v_user;
    return null;
  end if;

  if not exists (select 1 from public.profiles where id = v_user and handle is not null) then
    raise exception 'handle_required' using errcode = '23514';
  end if;

  insert into public.record_shares (user_id, token)
  values (v_user, gen_random_uuid())
  on conflict (user_id) do update
    set token = case when public.record_shares.revoked_at is null
      then public.record_shares.token else gen_random_uuid() end,
        created_at = case when public.record_shares.revoked_at is null
      then public.record_shares.created_at else now() end,
        revoked_at = null
  returning token into v_token;
  return v_token;
end;
$$;

-- This is the only anonymous record read. It returns zero rows for revoked or
-- unknown tokens, never an email, name, user id, reviewer, consent, or notes.
create or replace function public.get_shared_record(p_token uuid)
returns table (handle text, items jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select p.handle,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'kind', v.kind,
        'subject_id', v.subject_id,
        'verified_at', v.verified_at
      ) order by v.verified_at desc)
      from public.verifications v
      where v.user_id = s.user_id
    ), '[]'::jsonb)
  from public.record_shares s
  join public.profiles p on p.id = s.user_id
  where p_token is not null and s.token = p_token
    and s.revoked_at is null and p.handle is not null;
$$;

revoke all on function public.set_record_sharing(boolean) from public;
revoke all on function public.get_shared_record(uuid) from public;
grant execute on function public.set_record_sharing(boolean) to authenticated;
grant execute on function public.get_shared_record(uuid) to anon, authenticated;
