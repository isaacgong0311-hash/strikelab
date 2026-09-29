// Pipeline numbers from docs/gtm/crm.csv (work plan §8, glossary "Pipeline
// metrics"). Pure functions; scripts/metrics/pipeline.mjs is the CLI.
//
// CRM rules (docs/gtm/outreach-kit.md §7):
// - `status` is the FURTHEST stage the leader reached, from STAGES below.
// - A lead that ends keeps its status; `next_action` starts with "closed:".
// - `source` says how we reached them; WARM_SOURCES count as warm.
// - The approval path goes in `notes` as "path:A", "path:B" or "path:C".

export const STAGES = ["to_contact", "contacted", "replied", "call_booked", "call_held", "verbal_yes", "locked", "running", "completed", "committed", "paid"];
const ALIASES = { interested: "replied" };
export const WARM_SOURCES = new Set(["own_school", "own_teacher", "warm_intro", "referral", "founder_personal_network"]);

/** Minimal RFC 4180 CSV parser: quoted fields, doubled quotes, commas and newlines inside quotes. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/\r\n?/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.some((f) => f.trim() !== ""));
  if (!header) return [];
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

export function stageIndex(status) {
  const s = ALIASES[status] ?? status;
  const i = STAGES.indexOf(s);
  return i === -1 ? null : i;
}

const DAY = 86_400_000;

/**
 * @param rows parsed crm.csv rows
 * @param today "YYYY-MM-DD"
 */
export function summarizePipeline(rows, today) {
  const real = rows.filter((r) => !/^EXAMPLE/i.test(r.organization ?? ""));
  const reached = (stage) => real.filter((r) => (stageIndex(r.status) ?? -1) >= STAGES.indexOf(stage)).length;
  const contacted = real.filter((r) => (stageIndex(r.status) ?? -1) >= 1);
  const warm = contacted.filter((r) => WARM_SOURCES.has(r.source)).length;
  const paths = { A: 0, B: 0, C: 0 };
  for (const r of real) {
    const m = /path:\s*([ABC])\b/i.exec(r.notes ?? "");
    if (m) paths[m[1].toUpperCase()]++;
  }
  const unknownStatus = real.filter((r) => stageIndex(r.status) === null).map((r) => `${r.organization} ("${r.status}")`);
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  const followUp = real
    .filter((r) => {
      const i = stageIndex(r.status);
      if (i === null || i < 1 || i >= STAGES.indexOf("locked")) return false;
      if (/^closed:/i.test(r.next_action ?? "")) return false;
      const last = Date.parse(`${r.last_contact}T00:00:00Z`);
      return Number.isNaN(last) || todayMs - last >= 3 * DAY;
    })
    .map((r) => ({ organization: r.organization, status: r.status, lastContact: r.last_contact || "never", nextAction: r.next_action }));

  return {
    contacted: contacted.length,
    warmShare: contacted.length ? Math.round((warm / contacted.length) * 100) : null,
    replied: reached("replied"),
    callsHeld: reached("call_held"),
    verbalYes: reached("verbal_yes"),
    locked: reached("locked"),
    paths,
    followUp,
    unknownStatus,
  };
}

export function formatPipeline(s, today) {
  const lines = [
    `### Pipeline as of ${today}`,
    "",
    "| Pipeline | Value |",
    "|---|---|",
    `| Contacts touched (cumulative) | ${s.contacted} |`,
    `| Warm share of contacts | ${s.warmShare === null ? "—" : `${s.warmShare}%`} |`,
    `| Replies (cumulative) | ${s.replied} |`,
    `| Calls held (cumulative) | ${s.callsHeld} |`,
    `| Verbal yeses with a date | ${s.verbalYes} |`,
    `| Locked pilots | ${s.locked} |`,
    `| Leaders by approval path (A / B / C) | ${s.paths.A} / ${s.paths.B} / ${s.paths.C} |`,
    "",
  ];
  if (s.followUp.length) {
    lines.push(`**Follow up today** (no contact for 3+ days):`, "");
    for (const f of s.followUp) lines.push(`- ${f.organization}: ${f.status}, last contact ${f.lastContact}. Next: ${f.nextAction || "(none set)"}`);
    lines.push("");
  }
  if (s.unknownStatus.length) {
    lines.push(`**Fix these statuses** (not in the list in outreach-kit.md §7): ${s.unknownStatus.join(", ")}`, "");
  }
  return lines.join("\n");
}
