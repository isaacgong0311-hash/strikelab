/**
 * /api/progress — server-side progress sync, backed by Supabase.
 *
 * Auth comes from the Supabase session cookie (refreshed by middleware), and
 * Row Level Security ensures users can only read/write their own row. The hook
 * (useProgress) talks to Supabase directly; this route exists for server-side
 * or non-browser callers and mirrors the same merge semantics.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import {
  fetchRemoteProgress,
  upsertRemoteProgress,
  mergeProgress,
  EMPTY_PROGRESS,
  type ProgressPayload,
} from "@/lib/progress/sync";
import { notifyDiscordOfNewCompletions } from "@/lib/progress/discordNotify";

// ─── GET /api/progress ────────────────────────────────────────────────────────
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const data = await fetchRemoteProgress(auth.supabase, auth.userId);
  return NextResponse.json({ data });
}

// ─── POST /api/progress ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let incoming: ProgressPayload;
  try {
    incoming = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(incoming.completed) || typeof incoming.xp !== "number") {
    return NextResponse.json(
      { error: "Missing required fields: completed, xp" },
      { status: 400 }
    );
  }

  const existing = await fetchRemoteProgress(auth.supabase, auth.userId);
  const merged = existing ? mergeProgress(existing, incoming) : incoming;
  await upsertRemoteProgress(auth.supabase, auth.userId, merged);

  // Best-effort — never let a Discord hiccup fail the actual progress save.
  // Bounded to a couple seconds by notifyDiscordOfNewCompletions internally.
  await notifyDiscordOfNewCompletions(auth.supabase, auth.userId, {
    before: existing?.completed ?? [],
    after: merged.completed,
  }).catch((err) => console.error("[progress] Discord notify failed:", err));

  return NextResponse.json({ ok: true, data: merged });
}

// ─── DELETE /api/progress (reset) ────────────────────────────────────────────
export async function DELETE() {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  await upsertRemoteProgress(auth.supabase, auth.userId, EMPTY_PROGRESS);
  return NextResponse.json({ ok: true, message: "Progress reset" });
}
