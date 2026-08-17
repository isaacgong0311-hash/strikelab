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
  sandboxTradeIdea: 2,
} as const;

export type AiFeature = keyof typeof AI_COST;

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
}

/**
 * Checks and increments today's AI budget for a user, atomically, via the
 * consume_ai_quota() Postgres function (supabase/migrations/
 * 0008_separate_ai_quota_from_hints.sql). That function is also what keeps
 * this budget in its own public.ai_usage table instead of accidentally
 * sharing storage with the separate hint cap (see that migration's header
 * comment for the full writeup) — the check-and-increment happens in one
 * statement, so two concurrent requests can't both read the same
 * pre-increment count and both get allowed through.
 *
 * Fails OPEN on an RPC error — a transient Supabase hiccup shouldn't block
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

  const { data, error } = await supabase
    .rpc("consume_ai_quota", { p_user_id: userId, p_cost: cost, p_cap: DAILY_AI_ACTIONS })
    .single();

  if (error || !data) {
    console.error("[ai/quota] consume_ai_quota failed:", error?.message);
    return { allowed: true, used: 0, limit: DAILY_AI_ACTIONS };
  }

  const row = data as { new_count: number; allowed: boolean };
  return { allowed: row.allowed, used: row.new_count, limit: DAILY_AI_ACTIONS };
}
