import { addDaysToKey } from "@/lib/progress/streak";
import { ACTIVATION_WINDOW_DAYS, COMPLETION_GRACE_DAYS, type CohortMetrics, type Rate } from "./metrics";

/**
 * Aggregate snapshot of existing server-derived metrics, not a second metric
 * calculator. Never copy roster rows, class names, IDs, or student work here.
 * This is still sensitive for small cohorts and is not a public share link.
 */
export function cohortEvidenceRows(metrics: CohortMetrics, options: { sample: boolean }): string[][] {
  const firstWeek = metrics.weeks[0];
  const lastWeek = metrics.weeks.at(-1);
  const week4 = metrics.weeks[3];
  const rows: string[][] = [
    ["StrikeLab pilot summary", "Participation snapshot"],
    ["Data source", options.sample ? "SAMPLE DATA — fictional demo; not customer evidence" : "Cohort records — not independently verified"],
    ["Snapshot date", metrics.today],
    ["Date basis", "Cohort-local calendar dates; this is a snapshot, not a longitudinal comparison"],
    ["Definitions", "Cohort metrics v1; docs/gtm/metric-glossary.md"],
    ["Privacy", "No names or identifiers included. Review small-cohort aggregates before sharing."],
    ["Interpretation", "Activity and completion do not establish mastery, learning gains, or causal impact."],
    ["Commercial evidence", "Not included; this report does not verify payment, revenue, or renewal."],
    [],
    ["Metric", "Count", "Denominator", "Percent", "Status", "Window start", "Window end", "Definition"],
  ];

  function addRate(label: string, value: Rate | null, status: string, start: string, end: string, definition: string) {
    rows.push([
      label,
      value === null ? "" : String(value.count),
      value === null ? "" : String(value.of),
      value?.pct == null ? "" : `${value.pct}%`,
      status,
      start,
      end,
      definition,
    ]);
  }

  rows.push(["Enrolled", String(metrics.enrolled), "", "", "As of snapshot", "", metrics.today, "Current cohort members; not unique customers"]);
  addRate(
    "Activated",
    metrics.activated,
    metrics.enrolled === 0 ? "No enrolled students" : metrics.activated.pending > 0 ? "Preliminary — activation windows still open" : "Activation windows closed",
    "Per student",
    "Per student",
    `First assigned lesson completed by ${ACTIVATION_WINDOW_DAYS} days after the later of joining and cohort start; earlier recorded completions also count. Denominator is all enrolled students, including pending windows. Unknown completion dates do not qualify.`,
  );
  rows.push(["Activation pending", String(metrics.activated.pending), String(metrics.enrolled), "", "Not a failed activation", "Per student", "Per student", "Students whose activation window is still open and who have not yet activated"]);
  addRate(
    "Week-4 retained",
    metrics.week4Retained,
    !metrics.week4Retained
      ? "Not measured — week 4 has not started"
      : !metrics.week4Retained.final
        ? "Preliminary — week 4 in progress"
        : metrics.activated.pending > 0
          ? "Week 4 ended — activation denominator still pending"
          : "Week 4 ended",
    week4?.startsOn ?? "",
    week4?.endsOn ?? "",
    "Activated students with an assigned lesson completion during week 4 / activated students; not logins or diagnostic check completions",
  );
  addRate(
    "Capstone submitted",
    metrics.capstones,
    metrics.capstones === null ? "Unavailable — capstone data not enabled" : "As of snapshot — not graded mastery",
    firstWeek?.startsOn ?? "",
    metrics.today,
    "Activated students with a submitted capstone / activated students; submission is not a reviewed quality score",
  );
  addRate(
    "Program completed",
    metrics.programCompleted,
    metrics.programCompleted.final ? "Completion window closed" : "Preliminary — completion window still open",
    firstWeek?.startsOn ?? "",
    lastWeek ? addDaysToKey(lastWeek.endsOn, COMPLETION_GRACE_DAYS) : "",
    `All assigned lessons and, when enabled, a submitted capstone by ${COMPLETION_GRACE_DAYS} days after the program ends / all enrolled students. Legacy undated lesson completions count toward completion, not activation or weekly activity.`,
  );
  for (const week of metrics.weeks) {
    addRate(
      `Week ${week.week} active`,
      week.active === null ? null : { count: week.active, of: metrics.enrolled, pct: metrics.enrolled ? Math.round(week.active / metrics.enrolled * 100) : null },
      week.active === null ? "Not measured — week has not started" : metrics.today > week.endsOn ? "Week ended" : "Preliminary — week in progress",
      week.startsOn,
      week.endsOn,
      "Enrolled students with at least one dated assigned-lesson completion in this week / all currently enrolled students",
    );
  }
  return rows;
}
