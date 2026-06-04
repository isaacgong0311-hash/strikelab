"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import GreekChart from "@/components/GreekChart";

const MiniEditor = dynamic(() => import("@/components/MiniEditor"), { ssr: false });

const STARTER_CODE = `import math

# ── Helpers (already implemented — do not modify) ─────────────────────────────
def _norm_cdf(x):
    """Standard normal CDF: N(x)"""
    return 0.5 * math.erfc(-x / math.sqrt(2))

def _norm_pdf(x):
    """Standard normal PDF: n(x) = exp(-x²/2) / sqrt(2π)"""
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def _d1(S, K, T, r, sigma):
    """d1 = [ln(S/K) + (r + σ²/2)·T] / (σ·√T)"""
    return (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))

def _d2(S, K, T, r, sigma):
    """d2 = d1 - σ·√T"""
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

# ── YOUR JOB: implement the four Greeks below ─────────────────────────────────
# Use _d1(), _d2(), _norm_cdf(), _norm_pdf() — they are already defined above.
# Click "▶ Run" or press Ctrl+Enter to test. Charts appear on the right.

def compute_delta(S, K, T, r, sigma, option_type="call"):
    """
    Δ = sensitivity of option price to a $1 move in S.

    Step 1: d1 = _d1(S, K, T, r, sigma)
    Step 2: Δ_call = N(d1)        →  _norm_cdf(d1)
            Δ_put  = N(d1) - 1

    Range: call ∈ [0, 1]   put ∈ [-1, 0]
    """
    # YOUR CODE HERE
    raise NotImplementedError

def compute_gamma(S, K, T, r, sigma):
    """
    Γ = rate of change of delta (same for calls and puts).

    Step 1: d1 = _d1(S, K, T, r, sigma)
    Step 2: Γ = n(d1) / (S * sigma * sqrt(T))
              = _norm_pdf(d1) / (S * sigma * math.sqrt(T))

    Note: use _norm_pdf (PDF), not _norm_cdf (CDF).
    """
    # YOUR CODE HERE
    raise NotImplementedError

def compute_theta(S, K, T, r, sigma, option_type="call"):
    """
    Θ = daily time decay (almost always negative).

    Step 1: d1 = _d1(...)   d2 = _d2(...)
    Step 2: term1 = -S * _norm_pdf(d1) * sigma / (2 * math.sqrt(T))
    Step 3 (call): Θ = (term1 - r * K * exp(-rT) * N(d2))  / 365
            (put):  Θ = (term1 + r * K * exp(-rT) * N(-d2)) / 365

    Divide by 365 to convert from annualised to daily.
    """
    if T <= 0:
        return 0.0
    # YOUR CODE HERE
    raise NotImplementedError

def compute_vega(S, K, T, r, sigma):
    """
    ν = $ change in option price per 1% move in implied vol (same for calls/puts).

    Step 1: d1 = _d1(S, K, T, r, sigma)
    Step 2: ν = S * _norm_pdf(d1) * math.sqrt(T) / 100

    Divide by 100 so result is per percentage-point (not per unit).
    """
    # YOUR CODE HERE
    raise NotImplementedError
`;

