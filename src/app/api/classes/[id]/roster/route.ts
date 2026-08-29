/**
 * GET /api/classes/[id]/roster — a class's roster with each student's
 * aggregate progress. Teacher-only: ownership is checked via the caller's
 * own session client (RLS-scoped to teacher_id = auth.uid()) before the
 * cross-user roster read happens through the admin client in
 * src/lib/classes.ts.
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { getClassRoster, TOTAL_TRACKS, TOTAL_LESSONS } from "@/lib/classes";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  const { data: klass, error } = await auth.supabase
    .from("classes")
    .select("id, name")
    .eq("id", id)
    .eq("teacher_id", auth.userId)
    .maybeSingle();

  if (error || !klass) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const roster = await getClassRoster(id);

  return NextResponse.json({
    class: { id: klass.id, name: klass.name },
    roster,
    totals: { tracks: TOTAL_TRACKS, lessons: TOTAL_LESSONS },
  });
}
