import { describe, expect, it, vi } from "vitest";
import { CODE_ALPHABET, JOIN_CODE_LENGTH, generateJoinCode, isAssignmentComplete } from "./classes";
import { TRACKS } from "./tracks";

// isAssignmentComplete decides whether a teacher's roster shows a given
// student as "done" for an assigned lesson (see
// getClassAssignmentsWithCompletion / src/app/api/classes/[id]/roster).
// Zero coverage before this file.

describe("isAssignmentComplete", () => {
  const lessonId = TRACKS[0].lessons[0].id;

  it("returns true when the lesson id is present in completed", () => {
    expect(isAssignmentComplete(lessonId, [lessonId])).toBe(true);
  });

  it("returns true when completed has other ids alongside the lesson id", () => {
    expect(isAssignmentComplete(lessonId, ["some-other-lesson", lessonId])).toBe(true);
  });

  it("returns false when the lesson id is absent from completed", () => {
    expect(isAssignmentComplete(lessonId, ["some-other-lesson"])).toBe(false);
  });

  it("returns false for an empty completed list", () => {
    expect(isAssignmentComplete(lessonId, [])).toBe(false);
  });

  it("is unaffected by unrelated ids in completed", () => {
    const unrelated = TRACKS.flatMap((t) => t.lessons.map((l) => l.id)).filter((id) => id !== lessonId);
    expect(isAssignmentComplete(lessonId, unrelated)).toBe(false);
  });
});

describe("generateJoinCode", () => {
  it("makes codes from the readable alphabet at the expected length", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateJoinCode();
      expect(code).toHaveLength(JOIN_CODE_LENGTH);
      expect([...code].every((c) => CODE_ALPHABET.includes(c))).toBe(true);
    }
  });

  it("uses all 32 symbols and does not repeat across many draws", () => {
    expect(CODE_ALPHABET).toHaveLength(32); // the code space is 32^6, about 1.07 billion
    const seen = new Set<string>();
    const symbols = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      const code = generateJoinCode();
      seen.add(code);
      for (const c of code) symbols.add(c);
    }
    expect(symbols.size).toBe(32);
    expect(seen.size).toBeGreaterThan(1990); // birthday collisions at 2000 of 1.07B are vanishingly rare
  });

  it("draws from the Web Crypto generator, not Math.random", () => {
    const math = vi.spyOn(Math, "random");
    generateJoinCode();
    expect(math).not.toHaveBeenCalled();
    math.mockRestore();
  });
});
