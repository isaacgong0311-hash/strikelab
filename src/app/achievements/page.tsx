import JsonLd from "@/components/JsonLd";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import AchievementsClient from "./AchievementsClient";

export const metadata = pageMetadata({
  path: "/achievements",
  title: "Achievements",
  description: "Badges earned for completing lessons and tracks on StrikeLab.",
});

export default function AchievementsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Achievements", path: "/achievements" }])} />
      <AchievementsClient />
    </>
  );
}
