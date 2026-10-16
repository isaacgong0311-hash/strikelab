# Seasons engine and intensive waitlist (Oct 31 milestone) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Students can pick a public handle, start a timed season challenge with their own randomized numbers, preview it in the browser, submit code plus an explanation, and appear on season and chapter leaderboards (from official scores); parents can join the January intensive waitlist.

**Architecture:** One migration (`0024_seasons.sql`) adds handles, seasons, challenge slots, attempts, a waitlist table, and security-definer RPCs that own every write (start, submit) and every cross-user read (leaderboard), so row-level security stays closed. Challenge *content* lives in code as templates (`src/lib/seasons/templates.ts`): a public preview test that goes to the browser, and a hidden official test that only the server runs. Per-student parameters come from an HMAC of (challenge, user) with a server secret.

**Tech Stack:** Next.js 16 route handlers and server components, Supabase (Postgres + RLS), PGlite for database tests, Pyodide (browser worker for previews; Node in tests to prove templates are correct), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-16-strikelab-proving-ground-design.md`. **Not in this plan** (Nov 29 milestone): official server-side scoring, record page, defense sign-off, rehearsal season. Until official scoring exists, leaderboards are empty by design (they read official scores only).

Code blocks preceded by a file-path comment are complete file contents.

---

## File map

| File | Responsibility |
|---|---|
| `supabase/migrations/0024_seasons.sql` | Tables, RLS, RPCs, AI-tutor block during attempts |
| `src/lib/seasons/handle.ts` | Handle validation (format, reserved, blocked words) |
| `src/lib/seasons/window.ts` | Open/closed status and countdown formatting |
| `src/lib/seasons/params.ts` | Deterministic per-student parameters (server only) |
| `src/lib/seasons/templates.ts` | Challenge templates: prompt, starter, preview test, official test |
| `src/lib/seasons/planned.ts` | The planned Season 1 dates shown before a season exists in the database |
| `src/app/api/seasons/handle/route.ts` | Set your handle |
| `src/app/api/seasons/challenges/[id]/start/route.ts` | Start a timed attempt, get your numbers |
| `src/app/api/seasons/challenges/[id]/submit/route.ts` | Submit code + explanation |
| `src/app/api/seasons/[seasonId]/leaderboard/route.ts` | Season or chapter leaderboard |
| `src/app/seasons/page.tsx`, `HandleForm.tsx` | Season home: how it works, handle, challenges, leaderboard |
| `src/app/seasons/[challengeId]/page.tsx`, `AttemptClient.tsx` | The timed attempt |
| `src/app/intensive/page.tsx`, `WaitlistForm.tsx` | Parent-facing waitlist page |
| `src/app/api/intensive/waitlist/route.ts` | Store a waitlist entry |
| Modified: `src/lib/rateLimit.ts`, `src/lib/trust/dataMap.ts`, `docs/trust/data-map.md`, `src/app/privacy/page.tsx`, `scripts/metrics/check-migrations.sql`, `supabase/apply-all-migrations.sql`, `.env.example`, `src/components/Nav.tsx`, `src/components/Footer.tsx`, `src/app/sitemap.ts`, `tests/accessibility/core.spec.ts` | Wiring |

---

### Task 1: Migration 0024

<!-- file: supabase/migrations/0024_seasons.sql -->
```sql
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
```

- [ ] **Step 1:** Write the database test (below), run `npx vitest run src/lib/seasons/seasons.db.test.ts`, expect FAIL (`relation "public.seasons" does not exist`).
- [ ] **Step 2:** Add the migration above. Run the test again, expect PASS.
- [ ] **Step 3:** Add the check-migrations row and regenerate the bundle: `npm run db:combine`.
- [ ] **Step 4:** Commit: `git commit -m "feat: seasons schema, attempt RPCs, leaderboard, waitlist (0024)"`

<!-- file: src/lib/seasons/seasons.db.test.ts -->
```ts
import { describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "../../../supabase/testing/db";

/** Seasons (0024) against the real schema with RLS on. */
async function setup(opts: { opensInMinutes?: number; closesInMinutes?: number; limit?: number } = {}) {
  const t = await createTestDb();
  const opens = opts.opensInMinutes ?? -60;
  const closes = opts.closesInMinutes ?? 60;
  await t.db.query("insert into seasons (id, title, starts_on, ends_on) values ('s1', 'Season 1', current_date, current_date + 21)");
  await t.db.query(
    `insert into season_challenges (id, season_id, week, template_slug, opens_at, closes_at, time_limit_minutes)
     values ('s1-w1', 's1', 1, 'put-call-parity', now() + make_interval(mins => $1), now() + make_interval(mins => $2), $3)`,
    [opens, closes, opts.limit ?? 30]
  );
  return t;
}

const start = (t: TestDb, user: string) =>
  t.as(user, async (tx) => (await tx.query<{ started_at: Date; deadline: Date; status: string }>("select * from start_attempt('s1-w1')")).rows[0]);
const submit = (t: TestDb, user: string) =>
  t.as(user, (tx) => tx.query("select submit_attempt('s1-w1', 'def f(): pass', 'because', true)"));

describe("seasons (0024)", () => {
  it("starts an attempt once, with the server's clock and the time limit as the deadline", async () => {
    const t = await setup({ limit: 30 });
    const u = await t.user();
    const first = await start(t, u);
    expect(first.status).toBe("started");
    const minutes = (first.deadline.getTime() - first.started_at.getTime()) / 60000;
    expect(Math.round(minutes)).toBe(30);
    const again = await start(t, u);
    expect(again.started_at.getTime()).toBe(first.started_at.getTime()); // no restarting the clock
  });

  it("caps the deadline at the challenge's closing time", async () => {
    const t = await setup({ closesInMinutes: 10, limit: 60 });
    const u = await t.user();
    const a = await start(t, u);
    expect((a.deadline.getTime() - a.started_at.getTime()) / 60000).toBeLessThanOrEqual(10.1);
  });

  it("refuses to start before it opens or after it closes", async () => {
    const early = await setup({ opensInMinutes: 30, closesInMinutes: 90 });
    await expect(start(early, await early.user())).rejects.toThrow(/not_open/);
    const late = await setup({ opensInMinutes: -90, closesInMinutes: -30 });
    await expect(start(late, await late.user())).rejects.toThrow(/not_open/);
  });

  it("accepts one submission before the deadline and rejects a second or a late one", async () => {
    const t = await setup();
    const u = await t.user();
    await start(t, u);
    await submit(t, u);
    await expect(submit(t, u)).rejects.toThrow(/already_submitted/);

    const v = await t.user();
    await start(t, v);
    await t.db.query("update season_attempts set deadline = now() - interval '5 minutes' where user_id = $1", [v]);
    await expect(submit(t, v)).rejects.toThrow(/too_late/);
    await expect(submit(t, await t.user())).rejects.toThrow(/not_started/);
  });

  it("keeps attempts private and lets nobody write a score", async () => {
    const t = await setup();
    const [u, other] = [await t.user(), await t.user()];
    await start(t, u);
    const seen = await t.as(other, async (tx) => (await tx.query("select 1 from season_attempts")).rows.length);
    expect(seen).toBe(0);
    const wrote = await t.as(u, async (tx) =>
      (await tx.query("update season_attempts set official_score = 100, status = 'scored' returning 1")).rows.length
    );
    expect(wrote).toBe(0);
  });

  it("ranks by official score, shows handles only, and hides students without a handle", async () => {
    const t = await setup();
    const [a, b, c] = [await t.user(), await t.user(), await t.user()];
    for (const u of [a, b, c]) await start(t, u);
    await t.db.query("update profiles set handle = 'alpha' where id = $1", [a]);
    await t.db.query("update profiles set handle = 'bravo', display_name = 'Real Name' where id = $1", [b]);
    await t.db.query("update season_attempts set status = 'scored', official_score = 80 where user_id = $1", [a]);
    await t.db.query("update season_attempts set status = 'scored', official_score = 95 where user_id = $1", [b]);
    await t.db.query("update season_attempts set status = 'scored', official_score = 99 where user_id = $1", [c]); // no handle
    const rows = await t.as(a, async (tx) => (await tx.query<{ rank: number; handle: string; is_you: boolean }>(
      "select rank, handle, is_you from season_leaderboard('s1')")).rows);
    expect(rows).toEqual([
      { rank: 1, handle: "bravo", is_you: false },
      { rank: 2, handle: "alpha", is_you: true },
    ]);
    expect(JSON.stringify(rows)).not.toContain("Real Name");
  });

  it("shows a chapter board only to that chapter's members and teacher", async () => {
    const t = await setup();
    const [teacher, member, outsider] = [await t.user(), await t.user(), await t.user()];
    const klass = await t.as(teacher, async (tx) =>
      (await tx.query<{ id: string }>("insert into classes (teacher_id, name, join_code) values ($1, 'Club', 'ABCD23') returning id", [teacher])).rows[0].id);
    await t.as(member, (tx) => tx.query("insert into class_members (class_id, student_id) values ($1, $2)", [klass, member]));
    await start(t, member);
    await t.db.query("update profiles set handle = 'member1' where id = $1", [member]);
    await t.db.query("update season_attempts set status = 'scored', official_score = 50 where user_id = $1", [member]);
    const board = (u: string) => t.as(u, async (tx) => (await tx.query("select handle from season_leaderboard('s1', $1)", [klass])).rows.length);
    expect(await board(member)).toBe(1);
    expect(await board(teacher)).toBe(1);
    expect(await board(outsider)).toBe(0);
  });

  it("switches the AI tutor off while a timed attempt is running", async () => {
    const t = await setup();
    const u = await t.user();
    const allowed = () => t.as(u, async (tx) => (await tx.query<{ ai_tutor_allowed: boolean }>("select ai_tutor_allowed()")).rows[0].ai_tutor_allowed);
    expect(await allowed()).toBe(true);
    await start(t, u);
    expect(await allowed()).toBe(false);
    await submit(t, u);
    expect(await allowed()).toBe(true);
  });

  it("rejects malformed handles and duplicate handles in any letter case", async () => {
    const t = await setup();
    const [a, b] = [await t.user(), await t.user()];
    await expect(t.db.query("update profiles set handle = 'No Spaces!' where id = $1", [a])).rejects.toThrow();
    await t.db.query("update profiles set handle = 'quant_kid' where id = $1", [a]);
    await expect(t.db.query("update profiles set handle = 'quant_kid' where id = $1", [b])).rejects.toThrow();
  });

  it("keeps the waitlist closed to every signed-in user", async () => {
    const t = await setup();
    await t.db.query("insert into intensive_waitlist (parent_email, student_grade) values ('parent@example.com', 10)");
    const u = await t.user();
    const seen = await t.as(u, async (tx) => (await tx.query("select 1 from intensive_waitlist")).rows.length);
    expect(seen).toBe(0);
    await expect(t.db.query("insert into intensive_waitlist (parent_email) values ('not-an-email')")).rejects.toThrow();
  });
});
```

Check-migrations row (append after `0023`):

```sql
  ('0024_seasons',                  to_regclass('public.season_attempts') is not null)
```

---

### Task 2: Handles

<!-- file: src/lib/seasons/handle.ts -->
```ts
/**
 * Public leaderboard handles (proving-ground spec §6): never a real name.
 * The database enforces format and uniqueness (0024); this adds the rules a
 * regex can't: reserved words and an obvious-slur filter, checked after
 * undoing common digit swaps. Kept short on purpose: false positives on
 * ordinary words are worse than a rare miss, and the founder can rename.
 */
export const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

const RESERVED = new Set([
  "admin", "administrator", "strikelab", "moderator", "mod", "support",
  "staff", "founder", "official", "system", "null", "undefined", "anonymous",
]);

const BLOCKED = ["fuck", "shit", "bitch", "cunt", "nigg", "faggot", "nazi", "porn", "slut", "whore", "pussy"];

export type HandleCheck = { ok: true; handle: string } | { ok: false; error: string };

export function checkHandle(raw: unknown): HandleCheck {
  if (typeof raw !== "string") return { ok: false, error: "Choose a handle" };
  const handle = raw.trim().toLowerCase();
  if (!HANDLE_PATTERN.test(handle)) {
    return { ok: false, error: "Use 3 to 20 characters: lowercase letters, numbers and underscores" };
  }
  if (RESERVED.has(handle)) return { ok: false, error: "That handle is reserved" };
  const squashed = handle
    .replace(/_/g, "")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t");
  if (BLOCKED.some((w) => squashed.includes(w))) return { ok: false, error: "Pick a different handle" };
  return { ok: true, handle };
}
```

<!-- file: src/lib/seasons/handle.test.ts -->
```ts
import { describe, expect, it } from "vitest";
import { checkHandle } from "./handle";

describe("checkHandle", () => {
  it("accepts and normalises ordinary handles", () => {
    expect(checkHandle("  Quant_Kid42 ")).toEqual({ ok: true, handle: "quant_kid42" });
    for (const ok of ["abc", "a_b_c", "skillz", "peacock", "grape_ape", "x".repeat(20)]) expect(checkHandle(ok).ok).toBe(true);
  });

  it("rejects the wrong shape", () => {
    for (const bad of [undefined, 3, "", "ab", "x".repeat(21), "has space", "dash-ed", "émile"]) expect(checkHandle(bad).ok).toBe(false);
  });

  it("rejects reserved words and slurs, including digit swaps", () => {
    for (const bad of ["admin", "strikelab", "founder", "sh1t_head", "b1tch", "pr0n_n0t", "n4z1"]) {
      const r = checkHandle(bad);
      if (bad === "pr0n_n0t") continue; // "pron" isn't on the list: shows the filter is narrow on purpose
      expect(r.ok, bad).toBe(false);
    }
  });
});
```

- [ ] Write the test, run `npx vitest run src/lib/seasons/handle.test.ts` (FAIL: module missing), add the module, re-run (PASS), commit.

---

### Task 3: Windows and countdowns

<!-- file: src/lib/seasons/window.ts -->
```ts
export type ChallengeStatus = "upcoming" | "open" | "closed";

export function challengeStatus(now: Date, opensAt: string, closesAt: string): ChallengeStatus {
  const t = now.getTime();
  if (t < Date.parse(opensAt)) return "upcoming";
  if (t >= Date.parse(closesAt)) return "closed";
  return "open";
}

export function secondsLeft(now: Date, deadline: string): number {
  return Math.max(0, Math.floor((Date.parse(deadline) - now.getTime()) / 1000));
}

/** "4:05", or "1:02:09" past an hour. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const ss = String(r).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}
```

<!-- file: src/lib/seasons/window.test.ts -->
```ts
import { describe, expect, it } from "vitest";
import { challengeStatus, formatClock, secondsLeft } from "./window";

describe("season windows", () => {
  const opens = "2026-11-30T14:00:00Z";
  const closes = "2026-12-06T23:59:00Z";
  it("classifies before, during and after", () => {
    expect(challengeStatus(new Date("2026-11-30T13:59:59Z"), opens, closes)).toBe("upcoming");
    expect(challengeStatus(new Date("2026-11-30T14:00:00Z"), opens, closes)).toBe("open");
    expect(challengeStatus(new Date("2026-12-06T23:59:00Z"), opens, closes)).toBe("closed");
  });
  it("counts down without going negative", () => {
    expect(secondsLeft(new Date("2026-12-01T00:00:00Z"), "2026-12-01T00:01:30Z")).toBe(90);
    expect(secondsLeft(new Date("2026-12-01T00:05:00Z"), "2026-12-01T00:01:30Z")).toBe(0);
  });
  it("formats clocks", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(245)).toBe("4:05");
    expect(formatClock(3729)).toBe("1:02:09");
  });
});
```

- [ ] Test first (FAIL), module, PASS, commit.

---

### Task 4: Per-student parameters

<!-- file: src/lib/seasons/params.ts -->
```ts
import { createHmac } from "node:crypto";

/**
 * Each student gets their own numbers for a challenge (proving-ground spec
 * §6.3): the same student always gets the same values, different students
 * get different ones, and nobody can work out another student's without the
 * server secret. Server only (node:crypto).
 */
export interface ParamSpec {
  name: string;
  min: number;
  max: number;
  step: number;
}

export type Params = Record<string, number>;

function decimalsOf(step: number): number {
  const text = String(step);
  return text.includes(".") ? text.split(".")[1].length : 0;
}

export function deriveParams(
  specs: readonly ParamSpec[],
  seed: { challengeId: string; userId: string },
  secret: string
): Params {
  if (!secret) throw new Error("SEASON_PARAM_SECRET is not set");
  const out: Params = {};
  specs.forEach((spec, i) => {
    const digest = createHmac("sha256", secret)
      .update(`${seed.challengeId}\u0000${seed.userId}\u0000${spec.name}\u0000${i}`)
      .digest();
    const unit = digest.readUInt32BE(0) / 0x1_0000_0000; // [0, 1)
    const steps = Math.floor((spec.max - spec.min) / spec.step + 1e-9);
    const k = Math.min(steps, Math.floor(unit * (steps + 1)));
    out[spec.name] = Number((spec.min + k * spec.step).toFixed(decimalsOf(spec.step)));
  });
  return out;
}
```

<!-- file: src/lib/seasons/params.test.ts -->
```ts
import { describe, expect, it } from "vitest";
import { deriveParams, type ParamSpec } from "./params";

const SPECS: ParamSpec[] = [
  { name: "S", min: 80, max: 120, step: 1 },
  { name: "r", min: 0.01, max: 0.06, step: 0.005 },
  { name: "T", min: 0.25, max: 2, step: 0.25 },
];

describe("deriveParams", () => {
  it("gives the same student the same numbers every time", () => {
    const a = deriveParams(SPECS, { challengeId: "s1-w1", userId: "u1" }, "secret");
    expect(deriveParams(SPECS, { challengeId: "s1-w1", userId: "u1" }, "secret")).toEqual(a);
  });

  it("gives different students (and challenges, and secrets) different numbers", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) seen.add(JSON.stringify(deriveParams(SPECS, { challengeId: "s1-w1", userId: `u${i}` }, "secret")));
    expect(seen.size).toBeGreaterThan(40);
    const base = deriveParams(SPECS, { challengeId: "s1-w1", userId: "u1" }, "secret");
    expect(deriveParams(SPECS, { challengeId: "s1-w2", userId: "u1" }, "secret")).not.toEqual(base);
    expect(deriveParams(SPECS, { challengeId: "s1-w1", userId: "u1" }, "other")).not.toEqual(base);
  });

  it("stays inside each range, on the step grid", () => {
    for (let i = 0; i < 200; i++) {
      const p = deriveParams(SPECS, { challengeId: "c", userId: `u${i}` }, "k");
      for (const s of SPECS) {
        expect(p[s.name]).toBeGreaterThanOrEqual(s.min);
        expect(p[s.name]).toBeLessThanOrEqual(s.max);
        const k = (p[s.name] - s.min) / s.step;
        expect(Math.abs(k - Math.round(k))).toBeLessThan(1e-6);
      }
    }
  });

  it("refuses to run without a secret", () => {
    expect(() => deriveParams(SPECS, { challengeId: "c", userId: "u" }, "")).toThrow(/SEASON_PARAM_SECRET/);
  });
});
```

- [ ] Test first (FAIL), module, PASS, commit.

---

### Task 5: Challenge templates (proved correct in Pyodide under Node)

<!-- file: src/lib/seasons/templates.ts -->
```ts
import type { ParamSpec, Params } from "./params";

