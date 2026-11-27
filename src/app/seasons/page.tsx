import Link from "next/link";
import { ActionLink } from "@/components/ui/Action";
import Faq from "@/components/marketing/Faq";
import JsonLd from "@/components/JsonLd";
import { SEASON_FAQ } from "@/lib/seasons/faq";
import styles from "@/components/marketing/marketing.module.css";
import { pageMetadata } from "@/lib/seo";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/seasons/templates";
import { PLANNED_SEASON, seasonPhase, type SeasonPhase } from "@/lib/seasons/planned";
import { pickDisplaySeason, seasonDate, seasonIsOver } from "@/lib/seasons/seasonDate";
import { trainLinkFor } from "@/lib/seasons/train";
import seasonStyles from "./seasons.module.css";
import { remainingLabel, statusForWeek, type OwnAttempt } from "@/lib/seasons/status";
import LeaderboardTable, { type LeaderboardRow } from "@/components/seasons/LeaderboardTable";
import HandleForm from "./HandleForm";
import InviteCard from "./InviteCard";
import inviteStyles from "./invite.module.css";
import { inviterFromSrc } from "@/lib/seasons/invite";
import SeasonPath, { type PathChallengeProps } from "./SeasonPath";
import SeasonHud from "./SeasonHud";
import { seasonPoints } from "@/lib/seasons/path";
import { OFFICIAL_SCORE_MAX } from "@/lib/seasons/limits";
import { getLessonById } from "@/lib/lessons";
import NextChallenge from "./NextChallenge";
import { countdown, easternWhen, nextChallenge } from "@/lib/seasons/countdown";
import boardStyles from "./board.module.css";

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

/** "Mon, Nov 30" in New York time, for a challenge's opening moment. */
function shortDay(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" }).format(new Date(iso));
}

