import Link from "next/link";
import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rowsToRecord, type StudentRecord } from "@/lib/record/rows";
import HandleForm from "../seasons/HandleForm";
import ShareRecord from "./ShareRecord";
import recordStyles from "./record.module.css";

export const metadata = pageMetadata({
  path: "/record",
  title: "Your record",
  description: "Your seasons, challenges solved and capstones — private until you share it.",
});

export const dynamic = "force-dynamic";

async function load(): Promise<{ signedIn: boolean; record: StudentRecord | null; shareToken: string | null }> {
  const supabase = await getSupabaseServer();
  if (!supabase) return { signedIn: false, record: null, shareToken: null };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { signedIn: false, record: null, shareToken: null };
  const [{ data: rows }, { data: profile }] = await Promise.all([
    supabase.rpc("my_record"),
    supabase.from("profiles").select("record_share_token").eq("id", auth.user.id).maybeSingle(),
  ]);
  return {
    signedIn: true,
    record: rowsToRecord((rows ?? []) as Record<string, unknown>[]),
    shareToken: (profile?.record_share_token as string | null) ?? null,
  };
}

export default async function RecordPage() {
  const { signedIn, record, shareToken } = await load();

  if (!signedIn) {
    return (
      <div className={styles.page}>
        <section className={styles.section}>
          <div className={styles.wrap}>
            <p className={styles.kicker}>Your record</p>
            <h1 className={styles.h1}>Sign in to see your record.</h1>
            <p className={styles.lede}>Seasons, challenges solved and capstones — private until you share it.</p>
            <div className={styles.ctaRow}>
              <Link href="/sign-up?next=%2Frecord" className={styles.primary}>Create a free account</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const hasAnything = (record?.seasons.length ?? 0) > 0 || record?.capstoneSubmitted;

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>Your record</p>
          <h1 className={styles.h1}>{record?.handle ? `@${record.handle}` : "Your record"}</h1>
          <p className={styles.lede}>
            Private by default: only you see this page unless you turn on a share link below. A top finish or a
            capstone is marked verified only after a short live defense — that system isn&apos;t built yet, so
            nothing here is verified yet, even if it says submitted.
          </p>
          {!record?.handle && <div style={{ marginTop: "1.5rem" }}><HandleForm /></div>}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="record-seasons">
        <div className={styles.wrap}>
          <h2 id="record-seasons" className={styles.h2}>Seasons</h2>
          {!hasAnything ? (
            <p className={styles.body}>
              Nothing here yet. <Link href="/seasons" className={styles.textLink}>Play this season&apos;s challenges</Link> to
              start building your record.
            </p>
          ) : (
            <>
              {record!.seasons.length > 0 && (
                <table className={recordStyles.table}>
                  <caption className="sl-visually-hidden">Your results by season</caption>
                  <thead>
                    <tr><th scope="col">Season</th><th scope="col">Solved</th><th scope="col">Score</th><th scope="col">Rank</th></tr>
                  </thead>
                  <tbody>
                    {record!.seasons.map((s) => (
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
              {record!.capstoneSubmitted && (
                <p className={recordStyles.capstoneNote}>
                  Capstone submitted{record!.capstoneSubmittedAt ? ` ${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(record!.capstoneSubmittedAt))}` : ""}. Not yet verified.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="record-share">
        <div className={styles.wrap}>
          <h2 id="record-share" className={styles.h2}>Sharing</h2>
          <ShareRecord initialToken={shareToken} />
        </div>
      </section>
    </div>
  );
}
