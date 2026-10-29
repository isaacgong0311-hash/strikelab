import Link from "next/link";
import type { StudentMetrics } from "@/lib/cohorts/metrics";
import styles from "./scorecard.module.css";

export interface StudentsPanelEntry {
  studentId: string;
  displayName: string;
  lessonsCompleted: number;
  lastActivityDate: string | null;
}

function shortDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

/**
 * The workspace's Students tab: everyone in the class, the ones who need a
 * nudge first, each linking to their work. Cohort columns appear once the
 * class is a launched, measurable cohort; before that it's the plain roster.
 */
export default function StudentsPanel({
  classId,
  roster,
  students,
  totalLessons,
  hrefPrefix,
}: {
  classId: string;
  roster: StudentsPanelEntry[];
  /** Cohort metrics per student, or null when the class isn't a measurable cohort. */
  students: StudentMetrics[] | null;
  totalLessons: number;
  /** Where a student's name links (student id appended). */
  hrefPrefix?: string;
}) {
  const metricsById = new Map((students ?? []).map((s) => [s.studentId, s]));
  const rows = roster
    .map((r) => ({ ...r, m: metricsById.get(r.studentId) ?? null }))
    .sort((a, b) => Number(!!b.m?.needsHelp) - Number(!!a.m?.needsHelp) || a.displayName.localeCompare(b.displayName));
  const prefix = hrefPrefix ?? `/dashboard/class/${classId}/student/`;
  const helpCount = rows.filter((r) => r.m?.needsHelp).length;

  return (
    <section className={styles.card} aria-labelledby="students-title">
      <div className={styles.head}>
        <div>
          <h2 id="students-title" className={styles.title}>Students</h2>
          <p className={styles.note}>
            {rows.length === 0
              ? "Nobody has joined yet. Share the invite link from Settings."
              : `${rows.length} student${rows.length === 1 ? "" : "s"}${helpCount ? ` · ${helpCount} need${helpCount === 1 ? "s" : ""} a nudge` : ""}. Open a name to see their lessons and the code they wrote.`}
          </p>
        </div>
      </div>

      {rows.length > 0 && (
        <div className={styles.tableScroll} role="region" aria-label="Students table" tabIndex={0}>
          <table className={styles.progressTable}>
            <caption className="sl-visually-hidden">Each student&rsquo;s progress, with a link to their work</caption>
            <thead>
              <tr>
                <th scope="col">Student</th>
                {students && <th scope="col">Assigned done</th>}
                {students && <th scope="col">Overdue</th>}
                <th scope="col">All lessons</th>
                <th scope="col">Last active</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.studentId} className={r.m?.needsHelp ? styles.rowFlag : undefined}>
                  <th scope="row">
                    <Link href={`${prefix}${r.studentId}`} className={styles.studentLink}>{r.displayName}</Link>
                  </th>
                  {students && <td>{r.m ? `${r.m.lessonsDone} of ${r.m.lessonsTotal}` : "—"}</td>}
                  {students && <td>{r.m ? r.m.overdue : "—"}</td>}
                  <td>{r.lessonsCompleted} of {totalLessons}</td>
                  <td>{r.lastActivityDate ? shortDate(r.lastActivityDate) : "Never"}</td>
                  <td>{r.m?.needsHelp ?? (r.m?.programCompleted ? "Finished the program" : r.m ? "On track" : "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
