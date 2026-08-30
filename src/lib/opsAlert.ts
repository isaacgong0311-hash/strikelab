/**
 * Ops-facing Discord alerts — a separate channel from the user-facing
 * lesson-completion webhooks in src/lib/discord.ts, but the same posting
 * primitive. Configure OPS_DISCORD_WEBHOOK_URL (server-only env var, never
 * NEXT_PUBLIC_) with a webhook pointed at a private ops channel to receive
 * these. No-op (and never throws) when it isn't set, so this is safe to call
 * unconditionally from error paths.
 */
import { postDiscordEmbed, DISCORD_COLORS, isValidDiscordWebhookUrl } from "./discord";

export type OpsAlertLevel = "info" | "warn" | "error";

const LEVEL_COLOR: Record<OpsAlertLevel, number> = {
  info: DISCORD_COLORS.sky,
  warn: DISCORD_COLORS.amber,
  error: 0xdc2626,
};

/**
 * Fire-and-forget ops alert. Never throws and never rejects the caller's
 * promise chain — an alerting failure must not become a second incident.
 */
export function notifyOps(title: string, description: string, level: OpsAlertLevel = "error"): void {
  const url = process.env.OPS_DISCORD_WEBHOOK_URL;
  if (!url || !isValidDiscordWebhookUrl(url)) return;

  void postDiscordEmbed(url, {
    title: `[${level.toUpperCase()}] ${title}`,
    description: description.slice(0, 1800), // stay under Discord's embed description cap
    color: LEVEL_COLOR[level],
  }).catch(() => {
    // postDiscordEmbed already swallows its own errors and resolves false;
    // this catch only guards against a future change that makes it throw.
  });
}
