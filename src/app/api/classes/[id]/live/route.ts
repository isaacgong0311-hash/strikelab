/**
 * GET /api/classes/[id]/live: the kickoff live view's counts (mega plan Q2).
 * Teacher-only: ownership is checked with the caller's own session first,
 * then src/lib/teach/kickoffLive.ts reads across students with the admin
 * client, the same contract as the roster route.
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { requireTeacherOwnsClass } from "@/lib/classes";
import { loadKickoffLive } from "@/lib/teach/kickoffLive";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const owned = await requireTeacherOwnsClass(auth.supabase, auth.userId, id);
  if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

  const live = await loadKickoffLive(id);
  if (!live) return NextResponse.json({ error: "Couldn't load the class right now" }, { status: 503 });
  return NextResponse.json(live, { headers: { "Cache-Control": "no-store" } });
}
