/**
 * GET/POST /api/classes/[id]/assignments — manage which lessons are
 * assigned to a class. Teacher-only: ownership is checked the same way as
 * the roster route (see requireTeacherOwnsClass in src/lib/classes.ts).
 *
 * GET reads through the caller's own session-bound client — the "Teachers
 * manage own class assignments" RLS policy already permits this, so no
 * admin client is needed for a same-teacher read.
 *
 * POST assigns one or more lessons in a single request. It upserts with
 * ignoreDuplicates rather than plain insert()+catch(23505): a multi-row
 * insert() fails the *entire* statement if any one row collides with the
 * unique(class_id, lesson_id) constraint (e.g. re-assigning a lesson
 * that's already assigned alongside two new ones), which would break the
 * common "assign a few more lessons" flow. Upsert-with-ignoreDuplicates
 * keeps the already-assigned rows untouched and inserts only the new ones.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireTeacherOwnsClass } from "@/lib/classes";
import { TRACKS, getLessonById } from "@/lib/tracks";

interface AssignmentRow {
  id: string;
  lesson_id: string;
  created_at: string;
  week_number: number | null;
  position: number | null;
  due_on: string | null;
}

function toAssignmentResponse(row: AssignmentRow) {
  const lesson = getLessonById(row.lesson_id);
  const track = lesson ? TRACKS.find((t) => t.id === lesson.trackId) : undefined;
  return {
    id: row.id,
    lessonId: row.lesson_id,
    lessonTitle: lesson?.title ?? row.lesson_id,
    trackTitle: track?.title ?? "",
    createdAt: row.created_at,
    weekNumber: row.week_number ?? null,
    position: row.position ?? null,
    dueOn: row.due_on ?? null,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const owned = await requireTeacherOwnsClass(auth.supabase, auth.userId, id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  const { data, error } = await auth.supabase
    .from("assignments")
    .select("id, lesson_id, created_at, week_number, position, due_on")
    .eq("class_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[classes/assignments] GET failed:", error.message);
    return NextResponse.json({ error: "Failed to load assignments" }, { status: 500 });
  }

  const assignments = (data ?? []).map((a) =>
    toAssignmentResponse(a as AssignmentRow)
  );

  return NextResponse.json({ assignments });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const owned = await requireTeacherOwnsClass(auth.supabase, auth.userId, id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  const body = (await req.json().catch(() => ({}))) as { lessonIds?: unknown };
  const lessonIds = Array.isArray(body.lessonIds)
    ? body.lessonIds.filter((v): v is string => typeof v === "string")
    : [];

  if (lessonIds.length === 0) {
    return NextResponse.json({ error: "lessonIds required" }, { status: 400 });
  }

  const unknown = lessonIds.filter((lessonId) => !getLessonById(lessonId));
  if (unknown.length > 0) {
    return NextResponse.json({ error: `Unknown lesson id(s): ${unknown.join(", ")}` }, { status: 400 });
  }

  const rows = lessonIds.map((lessonId) => ({ class_id: id, lesson_id: lessonId }));

  const { error } = await auth.supabase
    .from("assignments")
    .upsert(rows, { onConflict: "class_id,lesson_id", ignoreDuplicates: true });

  if (error) {
    console.error("[classes/assignments] POST failed:", error.message);
    return NextResponse.json({ error: "Failed to assign lessons" }, { status: 500 });
  }

  const { data } = await auth.supabase
    .from("assignments")
    .select("id, lesson_id, created_at, week_number, position, due_on")
    .eq("class_id", id)
    .order("created_at", { ascending: true });

  const assignments = (data ?? []).map((a) =>
    toAssignmentResponse(a as AssignmentRow)
  );

  return NextResponse.json({ assignments });
}
