import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "./site";

/**
 * Builds per-page metadata with a correct self-referencing canonical.
 *
 * Next.js inherits parent metadata field-by-field, so a `alternates.canonical`
 * declared in the root layout silently becomes the canonical for every page
 * that doesn't set its own — which tells Google those pages are duplicates of
 * the homepage. Every indexable page must therefore build its metadata here.
 *
 * `openGraph` is likewise replaced wholesale (not deep-merged) when a child
 * sets it, so siteName/locale are repeated on each page rather than inherited.
 */
export function pageMetadata(opts: {
  /** Route path, leading slash, no trailing slash. e.g. "/pricing" */
  path: string;
  /** Page title. The root template appends " — StrikeLab". */
  title: string;
  description: string;
  type?: "website" | "article";
}): Metadata {
  const { path, title, description, type = "website" } = opts;
  const fullTitle = `${title} — ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "en_US",
      title: fullTitle,
      description,
      url: `${SITE_URL}${path}`,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}

/**
 * Converts a human duration ("15 min") to the ISO 8601 duration schema.org
 * expects ("PT15M"). Passing the raw string makes `timeRequired` unparseable,
 * so Google drops the property rather than showing a course length.
 */
export function isoDuration(duration: string): string | undefined {
  const minutes = Number.parseInt(duration, 10);
  return Number.isFinite(minutes) && minutes > 0 ? `PT${minutes}M` : undefined;
}

/**
 * BreadcrumbList JSON-LD. Google renders this as a "strikelab.dev › Lessons ›
 * Black-Scholes" trail in place of the raw URL, which reads better in results
 * and is one of the cheapest rich-result wins available.
 *
 * Pass the trail without "Home" — it's prepended here so every page agrees.
 */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  const items = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path === "/" ? SITE_URL : `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * Metadata for private/utility routes (dashboard, checkout success, auth).
 * These are crawlable — so the noindex directive is actually seen — but kept
 * out of the index. Blocking them in robots.txt instead would hide the
 * directive and let them get indexed anyway via inbound links.
 */
export function privatePageMetadata(opts: {
  title: string;
  description: string;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    robots: { index: false, follow: false },
  };
}
