import styles from "./leaderboard.module.css";

export interface LeaderboardRow {
  rank: number;
  handle: string;
  total_score: number;
  solved: number;
  is_you: boolean;
}

export default function LeaderboardTable({
  rows,
  caption,
}: {
  rows: LeaderboardRow[];
  caption: string;
}) {
  if (rows.length === 0) {
    return <p className={styles.empty}>Scores appear here once a challenge has been graded.</p>;
  }

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <caption className="sl-visually-hidden">{caption}</caption>
        <thead>
          <tr><th scope="col">Rank</th><th scope="col">Handle</th><th scope="col">Score</th><th scope="col">Solved</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.rank}-${row.handle}`} className={row.is_you ? styles.you : undefined}>
              <td>{row.rank}</td>
              <td>{row.handle}{row.is_you ? " (you)" : ""}</td>
              <td>{Number(row.total_score).toFixed(0)}</td>
              <td>{row.solved}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
