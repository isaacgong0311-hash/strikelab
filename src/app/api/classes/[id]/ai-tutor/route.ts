/**
 * PATCH /api/classes/[id]/ai-tutor { enabled } — the class leader turns the AI
 * tutor on or off for their students (migration 0023, off by default).
 * Teacher-only, through the caller's own session so row-level security also
 * enforces ownership.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { rateLimit } from "@/lib/rateLimit";
import { requireTeacherOwnsClass } from "@/lib/classes";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const limited = await rateLimit(auth.supabase, "class-settings");
  if (limited) return limited;

  const { id } = await params;
  const owned = await requireTeacherOwnsClass(auth.supabase, auth.userId, id);
  if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

  const body = (await req.json().catch(() => ({}))) as { enabled?: unknown };
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be true or false" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("classes")
    .update({ ai_tutor_enabled: body.enabled })
    .eq("id", id)
    .eq("teacher_id", auth.userId);
  if (error) {
    console.error("[classes/ai-tutor] PATCH", error.message);
    return NextResponse.json({ error: "Couldn't change the setting" }, { status: 500 });
  }
  return NextResponse.json({ aiTutorEnabled: body.enabled });
}
