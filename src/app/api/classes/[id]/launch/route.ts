import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireTeacherOwnsClass } from "@/lib/classes";
import {
  QUANT_FOUNDATIONS_TEMPLATE,
  QUANT_FOUNDATIONS_TEMPLATE_ID,
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

  const { id } = await params;
  const owned = await requireTeacherOwnsClass(auth.supabase, auth.userId, id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  const body = (await req.json().catch(() => ({}))) as {
    startsOn?: unknown;
    timezone?: unknown;
  };
  const startsOn = typeof body.startsOn === "string" ? body.startsOn : "";
  const timezone = typeof body.timezone === "string" ? body.timezone.trim() : "";

  let schedule;
  try {
    schedule = buildCohortSchedule(startsOn);
  } catch {
    return NextResponse.json({ error: "Enter a valid start date" }, { status: 400 });
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
      schedule,
    },
  });
}
