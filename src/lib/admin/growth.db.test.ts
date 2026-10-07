import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";
import { addDaysToKey, localDateKey } from "@/lib/progress/streak";
import { buildCohortSchedule } from "@/lib/cohorts/template";
import { weeklyGrowth } from "./growth";

const GROWTH_SQL = readFileSync(join(__dirname, "..", "..", "..", "scripts", "metrics", "growth.sql"), "utf8");

describe("weeklyGrowth", () => {
  it("matches scripts/metrics/growth.sql row for row", async () => {
    const t = await createTestDb();
    const today = localDateKey(new Date(), "UTC");
    const teacher = await t.user();
    const students = [await t.user(), await t.user(), await t.user(), await t.user()];
    const at = (day: string, hour = 15) => new Date(`${day}T${String(hour).padStart(2, "0")}:00:00Z`).toISOString();

    // Two cohorts starting in different weeks, plus a class that was never launched.
    const cohort = async (code: string, startsOn: string | null) => {
      const { rows } = await t.db.query<{ id: string }>(
        `insert into classes (teacher_id, name, join_code, template_id, starts_on, timezone)
         values ($1, $2, $3, $4, $5, 'UTC') returning id`,
        [teacher, code, code, startsOn ? "quant-foundations-v1" : null, startsOn]
      );
      const id = rows[0].id;
      if (startsOn) {
        for (const r of buildCohortSchedule(startsOn, [])) {
          await t.db.query("insert into assignments (class_id, lesson_id, week_number, position, due_on) values ($1, $2, $3, $4, $5)", [
            id, r.lessonId, r.weekNumber, r.position, r.dueOn,
          ]);
        }
      }
      return id;
    };
    const startA = addDaysToKey(today, -30);
    const startB = addDaysToKey(today, -9);
    const a = await cohort("GA2345", startA);
    const b = await cohort("GB2345", startB);
    const notLaunched = await cohort("GC2345", null);

    const join = (classId: string, student: string, day: string) =>
      t.db.query("insert into class_members (class_id, student_id, joined_at) values ($1, $2, $3)", [classId, student, at(day)]);
    await join(a, students[0], startA);
    await join(a, students[1], addDaysToKey(startA, 10));
    await join(b, students[1], startB); // in two cohorts: counted once per membership, like the SQL
    await join(b, students[2], startB);
    await join(notLaunched, students[3], startB); // never counts

    const done = (student: string, lesson: string, day: string | null) =>
      t.db.query("insert into lesson_completions (user_id, lesson_id, completed_at) values ($1, $2, $3)", [student, lesson, day ? at(day) : null]);
    await done(students[0], "inv-1", addDaysToKey(startA, 1));
    await done(students[0], "inv-2", addDaysToKey(startA, 8));
    await done(students[1], "inv-1", addDaysToKey(startA, 11));
    await done(students[1], "8", addDaysToKey(startA, 12)); // not assigned in either cohort
    await done(students[2], "inv-1", addDaysToKey(startB, 2));
    await done(students[2], "inv-2", null); // unknown time
    await done(students[3], "inv-1", addDaysToKey(startB, 1)); // not in a launched cohort

    await t.db.query(
      `insert into capstone_submissions (user_id, class_id, prompt_id, status, submitted_at)
       values ($1, $2, 'open', 'submitted', $3), ($4, $2, 'open', 'draft', null), ($5, $6, 'backtest', 'submitted', $7)`,
      [students[0], a, at(addDaysToKey(startA, 20)), students[1], students[2], b, at(today, 0)]
    );

    const sqlRows = (await t.db.query<Record<string, unknown>>(GROWTH_SQL)).rows;

    const q = async <T,>(sql: string) => (await t.db.query<T>(sql)).rows;
    const ts = weeklyGrowth({
      cohorts: (await q<{ id: string; starts_on: string | Date }>("select id, starts_on from classes where template_id is not null and starts_on is not null")).map((c) => ({
        id: c.id,
        startsOn: typeof c.starts_on === "string" ? c.starts_on.slice(0, 10) : c.starts_on.toISOString().slice(0, 10),
      })),
      members: (await q<{ class_id: string; student_id: string; joined_at: Date }>("select class_id, student_id, joined_at from class_members")).map((m) => ({
        classId: m.class_id, studentId: m.student_id, joinedAt: new Date(m.joined_at).toISOString(),
      })),
      assignments: (await q<{ class_id: string; lesson_id: string }>("select class_id, lesson_id from assignments where week_number is not null")).map((r) => ({
        classId: r.class_id, lessonId: r.lesson_id,
      })),
      completions: (await q<{ user_id: string; lesson_id: string; completed_at: Date | null }>("select user_id, lesson_id, completed_at from lesson_completions")).map((c) => ({
        userId: c.user_id, lessonId: c.lesson_id, completedAt: c.completed_at ? new Date(c.completed_at).toISOString() : null,
      })),
      capstones: (await q<{ class_id: string; status: string; submitted_at: Date | null }>("select class_id, status, submitted_at from capstone_submissions")).map((c) => ({
        classId: c.class_id, status: c.status, submittedAt: c.submitted_at ? new Date(c.submitted_at).toISOString() : null,
      })),
      now: new Date(),
    });

    const num = (v: unknown) => (v === null ? null : Number(v));
    const fromSql = sqlRows.map((r) => ({
      weekStart: r.week_start instanceof Date ? r.week_start.toISOString().slice(0, 10) : String(r.week_start).slice(0, 10),
      cohortsLaunched: num(r.cohorts_launched),
      enrolledCum: num(r.enrolled_cum),
      activeStudents: num(r.active_students),
      capstonesCum: num(r.capstones_cum),
      capstonesWowPct: num(r.capstones_wow_pct),
      activeWowPct: num(r.active_wow_pct),
    }));

    expect(ts).toEqual(fromSql);
    // And the fixture exercises something: two cohorts, five weeks or so, both capstones counted by the end.
    expect(ts.length).toBeGreaterThanOrEqual(5);
    expect(ts.at(-1)).toMatchObject({ cohortsLaunched: 2, enrolledCum: 4, capstonesCum: 2 });
  });

  it("is empty before any cohort launches", () => {
    expect(weeklyGrowth({ cohorts: [], members: [], assignments: [], completions: [], capstones: [], now: new Date() })).toEqual([]);
  });
});
