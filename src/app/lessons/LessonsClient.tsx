"use client";
import Link from "next/link";
import { TRACKS } from "@/lib/curriculum";
import { useProgress } from "@/lib/useProgress";

const LESSON_TAGS: Record<string, string[]> = {
  "fund-1": ["stocks", "ownership", "dividends", "market cap"],
  "fund-2": ["order book", "bid-ask", "liquidity", "circuit breakers"],
  "fund-3": ["diversification", "correlation", "asset allocation", "index funds"],
  "fund-4": ["P/E ratio", "DCF", "valuation", "intrinsic value"],
  "fund-5": ["Sharpe ratio", "volatility", "beta", "efficient frontier"],
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-14">
        <div
          className="text-[10px] tracking-widest uppercase mb-2 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
        >
          Curriculum
        </div>
        <h1
          className="text-4xl font-semibold text-white mb-3 leading-tight"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Choose your path
        </h1>
        <p className="text-base leading-relaxed max-w-2xl" style={{ color: "var(--muted2)" }}>
          Start with <strong>Investing Fundamentals</strong> to master stocks, markets, and diversification. 
          Then dive into <strong>Options Pricing</strong> for advanced derivatives and quant trading intuition.
        </p>
      </div>

      {/* ── Tracks ──────────────────────────────────────────────────────── */}
      <div className="space-y-16">
        {TRACKS.map((track) => {
          const trackLessons = track.lessons;
          const completedCount = trackLessons.filter((l) => completed.has(l.id)).length;

          return (
            <div key={track.id}>
              {/* Track header */}
              <div className="mb-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{track.icon}</span>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{track.name}</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--muted2)" }}>
                      {track.description}
                    </p>
                  </div>
                </div>

                {/* Track progress */}
                {hydrated && (
                  <div className="flex items-center gap-3 mt-4">
                    <div
                      className="flex-1 h-1 rounded-full overflow-hidden"
                      style={{ background: "var(--border2)", maxWidth: "200px" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(completedCount / trackLessons.length) * 100}%`,
                          background: `linear-gradient(90deg, ${track.color}dd, ${track.color}aa)`,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs flex-shrink-0 tabular-nums"
                      style={{ color: "var(--muted2)", fontFamily: "var(--font-mono)" }}
                    >
                      {completedCount} / {trackLessons.length} complete
                    </span>
                  </div>
                )}
              </div>

              {/* Lessons grid */}
              <div className="flex flex-col gap-2">
                {trackLessons.map((lesson, i) => {
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
                            : `${track.color}15`,
                          color: done ? "#4ade80" : track.color,
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
            </div>
          );
        })}
      </div>

      {/* ── Playground callout ──────────────────────────────────────────── */}
      <div
        className="mt-16 px-4 py-3 rounded-xl border text-sm flex items-start gap-3"
        style={{
          borderColor: "rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.04)",
          color: "#ffffff",
        }}
      >
        <span className="text-base flex-shrink-0 leading-none mt-0.5">⚡</span>
        <span>
          After completing the <strong>Options Pricing</strong> track, head to the{" "}
          <Link
            href="/playground"
            className="underline underline-offset-2 hover:text-white transition-colors font-semibold"
          >
            Playground
          </Link>{" "}
          to implement all five Greeks in the full pricing engine and watch the curves update live.
        </span>
      </div>
    </div>
  );
}
