import { describe, expect, it } from "vitest";
import { isValidDiscordWebhookUrl } from "./discord";

// This is the only gate between a user-submitted string and a server-side
// fetch() to it (src/lib/discord.ts postDiscordEmbed, called from
// src/app/api/settings/discord/test/route.ts and the completion-post path).
// A regex that's too loose here is a straightforward SSRF vector — the
// server would fetch whatever URL a "webhook" field contains. Zero coverage
// before this file.

describe("isValidDiscordWebhookUrl", () => {
  it("accepts a real discord.com webhook URL", () => {
    expect(
      isValidDiscordWebhookUrl(
        "https://discord.com/api/webhooks/123456789012345678/aBcD-_1234567890tokenTOKEN",
      ),
    ).toBe(true);
  });

  it("accepts the legacy discordapp.com host", () => {
    expect(
      isValidDiscordWebhookUrl("https://discordapp.com/api/webhooks/123456789012345678/token-_123"),
    ).toBe(true);
  });

  it("accepts a trailing slash", () => {
    expect(
      isValidDiscordWebhookUrl("https://discord.com/api/webhooks/123456789012345678/token/"),
    ).toBe(true);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(
      isValidDiscordWebhookUrl("  https://discord.com/api/webhooks/123456789012345678/token  "),
    ).toBe(true);
  });

  it("rejects a lookalike host (SSRF via suffix trick)", () => {
    expect(
      isValidDiscordWebhookUrl("https://discord.com.evil.com/api/webhooks/123456789012345678/token"),
    ).toBe(false);
  });

  it("rejects a lookalike host (SSRF via subdomain trick)", () => {
    expect(
      isValidDiscordWebhookUrl("https://evil.discord.com/api/webhooks/123456789012345678/token"),
    ).toBe(false);
  });

  it("rejects plain http (not https)", () => {
    expect(
      isValidDiscordWebhookUrl("http://discord.com/api/webhooks/123456789012345678/token"),
    ).toBe(false);
  });

  it("rejects a non-numeric webhook id", () => {
    expect(
      isValidDiscordWebhookUrl("https://discord.com/api/webhooks/not-a-number/token"),
    ).toBe(false);
  });

  it("rejects a URL missing the token segment", () => {
    expect(isValidDiscordWebhookUrl("https://discord.com/api/webhooks/123456789012345678/")).toBe(
      false,
    );
  });

  it("rejects an unrelated Discord path (not the webhooks API)", () => {
    expect(isValidDiscordWebhookUrl("https://discord.com/channels/123/456")).toBe(false);
  });

  it("rejects a javascript: pseudo-scheme", () => {
    expect(isValidDiscordWebhookUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects an entirely unrelated domain", () => {
    expect(isValidDiscordWebhookUrl("https://example.com/api/webhooks/123456789012345678/token")).toBe(
      false,
    );
  });

  it("rejects an empty string", () => {
    expect(isValidDiscordWebhookUrl("")).toBe(false);
  });
});
