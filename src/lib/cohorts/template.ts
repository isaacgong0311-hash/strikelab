export const QUANT_FOUNDATIONS_TEMPLATE_ID = "quant-foundations-v1";

export interface CohortTemplateWeek {
  week: number;
  title: string;
  lessonIds: readonly string[];
}

export interface CohortScheduleRow {
  lessonId: string;
  weekNumber: number;
  position: number;
  dueOn: string;
}

export const QUANT_FOUNDATIONS_TEMPLATE: {
  id: typeof QUANT_FOUNDATIONS_TEMPLATE_ID;
  name: string;
  description: string;
  weeks: readonly CohortTemplateWeek[];
} = {
  id: QUANT_FOUNDATIONS_TEMPLATE_ID,
  name: "Quant Foundations Lab",
  description: "A six-week, code-first introduction to markets, options pricing, risk, and research.",
  weeks: [
    { week: 1, title: "Markets and risk", lessonIds: ["inv-1", "inv-2", "inv-5"] },
    { week: 2, title: "Options and payoffs", lessonIds: ["1", "2"] },
    { week: 3, title: "Pricing", lessonIds: ["3"] },
    { week: 4, title: "Risk sensitivities", lessonIds: ["4", "5", "6", "7"] },
    { week: 5, title: "Research discipline", lessonIds: ["q3"] },
    { week: 6, title: "Portfolio capstone", lessonIds: ["q4"] },
  ],
};

function parseDateOnly(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("startsOn must be a real YYYY-MM-DD date");
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error("startsOn must be a real YYYY-MM-DD date");
  }
  return parsed;
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Most holiday weeks a cohort can skip (e.g. Thanksgiving plus winter break). */
export const MAX_SKIP_WEEKS = 3;

export interface CohortWeekWindow {
  week: number;
  /** First day of the cohort week (YYYY-MM-DD). */
  startsOn: string;
  /** Last day of the cohort week, inclusive; assignments are due this day. */
  endsOn: string;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * The seven-day blocks a cohort meets in. Blocks start on `startsOn` and
 * every 7 days after; a block whose start date is in `skipWeeks` is a break
 * (no week number, nothing due), and the program resumes the block after.
 * Skip dates must be block starts after week 1, so they line up with the
 * teacher's meeting day.
 */
export function cohortWeekWindows(startsOn: string, skipWeeks: readonly string[] = []): CohortWeekWindow[] {
  const start = parseDateOnly(startsOn);
  const skips = new Set(skipWeeks);
  if (skips.size > MAX_SKIP_WEEKS) {
    throw new Error(`skipWeeks can hold at most ${MAX_SKIP_WEEKS} weeks`);
  }

  const totalWeeks = QUANT_FOUNDATIONS_TEMPLATE.weeks.length;
  const windows: CohortWeekWindow[] = [];
  const used = new Set<string>();
  for (let block = 0; windows.length < totalWeeks; block++) {
    const blockStart = formatDateOnly(addDays(start, block * 7));
    if (skips.has(blockStart)) {
      used.add(blockStart);
      continue;
    }
    windows.push({
      week: windows.length + 1,
      startsOn: blockStart,
      endsOn: formatDateOnly(addDays(start, block * 7 + 6)),
    });
  }

  // Anything left over wasn't a block start inside the program.
  if (used.size !== skips.size || skips.has(startsOn)) {
    throw new Error("skipWeeks must be cohort week start dates after week 1");
  }
  return windows;
}

/** Break weeks a teacher can pick from: every block start after week 1 that could fall inside the program. */
export function skipWeekOptions(startsOn: string): string[] {
  const start = parseDateOnly(startsOn);
  const lastBlock = QUANT_FOUNDATIONS_TEMPLATE.weeks.length - 1 + MAX_SKIP_WEEKS;
  return Array.from({ length: lastBlock }, (_, i) => formatDateOnly(addDays(start, (i + 1) * 7)));
}

/**
 * Drop break weeks that no longer fall inside the program (e.g. after a
 * teacher un-checks an earlier break, a late one can end up past the last
 * week). Returns a sorted list that cohortWeekWindows accepts.
 */
export function pruneSkipWeeks(startsOn: string, skipWeeks: readonly string[]): string[] {
  const options = new Set(skipWeekOptions(startsOn));
  let kept = [...new Set(skipWeeks)].filter((d) => options.has(d)).sort().slice(0, MAX_SKIP_WEEKS);
  while (kept.length > 0) {
    try {
      cohortWeekWindows(startsOn, kept);
      return kept;
    } catch {
      kept = kept.slice(0, -1);
    }
  }
  return kept;
}

export type CohortDayStatus =
  | { kind: "before" }
  | { kind: "week"; week: number }
  | { kind: "break" }
  | { kind: "after" };

/** Where a calendar day (YYYY-MM-DD, in the cohort's timezone) falls in the program. */
export function cohortDayStatus(day: string, windows: readonly CohortWeekWindow[]): CohortDayStatus {
  if (windows.length === 0 || day < windows[0].startsOn) return { kind: "before" };
  if (day > windows[windows.length - 1].endsOn) return { kind: "after" };
  const current = windows.find((w) => day >= w.startsOn && day <= w.endsOn);
  return current ? { kind: "week", week: current.week } : { kind: "break" };
}

/** Build one assignment row per lesson, due on the final day of its cohort week. */
export function buildCohortSchedule(startsOn: string, skipWeeks: readonly string[] = []): CohortScheduleRow[] {
  const windows = cohortWeekWindows(startsOn, skipWeeks);

  return QUANT_FOUNDATIONS_TEMPLATE.weeks.flatMap((week) =>
    week.lessonIds.map((lessonId, index) => ({
      lessonId,
      weekNumber: week.week,
      position: index + 1,
      dueOn: windows[week.week - 1].endsOn,
    }))
  );
}
