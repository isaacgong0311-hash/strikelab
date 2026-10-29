import { NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { AI_CLASS_OFF_REPLY, AI_UNAVAILABLE_REPLY, consumeAiQuota } from "@/lib/ai/quota";
import { isAiConfigured, streamGroqChat, streamHeaders, textStream } from "@/lib/ai/groq";
import { getMistakeContext, mistakePrompt } from "@/lib/ai/mistake";

const OVER_QUOTA = "You've used today's AI budget. The author-written explanation above still works, and you can retry the question.";
const UNAVAILABLE = "The AI explanation isn't available right now. Read the worked explanation above, then try the question again.";

/** A second explanation after a missed session item, charged to the existing AI budget. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const context = body && typeof body === "object"
    ? getMistakeContext(body as { sessionId: unknown; stepId: unknown; answer: unknown })
    : null;
  if (!context) return new Response("Invalid missed answer.", { status: 400 });

  const auth = await requireUser();
  if ("error" in auth) {
    return new Response(textStream("Sign in to ask for an AI explanation. The worked explanation above is available to everyone."), {
      headers: streamHeaders("fallback"),
    });
  }

  if (!isAiConfigured) {
    return new Response(textStream(UNAVAILABLE), { headers: streamHeaders("fallback") });
  }

  const quota = await consumeAiQuota(auth.supabase, auth.userId, "explain");
  if (!quota.allowed) {
    const reply = quota.reason === "class" ? AI_CLASS_OFF_REPLY : quota.reason === "unavailable" ? AI_UNAVAILABLE_REPLY : OVER_QUOTA;
    return new Response(textStream(reply), { headers: streamHeaders("fallback") });
  }

  const stream = await streamGroqChat({
    system: mistakePrompt(context),
    messages: [{ role: "user", content: "Help me understand my mistake." }],
    maxTokens: 200,
    temperature: 0.3,
  });
  return new Response(stream ?? textStream(UNAVAILABLE), {
    headers: streamHeaders(stream ? "live" : "fallback"),
  });
}
