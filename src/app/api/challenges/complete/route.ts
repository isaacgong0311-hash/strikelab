/**
 * POST /api/challenges/complete — records a passed weekly-challenge run.
 *
 * Auth comes from the Supabase session cookie; RLS lets a user insert/update
 * only their own row. xp is looked up server-side from the challenge id
 * (never trusted from the client) and elapsed_seconds is clamped to a sane
 * range. Only the fastest recorded time per (user, challenge) is kept.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { WEEKLY_CHALLENGES } from "@/lib/challenges";

const MAX_ELAPSED_SECONDS = 24 * 60 * 60;

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { supabase, userId } = auth;

  let body: { challengeId?: string; elapsedSeconds?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const challenge = WEEKLY_CHALLENGES.find((c) => c.id === body.challengeId);
  if (!challenge) {
    return NextResponse.json({ error: "Unknown challengeId" }, { status: 400 });
  }

  const elapsedSeconds = Math.round(Number(body.elapsedSeconds));
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0 || elapsedSeconds > MAX_ELAPSED_SECONDS) {
    return NextResponse.json({ error: "Invalid elapsedSeconds" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();

  const { data: existing } = await supabase
    .from("challenge_completions")
    .select("elapsed_seconds")
    .eq("user_id", userId)
    .eq("challenge_id", challenge.id)
    .maybeSingle();

  if (existing && existing.elapsed_seconds <= elapsedSeconds) {
    return NextResponse.json({ ok: true, improved: false });
  }

  const { error } = await supabase.from("challenge_completions").upsert(
    {
      user_id: userId,
      challenge_id: challenge.id,
      display_name: profile?.display_name ?? null,
      elapsed_seconds: elapsedSeconds,
      xp: challenge.xpReward,
    },
    { onConflict: "user_id,challenge_id" }
  );

  if (error) {
    console.error("[challenges/complete] upsert failed:", error.message);
    return NextResponse.json({ error: "Could not record completion" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, improved: true });
}
