/**
 * POST /api/seasons/challenges/[id]/start — start (or resume) a timed attempt.
 * The clock starts on the server (start_attempt, 0024). Returns this student's
 * own numbers, the prompt written with them, the starter code and the public
 * preview test. The official test never leaves the server.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { rateLimit } from "@/lib/rateLimit";
import { getTemplate } from "@/lib/seasons/templates";
import { deriveParams } from "@/lib/seasons/params";

const MESSAGES: Record<string, [number, string]> = {
  not_open: [409, "This challenge isn't open right now."],
  not_found: [404, "That challenge doesn't exist."],
};

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const limited = await rateLimit(auth.supabase, "season-attempt");
  if (limited) return limited;

  const secret = process.env.SEASON_PARAM_SECRET ?? "";
  if (!secret) return NextResponse.json({ error: "Seasons aren't set up on this server yet." }, { status: 503 });

  const { id } = await params;
  const { data: challenge, error: readError } = await auth.supabase
    .from("season_challenges")
    .select("id, template_slug")
    .eq("id", id)
    .maybeSingle();
  if (readError) return NextResponse.json({ error: "We can't reach the season database right now." }, { status: 503 });
  if (!challenge) return NextResponse.json({ error: MESSAGES.not_found[1] }, { status: 404 });

  const template = getTemplate(challenge.template_slug as string);
  if (!template) {
    console.error("[seasons/start] unknown template", challenge.template_slug);
    return NextResponse.json({ error: "This challenge isn't ready yet." }, { status: 500 });
  }

  const { data, error } = await auth.supabase.rpc("start_attempt", { p_challenge_id: id });
  if (error) {
    const key = Object.keys(MESSAGES).find((k) => error.message.includes(k));
    if (key) return NextResponse.json({ error: MESSAGES[key][1] }, { status: MESSAGES[key][0] });
    console.error("[seasons/start]", error.message);
    return NextResponse.json({ error: "Couldn't start the challenge" }, { status: 500 });
  }
  const row = (Array.isArray(data) ? data[0] : data) as { started_at: string; deadline: string; status: string };

  const p = deriveParams(template.paramSpecs, { challengeId: id, userId: auth.userId }, secret);
  return NextResponse.json({
    startedAt: row.started_at,
    deadline: row.deadline,
    status: row.status,
    title: template.title,
    concept: template.concept,
    prompt: template.prompt(p),
    params: p,
    starterCode: template.starterCode,
    previewTest: template.previewTest,
  });
}
