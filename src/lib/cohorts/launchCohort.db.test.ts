import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "../../../supabase/testing/db";
import { buildCohortSchedule } from "./template";

// launch_cohort RPC (0012, skip weeks in 0017), run as the signed-in teacher
// exactly as the launch route calls it.

function rpcArgs(classId: string, startsOn: string, skipWeeks: string[] = []) {
  const schedule = buildCohortSchedule(startsOn, skipWeeks).map((row) => ({
    lesson_id: row.lessonId,
    week_number: row.weekNumber,
    position: row.position,
    due_on: row.dueOn,
  }));
  return [classId, "quant-foundations-v1", startsOn, "America/Chicago", JSON.stringify(schedule), skipWeeks];
}

const LAUNCH = "select launch_cohort($1, $2, $3::date, $4, $5::jsonb, $6::date[])";

describe("launch_cohort", () => {
  let t: TestDb;
  let teacher: string, classId: string;

  beforeEach(async () => {
    t = await createTestDb();
    teacher = await t.user();
    const { rows } = await t.db.query<{ id: string }>(
      "insert into classes (teacher_id, name, join_code) values ($1, 'Club', 'ABC234') returning id",
      [teacher]
    );
    classId = rows[0].id;
  });

  it("stores the skip weeks and the shifted schedule", async () => {
    await t.as(teacher, (tx) => tx.query(LAUNCH, rpcArgs(classId, "2026-10-26", ["2026-11-23"])));

    const { rows: [klass] } = await t.db.query<{ skip_weeks: string[]; starts_on: Date }>(
      "select skip_weeks::text[] as skip_weeks, starts_on from classes where id = $1",
      [classId]
    );
    expect(klass.skip_weeks).toEqual(["2026-11-23"]);

    const { rows } = await t.db.query<{ lesson_id: string; due_on: string }>(
      "select lesson_id, due_on::text as due_on from assignments where class_id = $1 order by week_number, position",
      [classId]
    );
    expect(rows).toHaveLength(12);
    expect(rows.at(-1)).toEqual({ lesson_id: "q4", due_on: "2026-12-13" });
  });

  it("re-launching with a different break updates due dates in place", async () => {
    await t.as(teacher, (tx) => tx.query(LAUNCH, rpcArgs(classId, "2026-10-26")));
    await t.as(teacher, (tx) => tx.query(LAUNCH, rpcArgs(classId, "2026-10-26", ["2026-11-23"])));
    const { rows } = await t.db.query<{ n: number; due: string }>(
      "select count(*)::int as n, max(due_on)::text as due from assignments where class_id = $1",
      [classId]
    );
    expect(rows[0]).toEqual({ n: 12, due: "2026-12-13" });
  });

  it("rejects skip weeks on or before the start date", async () => {
    const args = rpcArgs(classId, "2026-10-26");
    args[5] = ["2026-10-26"];
    await expect(t.as(teacher, (tx) => tx.query(LAUNCH, args))).rejects.toThrow(/invalid_skip_weeks/);
  });

  it("refuses to launch someone else's class", async () => {
    const stranger = await t.user();
    await expect(t.as(stranger, (tx) => tx.query(LAUNCH, rpcArgs(classId, "2026-10-26")))).rejects.toThrow(/class_not_found/);
  });
});
