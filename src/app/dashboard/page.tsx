import Link from "next/link";
import { connection } from "next/server";
import DashboardClient from "./DashboardClient";
import StudentHomeClient from "./StudentHomeClient";
import { dashboardSeasonAction, type DashboardAttempt, type DashboardChallenge } from "@/lib/seasons/dashboard";
import { getTemplate } from "@/lib/seasons/templates";
import { privatePageMetadata } from "@/lib/seo";
import { getSupabaseServer } from "@/lib/supabase/server";
import styles from "./studentHome.module.css";

export const metadata = privatePageMetadata({
  title: "Dashboard",
  description: "Your season challenge, next lesson, training progress, and record in one place.",
});

export default async function DashboardPage() {
  await connection();
  const supabase = await getSupabaseServer();
  const { data: auth } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!supabase || !auth.user) return <DashboardClient />;

  const today = new Date().toISOString().slice(0, 10);
  const { data: seasons } = await supabase.from("seasons")
    .select("id, title").gte("ends_on", today).order("starts_on").limit(1);
  const season = seasons?.[0] ?? null;
  const { data: challengeRows } = season
    ? await supabase.from("season_challenges")
      .select("id, week, template_slug, opens_at, closes_at")
      .eq("season_id", season.id).order("week")
    : { data: [] };
  const challenges = (challengeRows ?? []) as DashboardChallenge[];
  const { data: attemptRows } = challenges.length > 0
    ? await supabase.from("season_attempts")
      .select("challenge_id, status, deadline, official_score")
      .eq("user_id", auth.user.id)
      .in("challenge_id", challenges.map((challenge) => challenge.id))
    : { data: [] };
  const action = dashboardSeasonAction(new Date(), challenges, (attemptRows ?? []) as DashboardAttempt[]);
  const template = action.challenge ? getTemplate(action.challenge.template_slug) : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Train → Compete → Prove → Record</p>
        <h1>Your home</h1>
      </header>
      <section className={styles.season} aria-labelledby="home-season-title">
        <div className={styles.seasonCopy}>
          <p className={styles.seasonEyebrow}>{season?.title ?? "The next season"} · {action.challenge ? `Week ${action.challenge.week}` : "Get ready"}</p>
          <h2 id="home-season-title">{template?.title ?? "Your season starts here"}</h2>
          <p>{action.summary}</p>
        </div>
        <Link className={styles.seasonAction} href={action.href}>{action.actionLabel} <span aria-hidden="true">→</span></Link>
      </section>
      <StudentHomeClient />
    </div>
  );
}
