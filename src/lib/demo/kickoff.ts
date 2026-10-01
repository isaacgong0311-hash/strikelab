import type { KickoffLive, KickoffStage } from "@/lib/teach/kickoffLive";
import { summarizeKickoff } from "@/lib/teach/kickoffLive";
import { STUDENTS } from "./fixtures";

/** Minutes the demo plays through: one student joins per minute. */
export const DEMO_KICKOFF_MINUTES = STUDENTS.length;

/**
 * Sample kickoff for /demo: after `minute` minutes the first `minute` demo
 * students have joined, and each finishes the first short lesson two minutes
 * after joining and lesson 1 five minutes after joining. Invented names only;
 * the same pure summary the real invite page uses.
 */
export function demoKickoffAt(minute: number): KickoffLive {
  const m = Math.max(0, Math.min(DEMO_KICKOFF_MINUTES, Math.round(minute)));
  const joined = STUDENTS.slice(0, m);
  const stageOf = (index: number): KickoffStage => {
    const age = m - index;
    return age >= 5 ? "first-lesson" : age >= 2 ? "first-session" : "joined";
  };
  const stages = joined.map((_, i) => stageOf(i));
  return summarizeKickoff({
    memberIds: joined.map((s) => s.id),
    names: new Map(joined.map((s) => [s.id, s.name])),
    finishedSession: new Set(joined.filter((_, i) => stages[i] !== "joined").map((s) => s.id)),
    finishedLesson: new Set(joined.filter((_, i) => stages[i] === "first-lesson").map((s) => s.id)),
  });
}
