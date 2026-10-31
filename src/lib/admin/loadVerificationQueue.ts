import type { SupabaseClient } from "@supabase/supabase-js";
import { buildVerificationQueue, type BoardCandidateRow, type CapstoneCandidateRow, type ProfileCandidateRow, type SeasonCandidateRow, type VerificationCandidateRow } from "./verificationQueue";

/** Call only after isFounder has passed; this client bypasses RLS. */
export async function loadVerificationQueue(admin: SupabaseClient, boardClient: SupabaseClient) {
  const [capstoneResult, seasonResult] = await Promise.all([
    admin.from("capstone_submissions")
      .select("id, user_id, title, status, submitted_at, thesis, code, result_summary, reflection")
      .eq("status", "submitted").order("submitted_at", { ascending: true }),
    admin.from("seasons").select("id, title, ends_on").order("ends_on", { ascending: false }),
  ]);
  if (capstoneResult.error) throw capstoneResult.error;
  if (seasonResult.error) throw seasonResult.error;
  const capstones = (capstoneResult.data ?? []) as CapstoneCandidateRow[];
  const seasons = (seasonResult.data ?? []) as SeasonCandidateRow[];
  const today = new Date().toISOString().slice(0, 10);
  const finished = seasons.filter((season) => season.ends_on < today);
  const boardResults = await Promise.all(finished.map((season) =>
    boardClient.rpc("season_leaderboard", { p_season_id: season.id, p_class_id: null })
  ));
  const boardError = boardResults.find((result) => result.error)?.error;
  if (boardError) throw boardError;
  const boards: Record<string, BoardCandidateRow[]> = Object.fromEntries(finished.map((season, index) =>
    [season.id, (boardResults[index].data ?? []) as BoardCandidateRow[]]
  ));
  const boardHandles = [...new Set(Object.values(boards).flat().filter((row) => row.rank <= 10).map((row) => row.handle))];
  const capstoneUserIds = [...new Set(capstones.map((row) => row.user_id))];
  const [byId, byHandle] = await Promise.all([
    capstoneUserIds.length ? admin.from("profiles").select("id, handle").in("id", capstoneUserIds) : Promise.resolve({ data: [], error: null }),
    boardHandles.length ? admin.from("profiles").select("id, handle").in("handle", boardHandles) : Promise.resolve({ data: [], error: null }),
  ]);
  if (byId.error) throw byId.error;
  if (byHandle.error) throw byHandle.error;
  const profiles = [...new Map([...(byId.data ?? []), ...(byHandle.data ?? [])]
    .map((row) => [row.id as string, row as ProfileCandidateRow])).values()];
  const userIds = profiles.map((row) => row.id);
  const verificationResult = userIds.length
    ? await admin.from("verifications").select("user_id, kind, subject_id").in("user_id", userIds)
    : { data: [], error: null };
  if (verificationResult.error) throw verificationResult.error;
  return buildVerificationQueue(today, capstones, seasons, boards, profiles,
    (verificationResult.data ?? []) as VerificationCandidateRow[]);
}
