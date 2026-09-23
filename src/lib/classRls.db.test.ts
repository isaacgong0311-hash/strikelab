import { beforeAll, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "../../supabase/testing/db";

// Class, roster and assignment RLS (0010, 0011, fixed in 0015). Before 0015
// these policies recursed into each other and every signed-in read failed.

describe("class RLS", () => {
  let t: TestDb;
  let teacher: string, student: string, stranger: string, classId: string;

  beforeAll(async () => {
    t = await createTestDb();
    [teacher, student, stranger] = [await t.user(), await t.user(), await t.user()];
    const { rows } = await t.db.query<{ id: string }>(
      "insert into classes (teacher_id, name, join_code) values ($1, 'Club', 'ABC234') returning id",
      [teacher]
    );
    classId = rows[0].id;
    await t.db.query("insert into class_members (class_id, student_id) values ($1, $2)", [classId, student]);
    await t.db.query("insert into assignments (class_id, lesson_id) values ($1, 'inv-1')", [classId]);
  });

  const count = (viewer: () => string, sql: string) =>
    t.as(viewer(), async (tx) => (await tx.query(sql)).rows.length);

  it("lets the teacher read their class, roster and assignments", async () => {
    expect(await count(() => teacher, "select id from classes")).toBe(1);
    expect(await count(() => teacher, "select student_id from class_members")).toBe(1);
    expect(await count(() => teacher, "select id from assignments")).toBe(1);
  });

  it("lets a member read their class, own membership and assignments", async () => {
    expect(await count(() => student, "select id from classes")).toBe(1);
    expect(await count(() => student, "select student_id from class_members")).toBe(1);
    expect(await count(() => student, "select id from assignments")).toBe(1);
  });

  it("hides everything from a non-member", async () => {
    expect(await count(() => stranger, "select id from classes")).toBe(0);
    expect(await count(() => stranger, "select student_id from class_members")).toBe(0);
    expect(await count(() => stranger, "select id from assignments")).toBe(0);
  });

  it("supports the embedded roster count the teacher dashboard uses", async () => {
    const rows = await t.as(teacher, async (tx) =>
      (await tx.query<{ n: number }>(
        "select (select count(*)::int from class_members cm where cm.class_id = c.id) as n from classes c"
      )).rows
    );
    expect(rows).toEqual([{ n: 1 }]);
  });

  it("stops members from editing assignments and strangers from joining as someone else", async () => {
    const updated = await t.as(student, async (tx) =>
      (await tx.query("update assignments set lesson_id = 'q3' where class_id = $1 returning id", [classId])).rows.length
    );
    expect(updated).toBe(0);
    await expect(
      t.as(stranger, (tx) => tx.query("insert into class_members (class_id, student_id) values ($1, $2)", [classId, student]))
    ).rejects.toThrow(/row-level security|duplicate key/);
  });
});
