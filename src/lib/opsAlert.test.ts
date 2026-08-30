import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notifyOps } from "./opsAlert";

// notifyOps must never throw and must never fetch when the env var is unset
// or malformed — it's called from error paths, where a bad webhook config
// must not become a second failure on top of the one being reported.

describe("notifyOps", () => {
  const originalUrl = process.env.OPS_DISCORD_WEBHOOK_URL;
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    if (originalUrl === undefined) delete process.env.OPS_DISCORD_WEBHOOK_URL;
    else process.env.OPS_DISCORD_WEBHOOK_URL = originalUrl;
  });

  it("does nothing when OPS_DISCORD_WEBHOOK_URL is unset", () => {
    delete process.env.OPS_DISCORD_WEBHOOK_URL;
    expect(() => notifyOps("title", "description")).not.toThrow();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does nothing when the configured URL isn't a valid Discord webhook", () => {
    process.env.OPS_DISCORD_WEBHOOK_URL = "https://example.com/not-a-webhook";
    expect(() => notifyOps("title", "description")).not.toThrow();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts an embed when a valid webhook URL is configured", () => {
    process.env.OPS_DISCORD_WEBHOOK_URL =
      "https://discord.com/api/webhooks/123456789012345678/token";
    notifyOps("Unhandled request error", "GET /api/sandbox/execute\nboom", "error");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.embeds[0].title).toBe("[ERROR] Unhandled request error");
    expect(body.embeds[0].description).toContain("boom");
  });

  it("truncates an overlong description to stay under Discord's embed cap", () => {
    process.env.OPS_DISCORD_WEBHOOK_URL =
      "https://discord.com/api/webhooks/123456789012345678/token";
    notifyOps("title", "x".repeat(5000));
    const [, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.embeds[0].description.length).toBeLessThanOrEqual(1800);
  });
});
