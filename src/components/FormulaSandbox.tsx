"use client";
import { useMemo, useState } from "react";
import type { FormulaSandboxConfig } from "@/lib/lessons";

/** Abramowitz & Stegun 7.1.26 — accurate to ~1.5e-7, plenty for a "try it" widget. */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}
function normCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

/**
 * Named compute functions, keyed by `computeId` in the lesson data. Lives
 * here (client-side) rather than in the lesson data itself — lesson data
 * flows from a Server Component into this Client Component as a prop, and
 * functions can't cross that boundary, only plain serializable data.
 */
const COMPUTE: Record<string, (v: Record<string, number>) => number> = {
  marketCap: (v) => v.price * v.shares * 1e9,
  bidAskSpread: (v) => v.ask - v.bid,
  grossMargin: (v) => (v.revenue === 0 ? 0 : ((v.revenue - v.cogs) / v.revenue) * 100),
  peRatio: (v) => v.price / v.eps,
  sharpeRatio: (v) => (v.vol === 0 ? 0 : (v.ret - v.rf) / v.vol),
  compoundGrowth: (v) => v.initial * Math.pow(1 + v.rate / 100, v.years),
  intrinsicValueCall: (v) => Math.max(v.price - v.strike, 0),
  putCallParity: (v) => v.stock - v.strike * Math.exp((-v.rate / 100) * v.time),
  capm: (v) => v.rf + v.beta * (v.rm - v.rf),
  maxDrawdown: (v) => (v.peak === 0 ? 0 : ((v.peak - v.trough) / v.peak) * 100),
  zscore: (v) => (v.std === 0 ? 0 : (v.spread - v.mean) / v.std),
  rhoCall: (v) => {
    const S = v.stock, K = v.strike, T = v.time, r = v.rate / 100, sigma = v.vol / 100;
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    return (K * T * Math.exp(-r * T) * normCdf(d2)) / 100;
  },
};

/**
 * A live "try it" widget dropped right after the section that introduces its
 * formula — drag the sliders, watch the result update. Checkpoint tests
 * whether you remember the concept; this builds the intuition in the first
 * place, closer to Khan Academy's inline manipulatives than a quiz.
 */
export default function FormulaSandbox({ config }: { config: FormulaSandboxConfig }) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(config.variables.map((v) => [v.key, v.defaultValue]))
  );

  const result = useMemo(() => {
    const compute = COMPUTE[config.computeId];
    if (!compute) return NaN;
    try {
      return compute(values);
    } catch {
      return NaN;
    }
  }, [values, config.computeId]);

  const formatted = Number.isFinite(result)
    ? result.toLocaleString(undefined, {
        maximumFractionDigits: config.decimals ?? 2,
        minimumFractionDigits: 0,
      })
    : "—";

  return (
    <aside className="fsb">
      <div className="fsb-head">
        <span className="fsb-label">Try it — {config.title}</span>
      </div>

      <p className="fsb-formula">{config.formula}</p>

      <div className="fsb-vars">
        {config.variables.map((v) => (
          <label key={v.key} className="fsb-var">
            <span className="fsb-var-head">
              <span className="fsb-var-name">{v.label}</span>
              <span className="fsb-var-val">
                {values[v.key].toLocaleString()}
                {v.unit ? ` ${v.unit}` : ""}
              </span>
            </span>
            <input
              type="range"
              min={v.min}
              max={v.max}
              step={v.step ?? 1}
              value={values[v.key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [v.key]: Number(e.target.value) }))
              }
              className="fsb-slider"
              aria-label={v.label}
            />
          </label>
        ))}
      </div>

      <div className="fsb-result">
        <span className="fsb-result-label">{config.resultLabel}</span>
        <span className="fsb-result-val">
          {config.resultPrefix}
          {formatted}
          {config.resultSuffix}
        </span>
      </div>
    </aside>
  );
}
