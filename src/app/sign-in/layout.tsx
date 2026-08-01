import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata({
  title: "Sign in",
  description: "Sign in to StrikeLab to sync your progress across devices.",
});

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
