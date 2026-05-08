import Link from "next/link";

const features = [
  {
    icon: "∂",
    title: "Interactive Curriculum",
    desc: "5 lessons from option basics to Black-Scholes, each ending with a coding exercise that runs in your browser.",
  },
  {
    icon: "∫",
    title: "Pricing Engine Playground",
    desc: "Fill in the missing functions of a real pricing engine. Run unit tests. Watch the Greek curves update live.",
  },
  {
    icon: "σ",
    title: "Real-Time Greek Charts",
    desc: "Visualise Δ, Γ, Θ, ν as functions of strike — sweep volatility, time, and rate with live sliders.",
  },
];

const greeks = [
  { sym: "Δ", name: "Delta",  desc: "Directional exposure" },
  { sym: "Γ", name: "Gamma",  desc: "Rate of delta change" },
  { sym: "Θ", name: "Theta",  desc: "Time decay" },
  { sym: "ν", name: "Vega",   desc: "Volatility sensitivity" },
  { sym: "ρ", name: "Rho",    desc: "Rate sensitivity" },
];

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(59,130,246,0.10) 0%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 border"
          style={{ borderColor: "var(--border)", color: "var(--accent2)", background: "var(--card)", fontFamily: "var(--font-mono)" }}
        >
          Free · Ages 13–18 · No Install Required
        </div>

        {/* Formula decoration */}
        <div
          className="text-sm mb-5 opacity-30 select-none"
          style={{ fontFamily: "var(--font-mono)", color: "#93c5fd", letterSpacing: "0.05em" }}
        >
          C = S·N(d₁) − K·e<sup>−rT</sup>·N(d₂)
        </div>

        {/* Main heading */}
        <h1
          className="text-5xl font-semibold leading-tight max-w-3xl mb-5"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Learn options pricing by{" "}
          <span
            className="not-italic font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #60a5fa, #06b6d4)" }}
          >
            building the engine
          </span>
        </h1>

        <p className="text-base max-w-xl mb-10 leading-relaxed" style={{ color: "#7fa8c9" }}>
          StrikeLab is the fastest path from &ldquo;what is a call option?&rdquo; to implementing
          Black-Scholes, computing the Greeks, and paper-trading live options chains — all in your browser.
        </p>

        <div className="flex gap-4">
          <Link
            href="/lessons"
            className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 text-sm"
            style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)", fontFamily: "var(--font-sans)" }}
          >
            Start Learning →
          </Link>
          <Link
            href="/playground"
            className="px-6 py-3 rounded-lg font-semibold border transition-colors hover:border-blue-500 text-sm"
            style={{ borderColor: "var(--border)", color: "var(--muted)", fontFamily: "var(--font-sans)" }}
          >
            Open Playground
          </Link>
        </div>
      </section>

      {/* ── Greeks row ────────────────────────────────────────────────────── */}
      <section className="flex justify-center gap-3 px-6 pb-12 flex-wrap">
        {greeks.map((g) => (
          <div
            key={g.name}
            className="px-5 py-3 rounded-lg border text-center min-w-[108px]"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <div
              className="text-2xl font-bold leading-none mb-1"
              style={{ fontFamily: "var(--font-mono)", color: "var(--accent2)" }}
            >
              {g.sym}
            </div>
            <div className="text-xs font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>
              {g.name}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-sans)" }}>
              {g.desc}
            </div>
          </div>
        ))}
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 rounded-xl border"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <div
              className="text-3xl font-light mb-4 leading-none"
              style={{ fontFamily: "var(--font-mono)", color: "var(--accent2)", opacity: 0.85 }}
            >
              {f.icon}
            </div>
            <h3
              className="font-semibold text-white mb-2 text-base"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        className="mx-auto mb-20 rounded-2xl p-12 text-center border max-w-2xl w-full px-6"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div
          className="text-xs mb-4 opacity-40 tracking-widest uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "#93c5fd" }}
        >
          Black-Scholes · The Greeks · Implied Volatility
        </div>
        <h2
          className="text-2xl font-semibold text-white mb-3"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Quant finance is gatekept. Not anymore.
        </h2>
        <p className="mb-7 text-sm leading-relaxed" style={{ color: "#7fa8c9" }}>
          Students at elite prep schools discover quant through alumni networks. Everyone else
          finds it in junior year of college — four years too late. StrikeLab fixes that.
        </p>
        <Link
          href="/lessons"
          className="px-8 py-3 rounded-lg font-semibold text-white inline-block transition-opacity hover:opacity-90 text-sm"
          style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }}
        >
          Start Lesson 1 — Free →
        </Link>
      </section>
    </div>
  );
}
