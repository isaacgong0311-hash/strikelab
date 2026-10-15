import { describe, expect, it } from "vitest";
import { createTestDb } from "../../../supabase/testing/db";
import { buildCohortSchedule } from "@/lib/cohorts/template";
import { computeCohortMetrics } from "@/lib/cohorts/metrics";
import { localDateKey, addDaysToKey } from "@/lib/progress/streak";
import * as seed from "../../../scripts/rehearsal/seed-core.mjs";

type Op = { op: string; table: string; rows: Record<string, unknown>[] };

describe("rehearsal seed (Q16)", () => {
  it("lands in the real schema and tells the story the founder expects to rehearse", async () => {
    const t = await createTestDb();
    const today = localDateKey(new Date(), seed.TIMEZONE);
    const teacher = await t.user();
    const studentIds: string[] = [];
    for (let i = 0; i < seed.STUDENTS.length; i++) studentIds.push(await t.user());

    const schedule = buildCohortSchedule(addDaysToKey(today, -21));
    const plan = seed.buildRehearsalPlan({ today, teacherId: teacher, studentIds, schedule }) as unknown as Op[];

    for (const op of plan) {
      if (op.op === "update-profiles") {
        for (const r of op.rows) await t.db.query("update profiles set display_name = $1 where id = $2", [r.display_name, r.id]);
        continue;
      }
      for (const row of op.rows) {
        const cols = Object.keys(row);
        const values = cols.map((c) => (Array.isArray(row[c]) ? JSON.stringify(row[c]) : row[c]));
        await t.db.query(
          `insert into ${op.table} (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")})`,
          values
        );
      }
    }

    const klass = (await t.db.query<{ id: string; starts_on: string }>(
      "select id, starts_on::text from classes where join_code = $1", [seed.REHEARSAL_JOIN_CODE]
    )).rows[0];
    const q = async <T,>(sql: string, p: unknown[] = []) => (await t.db.query<T>(sql, p)).rows;
    const names = new Map((await q<{ id: string; display_name: string }>("select id, display_name from profiles")).map((p) => [p.id, p.display_name]));
    const members = await q<{ student_id: string; joined_at: Date }>("select student_id, joined_at from class_members where class_id = $1", [klass.id]);
    const activity = new Map((await q<{ user_id: string; last_activity_date: string | null }>("select user_id, last_activity_date::text from progress")).map((p) => [p.user_id, p.last_activity_date]));
    const completions = await q<{ user_id: string; lesson_id: string; completed_at: Date }>("select user_id, lesson_id, completed_at from lesson_completions");
    const capstones = await q<{ id: string; user_id: string; status: "draft" | "submitted"; submitted_at: Date | null }>(
      "select id, user_id, status, submitted_at from capstone_submissions where class_id = $1", [klass.id]
    );

    const metrics = computeCohortMetrics({
      startsOn: klass.starts_on,
      skipWeeks: [],
      timezone: seed.TIMEZONE,
      assignments: schedule.map((r) => ({ lessonId: r.lessonId, weekNumber: r.weekNumber, position: r.position, dueOn: r.dueOn })),
      members: members.map((m) => {
        const c = capstones.find((x) => x.user_id === m.student_id);
        return {
          studentId: m.student_id,
          displayName: names.get(m.student_id) ?? "",
          joinedAt: m.joined_at.toISOString(),
          lastActivityDate: activity.get(m.student_id) ?? null,
          capstone: c ? { id: c.id, status: c.status, submittedAt: c.submitted_at?.toISOString() ?? null } : null,
        };
      }),
      completions: completions.map((c) => ({ studentId: c.user_id, lessonId: c.lesson_id, completedAt: c.completed_at.toISOString() })),
      now: new Date(),
      capstonesEnabled: true,
    });

    // Every name is labelled fake; the trigger never overwrote the real dates.
    expect(metrics.enrolled).toBe(10);
    expect(metrics.students.every((s) => s.displayName.endsWith("(fake)"))).toBe(true);
    expect(metrics.status).toEqual({ kind: "week", week: 4 });
    expect(completions.every((c) => c.completed_at.getTime() < Date.now() + 60_000)).toBe(true);
    expect(completions.filter((c) => c.completed_at.toISOString().slice(0, 10) === today).length).toBeLessThan(completions.length);

    // The mix a leader would see: some activated, some never started, a capstone in.
    expect(metrics.activated.of).toBeGreaterThanOrEqual(8);
    expect(metrics.activated.count).toBeGreaterThanOrEqual(5);
    expect(metrics.activated.count).toBeLessThan(metrics.activated.of);
    expect(metrics.capstones).toMatchObject({ count: 1 });
    const flagged = metrics.students.filter((s) => s.needsHelp);
    expect(flagged.length).toBeGreaterThanOrEqual(3);
    expect(metrics.students.find((s) => s.displayName.includes("01"))).toMatchObject({ lessonsDone: 11 });
  });

  it("refuses unless the host is named, matches, and is not protected", () => {
    const url = "https://abcd.supabase.co";
    expect(seed.refuseReason({ url })).toMatch(/--host abcd\.supabase\.co/);
    expect(seed.refuseReason({ url, hostFlag: "other.supabase.co" })).toMatch(/does not match/);
    expect(seed.refuseReason({ url, hostFlag: "abcd.supabase.co", protectedHosts: "x.co, abcd.supabase.co" })).toMatch(/PROTECTED/);
    expect(seed.refuseReason({ url, hostFlag: "abcd.supabase.co", nodeEnv: "production" })).toMatch(/production/);
    expect(seed.refuseReason({ url, hostFlag: "abcd.supabase.co" })).toBeNull();
    expect(seed.refuseReason({ url: "" })).toMatch(/not set/);
  });
});
