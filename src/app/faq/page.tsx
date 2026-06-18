import type { Metadata } from "next";
import FAQClient from "./FAQClient";
import { FAQ_GROUPS } from "@/lib/faq";

export const metadata: Metadata = {
  title: "FAQ — StrikeLab",
  description: "Common questions about StrikeLab — pricing, curriculum, technical setup.",
  alternates: { canonical: "/faq" },
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((g) => g.items).map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <FAQClient />
    </>
  );
}
