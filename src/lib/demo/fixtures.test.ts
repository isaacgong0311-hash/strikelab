import { describe, expect, it } from "vitest";
import { buildDemoData } from "./fixtures";
import { EXAMPLE_CAPSTONES } from "./exampleCapstones";

describe("demo data", () => {
  it("always shows a believable mid-program cohort", () => {
    for (const now of [new Date("2026-09-23T15:00:00Z"), new Date("2027-02-10T03:00:00Z")]) {
      const d = buildDemoData(now);
      expect(d.metrics.status).toEqual({ kind: "week", week: 3 });
      expect(d.metrics.enrolled).toBe(10);
      expect(d.metrics.activated.count).toBeGreaterThanOrEqual(7);
      expect(d.metrics.students.some((s) => s.needsHelp)).toBe(true);
      expect(d.studentView.nextAction).not.toBeNull();
      expect(d.csv).toHaveLength(11);
    }
  });

  it("example capstones are complete and computed from the code they show", () => {
    for (const c of EXAMPLE_CAPSTONES) {
      for (const field of [c.title, c.thesis, c.code, c.resultSummary, c.reflection]) expect(field.length).toBeGreaterThan(20);
    }
    // The option example's prices, recomputed with the same formula.
    const N = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
    const call = (sigma: number) => {
      const [S, K, T, r] = [521, 525, 30 / 365, 0.044];
      const d1 = (Math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * Math.sqrt(T));
      return S * N(d1) - K * Math.exp(-r * T) * N(d1 - sigma * Math.sqrt(T));
    };
    const text = EXAMPLE_CAPSTONES[0].resultSummary;
    for (const sigma of [0.13, 0.18, 0.23]) expect(text).toContain(`$${call(sigma).toFixed(2)}`);
  });
});

// Abramowitz-Stegun erf, accurate to ~1e-7: plenty for cents.
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}
