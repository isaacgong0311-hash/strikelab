"use client";
import Link from "next/link";
import { LESSONS } from "@/lib/lessons";
import { useProgress } from "@/lib/useProgress";

const STREAK_DAYS = [0, 0, 0, 0, 0, 0, 0]; // fills in as user completes exercises

export default function DashboardClient() {
  const { completed, hydrated } = useProgress();
  const completedCount = hydrated ? LESSONS.filter((l) => completed.has(l.id)).length : 0;
  const nextLesson = hydrated
    ? LESSONS.find((l) => !completed.has(l.id)) ?? LESSONS[0]
    : LESSONS[0];
  const pct = (completedCount / LESSONS.length) * 100;

  const STATS = [
    { v: `${completedCount}`,                          l: "Lessons complete", color: "#22c55e" },
    { v: `${completedCount > 0 ? completedCount : 0}`, l: "Day streak",       color: "#fbbf24" },
    { v: `${completedCount}`,                          l: "Exercises passed", color: "#ffffff" },
    { v: completedCount > 0 ? "100%" : "—",           l: "Test accuracy",    color: "#a3a3a3" },
  ];

  const max = Math.max(...STREAK_DAYS, 1);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div
            className="text-[10px] tracking-widest uppercase mb-2 opacity-50"
            style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
          >
            Dashboard
          </div>
          <h1
            className="text-3xl font-semibold text-white mb-1"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            Welcome back, Isaac
          </h1>
          <p className="text-sm" style={{ color: "var(--muted2)" }}>
            {completedCount}/{LESSONS.length} lessons complete · keep going
          </p>
        </div>
        <Link
          href={`/lesson/${nextLesson.id}`}
          className="px-7 py-3.5 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #ffffff, #cccccc)",
            boxShadow: "0 8px 24px -8px rgba(255,255,255,0.5)",
          }}
        >
          Resume → {nextLesson.title}
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATS.map((s) => (
          <div
            key={s.l}
            className="p-4 rounded-xl border"
            style={{ borderColor: "var(--border2)", background: "var(--card)" }}
          >
            <div
              className="text-3xl font-bold leading-none mb-1.5"
              style={{ fontFamily: "var(--font-mono)", color: s.color }}
            >
              {s.v}
            </div>
            <div
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Progress + Streak chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {/* Progress card */}
        <div
          className="p-5 rounded-xl border"
          style={{ borderColor: "var(--border2)", background: "var(--card)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-sm font-semibold text-white"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
            >
              Curriculum progress
            </h2>
            <span
              className="text-xs"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
              {Math.round(pct)}%
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden mb-4"
            style={{ background: "var(--border2)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #ffffff, #a3a3a3)",
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            {LESSONS.slice(0, 5).map((l, i) => {
              const done = hydrated && completed.has(l.id);
              return (
                <Link
                  key={l.id}
                  href={`/lesson/${l.id}`}
                  className="flex items-center gap-2 text-xs py-1 transition-opacity hover:opacity-75"
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                    style={{
                      background: done ? "rgba(34,197,94,0.15)" : "rgba(100,116,139,0.15)",
                      color: done ? "#4ade80" : "var(--muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span style={{ color: done ? "var(--muted2)" : "#cbd5e1" }}>
                    {l.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Streak chart */}
        <div
          className="p-5 rounded-xl border"
          style={{ borderColor: "var(--border2)", background: "var(--card)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-sm font-semibold text-white"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
            >
              Last 7 days
            </h2>
            <span
              className="text-xs"
              style={{ color: "#fbbf24", fontFamily: "var(--font-mono)" }}
            >
              {completedCount > 0 ? `🔥 ${completedCount}-lesson streak` : "Start your streak"}
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 h-24 mb-3">
            {STREAK_DAYS.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${(v / max) * 100}%`,
                      background:
                        i === STREAK_DAYS.length - 1
                          ? "linear-gradient(180deg, #a3a3a3, #ffffff)"
                          : "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.15))",
                    }}
                  />
                </div>
                <span
                  className="text-[9px]"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                >
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            ))}
          </div>
          <div className="text-xs" style={{ color: "var(--muted2)" }}>
            Complete lessons to build your streak.
          </div>
        </div>
      </div>

      {/* Activity + Next lesson */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {/* Activity */}
        <div
          className="md:col-span-2 p-5 rounded-xl border"
          style={{ borderColor: "var(--border2)", background: "var(--card)" }}
        >
          <h2
            className="text-sm font-semibold text-white mb-3"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            Recent activity
          </h2>
          <div className="flex flex-col">
            {LESSONS.filter((l) => hydrated && completed.has(l.id)).length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: "var(--muted)" }}>
                No activity yet — complete your first lesson to see it here.
              </p>
            ) : (
              LESSONS.filter((l) => hydrated && completed.has(l.id)).slice().reverse().map((l) => (
                <div
                  key={l.id}
                  className="flex items-start gap-3 py-2 border-b last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                    style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", fontFamily: "var(--font-mono)" }}
                  >
                    ✓
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white">Completed {l.title}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                      This session
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Up next */}
        <div
          className="p-5 rounded-xl border flex flex-col"
          style={{
            borderColor: "rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <div
            className="text-[10px] tracking-widest uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "#a3a3a3" }}
          >
            Up next
          </div>
          <h3
            className="text-lg font-semibold text-white mb-1.5 leading-tight"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            {nextLesson.title}
          </h3>
          <p className="text-xs mb-4 flex-1" style={{ color: "var(--muted2)" }}>
            {nextLesson.subtitle}
          </p>
          <div className="flex items-center gap-2 mb-4 text-[11px]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            <span>{nextLesson.duration}</span>
            <span>·</span>
            <span>1 exercise</span>
          </div>
          <Link
            href={`/lesson/${nextLesson.id}`}
            className="block text-center px-4 py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #a3a3a3, #ffffff)" }}
          >
            Continue →
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Link
          href="/lessons"
          className="p-5 rounded-xl border transition-all hover:border-white/40 flex items-center gap-4 group"
          style={{ borderColor: "var(--border2)", background: "var(--card)" }}
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.10))",
              color: "var(--accent2)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ∂
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-white group-hover:text-white transition-colors" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
              All lessons
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted2)" }}>
              Browse the full curriculum
            </div>
          </div>
          <span className="text-xl flex-shrink-0" style={{ color: "var(--muted)" }}>›</span>
        </Link>

        <Link
          href="/playground"
          className="p-5 rounded-xl border transition-all hover:border-white/40 flex items-center gap-4 group"
          style={{ borderColor: "var(--border2)", background: "var(--card)" }}
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.10))",
              color: "#a78bfa",
              fontFamily: "var(--font-mono)",
            }}
          >
            ⚡
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-white group-hover:text-white transition-colors" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
              Playground
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted2)" }}>
              Full Greek sandbox with live charts
            </div>
          </div>
          <span className="text-xl flex-shrink-0" style={{ color: "var(--muted)" }}>›</span>
        </Link>

        <Link
          href="/roadmap"
          className="p-5 rounded-xl border transition-all hover:border-white/40 flex items-center gap-4 group"
          style={{ borderColor: "var(--border2)", background: "var(--card)" }}
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(255,255,255,0.10))",
              color: "#22c55e",
              fontFamily: "var(--font-mono)",
            }}
          >
            ◈
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-white group-hover:text-white transition-colors" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
              Roadmap
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted2)" }}>
              What&rsquo;s shipping next
            </div>
          </div>
          <span className="text-xl flex-shrink-0" style={{ color: "var(--muted)" }}>›</span>
        </Link>
      </div>

    </div>
  );
}
