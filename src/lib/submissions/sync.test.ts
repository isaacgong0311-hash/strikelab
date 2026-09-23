import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { chooseInitialCode, saveSubmission } from "./sync";

const STARTER = "def f():\n    pass\n";
const older = { code: "school chromebook", updatedAt: "2026-10-27T15:00:00.000Z" };
const newer = { code: "home laptop", updatedAt: "2026-10-27T21:00:00.000Z" };

describe("chooseInitialCode", () => {
  it("starts from the starter code when nothing is saved", () => {
    expect(chooseInitialCode(null, null, STARTER)).toEqual({ code: STARTER, source: "starter" });
  });

  it("opens the newer copy, whichever device it came from", () => {
    expect(chooseInitialCode(older, newer, STARTER)).toEqual({ code: "home laptop", source: "remote" });
    expect(chooseInitialCode(newer, older, STARTER)).toEqual({ code: "home laptop", source: "local" });
  });

  it("prefers the account copy over a legacy draft with no timestamp", () => {
    expect(chooseInitialCode({ code: "legacy", updatedAt: null }, older, STARTER).source).toBe("remote");
    expect(chooseInitialCode({ code: "legacy", updatedAt: null }, null, STARTER).code).toBe("legacy");
  });

  it("treats identical code as no conflict", () => {
    expect(chooseInitialCode({ ...older, updatedAt: null }, older, STARTER).source).toBe("local");
  });
});

function fakeSupabase(error: { code: string } | null) {
  const upsert = vi.fn().mockResolvedValue({ error });
  return { client: { from: () => ({ upsert }) } as unknown as SupabaseClient, upsert };
}

describe("saveSubmission", () => {
  it("upserts the code and stamps last_passed_at only on a passing run", async () => {
    const { client, upsert } = fakeSupabase(null);
    expect(await saveSubmission(client, "u1", "3", newer)).toBe("saved");
    expect(upsert.mock.calls[0][0]).not.toHaveProperty("last_passed_at");
    await saveSubmission(client, "u1", "3", newer, true);
    expect(upsert.mock.calls[1][0]).toHaveProperty("last_passed_at");
  });

  it("reports a missing table as device-only, anything else as a retryable failure", async () => {
    expect(await saveSubmission(fakeSupabase({ code: "PGRST205" }).client, "u1", "3", newer)).toBe("unavailable");
    expect(await saveSubmission(fakeSupabase({ code: "42P01" }).client, "u1", "3", newer)).toBe("unavailable");
    expect(await saveSubmission(fakeSupabase({ code: "500" }).client, "u1", "3", newer)).toBe("failed");
  });

  it("caps oversized code", async () => {
    const { client, upsert } = fakeSupabase(null);
    await saveSubmission(client, "u1", "3", { code: "x".repeat(60_000), updatedAt: null });
    expect((upsert.mock.calls[0][0] as { code: string }).code).toHaveLength(50_000);
  });
});
