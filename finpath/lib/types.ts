export interface Expense {
  category: string;
  amount: number;
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

export interface BudgetData {
  monthlyIncome: number;
  expenses: Expense[];
  debts: Debt[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
