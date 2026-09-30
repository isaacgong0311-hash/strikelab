import { blackScholesCall } from "@/lib/pricing";

/**
 * Numbers shown on the homepage, computed by code so they can't drift from
 * the math. (The old homepage hardcoded a price that was wrong for its own
 * inputs, and Greek values nobody had computed.)
 */

/** The hero's code card: lesson 3's Black-Scholes call on textbook inputs. */
export function heroExample() {
  const S = 100, K = 100, T = 1, r = 0.05, sigma = 0.2;
  return { S, K, T, r, sigma, price: blackScholesCall(S, K, T, r, sigma).toFixed(4) };
}

const SQRT_2PI = Math.sqrt(2 * Math.PI);
const pdf = (x: number) => Math.exp(-0.5 * x * x) / SQRT_2PI;
// Abramowitz–Stegun 7.1.26 via erf, the same accuracy class as src/lib/pricing.ts.
function cdf(x: number): number {
  const t = 1 / (1 + 0.3275911 * (Math.abs(x) / Math.SQRT2));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(x * x) / 2);
  return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

/**
 * The Greeks section's sample call, with the lessons' conventions: theta per
 * calendar day, vega per 1 point of volatility, rho per 1 point of rate.
 */
export function sampleGreeks() {
  const S = 100, K = 105, days = 30, r = 0.045, sigma = 0.2;
  const T = days / 365;
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const disc = K * Math.exp(-r * T);
  const fmt = (v: number, digits: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(digits)}`;
  return {
    inputs: { S, K, days, r, sigma },
    price: (S * cdf(d1) - disc * cdf(d2)).toFixed(2),
    greeks: [
      { sym: "Δ", name: "Delta", value: fmt(cdf(d1), 3), note: "change in price per $1 move in the stock" },
      { sym: "Γ", name: "Gamma", value: fmt(pdf(d1) / (S * sigma * Math.sqrt(T)), 3), note: "how fast Delta itself changes" },
      { sym: "Θ", name: "Theta", value: fmt((-(S * pdf(d1) * sigma) / (2 * Math.sqrt(T)) - r * disc * cdf(d2)) / 365, 3), note: "value lost each day that passes" },
      { sym: "ν", name: "Vega", value: fmt((S * pdf(d1) * Math.sqrt(T)) / 100, 3), note: "per 1 point of volatility" },
      { sym: "ρ", name: "Rho", value: fmt((disc * T * cdf(d2)) / 100, 3), note: "per 1 point of interest rates" },
    ],
  };
}
