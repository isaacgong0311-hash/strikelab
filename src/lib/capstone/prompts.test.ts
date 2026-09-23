import { describe, expect, it } from "vitest";
import { getLessonById } from "@/lib/tracks";
import { CAPSTONE_PROMPTS, validateCapstone } from "./prompts";

const full = {
  promptId: "backtest",
  title: "  MA crossover on SPY ",
  thesis: "Does a 50/200 crossover beat buy-and-hold?",
  code: "print(1)",
  resultSummary: "Sharpe 0.4 vs 0.6",
  reflection: "Survivorship bias is limited because SPY is an index fund.",
};

describe("capstone prompts", () => {
  it("point at real lessons for starting code", () => {
    for (const p of CAPSTONE_PROMPTS) if (p.lessonId) expect(getLessonById(p.lessonId), p.id).not.toBeNull();
  });
});

describe("validateCapstone", () => {
  it("accepts a complete submission and trims the title", () => {
    const r = validateCapstone(full, true);
    expect(r).toMatchObject({ ok: true, value: { title: "MA crossover on SPY" } });
  });

  it("lets drafts be incomplete but not submissions", () => {
    const partial = { ...full, reflection: "  " };
    expect(validateCapstone(partial, false).ok).toBe(true);
    expect(validateCapstone(partial, true)).toEqual({ ok: false, error: "Reflection is needed before you submit" });
  });

  it("rejects unknown prompts, junk and oversized fields", () => {
    expect(validateCapstone({ ...full, promptId: "hack" }, false)).toEqual({ ok: false, error: "Choose a prompt" });
    expect(validateCapstone(null, false).ok).toBe(false);
    expect(validateCapstone({ ...full, title: "x".repeat(121) }, false)).toMatchObject({ ok: false, error: /Title is too long/ });
  });

  it("ignores non-string field values", () => {
    const r = validateCapstone({ ...full, code: { evil: true } }, false);
    expect(r).toMatchObject({ ok: true, value: { code: "" } });
  });
});
