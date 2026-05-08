import { LESSONS, getLessonById } from "@/lib/lessons";
import { notFound } from "next/navigation";
import LessonClient from "./LessonClient";

export async function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
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

  const currentIndex = LESSONS.findIndex((l) => l.id === id);
  const prev = LESSONS[currentIndex - 1] ?? null;
  const next = LESSONS[currentIndex + 1] ?? null;

  return <LessonClient lesson={lesson} prev={prev} next={next} />;
}
