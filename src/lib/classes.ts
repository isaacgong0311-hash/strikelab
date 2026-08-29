import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TRACKS } from "@/lib/tracks";

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

export { TOTAL_TRACKS, TOTAL_LESSONS };
