// Scores submitted season attempts (status 'submitted') with each student's
// own numbers and writes the official score. Dry run by default.
//
//   npm run season:score             # show what would be written
//   npm run season:score -- --apply  # write scores
//
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and the same
// SEASON_PARAM_SECRET as the live site, in .env.local. Run it after each
// challenge closes (or daily during a season). Timeouts and broken tests are
// marked 'pending_review' for a person to look at; nothing is guessed.
import { createClient } from "@supabase/supabase-js";
import { getTemplate } from "../../src/lib/seasons/templates.ts";
import { deriveParams } from "../../src/lib/seasons/params.ts";
import { createScorer, outcome } from "./score-core.mjs";

const apply = process.argv.includes("--apply");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const secret = process.env.SEASON_PARAM_SECRET;
for (const [name, value] of [["NEXT_PUBLIC_SUPABASE_URL", url], ["SUPABASE_SERVICE_ROLE_KEY", key], ["SEASON_PARAM_SECRET", secret]]) {
  if (!value) {
    console.error(`Missing ${name} (put it in .env.local).`);
    process.exit(1);
  }
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: attempts, error } = await admin
  .from("season_attempts")
  .select("user_id, challenge_id, code, started_at, submitted_at, season_challenges(template_slug, time_limit_minutes)")
  .eq("status", "submitted")
  .order("submitted_at");
if (error) {
  console.error("Couldn't read attempts:", error.message);
  process.exit(1);
}
if (!attempts.length) {
  console.log("Nothing to score.");
  process.exit(0);
}

const scorer = createScorer();
const tally = { scored: 0, pending_review: 0 };
for (const a of attempts) {
  const ch = a.season_challenges;
  const template = ch && getTemplate(ch.template_slug);
  const usedSeconds = (Date.parse(a.submitted_at) - Date.parse(a.started_at)) / 1000;
  const limitSeconds = (ch?.time_limit_minutes ?? 60) * 60;
  let result;
  if (!template) result = { kind: "test", error: `unknown template ${ch?.template_slug}` };
  else {
    const params = deriveParams(template.paramSpecs, { challengeId: a.challenge_id, userId: a.user_id }, secret);
    result = await scorer.run(a.code ?? "", template.officialTest(params));
  }
  const row = outcome(result, { usedSeconds, limitSeconds });
  tally[row.status]++;
  console.log(`${a.challenge_id}  ${a.user_id.slice(0, 8)}  ${row.status}  ${row.official_score ?? "-"}${result.error ? `  (${result.error.split("\n").pop()})` : ""}`);
  if (apply) {
    const { error: writeError } = await admin
      .from("season_attempts")
      .update(row)
      .eq("user_id", a.user_id)
      .eq("challenge_id", a.challenge_id)
      .eq("status", "submitted");
    if (writeError) console.error("  write failed:", writeError.message);
  }
}
await scorer.close();
console.log(`${apply ? "Wrote" : "[dry run] would write"}: ${tally.scored} scored, ${tally.pending_review} for review.${apply ? "" : " Add --apply to write."}`);
