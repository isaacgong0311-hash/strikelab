import type { Metadata } from "next";
import LessonsClient from "./LessonsClient";

export const metadata: Metadata = { title: "Lessons — StrikeLab" };

export default function LessonsPage() {
  return <LessonsClient />;
}
