import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { isFounder } from "@/lib/admin/founder";
import { loadSeasonOps } from "@/lib/admin/loadSeasonOps";
import { getTemplate } from "@/lib/seasons/templates";
import { privatePageMetadata } from "@/lib/seo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import styles from "./seasonsAdmin.module.css";

export const metadata = privatePageMetadata({
  title: "Season operations",
  description: "Founder-only season scoring and review queue.",
});

interface SeasonChoice { id: string; title: string }

function dateTime(value: string | null): string {
  if (!value) return "Not submitted";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
  }).format(new Date(value)) + " UTC";
}

export default async function AdminSeasonsPage({ searchParams }: { searchParams: Promise<{ season?: string | string[] }> }) {
  await connection();
  const supabase = await getSupabaseServer();
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!isFounder(auth.user?.id)) notFound();
  const admin = getSupabaseAdmin();
  if (!admin) return <main className={styles.shell}><h1>Season operations</h1><p>Service-role access is not configured on this server.</p></main>;

  const { data: seasons, error: seasonsError } = await admin
    .from("seasons")
    .select("id, title")
    .order("starts_on", { ascending: false });
  if (seasonsError) return <main className={styles.shell}><h1>Season operations</h1><p>Could not load the seasons right now.</p></main>;
  const choices = (seasons ?? []) as SeasonChoice[];
  const { season: requested } = await searchParams;
  const selected = choices.find((choice) => choice.id === requested) ?? choices[0] ?? null;
  let ops: Awaited<ReturnType<typeof loadSeasonOps>> | null = null;
  let readError = false;
  if (selected) {
    try {
      ops = await loadSeasonOps(admin, selected.id);
    } catch (error) {
      console.error("[admin/seasons]", error);
      readError = true;
    }
  }

  return (
    <main className={styles.shell}>
      <p className={styles.kicker}>Founder only</p>
      <h1>Season operations</h1>
      <p className={styles.intro}>Read-only status for official scoring and manual reviews.</p>

      {choices.length > 1 && (
        <form method="get" action="/admin/seasons" className={styles.picker}>
          <label htmlFor="season-choice">Season</label>
          <select id="season-choice" name="season" defaultValue={selected?.id}>
            {choices.map((choice) => <option key={choice.id} value={choice.id}>{choice.title}</option>)}
          </select>
          <button type="submit">Show season</button>
        </form>
      )}

      {!selected && <p>No seasons have been scheduled yet.</p>}
      {readError && <p role="alert">Could not load attempt counts or reviews right now.</p>}
      {selected && ops && (
        <>
          <h2>{selected.title}</h2>
          {ops.challenges.length === 0 ? <p>No challenges are scheduled for this season.</p> : (
            <div>
              <p className={styles.scrollHint}>Scroll the table sideways to see every status.</p>
              <div className={styles.scroll}>
                <table className={styles.table}>
                  <caption>Attempts by status per challenge</caption>
                  <thead><tr><th scope="col">Challenge</th><th scope="col">Started</th><th scope="col">Submitted</th><th scope="col">Scored</th><th scope="col">Pending review</th></tr></thead>
                  <tbody>
                    {ops.challenges.map((challenge) => (
                      <tr key={challenge.id}>
                        <th scope="row">Week {challenge.week}: {getTemplate(challenge.templateSlug)?.title ?? challenge.id}</th>
                        <td>{challenge.counts.started}</td><td>{challenge.counts.submitted}</td>
                        <td>{challenge.counts.scored}</td><td>{challenge.counts.pending_review}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <section aria-labelledby="pending-reviews" className={styles.section}>
            <h2 id="pending-reviews">Pending reviews</h2>
            {ops.pending.length === 0 ? <p>No attempts need review.</p> : (
              <ul className={styles.reviews}>
                {ops.pending.map((row) => (
                  <li key={`${row.userId}-${row.challengeId}`}>
                    <strong>{row.handle}</strong> · {row.challengeId} · submitted {dateTime(row.submittedAt)}{" "}
                    <Link href={`/admin/seasons/review/${encodeURIComponent(row.challengeId)}/${row.userId}`}>View code and explanation</Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <section aria-labelledby="scoring-run" className={styles.section}>
        <h2 id="scoring-run">Run the scorer</h2>
        <p>Last scoring run: <strong>Not recorded</strong>. The current script writes attempt results but has no run log.</p>
        <p>After a challenge closes, run a dry run, inspect the output, then apply:</p>
        <pre><code>npm run season:score{"\n"}npm run season:score -- --apply</code></pre>
        <p>Timed-out or broken official tests enter the pending-review queue. This page does not run or change scores.</p>
      </section>
    </main>
  );
}
