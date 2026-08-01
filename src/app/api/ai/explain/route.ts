/**
 * POST /api/ai/explain — re-explains a passage the student highlighted.
 *
 * Written prose has to pick one level of explanation and commit. This lets a
 * reader who bounces off a particular sentence get that sentence specifically
 * unpacked, without derailing into a full tutoring session or making the
 * author write three versions of every paragraph.
 */
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { getLessonContext } from "@/lib/tracks";
import { streamGroqChat, textStream, streamHeaders, isAiConfigured } from "@/lib/ai/groq";
import { consumeAiQuota } from "@/lib/ai/quota";

/** Long selections mean "explain the whole section", which this isn't for. */
const MAX_SELECTION_CHARS = 600;

const SIGNED_OUT = `Sign in to have any passage re-explained in your own terms.`;
const OVER_QUOTA = `You've used today's AI budget — it resets at midnight UTC.`;
const UNAVAILABLE = `Couldn't reach the explainer right now. Try again in a moment.`;

function buildSystemPrompt(lessonId: string): string {
  const ctx = getLessonContext(lessonId);
  const lessonBlock = ctx
    ? `They're reading "${ctx.lesson.title}" (${ctx.lesson.subtitle}) in the ${ctx.track.title} track.`
    : "They're reading a StrikeLab lesson.";

  return `A student highlighted a passage in a StrikeLab lesson because it didn't land. Explain that specific passage again, differently.

${lessonBlock}

RULES:
- Explain THAT passage. Don't summarise the whole lesson or drift to adjacent topics.
- Lead with the intuition, then the formal statement. Never the reverse.
- A concrete worked number beats another abstract restatement. If the passage has a formula, put real values through it.
- Assume strong maths (calculus, logs, probability), limited finance vocabulary. Define finance jargon; don't define a derivative.
- Under 150 words. This is a margin note, not a lecture.
- Plain and direct. Don't open by restating the question.

You may use **bold**, \`inline code\`, and fenced code blocks.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { lessonId = "", selection = "" } = body as { lessonId?: string; selection?: string };

  const text = String(selection).trim().slice(0, MAX_SELECTION_CHARS);
  if (text.length < 3) {
    return new Response(textStream("Highlight a sentence or formula and I'll unpack it."), {
      headers: streamHeaders("fallback"),
    });
  }

  const auth = await requireUser();
  if ("error" in auth) {
    return new Response(textStream(SIGNED_OUT), { headers: streamHeaders("fallback") });
  }

  const quota = await consumeAiQuota(auth.supabase, auth.userId, "explain");
  if (!quota.allowed) {
    return new Response(textStream(OVER_QUOTA), { headers: streamHeaders("fallback") });
  }

  const stream = await streamGroqChat({
    system: buildSystemPrompt(lessonId),
    messages: [{ role: "user", content: `Explain this passage:\n\n"${text}"` }],
    maxTokens: 320,
    temperature: 0.4,
  });

  if (!stream) {
    return new Response(textStream(isAiConfigured ? UNAVAILABLE : SIGNED_OUT), {
      headers: streamHeaders("fallback"),
    });
  }

  return new Response(stream, { headers: streamHeaders("live") });
}
