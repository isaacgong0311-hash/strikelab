import { addDaysToKey, localDateKey } from "@/lib/progress/streak";
import { cohortDayStatus, cohortWeekWindows, type CohortDayStatus } from "./template";
import type { CohortAssignment } from "./studentView";

/**
 * Cohort outcome metrics, exactly as defined in docs/gtm/metric-glossary.md.
 * Pure and server-only by convention: routes compute this and send the
 * result; the browser never derives a metric from raw rows.
 *
 * Days are calendar days in the cohort's timezone. Completions with a NULL
 * completed_at (recorded before tracking began, migration 0016) count toward
 * "lessons done" but never toward activation or week-N activity, because
 * we can't know when they happened.
 */

/** Days after joining (or the cohort start, whichever is later) to finish the first lesson. */
export const ACTIVATION_WINDOW_DAYS = 7;
/** No completion or activity for this long, with overdue work, flags a student. */
export const INACTIVE_DAYS = 7;
/** Grace period after the last week for "program completed". */
export const COMPLETION_GRACE_DAYS = 7;

export interface CohortMember {
  studentId: string;
  displayName: string;
  /** class_members.joined_at, ISO timestamp. */
  joinedAt: string;
  /** progress.last_activity_date (learner-local YYYY-MM-DD), if known. */
  lastActivityDate?: string | null;
  /** The student's capstone for this cohort, if they started one. */
  capstone?: { id: string; status: "draft" | "submitted"; submittedAt: string | null } | null;
}

export interface CohortCompletion {
  studentId: string;
  lessonId: string;
  /** ISO timestamp, or null when recorded before tracking began. */
  completedAt: string | null;
}

export interface CohortMetricsInput {
  startsOn: string;
  skipWeeks: readonly string[];
  timezone: string;
  assignments: readonly CohortAssignment[];
  members: readonly CohortMember[];
  completions: readonly CohortCompletion[];
  now: Date;
  /** False before capstones exist (migration 0019): program completion then ignores them. */
  capstonesEnabled?: boolean;
}

export interface StudentMetrics {
  studentId: string;
  displayName: string;
  joinedOn: string;
  /** true / false, or null while their activation window is still open. */
  activated: boolean | null;
  /** Active in each cohort week; null for weeks that haven't started. */
  activeByWeek: (boolean | null)[];
  week4Retained: boolean;
  lessonsDone: number;
  lessonsTotal: number;
  overdue: number;
  /** Most recent completion or activity day, YYYY-MM-DD. */
  lastActiveOn: string | null;
  programCompleted: boolean;
  capstone: { id: string; status: "draft" | "submitted"; submittedOn: string | null } | null;
  needsHelp: string | null;
}

export interface Rate {
  count: number;
  of: number;
  /** Whole percent, or null when `of` is 0. */
  pct: number | null;
}

export interface CohortMetrics {
  today: string;
  status: CohortDayStatus;
  weeks: { week: number; startsOn: string; endsOn: string; started: boolean; active: number | null }[];
  enrolled: number;
  activated: Rate & { pending: number };
  activeThisWeek: number | null;
  /** Activated students active in week 4; null until week 4 has started. */
  week4Retained: (Rate & { final: boolean }) | null;
  programCompleted: Rate & { final: boolean };
  /** Activated students who submitted a capstone; null before capstones exist. */
  capstones: Rate | null;
  students: StudentMetrics[];
}

function rate(count: number, of: number): Rate {
  return { count, of, pct: of > 0 ? Math.round((count / of) * 100) : null };
}

