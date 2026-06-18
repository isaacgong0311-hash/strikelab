/**
 * /api/progress — server-side progress sync, backed by Supabase.
 *
 * Auth comes from the Supabase session cookie (refreshed by middleware), and
 * Row Level Security ensures users can only read/write their own row. The hook
 * (useProgress) talks to Supabase directly; this route exists for server-side
 * or non-browser callers and mirrors the same merge semantics.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  fetchRemoteProgress,
  upsertRemoteProgress,
  mergeProgress,
  EMPTY_PROGRESS,
  type ProgressPayload,
} from "@/lib/progress/sync";

async function requireUser() {
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: "Supabase not configured", status: 503 as const };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { error: "Not authenticated", status: 401 as const };
  return { supabase, userId: data.user.id };
}

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
