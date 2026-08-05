"use client";
import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";

type LegType = "call" | "put" | "stock";
type Side = "long" | "short";

interface Leg {
  type: LegType;
  side: Side;
  strike?: number;
  premium?: number;
}

interface Strategy {
  key: string;
  label: string;
  legs: Leg[];
}

/** Entry price for the underlying — fixed so every preset's strikes line up. */
const SPOT = 100;
const SCAN_MIN = 40;
const SCAN_MAX = 200;
const STEP = 2;

// Strikes and premiums roughly match the worked examples in the Option
// Strategies lesson, so the numbers on this chart aren't arbitrary — a
// student who just read "bull call spread: max profit 7, breakeven 103" sees
// exactly that shape here.
const STRATEGIES: Strategy[] = [
  { key: "long-call", label: "Long Call", legs: [
    { type: "call", side: "long", strike: 100, premium: 5 },
  ] },
  { key: "covered-call", label: "Covered Call", legs: [
    { type: "stock", side: "long" },
    { type: "call", side: "short", strike: 110, premium: 3 },
  ] },
  { key: "bull-call-spread", label: "Bull Call Spread", legs: [
    { type: "call", side: "long", strike: 100, premium: 6 },
    { type: "call", side: "short", strike: 110, premium: 3 },
  ] },
  { key: "long-straddle", label: "Long Straddle", legs: [
    { type: "call", side: "long", strike: 100, premium: 4 },
    { type: "put", side: "long", strike: 100, premium: 4 },
  ] },
  { key: "long-strangle", label: "Long Strangle", legs: [
    { type: "call", side: "long", strike: 110, premium: 2 },
    { type: "put", side: "long", strike: 90, premium: 2 },
  ] },
  { key: "iron-condor", label: "Iron Condor", legs: [
    { type: "put", side: "long", strike: 90, premium: 1 },
    { type: "put", side: "short", strike: 95, premium: 2 },
    { type: "call", side: "short", strike: 105, premium: 2 },
    { type: "call", side: "long", strike: 110, premium: 1 },
  ] },
];

function legPnl(leg: Leg, sT: number): number {
  if (leg.type === "stock") {
    const raw = sT - SPOT;
    return leg.side === "long" ? raw : -raw;
  }
  const intrinsic = leg.type === "call"
    ? Math.max(sT - (leg.strike ?? 0), 0)
    : Math.max((leg.strike ?? 0) - sT, 0);
  const premium = leg.premium ?? 0;
  return leg.side === "long" ? intrinsic - premium : premium - intrinsic;
}

function strategyPnl(legs: Leg[], sT: number): number {
  return legs.reduce((sum, leg) => sum + legPnl(leg, sT), 0);
}

