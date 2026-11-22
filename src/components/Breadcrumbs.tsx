import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

/**
 * Visible counterpart to `breadcrumbJsonLd` (@/lib/seo) — same trail shape,
 * same "Home" prepend, so a page's schema and its on-page trail can never
 * drift out of sync with each other. Google can render BreadcrumbList
 * markup with no visible trail on the page at all, but it's a weaker
 * signal (and worse for users navigating manually) than one that's
 * actually there to click.
 */
export default function Breadcrumbs({
  trail,
}: {
  /** Same shape as breadcrumbJsonLd's argument — pass the array without "Home", it's added here. */
  trail: { name: string; path: string }[];
}) {
  const items = [{ name: "Home", path: "/" }, ...trail];

  return (
    <nav aria-label="Breadcrumb" className={styles.trail}>
      <ol className={styles.list}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.path} className={styles.item}>
              {isLast ? (
                <span aria-current="page" className={styles.current}>{item.name}</span>
              ) : (
                <>
                  <Link href={item.path} className={styles.link}>{item.name}</Link>
                  <span aria-hidden="true" className={styles.sep}>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
