import { describe, expect, it } from "vitest";
import { niceTicks, shortWeek, xLabelIndexes } from "./chartScale";

describe("chart scales", () => {
  it("makes clean whole-number ticks that cover the maximum", () => {
    expect(niceTicks(0)).toEqual([0, 1, 2, 3, 4]);
    expect(niceTicks(3)).toEqual([0, 1, 2, 3]);
    expect(niceTicks(7)).toEqual([0, 2, 4, 6, 8]);
    expect(niceTicks(38)).toEqual([0, 10, 20, 30, 40]);
    expect(niceTicks(240)).toEqual([0, 100, 200, 300]);
    for (const max of [1, 9, 13, 57, 101, 999]) {
      const t = niceTicks(max);
      expect(t.at(-1)!).toBeGreaterThanOrEqual(max);
      expect(t.every((v) => Number.isInteger(v))).toBe(true);
    }
  });

  it("labels the x axis sparsely, always including the latest week", () => {
    expect([...xLabelIndexes(5, 8)].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
    const many = xLabelIndexes(30, 6);
    expect(many.size).toBeLessThanOrEqual(6);
    expect(many.has(29)).toBe(true);
    expect(xLabelIndexes(0, 6).size).toBe(0);
  });

  it("formats week keys without timezone drift", () => {
    expect(shortWeek("2026-10-05")).toBe("Oct 5");
    expect(shortWeek("2027-01-04")).toBe("Jan 4");
  });
});
