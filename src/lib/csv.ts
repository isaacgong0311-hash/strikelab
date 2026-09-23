/**
 * Spreadsheet-safe CSV. Every cell is quoted, and cells that a spreadsheet
 * would treat as a formula (=, +, -, @, tab, CR) get a leading apostrophe:
 * student display names are user-controlled, and teachers open these files
 * in Excel/Sheets.
 */
export function toCsv(rows: readonly (readonly string[])[]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const safe = /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell;
          return `"${safe.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");
}

/** Download CSV text as a file (browser only). */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
