"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getCurrentChallenge, getNextChallengeDate } from "@/lib/challenges";
import { trackUpgradeClick } from "@/lib/analytics";

const MiniEditor = dynamic(() => import("@/components/MiniEditor"), { ssr: false });

// ─── Countdown timer ──────────────────────────────────────────────────────────

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    function tick() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("New challenge available!"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return timeLeft;
}

// ─── Pyodide loader ───────────────────────────────────────────────────────────

function usePyodide() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).__pyodideReady) return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__pyodideReady = new Promise((resolve) => {
      script.onload = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const py = await (window as any).loadPyodide();
        resolve(py);
      };
    });
    document.head.appendChild(script);
  }, []);
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  easy:   { bg: "var(--grass-tint)",  text: "var(--grass)" },
  medium: { bg: "var(--amber-tint)", text: "var(--amber)" },
  hard:   { bg: "var(--coral-tint)",  text: "var(--coral)" },
};

// ─── Pro gate overlay ─────────────────────────────────────────────────────────

function ProGate() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-xl"
      style={{ background: "rgba(247,245,239,0.92)", backdropFilter: "blur(8px)" }}
    >
      <div className="text-center max-w-sm px-6">
        <div className="text-3xl mb-3">🔒</div>
        <h2
          className="text-xl font-semibold mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Pro feature
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--muted2)" }}>
          Weekly coding challenges are available on the Pro plan. Compete on the leaderboard, earn XP, and unlock a certificate of completion.
        </p>
        <a
          href={process.env.NEXT_PUBLIC_STRIPE_PRO_LINK ?? "/sign-up"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackUpgradeClick("challenges_gate")}
          className="inline-block px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-opacity hover:opacity-90"
          style={{
            background: "var(--grass)",
            fontFamily: "var(--font-mono)",
            boxShadow: "0 3px 0 var(--grass-d)",
          }}
        >
          Start 7-Day Free Trial →
        </a>
        <div className="mt-3">
          <Link href="/pricing" className="text-xs underline underline-offset-4" style={{ color: "var(--muted)" }}>
            See all Pro features
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Leaderboard placeholder ──────────────────────────────────────────────────

const LEADERBOARD = [
  { rank: 1, name: "Alex T.",    xp: 200, time: "4m 12s",  badge: "🥇" },
  { rank: 2, name: "Sam K.",     xp: 200, time: "5m 38s",  badge: "🥈" },
  { rank: 3, name: "Jordan M.",  xp: 200, time: "6m 01s",  badge: "🥉" },
  { rank: 4, name: "Riley P.",   xp: 150, time: "7m 44s",  badge: "" },
  { rank: 5, name: "Casey L.",   xp: 150, time: "8m 52s",  badge: "" },
];

