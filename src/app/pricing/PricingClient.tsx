"use client";
import { useState } from "react";
import Link from "next/link";
import { startCheckout } from "@/lib/useSubscription";
import { TRACKS } from "@/lib/tracks";
import Eyebrow from "@/components/Eyebrow";

const TOTAL_LESSONS = TRACKS.reduce((s, t) => s + t.lessons.length, 0);

const TIERS = [
  {
    name: "Student",
    price: "$0",
    period: "forever",
    desc: "Everything you need to learn options pricing.",
    cta: "Create Free Account",
    href: "/sign-up",
    action: "link" as const,
    popular: false,
    accent: "#16201c",
    features: [
      `All ${TOTAL_LESSONS} lessons`,
      "Browser-based Python playground (Pyodide)",
      "Live Greek visualizer (Δ, Γ, Θ, ν, ρ)",
      "Paper-trading sandbox ($100k simulated cash)",
      "Formula reference panel",
      "Progress tracking",
      "Classroom tools — create or join a class",
      "Open-source pricing engine",
      "Community Discord",
      "Achievements",
      "Certificate of completion",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/ month",
    desc: "For serious students prepping for quant interviews.",
    cta: "Start 7-Day Free Trial",
    href: "#",
    action: "stripe-pro" as const,
    popular: true,
    accent: "#147038",
    features: [
      "Everything in Student",
      "Weekly coding challenges + leaderboard",
      "Weekly office hours with the founder",
      "Priority email support",
      "Real-time market data via Polygon.io — coming soon",
    ],
  },
  {
    name: "School",
    price: "$499",
    period: "/ year",
    desc: "Site license for high school classrooms.",
    cta: "Contact Sales",
    href: "mailto:hello@strikelab.app",
    action: "link" as const,
    popular: false,
    accent: "#7c4dd4",
    features: [
      "Everything in Pro",
      "30 student seats included",
      "Curriculum alignment guide (AP Stats, AP Calc)",
      "Monthly teacher training calls",
      "SSO via Google Classroom — coming soon",
      "Volume discounts above 30 seats",
    ],
  },
];

const FAQ = [
  {
    q: "Is the free tier really free forever?",
    a: `Yes. All ${TOTAL_LESSONS} lessons, the Python playground, and the Greek visualizer stay free forever. We don't gate the educational core — the value-add tiers fund the platform.`,
  },
  {
    q: "What does the 7-day free trial include?",
    a: "Full access to everything currently live in Pro — weekly coding challenges, the leaderboard, office hours with the founder, and priority email support. No charge until the trial ends. Cancel anytime from the billing portal.",
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

export default function PricingClient() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleCheckout(plan: "pro" | "school") {
    setLoading(plan);
    setError("");
    try {
      await startCheckout(plan);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Try again.";
      // "Payments are not configured yet" is a permanent state until Stripe
      // is wired up, not a transient failure — give it its own honest copy
      // instead of the raw backend message.
      setError(
        msg === "Payments are not configured yet"
          ? "Online checkout isn't live yet."
          : msg,
      );
      setLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="text-center mb-12 v2-page-head" data-v2-head>
        <Eyebrow>Pricing</Eyebrow>
        <h1 className="text-4xl font-semibold mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
          Free forever for students.
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--ink-2)" }}>
          The core curriculum is and always will be free. Upgrade only if you want
          weekly coding challenges, office hours with the founder, or a license for your school.
        </p>
        {error && (
          <p className="mt-4 text-sm font-medium" style={{ color: "var(--coral)" }}>
            {error} — email hello@strikelab.app and we&apos;ll get you set up.
          </p>
        )}
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-16" data-v2-stagger>
        {TIERS.map((t) => (
          <div key={t.name} className="v2-rise relative p-6 rounded-2xl border flex flex-col"
            style={{
              borderColor: t.popular ? t.accent : "var(--line-2)",
              background: t.popular ? "var(--grass-tint)" : "var(--paper-2)",
              boxShadow: t.popular ? `0 0 0 1px ${t.accent}22` : "0 2px 0 var(--line)",
            }}>

            {t.popular && (
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ background: "var(--grass)", color: "#fff", fontFamily: "var(--font-mono)" }}>
                Most popular
              </div>
            )}

            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-1"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                {t.name}
              </h2>
              <p className="text-xs" style={{ color: "var(--ink-3)" }}>{t.desc}</p>
            </div>

            <div className="mb-5 flex items-baseline gap-1">
              <span className="text-4xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: t.accent }}>
                {t.price}
              </span>
              <span className="text-sm" style={{ color: "var(--ink-3)" }}>{t.period}</span>
            </div>

            {t.action === "stripe-pro" ? (
              <button
                onClick={() => handleCheckout("pro")}
                disabled={loading === "pro"}
                className="block text-center px-4 py-2.5 rounded-xl text-sm font-bold mb-5 transition-all disabled:opacity-60"
                style={{
                  background: "var(--grass)", color: "#fff",
                  boxShadow: "0 4px 0 var(--grass-d)",
                  fontFamily: "var(--font-ui), system-ui, sans-serif",
                }}
              >
                {loading === "pro" ? "Redirecting to Stripe…" : `${t.cta} →`}
              </button>
            ) : t.action === "link" && t.href.startsWith("mailto:") ? (
              <a href={t.href}
                className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold mb-5 transition-opacity hover:opacity-80"
                style={{ border: "1.5px solid var(--line-2)", color: "var(--ink-2)" }}>
                {t.cta} →
              </a>
            ) : (
              <Link href={t.href}
                className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold mb-5 transition-opacity hover:opacity-80"
                style={{ border: "1.5px solid var(--line-2)", color: "var(--ink-2)" }}>
                {t.cta} →
              </Link>
            )}

            <ul className="flex flex-col gap-2.5 mt-2">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "var(--ink-2)" }}>
                  <span className="flex-shrink-0 mt-0.5 font-bold" style={{ color: "var(--grass)", fontFamily: "var(--font-mono)" }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-5 text-center"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
          Pricing FAQ
        </h2>
        <div className="flex flex-col gap-3" data-v2-stagger>
          {FAQ.map((f) => (
            <div key={f.q} className="v2-rise p-4 rounded-xl border"
              style={{ borderColor: "var(--line-2)", background: "var(--paper-2)" }}>
              <div className="text-sm font-semibold mb-1.5"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
                {f.q}
              </div>
              <div className="text-xs leading-relaxed" style={{ color: "var(--ink-2)" }}>
                {f.a}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/faq" className="text-xs underline underline-offset-4 transition-opacity hover:opacity-75"
            style={{ color: "var(--grass)", fontFamily: "var(--font-mono)" }}>
            See all FAQs →
          </Link>
        </div>
      </div>
    </div>
  );
}
