import { describe, expect, it } from "vitest";
import { DEMO_KICKOFF_MINUTES, demoKickoffAt } from "./kickoff";

describe("demoKickoffAt", () => {
  it("starts empty", () => {
    expect(demoKickoffAt(0)).toMatchObject({ joined: 0, finishedFirstSession: 0, finishedFirstLesson: 0, students: [] });
  });

  it("has one student joined per minute and nobody finished at minute 1", () => {
    expect(demoKickoffAt(1)).toMatchObject({ joined: 1, finishedFirstSession: 0, finishedFirstLesson: 0 });
  });

  it("moves students along: joined, then the short lesson, then lesson 1", () => {
    const k = demoKickoffAt(6);
    expect(k.joined).toBe(6);
    expect(k.finishedFirstSession).toBe(5); // joined at minutes 1-4 are 2+ minutes in, and so is the one who joined at 5 (age 2)
    expect(k.finishedFirstLesson).toBe(2); // age >= 5
  });

  it("lists students still at Joined first, so the leader sees who to help", () => {
    const stages = demoKickoffAt(5).students.map((s) => s.stage);
    expect(stages[0]).toBe("joined");
    expect(stages.at(-1)).not.toBe("joined");
  });

  it("clamps to the demo's length and uses only invented names", () => {
    const k = demoKickoffAt(99);
    expect(k.joined).toBe(DEMO_KICKOFF_MINUTES);
    expect(k.students.every((s) => /^[A-Z][a-z]+ [A-Z]\.$/.test(s.name))).toBe(true);
  });
});
