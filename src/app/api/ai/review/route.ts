/**
 * POST /api/ai/review — reviews a solution that already passes.
 *
 * Passing the tests proves the code is correct, not that it's good. This is
 * the moment a student is most receptive — they've just succeeded and haven't
 * moved on yet — so it's the cheapest place to teach idiom, numerical
 * stability and the difference between "works" and "what a quant would write".
 *
 * Deliberately not offered before the tests pass: reviewing broken code is the
 * tutor's job, and doing it here would just be a second, worse hint button.
 */
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { getLessonContext } from "@/lib/tracks";
import { streamGroqChat, textStream, streamHeaders, isAiConfigured } from "@/lib/ai/groq";
import { consumeAiQuota } from "@/lib/ai/quota";

const SIGNED_OUT = `Sign in to get your solution reviewed.

Your code passes, which means it's correct. A review looks at the next question: is it *good*? Idiomatic Python, numerically stable, readable by someone else six months from now.`;

const OVER_QUOTA = `You've used today's AI budget — it resets at midnight UTC.

Your solution passed, which is the part that counts. Come back tomorrow if you want it reviewed.`;

const UNAVAILABLE = `Couldn't reach the reviewer right now. Your solution still passed — that part is real.`;

function buildSystemPrompt(lessonId: string): string {
  const ctx = getLessonContext(lessonId);
  const lessonBlock = ctx
    ? `The exercise is from "${ctx.lesson.title}" (${ctx.lesson.subtitle}) in the ${ctx.track.title} track.`
    : "The exercise is from a StrikeLab lesson.";

  return `You are reviewing a high schooler's Python solution on StrikeLab, a free options-pricing and quant-finance curriculum. Their code ALREADY PASSES the tests.

${lessonBlock}

Write a short review in exactly these three parts, using these headings:

**What you got right**
One or two sentences naming the specific thing they did correctly. Be concrete — reference their actual variable names or structure. Never generic praise.

**Worth tightening**
The single highest-value improvement. Prefer, in order: a numerical-stability or correctness-under-edge-cases issue, then a Python idiom, then naming or structure. If the code is genuinely clean, say so plainly and skip to the last section instead of inventing a nitpick.

**How a quant would write it**
A short code block showing the improved version. Only include this if you actually suggested a change.

RULES:
- Under 200 words total.
- Never rewrite the whole solution as if theirs were wrong — it passed.
- Assume strong maths, limited software engineering.
- Plain and direct. No cheerleading.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { lessonId = "", code = "" } = body as { lessonId?: string; code?: string };

  if (!code.trim()) {
    return new Response(textStream("Nothing to review yet — run your solution first."), {
      headers: streamHeaders("fallback"),
    });
  }

  const auth = await requireUser();
  if ("error" in auth) {
    return new Response(textStream(SIGNED_OUT), { headers: streamHeaders("fallback") });
  }

  const quota = await consumeAiQuota(auth.supabase, auth.userId, "review");
  if (!quota.allowed) {
    return new Response(textStream(OVER_QUOTA), { headers: streamHeaders("fallback") });
  }

  const stream = await streamGroqChat({
    system: buildSystemPrompt(lessonId),
    messages: [
      {
        role: "user",
        content: `Here is my working solution:\n\n\`\`\`python\n${code.slice(0, 3000)}\n\`\`\``,
      },
    ],
    maxTokens: 450,
    temperature: 0.3,
  });

  if (!stream) {
    return new Response(textStream(isAiConfigured ? UNAVAILABLE : SIGNED_OUT), {
      headers: streamHeaders("fallback"),
    });
  }

  return new Response(stream, { headers: streamHeaders("live") });
}
