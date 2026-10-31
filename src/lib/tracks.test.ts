import { describe, expect, it } from "vitest";
import { getAllLessons } from "./tracks";

describe("lesson desk briefings", () => {
  const lessons = getAllLessons();

  it("every lesson in every track opens with a briefing from the desk head", () => {
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons.filter((l) => !l.deskBriefing?.trim()).map((l) => l.id)).toEqual([]);
  });

  it("briefings stay short enough to read before the lesson starts", () => {
    // About two sentences; longer than this and it's a second introduction.
    expect(lessons.filter((l) => (l.deskBriefing ?? "").length > 300).map((l) => l.id)).toEqual([]);
  });

  it("briefings are in the desk head's own voice, not about them", () => {
    expect(lessons.filter((l) => /desk head/i.test(l.deskBriefing ?? "")).map((l) => l.id)).toEqual([]);
  });
});
