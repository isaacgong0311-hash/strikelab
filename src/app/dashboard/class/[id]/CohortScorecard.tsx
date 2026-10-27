"use client";

import Link from "next/link";
import { downloadCsv, toCsv } from "@/lib/csv";
import type { CohortScorecard as Scorecard } from "@/lib/cohorts/loadScorecard";
import { cohortEvidenceRows } from "@/lib/cohorts/evidence";
import styles from "./scorecard.module.css";

function shortDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T12:00:00Z`)
  );
}

function Tile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className={styles.tile}>
      <dt className={styles.tileLabel}>{label}</dt>
      <dd className={styles.tileValue}>{value}</dd>
      {detail && <dd className={styles.tileDetail}>{detail}</dd>}
    </div>
  );
}

/**
 * Pilot outcomes for the teacher. Every number arrives computed by the
 * server (src/lib/cohorts/metrics.ts); this only formats them.
 */
export default function CohortScorecard({
  scorecard,
  className,
  classId,
  capstoneHrefPrefix,
  studentHrefPrefix,
}: {
  scorecard: Scorecard;
  className: string;
  classId: string;
  /** Prefix for a capstone's "Open" link (id appended); the demo points at example capstones. */
  capstoneHrefPrefix?: string;
  /** Prefix for a student's work page (id appended); names are plain text without it. */
  studentHrefPrefix?: string;
}) {
  const studentName = (s: { studentId: string; displayName: string }) =>
    studentHrefPrefix ? <Link href={`${studentHrefPrefix}${s.studentId}`} className={styles.studentLink}>{s.displayName}</Link> : s.displayName;
  if (!scorecard.measurable) {
    return (
      <section className={styles.card} aria-labelledby="scorecard-title">
        <h2 id="scorecard-title" className={styles.title}>Cohort scorecard</h2>
        <p className={styles.note}>Not measurable yet: {scorecard.reason}</p>
      </section>
    );
  }

  const { metrics, csv } = scorecard;
  const helpList = metrics.students.filter((s) => s.needsHelp);
  const week4 = metrics.weeks[3];

  return (
    <section className={styles.card} aria-labelledby="scorecard-title">
      <div className={styles.head}>
        <div>
          <h2 id="scorecard-title" className={styles.title}>Cohort scorecard</h2>
          <p className={styles.note}>
            {metrics.status.kind === "week"
              ? `Week ${metrics.status.week} of ${metrics.weeks.length}`
              : metrics.status.kind === "break"
                ? "Break week"
                : metrics.status.kind === "before"
                  ? `Starts ${shortDate(metrics.weeks[0].startsOn)}`
                  : "Program finished"}
            {" · updated "}
            {shortDate(metrics.today)}
          </p>
        </div>
        <div className={styles.exportActions}>
          <button
            type="button"
            className="v2-btn ghost sm"
            onClick={() => downloadCsv(
              `${classId === "demo" ? "sample-" : ""}strikelab-pilot-summary-${metrics.today}.csv`,
              toCsv(cohortEvidenceRows(metrics, { sample: classId === "demo" })),
            )}
          >
            Export aggregate summary
          </button>
          {metrics.enrolled > 0 && (
            <button
              type="button"
              className="v2-btn ghost sm"
              onClick={() => downloadCsv(`${className || "cohort"}-outcomes.csv`, toCsv(csv))}
            >
              Export cohort CSV →
            </button>
          )}
        </div>
      </div>

      <dl className={styles.tiles}>
        <Tile label="Enrolled" value={String(metrics.enrolled)} />
        <Tile
          label="Activated"
          value={metrics.activated.pct === null ? "—" : `${metrics.activated.pct}%`}
          detail={`${metrics.activated.count} of ${metrics.activated.of}${metrics.activated.pending ? ` · ${metrics.activated.pending} still in their first week` : ""}`}
        />
        <Tile
          label="Active this week"
          value={metrics.activeThisWeek === null ? "—" : String(metrics.activeThisWeek)}
          detail={metrics.activeThisWeek === null ? "Outside a program week" : `of ${metrics.enrolled} enrolled`}
        />
        <Tile
          label="Week-4 retained"
          value={metrics.week4Retained?.pct != null ? `${metrics.week4Retained.pct}%` : "—"}
          detail={
            metrics.week4Retained
              ? `${metrics.week4Retained.count} of ${metrics.week4Retained.of} activated${!metrics.week4Retained.final ? " · week 4 in progress" : metrics.activated.pending > 0 ? " · activation pending" : ""}`
              : week4
                ? `Measured from ${shortDate(week4.startsOn)}`
                : undefined
          }
        />
        {metrics.capstones && (
          <Tile
            label="Capstones"
            value={metrics.capstones.pct === null ? "—" : `${metrics.capstones.pct}%`}
            detail={`${metrics.capstones.count} of ${metrics.capstones.of} activated submitted`}
          />
        )}
      </dl>

      <details className={styles.definitions}>
        <summary>What these numbers mean</summary>
        <ul>
          <li>Activated: first assigned lesson completed by seven days after joining or the program start, whichever is later. Earlier recorded completions count too. Pending windows remain in the enrolled denominator.</li>
          <li>Active: at least one dated assigned-lesson completion during that program week, not a login or a starting-point check.</li>
          <li>Week-4 retention: activated students who completed assigned work in week 4. The rate is preliminary while week 4 or activation windows remain open.</li>
          <li>Capstones: submitted work, not a reviewed mastery score. Completion and activity alone do not demonstrate learning gains.</li>
          <li>The aggregate summary omits student names and identifiers. The cohort CSV includes the roster; review small-cohort aggregates before sharing either file.</li>
        </ul>
      </details>

      <div className={styles.weeks} role="list" aria-label="Students active each week">
        {metrics.weeks.map((w) => {
          const pct = w.active !== null && metrics.enrolled ? Math.round((w.active / metrics.enrolled) * 100) : 0;
          return (
            <div key={w.week} className={styles.week} role="listitem" data-future={!w.started || undefined}>
              <div className={styles.weekBar} aria-hidden="true">
                <div className={styles.weekFill} style={{ height: `${pct}%` }} />
              </div>
              <span className={styles.weekLabel}>Wk {w.week}</span>
              <span className={styles.weekValue}>
                {w.active === null ? "—" : w.active}
                <span className="sl-visually-hidden">
                  {w.active === null ? " (not started)" : ` of ${metrics.enrolled} students active`}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <section className={styles.help} aria-labelledby="student-progress-title">
        <h3 id="student-progress-title" className={styles.helpTitle}>Student progress</h3>
        {metrics.students.length === 0 ? (
          <p className={styles.note}>Progress appears after students join and complete assigned work.</p>
        ) : (
          <div className={styles.tableScroll} role="region" aria-label="Student progress table" tabIndex={0}>
            <table className={styles.progressTable}>
              <caption className="sl-visually-hidden">Assigned work completed and support needed for each student</caption>
              <thead><tr><th scope="col">Student</th><th scope="col">Lessons done</th><th scope="col">Capstone</th><th scope="col">Next action</th></tr></thead>
              <tbody>
                {metrics.students.map((student) => (
                  <tr key={student.studentId}>
                    <th scope="row">{studentName(student)}</th>
                    <td>{student.lessonsDone} of {student.lessonsTotal}</td>
                    <td>{metrics.capstones === null ? "Unavailable" : student.capstone?.status === "submitted" ? "Submitted" : student.capstone ? "Draft" : "Not started"}</td>
                    <td>{student.needsHelp ?? (student.programCompleted ? "Review completed work" : "Continue assigned work")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {metrics.students.some((s) => s.capstone) && (
        <div className={styles.help}>
          <h3 className={styles.helpTitle}>Capstones</h3>
          <p className={styles.note}>Opening one is recorded, and the student can see when you did.</p>
          <ul className={styles.capstoneList}>
            {metrics.students
              .filter((s) => s.capstone)
              .map((s) => (
                <li key={s.studentId}>
                  <strong>{s.displayName}</strong>
                  <span className={styles.muted}>
                    {s.capstone!.status === "submitted"
                      ? `Submitted${s.capstone!.submittedOn ? ` ${shortDate(s.capstone!.submittedOn)}` : ""}`
                      : "Draft"}
                  </span>
                  <Link href={`${capstoneHrefPrefix ?? `/dashboard/class/${classId}/capstone/`}${s.capstone!.id}`}>Open</Link>
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className={styles.help}>
        <h3 className={styles.helpTitle}>Students needing help</h3>
        {helpList.length === 0 ? (
          <p className={styles.note}>Nobody needs a nudge right now.</p>
        ) : (
          <ul className={styles.helpList}>
            {helpList.map((s) => (
              <li key={s.studentId}>
                <strong>{studentName(s)}</strong>
                <span>{s.needsHelp}</span>
                {s.lastActiveOn && <span className={styles.muted}>Last active {shortDate(s.lastActiveOn)}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
