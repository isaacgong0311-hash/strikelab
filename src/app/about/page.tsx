import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Why a high school freshman and AIME qualifier built a quant finance platform for high schoolers.",
};

const TIMELINE = [
  { date: "Nov 2025", event: "First commit. Black-Scholes engine in Python.", state: "done" },
  { date: "Dec 2025", event: "First lesson written. Pyodide playground prototype.", state: "done" },
  { date: "Jan 2026", event: "Lessons 1–5 published. Soft launch on AoPS forums.", state: "done" },
  { date: "Feb 2026", event: "Lessons 6 (Gamma) and 7 (Vega) added. Greek visualizer ships.", state: "done" },
  { date: "Mar 2026", event: "Public launch. Shared on AoPS and math competition forums.", state: "done" },
  { date: "May 2026", event: "Lessons 8–10: Implied Vol, Option Strategies, Binomial Trees. 10-lesson curriculum complete.", state: "current" },
  { date: "Q3 2026", event: "Paper-trading sandbox + weekly cohort challenges.", state: "next" },
  { date: "Q4 2026", event: "School dashboard, certificates, Discord integration.", state: "planned" },
];

const VALUES = [
  {
    icon: "∂",
    title: "Build to learn",
    body: "We don't teach passively. Every concept ends with a function you implement, a test you pass, a curve you can move.",
  },
  {
    icon: "⊕",
    title: "Open by default",
    body: "The pricing engine is on GitHub. The curriculum is free forever. Gatekeeping is what we're fighting.",
  },
  {
    icon: "∑",
    title: "Math is the floor",
    body: "Built for students who already love AMC / AIME math. We trust you to handle the rigor — and we reward you for it.",
  },
];