const DEMO_CODE = `import math

# ── Helpers (already implemented — do not modify) ─────────────────────────────
def _norm_cdf(x):
    """Standard normal CDF: N(x)"""
    return 0.5 * math.erfc(-x / math.sqrt(2))

def _norm_pdf(x):
    """Standard normal PDF: n(x) = exp(-x²/2) / sqrt(2π)"""
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def _d1(S, K, T, r, sigma):
    """d1 = [ln(S/K) + (r + σ²/2)·T] / (σ·√T)"""
    return (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))

def _d2(S, K, T, r, sigma):
    """d2 = d1 - σ·√T"""
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

# ── Greeks — complete implementations ────────────────────────────────────────

def compute_delta(S, K, T, r, sigma, option_type="call"):
    """Δ = N(d1) for call,  N(d1) - 1 for put"""
    d1 = _d1(S, K, T, r, sigma)
    if option_type == "call":
        return _norm_cdf(d1)
    return _norm_cdf(d1) - 1

def compute_gamma(S, K, T, r, sigma):
    """Γ = n(d1) / (S · σ · √T)  — same for calls and puts"""
    d1 = _d1(S, K, T, r, sigma)
    return _norm_pdf(d1) / (S * sigma * math.sqrt(T))

def compute_theta(S, K, T, r, sigma, option_type="call"):
    """Θ = daily time decay  (annualised formula ÷ 365)"""
    if T <= 0:
        return 0.0
    d1 = _d1(S, K, T, r, sigma)
    d2 = _d2(S, K, T, r, sigma)
    term1 = -S * _norm_pdf(d1) * sigma / (2 * math.sqrt(T))
    discount = r * K * math.exp(-r * T)
    if option_type == "call":
        return (term1 - discount * _norm_cdf(d2))  / 365
    return (term1 + discount * _norm_cdf(-d2)) / 365

def compute_vega(S, K, T, r, sigma):
    """ν = S · n(d1) · √T / 100  (per 1 pp move in vol)"""
    d1 = _d1(S, K, T, r, sigma)
    return S * _norm_pdf(d1) * math.sqrt(T) / 100
`;

const SERIES_COLORS = ["#22c55e", "#60a5fa", "#f59e0b", "#a855f7"];

type GreekName = "delta" | "gamma" | "theta" | "vega";
const GREEKS: { key: GreekName; label: string; sym: string; fn: string; formula: string; hint: string }[] = [
  {
    key: "delta",
    label: "Delta",
    sym: "Δ",
    fn: "compute_delta(S, K, T, r, sigma, 'call')",
    formula: "N(d₁)",
    hint: "d1 = _d1(S,K,T,r,sigma) → return _norm_cdf(d1) for call, _norm_cdf(d1)-1 for put",
  },
  {
    key: "gamma",
    label: "Gamma",
    sym: "Γ",
    fn: "compute_gamma(S, K, T, r, sigma)",
    formula: "n(d₁) / (S·σ·√T)",
    hint: "d1 = _d1(...) → return _norm_pdf(d1) / (S * sigma * math.sqrt(T))",
  },
  {
    key: "theta",
    label: "Theta",
    sym: "Θ",
    fn: "compute_theta(S, K, T, r, sigma, 'call')",
    formula: "(−S·n(d₁)·σ/2√T ∓ r·K·e⁻ʳᵀ·N(±d₂)) / 365",
    hint: "term1 = -S*_norm_pdf(d1)*sigma/(2*sqrt(T)), subtract r·K·e⁻ʳᵀ·N(d2) for call, add for put, /365",
  },
  {
    key: "vega",
    label: "Vega",
    sym: "ν",
    fn: "compute_vega(S, K, T, r, sigma)",
    formula: "S·n(d₁)·√T / 100",
    hint: "d1 = _d1(...) → return S * _norm_pdf(d1) * math.sqrt(T) / 100",
  },
];

const HELPERS = [
  { name: "_d1(S,K,T,r,σ)", desc: "[ln(S/K) + (r+σ²/2)T] / (σ√T)" },
  { name: "_d2(S,K,T,r,σ)", desc: "d1 − σ√T" },
  { name: "_norm_cdf(x)", desc: "N(x) — standard normal CDF" },
  { name: "_norm_pdf(x)", desc: "n(x) — standard normal PDF" },
];

interface ChartPoint { strike: number; value: number }

