import { beforeEach, describe, expect, it } from "vitest";
import { applyMigration, createTestDb, type TestDb } from "../../../supabase/testing/db";

// Migration 0016: completions are stamped by a trigger on progress, from the
// database clock, and are readable only by the learner and their teachers.

type Row = { lesson_id: string; completed_at: Date | null };

async function completions(t: TestDb, userId: string): Promise<Row[]> {
  const { rows } = await t.db.query<Row>(
    "select lesson_id, completed_at from lesson_completions where user_id = $1 order by lesson_id",
    [userId]
  );
  return rows;
}

async function saveProgress(t: TestDb, userId: string, completed: string[]) {
  await t.as(userId, (tx) =>
    tx.query(
      `insert into progress (user_id, completed) values ($1, $2::jsonb)
       on conflict (user_id) do update set completed = excluded.completed`,
      [userId, JSON.stringify(completed)]
    )
  );
}

describe("lesson_completions trigger", () => {
  let t: TestDb;
  beforeEach(async () => {
    t = await createTestDb();
  });

  it("stamps each newly completed lesson once, on the first write and later updates", async () => {
    const student = await t.user();
    await saveProgress(t, student, ["inv-1"]);
    const [first] = await completions(t, student);
    expect(first.lesson_id).toBe("inv-1");
    expect(first.completed_at).toBeInstanceOf(Date);

    await saveProgress(t, student, ["inv-1", "inv-2"]);
    const rows = await completions(t, student);
    expect(rows.map((r) => r.lesson_id)).toEqual(["inv-1", "inv-2"]);
    // Re-saving an already-completed lesson never moves its timestamp.
    expect(rows[0].completed_at).toEqual(first.completed_at);
  });

  it("keeps the first timestamp after a reset and re-completion", async () => {
    const student = await t.user();
    await saveProgress(t, student, ["1"]);
    const [before] = await completions(t, student);
    await saveProgress(t, student, []);
    await saveProgress(t, student, ["1"]);
    expect(await completions(t, student)).toEqual([before]);
  });

  it("ignores junk entries and duplicates in the completed array", async () => {
    const student = await t.user();
    await saveProgress(t, student, ["3", "3", "", "x".repeat(65)]);
    expect((await completions(t, student)).map((r) => r.lesson_id)).toEqual(["3"]);
  });

  it("doesn't let learners write or backdate completions directly", async () => {
    const student = await t.user();
    await expect(
      t.as(student, (tx) =>
        tx.query("insert into lesson_completions (user_id, lesson_id, completed_at) values ($1, 'q3', '2020-01-01')", [student])
      )
    ).rejects.toThrow(/row-level security/);
  });
});

describe("lesson_completions visibility", () => {
  it("is readable by the learner and their class teacher, not by other users", async () => {
    const t = await createTestDb();
    const [student, teacher, stranger, otherTeacher] = [await t.user(), await t.user(), await t.user(), await t.user()];
    const { rows } = await t.db.query<{ id: string }>(
      "insert into classes (teacher_id, name, join_code) values ($1, 'Club', 'ABC234') returning id",
      [teacher]
    );
    await t.db.query("insert into class_members (class_id, student_id) values ($1, $2)", [rows[0].id, student]);
    await t.db.query("insert into classes (teacher_id, name, join_code) values ($1, 'Other', 'XYZ789')", [otherTeacher]);
    await saveProgress(t, student, ["inv-1"]);

    const visibleTo = async (viewer: string) =>
      (await t.as(viewer, (tx) => tx.query("select lesson_id from lesson_completions"))).rows.length;

    expect(await visibleTo(student)).toBe(1);
    expect(await visibleTo(teacher)).toBe(1);
    expect(await visibleTo(stranger)).toBe(0);
    expect(await visibleTo(otherTeacher)).toBe(0);
  });
});

describe("migration 0016 on existing data", () => {
  it("records pre-existing completions without inventing timestamps", async () => {
    const t = await createTestDb({ upTo: "0015_fix_class_rls_recursion.sql" });
    const student = await t.user();
    await t.db.query(`insert into progress (user_id, completed) values ($1, '["inv-1","1"]'::jsonb)`, [student]);

    await applyMigration(t.db, "0016_lesson_completions.sql");
    expect(await completions(t, student)).toEqual([
      { lesson_id: "1", completed_at: null },
      { lesson_id: "inv-1", completed_at: null },
    ]);

    // A later sync that still lists them doesn't stamp them with "now".
    await saveProgress(t, student, ["inv-1", "1", "2"]);
    const rows = await completions(t, student);
    expect(rows.filter((r) => r.completed_at === null).map((r) => r.lesson_id)).toEqual(["1", "inv-1"]);
    expect(rows.find((r) => r.lesson_id === "2")?.completed_at).toBeInstanceOf(Date);
  });
});
