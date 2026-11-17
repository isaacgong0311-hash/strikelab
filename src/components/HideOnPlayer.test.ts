import { describe, expect, it } from "vitest";
import { isPlayerPath } from "./HideOnPlayer";

describe("isPlayerPath", () => {
  it("is true only for focused task pages: short-lesson sessions, season challenges and the practice round", () => {
    expect(isPlayerPath("/learn/inv-1.1")).toBe(true);
    expect(isPlayerPath("/seasons/s1-2026-w1")).toBe(true);
    expect(isPlayerPath("/seasons/practice")).toBe(true);
    expect(isPlayerPath("/seasons")).toBe(false);
    expect(isPlayerPath("/seasons/")).toBe(false);
    expect(isPlayerPath("/seasons/a/b")).toBe(false);
    expect(isPlayerPath("/lessons")).toBe(false);
    expect(isPlayerPath("/lesson/3")).toBe(false);
    expect(isPlayerPath("/learning-path")).toBe(false);
    expect(isPlayerPath(null)).toBe(false);
  });
});
