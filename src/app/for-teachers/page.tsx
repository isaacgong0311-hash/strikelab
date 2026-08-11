import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { TRACKS } from "@/lib/tracks";

export const metadata = pageMetadata({
  path: "/for-teachers",
  title: "For Teachers",
  description:
    "Free curriculum a math or CS teacher can assign directly — AP Stats, AP Calc, and AMC/AIME-aligned lessons on options pricing and quant finance.",
});

// One unit-planning paragraph per track — what a teacher would actually tell
// a department chair about how this slots into an existing course, not just
// "here's a link." Kept next to TRACKS.map rather than duplicating track
// titles/ids by hand, so this stays correct if a track is ever renamed.
const CLASSROOM_NOTES: Record<string, string> = {
  investing:
    "Works as a 1-2 week unit in any personal finance or economics elective — stocks, financial statements, valuation, bonds, and retirement accounts, each with a short interactive exercise. No coding background assumed; the only math is arithmetic and percentages, so it's usable well below AP level.",
  options:
    "The closest fit for AP Statistics (probability distributions, expected value) and AP Calculus AB/BC (derivatives — every Greek is literally a partial derivative of the Black-Scholes formula). Assign it as an applied-math capstone: students derive the formula, then implement it in Python and watch the curves move.",
  quant:
    "Best suited to a AMC/AIME-track student working independently, or a CS/stats elective with room for a short project — CAPM, backtesting, and portfolio optimization each stand alone and don't require finishing the other two.",
};

const AP_ALIGNMENT = [
  {
    course: "AP Statistics",
    detail:
      "Probability distributions and expected value show up directly in implied volatility and the Black-Scholes formula's use of the normal CDF. CAPM and beta (Quant Investing) are a real-world regression example — literally the slope of a scatter plot of returns.",
  },
  {
    course: "AP Calculus AB/BC",
    detail:
      "The five option Greeks are partial derivatives of one function (Black-Scholes) with respect to each of its five inputs. It's one of the more concrete applications of derivatives a calc student will see outside a physics class.",
  },
  {
    course: "AMC/AIME preparation",
    detail:
      "The curriculum was built for a AIME-qualifier audience and doesn't dumb down the math — but it also doesn't assume a finance background. Strong problem-solvers who already like math tend to move through it quickly.",
  },
];

export default function ForTeachersPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <JsonLd data={breadcrumbJsonLd([{ name: "For Teachers", path: "/for-teachers" }])} />
      <Breadcrumbs trail={[{ name: "For Teachers", path: "/for-teachers" }]} />

      <div className="mb-10 v2-page-head" data-v2-head>
        <Eyebrow>For Teachers</Eyebrow>
        <h1
          className="text-4xl font-semibold mb-3 leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Free curriculum you can assign this week
        </h1>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--muted2)" }}>
          StrikeLab is free for every student, with no login required to read a lesson.
          Assign a single lesson as homework, a full track as a unit, or point strong
          students at it independently — it&rsquo;s built to work at any of those scales.
        </p>
      </div>

      <h2
        className="text-xl font-semibold mb-4"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Curriculum alignment
      </h2>
      <div className="flex flex-col gap-4 mb-12">
        {AP_ALIGNMENT.map((a) => (
          <div key={a.course} className="p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>{a.course}</div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted2)" }}>{a.detail}</p>
          </div>
        ))}
      </div>

      <h2
        className="text-xl font-semibold mb-4"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        How each track fits into a course
      </h2>
      <div className="flex flex-col gap-4 mb-12">
        {TRACKS.map((t) => (
          <div key={t.id} className="p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-baseline gap-2 mb-1">
              <span style={{ color: t.color }}>{t.icon}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{t.title}</span>
              <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                {t.lessons.length} lessons · {t.level}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted2)" }}>
              {CLASSROOM_NOTES[t.id]}
            </p>
          </div>
        ))}
      </div>

      {/* Testimonials — placeholder copy, ready to swap for real quotes once
          we have them. Structure (name, role, school) is set so this is a
          content edit, not a rebuild, when quotes come in. */}
      <h2
        className="text-xl font-semibold mb-4"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        What teachers say
      </h2>
      <div
        className="p-5 rounded-lg border mb-12 text-sm"
        style={{ borderColor: "var(--border)", color: "var(--muted2)", fontStyle: "italic" }}
      >
        We haven&rsquo;t published teacher testimonials yet — this section is reserved for
        them. If you&rsquo;ve used StrikeLab in a class, we&rsquo;d genuinely like to hear
        about it: <a href="mailto:hello@strikelab.app" style={{ color: "var(--grass)", fontStyle: "normal" }}>hello@strikelab.app</a>.
      </div>

      <div className="p-6 rounded-lg border text-center" style={{ borderColor: "var(--border)", background: "var(--bg2)" }}>
        <p className="text-sm mb-4" style={{ color: "var(--muted2)" }}>
          Need a site license for a whole classroom — rostering, a curriculum guide, and
          training calls included?
        </p>
        <Link
          href="/for-schools"
          className="text-sm px-4 py-2 font-medium transition-colors hover:opacity-80"
          style={{ background: "var(--grass)", color: "#fff", fontFamily: "var(--font-mono)", borderRadius: 10, boxShadow: "0 3px 0 var(--grass-d)" }}
        >
          See the School plan →
        </Link>
      </div>
    </div>
  );
}
