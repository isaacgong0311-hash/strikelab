import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "../../../supabase/testing/db";

// Migration 0019: private-by-default capstones, opt-in revocable sharing,
// logged teacher access.

describe("capstone_submissions", () => {
  let t: TestDb;
  let student: string, teacher: string, stranger: string, classId: string;

  beforeEach(async () => {
    t = await createTestDb();
    [student, teacher, stranger] = [await t.user(), await t.user(), await t.user()];
    const { rows } = await t.db.query<{ id: string }>(
      "insert into classes (teacher_id, name, join_code) values ($1, 'Club', 'ABC234') returning id",
      [teacher]
    );
    classId = rows[0].id;
    await t.db.query("insert into class_members (class_id, student_id) values ($1, $2)", [classId, student]);
  });

  const draft = (who: string, klass = classId) =>
    t.as(who, async (tx) =>
      (
        await tx.query<{ id: string }>(
          `insert into capstone_submissions (user_id, class_id, prompt_id, title) values ($1, $2, 'backtest', 'MA crossover')
           returning id`,
          [who, klass]
        )
      ).rows[0].id
    );

  it("is private: only the student can read it directly", async () => {
    await draft(student);
    const visible = (who: string) =>
      t.as(who, async (tx) => (await tx.query("select id from capstone_submissions")).rows.length);
    expect(await visible(student)).toBe(1);
    expect(await visible(teacher)).toBe(0);
    expect(await visible(stranger)).toBe(0);
  });

  it("only lets class members start one, and only for themselves", async () => {
    await expect(draft(stranger)).rejects.toThrow(/row-level security/);
    await expect(
      t.as(stranger, (tx) =>
        tx.query("insert into capstone_submissions (user_id, class_id, prompt_id) values ($1, $2, 'open')", [student, classId])
      )
    ).rejects.toThrow(/row-level security/);
  });

  it("stamps submitted_at once and keeps it through later edits", async () => {
    const id = await draft(student);
    const submittedAt = async () =>
      (await t.db.query<{ s: Date | null }>("select submitted_at as s from capstone_submissions where id = $1", [id])).rows[0].s;
    expect(await submittedAt()).toBeNull();
    await t.as(student, (tx) => tx.query("update capstone_submissions set status = 'submitted' where id = $1", [id]));
    const first = await submittedAt();
    expect(first).toBeInstanceOf(Date);
    await t.as(student, (tx) => tx.query("update capstone_submissions set reflection = 'more' where id = $1", [id]));
    expect(await submittedAt()).toEqual(first);
  });

  it("never lets a client choose a share token or submitted_at", async () => {
    const id = await draft(student);
    await expect(
      t.as(student, (tx) =>
        tx.query("update capstone_submissions set share_token = '00000000-0000-0000-0000-000000000001' where id = $1", [id])
      )
    ).rejects.toThrow(/permission denied/);
    await expect(
      t.as(student, (tx) => tx.query("update capstone_submissions set submitted_at = '2020-01-01' where id = $1", [id]))
    ).rejects.toThrow(/permission denied/);
  });

  it("shares anonymously on opt-in and stops resolving the moment sharing is turned off", async () => {
    const id = await draft(student);
    const token = await t.as(student, async (tx) =>
      (await tx.query<{ t: string }>("select set_capstone_sharing($1, true) as t", [id])).rows[0].t
    );
    expect(token).toMatch(/^[0-9a-f-]{36}$/);

    // Read as an anonymous visitor.
    const shared = async (tok: string) =>
      t.db.transaction(async (tx) => {
        await tx.exec("set local role anon");
        return (await tx.query<Record<string, unknown>>("select * from get_shared_capstone($1)", [tok])).rows;
      });
    const [row] = await shared(token);
    expect(row.title).toBe("MA crossover");
    expect(row).not.toHaveProperty("user_id");

    await t.as(student, (tx) => tx.query("select set_capstone_sharing($1, false)", [id]));
    expect(await shared(token)).toEqual([]);

    // Re-sharing mints a new token; the old one stays dead.
    const again = await t.as(student, async (tx) =>
      (await tx.query<{ t: string }>("select set_capstone_sharing($1, true) as t", [id])).rows[0].t
    );
    expect(again).not.toBe(token);
    expect(await shared(token)).toEqual([]);
  });

  it("won't let anyone else toggle sharing", async () => {
    const id = await draft(student);
    await expect(t.as(teacher, (tx) => tx.query("select set_capstone_sharing($1, true)", [id]))).rejects.toThrow(/capstone_not_found/);
  });

  it("lets the class teacher open it, logs every open, and shows the student the log", async () => {
    const id = await draft(student);
    const opened = await t.as(teacher, async (tx) =>
      (await tx.query<{ title: string }>("select title from open_capstone_as_teacher($1)", [id])).rows
    );
    expect(opened).toEqual([{ title: "MA crossover" }]);
    await expect(t.as(stranger, (tx) => tx.query("select * from open_capstone_as_teacher($1)", [id]))).rejects.toThrow(
      /capstone_not_found/
    );
    const log = await t.as(student, async (tx) => (await tx.query("select viewer_id from capstone_access_log")).rows);
    expect(log).toEqual([{ viewer_id: teacher }]);
    expect(await t.as(stranger, async (tx) => (await tx.query("select 1 from capstone_access_log")).rows.length)).toBe(0);
  });
});
