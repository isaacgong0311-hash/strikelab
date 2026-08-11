import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description: "What StrikeLab collects, why it's collected, and how to request access or deletion of your data.",
});

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "The short version",
    body: (
      <>
        We collect the minimum needed to sync your progress across devices and
        run the site. We don&rsquo;t sell your data, don&rsquo;t run ad
        tracking, and don&rsquo;t share it with anyone except the vendors
        listed below that we use to actually run the platform (auth, hosting,
        payments, AI). No real money ever touches the paper-trading sandbox.
      </>
    ),
  },
  {
    title: "What we collect",
    body: (
      <>
        <p className="mb-3">
          <strong>If you don&rsquo;t create an account:</strong> lesson
          completions, XP, and streak live only in your browser&rsquo;s
          localStorage. We never see it.
        </p>
        <p className="mb-3">
          <strong>If you create an account</strong> (email + password, or
          Google sign-in): your email, an optional display name, and the same
          progress data above — synced via Supabase so it follows you to a new
          device. Signing in also unlocks the paper-trading sandbox, which
          stores your simulated cash balance and trade history.
        </p>
        <p>
          <strong>If you subscribe to Pro or a School plan:</strong> Stripe
          handles checkout directly — we never see or store your card number.
          We only keep the subscription status and plan Stripe tells us about,
          tied to your account.
        </p>
      </>
    ),
  },
  {
    title: "AI features (hints, tutor, code review, practice problems)",
    body: (
      <>
        These send your question or code to Groq (an AI inference provider)
        to generate a response. Usage is capped per day per account so costs
        stay predictable — we log how many requests you&rsquo;ve made, not
        the content of what you asked. AI features require signing in for
        exactly this reason.
      </>
    ),
  },
  {
    title: "Newsletter",
    body: (
      <>
        If you sign up for the monthly newsletter, your email is sent to
        Web3Forms (a third-party email-forwarding service) so we can reach
        you. It&rsquo;s not linked to your account or progress data. Every
        issue tells you how to unsubscribe.
      </>
    ),
  },
  {
    title: "Analytics & error monitoring",
    body: (
      <>
        We use Vercel Web Analytics (cookie-free, aggregate page-view counts —
        it doesn&rsquo;t track you individually) and Sentry for error
        monitoring, which can capture a stack trace and the page you were on
        when something breaks, so we can fix it.
      </>
    ),
  },
  {
    title: "Cookies",
    body: (
      <>
        The only cookies we set are Supabase&rsquo;s session cookies, which
        keep you signed in. No ad or tracking cookies.
      </>
    ),
  },
  {
    title: "Age",
    body: (
      <>
        StrikeLab is built for ages 13–18. We don&rsquo;t knowingly collect
        data from anyone under 13, and don&rsquo;t require any information
        beyond an email to use the free tier.
      </>
    ),
  },
  {
    title: "Your data, your call",
    body: (
      <>
        Email{" "}
        <a href="mailto:hello@strikelab.app" className="underline underline-offset-2" style={{ color: "var(--grass)" }}>
          hello@strikelab.app
        </a>{" "}
        to see what we have on you or to have your account and all associated
        data deleted. We&rsquo;ll handle it within a few days.
      </>
    ),
  },
  {
    title: "One honest disclaimer",
    body: (
      <>
        StrikeLab is built and run by one high schooler, not a legal team.
        This page describes what the product actually does, in plain
        language, as accurately as we can — it isn&rsquo;t a substitute for
        professional legal advice. If something here seems off or you have
        questions, email us.
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <JsonLd data={breadcrumbJsonLd([{ name: "Privacy Policy", path: "/privacy" }])} />

      <Eyebrow>Legal</Eyebrow>
      <h1
        className="text-4xl font-semibold mb-3 leading-tight"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Privacy Policy
      </h1>
      <p className="text-sm mb-12" style={{ color: "var(--ink-3)" }}>
        Last updated August 2026. See also our{" "}
        <Link href="/terms" className="underline underline-offset-2" style={{ color: "var(--grass)" }}>
          Terms of Service
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
