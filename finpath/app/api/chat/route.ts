import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, MODEL, isMockMode } from "@/lib/groq";
import type { ChatMessage } from "@/lib/types";

const SYSTEM = `You are FinPath, a warm and knowledgeable AI financial coach for everyday people.
You help users understand their personal finances — budgeting, debt, saving, and building financial stability.
Be specific, practical, and concise. Show numbers when relevant. Never recommend specific stocks, funds, or financial products by name.
If asked about investing, explain concepts but don't give advice on what to buy.`;

const MOCK_REPLIES: Record<string, string> = {
  default:
    "Great question! In live mode I'd give you a fully personalized answer. Here's the general principle: **pay yourself first** — automate savings before you have a chance to spend. If you're asking about debt, the avalanche method (highest APR first) saves the most money; the snowball method (smallest balance first) builds momentum. Which one is better depends on your psychology. Add a `GROQ_API_KEY` to unlock full AI coaching.",
  emergency:
    "An emergency fund is your financial immune system. Start with **$1,000** — enough to handle most surprise expenses without a credit card. Then build to **3 months of expenses**. Keep it in a high-yield savings account (HYSA), separate from checking so you don't accidentally spend it.",
  debt: "Use the **avalanche method**: list your debts by APR (highest first), pay minimums on all, then throw every spare dollar at the top debt. When it's gone, roll that payment into the next. You'll pay the least interest overall.",
  budget:
    "A solid starting framework is **50/30/20**: 50% to needs (housing, food, transport), 30% to wants, 20% to savings and debt above minimum payments. Adjust the percentages to your situation — the key is awareness, not perfection.",
};

function pickMock(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("emergency") || lower.includes("fund")) return MOCK_REPLIES.emergency;
  if (lower.includes("debt") || lower.includes("loan") || lower.includes("credit"))
    return MOCK_REPLIES.debt;
  if (lower.includes("budget") || lower.includes("spending") || lower.includes("save"))
    return MOCK_REPLIES.budget;
  return MOCK_REPLIES.default;
}

export async function POST(req: NextRequest) {
  const { messages, context }: { messages: ChatMessage[]; context?: string } = await req.json();
  const client = getGroqClient();

  if (isMockMode() || !client) {
    const last = messages[messages.length - 1]?.content ?? "";
    return new NextResponse(pickMock(last), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const systemContent = context ? `${SYSTEM}\n\nUser's current budget context:\n${context}` : SYSTEM;

  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemContent },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    stream: true,
    max_tokens: 600,
    temperature: 0.7,
  });

  const enc = new TextEncoder();
  const readable = new ReadableStream({
    async start(ctrl) {
      for await (const chunk of stream) {
        const t = chunk.choices[0]?.delta?.content ?? "";
        if (t) ctrl.enqueue(enc.encode(t));
      }
      ctrl.close();
    },
  });

  return new NextResponse(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
  });
}
