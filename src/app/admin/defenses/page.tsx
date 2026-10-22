import { notFound } from "next/navigation";
import { connection } from "next/server";
import { isFounder } from "@/lib/admin/founder";
import { privatePageMetadata } from "@/lib/seo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import styles from "../metrics/metrics.module.css";
import DefenseForm from "./DefenseForm";

export const metadata = privatePageMetadata({
  title: "Defense sign-off",
  description: "Record live defenses of capstones and top-10 placings.",
});

interface SeasonRow { id: string; title: string; is_rehearsal: boolean }
interface BoardRow { rank: number; handle: string; total_score: number }
interface DefenseRow { user_id: string; kind: string; season_id: string | null; outcome: string; defended_on: string; reviewer_label: string }

/**
 * Founder-only (proving-ground spec §3): who needs a defense, a form to record
 * one, and the recent sign-offs. Anyone not in FOUNDER_USER_IDS gets a 404.
 */
export default async function DefensesPage() {
  await connection();
  const supabase = await getSupabaseServer();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!isFounder(data.user?.id)) notFound();

  const admin = getSupabaseAdmin();
  if (!admin) {
    return (
      <div className={styles.shell}>
        <h1 className={styles.title}>Defense sign-off</h1>
        <p className={styles.muted}>The server has no service-role key, so it can&apos;t record defenses.</p>
      </div>
    );
  }

  const { data: seasonData } = await admin.from("seasons").select("id, title, is_rehearsal").order("starts_on", { ascending: false });
  const seasons = (seasonData ?? []) as SeasonRow[];
  const { data: defenseData } = await admin
    .from("defenses")
    .select("user_id, kind, season_id, outcome, defended_on, reviewer_label")
    .order("created_at", { ascending: false })
    .limit(100);
  const defenses = (defenseData ?? []) as DefenseRow[];
  const ids = [...new Set(defenses.map((d) => d.user_id))];
  const { data: profileData } = ids.length
    ? await admin.from("profiles").select("id, handle").in("id", ids)
    : { data: [] as Array<{ id: string; handle: string | null }> };
  const handleOf = new Map((profileData ?? []).map((p) => [p.id as string, (p.handle as string | null) ?? "(no handle)"]));
  const verifiedPlacing = new Set(
    defenses.filter((d) => d.kind === "placing" && d.outcome === "verified").map((d) => `${d.season_id}:${handleOf.get(d.user_id)}`)
  );

  const pending: Array<{ season: SeasonRow; row: BoardRow }> = [];
  for (const season of seasons) {
    const { data: board } = await admin.rpc("season_leaderboard", { p_season_id: season.id, p_class_id: null });
    for (const row of ((board ?? []) as BoardRow[]).filter((r) => r.rank <= 10)) {
      if (!verifiedPlacing.has(`${season.id}:${row.handle}`)) pending.push({ season, row });
    }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.kicker}>Founder only</p>
        <h1 className={styles.title}>Defense sign-off</h1>
        <p className={styles.muted}>
          A top-10 placing or a capstone appears as verified on a student&apos;s record only after a short live defense.
          Before any call with a minor, record a parent&apos;s consent; never hold the call one-on-one in private (two
          adults present, or recorded with consent).
        </p>
      </header>

      <section aria-labelledby="pending-title">
        <h2 id="pending-title" className={styles.h2}>Top-10 placings waiting for a defense</h2>
        {pending.length === 0 ? (
          <p className={styles.muted}>None right now.</p>
        ) : (
          <div className={styles.tableWrap}><table className={styles.table}>
            <caption className="sl-visually-hidden">Top-10 placings without a verified defense</caption>
            <thead><tr><th scope="col">Season</th><th scope="col">Rank</th><th scope="col">Handle</th><th scope="col">Score</th></tr></thead>
            <tbody>
              {pending.map(({ season, row }) => (
                <tr key={`${season.id}-${row.handle}`}>
                  <td>{season.title}{season.is_rehearsal ? " (rehearsal)" : ""}</td>
                  <td>{row.rank}</td>
                  <td>{row.handle}</td>
                  <td>{Number(row.total_score).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </section>

      <section aria-labelledby="record-title">
        <h2 id="record-title" className={styles.h2}>Record a defense</h2>
        <DefenseForm seasons={seasons.map((s) => ({ id: s.id, title: s.is_rehearsal ? `${s.title} (rehearsal)` : s.title }))} />
      </section>

      <section aria-labelledby="recent-title">
        <h2 id="recent-title" className={styles.h2}>Recent sign-offs</h2>
        {defenses.length === 0 ? (
          <p className={styles.muted}>No defenses recorded yet.</p>
        ) : (
          <div className={styles.tableWrap}><table className={styles.table}>
            <caption className="sl-visually-hidden">Recent defense sign-offs</caption>
            <thead><tr><th scope="col">Date</th><th scope="col">Handle</th><th scope="col">What</th><th scope="col">Outcome</th><th scope="col">Reviewer</th></tr></thead>
            <tbody>
              {defenses.map((d, i) => (
                <tr key={i}>
                  <td>{d.defended_on}</td>
                  <td>{handleOf.get(d.user_id)}</td>
                  <td>{d.kind === "placing" ? `Placing, ${d.season_id}` : "Capstone"}</td>
                  <td>{d.outcome === "verified" ? "Verified" : "Not verified"}</td>
                  <td>{d.reviewer_label}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </section>
    </div>
  );
}
