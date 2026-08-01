/**
 * POST /api/ai/chat — the conversational tutor.
 *
 * Replaces the old one-shot hint flow, where asking a follow-up threw away
 * everything that came before. The client sends the running thread plus the
 * student's current code and error; the server rebuilds lesson context from the
 * real curriculum (not a hand-maintained lookup table that drifts as lessons
 * change) and streams a reply back as plain text.
 *
 * Signed-in + quota-capped, because every call costs tokens. Signed-out
 * visitors get a canned nudge rather than a paid completion.
 */
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { getLessonContext } from "@/lib/tracks";
import {
  streamGroqChat,
  textStream,
  streamHeaders,
  clampHistory,
  isAiConfigured,
  type ChatMessage,
} from "@/lib/ai/groq";
import { consumeAiQuota } from "@/lib/ai/quota";

const SIGNED_OUT_REPLY = `I can walk you through this, but I need you signed in first — AI tutoring is capped per account so the bill stays predictable.

In the meantime, three things worth checking on almost any failing exercise:

1. **Read the error's last line first.** Python puts the actual problem there; everything above is the call stack.
2. **Print your intermediate values.** If a formula is wrong, \`print(d1, d2)\` before the return tells you which half broke.
3. **Check your operators.** \`**\` is exponentiation, not \`^\`. \`log\` from \`math\` is natural log, not base 10.`;

const OVER_QUOTA_REPLY = `You've used today's AI tutoring budget — it resets at midnight UTC.

That cap exists because StrikeLab is free and every AI reply costs real money to generate. The lesson text, the exercise, and the solution are all still available; the tutor will be back tomorrow.`;

const UNAVAILABLE_REPLY = `The AI tutor is unreachable right now — that's on our end, not yours.

Try the lesson's worked example and the hint in the exercise panel while I sort myself out.`;

function buildSystemPrompt(lessonId: string): string {
  const ctx = getLessonContext(lessonId);

  const lessonBlock = ctx
    ? `The student is on "${ctx.lesson.title}" (${ctx.lesson.subtitle}) — lesson ${ctx.positionInTrack} of ${ctx.trackLength} in the ${ctx.track.title} track.`
    : `The student is working through a StrikeLab lesson.`;

  return `You are the StrikeLab AI tutor. StrikeLab teaches options pricing and quant finance to high schoolers through Python exercises that run in the browser.

${lessonBlock}

HOW TO TEACH:
- Give the next step, never the finished solution. If they ask outright for the answer, give them the step that unblocks them and say why you're stopping there.
- Diagnose the specific error in front of you. Quote the line you mean.
- Ask a pointed question when it will make them find it themselves. Don't ask more than one at a time.
- Assume strong maths, limited finance. They can handle calculus and logs; they may not know what a strike price is.
- Be concise: 150-250 words. Short paragraphs. Code blocks for code.
- Plain and direct. No cheerleading, no "great question".

You may use markdown: **bold**, \`inline code\`, and fenced code blocks.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const {
    lessonId = "",
    messages = [],
    code = "",
    error = "",
  } = body as { lessonId?: string; messages?: ChatMessage[]; code?: string; error?: string };

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(textStream("Ask me something about this lesson and I'll help."), {
      headers: streamHeaders("fallback"),
    });
  }

  const auth = await requireUser();
  if ("error" in auth) {
    return new Response(textStream(SIGNED_OUT_REPLY), { headers: streamHeaders("fallback") });
  }

  const quota = await consumeAiQuota(auth.supabase, auth.userId, "chat");
  if (!quota.allowed) {
    return new Response(textStream(OVER_QUOTA_REPLY), { headers: streamHeaders("fallback") });
  }

  // The student's current editor state rides along as context on the latest
  // turn, so the model sees the code without it cluttering the visible thread.
  const history = clampHistory(messages);
  const stateParts: string[] = [];
  if (code.trim()) stateParts.push(`Their current code:\n\`\`\`python\n${code.slice(0, 2000)}\n\`\`\``);
  if (error.trim()) stateParts.push(`The error they're seeing:\n\`\`\`\n${error.slice(0, 800)}\n\`\`\``);

  if (stateParts.length > 0) {
    const last = history[history.length - 1];
    if (last?.role === "user") {
      last.content = `${stateParts.join("\n\n")}\n\n${last.content}`;
    }
  }

  const stream = await streamGroqChat({
    system: buildSystemPrompt(lessonId),
    messages: history,
    maxTokens: 500,
    temperature: 0.4,
  });

  if (!stream) {
    return new Response(textStream(isAiConfigured ? UNAVAILABLE_REPLY : SIGNED_OUT_REPLY), {
      headers: streamHeaders("fallback"),
    });
  }

  return new Response(stream, { headers: streamHeaders("live") });
}
