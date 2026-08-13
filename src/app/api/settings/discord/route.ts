/**
 * /api/settings/discord — manage the caller's Discord webhook URL.
 *
 * GET returns only whether one is configured, never the URL itself — once
 * saved there's no legitimate reason to redisplay it (matches the "write-
 * only secret" pattern of an API-key manager), and it's a bearer credential:
 * anyone holding it can post to that Discord channel.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { isValidDiscordWebhookUrl } from "@/lib/discord";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from("profiles")
    .select("discord_webhook_url")
    .eq("id", auth.userId)
    .maybeSingle();

  if (error) {
    console.error("[settings/discord] GET", error.message);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }

  return NextResponse.json({ connected: Boolean(data?.discord_webhook_url) });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await req.json().catch(() => ({}))) as { webhookUrl?: string };
  const webhookUrl = (body.webhookUrl ?? "").trim();

  if (!isValidDiscordWebhookUrl(webhookUrl)) {
    return NextResponse.json(
      { error: "That doesn't look like a Discord webhook URL (should start with https://discord.com/api/webhooks/...)" },
      { status: 400 },
    );
  }

  const { error } = await auth.supabase
    .from("profiles")
    .update({ discord_webhook_url: webhookUrl })
    .eq("id", auth.userId);

  if (error) {
    console.error("[settings/discord] POST", error.message);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ connected: true });
}

export async function DELETE() {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { error } = await auth.supabase
    .from("profiles")
    .update({ discord_webhook_url: null })
    .eq("id", auth.userId);

  if (error) {
    console.error("[settings/discord] DELETE", error.message);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  return NextResponse.json({ connected: false });
}
