import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSession } from "./sessions";
import { getLessonById } from "./tracks";
import {
  LEARNING_DESTINATIONS, LEARNING_NEXT_STEP_KEY, completeLearningNextStep,
  completeSavedLesson, parseLearningNextStep, readLearningNextStep,
  saveLearningNextStep, subscribeLearningNextStep,
} from "./learningNextStep";

const values = new Map<string, string>();
const storage = {
  getItem: vi.fn((key: string) => values.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
  removeItem: vi.fn((key: string) => { values.delete(key); }),
};

beforeEach(() => {
  values.clear();
  vi.clearAllMocks();
  vi.stubGlobal("window", Object.assign(new EventTarget(), { localStorage: storage }));
});
afterEach(() => { vi.unstubAllGlobals(); });

describe("learning next step", () => {
  it("rejects malformed, version-mismatched, external, and non-curriculum destinations", () => {
    for (const raw of [null, "broken", "null", "[]", '{"version":2,"href":"/lesson/3"}', '{"version":1,"href":"https://example.com"}', '{"version":1,"href":"javascript:alert(1)"}', '{"version":1,"href":"/lesson/missing"}', '{"version":1,"href":"toString"}']) {
      expect(parseLearningNextStep(raw)).toBeNull();
    }
  });

  it("saves only a version and allowlisted destination, and supports clearing", () => {
    saveLearningNextStep("/learn/inv-1.1");
    expect(readLearningNextStep()).toBe("/learn/inv-1.1");
    expect(JSON.parse(values.get(LEARNING_NEXT_STEP_KEY)!)).toEqual({ version: 1, href: "/learn/inv-1.1" });
    saveLearningNextStep("https://example.com");
    expect(readLearningNextStep()).toBe("/learn/inv-1.1");
    saveLearningNextStep(null);
    expect(readLearningNextStep()).toBeNull();
  });

  it("advances the matching completed session, leaves unrelated work alone, and clears completed lessons", () => {
    saveLearningNextStep("/learn/inv-1.1");
    completeLearningNextStep("/learn/inv-5.1", "/learn/inv-5.2");
    expect(readLearningNextStep()).toBe("/learn/inv-1.1");
    completeLearningNextStep("/learn/inv-1.1", "/learn/inv-1.2");
    expect(readLearningNextStep()).toBe("/learn/inv-1.2");
    completeSavedLesson("inv-5");
    expect(readLearningNextStep()).toBe("/learn/inv-1.2");
    completeSavedLesson("inv-1");
    expect(readLearningNextStep()).toBeNull();
    saveLearningNextStep("/lesson/3");
    completeSavedLesson("3");
    expect(readLearningNextStep()).toBeNull();
  });

  it("never throws when browser storage is blocked or unavailable", () => {
    vi.stubGlobal("window", { get localStorage() { throw new Error("Blocked"); } });
    expect(readLearningNextStep()).toBeNull();
    expect(() => saveLearningNextStep("/lesson/3")).not.toThrow();
    expect(() => completeSavedLesson("3")).not.toThrow();
    vi.stubGlobal("window", undefined);
    expect(readLearningNextStep()).toBeNull();
  });

  it("notifies same-tab subscribers and ignores unrelated storage events", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeLearningNextStep(onChange);
    saveLearningNextStep("/lesson/1");
    expect(onChange).toHaveBeenCalledTimes(1);
    window.dispatchEvent(Object.assign(new Event("storage"), { key: "other-key" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    window.dispatchEvent(Object.assign(new Event("storage"), { key: LEARNING_NEXT_STEP_KEY }));
    window.dispatchEvent(Object.assign(new Event("storage"), { key: null }));
    expect(onChange).toHaveBeenCalledTimes(3);
    unsubscribe();
    saveLearningNextStep(null);
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("resolves every allowlisted destination to real content", () => {
    for (const href of Object.keys(LEARNING_DESTINATIONS)) {
      const id = href.split("/").at(-1)!;
      expect(href.startsWith("/learn/") ? getSession(id) : getLessonById(id)).toBeTruthy();
    }
  });
});
