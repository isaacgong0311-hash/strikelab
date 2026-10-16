/**
 * POST /api/record/share { enabled } turns the student's unlisted record link
 * on (a fresh token) or off (the old link stops working). Tokens are minted by
 * set_record_sharing() in the database; the client never chooses one.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const limited = await rateLimit(auth.supabase, "record-share");
  if (limited) return limited;

  const body = (await req.json().catch(() => ({}))) as { enabled?: unknown };
  if (typeof body.enabled !== "boolean") return NextResponse.json({ error: "enabled must be true or false" }, { status: 400 });

  const { data, error } = await auth.supabase.rpc("set_record_sharing", { p_enabled: body.enabled });
  if (error) {
    if (/handle_required/.test(error.message)) {
      return NextResponse.json({ error: "Choose a handle on the seasons page before sharing" }, { status: 400 });
    }
    console.error("[record/share] POST", error.message);
    return NextResponse.json({ error: "Couldn't change sharing" }, { status: 500 });
  }
  return NextResponse.json({ shareToken: (data as string | null) ?? null });
}
