import { describe, expect, it } from "vitest";
import { deriveParams, type ParamSpec } from "./params";

const SPECS: ParamSpec[] = [
  { name: "S", min: 80, max: 120, step: 1 },
  { name: "r", min: 0.01, max: 0.06, step: 0.005 },
  { name: "T", min: 0.25, max: 2, step: 0.25 },
];

describe("deriveParams", () => {
  it("gives the same student the same numbers every time", () => {
    const a = deriveParams(SPECS, { challengeId: "s1-w1", userId: "u1" }, "secret");
    expect(deriveParams(SPECS, { challengeId: "s1-w1", userId: "u1" }, "secret")).toEqual(a);
  });

  it("gives different students (and challenges, and secrets) different numbers", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) seen.add(JSON.stringify(deriveParams(SPECS, { challengeId: "s1-w1", userId: `u${i}` }, "secret")));
    expect(seen.size).toBeGreaterThan(40);
    const base = deriveParams(SPECS, { challengeId: "s1-w1", userId: "u1" }, "secret");
    expect(deriveParams(SPECS, { challengeId: "s1-w2", userId: "u1" }, "secret")).not.toEqual(base);
    expect(deriveParams(SPECS, { challengeId: "s1-w1", userId: "u1" }, "other")).not.toEqual(base);
  });

  it("stays inside each range, on the step grid", () => {
    for (let i = 0; i < 200; i++) {
      const p = deriveParams(SPECS, { challengeId: "c", userId: `u${i}` }, "k");
      for (const s of SPECS) {
        expect(p[s.name]).toBeGreaterThanOrEqual(s.min);
        expect(p[s.name]).toBeLessThanOrEqual(s.max);
        const k = (p[s.name] - s.min) / s.step;
        expect(Math.abs(k - Math.round(k))).toBeLessThan(1e-6);
      }
    }
  });

  it("refuses to run without a secret", () => {
    expect(() => deriveParams(SPECS, { challengeId: "c", userId: "u" }, "")).toThrow(/SEASON_PARAM_SECRET/);
  });
});
