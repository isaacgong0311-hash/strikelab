import { beforeAll, describe, expect, it } from "vitest";
import { loadPyodide, type PyodideInterface } from "pyodide";
import { getAllLessons } from "./tracks";

let python: PyodideInterface;
beforeAll(async () => { python = await loadPyodide(); }, 60_000);

describe("the full lesson catalog", () => {
  it("has 23 unique, reachable lesson IDs", () => {
    const lessons = getAllLessons();
    expect(lessons).toHaveLength(23);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(23);
  });

  it("executes the starter and parses the checks for every Python lesson", () => {
    const coding = getAllLessons().filter((lesson) => lesson.trackId !== "investing");
    expect(coding).toHaveLength(14);
    for (const lesson of coding) {
      const namespace = python.toPy({});
      try {
        expect(() => python.runPython(lesson.exercise.starterCode, { globals: namespace }), lesson.id).not.toThrow();
        namespace.set("_lesson_checks", lesson.exercise.testFn);
        expect(() => python.runPython("compile(_lesson_checks, '<lesson checks>', 'exec')", { globals: namespace }), lesson.id).not.toThrow();
        // The starter may intentionally fail its assertions, but the check
        // itself must run in the same Python environment as the lesson page.
        try { python.runPython(lesson.exercise.testFn, { globals: namespace }); } catch { /* unfinished starter */ }
      } finally {
        namespace.destroy();
      }
    }
  }, 60_000);
});
