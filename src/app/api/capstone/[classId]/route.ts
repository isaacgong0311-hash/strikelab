/**
 * /api/capstone/[classId]: the signed-in student's capstone for one cohort.
 *
 * GET returns it (or null) plus when a teacher opened it. PUT saves a draft
 * or submits (body: fields + `submit`). Everything goes through the
 * student's own session client, so RLS (migration 0019) enforces that
 * students only touch their own capstone, in a class they belong to.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { validateCapstone } from "@/lib/capstone/prompts";
import { CAPSTONE_COLUMNS, rowToCapstone } from "@/lib/capstone/rows";

type Ctx = { params: Promise<{ classId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { classId } = await params;

  const { data, error } = await auth.supabase
    .from("capstone_submissions")
    .select(CAPSTONE_COLUMNS)
    .eq("class_id", classId)
    .eq("user_id", auth.userId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Capstones aren't available yet" }, { status: 503 });
  if (!data) return NextResponse.json({ capstone: null, openedByTeacher: [] });

  const { data: log } = await auth.supabase
    .from("capstone_access_log")
    .select("viewed_at")
    .eq("capstone_id", data.id)
    .order("viewed_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    capstone: rowToCapstone(data),
    openedByTeacher: (log ?? []).map((r) => r.viewed_at as string),
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { classId } = await params;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const submit = body?.submit === true;
  const result = validateCapstone(body, submit);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const { data: existing } = await auth.supabase
    .from("capstone_submissions")
    .select("status")
    .eq("class_id", classId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  // Saving edits never un-submits a capstone.
  const status = submit || existing?.status === "submitted" ? "submitted" : "draft";
  const f = result.value;
  const { data, error } = await auth.supabase
    .from("capstone_submissions")
    .upsert(
      {
        user_id: auth.userId,
        class_id: classId,
        prompt_id: f.promptId,
        title: f.title,
        thesis: f.thesis,
        code: f.code,
        result_summary: f.resultSummary,
        reflection: f.reflection,
        status,
      },
      { onConflict: "user_id,class_id" }
    )
    .select(CAPSTONE_COLUMNS)
    .single();

  if (error || !data) {
    // RLS rejects non-members; don't reveal whether the class exists.
    const status = error?.code === "42501" ? 404 : 500;
    if (status === 500) console.error("[capstone] PUT", error?.message);
    return NextResponse.json({ error: status === 404 ? "Class not found" : "Couldn't save your capstone" }, { status });
  }
  return NextResponse.json({ capstone: rowToCapstone(data) });
}
