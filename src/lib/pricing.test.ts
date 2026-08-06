import { describe, expect, it } from "vitest";
import {
  blackScholesCall,
  blackScholesPut,
  contractMultiplier,
  getWatchlistSymbol,
  markPrice,
  simulatePrice,
} from "./pricing";

// This engine prices every trade in the sandbox (real simulated cash, per the
// SUBMISSION.md writeup) and is a TS port of the exact formulas the lessons
// teach students to implement themselves. It had zero test coverage before
// this file — these lock in the one thing that actually matters: does the
// math agree with the textbook, and does the seeded "live" price stay
// reproducible so a page refresh mid-session doesn't show a different price.

describe("blackScholesCall / blackScholesPut", () => {
  // Classic Hull textbook case: S=K=100, T=1y, r=5%, sigma=20%.
  // d1 = 0.35, d2 = 0.15 -> call ~10.45, put ~5.57.
  it("matches the textbook reference values at S=K=100, T=1, r=5%, sigma=20%", () => {
    const call = blackScholesCall(100, 100, 1, 0.05, 0.2);
    const put = blackScholesPut(100, 100, 1, 0.05, 0.2);
    expect(call).toBeCloseTo(10.4506, 3);
    expect(put).toBeCloseTo(5.5735, 3);
  });

  it("holds put-call parity (C - P = S - K*e^-rT) across varied inputs", () => {
    const cases: [number, number, number, number, number][] = [
      [100, 100, 1, 0.05, 0.2],
      [521, 525, 30 / 365, 0.044, 0.182], // homepage hero example
      [50, 40, 0.5, 0.03, 0.35],
      [200, 250, 2, 0.02, 0.6],
    ];
    for (const [S, K, T, r, sigma] of cases) {
      const call = blackScholesCall(S, K, T, r, sigma);
      const put = blackScholesPut(S, K, T, r, sigma);
      expect(call - put).toBeCloseTo(S - K * Math.exp(-r * T), 6);
    }
  });

  it("converges to intrinsic value deep in/out of the money", () => {
    // Deep ITM call: practically certain to finish ITM, so its value should
    // sit close to the discounted forward intrinsic.
    const deepItmCall = blackScholesCall(200, 50, 1, 0.05, 0.15);
    expect(deepItmCall).toBeGreaterThan(140);
    // Deep OTM call: practically worthless.
    const deepOtmCall = blackScholesCall(50, 200, 0.25, 0.05, 0.15);
    expect(deepOtmCall).toBeLessThan(0.01);
  });

  it("is non-negative for a wide sweep of strikes (no NaNs, no negative prices)", () => {
    for (let K = 50; K <= 200; K += 10) {
      const call = blackScholesCall(100, K, 1, 0.05, 0.2);
      const put = blackScholesPut(100, K, 1, 0.05, 0.2);
      expect(call).toBeGreaterThanOrEqual(0);
      expect(put).toBeGreaterThanOrEqual(0);
      expect(Number.isNaN(call)).toBe(false);
      expect(Number.isNaN(put)).toBe(false);
    }
  });
});

describe("getWatchlistSymbol", () => {
  it("returns known symbols", () => {
    expect(getWatchlistSymbol("SPY").name).toBe("S&P 500 ETF Trust");
  });

  it("throws on an unknown symbol rather than returning undefined", () => {
    expect(() => getWatchlistSymbol("NOT_A_REAL_TICKER")).toThrow();
  });
});

describe("simulatePrice", () => {
  it("is deterministic for the same symbol and timestamp", () => {
    const t = Date.UTC(2026, 0, 15, 12, 0, 0);
    expect(simulatePrice("AAPL", t)).toBe(simulatePrice("AAPL", t));
  });

  it("differs across symbols at the same timestamp (not one shared path)", () => {
    const t = Date.UTC(2026, 0, 15, 12, 0, 0);
    expect(simulatePrice("AAPL", t)).not.toBe(simulatePrice("MSFT", t));
  });

  it("never returns zero or negative (GBM floor)", () => {
    const t = Date.UTC(2026, 0, 15, 23, 59, 0);
    for (const w of ["TSLA", "PLTR", "SPY"]) {
      expect(simulatePrice(w, t)).toBeGreaterThan(0);
    }
  });
});

describe("markPrice", () => {
  it("prices a stock leg as the simulated underlying", () => {
    const t = Date.UTC(2026, 0, 15, 12, 0, 0);
    expect(markPrice({ symbol: "AAPL", assetType: "stock" }, t)).toBe(
      simulatePrice("AAPL", t)
    );
  });

  it("collapses to intrinsic value once a contract has expired", () => {
    const t = Date.UTC(2026, 0, 15, 12, 0, 0);
    const S = simulatePrice("AAPL", t);
    const pastExpiry = new Date(t - 24 * 60 * 60 * 1000).toISOString(); // yesterday
    const call = markPrice(
      { symbol: "AAPL", assetType: "call", strike: S - 10, expiry: pastExpiry },
      t
    );
    const put = markPrice(
      { symbol: "AAPL", assetType: "put", strike: S - 10, expiry: pastExpiry },
      t
    );
    expect(call).toBeCloseTo(Math.max(0, S - (S - 10)), 6);
    expect(put).toBeCloseTo(Math.max(0, S - 10 - S), 6);
  });

  it("throws for an option leg missing strike/expiry", () => {
    expect(() => markPrice({ symbol: "AAPL", assetType: "call" })).toThrow();
  });
});

describe("contractMultiplier", () => {
  it("is 1 for stock, 100 for options (standard contract size)", () => {
    expect(contractMultiplier("stock")).toBe(1);
    expect(contractMultiplier("call")).toBe(100);
    expect(contractMultiplier("put")).toBe(100);
  });
});
