"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { niceTicks, shortWeek, xLabelIndexes } from "@/lib/admin/chartScale";
import styles from "./metrics.module.css";

/**
 * One weekly series as columns (a count per week) or a line (a running total).
 * Single series, so no legend: the title names it. Only the latest value is
 * labeled; hover or arrow keys show any week, and the weekly table below the
 * charts has every value, so the tooltip never gates a number.
 */
export interface WeeklyPoint {
  week: string;
  value: number;
}

const HEIGHT = 200;
const PAD = { top: 16, right: 44, bottom: 28, left: 36 };

export default function WeeklyChart({
  title,
  unit,
  kind,
  points,
}: {
  title: string;
  /** Plural noun for the readout, e.g. "active students". */
  unit: string;
  kind: "columns" | "line";
  points: WeeklyPoint[];
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = points.length;
  const ticks = niceTicks(Math.max(0, ...points.map((p) => p.value)));
  const top = ticks.at(-1)!;
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const band = plotW / Math.max(1, n);
  const cx = (i: number) => PAD.left + band * (i + 0.5);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const baseline = y(0);
  const colW = Math.min(24, band * 0.6);
  const labels = xLabelIndexes(n, Math.max(2, Math.floor(plotW / 64)));
  const last = n - 1;

  const readout = (i: number) => `Week of ${shortWeek(points[i].week)}: ${points[i].value} ${unit}`;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (n === 0) return;
    const keys: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };
    if (e.key in keys) {
      e.preventDefault();
      setActive((a) => Math.max(0, Math.min(last, (a ?? last) + keys[e.key])));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setActive(e.key === "Home" ? 0 : last);
    }
  };

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${cx(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const areaPath = n > 0 ? `${linePath} L${cx(last).toFixed(1)},${baseline} L${cx(0).toFixed(1)},${baseline} Z` : "";

  return (
    <figure className={styles.chart}>
      <figcaption className={styles.chartTitle}>{title}</figcaption>
      <div
        ref={wrap}
        className={styles.plot}
        tabIndex={0}
        role="group"
        aria-label={`${title}. Use the left and right arrow keys to read each week.`}
        onKeyDown={onKey}
        onFocus={() => setActive((a) => a ?? last)}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
      >
        <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} aria-hidden="true">
          {ticks.map((t) => (
            <g key={t}>
              <line className={styles.grid} x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} />
              <text className={styles.tick} x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
                {t}
              </text>
            </g>
          ))}

          {kind === "columns"
            ? points.map((p, i) => {
                const h = baseline - y(p.value);
                const x = cx(i) - colW / 2;
                const r = Math.min(4, h, colW / 2);
                // Rounded data end, square at the baseline.
                const d = h <= 0 ? "" : `M${x},${baseline} V${baseline - h + r} Q${x},${baseline - h} ${x + r},${baseline - h} H${x + colW - r} Q${x + colW},${baseline - h} ${x + colW},${baseline - h + r} V${baseline} Z`;
                return d ? <path key={p.week} className={i === active ? `${styles.mark} ${styles.markActive}` : styles.mark} d={d} /> : null;
              })
            : (
              <>
                <path className={styles.area} d={areaPath} />
                <path className={styles.line} d={linePath} />
              </>
            )}

          {active !== null && kind === "line" ? (
            <line className={styles.crosshair} x1={cx(active)} x2={cx(active)} y1={PAD.top} y2={baseline} />
          ) : null}
          {kind === "line" && n > 0 ? (
            <circle className={styles.dot} cx={cx(active ?? last)} cy={y(points[active ?? last].value)} r={4} />
          ) : null}

          {n > 0 ? (
            <text className={styles.endLabel} x={cx(last) + (kind === "line" ? 10 : 0)} y={y(points[last].value) - (kind === "line" ? 0 : 6)} dy={kind === "line" ? "0.32em" : 0} textAnchor={kind === "line" ? "start" : "middle"}>
              {points[last].value}
            </text>
          ) : null}

          {points.map((p, i) =>
            labels.has(i) ? (
              <text key={p.week} className={styles.tick} x={cx(i)} y={HEIGHT - 8} textAnchor="middle">
                {shortWeek(p.week)}
              </text>
            ) : null
          )}

          {/* Hit targets: the whole week band, not just the mark. */}
          {points.map((p, i) => (
            <rect
              key={p.week}
              className={styles.hit}
              x={PAD.left + band * i}
              y={PAD.top}
              width={band}
              height={plotH}
              onPointerEnter={() => setActive(i)}
            />
          ))}
        </svg>

        {active !== null ? (
          <div
            className={styles.tooltip}
            // Just above the hovered value but never above the plot (it would cover the title), and
            // opening toward the middle of the chart so it never spills past the card's edge.
            style={{
              left: cx(active),
              top: Math.max(y(points[active].value) - 10, 52),
              transform: cx(active) < width / 2 ? "translate(-16px, -100%)" : "translate(calc(-100% + 16px), -100%)",
            }}
          >
            <strong>{points[active].value}</strong>
            <span>
              {unit} · week of {shortWeek(points[active].week)}
            </span>
          </div>
        ) : null}
        <p className="sl-visually-hidden" aria-live="polite">
          {active !== null ? readout(active) : ""}
        </p>
      </div>
    </figure>
  );
}
