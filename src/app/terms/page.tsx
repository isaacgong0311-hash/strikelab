import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/terms",
  title: "Terms of Service",
  description: "The terms for using StrikeLab's curriculum, playground, and paper-trading sandbox.",
});

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "What StrikeLab is",
    body: (
      <>
        A free, browser-based curriculum teaching options pricing and quant
        finance, plus a Python playground, weekly coding challenges, and a
        paper-trading sandbox. Nothing on StrikeLab is real trading — the
        sandbox uses simulated cash and simulated pricing. It is not a
        brokerage, it doesn&rsquo;t execute real trades, and nothing on this
        site is financial advice.
      </>
    ),
  },
  {
    title: "Accounts",
    body: (
      <>
        You&rsquo;re responsible for keeping your password secure and for
        activity on your account. The free tier requires only an email;
        you&rsquo;re not required to create an account to use the lessons,
        playground, or Greek visualizer.
      </>
    ),
  },
  {
    title: "Acceptable use",
    body: (
      <>
        Use StrikeLab to learn. Don&rsquo;t try to break, scrape at scale, or
        abuse the AI features, the challenge leaderboard, or the sandbox
        (e.g. scripting fake trades to game a leaderboard that doesn&rsquo;t
        currently exist for the sandbox, or hammering the AI endpoints past
        their daily cap on purpose). We reserve the right to suspend accounts
        that abuse the platform.
      </>
    ),
  },
  {
    title: "Subscriptions & payment",
    body: (
      <>
        Pro ($9/month) renews automatically until you cancel; cancel anytime
        from the billing portal (linked from your dashboard) and you keep
        access through the end of the billing period you already paid for.
        The free trial doesn&rsquo;t charge you until it ends. School plans
        are billed annually and arranged directly — email{" "}
        <a href="mailto:hello@strikelab.app" className="underline underline-offset-2" style={{ color: "var(--grass)" }}>
          hello@strikelab.app
        </a>{" "}
        for a refund request on either. Payment processing is handled
        entirely by Stripe; we never see your card details.
      </>
    ),
  },
  {
    title: "Content & code ownership",
    body: (
      <>
        The pricing engine and platform code are MIT-licensed and{" "}
        <a
          href="https://github.com/isaacgong0311-hash/strikelab"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
          style={{ color: "var(--grass)" }}
        >
          open source on GitHub
        </a>{" "}
        — fork it, read it, learn from it. The lesson content, curriculum
        structure, and StrikeLab name/branding are not covered by that
        license. Code you write in the playground or lesson exercises is
        yours.
      </>
    ),
  },
  {
    title: "No warranty",
    body: (
      <>
        StrikeLab is provided as-is. We try hard to keep the pricing engine
        and lessons correct, but this is an educational tool built by one
        person — verify anything you plan to rely on outside a classroom
        setting, and don&rsquo;t use the sandbox&rsquo;s simulated pricing as
        a stand-in for real market data.
      </>
    ),
  },
  {
    title: "Changes",
    body: (
      <>
        We&rsquo;ll update these terms as the product changes (see the{" "}
        <Link href="/roadmap" className="underline underline-offset-2" style={{ color: "var(--grass)" }}>
          roadmap
        </Link>{" "}
        for what&rsquo;s coming). Material changes will be noted on this page
        with an updated date.
      </>
    ),
  },
  {
    title: "One honest disclaimer",
    body: (
      <>
        Same note as the{" "}
        <Link href="/privacy" className="underline underline-offset-2" style={{ color: "var(--grass)" }}>
          privacy policy
        </Link>
        : this is written by a high schooler describing what the product
        actually does, not a law firm. Questions →{" "}
        <a href="mailto:hello@strikelab.app" className="underline underline-offset-2" style={{ color: "var(--grass)" }}>
          hello@strikelab.app
        </a>
        .
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <JsonLd data={breadcrumbJsonLd([{ name: "Terms of Service", path: "/terms" }])} />
      <Breadcrumbs trail={[{ name: "Terms of Service", path: "/terms" }]} />

      <Eyebrow>Legal</Eyebrow>
      <h1
        className="text-4xl font-semibold mb-3 leading-tight"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Terms of Service
      </h1>
      <p className="text-sm mb-12" style={{ color: "var(--ink-3)" }}>
        Last updated August 2026. See also our{" "}
        <Link href="/privacy" className="underline underline-offset-2" style={{ color: "var(--grass)" }}>
          Privacy Policy
        </Link>
        .
      </p>

      <div className="flex flex-col gap-10">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2
              className="text-lg font-semibold mb-2.5"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              {s.title}
            </h2>
            <div className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
              {s.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