export default function PlaygroundClient() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const [code, setCode] = useState(isDemo ? DEMO_CODE : STARTER_CODE);
  const [output, setOutput] = useState("");
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
  const [refOpen, setRefOpen] = useState(false);
  const runRef = useRef<(() => void) | null>(null);

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

      try {
        pyodide.runPython(code);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setOutput(msg);
        setStatus("fail");
        return;
      }

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
              firstErr[greek.key] = raw.split("\n").filter(Boolean).at(-1) ?? raw;
            }
            newChartData[greek.key].push({ strike: Math.round(K * 10) / 10, value: NaN });
          }
        }
      }

      setChartData(newChartData);
      setChartErrors(firstErr);

      const implemented = GREEKS.filter(g => newChartData[g.key].some(p => !isNaN(p.value)));
      const missing = GREEKS.filter(g => newChartData[g.key].every(p => isNaN(p.value)));

      if (missing.length === GREEKS.length) {
        const isStub = Object.values(firstErr).some(e => e?.includes("NotImplementedError"));
        setOutput(
          isStub
            ? "Nothing implemented yet — replace the `raise NotImplementedError` lines above.\nHint: open the Formula Reference below for step-by-step guidance."
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
        setOutput("All four Greeks implemented! Try dragging the sliders to reshape the curves.");
        setStatus("pass");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutput(msg);
      setStatus("fail");
    }
  }, [code, S, T, r, sigma]);

  // Keep ref in sync so the keydown listener can call the latest version
  useEffect(() => {
    runRef.current = runAndPlot;
  }, [runAndPlot]);

  // Ctrl+Enter / Cmd+Enter global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runRef.current?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const implemented = GREEKS.filter(g => chartData[g.key].some(p => !isNaN(p.value))).length;
  const total = GREEKS.length;

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* ── LEFT PANEL ── */}
      <div className="flex flex-col w-[52%] border-r" style={{ borderColor: "var(--border)" }}>

        {/* IDE Toolbar */}
        <div
          className="flex items-center justify-between pl-4 pr-3 border-b flex-shrink-0"
          style={{
            borderColor: "var(--border)",
            background: "var(--bg2)",
            minHeight: 44,
          }}
        >
          {/* File tab */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-t-md border-b-2 text-xs"
              style={{
                borderBottomColor: "#22c55e",
                color: "#e2e8f0",
                fontFamily: "var(--font-mono)",
                background: "rgba(34,197,94,0.06)",
              }}
            >
              <span style={{ color: "#4ade80", fontSize: 10 }}>●</span>
              pricing_engine.py
            </div>

            {/* Progress indicator */}
            {implemented > 0 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: implemented === total ? "rgba(34,197,94,0.15)" : "rgba(251,191,36,0.12)",
                  color: implemented === total ? "#4ade80" : "#fbbf24",
                  fontFamily: "var(--font-mono)",
                  border: `1px solid ${implemented === total ? "rgba(34,197,94,0.3)" : "rgba(251,191,36,0.3)"}`,
                }}
              >
                {implemented}/{total} Greeks
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Python status pill */}
            <div
              className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full"
              style={{
                background: pyodideReady ? "rgba(34,197,94,0.1)" : "rgba(100,116,139,0.15)",
                border: `1px solid ${pyodideReady ? "rgba(34,197,94,0.3)" : "rgba(100,116,139,0.2)"}`,
                color: pyodideReady ? "#4ade80" : "#64748b",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: pyodideReady ? "#22c55e" : "#64748b",
                  boxShadow: pyodideReady ? "0 0 6px #22c55e" : "none",
                }}
              />
              {pyodideReady ? "Python ready" : "Loading…"}
            </div>

            {/* RUN BUTTON */}
            <button
              onClick={runAndPlot}
              disabled={status === "running" || !pyodideReady}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all disabled:opacity-40"
              style={{
                background: status === "running"
                  ? "rgba(34,197,94,0.15)"
                  : "linear-gradient(135deg, #16a34a, #22c55e)",
                color: status === "running" ? "#4ade80" : "#000",
                fontFamily: "var(--font-mono)",
                boxShadow: status === "running" || !pyodideReady
                  ? "none"
                  : "0 0 12px rgba(34,197,94,0.4), 0 2px 8px rgba(34,197,94,0.2)",
                border: "1px solid rgba(34,197,94,0.5)",
                letterSpacing: "0.04em",
              }}
            >
              {status === "running" ? (
                <>
                  <span className="animate-spin inline-block" style={{ fontSize: 12 }}>◌</span>
                  Running…
                </>
              ) : (
                <>
                  <span style={{ fontSize: 11 }}>▶</span>
                  Run
                  <kbd
                    className="text-[9px] px-1 rounded"
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      color: "rgba(0,0,0,0.7)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ⌘↵
                  </kbd>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <MiniEditor value={code} onChange={setCode} />
        </div>

        {/* Parameter sliders */}
        <div
          className="flex-shrink-0 border-t px-4 py-3"
          style={{ borderColor: "var(--border)", background: "var(--bg2)" }}
        >
          <div className="text-[9px] uppercase tracking-widest mb-2.5 opacity-40" style={{ fontFamily: "var(--font-mono)", color: "#888" }}>
            Parameters — drag to reshape curves
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "S", desc: "Stock price", val: S, set: setS, min: 50, max: 200, step: 1, fmt: (v: number) => `$${v}` },
              { label: "T", desc: "Time (years)", val: T, set: setT, min: 0.1, max: 3, step: 0.1, fmt: (v: number) => `${v}y` },
              { label: "r", desc: "Risk-free rate", val: r, set: setR, min: 0, max: 0.2, step: 0.01, fmt: (v: number) => `${(v*100).toFixed(0)}%` },
              { label: "σ", desc: "Volatility", val: sigma, set: setSigma, min: 0.05, max: 1, step: 0.05, fmt: (v: number) => `${(v*100).toFixed(0)}%` },
            ].map(({ label, desc, val, set, min, max, step, fmt }) => (
              <div key={label}>
                <div className="flex items-baseline justify-between mb-1">
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#e2e8f0", fontFamily: "var(--font-mono)" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: "#22c55e", fontFamily: "var(--font-mono)" }}
                  >
                    {fmt(val)}
                  </span>
                </div>
                <input
                  type="range" min={min} max={max} step={step} value={val}
                  onChange={(e) => set(Number(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "#22c55e" }}
                />
                <div className="text-[9px] mt-0.5 opacity-40" style={{ color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Output console */}
        <div
          className="flex-shrink-0 border-t"
          style={{
            borderColor: status === "pass" ? "rgba(34,197,94,0.4)" : status === "fail" ? "rgba(239,68,68,0.4)" : "var(--border)",
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 border-b text-[10px]"
            style={{
              borderColor: "inherit",
              background: status === "pass"
                ? "rgba(34,197,94,0.05)"
                : status === "fail"
                  ? "rgba(239,68,68,0.05)"
                  : "var(--bg2)",
              fontFamily: "var(--font-mono)",
              color: status === "pass" ? "#4ade80" : status === "fail" ? "#fca5a5" : "#64748b",
            }}
          >
            <span>{status === "pass" ? "✓" : status === "fail" ? "✗" : "○"}</span>
            <span className="uppercase tracking-widest">
              {status === "pass" ? "Tests passed" : status === "fail" ? "Error" : "Output"}
            </span>
          </div>
          <pre
            className="px-4 py-3 text-xs font-mono whitespace-pre-wrap"
            style={{
              color: status === "pass" ? "#4ade80" : status === "fail" ? "#fca5a5" : "#64748b",
              background: "var(--bg)",
              maxHeight: "4.5rem",
              overflowY: "auto",
              minHeight: "2.5rem",
            }}
          >
            {output || "Implement the four functions above, then click ▶ Run or press Ctrl+Enter."}
          </pre>
        </div>

        {/* Formula Reference */}
        <div className="flex-shrink-0 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setRefOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] transition-colors hover:text-white"
            style={{ color: "var(--muted)", background: "var(--bg2)", fontFamily: "var(--font-mono)" }}
          >
            <span className="flex items-center gap-2">
              <span style={{ color: "#60a5fa" }}>∂</span>
              Formula Reference
            </span>
            <span style={{ opacity: 0.5 }}>{refOpen ? "▲" : "▼"}</span>
          </button>

          {refOpen && (
            <div
              className="px-4 py-3 overflow-auto"
              style={{ background: "var(--bg)", maxHeight: "260px" }}
            >
              <div className="mb-4">
                <div className="text-[9px] uppercase tracking-widest mb-2 opacity-40" style={{ fontFamily: "var(--font-mono)", color: "#888" }}>
                  Available helpers
                </div>
                <div className="flex flex-col gap-1.5">
                  {HELPERS.map((h) => (
                    <div key={h.name} className="flex gap-3 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                      <span style={{ color: "#7dd3fc", flexShrink: 0 }}>{h.name}</span>
                      <span style={{ color: "#475569" }}>{h.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[9px] uppercase tracking-widest mb-2 opacity-40" style={{ fontFamily: "var(--font-mono)", color: "#888" }}>
                Formulas
              </div>
              <div className="flex flex-col gap-2">
                {GREEKS.map((g, i) => (
                  <div
                    key={g.key}
                    className="rounded-lg p-3 border"
                    style={{ borderColor: `${SERIES_COLORS[i]}33`, background: `${SERIES_COLORS[i]}08` }}
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-bold" style={{ color: SERIES_COLORS[i], fontFamily: "var(--font-mono)" }}>
                        {g.sym} {g.label}
                      </span>
                      <span className="text-xs" style={{ color: "#64748b", fontFamily: "var(--font-mono)" }}>
                        = {g.formula}
                      </span>
                    </div>
                    <div className="text-[11px] leading-relaxed" style={{ color: "#475569", fontFamily: "var(--font-mono)" }}>
                      → {g.hint}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL — charts ── */}
      <div className="flex-1 overflow-auto p-4 grid grid-cols-2 grid-rows-2 gap-3" style={{ background: "var(--bg)" }}>
        {GREEKS.map((greek, i) => {
          const hasData = chartData[greek.key].some(p => !isNaN(p.value));
          return (
            <div
              key={greek.key}
              className="rounded-xl border flex flex-col overflow-hidden"
              style={{
                borderColor: hasData ? `${SERIES_COLORS[i]}40` : "var(--border)",
                background: hasData ? `${SERIES_COLORS[i]}06` : "var(--card)",
                transition: "border-color 0.3s",
              }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0"
                style={{
                  borderColor: hasData ? `${SERIES_COLORS[i]}30` : "var(--border)",
                  background: hasData ? `${SERIES_COLORS[i]}0a` : "var(--bg2)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-base font-bold"
                    style={{ color: SERIES_COLORS[i], fontFamily: "var(--font-mono)", lineHeight: 1 }}
                  >
                    {greek.sym}
                  </span>
                  <div>
                    <span className="text-xs font-semibold" style={{ color: "#e2e8f0", fontFamily: "var(--font-mono)" }}>
                      {greek.label}
                    </span>
                    <span
                      className="text-[10px] ml-2 opacity-60"
                      style={{ color: "#94a3b8", fontFamily: "var(--font-mono)" }}
                    >
                      = {greek.formula}
                    </span>
                  </div>
                </div>
                <span
                  className="text-[9px] uppercase tracking-widest opacity-40"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                >
                  vs K
                </span>
              </div>

              {/* Chart */}
              <div className="flex-1 min-h-0 p-1">
                <GreekChart
                  data={chartData[greek.key]}
                  color={SERIES_COLORS[i]}
                  errorMsg={chartErrors[greek.key]}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
