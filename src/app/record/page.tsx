import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { privatePageMetadata } from "@/lib/seo";
import { buildRecordView, type RecordAttemptRow, type RecordCapstoneRow, type RecordCertificateRow, type RecordChallengeRow, type RecordSeasonRow, type RecordVerificationRow } from "@/lib/record/viewModel";
import ShareControls from "./ShareControls";
import styles from "./record.module.css";

export const metadata = privatePageMetadata({
  title: "Your record",
  description: "Your season scores, verified capstones, certificates, and private sharing controls.",
});

function date(iso: string | null): string {
  if (!iso) return "Date not recorded";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso));
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
    ? await supabase.from("season_challenges").select("id, season_id, week").in("season_id", seasons.map((season) => season.id))
    : { data: [], error: null };
  const challenges = (challengeResult.data ?? []) as RecordChallengeRow[];
  const attemptResult = challenges.length > 0
    ? await supabase.from("season_attempts").select("challenge_id, status, official_score")
      .eq("user_id", auth.user.id).in("challenge_id", challenges.map((challenge) => challenge.id))
    : { data: [], error: null };
  const ranks: Record<string, number | null> = {};
  await Promise.all(seasons.map(async (season) => {
    const { data: board } = await supabase.rpc("season_leaderboard", { p_season_id: season.id, p_class_id: null });
    ranks[season.id] = board?.find((row: { is_you: boolean }) => row.is_you)?.rank ?? null;
  }));
  const view = buildRecordView(
    new Date().toISOString().slice(0, 10), seasons, challenges,
    (attemptResult.data ?? []) as RecordAttemptRow[], ranks,
    (verificationResult.data ?? []) as RecordVerificationRow[],
    (capstoneResult.data ?? []) as RecordCapstoneRow[],
    (certificateResult.data ?? []) as RecordCertificateRow[],
  );
  const verificationReady = !verificationResult.error && !shareResult.error;
  const seasonReady = !seasonResult.error && !challengeResult.error && !attemptResult.error;
  const capstoneReady = !capstoneResult.error;
  const certificateReady = Boolean(admin) && !certificateResult.error;
  const activeToken = shareResult.data && !shareResult.data.revoked_at ? shareResult.data.token as string : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Train → Compete → Prove → Record</p>
        <h1>Your record</h1>
        <p>Your work and the proof behind it, in one place. Only you can see this page.</p>
      </header>
      {!verificationReady && <p className={styles.notice} role="status">Verification and sharing are unavailable until the record database is set up.</p>}

      <section className={styles.section} aria-labelledby="record-seasons">
        <div className={styles.sectionHead}><h2 id="record-seasons">Seasons</h2><span>{seasonReady ? `${view.seasons.length} played` : "Unavailable"}</span></div>
        {!seasonReady ? <div className={styles.empty}><p>Season history is unavailable right now.</p></div> : view.seasons.length === 0 ? (
          <div className={styles.empty}><p>Your season scores will appear here after you compete.</p><Link href="/seasons">Explore the season →</Link></div>
        ) : <div className={styles.cards}>{view.seasons.map((season) => (
          <article className={styles.card} key={season.id}>
            <div className={styles.cardHead}><h3>{season.title}</h3>{season.placingVerified && <span className={styles.verified}>Verified placing</span>}</div>
            <p>{season.scoredCount} {season.scoredCount === 1 ? "challenge" : "challenges"} scored · {season.finished ? "Final" : "Current"} rank: {season.rank ?? "Unavailable"}</p>
            {season.finished && season.rank !== null && season.rank <= 10 && !season.placingVerified && verificationReady && <p className={styles.pending}>Placing not yet verified.</p>}
            {season.scores.length > 0 ? (
              <ul className={styles.scoreList}>{season.scores.map((score) => <li key={score.week}><span>Week {score.week}</span><strong>{score.score}/100</strong></li>)}</ul>
            ) : <p>No official scores posted yet. <Link href="/seasons">See your season status</Link>.</p>}
          </article>
        ))}</div>}
      </section>

      <section className={styles.section} aria-labelledby="record-capstones">
        <div className={styles.sectionHead}><h2 id="record-capstones">Capstones</h2><span>{capstoneReady ? `${view.capstones.length} submitted` : "Unavailable"}</span></div>
        {!capstoneReady ? <div className={styles.empty}><p>Capstones are unavailable right now.</p></div> : view.capstones.length === 0 ? (
          <div className={styles.empty}><p>A capstone is the project you build and explain after training.</p><Link href="/clubs">Explore clubs →</Link></div>
        ) : <div className={styles.cards}>{view.capstones.map((capstone) => (
          <article className={styles.card} key={capstone.id}>
            <div className={styles.cardHead}><h3>{capstone.title}</h3>{capstone.verifiedAt && <span className={styles.verified}>Verified</span>}</div>
            <p>Submitted {date(capstone.submittedAt)}.</p>
            {capstone.verifiedAt ? <p>Verified in a live conversation on {date(capstone.verifiedAt)}.</p> : <p>Verification has not been recorded yet.</p>}
          </article>
        ))}</div>}
      </section>

      <section className={styles.section} aria-labelledby="record-certificates">
        <div className={styles.sectionHead}><h2 id="record-certificates">Certificates</h2><span>{view.certificates.length} earned</span></div>
        {!certificateReady ? <div className={styles.empty}><p>Certificates are unavailable right now.</p></div> : view.certificates.length === 0 ? (
          <div className={styles.empty}><p>Finish every lesson in a track to earn a certificate.</p><Link href="/lessons">Continue training →</Link></div>
        ) : <ul className={styles.certificateList}>{view.certificates.map((certificate) => (
          <li key={certificate.id}><Link href={certificate.href}>{certificate.title} certificate</Link><span>Issued {date(certificate.issuedAt)}</span></li>
        ))}</ul>}
      </section>

      <section className={styles.share} aria-labelledby="record-share">
        <div><p className={styles.kicker}>Your choice</p><h2 id="record-share">Share your verified work</h2><p>A shared link shows your handle and verified items only. You can revoke it at any time.</p></div>
        <ShareControls initialToken={activeToken} hasHandle={Boolean(profileResult.data?.handle)} ready={verificationReady} />
      </section>
    </div>
  );
}
