import { notFound } from "next/navigation";
import { connection } from "next/server";
import { isFounder } from "@/lib/admin/founder";
import { loadVerificationQueue } from "@/lib/admin/loadVerificationQueue";
import { privatePageMetadata } from "@/lib/seo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import VerifyForm from "./VerifyForm";
import styles from "./verify.module.css";

export const metadata = privatePageMetadata({
  title: "Verify student work",
  description: "Founder-only capstone and placing defense sign-off.",
});

function date(value: string | null | undefined): string {
  if (!value) return "Date not recorded";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

export default async function VerifyPage() {
  await connection();
  const supabase = await getSupabaseServer();
  if (!supabase) notFound();
  const { data: auth } = await supabase.auth.getUser();
  if (!isFounder(auth.user?.id)) notFound();
  const admin = getSupabaseAdmin();
  if (!admin) return <main className={styles.page}><h1>Verify student work</h1><p>Service-role access is not configured on this server.</p></main>;
  let queue: Awaited<ReturnType<typeof loadVerificationQueue>>;
  try {
    queue = await loadVerificationQueue(admin, supabase);
  } catch (error) {
    console.error("[admin/verify]", error);
    return <main className={styles.page}><h1>Verify student work</h1><p role="alert">Could not load the verification queue right now.</p></main>;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Founder only · Prove</p>
        <h1>Verify student work</h1>
        <p>Review the submitted work and live defense before signing off. The consent checkbox records that a parent has approved this call.</p>
        <div className={styles.counts}><span><strong>{queue.capstones.length}</strong> {queue.capstones.length === 1 ? "capstone" : "capstones"} awaiting review</span><span><strong>{queue.placings.length}</strong> final {queue.placings.length === 1 ? "placing" : "placings"} awaiting review</span></div>
      </header>

      <section className={styles.section} aria-labelledby="verify-capstones">
        <div className={styles.sectionHead}><div><p className={styles.kicker}>Defended projects</p><h2 id="verify-capstones">Submitted capstones</h2></div><span>{queue.capstones.length} pending</span></div>
        {queue.capstones.length === 0 ? <p className={styles.empty}>No submitted capstones need verification.</p> : (
          <ul className={styles.cards}>{queue.capstones.map((item) => (
            <li className={styles.card} key={item.subjectId}>
              <div className={styles.cardHead}><div><p className={styles.handle}>@{item.handle}</p><h3>{item.title}</h3><p>Submitted {date(item.submittedAt)}</p></div><span className={styles.badge}>Capstone</span></div>
              <details className={styles.details}><summary>Review submitted work</summary>
                <h4>Thesis</h4><p>{item.thesis || "Not provided"}</p>
                <h4>Result summary</h4><p>{item.resultSummary || "Not provided"}</p>
                <h4>Code</h4><pre><code>{item.code || "Not provided"}</code></pre>
                <h4>Reflection</h4><p>{item.reflection || "Not provided"}</p>
              </details>
              <VerifyForm kind="capstone" userId={item.userId} subjectId={item.subjectId} />
            </li>
          ))}</ul>
        )}
      </section>

      <section className={styles.section} aria-labelledby="verify-placings">
        <div className={styles.sectionHead}><div><p className={styles.kicker}>Final board</p><h2 id="verify-placings">Top-10 placings</h2></div><span>{queue.placings.length} pending</span></div>
        {queue.placings.length === 0 ? <p className={styles.empty}>No final top-10 placings need verification.</p> : (
          <ul className={styles.cards}>{queue.placings.map((item) => (
            <li className={styles.card} key={`${item.userId}-${item.subjectId}`}>
              <div className={styles.cardHead}><div><p className={styles.handle}>@{item.handle}</p><h3>{item.title}</h3><p>Final rank #{item.rank}. Sign off only after the live defense.</p></div><span className={styles.badge}>Placing</span></div>
              <VerifyForm kind="placing" userId={item.userId} subjectId={item.subjectId} />
            </li>
          ))}</ul>
        )}
      </section>
    </main>
  );
}
