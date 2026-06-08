/**
 * /api/progress — server-side progress sync
 *
 * Stores lesson progress, XP, and streak so they survive across devices
 * and browsers. Currently uses an in-memory Map for zero-config dev.
 *
 * To productionise, swap the `store` Map for:
 *   - Vercel KV: `import { kv } from "@vercel/kv"`
 *   - Supabase:  `import { createClient } from "@supabase/supabase-js"`
 *   - Planetscale / Neon / any Postgres driver
 *
 * The API shape stays the same regardless of backing store.
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProgressPayload {
  completed: string[];       // lesson IDs
  xp: number;
  streak: number;
  lastActivityDate: string | null;
  activityByDate: Record<string, number>; // "YYYY-MM-DD" → count
}

// ─── In-memory store (replace with real DB in production) ────────────────────
// Key: userId (Clerk uid, or anonymous session id)
const store = new Map<string, ProgressPayload & { updatedAt: number }>();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getUserId(req: NextRequest): string | null {
  // If Clerk is active, read the session claim injected by middleware
  // (Clerk sets x-clerk-user-id via middleware when auth is configured)
  const clerkId = req.headers.get("x-clerk-user-id");
  if (clerkId) return clerkId;

  // Fallback: anonymous session token in cookie or header
  const anonToken = req.headers.get("x-sl-anon-token")
    ?? req.cookies.get("sl_anon_token")?.value;
  return anonToken ?? null;
}

function mergeProgress(
  stored: ProgressPayload,
  incoming: ProgressPayload,
): ProgressPayload {
  // Union of completed lessons (never lose completions)
  const completedSet = new Set([...stored.completed, ...incoming.completed]);

  // Take whichever has higher XP (guards against overwrites)
  const xp = Math.max(stored.xp, incoming.xp);

  // Take the more recent streak/activity
  const useIncoming =
    !stored.lastActivityDate ||
    (incoming.lastActivityDate ?? "") >= stored.lastActivityDate;

  const streak = useIncoming ? incoming.streak : stored.streak;
  const lastActivityDate = useIncoming
    ? incoming.lastActivityDate
    : stored.lastActivityDate;

  // Merge activity maps — take the max per day
  const merged: Record<string, number> = { ...stored.activityByDate };
  for (const [date, count] of Object.entries(incoming.activityByDate)) {
    merged[date] = Math.max(merged[date] ?? 0, count);
  }

  return {
    completed: Array.from(completedSet),
    xp,
    streak,
    lastActivityDate,
    activityByDate: merged,
  };
}

// ─── GET /api/progress ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const userId = getUserId(req);

  if (!userId) {
    return NextResponse.json(
      { error: "No user ID — sign in or provide x-sl-anon-token header" },
      { status: 401 },
    );
  }

  const saved = store.get(userId);
  if (!saved) {
    return NextResponse.json(
      { data: null, message: "No saved progress for this user" },
      { status: 200 },
    );
  }

  const { updatedAt, ...payload } = saved;
  return NextResponse.json({ data: payload, updatedAt });
}

// ─── POST /api/progress ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const userId = getUserId(req);

  if (!userId) {
    return NextResponse.json(
      { error: "No user ID — sign in or provide x-sl-anon-token header" },
      { status: 401 },
    );
  }

  let incoming: ProgressPayload;
  try {
    incoming = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required shape
  if (
    !Array.isArray(incoming.completed) ||
    typeof incoming.xp !== "number"
  ) {
    return NextResponse.json({ error: "Missing required fields: completed, xp" }, { status: 400 });
  }

  const existing = store.get(userId);
  const merged = existing
    ? mergeProgress(existing, incoming)
    : incoming;

  store.set(userId, { ...merged, updatedAt: Date.now() });

  return NextResponse.json({ ok: true, data: merged });
}

// ─── DELETE /api/progress (reset — useful for testing) ───────────────────────
export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "No user ID" }, { status: 401 });
  }
  store.delete(userId);
  return NextResponse.json({ ok: true, message: "Progress reset" });
}
