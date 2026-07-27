import PricingClient from "./PricingClient";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/pricing",
  title: "Pricing",
  description:
    "The full options pricing and quant finance curriculum is free forever for students. Pro adds weekly coding challenges and AI hints; school licenses cover whole classrooms.",
});

export default function PricingPage() {
  return <PricingClient />;
}
