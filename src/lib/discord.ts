/**
 * Discord incoming-webhook helpers. No OAuth app or bot needed — a user
 * creates a webhook in their server's channel settings (Edit Channel →
 * Integrations → Webhooks → New Webhook → Copy URL) and pastes it into
 * StrikeLab settings. Posting is a plain unauthenticated POST to that URL.
 */

const WEBHOOK_URL_PATTERN = /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+\/?$/;

export function isValidDiscordWebhookUrl(url: string): boolean {
  return WEBHOOK_URL_PATTERN.test(url.trim());
}

/** One Discord embed field, kept intentionally small (title + description + color band). */
interface DiscordEmbed {
  title: string;
  description?: string;
  color: number; // decimal RGB, e.g. 0x4ade80
}

/**
 * Posts an embed to a webhook URL. Best-effort: returns false on any
 * failure (bad URL, deleted webhook, Discord outage, timeout) rather than
 * throwing — callers use this as a non-critical side effect and must never
 * let a Discord hiccup break the actual feature (progress saving, settings
 * saving) that triggered it.
 */
export async function postDiscordEmbed(webhookUrl: string, embed: DiscordEmbed): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "StrikeLab",
        embeds: [{ title: embed.title, description: embed.description, color: embed.color }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export const DISCORD_COLORS = {
  grass: 0x147038,
  amber: 0xd97706,
  sky: 0x1d4ed8,
} as const;
