import Link from "next/link";
import type { ReactNode } from "react";
import BrandMark from "@/components/BrandMark";
import styles from "./workspace.module.css";

/** The slim top bar on focused season pages (a timed challenge, the practice round), in place of the site header. */
export default function FocusBar({
  label,
  backHref,
  backLabel,
  backHint,
  children,
}: {
  label: string;
  backHref: string;
  backLabel: string;
  /** Extra context for screen readers that the short visible label leaves out. */
  backHint?: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.bar}>
      <Link href="/" className={styles.brand} aria-label="StrikeLab home">
        <BrandMark size={22} />
        <span className={styles.brandText}>StrikeLab</span>
      </Link>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.barRight}>
        {children}
        <Link href={backHref} className={styles.leave}>
          {backLabel}
          {backHint && <span className="sl-visually-hidden"> ({backHint})</span>}
        </Link>
      </div>
    </div>
  );
}
