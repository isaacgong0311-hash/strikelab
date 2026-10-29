import { describe, expect, it } from "vitest";
import { DEFAULT_SCENARIO, LAB_MISSIONS, experimentCsvRows, isLabScenario, labCurve, labPrice, meetsMissionTarget, priceAxisTicks } from "./marketLab";
import { getLessonById } from "./tracks";

describe("Market Lab model", () => {
  it("handles expiration exactly, including the at-the-money boundary", () => {
    expect(labPrice({ ...DEFAULT_SCENARIO, days: 0 })).toBe(0);
    expect(labPrice({ ...DEFAULT_SCENARIO, stock: 115, days: 0 })).toBe(15);
    expect(labPrice({ ...DEFAULT_SCENARIO, stock: 85, days: 0, option: "put" })).toBe(15);
  });
  it("preserves put-call parity and price bounds throughout the controls", () => {
    for (const stock of [50, 100, 150]) for (const volatility of [10, 40, 80]) for (const days of [0, 1, 30, 180]) {
      const s = { ...DEFAULT_SCENARIO, stock, volatility, days };
      const call = labPrice(s); const put = labPrice({ ...s, option: "put" });
      expect(call - put).toBeCloseTo(stock - 100 * Math.exp(-s.rate * days / 365), 5);
      expect(call).toBeGreaterThanOrEqual(0); expect(call).toBeLessThanOrEqual(stock);
      expect(put).toBeGreaterThanOrEqual(0); expect(put).toBeLessThanOrEqual(100);
    }
  });
  it("shows the actual economic effects taught by the missions", () => {
    const base = labPrice(DEFAULT_SCENARIO);
    expect(labPrice({ ...DEFAULT_SCENARIO, volatility: 40 })).toBeGreaterThan(base);
    expect(labPrice({ ...DEFAULT_SCENARIO, stock: 110 })).toBeGreaterThan(base);
    expect(labPrice({ ...DEFAULT_SCENARIO, days: 14 })).toBeLessThan(labPrice({ ...DEFAULT_SCENARIO, days: 90 }));
  });
  it("rejects invalid or unbounded model inputs rather than drawing NaN curves", () => {
    for (const patch of [{ stock: NaN }, { volatility: 0 }, { days: -1 }, { days: 1.5 }, { stock: 151 }, { option: "stock" }, { rate: 1 }, { strike: 0 }]) {
      const scenario = { ...DEFAULT_SCENARIO, ...patch };
      expect(isLabScenario(scenario)).toBe(false);
      expect(() => labPrice(scenario as typeof DEFAULT_SCENARIO)).toThrow();
    }
  });
  it("produces finite chart data over every axis, including zero days", () => {
    for (const variable of ["stock", "volatility", "days"] as const) {
      const curve = labCurve(DEFAULT_SCENARIO, variable);
      expect(curve).toHaveLength(51);
      expect(curve.every((point) => Number.isFinite(point.value) && point.value >= 0)).toBe(true);
      expect(curve[0].x).toBeLessThan(curve.at(-1)!.x);
    }
  });
  it("requires the intended change with other assumptions held fixed", () => {
    const [vol, time, direction] = LAB_MISSIONS;
    expect(meetsMissionTarget(vol, vol.baseline)).toBe(false);
    expect(meetsMissionTarget(vol, { ...vol.baseline, volatility: 40 })).toBe(true);
    expect(meetsMissionTarget(vol, { ...vol.baseline, volatility: 40, stock: 110 })).toBe(false);
    expect(meetsMissionTarget(time, { ...time.baseline, days: 14 })).toBe(true);
    expect(meetsMissionTarget(direction, { ...direction.baseline, stock: 110 })).toBe(true);
    for (const mission of LAB_MISSIONS) expect(getLessonById(mission.lessonHref.split("/").at(-1)!)).toBeTruthy();
  });
  it("exports model assumptions and computed results with explicit units", () => {
    const rows = experimentCsvRows(DEFAULT_SCENARIO, { ...DEFAULT_SCENARIO, volatility: 40 });
    expect(rows.find((row) => row[0] === "Annual volatility (%)")).toEqual(["Annual volatility (%)", "20", "40"]);
    expect(Number(rows.find((row) => row[0] === "Model value ($ per share)")![2])).toBeCloseTo(labPrice({ ...DEFAULT_SCENARIO, volatility: 40 }), 5);
    expect(rows[2][1]).toContain("not profit");
  });
  it("labels the price axis with round steps that cover the peak", () => {
    expect(priceAxisTicks(10.2)).toEqual([0, 2.5, 5, 7.5, 10, 12.5]);
    expect(priceAxisTicks(1.12)).toEqual([0, 0.25, 0.5, 0.75, 1, 1.25]);
    expect(priceAxisTicks(50)).toEqual([0, 10, 20, 30, 40, 50]);
    for (const peak of [0.4, 3.3, 7, 18, 63, 120]) {
      const ticks = priceAxisTicks(peak);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(peak);
      expect(ticks.length).toBeGreaterThanOrEqual(3);
      expect(ticks.length).toBeLessThanOrEqual(6);
    }
  });
});
