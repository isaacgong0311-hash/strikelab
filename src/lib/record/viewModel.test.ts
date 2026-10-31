import { describe, expect, it } from "vitest";
import { buildRecordView } from "./viewModel";

const season = { id: "s1", title: "Season 1", ends_on: "2026-12-20" };
const challenges = [
  { id: "s1-w1", season_id: "s1", week: 1 },
  { id: "s1-w2", season_id: "s1", week: 2 },
];
const attempts = [
  { challenge_id: "s1-w1", status: "scored", official_score: 90 },
  { challenge_id: "s1-w2", status: "submitted", official_score: null },
];

describe("private record view model", () => {
  it("does not list a scheduled season before the student has entered it", () => {
    expect(buildRecordView("2026-12-21", [season], challenges, [], { s1: null }, [], [], []).seasons).toEqual([]);
  });
  it("shows scores but never labels a top-10 placing verified without a matching verification", () => {
    const view = buildRecordView("2026-12-21", [season], challenges, attempts, { s1: 4 }, [], [], []);
    expect(view.seasons[0]).toMatchObject({ scoredCount: 1, rank: 4, placingVerified: false });
    expect(view.seasons[0].scores).toEqual([{ week: 1, score: 90 }]);
  });

  it("requires a matching season and rank, top 10, and a finished season", () => {
    const verification = [{ kind: "placing", subject_id: "s1:4", verified_at: "2026-12-22T00:00:00Z" }];
    expect(buildRecordView("2026-12-21", [season], challenges, attempts, { s1: 4 }, verification, [], []).seasons[0].placingVerified).toBe(true);
    expect(buildRecordView("2026-12-21", [season], challenges, attempts, { s1: 5 }, verification, [], []).seasons[0].placingVerified).toBe(false);
    expect(buildRecordView("2026-12-21", [season], challenges, attempts, { s1: 11 }, [{ ...verification[0], subject_id: "s1:11" }], [], []).seasons[0].placingVerified).toBe(false);
    expect(buildRecordView("2026-12-19", [season], challenges, attempts, { s1: 4 }, verification, [], []).seasons[0].placingVerified).toBe(false);
  });

  it("marks only reviewed capstones and retains certificate links", () => {
    const verified = [{ kind: "capstone", subject_id: "cap-1", verified_at: "2026-12-22T00:00:00Z" }];
    const view = buildRecordView("2026-12-21", [], [], [], {}, verified,
      [{ id: "cap-1", title: "My capstone", status: "submitted", submitted_at: "2026-12-10T00:00:00Z" }],
      [{ id: "cert-1", track_id: "investing", issued_at: "2026-12-11T00:00:00Z" }]);
    expect(view.capstones[0].verifiedAt).toBe("2026-12-22T00:00:00Z");
    expect(view.certificates[0].href).toBe("/certificate/cert-1");
  });
});
