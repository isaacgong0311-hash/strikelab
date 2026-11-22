import Link from "next/link";
import Faq from "@/components/marketing/Faq";
import JsonLd from "@/components/JsonLd";
import { SEASON_FAQ } from "@/lib/seasons/faq";
import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/seasons/templates";
import { challengeStatus } from "@/lib/seasons/window";
import { PLANNED_SEASON, seasonPhase, type SeasonPhase } from "@/lib/seasons/planned";
import { seasonDate, seasonIsOver } from "@/lib/seasons/seasonDate";
import { trainLinkFor } from "@/lib/seasons/train";
import seasonStyles from "./seasons.module.css";
import { remainingLabel, statusForWeek, type OwnAttempt } from "@/lib/seasons/status";
import LeaderboardTable, { type LeaderboardRow } from "@/components/seasons/LeaderboardTable";
import HandleForm from "./HandleForm";
import InviteCard from "./InviteCard";
import inviteStyles from "./invite.module.css";
import { inviterFromSrc } from "@/lib/seasons/invite";
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

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SEASON_FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

interface SeasonRow { id: string; title: string; starts_on: string; ends_on: string }
interface ChallengeRow { id: string; week: number; template_slug: string; opens_at: string; closes_at: string; time_limit_minutes: number }
interface AttemptRow extends OwnAttempt { challenge_id: string }
interface ClubOption { id: string; name: string }

function readable(date: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

async function load(requestedClubId: string | undefined) {
  const supabase = await getSupabaseServer();
  if (!supabase) return { season: null, challenges: [], attempts: [], board: [], clubBoard: null, clubs: [], selectedClub: null, needsHandle: false, signedIn: false, handle: null, invited: null };
  // Eastern calendar day, so the season stays up until its last week closes at 11:59pm New York time.
  const today = seasonDate(new Date());
  const { data: seasons } = await supabase.from("seasons").select("id, title, starts_on, ends_on").gte("ends_on", today).order("starts_on").limit(1);
  let season = (seasons?.[0] as SeasonRow | undefined) ?? null;
  if (!season) {
    // Between seasons, show the one that just ended and its final board, not an empty page.
    const { data: ended } = await supabase.from("seasons").select("id, title, starts_on, ends_on").lt("ends_on", today).order("ends_on", { ascending: false }).limit(1);
    season = (ended?.[0] as SeasonRow | undefined) ?? null;
  }
  const { data: auth } = await supabase.auth.getUser();
  let needsHandle = false;
  let handle: string | null = null;
  let invited: number | null = null;
  let clubs: ClubOption[] = [];
  if (auth.user) {
    const { data: profile } = await supabase.from("profiles").select("handle").eq("id", auth.user.id).maybeSingle();
    handle = (profile?.handle as string | null | undefined) ?? null;
    needsHandle = !handle;
    if (handle) {
      // Null (count hidden) until migration 0026 is applied.
      const { data: count, error } = await supabase.rpc("my_invite_count");
      invited = error || typeof count !== "number" ? null : count;
    }
    const { data: memberships } = await supabase.from("class_members").select("class_id").eq("student_id", auth.user.id);
    const ids = (memberships ?? []).map((membership) => membership.class_id);
    if (ids.length > 0) {
      const { data: classes } = await supabase.from("classes").select("id, name").in("id", ids).order("name");
      clubs = (classes ?? []) as ClubOption[];
    }
  }
  if (!season) return { season: null, challenges: [], attempts: [], board: [], clubBoard: null, clubs, selectedClub: null, needsHandle, signedIn: Boolean(auth.user), handle, invited };
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
    handle,
    invited,
  };
}