export function computeCohortMetrics(input: CohortMetricsInput): CohortMetrics {
  const { timezone } = input;
  const today = localDateKey(input.now, timezone);
  const windows = cohortWeekWindows(input.startsOn, input.skipWeeks);
  const status = cohortDayStatus(today, windows);
  const programEnd = windows[windows.length - 1].endsOn;
  const completionDeadline = addDaysToKey(programEnd, COMPLETION_GRACE_DAYS);

  const scheduled = input.assignments
    .filter((a): a is CohortAssignment & { weekNumber: number } => a.weekNumber !== null)
    .sort((a, b) => a.weekNumber - b.weekNumber || (a.position ?? 0) - (b.position ?? 0));
  const assigned = new Set(scheduled.map((a) => a.lessonId));
  const firstLesson = scheduled[0]?.lessonId;

  const byStudent = new Map<string, Map<string, string | null>>();
  for (const c of input.completions) {
    if (!assigned.has(c.lessonId)) continue;
    const day = c.completedAt ? localDateKey(new Date(c.completedAt), timezone) : null;
    let lessons = byStudent.get(c.studentId);
    if (!lessons) byStudent.set(c.studentId, (lessons = new Map()));
    lessons.set(c.lessonId, day);
  }

  const students: StudentMetrics[] = input.members.map((m) => {
    const lessons = byStudent.get(m.studentId) ?? new Map<string, string | null>();
    const days = [...lessons.values()].filter((d): d is string => d !== null);
    const joinedOn = localDateKey(new Date(m.joinedAt), timezone);

    // Activated: first assigned lesson done by the end of the window. Doing
    // it earlier (before joining) still counts; an unknown date doesn't.
    const windowStart = joinedOn > input.startsOn ? joinedOn : input.startsOn;
    const activationDeadline = addDaysToKey(windowStart, ACTIVATION_WINDOW_DAYS);
    const firstDay = firstLesson ? lessons.get(firstLesson) : undefined;
    const activated =
      typeof firstDay === "string" && firstDay <= activationDeadline
        ? true
        : today <= activationDeadline
          ? null
          : false;

    const activeByWeek = windows.map((w) =>
      w.startsOn > today ? null : days.some((d) => d >= w.startsOn && d <= w.endsOn)
    );

    const overdue = scheduled.filter((a) => a.dueOn && a.dueOn < today && !lessons.has(a.lessonId)).length;
    const lastCompletion = days.sort().at(-1) ?? null;
    const activity = m.lastActivityDate ?? null;
    const lastActiveOn = [lastCompletion, activity].filter((d): d is string => d !== null).sort().at(-1) ?? null;
    const inactive = !lastActiveOn || lastActiveOn < addDaysToKey(today, -INACTIVE_DAYS);

    let needsHelp: string | null = null;
    if (activated === false) needsHelp = "Hasn't finished the first lesson";
    else if (overdue > 0 && inactive) needsHelp = `${overdue} overdue, inactive ${INACTIVE_DAYS}+ days`;

    const doneInTime = scheduled.every((a) => {
      if (!lessons.has(a.lessonId)) return false;
      const day = lessons.get(a.lessonId);
      return day === null || day === undefined || day <= completionDeadline;
    });

    const capstone = m.capstone
      ? {
          id: m.capstone.id,
          status: m.capstone.status,
          submittedOn: m.capstone.submittedAt ? localDateKey(new Date(m.capstone.submittedAt), timezone) : null,
        }
      : null;
    const capstoneInTime =
      !input.capstonesEnabled ||
      (capstone?.status === "submitted" && capstone.submittedOn !== null && capstone.submittedOn <= completionDeadline);

    return {
      studentId: m.studentId,
      displayName: m.displayName,
      joinedOn,
      activated,
      activeByWeek,
      week4Retained: activated === true && activeByWeek[3] === true,
      lessonsDone: lessons.size,
      lessonsTotal: scheduled.length,
      overdue,
      lastActiveOn,
      programCompleted: scheduled.length > 0 && doneInTime && capstoneInTime,
      capstone,
      needsHelp,
    };
  });

  const activatedCount = students.filter((s) => s.activated === true).length;
  const week4 = windows[3];
  const currentWeek = status.kind === "week" ? status.week : null;

  return {
    today,
    status,
    weeks: windows.map((w, i) => {
      const started = w.startsOn <= today;
      return {
        ...w,
        started,
        active: started ? students.filter((s) => s.activeByWeek[i] === true).length : null,
      };
    }),
    enrolled: students.length,
    activated: { ...rate(activatedCount, students.length), pending: students.filter((s) => s.activated === null).length },
    activeThisWeek: currentWeek ? students.filter((s) => s.activeByWeek[currentWeek - 1] === true).length : null,
    week4Retained:
      week4 && week4.startsOn <= today
        ? { ...rate(students.filter((s) => s.week4Retained).length, activatedCount), final: today > week4.endsOn }
        : null,
    programCompleted: {
      ...rate(students.filter((s) => s.programCompleted).length, students.length),
      final: today > completionDeadline,
    },
    capstones: input.capstonesEnabled
      ? rate(students.filter((s) => s.activated === true && s.capstone?.status === "submitted").length, activatedCount)
      : null,
    students,
  };
}

/** One row per student for the cohort CSV (header first). */
export function cohortCsvRows(metrics: CohortMetrics): string[][] {
  const weekHeaders = metrics.weeks.map((w) => `Week ${w.week} active`);
  const yesNo = (v: boolean | null) => (v === null ? "" : v ? "yes" : "no");
  return [
    [
      "Student",
      "Joined",
      "Activated",
      ...weekHeaders,
      "Week 4 retained",
      "Lessons done",
      "Lessons assigned",
      "Overdue",
      "Last active",
      "Capstone",
      "Program completed",
      "Needs help",
    ],
    ...metrics.students.map((s) => [
      s.displayName,
      s.joinedOn,
      s.activated === null ? "pending" : yesNo(s.activated),
      ...s.activeByWeek.map(yesNo),
      yesNo(s.week4Retained),
      String(s.lessonsDone),
      String(s.lessonsTotal),
      String(s.overdue),
      s.lastActiveOn ?? "",
      s.capstone ? (s.capstone.status === "submitted" ? `submitted ${s.capstone.submittedOn ?? ""}`.trim() : "draft") : "",
      yesNo(s.programCompleted),
      s.needsHelp ?? "",
    ]),
  ];
}
