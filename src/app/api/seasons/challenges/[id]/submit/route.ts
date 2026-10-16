/**
 * POST /api/seasons/challenges/[id]/submit { code, explanation, previewPassed }
 * — one submission, before the deadline (submit_attempt, 0024). The official
 * score is computed later on the server; the browser preview never counts.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { rateLimit } from "@/lib/rateLimit";

export const MIN_EXPLANATION = 20;

const MESSAGES: Record<string, [number, string]> = {
  too_late: [409, "Time was up, so this submission wasn't accepted."],
  already_submitted: [409, "You've already submitted this challenge."],
  not_started: [409, "Start the challenge before submitting."],
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const limited = await rateLimit(auth.supabase, "season-attempt");
  if (limited) return limited;

  const body = (await req.json().catch(() => ({}))) as { code?: unknown; explanation?: unknown; previewPassed?: unknown };
  if (typeof body.code !== "string" || body.code.trim() === "" || body.code.length > 50_000) {
    return NextResponse.json({ error: "Include your code (up to 50,000 characters)." }, { status: 400 });
  }
  const explanation = typeof body.explanation === "string" ? body.explanation.trim() : "";
  if (explanation.length < MIN_EXPLANATION || explanation.length > 2000) {
    return NextResponse.json({ error: `Explain your answer in at least ${MIN_EXPLANATION} characters (up to 2,000).` }, { status: 400 });
  }

  const { id } = await params;
  const { data, error } = await auth.supabase.rpc("submit_attempt", {
    p_challenge_id: id,
    p_code: body.code,
    p_explanation: explanation,
    p_preview_passed: body.previewPassed === true,
  });
  if (error) {
    const key = Object.keys(MESSAGES).find((k) => error.message.includes(k));
    if (key) return NextResponse.json({ error: MESSAGES[key][1] }, { status: MESSAGES[key][0] });
    console.error("[seasons/submit]", error.message);
    return NextResponse.json({ error: "Couldn't submit. Try again in a moment." }, { status: 500 });
  }
  return NextResponse.json({ submittedAt: data as string });
}
