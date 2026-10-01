import Link from "next/link";
import styles from "./ErrorScreen.module.css";

/**
 * The "something went wrong" page shown by app/error.tsx. A pure view so it
 * can be rendered in tests; reporting to Sentry happens in the route file.
 * Never shows the error message (server errors are generic in production and
 * client ones can name internals); the digest is shown so a user can quote it.
 */
export default function ErrorScreen({ digest, onRetry }: { digest?: string; onRetry: () => void }) {
  return (
    <div className={styles.wrap} role="alert">
      <p className={styles.eyebrow}>Something went wrong</p>
      <h1 className={styles.title}>That didn&rsquo;t load.</h1>
      <p className={styles.body}>
        It&rsquo;s on our side, not yours, and your progress is safe. Try again, and if it keeps happening, tell us at
        hello@strikelab.app with the reference below.
      </p>
      {digest ? <p className={styles.ref}>Reference: {digest}</p> : null}
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onRetry}>
          Try again
        </button>
        <Link href="/" className={styles.secondary}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
