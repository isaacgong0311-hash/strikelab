import PricingClient from "./PricingClient";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata = pageMetadata({
  path: "/pricing",
  title: "Pricing",
  description:
    "The full options pricing and quant finance curriculum is free forever. Pro adds weekly coding challenges; school licenses cover whole classrooms.",
});

// One Product per tier rather than a single Product with three Offers —
// each tier has its own name/description Google can actually surface, and
// it matches how the pricing cards themselves are structured. `price: "0"`
// on Student (not "Free" or omitted) is deliberate: Google's Offer schema
// wants a numeric string, and an unparsed value just gets the offer dropped
// from rich results rather than falling back to "free."
const PRICING_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${SITE_NAME} Student`,
    description: "The full options pricing and quant finance curriculum, free forever.",
    brand: { "@type": "Brand", name: SITE_NAME },
    url: `${SITE_URL}/pricing`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/sign-up`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${SITE_NAME} Pro`,
    description: "Weekly coding challenges, achievements, and office hours with the founder, on top of the free curriculum.",
    brand: { "@type": "Brand", name: SITE_NAME },
    url: `${SITE_URL}/pricing`,
    offers: {
      "@type": "Offer",
      price: "9",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "9",
        priceCurrency: "USD",
        billingIncrement: 1,
        unitCode: "MON",
      },
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/pricing`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${SITE_NAME} School`,
    description: "Site license for high school classrooms — 30 student seats, curriculum alignment guide, and monthly teacher training calls.",
    brand: { "@type": "Brand", name: SITE_NAME },
    url: `${SITE_URL}/pricing`,
    offers: {
      "@type": "Offer",
      price: "499",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "499",
        priceCurrency: "USD",
        billingIncrement: 1,
        unitCode: "ANN",
      },
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/for-schools`,
    },
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Pricing", path: "/pricing" }])} />
      {PRICING_JSON_LD.map((product) => (
        <JsonLd key={product.name} data={product} />
      ))}
      <PricingClient />
    </>
  );
}
