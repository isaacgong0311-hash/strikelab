import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";

/** The database function checks auth.uid() and mints or revokes the token. */
export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = (await request.json().catch(() => ({}))) as { enabled?: unknown };
  if (typeof body.enabled !== "boolean") return NextResponse.json({ error: "enabled must be true or false" }, { status: 400 });
  const { data, error } = await auth.supabase.rpc("set_record_sharing", { p_enabled: body.enabled });
  if (error?.message.includes("handle_required")) {
    return NextResponse.json({ error: "Choose a handle before sharing" }, { status: 400 });
  }
  if (error) {
    console.error("[record/share]", error.message);
    return NextResponse.json({ error: "Couldn't change sharing right now" }, { status: 503 });
  }
  return NextResponse.json({ shareToken: (data as string | null) ?? null });
}
