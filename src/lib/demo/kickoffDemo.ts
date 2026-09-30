import { summarizeKickoff, type KickoffLive } from "@/lib/teach/kickoffSummary";

/**
 * The /demo kickoff panel (frontend master plan FW-6): a made-up first
 * meeting, minute by minute, run through the same summarizeKickoff the real
 * invite page uses. Names are invented, like the rest of Demo Club.
 */
export const KICKOFF_DEMO_MINUTES = 12;

// [name, joins at minute, finishes the first short lesson, finishes lesson 1]
const TIMELINE: [string, number, number | null, number | null][] = [
  ["Maya R.", 0, 4, 9],
  ["Jonah K.", 0, 5, 11],
  ["Priya S.", 1, 5, 10],
  ["Leo M.", 1, 6, null],
  ["Ana T.", 1, 6, 12],
  ["Zoe P.", 2, 6, 11],
  ["Sam O.", 2, 8, null],
  ["Eli W.", 2, 7, null],
  ["Grace L.", 3, null, null],
  ["Noah B.", 5, null, null],
];

export function kickoffDemoFrame(minute: number): KickoffLive {
  const here = TIMELINE.filter(([, joined]) => joined <= minute);
  const reached = (at: number | null) => at !== null && at <= minute;
  return summarizeKickoff({
    memberIds: here.map(([name]) => name),
    names: new Map(here.map(([name]) => [name, name])),
    finishedSession: new Set(here.filter(([, , session]) => reached(session)).map(([name]) => name)),
    finishedLesson: new Set(here.filter(([, , , lesson]) => reached(lesson)).map(([name]) => name)),
  });
}
