import { describe, expect, it } from "vitest";
import { KICKOFF_DEMO_MINUTES, kickoffDemoFrame } from "./kickoffDemo";

describe("demo kickoff", () => {
  it("starts with an empty room", () => {
    expect(kickoffDemoFrame(-1).joined).toBe(0);
  });

  it("fills up over the meeting and never goes backwards", () => {
    let prev = kickoffDemoFrame(0);
    for (let m = 1; m <= KICKOFF_DEMO_MINUTES; m++) {
      const frame = kickoffDemoFrame(m);
      expect(frame.joined).toBeGreaterThanOrEqual(prev.joined);
      expect(frame.finishedFirstSession).toBeGreaterThanOrEqual(prev.finishedFirstSession);
      expect(frame.finishedFirstLesson).toBeLessThanOrEqual(frame.finishedFirstSession);
      prev = frame;
    }
  });

  it("ends with the students who need help listed first", () => {
    const end = kickoffDemoFrame(KICKOFF_DEMO_MINUTES);
    expect(end.joined).toBe(10);
    expect(end.students.slice(0, 2).map((s) => s.stage)).toEqual(["joined", "joined"]);
    expect(end.finishedFirstSession).toBe(8);
  });
});
