/**
 * GET /api/classes/[id]/roster — a class's roster with each student's
 * aggregate progress, plus per-assignment completion. Teacher-only:
 * ownership is checked via the caller's own session client (RLS-scoped to
 * teacher_id = auth.uid(), see requireTeacherOwnsClass) before the
 * cross-user roster/assignment reads happen through the admin client in
 * src/lib/classes.ts. Assignments ride along in this same response (rather
 * than a separate endpoint) since both reads need the same class_members +
 * progress rows.
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import {
  getClassRoster,
  getClassAssignmentsWithCompletion,
  requireTeacherOwnsClass,
  TOTAL_TRACKS,
  TOTAL_LESSONS,
} from "@/lib/classes";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  const owned = await requireTeacherOwnsClass(auth.supabase, auth.userId, id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  const [roster, assignments] = await Promise.all([
    getClassRoster(id),
    getClassAssignmentsWithCompletion(id),
  ]);

  return NextResponse.json({
    class: owned.class,
    roster,
    assignments,
    totals: { tracks: TOTAL_TRACKS, lessons: TOTAL_LESSONS },
    generatedAt: new Date().toISOString(),
  });
}
