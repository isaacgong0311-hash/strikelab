import type { HTMLAttributes } from "react";
import styles from "./ui.module.css";

export function Card({ padded = true, className, ...props }: HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return <div className={`${styles.surface} ${padded ? styles.surfacePadding : ""} ${className ?? ""}`} {...props} />;
}

export function PageHeader({ eyebrow, title, description, className }: { eyebrow?: string; title: string; description?: string; className?: string }) {
  return (
    <header className={`${styles.pageHeader} ${className ?? ""}`}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`${styles.badge} ${className ?? ""}`} {...props} />;
}
