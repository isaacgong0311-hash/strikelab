import type { Metadata } from "next";
import ChallengesClient from "./ChallengesClient";

export const metadata: Metadata = {
  title: "Weekly Challenge — StrikeLab Pro",
  description: "A new options pricing coding challenge every week. Implement the algorithm, pass the tests, earn XP.",
};

export default function ChallengesPage() {
  return <ChallengesClient />;
}
