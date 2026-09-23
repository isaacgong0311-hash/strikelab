import Link from "next/link";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import type { CohortNextAction, CohortWeekItem, StudentCohortView } from "@/lib/cohorts/studentView";
import styles from "./cohort.module.css";

function shortDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T12:00:00Z`)
  );
}

function dueLabel(action: CohortNextAction): string {
  if (action.daysLeft === null || !action.dueOn) return "";
  if (action.overdue) return `Was due ${shortDate(action.dueOn)}`;
  if (action.daysLeft === 0) return "Due today";
  if (action.daysLeft === 1) return "Due tomorrow";
  return `Due ${shortDate(action.dueOn)} · ${action.daysLeft} days left`;
}

function statusLine(view: StudentCohortView): string {
  switch (view.status.kind) {
    case "before":
      return view.daysUntilStart === 1 ? "Starts tomorrow" : `Starts in ${view.daysUntilStart} days`;
    case "week":
      return `Week ${view.status.week} of ${view.weeks.length}`;
    case "break":
      return `Break week · week ${view.focusWeek} starts ${shortDate(view.weeks[view.focusWeek - 1].startsOn)}`;
    case "after":
      return "Program complete";
  }
}

function LessonRow({ lesson }: { lesson: CohortWeekItem["lessons"][number] }) {
  return (
    <li className={styles.lesson} data-done={lesson.done || undefined}>
      <span className={styles.check} aria-hidden="true">{lesson.done ? "✓" : ""}</span>
      <Link href={lesson.href} className={styles.lessonLink}>
        <span className={styles.lessonTitle}>{lesson.title}</span>
        <span className={styles.lessonMeta}>
          {lesson.done ? "Done" : lesson.sessionCount > 0 ? `${lesson.sessionCount} short sessions` : "Lesson"}
        </span>
        <span className="sl-visually-hidden">{lesson.done ? ", completed" : ", not completed yet"}</span>
      </Link>
    </li>
  );
}

/** The cohort home for a launched cohort. Pure markup from the view, no data access. */
export interface CohortCapstoneSummary {
  status: "none" | "draft" | "submitted";
}

export default function CohortHomeView({
  classId,
  className,
  view,
  capstone,
  embedded = false,
  capstoneHref,
}: {
  classId: string;
  className: string;
  view: StudentCohortView;
  /** Null when capstones aren't available (before migration 0019). */
  capstone: CohortCapstoneSummary | null;
  /** Rendered inside another page (demo, homepage): headings drop one level. */
  embedded?: boolean;
  /** Where the capstone card links; defaults to the cohort's capstone page. */
  capstoneHref?: string;
}) {
  const H1 = embedded ? "h2" : "h1";
  const H2 = embedded ? "h3" : "h2";
  const focus = view.weeks[view.focusWeek - 1];
  const action = view.nextAction;
  const pct = view.progress.total ? Math.round((view.progress.done / view.progress.total) * 100) : 0;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.kicker}>{className}</p>
        <H1 className={styles.title}>{QUANT_FOUNDATIONS_TEMPLATE.name}</H1>
        <p className={styles.status}>{statusLine(view)}</p>
        <div className={styles.progress}>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label="Program progress"
            aria-valuemin={0}
            aria-valuemax={view.progress.total}
            aria-valuenow={view.progress.done}
            aria-valuetext={`${view.progress.done} of ${view.progress.total} lessons done`}
          >
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <span className={styles.progressCount}>{view.progress.done}/{view.progress.total}</span>
        </div>
      </header>

      <section className={styles.next} aria-labelledby="next-title" data-overdue={action?.overdue || undefined}>
        {action ? (
          <>
            <p className={styles.nextEyebrow} id="next-title">
              {action.overdue ? "Catch up" : action.week > view.focusWeek ? "Get ahead" : "Up next"}
            </p>
            <H2 className={styles.nextTitle}>{action.title}</H2>
            <p className={styles.nextMeta}>
              Week {action.week}
              {dueLabel(action) ? ` · ${dueLabel(action)}` : ""}
            </p>
            <Link href={action.href} className={styles.primary}>
              {action.sessionsDone > 0 ? "Continue" : "Start"} →
            </Link>
          </>
        ) : (
          <>
            <p className={styles.nextEyebrow} id="next-title">All caught up</p>
            <H2 className={styles.nextTitle}>Every assigned lesson is done</H2>
            <p className={styles.nextMeta}>Nice work. Review a lesson or explore the rest of the curriculum.</p>
            <Link href="/lessons" className={styles.primary}>Explore lessons →</Link>
          </>
        )}
      </section>

      {capstone && (
        <section className={styles.capstone} aria-labelledby="capstone-title">
          <div>
            <H2 id="capstone-title" className={styles.weekTitle}>Your capstone</H2>
            <p className={styles.muted}>
              {capstone.status === "submitted"
                ? "Submitted. You can keep improving it until the program ends."
                : capstone.status === "draft"
                  ? "Draft saved. Finish and submit it by the end of week 6."
                  : view.focusWeek >= 5
                    ? "Time to start: pick a prompt and build the piece of work you'll show."
                    : "Your week-6 project. You can look at the prompts now."}
            </p>
          </div>
          <Link href={capstoneHref ?? `/cohort/${classId}/capstone`} className={styles.secondaryLink}>
            {capstone.status === "none" ? "Open capstone" : capstone.status === "draft" ? "Continue capstone" : "View capstone"}
          </Link>
        </section>
      )}

      <section className={styles.week} aria-labelledby="focus-week-title">
        <div className={styles.weekHead}>
          <H2 id="focus-week-title" className={styles.weekTitle}>
            Week {focus.week}: {focus.title}
          </H2>
          <span className={styles.weekDates}>Due {shortDate(focus.endsOn)}</span>
        </div>
        <ul className={styles.lessons}>
          {focus.lessons.map((lesson) => (
            <LessonRow key={lesson.lessonId} lesson={lesson} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="all-weeks-title" className={styles.allWeeks}>
        <H2 id="all-weeks-title" className={styles.sectionTitle}>All six weeks</H2>
        <ol className={styles.weekList}>
          {view.weeks.map((week) => (
            <li key={week.week} className={styles.weekItem} data-current={week.week === view.focusWeek || undefined}>
              <details>
                <summary className={styles.weekSummary}>
                  <span className={styles.weekNumber} data-done={week.done || undefined}>
                    {week.done ? "✓" : week.week}
                  </span>
                  <span className={styles.weekSummaryText}>
                    <strong>{week.title}</strong>
                    <small>
                      {shortDate(week.startsOn)} to {shortDate(week.endsOn)} · {week.lessons.filter((l) => l.done).length}/
                      {week.lessons.length} done
                    </small>
                  </span>
                </summary>
                <ul className={styles.lessons}>
                  {week.lessons.map((lesson) => (
                    <LessonRow key={lesson.lessonId} lesson={lesson} />
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ol>
      </section>

      <p className={styles.footerNote}>
        The rest of the curriculum stays open: <Link href="/lessons">browse every lesson</Link>.
      </p>
    </div>
  );
}
