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
        a: "A free, browser-based quant finance curriculum, taught the way quant desks actually learn it — by writing code. 22 lessons across three tracks — Investing Fundamentals, Options Pricing, and Quant Investing — take you from \"what is a stock?\" to a working Black-Scholes engine with all five Greeks to CAPM and backtesting.",
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
        a: "Each lesson is 10–20 minutes of reading + a 5–15 minute coding exercise. Most students finish all 22 in a few weeks, spread over evenings — the tracks are independent, so there's no requirement to binge one before starting another.",
      },
      {
        q: "Do I have to start with options?",
        a: "No — start wherever fits you. Investing Fundamentals (stocks, markets, valuation) is the on-ramp if you're new to finance entirely; Options Pricing is where the quantitative thinking really starts, and Quant Investing (CAPM, factor models, backtesting) is the advanced track. All three are free and independent.",
      },
      {
        q: "Will there be more advanced content?",
        a: "Yes — all five Greeks (Delta through Rho), Implied Volatility, Option Strategies, and Binomial Trees are all live already. Next up: a bridge into VaR, GARCH, and Monte Carlo for the Quant Investing track. See /roadmap for what's shipping and when.",
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
        a: "The full curriculum (all 22 lessons), the playground, the Greek visualizer, and the paper-trading sandbox are free forever — nothing there is gated. The Pro tier ($9/mo) adds weekly coding challenges, achievements, office hours, and a certificate of completion. School licenses fund the platform.",
      },
      {
        q: "Is this safe to use as a minor?",
        a: "Yes. No real money is ever involved anywhere on the platform. The paper-trading sandbox uses a simulated $100,000 balance priced with StrikeLab's own Black-Scholes engine, not a live brokerage connection. See /privacy for what account data we actually collect.",
      },
      {
        q: "Will you ever sell my data?",
        a: "No. We don't run ads. We don't sell user lists. The business model is freemium subscriptions + school licenses — both depend on users trusting us, so we behave accordingly. Full details at /privacy.",
      },
      {
        q: "Who built this?",
        a: "Isaac Gong, a high school freshman and AIME qualifier. See /about for the full story and why this project exists.",
      },
    ],
  },
];
