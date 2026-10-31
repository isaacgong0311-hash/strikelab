import { describe, expect, it } from "vitest";
import { filterHubTracks, hubLessonState, nextHubLesson, type HubTrack } from "./learningHub";
const tracks: HubTrack[] = [
  { id: "investing", title: "Investing Fundamentals", subtitle: "Markets", level: "Beginner", lessons: [
    { id: "inv-1", title: "What Is a Stock?", subtitle: "Ownership", duration: "10 min", sessionIds: ["inv-1.1", "inv-1.2"] },
    { id: "inv-2", title: "How Markets Work", subtitle: "Bid and ask", duration: "15 min", sessionIds: ["inv-2.1"] },
  ] },
  { id: "options", title: "Options Pricing", subtitle: "Models", level: "Intermediate", lessons: [{ id: "3", title: "Black-Scholes", subtitle: "Price an option", duration: "20 min", sessionIds: [] }] },
];
describe("learning hub navigation", () => {
  it("resumes partially completed work before starting a new lesson", () => {
    const results = { "inv-2.1": {} };
    expect(nextHubLesson(tracks, new Set(), results)?.id).toBe("inv-2");
    expect(hubLessonState(tracks[0].lessons[0], new Set(), { "inv-1.1": {} }).href).toBe("/learn/inv-1.2");
    expect(hubLessonState(tracks[0].lessons[0], new Set(["inv-1"]), {}).href).toBe("/lesson/inv-1");
  });
  it("combines track, text and status filters without changing original ordering", () => {
    const done = new Set(["inv-1"]);
    expect(filterHubTracks(tracks, "ASK", "investing", "all", done, {})[0].lessons.map((l) => l.id)).toEqual(["inv-2"]);
    expect(filterHubTracks(tracks, "", "all", "completed", done, {})[0].lessons.map((l) => l.id)).toEqual(["inv-1"]);
    expect(filterHubTracks(tracks, "", "all", "in-progress", done, { "inv-2.1": {} })[0].lessons.map((l) => l.id)).toEqual(["inv-2"]);
    expect(filterHubTracks(tracks, "nonexistent", "all", "all", done, {})).toEqual([]);
    expect(tracks[0].lessons).toHaveLength(2);
  });
  it("has no next lesson when every course lesson is complete", () => {
    expect(nextHubLesson(tracks, new Set(["inv-1", "inv-2", "3"]), {})).toBeUndefined();
  });
});
