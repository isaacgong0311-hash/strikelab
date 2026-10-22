import { afterEach, describe, expect, it, vi } from "vitest";
import { track } from "@vercel/analytics";
import { trackLessonStart, trackSessionStart, trackStartingPoint } from "./analytics";
import { LEARNING_NEXT_STEP_KEY } from "./learningNextStep";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe("starting-point analytics", () => {
  it("sends only lifecycle events and an allowlisted destination, never quiz answers or attribution", () => {
    trackStartingPoint("started");
    trackStartingPoint("completed", "/lesson/3");
    expect(track).toHaveBeenNthCalledWith(1, "starting_point_started", {});
    expect(track).toHaveBeenNthCalledWith(2, "starting_point_completed", { destination: "/lesson/3" });
    trackStartingPoint("lesson_click", "https://example.com");
    expect(track).toHaveBeenCalledTimes(2);
  });

  it("does not count navigation to unrelated content as recommended-lesson opening", () => {
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => key === LEARNING_NEXT_STEP_KEY ? '{"version":1,"href":"/lesson/3"}' : null } });
    trackLessonStart("1");
    expect(track).not.toHaveBeenCalledWith("starting_point_lesson_open", expect.anything());
    trackLessonStart("3");
    expect(track).toHaveBeenLastCalledWith("starting_point_lesson_open", { destination: "/lesson/3" });
  });

  it("also recognizes a recommended short session", () => {
    vi.stubGlobal("window", { localStorage: { getItem: () => '{"version":1,"href":"/learn/inv-1.1"}' } });
    trackSessionStart("inv-1.1");
    expect(track).toHaveBeenLastCalledWith("starting_point_lesson_open", { destination: "/learn/inv-1.1" });
  });

  it("keeps analytics failures from blocking a check or click", () => {
    vi.mocked(track).mockImplementationOnce(() => { throw new Error("Analytics unavailable"); });
    expect(() => trackStartingPoint("completed", "/lesson/3")).not.toThrow();
  });
});
