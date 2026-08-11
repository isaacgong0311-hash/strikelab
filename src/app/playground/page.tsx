import { Suspense } from "react";
import PlaygroundClient from "./PlaygroundClient";
import JsonLd from "@/components/JsonLd";
import Eyebrow from "@/components/Eyebrow";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/playground",
  title: "Python Options Playground",
  description:
    "A free in-browser Python playground for options pricing. Price calls and puts with Black-Scholes, plot the Greeks, and tweak volatility live — no install, no account.",
});

export default function PlaygroundPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Playground", path: "/playground" }])} />
      {/* Server-rendered intro — PlaygroundClient's own header only paints in
          once Pyodide finishes booting, so a crawler that reads the initial
          HTML (or catches this page mid-boot) used to see no H1 and near-empty
          content here. This block is always present regardless of load state. */}
      <div className="mb-8 v2-page-head" data-v2-head>
        <Breadcrumbs trail={[{ name: "Playground", path: "/playground" }]} />
        <Eyebrow>Playground</Eyebrow>
        <h1
          className="text-4xl font-semibold mb-3 leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Python options pricing playground
        </h1>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--muted2)" }}>
          Implement the Black-Scholes formula and its five Greeks — Delta, Gamma, Theta,
          Vega, and Rho — in real Python, running entirely in your browser via Pyodide.
          Every function you write redraws the payoff and Greek curves live. No install,
          no account, free forever.
        </p>
      </div>
      <Suspense>
        <PlaygroundClient />
      </Suspense>
    </>
  );
}
