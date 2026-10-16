import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { lookupInvite } from "./classInvite";

const row = { id: "c1", name: "Quant Club", template_id: "quant-foundations-v1", starts_on: "2026-11-02" };

function admin(result: { data: unknown; error: { message: string } | null } | "throw"): SupabaseClient {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            if (result === "throw") throw new Error("network down");
            return result;
          },
        }),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe("lookupInvite", () => {
  it("finds a class for a valid code", async () => {
    expect(await lookupInvite(admin({ data: row, error: null }), "ABC234")).toEqual({ kind: "found", klass: row });
  });

  it("says not-found for a code that matches no class", async () => {
    expect(await lookupInvite(admin({ data: null, error: null }), "ABC234")).toEqual({ kind: "not-found" });
  });

  it("says not-found for a malformed code without touching the database", async () => {
    const boom = admin("throw");
    for (const bad of ["", "abc234", "ABC23", "ABC2345", "ABCO23", "AB C23"]) {
      expect(await lookupInvite(boom, bad)).toEqual({ kind: "not-found" });
    }
  });

  it("says unavailable, not not-found, when the server is not configured", async () => {
    expect(await lookupInvite(null, "ABC234")).toEqual({ kind: "unavailable" });
  });

  it("says unavailable when the database returns an error or throws", async () => {
    expect(await lookupInvite(admin({ data: null, error: { message: "connection refused" } }), "ABC234")).toEqual({ kind: "unavailable" });
    expect(await lookupInvite(admin("throw"), "ABC234")).toEqual({ kind: "unavailable" });
  });
});
