/**
 * DELETE /api/classes/[id]/assignments/[assignmentId] — un-assign a lesson
 * from a class. Teacher-only, same ownership check as the parent route.
 * Matches on both id and class_id (RLS already scopes this, but the
 * explicit double match guards against a cross-class-id typo mismatching
 * an assignment that belongs to a different one of the teacher's classes).
 * No PATCH/edit route — editing is delete + recreate, per v1 scope.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireTeacherOwnsClass } from "@/lib/classes";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id, assignmentId } = await params;
  const owned = await requireTeacherOwnsClass(auth.supabase, auth.userId, id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  const { data, error } = await auth.supabase
    .from("assignments")
    .delete()
    .eq("id", assignmentId)
    .eq("class_id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[classes/assignments] DELETE failed:", error.message);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
