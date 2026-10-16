import { describe, expect, it } from "vitest";
import { isEmptyRecord, parseRecord, placingLabel, readableDate } from "./record";

const raw = {
  handle: "alpha",
  share_token: "tok",
  seasons: [
    {
      season_id: "s1-2026", title: "Season 1", total_score: 145.3, solved: 2, players: 40, rank: 3,
      top_ten: true, placing_verified: false,
      challenges: [{ week: 1, template_slug: "put-call-parity", official_score: 70 }, { week: 2, template_slug: "nope", official_score: 75.3 }],
    },
  ],
  verified_capstone: { title: "Vol smile", defended_on: "2027-01-20", reviewer: "Isaac G.", share_token: null, public_link: false },
};

describe("parseRecord", () => {
  it("maps the database JSON and names challenges by template", () => {
    const r = parseRecord(raw)!;
    expect(r.handle).toBe("alpha");
    expect(r.shareToken).toBe("tok");
    expect(r.seasons[0]).toMatchObject({ seasonId: "s1-2026", rank: 3, topTen: true, placingVerified: false, players: 40 });
    expect(r.seasons[0].challenges[0].title).toBe("Price a put from a call");
    expect(r.seasons[0].challenges[1].title).toBe("Challenge");
    expect(r.verifiedCapstone).toMatchObject({ title: "Vol smile", reviewer: "Isaac G." });
    expect(isEmptyRecord(r)).toBe(false);
  });

  it("survives missing or malformed fields", () => {
    expect(parseRecord(null)).toBeNull();
    const r = parseRecord({ seasons: "x" })!;
    expect(r).toMatchObject({ handle: null, seasons: [], verifiedCapstone: null, shareToken: null });
    expect(isEmptyRecord(r)).toBe(true);
  });
});

describe("placingLabel", () => {
  const base = parseRecord(raw)!.seasons[0];
  it("tells the owner a top-10 placing waits on a defense, and hides it publicly", () => {
    expect(placingLabel(base, "owner")).toMatch(/Top 10 \(#3 of 40\).*live defense/);
    expect(placingLabel({ ...base, rank: null }, "public")).toBe("Finished the season (40 players)");
  });
  it("shows verified and ordinary ranks", () => {
    expect(placingLabel({ ...base, placingVerified: true }, "public")).toBe("#3 of 40, verified in a live defense");
    expect(placingLabel({ ...base, topTen: false, rank: 17 }, "public")).toBe("#17 of 40");
  });
});

it("formats dates without shifting the day", () => {
  expect(readableDate("2027-01-20")).toBe("January 20, 2027");
});
