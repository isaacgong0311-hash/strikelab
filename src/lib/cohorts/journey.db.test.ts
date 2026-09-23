import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";
import { addDaysToKey, localDateKey } from "@/lib/progress/streak";
import { QUANT_FOUNDATIONS_TEMPLATE_ID, buildCohortSchedule } from "./template";
import { computeCohortMetrics, cohortCsvRows } from "./metrics";
import { buildStudentCohortView } from "./studentView";

/**
 * A6: the whole pilot journey against the real schema, every step as the
 * user who performs it (RLS on). Teacher launches a cohort that started
 * three weeks ago, a student joins and works through week 1, reaches
 * week 4 and submits a capstone; the student home and the teacher
 * scorecard (fed the same rows the app reads) reflect all of it.
 */
describe("pilot cohort journey", () => {
  it("runs from launch to scorecard", async () => {
    const t = await createTestDb();
    const TZ = "America/Chicago";
    const today = localDateKey(new Date(), TZ);
    const startsOn = addDaysToKey(today, -21); // today is in week 4
    const [teacher, student, bystander] = [await t.user(), await t.user(), await t.user()];
    await t.db.query("update profiles set display_name = 'Ava Chen' where id = $1", [student]);

    // 1. Teacher creates the class and launches the six-week template.
    const classId = await t.as(teacher, async (tx) => {
      const { rows } = await tx.query<{ id: string }>(
        "insert into classes (teacher_id, name, join_code) values ($1, 'Quant Club', 'QC2345') returning id",
        [teacher]
      );
      const schedule = buildCohortSchedule(startsOn).map((r) => ({
        lesson_id: r.lessonId, week_number: r.weekNumber, position: r.position, due_on: r.dueOn,
      }));
      await tx.query("select launch_cohort($1, $2, $3::date, $4, $5::jsonb, '{}'::date[])", [
        rows[0].id, QUANT_FOUNDATIONS_TEMPLATE_ID, startsOn, TZ, JSON.stringify(schedule),
      ]);
      return rows[0].id;
    });

    // 2. Student joins (the join route inserts the membership as the student).
    await t.as(student, (tx) => tx.query("insert into class_members (class_id, student_id) values ($1, $2)", [classId, student]));

    // 3. Student works: lessons complete through their own progress row
    //    (the trigger stamps them), code syncs, capstone is submitted.
    await t.as(student, async (tx) => {
      await tx.query(`insert into progress (user_id, completed) values ($1, '["inv-1","inv-2"]'::jsonb)`, [student]);
      await tx.query(`update progress set completed = '["inv-1","inv-2","inv-5","1"]'::jsonb where user_id = $1`, [student]);
      await tx.query("insert into lesson_submissions (user_id, lesson_id, code) values ($1, '3', 'def bs(): ...')", [student]);
      await tx.query(
        `insert into capstone_submissions (user_id, class_id, prompt_id, title, thesis, code, result_summary, reflection, status)
         values ($1, $2, 'backtest', 'MA crossover', 'Q', 'print(1)', 'R', 'F', 'submitted')`,
        [student, classId]
      );
    });

    // 4. What the student's cohort home reads (as the student).
    const home = await t.as(student, async (tx) => ({
      klass: (await tx.query<{ starts_on: string; skip_weeks: string[] }>(
        "select starts_on::text, skip_weeks::text[] from classes where id = $1", [classId]
      )).rows[0],
      assignments: (await tx.query<{ lesson_id: string; week_number: number; position: number; due_on: string }>(
        "select lesson_id, week_number, position, due_on::text from assignments where class_id = $1", [classId]
      )).rows,
      completed: (await tx.query<{ lesson_id: string }>("select lesson_id from lesson_completions where user_id = $1", [student])).rows,
    }));
    const view = buildStudentCohortView({
      startsOn: home.klass.starts_on,
      skipWeeks: home.klass.skip_weeks,
      assignments: home.assignments.map((a) => ({ lessonId: a.lesson_id, weekNumber: a.week_number, position: a.position, dueOn: a.due_on })),
      completedLessonIds: new Set(home.completed.map((c) => c.lesson_id)),
      completedSessionIds: new Set(),
      today,
    });
    expect(view.status).toEqual({ kind: "week", week: 4 });
    expect(view.progress).toEqual({ done: 4, total: 12 });
    expect(view.nextAction).toMatchObject({ lessonId: "2", week: 2, overdue: true });

    // 5. A bystander sees none of it.
    const leaked = await t.as(bystander, async (tx) => ({
      classes: (await tx.query("select 1 from classes where id = $1", [classId])).rows.length,
      completions: (await tx.query("select 1 from lesson_completions")).rows.length,
      code: (await tx.query("select 1 from lesson_submissions")).rows.length,
      capstones: (await tx.query("select 1 from capstone_submissions")).rows.length,
    }));
    expect(leaked).toEqual({ classes: 0, completions: 0, code: 0, capstones: 0 });

    // 6. The scorecard, from the same rows loadCohortScorecard reads.
    const rows = async <T,>(sql: string, params: unknown[]) => (await t.db.query<T>(sql, params)).rows;
    const members = await rows<{ student_id: string; joined_at: Date }>("select student_id, joined_at from class_members where class_id = $1", [classId]);
    const completions = await rows<{ user_id: string; lesson_id: string; completed_at: Date | null }>(
      "select user_id, lesson_id, completed_at from lesson_completions", []
    );
    const capstones = await rows<{ id: string; user_id: string; status: "draft" | "submitted"; submitted_at: Date | null }>(
      "select id, user_id, status, submitted_at from capstone_submissions where class_id = $1", [classId]
    );
    const metrics = computeCohortMetrics({
      startsOn,
      skipWeeks: [],
      timezone: TZ,
      assignments: view.weeks.flatMap((w) => w.lessons.map((l, i) => ({ lessonId: l.lessonId, weekNumber: w.week, position: i + 1, dueOn: l.dueOn }))),
      members: members.map((m) => ({
        studentId: m.student_id,
        displayName: "Ava Chen",
        joinedAt: m.joined_at.toISOString(),
        capstone: (() => {
          const c = capstones.find((x) => x.user_id === m.student_id);
          return c ? { id: c.id, status: c.status, submittedAt: c.submitted_at?.toISOString() ?? null } : null;
        })(),
      })),
      completions: completions.map((c) => ({ studentId: c.user_id, lessonId: c.lesson_id, completedAt: c.completed_at?.toISOString() ?? null })),
      now: new Date(),
      capstonesEnabled: true,
    });

    // Joined today, first lesson done today: activated. Active in week 4
    // (today), so retained. Capstone submitted.
    expect(metrics.enrolled).toBe(1);
    expect(metrics.activated).toMatchObject({ count: 1, of: 1, pct: 100 });
    expect(metrics.activeThisWeek).toBe(1);
    expect(metrics.week4Retained).toMatchObject({ count: 1, of: 1, final: false });
    expect(metrics.capstones).toMatchObject({ count: 1, of: 1 });
    expect(metrics.students[0]).toMatchObject({ lessonsDone: 4, lessonsTotal: 12, programCompleted: false });

    const csv = cohortCsvRows(metrics);
    expect(csv[1][0]).toBe("Ava Chen");
    expect(csv[1]).toContain("yes");
  });
});
