-- Records and defenses (proving-ground spec, 2026-10-16, §3 "Prove" and
-- "The record"): a reviewer signs off a live defense, and each student has
-- one record page, private until they share it.
--
--   * defenses: written only by the server (service role) after the founder
--     gate, so no student can verify themselves. A student reads their own.
--   * A top-10 season placing appears on a record only after a 'placing'
--     defense for that season is verified; until then the student sees it as
--     pending and a shared record leaves it out.
--   * Records use handles, never names. Sharing mints an unguessable token;
--     turning it off deletes the token, so old links stop working.
--   * Rehearsal seasons (seasons.is_rehearsal) never appear on a record.

-- ─── Rehearsal seasons ───────────────────────────────────────────────────────
alter table public.seasons add column if not exists is_rehearsal boolean not null default false;

-- ─── Defenses ────────────────────────────────────────────────────────────────
create table if not exists public.defenses (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  kind             text not null check (kind in ('capstone', 'placing')),
  season_id        text references public.seasons (id) on delete cascade,
  capstone_id      uuid references public.capstone_submissions (id) on delete set null,
  outcome          text not null check (outcome in ('verified', 'not_verified')),
  -- A minor's call needs a parent's consent; the reviewer confirms it was
  -- recorded (or that the student is 18+) before any defense is saved.
  consent_confirmed boolean not null check (consent_confirmed),
  reviewer_id      uuid references auth.users (id) on delete set null,
  reviewer_label   text not null check (char_length(reviewer_label) between 1 and 60),
  notes            text check (char_length(notes) <= 1000),
  defended_on      date not null default current_date,
  created_at       timestamptz not null default now(),
  check ((kind = 'placing') = (season_id is not null))
);
create index if not exists defenses_user_idx on public.defenses (user_id);
alter table public.defenses enable row level security;
drop policy if exists "Students read own defenses" on public.defenses;
create policy "Students read own defenses"
  on public.defenses for select
  using (auth.uid() = user_id);
-- No insert/update/delete policies: only the server writes, after the founder gate.

-- ─── Record sharing ──────────────────────────────────────────────────────────
create table if not exists public.student_records (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  share_token uuid unique,
  updated_at  timestamptz not null default now()
);
alter table public.student_records enable row level security;
drop policy if exists "Students read own record settings" on public.student_records;
create policy "Students read own record settings"
  on public.student_records for select
  using (auth.uid() = user_id);
-- Written only through set_record_sharing().

-- The record as JSON. Internal: callers below decide whose record and
-- whether it is the public (shared) view.
create or replace function public.record_json(p_user uuid, p_public boolean)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_handle text;
  v_seasons jsonb;
  v_capstone jsonb;
begin
  select handle into v_handle from public.profiles where id = p_user;

  with totals as (
    select c.season_id, a.user_id, sum(a.official_score) as total, count(*)::integer as solved
    from public.season_attempts a
    join public.season_challenges c on c.id = a.challenge_id
    join public.seasons s on s.id = c.season_id
    join public.profiles p on p.id = a.user_id
    where a.status = 'scored' and a.official_score is not null
      and not s.is_rehearsal and p.handle is not null
    group by c.season_id, a.user_id
  ),
  ranked as (
    select t.*, (rank() over (partition by t.season_id order by t.total desc, t.solved desc))::integer as rank,
           count(*) over (partition by t.season_id)::integer as players
    from totals t
  ),
  mine as (
    select r.*, s.title, s.ends_on,
           exists (select 1 from public.defenses d
                   where d.user_id = p_user and d.kind = 'placing'
                     and d.season_id = r.season_id and d.outcome = 'verified') as placing_verified
    from ranked r
    join public.seasons s on s.id = r.season_id
    where r.user_id = p_user
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'season_id', m.season_id,
           'title', m.title,
           'total_score', round(m.total, 1),
           'solved', m.solved,
           'players', m.players,
           -- A top-10 rank shows only once its defense is verified; the owner
           -- sees it marked pending, a shared record leaves it out.
           'rank', case when m.rank > 10 or m.placing_verified or not p_public then m.rank end,
           'top_ten', m.rank <= 10,
           'placing_verified', m.placing_verified,
           'challenges', (
             select coalesce(jsonb_agg(jsonb_build_object(
                      'week', c.week, 'template_slug', c.template_slug,
                      'official_score', round(a.official_score, 1)) order by c.week), '[]'::jsonb)
             from public.season_attempts a
             join public.season_challenges c on c.id = a.challenge_id
             where a.user_id = p_user and c.season_id = m.season_id
               and a.status = 'scored' and a.official_score is not null)
         ) order by m.ends_on desc), '[]'::jsonb)
  into v_seasons
  from mine m;

  select jsonb_build_object(
           'title', cs.title,
           'defended_on', d.defended_on,
           'reviewer', d.reviewer_label,
           'share_token', case when p_public then null else cs.share_token end,
           'public_link', cs.share_token is not null)
  into v_capstone
  from public.defenses d
  left join public.capstone_submissions cs on cs.id = d.capstone_id
  where d.user_id = p_user and d.kind = 'capstone' and d.outcome = 'verified'
  order by d.defended_on desc, d.created_at desc
  limit 1;

  return jsonb_build_object(
    'handle', v_handle,
    'seasons', v_seasons,
    'verified_capstone', v_capstone
  );
end;
$$;
revoke all on function public.record_json(uuid, boolean) from public, anon, authenticated;

-- The signed-in student's own record, plus their sharing state.
create or replace function public.my_record()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  return public.record_json(v_uid, false)
    || jsonb_build_object('share_token', (select share_token from public.student_records where user_id = v_uid));
end;
$$;
revoke all on function public.my_record() from public;
grant execute on function public.my_record() to authenticated;

-- Turn public sharing on (new token) or off (token deleted). Needs a handle,
-- because a shared record is shown under it.
create or replace function public.set_record_sharing(p_enabled boolean)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_token uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if p_enabled and not exists (select 1 from public.profiles where id = v_uid and handle is not null) then
    raise exception 'handle_required' using errcode = '22023';
  end if;
  insert into public.student_records (user_id, share_token, updated_at)
  values (v_uid, case when p_enabled then gen_random_uuid() end, now())
  on conflict (user_id) do update
    set share_token = case when p_enabled then gen_random_uuid() end,
        updated_at = now()
  returning share_token into v_token;
  return v_token;
end;
$$;
revoke all on function public.set_record_sharing(boolean) from public;
grant execute on function public.set_record_sharing(boolean) to authenticated;

-- The public view of a shared record. Null when the token is unknown or revoked.
create or replace function public.get_shared_record(p_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  select r.user_id into v_user
  from public.student_records r
  join public.profiles p on p.id = r.user_id
  where r.share_token = p_token and p.handle is not null;
  if v_user is null then
    return null;
  end if;
  return public.record_json(v_user, true);
end;
$$;
revoke all on function public.get_shared_record(uuid) from public;
grant execute on function public.get_shared_record(uuid) to anon, authenticated;
