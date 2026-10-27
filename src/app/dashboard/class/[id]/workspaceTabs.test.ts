import { describe, expect, it } from "vitest";
import { parseWorkspaceTab } from "./workspaceTabs";

describe("parseWorkspaceTab", () => {
  it("accepts each workspace section", () => {
    for (const tab of ["overview", "students", "plan", "settings"]) expect(parseWorkspaceTab(tab)).toBe(tab);
  });
  it("falls back to the overview for anything else", () => {
    expect(parseWorkspaceTab(undefined)).toBe("overview");
    expect(parseWorkspaceTab("admin")).toBe("overview");
    expect(parseWorkspaceTab(["students", "plan"])).toBe("students");
  });
});
