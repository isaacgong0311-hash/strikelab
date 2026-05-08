"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import GreekChart from "@/components/GreekChart";

const MiniEditor = dynamic(() => import("@/components/MiniEditor"), { ssr: false });

const STARTER_CODE = `import math

# ── Helpers ──────────────────────────────────────────────────────────────────
def _norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def _norm_pdf(x):
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def _d1(S, K, T, r, sigma):
    return (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))

def _d2(S, K, T, r, sigma):
    return _d1(S, K, T, r, sigma) - sigma * math.sqrt(T)

# ── Black-Scholes price (already implemented) ─────────────────────────────────
def black_scholes_call(S, K, T, r, sigma):
    d1 = _d1(S, K, T, r, sigma)
    d2 = _d2(S, K, T, r, sigma)
    return S * _norm_cdf(d1) - K * math.exp(-r * T) * _norm_cdf(d2)

def black_scholes_put(S, K, T, r, sigma):
    d1 = _d1(S, K, T, r, sigma)
    d2 = _d2(S, K, T, r, sigma)
    return K * math.exp(-r * T) * _norm_cdf(-d2) - S * _norm_cdf(-d1)

# ── EXERCISE: implement these four Greeks ─────────────────────────────────────

def compute_delta(S, K, T, r, sigma, option_type="call"):
    """
    call delta = N(d1)
    put  delta = N(d1) - 1
    """
    # YOUR CODE HERE
    raise NotImplementedError

def compute_gamma(S, K, T, r, sigma):
    """
    gamma = n(d1) / (S * sigma * sqrt(T))
    Same for calls and puts.
    """
    # YOUR CODE HERE
    raise NotImplementedError

def compute_theta(S, K, T, r, sigma, option_type="call"):
    """
    theta_call = (-S*n(d1)*sigma/(2*sqrt(T)) - r*K*exp(-rT)*N(d2)) / 365
    theta_put  = (-S*n(d1)*sigma/(2*sqrt(T)) + r*K*exp(-rT)*N(-d2)) / 365
    """
    # YOUR CODE HERE
    raise NotImplementedError

def compute_vega(S, K, T, r, sigma):
    """
    vega = S * n(d1) * sqrt(T) / 100
    Same for calls and puts.
    """
    # YOUR CODE HERE
    raise NotImplementedError
`;

const SERIES_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];

type GreekName = "delta" | "gamma" | "theta" | "vega";
const GREEKS: { key: GreekName; label: string; fn: string }[] = [
  { key: "delta", label: "Δ Delta", fn: "compute_delta(S, K, T, r, sigma, 'call')" },
  { key: "gamma", label: "Γ Gamma", fn: "compute_gamma(S, K, T, r, sigma)" },
  { key: "theta", label: "Θ Theta", fn: "compute_theta(S, K, T, r, sigma, 'call')" },
  { key: "vega",  label: "ν Vega",  fn: "compute_vega(S, K, T, r, sigma)" },
];

interface ChartPoint { strike: number; value: number }

