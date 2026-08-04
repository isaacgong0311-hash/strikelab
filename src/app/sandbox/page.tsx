import type { Metadata } from "next";
import SandboxClient from "./SandboxClient";

export const metadata: Metadata = {
  title: "Paper-Trading Sandbox — StrikeLab",
  description:
    "Trade stocks and options with $100,000 in simulated cash. Options are priced live with StrikeLab's own Black-Scholes engine — the same math taught in the lessons.",
};

export default function SandboxPage() {
  return <SandboxClient />;
}
