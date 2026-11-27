import { describe, expect, it } from "vitest";
import { markSeen, parseSeen, pickReveal, revealLine, scoredWeeks, SEEN_KEY, seenKey } from "./reveal";
import type { StorageLike } from "./draft";

const store = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
};

const weeks = scoredWeeks([
  { id: "a", week: 1, title: "One", view: { kind: "scored", score: 72.5, seasonRank: 3 } },
  { id: "b", week: 2, title: "Two", view: { kind: "scored", score: 40, seasonRank: 2 } },
  { id: "c", week: 3, title: "Three", view: { kind: "submitted" } },
  { id: "d", week: 4, title: "Four", view: { kind: "scored", score: null, seasonRank: null } },
], 80);

describe("score reveal", () => {
  it("only counts weeks with a posted score", () => {
    expect(weeks.map((w) => w.challengeId)).toEqual(["a", "b"]);
    expect(weeks[0]).toMatchObject({ score: 72.5, max: 80, rank: 3 });
  });

  it("shows the latest unseen score once, then nothing", () => {
    const s = store();
    expect(pickReveal(weeks, parseSeen(s.getItem(SEEN_KEY)), "ana")).toMatchObject({ week: { challengeId: "b" }, unseen: 2 });
    markSeen(s, "ana", weeks);
    expect(pickReveal(weeks, parseSeen(s.getItem(SEEN_KEY)), "ana")).toBeNull();
  });

  it("is per handle on a shared device", () => {
    const s = store();
    markSeen(s, "ana", weeks);
    expect(pickReveal(weeks, parseSeen(s.getItem(SEEN_KEY)), "ben")).not.toBeNull();
    expect(seenKey(null, "a")).toBe("-:a");
  });

  it("survives junk and blocked storage", () => {
    expect(parseSeen("nope").size).toBe(0);
    expect(parseSeen('{"a":1}').size).toBe(0);
    expect(parseSeen('["x", 3]')).toEqual(new Set(["x"]));
    const broken: StorageLike = { getItem: () => { throw new Error("blocked"); }, setItem: () => {}, removeItem: () => {} };
    expect(() => markSeen(broken, "ana", weeks)).not.toThrow();
    expect(() => markSeen(null, "ana", weeks)).not.toThrow();
  });

  it("says something honest for every score", () => {
    expect(revealLine(80, 80)).toBe("A perfect score.");
    expect(revealLine(60, 80)).toBe("A strong week.");
    expect(revealLine(10, 80)).toBe("You're on the board.");
    expect(revealLine(0, 80)).toMatch(/No checks passed/);
  });
});
