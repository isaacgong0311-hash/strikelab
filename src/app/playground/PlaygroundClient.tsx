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

def compute_delta(S, K, T, r, sigma, option_type="call"):
    """Δ = N(d1) for call,  N(d1) - 1 for put"""
    # YOUR CODE HERE
    raise NotImplementedError

def compute_gamma(S, K, T, r, sigma):
    """Γ = n(d1) / (S · σ · √T)"""
    # YOUR CODE HERE
    raise NotImplementedError

def compute_theta(S, K, T, r, sigma, option_type="call"):
    """Θ = daily time decay  (annualised ÷ 365)"""
    if T <= 0:
        return 0.0
    # YOUR CODE HERE
    raise NotImplementedError

def compute_vega(S, K, T, r, sigma):
    """ν = S · n(d1) · √T / 100"""
    # YOUR CODE HERE
    raise NotImplementedError
`;

const DEMO_CODE = `import math

def _norm_cdf(x):
    return 0.5 * math.erfc(-x / math.sqrt(2))

def _norm_pdf(x):
    return math.exp(-0.5 * x**2) / math.sqrt(2 * math.pi)

def _d1(S, K, T, r, sigma):
    return (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))

def _d2(S, K, T, r, sigma):
    return _d1(S, K, T, r, sigma) - sigma * math.sqrt(T)

def black_scholes_call(S, K, T, r, sigma):
    d1 = _d1(S, K, T, r, sigma)
    d2 = _d2(S, K, T, r, sigma)
    return S * _norm_cdf(d1) - K * math.exp(-r * T) * _norm_cdf(d2)

def black_scholes_put(S, K, T, r, sigma):
    d1 = _d1(S, K, T, r, sigma)
    d2 = _d2(S, K, T, r, sigma)
    return K * math.exp(-r * T) * _norm_cdf(-d2) - S * _norm_cdf(-d1)

def compute_delta(S, K, T, r, sigma, option_type="call"):
    d1 = _d1(S, K, T, r, sigma)
    return _norm_cdf(d1) if option_type == "call" else _norm_cdf(d1) - 1

def compute_gamma(S, K, T, r, sigma):
    d1 = _d1(S, K, T, r, sigma)
    return _norm_pdf(d1) / (S * sigma * math.sqrt(T))

def compute_theta(S, K, T, r, sigma, option_type="call"):
    if T <= 0: return 0.0
    d1 = _d1(S, K, T, r, sigma)
    d2 = _d2(S, K, T, r, sigma)
    term1 = -S * _norm_pdf(d1) * sigma / (2 * math.sqrt(T))
    discount = r * K * math.exp(-r * T)
    if option_type == "call":
        return (term1 - discount * _norm_cdf(d2)) / 365
    return (term1 + discount * _norm_cdf(-d2)) / 365

def compute_vega(S, K, T, r, sigma):
    d1 = _d1(S, K, T, r, sigma)
    return S * _norm_pdf(d1) * math.sqrt(T) / 100
