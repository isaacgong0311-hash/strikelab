import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { TRACKS } from "@/lib/tracks";

const LESSON_COUNT = TRACKS.reduce((n, t) => n + t.lessons.length, 0);

export const metadata = pageMetadata({
  path: "/for-schools",
  title: "For Schools",
  description:
    "A $499/year site license for 30 students: the full StrikeLab curriculum, a curriculum alignment guide, and monthly teacher training calls.",
});

const FAQS = [
  {
    q: "What does the School license actually include?",
    a: "Everything in the free Student tier (which already includes achievements and certificates of completion) plus everything in Pro (weekly coding challenges, the leaderboard, office hours, priority support) for up to 30 student accounts, a curriculum alignment guide mapped to AP Stats and AP Calc, and monthly teacher training calls.",
  },
  {
    q: "How is it billed?",
    a: "$499/year for up to 30 seats, invoiced annually. Contact us for volume pricing above 30 seats or multi-classroom / multi-year deals.",
  },
  {
    q: "Do you support purchase orders and invoicing?",
    a: "Yes — email hello@strikelab.app with your district's procurement process and we'll work with it directly.",
  },
  {
    q: "What student data do you collect?",
    a: "Only what's needed to track lesson progress and account access — no more than the free tier collects from any individual student. See the full breakdown on our Privacy page.",
  },
  {
    q: "Is a teacher admin dashboard or SSO available?",
    a: "The teacher dashboard is live: create classes, share an invite link, assign lessons or launch the six-week program, see a cohort scorecard (activation, weekly activity, week-4 retention, students who need help), review student capstones, and export everything as CSV. Google Classroom SSO is not available yet.",
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

const SCHOOL_OFFER_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: `${SITE_NAME} School`,
  description: "Site license for high school classrooms — 30 student seats, curriculum alignment guide, and monthly teacher training calls.",
  brand: { "@type": "Brand", name: SITE_NAME },
  url: `${SITE_URL}/for-schools`,
  offers: {
    "@type": "Offer",
    price: "499",
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "499",
      priceCurrency: "USD",
      billingIncrement: 1,
      unitCode: "ANN",
    },
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/for-schools`,
  },
};

export default function ForSchoolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <JsonLd data={breadcrumbJsonLd([{ name: "For Schools", path: "/for-schools" }])} />
      <Breadcrumbs trail={[{ name: "For Schools", path: "/for-schools" }]} />
      <JsonLd data={FAQ_JSON_LD} />
      <JsonLd data={SCHOOL_OFFER_JSON_LD} />

      <div className="mb-10 v2-page-head" data-v2-head>
        <Eyebrow>For Schools</Eyebrow>
        <h1
          className="text-4xl font-semibold mb-3 leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          A site license for the whole classroom
        </h1>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--muted2)" }}>
          $499/year covers 30 student seats — the full curriculum, weekly challenges,
          a curriculum alignment guide, and monthly training calls with the founder.
        </p>
      </div>

      <div className="grid gap-4 mb-12" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {[
          ["30", "student seats included"],
          ["$499", "per year, flat"],
          [String(LESSON_COUNT), `lessons across ${TRACKS.length} tracks`],
          ["1", "curriculum alignment guide"],
        ].map(([stat, label]) => (
          <div key={label} className="p-4 rounded-lg border text-center" style={{ borderColor: "var(--border)" }}>
            <div className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-mono)", color: "var(--grass)" }}>{stat}</div>
            <div className="text-xs" style={{ color: "var(--muted2)" }}>{label}</div>
          </div>
        ))}
      </div>

      <h2
        className="text-xl font-semibold mb-4"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        How it works in a classroom
      </h2>
      <ol className="school-steps mb-12">
        {[
          ["Create a class", "Set it up in Settings and share the join code or link. Students sign up free and land in your class."],
          ["Assign the work", "Pick individual lessons, or launch the six-week Quant Foundations program with scheduled weekly assignments."],
          ["Track progress", "See who is active each week, who needs a nudge, and each student's capstone, and export it all to CSV for your gradebook."],
        ].map(([title, body], i) => (
          <li key={title} className="school-step">
            <span className="school-step-num" aria-hidden="true">{i + 1}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>

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
          Ready to bring StrikeLab to your classroom, or need to loop in procurement?
        </p>
        <a
          href="mailto:hello@strikelab.app?subject=School%20license%20quote"
          className="text-sm px-4 py-2 font-medium transition-colors hover:opacity-80"
          style={{ background: "var(--grass)", color: "#fff", fontFamily: "var(--font-mono)", borderRadius: 10, boxShadow: "0 3px 0 var(--grass-d)", display: "inline-block" }}
        >
          Request a quote →
        </a>
        <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>
          Or see the full <Link href="/pricing" style={{ color: "var(--grass)", textDecoration: "underline", textUnderlineOffset: 3 }}>pricing page</Link>{" "}
          for how School compares to Student and Pro.
        </p>
      </div>
    </div>
  );
}
