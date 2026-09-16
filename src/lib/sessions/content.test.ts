import { describe, expect, it } from "vitest";
import { getAllLessons } from "@/lib/tracks";
import { getLessonSessions, getNextSession, isLessonFinished, resumeSession, SESSIONS } from "./index";

// Content lint: catches authoring mistakes before a student hits them.
describe("session content", () => {
  const lessonIds = new Set(getAllLessons().map((l) => l.id));
  const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

  it("has unique session and step ids", () => {
    const sessionIds = SESSIONS.map((s) => s.id);
    expect(new Set(sessionIds).size).toBe(sessionIds.length);
    const stepIds = SESSIONS.flatMap((s) => s.steps.map((step) => step.id));
    expect(new Set(stepIds).size).toBe(stepIds.length);
  });

  for (const session of SESSIONS) {
    describe(session.id, () => {
      it("belongs to a real lesson and is named after it", () => {
        expect(lessonIds.has(session.lessonId)).toBe(true);
        expect(session.id.startsWith(`${session.lessonId}.`)).toBe(true);
      });

      it("is bite-sized with at least two questions", () => {
        expect(session.steps.length).toBeGreaterThanOrEqual(5);
        expect(session.steps.length).toBeLessThanOrEqual(15);
        expect(session.steps.filter((s) => s.kind !== "explain").length).toBeGreaterThanOrEqual(2);
        expect(session.steps[0].kind).toBe("explain");
      });

      for (const step of session.steps) {
        it(`${step.id} is well-formed`, () => {
          if (step.kind === "explain") {
            for (const paragraph of step.body) expect(wordCount(paragraph)).toBeLessThanOrEqual(50);
          } else if (step.kind === "mcq") {
            expect(step.options.length).toBeGreaterThanOrEqual(2);
            expect(step.options.length).toBeLessThanOrEqual(4);
            expect(step.correct).toBeGreaterThanOrEqual(0);
            expect(step.correct).toBeLessThan(step.options.length);
            expect(new Set(step.options).size).toBe(step.options.length);
            expect(step.explanation.length).toBeGreaterThan(20);
          } else {
            expect(Number.isFinite(step.answer)).toBe(true);
            expect(step.explanation.length).toBeGreaterThan(10);
          }
        });
      }
    });
  }
});

describe("inv-1 worked answers", () => {
  const byId = new Map(SESSIONS.flatMap((s) => s.steps).map((s) => [s.id, s]));
  const answer = (id: string) => {
    const step = byId.get(id);
    if (step?.kind !== "numeric") throw new Error(`${id} is not numeric`);
    return step.answer;
  };

  it("computes the numbers the explanations claim", () => {
    expect(answer("inv-1.1.percent")).toBeCloseTo((10_000 / 2_000_000) * 100);
    expect(answer("inv-1.3.pe-calc")).toBeCloseTo(150 / 6);
    expect(answer("inv-1.3.market-cap-calc")).toBeCloseTo((40 * 500_000_000) / 1e9);
  });
});

describe("session navigation", () => {
  it("walks a lesson's sessions in order and resumes at the first unfinished one", () => {
    const [first, second, third] = getLessonSessions("inv-1");
    expect(getNextSession(first.id)?.id).toBe(second.id);
    expect(getNextSession(third.id)).toBeUndefined();

    const done = { completedAt: "2026-09-16T12:00:00Z", accuracy: 1, durationMs: 1000 };
    expect(resumeSession("inv-1", {})?.id).toBe(first.id);
    expect(resumeSession("inv-1", { [first.id]: done })?.id).toBe(second.id);
    expect(isLessonFinished("inv-1", { [first.id]: done, [second.id]: done })).toBe(false);
    expect(isLessonFinished("inv-1", { [first.id]: done, [second.id]: done, [third.id]: done })).toBe(true);
  });
});
