import styles from "./PageSkeleton.module.css";

/**
 * Shown by a route's loading.tsx while its server data loads, so a click on a
 * slow school network gives instant feedback instead of a page that seems to
 * ignore it. Static shapes (no shimmer) and no <h1>: the real page owns the
 * heading, and a status line tells screen readers what's happening.
 */
export default function PageSkeleton({ label, narrow = false, blocks = 2 }: { label: string; narrow?: boolean; blocks?: number }) {
  return (
    <div className={`${styles.shell} ${narrow ? styles.narrow : ""}`} aria-busy="true">
      <p className={styles.status} role="status">
        {label}
      </p>
      <div className={styles.line} aria-hidden="true" />
      <div className={`${styles.line} ${styles.title}`} aria-hidden="true" />
      {Array.from({ length: blocks }, (_, i) => (
        <div key={i} className={styles.block} aria-hidden="true" />
      ))}
    </div>
  );
}
