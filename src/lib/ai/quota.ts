import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Daily AI budget, shared across every AI surface (tutor chat, code review,
 * explain-this, practice generation).
 *
 * This is a spend cap, not a product limit. Groq bills per token and StrikeLab
 * is free to students, so an unbounded endpoint is an unbounded bill. The cap
 * is per signed-in user per day; anonymous visitors never reach a paid call at
 * all (see requireUser in each route) and get canned fallbacks instead.
 *
 * Sizing: at ~500 output tokens per action, 25 actions/day/user is roughly
 * 12.5k tokens/user/day. Raise DAILY_AI_ACTIONS only with the bill in mind —
 * it multiplies by your whole active user base.
 */
export const DAILY_AI_ACTIONS = 25;

/** Relative cost of each surface, in "actions". Longer outputs cost more. */
export const AI_COST = {
  chat: 1,
  explain: 1,
  review: 2,
  practice: 2,
  sandboxInsight: 1,
} as const;

export type AiFeature = keyof typeof AI_COST;

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
}

/**
 * Checks and increments today's AI budget for a user.
 *
 * Fails OPEN on a database error — a transient Supabase hiccup shouldn't block
 * a student mid-lesson. The tradeoff is that a sustained DB outage also
 * disables the cap; that's deliberate, since the outage itself is the louder
 * problem and Groq spend is bounded by traffic in the meantime.
 */
export async function consumeAiQuota(
  supabase: SupabaseClient,
  userId: string,
  feature: AiFeature,
): Promise<QuotaResult> {
  const cost = AI_COST[feature];
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("hint_usage")
    .select("day, count")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[ai/quota] read failed:", error.message);
    return { allowed: true, used: 0, limit: DAILY_AI_ACTIONS };
  }

  const isNewDay = !data || data.day !== today;
  const used = isNewDay ? 0 : data.count;

  if (used + cost > DAILY_AI_ACTIONS) {
    return { allowed: false, used, limit: DAILY_AI_ACTIONS };
  }

  const nextCount = used + cost;
  const { error: writeError } = await supabase
    .from("hint_usage")
    .upsert({ user_id: userId, day: today, count: nextCount }, { onConflict: "user_id" });

  if (writeError) console.error("[ai/quota] write failed:", writeError.message);

  return { allowed: true, used: nextCount, limit: DAILY_AI_ACTIONS };
}
