"use client";

const DAY_ROWS = ["M", "", "W", "", "F", "", ""]; // Mon-first, sparse labels like GitHub
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Builds `weeks` columns of 7 days (Mon-Sun), ending on the current week, oldest first. */
function buildWeeks(weeks: number): Date[][] {
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7; // 0=Mon
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - todayDow)); // end of this week (Sunday)

  const cols: Date[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const col: Date[] = [];
    for (let d = 6; d >= 0; d--) {
      const day = new Date(end);
      day.setDate(day.getDate() - w * 7 - d);
      col.push(day);
    }
    cols.push(col);
  }
  return cols;
}

export default function ActivityHeatmap({
  activityByDate,
  weeks = 52,
}: {
  activityByDate: Record<string, number>;
  weeks?: number;
}) {
  const cols = buildWeeks(weeks);
  const todayStr = toDateStr(new Date());

  // Track which columns start a new month, for the label row.
  const monthLabels = cols.reduce<(string | null)[]>((acc, col) => {
    const month = col[0].getMonth();
    const prevMonth = acc.length ? cols[acc.length - 1][0].getMonth() : -1;
    acc.push(month !== prevMonth ? MONTH_NAMES[month] : null);
    return acc;
  }, []);

  return (
    <div className="ah">
      <div className="ah-months">
        {monthLabels.map((label, i) => (
          <span key={i} className="ah-month">{label ?? ""}</span>
        ))}
      </div>
      <div className="ah-body">
        <div className="ah-daylabels">
          {DAY_ROWS.map((l, i) => <span key={i}>{l}</span>)}
        </div>
        <div className="ah-grid">
          {cols.map((col, ci) => (
            <div key={ci} className="ah-col">
              {col.map((day, di) => {
                const key = toDateStr(day);
                const count = activityByDate[key] ?? 0;
                const isFuture = day > new Date();
                const isToday = key === todayStr;
                const intensity = Math.min(count / 3, 1);
                return (
                  <div
                    key={di}
                    className={`ah-cell ${isToday ? "today" : ""} ${isFuture ? "future" : ""}`}
                    style={
                      isFuture
                        ? undefined
                        : count > 0
                        ? { background: `rgba(21,128,61,${0.22 + intensity * 0.78})` }
                        : undefined
                    }
                    title={isFuture ? undefined : `${count} lesson${count === 1 ? "" : "s"} on ${key}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="ah-legend">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <span key={v} className="ah-legend-cell" style={v > 0 ? { background: `rgba(21,128,61,${0.22 + v * 0.78})` } : undefined} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
