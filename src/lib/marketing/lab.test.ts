import { describe, expect, it } from "vitest";
import { QUANT_FOUNDATIONS_TEMPLATE } from "@/lib/cohorts/template";
import { LAB_WEEKS, pilotCallHref } from "./lab";

describe("lab marketing copy", () => {
  it("matches the real template, week for week", () => {
    expect(LAB_WEEKS.map((w) => w.title)).toEqual(QUANT_FOUNDATIONS_TEMPLATE.weeks.map((w) => w.title));
  });

  it("falls back to email when no booking link is configured", () => {
    delete process.env.NEXT_PUBLIC_PILOT_CALL_URL;
    expect(pilotCallHref("home")).toMatch(/^mailto:hello@strikelab\.app/);
    process.env.NEXT_PUBLIC_PILOT_CALL_URL = "https://cal.com/strikelab/pilot";
    expect(pilotCallHref("home")).toBe("https://cal.com/strikelab/pilot?src=home");
    delete process.env.NEXT_PUBLIC_PILOT_CALL_URL;
  });
});
