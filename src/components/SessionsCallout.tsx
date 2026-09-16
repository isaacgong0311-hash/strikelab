"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getLessonSessions, readSessionResults, resumeSession } from "@/lib/sessions";

const noopSubscribe = () => () => {};

/**
 * Offers the bite-sized version of a lesson when one exists. Server-renders
 * as "Start"; after hydration it resumes at the first unfinished session.
 */
export default function SessionsCallout({ lessonId }: { lessonId: string }) {
  const sessions = getLessonSessions(lessonId);
  const doneCount = useSyncExternalStore(
    noopSubscribe,
    () => sessions.filter((s) => readSessionResults()[s.id]).length,
    () => 0
  );
  if (sessions.length === 0) return null;

  const resume = doneCount > 0 && doneCount < sessions.length
    ? resumeSession(lessonId, readSessionResults())
    : sessions[0];
  const label = doneCount === 0 ? "Start" : doneCount < sessions.length ? "Continue" : "Practice again";

  return (
    <aside className="sl-sessions-callout" aria-labelledby={`sessions-${lessonId}`}>
      <div>
        <p className="sl-sessions-callout-eyebrow">New · bite-sized</p>
        <h2 id={`sessions-${lessonId}`} className="sl-sessions-callout-title">
          Learn this in {sessions.length} short sessions
        </h2>
        <p className="sl-sessions-callout-meta">
          One idea per screen, quick checks along the way.
          {doneCount > 0 ? ` ${doneCount} of ${sessions.length} done.` : ""}
        </p>
      </div>
      <Link href={`/learn/${resume?.id ?? sessions[0].id}`} className="sl-sessions-callout-action">
        {label}
      </Link>
    </aside>
  );
}
