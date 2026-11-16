import { describe, expect, it } from "vitest";
import { buildSeasonCalendar } from "./calendar";

const NOW = new Date("2026-11-16T12:00:00Z");
const season = { id: "s1-2026", title: "Season 1", startsOn: "2026-11-30" };
const week1 = {
  id: "s1-2026-w1",
  week: 1,
  title: "Price a put from a call",
  minutes: 60,
  // Midnight and 23:59 Eastern, as in supabase/seed/season-1.sql.
  opensAt: "2026-11-30T05:00:00Z",
  closesAt: "2026-12-07T04:59:00Z",
};

/** Undo RFC 5545 folding so assertions can read whole lines. */
const unfold = (ics: string) => ics.replace(/\r\n /g, "").split("\r\n");

describe("buildSeasonCalendar", () => {
  it("adds an opening day and a last day per week, on Eastern dates", () => {
    const lines = unfold(buildSeasonCalendar(season, [week1], NOW));
    expect(lines.filter((l) => l === "BEGIN:VEVENT")).toHaveLength(2);
    expect(lines).toContain("DTSTART;VALUE=DATE:20261130");
    expect(lines).toContain("DTEND;VALUE=DATE:20261201");
    // 04:59 UTC on Dec 7 is still Dec 6 in New York.
    expect(lines).toContain("DTSTART;VALUE=DATE:20261206");
    expect(lines).toContain("SUMMARY:StrikeLab week 1 opens: Price a put from a call");
    expect(lines).toContain("URL:https://strikelab.dev/seasons/s1-2026-w1");
    expect(lines).toContain("TRIGGER:PT16H");
  });

  it("falls back to a single season-start event before challenges are scheduled", () => {
    const lines = unfold(buildSeasonCalendar(season, [], NOW));
    expect(lines.filter((l) => l === "BEGIN:VEVENT")).toHaveLength(1);
    expect(lines).toContain("DTSTART;VALUE=DATE:20261130");
    expect(lines).toContain("SUMMARY:StrikeLab Season 1 starts");
  });

  it("is a valid calendar: CRLF endings, escaped text, no line over 75 octets", () => {
    const ics = buildSeasonCalendar(season, [{ ...week1, title: "Spreads, straddles; and more" }], NOW);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/\n/);
    for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(unfold(ics)).toContain("SUMMARY:StrikeLab week 1 opens: Spreads\\, straddles\\; and more");
  });
});
