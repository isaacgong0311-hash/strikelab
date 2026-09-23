import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { buildDemoData, DEMO_CLASS_NAME } from "@/lib/demo/fixtures";
import CohortHomeView from "@/app/cohort/[classId]/CohortHomeView";
import CohortScorecard from "@/app/dashboard/class/[id]/CohortScorecard";
import LeaderToolkit from "@/app/dashboard/class/[id]/LeaderToolkit";
import styles from "./demo.module.css";

export const metadata = pageMetadata({
  path: "/demo",
  title: "Demo: the teacher and student views",
  description:
    "Click through a sample club running StrikeLab's six-week quant lab: the teacher scorecard, the weekly plan, and what students see. No signup.",
});

// Sample dates are relative to today (always mid week 3).
export const revalidate = 3600;

type View = "teacher" | "student";

export default async function DemoPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view: raw } = await searchParams;
  const view: View = raw === "student" ? "student" : "teacher";
  const demo = buildDemoData();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.kicker}>Live demo · sample data</p>
        <h1 className={styles.title}>See a club three weeks into the lab</h1>
        <p className={styles.lede}>
          This is the real StrikeLab interface running on a fictional club of ten students. Nothing here is a
          screenshot, and nothing you click is saved.
        </p>
        <nav className={styles.tabs} aria-label="Demo view">
          <Link href="/demo?view=teacher" className={styles.tab} aria-current={view === "teacher" ? "page" : undefined}>
            Teacher view
          </Link>
          <Link href="/demo?view=student" className={styles.tab} aria-current={view === "student" ? "page" : undefined}>
            Student view
          </Link>
        </nav>
      </header>

      <p className={styles.banner} role="note">
        <strong>Sample data.</strong> {DEMO_CLASS_NAME} and its students are made up.{" "}
        <Link href="/pilot">Start a free pilot</Link> to see your own club.
      </p>

      {view === "teacher" ? (
        <div className={styles.stack}>
          <CohortScorecard
            scorecard={{ measurable: true, metrics: demo.metrics, csv: demo.csv }}
            className={DEMO_CLASS_NAME}
            classId="demo"
            capstoneHrefPrefix="/demo/capstone/"
          />
          <LeaderToolkit classId="demo" metrics={demo.metrics} assignments={demo.assignments} />
        </div>
      ) : (
        <div className={styles.phoneFrame}>
          <CohortHomeView
            classId="demo"
            className={DEMO_CLASS_NAME}
            view={demo.studentView}
            capstone={{ status: "none" }}
            capstoneHref="/demo/capstone/option-pricing"
            embedded
          />
        </div>
      )}

      <section className={styles.cta} aria-labelledby="demo-cta-title">
        <h2 id="demo-cta-title" className={styles.ctaTitle}>Run this with your club</h2>
        <p className={styles.lede}>Free for your pilot. Setup takes about three minutes, and every student joins with one link.</p>
        <div className={styles.ctaRow}>
          <Link href="/pilot" className={styles.primary}>Start a free pilot</Link>
          <Link href="/learn/inv-1.1" className={styles.secondary}>Try the first lesson</Link>
        </div>
      </section>
    </div>
  );
}
