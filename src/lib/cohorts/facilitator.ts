/**
 * The facilitator guide (docs/gtm/facilitator-guide.md) as data, so the
 * class page can show the leader this week's meeting plan and ready-to-send
 * messages. Keep the two in step when the guide changes.
 */
export interface FacilitatorWeek {
  week: number;
  objective: string;
  prompts: string[];
  watchFor: string[];
}

export const MEETING_SHAPE = [
  "5 min: check-in. Who got stuck, who finished early, any blockers.",
  "30–45 min: students work through the week's lessons; circulate with the prompts.",
  "5 min: closing question, out loud, one student or group at a time.",
];

export const FACILITATOR_WEEKS: readonly FacilitatorWeek[] = [
  {
    week: 1,
    objective: "Everyone leaves with one correct answer to \"why would anyone hold more than one stock?\"",
    prompts: [
      "What does it actually mean to own a share?",
      "Who's on the other side of every trade?",
      "Why doesn't \"put everything in the stock you're most sure about\" work?",
    ],
    watchFor: ["Treating market cap and stock price as the same thing", "Confusing volatility with \"risk of losing everything\""],
  },
  {
    week: 2,
    objective: "Students can read a payoff diagram and explain why a bad options price creates a risk-free trade.",
    prompts: [
      "What's the difference between a right and an obligation?",
      "If a call is overpriced relative to put-call parity, what trade makes free money, and why does it correct the price?",
    ],
    watchFor: ["Mixing up \"long a call\" with \"short a put\"", "Forgetting the premium shifts the breakeven, not the payoff shape"],
  },
  {
    week: 3,
    objective: "Students implement Black-Scholes in code and match the reference price.",
    prompts: ["Which input matters most to the price, and why does volatility, which nobody can observe directly, drive so much of it?"],
    watchFor: ["Volatility as a percentage (5) instead of a decimal (0.05)", "Mixing up d1 and d2"],
  },
  {
    week: 4,
    objective: "Split the four Greeks across students or pairs; each explains theirs in one sentence plus a real-world analogy.",
    prompts: [
      "If you're short a call, which Greek should worry you most as expiration approaches?",
      "Why do market makers care about gamma even when delta is hedged to zero?",
    ],
    watchFor: ["The densest week: expect it to run long, and spread it into homework if needed"],
  },
  {
    week: 5,
    objective: "Students can name look-ahead and survivorship bias and point to where their own backtest could have either.",
    prompts: [
      "What's wrong with testing a strategy on the same data you used to design it?",
      "Why does testing only on companies that still exist make any strategy look better?",
      "Capstones are due next week: has everyone picked a prompt?",
    ],
    watchFor: ["Treating \"backtested well\" as \"will work\": be openly skeptical of good-looking results"],
  },
  {
    week: 6,
    objective: "Each student or team presents their capstone: the question, what they built, what they found, what they'd do next.",
    prompts: [
      "3–5 minutes each, informal: a share-out, not a defense.",
      "A clearly explained failure beats a vague success.",
      "Close the program: what would you build next if this kept going?",
    ],
    watchFor: ["Students who haven't submitted: they submit from their cohort home, and you'll see it on the scorecard"],
  },
];

function shortDate(day: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${day}T12:00:00Z`)
  );
}

/** A message the leader can paste into the club's chat or email. */
export function weeklyMessage(input: {
  week: number;
  weekTitle: string;
  lessonTitles: string[];
  dueOn: string;
  cohortUrl: string;
}): string {
  const lessons = input.lessonTitles.map((t) => `• ${t}`).join("\n");
  const capstone = input.week >= 5 ? "\nYour capstone lives on the same page. Pick a prompt if you haven't yet." : "";
  return `Week ${input.week}: ${input.weekTitle}\n\nThis week's lessons (due ${shortDate(input.dueOn)}):\n${lessons}\n\nStart here, it picks up where you left off: ${input.cohortUrl}${capstone}`;
}

/** A friendly nudge for a student who's behind. No guilt, one clear step. */
export function nudgeMessage(input: { firstName: string; cohortUrl: string }): string {
  const name = input.firstName.trim() || "there";
  return `Hi ${name}! Just checking in: you're a little behind in the Quant Foundations Lab, which is completely fine. The next step is waiting for you here, and it only takes a few minutes: ${input.cohortUrl}\nIf you're stuck on something, tell me and we'll sort it out at the next meeting.`;
}

/** The first message a leader sends: what this is, when it starts, and the join link. */
export function inviteMessage(input: { className: string; startsOn: string | null; joinUrl: string }): string {
  const when = input.startsOn ? `We start the week of ${shortDate(input.startsOn)}. ` : "";
  return `${input.className} is running the Quant Foundations Lab on StrikeLab: six weeks of short lessons where you code real market models (option pricing, backtests, risk) in the browser, and finish with a capstone you can show. It's free.\n\n${when}Join here before our first meeting (it takes a minute, and you'll need to be 13 or older): ${input.joinUrl}`;
}
