/**
 * POST /api/classes/join — join a class by its join code.
 *
 * The join_code -> class_id lookup goes through the admin client (no RLS
 * select policy exposes classes by code to an arbitrary caller), but the
 * membership row itself is inserted via the caller's own session client —
 * RLS ("Students join via own row") enforces student_id = auth.uid(), so
 * this can't be used to enroll someone else.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await req.json().catch(() => ({}))) as { code?: string };
  const code = (body.code ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Enter a join code" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Classes not configured" }, { status: 503 });
  }

  const { data: klass } = await admin
    .from("classes")
    .select("id, name")
    .eq("join_code", code)
    .maybeSingle();

  if (!klass) {
    return NextResponse.json({ error: "That code doesn't match a class" }, { status: 404 });
  }

  const { error } = await auth.supabase
    .from("class_members")
    .insert({ class_id: klass.id, student_id: auth.userId });

  if (error && error.code !== "23505") {
    // 23505 = already a member — treat as success (idempotent join).
    console.error("[classes/join] POST", error.message);
    return NextResponse.json({ error: "Failed to join class" }, { status: 500 });
  }

  return NextResponse.json({ id: klass.id, name: klass.name });
}
