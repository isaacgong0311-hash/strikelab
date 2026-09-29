import { describe, expect, it } from "vitest";
import { toLeaderboard } from "./challengeLeaderboard";

describe("toLeaderboard", () => {
  it("names only the viewer, and keeps their rank even outside the top N", () => {
    const rows = [
      { rank: 12, elapsedSeconds: 900, xp: 50, isYou: true },
      { rank: 1, elapsedSeconds: 60, xp: 50, isYou: false },
      { rank: 2, elapsedSeconds: 75, xp: 50, isYou: false },
    ];
    expect(toLeaderboard(rows, 10)).toEqual({
      leaderboard: [
        { rank: 1, name: "Anonymous", elapsedSeconds: 60, xp: 50 },
        { rank: 2, name: "Anonymous", elapsedSeconds: 75, xp: 50 },
      ],
      yourRank: 12,
    });
  });

  it("labels the viewer's own top-N row 'You'", () => {
    const { leaderboard, yourRank } = toLeaderboard([{ rank: 1, elapsedSeconds: 42, xp: 50, isYou: true }], 10);
    expect(leaderboard[0].name).toBe("You");
    expect(yourRank).toBe(1);
  });

  it("has no rank for a viewer who hasn't solved it", () => {
    expect(toLeaderboard([], 10)).toEqual({ leaderboard: [], yourRank: null });
  });
});
