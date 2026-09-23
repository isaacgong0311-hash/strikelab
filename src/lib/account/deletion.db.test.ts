import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";

/**
 * E5: deleting an account (auth.users row, which the account-deletion route
 * does through the Supabase admin API) must remove every row that belongs
 * to the learner, across all migrations, with no foreign key blocking it.
 */
describe("account deletion", () => {
  it("removes all of a student's data and nothing of anyone else's", async () => {
    const t = await createTestDb();
    const [student, teacher, other] = [await t.user(), await t.user(), await t.user()];
    const { rows } = await t.db.query<{ id: string }>(
      "insert into classes (teacher_id, name, join_code) values ($1, 'Club', 'AB2345') returning id",
      [teacher]
    );
    const classId = rows[0].id;
    for (const s of [student, other]) {
      await t.db.query("insert into class_members (class_id, student_id) values ($1, $2)", [classId, s]);
      await t.db.query(`insert into progress (user_id, completed) values ($1, '["inv-1"]'::jsonb)`, [s]);
      await t.db.query("insert into session_completions (user_id, session_id, accuracy, duration_ms) values ($1, 'inv-1.1', 1, 1000)", [s]);
      await t.db.query("insert into lesson_submissions (user_id, lesson_id, code) values ($1, '3', 'x')", [s]);
      await t.db.query(
        "insert into capstone_submissions (user_id, class_id, prompt_id, status) values ($1, $2, 'open', 'submitted') returning id",
        [s, classId]
      );
    }
    const capstone = (await t.db.query<{ id: string }>("select id from capstone_submissions where user_id = $1", [student])).rows[0].id;
    await t.as(teacher, (tx) => tx.query("select * from open_capstone_as_teacher($1)", [capstone]));

    await t.db.query("delete from auth.users where id = $1", [student]);

    // Every public table with a user column: nothing left for the student.
    const { rows: cols } = await t.db.query<{ table_name: string; column_name: string }>(
      `select table_name, column_name from information_schema.columns
       where table_schema = 'public' and column_name in ('user_id', 'student_id', 'id')
         and table_name in (select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE')`
    );
    for (const { table_name, column_name } of cols) {
      if (column_name === "id" && table_name !== "profiles") continue;
      const { rows: left } = await t.db.query(`select 1 from public.${table_name} where ${column_name}::text = $1`, [student]);
      expect(left, `${table_name}.${column_name}`).toEqual([]);
    }
    expect((await t.db.query("select 1 from capstone_access_log")).rows).toEqual([]);

    // The classmate and the teacher are untouched.
    expect((await t.db.query("select 1 from progress where user_id = $1", [other])).rows).toHaveLength(1);
    expect((await t.db.query("select 1 from capstone_submissions where user_id = $1", [other])).rows).toHaveLength(1);
    expect((await t.db.query("select 1 from classes where id = $1", [classId])).rows).toHaveLength(1);
  });
});
