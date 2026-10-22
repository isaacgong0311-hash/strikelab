import { NextRequest, NextResponse } from "next/server";
import { isFounder } from "@/lib/admin/founder";
import { loadVerificationQueue } from "@/lib/admin/loadVerificationQueue";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/requireUser";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth || !isFounder(auth.userId)) return new Response(null, { status: 404 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || body.parentConsentRecorded !== true) {
    return NextResponse.json({ error: "Record parent consent for this call before verifying." }, { status: 400 });
  }
  const { kind, userId, subjectId } = body;
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if ((kind !== "capstone" && kind !== "placing") || typeof userId !== "string" || !UUID.test(userId)
    || typeof subjectId !== "string" || !subjectId || notes.length > 2000
    || (kind === "capstone" && !UUID.test(subjectId))) {
    return NextResponse.json({ error: "Invalid verification details." }, { status: 400 });
  }
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Verification is unavailable right now." }, { status: 503 });
  try {
    const queue = await loadVerificationQueue(admin, auth.supabase);
    const candidates = kind === "capstone" ? queue.capstones : queue.placings;
    if (!candidates.some((item) => item.userId === userId && item.subjectId === subjectId)) {
      return NextResponse.json({ error: "This item is not awaiting verification." }, { status: 400 });
    }
    const { data, error } = await admin.from("verifications").insert({
      user_id: userId, kind, subject_id: subjectId,
      reviewer_id: auth.userId, parent_consent_recorded: true, notes: notes || null,
    }).select("id").single();
    if (error?.code === "23505") return NextResponse.json({ error: "Already verified." }, { status: 409 });
    if (error || !data) throw error ?? new Error("No verification row returned");
    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("[admin/verify]", error);
    return NextResponse.json({ error: "Verification is unavailable right now." }, { status: 503 });
  }
}
