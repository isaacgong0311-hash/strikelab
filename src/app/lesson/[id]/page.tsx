import { TRACKS, getLessonById } from "@/lib/curriculum";
import { notFound } from "next/navigation";
import LessonClient from "./LessonClient";

export async function generateStaticParams() {
  const params = [];
  for (const track of TRACKS) {
    for (const lesson of track.lessons) {
      params.push({ id: lesson.id });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLessonById(id);
  return { title: lesson ? `${lesson.title} — StrikeLab` : "Lesson — StrikeLab" };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLessonById(id);
  if (!lesson) notFound();

  // Find lesson index across all tracks
  let currentIndex = -1;
  let allLessons = [];
  for (const track of TRACKS) {
    allLessons = allLessons.concat(track.lessons);
  }
  currentIndex = allLessons.findIndex((l) => l.id === id);

  const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return <LessonClient lesson={lesson} prev={prev} next={next} />;
}
