import { localDateKey } from "@/lib/progress/streak";
import { getLessonById, TRACKS } from "@/lib/tracks";

/**
 * One student's work, lesson by lesson, for their leader (the student page
 * in the class workspace). Pure: the loader reads the rows, this decides what
 * each lesson's state is, and the view only formats it.
 *
 *   passed       the exercise's tests passed at least once
 *   completed    the lesson was finished (investing lessons have no code)
 *   attempted    code was changed from the starter but hasn't passed
 *   not-started  nothing yet
 */
export type LessonWorkStatus = "passed" | "completed" | "attempted" | "not-started";

export interface StudentWorkInput {
  assignments: readonly { lessonId: string; weekNumber: number | null; position: number | null; dueOn: string | null }[];
  completions: readonly { lessonId: string; completedAt: string | null }[];
  submissions: readonly { lessonId: string; code: string; updatedAt: string; lastPassedAt: string | null }[];
  /** Today in the cohort's timezone, YYYY-MM-DD. */
  today: string;
  timezone: string;
}

export interface LessonWork {
  lessonId: string;
  title: string;
  trackTitle: string | null;
  weekNumber: number | null;
  dueOn: string | null;
  /** The lesson has a Python exercise (Options and Quant tracks). */
  hasCode: boolean;
  status: LessonWorkStatus;
  /** Assigned, due before today, and not finished. */
  overdue: boolean;
  /** Day the lesson was finished, in the cohort's timezone. */
  completedOn: string | null;
  code: string | null;
  savedAt: string | null;
  passedAt: string | null;
}

export interface StudentWork {
  /** Assigned lessons in schedule order. */
  assigned: LessonWork[];
  /** Lessons the student worked on that weren't assigned, most recent first. */
  other: LessonWork[];
  counts: { assigned: number; finished: number; overdue: number; codeAssigned: number; codePassed: number };
}

const FINISHED: ReadonlySet<LessonWorkStatus> = new Set(["passed", "completed"]);

export function isFinished(status: LessonWorkStatus): boolean {
  return FINISHED.has(status);
}

export function buildStudentWork(input: StudentWorkInput): StudentWork {
  const completions = new Map(input.completions.map((c) => [c.lessonId, c.completedAt]));
  const submissions = new Map(input.submissions.map((s) => [s.lessonId, s]));

  function lessonWork(lessonId: string, schedule: { weekNumber: number | null; dueOn: string | null } | null): LessonWork | null {
    const lesson = getLessonById(lessonId);
    const hasCode = lesson ? lesson.trackId !== "investing" : false;
    const submission = submissions.get(lessonId);
    // Unchanged starter code is not an attempt; it's what everyone sees.
    const touched = submission && lesson ? submission.code.trim() !== lesson.exercise.starterCode.trim() : !!submission;
    const completedAt = completions.get(lessonId);
    const isComplete = completions.has(lessonId);

    let status: LessonWorkStatus = "not-started";
    if (submission?.lastPassedAt) status = "passed";
    else if (isComplete) status = hasCode ? "passed" : "completed";
    else if (touched) status = "attempted";
    // A completion with no saved code (another device before sync existed) still counts as passed.

    const dueOn = schedule?.dueOn ?? null;
    return {
      lessonId,
      title: lesson?.title ?? lessonId,
      trackTitle: lesson ? trackTitleFor(lesson.trackId) : null,
      weekNumber: schedule?.weekNumber ?? null,
      dueOn,
      hasCode,
      status,
      overdue: !!schedule && !isFinished(status) && dueOn !== null && dueOn < input.today,
      completedOn: completedAt ? localDateKey(new Date(completedAt), input.timezone) : null,
      code: submission && touched ? submission.code : null,
      savedAt: submission && touched ? submission.updatedAt : null,
      passedAt: submission?.lastPassedAt ?? null,
    };
  }

  const scheduled = [...input.assignments].sort(
    (a, b) => (a.weekNumber ?? 99) - (b.weekNumber ?? 99) || (a.position ?? 0) - (b.position ?? 0) || (a.dueOn ?? "").localeCompare(b.dueOn ?? "")
  );
  const assignedIds = new Set(scheduled.map((a) => a.lessonId));
  const assigned = scheduled
    .map((a) => lessonWork(a.lessonId, a))
    .filter((w): w is LessonWork => w !== null);

  const otherIds = new Set([...completions.keys(), ...submissions.keys()].filter((id) => !assignedIds.has(id)));
  const other = [...otherIds]
    .map((id) => lessonWork(id, null))
    .filter((w): w is LessonWork => w !== null && w.status !== "not-started")
    .sort((a, b) => lastTouched(b).localeCompare(lastTouched(a)));

  const coding = assigned.filter((w) => w.hasCode);
  return {
    assigned,
    other,
    counts: {
      assigned: assigned.length,
      finished: assigned.filter((w) => isFinished(w.status)).length,
      overdue: assigned.filter((w) => w.overdue).length,
      codeAssigned: coding.length,
      codePassed: coding.filter((w) => w.status === "passed").length,
    },
  };
}

function lastTouched(w: LessonWork): string {
  return w.passedAt ?? w.savedAt ?? w.completedOn ?? "";
}

function trackTitleFor(trackId: string): string | null {
  return TRACKS.find((t) => t.id === trackId)?.title ?? null;
}
