import { describe, expect, it } from "vitest";
import { buildCohortSchedule } from "./template";
import { buildStudentCohortView, type StudentCohortInput } from "./studentView";

// Cohort starting Mon Oct 26 with Thanksgiving week (Nov 23) off.
const START = "2026-10-26";
const SKIPS = ["2026-11-23"];
const assignments = buildCohortSchedule(START, SKIPS).map((row) => ({
  lessonId: row.lessonId,
  weekNumber: row.weekNumber,
  position: row.position,
  dueOn: row.dueOn,
}));

function view(overrides: Partial<StudentCohortInput> = {}) {
  return buildStudentCohortView({
    startsOn: START,
    skipWeeks: SKIPS,
    assignments,
    completedLessonIds: new Set(),
    completedSessionIds: new Set(),
    today: "2026-10-28",
    ...overrides,
  });
}

describe("buildStudentCohortView", () => {
  it("shows week 1 with the first lesson as the one next action", () => {
    const v = view();
    expect(v.status).toEqual({ kind: "week", week: 1 });
    expect(v.focusWeek).toBe(1);
    expect(v.weeks[0]).toMatchObject({ week: 1, title: "Markets and risk", startsOn: "2026-10-26", endsOn: "2026-11-01" });
    expect(v.weeks[0].lessons.map((l) => l.lessonId)).toEqual(["inv-1", "inv-2", "inv-5"]);
    expect(v.nextAction).toMatchObject({ lessonId: "inv-1", week: 1, dueOn: "2026-11-01", daysLeft: 4, overdue: false });
    expect(v.progress).toEqual({ done: 0, total: 12 });
  });

  it("links lessons with sessions to the next unfinished session", () => {
    const v = view({ completedSessionIds: new Set(["inv-1.1"]) });
    expect(v.nextAction?.href).toBe("/learn/inv-1.2");
    expect(v.nextAction?.sessionCount).toBe(3);
    expect(v.nextAction?.sessionsDone).toBe(1);
    // No sessions yet for inv-5: long-form lesson.
    expect(v.weeks[0].lessons[2].href).toBe("/lesson/inv-5");
  });

  it("puts overdue work first", () => {
    const v = view({ today: "2026-11-04", completedLessonIds: new Set(["inv-1", "inv-2"]) });
    expect(v.status).toEqual({ kind: "week", week: 2 });
    expect(v.nextAction).toMatchObject({ lessonId: "inv-5", week: 1, overdue: true, daysLeft: -3 });
  });

  it("lets a student get ahead once the current week is done", () => {
    const v = view({ completedLessonIds: new Set(["inv-1", "inv-2", "inv-5"]) });
    expect(v.weeks[0].done).toBe(true);
    expect(v.nextAction).toMatchObject({ lessonId: "1", week: 2 });
  });

  it("counts down before the start", () => {
    const v = view({ today: "2026-10-21" });
    expect(v.status).toEqual({ kind: "before" });
    expect(v.daysUntilStart).toBe(5);
    expect(v.focusWeek).toBe(1);
  });

  it("focuses the week after a break", () => {
    const v = view({ today: "2026-11-25" });
    expect(v.status).toEqual({ kind: "break" });
    expect(v.focusWeek).toBe(5);
    expect(v.weeks[4]).toMatchObject({ week: 5, startsOn: "2026-11-30", title: "Research discipline" });
  });

  it("has no next action when everything is done", () => {
    const v = view({ today: "2026-12-20", completedLessonIds: new Set(assignments.map((a) => a.lessonId)) });
    expect(v.status).toEqual({ kind: "after" });
    expect(v.focusWeek).toBe(6);
    expect(v.nextAction).toBeNull();
    expect(v.progress).toEqual({ done: 12, total: 12 });
  });

  it("ignores manual assignments without a week", () => {
    const v = view({ assignments: [...assignments, { lessonId: "8", weekNumber: null, position: null, dueOn: null }] });
    expect(v.progress.total).toBe(12);
  });
});
