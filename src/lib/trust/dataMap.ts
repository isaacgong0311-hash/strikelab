/**
 * What StrikeLab stores about students, who can read it, and where it goes:
 * the public /trust page renders this, for club sponsors, principals and
 * school IT reviewers (frontend plan FY-7). It restates docs/trust/data-map.md
 * without internal references. Change both in the same PR as any migration
 * that adds a table or column holding student data; dataMap.test.ts fails if
 * a migration creates a table this file doesn't account for.
 *
 * Plain description of how the product works. No compliance claims (FERPA,
 * COPPA or state laws) until a qualified reviewer has looked (readiness plan Y6.4).
 */

export interface StoredData {
  what: string;
  /** Database tables holding it (checked against the migrations). */
  tables: string[];
  student: string;
  leader: string;
  others: string;
}

export const STORED_DATA: StoredData[] = [
  {
    what: "Email and password (or Google sign-in)",
    tables: [],
    student: "Yes",
    leader: "No",
    others: "No",
  },
  {
    what: "Display name (a first name and last initial is suggested)",
    tables: ["profiles"],
    student: "Yes",
    leader: "Yes: roster, scorecard, kickoff view",
    others: "No",
  },
  {
    what: "Lessons completed, XP, streak and timezone",
    tables: ["progress"],
    student: "Yes",
    leader: "Lesson and track counts and last-active date only",
    others: "No",
  },
  {
    what: "When each assigned lesson was completed",
    tables: ["lesson_completions"],
    student: "Yes",
    leader: "Yes, for students in their class",
    others: "No",
  },
  {
    what: "Short-lesson results (accuracy, time)",
    tables: ["session_completions"],
    student: "Yes",
    leader: "Only whether the first short lesson was finished; never accuracy or time",
    others: "No",
  },
  {
    what: "Exercise code",
    tables: ["lesson_submissions"],
    student: "Yes",
    leader: "Yes, for students in their class",
    others: "No",
  },
  {
    what: "Capstone project",
    tables: ["capstone_submissions", "capstone_access_log"],
    student: "Yes, including a log of every time their leader opened it",
    leader: "Opens it deliberately; each view is logged and shown to the student",
    others: "Only through a share link the student creates: no name shown, and it stops working when sharing is turned off",
  },
  {
    what: "Class membership and join date",
    tables: ["class_members", "classes", "assignments"],
    student: "Yes",
    leader: "Yes",
    others: "No",
  },
  {
    what: "Weekly challenge times",
    tables: ["challenge_completions"],
    student: "Yes",
    leader: "No",
    others: "The leaderboard shows times only, never names",
  },
  {
    what: "Paper-trading sandbox balance and trades",
    tables: ["sandbox_accounts", "sandbox_positions", "sandbox_trades"],
    student: "Yes",
    leader: "No",
    others: "No",
  },
  {
    what: "AI tutor usage counts (not the messages)",
    tables: ["ai_usage", "hint_usage"],
    student: "Yes",
    leader: "No",
    others: "No",
  },
  {
    what: "Certificates (name, track, date)",
    tables: ["certificates"],
    student: "Yes",
    leader: "No",
    others: "Only someone the student gives the certificate link to",
  },
  {
    what: "Subscription status, if a paid plan (no card data)",
    tables: ["subscriptions"],
    student: "Yes",
    leader: "No",
    others: "No",
  },
];

/** Tables that hold no student data, so they aren't rows above. */
export const OPERATIONAL_TABLES: Record<string, string> = {
  rate_limits: "Request counters for abuse limits",
};

export interface Subprocessor {
  vendor: string;
  purpose: string;
  receives: string;
}

export const SUBPROCESSORS: Subprocessor[] = [
  { vendor: "Supabase", purpose: "Database and sign-in", receives: "Everything in the table above" },
  { vendor: "Vercel", purpose: "Hosting and cookie-free, aggregate page analytics", receives: "Web requests (IP address, pages visited); no account data in analytics" },
  { vendor: "Sentry", purpose: "Error reports", receives: "The error, the page, and a signed-in user's account id (no email or name)" },
  { vendor: "Groq", purpose: "AI tutor and hints, only when a student uses them", receives: "The question or code the student sends, without their name or email" },
  { vendor: "Google", purpose: "\"Continue with Google\", only if used", receives: "The sign-in itself" },
  { vendor: "Stripe", purpose: "Payments; never used by students in a pilot", receives: "The payer's checkout details, handled entirely by Stripe" },
  { vendor: "Web3Forms", purpose: "Newsletter sign-up, only if used", receives: "The email address entered" },
  { vendor: "jsDelivr", purpose: "Backup source for the in-browser Python runtime, only if strikelab.dev's own copy fails", receives: "A normal file download (IP address); no account data" },
  { vendor: "Discord", purpose: "Only if a student connects their own server's webhook", receives: "Lesson and achievement names posted to that server" },
];
