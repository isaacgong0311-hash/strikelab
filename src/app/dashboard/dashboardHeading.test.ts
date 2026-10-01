import { describe, expect, it } from "vitest";
import { dashboardHeading } from "./DashboardClient";

describe("dashboardHeading", () => {
  it("never says 'back' to someone with no progress", () => {
    expect(dashboardHeading(null, false)).toBe("Start here");
    expect(dashboardHeading("Maya", false)).toBe("Welcome, Maya");
  });
  it("welcomes returning users back", () => {
    expect(dashboardHeading(null, true)).toBe("Welcome back");
    expect(dashboardHeading("Maya", true)).toBe("Welcome back, Maya");
  });
});
