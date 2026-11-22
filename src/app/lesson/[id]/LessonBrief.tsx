import Link from "next/link";
import type { Lesson } from "@/lib/lessons";
import DeskBriefing from "@/components/DeskBriefing";
import PrereqBox from "@/components/PrereqBox";
import SessionsCallout from "@/components/SessionsCallout";
import { getLessonSessions } from "@/lib/sessions";
import styles from "@/components/lessonBrief.module.css";

export interface StartHere {
  id: string;
  title: string;
  href: string;
}

/**
 * Everything that used to stack above the first paragraph (a yellow desk-head
 * box, a "Before this lesson" box, the short-sessions card) as one compact
 * panel. The briefing and prerequisites sit in a native <details>, closed by
 * default and working without JavaScript; its summary previews what the
 * lesson assumes so nobody has to open it to find out.
 */
export default function LessonBrief({ lesson, startHere }: { lesson: Lesson; startHere?: StartHere | null }) {
  const hasDetails = Boolean(lesson.deskBriefing || lesson.prereqs);
  const hasSessions = getLessonSessions(lesson.id).length > 0;
  if (!hasDetails && !startHere && !hasSessions) return null;

  return (
    <div className={styles.brief}>
      {hasDetails && (
        <details className={styles.details}>
          <summary>
            <span className={styles.summaryLabel}>Before you start</span>
            <span className={styles.summaryPreview} aria-hidden="true">
              {lesson.prereqs?.summary ?? lesson.deskBriefing}
            </span>
            <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
              <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <div className={styles.body}>
            {lesson.deskBriefing && <DeskBriefing text={lesson.deskBriefing} />}
            {lesson.prereqs && <PrereqBox prereqs={lesson.prereqs} />}
          </div>
        </details>
      )}
      {startHere && (
        <p className={styles.row}>
          New to finance? The first lesson is <Link href={startHere.href}>{startHere.title}</Link>.
        </p>
      )}
      <SessionsCallout lessonId={lesson.id} />
    </div>
  );
}
