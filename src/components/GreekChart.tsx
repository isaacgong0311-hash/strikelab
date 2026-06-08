"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";

interface Props {
  data: { strike: number; value: number }[];
  color: string;
  errorMsg?: string | null;
}

export default function GreekChart({ data, color, errorMsg }: Props) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
        <span
          className="text-2xl opacity-20"
          style={{ color, fontFamily: "var(--font-mono)" }}
        >
          —
        </span>
        <span
          className="text-[11px] text-center leading-relaxed"
          style={{ color: "#334155", fontFamily: "var(--font-mono)" }}
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
      <div className="flex flex-col items-center justify-center h-full gap-1.5 px-4">
        <span
          className="text-[11px] text-center leading-relaxed"
          style={{ color: isStub ? "#334155" : "#ef4444", fontFamily: "var(--font-mono)" }}
        >
          {isStub
            ? "Replace raise NotImplementedError\nwith your code"
            : (errorMsg ?? "Function raised an error")}
        </span>
        {!isStub && errorMsg && (
          <span className="text-[10px] font-mono text-center" style={{ color: "#64748b" }}>
            {errorMsg}
          </span>
        )}
      </div>
    );
  }

  const validData = data.filter(d => !isNaN(d.value));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={validData} margin={{ top: 6, right: 10, bottom: 18, left: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.03)"
          vertical={false}
        />
        <XAxis
          dataKey="strike"
          tick={{ fill: "#334155", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          label={{
            value: "Strike (K)",
            position: "insideBottom",
            offset: -10,
            fill: "#334155",
            fontSize: 9,
            fontFamily: "var(--font-mono)",
          }}
        />
        <YAxis
          tick={{ fill: "#334155", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          width={38}
        />
        <Tooltip
          contentStyle={{
            background: "#191919",
            border: "1px solid #282828",
            borderRadius: 4,
            fontSize: 11,
            color: "#ebebeb",
            fontFamily: "monospace",
            padding: "6px 10px",
          }}
          cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1, strokeDasharray: "3 3" }}
          formatter={(v) => [typeof v === "number" ? v.toFixed(4) : v, "value"]}
          labelFormatter={(l) => `K = ${l}`}
        />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
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
  );
}