function readable(date: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

async function load(requestedClubId: string | undefined) {
  const supabase = await getSupabaseServer();
  if (!supabase) return { season: null, challenges: [], attempts: [], board: [], clubBoard: null, clubs: [], selectedClub: null, needsHandle: false, signedIn: false, handle: null, invited: null };
  // The current or next season by the New York calendar day; between seasons,
  // the one that just ended, with its final board, instead of an empty page.
  const { data: seasons } = await supabase.from("seasons").select("id, title, starts_on, ends_on");
  const season = pickDisplaySeason((seasons ?? []) as SeasonRow[], seasonDate(new Date()));
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
  // Before the first row is seeded, count down to the planned start instead.
  const next = phase.kind === "ended" ? null : nextChallenge(now, challenges, season && challenges.length > 0 ? null : starts);
  const nextTarget = next ? (next.kind === "opens" ? next.opensAt : next.closesAt) : null;
  const weekWords = ["", "one", "two", "three", "four", "five", "six", "seven", "eight"];
  const calendarLabel = challenges.length > 1
    ? `Add all ${weekWords[challenges.length] ?? challenges.length} to your calendar`
    : !season || challenges.length === 0 ? "Add the start date to your calendar" : "Add it to your calendar";

  const views = challenges.map((challenge) => statusForWeek(now, challenge, attemptsByChallenge.get(challenge.id) ?? null, seasonRank));
  const pathChallenges: PathChallengeProps[] = challenges.map((challenge, i) => {
    const template = getTemplate(challenge.template_slug);
    const train = trainLinkFor(challenge.template_slug);
    const view = views[i];
    return {
      id: challenge.id,
      week: challenge.week,
      templateSlug: challenge.template_slug,
      title: template?.title ?? "Challenge",
      concept: template?.concept ?? `Week ${challenge.week}`,
      minutes: challenge.time_limit_minutes,
      view,
      train: train ? { lessonId: train.lessonId, title: train.label, duration: getLessonById(train.lessonId)?.duration ?? null } : null,
      initialText: view.kind === "upcoming" ? remainingLabel(now, view.opensAt) : "",
      opensLabel: shortDay(challenge.opens_at),
    };
  });
  const { points, max } = seasonPoints(views, OFFICIAL_SCORE_MAX);
  const minutes = challenges[0]?.time_limit_minutes ?? 60;
  const count = challenges.length || 3;
  const pathId = signedIn ? "your-status" : "season-challenges";

  return (
    <div className={`${styles.page} ${seasonStyles.page}`}>
      <JsonLd data={FAQ_JSON_LD} />
      <section className={seasonStyles.hero}>
        <div className={`${styles.wrap} ${seasonStyles.heroGrid}`}>
          <div>
            {inviter && <p className={inviteStyles.banner}>@{inviter} invited you to play</p>}
            <p className={seasonStyles.phase} data-kind={phase.kind}>
              <span className={seasonStyles.dot} aria-hidden="true" />
              {phase.kind === "upcoming"
                ? `Starts ${readable(starts)}`
                : phase.kind === "live" ? "Live now" : "Season ended"}
            </p>
            <h1 className={seasonStyles.h1}>Three weeks to prove you can do quant.</h1>
            <p className={seasonStyles.lede}>
              {title}: {readable(starts)} to {readable(ends)}. One timed Python challenge a week, with numbers nobody
              else gets. Train between them, climb the board under a handle, and finish with a record you can show.
            </p>
            <ul className={seasonStyles.facts} aria-label="Season at a glance">
              <li>{count} challenges</li>
              <li>{minutes} minutes each</li>
              <li>Free</li>
              <li>Handles, never names</li>
            </ul>
            {!signedIn && (
              <div className={seasonStyles.ctas}>
                <ActionLink href="/sign-up?next=%2Fseasons" className={seasonStyles.chunky}>{phase.kind === "ended" ? "Create a free account" : "Create a free account to play"}</ActionLink>
                <ActionLink href="/seasons/practice" variant="secondary" className={seasonStyles.chunkySecondary}>Try a practice round</ActionLink>
              </div>
            )}
          </div>
          {next && nextTarget && (
            <NextChallenge next={next} initial={countdown(now, nextTarget)} when={easternWhen(nextTarget)} calendarLabel={calendarLabel} />
          )}
        </div>
      </section>

      {signedIn && (
        <div className={styles.wrap}>
          <SeasonHud handle={handle} points={points} max={max} rank={seasonRank} />
        </div>
      )}

      <section className={seasonStyles.main} aria-labelledby={pathId}>
        <div className={`${styles.wrap} ${seasonStyles.mainGrid}`}>
          <div>
            {needsHandle && <div className={`${seasonStyles.railCard} ${seasonStyles.handleFirst}`}><HandleForm /></div>}
            <h2 id={pathId} className={seasonStyles.h2}>{signedIn ? "Your season path" : "The season path"}</h2>
            <p className={seasonStyles.sub}>
              {signedIn
                ? "Work down the path. Lessons are open any time; each challenge unlocks on its day."
                : "Every step is open to look at. Lessons and the warm-up need no account; challenges need one."}
            </p>
            {challenges.length === 0 ? (
              <p className={styles.body}>The challenges appear here when the season is scheduled.</p>
            ) : (
              <SeasonPath challenges={pathChallenges} signedIn={signedIn} serverNow={now.toISOString()} handle={handle} />
            )}
          </div>
          <aside className={seasonStyles.rail} aria-label="Season tools">
            {handle && <InviteCard handle={handle} invited={invited} seasonTitle={title} />}
            <section className={seasonStyles.railCard} aria-labelledby="season-how">
              <h2 id="season-how" className={seasonStyles.railTitle}>How a season works</h2>
              <ul className={seasonStyles.rules}>
                <li><strong>Timed, solo.</strong> Starting a challenge starts its clock, and the AI tutor switches off until you submit.</li>
                <li><strong>Your own numbers.</strong> Everyone gets different inputs, so a copied answer won&apos;t match.</li>
                <li><strong>Code plus a why.</strong> You submit code and a short explanation. Official scores are computed on our servers, usually within a day.</li>
                <li><strong>Handles only.</strong> Boards never show real names. Clubs get their own board.</li>
                <li><strong>Checked at the top.</strong> Top placings are confirmed in a short live conversation before they go on a record.</li>
              </ul>
              {signedIn && <p className={seasonStyles.railLink}><Link href="/record" className={seasonStyles.link}>See your record →</Link></p>}
            </section>
          </aside>
        </div>
      </section>

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
