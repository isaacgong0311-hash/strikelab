import { privatePageMetadata } from "@/lib/seo";
import WarmupClient from "./WarmupClient";

export const metadata = privatePageMetadata({
  title: "Get your lab ready",
  description: "Loads the in-browser Python so your first exercise starts instantly.",
});

export default function WarmupPage() {
  return <WarmupClient />;
}
