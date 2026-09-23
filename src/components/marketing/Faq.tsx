import type { ReactNode } from "react";
import styles from "./marketing.module.css";

/** Native disclosure FAQ: works without JavaScript, keyboard operable. */
export default function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <div className={styles.faq}>
      {items.map((item) => (
        <details key={item.q}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
