-- Seasons (proving-ground spec, 2026-10-16): public handles, seasons of timed
-- challenges, per-student attempts, leaderboards from official scores, and
-- the intensive waitlist.
--
-- Every write to attempts goes through start_attempt()/submit_attempt(), and
-- every cross-user read through season_leaderboard(), so row-level security
-- stays closed: students read only their own attempts and nobody can set a
-- score. Official scores are written by the service role (scoring arrives in
-- a later migration/route).

-- ─── Handles ─────────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists handle text;
alter table public.profiles drop constraint if exists profiles_handle_format;
alter table public.profiles
  add constraint profiles_handle_format check (handle is null or handle ~ '^[a-z0-9_]{3,20}$');
create unique index if not exists profiles_handle_unique_idx on public.profiles (lower(handle));

-- ─── Seasons and challenge slots (public schedule) ───────────────────────────
create table if not exists public.seasons (
  id         text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  title      text not null check (char_length(title) between 1 and 80),
  starts_on  date not null,
  ends_on    date not null,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
alter table public.seasons enable row level security;
drop policy if exists "Seasons are public" on public.seasons;
create policy "Seasons are public" on public.seasons for select using (true);

create table if not exists public.season_challenges (
  id                 text primary key check (id ~ '^[a-z0-9-]{2,60}$'),
  season_id          text not null references public.seasons (id) on delete cascade,
  week               smallint not null check (week between 1 and 8),
  template_slug      text not null check (char_length(template_slug) between 1 and 60),
  opens_at           timestamptz not null,
  closes_at          timestamptz not null,
  time_limit_minutes integer not null default 60 check (time_limit_minutes between 5 and 240),
  unique (season_id, week),
  check (closes_at > opens_at)
);
alter table public.season_challenges enable row level security;
drop policy if exists "Season challenges are public" on public.season_challenges;
create policy "Season challenges are public" on public.season_challenges for select using (true);

-- ─── Attempts (student work) ─────────────────────────────────────────────────
create table if not exists public.season_attempts (
  user_id        uuid not null references auth.users (id) on delete cascade,
  challenge_id   text not null references public.season_challenges (id) on delete cascade,
  started_at     timestamptz not null default now(),
  deadline       timestamptz not null,
  submitted_at   timestamptz,
  code           text check (char_length(code) <= 50000),
  explanation    text check (char_length(explanation) <= 2000),
  preview_passed boolean,
  official_score numeric check (official_score is null or (official_score >= 0 and official_score <= 100)),
  status         text not null default 'started'
                 check (status in ('started', 'submitted', 'scored', 'pending_review')),
  primary key (user_id, challenge_id)
);
alter table public.season_attempts enable row level security;
drop policy if exists "Students read own attempts" on public.season_attempts;
create policy "Students read own attempts"
  on public.season_attempts for select
  using (auth.uid() = user_id);
-- No insert/update/delete policies: the RPCs below are the only writers.

-- Start (or resume) an attempt. The clock starts once, on the server.
create or replace function public.start_attempt(p_challenge_id text)
returns table (started_at timestamptz, deadline timestamptz, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_ch  public.season_challenges%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  select * into v_ch from public.season_challenges c where c.id = p_challenge_id;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.season_attempts a where a.user_id = v_uid and a.challenge_id = p_challenge_id) then
    if now() < v_ch.opens_at or now() >= v_ch.closes_at then
      raise exception 'not_open' using errcode = '22023';
    end if;
    insert into public.season_attempts (user_id, challenge_id, started_at, deadline)
    values (v_uid, p_challenge_id, now(),
            least(now() + make_interval(mins => v_ch.time_limit_minutes), v_ch.closes_at));
  end if;
  return query
    select a.started_at, a.deadline, a.status
    from public.season_attempts a
    where a.user_id = v_uid and a.challenge_id = p_challenge_id;
end;
$$;
revoke all on function public.start_attempt(text) from public;
grant execute on function public.start_attempt(text) to authenticated;

-- Submit once, before the deadline (30 seconds of grace for the network).
create or replace function public.submit_attempt(
  p_challenge_id text,
  p_code text,
  p_explanation text,
  p_preview_passed boolean
)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_at  public.season_attempts%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  select * into v_at from public.season_attempts a
  where a.user_id = v_uid and a.challenge_id = p_challenge_id
  for update;
  if not found then
    raise exception 'not_started' using errcode = 'P0002';
  end if;
  if v_at.status <> 'started' then
    raise exception 'already_submitted' using errcode = '22023';
  end if;
  if now() > v_at.deadline + interval '30 seconds' then
    raise exception 'too_late' using errcode = '22023';
  end if;
  update public.season_attempts
  set code = p_code,
      explanation = p_explanation,
      preview_passed = p_preview_passed,
      submitted_at = now(),
      status = 'submitted'
  where user_id = v_uid and challenge_id = p_challenge_id;
  return now();
end;
$$;
revoke all on function public.submit_attempt(text, text, text, boolean) from public;
grant execute on function public.submit_attempt(text, text, text, boolean) to authenticated;

-- Leaderboard from official scores only. Handles, never names. A chapter
-- board (p_class_id) is visible only to that class's members and teacher.
create or replace function public.season_leaderboard(p_season_id text, p_class_id uuid default null)
returns table (rank integer, handle text, total_score numeric, solved integer, is_you boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_class_id is not null and not (
    exists (select 1 from public.class_members m where m.class_id = p_class_id and m.student_id = auth.uid())
    or exists (select 1 from public.classes c where c.id = p_class_id and c.teacher_id = auth.uid())
  ) then
    return;
  end if;
  return query
    with totals as (
      select a.user_id, sum(a.official_score) as total, count(*)::integer as n
      from public.season_attempts a
      join public.season_challenges c on c.id = a.challenge_id
      where c.season_id = p_season_id
        and a.status = 'scored'
        and a.official_score is not null
        and (p_class_id is null or exists (
          select 1 from public.class_members m where m.class_id = p_class_id and m.student_id = a.user_id))
      group by a.user_id
    )
    select (rank() over (order by t.total desc, t.n desc))::integer,
           p.handle, t.total, t.n, (t.user_id = auth.uid())
    from totals t
    join public.profiles p on p.id = t.user_id
    where p.handle is not null
    order by 1, p.handle
    limit 100;
end;
$$;
revoke all on function public.season_leaderboard(text, uuid) from public;
grant execute on function public.season_leaderboard(text, uuid) to anon, authenticated;

-- No AI help while a timed attempt is running (extends 0023).
create or replace function public.ai_tutor_allowed()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.class_members m
    join public.classes c on c.id = m.class_id
    where m.student_id = auth.uid()
      and not c.ai_tutor_enabled
  )
  and not exists (
    select 1
    from public.season_attempts a
    where a.user_id = auth.uid()
      and a.status = 'started'
      and now() < a.deadline
  );
$$;
revoke all on function public.ai_tutor_allowed() from public;
grant execute on function public.ai_tutor_allowed() to authenticated;

-- ─── Intensive waitlist (parents; service role only) ─────────────────────────
create table if not exists public.intensive_waitlist (
  id            uuid primary key default gen_random_uuid(),
  parent_email  text not null check (char_length(parent_email) between 3 and 254
                                     and parent_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  student_grade smallint check (student_grade between 6 and 12),
  note          text check (char_length(note) <= 1000),
  source        text check (char_length(source) <= 64),
  created_at    timestamptz not null default now()
);
create unique index if not exists intensive_waitlist_email_idx on public.intensive_waitlist (lower(parent_email));
alter table public.intensive_waitlist enable row level security;
-- No policies: only the server (service role) reads or writes it.
