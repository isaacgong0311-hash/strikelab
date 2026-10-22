import { describe, expect, it } from "vitest";
import { applyMigration, createTestDb, type TestDb } from "../../../supabase/testing/db";

const shared = (t: TestDb, token: string) => t.db.transaction(async (tx) => {
  await tx.exec("set local role anon");
  return (await tx.query<{ handle: string; items: { kind: string; subject_id: string }[] }>(
    "select handle, items from get_shared_record($1)", [token]
  )).rows;
});

describe("verification and record sharing (0025)", () => {
  it("lets students read only their own verifications, with no client writes", async () => {
    const t = await createTestDb();
    const [student, other, reviewer] = [await t.user(), await t.user(), await t.user()];
    await t.db.query(
      "insert into verifications (user_id, kind, subject_id, reviewer_id, parent_consent_recorded) values ($1, 'placing', 's1:1', $2, true)",
      [student, reviewer]
    );
    expect((await t.as(student, (tx) => tx.query("select kind from verifications"))).rows).toHaveLength(1);
    expect((await t.as(other, (tx) => tx.query("select kind from verifications"))).rows).toHaveLength(0);
    await expect(t.as(student, (tx) => tx.query(
      "insert into verifications (user_id, kind, subject_id, reviewer_id, parent_consent_recorded) values ($1, 'placing', 's1:2', $2, true)",
      [student, reviewer]
    ))).rejects.toThrow();
    await expect(t.as(student, (tx) => tx.query("update verifications set subject_id = 's1:99'"))).rejects.toThrow();
    await expect(t.as(student, (tx) => tx.query("delete from verifications"))).rejects.toThrow();
  });

  it("enforces unique subjects, consent presence, and the private-note limit", async () => {
    const t = await createTestDb();
    const [student, reviewer] = [await t.user(), await t.user()];
    const insert = (subject: string, consent: boolean | null, notes: string | null = null) => t.db.query(
      "insert into verifications (user_id, kind, subject_id, reviewer_id, parent_consent_recorded, notes) values ($1, 'placing', $2, $3, $4, $5)",
      [student, subject, reviewer, consent, notes]
    );
    await insert("s1:1", true);
    await expect(insert("s1:1", true)).rejects.toThrow();
    await expect(insert("s1:2", null)).rejects.toThrow();
    await expect(insert("s1:3", true, "a".repeat(2001))).rejects.toThrow();
  });

  it("requires a handle, mints an unchosen token, and exposes only verified items", async () => {
    const t = await createTestDb();
    const [student, reviewer] = [await t.user(), await t.user()];
    await expect(t.as(student, (tx) => tx.query("select set_record_sharing(true)"))).rejects.toThrow(/handle_required/);
    await t.db.query("update profiles set handle = 'quant_kid', display_name = 'Real Name' where id = $1", [student]);
    await t.db.query(
      "insert into verifications (user_id, kind, subject_id, reviewer_id, parent_consent_recorded, notes) values ($1, 'placing', 's1:2', $2, true, 'private reviewer note')",
      [student, reviewer]
    );
    const token = (await t.as(student, (tx) => tx.query<{ set_record_sharing: string }>("select set_record_sharing(true)"))).rows[0].set_record_sharing;
    expect(token).toMatch(/^[0-9a-f-]{36}$/);
    const rows = await shared(t, token);
    expect(rows).toEqual([{ handle: "quant_kid", items: [{ kind: "placing", subject_id: "s1:2", verified_at: expect.any(String) }] }]);
    expect(JSON.stringify(rows)).not.toMatch(/Real Name|private reviewer note|reviewer_id|user_id|email/);
    await expect(t.as(student, (tx) => tx.query("update record_shares set token = gen_random_uuid()"))).rejects.toThrow();
  });

  it("revokes old links, returns no detail for unknown tokens, and rotates on re-enable", async () => {
    const t = await createTestDb();
    const student = await t.user();
    await t.db.query("update profiles set handle = 'student_one' where id = $1", [student]);
    await expect(t.as(student, (tx) => tx.query("select set_record_sharing(null)"))).rejects.toThrow(/invalid_share_state/);
    const issue = () => t.as(student, async (tx) => (await tx.query<{ set_record_sharing: string }>("select set_record_sharing(true)")).rows[0].set_record_sharing);
    const oldToken = await issue();
    expect(await issue()).toBe(oldToken);
    await t.as(student, (tx) => tx.query("select set_record_sharing(false)"));
    expect(await shared(t, oldToken)).toEqual([]);
    expect(await shared(t, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).toEqual([]);
    const newToken = await issue();
    expect(newToken).not.toBe(oldToken);
    expect(await shared(t, oldToken)).toEqual([]);
    expect(await shared(t, newToken)).toEqual([{ handle: "student_one", items: [] }]);
    const other = await t.user();
    expect((await t.as(other, (tx) => tx.query("select token from record_shares"))).rows).toEqual([]);
    await expect(t.db.transaction(async (tx) => {
      await tx.exec("set local role anon");
      await tx.query("select set_record_sharing(true)");
    })).rejects.toThrow();
  });

  it("cascades verifications and shares when the student deletes their account", async () => {
    const t = await createTestDb();
    const [student, reviewer] = [await t.user(), await t.user()];
    await t.db.query("update profiles set handle = 'gone_student' where id = $1", [student]);
    await t.db.query(
      "insert into verifications (user_id, kind, subject_id, reviewer_id, parent_consent_recorded) values ($1, 'capstone', 'capstone-id', $2, true)",
      [student, reviewer]
    );
    const token = (await t.as(student, (tx) => tx.query<{ set_record_sharing: string }>("select set_record_sharing(true)"))).rows[0].set_record_sharing;
    await t.db.query("delete from auth.users where id = $1", [student]);
    expect((await t.db.query("select 1 from verifications where user_id = $1", [student])).rows).toEqual([]);
    expect((await t.db.query("select 1 from record_shares where user_id = $1", [student])).rows).toEqual([]);
    expect(await shared(t, token)).toEqual([]);
  });

  it("does not block reviewer account deletion or erase a student's verification", async () => {
    const t = await createTestDb();
    const [student, reviewer] = [await t.user(), await t.user()];
    await t.db.query(
      "insert into verifications (user_id, kind, subject_id, reviewer_id, parent_consent_recorded) values ($1, 'placing', 's1:3', $2, true)",
      [student, reviewer]
    );
    await t.db.query("delete from auth.users where id = $1", [reviewer]);
    expect((await t.as(student, (tx) => tx.query("select reviewer_id from verifications"))).rows).toEqual([{ reviewer_id: reviewer }]);
  });

  it("can be re-applied without recreating policies or breaking a share", async () => {
    const t = await createTestDb();
    const student = await t.user();
    await t.db.query("update profiles set handle = 'rerun_student' where id = $1", [student]);
    const token = (await t.as(student, (tx) => tx.query<{ set_record_sharing: string }>("select set_record_sharing(true)"))).rows[0].set_record_sharing;
    await applyMigration(t.db, "0025_verifications_and_records.sql");
    expect(await shared(t, token)).toEqual([{ handle: "rerun_student", items: [] }]);
  });
});
