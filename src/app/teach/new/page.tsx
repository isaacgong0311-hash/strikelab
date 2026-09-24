import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { privatePageMetadata } from "@/lib/seo";
import SetupWizard from "./SetupWizard";
import styles from "../teach.module.css";

export const metadata = privatePageMetadata({
  title: "Set up your class",
  description: "Set up the six-week Quant Foundations Lab for your club or class in a few minutes.",
});

export default async function TeachNewPage({ searchParams }: { searchParams: Promise<{ src?: string }> }) {
  // Per-request: depends on the signed-in user and today's date, even on a build without Supabase env.
  await connection();
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return (
      <div className={`${styles.shell} ${styles.narrow}`}>
        <h1 className={styles.title}>Class setup isn&apos;t available here</h1>
        <p className={styles.muted}>This copy of StrikeLab isn&apos;t connected to a database.</p>
      </div>
    );
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    // Sign-up keeps ?src= (signup_source) and returns here after auth.
    const { src } = await searchParams;
    const params = new URLSearchParams({ next: "/teach/new" });
    if (src) params.set("src", src.slice(0, 64));
    redirect(`/sign-up?${params}`);
  }

  return (
    <div className={`${styles.shell} ${styles.narrow}`}>
      <SetupWizard />
    </div>
  );
}
