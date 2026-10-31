import { describe, expect, it } from "vitest";
import { STARTING_QUESTIONS, recommendStartingPoint } from "./startingPoint";
import { getLessonById } from "./tracks";
import { getSession } from "./sessions";

describe("starting-point recommendations", () => {
  it("recommends the first missing prerequisite rather than using a total-score threshold", () => {
    expect(recommendStartingPoint([1, 1, 2, 0]).href).toBe("/learn/inv-1.1");
    expect(recommendStartingPoint([0, 0, 2, 0]).href).toBe("/learn/inv-5.1");
    expect(recommendStartingPoint([0, 1, -1, 0]).href).toBe("/lesson/1");
    expect(recommendStartingPoint([0, 1, 2, -1]).href).toBe("/lesson/q3");
    expect(recommendStartingPoint([0, 1, 2, 0]).href).toBe("/lesson/3");
  });
  it("routes every question and all-correct result to real learning content", () => {
    const destinations = [...STARTING_QUESTIONS, recommendStartingPoint([0, 1, 2, 0])];
    for (const { href } of destinations) {
      const id = href.split("/").at(-1)!;
      expect(href.startsWith("/learn/") ? getSession(id) : getLessonById(id)).toBeTruthy();
    }
  });
});
