"use client";
import Link from "next/link";
import { LESSONS, COMING_SOON } from "@/lib/lessons";
import { useProgress } from "@/lib/useProgress";

export default function LessonsClient() {
  const { completed, hydrated } = useProgress();
  const completedCount = LESSONS.filter((l) => completed.has(l.id)).length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="mb-10">
        <div
          className="text-xs tracking-widest uppercase mb-3 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#93c5fd" }}
        >
          Curriculum
        </div>
        <h1
          className="text-3xl font-semibold text-white mb-2"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Options Pricing — Lesson Track
        </h1>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          Five focused lessons. Each one ends with a coding exercise that runs in your browser.
        </p>

        {/* Progress bar */}
        {hydrated && (
          <div className="flex items-center gap-3">
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / LESSONS.length) * 100}%`,
                  background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
                }}
              />
            </div>
            <span
              className="text-xs flex-shrink-0"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
              {completedCount} / {LESSONS.length} complete
            </span>
          </div>
        )}
      </div>

      {/* Active lessons */}
      <div className="flex flex-col gap-3 mb-10">
        {LESSONS.map((lesson, i) => {
          const done = hydrated && completed.has(lesson.id);
          return (
            <Link
              key={lesson.id}
              href={`/lesson/${lesson.id}`}
              className="flex items-center gap-5 p-5 rounded-xl border transition-colors group"
              style={{ borderColor: done ? "rgba(34,197,94,0.3)" : "var(--border)", background: "var(--card)" }}
            >
              {/* Number / check */}
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  background: done ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.12)",
                  color: done ? "#86efac" : "var(--accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {done ? "✓" : i + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="font-semibold text-white group-hover:text-blue-300 transition-colors text-base"
                  style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
                >
                  {lesson.title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {lesson.subtitle}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {done && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(34,197,94,0.12)",
                      color: "#86efac",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    done
                  </span>
                )}
                <div
                  className="text-xs"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                >
                  {lesson.duration}
                </div>
                <div style={{ color: "var(--muted)" }}>›</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Playground callout */}
      <div
        className="mb-10 p-4 rounded-xl border text-sm"
        style={{ borderColor: "var(--border)", background: "rgba(6,182,212,0.04)", color: "#67e8f9" }}
      >
        After the lessons, head to the{" "}
        <Link href="/playground" className="underline underline-offset-2 hover:text-white transition-colors">
          Playground
        </Link>{" "}
        to implement all four Greeks in the full pricing engine and watch the curves update live.
      </div>

      {/* Coming soon */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="text-xs tracking-widest uppercase opacity-40"
            style={{ fontFamily: "var(--font-mono)", color: "#93c5fd" }}
          >
            Coming soon
          </div>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <div className="flex flex-col gap-2">
          {COMING_SOON.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-5 p-5 rounded-xl border opacity-50 cursor-not-allowed select-none"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  background: "rgba(100,116,139,0.15)",
                  color: "#64748b",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {lesson.symbol}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="font-semibold text-white text-base"
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
                  className="text-xs px-2 py-0.5 rounded border"
                  style={{
                    borderColor: "var(--border)",
                    color: "#475569",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  soon
                </span>
                <div
                  className="text-xs"
                  style={{ color: "#475569", fontFamily: "var(--font-mono)" }}
                >
                  {lesson.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
