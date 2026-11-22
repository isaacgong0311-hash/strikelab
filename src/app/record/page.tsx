import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { CredentialHeader, CredentialSection, PlacingBadge, RulesLink, credentialStyles as styles, type PlacingState } from "@/components/seasons/Credential";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { privatePageMetadata } from "@/lib/seo";
import { linkedInCredential } from "@/lib/record/linkedin";
import { buildSharedRecord } from "@/lib/record/shared";
import { buildRecordView, type RecordAttemptRow, type RecordCapstoneRow, type RecordCertificateRow, type RecordChallengeRow, type RecordSeasonRow, type RecordVerificationRow } from "@/lib/record/viewModel";
import { OFFICIAL_SCORE_MAX } from "@/lib/seasons/limits";
import { SEASON_TIME_ZONE, seasonDate } from "@/lib/seasons/seasonDate";
import { getTemplate } from "@/lib/seasons/templates";
import ShareControls from "./ShareControls";

export const metadata = privatePageMetadata({
  title: "Your record",
  description: "Your season scores, verified capstones, certificates, and private sharing controls.",
});

function date(iso: string | null): string {
  if (!iso) return "Date not recorded";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: SEASON_TIME_ZONE }).format(new Date(iso));
}

/** Concepts assessed in a season, in week order, from its public challenge slots. */
function topicsFor(challenges: (RecordChallengeRow & { template_slug?: string })[], seasonId: string): string[] {
  const concepts = challenges
    .filter((challenge) => challenge.season_id === seasonId)
    .sort((a, b) => a.week - b.week)
    .map((challenge) => (challenge.template_slug ? getTemplate(challenge.template_slug)?.concept : undefined))
    .filter((concept): concept is string => Boolean(concept));
  return [...new Set(concepts)];
}

