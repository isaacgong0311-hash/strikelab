import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata = pageMetadata({
  path: "/for-schools",
  title: "For Schools",
  description:
    "A $499/year site license for 30 students: the full StrikeLab curriculum, a curriculum alignment guide, and monthly teacher training calls.",
});

const FAQS = [
  {
    q: "What does the School license actually include?",
    a: "Everything in the free Student tier plus everything in Pro (weekly coding challenges, achievements, certificate of completion) for up to 30 student accounts, a curriculum alignment guide mapped to AP Stats and AP Calc, and monthly teacher training calls.",
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
    a: "Not yet — both are on the roadmap. Today, teachers get visibility into class progress through monthly training calls and can request a manual export in the meantime.",
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
          ["23", "lessons across 3 tracks"],
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

      <div
        className="p-5 rounded-lg border mb-12 text-sm"
        style={{ borderColor: "var(--border)", color: "var(--muted2)", fontStyle: "italic" }}
      >
        We haven&rsquo;t published school testimonials yet — this section is reserved for
        them once a district has been live long enough to have real results to share.
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
          Or see the full <Link href="/pricing" style={{ color: "var(--grass)" }}>pricing page</Link>{" "}
          for how School compares to Student and Pro.
        </p>
      </div>
    </div>
  );
}
