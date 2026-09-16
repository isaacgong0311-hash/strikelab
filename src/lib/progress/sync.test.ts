import { describe, expect, it } from "vitest";
import { EMPTY_PROGRESS, isValidTimeZone, mergeProgress } from "./sync";

describe("isValidTimeZone", () => {
  it("accepts IANA zone names", () => {
    expect(isValidTimeZone("America/Chicago")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
  });

  it("rejects junk, empty, oversized, and non-string values", () => {
    expect(isValidTimeZone("Mars/Olympus_Mons")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
    expect(isValidTimeZone("A".repeat(65))).toBe(false);
    expect(isValidTimeZone(null)).toBe(false);
    expect(isValidTimeZone(42)).toBe(false);
  });
});

describe("mergeProgress", () => {
  it("keeps every completion and the streak from the most recent activity", () => {
    const phone = { ...EMPTY_PROGRESS, completed: ["1"], xp: 100, streak: 5, lastActivityDate: "2026-09-15", activityByDate: { "2026-09-15": 1 } };
    const laptop = { ...EMPTY_PROGRESS, completed: ["2"], xp: 200, streak: 6, lastActivityDate: "2026-09-16", activityByDate: { "2026-09-15": 2, "2026-09-16": 1 } };
    expect(mergeProgress(phone, laptop)).toEqual({
      completed: ["1", "2"],
      xp: 200,
      streak: 6,
      lastActivityDate: "2026-09-16",
      activityByDate: { "2026-09-15": 2, "2026-09-16": 1 },
    });
    expect(mergeProgress(laptop, phone).streak).toBe(6);
  });
});
