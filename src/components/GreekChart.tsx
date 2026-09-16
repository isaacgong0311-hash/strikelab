"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";
import { useHydrated } from "@/lib/useHydrated";

interface Props {
  data: { strike: number; value: number }[];
  color: string;
  label?: string;
  errorMsg?: string | null;
}

export default function GreekChart({ data, color, label = "Greek", errorMsg }: Props) {
  const hydrated = useHydrated();

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 px-4" role="status">
        <span
          className="text-2xl opacity-20"
          style={{ color, fontFamily: "var(--font-mono)" }}
        >
          —
        </span>
        <span
          className="text-[11px] text-center leading-relaxed"
          style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}
        >
          Implement this function,<br />then click ▶ Run
        </span>
      </div>
    );
  }

  const allNaN = data.every(d => isNaN(d.value));

  if (allNaN) {
    const isStub = errorMsg?.includes("NotImplementedError");
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1.5 px-4" role={isStub ? "status" : "alert"}>
        <span
          className="text-[11px] text-center leading-relaxed"
          style={{ color: isStub ? "var(--ink-3)" : "var(--coral)", fontFamily: "var(--font-mono)" }}
        >
          {isStub
            ? "Replace raise NotImplementedError\nwith your code"
            : (errorMsg ?? "Function raised an error")}
        </span>
        {!isStub && errorMsg && (
          <span className="text-[10px] font-mono text-center" style={{ color: "var(--ink-3)" }}>
            {errorMsg}
          </span>
        )}
      </div>
    );
  }

  const validData = data.filter(d => !isNaN(d.value));
  const minimum = validData.reduce((best, point) => point.value < best.value ? point : best, validData[0]);
  const maximum = validData.reduce((best, point) => point.value > best.value ? point : best, validData[0]);
  const midpoint = validData[Math.floor(validData.length / 2)];

  if (!hydrated) {
    return <div className="h-full" aria-hidden="true" />;
  }

  return (
    <>
    <div className="sl-visually-hidden" role="img" aria-label={`${label} by strike price. Minimum ${minimum.value.toFixed(4)} at strike ${minimum.strike}; value ${midpoint.value.toFixed(4)} at strike ${midpoint.strike}; maximum ${maximum.value.toFixed(4)} at strike ${maximum.strike}.`} />
    <div aria-hidden="true" style={{ width: "100%", height: "100%" }}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <LineChart data={validData} margin={{ top: 6, right: 10, bottom: 18, left: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--line-2)"
          strokeOpacity={0.4}
          vertical={false}
        />
        <XAxis
          dataKey="strike"
          tick={{ fill: "var(--ink-3)", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          label={{
            value: "Strike (K)",
            position: "insideBottom",
            offset: -10,
            fill: "var(--ink-3)",
            fontSize: 9,
            fontFamily: "var(--font-mono)",
          }}
        />
        <YAxis
          tick={{ fill: "var(--ink-3)", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          width={38}
        />
        <Tooltip
          contentStyle={{
            background: "var(--paper)",
            border: "1px solid var(--line-2)",
            borderRadius: 8,
            fontSize: 11,
            color: "var(--ink)",
            fontFamily: "var(--font-mono)",
            padding: "6px 10px",
          }}
          cursor={{ stroke: "var(--ink-3)", strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.4 }}
          formatter={(v) => [typeof v === "number" ? v.toFixed(4) : v, "value"]}
          labelFormatter={(l) => `K = ${l}`}
        />
        <ReferenceLine y={0} stroke="var(--ink-3)" strokeDasharray="4 4" strokeOpacity={0.5} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          style={{  }}
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
    </>
  );
}
