import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";

export const metadata = {
  title: "Page not found",
  description: "This page doesn't exist. Find your way back to the lessons, dashboard, or homepage.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <Eyebrow className="mb-3">404</Eyebrow>
      <div
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "72px",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--grass)",
          lineHeight: 1,
          marginBottom: "8px",
        }}
      >
        ∄
      </div>
      <h1
        className="text-3xl font-semibold mb-3"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        This page doesn&rsquo;t exist.
      </h1>
      <p className="text-sm leading-relaxed mb-8 max-w-md mx-auto" style={{ color: "var(--ink-2)" }}>
        The link might be stale, or the URL got mistyped. Whatever happened, the
        curriculum&rsquo;s still exactly where you left it.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/lessons"
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
          style={{
            background: "var(--grass)",
            color: "#fff",
            boxShadow: "0 4px 0 var(--grass-d)",
            fontFamily: "var(--font-ui), system-ui, sans-serif",
          }}
        >
          Go to the learning path →
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ border: "1.5px solid var(--line-2)", color: "var(--ink-2)" }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
