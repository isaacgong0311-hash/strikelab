import { ActionLink } from "@/components/ui/Action";
import styles from "@/components/errors/ErrorScreen.module.css";

export const metadata = {
  title: "Page not found",
  description: "This page doesn't exist. Find your way back to the lessons, dashboard, or homepage.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <p className={styles.code}>Error <span className="sl-num">404</span></p>
      <h1 className={styles.title}>This page doesn&rsquo;t exist.</h1>
      <p className={styles.body}>
        The link might be stale, or the URL got mistyped. Your lessons and
        progress are still where you left them.
      </p>
      <div className={styles.actions}>
        <ActionLink href="/lessons">Go to the lessons</ActionLink>
        <ActionLink href="/" variant="secondary">Back to home</ActionLink>
      </div>
    </div>
  );
}
