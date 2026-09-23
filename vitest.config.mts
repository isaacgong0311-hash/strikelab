import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Unit tests only — src/lib/pricing.ts and friends are pure logic with no
// DOM, so a jsdom environment isn't needed here. Component tests can add
// their own `environment: "jsdom"` per-file via a docblock if that ever
// changes (see https://vitest.dev/config/#environment).
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // *.db.test.ts boot an in-process Postgres (PGlite) and replay every
    // migration, which can pass 5s when the whole suite runs in parallel.
    testTimeout: 30_000,
  },
});
