"use client";

import { useState } from "react";
import type { BudgetData, Debt, Expense } from "@/lib/types";

const DEFAULT_EXPENSES: Expense[] = [
  { category: "Rent / Mortgage", amount: 0 },
  { category: "Groceries", amount: 0 },
  { category: "Transportation", amount: 0 },
  { category: "Utilities", amount: 0 },
  { category: "Healthcare", amount: 0 },
  { category: "Subscriptions / Entertainment", amount: 0 },
  { category: "Other", amount: 0 },
];

const EMPTY_DEBT: Omit<Debt, "id"> = { name: "", balance: 0, interestRate: 0, minimumPayment: 0 };

interface Props {
  onSubmit: (data: BudgetData) => void;
  loading: boolean;
}

export default function BudgetForm({ onSubmit, loading }: Props) {
  const [income, setIncome] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>(DEFAULT_EXPENSES);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [newDebt, setNewDebt] = useState<Omit<Debt, "id">>(EMPTY_DEBT);

  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalDebtMin = debts.reduce((s, d) => s + (Number(d.minimumPayment) || 0), 0);
  const incomeNum = Number(income) || 0;
  const surplus = incomeNum - totalExpenses - totalDebtMin;

  function updateExpense(idx: number, val: string) {
    setExpenses((prev) => prev.map((e, i) => (i === idx ? { ...e, amount: Number(val) || 0 } : e)));
  }

  function addDebt() {
    if (!newDebt.name) return;
    setDebts((prev) => [...prev, { ...newDebt, id: `d-${Date.now()}` }]);
    setNewDebt(EMPTY_DEBT);
    setShowDebtForm(false);
  }

  function removeDebt(id: string) {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!income || Number(income) <= 0) return;
    onSubmit({ monthlyIncome: Number(income), expenses: expenses.filter((e) => e.amount > 0), debts });
  }

  return (
    <div className="fp-card">
      <div className="fp-card-header">
        <span className="fp-card-title">Budget Input</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--grass)", letterSpacing: "0.08em" }}>
          Step 01
        </span>
      </div>

      <form onSubmit={handleSubmit} className="fp-card-body" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div>
          <label className="fp-label">Monthly take-home income</label>
          <div className="fp-input-wrap">
            <span className="fp-input-sym">$</span>
            <input
              type="number" min="0" step="1" placeholder="3,500"
              value={income} onChange={(e) => setIncome(e.target.value)}
              className="fp-input" required
            />
          </div>
        </div>

        <div className="fp-divider" style={{ marginTop: 18 }}>
          <hr /><span>Monthly Expenses</span><hr />
        </div>

        <div className="fp-grid-2">
          {expenses.map((exp, i) => (
            <div key={exp.category}>
              <label className="fp-label">{exp.category}</label>
              <div className="fp-input-wrap">
                <span className="fp-input-sym">$</span>
                <input
                  type="number" min="0" step="1" placeholder="0"
                  value={exp.amount === 0 ? "" : exp.amount}
                  onChange={(e) => updateExpense(i, e.target.value)}
                  className="fp-input"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="fp-divider" style={{ marginTop: 18 }}>
          <hr /><span>Debts (optional)</span><hr />
        </div>

        {debts.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {debts.map((d) => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "8px 11px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{d.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
                    ${d.balance.toLocaleString()} {d.interestRate}% APR ${d.minimumPayment}/mo min
                  </span>
                </div>
                <button type="button" onClick={() => removeDebt(d.id)} className="fp-debt-rm">x</button>
              </div>
            ))}
          </div>
        )}

        {showDebtForm ? (
          <div style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label className="fp-label">Debt name</label>
              <input type="text" placeholder="Chase Credit Card"
                value={newDebt.name} onChange={(e) => setNewDebt((p) => ({ ...p, name: e.target.value }))}
                className="fp-input" />
            </div>
            <div className="fp-grid-2">
              <div>
                <label className="fp-label">Balance ($)</label>
                <input type="number" min="0" placeholder="4200"
                  value={newDebt.balance || ""}
                  onChange={(e) => setNewDebt((p) => ({ ...p, balance: Number(e.target.value) }))}
                  className="fp-input" />
              </div>
              <div>
                <label className="fp-label">APR (%)</label>
                <input type="number" min="0" step="0.1" placeholder="24.9"
                  value={newDebt.interestRate || ""}
                  onChange={(e) => setNewDebt((p) => ({ ...p, interestRate: Number(e.target.value) }))}
                  className="fp-input" />
              </div>
            </div>
            <div>
              <label className="fp-label">Minimum payment ($/mo)</label>
              <div className="fp-input-wrap">
                <span className="fp-input-sym">$</span>
                <input type="number" min="0" placeholder="95"
                  value={newDebt.minimumPayment || ""}
                  onChange={(e) => setNewDebt((p) => ({ ...p, minimumPayment: Number(e.target.value) }))}
                  className="fp-input" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={addDebt} className="fp-btn" style={{ flex: 1, padding: "9px 0" }}>
                Add Debt
              </button>
              <button type="button" onClick={() => setShowDebtForm(false)} className="fp-btn-sm" style={{ paddingLeft: 14, paddingRight: 14 }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowDebtForm(true)} className="fp-btn-add">
            + Add a debt (credit card, student loan, medical...)
          </button>
        )}

        {incomeNum > 0 && (
          <div className="fp-surplus" style={{ marginTop: 16 }}>
            <span className="label">
              Spending: <strong style={{ color: "var(--ink)", fontWeight: 600 }}>${(totalExpenses + totalDebtMin).toLocaleString()}</strong>
            </span>
            <span className={`amount ${surplus > 0 ? "pos" : surplus < 0 ? "neg" : "zero"}`}>
              {surplus >= 0 ? "+" : ""}${surplus.toLocaleString()} / mo
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !income || Number(income) <= 0}
          className="fp-btn"
          style={{ width: "100%", marginTop: 16 }}
        >
          {loading ? "Analyzing..." : "Analyze My Budget ->"}
        </button>
      </form>
    </div>
  );
}
