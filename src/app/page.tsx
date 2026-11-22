import type { Metadata } from "next";
import HomeView from "./HomeView";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { TRACKS } from "@/lib/tracks";

const TOTAL_LESSONS = TRACKS.reduce((n, t) => n + t.lessons.length, 0);

const TITLE = "StrikeLab: learn quant finance, then prove it";
const DESCRIPTION =
  `Free for high schoolers: ${TOTAL_LESSONS} hands-on lessons with real Python in your browser, then weekly timed quant challenges ranked under a handle, and a record you can show. Clubs play free too.`;

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

// The hero's season status ("opens in N days", "is live") is relative to today; without this the
// page is built once and the count drifts.
export const revalidate = 3600;

export default function Page() {
  return <HomeView />;
}
