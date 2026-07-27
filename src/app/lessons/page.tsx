import LessonsClient from "./LessonsClient";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { TRACKS } from "@/lib/tracks";

export const metadata = pageMetadata({
  path: "/lessons",
  title: "Options Pricing & Quant Finance Lessons",
  description:
    "The full StrikeLab curriculum: investing fundamentals, options pricing (Black-Scholes & the Greeks), and quant investing (CAPM, factors, backtesting) — each lesson taught through a real Python notebook in your browser.",
});

// One Course per track. `Course` is what makes this page eligible for Google's
// course rich results, which is the main organic entry point we care about.
const COURSES_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: TRACKS.map((track, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Course",
      name: track.title,
      description: track.description,
      url: `${SITE_URL}/lessons#${track.id}`,
      inLanguage: "en-US",
      educationalLevel: track.level,
      isAccessibleForFree: true,
      teaches: track.subtitle,
      provider: {
        "@type": ["Organization", "EducationalOrganization"],
        name: SITE_NAME,
        url: SITE_URL,
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: `PT${track.lessons.length * 30}M`,
      },
    },
  })),
};

export default function LessonsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(COURSES_JSON_LD) }}
      />
      <LessonsClient />
    </>
  );
}
