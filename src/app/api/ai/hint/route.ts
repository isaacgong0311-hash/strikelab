import { NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import type { SupabaseClient } from "@supabase/supabase-js";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DAILY_HINT_CAP = 20;

/**
 * Checks and increments today's hint count for a user. Returns true if the
 * caller is still under the cap (and the count was incremented), false if
 * they're over it. Fails open (allows the request) on any DB error — a
 * transient Supabase hiccup shouldn't block a student's hint.
 */
async function consumeHintQuota(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("hint_usage")
    .select("day, count")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[ai/hint] quota read failed:", error.message);
    return true;
  }

  const isNewDay = !data || data.day !== today;
  const nextCount = isNewDay ? 1 : data.count + 1;

  if (!isNewDay && data.count >= DAILY_HINT_CAP) {
    return false;
  }

  const { error: upsertError } = await supabase
    .from("hint_usage")
    .upsert({ user_id: userId, day: today, count: nextCount }, { onConflict: "user_id" });

  if (upsertError) console.error("[ai/hint] quota write failed:", upsertError.message);
  return true;
}

// ─── Lesson context lookup ────────────────────────────────────────────────────
const LESSON_CONTEXT: Record<string, string> = {
  "1":     "Options basics — calls, puts, intrinsic vs. extrinsic value, long/short payoffs",
  "2":     "Put-Call Parity — C - P = S - K·e^(-rT), arbitrage relationships",
  "3":     "Black-Scholes Model — implementing bs_call(S, K, T, r, sigma) in Python using scipy.stats.norm",
  "4":     "Delta — ∂C/∂S, N(d1), directional sensitivity, hedge ratios",
  "5":     "Gamma — ∂²C/∂S², ∂Δ/∂S, convexity, gamma scalping",
  "6":     "Theta — ∂C/∂T (time decay), daily P&L erosion for long options",
  "7":     "Vega — ∂C/∂σ, implied vs. realized vol, volatility exposure",
  "8":     "Implied Volatility — inverting Black-Scholes with Newton-Raphson / bisection",
  "9":     "Option Strategies — covered calls, protective puts, straddles, spreads",
  "inv-1": "What is a stock? Equity ownership, dividends, market cap",
  "inv-2": "Reading financial statements — income statement, balance sheet, cash flow",
  "inv-3": "Valuation basics — P/E, P/B, EV/EBITDA, comparables",
  "inv-4": "DCF fundamentals — free cash flow, discount rate, terminal value",
  "inv-5": "Portfolio theory — diversification, correlation, risk/return trade-off",
  "inv-6": "Efficient market hypothesis — weak/semi-strong/strong form",
  "q1":    "CAPM — Beta, systematic risk, Security Market Line",
  "q3":    "Backtesting — vectorized backtests in Python, Sharpe ratio, max drawdown",
  "q4":    "Portfolio optimization — mean-variance optimization, efficient frontier, covariance matrix",
};

// ─── Mock hints for demo mode ─────────────────────────────────────────────────
const MOCK_HINTS: Record<string, string> = {
  "3": `Here's a hint for implementing Black-Scholes in Python:

**Structure:**
\`\`\`python
from math import log, sqrt, exp
from scipy.stats import norm

def bs_call(S, K, T, r, sigma):
    d1 = (log(S/K) + (r + sigma**2/2)*T) / (sigma * sqrt(T))
    d2 = d1 - sigma * sqrt(T)
    return S * norm.cdf(d1) - K * exp(-r*T) * norm.cdf(d2)
\`\`\`

**Key things to check:**
- \`d1\` uses \`log(S/K)\` (natural log, not log base 10)
- The exponent in \`K·e^(-rT)\` should be negative: \`exp(-r*T)\`
- \`norm.cdf\` from scipy gives you N(x), the standard normal CDF`,

  "default": `**Debugging tips:**

1. **Read the error message carefully** — Python errors usually point to the exact line and problem
2. **Check your math** — Are you using \`**\` for exponentiation (not \`^\`)? Natural \`log\` or log base 10?
3. **Print intermediate values** — Add \`print(d1, d2)\` before your return to sanity-check
4. **Check imports** — Do you have \`from math import log, sqrt, exp\` at the top?

If you're seeing a \`NameError\`, you're probably missing an import.
If you're seeing wrong numbers, check sign (+/-) on exponents.`,
};

