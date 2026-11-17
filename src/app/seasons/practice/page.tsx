import { pageMetadata } from "@/lib/seo";
import PracticeClient from "./PracticeClient";

export const metadata = pageMetadata({
  path: "/seasons/practice",
  title: "Practice round: try a season challenge",
  description:
    "A free 15-minute practice round with the same workspace and rules as a StrikeLab season challenge. No account needed, and nothing is scored or saved.",
});

export default function PracticePage() {
  return <PracticeClient />;
}
