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
    // finpath/ is a separate, unrelated project (its own package.json,
    // tsconfig, Next 14) that happens to live in this repo. It isn't part
    // of the StrikeLab app and shouldn't be swept into its lint run.
    "finpath/**",
  ]),
]);

export default eslintConfig;
