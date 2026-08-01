import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

const TITLE = "StrikeLab — Learn Options Pricing & Quant Finance";

// Written out rather than using pageMetadata() so the homepage keeps its
// brand-first title verbatim — the "%s — StrikeLab" template would otherwise
// rewrite it to "… — StrikeLab — StrikeLab".
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: SITE_DESCRIPTION },
};

export default function Page() {
  return <HomeClient />;
}
