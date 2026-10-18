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
    const anonymous = await t.db.transaction(async (tx) => {
      await tx.exec("set local role anon");
      return (await tx.query("select handle from season_leaderboard('s1', $1)", [klass])).rows;
    });
    expect(anonymous).toEqual([]);
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
