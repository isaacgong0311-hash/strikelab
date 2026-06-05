"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getCurrentChallenge, getNextChallengeDate } from "@/lib/challenges";
import { trackUpgradeClick } from "@/lib/analytics";

const MiniEditor = dynamic(() => import("@/components/MiniEditor"), { ssr: false });

// ── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, done: false });
  useEffect(() => {
    function tick() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0, done: true }); return; }
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000), done: false });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return timeLeft;
}

// ── Pyodide ──────────────────────────────────────────────────────────────────
function usePyodide() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).__pyodideReady) return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__pyodideReady = new Promise(resolve => {
      script.onload = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const py = await (window as any).loadPyodide();
        resolve(py);
      };
    });
    document.head.appendChild(script);
  }, []);
}

// ── Lock SVG icon ─────────────────────────────────────────────────────────────
function LockIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="8" y="18" width="24" height="18" rx="5" stroke="currentColor" strokeWidth="2"/>
      <path d="M13 18v-5a7 7 0 0 1 14 0v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="27" r="2.5" fill="currentColor"/>
      <line x1="20" y1="29" x2="20" y2="33" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ── Pro gate overlay ──────────────────────────────────────────────────────────
function ProGate() {
  return (
    <div className="ch-gate">
      <div className="ch-gate-card">
        <div className="ch-gate-icon">
          <LockIcon size={36} />
        </div>
        <h2 className="ch-gate-title">Pro feature</h2>
        <p className="ch-gate-desc">
          Weekly coding challenges, live leaderboards, XP bonuses, and a certificate of completion are all on the Pro plan.
        </p>
        <a
          href={process.env.NEXT_PUBLIC_STRIPE_PRO_LINK ?? "/sign-up"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackUpgradeClick("challenges_gate")}
          className="ch-gate-btn"
        >
          Start 7-Day Free Trial →
        </a>
        <Link href="/pricing" className="ch-gate-link">See all Pro features</Link>
      </div>
    </div>
  );
}

// ── Rank badge ────────────────────────────────────────────────────────────────
const RANK_STYLES: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: "rgba(212,175,55,0.18)", color: "#c9a227", label: "01" },
  2: { bg: "rgba(180,186,197,0.18)", color: "#8a95a3", label: "02" },
  3: { bg: "rgba(176,109,71,0.18)", color: "#a0674a", label: "03" },
};

const LEADERBOARD = [
  { rank: 1, name: "Alex T.",   xp: 200, time: "4m 12s" },
  { rank: 2, name: "Sam K.",    xp: 200, time: "5m 38s" },
  { rank: 3, name: "Jordan M.", xp: 200, time: "6m 01s" },
  { rank: 4, name: "Riley P.",  xp: 150, time: "7m 44s" },
  { rank: 5, name: "Casey L.",  xp: 150, time: "8m 52s" },
];

const ARCHIVE = [
  { title: "Vega Surface",      done: true  },
  { title: "Put-Call Arbitrage",done: false },
  { title: "American Put Tree", done: false },
];

const DIFFICULTY_STYLES: Record<string, { bg: string; color: string }> = {
  easy:   { bg: "var(--grass-tint)",  color: "var(--grass)" },
  medium: { bg: "var(--amber-tint)", color: "var(--amber)" },
  hard:   { bg: "var(--coral-tint)",  color: "var(--coral)" },
};

