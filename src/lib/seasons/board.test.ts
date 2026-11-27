import { describe, expect, it } from "vitest";
import { foldBoard } from "./board";

const board = (n: number, you = -1) => Array.from({ length: n }, (_, i) => ({ rank: i + 1, is_you: i === you }));
const shape = (items: ReturnType<typeof foldBoard<{ rank: number; is_you: boolean }>>) =>
  items.map((item) => (item.kind === "row" ? item.row.rank : `+${item.hidden}`));

describe("league folding", () => {
  it("leaves short boards whole", () => {
    expect(shape(foldBoard(board(15, 14)))).toHaveLength(15);
  });

  it("shows the top ten and the rows around you", () => {
    expect(shape(foldBoard(board(40, 24)))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "+12", 23, 24, 25, 26, 27, "+13"]);
  });

  it("joins up when you're just below the top", () => {
    expect(shape(foldBoard(board(30, 11)))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, "+16"]);
  });

  it("works when you're last or not on the board", () => {
    expect(shape(foldBoard(board(20, 19)))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "+7", 18, 19, 20]);
    expect(shape(foldBoard(board(20)))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "+10"]);
  });
});