// ─── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are an AI tutor for StrikeLab, an options pricing and investing education platform for high school and college students.

Your role is to give targeted, pedagogically useful HINTS — not full solutions.

RULES:
- Give hints that guide the student toward the answer without giving it away
- Reference the specific concept (Black-Scholes, Greeks, etc.) relevant to their lesson
- Keep responses concise (150–300 words max)
- Use code blocks for any code snippets
- If they show an error, diagnose the specific issue
- Use Socratic questions to guide thinking
- Be encouraging but direct
- Use Python examples when relevant
- Never write the complete solution — give the next step they need`;
}

function buildUserMessage(
  lessonId: string,
  code: string,
  error: string | undefined,
  question: string | undefined,
): string {
  const ctx = LESSON_CONTEXT[lessonId] ?? "General options/investing concepts";
  const parts: string[] = [`[Lesson: ${ctx}]`];

  if (question) {
    parts.push(`Student question: ${question}`);
  }
  if (code && code.trim()) {
    parts.push(`Student's code:\n\`\`\`python\n${code.slice(0, 800)}\n\`\`\``);
  }
  if (error && error.trim()) {
    parts.push(`Error they're seeing:\n\`\`\`\n${error.slice(0, 400)}\n\`\`\``);
  }
  if (!question && !error) {
    parts.push("Student is stuck and needs a hint to get started.");
  }

  return parts.join("\n\n");
}

// ─── Mock streaming helper ────────────────────────────────────────────────────
function mockStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const words = text.split(" ");
  let i = 0;

  return new ReadableStream({
    async pull(controller) {
      if (i >= words.length) {
        controller.close();
        return;
      }
      const chunk = (i === 0 ? words[i] : " " + words[i]);
      controller.enqueue(encoder.encode(chunk));
      i++;
      await new Promise((r) => setTimeout(r, 18));
    },
  });
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { lessonId = "default", code = "", error, question } = body as {
    lessonId?: string;
    code?: string;
    error?: string;
    question?: string;
  };

  // ── Mock mode ──────────────────────────────────────────────────────────────
  // Falls back to a canned hint (no Groq call, no cost) when: no API key is
  // configured, the caller isn't signed in, or they've hit today's cap. Real
  // AI hints are a signed-in, rate-limited feature to keep Groq spend bounded.
  const auth = await requireUser();
  const isAuthed = !("error" in auth);
  const underQuota = isAuthed && (await consumeHintQuota(auth.supabase, auth.userId));

  if (!GROQ_API_KEY || !isAuthed || !underQuota) {
    const hint = MOCK_HINTS[lessonId] ?? MOCK_HINTS["default"];
    return new Response(mockStream(hint), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Hint-Mode": "mock",
        "Cache-Control": "no-store",
      },
    });
  }

  // ── Groq streaming ─────────────────────────────────────────────────────────
  const groqRes = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserMessage(lessonId, code, error, question) },
      ],
      stream: true,
      max_tokens: 400,
      temperature: 0.4,
    }),
  });

  if (!groqRes.ok) {
    const err = await groqRes.text();
    console.error("Groq API error:", err);
    // Fall back to mock on API error
    const hint = MOCK_HINTS[lessonId] ?? MOCK_HINTS["default"];
    return new Response(mockStream(hint), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Transform SSE → raw text stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = groqRes.body?.getReader();
      if (!reader) { controller.close(); return; }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) { controller.close(); break; }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") { controller.close(); return; }
          try {
            const parsed = JSON.parse(data);
            const token: string = parsed?.choices?.[0]?.delta?.content ?? "";
            if (token) controller.enqueue(encoder.encode(token));
          } catch {
            // skip malformed line
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
