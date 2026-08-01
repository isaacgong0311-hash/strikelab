/**
 * Capacitor config for wrapping StrikeLab as a native iOS / Android app.
 * See CAPACITOR_SETUP.md for the full step-by-step.
 *
 * NOTE: intentionally NOT importing `CapacitorConfig` from "@capacitor/cli"
 * so this file builds before Capacitor is installed. Once you run
 * `npm install @capacitor/cli`, you may add:
 *   import type { CapacitorConfig } from "@capacitor/cli";
 * and annotate `config` with it. Capacitor reads this object structurally.
 *
 * Two shipping modes:
 *  1. Quick test (current): `server.url` loads the live Vercel PWA inside the
 *     native shell. Fastest way to see it on a phone. NOTE: Apple may reject a
 *     pure URL-webview under guideline 4.2 — prefer mode 2 for the real store.
 *  2. Store build: remove `server.url`, static-export into `out/`, ship bundled
 *     assets. Stronger review case. (Details in CAPACITOR_SETUP.md.)
 */
const config = {
  appId: "app.strikelab.mobile",
  appName: "StrikeLab",
  webDir: "out",
  backgroundColor: "#f7f5ef",
  server: {
    url: "https://strikelab.dev",
    cleartext: false,
  },
};

export default config;
