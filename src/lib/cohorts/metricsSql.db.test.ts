import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";
import { addDaysToKey, localDateKey } from "@/lib/progress/streak";
import { buildCohortSchedule } from "./template";
import { computeCohortMetrics } from "./metrics";

const SCRIPTS = join(__dirname, "..", "..", "..", "scripts", "metrics");
const sql = (name: string) => readFileSync(join(SCRIPTS, name), "utf8");

describe("scripts/metrics", () => {
  it("weekly-scorecard.sql matches the app's metrics on the same data", async () => {
    const t = await createTestDb();
    const TZ = "America/Chicago";
    const today = localDateKey(new Date(), TZ);
    // Started 4 weeks + 3 days ago with a break in week 2's slot: today is in week 4.
    const startsOn = addDaysToKey(today, -31);
    const skipWeeks = [addDaysToKey(startsOn, 7)];
    const teacher = await t.user();
    const students = [await t.user(), await t.user(), await t.user(), await t.user()];

    const { rows } = await t.db.query<{ id: string }>(
      `insert into classes (teacher_id, name, join_code, template_id, starts_on, timezone, skip_weeks)
       values ($1, 'Club', 'AB2345', 'quant-foundations-v1', $2, $3, $4::date[]) returning id`,
      [teacher, startsOn, TZ, skipWeeks]
    );
    const classId = rows[0].id;
    const schedule = buildCohortSchedule(startsOn, skipWeeks);
    for (const r of schedule) {
      await t.db.query("insert into assignments (class_id, lesson_id, week_number, position, due_on) values ($1, $2, $3, $4, $5)", [
        classId, r.lessonId, r.weekNumber, r.position, r.dueOn,
      ]);
    }

    const noon = (day: string) => new Date(`${day}T12:00:00-06:00`).toISOString();
    const joined = [startsOn, startsOn, addDaysToKey(startsOn, 20), startsOn];
    for (const [i, s] of students.entries()) {
      await t.db.query("insert into class_members (class_id, student_id, joined_at) values ($1, $2, $3)", [classId, s, noon(joined[i])]);
    }
    const completions: { s: string; lesson: string; day: string | null }[] = [
      { s: students[0], lesson: "inv-1", day: addDaysToKey(startsOn, 1) },
      { s: students[0], lesson: "3", day: today }, // active now (week 4)
      { s: students[1], lesson: "inv-1", day: addDaysToKey(startsOn, 12) }, // too late: not activated
      { s: students[1], lesson: "inv-2", day: today },
      { s: students[2], lesson: "inv-1", day: addDaysToKey(startsOn, 22) }, // late joiner, on time
      { s: students[3], lesson: "inv-1", day: null }, // unknown date
    ];
    for (const c of completions) {
      await t.db.query("insert into lesson_completions (user_id, lesson_id, completed_at) values ($1, $2, $3)", [
        c.s, c.lesson, c.day ? noon(c.day) : null,
      ]);
    }

    const [row] = (await t.db.query<Record<string, unknown>>(sql("weekly-scorecard.sql"))).rows;
    const ts = computeCohortMetrics({
      startsOn,
      skipWeeks,
      timezone: TZ,
      assignments: schedule.map((r) => ({ lessonId: r.lessonId, weekNumber: r.weekNumber, position: r.position, dueOn: r.dueOn })),
      members: students.map((s, i) => ({ studentId: s, displayName: s, joinedAt: noon(joined[i]) })),
      completions: completions.map((c) => ({ studentId: c.s, lessonId: c.lesson, completedAt: c.day ? noon(c.day) : null })),
      now: new Date(),
    });

    expect(ts.status).toEqual({ kind: "week", week: 4 });
    expect(row.status).toBe("week 4");
    expect(Number(row.enrolled)).toBe(ts.enrolled);
    expect(Number(row.activated)).toBe(ts.activated.count);
    expect(Number(row.activation_pending)).toBe(ts.activated.pending);
    expect(Number(row.activated_pct)).toBe(ts.activated.pct);
    expect(Number(row.active_this_week)).toBe(ts.activeThisWeek);
    expect(Number(row.week4_retained)).toBe(ts.week4Retained?.count);
    expect(Number(row.week4_retained_pct)).toBe(ts.week4Retained?.pct);
    // And the fixture exercises something: 2 activated, 2 active now, 1 retained.
    expect([ts.activated.count, ts.activeThisWeek, ts.week4Retained?.count]).toEqual([2, 2, 1]);
  });

  it("baseline.sql and check-migrations.sql run against the full schema", async () => {
    const t = await createTestDb();
    await t.db.exec(sql("baseline.sql"));
    const { rows } = await t.db.query<{ migration: string; state: string }>(sql("check-migrations.sql"));
    expect(rows.length).toBeGreaterThan(5);
    expect(rows.filter((r) => r.state !== "applied")).toEqual([]);
  });

  it("leader-funnel.sql follows leaders from sign-up to their first student, by source", async () => {
    const t = await createTestDb();
    const signup = new Date("2026-10-01T15:00:00Z").getTime();
    const at = (minutes: number) => new Date(signup + minutes * 60_000).toISOString();
    const leader = async (meta: object, src: string | null) => {
      const id = await t.user();
      await t.db.query("update auth.users set raw_user_meta_data = $2::jsonb where id = $1", [id, JSON.stringify(meta)]);
      await t.db.query("update profiles set created_at = $2, signup_source = $3 where id = $1", [id, at(0), src]);
      return id;
    };
    const fast = await leader({ signup_role: "leader" }, "email-oct");
    await leader({ signup_role: "leader" }, "email-oct"); // signed up, never made a class
    const legacy = await leader({}, null); // taught before the sign-up question existed
    await leader({ signup_role: "student" }, "email-oct"); // not a leader
    const student = await t.user();

    const { rows } = await t.db.query<{ id: string }>(
      `insert into classes (teacher_id, name, join_code, created_at, template_id, starts_on, launched_at)
       values ($1, 'Club', 'FU2345', $2, 'quant-foundations-v1', '2026-10-26', $3) returning id`,
      [fast, at(2), at(5)]
    );
    await t.db.query("insert into classes (teacher_id, name, join_code, created_at) values ($1, 'Old', 'FU2346', $2)", [legacy, at(60)]);
    await t.db.query("insert into class_members (class_id, student_id, joined_at) values ($1, $2, $3)", [rows[0].id, student, at(24 * 60)]);

    const result = (await t.db.query<Record<string, unknown>>(sql("leader-funnel.sql"))).rows;
    const bySource = Object.fromEntries(result.map((r) => [r.source, r]));
    const nums = (r: Record<string, unknown>, keys: string[]) => keys.map((k) => (r[k] === null ? null : Number(r[k])));
    const counts = ["leaders", "created_class", "launched_cohort", "first_student_joined", "first_student_within_7d"];

    expect(result.at(-1)?.source).toBe("All sources");
    expect(nums(bySource["All sources"], counts)).toEqual([3, 2, 1, 1, 1]);
    expect(nums(bySource["email-oct"], [...counts, "median_min_to_class", "median_min_to_launch", "median_hours_to_first_student"])).toEqual([
      2, 1, 1, 1, 1, 2, 5, 24,
    ]);
    expect(nums(bySource["(none)"], counts)).toEqual([1, 1, 0, 0, 0]);
  });
});
