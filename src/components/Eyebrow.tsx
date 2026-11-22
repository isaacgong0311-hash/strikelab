import styles from "./Eyebrow.module.css";

/**
 * Small label above a page or section heading ("About", "Pricing", ...).
 * Plain body text on the muted token, which clears WCAG AA on the canvas.
 * Use at most one per page (docs/superpowers/plans/2026-11-21-remodel-v2.md).
 */
export default function Eyebrow({
  children,
  className = "mb-2",
}: {
  children: React.ReactNode;
  /** Spacing override; the default "mb-2" is the most common call-site value. */
  className?: string;
}) {
  return <div className={`${styles.eyebrow} ${className}`.trim()}>{children}</div>;
}
