"use client";

import { useState } from "react";
import BudgetForm from "@/components/BudgetForm";
import AnalysisPanel from "@/components/AnalysisPanel";
import ChatPanel from "@/components/ChatPanel";
import type { BudgetData } from "@/lib/types";

export default function Home() {
  const [analysis, setAnalysis] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [budgetContext, setBudgetContext] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);

  async function handleBudgetSubmit(data: BudgetData) {
    setAnalysis("");
    setStreaming(true);
    setHasAnalyzed(true);

    const ctx = `Income: $${data.monthlyIncome}/mo. Expenses: ${data.expenses
      .map((e) => `${e.category} $${e.amount}`)
      .join(", ")}. ${
      data.debts.length > 0
        ? `Debts: ${data.debts.map((d) => `${d.name} $${d.balance} @ ${d.interestRate}%`).join(", ")}.`
        : "No debts."
    }`;
    setBudgetContext(ctx);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Analysis failed");

      // Check if we're in mock/demo mode
      const mode = res.headers.get("X-Analysis-Mode");
      if (mode === "mock") setIsDemoMode(true);

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setAnalysis(acc);
      }
    } catch {
      setAnalysis("Something went wrong. Please try again.");
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Nav */}
      <nav className="fp-nav">
        <span className="fp-nav-logo">
          Fin<span>Path</span>
        </span>
        <span className="fp-nav-badge">AI Financial Coach · Free</span>
      </nav>

      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="fp-demo-banner">
          ◆ DEMO MODE — Running with mock AI responses. Add GROQ_API_KEY to .env.local for live analysis.
        </div>
      )}

      {/* Hero */}
      <section className="fp-hero">
        <div className="fp-eyebrow">
          <div className="fp-eyebrow-line" />
          <span className="fp-eyebrow-text">STEMinate Hacks 2026 · Social Good + AI</span>
        </div>

        <h1 className="fp-hero-h1">
          The financial coach<br />
          <em>everyone deserves.</em>
        </h1>

        <p className="fp-hero-sub">
          37% of Americans can&apos;t cover a $400 emergency. FinPath delivers the
          personalized guidance that used to cost $200/hr — free, private, instant.
        </p>

        {/* Stat bar */}
        <div className="fp-stat-bar">
          {[
            { num: "37", unit: "%", label: "Can't cover $400 emergency" },
            { num: "$29B", unit: "", label: "Lost to preventable mistakes/yr" },
            { num: "1 in 3", unit: "", label: "Adults have no budget" },
            { num: "0", unit: "$", label: "Cost to use FinPath" },
          ].map((s) => (
            <div key={s.label} className="fp-stat">
              <span className="fp-stat-num">
                {s.num}
                {s.unit && <span className="fp-stat-unit">{s.unit}</span>}
              </span>
              <span className="fp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main 2-col grid */}
      <main className="fp-grid">
        {/* Left — Budget form */}
        <BudgetForm onSubmit={handleBudgetSubmit} loading={streaming} />

        {/* Right — Analysis terminal */}
        <AnalysisPanel text={analysis} streaming={streaming} hasStarted={hasAnalyzed} />
      </main>

      {/* Chat — appears after first analysis */}
      {hasAnalyzed && (
        <div className="fp-chat-wrap">
          <ChatPanel context={budgetContext} />
        </div>
      )}

      {/* Footer */}
      <footer className="fp-footer">
        <span className="fp-footer-logo">
          Fin<span>Path</span>
        </span>
        <span className="fp-footer-note">
          Educational financial information only. Not financial, tax, or legal advice.
          <br />
          Built for STEMinate Hacks 2026 · Powered by Groq + Llama 3.3 70B
        </span>
      </footer>
    </>
  );
}
