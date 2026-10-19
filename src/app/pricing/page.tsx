import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/marketing/Faq";
import styles from "@/components/marketing/marketing.module.css";
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
// Stripe routes remain available to existing subscribers.
const TIERS = [
  {
    name: "Students",
    price: "Free",
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
    accent: false,
  },
  {
    name: "Clubs",
    price: "Free",
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
    accent: false,
  },
  {
    name: "Intensive",
    price: "$349",
    per: "for six weeks",
    desc: "An optional small-group cohort for motivated students, arranged with parents or guardians.",
    badge: "Waitlist open",
    features: [
      "Weekly quant projects and mentor review",
      "A capstone the student explains and defends",
      "Small cohort of 8 to 12 students",
      "No payment now; charged only once a cohort fills",
    ],
    cta: { href: "/intensive", label: "Join the waitlist" },
    accent: true,
  },
];

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

const PRICING_JSON_LD = [
  { name: `${SITE_NAME} Students`, description: "Lessons, playground, and seasons, free for students.", price: "0", href: "/learn/inv-1.1" },
  { name: `${SITE_NAME} Clubs`, description: "Chapter board, six-week lab, and scorecard, free for clubs.", price: "0", href: "/pilot" },
  { name: `${SITE_NAME} Intensive`, description: "Optional six-week mentored cohort; join the waitlist.", price: "349", href: "/intensive" },
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
  },
}));

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbJsonLd([{ name: "Pricing", path: "/pricing" }])} />
      {PRICING_JSON_LD.map((product) => (
        <JsonLd key={product.name} data={product} />
      ))}

      <section className={`${styles.section} ${styles.center}`}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>Pricing</p>
          <h1 className={styles.h1}>Students free. Clubs free. Intensive when you&apos;re ready.</h1>
          <p className={styles.lede}>
            Learn and compete at no cost. Bring your club to the season with its own board and an included six-week lab.
            Families who want a small mentored cohort can join the Intensive waitlist.
          </p>
        </div>
      </section>

      <section className={styles.wrap} aria-label="Plans" style={{ paddingBottom: "clamp(3rem, 8vw, 5rem)" }}>
        <div className={styles.grid3}>
          {TIERS.map((t) => (
            <div key={t.name} className={`${styles.card} ${t.accent ? styles.cardAccent : ""}`}>
              {t.badge && <span className={styles.badge}>{t.badge}</span>}
              <h2 className={styles.h3}>{t.name}</h2>
              <p className={styles.body}>{t.desc}</p>
              <p className={styles.price}>
                <strong>{t.price}</strong>
                <span className={styles.pricePer}>{t.per}</span>
              </p>
              <ul className={styles.checks}>
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className={styles.cardCta}>
                <Link href={t.cta.href} className={t.accent ? styles.primary : styles.secondary}>
                  {t.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.fine} style={{ marginTop: "1.5rem" }}>
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
