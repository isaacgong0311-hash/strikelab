// Copies the Python runtime (Pyodide) from node_modules into public/, so the
// exercises load it from strikelab.dev instead of a third-party CDN that
// school web filters may block (mega plan Q1). Runs before `dev` and `build`.
// The copy is gitignored; the version lives in package.json.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "pyodide");
const { version } = JSON.parse(readFileSync(join(source, "package.json"), "utf8"));
const target = join(root, "public", "pyodide", `v${version}`);

// The core runtime only: exercises use the standard library, no extra packages.
const FILES = ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];

mkdirSync(target, { recursive: true });
for (const file of FILES) {
  const from = join(source, file);
  if (!existsSync(from)) throw new Error(`pyodide ${version} is missing ${file}`);
  copyFileSync(from, join(target, file));
}
console.log(`[copy-pyodide] Pyodide ${version} → public/pyodide/v${version}/`);
