import type { SupabaseClient } from "@supabase/supabase-js";
import { getLessonById, TRACKS } from "@/lib/tracks";
import { ACHIEVEMENTS, isUnlocked } from "@/lib/achievements";
import { isTrackComplete } from "@/lib/certificates";
import { postDiscordEmbed, DISCORD_COLORS } from "@/lib/discord";

/**
 * Posts to the user's Discord webhook (if connected) for lesson completions,
 * track completions, and newly-unlocked achievements — the roadmap's
 * "auto-post lesson completions and achievements to school CS/math clubs."
 *
 * Bounded on purpose: skips entirely when more than 3 lessons complete in
 * one call. A normal save is 0-1 new lessons; a big jump only happens when
 * local progress merges into the cloud on first sign-in (years of history
 * at once), which would otherwise wall-of-text a school's Discord channel
 * with backdated completions nobody wants to see.
 */
export async function notifyDiscordOfNewCompletions(
  supabase: SupabaseClient,
  userId: string,
  diff: { before: string[]; after: string[] },
): Promise<void> {
  const beforeSet = new Set(diff.before);
  const newlyCompleted = diff.after.filter((id) => !beforeSet.has(id));
  if (newlyCompleted.length === 0 || newlyCompleted.length > 3) return;

  const { data } = await supabase
    .from("profiles")
    .select("discord_webhook_url, display_name")
    .eq("id", userId)
    .maybeSingle();

  const webhookUrl = data?.discord_webhook_url;
  if (!webhookUrl) return;

  const name = (data?.display_name as string) || "A student";
  const afterSet = new Set(diff.after);
  const messages: { title: string; description: string; color: number }[] = [];

  for (const lessonId of newlyCompleted) {
    const lesson = getLessonById(lessonId);
    if (!lesson) continue;
    messages.push({
      title: "✅ Lesson complete",
      description: `**${name}** finished *${lesson.title}*`,
      color: DISCORD_COLORS.sky,
    });

    const track = TRACKS.find((t) => t.lessons.some((l) => l.id === lessonId));
    if (track && isTrackComplete(track.id, diff.after) && !isTrackComplete(track.id, diff.before)) {
      messages.push({
        title: "🏆 Track complete!",
        description: `**${name}** finished the whole **${track.title}** track.`,
        color: DISCORD_COLORS.amber,
      });
    }
  }

  for (const a of ACHIEVEMENTS) {
    if (isUnlocked(a, afterSet) && !isUnlocked(a, beforeSet)) {
      messages.push({
        title: `🏅 Achievement unlocked: ${a.name}`,
        description: `**${name}** — ${a.desc}`,
        color: DISCORD_COLORS.amber,
      });
    }
  }

  // Sequential, not Promise.all — a burst of near-simultaneous webhook posts
  // is more likely to hit Discord's per-webhook rate limit than a few in a row.
  for (const m of messages) {
    await postDiscordEmbed(webhookUrl, m);
  }
}
