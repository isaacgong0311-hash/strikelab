import { describe, expect, it } from "vitest";
import { QUANT_FOUNDATIONS_TEMPLATE } from "./template";
import { FACILITATOR_WEEKS, nudgeMessage, weeklyMessage } from "./facilitator";

describe("facilitator content", () => {
  it("covers every template week", () => {
    expect(FACILITATOR_WEEKS.map((w) => w.week)).toEqual(QUANT_FOUNDATIONS_TEMPLATE.weeks.map((w) => w.week));
    for (const w of FACILITATOR_WEEKS) expect(w.prompts.length).toBeGreaterThan(0);
  });

  it("builds the weekly message with lessons, due date and link", () => {
    const msg = weeklyMessage({
      week: 2,
      weekTitle: "Options and payoffs",
      lessonTitles: ["What Is an Option?", "Put-Call Parity"],
      dueOn: "2026-11-08",
      cohortUrl: "https://strikelab.dev/cohort/abc",
    });
    expect(msg).toContain("Week 2: Options and payoffs");
    expect(msg).toContain("due Sun, Nov 8");
    expect(msg).toContain("• Put-Call Parity");
    expect(msg).toContain("https://strikelab.dev/cohort/abc");
    expect(msg).not.toContain("capstone");
    expect(weeklyMessage({ week: 5, weekTitle: "x", lessonTitles: [], dueOn: "2026-12-06", cohortUrl: "u" })).toContain("capstone");
  });

  it("writes a nudge without guilt-tripping", () => {
    const msg = nudgeMessage({ firstName: "Ava", cohortUrl: "u" });
    expect(msg.startsWith("Hi Ava!")).toBe(true);
    expect(msg).toContain("completely fine");
    expect(nudgeMessage({ firstName: " ", cohortUrl: "u" }).startsWith("Hi there!")).toBe(true);
  });
});
