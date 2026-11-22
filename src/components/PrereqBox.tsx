import type { LessonPrereqs } from "@/lib/lessons";
import styles from "./lessonBrief.module.css";

/**
 * "What this lesson assumes": the background a lesson expects, in plain
 * language (not a topic checklist), plus 1-2 outside resources for anyone
 * missing it, so a gap in prior knowledge is a two-minute detour instead of a
 * reason to bounce off the lesson. Renders inside the lesson's "Before you
 * start" disclosure, whose one-line summary previews `prereqs.summary`.
 */
export default function PrereqBox({ prereqs }: { prereqs: LessonPrereqs }) {
  return (
    <div className={styles.item}>
      <p className={styles.itemLabel}>What this lesson assumes</p>
      <p className={styles.itemText}>{prereqs.summary}</p>
      {prereqs.resources && prereqs.resources.length > 0 && (
        <ul className={styles.links}>
          {prereqs.resources.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {r.label}
                <span className="sl-visually-hidden"> (opens in a new tab)</span>
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
                  <path d="M3 1.5h5.5V7M8.5 1.5 1.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
