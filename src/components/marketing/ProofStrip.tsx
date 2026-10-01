import { PROOF, type ProofEntry } from "@/lib/proof/data";
import styles from "./ProofStrip.module.css";

/**
 * Real outcomes with their sources, from src/lib/proof/data.ts. Renders
 * nothing when there are none, so the site never shows a placeholder number.
 */
export default function ProofStrip({ entries = PROOF }: { entries?: ProofEntry[] }) {
  const shown = entries.filter((e) => e.consent);
  if (shown.length === 0) return null;
  return (
    <section className={styles.strip} aria-labelledby="proof-title">
      <h2 id="proof-title" className="sl-visually-hidden">Results from StrikeLab pilots</h2>
      <ul className={styles.list}>
        {shown.map((e) => (
          <li key={e.id} className={styles.item}>
            <p className={styles.value}>{e.value}</p>
            <p className={styles.label}>{e.label}</p>
            <p className={styles.source}>
              {e.sourceLabel}, as of {e.asOf}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
