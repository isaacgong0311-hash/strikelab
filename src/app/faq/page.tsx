import type { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "FAQ — StrikeLab",
  description: "Common questions about StrikeLab — pricing, curriculum, technical setup.",
};

export default function FAQPage() {
  return <FAQClient />;
}
