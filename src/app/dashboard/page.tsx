import DashboardClient from "./DashboardClient";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata({
  title: "Dashboard",
  description: "Your lesson progress, XP, daily streak, and cohort rank across the StrikeLab curriculum, at a glance.",
});

export default function DashboardPage() {
  return <DashboardClient />;
}
