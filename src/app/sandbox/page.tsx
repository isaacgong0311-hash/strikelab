import SandboxClient from "./SandboxClient";
import JsonLd from "@/components/JsonLd";
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
      <SandboxClient />
    </>
  );
}
