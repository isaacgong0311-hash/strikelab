import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/roadmap",
  title: "Roadmap",
  description:
    "What's shipping next on StrikeLab — the paper-trading sandbox, school dashboards, certificates, and Discord integration.",
});

const ROADMAP = [
  {
    quarter: "Q2 2026",
    label: "Shipped",
    color: "#16a34a",
    items: [
      { title: "Lessons 8–10 shipped ✓", state: "done", desc: "Implied Volatility (Newton-Raphson IV solver), Option Strategies (spreads, straddles, iron condor), and Binomial Trees (CRR, American options) all live." },
      { title: "Weekly coding challenges ✓", state: "done", desc: "Time-boxed problems scored on correctness + elegance — quant interview prep, gamified. Live on the Challenges page." },
      { title: "Mobile-responsive layout", state: "in-progress", desc: "All lessons + playground fully usable on phone." },
    ],
  },
  {
    quarter: "Q3 2026",
    label: "Shipping now",
    color: "#16a34a",
    items: [
      { title: "Paper-trading sandbox", state: "in-progress", desc: "Real (delayed) option chains via Polygon.io free tier." },
      { title: "Rho lesson", state: "planned", desc: "The interest-rate Greek. How rate changes move long-dated options." },
      { title: "Achievement system", state: "planned", desc: "Badges for completing tracks, perfect Greek scores, streak milestones." },
      { title: "Interactive payoff diagrams", state: "planned", desc: "Drag-to-build strategy payoff charts directly in the lesson UI." },
      { title: "Binomial tree visualizer", state: "planned", desc: "Interactive lattice diagram — click any node to inspect the early-exercise decision." },
    ],
  },
  {
    quarter: "Q4 2026",
    label: "Next up",
    color: "#2f6df0",
    items: [
      { title: "Certificates of completion", state: "planned", desc: "Shareable on LinkedIn. Verifiable on-chain (optional)." },
      { title: "Teacher dashboard (School plan)", state: "planned", desc: "Class progress, assignment grading, curriculum alignment." },
      { title: "Discord integration", state: "planned", desc: "Auto-post lesson completions and achievements to school CS/math clubs." },
      { title: "Lesson 9–11: VaR, GARCH, Monte Carlo", state: "planned", desc: "Bridge to quant research and risk." },
    ],
  },
  {
    quarter: "2027",
    label: "Long term",
    color: "#646464",
    items: [
      { title: "Live equity sandbox", state: "exploring", desc: "Multi-asset support — futures, FX, fixed income basics." },
      { title: "Quant interview prep track", state: "exploring", desc: "Brain teasers, probability puzzles, market-making intuition drills." },
      { title: "College-app portfolio builder", state: "exploring", desc: "Bundle your StrikeLab work into an admissions-ready artifact." },
      { title: "iOS / Android apps", state: "exploring", desc: "Offline lesson sync, mobile-native playground." },
    ],
  },
];

const STATE_STYLES = {
  "done":        { label: "Shipped",     color: "#16a34a" },
  "in-progress": { label: "In progress", color: "#2f6df0" },
  "planned":     { label: "Planned",     color: "#646464" },
  "exploring":   { label: "Exploring",   color: "#848484" },
};

export default function RoadmapPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14">

      {/* Header */}
      <div className="mb-10">
        <Eyebrow>Roadmap</Eyebrow>
        <h1
          className="text-4xl font-semibold mb-3 leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          What we&rsquo;re building next
        </h1>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--muted2)" }}>
          Public, opinionated roadmap. Updates monthly. We commit to current-quarter
          items, plan the next, and explore further out. Vote for what you want most
          via{" "}
          <a
            href="https://github.com/isaacgong0311-hash/strikelab/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white transition-colors"
            style={{ color: "var(--accent2)" }}
          >
            GitHub Discussions
          </a>
          .
        </p>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-3 mb-10 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
        {Object.entries(STATE_STYLES).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: v.color }}
            />
            <span
              className="text-xs"
              style={{ color: "var(--muted2)", fontFamily: "var(--font-mono)" }}
            >
              {v.label}
            </span>
          </div>
        ))}
      </div>

      {/* Roadmap quarters */}
      <div className="flex flex-col gap-10">
        {ROADMAP.map((q) => (
          <div key={q.quarter}>
            <div className="flex items-baseline gap-4 mb-4">
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-mono)", color: q.color }}
              >
                {q.quarter}
              </div>
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: q.color, fontFamily: "var(--font-mono)", opacity: 0.75 }}
              >
                {q.label}
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "var(--border)" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.items.map((item) => {
                const ss = STATE_STYLES[item.state as keyof typeof STATE_STYLES];
                return (
                  <div
                    key={item.title}
                    className="p-4 rounded-xl border"
                    style={{ borderColor: "var(--border2)", background: "var(--card)" }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3
                        className="text-sm font-semibold"
                        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
                      >
                        {item.title}
                      </h3>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{
                          background: `${ss.color}22`,
                          color: ss.color,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {ss.label}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--muted2)" }}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Vote CTA */}
      <div
        className="mt-12 p-6 rounded-2xl border text-center"
        style={{ borderColor: "var(--border2)", background: "var(--bg2)" }}
      >
        <h2
          className="text-lg font-semibold text-white mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Have a feature request?
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted2)" }}>
          Open an issue on GitHub or join the discussion. We read everything.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="https://github.com/isaacgong0311-hash/strikelab/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: "var(--grass)", color: "#ffffff", borderRadius: "12px", boxShadow: "0 3px 0 var(--grass-d)", fontFamily: "var(--font-mono)" }}
          >
            Request feature →
          </a>
          <Link
            href="/about"
            className="px-5 py-2 rounded-lg text-sm border transition-all hover:border-white/40"
            style={{ borderColor: "var(--border2)", color: "var(--muted2)" }}
          >
            About the founder
          </Link>
        </div>
      </div>
    </div>
  );
}
