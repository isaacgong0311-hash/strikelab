import { getLessonById } from "@/lib/tracks";
import { getLessonSessions } from "@/lib/sessions";
import {
  QUANT_FOUNDATIONS_TEMPLATE,
  cohortDayStatus,
  cohortWeekWindows,
  type CohortDayStatus,
} from "./template";

/**
 * What a student sees on their cohort home (/cohort/[classId]): where the
 * cohort is in its six weeks, this week's work, and ONE next action. Pure,
 * so every calendar edge (before start, break week, overdue, finished) is
 * unit-tested; the page only fetches rows and renders this.
 */

export interface CohortAssignment {
  lessonId: string;
  weekNumber: number | null;
  position: number | null;
  dueOn: string | null;
}

export interface StudentCohortInput {
  startsOn: string;
  skipWeeks: readonly string[];
  assignments: readonly CohortAssignment[];
  /** Lessons this student has completed. */
  completedLessonIds: ReadonlySet<string>;
  /** Bite-sized sessions this student has finished, for resuming mid-lesson. */
  completedSessionIds: ReadonlySet<string>;
  /** Today in the cohort's timezone, YYYY-MM-DD. */
  today: string;
}

export interface CohortLessonItem {
  lessonId: string;
  title: string;
  href: string;
  done: boolean;
  dueOn: string | null;
  /** "3 short sessions" when the lesson has a bite-sized version. */
  sessionCount: number;
  /** Sessions of this lesson the student has finished. */
  sessionsDone: number;
}

export interface CohortWeekItem {
  week: number;
  title: string;
  startsOn: string;
  endsOn: string;
  lessons: CohortLessonItem[];
  done: boolean;
}

export interface CohortNextAction extends CohortLessonItem {
  week: number;
  overdue: boolean;
  /** Whole days until due (negative when overdue), or null without a due date. */
  daysLeft: number | null;
}

export interface StudentCohortView {
  status: CohortDayStatus;
  /** The week to show first: the current one, the next one during a break or before start, else the last. */
  focusWeek: number;
  daysUntilStart: number | null;
  weeks: CohortWeekItem[];
  nextAction: CohortNextAction | null;
  progress: { done: number; total: number };
}

function dayDiff(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Link to the next unfinished session when the lesson has them, else the long-form lesson. */
export function lessonHref(lessonId: string, done: boolean, completedSessionIds: ReadonlySet<string>): string {
  const sessions = getLessonSessions(lessonId);
  if (done || sessions.length === 0) return `/lesson/${lessonId}`;
  const next = sessions.find((s) => !completedSessionIds.has(s.id)) ?? sessions[0];
  return `/learn/${next.id}`;
}

export function buildStudentCohortView(input: StudentCohortInput): StudentCohortView {
  const windows = cohortWeekWindows(input.startsOn, input.skipWeeks);
  const status = cohortDayStatus(input.today, windows);

  const scheduled = [...input.assignments]
    .filter((a): a is CohortAssignment & { weekNumber: number } => a.weekNumber !== null)
    .sort((a, b) => a.weekNumber - b.weekNumber || (a.position ?? 0) - (b.position ?? 0));

  const weeks: CohortWeekItem[] = windows.map((window) => {
    const lessons = scheduled
      .filter((a) => a.weekNumber === window.week)
      .map((a): CohortLessonItem => {
        const done = input.completedLessonIds.has(a.lessonId);
        const sessions = getLessonSessions(a.lessonId);
        return {
          lessonId: a.lessonId,
          title: getLessonById(a.lessonId)?.title ?? a.lessonId,
          href: lessonHref(a.lessonId, done, input.completedSessionIds),
          done,
          dueOn: a.dueOn,
          sessionCount: sessions.length,
          sessionsDone: sessions.filter((s) => input.completedSessionIds.has(s.id)).length,
        };
      });
    return {
      week: window.week,
      title: QUANT_FOUNDATIONS_TEMPLATE.weeks[window.week - 1]?.title ?? `Week ${window.week}`,
      startsOn: window.startsOn,
      endsOn: window.endsOn,
      lessons,
      done: lessons.length > 0 && lessons.every((l) => l.done),
    };
  });

  let focusWeek: number;
  if (status.kind === "week") focusWeek = status.week;
  else if (status.kind === "before") focusWeek = 1;
  else if (status.kind === "break") focusWeek = windows.find((w) => w.startsOn > input.today)?.week ?? windows.length;
  else focusWeek = windows.length;

  // The earliest unfinished lesson in schedule order: overdue work first,
  // then this week's, then getting ahead.
  let nextAction: CohortNextAction | null = null;
  for (const week of weeks) {
    const lesson = week.lessons.find((l) => !l.done);
    if (!lesson) continue;
    const daysLeft = lesson.dueOn ? dayDiff(input.today, lesson.dueOn) : null;
    nextAction = { ...lesson, week: week.week, overdue: daysLeft !== null && daysLeft < 0, daysLeft };
    break;
  }

  const all = weeks.flatMap((w) => w.lessons);
  return {
    status,
    focusWeek,
    daysUntilStart: status.kind === "before" ? dayDiff(input.today, windows[0].startsOn) : null,
    weeks,
    nextAction,
    progress: { done: all.filter((l) => l.done).length, total: all.length },
  };
}
