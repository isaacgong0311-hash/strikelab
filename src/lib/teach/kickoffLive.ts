import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getLessonSessions } from "@/lib/sessions";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import { summarizeKickoff, type KickoffLive } from "./kickoffSummary";

export { summarizeKickoff, type KickoffLive, type KickoffStage } from "./kickoffSummary";

/**
 * The kickoff live view (mega plan Q2): during the first meeting, the leader
 * watches students join and finish the first short session, so nobody leaves
 * the room un-started. Stage only: never accuracy, time or answers.
 */
export const FIRST_LESSON_ID = QUANT_FOUNDATIONS_TEMPLATE.weeks[0].lessonIds[0];
export const FIRST_SESSION_ID = getLessonSessions(FIRST_LESSON_ID)[0]?.id ?? null;

/**
 * Reads across the class's students with the admin client, so it must only
 * run after requireTeacherOwnsClass (same contract as loadCohortScorecard).
 * Returns null when the database isn't reachable.
 */
export async function loadKickoffLive(classId: string): Promise<KickoffLive | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data: members, error } = await admin.from("class_members").select("student_id").eq("class_id", classId);
  if (error) return null;
  const memberIds = (members ?? []).map((m) => m.student_id as string);
  if (memberIds.length === 0) {
    return summarizeKickoff({ memberIds, names: new Map(), finishedSession: new Set(), finishedLesson: new Set() });
  }

  const [profiles, sessions, lessons] = await Promise.all([
    admin.from("profiles").select("id, display_name").in("id", memberIds),
    FIRST_SESSION_ID
      ? admin.from("session_completions").select("user_id").eq("session_id", FIRST_SESSION_ID).in("user_id", memberIds)
      : Promise.resolve({ data: [] as { user_id: string }[] }),
    admin.from("lesson_completions").select("user_id").eq("lesson_id", FIRST_LESSON_ID).in("user_id", memberIds),
  ]);

  // A missing table (migrations 0014/0016 not applied) just means no one counts as finished yet.
  return summarizeKickoff({
    memberIds,
    names: new Map((profiles.data ?? []).map((p) => [p.id as string, (p.display_name as string) ?? ""])),
    finishedSession: new Set((sessions.data ?? []).map((r) => r.user_id as string)),
    finishedLesson: new Set((lessons.data ?? []).map((r) => r.user_id as string)),
  });
}
