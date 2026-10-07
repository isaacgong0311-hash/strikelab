import { describe, expect, it } from "vitest";
import { isFounder, parseFounderIds } from "./founder";

const A = "0b6f7c2e-3d4a-4b5c-8d9e-0f1a2b3c4d5e";
const B = "1c7a8d3f-4e5b-4c6d-9e0f-1a2b3c4d5e6f";

describe("founder gate", () => {
  it("nobody is a founder when the variable is unset or empty", () => {
    expect(isFounder(A, undefined)).toBe(false);
    expect(isFounder(A, "")).toBe(false);
    expect(isFounder(A, "   ")).toBe(false);
  });

  it("accepts listed ids, comma or space separated, any case", () => {
    expect(isFounder(A, `${A}, ${B}`)).toBe(true);
    expect(isFounder(B, `${A} ${B.toUpperCase()}`)).toBe(true);
    expect(isFounder("2d8b9e4a-5f6c-4d7e-8f9a-2b3c4d5e6f70", `${A},${B}`)).toBe(false);
  });

  it("ignores anything that isn't an id, so an email or a stray word can't grant access", () => {
    expect(parseFounderIds(`founder@example.com, *, ${A}`)).toEqual(new Set([A]));
    expect(isFounder("founder@example.com", "founder@example.com")).toBe(false);
    expect(isFounder(null, A)).toBe(false);
  });
});
