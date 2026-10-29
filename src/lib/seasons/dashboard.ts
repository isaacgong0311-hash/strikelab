import { remainingLabel, statusForWeek, type OwnAttempt, type WeekView } from "./status";

export interface DashboardChallenge {
  id: string;
  week: number;
  template_slug: string;
  opens_at: string;
  closes_at: string;
}

export interface DashboardAttempt extends OwnAttempt {
  challenge_id: string;
}

export interface DashboardSeasonAction {
  kind: WeekView["kind"] | "unscheduled";
  challenge: DashboardChallenge | null;
  summary: string;
  href: string;
  actionLabel: string;
}

const priority: Record<WeekView["kind"], number> = {
  started: 0,
  open: 1,
  submitted: 2,
  pending_review: 3,
  upcoming: 4,
  scored: 5,
  expired: 6,
  closed: 7,
};

/** Pick the most useful season action while retaining T1.3's status rules. */
export function dashboardSeasonAction(
  now: Date,
  challenges: DashboardChallenge[],
  attempts: DashboardAttempt[],
): DashboardSeasonAction {
  const own = new Map(attempts.map((attempt) => [attempt.challenge_id, attempt]));
  const ranked = challenges.map((challenge) => ({
    challenge,
    view: statusForWeek(now, challenge, own.get(challenge.id) ?? null, null),
  })).sort((a, b) => priority[a.view.kind] - priority[b.view.kind] || a.challenge.week - b.challenge.week);
  const selected = ranked[0];
  if (!selected) return {
    kind: "unscheduled", challenge: null,
    summary: "Weekly challenges will appear here when the season is scheduled.",
    href: "/seasons", actionLabel: "See the season",
  };

  const { challenge, view } = selected;
  const challengeHref = `/seasons/${encodeURIComponent(challenge.id)}`;
  switch (view.kind) {
    case "started": return { kind: view.kind, challenge, summary: `Time left: ${remainingLabel(now, view.deadline)}.`, href: challengeHref, actionLabel: "Resume challenge" };
    case "open": return { kind: view.kind, challenge, summary: "This week's timed challenge is open.", href: challengeHref, actionLabel: "Start challenge" };
    case "submitted": return { kind: view.kind, challenge, summary: "Submitted. StrikeLab is computing your official score.", href: "/seasons", actionLabel: "View season status" };
    case "pending_review": return { kind: view.kind, challenge, summary: "Your submission is awaiting review.", href: "/seasons", actionLabel: "View season status" };
    case "upcoming": return { kind: view.kind, challenge, summary: `Opens in ${remainingLabel(now, view.opensAt)}.`, href: "/seasons", actionLabel: "See the schedule" };
    case "scored": return { kind: view.kind, challenge, summary: view.score === null ? "Your official score is posted." : `Official score: ${view.score}/100.`, href: "/seasons", actionLabel: "See your result" };
    case "expired": return { kind: view.kind, challenge, summary: "Your attempt window has ended.", href: "/seasons", actionLabel: "View season status" };
    case "closed": return { kind: view.kind, challenge, summary: "This challenge has closed. See the season board and schedule.", href: "/seasons", actionLabel: "See the season" };
  }
}