/**
 * Season challenge content lives in code, keyed by the `template_slug` of a
 * `season_challenges` row (0024). Two tests per challenge:
 * - previewTest: public sanity checks with fixed textbook numbers. It goes to
 *   the browser, so it must never contain the answer.
 * - officialTest: hidden; the server runs it with the student's own numbers
 *   and it sets `_score` (0..1). It may contain a reference implementation.
 * templates.test.ts runs both in Pyodide to prove a correct solution scores
 * 1 and the starter code scores 0.
 */
export interface ChallengeTemplate {
  slug: string;
  title: string;
  concept: string;
  paramSpecs: readonly ParamSpec[];
  prompt(p: Params): string;
  starterCode: string;
  previewTest: string;
  officialTest(p: Params): string;
}

const NORM_CDF = `from math import log, sqrt, exp, erf

def norm_cdf(x):
    return 0.5 * (1 + erf(x / sqrt(2)))
`;

const putCallParity: ChallengeTemplate = {
  slug: "put-call-parity",
  title: "Price a put from a call",
  concept: "Put-call parity",
  paramSpecs: [
    { name: "C", min: 2, max: 20, step: 0.5 },
    { name: "S", min: 80, max: 120, step: 1 },
    { name: "K", min: 80, max: 120, step: 1 },
    { name: "T", min: 0.25, max: 2, step: 0.25 },
    { name: "r", min: 0.01, max: 0.06, step: 0.005 },
  ],
  prompt: (p) =>
    `A European call on a stock trading at ${p.S} with strike ${p.K} and ${p.T} years to expiry costs ${p.C}. ` +
    `The risk-free rate is ${p.r} (continuously compounded). Write put_from_parity(call, S, K, T, r) that returns ` +
    `the price of the matching European put, using put-call parity. Then explain, in two or three sentences, why ` +
    `parity has to hold (what trade would make free money if it didn't).`,
  starterCode: `from math import exp

def put_from_parity(call, S, K, T, r):
    # Your code here
    raise NotImplementedError
`,
  previewTest: `_v = put_from_parity(10, 100, 100, 1, 0)
assert isinstance(_v, (int, float)), "Return a number"
assert abs(_v - 10) < 1e-9, "With r = 0 and S = K, the put should cost the same as the call"
assert put_from_parity(10, 100, 100, 1, 0.05) < 10, "A positive rate makes the put cheaper than the call here"
print("Preview checks passed. Your official score is computed with your own numbers after you submit.")
`,
  officialTest: (p) => `from math import exp as _exp
def _ref(call, S, K, T, r):
    return call - S + K * _exp(-r * T)
_cases = [(${p.C}, ${p.S}, ${p.K}, ${p.T}, ${p.r}), (${p.C} + 1, ${p.S}, ${p.K}, ${p.T}, ${p.r}), (${p.C}, ${p.S}, ${p.K}, ${p.T} * 2, ${p.r})]
_passed = 0
for _c in _cases:
    try:
        if abs(put_from_parity(*_c) - _ref(*_c)) <= 1e-6 * max(1.0, abs(_ref(*_c))):
            _passed += 1
    except Exception:
        pass
_score = _passed / len(_cases)
`,
};

