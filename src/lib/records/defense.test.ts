import { describe, expect, it } from "vitest";
import { parseDefenseInput } from "./defense";

const today = "2026-12-21";
const ok = { handle: "@Alpha_1", kind: "placing", seasonId: "s1-2026", outcome: "verified", consentConfirmed: true, reviewerLabel: " Isaac G. ", notes: "  ", defendedOn: "2026-12-21" };

describe("parseDefenseInput", () => {
  it("normalizes a valid sign-off", () => {
    const r = parseDefenseInput(ok, today);
    expect(r).toEqual({
      ok: true,
      value: { handle: "alpha_1", kind: "placing", seasonId: "s1-2026", outcome: "verified", consentConfirmed: true, reviewerLabel: "Isaac G.", notes: null, defendedOn: "2026-12-21" },
    });
  });

  it("drops the season for a capstone and defaults the date to today", () => {
    const r = parseDefenseInput({ ...ok, kind: "capstone", defendedOn: "" }, today);
    expect(r.ok && r.value).toMatchObject({ seasonId: null, defendedOn: today });
  });

  it("refuses to save without consent, whatever else is filled in", () => {
    for (const consentConfirmed of [false, "true", undefined]) {
      const r = parseDefenseInput({ ...ok, consentConfirmed }, today);
      expect(r.ok).toBe(false);
      expect(!r.ok && r.error).toMatch(/consent/);
    }
  });

  it("rejects bad handles, missing seasons, unknown outcomes and future dates", () => {
    expect(parseDefenseInput({ ...ok, handle: "Real Name" }, today).ok).toBe(false);
    expect(parseDefenseInput({ ...ok, seasonId: "" }, today).ok).toBe(false);
    expect(parseDefenseInput({ ...ok, outcome: "maybe" }, today).ok).toBe(false);
    expect(parseDefenseInput({ ...ok, defendedOn: "2027-01-01" }, today).ok).toBe(false);
    expect(parseDefenseInput({ ...ok, reviewerLabel: "" }, today).ok).toBe(false);
    expect(parseDefenseInput(null, today).ok).toBe(false);
  });
});
