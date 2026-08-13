import SandboxClient from "./SandboxClient";
import JsonLd from "@/components/JsonLd";
import Eyebrow from "@/components/Eyebrow";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/sandbox",
  title: "Paper-Trading Sandbox",
  description:
    "Trade stocks and options with $100,000 in simulated cash. Options are priced live with StrikeLab's own Black-Scholes engine — the same math taught in the lessons.",
});

export default function SandboxPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Sandbox", path: "/sandbox" }])} />
      {/* Server-rendered intro — SandboxClient bails to `null` while auth is
          resolving and to a sign-in prompt for signed-out visitors, so a
          crawler (which is never signed in) used to see no H1 and almost no
          text here — identical in shape to the Playground page's own loading
          gate, which is why an auditor flagged the two as duplicate content. */}
      <div className="mb-2 v2-page-head v2-page-head--tool" data-v2-head>
        <Breadcrumbs trail={[{ name: "Sandbox", path: "/sandbox" }]} />
        <Eyebrow>Sandbox</Eyebrow>
        <h1
          className="text-4xl font-semibold mb-3 leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Paper-trading sandbox
        </h1>
        {/* "applied to real market data" was wrong — src/lib/pricing.ts is
            explicit that there's no real feed (deterministic simulated GBM,
            reseeded daily). Also dropped the trailing "Sign in free to open
            the desk" — the sign-in gate right below already has its own CTA,
            saying it twice reads as filler. */}
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--muted2)" }}>
          Trade stocks and options with $100,000 in simulated cash. Every option is
          priced live by StrikeLab&rsquo;s own Black-Scholes engine — the same math
          taught in the Options Pricing lessons — against simulated prices for about
          90 tickers.
        </p>
      </div>
      <SandboxClient />
    </>
  );
}
