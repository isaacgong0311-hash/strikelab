import { COMPARE } from "@/lib/marketing/lab";
import styles from "./compare.module.css";

/** Stock games and finance-literacy courses vs StrikeLab. */
export default function CompareTable() {
  return (
    <div className={styles.scroll} tabIndex={0} role="region" aria-label="Comparison">
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col"><span className="sl-visually-hidden">Question</span></th>
            <th scope="col" className={styles.them}>Stock games and finance-literacy courses</th>
            <th scope="col" className={styles.us}>StrikeLab</th>
          </tr>
        </thead>
        <tbody>
          {COMPARE.map(([q, them, us]) => (
            <tr key={q}>
              <th scope="row">{q}</th>
              <td className={styles.them}>{them}</td>
              <td>{us}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
