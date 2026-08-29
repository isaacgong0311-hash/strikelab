/**
 * /api/classes — a teacher's own classes.
 *
 * GET returns the caller's classes with a member count. POST creates a new
 * one with a freshly generated join code, retrying on the (astronomically
 * unlikely) chance of a collision against the unique constraint.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { generateJoinCode } from "@/lib/classes";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: classes, error } = await auth.supabase
    .from("classes")
    .select("id, name, join_code, created_at, class_members(count)")
    .eq("teacher_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[classes] GET", error.message);
    return NextResponse.json({ error: "Failed to load classes" }, { status: 500 });
  }

  const result = (classes ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    joinCode: c.join_code,
    memberCount: Array.isArray(c.class_members) ? (c.class_members[0]?.count ?? 0) : 0,
  }));

  return NextResponse.json({ classes: result });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = (body.name ?? "").trim().slice(0, 80);
  if (!name) {
    return NextResponse.json({ error: "Class name is required" }, { status: 400 });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const joinCode = generateJoinCode();
    const { data, error } = await auth.supabase
      .from("classes")
      .insert({ teacher_id: auth.userId, name, join_code: joinCode })
      .select("id, name, join_code")
      .single();

    if (!error && data) {
      return NextResponse.json({ id: data.id, name: data.name, joinCode: data.join_code });
    }
    if (error && error.code !== "23505") {
      console.error("[classes] POST", error.message);
      return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
    }
    // 23505 = unique_violation on join_code — regenerate and retry.
  }

  return NextResponse.json({ error: "Failed to create class, please try again" }, { status: 500 });
}
