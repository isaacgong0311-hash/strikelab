import FAQClient from "./FAQClient";
import JsonLd from "@/components/JsonLd";
import { FAQ_GROUPS } from "@/lib/faq";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/faq",
  title: "FAQ",
  description:
    "Common questions about StrikeLab — what it costs, what maths you need, whether it runs on a school Chromebook, and how the Python exercises work.",
});

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
      <JsonLd data={FAQ_JSON_LD} />
      <JsonLd data={breadcrumbJsonLd([{ name: "FAQ", path: "/faq" }])} />
      <FAQClient />
    </>
  );
}
