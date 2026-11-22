/**
 * An .ics file a student can add to their phone calendar so they come back
 * when a challenge opens. Challenge windows run a whole week (midnight to
 * 23:59 Eastern), so a week-long event would just be clutter: instead each
 * week gets an all-day "opens" event and an all-day "last day" event, each
 * with a reminder at 4pm (after school) on that day. An "opens" event also
 * reminds at 4pm the day before, so a student can plan the hour.
 *
 * All-day events start at local midnight, so triggers are offsets from it:
 * PT16H is 4pm that day, -PT8H is 4pm the day before.
 */
import { SITE_URL } from "@/lib/site";

export interface CalendarChallenge {
  id: string;
  week: number;
  title: string;
  minutes: number;
  opensAt: string;
  closesAt: string;
}

const ZONE = "America/New_York";

/** YYYYMMDD of an instant, on the season's calendar (Eastern). */
function easternDay(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
  return parts.replaceAll("-", "");
}

function nextDay(yyyymmdd: string): string {
  const d = new Date(Date.UTC(+yyyymmdd.slice(0, 4), +yyyymmdd.slice(4, 6) - 1, +yyyymmdd.slice(6, 8) + 1));
  return d.toISOString().slice(0, 10).replaceAll("-", "");
}

function escapeText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

function stamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function alarm(description: string, trigger: string): string[] {
  return ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escapeText(description)}`, `TRIGGER:${trigger}`, "END:VALARM"];
}

function allDayEvent(
  uid: string, day: string, summary: string, description: string, url: string, now: Date,
  dayBefore?: string,
): string[] {
  return [
    "BEGIN:VEVENT",
    `UID:${uid}@strikelab.dev`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${nextDay(day)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${url}`,
    "TRANSP:TRANSPARENT",
    ...(dayBefore ? alarm(dayBefore, "-PT8H") : []),
    ...alarm(summary, "PT16H"),
    "END:VEVENT",
  ];
}

export function buildSeasonCalendar(
  season: { id: string; title: string; startsOn: string },
  challenges: CalendarChallenge[],
  now: Date = new Date(),
): string {
  const seasonUrl = `${SITE_URL}/seasons`;
  const events: string[] = [];
  if (challenges.length === 0) {
    events.push(...allDayEvent(
      `${season.id}-start`,
      season.startsOn.replaceAll("-", ""),
      `StrikeLab ${season.title} starts`,
      `The first timed challenge opens today. ${seasonUrl}`,
      seasonUrl,
      now,
      `StrikeLab ${season.title} starts tomorrow`,
    ));
  }
  for (const c of [...challenges].sort((a, b) => a.week - b.week)) {
    const url = `${SITE_URL}/seasons/${encodeURIComponent(c.id)}`;
    events.push(...allDayEvent(
      `${c.id}-opens`,
      easternDay(c.opensAt),
      `StrikeLab week ${c.week} opens: ${c.title}`,
      `${season.title}, week ${c.week}. ${c.minutes}-minute timed challenge, open all week. ${url}`,
      url,
      now,
      `StrikeLab week ${c.week} opens tomorrow`,
    ));
    events.push(...allDayEvent(
      `${c.id}-last-day`,
      easternDay(c.closesAt),
      `Last day for StrikeLab week ${c.week}`,
      `Week ${c.week} (${c.title}) closes at 11:59pm Eastern tonight. ${url}`,
      url,
      now,
    ));
  }
  // RFC 5545: CRLF line endings, lines folded at 75 octets.
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StrikeLab//Seasons//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`StrikeLab ${season.title}`)}`,
    ...events,
    "END:VCALENDAR",
  ].map(fold).join("\r\n") + "\r\n";
}

/** Fold a content line into 75-octet pieces, continuation lines start with a space. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const pieces: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    const limit = pieces.length === 0 ? 75 : 74; // continuation lines spend one octet on the space
    if (size + n > limit) {
      pieces.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += n;
  }
  pieces.push(current);
  return pieces.join("\r\n ");
}
