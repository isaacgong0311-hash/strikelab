import { describe, expect, it } from "vitest";
import { safeNextPath } from "./nextPath";

describe("safeNextPath", () => {
  it("keeps same-origin paths with their query", () => {
    expect(safeNextPath("/join/ABC234")).toBe("/join/ABC234");
    expect(safeNextPath("/cohort/abc?tab=week#now")).toBe("/cohort/abc?tab=week#now");
  });

  it.each([
    null,
    "",
    "dashboard",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "@evil.com",
    "javascript:alert(1)",
    "/ok\u0000",
    "/" + "a".repeat(600),
  ])("falls back for %j", (value) => {
    expect(safeNextPath(value)).toBe("/dashboard");
  });

  it("uses the given fallback", () => {
    expect(safeNextPath("https://evil.com", "/")).toBe("/");
  });
});
