import TryItCTA from "./TryItCTA";

/**
 * Custom components exposed to blog post MDX bodies. Everything else (h2, p,
 * ul, code, table, ...) falls through to plain HTML tags, styled by the
 * existing `.lesson-content` CSS — the same typography lesson pages already
 * use, so a blog post and a lesson read as the same product rather than two
 * different renderers bolted together.
 */
export const mdxComponents = {
  TryItCTA,
};
