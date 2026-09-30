import { localDateKey } from "@/lib/progress/streak";
import { cohortDayStatus, cohortWeekWindows, QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import { readableDate } from "@/lib/cohorts/launch";
import type { CohortMetrics } from "@/lib/cohorts/metrics";

/**
 * One card on the teacher home (/teach): where the class is in the program,
 * a few honest numbers, and the single most useful next step. Pure, so the
 * demo fixtures and real classes go through the same logic.
 */
export interface TeacherClassInput {
  id: string;
  name: string;
  templateId: string | null;
  startsOn: string | null;
  timezone: string | null;
  skipWeeks: string[];
  memberCount: number;
  /** Null when the class isn't a launched cohort or can't be measured yet. */
  metrics: CohortMetrics | null;
}

export type TeacherClassState = "not-scheduled" | "no-students" | "before" | "week" | "break" | "finished";

export interface TeacherClassCard {
  id: string;
  name: string;
  state: TeacherClassState;
  status: string;
  stats: { label: string; value: string }[];
  next: { label: string; href: string };
  /** Shown beside the next action on finished classes. */
  secondary: { label: string; href: string } | null;
}

const WEEKS = QUANT_FOUNDATIONS_TEMPLATE.weeks.length;

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function buildTeacherClassCard(input: TeacherClassInput, now: Date = new Date()): TeacherClassCard {
  const classHref = `/dashboard/class/${input.id}`;
  const inviteHref = `/teach/${input.id}/invite`;
  const base = { id: input.id, name: input.name, secondary: null };
  const students = { label: "Students", value: String(input.memberCount) };

  if (!input.templateId || !input.startsOn) {
    return {
      ...base,
      state: "not-scheduled",
      status: "The six weeks aren't scheduled yet",
      stats: [students],
      next: { label: "Schedule the six weeks", href: classHref },
    };
  }

  const windows = cohortWeekWindows(input.startsOn, input.skipWeeks);
  const today = localDateKey(now, input.timezone ?? "UTC");
  const day = input.metrics?.status ?? cohortDayStatus(today, windows);
  const end = windows.at(-1)?.endsOn ?? input.startsOn;

  const status =
    day.kind === "before"
      ? `Starts ${readableDate(input.startsOn)}`
      : day.kind === "week"
        ? `Week ${day.week} of ${WEEKS}: ${QUANT_FOUNDATIONS_TEMPLATE.weeks[day.week - 1].title}`
        : day.kind === "break"
          ? "Break week: nothing is due"
          : `Finished ${readableDate(end)}`;

  if (input.memberCount === 0 && day.kind !== "after") {
    return {
      ...base,
      state: "no-students",
      status,
      stats: [students],
      next: { label: "Invite your students", href: inviteHref },
    };
  }

  const m = input.metrics;
  const needsHelp = m ? m.students.filter((s) => s.needsHelp).length : 0;
  const stats = [students];
  if (m) {
    stats.push({ label: "Activated", value: m.activated.pct === null ? "–" : `${m.activated.pct}%` });
    if (m.activeThisWeek !== null) stats.push({ label: "Active this week", value: String(m.activeThisWeek) });
    if (day.kind === "week" || day.kind === "break") stats.push({ label: "Need a nudge", value: String(needsHelp) });
    if (day.kind === "after") stats.push({ label: "Finished the program", value: `${m.programCompleted.count}` });
  }

  switch (day.kind) {
    case "before":
      return { ...base, state: "before", status, stats, next: { label: "Get ready for kickoff", href: inviteHref } };
    case "week":
      return {
        ...base,
        state: "week",
        status,
        stats,
        next:
          needsHelp > 0
            ? { label: `Nudge ${plural(needsHelp, "student")}`, href: `${classHref}#toolkit-title` }
            : { label: "Send this week's message", href: `${classHref}#toolkit-title` },
      };
    case "break":
      return { ...base, state: "break", status, stats, next: { label: "See the scorecard", href: classHref } };
    case "after":
      return {
        ...base,
        state: "finished",
        status,
        stats,
        next: { label: "See results and export", href: classHref },
        secondary: { label: "Run it again", href: "/teach/new" },
      };
  }
}
