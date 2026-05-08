/**
 * After `next build` with output:'standalone', this script assembles the
 * self-contained server folder that Electron will bundle into the .exe.
 *
 * Result: .next-standalone/
 *   server.js            ← Next.js standalone entry point
 *   node_modules/        ← minimal deps
 *   .next/               ← compiled app
 *     standalone/        ← (already here from build)
 *     static/            ← copied from .next/static
 *   public/              ← copied from project root
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, ".next", "standalone");
const dest = path.join(root, ".next-standalone");

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// Start fresh
fs.rmSync(dest, { recursive: true, force: true });

// Copy standalone server
copyDir(src, dest);

// Copy static assets into the expected location
copyDir(
  path.join(root, ".next", "static"),
  path.join(dest, ".next", "static")
);

// Copy public folder
copyDir(path.join(root, "public"), path.join(dest, "public"));

console.log("✓ Standalone bundle assembled at .next-standalone/");
