import { describe, expect, it } from "vitest";
import { clearDraft, draftKey, loadDraft, MAX_DRAFT_CODE, saveDraft, type StorageLike } from "./draft";

function memory(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe("season drafts", () => {
  it("keeps a draft per student and challenge", () => {
    expect(draftKey("u1", "s1-w1")).not.toBe(draftKey("u2", "s1-w1"));
    expect(draftKey("u1", "s1-w1")).not.toBe(draftKey("u1", "s1-w2"));
  });

  it("round-trips code and explanation, then clears on submit", () => {
    const store = memory();
    const key = draftKey("u1", "s1-w1");
    expect(saveDraft(store, key, { code: "def f(): pass", explanation: "because", savedAt: 5 })).toBe(true);
    expect(loadDraft(store, key)).toEqual({ code: "def f(): pass", explanation: "because", savedAt: 5 });
    clearDraft(store, key);
    expect(loadDraft(store, key)).toBeNull();
  });

  it("ignores anything that isn't a draft", () => {
    const store = memory();
    const key = draftKey("u1", "s1-w1");
    store.setItem(key, "not json");
    expect(loadDraft(store, key)).toBeNull();
    store.setItem(key, JSON.stringify({ code: 5 }));
    expect(loadDraft(store, key)).toBeNull();
  });

  it("caps what it restores at what the server will accept", () => {
    const store = memory();
    const key = draftKey("u1", "s1-w1");
    store.setItem(key, JSON.stringify({ code: "x".repeat(MAX_DRAFT_CODE + 10), explanation: "", savedAt: 1 }));
    expect(loadDraft(store, key)!.code).toHaveLength(MAX_DRAFT_CODE);
  });

  it("copes with storage that is missing or throws", () => {
    expect(loadDraft(null, "k")).toBeNull();
    expect(saveDraft(null, "k", { code: "", explanation: "", savedAt: 1 })).toBe(false);
    const broken: StorageLike = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("quota"); },
      removeItem: () => { throw new Error("blocked"); },
    };
    expect(loadDraft(broken, "k")).toBeNull();
    expect(saveDraft(broken, "k", { code: "", explanation: "", savedAt: 1 })).toBe(false);
    expect(() => clearDraft(broken, "k")).not.toThrow();
  });
});
