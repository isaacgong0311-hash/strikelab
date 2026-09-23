import type { Session } from "./types";
import { INV1_SESSIONS } from "./content/inv1";
import { INV2_SESSIONS } from "./content/inv2";
import { INV5_SESSIONS } from "./content/inv5";

/** Lessons converted to bite-sized sessions so far, in pilot-schedule order. */
export const SESSIONS: Session[] = [...INV1_SESSIONS, ...INV2_SESSIONS, ...INV5_SESSIONS];

export function getSession(id: string): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}

export function getLessonSessions(lessonId: string): Session[] {
  return SESSIONS.filter((s) => s.lessonId === lessonId);
}

/** The session after `id` in the same lesson, or undefined if it is the last. */
export function getNextSession(id: string): Session | undefined {
  const session = getSession(id);
  if (!session) return undefined;
  const lessonSessions = getLessonSessions(session.lessonId);
  return lessonSessions[lessonSessions.indexOf(session) + 1];
}

export interface SessionResult {
  completedAt: string;
  accuracy: number;
  durationMs: number;
}

export type SessionResults = Record<string, SessionResult>;

/** True once every session of the lesson has a result. */
export function isLessonFinished(lessonId: string, results: SessionResults): boolean {
  const sessions = getLessonSessions(lessonId);
  return sessions.length > 0 && sessions.every((s) => results[s.id]);
}

/** The first session of the lesson without a result, else the first session. */
export function resumeSession(lessonId: string, results: SessionResults): Session | undefined {
  const sessions = getLessonSessions(lessonId);
  return sessions.find((s) => !results[s.id]) ?? sessions[0];
}

export const RESULTS_KEY = "strikelab_sessions_v1";

export function readSessionResults(): SessionResults {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as SessionResults) : {};
  } catch {
    return {};
  }
}

function writeSessionResults(results: SessionResults): void {
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  } catch {
    // Private mode or storage full: the run still completes in memory.
  }
}

/**
 * Record a finished session. The first completion is kept (re-runs are
 * tracked by analytics), matching the session_completions table.
 */
export function saveSessionResult(sessionId: string, result: SessionResult): SessionResults {
  const existing = readSessionResults();
  if (existing[sessionId]) return existing;
  const results = { ...existing, [sessionId]: result };
  writeSessionResults(results);
  return results;
}

/** Replace local results with a reconciled set (after a cloud sync). */
export function replaceSessionResults(results: SessionResults): void {
  writeSessionResults(results);
}
