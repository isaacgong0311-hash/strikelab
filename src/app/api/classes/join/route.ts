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
import { rateLimit } from "@/lib/rateLimit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { lookupInvite } from "@/lib/classInvite";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const limited = await rateLimit(auth.supabase, "class-join");
  if (limited) return limited;

  const body = (await req.json().catch(() => ({}))) as { code?: string };
  const code = (body.code ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Enter a join code" }, { status: 400 });
  }

  // "not found" and "can't reach the database" are different problems for a
  // student standing in a classroom: only the first means the code is wrong.
  const lookup = await lookupInvite(getSupabaseAdmin(), code);
  if (lookup.kind === "unavailable") {
    return NextResponse.json({ error: "We can't reach the class database right now. Try again in a minute." }, { status: 503 });
  }
  if (lookup.kind === "not-found") {
    return NextResponse.json({ error: "That code doesn't match a class" }, { status: 404 });
  }
  const klass = lookup.klass;

  const { error } = await auth.supabase
    .from("class_members")
    .insert({ class_id: klass.id, student_id: auth.userId });

  if (error && error.code !== "23505") {
    // 23505 = already a member — treat as success (idempotent join).
    console.error("[classes/join] POST", error.message);
    return NextResponse.json({ error: "Failed to join class" }, { status: 500 });
  }

  // A launched cohort sends the student to their cohort home; a plain class
  // back to the dashboard.
  const isCohort = Boolean(klass.template_id && klass.starts_on);
  return NextResponse.json({ id: klass.id, name: klass.name, isCohort });
}
