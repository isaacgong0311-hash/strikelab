import type { SupabaseClient } from "@supabase/supabase-js";
import { loadCohortScorecard } from "@/lib/cohorts/loadScorecard";
import type { OwnedClass } from "@/lib/classes";
import type { TeacherClassInput } from "./classCard";

/**
 * Every class the signed-in teacher owns, with scorecard metrics for launched
 * cohorts. The query runs on the teacher's own session (RLS limits it to
 * teacher_id = auth.uid()), which is the ownership check loadCohortScorecard
 * requires before it reads across students.
 */
export async function loadTeacherClasses(supabase: SupabaseClient, userId: string): Promise<TeacherClassInput[] | null> {
  const { data, error } = await supabase
    .from("classes")
    // "*" so a deploy that lands before migration 0017 (skip_weeks) still loads.
    .select("*, class_members(count)")
    .eq("teacher_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[teach] classes", error.message);
    return null;
  }

  return Promise.all(
    (data ?? []).map(async (c) => {
      const klass: OwnedClass = {
        id: c.id as string,
        name: c.name as string,
        templateId: (c.template_id as string | null) ?? null,
        startsOn: (c.starts_on as string | null) ?? null,
        timezone: (c.timezone as string | null) ?? null,
        launchedAt: (c.launched_at as string | null) ?? null,
        skipWeeks: Array.isArray(c.skip_weeks) ? (c.skip_weeks as string[]) : [],
        joinCode: c.join_code as string,
      };
      const memberCount = Array.isArray(c.class_members) ? ((c.class_members[0] as { count?: number })?.count ?? 0) : 0;
      const scorecard = memberCount > 0 ? await loadCohortScorecard(klass) : null;
      return {
        id: klass.id,
        name: klass.name,
        templateId: klass.templateId,
        startsOn: klass.startsOn,
        timezone: klass.timezone,
        skipWeeks: klass.skipWeeks,
        memberCount,
        metrics: scorecard?.measurable ? scorecard.metrics : null,
      };
    })
  );
}
