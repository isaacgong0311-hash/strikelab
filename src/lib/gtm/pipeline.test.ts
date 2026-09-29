import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatPipeline, parseCsv, summarizePipeline } from "../../../scripts/metrics/pipeline-core.mjs";

const HEADER = "organization,leader_name,leader_email,segment,source,status,expected_students,last_contact,next_action,objection,referral_from,notes";
const csv = (...rows: string[]) => [HEADER, ...rows].join("\r\n");

describe("pipeline from crm.csv", () => {
  it("parses quoted fields with commas, quotes and newlines", () => {
    const rows = parseCsv(csv('"Club, Inc",A,a@x.edu,math,own_school,contacted,10,2026-10-01,"Say ""hi""","",,"line one\nline two"'));
    expect(rows[0]).toMatchObject({ organization: "Club, Inc", next_action: 'Say "hi"', notes: "line one\nline two" });
  });

  it("counts each stage as reached-at-least, ignores EXAMPLE rows, and reads approval paths", () => {
    const rows = parseCsv(
      csv(
        "EXAMPLE — Club,,,,warm_intro,locked,,,,,,",
        "A,,,,own_school,locked,,2026-10-08,Kickoff Oct 26,,,path:A",
        "B,,,,warm_intro,call_held,,2026-10-01,Send packet,,,path:C",
        "C,,,,cold_email,interested,,2026-10-08,Book call,,,",
        "D,,,,cold_email,contacted,,2026-10-02,closed: no_response,,,",
        "E,,,,referral,to_contact,,,Email Monday,,,",
        "F,,,,own_teacher,mystery,,,?,,,"
      )
    );
    const s = summarizePipeline(rows, "2026-10-09");
    expect(s).toMatchObject({ contacted: 4, replied: 3, callsHeld: 2, verbalYes: 1, locked: 1, paths: { A: 1, B: 0, C: 1 } });
    // 2 of the 4 contacted came through warm sources (own_school, warm_intro).
    expect(s.warmShare).toBe(50);
    // B went quiet 8 days ago; D is closed; C was contacted yesterday; A is locked.
    expect(s.followUp.map((f: { organization: string }) => f.organization)).toEqual(["B"]);
    expect(s.unknownStatus).toEqual(['F ("mystery")']);
  });

  it("runs on the real crm.csv", () => {
    const rows = parseCsv(readFileSync(join(__dirname, "..", "..", "..", "docs", "gtm", "crm.csv"), "utf8"));
    const out = formatPipeline(summarizePipeline(rows, "2026-09-29"), "2026-09-29");
    expect(out).toContain("| Contacts touched (cumulative) |");
  });
});
