import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { rateLimit } from "@/lib/rateLimit";
import { requireTeacherOwnsClass } from "@/lib/classes";
import {
  QUANT_FOUNDATIONS_TEMPLATE,
  QUANT_FOUNDATIONS_TEMPLATE_ID,
  MAX_SKIP_WEEKS,
  buildCohortSchedule,
} from "@/lib/cohorts/template";

function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(0);
    return true;
  } catch {
    return false;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const limited = await rateLimit(auth.supabase, "class-launch");
  if (limited) return limited;

  const { id } = await params;
  const owned = await requireTeacherOwnsClass(auth.supabase, auth.userId, id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  const body = (await req.json().catch(() => ({}))) as {
    startsOn?: unknown;
    timezone?: unknown;
    skipWeeks?: unknown;
  };
  const startsOn = typeof body.startsOn === "string" ? body.startsOn : "";
  const timezone = typeof body.timezone === "string" ? body.timezone.trim() : "";
  const skipWeeks = body.skipWeeks ?? [];
  if (!Array.isArray(skipWeeks) || !skipWeeks.every((d): d is string => typeof d === "string")) {
    return NextResponse.json({ error: "Break weeks must be a list of dates" }, { status: 400 });
  }

  // Check the start date alone first so the error names the right field.
  let schedule;
  try {
    schedule = buildCohortSchedule(startsOn);
  } catch {
    return NextResponse.json({ error: "Enter a valid start date" }, { status: 400 });
  }
  try {
    schedule = buildCohortSchedule(startsOn, skipWeeks);
  } catch {
    return NextResponse.json(
      { error: `Break weeks must be meeting weeks after week 1 (at most ${MAX_SKIP_WEEKS})` },
      { status: 400 },
    );
  }

  if (!timezone || !isValidTimezone(timezone)) {
    return NextResponse.json({ error: "Enter a valid timezone" }, { status: 400 });
  }

  const rpcSchedule = schedule.map((row) => ({
    lesson_id: row.lessonId,
    week_number: row.weekNumber,
    position: row.position,
    due_on: row.dueOn,
  }));
  const { error } = await auth.supabase.rpc("launch_cohort", {
    p_class_id: id,
    p_template_id: QUANT_FOUNDATIONS_TEMPLATE_ID,
    p_starts_on: startsOn,
    p_timezone: timezone,
    p_schedule: rpcSchedule,
    // Only sent when used, so launches without breaks keep working against
    // the pre-0017 function signature.
    ...(skipWeeks.length > 0 ? { p_skip_weeks: skipWeeks } : {}),
  });

  if (error) {
    console.error("[classes/launch] POST failed:", error.message);
    return NextResponse.json({ error: "Failed to launch cohort" }, { status: 500 });
  }

  return NextResponse.json({
    cohort: {
      templateId: QUANT_FOUNDATIONS_TEMPLATE_ID,
      templateName: QUANT_FOUNDATIONS_TEMPLATE.name,
      startsOn,
      timezone,
      skipWeeks,
      schedule,
    },
  });
}
