import { Suspense } from "react";
import PlaygroundClient from "./PlaygroundClient";
import JsonLd from "@/components/JsonLd";
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
      <Suspense>
        <PlaygroundClient />
      </Suspense>
    </>
  );
}
