"use client";

import { useId } from "react";
import { LAB_CONTROLS, labCurve, labPrice, type LabScenario, type LabVariable } from "@/lib/marketLab";
import styles from "./lab-chart.module.css";

export const dollars = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function MarketLabChart({ baseline, scenario, variable, compact = false }: {
  baseline: LabScenario; scenario: LabScenario; variable: LabVariable; compact?: boolean;
}) {
  const id = useId();
  const before = labCurve(baseline, variable);
  const after = labCurve(scenario, variable);
  const { min, max, label, unit } = LAB_CONTROLS[variable];
  const ceiling = Math.max(1, ...before.map((p) => p.value), ...after.map((p) => p.value)) * 1.12;
  const x = (value: number) => 54 + (value - min) / (max - min) * 510;
  const y = (value: number) => 228 - value / ceiling * 194;
  const path = (points: typeof before) => points.map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(2)},${y(p.value).toFixed(2)}`).join(" ");
  const xLabel = (value: number) => variable === "stock" ? `$${value}` : `${value}${unit === "%" ? "%" : ""}`;

  return (
    <div className={styles.chart}>
      <svg viewBox="0 0 600 282" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>{`Option model value against ${label.toLowerCase()}`}</title>
        <desc id={`${id}-description`}>
          Baseline {baseline.option}: {dollars(labPrice(baseline))} at {xLabel(baseline[variable])}.
          Experiment {scenario.option}: {dollars(labPrice(scenario))} at {xLabel(scenario[variable])}.
          Prices are per share. Other assumptions are held fixed for each curve.
        </desc>
        {[0, 1, 2, 3].map((i) => {
          const value = ceiling * i / 3;
          return <g key={i}><line x1="54" x2="564" y1={y(value)} y2={y(value)} className={styles.grid} /><text x="44" y={y(value) + 4} textAnchor="end" className={styles.tick}>${value.toFixed(0)}</text></g>;
        })}
        {[min, (min + max) / 2, max].map((value) => <text key={value} x={x(value)} y="249" textAnchor="middle" className={styles.tick}>{xLabel(value)}</text>)}
        <text x="309" y="275" textAnchor="middle" className={styles.axis}>{label}{variable === "days" ? " (days)" : ""}</text>
        <path d={path(before)} fill="none" className={styles.baseline} />
        <path d={path(after)} fill="none" className={styles.experiment} />
        <line x1={x(scenario[variable])} x2={x(scenario[variable])} y1={y(labPrice(scenario))} y2="228" className={styles.guide} />
        <circle cx={x(baseline[variable])} cy={y(labPrice(baseline))} r="5" className={styles.beforeDot} />
        <circle cx={x(scenario[variable])} cy={y(labPrice(scenario))} r="7" className={styles.afterDot} />
      </svg>
      <div className={styles.legend}><span><i className={styles.baselineKey} />Baseline</span><span><i className={styles.experimentKey} />Your experiment</span><span>$ / share</span></div>
      {!compact && <details className={styles.data}>
        <summary>View chart data</summary>
        <div className={styles.scroll} role="region" aria-label="Model curve values" tabIndex={0}>
          <table><caption>Model prices with all other inputs held fixed for each curve</caption><thead><tr><th scope="col">{label}</th><th scope="col">Baseline {baseline.option}</th><th scope="col">Experiment {scenario.option}</th></tr></thead>
            <tbody>{after.map((point, i) => <tr key={i}><th scope="row">{xLabel(point.x)}</th><td>{dollars(before[i].value)}</td><td>{dollars(point.value)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>}
    </div>
  );
}
