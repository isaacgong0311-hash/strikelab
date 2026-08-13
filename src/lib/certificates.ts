import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TRACKS } from "@/lib/tracks";

export interface Certificate {
  id: string;
  trackId: string;
  trackTitle: string;
  displayName: string;
  issuedAt: string;
}

/** Whether every lesson in a track is present in the caller's completed set. */
export function isTrackComplete(trackId: string, completed: string[]): boolean {
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track || track.lessons.length === 0) return false;
  const completedSet = new Set(completed);
  return track.lessons.every((l) => completedSet.has(l.id));
}

/**
 * Public read by id — safe fields only (no user_id/email). Used by the
 * public /certificate/[id] page and its opengraph-image route, both
 * unauthenticated by design. Goes through the service-role admin client
 * since the certificates table has no RLS policy for the anon/authenticated
 * role (see supabase/migrations/0005_certificates.sql).
 */
export async function getCertificateById(id: string): Promise<Certificate | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data, error } = await admin
    .from("certificates")
    .select("id, track_id, display_name, issued_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const track = TRACKS.find((t) => t.id === data.track_id);
  return {
    id: data.id,
    trackId: data.track_id,
    trackTitle: track?.title ?? data.track_id,
    displayName: data.display_name,
    issuedAt: data.issued_at,
  };
}
