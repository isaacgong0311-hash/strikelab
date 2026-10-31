import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSharedRecord } from "@/lib/record/getSharedRecord";
import styles from "./shared-record.module.css";

export const metadata: Metadata = {
  title: "Shared record",
  description: "Verified work from a StrikeLab student.",
  robots: { index: false, follow: false },
};

function date(value: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

export default async function SharedRecordPage({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  const record = await getSharedRecord(token);
  if (!record) notFound();

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.kicker}>StrikeLab · Verified record</p>
        <h1><span className={styles.at}>@</span>{record.handle}</h1>
        <p>A public snapshot of work verified by StrikeLab. This link was shared by the student and can be revoked at any time.</p>
        <div className={styles.metrics}>
          <div><strong>{record.bestPlacing === null ? "—" : `#${record.bestPlacing}`}</strong><span>Best verified placing</span></div>
          <div><strong>{record.verifiedCount}</strong><span>Verified {record.verifiedCount === 1 ? "item" : "items"}</span></div>
        </div>
      </header>

      <div className={styles.sections}>
        <section aria-labelledby="shared-placings" className={styles.section}>
          <div className={styles.sectionHeading}><p className={styles.kicker}>Compete</p><h2 id="shared-placings">Season placings</h2></div>
          {record.placings.length === 0 ? <p className={styles.empty}>No verified season placings on this record yet.</p> : (
            <ol className={styles.list}>{record.placings.map((placing, index) => (
              <li key={`${placing.rank}-${placing.verifiedAt}-${index}`}><span className={styles.rank}>#{placing.rank}</span><span><strong>Verified placing</strong><small>Verified {date(placing.verifiedAt)}</small></span></li>
            ))}</ol>
          )}
        </section>
        <section aria-labelledby="shared-capstones" className={styles.section}>
          <div className={styles.sectionHeading}><p className={styles.kicker}>Prove</p><h2 id="shared-capstones">Capstones</h2></div>
          {record.capstones.length === 0 ? <p className={styles.empty}>No verified capstones on this record yet.</p> : (
            <ul className={styles.list}>{record.capstones.map((capstone, index) => (
              <li key={`${capstone.verifiedAt}-${index}`}><span className={styles.check} aria-hidden="true">✓</span><span><strong>Verified capstone</strong><small>Verified in a live conversation · {date(capstone.verifiedAt)}</small></span></li>
            ))}</ul>
          )}
        </section>
      </div>
      <footer className={styles.footer}><span>Train → Compete → Prove → Record</span><Link href="/">Explore StrikeLab →</Link></footer>
    </main>
  );
}
