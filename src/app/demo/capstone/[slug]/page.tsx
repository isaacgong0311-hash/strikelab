import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { EXAMPLE_CAPSTONES } from "@/lib/demo/exampleCapstones";
import CapstoneView from "@/app/capstone/CapstoneView";
import styles from "../../demo.module.css";

export function generateStaticParams() {
  return EXAMPLE_CAPSTONES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const example = EXAMPLE_CAPSTONES.find((c) => c.slug === slug);
  return pageMetadata({
    path: `/demo/capstone/${slug}`,
    title: example ? `Example capstone: ${example.title}` : "Example capstone",
    description: "An example of the capstone students build in StrikeLab's six-week quant lab.",
  });
}

export default async function ExampleCapstonePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const example = EXAMPLE_CAPSTONES.find((c) => c.slug === slug);
  if (!example) notFound();
  return (
    <>
      <p className={styles.backRow}>
        <Link href="/demo">← Back to the demo</Link>
      </p>
      <p className={`${styles.banner} ${styles.narrow}`} role="note">
        <strong>Example.</strong> Written by the StrikeLab team to show what a finished capstone looks like; not a
        student&apos;s work.
      </p>
      <CapstoneView data={example} byline="Example by the StrikeLab team" label="Example" />
    </>
  );
}
