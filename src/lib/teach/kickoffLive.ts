import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getLessonSessions } from "@/lib/sessions";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";

/**
 * The kickoff live view (mega plan Q2): during the first meeting, the leader
 * watches students join and finish the first short session, so nobody leaves
 * the room un-started. Stage only: never accuracy, time or answers.
 */
export const FIRST_LESSON_ID = QUANT_FOUNDATIONS_TEMPLATE.weeks[0].lessonIds[0];
export const FIRST_SESSION_ID = getLessonSessions(FIRST_LESSON_ID)[0]?.id ?? null;

export type KickoffStage = "joined" | "first-session" | "first-lesson";

export interface KickoffLive {
  joined: number;
  finishedFirstSession: number;
  finishedFirstLesson: number;
  students: { name: string; stage: KickoffStage }[];
}

const STAGE_ORDER: Record<KickoffStage, number> = { joined: 0, "first-session": 1, "first-lesson": 2 };

/** Pure: who is where. Students still at "joined" come first, since they're the ones to help. */
export function summarizeKickoff(input: {
  memberIds: string[];
  names: Map<string, string>;
  finishedSession: Set<string>;
  finishedLesson: Set<string>;
}): KickoffLive {
  const students = input.memberIds.map((id) => {
    const stage: KickoffStage = input.finishedLesson.has(id)
      ? "first-lesson"
      : input.finishedSession.has(id)
        ? "first-session"
        : "joined";
    return { name: input.names.get(id) || "StrikeLab student", stage };
  });
  students.sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage] || a.name.localeCompare(b.name));
  return {
    joined: students.length,
    // Finishing the lesson means its first session was finished too.
    finishedFirstSession: students.filter((s) => s.stage !== "joined").length,
    finishedFirstLesson: students.filter((s) => s.stage === "first-lesson").length,
    students,
  };
}

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
