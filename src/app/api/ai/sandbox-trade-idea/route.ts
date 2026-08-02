/**
 * POST /api/ai/sandbox-trade-idea — turns a plain-English market thesis into
 * one concrete, executable sandbox trade.
 *
 * Unlike /api/ai/sandbox-insight (which explains a trade the student already
 * built), this generates the trade itself: structured JSON the client uses to
 * autofill the order ticket. Uses Groq's json_object mode (completeGroqJson)
 * rather than streaming, since a half-arrived trade object isn't usable.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { completeGroqJson, isAiConfigured } from "@/lib/ai/groq";
import { consumeAiQuota } from "@/lib/ai/quota";
import { WATCHLIST, simulatePrice, type AssetType } from "@/lib/pricing";

const MAX_THESIS_CHARS = 300;

interface RawIdea {
  symbol?: string;
  assetType?: string;
  side?: string;
  strike?: number;
  expiryDays?: number;
  qty?: number;
  rationale?: string;
}

function buildSystemPrompt(): string {
  return `You generate ONE concrete trade idea for a student inside StrikeLab's paper-trading sandbox — a $100,000 SIMULATED account, fake money, simulated prices. You are not giving real financial advice.

Given the student's plain-English market thesis and a list of allowed tickers with approximate current simulated prices, respond with STRICT JSON only, matching exactly this shape:
{"symbol": string, "assetType": "stock"|"call"|"put", "side": "long"|"short", "strike": number|null, "expiryDays": number|null, "qty": number, "rationale": string}

RULES:
- "symbol" MUST be exactly one ticker from the allowed list, spelled exactly as given.
- Pick "assetType": use "call"/"put" for a leveraged or risk-limited directional view, "stock" for a lower-risk direct view. Use "put"+long or "call"+short for bearish views (buying a put, or shorting a call), "call"+long or "put"+short for bullish views.
- If assetType is "stock", set "strike" and "expiryDays" to null.
- If assetType is "call" or "put", "strike" should be within roughly 15% of the given approximate price, and "expiryDays" between 14 and 120.
- "qty" should size the position to roughly 1-8% of the $100,000 account at the given approximate price (shares for stock, contracts x100 multiplier for options).
- "rationale" must be under 50 words, plain English, reference the thesis directly, and end by reminding them this is a simulated trade for learning.
- Output ONLY the JSON object. No markdown, no commentary outside the JSON.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const thesis = String((body as { thesis?: string }).thesis ?? "").trim().slice(0, MAX_THESIS_CHARS);

  if (thesis.length < 5) {
    return NextResponse.json({ error: "Describe your market view first." }, { status: 400 });
  }

  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: "Sign in to get an AI trade idea." }, { status: 401 });
  }

  const quota = await consumeAiQuota(auth.supabase, auth.userId, "sandboxTradeIdea");
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "You've used today's AI budget — it resets at midnight UTC." },
      { status: 429 }
    );
  }

  if (!isAiConfigured) {
    return NextResponse.json(
      { error: "AI trade ideas aren't configured on this deployment." },
      { status: 503 }
    );
  }

  const priceList = WATCHLIST.map((w) => `${w.symbol} ~$${Math.round(simulatePrice(w.symbol))}`).join(", ");

  const raw = await completeGroqJson<RawIdea>({
    system: buildSystemPrompt(),
    user: `Allowed tickers with approximate current simulated price:\n${priceList}\n\nStudent's market thesis: "${thesis}"`,
    maxTokens: 300,
    temperature: 0.6,
  });

  if (!raw) {
    return NextResponse.json({ error: "Couldn't generate an idea right now. Try again." }, { status: 503 });
  }

  const watch = WATCHLIST.find((w) => w.symbol === raw.symbol);
  const assetType = raw.assetType as AssetType;
  const side = raw.side as "long" | "short";

  if (!watch || !["stock", "call", "put"].includes(assetType) || !["long", "short"].includes(side)) {
    return NextResponse.json(
      { error: "The AI returned an unusable idea — try rephrasing your thesis." },
      { status: 502 }
    );
  }

  const qty = Math.max(1, Math.min(500, Math.round(Number(raw.qty) || 1)));
  const isStock = assetType === "stock";
  const strike = isStock ? null : Math.max(1, Math.round(Number(raw.strike) || watch.basePrice));
  const expiryDays = isStock ? null : Math.max(7, Math.min(180, Math.round(Number(raw.expiryDays) || 30)));

  return NextResponse.json({
    symbol: watch.symbol,
    assetType,
    side,
    strike,
    expiryDays,
    qty,
    rationale: String(raw.rationale ?? "").slice(0, 400),
  });
}
