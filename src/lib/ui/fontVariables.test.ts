import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// next/font sets --font-mono on <html> (src/app/layout.tsx). A stylesheet that
// redefines it as var(--font-mono, ...) creates a cycle, which the browser
// resolves to nothing: every mono label (var(--sl-font-code)) then silently
// rendered in Inter. Keep the self-hosted font the only definition.
const sheets = ["../../app/globals.css", "../../styles/tokens.css", "../../styles/foundation.css"];

describe("font variables", () => {
  it.each(sheets)("%s does not redefine --font-mono", (path) => {
    const css = readFileSync(new URL(path, import.meta.url), "utf8");
    expect(css).not.toMatch(/--font-mono\s*:/);
  });
});
