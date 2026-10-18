import Link from "next/link";
import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/seasons/templates";
import { challengeStatus } from "@/lib/seasons/window";
import { PLANNED_SEASON } from "@/lib/seasons/planned";
import { remainingLabel, statusForWeek, type OwnAttempt } from "@/lib/seasons/status";
import LeaderboardTable, { type LeaderboardRow } from "@/components/seasons/LeaderboardTable";
import HandleForm from "./HandleForm";
import WeekStatus from "./WeekStatus";
import boardStyles from "./board.module.css";
import statusStyles from "./status.module.css";

export const metadata = pageMetadata({
  path: "/seasons",
  title: "Seasons: prove you can do quant work",
  description:
    "Free seasons of timed quant challenges for high schoolers. Your own numbers, explain your answer, ranked under a handle, ending in a verified record.",
});

export const dynamic = "force-dynamic";

interface SeasonRow { id: string; title: string; starts_on: string; ends_on: string }
interface ChallengeRow { id: string; week: number; template_slug: string; opens_at: string; closes_at: string; time_limit_minutes: number }
interface AttemptRow extends OwnAttempt { challenge_id: string }
interface ClubOption { id: string; name: string }

function readable(date: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

async function load(requestedClubId: string | undefined) {
  const supabase = await getSupabaseServer();
  if (!supabase) return { season: null, challenges: [], attempts: [], board: [], clubBoard: null, clubs: [], selectedClub: null, needsHandle: false, signedIn: false };
  const today = new Date().toISOString().slice(0, 10);
  const { data: seasons } = await supabase.from("seasons").select("id, title, starts_on, ends_on").gte("ends_on", today).order("starts_on").limit(1);
  const season = (seasons?.[0] as SeasonRow | undefined) ?? null;
  const { data: auth } = await supabase.auth.getUser();
  let needsHandle = false;
  let clubs: ClubOption[] = [];
  if (auth.user) {
    const { data: profile } = await supabase.from("profiles").select("handle").eq("id", auth.user.id).maybeSingle();
    needsHandle = !profile?.handle;
    const { data: memberships } = await supabase.from("class_members").select("class_id").eq("student_id", auth.user.id);
    const ids = (memberships ?? []).map((membership) => membership.class_id);
    if (ids.length > 0) {
      const { data: classes } = await supabase.from("classes").select("id, name").in("id", ids).order("name");
      clubs = (classes ?? []) as ClubOption[];
    }
  }
  if (!season) return { season: null, challenges: [], attempts: [], board: [], clubBoard: null, clubs, selectedClub: null, needsHandle, signedIn: Boolean(auth.user) };
  const selectedClub = clubs.find((club) => club.id === requestedClubId) ?? clubs[0] ?? null;
  const [{ data: challenges }, { data: board }, clubResult] = await Promise.all([
    supabase.from("season_challenges").select("id, week, template_slug, opens_at, closes_at, time_limit_minutes").eq("season_id", season.id).order("week"),
    supabase.rpc("season_leaderboard", { p_season_id: season.id, p_class_id: null }),
    selectedClub ? supabase.rpc("season_leaderboard", { p_season_id: season.id, p_class_id: selectedClub.id }) : Promise.resolve(null),
  ]);
  const challengeRows = (challenges ?? []) as ChallengeRow[];
  const { data: attempts } = auth.user && challengeRows.length > 0
    ? await supabase.from("season_attempts")
      .select("challenge_id, status, deadline, official_score")
      .eq("user_id", auth.user.id)
      .in("challenge_id", challengeRows.map((challenge) => challenge.id))
    : { data: [] };
  return {
    season,
    challenges: challengeRows,
    attempts: (attempts ?? []) as AttemptRow[],
    board: (board ?? []) as LeaderboardRow[],
    clubBoard: selectedClub ? (clubResult?.data ?? []) as LeaderboardRow[] : null,
    clubs,
    selectedClub,
    needsHandle,
    signedIn: Boolean(auth.user),
  };
}

export default async function SeasonsPage({ searchParams }: { searchParams: Promise<{ club?: string | string[] }> }) {
  const { club } = await searchParams;
  const { season, challenges, attempts, board, clubBoard, clubs, selectedClub, needsHandle, signedIn } = await load(typeof club === "string" ? club : undefined);
  const now = new Date();
  const attemptsByChallenge = new Map(attempts.map((attempt) => [attempt.challenge_id, attempt]));
  const seasonRank = board.find((row) => row.is_you)?.rank ?? null;
  const title = season?.title ?? PLANNED_SEASON.title;
  const starts = season?.starts_on ?? PLANNED_SEASON.startsOn;
  const ends = season?.ends_on ?? PLANNED_SEASON.endsOn;

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>Seasons</p>
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
          {needsHandle && <div style={{ marginTop: "1.5rem" }}><HandleForm /></div>}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="season-how">
        <div className={styles.wrap}>
          <h2 id="season-how" className={styles.h2}>How a season works</h2>
          <ul className={styles.checks} style={{ maxWidth: "44rem" }}>
            <li>Each week a challenge opens. When you start it, a timer starts too, and the AI tutor switches off until you submit.</li>
            <li>Your numbers are yours alone, so nobody can hand you an answer.</li>
            <li>You submit your code and a short explanation of why it works. StrikeLab computes your official score after you submit, not in your browser, and usually posts it within a day.</li>
            <li>Leaderboards show handles, never real names. Clubs can play together and get their own board.</li>
            <li>Top finishers and capstones are verified in a short live conversation before they appear on a record.</li>
          </ul>
        </div>
      </section>

      {!signedIn && <section className={styles.section} aria-labelledby="season-challenges">
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
      </section>}

      {signedIn && (
        <section className={styles.section} aria-labelledby="your-status">
          <div className={styles.wrap}>
            <h2 id="your-status" className={styles.h2}>Your status</h2>
            {challenges.length === 0 ? (
              <p className={styles.body}>Your weekly challenges will appear here when the season is scheduled.</p>
            ) : (
              <ol className={statusStyles.list}>
                {challenges.map((challenge) => {
                  const template = getTemplate(challenge.template_slug);
                  const view = statusForWeek(now, challenge, attemptsByChallenge.get(challenge.id) ?? null, seasonRank);
                  return (
                    <li key={challenge.id} className={statusStyles.card}>
                      <div>
                        <p className={statusStyles.week}>Week {challenge.week}</p>
                        <h3 className={statusStyles.title}>{template?.title ?? "Challenge"}</h3>
                        <p className={statusStyles.concept}>{template?.concept ?? ""} · {challenge.time_limit_minutes} minutes</p>
                      </div>
                      <WeekStatus
                        view={view}
                        challengeId={challenge.id}
                        initialText={view.kind === "upcoming" ? remainingLabel(now, view.opensAt) : ""}
                        serverNow={now.toISOString()}
                      />
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </section>
      )}

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="season-board">
        <div className={styles.wrap}>
          <h2 id="season-board" className={styles.h2}>Leaderboard</h2>
          <LeaderboardTable rows={board} caption="Season leaderboard by handle" />
        </div>
      </section>

      {selectedClub && clubBoard && (
        <section className={styles.section} aria-labelledby="club-board">
          <div className={styles.wrap}>
            <h2 id="club-board" className={styles.h2}>Your club</h2>
            {clubs.length > 1 ? (
              <form action="/seasons" method="get" className={boardStyles.picker}>
                <label htmlFor="club-select">Club</label>
                <select id="club-select" name="club" defaultValue={selectedClub.id}>
                  {clubs.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                </select>
                <button type="submit">Show club</button>
              </form>
            ) : <p className={boardStyles.clubName}>{selectedClub.name}</p>}
            <LeaderboardTable rows={clubBoard} caption={`${selectedClub.name} leaderboard by handle`} />
          </div>
        </section>
      )}
    </div>
  );
}
