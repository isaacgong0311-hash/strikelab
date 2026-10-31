import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The Python runtime, copied from node_modules at dev/build time
    // (scripts/copy-pyodide.mjs): vendor code, not ours.
    "public/pyodide/**",
    // Nested Claude worktrees have their own .next and node_modules.
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
