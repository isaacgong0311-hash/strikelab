// Prints support hours per cohort for docs/gtm/weekly-scorecard.md.
//   npm run support
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv } from "./pipeline-core.mjs";
import { formatSupport, summarizeSupport } from "./support-core.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "docs", "gtm");
const read = (f) => parseCsv(readFileSync(join(dir, f), "utf8"));
console.log(formatSupport(summarizeSupport(read("cohorts.csv"), read("support-log.csv"))));
