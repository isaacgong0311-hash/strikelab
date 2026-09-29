import { describe, expect, it } from "vitest";
import { FIRST_LESSON_ID, FIRST_SESSION_ID, summarizeKickoff } from "./kickoffLive";

describe("kickoff live view", () => {
  it("starts from the program's first lesson and its first short session", () => {
    expect(FIRST_LESSON_ID).toBe("inv-1");
    expect(FIRST_SESSION_ID).toBe("inv-1.1");
  });

  it("counts each stage and lists students still at the start first", () => {
    const live = summarizeKickoff({
      memberIds: ["a", "b", "c", "d"],
      names: new Map([["a", "Ava"], ["b", "Ben"], ["c", "Cam"], ["d", ""]]),
      finishedSession: new Set(["b", "c"]),
      finishedLesson: new Set(["c"]),
    });
    expect(live).toMatchObject({ joined: 4, finishedFirstSession: 2, finishedFirstLesson: 1 });
    expect(live.students).toEqual([
      { name: "Ava", stage: "joined" },
      { name: "StrikeLab student", stage: "joined" },
      { name: "Ben", stage: "first-session" },
      { name: "Cam", stage: "first-lesson" },
    ]);
  });

  it("counts a finished lesson as a finished first session even if that row is missing", () => {
    const live = summarizeKickoff({
      memberIds: ["a"],
      names: new Map([["a", "Ava"]]),
      finishedSession: new Set(),
      finishedLesson: new Set(["a"]),
    });
    expect(live).toMatchObject({ finishedFirstSession: 1, finishedFirstLesson: 1 });
  });

  it("handles an empty class", () => {
    expect(summarizeKickoff({ memberIds: [], names: new Map(), finishedSession: new Set(), finishedLesson: new Set() })).toEqual({
      joined: 0,
      finishedFirstSession: 0,
      finishedFirstLesson: 0,
      students: [],
    });
  });
});
