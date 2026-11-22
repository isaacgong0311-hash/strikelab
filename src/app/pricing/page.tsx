import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/marketing/Faq";
import { ActionLink } from "@/components/ui/Action";
import styles from "@/components/marketing/marketing.module.css";
import pricing from "./pricing.module.css";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { TRACKS } from "@/lib/tracks";

const TOTAL_LESSONS = TRACKS.reduce((s, t) => s + t.lessons.length, 0);

export const metadata = pageMetadata({
  path: "/pricing",
  title: "Pricing",
  description:
    "Lessons, playground, and seasons are free for students. Clubs get a free chapter board, six-week lab, and scorecard. The optional Intensive is $349; join the waitlist.",
});

// The remodel offer is Student / Club / Intensive. Legacy subscriptions and
// Stripe routes remain available to existing subscribers. The two free plans
// lead; the Intensive is an optional, waitlist-only program and is shown as a
// quiet row beneath them, not as a third equal (or highlighted) column.
const FREE_PLANS = [
  {
    name: "Students",
    per: "for every student",
    desc: "For any student, anywhere, with or without a club.",
    features: [
      `All ${TOTAL_LESSONS} lessons, with Python that runs in the browser`,
      "Playground and Greek visualizer",
      "Free seasons of timed quant challenges",
      "Progress and code saved to your account",
      "A private record of verified work, shareable by choice",
    ],
    cta: { href: "/learn/inv-1.1", label: "Start a lesson" },
    primary: true,
  },
  {
    name: "Clubs",
    per: "for club leaders and members",
    desc: "Bring your club into the season and give members their own board.",
    features: [
      "Your club's handle-only chapter board",
      "One invite link; students join free",
      "Six-week Quant Foundations Lab and weekly meeting plan",
      "Leader scorecard and CSV export",
      "Private capstones, shareable by student choice",
    ],
    cta: { href: "/pilot?src=pricing", label: "Set up your club" },
    primary: false,
  },
] as const;

const FAQS = [
  {
    q: "Can students use StrikeLab without paying?",
    a: "Yes. Lessons, the playground, seasons, and club participation are free. The parent-facing Intensive is an optional separate program.",
  },
  {
    q: "Is the club lab free too?",
    a: "Yes. Create a club, share the invite link, use its chapter board, and run the six-week lab and scorecard for free.",
  },
  {
    q: "Will joining the Intensive waitlist charge me?",
    a: "No. The waitlist only collects an email. The Intensive costs $349 for six weeks, and payment happens only after a cohort fills and the dates are confirmed.",
  },
  {
    q: "Can a school pay by purchase order?",
    a: "Schools that need an invoice or purchase order can email hello@strikelab.app to discuss their process.",
  },
  {
    q: "What happened to Pro?",
    a: "Pro ($9/month) is no longer offered to new subscribers. Existing subscribers can keep using their account, or cancel from Settings → Billing or by emailing hello@strikelab.app.",
  },
];

// The Intensive is waitlist-only: no dates and no checkout yet, so its offer
// is a PreOrder, not something buyable today.
const PRICING_JSON_LD = [
  { name: `${SITE_NAME} Students`, description: "Lessons, playground, and seasons, free for students.", price: "0", href: "/learn/inv-1.1" },
  { name: `${SITE_NAME} Clubs`, description: "Chapter board, six-week lab, and scorecard, free for clubs.", price: "0", href: "/pilot" },
  {
    name: `${SITE_NAME} Intensive`,
    description: "Optional six-week mentored cohort; waitlist only, nothing charged until a cohort fills.",
    price: "349",
    href: "/intensive",
    availability: "https://schema.org/PreOrder",
  },
].map((p) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: p.name,
  description: p.description,
  brand: { "@type": "Brand", name: SITE_NAME },
  url: `${SITE_URL}/pricing`,
  offers: {
    "@type": "Offer",
    price: p.price,
    priceCurrency: "USD",
    url: `${SITE_URL}${p.href}`,
    ...("availability" in p ? { availability: p.availability } : {}),
  },
}));

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbJsonLd([{ name: "Pricing", path: "/pricing" }])} />
      {PRICING_JSON_LD.map((product) => (
        <JsonLd key={product.name} data={product} />
      ))}

      <section className={pricing.head}>
        <div className={styles.wrap}>
          <h1 className={pricing.title}>Free for every student, and every club.</h1>
          <p className={styles.lede}>
            Lessons, the playground and every season cost nothing. Clubs get their own board and a six-week lab, also free.
            The one paid program is an optional Intensive for families, and it&apos;s waitlist-only for now.
          </p>
        </div>
      </section>

      <section className={`${styles.wrap} ${pricing.plans}`} aria-label="Plans">
        <div className={pricing.grid}>
          {FREE_PLANS.map((t) => (
            <div key={t.name} className={`${pricing.plan} ${t.primary ? pricing.planLead : ""}`}>
              <h2 className={pricing.planName}>{t.name}</h2>
              <p className={pricing.price}>Free</p>
              <p className={pricing.per}>{t.per}</p>
              <p className={pricing.desc}>{t.desc}</p>
              <ul className={pricing.features}>
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <ActionLink href={t.cta.href} variant={t.primary ? "primary" : "secondary"} className={pricing.planCta}>
                {t.cta.label}
              </ActionLink>
            </div>
          ))}
        </div>

        <div className={pricing.optional}>
          <div className={pricing.optionalText}>
            <h2 className={pricing.optionalName}>Intensive</h2>
            <p className={pricing.optionalBody}>
              Optional, for families: a small six-week cohort of 8 to 12 students with weekly projects, mentor review and a
              capstone the student defends. <span className={pricing.optionalPrice}>$349</span> for six weeks, charged only
              once a cohort fills.
            </p>
          </div>
          <ActionLink href="/intensive" variant="secondary" className={pricing.optionalCta}>Join the waitlist</ActionLink>
        </div>

        <p className={styles.fine}>
          Schools that need an invoice or purchase order: <a href="mailto:hello@strikelab.app" className={styles.textLink}>hello@strikelab.app</a>.
        </p>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="pricing-faq">
        <div className={styles.narrow}>
          <h2 id="pricing-faq" className={styles.h2}>Questions</h2>
          <Faq items={FAQS} />
          <p className={styles.fine}>
            More in the <Link href="/faq" className={styles.textLink}>FAQ</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