const PRESS = [
  "AoPS forum launch thread (March 2026)",
  "10-lesson curriculum shipped (May 2026)",
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14">

      {/* Hero */}
      <div className="v2-page-head mb-14" data-v2-head style={{ padding: 0, border: 0 }}>
        <div
          className="text-[10px] tracking-widest uppercase mb-2 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
        >
          About
        </div>
        <h1
          className="text-4xl font-semibold text-[#16201c] mb-5 leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Built by a high schooler<br />
          for{" "}
          <span className="not-italic font-bold text-[#16201c]">
            high schoolers.
          </span>
        </h1>
        <p className="text-base leading-relaxed max-w-2xl" style={{ color: "var(--muted2)" }}>
          StrikeLab started as a personal pricing engine — a way to actually understand
          what Black-Scholes does, not just stare at it on a textbook page. The platform
          you&rsquo;re looking at is the version I wish I&rsquo;d had a year ago.
        </p>
      </div>

      {/* Founder card */}
      <div
        className="v2-rise mb-14 rounded-2xl border p-6 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6"
        style={{ borderColor: "var(--border2)", background: "var(--card)" }}
      >
        {/* Photo placeholder */}
        <div
          className="aspect-square w-full max-w-[200px] rounded-xl flex items-center justify-center text-6xl border"
          style={{
            background: "linear-gradient(135deg, #0b1828, #1a2f5e)",
            borderColor: "var(--border2)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--grass)",
          }}
        >
          IG
        </div>
        <div>
          <div
            className="text-[10px] tracking-widest uppercase mb-1.5 opacity-50"
            style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
          >
            Founder
          </div>
          <h2
            className="text-2xl font-semibold text-[#16201c] mb-1"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            Isaac Gong
          </h2>
          <div className="text-xs mb-3" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            HS Freshman · AIME Qualifier · C++/Python/R/SQL
          </div>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--muted2)" }}>
            I qualified for AIME in 8th grade and immediately started looking for what came after.
            The honest answer was: a wall. Adult MOOCs assumed grad-level math.
            High school finance comps stopped at &ldquo;pick a stock.&rdquo; The good stuff
            was on Bloomberg terminals at hedge funds I couldn&rsquo;t walk into.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted2)" }}>
            So I built the resource I needed. StrikeLab is a multi-year project — the pricing
            engine, the curriculum, and eventually a paper-trading sandbox with real market data.
            If you&rsquo;re a student staring at the same wall, this is for you.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="v2-rise mb-14">
        <div
          className="text-[10px] tracking-widest uppercase mb-2 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
        >
          Mission
        </div>
        <h2
          className="text-2xl font-semibold text-[#16201c] mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Quant finance shouldn&rsquo;t require the right zip code.
        </h2>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--muted2)" }}>
          Every year, thousands of motivated students at non-elite high schools never hear the
          word &ldquo;Black-Scholes&rdquo; until junior year of college — four years
          after the prep-school kids who learned it from family friends. That gap isn&rsquo;t about talent.
          It&rsquo;s about access. StrikeLab closes it.
        </p>
      </div>

      {/* Values */}
      <div className="mb-14">
        <div
          className="text-[10px] tracking-widest uppercase mb-2 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
        >
          Principles
        </div>
        <h2
          className="text-xl font-semibold text-[#16201c] mb-5"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          How we build
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-v2-stagger>
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="v2-rise p-5 rounded-xl border transition-colors hover:border-white/20"
              style={{ borderColor: "var(--border2)", background: "var(--card)" }}
            >
              <div
                className="text-2xl mb-3 leading-none"
                style={{ fontFamily: "var(--font-mono)", color: "var(--grass)" }}
              >
                {v.icon}
              </div>
              <h3
                className="font-semibold text-[#16201c] mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {v.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted2)" }}>
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-14">
        <div
          className="text-[10px] tracking-widest uppercase mb-2 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
        >
          Timeline
        </div>
        <h2
          className="text-xl font-semibold text-[#16201c] mb-5"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          What we&rsquo;ve shipped (and what&rsquo;s next)
        </h2>
        <div className="flex flex-col gap-0 relative" data-v2-stagger>
          <div
            className="absolute left-[14px] top-2 bottom-2 w-px"
            style={{ background: "var(--border2)" }}
          />
          {TIMELINE.map((t) => {
            const color =
              t.state === "done"     ? "#22c55e" :
              t.state === "current"  ? "#a3a3a3" :
              t.state === "next"     ? "#2f6df0" :
                                       "#475569";
            return (
              <div key={t.date} className="v2-rise flex items-start gap-4 py-2.5">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs relative z-10"
                  style={{
                    background: `${color}22`,
                    border: `1.5px solid ${color}`,
                    color,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {t.state === "done" ? "✓" : t.state === "current" ? "●" : "○"}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[11px] mb-0.5"
                    style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                  >
                    {t.date}
                  </div>
                  <div className="text-sm" style={{ color: "var(--ink-2)" }}>
                    {t.event}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Press */}
      <div className="v2-rise mb-14">
        <div
          className="text-[10px] tracking-widest uppercase mb-3 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
        >
          Press & Recognition
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESS.map((p) => (
            <span
              key={p}
              className="text-xs px-3 py-1.5 rounded-lg border"
              style={{
                borderColor: "var(--border2)",
                color: "var(--muted2)",
                background: "var(--card)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div
        className="v2-rise rounded-2xl border p-6 text-center"
        style={{ borderColor: "var(--border2)", background: "var(--bg2)" }}
      >
        <h2
          className="text-xl font-semibold text-[#16201c] mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Want to talk?
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted2)" }}>
          Press inquiries, school partnerships, or just want to say hi about the project.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="mailto:hello@strikelab.app"
            className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors hover:border-white/40"
            style={{ borderColor: "var(--border2)", color: "var(--fg)", background: "var(--card)" }}
          >
            hello@strikelab.app
          </a>
          <a
            href="https://github.com/isaacgong0311-hash/strikelab"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-lg text-sm border transition-all hover:border-white/40"
            style={{ borderColor: "var(--border2)", color: "var(--muted2)" }}
          >
            GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}
