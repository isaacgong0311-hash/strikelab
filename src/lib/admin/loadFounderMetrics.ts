import type { SupabaseClient } from "@supabase/supabase-js";
import { loadCohortScorecard } from "@/lib/cohorts/loadScorecard";
import type { CohortMetrics } from "@/lib/cohorts/metrics";
import { weeklyGrowth, type GrowthWeek } from "./growth";

/**
 * Everything the founder metrics page shows (mega plan Q10): each launched
 * cohort's scorecard numbers and the weekly growth series. Aggregates only:
 * student names stay in the leaders' own scorecards and never leave this
 * module. Reads across every class with the admin client, so the caller must
 * have checked isFounder() first.
 */
export interface FounderCohortRow {
  name: string;
  leaderSource: string;
  startsOn: string;
  status: CohortMetrics["status"] | null;
  enrolled: number | null;
  activatedPct: number | null;
  activeThisWeek: number | null;
  week4RetainedPct: number | null;
  capstones: number | null;
  /** Set when the numbers can't be computed (e.g. a migration isn't applied). */
  unavailable?: string;
}

export interface FounderMetrics {
  cohorts: FounderCohortRow[];
  growth: GrowthWeek[];
}

interface ClassRow {
  id: string;
  name: string;
  teacher_id: string;
  template_id: string | null;
  starts_on: string;
  timezone: string | null;
  skip_weeks: string[] | null;
  launched_at: string | null;
}

export async function loadFounderMetrics(admin: SupabaseClient, now: Date = new Date()): Promise<FounderMetrics> {
  const { data: classRows } = await admin
    .from("classes")
    .select("id, name, teacher_id, template_id, starts_on, timezone, skip_weeks, launched_at")
    .not("template_id", "is", null)
    .not("starts_on", "is", null)
    .order("starts_on", { ascending: true });
  const classes = (classRows ?? []) as ClassRow[];
  if (classes.length === 0) return { cohorts: [], growth: [] };

  const classIds = classes.map((c) => c.id);
  const teacherIds = [...new Set(classes.map((c) => c.teacher_id))];
  const [{ data: teachers }, { data: members }, { data: assignments }, capstonesRes] = await Promise.all([
    admin.from("profiles").select("id, signup_source").in("id", teacherIds),
    admin.from("class_members").select("class_id, student_id, joined_at").in("class_id", classIds),
    admin.from("assignments").select("class_id, lesson_id").in("class_id", classIds).not("week_number", "is", null),
    admin.from("capstone_submissions").select("class_id, status, submitted_at").in("class_id", classIds),
  ]);
  const studentIds = [...new Set((members ?? []).map((m) => m.student_id as string))];
  const { data: completions } = studentIds.length
    ? await admin.from("lesson_completions").select("user_id, lesson_id, completed_at").in("user_id", studentIds).not("completed_at", "is", null)
    : { data: [] };

  const sourceOf = new Map((teachers ?? []).map((t) => [t.id as string, (t.signup_source as string | null) || "(none)"]));

  const cohorts = await Promise.all(
    classes.map(async (c): Promise<FounderCohortRow> => {
      const base = { name: c.name, leaderSource: sourceOf.get(c.teacher_id) ?? "(none)", startsOn: c.starts_on };
      const scorecard = await loadCohortScorecard({
        id: c.id,
        name: c.name,
        templateId: c.template_id,
        startsOn: c.starts_on,
        timezone: c.timezone,
        launchedAt: c.launched_at,
        skipWeeks: c.skip_weeks ?? [],
        joinCode: "",
      });
      if (!scorecard || !scorecard.measurable) {
        return { ...base, status: null, enrolled: null, activatedPct: null, activeThisWeek: null, week4RetainedPct: null, capstones: null, unavailable: scorecard?.reason ?? "Not a launched cohort." };
      }
      const m = scorecard.metrics;
      return {
        ...base,
        status: m.status,
        enrolled: m.enrolled,
        activatedPct: m.activated.pct,
        activeThisWeek: m.activeThisWeek,
        week4RetainedPct: m.week4Retained?.pct ?? null,
        capstones: m.capstones?.count ?? null,
      };
    })
  );

  const growth = weeklyGrowth({
    cohorts: classes.map((c) => ({ id: c.id, startsOn: c.starts_on })),
    members: (members ?? []).map((m) => ({ classId: m.class_id as string, studentId: m.student_id as string, joinedAt: m.joined_at as string })),
    assignments: (assignments ?? []).map((a) => ({ classId: a.class_id as string, lessonId: a.lesson_id as string })),
    completions: (completions ?? []).map((c) => ({ userId: c.user_id as string, lessonId: c.lesson_id as string, completedAt: (c.completed_at as string | null) ?? null })),
    // Before migration 0019 there are no capstones; the series then shows zeros.
    capstones: capstonesRes.error
      ? []
      : (capstonesRes.data ?? []).map((c) => ({ classId: c.class_id as string, status: c.status as string, submittedAt: (c.submitted_at as string | null) ?? null })),
    now,
  });

  return { cohorts, growth };
}
