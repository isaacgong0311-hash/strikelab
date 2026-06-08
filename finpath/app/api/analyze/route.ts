import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, MODEL, isMockMode } from "@/lib/groq";
import type { BudgetData } from "@/lib/types";

const SYSTEM_PROMPT = `You are FinPath, an empathetic AI financial coach for everyday people.
Analyze the user's budget and deliver a structured report with these sections, in order:

## 💰 Financial Health Score: [X]/100 — [Label]
One sentence on what the score reflects.

## 📊 Budget Breakdown
A markdown table: Category | Amount | % of Income | Status (🟢 OK / 🟡 Watch / 🔴 High).
Flag housing >30%, food >15%, transport >15% as Watch/High. Then one sentence of insight.

## ✅ Top 3 Action Items
Three numbered, specific, immediately actionable steps. No vague advice.

## 🎯 Debt Payoff Strategy (Avalanche Method)
Only include if debts were listed. Rank debts highest-APR first. Show the payoff sequence clearly.
If no debts, skip this section.

## 🏦 Emergency Fund Plan
Target = 3 months of total spending. Show a 2-row table: savings rate → months to goal.

End every response with exactly this line:
*You've got this. Small steps lead to big changes.*

Tone: honest, warm, non-judgmental. Use markdown formatting throughout.`;

function buildUserMessage(data: BudgetData): string {
  const totalExp = data.expenses.reduce((s, e) => s + e.amount, 0);
  const totalDebt = data.debts.reduce((s, d) => s + d.minimumPayment, 0);
  const total = totalExp + totalDebt;
  const surplus = data.monthlyIncome - total;

  const expLines = data.expenses.map((e) => `- ${e.category}: $${e.amount}`).join("\n");
  const debtLines =
    data.debts.length > 0
      ? `Debts:\n${data.debts.map((d) => `- ${d.name}: $${d.balance.toLocaleString()} balance, ${d.interestRate}% APR, $${d.minimumPayment}/mo minimum`).join("\n")}`
      : "No debts listed.";

  return `Monthly Income: $${data.monthlyIncome.toLocaleString()}

Expenses:
${expLines}

${debtLines}

Total spending: $${total.toLocaleString()}/mo
Monthly surplus: $${surplus.toLocaleString()}

Please analyze my budget.`;
}

function mockAnalysis(data: BudgetData): string {
  const totalExp = data.expenses.reduce((s, e) => s + e.amount, 0);
  const totalDebt = data.debts.reduce((s, d) => s + d.minimumPayment, 0);
  const total = totalExp + totalDebt;
  const surplus = data.monthlyIncome - total;
  const score =
    surplus <= 0 ? 28 : Math.min(88, 45 + Math.round((surplus / data.monthlyIncome) * 100));
  const label =
    score >= 75 ? "Strong Foundation" : score >= 55 ? "Room to Grow" : "Needs Attention";
  const emergencyTarget = Math.round(total * 3);
  const saveLow = Math.max(50, Math.round(surplus * 0.3));
  const saveHigh = Math.max(100, Math.round(surplus * 0.6));

  const expTable = data.expenses
    .map((e) => {
      const pct = Math.round((e.amount / data.monthlyIncome) * 100);
      let st = "🟢 OK";
      if (e.category.toLowerCase().includes("rent") || e.category.toLowerCase().includes("hous")) {
        st = pct > 30 ? "🔴 High" : pct > 25 ? "🟡 Watch" : "🟢 OK";
      } else {
        st = pct > 20 ? "🔴 High" : pct > 15 ? "🟡 Watch" : "🟢 OK";
      }
      return `| ${e.category} | $${e.amount.toLocaleString()} | ${pct}% | ${st} |`;
    })
    .join("\n");

  const debtSection =
    data.debts.length > 0
      ? `## 🎯 Debt Payoff Strategy (Avalanche Method)

Pay minimum on everything, then throw every extra dollar at the highest-rate debt:

${[...data.debts]
  .sort((a, b) => b.interestRate - a.interestRate)
  .map(
    (d, i) =>
      `**Step ${i + 1}:** ${d.name} — ${d.interestRate}% APR | $${d.balance.toLocaleString()} remaining | $${d.minimumPayment}/mo minimum`
  )
  .join("\n\n")}

Once each debt is paid off, roll its payment into the next one.

`
      : "";

  return `## 💰 Financial Health Score: ${score}/100 — ${label}

Your monthly surplus of **$${surplus.toLocaleString()}** (${Math.round((surplus / data.monthlyIncome) * 100)}% of income) is the engine of your financial future.

## 📊 Budget Breakdown

| Category | Amount | % of Income | Status |
|----------|--------|-------------|--------|
${expTable}

**Benchmark:** Housing ≤30% · Food ≤15% · Transport ≤15% · Savings ≥20%

## ✅ Top 3 Action Items

1. **Automate savings on payday.** Move $${saveLow}–$${saveHigh}/mo to a separate HYSA the moment your paycheck hits. You can't spend what you don't see.
2. **Audit subscriptions this week.** Streaming, gym, apps — cancel anything unused for 30+ days. Most people find $40–80/mo hiding here.
3. **Build a $1,000 starter emergency fund first.** Before aggressive debt payoff or investing — this breaks the payday-loan cycle when surprises hit.

${debtSection}## 🏦 Emergency Fund Plan

Target: **$${emergencyTarget.toLocaleString()}** (3 months of expenses)

| Monthly Savings | Months to Goal |
|----------------|----------------|
| $${saveLow.toLocaleString()} | ~${Math.ceil(emergencyTarget / saveLow)} months |
| $${saveHigh.toLocaleString()} | ~${Math.ceil(emergencyTarget / saveHigh)} months |

---

*You've got this. Small steps lead to big changes.*

> ⚠️ **Demo Mode** — add \`GROQ_API_KEY\` to \`.env.local\` for live personalized AI analysis.`;
}

export async function POST(req: NextRequest) {
  const body: BudgetData = await req.json();
  const client = getGroqClient();

  if (isMockMode() || !client) {
    return new NextResponse(mockAnalysis(body), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(body) },
    ],
    stream: true,
    max_tokens: 1800,
    temperature: 0.65,
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
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
