-- Private-by-default capstone (master plan A5): the week-6 artifact a
-- student can show. One per student per cohort class.
--
-- Access model:
--   * the student reads and edits their own row (RLS);
--   * a teacher opens a student's capstone only through
--     open_capstone_as_teacher(), which checks ownership of the class and
--     writes an access-log row, so viewing is a deliberate, recorded act;
--   * public sharing is opt-in: set_capstone_sharing() mints an unguessable
--     token (the client can never choose or keep one), and turning sharing
--     off deletes it, so the old link stops working immediately;
--   * the share page reads through get_shared_capstone(), which returns the
--     work only, never the student's name or id.

create table if not exists public.capstone_submissions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  class_id        uuid not null references public.classes (id) on delete cascade,
  prompt_id       text not null check (prompt_id in ('option-pricing', 'backtest', 'open')),
  title           text not null default '' check (char_length(title) <= 120),
  thesis          text not null default '' check (char_length(thesis) <= 2000),
  code            text not null default '' check (char_length(code) <= 50000),
  result_summary  text not null default '' check (char_length(result_summary) <= 4000),
  reflection      text not null default '' check (char_length(reflection) <= 4000),
  status          text not null default 'draft' check (status in ('draft', 'submitted')),
  share_token     uuid unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  submitted_at    timestamptz,
  unique (user_id, class_id)
);

create index if not exists capstone_submissions_class_idx on public.capstone_submissions (class_id);

alter table public.capstone_submissions enable row level security;

drop policy if exists "Students read own capstone" on public.capstone_submissions;
create policy "Students read own capstone"
  on public.capstone_submissions for select
  using (auth.uid() = user_id);

-- A student may only start a capstone for a class they belong to.
drop policy if exists "Students create own capstone" on public.capstone_submissions;
create policy "Students create own capstone"
  on public.capstone_submissions for insert
  with check (auth.uid() = user_id and public.is_class_member(class_id));

drop policy if exists "Students edit own capstone" on public.capstone_submissions;
create policy "Students edit own capstone"
  on public.capstone_submissions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Students delete own capstone" on public.capstone_submissions;
create policy "Students delete own capstone"
  on public.capstone_submissions for delete
  using (auth.uid() = user_id);

-- Clients may write the content columns only. share_token, submitted_at,
-- ids and timestamps are set by the functions/trigger below.
revoke insert, update on public.capstone_submissions from anon, authenticated;
grant insert (user_id, class_id, prompt_id, title, thesis, code, result_summary, reflection, status)
  on public.capstone_submissions to authenticated;
grant update (prompt_id, title, thesis, code, result_summary, reflection, status)
  on public.capstone_submissions to authenticated;

-- updated_at on every write; submitted_at the first time status becomes
-- 'submitted' (kept on later edits so on-time submission is stable).
create or replace function public.capstone_stamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.status = 'submitted' and (tg_op = 'INSERT' or old.submitted_at is null) then
    new.submitted_at := now();
  elsif tg_op = 'UPDATE' then
    new.submitted_at := old.submitted_at;
  end if;
  if tg_op = 'UPDATE' then
    new.share_token := case when current_setting('capstone.sharing', true) = 'on' then new.share_token else old.share_token end;
  else
    new.share_token := null;
  end if;
  return new;
end;
$$;

drop trigger if exists capstone_stamp on public.capstone_submissions;
create trigger capstone_stamp
  before insert or update on public.capstone_submissions
  for each row execute function public.capstone_stamp();

-- Turn public sharing on (new random token) or off (token deleted).
create or replace function public.set_capstone_sharing(p_capstone_id uuid, p_enabled boolean)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token uuid;
  v_rows integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  perform set_config('capstone.sharing', 'on', true);
  update public.capstone_submissions
  set share_token = case when p_enabled then gen_random_uuid() else null end
  where id = p_capstone_id and user_id = auth.uid()
  returning share_token into v_token;
  get diagnostics v_rows = row_count;
  perform set_config('capstone.sharing', 'off', true);
  if v_rows = 0 then
    raise exception 'capstone_not_found' using errcode = 'P0002';
  end if;
  return v_token;
end;
$$;

-- The public share view: the work only, no name or ids.
create or replace function public.get_shared_capstone(p_token uuid)
returns table (
  prompt_id text,
  title text,
  thesis text,
  code text,
  result_summary text,
  reflection text,
  submitted_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select c.prompt_id, c.title, c.thesis, c.code, c.result_summary, c.reflection, c.submitted_at
  from public.capstone_submissions c
  where p_token is not null and c.share_token = p_token;
$$;

create table if not exists public.capstone_access_log (
  id           bigint generated always as identity primary key,
  capstone_id  uuid not null references public.capstone_submissions (id) on delete cascade,
  viewer_id    uuid not null references auth.users (id) on delete cascade,
  viewed_at    timestamptz not null default now()
);

alter table public.capstone_access_log enable row level security;

-- Students can see who opened their capstone and when.
drop policy if exists "Students read access to own capstone" on public.capstone_access_log;
create policy "Students read access to own capstone"
  on public.capstone_access_log for select
  using (
    exists (
      select 1 from public.capstone_submissions c
      where c.id = capstone_access_log.capstone_id and c.user_id = auth.uid()
    )
  );

-- A teacher opens one student's capstone; every open is logged.
create or replace function public.open_capstone_as_teacher(p_capstone_id uuid)
returns setof public.capstone_submissions
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.capstone_submissions c
    join public.classes k on k.id = c.class_id
    where c.id = p_capstone_id and k.teacher_id = auth.uid()
  ) then
    raise exception 'capstone_not_found' using errcode = 'P0002';
  end if;
  insert into public.capstone_access_log (capstone_id, viewer_id) values (p_capstone_id, auth.uid());
  return query select * from public.capstone_submissions where id = p_capstone_id;
end;
$$;

revoke all on function public.set_capstone_sharing(uuid, boolean) from public;
revoke all on function public.get_shared_capstone(uuid) from public;
revoke all on function public.open_capstone_as_teacher(uuid) from public;
grant execute on function public.set_capstone_sharing(uuid, boolean) to authenticated;
grant execute on function public.get_shared_capstone(uuid) to anon, authenticated;
grant execute on function public.open_capstone_as_teacher(uuid) to authenticated;
