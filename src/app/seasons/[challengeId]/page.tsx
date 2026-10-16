import { privatePageMetadata } from "@/lib/seo";
import AttemptClient from "./AttemptClient";

export const metadata = privatePageMetadata({
  title: "Season challenge",
  description: "A timed StrikeLab season challenge.",
});

export default async function ChallengePage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = await params;
  return <AttemptClient challengeId={challengeId} />;
}