export default function PlaygroundClient() {
  const [code, setCode] = useState(STARTER_CODE);
  const [output, setOutput] = useState("Implement the four Greek functions, then click ▶ Run.");
  const [status, setStatus] = useState<"idle" | "running" | "pass" | "fail">("idle");
  const [chartData, setChartData] = useState<Record<GreekName, ChartPoint[]>>({
    delta: [], gamma: [], theta: [], vega: [],
  });
  const [chartErrors, setChartErrors] = useState<Record<GreekName, string | null>>({
    delta: null, gamma: null, theta: null, vega: null,
  });
  const [S, setS] = useState(100);
  const [T, setT] = useState(1.0);
  const [r, setR] = useState(0.05);
  const [sigma, setSigma] = useState(0.20);
  const [pyodideReady, setPyodideReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (win.__pyodideReady) {
      win.__pyodideReady.then(() => setPyodideReady(true));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
    win.__pyodideReady = new Promise((resolve) => {
      script.onload = async () => {
        const pyodide = await win.loadPyodide();
        resolve(pyodide);
        setPyodideReady(true);
      };
    });
    document.head.appendChild(script);
  }, []);

  const runAndPlot = useCallback(async () => {
    setStatus("running");
    setOutput("Running…");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).__pyodideReady;

      // Step 1: run user code to define functions — surface syntax errors immediately
      try {
        pyodide.runPython(code);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setOutput(msg);
        setStatus("fail");
        return;
      }

      // Step 2: sweep K 50→150, call each Greek function per strike
      const strikes = Array.from({ length: 41 }, (_, i) => 50 + i * 2.5);
      const newChartData: Record<GreekName, ChartPoint[]> = {
        delta: [], gamma: [], theta: [], vega: [],
      };
      const firstErr: Record<GreekName, string | null> = {
        delta: null, gamma: null, theta: null, vega: null,
      };

      for (const K of strikes) {
        for (const greek of GREEKS) {
          const expr = greek.fn
            .replace(/\bS\b/g, String(S))
            .replace(/\bK\b/g, String(K))
            .replace(/\bT\b/g, String(T))
            .replace(/\br\b/g, String(r))
            .replace(/\bsigma\b/g, String(sigma));
          try {
            const val = pyodide.runPython(expr) as number;
            newChartData[greek.key].push({
              strike: Math.round(K * 10) / 10,
              value: Math.round(val * 10000) / 10000,
            });
          } catch (e: unknown) {
            if (!firstErr[greek.key]) {
              const raw = e instanceof Error ? e.message : String(e);
              // Grab the last non-empty line (the actual exception type/message)
              const lastLine = raw.split("\n").filter(Boolean).at(-1) ?? raw;
              firstErr[greek.key] = lastLine;
            }
            newChartData[greek.key].push({ strike: Math.round(K * 10) / 10, value: NaN });
          }
        }
      }

      setChartData(newChartData);
      setChartErrors(firstErr);

      // Step 3: summarise result
      const implemented = GREEKS.filter(g =>
        newChartData[g.key].some(p => !isNaN(p.value))
      );
      const missing = GREEKS.filter(g =>
        newChartData[g.key].every(p => isNaN(p.value))
      );

      if (missing.length === GREEKS.length) {
        const isStub = Object.values(firstErr).some(e => e?.includes("NotImplementedError"));
        setOutput(
          isStub
            ? "Nothing implemented yet — replace the `raise NotImplementedError` lines above."
            : (firstErr.delta ?? "Unknown error in Greek functions.")
        );
        setStatus("fail");
      } else if (missing.length > 0) {
        setOutput(
          `${implemented.length} / ${GREEKS.length} Greeks working. ` +
          `Still need: ${missing.map(g => g.label).join(", ")}`
        );
        setStatus("pass");
      } else {
        setOutput("✓ All four Greeks implemented. Try moving the sliders!");
        setStatus("pass");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutput(msg);
      setStatus("fail");
    }
  }, [code, S, T, r, sigma]);

  const borderColor =
    status === "pass" ? "#22c55e" : status === "fail" ? "#ef4444" : "var(--border)";

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Left: editor */}
      <div className="flex flex-col w-1/2 border-r" style={{ borderColor: "var(--border)" }}>
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: "var(--border)", background: "var(--bg2)" }}
        >
          <span className="font-semibold text-sm text-white" style={{ fontFamily: "var(--font-mono)" }}>pricing_engine.py</span>
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: pyodideReady ? "rgba(34,197,94,0.15)" : "rgba(100,116,139,0.2)",
                color: pyodideReady ? "#86efac" : "#94a3b8",
                fontFamily: "var(--font-mono)",
              }}
            >
              {pyodideReady ? "Python ready" : "Loading…"}
            </span>
            <button
              onClick={runAndPlot}
              disabled={status === "running" || !pyodideReady}
              className="px-4 py-1.5 rounded text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }}
            >
              {status === "running" ? "Running…" : "▶ Run"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <MiniEditor value={code} onChange={setCode} />
        </div>

        {/* Params */}
        <div
          className="flex-shrink-0 border-t px-4 py-3 grid grid-cols-4 gap-3"
          style={{ borderColor: "var(--border)", background: "var(--bg2)" }}
        >
          {[
            { label: "S (stock)", val: S, set: setS, min: 50, max: 200, step: 1 },
            { label: "T (years)", val: T, set: setT, min: 0.1, max: 3, step: 0.1 },
            { label: "r (rate)", val: r, set: setR, min: 0, max: 0.2, step: 0.01 },
            { label: "σ (vol)", val: sigma, set: setSigma, min: 0.05, max: 1, step: 0.05 },
          ].map(({ label, val, set, min, max, step }) => (
            <div key={label}>
              <label className="text-xs block mb-1" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                {label}: <strong style={{ color: "#e2e8f0" }}>{val}</strong>
              </label>
              <input
                type="range" min={min} max={max} step={step} value={val}
                onChange={(e) => set(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Output */}
        <pre
          className="flex-shrink-0 px-4 py-3 text-xs font-mono whitespace-pre-wrap border-t max-h-28 overflow-auto"
          style={{
            borderColor,
            color: status === "pass" ? "#86efac" : status === "fail" ? "#fca5a5" : "#94a3b8",
            background: "var(--bg)",
          }}
        >
          {output}
        </pre>
      </div>

      {/* Right: charts */}
      <div className="flex-1 overflow-auto p-4 grid grid-cols-2 grid-rows-2 gap-4">
        {GREEKS.map((greek, i) => (
          <div
            key={greek.key}
            className="rounded-xl border p-4 flex flex-col"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <div className="text-sm font-semibold mb-3" style={{ color: SERIES_COLORS[i], fontFamily: "var(--font-mono)" }}>
              {greek.label}
            </div>
            <div className="flex-1 min-h-0">
              <GreekChart
                data={chartData[greek.key]}
                color={SERIES_COLORS[i]}
                errorMsg={chartErrors[greek.key]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
