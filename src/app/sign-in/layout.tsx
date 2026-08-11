import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata({
  title: "Sign in",
  description: "Sign in to StrikeLab to sync your lesson progress, XP, and streak across all your devices.",
});

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