const blackScholesCall: ChallengeTemplate = {
  slug: "black-scholes-call",
  title: "Price a call with Black-Scholes",
  concept: "Black-Scholes",
  paramSpecs: [
    { name: "S", min: 80, max: 120, step: 1 },
    { name: "K", min: 80, max: 120, step: 1 },
    { name: "T", min: 0.25, max: 2, step: 0.25 },
    { name: "r", min: 0.01, max: 0.06, step: 0.005 },
    { name: "sigma", min: 0.1, max: 0.5, step: 0.01 },
  ],
  prompt: (p) =>
    `Write black_scholes_call(S, K, T, r, sigma) returning the Black-Scholes price of a European call. ` +
    `Your numbers: S = ${p.S}, K = ${p.K}, T = ${p.T} years, r = ${p.r}, sigma = ${p.sigma}. ` +
    `Then explain, in two or three sentences, why the price goes up when sigma goes up.`,
  starterCode: `${NORM_CDF}
def black_scholes_call(S, K, T, r, sigma):
    # Your code here
    raise NotImplementedError
`,
  previewTest: `_v = black_scholes_call(100, 100, 1, 0.05, 0.2)
assert isinstance(_v, (int, float)), "Return a number"
assert 0 < _v < 100, "A call is worth more than 0 and less than the stock"
assert black_scholes_call(100, 100, 1, 0.05, 0.3) > _v, "More volatility should make the call worth more"
assert black_scholes_call(110, 100, 1, 0.05, 0.2) > _v, "A higher stock price should make the call worth more"
print("Preview checks passed. Your official score is computed with your own numbers after you submit.")
`,
  officialTest: (p) => `from math import log as _log, sqrt as _sqrt, exp as _exp, erf as _erf
def _ncdf(x):
    return 0.5 * (1 + _erf(x / _sqrt(2)))
def _ref(S, K, T, r, sigma):
    d1 = (_log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * _sqrt(T))
    d2 = d1 - sigma * _sqrt(T)
    return S * _ncdf(d1) - K * _exp(-r * T) * _ncdf(d2)
_cases = [(${p.S}, ${p.K}, ${p.T}, ${p.r}, ${p.sigma}), (${p.S} * 1.1, ${p.K}, ${p.T}, ${p.r}, ${p.sigma}), (${p.S}, ${p.K}, ${p.T} * 2, ${p.r}, ${p.sigma})]
_passed = 0
for _c in _cases:
    try:
        if abs(black_scholes_call(*_c) - _ref(*_c)) <= 1e-6 * max(1.0, abs(_ref(*_c))):
            _passed += 1
    except Exception:
        pass
_score = _passed / len(_cases)
`,
};

