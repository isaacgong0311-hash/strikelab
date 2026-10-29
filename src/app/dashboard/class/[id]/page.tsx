import ClassRosterClient from "./ClassRosterClient";
import { parseWorkspaceTab } from "./workspaceTabs";
import { privatePageMetadata } from "@/lib/seo";
import { getSupabaseServer } from "@/lib/supabase/server";

export const metadata = privatePageMetadata({
  title: "Class workspace",
  description: "Students, progress, plan and settings for your StrikeLab class.",
});

export default async function ClassRosterPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const [{ tab }, supabase] = await Promise.all([searchParams, getSupabaseServer()]);
  const today = new Date().toISOString().slice(0, 10);
  const { data: seasons } = supabase
    ? await supabase.from("seasons").select("id, title").gte("ends_on", today).order("starts_on").limit(1)
    : { data: null };
  const season = seasons?.[0] ?? null;
  return <ClassRosterClient season={season} tab={parseWorkspaceTab(tab)} />;
}