// ── Main component ────────────────────────────────────────────────────────────
export default function ChallengesClient() {
  const challenge = getCurrentChallenge();
  const nextDate = getNextChallengeDate();
  const countdown = useCountdown(nextDate);
  usePyodide();

  const [code, setCode] = useState(challenge.starterCode);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "pass" | "fail">("idle");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const isPro = false;

  const runRef = useRef<(() => void) | null>(null);
  const outBorder = status==="pass" ? "rgba(34,197,94,0.45)" : status==="fail" ? "rgba(239,68,68,0.35)" : "var(--border)";
  const diff = DIFFICULTY_STYLES[challenge.difficulty] ?? DIFFICULTY_STYLES.medium;

  async function runCode() {
    setStatus("running"); setOutput("Running tests…"); setAttempts(n => n + 1);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).__pyodideReady;
      pyodide.runPython(code);
      pyodide.runPython(challenge.testCode);
      setOutput("All tests passed!");
      setStatus("pass");
    } catch (err: unknown) {
      setOutput(err instanceof Error ? err.message : String(err));
      setStatus("fail");
    }
  }
  runRef.current = runCode;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runRef.current?.(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="ch-root">

      {/* ── PAGE HEADER ── */}
      <div className="ch-header">
        <div className="ch-header-left">
          <div className="ch-eyebrow">
            <span className="ch-pro-badge">Pro</span>
            <span className="ch-divider">·</span>
            <span>Weekly Challenge</span>
          </div>
          <h1 className="ch-title">{challenge.title}</h1>
          <div className="ch-tags">
            <span className="ch-tag" style={{ background: diff.bg, color: diff.color }}>{challenge.difficulty}</span>
            <span className="ch-tag" style={{ background: "var(--sky-tint)", color: "var(--sky)" }}>{challenge.conceptTag}</span>
            <span className="ch-tag" style={{ background: "rgba(251,191,36,0.12)", color: "var(--amber)" }}>+{challenge.xpReward} XP</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="ch-countdown">
          <div className="ch-countdown-label">Next challenge in</div>
          {countdown.done ? (
            <div className="ch-countdown-done">New challenge!</div>
          ) : (
            <div className="ch-countdown-timer">
              <div className="ch-time-unit">
                <span className="ch-time-num">{String(countdown.h).padStart(2,"0")}</span>
                <span className="ch-time-label">hr</span>
              </div>
              <span className="ch-time-sep">:</span>
              <div className="ch-time-unit">
                <span className="ch-time-num">{String(countdown.m).padStart(2,"0")}</span>
                <span className="ch-time-label">min</span>
              </div>
              <span className="ch-time-sep">:</span>
              <div className="ch-time-unit">
                <span className="ch-time-num">{String(countdown.s).padStart(2,"0")}</span>
                <span className="ch-time-label">sec</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="ch-body">

        {/* Left: problem + editor */}
        <div className="ch-main">

          {/* Problem statement */}
          <div className="ch-problem">
            <div className="ch-problem-header">
              <div className="ch-problem-dot" />
              Problem Statement
            </div>
            <div className="ch-problem-body">
              {challenge.description.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**"))
                  return <p key={i} className="ch-p-bold">{line.slice(2,-2)}</p>;
                if (line.startsWith("- "))
                  return <li key={i} className="ch-p-li">{line.slice(2)}</li>;
                if (!line.trim()) return <div key={i} className="ch-p-gap"/>;
                const parts = line.split(/(`[^`]+`)/g);
                return (
                  <p key={i} className="ch-p">
                    {parts.map((p, j) =>
                      p.startsWith("`") && p.endsWith("`")
                        ? <code key={j} className="ch-inline-code">{p.slice(1,-1)}</code>
                        : p
                    )}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Editor */}
          <div className="ch-editor-wrap" style={{ position: "relative" }}>
            {!isPro && <ProGate />}
            <div className="ch-editor-card" style={{ borderColor: outBorder }}>
              {/* Editor header */}
              <div className="ch-editor-header">
                <div className="ch-editor-title">
                  <svg width="11" height="13" viewBox="0 0 11 13" fill="none" style={{ opacity: 0.6 }}>
                    <rect x="0.5" y="0.5" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1"/>
                    <line x1="2.5" y1="4" x2="8.5" y2="4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                    <line x1="2.5" y1="6.5" x2="8.5" y2="6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                    <line x1="2.5" y1="9" x2="6" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  Your Solution
                </div>
                <span className="ch-py-badge">Python · runs in browser</span>
              </div>

              <MiniEditor value={code} onChange={setCode} />

              {/* Run bar */}
              <div className="ch-run-bar">
                <div className="ch-run-left">
                  <button onClick={runCode} disabled={status==="running"} className="ch-run-btn">
                    {status==="running"
                      ? <><span className="ch-spin">◌</span> Running…</>
                      : <>▶ Run Tests <kbd className="ch-kbd">⌘↵</kbd></>}
                  </button>
                  {attempts >= 3 && !showHint && status !== "pass" && (
                    <button onClick={() => setShowHint(true)} className="ch-hint-btn">
                      Show hint
                    </button>
                  )}
                </div>
                {attempts > 0 && (
                  <span className="ch-attempts">{attempts} attempt{attempts > 1 ? "s" : ""}</span>
                )}
              </div>

              {/* Hint */}
              {showHint && (
                <div className="ch-hint">
                  <span className="ch-hint-arrow">→</span>
                  <span>{challenge.solutionHint}</span>
                </div>
              )}

              {/* Output */}
              {output && (
                <div className="ch-output">
                  <div className="ch-output-header" style={{
                    color: status==="pass" ? "var(--grass)" : "#dc2626",
                    background: status==="pass" ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
                    borderColor: outBorder,
                  }}>
                    <span>{status==="pass" ? "✓" : "✗"}</span>
                    <span>{status==="pass" ? "Tests passed" : "Error"}</span>
                  </div>
                  <pre className="ch-output-body" style={{ color: status==="pass" ? "var(--grass)" : "#dc2626" }}>
                    {output}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: leaderboard + archive */}
        <div className="ch-sidebar">

          {/* Leaderboard */}
          <div className="ch-panel">
            <div className="ch-panel-header">
              <span className="ch-panel-title">This Week&apos;s Leaderboard</span>
              <span className="ch-panel-tag">{LEADERBOARD.length} entries</span>
            </div>
            <div className="ch-leaderboard">
              {LEADERBOARD.map(entry => {
                const rs = RANK_STYLES[entry.rank];
                return (
                  <div key={entry.rank} className="ch-lb-row">
                    <div
                      className="ch-lb-rank"
                      style={rs
                        ? { background: rs.bg, color: rs.color }
                        : { background: "var(--bg2)", color: "var(--ink-3)" }}
                    >
                      {String(entry.rank).padStart(2, "0")}
                    </div>
                    <span className="ch-lb-name">{entry.name}</span>
                    <span className="ch-lb-time">{entry.time}</span>
                    <span className="ch-lb-xp">+{entry.xp}</span>
                  </div>
                );
              })}
            </div>
            {!isPro && (
              <div className="ch-panel-footer">
                <a
                  href={process.env.NEXT_PUBLIC_STRIPE_PRO_LINK ?? "/sign-up"}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => trackUpgradeClick("challenges_leaderboard")}
                  className="ch-upgrade-link"
                >
                  Upgrade to compete →
                </a>
              </div>
            )}
          </div>

          {/* Archive */}
          <div className="ch-panel">
            <div className="ch-panel-header">
              <span className="ch-panel-title">Challenge Archive</span>
              {!isPro && <span className="ch-pro-tag">Pro</span>}
            </div>
            <div className="ch-archive">
              {ARCHIVE.map(item => (
                <div key={item.title} className={`ch-archive-row ${item.done ? "done" : ""}`}>
                  <div className="ch-archive-status" style={{
                    background: item.done ? "rgba(34,197,94,0.14)" : "var(--bg2)",
                    color: item.done ? "var(--grass)" : "var(--ink-3)",
                  }}>
                    {item.done ? "✓" : "—"}
                  </div>
                  <span className="ch-archive-title">{item.title}</span>
                </div>
              ))}
            </div>
            {!isPro && (
              <p className="ch-archive-note">Pro members access all past challenges.</p>
            )}
          </div>

          {/* Stats card */}
          <div className="ch-panel ch-stats-panel">
            <div className="ch-panel-title" style={{ marginBottom: 14 }}>Your Stats</div>
            <div className="ch-stats-grid">
              <div className="ch-stat-cell">
                <div className="ch-stat-n">0</div>
                <div className="ch-stat-l">Solved</div>
              </div>
              <div className="ch-stat-cell">
                <div className="ch-stat-n">—</div>
                <div className="ch-stat-l">Rank</div>
              </div>
              <div className="ch-stat-cell">
                <div className="ch-stat-n">0</div>
                <div className="ch-stat-l">Bonus XP</div>
              </div>
            </div>
            {!isPro && (
              <Link href="/pricing" className="ch-panel-cta">Unlock with Pro →</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