export default async function RecordPage() {
  await connection();
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/sign-in?next=%2Frecord");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/sign-in?next=%2Frecord");

  const admin = getSupabaseAdmin();
  const [seasonResult, capstoneResult, verificationResult, shareResult, profileResult, certificateResult] = await Promise.all([
    supabase.from("seasons").select("id, title, ends_on").order("starts_on", { ascending: false }),
    supabase.from("capstone_submissions").select("id, title, status, submitted_at").eq("user_id", auth.user.id).order("submitted_at", { ascending: false }),
    supabase.from("verifications").select("kind, subject_id, verified_at").eq("user_id", auth.user.id),
    supabase.from("record_shares").select("token, revoked_at").eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("profiles").select("handle").eq("id", auth.user.id).maybeSingle(),
    admin ? admin.from("certificates").select("id, track_id, issued_at").eq("user_id", auth.user.id).order("issued_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
  ]);
  const seasons = (seasonResult.data ?? []) as RecordSeasonRow[];
  const challengeResult = seasons.length > 0
    ? await supabase.from("season_challenges").select("id, season_id, week, template_slug").in("season_id", seasons.map((season) => season.id))
    : { data: [], error: null };
  const challenges = (challengeResult.data ?? []) as (RecordChallengeRow & { template_slug?: string })[];
  const attemptResult = challenges.length > 0
    ? await supabase.from("season_attempts").select("challenge_id, status, official_score")
      .eq("user_id", auth.user.id).in("challenge_id", challenges.map((challenge) => challenge.id))
    : { data: [], error: null };
  const ranks: Record<string, number | null> = {};
  await Promise.all(seasons.map(async (season) => {
    const { data: board } = await supabase.rpc("season_leaderboard", { p_season_id: season.id, p_class_id: null });
    ranks[season.id] = board?.find((row: { is_you: boolean }) => row.is_you)?.rank ?? null;
  }));
  const verifications = (verificationResult.data ?? []) as RecordVerificationRow[];
  const view = buildRecordView(
    seasonDate(new Date()), seasons, challenges,
    (attemptResult.data ?? []) as RecordAttemptRow[], ranks,
    verifications,
    (capstoneResult.data ?? []) as RecordCapstoneRow[],
    (certificateResult.data ?? []) as RecordCertificateRow[],
  );
  const verificationReady = !verificationResult.error && !shareResult.error;
  const seasonReady = !seasonResult.error && !challengeResult.error && !attemptResult.error;
  const capstoneReady = !capstoneResult.error;
  const certificateReady = Boolean(admin) && !certificateResult.error;
  const activeToken = shareResult.data && !shareResult.data.revoked_at ? shareResult.data.token as string : null;
  const handle = (profileResult.data?.handle as string | null | undefined) ?? null;
  // What the public link would show, so the LinkedIn prefill names exactly that.
  const shared = handle ? buildSharedRecord({ handle, items: verifications }) : null;
  const credential = shared
    ? linkedInCredential(shared, Object.fromEntries(seasons.map((season) => [season.id, season.title])))
    : null;
  const seasonTitles = view.seasons.map((season) => season.title);
  const assessed = [...new Set(view.seasons.flatMap((season) => topicsFor(challenges, season.id)))];

  return (
    <div className={styles.page}>
      <CredentialHeader
        visibility="Private · only you can see this page"
        title="Your record"
        lede="Your season scores and the work behind them. Placings stay provisional until they're confirmed in a short live defense."
        facts={[
          { label: "Issued by", value: "StrikeLab" },
          { label: "Holder", value: handle ? `@${handle}` : "No handle yet" },
          { label: "Seasons", value: seasonTitles.length ? seasonTitles.join(", ") : "None yet" },
          { label: "As of", value: date(new Date().toISOString()) },
          { label: "Assessed", value: assessed.length ? assessed.join(", ") : "Shown once you compete" },
          { label: "Rules", value: <RulesLink /> },
        ]}
      />
      {!verificationReady && <p className={styles.notice} role="status">Verification and sharing are unavailable until the record database is set up.</p>}

      <CredentialSection id="record-seasons" title="Seasons" meta={seasonReady ? `${view.seasons.length} played` : "Unavailable"}>
        {!seasonReady ? <p className={styles.empty}>Season history is unavailable right now.</p> : view.seasons.length === 0 ? (
          <p className={styles.empty}>Your season scores will appear here after you compete. <Link href="/seasons" className={styles.inlineLink}>See the season</Link></p>
        ) : <ul className={styles.rows}>{view.seasons.map((season) => {
          const state: PlacingState = season.placingVerifiedAt
            ? { kind: "verified", at: season.placingVerifiedAt }
            : season.finished && (season.rank === null || season.rank > 10) ? { kind: "final" } : { kind: "provisional" };
          const topics = topicsFor(challenges, season.id);
          const weeks = challenges.filter((challenge) => challenge.season_id === season.id).length;
          return (
            <li className={styles.row} key={season.id}>
              <div className={styles.rowHead}>
                <h3>{season.title}</h3>
                {season.rank !== null && <PlacingBadge state={state} date={date} />}
              </div>
              {topics.length > 0 && <p className={styles.rowText}>Tested: {topics.join(", ")}</p>}
              <dl className={styles.stats}>
                <div><dt>{season.finished ? "Final placing" : "Current placing"}</dt><dd className={styles.figure}>{season.rank === null ? "Unranked" : `#${season.rank}`}</dd></div>
                <div><dt>Scored</dt><dd className={styles.figure}>{season.scoredCount} / {weeks || season.scoredCount}</dd></div>
              </dl>
              {season.scores.length > 0 ? (
                <table className={styles.scores}>
                  <caption className="sl-visually-hidden">{season.title} official scores, out of {OFFICIAL_SCORE_MAX}</caption>
                  <tbody>{season.scores.map((score) => (
                    <tr key={score.week}><th scope="row">Week {score.week}</th><td className={styles.figure}>{score.score} / {OFFICIAL_SCORE_MAX}</td></tr>
                  ))}</tbody>
                </table>
              ) : <p className={styles.rowText}>No official scores posted yet. <Link href="/seasons" className={styles.inlineLink}>See your season status</Link></p>}
              {state.kind === "provisional" && season.rank !== null && (
                <p className={styles.note}>
                  {season.finished
                    ? verificationReady ? "Placing not yet verified. Top-10 placings are confirmed in a short live defense." : "Placing not yet verified."
                    : "Ranks can change until the last challenge closes."}
                </p>
              )}
              {state.kind === "final" && season.rank !== null && <p className={styles.note}>Only top-10 placings go to a live defense.</p>}
            </li>
          );
        })}</ul>}
      </CredentialSection>

      <CredentialSection id="record-capstones" title="Capstones" meta={capstoneReady ? `${view.capstones.length} submitted` : "Unavailable"}>
        {!capstoneReady ? <p className={styles.empty}>Capstones are unavailable right now.</p> : view.capstones.length === 0 ? (
          <p className={styles.empty}>A capstone is the project you build and explain after training. <Link href="/clubs" className={styles.inlineLink}>Explore clubs</Link></p>
        ) : <ul className={styles.rows}>{view.capstones.map((capstone) => (
          <li className={styles.row} key={capstone.id}>
            <div className={styles.rowHead}>
              <h3>{capstone.title}</h3>
              <PlacingBadge state={capstone.verifiedAt ? { kind: "verified", at: capstone.verifiedAt } : { kind: "provisional" }} date={date} />
            </div>
            <p className={styles.rowText}>
              Submitted {date(capstone.submittedAt)}.{" "}
              {capstone.verifiedAt ? `Verified in a live conversation on ${date(capstone.verifiedAt)}.` : "Verification has not been recorded yet."}
            </p>
          </li>
        ))}</ul>}
      </CredentialSection>

      <CredentialSection id="record-certificates" title="Certificates" meta={`${view.certificates.length} earned`}>
        {!certificateReady ? <p className={styles.empty}>Certificates are unavailable right now.</p> : view.certificates.length === 0 ? (
          <p className={styles.empty}>Finish every lesson in a track to earn a certificate. <Link href="/lessons" className={styles.inlineLink}>Continue training</Link></p>
        ) : <ul className={styles.rows}>{view.certificates.map((certificate) => (
          <li className={`${styles.row} ${styles.rowHead}`} key={certificate.id}>
            <Link href={certificate.href} className={styles.inlineLink}>{certificate.title} certificate</Link>
            <span className={styles.rowText}>Issued {date(certificate.issuedAt)}</span>
          </li>
        ))}</ul>}
      </CredentialSection>

      <CredentialSection id="record-share" title="Share your verified work">
        <p className={styles.rowText}>
          A shared link is permanent until you revoke it. It shows your handle and verified items only: never your name,
          email or unverified scores. Revoking it turns the old link off for good.
        </p>
        <ShareControls initialToken={activeToken} hasHandle={Boolean(handle)} ready={verificationReady} credential={credential} />
      </CredentialSection>
    </div>
  );
}
