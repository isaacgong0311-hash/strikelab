import type { SupabaseClient } from "@supabase/supabase-js";
import { localDateKey } from "@/lib/progress/streak";
import { buildStudentCohortView, type CohortAssignment, type StudentCohortView } from "./studentView";

export type StudentCohortResult =
  | { kind: "not-found" }
  | { kind: "not-launched"; className: string }
  | { kind: "ready"; className: string; timezone: string; view: StudentCohortView };

/**
 * Everything the cohort home needs, read through the caller's own session
 * client so RLS decides access: a member (or the class's teacher, for a
 * preview) sees the class; anyone else gets not-found.
 *
 * Completions come from lesson_completions (0016) when it exists, else the
 * aggregate progress array, so the page works before the migration runs.
 */
export async function loadStudentCohort(
  supabase: SupabaseClient,
  userId: string,
  classId: string,
  now: Date = new Date()
): Promise<StudentCohortResult> {
  const { data: klass, error } = await supabase.from("classes").select("*").eq("id", classId).maybeSingle();
  if (error || !klass) return { kind: "not-found" };

  const className = klass.name as string;
  const startsOn = klass.starts_on as string | null;
  if (!klass.template_id || !startsOn) return { kind: "not-launched", className };

  const timezone = (klass.timezone as string | null) ?? "UTC";
  const skipWeeks = Array.isArray(klass.skip_weeks) ? (klass.skip_weeks as string[]) : [];

  const [assignmentsRes, completionsRes, sessionsRes] = await Promise.all([
    supabase.from("assignments").select("lesson_id, week_number, position, due_on").eq("class_id", classId),
    supabase.from("lesson_completions").select("lesson_id").eq("user_id", userId),
    supabase.from("session_completions").select("session_id").eq("user_id", userId),
  ]);

  let completedLessonIds: Set<string>;
  if (!completionsRes.error && completionsRes.data) {
    completedLessonIds = new Set(completionsRes.data.map((r) => r.lesson_id as string));
  } else {
    const { data: progress } = await supabase.from("progress").select("completed").eq("user_id", userId).maybeSingle();
    completedLessonIds = new Set(Array.isArray(progress?.completed) ? (progress.completed as string[]) : []);
  }

  const assignments: CohortAssignment[] = (assignmentsRes.data ?? []).map((a) => ({
    lessonId: a.lesson_id as string,
    weekNumber: (a.week_number as number | null) ?? null,
    position: (a.position as number | null) ?? null,
    dueOn: (a.due_on as string | null) ?? null,
  }));

  const view = buildStudentCohortView({
    startsOn,
    skipWeeks,
    assignments,
    completedLessonIds,
    completedSessionIds: new Set((sessionsRes.data ?? []).map((r) => r.session_id as string)),
    today: localDateKey(now, timezone),
  });
  return { kind: "ready", className, timezone, view };
}
