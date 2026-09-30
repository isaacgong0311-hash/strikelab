import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { privatePageMetadata } from "@/lib/seo";
import { loadTeacherClasses } from "@/lib/teach/loadTeacherClasses";
import { buildTeacherClassCard } from "@/lib/teach/classCard";
import styles from "./teach.module.css";

export const metadata = privatePageMetadata({
  title: "My classes",
  description: "Your StrikeLab classes: where each one is in the six weeks and what to do next.",
});

export default async function TeachPage() {
  // Per-request: depends on the signed-in user and today's date, even on a build without Supabase env.
  await connection();
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return (
      <div className={styles.shell}>
        <h1 className={styles.title}>Classes aren&apos;t available here</h1>
        <p className={styles.muted}>This copy of StrikeLab isn&apos;t connected to a database.</p>
      </div>
    );
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?next=${encodeURIComponent("/teach")}`);

  const classes = await loadTeacherClasses(supabase, auth.user.id);
  const cards = (classes ?? []).map((c) => buildTeacherClassCard(c));

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.kicker}>For leaders</p>
          <h1 className={styles.title}>My classes</h1>
        </div>
        {cards.length > 0 && <Link href="/teach/new" className={styles.primary}>Set up a new class</Link>}
      </header>

      {classes === null ? (
        <p className={styles.error} role="alert">Your classes couldn&apos;t be loaded. Refresh to try again.</p>
      ) : cards.length === 0 ? (
        <section className={styles.empty} aria-labelledby="empty-title">
          <h2 id="empty-title" className={styles.sectionTitle}>Run the six-week lab with your club</h2>
          <ol className={styles.steps}>
            <li>Name your class and pick your first meeting date.</li>
            <li>Share one invite link, or print a join card with a QR code.</li>
            <li>Each week you get a meeting plan, a message to send, and a scorecard.</li>
          </ol>
          <div className={styles.actions}>
            <Link href="/teach/new" className={styles.primary}>Set up your class</Link>
            <Link href="/demo" className={styles.textButton}>See the demo first</Link>
          </div>
        </section>
      ) : (
        <ul className={styles.grid}>
          {cards.map((card) => (
            <li key={card.id} className={styles.card} data-state={card.state}>
              <div className={styles.cardHead}>
                <h2 className={styles.cardTitle}>
                  <Link href={`/dashboard/class/${card.id}`}>{card.name}</Link>
                </h2>
                <p className={styles.status}>{card.status}</p>
              </div>
              <dl className={styles.stats}>
                {card.stats.map((s) => (
                  <div key={s.label} className={styles.stat}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
              <div className={styles.cardActions}>
                <Link href={card.next.href} className={styles.primary}>{card.next.label}</Link>
                {card.secondary && (
                  <Link href={card.secondary.href} className={styles.secondary}>{card.secondary.label}</Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className={styles.muted}>
        Taking a class instead? Open the invite link your teacher sent, or enter the code in{" "}
        <Link href="/settings#classroom">Settings</Link>.
      </p>
    </div>
  );
}
