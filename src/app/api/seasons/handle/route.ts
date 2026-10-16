/**
 * POST /api/seasons/handle { handle } — set the public name shown on
 * leaderboards. Never a real name (proving-ground spec §6.1).
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { rateLimit } from "@/lib/rateLimit";
import { checkHandle } from "@/lib/seasons/handle";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const limited = await rateLimit(auth.supabase, "season-handle");
  if (limited) return limited;

  const body = (await req.json().catch(() => ({}))) as { handle?: unknown };
  const check = checkHandle(body.handle);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

  const { error } = await auth.supabase.from("profiles").update({ handle: check.handle }).eq("id", auth.userId);
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "That handle is taken" }, { status: 409 });
    console.error("[seasons/handle] POST", error.message);
    return NextResponse.json({ error: "Couldn't save your handle" }, { status: 500 });
  }
  return NextResponse.json({ handle: check.handle });
}
