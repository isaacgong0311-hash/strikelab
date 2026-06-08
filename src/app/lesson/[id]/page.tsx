import { getAllLessons, getLessonContext } from "@/lib/tracks";
import { notFound } from "next/navigation";
import LessonClient from "./LessonClient";

export async function generateStaticParams() {
  return getAllLessons().map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = getLessonContext(id);
  return { title: ctx ? `${ctx.lesson.title} — StrikeLab` : "Lesson — StrikeLab" };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = getLessonContext(id);
  if (!ctx) notFound();

  return (
    <LessonClient
      lesson={ctx.lesson}
      prev={ctx.prev}
      next={ctx.next}
      trackTitle={ctx.track.title}
      positionInTrack={ctx.positionInTrack}
      trackLength={ctx.trackLength}
    />
  );
}
