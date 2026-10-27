import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingSchemaError } from "@/lib/supabase/missingSchema";
import { aiAllowedForUser } from "./classPolicy";

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
} as const;

export type AiFeature = keyof typeof AI_COST;

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
  /**
   * Set when `allowed` is false for a reason other than the daily cap:
   * "class" = the leader turned the tutor off; "unavailable" = the budget
   * couldn't be checked, so no paid call is made.
   */
  reason?: "class" | "unavailable";
}

/** Shown instead of an AI reply when the student's class has the tutor off. */
export const AI_CLASS_OFF_REPLY = "The AI tutor is switched off for your class. Your club leader decides that.";

/** Shown instead of an AI reply when the budget couldn't be checked. */
export const AI_UNAVAILABLE_REPLY =
  "The AI tutor is paused for a moment because we couldn't check today's budget. Try again in a minute; the lesson, the exercise and the solution all still work.";

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
 * Fails CLOSED on an RPC error (build plan T3.8): this is a spend cap on a
 * free product, so "couldn't check" must not mean "unlimited". The student
 * gets AI_UNAVAILABLE_REPLY and everything that isn't AI keeps working. The
 * one exception is a missing function (migration 0008 not applied), which
 * allows, so an unapplied migration doesn't switch the tutor off for everyone.
 */
export async function consumeAiQuota(
  supabase: SupabaseClient,
  userId: string,
  feature: AiFeature,
): Promise<QuotaResult> {
  const cost = AI_COST[feature];

  // A class leader's "tutor off" overrides the budget; checked first so a
  // blocked student doesn't burn any of it.
  if (!(await aiAllowedForUser(supabase))) {
    return { allowed: false, used: 0, limit: DAILY_AI_ACTIONS, reason: "class" };
  }

  const { data, error } = await supabase
    .rpc("consume_ai_quota", { p_user_id: userId, p_cost: cost, p_cap: DAILY_AI_ACTIONS })
    .single();

  if (error && isMissingSchemaError(error)) {
    console.warn("[ai/quota] consume_ai_quota not installed, allowing:", error.message);
    return { allowed: true, used: 0, limit: DAILY_AI_ACTIONS };
  }
  if (error || !data) {
    console.error("[ai/quota] consume_ai_quota failed, refusing:", error?.message);
    return { allowed: false, used: 0, limit: DAILY_AI_ACTIONS, reason: "unavailable" };
  }

  const row = data as { new_count: number; allowed: boolean };
  return { allowed: row.allowed, used: row.new_count, limit: DAILY_AI_ACTIONS };
}
