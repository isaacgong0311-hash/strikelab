import { describe, expect, it } from "vitest";
import { isPlayerPath } from "./HideOnPlayer";

describe("isPlayerPath", () => {
  it("is true only for short-lesson session pages", () => {
    expect(isPlayerPath("/learn/inv-1.1")).toBe(true);
    expect(isPlayerPath("/lessons")).toBe(false);
    expect(isPlayerPath("/lesson/3")).toBe(false);
    expect(isPlayerPath("/learning-path")).toBe(false);
    expect(isPlayerPath(null)).toBe(false);
  });
});
