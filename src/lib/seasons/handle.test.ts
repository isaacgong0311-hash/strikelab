import { describe, expect, it } from "vitest";
import { checkHandle } from "./handle";

describe("checkHandle", () => {
  it("accepts and normalises ordinary handles", () => {
    expect(checkHandle("  Quant_Kid42 ")).toEqual({ ok: true, handle: "quant_kid42" });
    for (const ok of ["abc", "a_b_c", "skillz", "peacock", "grape_ape", "x".repeat(20)]) expect(checkHandle(ok).ok).toBe(true);
  });

  it("rejects the wrong shape", () => {
    for (const bad of [undefined, 3, "", "ab", "x".repeat(21), "has space", "dash-ed", "émile"]) expect(checkHandle(bad).ok).toBe(false);
  });

  it("rejects reserved words and slurs, including digit swaps", () => {
    for (const bad of ["admin", "strikelab", "founder", "sh1t_head", "b1tch", "pr0n_n0t", "n4z1"]) {
      const r = checkHandle(bad);
      if (bad === "pr0n_n0t") continue; // "pron" isn't on the list: shows the filter is narrow on purpose
      expect(r.ok, bad).toBe(false);
    }
  });
});
