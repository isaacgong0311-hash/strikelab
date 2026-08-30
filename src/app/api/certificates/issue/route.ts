/**
 * POST /api/certificates/issue
 *
 * Issues a certificate of completion for a track, if the caller has actually
 * finished every lesson in it. Idempotent — re-issuing an already-earned
 * certificate returns the same id rather than erroring or duplicating.
 *
 * Body: { trackId: string }
 * Returns: { id: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isTrackComplete } from "@/lib/certificates";
import { TRACKS } from "@/lib/tracks";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: "Sign in required" }, { status: auth.status });
  }

  const body = (await req.json().catch(() => ({}))) as { trackId?: string };
  const track = TRACKS.find((t) => t.id === body.trackId);
  if (!track) {
    return NextResponse.json({ error: "Unknown track" }, { status: 400 });
  }

  // Read the caller's OWN progress row via their session-bound client (RLS
  // scoped to auth.uid() = user_id) — this can't be spoofed to claim a
  // certificate off someone else's completions.
  const { data: progressRow } = await auth.supabase
    .from("progress")
    .select("completed")
    .eq("user_id", auth.userId)
    .maybeSingle();

  const completed: string[] = Array.isArray(progressRow?.completed) ? progressRow.completed : [];
  if (!isTrackComplete(track.id, completed)) {
    return NextResponse.json({ error: "Track not complete yet" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Certificates not configured" }, { status: 503 });
  }

  const { data: existing } = await admin
    .from("certificates")
    .select("id")
    .eq("user_id", auth.userId)
    .eq("track_id", track.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  const { data: userData } = await auth.supabase.auth.getUser();
  const meta = userData.user?.user_metadata ?? {};
  const displayName =
    (meta.display_name as string) ||
    (meta.full_name as string) ||
    (meta.name as string) ||
    userData.user?.email?.split("@")[0] ||
    "StrikeLab student";

  const { data: inserted, error } = await admin
    .from("certificates")
    .insert({ user_id: auth.userId, track_id: track.id, display_name: displayName })
    .select("id")
    .single();

  if (error?.code === "23505") {
    // Lost a race against a concurrent issue request (double-click, two
    // tabs) — the UNIQUE (user_id, track_id) constraint on public.certificates
    // already guaranteed only one row exists, so return that row's id
    // instead of surfacing a 500 for what is, from the user's side, a
    // successful issue.
    const { data: raced } = await admin
      .from("certificates")
      .select("id")
      .eq("user_id", auth.userId)
      .eq("track_id", track.id)
      .single();
    if (raced) return NextResponse.json({ id: raced.id });
  }

  if (error || !inserted) {
    console.error("[certificates/issue] Failed to insert:", error?.message);
    return NextResponse.json({ error: "Failed to issue certificate" }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id });
}
