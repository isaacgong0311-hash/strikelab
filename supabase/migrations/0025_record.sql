-- Student record page (proving-ground spec, 2026-10-16): one page per
-- student listing seasons entered, challenges solved and whether a
-- capstone has been submitted. Private by default; a share link works
-- like capstone sharing (0019) — an unguessable token the client can
-- never choose, minted by set_record_sharing() and read back only through
-- get_shared_record(). There is no defense/verification system yet, so a
-- submitted capstone is shown as submitted, not "verified": do not invent
-- a status the product doesn't have.

alter table public.profiles add column if not exists record_share_token uuid unique;

-- Same guard as capstone_stamp (0019): a direct client update can never
-- set or clear record_share_token, only set_record_sharing() can, via the
-- session flag it toggles around its own update.
create or replace function public.record_share_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.record_share_token := case when current_setting('record.sharing', true) = 'on' then new.record_share_token else old.record_share_token end;
  return new;
end;
$$;

drop trigger if exists record_share_guard on public.profiles;
create trigger record_share_guard
  before update on public.profiles
  for each row execute function public.record_share_guard();

-- One student's rows: season_id is null (one row, nulls elsewhere) when
-- they have never started an attempt. Not exposed directly — only the two
-- functions below call it, and Postgres checks EXECUTE on the *caller's*
-- own grants for nested calls, not the definer's, so this still needs no
-- grant to anon/authenticated as long as nothing else calls it directly.
create or replace function public._record_rows(p_user_id uuid)
returns table (
  handle text,
  season_id text,
  season_title text,
  solved integer,
  total_score numeric,
  rank integer,
  capstone_submitted boolean,
  capstone_submitted_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with h as (select p.handle from profiles p where p.id = p_user_id),
  attempts as (
    select c.season_id, s.title as season_title,
           count(*) filter (where a.status = 'scored')::integer as solved,
           sum(a.official_score) filter (where a.status = 'scored') as total_score
    from season_attempts a
    join season_challenges c on c.id = a.challenge_id
    join seasons s on s.id = c.season_id
    where a.user_id = p_user_id
    group by c.season_id, s.title
  ),
  cap as (
    select bool_or(status = 'submitted') as submitted, max(submitted_at) as submitted_at
    from capstone_submissions where user_id = p_user_id
  )
  select h.handle, a.season_id, a.season_title, a.solved, a.total_score,
         (select l.rank from season_leaderboard(a.season_id) l where l.handle = h.handle),
         coalesce(c.submitted, false), c.submitted_at
  from h
  left join attempts a on true
  left join cap c on true;
$$;
revoke all on function public._record_rows(uuid) from public;

-- The signed-in student's own record (private page).
create or replace function public.my_record()
returns table (
  handle text,
  season_id text,
  season_title text,
  solved integer,
  total_score numeric,
  rank integer,
  capstone_submitted boolean,
  capstone_submitted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  return query select * from public._record_rows(auth.uid());
end;
$$;
revoke all on function public.my_record() from public;
grant execute on function public.my_record() to authenticated;

-- The public share view, through an unguessable token only. Looks up the
-- student by token first so a wrong/expired token returns no rows, same
-- as get_shared_capstone.
create or replace function public.get_shared_record(p_token uuid)
returns table (
  handle text,
  season_id text,
  season_title text,
  solved integer,
  total_score numeric,
  rank integer,
  capstone_submitted boolean,
  capstone_submitted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  if p_token is null then
    return;
  end if;
  select id into v_uid from profiles where record_share_token = p_token;
  if v_uid is null then
    return;
  end if;
  return query select * from public._record_rows(v_uid);
end;
$$;
revoke all on function public.get_shared_record(uuid) from public;
grant execute on function public.get_shared_record(uuid) to anon, authenticated;

-- Turn the public record link on (fresh token) or off (deletes it, so the
-- old link stops working immediately).
create or replace function public.set_record_sharing(p_enabled boolean)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  perform set_config('record.sharing', 'on', true);
  update public.profiles
  set record_share_token = case when p_enabled then gen_random_uuid() else null end
  where id = auth.uid()
  returning record_share_token into v_token;
  perform set_config('record.sharing', 'off', true);
  return v_token;
end;
$$;
revoke all on function public.set_record_sharing(boolean) from public;
grant execute on function public.set_record_sharing(boolean) to authenticated;
