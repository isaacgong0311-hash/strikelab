import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quotes cells and escapes quotes", () => {
    expect(toCsv([["a", 'say "hi"'], ["1", ""]])).toBe('"a","say ""hi"""\n"1",""');
  });

  it("neutralizes spreadsheet formulas in user-controlled cells", () => {
    expect(toCsv([["=HYPERLINK(\"http://evil\")", "+1", "-2", "@SUM(A1)", "Ana"]])).toBe(
      '"\'=HYPERLINK(""http://evil"")","\'+1","\'-2","\'@SUM(A1)","Ana"'
    );
  });
});
