/**
 * Questions on /seasons. Every answer is a rule the code enforces, so check the
 * source named beside it before changing the wording:
 * - one attempt, server clock, deadline capped at the week's close:
 *   start_attempt / submit_attempt in supabase/migrations/0024_seasons.sql
 * - ranking by season total, then weeks scored (any scored attempt, even 0): season_leaderboard (0024)
 * - scoring: scripts/seasons/score-core.mjs (explanation is read by a person,
 *   not added to the automatic score, so no points total is promised here)
 * - what's allowed during an attempt: RULES in seasons/[challengeId]/AttemptClient.tsx
 * - age: privacy page "Age"; cheating answer: docs/gtm/season-1-outreach.md
 */
export const SEASON_FAQ: { q: string; a: string }[] = [
  {
    q: "Is it free, and who can play?",
    a: "Seasons are free. Anyone 13 or older can make an account and play. It's built for high school students, alone or with a club.",
  },
  {
    q: "Do I need to know finance or Python already?",
    a: "Some Python helps. Each challenge links the free lesson that teaches what it uses, and the 15-minute practice round shows you the format first.",
  },
  {
    q: "When can I take each challenge, and how long do I get?",
    a: "Each challenge stays open for its week. When you press start you get the time shown on its card. The clock runs on StrikeLab's server and doesn't pause, and it also stops when the week closes, so start with time to spare.",
  },
  {
    q: "What can I use during a challenge?",
    a: "Your own notes and the lessons. The AI tutor is off from the moment you start until you submit.",
  },
  {
    q: "How many tries do I get?",
    a: "One attempt per challenge. You can run your code against the sample check as often as you like, then submit once.",
  },
  {
    q: "What if my browser crashes or I close the tab?",
    a: "Your code saves on your device as you type, so reopening the challenge on the same device brings it back. The clock keeps running while you're away.",
  },
  {
    q: "How is it scored?",
    a: "After you submit, StrikeLab runs your code against hidden tests on your numbers. Correct answers count most, and finishing with time left adds a little more, in proportion to how much you got right. A person reads your explanation. Scores usually post within a day.",
  },
  {
    q: "What if I miss a week?",
    a: "You can still play the other weeks. The leaderboard ranks your total across the season, so a missed week counts as zero rather than knocking you out.",
  },
  {
    q: "Does the practice round count?",
    a: "No. It's a separate problem with its own numbers, checked in your browser and never saved or ranked.",
  },
  {
    q: "Who sees my name?",
    a: "Nobody. Leaderboards show the handle you choose, never your real name. Your record stays private until you decide to share it, and you can delete your account at any time.",
  },
  {
    q: "Can people cheat?",
    a: "Not easily. Everyone gets different numbers, so a copied answer won't match. Sharing code breaks the rules. The server keeps the time, the AI tutor is off, and top placings are confirmed in a short live conversation before they appear on a record. That makes cheating hard, not impossible.",
  },
];
