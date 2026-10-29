import type { Metadata } from "next";
import HomeView from "./HomeView";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITLE = "StrikeLab: learn finance by building it";
const DESCRIPTION =
  "Interactive finance experiments, 23 hands-on lessons, and real Python in your browser. Explore options, risk, and backtesting. Free for students, with a six-week club program.";

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

// The Demo Club preview's dates are relative to today; without this the page
// is built once and its due dates drift into the past.
export const revalidate = 3600;

export default function Page() {
  return <HomeView />;
}
