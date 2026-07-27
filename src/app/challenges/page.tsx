import ChallengesClient from "./ChallengesClient";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/challenges",
  title: "Weekly Quant Challenges",
  description:
    "A new options pricing coding challenge every week — implied vol, binomial trees, the Greeks. Write Python in the browser, pass the tests, climb the leaderboard.",
});

export default function ChallengesPage() {
  return <ChallengesClient />;
}
