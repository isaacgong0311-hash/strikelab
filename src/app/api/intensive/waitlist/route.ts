/**
 * POST /api/intensive/waitlist — a parent or guardian joins the waitlist for
 * the January intensive. Nothing is charged; we email when a cohort fills.
 * Stored with the service role only (intensive_waitlist has no RLS policies).
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    parentEmail?: unknown;
    grade?: unknown;
    note?: unknown;
    isGuardian?: unknown;
    source?: unknown;
    website?: unknown; // honeypot: real people never fill it in
  };

  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });

  const email = typeof body.parentEmail === "string" ? body.parentEmail.trim() : "";
  if (!EMAIL.test(email) || email.length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (body.isGuardian !== true) {
    return NextResponse.json({ error: "Please confirm you're the student's parent or guardian." }, { status: 400 });
  }
  const grade = typeof body.grade === "number" && Number.isInteger(body.grade) && body.grade >= 6 && body.grade <= 12 ? body.grade : null;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : null;
  const source = typeof body.source === "string" ? body.source.slice(0, 64) : null;

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "The waitlist isn't open on this server yet." }, { status: 503 });

  const { error } = await admin.from("intensive_waitlist").insert({ parent_email: email, student_grade: grade, note: note || null, source });
  if (error && error.code !== "23505") {
    console.error("[intensive/waitlist]", error.message);
    return NextResponse.json({ error: "Couldn't save that. Try again in a moment." }, { status: 500 });
  }
  return NextResponse.json({ ok: true }); // 23505: already on the list, same answer
}