export default async function SeasonsPage({ searchParams }: { searchParams: Promise<{ club?: string | string[]; src?: string | string[] }> }) {
  const { club, src } = await searchParams;
  const { season, challenges, attempts, board, clubBoard, clubs, selectedClub, needsHandle, signedIn, handle, invited } = await load(typeof club === "string" ? club : undefined);
  const inviter = signedIn ? null : inviterFromSrc(typeof src === "string" ? src : null);
  const now = new Date();
  const attemptsByChallenge = new Map(attempts.map((attempt) => [attempt.challenge_id, attempt]));
  const seasonRank = board.find((row) => row.is_you)?.rank ?? null;
  const title = season?.title ?? PLANNED_SEASON.title;
  const starts = season?.starts_on ?? PLANNED_SEASON.startsOn;
  const ends = season?.ends_on ?? PLANNED_SEASON.endsOn;
  const datePhase = seasonPhase(now, starts, ends);
  // Once it has started, the season is over when its last challenge closes.
  const phase: SeasonPhase = season && challenges.length > 0 && datePhase.kind !== "upcoming"
    ? (seasonIsOver(now, ends, challenges.map((c) => c.closes_at)) ? { kind: "ended" } : { kind: "live" })
    : datePhase;

  return (
    <div className={styles.page}>
      <JsonLd data={FAQ_JSON_LD} />
      <section className={styles.section}>
        <div className={styles.wrap}>
          {inviter && <p className={inviteStyles.banner}>@{inviter} invited you to play</p>}
          <p className={seasonStyles.phase} data-kind={phase.kind}>
            <span className={seasonStyles.dot} aria-hidden="true" />
            {phase.kind === "upcoming"
              ? `Opens in ${phase.days} ${phase.days === 1 ? "day" : "days"} · ${readable(starts)}`
              : phase.kind === "live" ? "Live now" : "Season ended"}
          </p>
          <p className={styles.kicker}>Seasons</p>
          <h1 className={styles.h1}>Prove you can do quant work.</h1>
          <p className={styles.lede}>
            {title}: {readable(starts)} to {readable(ends)}. One timed challenge a week, free. Your own numbers, your
            own explanation, ranked under a handle, and a record you can show at the end.
          </p>
          {!signedIn && (
            <div className={styles.ctaRow}>
              <Link href="/sign-up?next=%2Fseasons" className={styles.primary}>Create a free account to play</Link>
              <Link href="/seasons/practice" className={styles.secondary}>Try a practice round</Link>
            </div>
          )}
          {needsHandle && <div style={{ marginTop: "1.5rem" }}><HandleForm /></div>}
          {handle && <InviteCard handle={handle} invited={invited} seasonTitle={title} />}
          <p className={seasonStyles.quiet}>
            {signedIn && <Link href="/seasons/practice" className={seasonStyles.link}>Try the 15-minute practice round</Link>}
            {!signedIn && <Link href="/lessons" className={seasonStyles.link}>Train with the lessons first</Link>}
            {!signedIn && <a href="/seasons/calendar.ics" download className={seasonStyles.link}>Add the challenge dates to your calendar</a>}
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="season-how">
        <div className={styles.wrap}>
          <h2 id="season-how" className={styles.h2}>How a season works</h2>
          <ul className={styles.checks} style={{ maxWidth: "44rem" }}>
            <li>Each week a challenge opens. When you start it, a timer starts too, and the AI tutor switches off until you submit.</li>
            <li>Everyone gets different numbers, so a copied answer won&apos;t match. Sharing code breaks the rules, and top placings are confirmed in a short live conversation.</li>
            <li>You submit your code and a short explanation of why it works. StrikeLab computes your official score after you submit, not in your browser, and usually posts it within a day.</li>
            <li>Leaderboards show handles, never real names. Clubs can play together and get their own board.</li>
            <li>Top finishers and capstones are verified in a short live conversation before they appear on a record.</li>
          </ul>
          {signedIn && <p className={styles.body}><Link href="/record" className={styles.textLink}>See your record →</Link></p>}
        </div>
      </section>

      {!signedIn && <section className={styles.section} aria-labelledby="season-challenges">
        <div className={styles.wrap}>
          <h2 id="season-challenges" className={styles.h2}>This season&apos;s challenges</h2>
          {challenges.length === 0 ? (
            <p className={styles.body}>The challenges appear here when the season is scheduled.</p>
          ) : (
            <ol className={seasonStyles.cards}>
              {challenges.map((c) => {
                const t = getTemplate(c.template_slug);
                const train = trainLinkFor(c.template_slug);
                const status = challengeStatus(now, c.opens_at, c.closes_at);
                return (
                  <li key={c.id} className={seasonStyles.card}>
                    <p className={seasonStyles.week}>Week {c.week}</p>
                    <h3 className={seasonStyles.cardTitle}>{t?.title ?? "Challenge"}</h3>
                    <p className={seasonStyles.meta}>{t?.concept ?? ""} · {c.time_limit_minutes} minutes</p>
                    <p className={seasonStyles.state}>
                      {status === "open" ? (
                        <Link href={`/seasons/${c.id}`} className={styles.textLink}>Open now</Link>
                      ) : status === "upcoming" ? (
                        <span>Opens {readable(c.opens_at.slice(0, 10))}</span>
                      ) : (
                        <span>Closed</span>
                      )}
                    </p>
                    {train && (
                      <p className={seasonStyles.train}>
                        <Link href={`/lesson/${train.lessonId}`} className={seasonStyles.link}>Train first: {train.label}</Link>
                      </p>
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
                        {trainLinkFor(challenge.template_slug) && (
                          <p className={statusStyles.concept}>
                            <Link href={`/lesson/${trainLinkFor(challenge.template_slug)!.lessonId}`} className={seasonStyles.link}>
                              Train first: {trainLinkFor(challenge.template_slug)!.label}
                            </Link>
                          </p>
                        )}
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
          <h2 id="season-board" className={styles.h2}>{season && phase.kind === "ended" ? `${title} final leaderboard` : "Leaderboard"}</h2>
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

      <section className={styles.section} aria-labelledby="season-faq">
        <div className={styles.narrow}>
          <h2 id="season-faq" className={styles.h2}>Questions</h2>
          <Faq items={SEASON_FAQ} />
          <p className={styles.fine}>
            More about StrikeLab itself is in the <Link href="/faq" className={styles.textLink}>full FAQ</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
