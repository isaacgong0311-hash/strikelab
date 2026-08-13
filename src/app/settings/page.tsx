import SettingsClient from "./SettingsClient";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata({
  title: "Settings",
  description: "Manage integrations and account preferences.",
});

export default function SettingsPage() {
  return <SettingsClient />;
}
