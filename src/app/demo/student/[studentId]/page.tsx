import Link from "next/link";
import { notFound } from "next/navigation";
import StudentWorkView from "@/components/teach/StudentWorkView";
import TrackPageView from "@/components/marketing/TrackPageView";
import { buildDemoData, DEMO_CLASS_NAME, DEMO_TZ, demoStudentSubmissions, STUDENTS } from "@/lib/demo/fixtures";
import { pageMetadata } from "@/lib/seo";
import { buildStudentWork } from "@/lib/teach/studentWork";
import styles from "../../demo.module.css";

export const metadata = pageMetadata({
  path: "/demo/student",
  title: "Demo: one student's work, as their leader sees it",
  description: "See a sample student's lessons, due dates and the Python they wrote, from the leader's side of StrikeLab.",
});

// Sample dates are relative to today, like /demo.
export const revalidate = 3600;

export function generateStaticParams() {
  return STUDENTS.map((s) => ({ studentId: s.id }));
}

export default async function DemoStudentPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const demo = buildDemoData();
  const metrics = demo.metrics.students.find((s) => s.studentId === studentId);
  if (!metrics) notFound();

  const work = buildStudentWork({
    assignments: demo.assignments,
    completions: demo.completions.filter((c) => c.studentId === studentId),
    submissions: demoStudentSubmissions(demo, studentId),
    today: demo.today,
    timezone: DEMO_TZ,
  });

  return (
    <div className={styles.shell}>
      <TrackPageView event="demo_open" props={{ view: "student-work" }} />
      <p className={styles.banner} role="note">
        <strong>Sample data.</strong> {metrics.displayName} is a made-up student in {DEMO_CLASS_NAME}; the code shown
        is StrikeLab&rsquo;s reference solutions. <Link href="/pilot?src=demo-student">Start a free pilot</Link> to see
        your own students.
      </p>
      <StudentWorkView
        name={metrics.displayName}
        className={`${DEMO_CLASS_NAME} (demo)`}
        backHref="/demo"
        joinedOn={metrics.joinedOn}
        lastActiveOn={metrics.lastActiveOn}
        work={work}
        metrics={metrics}
        timezone={DEMO_TZ}
        capstoneHref={metrics.capstone ? `/demo/capstone/${metrics.capstone.id}` : null}
      />
    </div>
  );
}
