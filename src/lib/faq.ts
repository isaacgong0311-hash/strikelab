import { TRACKS } from "./tracks";
import { PLANNED_SEASON, shortSeasonDate } from "./seasons/planned";

const LESSON_COUNT = TRACKS.reduce((n, t) => n + t.lessons.length, 0);
const SEASON_DATES = `${shortSeasonDate(PLANNED_SEASON.startsOn)} to ${shortSeasonDate(PLANNED_SEASON.endsOn)}`;

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
        a: `A free, browser-based investing and quant finance curriculum, taught by writing real code instead of reading slides. ${LESSON_COUNT} lessons across three tracks — Investing Fundamentals, Options Pricing, and Quant Investing — take you from "what is a stock?" to reading a balance sheet to a working Black-Scholes engine with all five Greeks. Quant Investing is there once you want to go deeper, not a requirement to get there.`,
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
        a: `Each lesson is a short reading followed by a coding exercise, and you can stop between them. How long all ${LESSON_COUNT} take depends on your background and pace. The tracks are independent, so you don't have to finish one before starting another.`,
      },
      {
        q: "Do I have to start with options?",
        a: "No — start wherever fits you, though most people start with Investing Fundamentals (stocks, markets, valuation, bonds, retirement accounts) since it's the on-ramp if you're new to finance entirely. Options Pricing is where the quantitative thinking really starts, and Quant Investing (CAPM, backtesting, portfolio optimization) is a short, optional advanced track once the rest feels easy. All three are free and independent.",
      },
      {
        q: "Will there be more advanced content?",
        a: `Yes — all five Greeks (Delta through Rho), Implied Volatility, Option Strategies, and Binomial Trees are all live already. The focus now is seasons rather than new lessons: timed challenges that test what you've learned. ${PLANNED_SEASON.title} runs ${SEASON_DATES}. See /roadmap for what's shipping and when.`,
      },
      {
        q: "Can I use this for AP Stats / AP Calc?",
        a: "It has connections to AP Calculus and Statistics: the Greeks are rates of change of an option's price, and the pricing lessons use the normal distribution. Some of the math, such as partial derivatives, goes beyond AP Calculus AB. These are curriculum connections, not an official AP endorsement. Teachers, we're happy to help align lessons.",
      },
    ],
  },
  {
    section: "Technical",
    items: [
      {
        q: "Where does the Python run?",
        a: "Entirely in your browser, via Pyodide (CPython compiled to WebAssembly). No server round-trip and nothing to install. Python loads the first time you run code; after that, tests run on your own device.",
      },
      {
        q: "Is my code saved?",
        a: "Your code edits save on your device as you type. If you sign in, your code, lesson completions, XP, and streaks also sync to your account automatically (free for everyone, not a Pro feature), so you can start an exercise on a school computer and finish it at home.",
      },
      {
        q: "Is the pricing engine open source?",
        a: "Yes. The repo is at github.com/isaacgong0311-hash/strikelab. The curriculum is part of the platform; the pricing engine is MIT-licensed and forkable.",
      },
      {
        q: "What if Pyodide doesn't load on my browser?",
        a: "Pyodide runs in current versions of Chrome, Firefox, Safari and Edge, including on Chromebooks. If it doesn't load for you, file a GitHub issue with your browser and version and we'll investigate.",
      },
    ],
  },
  {
    section: "Pricing & Trust",
    items: [
      {
        q: "Is StrikeLab really free?",
        a: `The full curriculum (all ${LESSON_COUNT} lessons), the playground, the Greek visualizer, club setup, and seasons are free. Clubs can also use the six-week lab and scorecard for free. See /pricing for optional programs.`,
      },
      {
        q: "Is this safe to use as a minor?",
        a: "It's built with student privacy in mind. No real money is involved anywhere on the platform, there is no connection to a brokerage, and leaderboards show a handle, never a real name. See /trust for what we store and who can see it, and /privacy for the policy.",
      },
      {
        q: "Will you ever sell my data?",
        a: "No. We don't run ads or sell user lists. See /privacy for the details of how student data is handled.",
      },
      {
        q: "Who built this?",
        a: "Isaac Gong, a high school freshman and AIME qualifier. See /about for the full story and why this project exists.",
      },
    ],
  },
];
