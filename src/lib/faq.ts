export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQGroup {
  section: string;
  items: FAQItem[];
}

export const FAQ_GROUPS: FAQGroup[] = [
  {
    section: "General",
    items: [
      {
        q: "What is StrikeLab?",
        a: "A free, browser-based curriculum that teaches options pricing the way quant desks actually learn it — by writing code. Seven lessons take you from \"what is a call option?\" to a working Black-Scholes engine with all five Greeks.",
      },
      {
        q: "Who is it for?",
        a: "High schoolers (13–18) interested in quant finance, applied math, or CS. AIME/AMC-track students are the bullseye, but anyone comfortable with pre-calc + Python can follow along.",
      },
      {
        q: "What math do I need?",
        a: "Pre-calculus is enough to start. Lessons on the Greeks lean on basic differential calculus (partial derivatives, the chain rule). No prior probability or stochastic calculus assumed — we build intuition first.",
      },
      {
        q: "Do I need to know Python?",
        a: "Some Python is helpful but not required. The starter code gives you scaffolding; you fill in the math. By Lesson 3 you'll be comfortable writing pricing functions from scratch.",
      },
    ],
  },
  {
    section: "Curriculum",
    items: [
      {
        q: "How long does it take?",
        a: "Each lesson is 10–20 minutes of reading + a 5–15 minute coding exercise. Most students finish all seven in 4–6 hours total, often spread over a week.",
      },
      {
        q: "Why options instead of stocks?",
        a: "Options are where quantitative thinking actually starts. Stock-picking is mostly narrative; options pricing forces you to engage with probability, time decay, and risk-adjusted returns. Plus, no other high-school resource teaches it.",
      },
      {
        q: "Will there be more advanced content?",
        a: "Yes. The roadmap has Implied Volatility, Option Strategies, Binomial Trees, and eventually VaR / Monte Carlo. See the /roadmap page for shipping dates.",
      },
      {
        q: "Can I use this for AP Stats / AP Calc?",
        a: "Yes — many students do. The Black-Scholes derivation uses derivatives (AP Calc AB territory) and log-normal distributions (AP Stats). Teachers, we're happy to help align lessons.",
      },
    ],
  },
  {
    section: "Technical",
    items: [
      {
        q: "Where does the Python run?",
        a: "Entirely in your browser, via Pyodide (CPython compiled to WebAssembly). No server round-trip. No installs. Tests typically complete in under 200ms.",
      },
      {
        q: "Is my code saved?",
        a: "Your code edits persist via localStorage on your device. Lesson completions, XP, and streaks also sync to your account automatically if you sign in — free for everyone, not a Pro feature — so your progress carries over to a new device even though the code itself stays local.",
      },
      {
        q: "Is the pricing engine open source?",
        a: "Yes. The repo is at github.com/isaacgong0311-hash/strikelab. The curriculum is part of the platform; the pricing engine is MIT-licensed and forkable.",
      },
      {
        q: "What if Pyodide doesn't load on my browser?",
        a: "Pyodide works on all modern browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+). If you hit an issue, file a GitHub issue with your browser version and we'll investigate.",
      },
    ],
  },
  {
    section: "Pricing & Trust",
    items: [
      {
        q: "Is StrikeLab really free?",
        a: "The full curriculum + playground + Greek visualizer is free forever. The Pro tier ($9/mo) adds live market data and advanced lessons. School licenses fund the platform.",
      },
      {
        q: "Is this safe to use as a minor?",
        a: "Yes. No real money is ever involved. Paper-trading (when it ships) uses simulated balances on delayed market data. No personal financial info is collected.",
      },
      {
        q: "Will you ever sell my data?",
        a: "No. We don't run ads. We don't sell user lists. The business model is freemium subscriptions + school licenses — both depend on users trusting us, so we behave accordingly.",
      },
      {
        q: "Who built this?",
        a: "Isaac Gong, a high school freshman and AIME qualifier. See /about for the full story and why this project exists.",
      },
    ],
  },
];
