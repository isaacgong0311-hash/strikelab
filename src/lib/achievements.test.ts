import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, isUnlocked } from "./achievements";
import { TRACKS } from "./tracks";

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

  it("all-star only unlocks once every current lesson is done", () => {
    const allstar = ACHIEVEMENTS.find((a) => a.id === "allstar")!;
    const all = TRACKS.flatMap((t) => t.lessons.map((l) => l.id));
    expect(allstar.total).toBe(all.length);
    expect(allstar.desc).toBe(`Complete all ${all.length} lessons`);
    expect(isUnlocked(allstar, new Set(all.slice(1)))).toBe(false);
    expect(isUnlocked(allstar, new Set(all))).toBe(true);
  });

  it("all-star ignores ids from retired lessons", () => {
    const allstar = ACHIEVEMENTS.find((a) => a.id === "allstar")!;
    const all = TRACKS.flatMap((t) => t.lessons.map((l) => l.id));
    // e.g. a quant lesson trimmed from the curriculum still in old progress data
    expect(isUnlocked(allstar, new Set([...all.slice(1), "q2", "q5"]))).toBe(false);
  });

  it("every achievement id is unique", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
