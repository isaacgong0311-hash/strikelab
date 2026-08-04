import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata({
  title: "Set new password",
  description: "Choose a new password for your StrikeLab account.",
});

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