export const TEMPLATES: Readonly<Record<string, ChallengeTemplate>> = {
  [putCallParity.slug]: putCallParity,
  [blackScholesCall.slug]: blackScholesCall,
};

export function getTemplate(slug: string): ChallengeTemplate | null {
  return Object.prototype.hasOwnProperty.call(TEMPLATES, slug) ? TEMPLATES[slug] : null;
}
```

<!-- file: src/lib/seasons/templates.test.ts -->
```ts
import { beforeAll, describe, expect, it } from "vitest";
import { loadPyodide, type PyodideInterface } from "pyodide";
import { deriveParams } from "./params";
import { TEMPLATES, getTemplate } from "./templates";

// Proves each template is gradeable: a correct solution passes the preview and
// scores 1 officially, with many students' numbers; the starter scores 0.
const SOLUTIONS: Record<string, string> = {
  "put-call-parity": `from math import exp
def put_from_parity(call, S, K, T, r):
    return call - S + K * exp(-r * T)
`,
  "black-scholes-call": `from math import log, sqrt, exp, erf
def norm_cdf(x):
    return 0.5 * (1 + erf(x / sqrt(2)))
def black_scholes_call(S, K, T, r, sigma):
    d1 = (log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * sqrt(T))
    d2 = d1 - sigma * sqrt(T)
    return S * norm_cdf(d1) - K * exp(-r * T) * norm_cdf(d2)
`,
};

let py: PyodideInterface;
beforeAll(async () => {
  py = await loadPyodide();
}, 60_000);

/** Runs code then a test in a fresh namespace; returns `_score` (or null if the test raised). */
function run(code: string, test: string): { score: number | null; error: string | null } {
  const ns = py.toPy({});
  try {
    py.runPython(code, { globals: ns });
    py.runPython(test, { globals: ns });
    const score = ns.get("_score");
    return { score: typeof score === "number" ? score : null, error: null };
  } catch (e) {
    return { score: null, error: String(e) };
  } finally {
    ns.destroy();
  }
}

describe("season challenge templates", () => {
  it("has a solution for every template", () => {
    expect(Object.keys(SOLUTIONS).sort()).toEqual(Object.keys(TEMPLATES).sort());
    expect(getTemplate("nope")).toBeNull();
    expect(getTemplate("__proto__")).toBeNull();
  });

  for (const [slug, template] of Object.entries(TEMPLATES)) {
    it(`${slug}: a correct solution passes the preview and scores 1 with 20 students' numbers`, () => {
      expect(run(SOLUTIONS[slug], template.previewTest).error).toBeNull();
      for (let i = 0; i < 20; i++) {
        const p = deriveParams(template.paramSpecs, { challengeId: `s1-${slug}`, userId: `u${i}` }, "test-secret");
        expect(run(SOLUTIONS[slug], template.officialTest(p)).score, JSON.stringify(p)).toBe(1);
        expect(template.prompt(p)).not.toMatch(/undefined|NaN/);
      }
    }, 60_000);

    it(`${slug}: the starter fails the preview and scores 0`, () => {
      expect(run(template.starterCode, template.previewTest).error).not.toBeNull();
      const p = deriveParams(template.paramSpecs, { challengeId: `s1-${slug}`, userId: "u0" }, "test-secret");
      expect(run(template.starterCode, template.officialTest(p)).score).toBe(0);
    });

    it(`${slug}: the preview test (sent to the browser) contains no reference answer`, () => {
      expect(template.previewTest).not.toMatch(/_ref|_score|_cases/);
    });
  }
});
```

- [ ] Test first (FAIL), module, PASS (about 10 s: Pyodide boots once), commit.

---

### Task 6: Rate-limit bucket, environment, planned season

Modify `src/lib/rateLimit.ts`, add after `"class-settings"`:

```ts
  "season-attempt": [60, 3600],
  "season-handle": [10, 3600],
```

Append to `.env.example`:

```bash
# Seasons: secret for each student's own challenge numbers (any long random
# string; changing it changes everyone's numbers, so set it once). Server-only.
SEASON_PARAM_SECRET=
```

<!-- file: src/lib/seasons/planned.ts -->
```ts
/**
 * Shown on /seasons only while no season exists in the database yet. These are
 * the dates in the proving-ground spec; change them here if the plan moves.
 */
