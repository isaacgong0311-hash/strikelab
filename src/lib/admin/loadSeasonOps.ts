import type { SupabaseClient } from "@supabase/supabase-js";

const STATUSES = ["started", "submitted", "scored", "pending_review"] as const;
type Status = typeof STATUSES[number];

export interface ChallengeOps {
  id: string;
  week: number;
  templateSlug: string;
  counts: Record<Status, number>;
}

export interface PendingReview {
  userId: string;
  challengeId: string;
  handle: string;
  submittedAt: string | null;
}

/** Call only after isFounder has passed; this client bypasses RLS. */
export async function loadSeasonOps(admin: SupabaseClient, seasonId: string): Promise<{
  challenges: ChallengeOps[];
  pending: PendingReview[];
}> {
  const { data: rawChallenges, error: challengesError } = await admin
    .from("season_challenges")
    .select("id, week, template_slug")
    .eq("season_id", seasonId)
    .order("week");
  if (challengesError) throw challengesError;
  const slots = rawChallenges ?? [];
  if (slots.length === 0) return { challenges: [], pending: [] };

  const challenges = await Promise.all(slots.map(async (slot) => {
    const results = await Promise.all(STATUSES.map((status) =>
      admin.from("season_attempts")
        .select("challenge_id", { count: "exact", head: true })
        .eq("challenge_id", slot.id)
        .eq("status", status)
    ));
    const failure = results.find((result) => result.error)?.error;
    if (failure) throw failure;
    return {
      id: slot.id as string,
      week: slot.week as number,
      templateSlug: slot.template_slug as string,
      counts: Object.fromEntries(STATUSES.map((status, index) => [status, results[index].count ?? 0])) as Record<Status, number>,
    };
  }));

  const ids = slots.map((slot) => slot.id as string);
  const { data: pendingRows, error: pendingError } = await admin
    .from("season_attempts")
    .select("user_id, challenge_id, submitted_at")
    .eq("status", "pending_review")
    .in("challenge_id", ids)
    .order("submitted_at", { ascending: true });
  if (pendingError) throw pendingError;
  const userIds = [...new Set((pendingRows ?? []).map((row) => row.user_id as string))];
  const { data: profiles, error: profilesError } = userIds.length > 0
    ? await admin.from("profiles").select("id, handle").in("id", userIds)
    : { data: [], error: null };
  if (profilesError) throw profilesError;
  const handles = new Map((profiles ?? []).map((profile) => [profile.id as string, profile.handle as string | null]));
  return {
    challenges,
    pending: (pendingRows ?? []).map((row) => ({
      userId: row.user_id as string,
      challengeId: row.challenge_id as string,
      handle: handles.get(row.user_id as string) ?? "No handle",
      submittedAt: row.submitted_at as string | null,
    })),
  };
}
