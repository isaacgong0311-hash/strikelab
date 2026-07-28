/**
 * Extracts a table of contents from a lesson's HTML and gives every <h2> a
 * stable id to anchor to.
 *
 * Runs on the server at build time, so the ids land in the prerendered HTML
 * rather than being injected by an effect after hydration. That matters twice
 * over: deep links like /lesson/3#the-setup work on first paint, and the
 * heading anchors are visible to crawlers instead of appearing only once JS
 * has run.
 *
 * Deliberately regex-based rather than a DOM parser — the input is our own
 * authored markup from src/lib/lessons.ts, not arbitrary user HTML, and every
 * lesson uses plain <h2> section headings.
 */

export interface TocSection {
  id: string;
  title: string;
}

export interface LessonToc {
  /** The lesson HTML with `id` attributes added to each <h2>. */
  html: string;
  sections: TocSection[];
}

/** Strips tags and decodes the handful of entities our lesson prose uses. */
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "section";
}

export function buildLessonToc(content: string): LessonToc {
  const sections: TocSection[] = [];
  const used = new Set<string>();

  const html = content.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/g,
    (match, attrs: string, inner: string) => {
      const title = toPlainText(inner);
      if (!title) return match;

      // A lesson can legitimately repeat a heading ("Example"); suffix so the
      // anchors stay unique and the scroll-spy doesn't jump to the wrong one.
      let id = slugify(title);
      if (used.has(id)) {
        let n = 2;
        while (used.has(`${id}-${n}`)) n++;
        id = `${id}-${n}`;
      }
      used.add(id);
      sections.push({ id, title });

      // Respect an id the author already set rather than adding a second one.
      if (/\bid\s*=/.test(attrs)) return match;
      return `<h2${attrs} id="${id}">${inner}</h2>`;
    },
  );

  return { html, sections };
}
