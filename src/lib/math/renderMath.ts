import katex from "katex";

/**
 * Typesets maths in our authored lesson HTML at build time, so students get
 * real fractions, radicals and scripts with no maths JavaScript on the page.
 *
 *   <span class="tex">d_1</span>                       inline
 *   <div class="tex-block">C = S\,N(d_1) - ...</div>   display
 *
 * Output is KaTeX's HTML plus MathML, so screen readers read the formula.
 * Malformed TeX throws, which fails the build instead of shipping a broken
 * formula. `strict: "error"` also rejects input LaTeX itself wouldn't
 * accept, such as accented letters in maths mode. (Greek typed as σ is
 * fine; KaTeX treats it as \sigma.)
 *
 * Import only from server components (page.tsx files). Nothing here should
 * reach the client bundle.
 */

const INLINE = /<span class="tex">([\s\S]*?)<\/span>/g;
const DISPLAY = /<div class="tex-block">([\s\S]*?)<\/div>/g;

/** Authors write &lt; &gt; &amp; inside HTML; KaTeX wants the characters. */
function decodeEntities(tex: string): string {
  return tex.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

export function renderTex(tex: string, displayMode: boolean): string {
  return katex.renderToString(decodeEntities(tex.trim()), {
    displayMode,
    output: "htmlAndMathml",
    throwOnError: true,
    strict: "error",
  });
}

export function renderMathInHtml(html: string): string {
  return html
    .replace(DISPLAY, (_, tex: string) => renderTex(tex, true))
    .replace(INLINE, (_, tex: string) => renderTex(tex, false));
}
