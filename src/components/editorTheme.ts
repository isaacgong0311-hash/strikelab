import { EditorView } from "@uiw/react-codemirror";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { oneDarkTheme } from "@codemirror/theme-one-dark";

/**
 * One Dark with its three sub-AA colours brightened. Stock One Dark renders
 * comments and line numbers at 3.86:1, names at 4.38:1, and keywords on the
 * active line at 4.43:1 — all under WCAG AA's 4.5:1 for 13.6px code. Every
 * colour below clears 4.5:1 on both the editor background (#282c34) and the
 * active-line highlight (#2c313a). Hues are unchanged, only lightness moved.
 */
const coral = "#ef8a92"; // was #e06c75
const violet = "#d49be8"; // was #c678dd
const stone = "#9aa3b2"; // was #7d8799
const chalky = "#e5c07b";
const cyan = "#56b6c2";
const ivory = "#abb2bf";
const malibu = "#61afef";
const sage = "#98c379";
const whiskey = "#d19a66";

const accessibleHighlight = HighlightStyle.define([
  { tag: t.keyword, color: violet },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: coral },
  { tag: [t.function(t.variableName), t.labelName], color: malibu },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: whiskey },
  { tag: [t.definition(t.name), t.separator], color: ivory },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: chalky },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: cyan },
  { tag: [t.meta, t.comment], color: stone },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: stone, textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: coral },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: whiskey },
  { tag: [t.processingInstruction, t.string, t.inserted], color: sage },
  { tag: t.invalid, color: "#ffffff" },
]);

const accessibleGutters = EditorView.theme(
  {
    // Set on the elements themselves: a ".cm-gutters" rule here ties on
    // specificity with One Dark's and loses on stylesheet order.
    ".cm-gutters .cm-gutterElement": { color: stone },
  },
  { dark: true }
);

export const accessibleOneDark = [oneDarkTheme, accessibleGutters, syntaxHighlighting(accessibleHighlight)];
