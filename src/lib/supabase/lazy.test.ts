import { describe, expect, it } from "vitest";
import { hasSupabaseSessionCookie } from "./lazy";

describe("hasSupabaseSessionCookie", () => {
  it("finds the session cookie, whole or chunked, anywhere in the jar", () => {
    expect(hasSupabaseSessionCookie("sb-abcd1234-auth-token=base64-xyz")).toBe(true);
    expect(hasSupabaseSessionCookie("theme=light; sb-abcd1234-auth-token.0=base64-xyz; sb-abcd1234-auth-token.1=rest")).toBe(true);
  });

  it("ignores other cookies, including the PKCE verifier on its own", () => {
    expect(hasSupabaseSessionCookie("")).toBe(false);
    expect(hasSupabaseSessionCookie("sl_src=pilot; theme=light")).toBe(false);
    expect(hasSupabaseSessionCookie("sb-abcd1234-auth-token-code-verifier=abc")).toBe(false);
  });
});
