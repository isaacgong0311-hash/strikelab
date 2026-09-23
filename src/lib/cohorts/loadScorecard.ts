import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { cohortCsvRows, computeCohortMetrics, type CohortMetrics } from "./metrics";
import type { OwnedClass } from "@/lib/classes";

export type CohortScorecard =
  | { measurable: true; metrics: CohortMetrics; csv: string[][] }
  | { measurable: false; reason: string };

/**
 * Server-derived scorecard for a launched cohort. Reads across students with
 * the admin client, so it must only run after requireTeacherOwnsClass has
 * verified the caller owns `klass`. Returns null for classes that aren't
 * launched cohorts.
 */
export async function loadCohortScorecard(klass: OwnedClass): Promise<CohortScorecard | null> {
  if (!klass.templateId || !klass.startsOn) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return { measurable: false, reason: "The server isn't connected to the database." };

  const [{ data: members }, { data: assignments }] = await Promise.all([
    admin.from("class_members").select("student_id, joined_at").eq("class_id", klass.id),
    admin.from("assignments").select("lesson_id, week_number, position, due_on").eq("class_id", klass.id),
  ]);
  const studentIds = (members ?? []).map((m) => m.student_id as string);

  const [profilesRes, progressRes, completionsRes] = studentIds.length
    ? await Promise.all([
        admin.from("profiles").select("id, display_name").in("id", studentIds),
        admin.from("progress").select("user_id, last_activity_date").in("user_id", studentIds),
        admin.from("lesson_completions").select("user_id, lesson_id, completed_at").in("user_id", studentIds),
      ])
    : [{ data: [] }, { data: [] }, { data: [], error: null }];

  if (completionsRes.error) {
    // Migration 0016 not applied yet: say so rather than show made-up numbers.
    return { measurable: false, reason: "Completion timestamps aren't set up yet (database migration 0016)." };
  }

  const names = new Map((profilesRes.data ?? []).map((p) => [p.id as string, (p.display_name as string) || "StrikeLab student"]));
  const activity = new Map((progressRes.data ?? []).map((p) => [p.user_id as string, (p.last_activity_date as string | null) ?? null]));

  const metrics = computeCohortMetrics({
    startsOn: klass.startsOn,
    skipWeeks: klass.skipWeeks,
    timezone: klass.timezone ?? "UTC",
    assignments: (assignments ?? []).map((a) => ({
      lessonId: a.lesson_id as string,
      weekNumber: (a.week_number as number | null) ?? null,
      position: (a.position as number | null) ?? null,
      dueOn: (a.due_on as string | null) ?? null,
    })),
    members: (members ?? []).map((m) => ({
      studentId: m.student_id as string,
      displayName: names.get(m.student_id as string) ?? "StrikeLab student",
      joinedAt: m.joined_at as string,
      lastActivityDate: activity.get(m.student_id as string) ?? null,
    })),
    completions: (completionsRes.data ?? []).map((c) => ({
      studentId: c.user_id as string,
      lessonId: c.lesson_id as string,
      completedAt: (c.completed_at as string | null) ?? null,
    })),
    now: new Date(),
  });
  return { measurable: true, metrics, csv: cohortCsvRows(metrics) };
}
