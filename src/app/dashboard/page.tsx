import DashboardClient from "./DashboardClient";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata({
  title: "Dashboard",
  description: "Your progress, streak, and cohort rank at a glance.",
});

export default function DashboardPage() {
  return <DashboardClient />;
}
