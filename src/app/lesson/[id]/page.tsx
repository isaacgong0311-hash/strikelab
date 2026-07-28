import type { Metadata } from "next";
import { getAllLessons, getLessonContext } from "@/lib/tracks";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { breadcrumbJsonLd, isoDuration } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import LessonClient from "./LessonClient";
import { buildLessonToc } from "@/lib/lessonToc";

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
    educationalLevel: ctx.track.level,
    teaches: ctx.lesson.subtitle,
    timeRequired: isoDuration(ctx.lesson.duration),
    dateModified: ctx.track.contentUpdated,
    isAccessibleForFree: true,
    inLanguage: "en-US",
    // Same @id as the Course on /lessons, so Google resolves the two into one
    // entity rather than treating them as unrelated courses with the same name.
    isPartOf: {
      "@type": "Course",
      "@id": `${SITE_URL}/lessons#${ctx.track.id}`,
      name: `${ctx.track.title} — ${SITE_NAME}`,
      url: `${SITE_URL}/lessons#${ctx.track.id}`,
    },
    position: ctx.positionInTrack,
    provider: {
      "@type": ["Organization", "EducationalOrganization"],
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  // Section ids are injected here rather than client-side so deep links work
  // on first paint and the anchors exist for crawlers.
  const toc = buildLessonToc(ctx.lesson.content);

  // Gives Google the Home › Lessons › Lesson trail to show under the result
  // instead of a bare URL.
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Lessons", path: "/lessons" },
    { name: ctx.lesson.title, path: `/lesson/${id}` },
  ]);

  return (
    <>
      <JsonLd data={lessonJsonLd} />
      <JsonLd data={breadcrumbs} />
      <LessonClient
        lesson={ctx.lesson}
        contentHtml={toc.html}
        sections={toc.sections}
        prev={ctx.prev}
        next={ctx.next}
        trackTitle={ctx.track.title}
        positionInTrack={ctx.positionInTrack}
        trackLength={ctx.trackLength}
      />
    </>
  );
}
