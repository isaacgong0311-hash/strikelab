"use client";
import Link from "next/link";
import { LESSONS, COMING_SOON } from "@/lib/lessons";
import { useProgress } from "@/lib/useProgress";

const LESSON_TAGS: Record<string, string[]> = {
  "1": ["calls & puts", "CBOE 1973", "intrinsic value", "moneyness"],
  "2": ["put-call parity", "no-arbitrage", "synthetic positions", "box spread"],
  "3": ["Black-Scholes 1973", "GBM", "risk-neutral pricing", "log-normal"],
  "4": ["Δ = N(d₁)", "delta hedging", "portfolio delta", "hedge ratio"],
  "5": ["time decay", "Θ–Γ tradeoff", "calendar spreads", "√T decay"],
  "6": ["Γ = n(d₁)/(S·σ·√T)", "gamma scalping", "0DTE", "pin risk"],
  "7": ["vol surface", "VIX", "variance premium", "vol smile / skew"],
};

export default function LessonsClient() {
  const { completed, hydrated } = useProgress();
  const completedCount = LESSONS.filter((l) => completed.has(l.id)).length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div
          className="text-[10px] tracking-widest uppercase mb-2 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
        >
          Curriculum
        </div>
        <h1
          className="text-3xl font-semibold text-white mb-1.5"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Options Pricing Track
        </h1>
        <p className="text-sm mb-4" style={{ color: "var(--muted2)" }}>
          Seven in-depth lessons covering options theory, the Greeks, and quantitative intuition —
          from Thales of Miletus to the Black-Scholes PDE. Each ends with a Python exercise that runs
          in your browser. No setup required.
        </p>

        {/* Progress bar + stats */}
        <div className="flex items-center gap-4">
          {hydrated && (
            <>
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--border2)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedCount / LESSONS.length) * 100}%`,
                    background: "linear-gradient(90deg, #ffffff, #a3a3a3)",
                  }}
                />
              </div>
              <span
                className="text-xs flex-shrink-0 tabular-nums"
                style={{ color: "var(--muted2)", fontFamily: "var(--font-mono)" }}
              >
                {completedCount} / {LESSONS.length} complete
              </span>
            </>
          )}
          {!hydrated && (
            <div
              className="flex-1 h-1.5 rounded-full"
              style={{ background: "var(--border2)" }}
            />
          )}
        </div>
      </div>

      {/* ── Active lessons ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 mb-8">
        {LESSONS.map((lesson, i) => {
          const done = hydrated && completed.has(lesson.id);
          const tags = LESSON_TAGS[lesson.id] ?? [];
          return (
            <Link
              key={lesson.id}
              href={`/lesson/${lesson.id}`}
              className="group flex items-start gap-4 p-4 rounded-xl border transition-all hover:border-white/30"
              style={{
                borderColor: done ? "rgba(34,197,94,0.25)" : "var(--border2)",
                background: "var(--card)",
              }}
            >
              {/* Number / check bubble */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                style={{
                  background: done
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(255,255,255,0.10)",
                  color: done ? "#4ade80" : "var(--accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {done ? "✓" : String(i + 1).padStart(2, "0")}
              </div>

              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span
                    className="font-semibold text-white group-hover:text-white transition-colors"
                    style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
                  >
                    {lesson.title}
                  </span>
                  {done && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(34,197,94,0.10)",
                        color: "#4ade80",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      done
                    </span>
                  )}
                </div>

                {/* Subtitle */}
                <div className="text-xs mb-1.5" style={{ color: "var(--muted2)" }}>
                  {lesson.subtitle}
                </div>

                {/* Topic tags */}
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded border"
                      style={{
                        borderColor: "var(--border2)",
                        color: "var(--muted2)",
                        background: "rgba(255,255,255,0.05)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                >
                  {lesson.duration}
                </span>
                <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>›</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Playground callout ──────────────────────────────────────────── */}
      <div
        className="mb-8 px-4 py-3 rounded-xl border text-sm flex items-start gap-3"
        style={{
          borderColor: "rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.04)",
          color: "#ffffff",
        }}
      >
        <span className="text-base flex-shrink-0 leading-none mt-0.5">⚡</span>
        <span>
          After the lessons, head to the{" "}
          <Link
            href="/playground"
            className="underline underline-offset-2 hover:text-white transition-colors font-semibold"
          >
            Playground
          </Link>{" "}
          to implement all five Greeks in the full pricing engine and watch the curves update live.
        </span>
      </div>

      {/* ── Coming soon ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="text-[10px] tracking-widest uppercase opacity-40"
            style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
          >
            Coming soon
          </div>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <div className="flex flex-col gap-1.5">
          {COMING_SOON.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border opacity-45 cursor-not-allowed select-none"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: "rgba(100,116,139,0.10)",
                  color: "#64748b",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {lesson.symbol}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
                >
                  {lesson.title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {lesson.subtitle}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="text-[10px] px-2 py-0.5 rounded border"
                  style={{
                    borderColor: "var(--border)",
                    color: "#475569",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  soon
                </span>
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: "#475569", fontFamily: "var(--font-mono)" }}
                >
                  {lesson.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
