import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLessonContext } from "@/lib/tracks";
import { getLessonSessions, getNextSession, getSession, SESSIONS } from "@/lib/sessions";
import SessionPlayer from "./SessionPlayer";

export async function generateStaticParams() {
  return SESSIONS.map((s) => ({ sessionId: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ sessionId: string }> }): Promise<Metadata> {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) return { title: "Session" };
  const lesson = getLessonContext(session.lessonId)?.lesson;
  return {
    title: `${session.title} · ${lesson?.title ?? "Lesson"}`,
    // Sessions restate the long-form lesson, which stays the canonical page.
    alternates: { canonical: `/lesson/${session.lessonId}` },
    robots: { index: false, follow: true },
  };
}

export default async function LearnSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  const ctx = session ? getLessonContext(session.lessonId) : undefined;
  if (!session || !ctx) notFound();

  const lessonSessions = getLessonSessions(session.lessonId);

  return (
    <SessionPlayer
      key={session.id}
      session={session}
      lessonTitle={ctx.lesson.title}
      sessionIds={lessonSessions.map((s) => s.id)}
      nextSessionId={getNextSession(session.id)?.id ?? null}
    />
  );
}
