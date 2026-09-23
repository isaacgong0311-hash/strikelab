import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TRACKS, getLessonById } from "@/lib/tracks";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — easy to read aloud

export function generateJoinCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export interface RosterEntry {
  studentId: string;
  displayName: string;
  tracksCompleted: number;
  lessonsCompleted: number;
  lastActivityDate: string | null;
}

const TOTAL_TRACKS = TRACKS.length;
const TOTAL_LESSONS = TRACKS.reduce((n, t) => n + t.lessons.length, 0);

function tracksCompletedCount(completed: string[]): number {
  const completedSet = new Set(completed);
  return TRACKS.filter((t) => t.lessons.length > 0 && t.lessons.every((l) => completedSet.has(l.id))).length;
}

/**
 * Roster for a class, including each student's aggregate progress. Reads
 * profiles/progress across users, so this must only be called after the
 * caller's teacher_id has been verified against the class (see
 * src/app/api/classes/[id]/roster/route.ts) — it uses the admin client to
 * bypass RLS, which is otherwise scoped to each row's own owner.
 */
export async function getClassRoster(classId: string): Promise<RosterEntry[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data: members } = await admin
    .from("class_members")
    .select("student_id")
    .eq("class_id", classId);

  const studentIds = (members ?? []).map((m) => m.student_id as string);
  if (studentIds.length === 0) return [];

  const [{ data: profiles }, { data: progressRows }] = await Promise.all([
    admin.from("profiles").select("id, display_name").in("id", studentIds),
    admin.from("progress").select("user_id, completed, last_activity_date").in("user_id", studentIds),
  ]);

  const progressByUser = new Map((progressRows ?? []).map((p) => [p.user_id as string, p]));

  return studentIds.map((id) => {
    const profile = (profiles ?? []).find((p) => p.id === id);
    const progress = progressByUser.get(id);
    const completed: string[] = Array.isArray(progress?.completed) ? progress.completed : [];
    return {
      studentId: id,
      displayName: profile?.display_name || "StrikeLab student",
      tracksCompleted: tracksCompletedCount(completed),
      lessonsCompleted: completed.length,
      lastActivityDate: progress?.last_activity_date ?? null,
    };
  });
}

export interface OwnedClass {
  id: string;
  name: string;
  templateId: string | null;
  startsOn: string | null;
  timezone: string | null;
  launchedAt: string | null;
  /** Holiday weeks the cohort skips (YYYY-MM-DD block starts). */
  skipWeeks: string[];
  /** Only ever returned to the class's own teacher. */
  joinCode: string;
}

export type TeacherOwnsClassResult =
  | { class: OwnedClass }
  | { error: string; status: 404 };

/**
 * Verifies the caller (via their own session-bound client, so RLS enforces
 * teacher_id = auth.uid()) owns the given class, returning its {id, name}
 * or a 404 — not 403, to avoid confirming a class id exists to a caller who
 * doesn't own it. Shared by every teacher-only class-scoped route (roster,
 * assignments) so the ownership check has exactly one implementation.
 */
export async function requireTeacherOwnsClass(
  supabase: SupabaseClient,
  teacherId: string,
  classId: string
): Promise<TeacherOwnsClassResult> {
  const { data: klass, error } = await supabase
    .from("classes")
    // "*" rather than a column list so a deploy that lands before migration
    // 0017 (skip_weeks) still loads the class instead of 404ing it.
    .select("*")
    .eq("id", classId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error || !klass) return { error: "Class not found", status: 404 };
  return {
    class: {
      id: klass.id as string,
      name: klass.name as string,
      templateId: (klass.template_id as string | null) ?? null,
      startsOn: (klass.starts_on as string | null) ?? null,
      timezone: (klass.timezone as string | null) ?? null,
      launchedAt: (klass.launched_at as string | null) ?? null,
      skipWeeks: Array.isArray(klass.skip_weeks) ? (klass.skip_weeks as string[]) : [],
      joinCode: klass.join_code as string,
    },
  };
}

/** Whether a specific assigned lesson is present in a student's completed set. */
export function isAssignmentComplete(lessonId: string, completed: string[]): boolean {
  return completed.includes(lessonId);
}

export interface AssignmentWithCompletion {
  id: string;
  lessonId: string;
  lessonTitle: string;
  trackTitle: string;
  createdAt: string;
  weekNumber: number | null;
  position: number | null;
  dueOn: string | null;
  completedStudentIds: string[];
}

/**
 * All assignments for a class plus which students (by id) have completed
 * each one. Reads progress across users via the admin client — like
 * getClassRoster, only safe to call after the caller's teacher_id has
 * already been verified against the class.
 */
export async function getClassAssignmentsWithCompletion(
  classId: string
): Promise<AssignmentWithCompletion[]> {
  const admin = getSupabaseAdmin();
  if (!admin) return [];

  const { data: assignments } = await admin
    .from("assignments")
    .select("id, lesson_id, created_at, week_number, position, due_on")
    .eq("class_id", classId)
    .order("week_number", { ascending: true, nullsFirst: false })
    .order("position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (!assignments?.length) return [];

  const { data: members } = await admin
    .from("class_members")
    .select("student_id")
    .eq("class_id", classId);

  const studentIds = (members ?? []).map((m) => m.student_id as string);

  const { data: progressRows } = studentIds.length
    ? await admin.from("progress").select("user_id, completed").in("user_id", studentIds)
    : { data: [] as { user_id: string; completed: unknown }[] };

  const completedByUser = new Map(
    (progressRows ?? []).map((p) => [
      p.user_id as string,
      (Array.isArray(p.completed) ? p.completed : []) as string[],
    ])
  );

  return assignments.map((a) => {
    const lessonId = a.lesson_id as string;
    const lesson = getLessonById(lessonId);
    const track = lesson ? TRACKS.find((t) => t.id === lesson.trackId) : undefined;
    return {
      id: a.id as string,
      lessonId,
      lessonTitle: lesson?.title ?? lessonId,
      trackTitle: track?.title ?? "",
      createdAt: a.created_at as string,
      weekNumber: (a.week_number as number | null) ?? null,
      position: (a.position as number | null) ?? null,
      dueOn: (a.due_on as string | null) ?? null,
      completedStudentIds: studentIds.filter((sid) =>
        isAssignmentComplete(lessonId, completedByUser.get(sid) ?? [])
      ),
    };
  });
}

export { TOTAL_TRACKS, TOTAL_LESSONS };
