import { getCapstonePrompt } from "@/lib/capstone/prompts";
import styles from "./capstoneView.module.css";

export interface CapstoneViewData {
  promptId: string;
  title: string;
  thesis: string;
  code: string;
  resultSummary: string;
  reflection: string;
  submittedAt: string | null;
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

/** Read-only capstone, shared by the public share page and the teacher view. */
export default function CapstoneView({
  data,
  byline,
  headingLevel = 1,
  label,
}: {
  data: CapstoneViewData;
  byline: string;
  /** 2 when embedded in another page, so it keeps a single h1. */
  headingLevel?: 1 | 2;
  /** Shown before the prompt, e.g. "Example". */
  label?: string;
}) {
  const prompt = getCapstonePrompt(data.promptId);
  const Title = headingLevel === 1 ? "h1" : "h2";
  const Section = headingLevel === 1 ? "h2" : "h3";
  return (
    <article className={styles.article}>
      <p className={styles.kicker}>
        {label && <span className={styles.label}>{label}</span>}
        {prompt?.title ?? "Capstone"}
      </p>
      <Title className={styles.title}>{data.title || "Untitled capstone"}</Title>
      <p className={styles.byline}>
        {byline}
        {data.submittedAt
          ? ` · submitted ${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(data.submittedAt))}`
          : label
            ? ""
            : " · draft"}
      </p>
      <section>
        <Section>Question</Section>
        <Paragraphs text={data.thesis} />
      </section>
      <section>
        <Section>Code</Section>
        <pre className={styles.code} tabIndex={0} aria-label="Capstone code">
          <code>{data.code}</code>
        </pre>
      </section>
      <section>
        <Section>Results</Section>
        <Paragraphs text={data.resultSummary} />
      </section>
      <section>
        <Section>Reflection</Section>
        <Paragraphs text={data.reflection} />
      </section>
    </article>
  );
}
