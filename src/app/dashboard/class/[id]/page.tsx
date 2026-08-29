import ClassRosterClient from "./ClassRosterClient";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata({
  title: "Class roster",
  description: "Roster and progress for your StrikeLab class.",
});

export default function ClassRosterPage() {
  return <ClassRosterClient />;
}
