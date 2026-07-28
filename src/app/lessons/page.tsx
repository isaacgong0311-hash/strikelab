import LessonsClient from "./LessonsClient";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, breadcrumbJsonLd, isoDuration } from "@/lib/seo";
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
//
// `offers` and `syllabusSections` are what Google's Course info documentation
// asks for beyond the bare minimum: offers is how "Free" gets surfaced in the
// result, and the syllabus lets Google show what the track actually covers.
const COURSES_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: TRACKS.map((track, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Course",
      "@id": `${SITE_URL}/lessons#${track.id}`,
      name: track.title,
      description: track.description,
      url: `${SITE_URL}/lessons#${track.id}`,
      inLanguage: "en-US",
      educationalLevel: track.level,
      isAccessibleForFree: true,
      teaches: track.subtitle,
      about: track.subtitle,
      dateModified: track.contentUpdated,
      provider: {
        "@type": ["Organization", "EducationalOrganization"],
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
      },
      offers: {
        "@type": "Offer",
        category: "Free",
        price: 0,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/lessons#${track.id}`,
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: `PT${track.lessons.length * 30}M`,
      },
      syllabusSections: track.lessons.map((lesson, li) => ({
        "@type": "Syllabus",
        position: li + 1,
        name: lesson.title,
        description: lesson.subtitle,
        url: `${SITE_URL}/lesson/${lesson.id}`,
        timeRequired: isoDuration(lesson.duration),
      })),
    },
  })),
};

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([{ name: "Lessons", path: "/lessons" }]);

export default function LessonsPage() {
  return (
    <>
      <JsonLd data={COURSES_JSON_LD} />
      <JsonLd data={BREADCRUMB_JSON_LD} />
      <LessonsClient />
    </>
  );
}
