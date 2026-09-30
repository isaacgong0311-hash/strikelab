/**
 * The pure half of the kickoff live view (mega plan Q2), kept apart from the
 * database loader in ./kickoffLive so client code (the /demo kickoff panel)
 * can use it without pulling in the admin client. Stage only: never
 * accuracy, time or answers.
 */
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