// ─── Main component ───────────────────────────────────────────────────────────

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

  // For demo purposes treat as "not Pro" — swap for real Clerk check when billing is live
  const isPro = false;

  const runRef = useRef<(() => void) | null>(null);
  const borderColor =
    status === "pass" ? "rgba(34,197,94,0.35)"
    : status === "fail" ? "rgba(239,68,68,0.3)"
    : "var(--border)";

  async function runCode() {
    setStatus("running");
    setOutput("Running tests…");
    setAttempts((n) => n + 1);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = await (window as any).__pyodideReady;
      pyodide.runPython(code);
      pyodide.runPython(challenge.testCode);
      setOutput("✓ All tests passed!");
      setStatus("pass");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOutput(msg);
      setStatus("fail");
    }
  }
  runRef.current = runCode;

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

  const diff = DIFFICULTY_COLORS[challenge.difficulty] ?? DIFFICULTY_COLORS.medium;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="v2-rise mb-8">
        <div
          className="text-[10px] tracking-widest uppercase mb-2 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
        >
          Pro · Weekly Challenge
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-3xl font-semibold mb-1"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {challenge.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                style={{ background: diff.bg, color: diff.text, fontFamily: "var(--font-mono)" }}
              >
                {challenge.difficulty}
              </span>
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full"
                style={{ background: "var(--sky-tint)", color: "var(--sky)", fontFamily: "var(--font-mono)" }}
              >
                {challenge.conceptTag}
              </span>
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full"
                style={{ background: "var(--amber-tint)", color: "var(--amber)", fontFamily: "var(--font-mono)" }}
              >
                +{challenge.xpReward} XP
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              Next challenge in
            </div>
            <div
              className="text-xl font-semibold tabular-nums"
              style={{ fontFamily: "var(--font-mono)", color: "var(--grass)" }}
            >
              {countdown}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: problem + editor */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Problem description */}
          <div
            className="v2-rise p-5 rounded-xl border text-sm leading-relaxed"
            style={{ borderColor: "var(--border2)", background: "var(--card)", color: "var(--fg-mute)" }}
          >
            {challenge.description.split("\n").map((line, i) => {
              if (line.startsWith("**") && line.endsWith("**")) {
                return <p key={i} className="font-semibold mb-2" style={{ color: "var(--ink)" }}>{line.slice(2, -2)}</p>;
              }
              if (line.startsWith("- ")) {
                return <li key={i} className="ml-4 mb-1">{line.slice(2)}</li>;
              }
              if (line.trim() === "") return <div key={i} className="h-2" />;
              // Inline code: replace `...` with styled spans
              const parts = line.split(/(`[^`]+`)/g);
              return (
                <p key={i} className="mb-1">
                  {parts.map((p, j) =>
                    p.startsWith("`") && p.endsWith("`")
                      ? <code key={j} className="px-1 rounded text-[11px]" style={{ background: "var(--bg2)", color: "var(--grass)", fontFamily: "var(--font-mono)" }}>{p.slice(1, -1)}</code>
                      : p
                  )}
                </p>
              );
            })}
          </div>

          {/* Editor + Run */}
          <div className="relative">
            {/* Pro gate overlay */}
            {!isPro && <ProGate />}

            <div
              className="v2-rise border rounded-xl overflow-hidden"
              style={{ borderColor, transition: "border-color 0.25s" }}
            >
              {/* Editor header */}
              <div
                className="px-4 py-2.5 flex items-center justify-between border-b"
                style={{ borderColor: "var(--border)", background: "var(--bg2)" }}
              >
                <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                  Your Solution
                </span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  Python · runs in browser
                </span>
              </div>

              <MiniEditor value={code} onChange={setCode} />

              {/* Run bar */}
              <div
                className="px-4 py-2.5 flex items-center justify-between border-t gap-3"
                style={{ borderColor: "var(--border)", background: "var(--bg2)" }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={runCode}
                    disabled={status === "running"}
                    className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-all disabled:opacity-30"
                    style={{
                      background: "var(--grass)",
                      color: "#ffffff",
                      fontFamily: "var(--font-mono)",
                      borderRadius: "10px",
                      boxShadow: "0 3px 0 var(--grass-d)",
                    }}
                  >
                    {status === "running" ? (
                      <><span className="animate-spin inline-block" style={{ fontSize: 12 }}>◌</span> Running…</>
                    ) : (
                      <>▶ Run Tests <kbd className="text-[9px] px-1.5 py-0.5 ml-1" style={{ background: "rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-mono)" }}>⌘↵</kbd></>
                    )}
                  </button>
                  {attempts >= 3 && !showHint && status !== "pass" && (
                    <button
                      onClick={() => setShowHint(true)}
                      className="text-xs underline underline-offset-4"
                      style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                    >
                      Show hint
                    </button>
                  )}
                </div>
                <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                  {attempts > 0 ? `${attempts} attempt${attempts > 1 ? "s" : ""}` : ""}
                </span>
              </div>

              {/* Hint */}
              {showHint && (
                <div
                  className="px-4 py-3 border-t text-xs leading-relaxed"
                  style={{ borderColor: "var(--border)", background: "var(--amber-tint)", color: "var(--amber)", fontFamily: "var(--font-mono)" }}
                >
                  💡 Hint: {challenge.solutionHint}
                </div>
              )}

              {/* Output */}
              {output && (
                <div className="border-t" style={{ borderColor: "var(--border)" }}>
                  <div
                    className="flex items-center gap-2 px-4 py-2 border-b text-[10px] uppercase tracking-widest"
                    style={{ borderColor: "var(--border)", color: status === "pass" ? "var(--check)" : "#dc2626", fontFamily: "var(--font-mono)", background: "var(--bg2)" }}
                  >
                    <span>{status === "pass" ? "✓" : "✗"}</span>
                    <span>{status === "pass" ? "Tests passed" : "Error"}</span>
                  </div>
                  <pre
                    className="px-4 py-3 text-xs whitespace-pre-wrap overflow-auto"
                    style={{ color: status === "pass" ? "var(--check)" : "#dc2626", background: "var(--bg)", maxHeight: "10rem" }}
                  >
                    {output}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: leaderboard */}
        <div className="flex flex-col gap-5">
          <div
            className="v2-rise p-5 rounded-xl border"
            style={{ borderColor: "var(--border2)", background: "var(--card)" }}
          >
            <div className="text-xs font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
              This Week&apos;s Leaderboard
            </div>
            <div className="flex flex-col gap-2.5">
              {LEADERBOARD.map((entry) => (
                <div key={entry.rank} className="flex items-center gap-3 text-xs">
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", width: "1.2rem" }}>
                    {entry.badge || `#${entry.rank}`}
                  </span>
                  <span className="flex-1" style={{ color: "var(--fg)" }}>{entry.name}</span>
                  <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{entry.time}</span>
                  <span style={{ color: "#fbbf24", fontFamily: "var(--font-mono)" }}>+{entry.xp}</span>
                </div>
              ))}
            </div>
            {!isPro && (
              <div
                className="mt-4 pt-4 border-t text-xs text-center"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                <a
                  href={process.env.NEXT_PUBLIC_STRIPE_PRO_LINK ?? "/sign-up"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackUpgradeClick("challenges_leaderboard")}
                  className="underline underline-offset-4 transition-opacity hover:opacity-75"
                  style={{ color: "var(--grass)" }}
                >
                  Upgrade to compete →
                </a>
              </div>
            )}
          </div>

          {/* Archive teaser */}
          <div
            className="v2-rise p-5 rounded-xl border"
            style={{ borderColor: "var(--border2)", background: "var(--card)" }}
          >
            <div className="text-xs font-semibold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
              Challenge Archive
            </div>
            <div className="flex flex-col gap-2 text-xs" style={{ color: "var(--muted)" }}>
              <div className="flex items-center justify-between">
                <span>Vega Surface</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--grass)" }}>✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Put-Call Arbitrage</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>—</span>
              </div>
              <div className="flex items-center justify-between">
                <span>American Put Tree</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>—</span>
              </div>
            </div>
            {!isPro && (
              <p className="mt-3 text-[10px]" style={{ color: "var(--muted2)" }}>
                Pro members access all past challenges.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
