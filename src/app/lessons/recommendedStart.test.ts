import { describe, expect, it } from "vitest";
import { TRACKS } from "@/lib/tracks";
import { getLessonSessions } from "@/lib/sessions";
import { hubLessonState, nextHubLesson, type HubTrack } from "@/lib/learningHub";
import { buildLessonToc, EXERCISE_ANCHOR } from "@/lib/lessonToc";
import { recommendedStart } from "./recommendedStart";

const hubTracks: HubTrack[] = TRACKS.map((track) => ({
  id: track.id, title: track.title, subtitle: track.subtitle, level: track.level,
  lessons: track.lessons.map((lesson) => ({
    id: lesson.id, title: lesson.title, subtitle: lesson.subtitle, duration: lesson.duration,
    sessionIds: getLessonSessions(lesson.id).map((s) => s.id),
  })),
}));

describe("the recommended first lesson", () => {
  it("is What Is a Stock?, opened at its first short session", () => {
    expect(recommendedStart()).toEqual({ id: "inv-1", title: "What Is a Stock?", href: "/learn/inv-1.1" });
  });

  it("matches what /lessons offers a visitor with no progress", () => {
    const none = new Set<string>();
    const first = nextHubLesson(hubTracks, none, {});
    expect(first?.id).toBe(recommendedStart().id);
    expect(hubLessonState(first!, none, {}).href).toBe(recommendedStart().href);
  });
});

describe("lesson section anchors", () => {
  it("never give a section the exercise's id", () => {
    const toc = buildLessonToc("<h2>Exercise</h2><p>a</p><h2>Exercise</h2><p>b</p>");
    expect(toc.sections.map((s) => s.id)).toEqual(["exercise-2", "exercise-3"]);
    expect(toc.sections.some((s) => s.id === EXERCISE_ANCHOR)).toBe(false);
  });

  it("leave every real lesson's section ids unchanged", () => {
    // No authored heading slugs to "exercise", so reserving it moved no deep link.
    for (const track of TRACKS) {
      for (const lesson of track.lessons) {
        expect(buildLessonToc(lesson.content).sections.every((s) => !s.id.startsWith(EXERCISE_ANCHOR))).toBe(true);
      }
    }
  });
});
