import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, isUnlocked } from "./achievements";

// isUnlocked drives both the dashboard achievement grid and /achievements —
// a wrong result here either shows a badge as earned when it isn't, or
// leaves a genuinely-earned badge looking locked. Zero coverage before this
// file.

describe("isUnlocked", () => {
  it("is locked with no completed lessons", () => {
    const ids = new Set<string>();
    for (const a of ACHIEVEMENTS) {
      expect(isUnlocked(a, ids)).toBe(false);
    }
  });

  it("unlocks a single-lesson achievement once its specific lesson is done", () => {
    const parity = ACHIEVEMENTS.find((a) => a.id === "parity")!;
    expect(isUnlocked(parity, new Set(["2"]))).toBe(true);
    expect(isUnlocked(parity, new Set(["1", "3"]))).toBe(false);
  });

  it("requires every lesson in a multi-lesson achievement, not just some", () => {
    const greeks = ACHIEVEMENTS.find((a) => a.id === "greeks")!;
    expect(isUnlocked(greeks, new Set(["4", "5", "6", "7"]))).toBe(false); // missing "11"
    expect(isUnlocked(greeks, new Set(["4", "5", "6", "7", "11"]))).toBe(true);
  });

  it("all-star only unlocks at exactly the full lesson count, not before", () => {
    const allstar = ACHIEVEMENTS.find((a) => a.id === "allstar")!;
    const ids22 = new Set(Array.from({ length: 22 }, (_, i) => `x${i}`));
    const ids23 = new Set(Array.from({ length: 23 }, (_, i) => `x${i}`));
    expect(isUnlocked(allstar, ids22)).toBe(false);
    expect(isUnlocked(allstar, ids23)).toBe(true);
  });

  it("every achievement id is unique", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
