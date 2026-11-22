import type { ReactNode } from "react";
import BrandMark from "@/components/BrandMark";
import styles from "./AuthCard.module.css";

/**
 * The one frame for sign-in, sign-up, check-your-email and the password
 * pages: a plain mark, a heading and one card on the canvas. Below 480px the
 * card drops its border and padding, so on a phone the form starts high and
 * the submit button stays on the first screen.
 */
export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  /** The "New here? / Already have an account?" line under the card. */
  footer?: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <div className={styles.card}>
          <span className={styles.mark}><BrandMark size={28} /></span>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          {children}
        </div>
        {footer ? <p className={styles.alt}>{footer}</p> : null}
      </div>
    </div>
  );
}

export { styles as authStyles };
