import { describe, expect, it } from "vitest";
import { linkedInAddUrl, linkedInCredential } from "./linkedin";

describe("linkedInAddUrl", () => {
  it("prefills a certification with StrikeLab as the issuer and the public record as its URL", () => {
    const url = new URL(linkedInAddUrl({
      name: "StrikeLab Season 1: verified #3 placing",
      issuedAt: "2026-12-22T15:00:00Z",
      certUrl: "https://strikelab.dev/r/77777777-7777-4777-8777-777777777777",
    }));
    expect(url.origin + url.pathname).toBe("https://www.linkedin.com/profile/add");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      startTask: "CERTIFICATION_NAME",
      name: "StrikeLab Season 1: verified #3 placing",
      organizationName: "StrikeLab",
      issueYear: "2026",
      issueMonth: "12",
      certUrl: "https://strikelab.dev/r/77777777-7777-4777-8777-777777777777",
    });
  });

  it("reads the issue month in New York, not UTC", () => {
    // 02:00 UTC on Jan 1 is still Dec 31 in New York.
    const url = new URL(linkedInAddUrl({ name: "x", issuedAt: "2027-01-01T02:00:00Z", certUrl: "https://strikelab.dev/r/x" }));
    expect(url.searchParams.get("issueYear")).toBe("2026");
    expect(url.searchParams.get("issueMonth")).toBe("12");
  });
});

describe("linkedInCredential", () => {
  it("names the best verified placing, then a capstone, and nothing when nothing is verified", () => {
    const placing = { seasonId: "s1", rank: 2, verifiedAt: "2026-12-22T00:00:00Z" };
    const capstone = { verifiedAt: "2026-12-23T00:00:00Z" };
    expect(linkedInCredential({ placings: [placing], capstones: [capstone] }, { s1: "Season 1" }))
      .toEqual({ name: "StrikeLab Season 1: verified #2 placing", issuedAt: placing.verifiedAt });
    expect(linkedInCredential({ placings: [], capstones: [capstone] }, {}))
      .toEqual({ name: "StrikeLab verified capstone", issuedAt: capstone.verifiedAt });
    expect(linkedInCredential({ placings: [], capstones: [] }, {})).toBeNull();
  });
});
