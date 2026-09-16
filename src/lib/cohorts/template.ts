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

/** Build one assignment row per lesson, due on the final day of its cohort week. */
export function buildCohortSchedule(startsOn: string): CohortScheduleRow[] {
  const start = parseDateOnly(startsOn);

  return QUANT_FOUNDATIONS_TEMPLATE.weeks.flatMap((week) => {
    const due = new Date(start);
    due.setUTCDate(due.getUTCDate() + week.week * 7 - 1);

    return week.lessonIds.map((lessonId, index) => ({
      lessonId,
      weekNumber: week.week,
      position: index + 1,
      dueOn: formatDateOnly(due),
    }));
  });
}
