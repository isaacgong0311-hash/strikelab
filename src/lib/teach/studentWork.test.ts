import { describe, expect, it } from "vitest";
import { getLessonById } from "@/lib/tracks";
import { buildStudentWork, type StudentWorkInput } from "./studentWork";

const starter = (id: string) => getLessonById(id)!.exercise.starterCode;

function input(overrides: Partial<StudentWorkInput> = {}): StudentWorkInput {
  return {
    assignments: [
      { lessonId: "inv-1", weekNumber: 1, position: 1, dueOn: "2026-10-11" },
      { lessonId: "1", weekNumber: 2, position: 1, dueOn: "2026-10-18" },
      { lessonId: "2", weekNumber: 2, position: 2, dueOn: "2026-10-18" },
      { lessonId: "3", weekNumber: 3, position: 1, dueOn: "2026-10-25" },
    ],
    completions: [],
    submissions: [],
    today: "2026-10-20",
    timezone: "America/Chicago",
    ...overrides,
  };
}

describe("buildStudentWork", () => {
  it("orders assigned lessons by week and position, whatever order they arrive in", () => {
    const work = buildStudentWork(input({ assignments: [...input().assignments].reverse() }));
    expect(work.assigned.map((w) => w.lessonId)).toEqual(["inv-1", "1", "2", "3"]);
    expect(work.assigned[0].title).toBe(getLessonById("inv-1")!.title);
    expect(work.assigned[1].trackTitle).toBe("Options Pricing");
  });

  it("tells passed, completed, attempted and not started apart", () => {
    const work = buildStudentWork(
      input({
        completions: [{ lessonId: "inv-1", completedAt: "2026-10-06T03:00:00Z" }],
        submissions: [
          { lessonId: "1", code: "def f():\n  return 1\n", updatedAt: "2026-10-14T15:00:00Z", lastPassedAt: "2026-10-14T15:00:00Z" },
          { lessonId: "2", code: "def g():\n  pass  # stuck here\n", updatedAt: "2026-10-19T15:00:00Z", lastPassedAt: null },
        ],
      })
    );
    const byId = Object.fromEntries(work.assigned.map((w) => [w.lessonId, w]));
    expect(byId["inv-1"].status).toBe("completed");
    expect(byId["inv-1"].hasCode).toBe(false);
    // 03:00 UTC on Oct 6 is still Oct 5 in Chicago.
    expect(byId["inv-1"].completedOn).toBe("2026-10-05");
    expect(byId["1"].status).toBe("passed");
    expect(byId["1"].passedAt).toBe("2026-10-14T15:00:00Z");
    expect(byId["2"].status).toBe("attempted");
    expect(byId["2"].code).toContain("stuck here");
    expect(byId["3"].status).toBe("not-started");
  });

  it("doesn't count untouched starter code as an attempt or show it", () => {
    const work = buildStudentWork(
      input({ submissions: [{ lessonId: "2", code: `${starter("2")}\n\n`, updatedAt: "2026-10-19T15:00:00Z", lastPassedAt: null }] })
    );
    const lesson = work.assigned.find((w) => w.lessonId === "2")!;
    expect(lesson.status).toBe("not-started");
    expect(lesson.code).toBeNull();
    expect(lesson.savedAt).toBeNull();
  });

  it("counts a completed coding lesson as passed even without synced code", () => {
    const work = buildStudentWork(input({ completions: [{ lessonId: "1", completedAt: "2026-10-14T15:00:00Z" }] }));
    const lesson = work.assigned.find((w) => w.lessonId === "1")!;
    expect(lesson.status).toBe("passed");
    expect(lesson.code).toBeNull();
  });

  it("flags only unfinished lessons whose due date has passed", () => {
    const work = buildStudentWork(
      input({
        today: "2026-10-20",
        completions: [{ lessonId: "inv-1", completedAt: "2026-10-12T15:00:00Z" }],
        submissions: [{ lessonId: "2", code: "def g():\n  return 2\n", updatedAt: "2026-10-19T15:00:00Z", lastPassedAt: null }],
      })
    );
    expect(work.assigned.filter((w) => w.overdue).map((w) => w.lessonId)).toEqual(["1", "2"]);
    expect(work.counts).toEqual({ assigned: 4, finished: 1, overdue: 2, codeAssigned: 3, codePassed: 0 });
  });

  it("is never overdue on the due date itself", () => {
    const work = buildStudentWork(input({ today: "2026-10-18" }));
    expect(work.assigned.filter((w) => w.overdue).map((w) => w.lessonId)).toEqual(["inv-1"]);
  });

  it("lists unassigned work separately, most recent first, skipping untouched starters", () => {
    const work = buildStudentWork(
      input({
        assignments: [{ lessonId: "inv-1", weekNumber: 1, position: 1, dueOn: "2026-10-11" }],
        completions: [{ lessonId: "inv-2", completedAt: "2026-10-02T15:00:00Z" }],
        submissions: [
          { lessonId: "3", code: "def h():\n  return 3\n", updatedAt: "2026-10-15T15:00:00Z", lastPassedAt: "2026-10-15T15:00:00Z" },
          { lessonId: "4", code: starter("4"), updatedAt: "2026-10-16T15:00:00Z", lastPassedAt: null },
        ],
      })
    );
    expect(work.other.map((w) => w.lessonId)).toEqual(["3", "inv-2"]);
    expect(work.other.every((w) => !w.overdue && w.dueOn === null)).toBe(true);
    expect(work.counts.assigned).toBe(1);
  });

  it("keeps an assigned lesson that no longer exists, titled by its id", () => {
    const work = buildStudentWork(
      input({
        assignments: [{ lessonId: "retired-lesson", weekNumber: 1, position: 1, dueOn: "2026-10-11" }],
        submissions: [{ lessonId: "retired-lesson", code: "x = 1", updatedAt: "2026-10-10T15:00:00Z", lastPassedAt: null }],
      })
    );
    expect(work.assigned[0]).toMatchObject({ lessonId: "retired-lesson", title: "retired-lesson", hasCode: false, status: "attempted" });
  });
});
