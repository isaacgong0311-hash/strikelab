"use client";

import { useSyncExternalStore } from "react";
import { ActionLink } from "@/components/ui/Action";
import { getLessonSessions, readSessionResults, resumeSession } from "@/lib/sessions";
import styles from "./lessonBrief.module.css";

const noopSubscribe = () => () => {};

/**
 * Offers the bite-sized version of a lesson when one exists, as one compact
 * row above the prose. Server-renders as "Start"; after hydration it resumes
 * at the first unfinished session.
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
    <aside className={styles.sessions} aria-labelledby={`sessions-${lessonId}`}>
      <div className={styles.sessionsText}>
        <h2 id={`sessions-${lessonId}`} className={styles.sessionsTitle}>
          Learn this in <span className="sl-num">{sessions.length}</span> short sessions
        </h2>
        <p className={styles.sessionsMeta}>
          One idea per screen, quick checks along the way.
          {doneCount > 0 ? <> <span className="sl-num">{doneCount} of {sessions.length}</span> done.</> : null}
        </p>
      </div>
      <ActionLink href={`/learn/${resume?.id ?? sessions[0].id}`} variant="secondary" size="sm" className={styles.sessionsAction}>
        {label}
      </ActionLink>
    </aside>
  );
}
