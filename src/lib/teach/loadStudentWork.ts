import type { SupabaseClient } from "@supabase/supabase-js";
import { requireTeacherOwnsClass, type OwnedClass } from "@/lib/classes";
import { localDateKey } from "@/lib/progress/streak";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { loadCohortScorecard } from "@/lib/cohorts/loadScorecard";
import type { StudentMetrics } from "@/lib/cohorts/metrics";
import { buildStudentWork, type StudentWork } from "./studentWork";

export interface StudentWorkPage {
  klass: OwnedClass;
  student: { id: string; name: string; joinedOn: string; lastActiveOn: string | null };
  work: StudentWork;
  /** Cohort metrics for this student when the class is a launched, measurable cohort. */
  metrics: StudentMetrics | null;
  /** Set when saved code couldn't be read (e.g. migration 0018 not applied). */
  codeUnavailable: boolean;
}

export type LoadStudentWorkResult = { ok: true; page: StudentWorkPage } | { ok: false; status: 404 | 503 };

/**
 * Everything the class workspace's student page shows. Ownership of the
 * class is checked on the teacher's own session first, then membership of
 * this student in this class. Completions and saved code are read on the
 * teacher's session too, so the RLS policies "Teachers read class member
 * completions/submissions" (migrations 0016, 0018) enforce access as well.
 * The admin client is used only for the membership row, name and schedule,
 * the same reads the roster already makes.
 */
export async function loadStudentWork(
  supabase: SupabaseClient,
  teacherId: string,
  classId: string,
  studentId: string,
  now: Date = new Date()
): Promise<LoadStudentWorkResult> {
  const owned = await requireTeacherOwnsClass(supabase, teacherId, classId);
  if ("error" in owned) return { ok: false, status: 404 };
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, status: 503 };

  const { data: member, error: memberError } = await admin
    .from("class_members")
    .select("joined_at")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (memberError) return { ok: false, status: 503 };
  if (!member) return { ok: false, status: 404 };

  const [profileRes, progressRes, assignmentsRes, completionsRes, submissionsRes, scorecard] = await Promise.all([
    admin.from("profiles").select("display_name").eq("id", studentId).maybeSingle(),
    admin.from("progress").select("last_activity_date").eq("user_id", studentId).maybeSingle(),
    admin.from("assignments").select("lesson_id, week_number, position, due_on").eq("class_id", classId),
    supabase.from("lesson_completions").select("lesson_id, completed_at").eq("user_id", studentId),
    supabase.from("lesson_submissions").select("lesson_id, code, updated_at, last_passed_at").eq("user_id", studentId),
    loadCohortScorecard(owned.class),
  ]);
  // A failed read must not look like a student who did nothing.
  if (assignmentsRes.error || completionsRes.error) return { ok: false, status: 503 };

  const timezone = owned.class.timezone ?? "UTC";
  const work = buildStudentWork({
    assignments: (assignmentsRes.data ?? []).map((a) => ({
      lessonId: a.lesson_id as string,
      weekNumber: (a.week_number as number | null) ?? null,
      position: (a.position as number | null) ?? null,
      dueOn: (a.due_on as string | null) ?? null,
    })),
    completions: (completionsRes.data ?? []).map((c) => ({
      lessonId: c.lesson_id as string,
      completedAt: (c.completed_at as string | null) ?? null,
    })),
    submissions: submissionsRes.error
      ? []
      : (submissionsRes.data ?? []).map((s) => ({
          lessonId: s.lesson_id as string,
          code: s.code as string,
          updatedAt: s.updated_at as string,
          lastPassedAt: (s.last_passed_at as string | null) ?? null,
        })),
    today: localDateKey(now, timezone),
    timezone,
  });

  const metrics = scorecard?.measurable ? scorecard.metrics.students.find((s) => s.studentId === studentId) ?? null : null;

  return {
    ok: true,
    page: {
      klass: owned.class,
      student: {
        id: studentId,
        name: (profileRes.data?.display_name as string | undefined) || "StrikeLab student",
        joinedOn: localDateKey(new Date(member.joined_at as string), timezone),
        lastActiveOn: metrics?.lastActiveOn ?? ((progressRes.data?.last_activity_date as string | null) ?? null),
      },
      work,
      metrics,
      codeUnavailable: !!submissionsRes.error,
    },
  };
}
