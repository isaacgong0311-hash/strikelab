# FinPath — AI-Powered Financial Coaching for Everyone

> STEMinate Hacks 2026 · Tracks: Social Good + Machine Learning / AI

---

## 🎯 The Problem

37% of Americans cannot cover a $400 emergency expense. 45 million people carry high-interest credit card debt. And yet, personalized financial guidance — the kind that could actually change those numbers — costs $150–300 per hour and is gate-kept behind wealth that most people simply don't have.

This isn't a knowledge problem. It's an **access problem.**

A single mother juggling three jobs doesn't know she's paying 26% APR on a credit card when she could call her bank and negotiate it down. A recent graduate doesn't know the avalanche debt method would save him $4,000 in interest compared to the minimum-payment treadmill he's on. A family of four doesn't know their $1,800/month grocery bill is quietly destroying their financial future.

They don't have a financial coach. But now they can.

---

## 👥 Who It Helps

- **Low- and middle-income households** who can't afford a financial advisor
- **Young adults** entering the workforce with student loans and no financial literacy foundation
- **Immigrants and first-generation Americans** navigating a financial system they were never taught
- **Anyone** who's ever thought "I know I should have a budget, but I don't know where to start"

The impact is direct and measurable: one good financial plan — knowing which debt to pay first, when to save vs. invest, how to build a 3-month emergency fund — is worth tens of thousands of dollars over a lifetime.

---

## ⚙️ How It Works

FinPath is a web application built on **Next.js 14** (App Router) with **Tailwind CSS** for the UI and **Groq's LLaMA 3.3 70B** (`llama-3.3-70b-versatile`) for blazing-fast AI inference.

**The flow:**

1. **Budget Input** — The user enters their monthly take-home income and fills in expense categories (rent, groceries, transportation, utilities, healthcare, subscriptions). They can optionally add debts with balance, APR, and minimum payment.

2. **AI Analysis (streamed)** — The data is sent to a Next.js API route that calls Groq. The response streams back in real time with:
   - A **Financial Health Score** (0–100) with a plain-English explanation
   - A **Budget Breakdown Table** with color-coded status (🟢 OK / 🟡 Watch / 🔴 High) against recommended benchmarks
   - **Top 3 Actionable Steps** — specific, achievable, not vague
   - A **Debt Payoff Strategy** using the avalanche method (highest APR first), ordered by priority
   - An **Emergency Fund Timeline** showing how long it takes to hit 3 months of savings at different saving rates

3. **AI Chat** — After the analysis, a chat panel unlocks. Users can ask follow-up questions ("How do I negotiate my rent?", "Should I invest before paying off debt?") and get personalized answers grounded in their specific budget context.

**Groq's speed matters here.** Financial coaching is a conversation, not a report. When responses stream back in under a second, it feels like talking to a real advisor rather than waiting on a machine.

---

## 🛠️ What We Built

| Component | Description |
|-----------|-------------|
| `app/page.tsx` | Main UI — two-column layout: form (left) + streaming analysis (right) + chat panel below |
| `components/BudgetForm.tsx` | Income, expense categories, and optional debt entries with live surplus/deficit counter |
| `components/AnalysisPanel.tsx` | Streaming markdown renderer with animated cursor |
| `components/ChatPanel.tsx` | Contextual follow-up Q&A with quick-start prompts |
| `app/api/analyze/route.ts` | Groq streaming endpoint with structured prompting |
| `app/api/chat/route.ts` | Groq chat endpoint with budget context injection |
| `lib/groq.ts` | Groq client with graceful mock fallback when `GROQ_API_KEY` is absent |

**Demo Mode:** If no Groq API key is configured, the app runs entirely with realistic mock responses — no broken states, no error messages, fully testable end to end.

---

## 🔮 What's Next

**Short-term (next sprint):**
- PDF export of the financial report
- "Re-analyze" button to test different scenarios (what if I cut subscriptions by $100?)
- Monthly check-in reminders via email

**Medium-term:**
- Connect to Plaid to auto-import real bank transactions instead of manual entry
- Track month-over-month progress — a dashboard showing whether the user is improving
- Community tips: anonymized benchmarks ("people in your income range typically spend X% on food")

**Long-term:**
- Localization — same tool, dozens of languages and local financial systems
- Nonprofit / social worker mode — a case management view for organizations serving financially distressed clients at scale
- Integration with 211 (national social services hotline) API to surface relevant local programs (SNAP, LIHEAP, debt relief)

---

## 💡 Why It Wins

The judges at STEMinate asked for **Impact and Intention over a generic prototype.** FinPath's story is simple: the people who most need financial advice are the ones who can least afford it. We built the thing that should have already existed — a patient, knowledgeable, non-judgmental financial coach that is free, private, and available at 2am when you're staring at a credit card bill and don't know what to do.

The AI isn't the point. The access is.

---

*Built in 72 hours for STEMinate Hacks 2026 by Isaac · [GitHub repo link] · [Live demo link]*
