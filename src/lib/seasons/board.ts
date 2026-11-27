/**
 * Folding a long leaderboard into a league view: the top of the board, then
 * the rows around you, with the rest behind a "show more". Short boards stay
 * whole. Pure, so the table can render it the same on the server and client.
 */
export type BoardItem<T> = { kind: "row"; row: T } | { kind: "gap"; hidden: number };

export interface FoldOptions {
  /** Boards this long or shorter are never folded. */
  threshold?: number;
  /** Rows always shown from the top. */
  top?: number;
  /** Rows shown on each side of yours. */
  around?: number;
}

export function foldBoard<T extends { is_you: boolean }>(rows: T[], options: FoldOptions = {}): BoardItem<T>[] {
  const { threshold = 15, top = 10, around = 2 } = options;
  if (rows.length <= threshold) return rows.map((row) => ({ kind: "row", row }));
  const keep = new Set<number>();
  for (let i = 0; i < Math.min(top, rows.length); i++) keep.add(i);
  const you = rows.findIndex((row) => row.is_you);
  if (you >= 0) for (let i = Math.max(0, you - around); i <= Math.min(rows.length - 1, you + around); i++) keep.add(i);

  const items: BoardItem<T>[] = [];
  let hidden = 0;
  rows.forEach((row, i) => {
    if (keep.has(i)) {
      if (hidden > 0) items.push({ kind: "gap", hidden });
      hidden = 0;
      items.push({ kind: "row", row });
    } else {
      hidden += 1;
    }
  });
  if (hidden > 0) items.push({ kind: "gap", hidden });
  return items;
}
