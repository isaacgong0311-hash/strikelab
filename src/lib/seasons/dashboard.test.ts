import { describe, expect, it } from "vitest";
import { dashboardSeasonAction, type DashboardChallenge } from "./dashboard";

const now = new Date("2026-12-02T12:00:00Z");
const challenge = (id: string, week: number, opens_at: string, closes_at: string): DashboardChallenge => ({
  id, week, opens_at, closes_at, template_slug: "put-call-parity",
});
const open = challenge("open", 2, "2026-12-01T00:00:00Z", "2026-12-04T00:00:00Z");
const upcoming = challenge("upcoming", 3, "2026-12-05T00:00:00Z", "2026-12-08T00:00:00Z");

describe("dashboard season action", () => {
  it("offers the season when no challenges are scheduled", () => {
    expect(dashboardSeasonAction(now, [], [])).toMatchObject({
      kind: "unscheduled", href: "/seasons", actionLabel: "See the season",
    });
  });

  it("resumes a timed attempt before offering a new challenge", () => {
    expect(dashboardSeasonAction(now, [open, upcoming], [{
      challenge_id: "open", status: "started", deadline: "2026-12-02T12:30:00Z", official_score: null,
    }])).toMatchObject({ kind: "started", href: "/seasons/open", actionLabel: "Resume challenge" });
  });

  it("starts an open week, then points to the next upcoming week", () => {
    expect(dashboardSeasonAction(now, [open, upcoming], [])).toMatchObject({
      kind: "open", href: "/seasons/open", actionLabel: "Start challenge",
    });
    expect(dashboardSeasonAction(now, [upcoming], [])).toMatchObject({
      kind: "upcoming", href: "/seasons", actionLabel: "See the schedule",
    });
  });

  it("preserves submitted, scored, pending-review, and expired states", () => {
    const base = { challenge_id: "open", deadline: "2026-12-02T12:30:00Z", official_score: null };
    expect(dashboardSeasonAction(now, [open], [{ ...base, status: "submitted" }]).kind).toBe("submitted");
    expect(dashboardSeasonAction(now, [open], [{ ...base, status: "pending_review" }]).kind).toBe("pending_review");
    expect(dashboardSeasonAction(now, [open], [{ ...base, status: "scored", official_score: 88 }])).toMatchObject({
      kind: "scored", actionLabel: "See your result", summary: "Official score: 88/100.",
    });
    expect(dashboardSeasonAction(now, [open], [{ ...base, status: "started", deadline: "2026-12-02T11:00:00Z" }]).kind).toBe("expired");
  });
});
