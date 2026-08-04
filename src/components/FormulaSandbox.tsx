"use client";
import { useMemo, useState } from "react";
import type { FormulaSandboxConfig } from "@/lib/lessons";

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
