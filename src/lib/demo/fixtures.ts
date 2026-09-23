import { addDaysToKey, localDateKey } from "@/lib/progress/streak";
import { buildCohortSchedule } from "@/lib/cohorts/template";
import { computeCohortMetrics, cohortCsvRows, type CohortMetrics } from "@/lib/cohorts/metrics";
import { buildStudentCohortView, type StudentCohortView } from "@/lib/cohorts/studentView";
import { getLessonById } from "@/lib/tracks";

/**
 * "Demo Club": fictional sample data for /demo and the homepage, run through
 * the SAME pure functions the real cohort home and scorecard use, so the demo
 * can't drift from the product. Dates are relative to today (mid week 3) so
 * it always looks current. Names are invented and the UI labels it as sample
 * data everywhere it appears.
 */
export const DEMO_CLASS_NAME = "Demo Club";
export const DEMO_TZ = "America/Chicago";

// Invented first names + last initials; none refer to real people.
const STUDENTS = [
  { id: "s1", name: "Maya R.", pace: 1.2 },
  { id: "s2", name: "Jonah K.", pace: 1.0 },
  { id: "s3", name: "Priya S.", pace: 1.1 },
  { id: "s4", name: "Leo M.", pace: 0.9 },
  { id: "s5", name: "Ana T.", pace: 1.0 },
  { id: "s6", name: "Sam O.", pace: 0.6 },
  { id: "s7", name: "Eli W.", pace: 0.8 },
  { id: "s8", name: "Grace L.", pace: 0.35 },
  { id: "s9", name: "Noah B.", pace: 0 },
  { id: "s10", name: "Zoe P.", pace: 1.0 },
];

function noonIso(day: string): string {
  return new Date(`${day}T12:00:00-06:00`).toISOString();
}

export interface DemoData {
  metrics: CohortMetrics;
  csv: string[][];
  studentView: StudentCohortView;
  assignments: { lessonId: string; lessonTitle: string; weekNumber: number; position: number; dueOn: string }[];
}

export function buildDemoData(now: Date = new Date()): DemoData {
  const today = localDateKey(now, DEMO_TZ);
  const startsOn = addDaysToKey(today, -16); // Tuesday-ish of week 3
  const schedule = buildCohortSchedule(startsOn);
  const assignments = schedule.map((r) => ({
    lessonId: r.lessonId,
    lessonTitle: getLessonById(r.lessonId)?.title ?? r.lessonId,
    weekNumber: r.weekNumber,
    position: r.position,
    dueOn: r.dueOn,
  }));

  // Each student finishes lessons in order, one about every (3.5 / pace)
  // days from the start, and never in the future.
  const completions = STUDENTS.flatMap((s) => {
    if (s.pace === 0) return [];
    return schedule
      .map((r, i) => ({ lessonId: r.lessonId, day: addDaysToKey(startsOn, Math.round((i * 3.5 + 1) / s.pace)) }))
      .filter((c) => c.day <= today)
      .map((c) => ({ studentId: s.id, lessonId: c.lessonId, completedAt: noonIso(c.day) }));
  });

  const metrics = computeCohortMetrics({
    startsOn,
    skipWeeks: [],
    timezone: DEMO_TZ,
    assignments: assignments.map(({ lessonId, weekNumber, position, dueOn }) => ({ lessonId, weekNumber, position, dueOn })),
    members: STUDENTS.map((s) => ({
      studentId: s.id,
      displayName: s.name,
      joinedAt: noonIso(startsOn),
      // Two keen students started capstones early; ids are example slugs.
      capstone:
        s.id === "s1"
          ? { id: "option-pricing", status: "draft" as const, submittedAt: null }
          : s.id === "s3"
            ? { id: "backtest", status: "submitted" as const, submittedAt: noonIso(addDaysToKey(today, -1)) }
            : null,
    })),
    completions,
    now,
    capstonesEnabled: true,
  });

  // The student view follows "Jonah K.", a typical on-pace student.
  const jonah = new Set(completions.filter((c) => c.studentId === "s2").map((c) => c.lessonId));
  const studentView = buildStudentCohortView({
    startsOn,
    skipWeeks: [],
    assignments: assignments.map(({ lessonId, weekNumber, position, dueOn }) => ({ lessonId, weekNumber, position, dueOn })),
    completedLessonIds: jonah,
    completedSessionIds: new Set(),
    today,
  });

  return { metrics, csv: cohortCsvRows(metrics), studentView, assignments };
}
