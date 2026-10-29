import Link from "next/link";
import type { StudentMetrics } from "@/lib/cohorts/metrics";
import { isFinished, type LessonWork, type LessonWorkStatus, type StudentWork } from "@/lib/teach/studentWork";
import styles from "./studentWork.module.css";

const STATUS_LABEL: Record<LessonWorkStatus, string> = {
  passed: "Tests passed",
  completed: "Completed",
  attempted: "Working on it",
  "not-started": "Not started",
};

function shortDate(day: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
}

function shortTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone }).format(new Date(iso));
}

function Stat({ label, value, detail, tone }: { label: string; value: string; detail?: string; tone?: "warn" | "good" }) {
  return (
    <div className={styles.stat} data-tone={tone}>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={styles.statValue}>{value}</dd>
      {detail && <dd className={styles.statDetail}>{detail}</dd>}
    </div>
  );
}

function LessonRow({ work, timezone, lessonHref }: { work: LessonWork; timezone: string; lessonHref: (id: string) => string }) {
  const meta: string[] = [];
  if (work.dueOn) meta.push(`${work.overdue ? "Was due" : "Due"} ${shortDate(work.dueOn)}`);
  if (work.completedOn) meta.push(`Finished ${shortDate(work.completedOn)}`);
  else if (work.passedAt) meta.push(`Passed ${shortTime(work.passedAt, timezone)}`);

  return (
    <li className={styles.lesson} data-status={work.status} data-overdue={work.overdue || undefined}>
      <div className={styles.lessonHead}>
        <span className={styles.dot} aria-hidden="true" />
        <div className={styles.lessonText}>
          <Link href={lessonHref(work.lessonId)} className={styles.lessonTitle}>{work.title}</Link>
          <span className={styles.lessonMeta}>
            {work.trackTitle && <span>{work.trackTitle}</span>}
            {meta.map((m) => <span key={m}>{m}</span>)}
          </span>
        </div>
        <span className={styles.pill}>
          {work.overdue ? `Overdue · ${STATUS_LABEL[work.status].toLowerCase()}` : STATUS_LABEL[work.status]}
        </span>
      </div>
      {work.code !== null && (
        <details className={styles.code}>
          <summary>
            <span>{work.status === "passed" ? "View passing code" : "View latest code"}</span>
            {work.savedAt && <span className={styles.codeMeta}>saved {shortTime(work.savedAt, timezone)}</span>}
          </summary>
          <pre tabIndex={0} aria-label={`${work.title}: latest saved code`}>
            <code>{work.code}</code>
          </pre>
        </details>
      )}
    </li>
  );
}

/**
 * One student's work for their leader: where they are, what's overdue, and
 * the code they actually wrote. Shared by the class workspace and /demo, so
 * the demo can't drift from the product. Read-only.
 */
