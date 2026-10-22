import Link from "next/link";
import { placingLabel, readableDate, type StudentRecord } from "@/lib/records/record";
import styles from "./record.module.css";

/**
 * One student's record, for the owner (/record) or anyone they shared it
 * with (/record/[token]). Handles only, never names; official scores only.
 */
export default function RecordView({ record, viewer }: { record: StudentRecord; viewer: "owner" | "public" }) {
  const empty = record.seasons.length === 0 && !record.verifiedCapstone;
  return (
    <article className={styles.article} aria-labelledby="record-title">
      <p className={styles.kicker}>StrikeLab record</p>
      <h1 id="record-title" className={styles.title}>{record.handle ?? "Your record"}</h1>
      <p className={styles.lede}>
        Timed challenges with numbers unique to this student, scored on StrikeLab&apos;s server. Anything marked
        verified was defended in a live conversation with a reviewer.
      </p>

      {empty && (
        <p className={styles.empty}>
          {viewer === "owner"
            ? "Nothing here yet. Play a season challenge and your official scores will appear after grading."
            : "This record doesn't have any results yet."}
        </p>
      )}

      {record.verifiedCapstone && (
        <section className={styles.card} aria-labelledby="record-capstone">
          <p className={styles.badge}>Verified</p>
          <h2 id="record-capstone">Capstone{record.verifiedCapstone.title ? `: ${record.verifiedCapstone.title}` : ""}</h2>
          <p>
            Defended live on {readableDate(record.verifiedCapstone.defendedOn)}, reviewed by{" "}
            {record.verifiedCapstone.reviewer}.
          </p>
          {viewer === "owner" && record.verifiedCapstone.shareToken && (
            <p><Link href={`/capstone/${record.verifiedCapstone.shareToken}`}>Open your shared capstone</Link></p>
          )}
        </section>
      )}

      {record.seasons.map((s) => (
        <section key={s.seasonId} className={styles.card} aria-labelledby={`season-${s.seasonId}`}>
          {s.topTen && s.placingVerified && <p className={styles.badge}>Verified placing</p>}
          <h2 id={`season-${s.seasonId}`}>{s.title}</h2>
          <p className={styles.placing}>{placingLabel(s, viewer)}</p>
          <p>
            Official score {s.totalScore.toFixed(1)} across {s.solved} {s.solved === 1 ? "challenge" : "challenges"}.
          </p>
          <table className={styles.table}>
            <caption className="sl-visually-hidden">Official scores in {s.title}</caption>
            <thead><tr><th scope="col">Week</th><th scope="col">Challenge</th><th scope="col">Official score</th></tr></thead>
            <tbody>
              {s.challenges.map((c) => (
                <tr key={c.week}><td>{c.week}</td><td>{c.title}</td><td>{c.officialScore.toFixed(1)} / 80</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <p className={styles.note}>
        Scores out of 80 are automatic (70 for correctness, 10 for speed). A further 20 points for the written
        explanation are added by a person and are not shown here yet.
      </p>
    </article>
  );
}
