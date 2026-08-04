/**
 * POST /api/ai/sandbox-insight — a short AI take on a paper-trading sandbox
 * position (proposed or already open).
 *
 * Same shape as /api/ai/explain: sign-in + quota gated, streams plain text,
 * falls back to a canned line when unauthenticated/over-quota/unreachable so
 * the panel never shows a broken request.
 */
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { streamGroqChat, textStream, streamHeaders, isAiConfigured } from "@/lib/ai/groq";
import { consumeAiQuota } from "@/lib/ai/quota";
import type { AssetType } from "@/lib/pricing";

interface InsightRequest {
  symbol?: string;
  name?: string;
  assetType?: AssetType;
  side?: "long" | "short";
  qty?: number;
  strike?: number | null;
  expiry?: string | null;
  price?: number;
  unrealizedPnl?: number | null;
  status?: "proposed" | "open";
}

const SIGNED_OUT = "Sign in to get an AI take on this trade.";
const OVER_QUOTA = "You've used today's AI budget — it resets at midnight UTC.";
const UNAVAILABLE = "Couldn't reach the AI coach right now. Try again in a moment.";

function buildSystemPrompt(): string {
  return `You are an AI trading coach embedded in StrikeLab's paper-trading sandbox — a $100,000 SIMULATED cash account high-school and college students use to practice options and stock trades with fake money and simulated prices.

RULES:
- Explain the mechanics and risk/reward of THIS specific position in plain English. Reference moneyness (ITM/OTM/ATM) for options, and briefly note time-decay (theta) and volatility exposure at a high level — don't derive Greeks numerically.
- If it's a stock leg, focus on directional exposure and position sizing relative to a $100,000 account instead.
- Be concrete: use the actual numbers given (strike, price, quantity) in your explanation.
- Under 110 words. This is a quick coaching note, not a lecture.
- End with one short line reminding them this is a simulation for learning, not real financial advice.
- Plain and direct. Don't restate the question before answering.

You may use **bold** and \`inline code\` for numbers/terms, but no fenced code blocks — this is prose, not code.`;
}

function describePosition(body: InsightRequest): string {
  const qtyLabel = body.assetType === "stock" ? "shares" : "contracts";
  const parts: string[] = [
    `Status: ${body.status === "open" ? "already open" : "about to be placed"}`,
    `${body.side === "short" ? "Short" : "Long"} ${body.qty ?? "?"} ${qtyLabel} of ${body.symbol ?? "?"} (${body.name ?? body.symbol})`,
    `Instrument: ${body.assetType ?? "stock"}`,
  ];
  if (body.assetType !== "stock") {
    parts.push(`Strike: ${body.strike ?? "?"}`, `Expiry: ${body.expiry ?? "?"}`);
  }
  if (typeof body.price === "number") {
    parts.push(`${body.status === "open" ? "Avg cost" : "Current simulated price"}: $${body.price.toFixed(2)}`);
  }
  if (typeof body.unrealizedPnl === "number") {
    parts.push(`Current unrealized P&L: ${body.unrealizedPnl >= 0 ? "+" : ""}$${body.unrealizedPnl.toFixed(2)}`);
  }
  return parts.join("\n");
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as InsightRequest;

  if (!body.symbol || !body.assetType) {
    return new Response(textStream("Set up a trade first, then ask for an AI take."), {
      headers: streamHeaders("fallback"),
    });
  }

  const auth = await requireUser();
  if ("error" in auth) {
    return new Response(textStream(SIGNED_OUT), { headers: streamHeaders("fallback") });
  }

  const quota = await consumeAiQuota(auth.supabase, auth.userId, "sandboxInsight");
  if (!quota.allowed) {
    return new Response(textStream(OVER_QUOTA), { headers: streamHeaders("fallback") });
  }

  const stream = await streamGroqChat({
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: describePosition(body) }],
    maxTokens: 260,
    temperature: 0.5,
  });

  if (!stream) {
    return new Response(textStream(isAiConfigured ? UNAVAILABLE : SIGNED_OUT), {
      headers: streamHeaders("fallback"),
    });
  }

  return new Response(stream, { headers: streamHeaders("live") });
}
