import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata({
  title: "Create an account",
  description: "Create a free StrikeLab account to save your progress and streak.",
});

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
