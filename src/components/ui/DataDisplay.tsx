import type { HTMLAttributes, TableHTMLAttributes } from "react";
import styles from "./ui.module.css";

export function Progress({ value, label, color }: { value: number; label: string; color?: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safe} aria-valuetext={`${safe}%`} className={styles.progress}>
      <div className={styles.progressFill} style={{ width: `${safe}%`, background: color }} />
    </div>
  );
}

export function Skeleton({ label = "Loading", className, ...props }: HTMLAttributes<HTMLDivElement> & { label?: string }) {
  return <div className={`${styles.skeleton} ${className ?? ""}`} role="status" aria-label={label} {...props} />;
}

export function StateMessage({ title, children, className }: { title: string; children?: React.ReactNode; className?: string }) {
  return <div className={`${styles.state} ${className ?? ""}`}><h2>{title}</h2>{children}</div>;
}

export function ResponsiveTable({ caption, className, ...props }: TableHTMLAttributes<HTMLTableElement> & { caption: string }) {
  return <div className={styles.tableWrap}><table className={`${styles.table} ${className ?? ""}`} {...props}><caption className="sl-visually-hidden">{caption}</caption>{props.children}</table></div>;
}

export function ChartSummary({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${styles.chartSummary} ${className ?? ""}`} {...props}>{children}</div>;
}
