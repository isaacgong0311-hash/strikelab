import type { Metadata } from "next";
import { getAllLessons, getLessonContext } from "@/lib/tracks";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import LessonClient from "./LessonClient";

export async function generateStaticParams() {
  return getAllLessons().map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ctx = getLessonContext(id);
  if (!ctx) return { title: "Lesson" };

  // No manual " — StrikeLab" suffix: the root layout's "%s — StrikeLab" title
  // template already appends it. Adding both produced titles like
  // "Black-Scholes Formula — StrikeLab — StrikeLab".
  const description = `${ctx.lesson.subtitle}. Lesson ${ctx.positionInTrack} of ${ctx.trackLength} in the ${ctx.track.title} track on StrikeLab — learn it by writing Python in your browser.`;
  const canonical = `/lesson/${id}`;
  const ogTitle = `${ctx.lesson.title} — ${SITE_NAME}`;

  return {
    title: ctx.lesson.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_US",
      title: ogTitle,
      description,
      url: `${SITE_URL}${canonical}`,
    },
    twitter: { card: "summary_large_image", title: ogTitle, description },
  };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = getLessonContext(id);
  if (!ctx) notFound();

  const lessonJsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: ctx.lesson.title,
    description: ctx.lesson.subtitle,
    url: `${SITE_URL}/lesson/${id}`,
    learningResourceType: "Lesson",
    educationalLevel: "high school",
    timeRequired: ctx.lesson.duration,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "Course",
      name: `${ctx.track.title} — ${SITE_NAME}`,
    },
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  // Gives Google the Home › Lessons › Lesson trail to show under the result
  // instead of a bare URL.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Lessons", item: `${SITE_URL}/lessons` },
      { "@type": "ListItem", position: 3, name: ctx.lesson.title, item: `${SITE_URL}/lesson/${id}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lessonJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <LessonClient
        lesson={ctx.lesson}
        prev={ctx.prev}
        next={ctx.next}
        trackTitle={ctx.track.title}
        positionInTrack={ctx.positionInTrack}
        trackLength={ctx.trackLength}
      />
    </>
  );
}
