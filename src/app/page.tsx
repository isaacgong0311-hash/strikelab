import type { Metadata } from "next";
import HomeView from "./HomeView";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// One homepage for students, club leaders and parents; the title leads with
// the loop everyone shares (train, then prove it in a season; PLAN.md 2026-10-16).
const TITLE = "StrikeLab: learn quant finance, then prove it";
const DESCRIPTION =
  "Price options, code the Greeks and backtest strategies in real Python, right in the browser, then prove it in free seasons of timed challenges. Free for high-school students and their clubs.";

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
