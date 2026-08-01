import { privatePageMetadata } from "@/lib/seo";

// The page itself is a client component and can't export metadata, so the
// noindex directive lives here.
export const metadata = privatePageMetadata({
  title: "Welcome to Pro",
  description: "Your StrikeLab Pro subscription is active.",
});

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