export default function StudentWorkView({
  name,
  className,
  backHref,
  joinedOn,
  lastActiveOn,
  work,
  metrics,
  timezone,
  capstoneHref,
  codeUnavailable = false,
  lessonHref = (id) => `/lesson/${id}`,
}: {
  name: string;
  className: string;
  backHref: string;
  joinedOn: string;
  lastActiveOn: string | null;
  work: StudentWork;
  metrics: StudentMetrics | null;
  timezone: string;
  capstoneHref: string | null;
  codeUnavailable?: boolean;
  lessonHref?: (lessonId: string) => string;
}) {
  const { counts } = work;
  const nextUp = work.assigned.find((w) => !isFinished(w.status));
  const weeks = work.assigned.reduce<Map<number | null, LessonWork[]>>((map, w) => {
    const list = map.get(w.weekNumber) ?? [];
    list.push(w);
    return map.set(w.weekNumber, list);
  }, new Map());

  return (
    <article className={styles.page} aria-labelledby="student-name">
      <p className={styles.back}>
        <Link href={backHref}>← {className}</Link>
      </p>

      <header className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          {name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?"}
        </span>
        <div>
          <h1 id="student-name" className={styles.name}>{name}</h1>
          <p className={styles.sub}>
            Joined {shortDate(joinedOn)} · {lastActiveOn ? `last active ${shortDate(lastActiveOn)}` : "no activity yet"}
          </p>
        </div>
      </header>

      {metrics?.needsHelp ? (
        <p className={styles.callout} data-tone="warn" role="note">
          <strong>Needs a nudge:</strong> {metrics.needsHelp}.
          {nextUp && <> Next up is <em>{nextUp.title}</em>.</>}
        </p>
      ) : nextUp ? (
        <p className={styles.callout} role="note">
          <strong>Next up:</strong> {nextUp.title}
          {nextUp.dueOn && <>, due {shortDate(nextUp.dueOn)}</>}.
        </p>
      ) : counts.assigned > 0 ? (
        <p className={styles.callout} data-tone="good" role="note">
          <strong>All assigned work is finished.</strong> Review the code below or open their capstone.
        </p>
      ) : null}

      <dl className={styles.stats}>
        <Stat
          label="Assigned work"
          value={counts.assigned ? `${counts.finished}/${counts.assigned}` : "—"}
          detail={counts.assigned ? "lessons finished" : "Nothing assigned yet"}
        />
        <Stat
          label="Overdue"
          value={String(counts.overdue)}
          tone={counts.overdue > 0 ? "warn" : undefined}
          detail={counts.overdue ? "past their due date" : "on schedule"}
        />
        <Stat
          label="Python exercises"
          value={counts.codeAssigned ? `${counts.codePassed}/${counts.codeAssigned}` : "—"}
          tone={counts.codeAssigned > 0 && counts.codePassed === counts.codeAssigned ? "good" : undefined}
          detail={counts.codeAssigned ? "passing their tests" : "None assigned"}
        />
        <Stat
          label="Capstone"
          value={metrics?.capstone ? (metrics.capstone.status === "submitted" ? "Submitted" : "Draft") : "—"}
          detail={metrics?.capstone?.submittedOn ? shortDate(metrics.capstone.submittedOn) : metrics?.capstone ? "in progress" : "Not started"}
        />
      </dl>

      {metrics && metrics.activeByWeek.length > 0 && (
        <section className={styles.weeks} aria-labelledby="weeks-title">
          <h2 id="weeks-title" className={styles.sectionTitle}>Activity by program week</h2>
          <ol className={styles.weekRow}>
            {metrics.activeByWeek.map((active, i) => (
              <li key={i} className={styles.week} data-state={active === null ? "future" : active ? "active" : "missed"}>
                <span className={styles.weekBox} aria-hidden="true" />
                <span className={styles.weekLabel}>Wk {i + 1}</span>
                <span className="sl-visually-hidden">
                  {active === null ? "not started yet" : active ? "finished assigned work" : "no assigned work finished"}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section aria-labelledby="assigned-title">
        <div className={styles.sectionHead}>
          <h2 id="assigned-title" className={styles.sectionTitle}>Assigned work</h2>
          {capstoneHref && <Link href={capstoneHref} className="v2-btn ghost sm">Open capstone →</Link>}
        </div>
        {codeUnavailable && (
          <p className={styles.note}>Saved code isn&rsquo;t available right now, so only completions are shown.</p>
        )}
        {work.assigned.length === 0 ? (
          <p className={styles.note}>No lessons are assigned to this class yet.</p>
        ) : (
          [...weeks.entries()].map(([week, lessons]) => (
            <div key={week ?? "unscheduled"} className={styles.weekGroup}>
              <h3 className={styles.weekTitle}>{week === null ? "Unscheduled" : `Week ${week}`}</h3>
              <ol className={styles.lessons}>
                {lessons.map((w) => <LessonRow key={w.lessonId} work={w} timezone={timezone} lessonHref={lessonHref} />)}
              </ol>
            </div>
          ))
        )}
      </section>

      {work.other.length > 0 && (
        <section aria-labelledby="other-title">
          <h2 id="other-title" className={styles.sectionTitle}>Also worked on</h2>
          <p className={styles.note}>Lessons outside this class&rsquo;s assignments.</p>
          <ol className={styles.lessons}>
            {work.other.map((w) => <LessonRow key={w.lessonId} work={w} timezone={timezone} lessonHref={lessonHref} />)}
          </ol>
        </section>
      )}

      <p className={styles.privacy}>
        Students are told that their leader can see their exercise code (<Link href="/privacy">privacy</Link>). It&rsquo;s
        read-only here, and nothing on this page is visible to other students.
      </p>
    </article>
  );
}
