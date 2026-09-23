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
    "Free for students, always. Clubs and schools start with a free six-week pilot, then $199/year per club or $499/year per school instructor.",
});

// Decision log 2026-09-23: Student / Club / School, pilots free, Pro paused
// for new sign-ups (existing subscriptions keep working). Every line below
// must be something the product does today.
const TIERS = [
  {
    name: "Student",
    price: "$0",
    per: "always",
    desc: "For any student, anywhere, with or without a club.",
    features: [
      `All ${TOTAL_LESSONS} lessons, with Python that runs in the browser`,
      "Short, step-by-step sessions for the first week's lessons",
      "Greek visualizer, playground and paper-trading sandbox",
      "Progress and code saved to your account",
      "Certificates when you finish a track",
    ],
    cta: { href: "/learn/inv-1.1", label: "Try the first lesson" },
    accent: false,
  },
  {
    name: "Club",
    price: "$199",
    per: "/ year, after a free pilot",
    desc: "For a student-run or teacher-led club running the six-week lab.",
    badge: "Pilots free",
    features: [
      "The six-week Quant Foundations Lab, scheduled with break weeks",
      "One invite link; students join free",
      "A home for each student with one clear next step",
      "Capstones: private by default, shareable by choice",
      "Scorecard: activation, weekly activity, who needs help, CSV export",
      "Weekly meeting plan and ready-to-send messages",
    ],
    cta: { href: "/pilot", label: "Start a free pilot" },
    accent: true,
  },
  {
    name: "School",
    price: "$499",
    per: "/ year per instructor, after a free pilot",
    desc: "For a teacher running the lab in class or across several sections.",
    features: [
      "Everything in Club, for all of one instructor's classes",
      "Invoices and purchase orders",
      "Help completing your district's student-data agreement",
    ],
    cta: { href: "/pilot", label: "Start a free pilot" },
    accent: false,
  },
];

const FAQS = [
  {
    q: "Do students ever pay?",
    a: "No. Students use StrikeLab free, whether they join through a club or on their own.",
  },
  {
    q: "What's in the free pilot?",
    a: "The full six-week lab for your club, set up in a few minutes, plus direct help from the founder while it runs. You meet once a week and tell us how it went. No payment details needed to start.",
  },
  {
    q: "What happens after the pilot?",
    a: "You decide. Keep going for $199/year per club or $499/year per school instructor, or stop. Nothing renews or bills automatically.",
  },
  {
    q: "Can a school pay by purchase order?",
    a: "Yes. Email hello@strikelab.app with your process and we'll invoice you directly.",
  },
  {
    q: "What happened to Pro?",
    a: "Pro (weekly coding challenges, $9/month) is paused for new sign-ups while we focus on club pilots. If you already subscribe, nothing changes: manage it from Settings → Billing.",
  },
];

const PRICING_JSON_LD = [
  { name: `${SITE_NAME} Student`, description: "The full technical-finance curriculum, free for students.", price: "0" },
  { name: `${SITE_NAME} Club`, description: "The six-week Quant Foundations Lab for one club, after a free pilot.", price: "199", unit: "ANN" },
  { name: `${SITE_NAME} School`, description: "The six-week Quant Foundations Lab for one instructor's classes, after a free pilot.", price: "499", unit: "ANN" },
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
    ...(p.unit
      ? { priceSpecification: { "@type": "UnitPriceSpecification", price: p.price, priceCurrency: "USD", billingIncrement: 1, unitCode: p.unit } }
      : {}),
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}${p.price === "0" ? "/learn/inv-1.1" : "/pilot"}`,
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
          <h1 className={styles.h1}>Free for students. Clubs start with a free pilot.</h1>
          <p className={styles.lede}>
            Run the six-week lab with your club at no cost. If it works, keep going for a flat yearly price. Students
            never pay.
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
                {t.price}
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
