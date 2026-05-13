import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — StrikeLab",
  description: "Your progress, streak, and cohort rank at a glance.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
