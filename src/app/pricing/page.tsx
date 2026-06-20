import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free forever for students. Pro for cohorts. School licenses for classrooms.",
};

export default function PricingPage() {
  return <PricingClient />;
}
