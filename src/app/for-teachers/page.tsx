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

const FAQS = [
  {
    q: "How do I set up a class and get a join code?",
    a: "Create a free account, go to Settings → Classroom, and create a class — you'll get a join code immediately. Share it with students and they self-enroll; you don't need to add anyone by hand.",
  },
  {
    q: "Is there a cost for a single classroom?",
    a: "No. The full student curriculum, achievements, and certificates are free for every student, with no seat limit for a single teacher's roster. The paid School plan is only for districts that want a curriculum alignment guide and training calls across multiple classrooms — see the School plan for that.",
  },
  {
    q: "What student data do you collect?",
    a: "Only what's needed to track lesson progress and roster membership — no more than the free student tier collects on its own. See the full breakdown on our Privacy page.",
  },
  {
    q: "Does this align with AP Statistics or AP Calculus?",
    a: "Yes — see the curriculum alignment section above. Probability and expected value map to AP Stats; the option Greeks are partial derivatives, mapping directly to AP Calc AB/BC.",
  },
  {
    q: "Do students need to install anything?",
    a: "No. Everything, including the Python exercises, runs in the browser via Pyodide. There's nothing to install on school-managed devices.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
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
      <JsonLd data={FAQ_JSON_LD} />
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

      {/* Interim proof block — real stats and a founder note rather than an
          apology for missing testimonials. Swap for real teacher quotes once
          we have pilot-usage feedback to draw on. */}
      <div className="grid gap-4 mb-12" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {[
          [String(TRACKS.reduce((s, t) => s + t.lessons.length, 0)), "lessons across 3 tracks"],
          ["$0", "cost per student, ever"],
          ["1", "line to enroll a class — a join code"],
        ].map(([stat, label]) => (
          <div key={label} className="p-4 rounded-lg border text-center" style={{ borderColor: "var(--border)" }}>
            <div className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--grass)" }}>{stat}</div>
            <div className="text-xs" style={{ color: "var(--muted2)" }}>{label}</div>
          </div>
        ))}
      </div>
      <div
        className="p-5 rounded-lg border mb-12 text-sm leading-relaxed"
        style={{ borderColor: "var(--border)", color: "var(--muted2)" }}
      >
        StrikeLab is built and maintained by a high schooler, kept free and open-source so
        cost is never a reason a student can&rsquo;t use it. We haven&rsquo;t published
        teacher testimonials yet — if you&rsquo;ve assigned StrikeLab in a class, we&rsquo;d
        genuinely like to hear how it went:{" "}
        <a href="mailto:hello@strikelab.app" style={{ color: "var(--grass)" }}>hello@strikelab.app</a>.
      </div>

      <h2
        className="text-xl font-semibold mb-4"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Frequently asked questions
      </h2>
      <div className="flex flex-col gap-3 mb-12">
        {FAQS.map((item) => (
          <div key={item.q} className="p-4 rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm font-semibold mb-1.5" style={{ color: "var(--ink)" }}>{item.q}</div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted2)" }}>{item.a}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-lg border text-center" style={{ borderColor: "var(--border)", background: "var(--bg2)" }}>
        <p className="text-sm mb-4" style={{ color: "var(--muted2)" }}>
          Create a free account, then head to Settings → Classroom to make a class and get
          a join code — students see their roster progress at a glance, no site license
          required.
        </p>
        <Link
          href="/sign-up"
          className="text-sm px-4 py-2 font-medium transition-colors hover:opacity-80"
          style={{ background: "var(--grass)", color: "#fff", fontFamily: "var(--font-mono)", borderRadius: 10, boxShadow: "0 3px 0 var(--grass-d)" }}
        >
          Start free →
        </Link>
        <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
          Need 30+ seats, a curriculum alignment guide, and training calls?{" "}
          <Link href="/for-schools" style={{ color: "var(--grass)" }}>See the School plan →</Link>
        </p>
      </div>
    </div>
  );
}
