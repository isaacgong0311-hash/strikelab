import Link from "next/link";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";
import { buildDemoData, DEMO_CLASS_NAME } from "@/lib/demo/fixtures";
import { EXAMPLE_CAPSTONES } from "@/lib/demo/exampleCapstones";
import type { TourSceneId } from "@/lib/demo/tour";
import { LAB_WEEKS } from "@/lib/marketing/lab";
import { getLessonById } from "@/lib/tracks";
import CapstoneView from "@/app/capstone/CapstoneView";
import CohortHomeView from "@/app/cohort/[classId]/CohortHomeView";
import CohortScorecard from "@/app/dashboard/class/[id]/CohortScorecard";
import LeaderToolkit from "@/app/dashboard/class/[id]/LeaderToolkit";
import TrackPageView from "@/components/marketing/TrackPageView";
import DemoKickoff from "./DemoKickoff";
import GuidedTour from "./GuidedTour";
import tour from "./tour.module.css";
import styles from "./demo.module.css";

export const metadata = pageMetadata({
  path: "/demo",
  title: "Demo: the teacher and student views",
  description:
    "Click through a sample club running StrikeLab's six-week quant lab: the teacher scorecard, the weekly plan, and what students see. No signup.",
});

// Sample dates are relative to today (always mid week 3).
export const revalidate = 3600;

type View = "teacher" | "student" | "tour";

export default async function DemoPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view: raw } = await searchParams;
  const view: View = raw === "student" || raw === "tour" ? raw : "teacher";
  const demo = buildDemoData();

  return (
    <div className={styles.shell}>
      <TrackPageView event="demo_open" props={{ view }} />
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
          <Link href="/demo?view=tour" className={styles.tab} aria-current={view === "tour" ? "page" : undefined}>
            Watch the six weeks
          </Link>
        </nav>
      </header>

      <p className={styles.banner} role="note">
        <strong>Sample data.</strong> {DEMO_CLASS_NAME} and its students are made up.{" "}
        <Link href="/pilot?src=demo-banner">Start a free pilot</Link> to see your own club.
      </p>

      {view === "tour" ? (
        <GuidedTour visuals={tourVisuals()} />
      ) : view === "teacher" ? (
        <div className={styles.stack}>
          <CohortScorecard
            scorecard={{ measurable: true, metrics: demo.metrics, csv: demo.csv }}
            className={DEMO_CLASS_NAME}
            classId="demo"
            capstoneHrefPrefix="/demo/capstone/"
          />
          <DemoKickoff />
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
          <Link href="/pilot?src=demo" className={styles.primary}>Start a free pilot</Link>
          <Link href="/learn/inv-1.1" className={styles.secondary}>Try the first lesson</Link>
        </div>
      </section>
    </div>
  );
}

/**
 * The guided tour's scenes, rendered on the server from the real components
 * with the sample club at different points in the program. The kickoff scene
 * is animated in GuidedTour itself.
 */
function tourVisuals(): Partial<Record<TourSceneId, ReactNode>> {
  const now = new Date();
  const week1 = buildDemoData(now, { daysIn: 2 });
  const week3 = buildDemoData(now);
  const week4 = buildDemoData(now, { daysIn: 24 });
  const end = buildDemoData(now, { daysIn: 44 });
  const lesson3 = getLessonById("3");
  const scorecard = (d: ReturnType<typeof buildDemoData>) => (
    <CohortScorecard
      scorecard={{ measurable: true, metrics: d.metrics, csv: d.csv }}
      className={DEMO_CLASS_NAME}
      classId="demo"
      capstoneHrefPrefix="/demo/capstone/"
    />
  );

  return {
    setup: (
      <div className={tour.card}>
        <ol className={tour.weeks}>
          {LAB_WEEKS.map((w) => (
            <li key={w.week} className={tour.week}>
              <p className={tour.weekLabel}>Week {w.week}</p>
              <p className={tour.weekTitle}>{w.title}</p>
              <p className={tour.weekBuilds}>{w.builds}</p>
            </li>
          ))}
        </ol>
        <p className={tour.joinLink}>strikelab.dev/join/DEMO42</p>
        <p className={tour.note}>Sample join link. Students sign up with it in about a minute; there is nothing to install.</p>
      </div>
    ),
    "student-week": (
      <div className={styles.phoneFrame}>
        <CohortHomeView
          classId="demo"
          className={DEMO_CLASS_NAME}
          view={week1.studentView}
          capstone={{ status: "none" }}
          capstoneHref="/demo/capstone/option-pricing"
          embedded
        />
      </div>
    ),
    code: lesson3 ? (
      <div className={tour.card}>
        <p className={tour.prompt}>
          Lesson 3 · {lesson3.title}: {lesson3.exercise.prompt.replace(/`/g, "")}
        </p>
        <pre className={tour.code}>
          <code>{lesson3.exercise.starterCode.trim()}</code>
        </pre>
        <p className={tour.note}>
          This is the real exercise. Students fill in the function, press Run, and tests check the price in the browser.{" "}
          <Link href="/lesson/3">Open lesson 3</Link>
        </p>
      </div>
    ) : null,
    "week-3": scorecard(week3),
    "week-4": scorecard(week4),
    capstone: <CapstoneView data={EXAMPLE_CAPSTONES[0]} byline="Example by the StrikeLab team" label="Example" />,
    outcome: scorecard(end),
  };
}
