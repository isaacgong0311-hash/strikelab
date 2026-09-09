import { describe, expect, it } from "vitest";
import { isAssignmentComplete } from "./classes";
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