`;

const SERIES_COLORS = ["#2f6df0", "#16a34a", "#c9870c", "#7c4dd4"];

type GreekName = "delta" | "gamma" | "theta" | "vega";
const GREEKS: { key: GreekName; label: string; sym: string; fn: string; formula: string; hint: string }[] = [
  { key: "delta", label: "Delta", sym: "Δ", fn: "compute_delta(S, K, T, r, sigma, 'call')", formula: "N(d₁)", hint: "d1 = _d1(S,K,T,r,sigma) → return _norm_cdf(d1)" },
  { key: "gamma", label: "Gamma", sym: "Γ", fn: "compute_gamma(S, K, T, r, sigma)", formula: "n(d₁) / (S·σ·√T)", hint: "d1 = _d1(...) → _norm_pdf(d1) / (S * sigma * math.sqrt(T))" },
  { key: "theta", label: "Theta", sym: "Θ", fn: "compute_theta(S, K, T, r, sigma, 'call')", formula: "(−S·n(d₁)·σ/2√T ∓ r·K·e⁻ʳᵀ·N(±d₂)) / 365", hint: "term1 = -S*_norm_pdf(d1)*sigma/(2*sqrt(T)), subtract r·K·e⁻ʳᵀ·N(d2), divide by 365" },
  { key: "vega",  label: "Vega",  sym: "ν", fn: "compute_vega(S, K, T, r, sigma)", formula: "S·n(d₁)·√T / 100", hint: "d1 = _d1(...) → S * _norm_pdf(d1) * math.sqrt(T) / 100" },
];

const HELPERS = [
  { name: "_d1(S,K,T,r,σ)", desc: "[ln(S/K) + (r+σ²/2)T] / (σ√T)" },
  { name: "_d2(S,K,T,r,σ)", desc: "d1 − σ√T" },
  { name: "_norm_cdf(x)", desc: "N(x) — standard normal CDF" },
  { name: "_norm_pdf(x)", desc: "n(x) — standard normal PDF" },
];

interface ChartPoint { strike: number; value: number }

// ── Slider ──────────────────────────────────────────────────────────────────
function ParamSlider({
  label, symbol, desc, val, set, min, max, step, fmt, color,
}: {
  label: string; symbol: string; desc: string;
  val: number; set: (v: number) => void;
  min: number; max: number; step: number;
  fmt: (v: number) => string; color: string;
}) {
  return (
    <div className="pg-param">
      {/* Symbol (top-left) + current value (top-right) */}
      <div className="pg-param-top">
        <span className="pg-param-sym" style={{ color }}>{symbol}</span>
        <span className="pg-param-val" style={{ color }}>{fmt(val)}</span>
      </div>
      {/* Full name underneath */}
      <div className="pg-param-name">{label}</div>
      {/* Slider — accent-color is reliable cross-browser for thumb + track */}
      <input
        type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(Number(e.target.value))}
        className="pg-slider"
        style={{ accentColor: color }}
      />
      <div className="pg-param-desc">{desc}</div>
    </div>
  );
}

export default function PlaygroundClient() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const [code, setCode] = useState(isDemo ? DEMO_CODE : STARTER_CODE);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "pass" | "fail">("idle");
  const [chartData, setChartData] = useState<Record<GreekName, ChartPoint[]>>({ delta: [], gamma: [], theta: [], vega: [] });
  const [chartErrors, setChartErrors] = useState<Record<GreekName, string | null>>({ delta: null, gamma: null, theta: null, vega: null });
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
    if (win.__pyodideReady) { win.__pyodideReady.then(() => setPyodideReady(true)); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
    win.__pyodideReady = new Promise(resolve => {
      script.onload = async () => { const py = await win.loadPyodide(); resolve(py); setPyodideReady(true); };
    });
    document.head.appendChild(script);
  }, []);

  const runAndPlot = useCallback(async () => {
    setStatus("running"); setOutput("Running…");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).__pyodideReady;
      try { pyodide.runPython(code); } catch (err: unknown) {
        setOutput(err instanceof Error ? err.message : String(err));
        setStatus("fail"); return;
      }
      const strikes = Array.from({ length: 41 }, (_, i) => 50 + i * 2.5);
      const newData: Record<GreekName, ChartPoint[]> = { delta: [], gamma: [], theta: [], vega: [] };
      const firstErr: Record<GreekName, string | null> = { delta: null, gamma: null, theta: null, vega: null };
      for (const K of strikes) {
        for (const g of GREEKS) {
          const expr = g.fn.replace(/\bS\b/g,String(S)).replace(/\bK\b/g,String(K)).replace(/\bT\b/g,String(T)).replace(/\br\b/g,String(r)).replace(/\bsigma\b/g,String(sigma));
          try {
            const val = pyodide.runPython(expr) as number;
            newData[g.key].push({ strike: Math.round(K*10)/10, value: Math.round(val*10000)/10000 });
          } catch (e: unknown) {
            if (!firstErr[g.key]) { const raw = e instanceof Error ? e.message : String(e); firstErr[g.key] = raw.split("\n").filter(Boolean).at(-1) ?? raw; }
            newData[g.key].push({ strike: Math.round(K*10)/10, value: NaN });
          }
        }
      }
      setChartData(newData); setChartErrors(firstErr);
      const implemented = GREEKS.filter(g => newData[g.key].some(p => !isNaN(p.value)));
      const missing = GREEKS.filter(g => newData[g.key].every(p => isNaN(p.value)));
      if (missing.length === GREEKS.length) {
        setOutput(Object.values(firstErr).some(e => e?.includes("NotImplementedError"))
          ? "Nothing implemented yet — replace the raise NotImplementedError lines.\nOpen Formula Reference below for step-by-step guidance."
          : (firstErr.delta ?? "Unknown error."));
        setStatus("fail");
      } else if (missing.length > 0) {
        setOutput(`${implemented.length}/${GREEKS.length} Greeks working. Still need: ${missing.map(g => g.label).join(", ")}`);
        setStatus("pass");
      } else {
        setOutput("All four Greeks implemented! Drag the sliders to see how the curves change.");
        setStatus("pass");
      }
    } catch (err: unknown) { setOutput(err instanceof Error ? err.message : String(err)); setStatus("fail"); }
  }, [code, S, T, r, sigma]);

  runRef.current = runAndPlot;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runRef.current?.(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const implemented = GREEKS.filter(g => chartData[g.key].some(p => !isNaN(p.value))).length;

  const outBorder = status === "pass" ? "rgba(34,197,94,0.5)" : status === "fail" ? "rgba(239,68,68,0.45)" : "var(--border)";

  return (
    <div className="pg-root">

      {/* ── PAGE HEADER ── */}
      <div className="pg-header">
        <div className="pg-header-left">
          <span className="pg-header-eyebrow">Interactive</span>
          <h1 className="pg-header-title">Greek Visualizer</h1>
          <p className="pg-header-sub">Implement Δ, Γ, Θ, ν in Python — charts update live as you code</p>
        </div>
        <div className="pg-header-right">
          {implemented > 0 && (
            <div className="pg-progress-ring-wrap">
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="21" fill="none" stroke="var(--bg2)" strokeWidth="5"/>
                <circle cx="26" cy="26" r="21" fill="none"
                  stroke={implemented === 4 ? "var(--grass)" : "var(--amber)"}
                  strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${(implemented/4) * 131.9} 131.9`}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "26px 26px", transition: "stroke-dasharray .6s" }}
                />
              </svg>
              <div className="pg-ring-label" style={{ color: implemented === 4 ? "var(--grass)" : "var(--amber)" }}>
                {implemented}/4
              </div>
            </div>
          )}
          <button
            onClick={() => setCode(isDemo ? STARTER_CODE : DEMO_CODE)}
            className="pg-demo-btn"
          >
            {isDemo ? "← Starter" : "Load solution"}
          </button>
        </div>
      </div>

      {/* ── SPLIT VIEW ── */}
      <div className="pg-split">

        {/* ─ LEFT: EDITOR ─ */}
        <div className="pg-left">

          {/* IDE toolbar */}
          <div className="pg-toolbar">
            <div className="pg-toolbar-left">
              <div className="pg-file-tab">
                <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
                  <rect x="0.5" y="0.5" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1"/>
                  <line x1="2.5" y1="4" x2="8.5" y2="4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  <line x1="2.5" y1="6.5" x2="8.5" y2="6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  <line x1="2.5" y1="9" x2="6" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                pricing_engine.py
              </div>
              {implemented > 0 && (
                <span className="pg-greek-badge" style={{ background: implemented===4 ? "rgba(34,197,94,0.14)" : "rgba(251,191,36,0.12)", color: implemented===4 ? "var(--grass)" : "var(--amber)", borderColor: implemented===4 ? "rgba(34,197,94,0.35)" : "rgba(251,191,36,0.35)" }}>
                  {implemented}/{GREEKS.length} Greeks
                </span>
              )}
            </div>
            <div className="pg-toolbar-right">
              <div className="pg-py-status">
                <span className="pg-py-dot" style={{ background: pyodideReady ? "#22c55e" : "#64748b" }} />
                <span>{pyodideReady ? "Python 3.11" : "Loading Python…"}</span>
              </div>
              <button onClick={runAndPlot} disabled={status === "running" || !pyodideReady} className="pg-run-btn">
                {!pyodideReady ? (
                  <><span className="pg-spin">◌</span> Loading Python…</>
                ) : status === "running" ? (
                  <><span className="pg-spin">◌</span> Running…</>
                ) : (
                  <><span>▶</span> Run <kbd className="pg-kbd">⌘↵</kbd></>
                )}
              </button>
            </div>
          </div>

          {/* Editor area */}
          <div className="pg-editor-wrap">
            <MiniEditor value={code} onChange={setCode} />
          </div>

          {/* Parameter sliders */}
          <div className="pg-sliders">
            <div className="pg-sliders-label">Parameters — drag to reshape curves in real time</div>
            <div className="pg-sliders-grid">
              <ParamSlider label="Stock price" symbol="S" desc="Underlying asset" val={S} set={setS} min={50} max={200} step={1} fmt={v=>`$${v}`} color={SERIES_COLORS[0]} />
              <ParamSlider label="Time to expiry" symbol="T" desc="In years" val={T} set={setT} min={0.1} max={3} step={0.1} fmt={v=>`${v}y`} color={SERIES_COLORS[1]} />
              <ParamSlider label="Risk-free rate" symbol="r" desc="Annual" val={r} set={setR} min={0} max={0.2} step={0.01} fmt={v=>`${(v*100).toFixed(0)}%`} color={SERIES_COLORS[2]} />
              <ParamSlider label="Volatility" symbol="σ" desc="Implied vol" val={sigma} set={setSigma} min={0.05} max={1} step={0.05} fmt={v=>`${(v*100).toFixed(0)}%`} color={SERIES_COLORS[3]} />
            </div>
          </div>

          {/* Output console */}
          <div className="pg-console" style={{ borderColor: outBorder }}>
            <div className="pg-console-header" style={{
              background: status==="pass" ? "rgba(34,197,94,0.06)" : status==="fail" ? "rgba(239,68,68,0.06)" : "var(--bg2)",
              color: status==="pass" ? "var(--grass)" : status==="fail" ? "#dc2626" : "var(--ink-3)",
              borderColor: outBorder,
            }}>
              <span className="pg-status-dot" style={{ background: status==="pass" ? "var(--grass)" : status==="fail" ? "#dc2626" : "var(--ink-3)" }}/>
              <span>{status==="pass" ? "All tests passed" : status==="fail" ? "Error" : "Output"}</span>
            </div>
            <pre className="pg-console-body" style={{
              color: status==="pass" ? "var(--grass)" : status==="fail" ? "#dc2626" : "var(--ink-3)",
            }}>
              {output || "Implement the four functions above, then click ▶ Run"}
            </pre>
          </div>

          {/* Formula reference */}
          <div className="pg-ref">
            <button onClick={() => setRefOpen(o => !o)} className="pg-ref-toggle">
              <span className="pg-ref-icon">∂</span>
              <span>Formula Reference</span>
              <span className="pg-ref-chevron">{refOpen ? "▲" : "▼"}</span>
            </button>
            {refOpen && (
              <div className="pg-ref-body">
                <div className="pg-ref-section-label">Available helpers</div>
                <div className="pg-helpers">
                  {HELPERS.map(h => (
                    <div key={h.name} className="pg-helper-row">
                      <code className="pg-helper-name">{h.name}</code>
                      <span className="pg-helper-desc">{h.desc}</span>
                    </div>
                  ))}
                </div>
                <div className="pg-ref-section-label" style={{ marginTop: 16 }}>Formulas</div>
                <div className="pg-formula-cards">
                  {GREEKS.map((g, i) => (
                    <div key={g.key} className="pg-formula-card" style={{ borderColor: `${SERIES_COLORS[i]}30`, background: `${SERIES_COLORS[i]}08` }}>
                      <div className="pg-formula-head">
                        <span className="pg-formula-sym" style={{ color: SERIES_COLORS[i] }}>{g.sym}</span>
                        <span className="pg-formula-name" style={{ color: SERIES_COLORS[i] }}>{g.label}</span>
                        <span className="pg-formula-eq">= {g.formula}</span>
                      </div>
                      <div className="pg-formula-hint">→ {g.hint}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─ RIGHT: CHARTS ─ */}
        <div className="pg-right">
          <div className="pg-charts-label">Greek curves vs. strike price K</div>
          <div className="pg-charts-grid">
            {GREEKS.map((greek, i) => (
              <div key={greek.key} className="pg-chart-card" style={{ animationDelay: `${0.12 + i * 0.07}s` }}>
                <div className="pg-chart-header" style={{ borderColor: `${SERIES_COLORS[i]}25` }}>
                  <div className="pg-chart-title-wrap">
                    <span className="pg-chart-sym" style={{ color: SERIES_COLORS[i] }}>{greek.sym}</span>
                    <div>
                      <div className="pg-chart-name" style={{ color: SERIES_COLORS[i] }}>{greek.label}</div>
                      <div className="pg-chart-formula">= {greek.formula}</div>
                    </div>
                  </div>
                  <span className="pg-chart-axis">vs K</span>
                </div>
                <div className="pg-chart-body">
                  <GreekChart data={chartData[greek.key]} color={SERIES_COLORS[i]} errorMsg={chartErrors[greek.key]} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
