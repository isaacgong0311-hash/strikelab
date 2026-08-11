import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata({
  title: "Reset password",
  description: "Reset your StrikeLab account password by email to get back into your lessons and progress.",
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
