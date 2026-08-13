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
      <div className="mb-2 v2-page-head v2-page-head--tool" data-v2-head>
        <Breadcrumbs trail={[{ name: "Playground", path: "/playground" }]} />
        <Eyebrow>Playground</Eyebrow>
        <h1
          className="text-4xl font-semibold mb-3 leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Python options pricing playground
        </h1>
        {/* Four Greeks, matching the interactive tool below exactly — it used
            to also claim Rho, which this tool doesn't implement (Rho has its
            own full lesson instead). Trimmed the rest since the tool's own
            header repeats "implement live in Python" a few px down. */}
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "var(--muted2)" }}>
          A free Python playground for the Options Pricing curriculum — implement
          Black-Scholes and four of its Greeks (Delta, Gamma, Theta, Vega) running
          entirely in your browser via Pyodide. No install, no account.
        </p>
      </div>
      <Suspense>
        <PlaygroundClient />
      </Suspense>
    </>
  );
}
