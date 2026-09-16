import { describe, expect, it } from "vitest";
import {
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  parseAccessibilityPreferences,
  resolveAccessibilityPreferences,
  serializeAccessibilityPreferences,
} from "./preferences";

describe("accessibility preferences", () => {
  it("uses system preferences when no override is saved", () => {
    expect(resolveAccessibilityPreferences(DEFAULT_ACCESSIBILITY_PREFERENCES, {
      reduceMotion: true,
      enhancedContrast: false,
    })).toEqual({ reduceMotion: true, enhancedContrast: false });
  });

  it("lets explicit preferences override the system", () => {
    expect(resolveAccessibilityPreferences({
      reduceMotion: false,
      enhancedContrast: true,
    }, {
      reduceMotion: true,
      enhancedContrast: false,
    })).toEqual({ reduceMotion: false, enhancedContrast: true });
  });

  it("round-trips valid preferences and safely rejects malformed values", () => {
    const value = { reduceMotion: true, enhancedContrast: null };
    expect(parseAccessibilityPreferences(serializeAccessibilityPreferences(value))).toEqual(value);
    expect(parseAccessibilityPreferences("not-json")).toEqual(DEFAULT_ACCESSIBILITY_PREFERENCES);
    expect(parseAccessibilityPreferences('{"reduceMotion":"yes"}')).toEqual(DEFAULT_ACCESSIBILITY_PREFERENCES);
  });
});
