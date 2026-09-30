// Prints this week's pipeline rows for docs/gtm/weekly-scorecard.md, plus who
// to follow up with today, from docs/gtm/crm.csv.
//
//   npm run pipeline            (as of today)
//   npm run pipeline 2026-10-09 (as of a date)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatPipeline, parseCsv, summarizePipeline } from "./pipeline-core.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const today = process.argv[2] ?? new Date().toISOString().slice(0, 10);
const rows = parseCsv(readFileSync(join(root, "docs", "gtm", "crm.csv"), "utf8"));
console.log(formatPipeline(summarizePipeline(rows, today), today));
