import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";

// Migration 0018: students own their code; their class teacher can read it.
describe("lesson_submissions RLS", () => {
  it("lets students write their own code and teachers read their students' code", async () => {
    const t = await createTestDb();
    const [student, teacher, stranger] = [await t.user(), await t.user(), await t.user()];
    const { rows } = await t.db.query<{ id: string }>(
      "insert into classes (teacher_id, name, join_code) values ($1, 'Club', 'ABC234') returning id",
      [teacher]
    );
    await t.db.query("insert into class_members (class_id, student_id) values ($1, $2)", [rows[0].id, student]);

    await t.as(student, (tx) =>
      tx.query(
        `insert into lesson_submissions (user_id, lesson_id, code) values ($1, '3', 'print(1)')
         on conflict (user_id, lesson_id) do update set code = excluded.code`,
        [student]
      )
    );

    const read = (viewer: string) =>
      t.as(viewer, async (tx) => (await tx.query("select code from lesson_submissions")).rows.length);
    expect(await read(student)).toBe(1);
    expect(await read(teacher)).toBe(1);
    expect(await read(stranger)).toBe(0);

    // Nobody writes code into someone else's row, teachers included.
    for (const other of [teacher, stranger]) {
      await expect(
        t.as(other, (tx) => tx.query("insert into lesson_submissions (user_id, lesson_id, code) values ($1, '4', 'x')", [student]))
      ).rejects.toThrow(/row-level security/);
      const updated = await t.as(other, async (tx) =>
        (await tx.query("update lesson_submissions set code = 'hacked' where user_id = $1 returning 1", [student])).rows.length
      );
      expect(updated).toBe(0);
    }
  });

  it("rejects code over 50,000 characters", async () => {
    const t = await createTestDb();
    const student = await t.user();
    await expect(
      t.as(student, (tx) =>
        tx.query("insert into lesson_submissions (user_id, lesson_id, code) values ($1, '3', $2)", [student, "x".repeat(50_001)])
      )
    ).rejects.toThrow(/check constraint/);
  });
});
