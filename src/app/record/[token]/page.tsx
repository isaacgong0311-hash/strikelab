import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { privatePageMetadata } from "@/lib/seo";
import { rowsToRecord } from "@/lib/record/rows";
import recordStyles from "../record.module.css";
import styles from "@/components/marketing/marketing.module.css";

// Unlisted: reachable only by its link, never indexed.
export const metadata = privatePageMetadata({
  title: "Student record",
  description: "A StrikeLab student's seasons and capstone status.",
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SharedRecordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!UUID.test(token)) notFound();
  const supabase = await getSupabaseServer();
  if (!supabase) notFound();

  // Returns the work only (no real name), and nothing once sharing is off.
  const { data } = await supabase.rpc("get_shared_record", { p_token: token });
  const rows = (data ?? []) as Record<string, unknown>[];
  if (rows.length === 0) notFound();
  const record = rowsToRecord(rows);

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>StrikeLab record</p>
          <h1 className={styles.h1}>{record.handle ? `@${record.handle}` : "A StrikeLab student"}</h1>
          <p className={styles.lede}>
            A top finish or a capstone is marked verified only after a short live defense — that system isn&apos;t
            built yet, so nothing below is verified, even if it says submitted.
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.wrap}>
          {record.seasons.length === 0 && !record.capstoneSubmitted ? (
            <p className={styles.body}>Nothing shared yet.</p>
          ) : (
            <>
              {record.seasons.length > 0 && (
                <table className={recordStyles.table}>
                  <caption className="sl-visually-hidden">Season results</caption>
                  <thead>
                    <tr><th scope="col">Season</th><th scope="col">Solved</th><th scope="col">Score</th><th scope="col">Rank</th></tr>
                  </thead>
                  <tbody>
                    {record.seasons.map((s) => (
                      <tr key={s.seasonId}>
                        <td>{s.seasonTitle}</td>
                        <td>{s.solved}</td>
                        <td>{s.totalScore != null ? Number(s.totalScore).toFixed(0) : "—"}</td>
                        <td>{s.rank ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {record.capstoneSubmitted && (
                <p className={recordStyles.capstoneNote}>
                  Capstone submitted{record.capstoneSubmittedAt ? ` ${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(record.capstoneSubmittedAt))}` : ""}. Not yet verified.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      <p className={recordStyles.footer}>
        Built in the Quant Foundations Lab on <Link href="/">StrikeLab</Link>, where students prove they can do real
        quant work.
      </p>
    </div>
  );
}
