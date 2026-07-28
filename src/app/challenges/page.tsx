import ChallengesClient from "./ChallengesClient";
import JsonLd from "@/components/JsonLd";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/challenges",
  title: "Weekly Quant Challenges",
  description:
    "A new options pricing coding challenge every week — implied vol, binomial trees, the Greeks. Write Python in the browser, pass the tests, climb the leaderboard.",
});

export default function ChallengesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Challenges", path: "/challenges" }])} />
      <ChallengesClient />
    </>
  );
}
