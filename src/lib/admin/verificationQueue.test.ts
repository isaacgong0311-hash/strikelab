import { describe, expect, it } from "vitest";
import { buildVerificationQueue } from "./verificationQueue";

const student = "11111111-1111-4111-8111-111111111111";
const capstone = "55555555-5555-4555-8555-555555555555";

describe("verification queue", () => {
  it("includes submitted unverified capstones and final top-10 placings only", () => {
    const queue = buildVerificationQueue("2026-10-19", [
      { id: capstone, user_id: student, title: "Example capstone", status: "submitted", submitted_at: "2026-10-17T00:00:00Z", thesis: "Thesis", code: "print(1)", result_summary: "Result", reflection: "Reflection" },
      { id: "other", user_id: student, title: "Draft", status: "draft", submitted_at: null, thesis: "", code: "", result_summary: "", reflection: "" },
    ], [
      { id: "s1", title: "Season 1", ends_on: "2026-10-18" },
      { id: "s2", title: "Season 2", ends_on: "2026-11-18" },
    ], {
      s1: [{ rank: 1, handle: "student_one" }, { rank: 11, handle: "another" }],
      s2: [{ rank: 1, handle: "student_one" }],
    }, [{ id: student, handle: "student_one" }], []);
    expect(queue.capstones).toEqual([expect.objectContaining({ userId: student, subjectId: capstone, handle: "student_one" })]);
    expect(queue.placings).toEqual([expect.objectContaining({ userId: student, subjectId: "s1:1", rank: 1 })]);
  });

  it("removes already verified claims", () => {
    const queue = buildVerificationQueue("2026-10-19", [
      { id: capstone, user_id: student, title: "Example", status: "submitted", submitted_at: null, thesis: "", code: "", result_summary: "", reflection: "" },
    ], [{ id: "s1", title: "Season 1", ends_on: "2026-10-18" }], {
      s1: [{ rank: 2, handle: "student_one" }],
    }, [{ id: student, handle: "student_one" }], [
      { user_id: student, kind: "capstone", subject_id: capstone },
      { user_id: student, kind: "placing", subject_id: "s1:2" },
    ]);
    expect(queue).toEqual({ capstones: [], placings: [] });
  });
});
