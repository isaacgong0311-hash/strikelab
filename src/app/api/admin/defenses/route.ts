/**
 * POST /api/admin/defenses records a defense sign-off (proving-ground spec §3).
 * Founder-only: anyone else gets a 404, like /admin/*. Writes go through the
 * service role because students can never write defenses themselves.
 */
import { NextRequest, NextResponse } from "next/server";
import { isFounder } from "@/lib/admin/founder";
import { parseDefenseInput } from "@/lib/records/defense";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/requireUser";

const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth || !isFounder(auth.userId)) return notFound();

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "The server has no service-role key." }, { status: 503 });

  const today = new Date().toISOString().slice(0, 10);
  const parsed = parseDefenseInput(await req.json().catch(() => null), today);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.value;

  const { data: student, error: findError } = await admin
    .from("profiles")
    .select("id")
    .ilike("handle", input.handle)
    .maybeSingle();
  if (findError) {
    console.error("[admin/defenses] find", findError.message);
    return NextResponse.json({ error: "Couldn't look up that handle." }, { status: 500 });
  }
  if (!student) return NextResponse.json({ error: `No student has the handle ${input.handle}.` }, { status: 404 });

  let capstoneId: string | null = null;
  if (input.kind === "capstone") {
    const { data: capstone } = await admin
      .from("capstone_submissions")
      .select("id")
      .eq("user_id", student.id)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    capstoneId = (capstone?.id as string | undefined) ?? null;
  }

  const { error } = await admin.from("defenses").insert({
    user_id: student.id,
    kind: input.kind,
    season_id: input.seasonId,
    capstone_id: capstoneId,
    outcome: input.outcome,
    consent_confirmed: input.consentConfirmed,
    reviewer_id: auth.userId,
    reviewer_label: input.reviewerLabel,
    notes: input.notes,
    defended_on: input.defendedOn,
  });
  if (error) {
    console.error("[admin/defenses] insert", error.message);
    return NextResponse.json({ error: "Couldn't save the sign-off." }, { status: 500 });
  }
  return NextResponse.json({ saved: true, handle: input.handle, linkedCapstone: capstoneId !== null });
}
