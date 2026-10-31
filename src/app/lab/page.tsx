import { pageMetadata } from "@/lib/seo";
import { isLabMode } from "@/lib/marketLab";
import LabClient from "./LabClient";

export const metadata = pageMetadata({
  path: "/lab", title: "Market Lab — learn by experimenting",
  description: "Predict, change the assumptions, and explain what happens. Guided option-pricing experiments with live model curves, a saved notebook, and no signup.",
});

export default async function LabPage({ searchParams }: { searchParams: Promise<{ mission?: string }> }) {
  const { mission } = await searchParams;
  const mode = isLabMode(mission) ? mission : "volatility";
  return <LabClient key={mode} initialMode={mode} />;
}
