/**
 * POST /api/capstone/[classId]/share { enabled } turns the public, unlisted
 * link on (a fresh unguessable token) or off (the old link stops working).
 * Tokens are minted by set_capstone_sharing() in the database; the client
 * can never choose one.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { classId } = await params;

  const limited = await rateLimit(auth.supabase, "capstone-share");
  if (limited) return limited;

  const body = (await req.json().catch(() => ({}))) as { enabled?: unknown };
  if (typeof body.enabled !== "boolean") return NextResponse.json({ error: "enabled must be true or false" }, { status: 400 });

  const { data: own } = await auth.supabase
    .from("capstone_submissions")
    .select("id, status")
    .eq("class_id", classId)
    .eq("user_id", auth.userId)
    .maybeSingle();
  if (!own) return NextResponse.json({ error: "Save your capstone first" }, { status: 404 });
  if (body.enabled && own.status !== "submitted") {
    return NextResponse.json({ error: "Submit your capstone before sharing it" }, { status: 400 });
  }

  const { data, error } = await auth.supabase.rpc("set_capstone_sharing", { p_capstone_id: own.id, p_enabled: body.enabled });
  if (error) {
    console.error("[capstone/share] POST", error.message);
    return NextResponse.json({ error: "Couldn't change sharing" }, { status: 500 });
  }
  return NextResponse.json({ shareToken: (data as string | null) ?? null });
}
