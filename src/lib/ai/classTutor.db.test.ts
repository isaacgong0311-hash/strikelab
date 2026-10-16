import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";

/**
 * Migration 0023 against the real schema: the AI tutor is off for anyone in a
 * class whose leader hasn't enabled it, on for independents, and only the
 * class's own teacher can change the setting.
 */
describe("per-class AI tutor switch (0023)", () => {
  async function setup() {
    const t = await createTestDb();
    const [teacher, student, otherTeacher, loner] = [await t.user(), await t.user(), await t.user(), await t.user()];
    const klass = await t.as(teacher, async (tx) =>
      (await tx.query<{ id: string }>("insert into classes (teacher_id, name, join_code) values ($1, 'Club', 'AAAA22') returning id", [teacher])).rows[0].id
    );
    await t.as(student, (tx) => tx.query("insert into class_members (class_id, student_id) values ($1, $2)", [klass, student]));
    const allowed = (user: string) => t.as(user, async (tx) => (await tx.query<{ ai_tutor_allowed: boolean }>("select ai_tutor_allowed()")).rows[0].ai_tutor_allowed);
    return { t, teacher, student, otherTeacher, loner, klass, allowed };
  }

  it("is off by default for a student in a class, and on for someone in no class", async () => {
    const { student, loner, allowed } = await setup();
    expect(await allowed(student)).toBe(false);
    expect(await allowed(loner)).toBe(true);
  });

  it("turns on when the class's teacher enables it, and off again", async () => {
    const { t, teacher, student, klass, allowed } = await setup();
    await t.as(teacher, (tx) => tx.query("update classes set ai_tutor_enabled = true where id = $1", [klass]));
    expect(await allowed(student)).toBe(true);
    await t.as(teacher, (tx) => tx.query("update classes set ai_tutor_enabled = false where id = $1", [klass]));
    expect(await allowed(student)).toBe(false);
  });

  it("stays off if the student is in any class that has it off", async () => {
    const { t, teacher, otherTeacher, student, klass, allowed } = await setup();
    await t.as(teacher, (tx) => tx.query("update classes set ai_tutor_enabled = true where id = $1", [klass]));
    const second = await t.as(otherTeacher, async (tx) =>
      (await tx.query<{ id: string }>("insert into classes (teacher_id, name, join_code) values ($1, 'Other', 'BBBB22') returning id", [otherTeacher])).rows[0].id
    );
    await t.as(student, (tx) => tx.query("insert into class_members (class_id, student_id) values ($1, $2)", [second, student]));
    expect(await allowed(student)).toBe(false);
  });

  it("lets neither a student nor another teacher change the setting", async () => {
    const { t, student, otherTeacher, klass, allowed } = await setup();
    const asStudent = await t.as(student, (tx) => tx.query("update classes set ai_tutor_enabled = true where id = $1 returning id", [klass]));
    const asOther = await t.as(otherTeacher, (tx) => tx.query("update classes set ai_tutor_enabled = true where id = $1 returning id", [klass]));
    expect(asStudent.rows).toHaveLength(0);
    expect(asOther.rows).toHaveLength(0);
    expect(await allowed(student)).toBe(false);
  });

  it("returns true with no signed-in user (no memberships to protect)", async () => {
    const { t } = await setup();
    const r = await t.db.query<{ ai_tutor_allowed: boolean }>("select ai_tutor_allowed()");
    expect(r.rows[0].ai_tutor_allowed).toBe(true); // no auth.uid(): no memberships, nothing to protect, nothing leaked
  });
});
