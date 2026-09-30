import { describe, expect, it } from "vitest";
import { continueHref, hasStarted, lessonHref, nextLesson } from "./nextStep";
import { getLessonSessions, type SessionResults } from "./sessions";
import { TRACKS } from "./tracks";

const done = (id: string) => ({ [id]: { completedAt: "2026-09-30T00:00:00Z", accuracy: 1, durationMs: 1000 } });
const firstLesson = TRACKS[0].lessons[0];
const firstSessions = getLessonSessions(firstLesson.id);

describe("next step", () => {
  it("sends a brand-new student to lesson 1's first session, not the long-form page", () => {
    expect(firstSessions.length).toBeGreaterThan(0);
    expect(continueHref(new Set(), {})).toBe(`/learn/${firstSessions[0].id}`);
  });

  it("resumes at the first unfinished session", () => {
    const results: SessionResults = done(firstSessions[0].id);
    expect(continueHref(new Set(), results)).toBe(`/learn/${firstSessions[1].id}`);
  });

  it("opens the long-form page for a lesson without sessions", () => {
    const longForm = TRACKS.flatMap((t) => t.lessons).find((l) => getLessonSessions(l.id).length === 0)!;
    expect(lessonHref(longForm.id, false, {})).toBe(`/lesson/${longForm.id}`);
  });

  it("opens the long-form page for a finished lesson, to review it", () => {
    expect(lessonHref(firstLesson.id, true, {})).toBe(`/lesson/${firstLesson.id}`);
  });

  it("skips finished lessons in path order and ends at the map", () => {
    const all = TRACKS.flatMap((t) => t.lessons);
    expect(nextLesson(new Set([all[0].id]))?.id).toBe(all[1].id);
    expect(continueHref(new Set(all.map((l) => l.id)), {})).toBe("/lessons");
  });

  it("counts a student as started after one session or one lesson", () => {
    expect(hasStarted(new Set(), {})).toBe(false);
    expect(hasStarted(new Set(), done(firstSessions[0].id))).toBe(true);
    expect(hasStarted(new Set([firstLesson.id]), {})).toBe(true);
  });
});