export const PLANNED_SEASON = {
  title: "Season 1",
  startsOn: "2026-11-30",
  endsOn: "2026-12-20",
} as const;
```

---

### Task 7: Handle API

<!-- file: src/app/api/seasons/handle/route.ts -->
```ts
/**
 * POST /api/seasons/handle { handle } — set the public name shown on
 * leaderboards. Never a real name (proving-ground spec §6.1).
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { rateLimit } from "@/lib/rateLimit";
import { checkHandle } from "@/lib/seasons/handle";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const limited = await rateLimit(auth.supabase, "season-handle");
  if (limited) return limited;

  const body = (await req.json().catch(() => ({}))) as { handle?: unknown };
  const check = checkHandle(body.handle);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

  const { error } = await auth.supabase.from("profiles").update({ handle: check.handle }).eq("id", auth.userId);
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "That handle is taken" }, { status: 409 });
    console.error("[seasons/handle] POST", error.message);
    return NextResponse.json({ error: "Couldn't save your handle" }, { status: 500 });
  }
  return NextResponse.json({ handle: check.handle });
}
```

---

### Task 8: Start and submit APIs

<!-- file: src/app/api/seasons/challenges/[id]/start/route.ts -->
```ts
/**
 * POST /api/seasons/challenges/[id]/start — start (or resume) a timed attempt.
 * The clock starts on the server (start_attempt, 0024). Returns this student's
 * own numbers, the prompt written with them, the starter code and the public
 * preview test. The official test never leaves the server.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { rateLimit } from "@/lib/rateLimit";
import { getTemplate } from "@/lib/seasons/templates";
import { deriveParams } from "@/lib/seasons/params";

const MESSAGES: Record<string, [number, string]> = {
  not_open: [409, "This challenge isn't open right now."],
  not_found: [404, "That challenge doesn't exist."],
};

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const limited = await rateLimit(auth.supabase, "season-attempt");
  if (limited) return limited;

  const secret = process.env.SEASON_PARAM_SECRET ?? "";
  if (!secret) return NextResponse.json({ error: "Seasons aren't set up on this server yet." }, { status: 503 });

  const { id } = await params;
  const { data: challenge, error: readError } = await auth.supabase
    .from("season_challenges")
    .select("id, template_slug")
    .eq("id", id)
    .maybeSingle();
  if (readError) return NextResponse.json({ error: "We can't reach the season database right now." }, { status: 503 });
  if (!challenge) return NextResponse.json({ error: MESSAGES.not_found[1] }, { status: 404 });

  const template = getTemplate(challenge.template_slug as string);
  if (!template) {
    console.error("[seasons/start] unknown template", challenge.template_slug);
    return NextResponse.json({ error: "This challenge isn't ready yet." }, { status: 500 });
  }

  const { data, error } = await auth.supabase.rpc("start_attempt", { p_challenge_id: id });
  if (error) {
    const key = Object.keys(MESSAGES).find((k) => error.message.includes(k));
    if (key) return NextResponse.json({ error: MESSAGES[key][1] }, { status: MESSAGES[key][0] });
    console.error("[seasons/start]", error.message);
    return NextResponse.json({ error: "Couldn't start the challenge" }, { status: 500 });
  }
  const row = (Array.isArray(data) ? data[0] : data) as { started_at: string; deadline: string; status: string };

  const p = deriveParams(template.paramSpecs, { challengeId: id, userId: auth.userId }, secret);
  return NextResponse.json({
    startedAt: row.started_at,
    deadline: row.deadline,
    status: row.status,
    title: template.title,
    concept: template.concept,
    prompt: template.prompt(p),
    params: p,
    starterCode: template.starterCode,
    previewTest: template.previewTest,
  });
}
```

<!-- file: src/app/api/seasons/challenges/[id]/submit/route.ts -->
```ts
/**
 * POST /api/seasons/challenges/[id]/submit { code, explanation, previewPassed }
 * — one submission, before the deadline (submit_attempt, 0024). The official
 * score is computed later on the server; the browser preview never counts.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { rateLimit } from "@/lib/rateLimit";

export const MIN_EXPLANATION = 20;

const MESSAGES: Record<string, [number, string]> = {
  too_late: [409, "Time was up, so this submission wasn't accepted."],
  already_submitted: [409, "You've already submitted this challenge."],
  not_started: [409, "Start the challenge before submitting."],
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const limited = await rateLimit(auth.supabase, "season-attempt");
  if (limited) return limited;

  const body = (await req.json().catch(() => ({}))) as { code?: unknown; explanation?: unknown; previewPassed?: unknown };
  if (typeof body.code !== "string" || body.code.trim() === "" || body.code.length > 50_000) {
    return NextResponse.json({ error: "Include your code (up to 50,000 characters)." }, { status: 400 });
  }
  const explanation = typeof body.explanation === "string" ? body.explanation.trim() : "";
  if (explanation.length < MIN_EXPLANATION || explanation.length > 2000) {
    return NextResponse.json({ error: `Explain your answer in at least ${MIN_EXPLANATION} characters (up to 2,000).` }, { status: 400 });
  }

  const { id } = await params;
  const { data, error } = await auth.supabase.rpc("submit_attempt", {
    p_challenge_id: id,
    p_code: body.code,
    p_explanation: explanation,
    p_preview_passed: body.previewPassed === true,
  });
  if (error) {
    const key = Object.keys(MESSAGES).find((k) => error.message.includes(k));
    if (key) return NextResponse.json({ error: MESSAGES[key][1] }, { status: MESSAGES[key][0] });
    console.error("[seasons/submit]", error.message);
    return NextResponse.json({ error: "Couldn't submit. Try again in a moment." }, { status: 500 });
  }
  return NextResponse.json({ submittedAt: data as string });
}
```

<!-- file: src/app/api/seasons/challenges/[id]/routes.test.ts -->
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireUserMock = vi.fn();
vi.mock("@/lib/supabase/requireUser", () => ({ requireUser: () => requireUserMock() }));
vi.mock("@/lib/rateLimit", () => ({ rateLimit: async () => null }));

import { POST as start } from "./start/route";
import { POST as submit } from "./submit/route";

type RpcResult = { data: unknown; error: { message: string } | null };

function signedIn(opts: { challenge?: unknown; readError?: boolean; rpc?: RpcResult }) {
  const rpc = vi.fn(async () => opts.rpc ?? { data: [{ started_at: "2026-11-30T15:00:00Z", deadline: "2026-11-30T16:00:00Z", status: "started" }], error: null });
  requireUserMock.mockResolvedValue({
    userId: "user-1",
    supabase: {
      rpc,
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => (opts.readError ? { data: null, error: { message: "down" } } : { data: opts.challenge ?? null, error: null }),
          }),
        }),
      }),
    },
  });
  return rpc;
}

const ctx = { params: Promise.resolve({ id: "s1-w1" }) };
const req = (body?: unknown) => new NextRequest("http://localhost/x", { method: "POST", body: JSON.stringify(body ?? {}) });

describe("season attempt routes", () => {
  beforeEach(() => {
    requireUserMock.mockReset();
    process.env.SEASON_PARAM_SECRET = "test-secret";
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("start: returns the student's own numbers and the preview test, never the official test", async () => {
    signedIn({ challenge: { id: "s1-w1", template_slug: "put-call-parity" } });
    const res = await start(req(), ctx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ status: "started", title: "Price a put from a call", deadline: "2026-11-30T16:00:00Z" });
    expect(Object.keys(body.params).sort()).toEqual(["C", "K", "S", "T", "r"]);
    expect(body.prompt).toContain(String(body.params.S));
    expect(JSON.stringify(body)).not.toMatch(/_ref|_score|officialTest/);
  });

  it("start: maps database refusals to plain answers", async () => {
    signedIn({ challenge: null });
    expect((await start(req(), ctx)).status).toBe(404);
    signedIn({ readError: true });
    expect((await start(req(), ctx)).status).toBe(503);
    signedIn({ challenge: { id: "s1-w1", template_slug: "put-call-parity" }, rpc: { data: null, error: { message: "not_open" } } });
    const closed = await start(req(), ctx);
    expect(closed.status).toBe(409);
    expect((await closed.json()).error).toMatch(/isn't open/);
  });

  it("start: refuses without the server secret", async () => {
    process.env.SEASON_PARAM_SECRET = "";
    signedIn({ challenge: { id: "s1-w1", template_slug: "put-call-parity" } });
    expect((await start(req(), ctx)).status).toBe(503);
  });

  it("submit: validates code and explanation before touching the database", async () => {
    const rpc = signedIn({});
    expect((await submit(req({ code: "", explanation: "x".repeat(30) }), ctx)).status).toBe(400);
    expect((await submit(req({ code: "x = 1", explanation: "too short" }), ctx)).status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("submit: sends one submission and maps late and repeat submissions", async () => {
    const rpc = signedIn({ rpc: { data: "2026-11-30T15:30:00Z", error: null } });
    const ok = await submit(req({ code: "x = 1", explanation: "Because parity links calls and puts.", previewPassed: true }), ctx);
    expect(ok.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("submit_attempt", {
      p_challenge_id: "s1-w1",
      p_code: "x = 1",
      p_explanation: "Because parity links calls and puts.",
      p_preview_passed: true,
    });
    signedIn({ rpc: { data: null, error: { message: "too_late" } } });
    expect((await submit(req({ code: "x = 1", explanation: "Because parity links calls and puts." }), ctx)).status).toBe(409);
  });

  it("both routes reject someone who isn't signed in", async () => {
    requireUserMock.mockResolvedValue({ error: "Not authenticated", status: 401 });
    expect((await start(req(), ctx)).status).toBe(401);
    expect((await submit(req(), ctx)).status).toBe(401);
  });
});
```

- [ ] Tests first (FAIL), routes, PASS, commit.

---

### Task 9: Leaderboard API

<!-- file: src/app/api/seasons/[seasonId]/leaderboard/route.ts -->
```ts
/**
 * GET /api/seasons/[seasonId]/leaderboard?classId= — the season board, or a
 * chapter's board (members and teacher only; enforced in the database).
 * Handles only, official scores only (season_leaderboard, 0024).
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, { params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = await params;
  const classId = req.nextUrl.searchParams.get("classId");
  if (classId && !UUID.test(classId)) return NextResponse.json({ error: "Bad chapter id" }, { status: 400 });

  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ error: "Seasons aren't set up on this server yet." }, { status: 503 });

  const { data, error } = await supabase.rpc("season_leaderboard", { p_season_id: seasonId, p_class_id: classId });
  if (error) {
    console.error("[seasons/leaderboard]", error.message);
    return NextResponse.json({ error: "We can't reach the season database right now." }, { status: 503 });
  }
  return NextResponse.json({ rows: data ?? [] });
}
```

---

### Task 10: Pages

<!-- file: src/app/seasons/HandleForm.tsx -->
```tsx
"use client";

import { useState } from "react";

/** Pick the public name shown on leaderboards. Shown only to signed-in students without one. */
export default function HandleForm() {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/seasons/handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: value }),
      });
      const data = (await res.json().catch(() => ({}))) as { handle?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't save your handle");
      setSaved(data.handle ?? value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your handle");
    } finally {
      setBusy(false);
    }
  }

  if (saved) return <p role="status">You&apos;ll appear on leaderboards as <strong>{saved}</strong>.</p>;

  return (
    <form onSubmit={save} style={{ display: "grid", gap: "0.5rem", maxWidth: "26rem" }}>
      <label htmlFor="handle" style={{ fontWeight: 700 }}>Choose your leaderboard handle</label>
      <p id="handle-help" style={{ margin: 0, fontSize: "0.875rem" }}>
        3 to 20 lowercase letters, numbers or underscores. Not your real name: this is what everyone sees.
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          id="handle"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby="handle-help"
          autoComplete="off"
          maxLength={20}
          required
          style={{ flex: 1, minHeight: 44, padding: "0 0.75rem", borderRadius: 10, border: "1px solid var(--sl-border-strong)" }}
        />
        <button type="submit" className="v2-btn" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
      {error && <p role="alert" style={{ margin: 0, color: "var(--sl-danger)" }}>{error}</p>}
    </form>
  );
}
```

<!-- file: src/app/seasons/page.tsx -->
```tsx
import Link from "next/link";
import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/seasons/templates";
import { challengeStatus } from "@/lib/seasons/window";
import { PLANNED_SEASON } from "@/lib/seasons/planned";
import HandleForm from "./HandleForm";

