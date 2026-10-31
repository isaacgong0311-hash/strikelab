import { describe, expect, it } from "vitest";
import { buildSharedRecord } from "./shared";

describe("buildSharedRecord", () => {
  it("shows only verified kinds and finds the best placing", () => {
    const view = buildSharedRecord({ handle: "student_one", items: [
      { kind: "placing", subject_id: "s1:3", verified_at: "2026-10-01T00:00:00Z" },
      { kind: "placing", subject_id: "s2:1", verified_at: "2026-10-02T00:00:00Z" },
      { kind: "capstone", subject_id: "a-private-id", verified_at: "2026-10-03T00:00:00Z" },
      { kind: "unknown", subject_id: "secret", verified_at: "2026-10-04T00:00:00Z" },
    ] });
    expect(view).toEqual({
      handle: "student_one", verifiedCount: 3, bestPlacing: 1,
      placings: [
        { rank: 1, verifiedAt: "2026-10-02T00:00:00Z" },
        { rank: 3, verifiedAt: "2026-10-01T00:00:00Z" },
      ],
      capstones: [{ verifiedAt: "2026-10-03T00:00:00Z" }],
    });
    expect(JSON.stringify(view)).not.toContain("a-private-id");
  });

  it("rejects malformed rows and never treats a malformed rank as proof", () => {
    expect(buildSharedRecord({ handle: "", items: [] })).toBeNull();
    expect(buildSharedRecord({ handle: "student_one", items: [{ kind: "placing", subject_id: "s1:0", verified_at: "2026-10-01" }] }))
      .toEqual({ handle: "student_one", verifiedCount: 0, bestPlacing: null, placings: [], capstones: [] });
  });
});
