import type { Metadata } from "next";
import LessonsClient from "./LessonsClient";

export const metadata: Metadata = {
  title: "Options Pricing & Quant Finance Lessons",
  description:
    "The full StrikeLab curriculum: investing fundamentals, options pricing (Black-Scholes & the Greeks), and quant investing (CAPM, factors, backtesting) — each lesson taught through a real Python notebook in your browser.",
  alternates: { canonical: "/lessons" },
};

export default function LessonsPage() {
  return <LessonsClient />;
}
