import Link from "next/link";

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
    <nav
      aria-label="Breadcrumb"
      className="text-xs mb-4 flex items-center flex-wrap gap-1.5"
      style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.path} className="flex items-center gap-1.5">
            {isLast ? (
              <span aria-current="page" style={{ color: "var(--ink-2, var(--muted2))" }}>
                {item.name}
              </span>
            ) : (
              <Link href={item.path} className="transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}>
                {item.name}
              </Link>
            )}
            {!isLast && <span aria-hidden="true">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
