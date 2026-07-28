/**
 * Shared Groq client for every AI feature (tutor chat, code review, explain,
 * practice generation).
 *
 * All of these need the same four things: a configured key, an SSE -> plain
 * text transform, a graceful fallback when the key is missing or the caller is
 * over quota, and bounded output. Keeping that in one place means a new AI
 * surface is a prompt plus a route, not another copy of this plumbing.
 *
 * Server-only. Never import from a client component — it reads GROQ_API_KEY.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export const AI_MODEL = "llama-3.3-70b-versatile";
export const isAiConfigured = Boolean(GROQ_API_KEY);

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Caps on what we'll forward to Groq. These exist to bound spend, not to be
 * pedantic: history grows without limit as a student keeps chatting, and every
 * turn re-sends the whole thread.
 */
export const MAX_HISTORY_MESSAGES = 10;
export const MAX_MESSAGE_CHARS = 4000;

/** Trims history to the most recent turns and clamps each message's length. */
export function clampHistory(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: String(m.content ?? "").slice(0, MAX_MESSAGE_CHARS) }))
    .filter((m) => m.content.trim().length > 0);
}

/**
 * Streams a Groq completion as plain UTF-8 text (not SSE) so the client can
 * append chunks straight into state without parsing.
 *
 * Returns null when Groq is unreachable or errors, so callers can fall back to
 * canned content rather than showing a broken panel.
 */
export async function streamGroqChat(opts: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<ReadableStream<Uint8Array> | null> {
  if (!isAiConfigured) return null;

  let res: Response;
  try {
    res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [{ role: "system", content: opts.system }, ...opts.messages],
        stream: true,
        max_tokens: opts.maxTokens ?? 500,
        temperature: opts.temperature ?? 0.4,
      }),
    });
  } catch (err) {
    console.error("[ai/groq] request failed:", err);
    return null;
  }

  if (!res.ok || !res.body) {
    console.error("[ai/groq] error response:", res.status, await res.text().catch(() => ""));
    return null;
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = res.body.getReader();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the trailing partial line for the next chunk.
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") { controller.close(); return; }
            try {
              const token: string = JSON.parse(data)?.choices?.[0]?.delta?.content ?? "";
              if (token) controller.enqueue(encoder.encode(token));
            } catch {
              // A malformed SSE line shouldn't kill the stream.
            }
          }
        }
        controller.close();
      } catch (err) {
        console.error("[ai/groq] stream failed:", err);
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

/**
 * Non-streaming completion that must come back as JSON.
 *
 * Streaming is wrong for structured output: you can't parse a half-arrived
 * object, so the client would just buffer the whole thing anyway. Uses Groq's
 * json_object response format and still guards the parse, because a malformed
 * object should degrade to "couldn't generate" rather than throw.
 *
 * Returns null on any failure — transport, HTTP, or unparseable body.
 */
export async function completeGroqJson<T>(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<T | null> {
  if (!isAiConfigured) return null;

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        response_format: { type: "json_object" },
        max_tokens: opts.maxTokens ?? 1400,
        temperature: opts.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      console.error("[ai/groq] json error:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const body = await res.json();
    const content: string = body?.choices?.[0]?.message?.content ?? "";
    if (!content) return null;

    return JSON.parse(content) as T;
  } catch (err) {
    console.error("[ai/groq] json request failed:", err);
    return null;
  }
}

/** Replays canned text as a stream so fallbacks look identical to the client. */
export function textStream(text: string, delayMs = 12): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const words = text.split(" ");
  let i = 0;
  return new ReadableStream({
    async pull(controller) {
      if (i >= words.length) { controller.close(); return; }
      controller.enqueue(encoder.encode(i === 0 ? words[i] : " " + words[i]));
      i++;
      await new Promise((r) => setTimeout(r, delayMs));
    },
  });
}

/** Standard headers for these streaming text responses. */
export function streamHeaders(mode: "live" | "fallback"): HeadersInit {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-AI-Mode": mode,
  };
}
