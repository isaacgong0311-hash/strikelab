/**
 * The weekly growth series across every launched cohort: the same numbers as
 * scripts/metrics/growth.sql, computed in TypeScript for the founder metrics
 * page. growth.db.test.ts runs both on one dataset so they can't drift.
 *
 * Weeks are UTC calendar weeks starting Monday (Postgres date_trunc('week')),
 * from the week of the first cohort's start to the current week. Completions
 * with unknown timestamps never count.
 */

export interface GrowthInput {
  cohorts: { id: string; startsOn: string }[];
  members: { classId: string; studentId: string; joinedAt: string }[];
  /** Assigned lessons (week_number not null) per cohort. */
  assignments: { classId: string; lessonId: string }[];
  completions: { userId: string; lessonId: string; completedAt: string | null }[];
  capstones: { classId: string; status: string; submittedAt: string | null }[];
  now: Date;
}

export interface GrowthWeek {
  weekStart: string;
  cohortsLaunched: number;
  enrolledCum: number;
  activeStudents: number;
  capstonesCum: number;
  /** Week-over-week growth of capstonesCum, in percent; null when the previous week is 0 or there is none. */
  capstonesWowPct: number | null;
  activeWowPct: number | null;
}

const DAY = 86_400_000;

function utcDay(iso: string): number {
  const d = new Date(iso);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Monday 00:00 UTC of the week containing `ms`. */
function mondayOf(ms: number): number {
  const day = new Date(ms).getUTCDay(); // 0 = Sunday
  return ms - ((day + 6) % 7) * DAY;
}

function key(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Postgres round(x, 1) on numeric: half away from zero. */
function round1(x: number): number {
  return (Math.sign(x) * Math.round(Math.abs(x) * 10)) / 10;
}

function wow(cur: number, prev: number | undefined): number | null {
  if (prev === undefined || prev === 0) return null;
  return round1((100 * (cur - prev)) / prev);
}

export function weeklyGrowth(input: GrowthInput): GrowthWeek[] {
  if (input.cohorts.length === 0) return [];
  const cohortIds = new Set(input.cohorts.map((c) => c.id));
  const cohortWeek = input.cohorts.map((c) => mondayOf(utcDay(`${c.startsOn}T00:00:00Z`)));
  const first = Math.min(...cohortWeek);
  const last = mondayOf(utcDay(input.now.toISOString()));

  const members = input.members.filter((m) => cohortIds.has(m.classId));
  const assigned = new Set(input.assignments.filter((a) => cohortIds.has(a.classId)).map((a) => `${a.classId}|${a.lessonId}`));
  const classesOf = new Map<string, string[]>();
  for (const m of members) classesOf.set(m.studentId, [...(classesOf.get(m.studentId) ?? []), m.classId]);

  // Distinct students per week who completed a lesson one of their cohorts assigned.
  const activeByWeek = new Map<number, Set<string>>();
  for (const c of input.completions) {
    if (!c.completedAt) continue;
    const counts = (classesOf.get(c.userId) ?? []).some((classId) => assigned.has(`${classId}|${c.lessonId}`));
    if (!counts) continue;
    const week = mondayOf(utcDay(c.completedAt));
    if (!activeByWeek.has(week)) activeByWeek.set(week, new Set());
    activeByWeek.get(week)!.add(c.userId);
  }

  const submitted = input.capstones.filter((c) => cohortIds.has(c.classId) && c.status === "submitted" && c.submittedAt);
  const rows: GrowthWeek[] = [];
  for (let week = first; week <= last; week += 7 * DAY) {
    const end = week + 7 * DAY;
    const prev = rows.at(-1);
    const activeStudents = activeByWeek.get(week)?.size ?? 0;
    const capstonesCum = submitted.filter((c) => new Date(c.submittedAt!).getTime() < end).length;
    rows.push({
      weekStart: key(week),
      cohortsLaunched: cohortWeek.filter((w) => w <= week).length,
      enrolledCum: members.filter((m) => new Date(m.joinedAt).getTime() < end).length,
      activeStudents,
      capstonesCum,
      capstonesWowPct: wow(capstonesCum, prev?.capstonesCum),
      activeWowPct: wow(activeStudents, prev?.activeStudents),
    });
  }
  return rows;
}