function fmtMoney(v: number): string {
  const sign = v < 0 ? "-" : "";
  return `${sign}$${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function legDesc(leg: Leg): string {
  const side = leg.side === "long" ? "Long" : "Short";
  if (leg.type === "stock") return `${side} 100 shares`;
  const kind = leg.type === "call" ? "call" : "put";
  return `${side} ${kind} K=${leg.strike} @ $${leg.premium?.toFixed(2)}`;
}

/**
 * A drag-a-few-sliders payoff builder: pick a strategy, see its P&L at
 * expiration across a range of stock prices, and move the "stock price now"
 * marker to see where the position currently stands. The lesson's prose
 * describes each strategy's shape in words; this makes the shape a thing you
 * can actually look at.
 */
export default function PayoffDiagram() {
  const [strategyKey, setStrategyKey] = useState(STRATEGIES[2].key);
  const [spotNow, setSpotNow] = useState(100);

  const strategy = STRATEGIES.find((s) => s.key === strategyKey) ?? STRATEGIES[0];

  const data = useMemo(() => {
    const points: { price: number; pnl: number }[] = [];
    for (let s = SCAN_MIN; s <= SCAN_MAX; s += STEP) {
      points.push({ price: s, pnl: Number(strategyPnl(strategy.legs, s).toFixed(2)) });
    }
    return points;
  }, [strategy]);

  const currentPnl = useMemo(() => strategyPnl(strategy.legs, spotNow), [strategy, spotNow]);

  const { maxProfitLabel, maxLossLabel, breakevens } = useMemo(() => {
    const vals = data.map((d) => d.pnl);
    const max = Math.max(...vals);
    const min = Math.min(...vals);

    // If the P&L is still climbing (or falling) as it hits the right edge of
    // the scan range, the real max/min is unbounded rather than whatever
    // number happens to sit at $200 — a long call's profit doesn't stop
    // there, it just kept climbing off the edge of the chart.
    const rightSlope = data[data.length - 1].pnl - data[data.length - 2].pnl;
    const profitUncapped = max === data[data.length - 1].pnl && rightSlope > 0.4;
    const lossUncapped = min === data[data.length - 1].pnl && rightSlope < -0.4;

    const crossings: number[] = [];
    for (let i = 1; i < data.length; i++) {
      const a = data[i - 1], b = data[i];
      if ((a.pnl <= 0 && b.pnl > 0) || (a.pnl >= 0 && b.pnl < 0)) {
        const t = a.pnl === b.pnl ? 0 : (0 - a.pnl) / (b.pnl - a.pnl);
        crossings.push(Math.round(a.price + t * (b.price - a.price)));
      }
    }

    return {
      maxProfitLabel: profitUncapped ? "Unlimited" : fmtMoney(max),
      maxLossLabel: lossUncapped ? "Unlimited" : fmtMoney(min),
      breakevens: [...new Set(crossings)],
    };
  }, [data]);

  return (
    <aside className="payoff">
      <div className="payoff-head">
        <span className="payoff-label">Try it — Payoff Diagram</span>
      </div>

      <div className="viz-chip-row">
        {STRATEGIES.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`viz-chip${s.key === strategyKey ? " active" : ""}`}
            onClick={() => setStrategyKey(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="payoff-legs">
        {strategy.legs.map((leg, i) => (
          <span key={i}>
            {legDesc(leg)}
            {i < strategy.legs.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>

      <div className="payoff-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 10, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line-2)" strokeOpacity={0.4} vertical={false} />
            <XAxis
              dataKey="price"
              tick={{ fill: "var(--ink-3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis
              tick={{ fill: "var(--ink-3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--paper)",
                border: "1px solid var(--line-2)",
                borderRadius: 8,
                fontSize: 11,
                color: "var(--ink)",
                fontFamily: "var(--font-mono)",
              }}
              formatter={(v) => [typeof v === "number" ? fmtMoney(v) : v, "P&L"]}
              labelFormatter={(l) => `Stock at expiration = $${l}`}
            />
            <ReferenceLine y={0} stroke="var(--ink-3)" strokeDasharray="4 4" />
            <ReferenceLine x={spotNow} stroke="var(--coral)" strokeDasharray="3 3" strokeOpacity={0.6} />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke="var(--ink)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="payoff-slider-row">
        <label>
          <span className="fsb-var-head">
            <span className="fsb-var-name">Stock price now</span>
            <span className="fsb-var-val">
              ${spotNow} · P&amp;L {fmtMoney(currentPnl)}
            </span>
          </span>
          <input
            type="range"
            min={SCAN_MIN}
            max={SCAN_MAX}
            step={1}
            value={spotNow}
            onChange={(e) => setSpotNow(Number(e.target.value))}
            className="fsb-slider"
            aria-label="Stock price now"
          />
        </label>
      </div>

      <div className="payoff-stats">
        <div>
          <span className="payoff-stat-label">Max profit</span>
          <span className="payoff-stat-val pos">{maxProfitLabel}</span>
        </div>
        <div>
          <span className="payoff-stat-label">Max loss</span>
          <span className="payoff-stat-val neg">{maxLossLabel}</span>
        </div>
        <div>
          <span className="payoff-stat-label">Breakeven{breakevens.length > 1 ? "s" : ""}</span>
          <span className="payoff-stat-val">
            {breakevens.length ? breakevens.map((b) => `$${b}`).join(" / ") : "—"}
          </span>
        </div>
      </div>
    </aside>
  );
}
