import type { Metadata } from "next";
import HomeView from "./HomeView";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Decision log 2026-09-30: one homepage for independent students and club
// leaders; the title leads with what everyone does here.
const TITLE = "StrikeLab: learn quant finance by building it";
const DESCRIPTION =
  "Price options, code the Greeks and backtest strategies in real Python, right in the browser. Free for high-school students, and ready to run as a six-week lab for clubs and classes.";

// The hero's sample data is relative to today; refresh it hourly.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function Page() {
  return <HomeView />;
}
