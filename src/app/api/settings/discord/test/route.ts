/**
 * POST /api/settings/discord/test — sends a test embed to the caller's saved
 * webhook, so "Save" doesn't leave them wondering whether it actually works
 * until their next lesson completion (which could be minutes away, or never,
 * if the URL was mistyped).
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/requireUser";
import { postDiscordEmbed, DISCORD_COLORS } from "@/lib/discord";

export async function POST() {
  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data } = await auth.supabase
    .from("profiles")
    .select("discord_webhook_url")
    .eq("id", auth.userId)
    .maybeSingle();

  const webhookUrl = data?.discord_webhook_url;
  if (!webhookUrl) {
    return NextResponse.json({ error: "No webhook connected yet" }, { status: 400 });
  }

  const ok = await postDiscordEmbed(webhookUrl, {
    title: "∂ StrikeLab is connected!",
    description: "Lesson completions and achievements will post here from now on.",
    color: DISCORD_COLORS.grass,
  });

  if (!ok) {
    return NextResponse.json(
      { error: "Discord rejected the message — double-check the webhook still exists in your server." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
