import Link from "next/link";
import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/seasons/templates";
import { challengeStatus } from "@/lib/seasons/window";
import { PLANNED_SEASON } from "@/lib/seasons/planned";
import HandleForm from "./HandleForm";

export const metadata = pageMetadata({
  path: "/seasons",
  title: "Seasons: prove you can do quant work",
  description:
    "Free seasons of timed quant challenges for high schoolers. Your own numbers, explain your answer, ranked under a handle, ending in a verified record.",
});

export const dynamic = "force-dynamic";

interface SeasonRow { id: string; title: string; starts_on: string; ends_on: string; is_rehearsal?: boolean }
interface ChallengeRow { id: string; week: number; template_slug: string; opens_at: string; closes_at: string; time_limit_minutes: number }
interface BoardRow { rank: number; handle: string; total_score: number; solved: number; is_you: boolean }

function readable(date: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

const SEASON_ID = /^[a-z0-9-]{2,40}$/;

async function load(requested: string | null) {
  const supabase = await getSupabaseServer();
  if (!supabase) return { season: null, challenges: [], board: [], needsHandle: false, signedIn: false };
  const today = new Date().toISOString().slice(0, 10);
  // By default, the next real season. A rehearsal season (0025) is reachable
  // only by its id in the link, so the public page never shows test data.
  const { data: seasons } = requested
    ? await supabase.from("seasons").select("id, title, starts_on, ends_on, is_rehearsal").eq("id", requested).limit(1)
    : await supabase.from("seasons").select("id, title, starts_on, ends_on, is_rehearsal").eq("is_rehearsal", false).gte("ends_on", today).order("starts_on").limit(1);
  const season = (seasons?.[0] as SeasonRow | undefined) ?? null;
  const { data: auth } = await supabase.auth.getUser();
  let needsHandle = false;
  if (auth.user) {
    const { data: profile } = await supabase.from("profiles").select("handle").eq("id", auth.user.id).maybeSingle();
    needsHandle = !profile?.handle;
  }
  if (!season) return { season: null, challenges: [], board: [], needsHandle, signedIn: Boolean(auth.user) };
  const [{ data: challenges }, { data: board }] = await Promise.all([
    supabase.from("season_challenges").select("id, week, template_slug, opens_at, closes_at, time_limit_minutes").eq("season_id", season.id).order("week"),
    supabase.rpc("season_leaderboard", { p_season_id: season.id, p_class_id: null }),
  ]);
  return {
    season,
    challenges: (challenges ?? []) as ChallengeRow[],
    board: (board ?? []) as BoardRow[],
    needsHandle,
    signedIn: Boolean(auth.user),
  };
}

export default async function SeasonsPage({ searchParams }: { searchParams: Promise<{ season?: string | string[] }> }) {
  const { season: seasonParam } = await searchParams;
  const requested = typeof seasonParam === "string" && SEASON_ID.test(seasonParam) ? seasonParam : null;
  const { season, challenges, board, needsHandle, signedIn } = await load(requested);
  const now = new Date();
  const title = season?.title ?? PLANNED_SEASON.title;
  const starts = season?.starts_on ?? PLANNED_SEASON.startsOn;
  const ends = season?.ends_on ?? PLANNED_SEASON.endsOn;

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>{season?.is_rehearsal ? "Rehearsal season (practice only, not on any record)" : "Seasons"}</p>
          <h1 className={styles.h1}>Prove you can do quant work.</h1>
          <p className={styles.lede}>
            {title}: {readable(starts)} to {readable(ends)}. One timed challenge a week, free. Your own numbers, your
            own explanation, ranked under a handle, and a record you can show at the end.
          </p>
          {!signedIn && (
            <div className={styles.ctaRow}>
              <Link href="/sign-up?next=%2Fseasons" className={styles.primary}>Create a free account to play</Link>
              <Link href="/lessons" className={styles.secondary}>Train with the lessons first</Link>
            </div>
          )}
          {signedIn && (
            <p className={styles.body} style={{ marginTop: "1rem" }}>
              <Link href="/record" className={styles.textLink}>See your record</Link>: your official scores and anything
              verified, private until you share it.
            </p>
          )}
          {needsHandle && <div style={{ marginTop: "1.5rem" }}><HandleForm /></div>}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="season-how">
        <div className={styles.wrap}>
          <h2 id="season-how" className={styles.h2}>How a season works</h2>
          <ul className={styles.checks} style={{ maxWidth: "44rem" }}>
            <li>Each week a challenge opens. When you start it, a timer starts too, and the AI tutor switches off until you submit.</li>
            <li>Your numbers are yours alone, so nobody can hand you an answer.</li>
            <li>You submit your code and a short explanation of why it works. Your score is computed on our server, not in your browser.</li>
            <li>Leaderboards show handles, never real names. Clubs can play together and get their own board.</li>
            <li>Top finishers and capstones are verified in a short live conversation before they appear on a record.</li>
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="season-challenges">
        <div className={styles.wrap}>
          <h2 id="season-challenges" className={styles.h2}>This season&apos;s challenges</h2>
          {challenges.length === 0 ? (
            <p className={styles.body}>The challenges appear here when the season is scheduled.</p>
          ) : (
            <ol className={styles.checks}>
              {challenges.map((c) => {
                const t = getTemplate(c.template_slug);
                const status = challengeStatus(now, c.opens_at, c.closes_at);
                return (
                  <li key={c.id}>
                    <strong>Week {c.week}: {t?.title ?? "Challenge"}</strong> ({t?.concept ?? ""}, {c.time_limit_minutes} minutes).{" "}
                    {status === "open" ? (
                      <Link href={`/seasons/${c.id}`} className={styles.textLink}>Open now</Link>
                    ) : status === "upcoming" ? (
                      <span>Opens {readable(c.opens_at.slice(0, 10))}</span>
                    ) : (
                      <span>Closed</span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="season-board">
        <div className={styles.wrap}>
          <h2 id="season-board" className={styles.h2}>Leaderboard</h2>
          {board.length === 0 ? (
            <p className={styles.body}>Scores appear here once the first challenge has been graded.</p>
          ) : (
            <table style={{ borderCollapse: "collapse", minWidth: "min(100%, 32rem)" }}>
              <caption className="sl-visually-hidden">Season leaderboard by handle</caption>
              <thead><tr><th scope="col">Rank</th><th scope="col">Handle</th><th scope="col">Score</th><th scope="col">Solved</th></tr></thead>
              <tbody>
                {board.map((r) => (
                  <tr key={`${r.rank}-${r.handle}`} style={r.is_you ? { fontWeight: 800 } : undefined}>
                    <td>{r.rank}</td><td>{r.handle}{r.is_you ? " (you)" : ""}</td><td>{Number(r.total_score).toFixed(0)}</td><td>{r.solved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
