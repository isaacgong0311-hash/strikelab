import { describe, expect, it } from "vitest";
import { heroExample, sampleGreeks } from "./heroExample";
import { blackScholesCall } from "@/lib/pricing";

describe("homepage numbers", () => {
  it("shows the textbook Black-Scholes price for S=K=100, T=1, r=5%, σ=20%", () => {
    // The standard reference value for these inputs is 10.4506.
    expect(heroExample().price).toBe("10.4506");
  });

  it("prices the Greeks example with the same model the sandbox uses", () => {
    const { inputs, price } = sampleGreeks();
    const reference = blackScholesCall(inputs.S, inputs.K, inputs.days / 365, inputs.r, inputs.sigma);
    expect(Number(price)).toBeCloseTo(reference, 2);
  });

  it("gets each Greek's sign and size right for an out-of-the-money 30-day call", () => {
    const g = Object.fromEntries(sampleGreeks().greeks.map((x) => [x.name, Number(x.value.replace("−", "-"))]));
    // Reference values for S=100, K=105, T=30/365, r=4.5%, σ=20%, computed
    // independently with Python's math.erf: Δ 0.2243, Γ 0.0522, Θ −0.0313/day,
    // ν 0.0858 per vol point, ρ 0.0178 per rate point.
    expect(g.Delta).toBeCloseTo(0.2243, 3);
    expect(g.Gamma).toBeCloseTo(0.0522, 3);
    expect(g.Theta).toBeCloseTo(-0.0313, 3);
    expect(g.Vega).toBeCloseTo(0.0858, 3);
    expect(g.Rho).toBeCloseTo(0.0178, 3);
  });
});
