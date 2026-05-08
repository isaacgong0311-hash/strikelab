import Link from "next/link";
import { LESSONS } from "@/lib/lessons";

export const metadata = { title: "Lessons — StrikeLab" };

export default function LessonsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
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
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Five focused lessons. Each one ends with a coding exercise that runs in your browser.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {LESSONS.map((lesson, i) => (
          <Link
            key={lesson.id}
            href={`/lesson/${lesson.id}`}
            className="flex items-center gap-5 p-5 rounded-xl border transition-colors group"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            {/* Number */}
            <div
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{
                background: "rgba(59,130,246,0.12)",
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {i + 1}
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

            <div
              className="text-xs flex-shrink-0"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
              {lesson.duration}
            </div>
            <div style={{ color: "var(--muted)" }}>›</div>
          </Link>
        ))}
      </div>

      <div
        className="mt-8 p-4 rounded-xl border text-sm"
        style={{ borderColor: "var(--border)", background: "rgba(6,182,212,0.04)", color: "#67e8f9" }}
      >
        After Lesson 4 (Delta), head to the{" "}
        <Link href="/playground" className="underline underline-offset-2 hover:text-white transition-colors">
          Playground
        </Link>{" "}
        to implement all four Greeks in the full pricing engine and watch the curves update live.
      </div>
    </div>
  );
}
