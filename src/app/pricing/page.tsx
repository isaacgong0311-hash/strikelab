import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — StrikeLab",
  description: "Free forever for students. Pro for cohorts. School licenses for classrooms.",
};

const PRO_LINK    = process.env.NEXT_PUBLIC_STRIPE_PRO_LINK    ?? "/sign-up";
const SCHOOL_LINK = process.env.NEXT_PUBLIC_STRIPE_SCHOOL_LINK ?? "mailto:hello@strikelab.app";

const TIERS = [
  {
    name: "Student",
    price: "$0",
    period: "forever",
    desc: "Everything you need to learn options pricing.",
    cta: "Create Free Account",
    href: "/sign-up",
    external: false,
    popular: false,
    accent: "#ffffff",
    features: [
      "All 10 lessons",
      "Browser-based Python playground (Pyodide)",
      "Live Greek visualizer (Δ, Γ, Θ, ν, ρ)",
      "Formula reference panel",
      "Progress tracking",
      "Open-source pricing engine",
      "Community Discord",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/ month",
    desc: "For serious students prepping for quant interviews.",
    cta: "Start 7-Day Free Trial",
    href: PRO_LINK,
    external: true,
    popular: true,
    accent: "#a3a3a3",
    features: [
      "Everything in Student",
      "Weekly coding challenges + achievements",
      "Paper trading sandbox with live option chains",
      "Advanced lessons (IV, strategies, binomial trees)",
      "Real-time market data via Polygon.io",
      "Weekly office hours with the founder",
      "Certificate of completion",
      "Priority email support",
    ],
  },
  {
    name: "School",
    price: "$499",
    period: "/ year",
    desc: "Site license for high school classrooms.",
    cta: "Contact Sales",
    href: SCHOOL_LINK,
    external: true,
    popular: false,
    accent: "#a78bfa",
    features: [
      "Everything in Pro",
      "30 student seats included",
      "Teacher admin dashboard",
      "Class progress reports",
      "Curriculum alignment guide (AP Stats, AP Calc)",
      "Class progress analytics",
      "Monthly teacher training calls",
      "SSO via Google Classroom",
      "Volume discounts above 30 seats",
    ],
  },
];

const FAQ = [
  {
    q: "Is the free tier really free forever?",
    a: "Yes. All 10 lessons, the Python playground, and the Greek visualizer stay free forever. We don't gate the educational core — the value-add tiers fund the platform.",
  },
  {
    q: "What ages is StrikeLab for?",
    a: "Designed for ages 13–18, but most users are 15–17. The math expects pre-calc + basic statistics. No prior finance background is assumed.",
  },
  {
    q: "Can my school cover the Pro tier for me?",
    a: "Yes — many do. Forward your math or CS teacher our School plan and we'll handle the rest. Volume discounts kick in at 30+ seats.",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-14">

      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="text-[10px] tracking-widest uppercase mb-2 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
        >
          Pricing
        </div>
        <h1
          className="text-4xl font-semibold text-white mb-3"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Free forever for students.
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--muted2)" }}>
          The core curriculum is and always will be free. Upgrade only if you want
          live market data, cohort competition, or a license for your school.
        </p>
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-16">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className="relative p-6 rounded-2xl border flex flex-col"
            style={{
              borderColor: t.popular ? t.accent : "var(--border2)",
              background: t.popular ? "rgba(255,255,255,0.04)" : "var(--card)",
              boxShadow: t.popular ? `0 0 0 1px ${t.accent}` : "none",
            }}
          >
            {t.popular && (
              <div
                className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white"
                style={{
                  background: `linear-gradient(135deg, ${t.accent}, #ffffff)`,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Most popular
              </div>
            )}

            <div className="mb-4">
              <h2
                className="text-2xl font-semibold text-white mb-1"
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
              >
                {t.name}
              </h2>
              <p className="text-xs" style={{ color: "var(--muted2)" }}>{t.desc}</p>
            </div>

            <div className="mb-5 flex items-baseline gap-1">
              <span
                className="text-4xl font-bold"
                style={{ fontFamily: "var(--font-mono)", color: t.accent }}
              >
                {t.price}
              </span>
              <span className="text-sm" style={{ color: "var(--muted)" }}>{t.period}</span>
            </div>

            {t.external ? (
              <a
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold mb-5 transition-opacity hover:opacity-90"
                style={
                  t.popular
                    ? { background: `linear-gradient(135deg, ${t.accent}, #ffffff)`, color: "#fff" }
                    : { border: "1px solid var(--border2)", color: "var(--muted2)" }
                }
              >
                {t.cta} →
              </a>
            ) : (
              <Link
                href={t.href}
                className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold mb-5 transition-opacity hover:opacity-90"
                style={
                  t.popular
                    ? { background: `linear-gradient(135deg, ${t.accent}, #ffffff)`, color: "#fff" }
                    : { border: "1px solid var(--border2)", color: "var(--muted2)" }
                }
              >
                {t.cta} →
              </Link>
            )}

            <ul className="flex flex-col gap-2.5 mt-2">
              {t.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-xs"
                  style={{ color: "var(--muted2)" }}
                >
                  <span
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: t.accent, fontFamily: "var(--font-mono)" }}
                  >
                    ✓
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Comparison strip */}
      <div
        className="mb-16 p-6 rounded-xl border"
        style={{ borderColor: "var(--border2)", background: "var(--bg2)" }}
      >
        <div
          className="text-[10px] tracking-widest uppercase mb-3 opacity-50"
          style={{ fontFamily: "var(--font-mono)", color: "#888888" }}
        >
          How we compare
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {[
            { name: "StrikeLab",        price: "Free",     covers: "Options pricing, Greeks, code", highlight: true },
            { name: "Wharton WGHS",     price: "Free",     covers: "Equities only, simulator" },
            { name: "Coursera Quant",   price: "$49/mo",   covers: "Grad-level, video lectures" },
            { name: "Textbooks",        price: "$80+",     covers: "Theory, no code" },
          ].map((c) => (
            <div
              key={c.name}
              className="p-3 rounded-lg border"
              style={{
                borderColor: c.highlight ? "var(--accent)" : "var(--border)",
                background: c.highlight ? "rgba(255,255,255,0.06)" : "transparent",
              }}
            >
              <div
                className="text-sm font-semibold mb-1"
                style={{ color: c.highlight ? "var(--accent2)" : "#cbd5e1" }}
              >
                {c.name}
              </div>
              <div
                className="text-xs mb-1.5"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                {c.price}
              </div>
              <div className="text-xs" style={{ color: "var(--muted2)" }}>
                {c.covers}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2
          className="text-xl font-semibold text-white mb-5 text-center"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          Pricing FAQ
        </h2>
        <div className="flex flex-col gap-3">
          {FAQ.map((f) => (
            <div
              key={f.q}
              className="p-4 rounded-xl border"
              style={{ borderColor: "var(--border2)", background: "var(--card)" }}
            >
              <div
                className="text-sm font-semibold text-white mb-1.5"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {f.q}
              </div>
              <div className="text-xs leading-relaxed" style={{ color: "var(--muted2)" }}>
                {f.a}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/faq"
            className="text-xs underline underline-offset-4 transition-opacity hover:opacity-75"
            style={{ color: "var(--accent2)", fontFamily: "var(--font-mono)" }}
          >
            See all FAQs →
          </Link>
        </div>
      </div>
    </div>
  );
}
