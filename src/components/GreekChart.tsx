"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

interface Props {
  data: { strike: number; value: number }[];
  color: string;
  errorMsg?: string | null;
}

export default function GreekChart({ data, color, errorMsg }: Props) {
  // No data yet — first load
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-center px-4"
        style={{ color: "#475569" }}>
        Implement this function, then click ▶ Run
      </div>
    );
  }

  const allNaN = data.every(d => isNaN(d.value));

  if (allNaN) {
    const isStub = errorMsg?.includes("NotImplementedError");
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-center px-4 gap-1">
        <span style={{ color: isStub ? "#94a3b8" : "#ef4444" }}>
          {isStub
            ? "Replace raise NotImplementedError with your code"
            : (errorMsg ?? "Function raised an error")}
        </span>
        {!isStub && errorMsg && (
          <span className="text-xs font-mono" style={{ color: "#64748b" }}>
            {errorMsg}
          </span>
        )}
      </div>
    );
  }

  const validData = data.filter(d => !isNaN(d.value));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={validData} margin={{ top: 4, right: 8, bottom: 16, left: 0 }}>
        <XAxis
          dataKey="strike"
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={{ stroke: "#1e3a5f" }}
          tickLine={false}
          label={{ value: "Strike (K)", position: "insideBottom", offset: -8, fill: "#64748b", fontSize: 10 }}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={{ stroke: "#1e3a5f" }}
          tickLine={false}
          width={42}
        />
        <Tooltip
          contentStyle={{
            background: "#0f2040",
            border: "1px solid #1e3a5f",
            borderRadius: 8,
            fontSize: 12,
            color: "#e2e8f0",
          }}
          formatter={(v) => [typeof v === "number" ? v.toFixed(4) : v, "value"]}
          labelFormatter={(l) => `K = ${l}`}
        />
        <ReferenceLine y={0} stroke="#1e3a5f" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