export const metadata = pageMetadata({
  path: "/seasons",
  title: "Seasons: prove you can do quant work",
  description:
    "Free four-week seasons of timed quant challenges for high schoolers. Your own numbers, explain your answer, ranked under a handle, ending in a verified record.",
});

export const dynamic = "force-dynamic";

interface SeasonRow { id: string; title: string; starts_on: string; ends_on: string }
interface ChallengeRow { id: string; week: number; template_slug: string; opens_at: string; closes_at: string; time_limit_minutes: number }
interface BoardRow { rank: number; handle: string; total_score: number; solved: number; is_you: boolean }

function readable(date: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

async function load() {
  const supabase = await getSupabaseServer();
  if (!supabase) return { season: null, challenges: [], board: [], needsHandle: false, signedIn: false };
  const today = new Date().toISOString().slice(0, 10);
  const { data: seasons } = await supabase.from("seasons").select("id, title, starts_on, ends_on").gte("ends_on", today).order("starts_on").limit(1);
  const season = (seasons?.[0] as SeasonRow | undefined) ?? null;
  const { data: auth } = await supabase.auth.getUser();
  let needsHandle = false;
  if (auth.user) {
    const { data: profile } = await supabase.from("profiles").select("handle").eq("id", auth.user.id).maybeSingle();
    needsHandle = !profile?.handle;
  }
  if (!season) return { season: null, challenges: [], board: [], needsHandle, signedIn: Boolean(auth.user) };
  const [{ data: challenges }, { data: board }] = await Promise.all([
    supabase.from("season_challenges").select("id, week, template_slug, opens_at, closes_at, time_limit_minutes").eq("season_id", season.id).order("week"),
    supabase.rpc("season_leaderboard", { p_season_id: season.id, p_class_id: null }),
  ]);
  return {
    season,
    challenges: (challenges ?? []) as ChallengeRow[],
    board: (board ?? []) as BoardRow[],
    needsHandle,
    signedIn: Boolean(auth.user),
  };
}

export default async function SeasonsPage() {
  const { season, challenges, board, needsHandle, signedIn } = await load();
  const now = new Date();
  const title = season?.title ?? PLANNED_SEASON.title;
  const starts = season?.starts_on ?? PLANNED_SEASON.startsOn;
  const ends = season?.ends_on ?? PLANNED_SEASON.endsOn;

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>Seasons</p>
          <h1 className={styles.h1}>Prove you can do quant work.</h1>
          <p className={styles.lede}>
            {title}: {readable(starts)} to {readable(ends)}. One timed challenge a week, free. Your own numbers, your
            own explanation, ranked under a handle, and a record you can show at the end.
          </p>
          {!signedIn && (
            <div className={styles.ctaRow}>
              <Link href="/sign-up?next=%2Fseasons" className={styles.primary}>Create a free account to play</Link>
              <Link href="/lessons" className={styles.secondary}>Train with the lessons first</Link>
            </div>
          )}
          {needsHandle && <div style={{ marginTop: "1.5rem" }}><HandleForm /></div>}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="season-how">
        <div className={styles.wrap}>
          <h2 id="season-how" className={styles.h2}>How a season works</h2>
          <ul className={styles.checks} style={{ maxWidth: "44rem" }}>
            <li>Each week a challenge opens. When you start it, a timer starts too, and the AI tutor switches off until you submit.</li>
            <li>Your numbers are yours alone, so nobody can hand you an answer.</li>
            <li>You submit your code and a short explanation of why it works. Your score is computed on our server, not in your browser.</li>
            <li>Leaderboards show handles, never real names. Clubs can play together and get their own board.</li>
            <li>Top finishers and capstones are verified in a short live conversation before they appear on a record.</li>
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="season-challenges">
        <div className={styles.wrap}>
          <h2 id="season-challenges" className={styles.h2}>This season&apos;s challenges</h2>
          {challenges.length === 0 ? (
            <p className={styles.body}>The challenges appear here when the season is scheduled.</p>
          ) : (
            <ol className={styles.checks}>
              {challenges.map((c) => {
                const t = getTemplate(c.template_slug);
                const status = challengeStatus(now, c.opens_at, c.closes_at);
                return (
                  <li key={c.id}>
                    <strong>Week {c.week}: {t?.title ?? "Challenge"}</strong> ({t?.concept ?? ""}, {c.time_limit_minutes} minutes).{" "}
                    {status === "open" ? (
                      <Link href={`/seasons/${c.id}`} className={styles.textLink}>Open now</Link>
                    ) : status === "upcoming" ? (
                      <span>Opens {readable(c.opens_at.slice(0, 10))}</span>
                    ) : (
                      <span>Closed</span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="season-board">
        <div className={styles.wrap}>
          <h2 id="season-board" className={styles.h2}>Leaderboard</h2>
          {board.length === 0 ? (
            <p className={styles.body}>Scores appear here once the first challenge has been graded.</p>
          ) : (
            <table style={{ borderCollapse: "collapse", minWidth: "min(100%, 32rem)" }}>
              <caption className="sl-visually-hidden">Season leaderboard by handle</caption>
              <thead><tr><th scope="col">Rank</th><th scope="col">Handle</th><th scope="col">Score</th><th scope="col">Solved</th></tr></thead>
              <tbody>
                {board.map((r) => (
                  <tr key={`${r.rank}-${r.handle}`} style={r.is_you ? { fontWeight: 800 } : undefined}>
                    <td>{r.rank}</td><td>{r.handle}{r.is_you ? " (you)" : ""}</td><td>{Number(r.total_score).toFixed(0)}</td><td>{r.solved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
```

<!-- file: src/app/seasons/[challengeId]/page.tsx -->
```tsx
import { privatePageMetadata } from "@/lib/seo";
import AttemptClient from "./AttemptClient";

export const metadata = privatePageMetadata({
  title: "Season challenge",
  description: "A timed StrikeLab season challenge.",
});

export default async function ChallengePage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = await params;
  return <AttemptClient challengeId={challengeId} />;
}
```

<!-- file: src/app/seasons/[challengeId]/AttemptClient.tsx -->
```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MiniEditor from "@/components/MiniEditor";
import styles from "@/components/marketing/marketing.module.css";
import { loadPythonRuntime } from "@/lib/pythonRuntime";
import { formatClock, secondsLeft } from "@/lib/seasons/window";

interface Started {
  startedAt: string;
  deadline: string;
  status: string;
  title: string;
  concept: string;
  prompt: string;
  starterCode: string;
  previewTest: string;
}

type Phase = "ready" | "working" | "submitted";

export default function AttemptClient({ challengeId }: { challengeId: string }) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [attempt, setAttempt] = useState<Started | null>(null);
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [output, setOutput] = useState("");
  const [previewPassed, setPreviewPassed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!attempt || phase !== "working") return;
    const tick = () => setLeft(secondsLeft(new Date(), attempt.deadline));
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [attempt, phase]);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/seasons/challenges/${encodeURIComponent(challengeId)}/start`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as Started & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't start the challenge");
      setAttempt(data);
      setCode(data.starterCode);
      setLeft(secondsLeft(new Date(), data.deadline));
      setPhase(data.status === "started" ? "working" : "submitted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the challenge");
    } finally {
      setBusy(false);
    }
  }

  async function preview() {
    if (!attempt) return;
    setOutput("Running the preview checks…");
    try {
      const runtime = await loadPythonRuntime();
      await runtime.runPython(code);
      await runtime.runPython(attempt.previewTest);
      setPreviewPassed(true);
      setOutput("Preview checks passed. Your official score is computed with your own numbers after you submit.");
    } catch (e) {
      setPreviewPassed(false);
      setOutput(e instanceof Error ? e.message : String(e));
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/seasons/challenges/${encodeURIComponent(challengeId)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, explanation, previewPassed }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't submit");
      setPhase("submitted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't submit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.narrow}>
          <p className={styles.kicker}>Season challenge</p>
          <h1 className={styles.h1}>{attempt?.title ?? "Ready when you are"}</h1>

          {phase === "ready" && (
            <>
              <ul className={styles.checks}>
                <li>The timer starts when you press Start, and it doesn&apos;t pause.</li>
                <li>The AI tutor is off until you submit. Your notes and the lessons are fine.</li>
                <li>You get your own numbers, so your answer is yours alone.</li>
                <li>You&apos;ll submit your code and a short explanation of why it works.</li>
              </ul>
              <div className={styles.ctaRow}>
                <button type="button" className={styles.primary} onClick={start} disabled={busy}>
                  {busy ? "Starting…" : "Start the challenge"}
                </button>
                <Link href="/seasons" className={styles.secondary}>Back to the season</Link>
              </div>
            </>
          )}

          {phase === "working" && attempt && (
            <>
              <p className={styles.body} role="timer" aria-live="off">
                <strong>Time left: {left === null ? "…" : formatClock(left)}</strong> ({attempt.concept})
              </p>
              <p className={styles.body}>{attempt.prompt}</p>
              <MiniEditor value={code} onChange={setCode} ariaLabel="Your solution" />
              <div className={styles.ctaRow}>
                <button type="button" className={styles.secondary} onClick={preview}>Run the preview checks</button>
              </div>
              {output && <pre role="status" style={{ whiteSpace: "pre-wrap" }}>{output}</pre>}
              <label htmlFor="explanation" style={{ display: "block", fontWeight: 700, marginTop: "1rem" }}>
                Explain why your answer is right (2 or 3 sentences)
              </label>
              <textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={4}
                maxLength={2000}
                style={{ width: "100%", padding: "0.75rem", borderRadius: 10, border: "1px solid var(--sl-border-strong)" }}
              />
              <div className={styles.ctaRow}>
                <button type="button" className={styles.primary} onClick={submit} disabled={busy}>
                  {busy ? "Submitting…" : "Submit"}
                </button>
              </div>
            </>
          )}

          {phase === "submitted" && (
            <>
              <p className={styles.lede} role="status">Submitted. Your official score appears on the leaderboard once it&apos;s graded.</p>
              <Link href="/seasons" className={styles.primary}>Back to the season</Link>
            </>
          )}

          {error && <p role="alert" style={{ color: "var(--sl-danger)" }}>{error}</p>}
        </div>
      </section>
    </div>
  );
}
```

---

### Task 11: Intensive waitlist

<!-- file: src/app/api/intensive/waitlist/route.ts -->
```ts
/**
 * POST /api/intensive/waitlist — a parent or guardian joins the waitlist for
 * the January intensive. Nothing is charged; we email when a cohort fills.
 * Stored with the service role only (intensive_waitlist has no RLS policies).
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    parentEmail?: unknown;
    grade?: unknown;
    note?: unknown;
    isGuardian?: unknown;
    source?: unknown;
    website?: unknown; // honeypot: real people never fill it in
  };

  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });

  const email = typeof body.parentEmail === "string" ? body.parentEmail.trim() : "";
  if (!EMAIL.test(email) || email.length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (body.isGuardian !== true) {
    return NextResponse.json({ error: "Please confirm you're the student's parent or guardian." }, { status: 400 });
  }
  const grade = typeof body.grade === "number" && Number.isInteger(body.grade) && body.grade >= 6 && body.grade <= 12 ? body.grade : null;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : null;
  const source = typeof body.source === "string" ? body.source.slice(0, 64) : null;

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "The waitlist isn't open on this server yet." }, { status: 503 });

  const { error } = await admin.from("intensive_waitlist").insert({ parent_email: email, student_grade: grade, note: note || null, source });
  if (error && error.code !== "23505") {
    console.error("[intensive/waitlist]", error.message);
    return NextResponse.json({ error: "Couldn't save that. Try again in a moment." }, { status: 500 });
  }
  return NextResponse.json({ ok: true }); // 23505: already on the list, same answer
}
```

<!-- file: src/app/api/intensive/waitlist/route.test.ts -->
```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const insert = vi.fn();
const getSupabaseAdminMock = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => getSupabaseAdminMock() }));

import { POST } from "./route";

const post = (body: unknown) => POST(new NextRequest("http://localhost/api/intensive/waitlist", { method: "POST", body: JSON.stringify(body) }));
const valid = { parentEmail: "parent@example.com", grade: 10, isGuardian: true, source: "intensive-page" };

describe("POST /api/intensive/waitlist", () => {
  beforeEach(() => {
    insert.mockReset().mockResolvedValue({ error: null });
    getSupabaseAdminMock.mockReset().mockReturnValue({ from: () => ({ insert }) });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("stores a parent's entry", async () => {
    expect((await post(valid)).status).toBe(200);
    expect(insert).toHaveBeenCalledWith({ parent_email: "parent@example.com", student_grade: 10, note: null, source: "intensive-page" });
  });

  it("requires a real email and the guardian confirmation", async () => {
    expect((await post({ ...valid, parentEmail: "nope" })).status).toBe(400);
    expect((await post({ ...valid, isGuardian: false })).status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it("drops a bad grade instead of failing", async () => {
    await post({ ...valid, grade: 15 });
    expect(insert.mock.calls[0][0]).toMatchObject({ student_grade: null });
  });

  it("quietly ignores bots that fill the hidden field", async () => {
    expect((await post({ ...valid, website: "spam.example" })).status).toBe(200);
    expect(insert).not.toHaveBeenCalled();
  });

  it("treats signing up twice as success, and reports an unconfigured server", async () => {
    insert.mockResolvedValue({ error: { code: "23505", message: "duplicate" } });
    expect((await post(valid)).status).toBe(200);
    getSupabaseAdminMock.mockReturnValue(null);
    expect((await post(valid)).status).toBe(503);
  });
});
```

<!-- file: src/app/intensive/WaitlistForm.tsx -->
```tsx
"use client";

import { useState } from "react";
import styles from "@/components/marketing/marketing.module.css";

export default function WaitlistForm({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [note, setNote] = useState("");
  const [isGuardian, setIsGuardian] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/intensive/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentEmail: email, grade: grade ? Number(grade) : null, note, isGuardian, source, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't save that");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that");
      setState("idle");
    }
  }

  if (state === "done") {
    return <p role="status" className={styles.lede}>You&apos;re on the list. We&apos;ll email you when the January cohort has dates. Nothing has been charged.</p>;
  }

  const field = { width: "100%", minHeight: 44, padding: "0 0.75rem", borderRadius: 10, border: "1px solid var(--sl-border-strong)" } as const;
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: "0.875rem", maxWidth: "30rem" }}>
      <div>
        <label htmlFor="wl-email" style={{ fontWeight: 700 }}>Parent or guardian email</label>
        <input id="wl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={field} />
      </div>
      <div>
        <label htmlFor="wl-grade" style={{ fontWeight: 700 }}>Student&apos;s grade (optional)</label>
        <select id="wl-grade" value={grade} onChange={(e) => setGrade(e.target.value)} style={field}>
          <option value="">Choose</option>
          {[8, 9, 10, 11, 12].map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="wl-note" style={{ fontWeight: 700 }}>Anything we should know? (optional)</label>
        <textarea id="wl-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} style={{ ...field, padding: "0.75rem" }} />
      </div>
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="wl-website">Website</label>
        <input id="wl-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <label style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
        <input type="checkbox" checked={isGuardian} onChange={(e) => setIsGuardian(e.target.checked)} required />
        <span>I&apos;m the student&apos;s parent or guardian.</span>
      </label>
      <button type="submit" className={styles.primary} disabled={state === "busy"}>
        {state === "busy" ? "Saving…" : "Join the waitlist"}
      </button>
      {error && <p role="alert" style={{ margin: 0, color: "var(--sl-danger)" }}>{error}</p>}
    </form>
  );
}
```

<!-- file: src/app/intensive/page.tsx -->
```tsx
import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import WaitlistForm from "./WaitlistForm";

export const metadata = pageMetadata({
  path: "/intensive",
  title: "The StrikeLab Intensive: six weeks of real quant work",
  description:
    "A small six-week cohort for motivated high schoolers: code real market models, get reviewed, and defend a capstone live. $349. Join the waitlist; nothing is charged until a cohort fills.",
});

export default function IntensivePage() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>For parents and guardians</p>
          <h1 className={styles.h1}>Six weeks of real quant work, with a capstone your student defends.</h1>
          <p className={styles.lede}>
            A small group of 8 to 12 high schoolers. Each week they write code that prices options, measures risk or
            tests a strategy honestly, and get it reviewed. It ends with a capstone they explain, live, to a reviewer:
            something real to show for it.
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="intensive-what">
        <div className={styles.wrap}>
          <h2 id="intensive-what" className={styles.h2}>What it is</h2>
          <ul className={styles.checks} style={{ maxWidth: "44rem" }}>
            <li><strong>$349</strong> for the six weeks. Nothing is charged now: we take payment only once a cohort has enough students.</li>
            <li>Starts in January 2027. Exact dates are set when the cohort fills.</li>
            <li>Run by StrikeLab&apos;s founder with a college mentor. Reviews and the capstone defense are done live, never one-on-one in private: two adults are present, or the call is recorded with your consent.</li>
            <li>Built on StrikeLab&apos;s free lessons, so you can see the material first at <a className={styles.textLink} href="/lessons">strikelab.dev/lessons</a>.</li>
            <li>Students need a laptop or Chromebook and about 3 hours a week.</li>
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="intensive-join">
        <div className={styles.wrap}>
          <h2 id="intensive-join" className={styles.h2}>Join the waitlist</h2>
          <p className={styles.body}>
            We only use this email to tell you about the January cohort. See what we store on the{" "}
            <a className={styles.textLink} href="/trust">student data page</a>.
          </p>
          <div style={{ marginTop: "1rem" }}>
            <WaitlistForm source="intensive-page" />
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

### Task 12: Wiring, data map, privacy, links

- `src/lib/trust/dataMap.ts` STORED_DATA: add
  - `{ what: "Leaderboard handle (chosen by the student; never a real name)", tables: [], student: "Yes", leader: "Yes, on the chapter board", others: "Yes: the handle and score appear on season leaderboards" }` (column on `profiles`, already listed)
  - `{ what: "Season challenge attempts (code, explanation, timing, score)", tables: ["season_attempts"], student: "Yes", leader: "No", others: "Only the handle and total score, on leaderboards" }`
  - `{ what: "Intensive waitlist (a parent's email, the student's grade, an optional note)", tables: ["intensive_waitlist"], student: "No", leader: "No", others: "No. Used only to contact that parent about the cohort" }`
- OPERATIONAL_TABLES: `seasons: "The season schedule (public)"`, `season_challenges: "Challenge slots and time windows (public)"`.
- Mirror the three rows in `docs/trust/data-map.md` and bump "Last checked" to migration `0024`.
- Privacy page: add a sentence under "If you create an account" about handles and season attempts; a sentence under data collection about the waitlist.
- Nav: add `{ href: "/seasons", label: "Seasons" }` after Playground. Footer Product group: `Seasons`; For clubs group: `{ href: "/intensive", label: "Intensive (parents)" }`. Sitemap: `/seasons`, `/intensive`. Accessibility routes: `/seasons`, `/intensive`.
- `npm run db:combine`, `npx tsc --noEmit`, `npm run lint`, `npm test`, `next build`, Playwright.
- Commit.

### Task 13: Browser tests

<!-- file: tests/seasons.spec.ts -->
```ts
import { expect, test } from "@playwright/test";

// Without a database (CI and local runs), /seasons shows the planned season
// and how it works; /intensive takes a waitlist entry only with consent.
test("the seasons page explains the season without a database", async ({ page }) => {
  await page.goto("/seasons");
  await expect(page.getByRole("heading", { level: 1, name: /Prove you can do quant work/ })).toBeVisible();
  await expect(page.getByText(/Season 1: November 30 to December 20/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "How a season works" })).toBeVisible();
  await expect(page.getByText(/AI tutor switches off/)).toBeVisible();
});

test("the intensive page shows the price and asks a parent to confirm before joining", async ({ page }) => {
  await page.goto("/intensive");
  await expect(page.getByText(/\$349/).first()).toBeVisible();
  await expect(page.getByText(/Nothing is charged now/)).toBeVisible();
  await page.getByLabel("Parent or guardian email").fill("parent@example.com");
  // The browser blocks submission until the guardian box is ticked.
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.getByText(/You're on the list/)).toHaveCount(0);
});
```

---

## Self-review (done)

- **Spec coverage (Oct 31 scope):** handles (T1, T2, T7), seasons data model (T1), per-student params (T4), timed attempts (T1, T8), AI tutor off during attempts (T1), season and chapter leaderboards (T1, T9, T10), templates with hidden official tests (T5), waitlist page (T11), data map and privacy (T12). Deferred by design to the Nov 29 plan: official scoring, record page, defense sign-off, rehearsal season.
- **Placeholders:** none; every code step has complete code.
- **Names:** `start_attempt`, `submit_attempt`, `season_leaderboard`, `ai_tutor_allowed`, `deriveParams`, `getTemplate`, `checkHandle`, `challengeStatus`, `secondsLeft`, `formatClock`, `PLANNED_SEASON` are used consistently across tasks.
