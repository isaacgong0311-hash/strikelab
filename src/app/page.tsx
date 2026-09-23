import type { Metadata } from "next";
import HomeView from "./HomeView";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Decision log 2026-09-23: the title is the plain category line; the hero
// carries the promise.
const TITLE = "StrikeLab: the technical-finance lab for high-school clubs";
const DESCRIPTION =
  "A ready-to-run six-week lab where students learn by coding real market models and finish with work they can show. A weekly plan and scorecard for the leader. Free for students.";

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
