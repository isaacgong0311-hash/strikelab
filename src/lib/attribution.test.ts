import { afterEach, describe, expect, it, vi } from "vitest";
import { captureAttribution, getAttribution } from "./attribution";

function fakeBrowser(search: string) {
  const store = new Map<string, string>();
  vi.stubGlobal("window", { location: { search } });
  vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("attribution", () => {
  it("captures our own ?src= tag, not just UTM params", () => {
    fakeBrowser("?src=email-oct");
    captureAttribution();
    expect(getAttribution().src).toBe("email-oct");
  });

  it("keeps the first touch for the session", () => {
    fakeBrowser("?src=email-oct");
    captureAttribution();
    vi.stubGlobal("window", { location: { search: "?src=home-hero" } });
    captureAttribution();
    expect(getAttribution().src).toBe("email-oct");
  });

  it("stores nothing for an untagged visit", () => {
    fakeBrowser("");
    captureAttribution();
    expect(getAttribution()).toEqual({});
  });
});
