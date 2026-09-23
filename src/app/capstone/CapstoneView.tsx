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
export default function CapstoneView({ data, byline }: { data: CapstoneViewData; byline: string }) {
  const prompt = getCapstonePrompt(data.promptId);
  return (
    <article className={styles.article}>
      <p className={styles.kicker}>{prompt?.title ?? "Capstone"}</p>
      <h1 className={styles.title}>{data.title || "Untitled capstone"}</h1>
      <p className={styles.byline}>
        {byline}
        {data.submittedAt
          ? ` · submitted ${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(data.submittedAt))}`
          : " · draft"}
      </p>
      <section>
        <h2>Question</h2>
        <Paragraphs text={data.thesis} />
      </section>
      <section>
        <h2>Code</h2>
        <pre className={styles.code} tabIndex={0} aria-label="Capstone code">
          <code>{data.code}</code>
        </pre>
      </section>
      <section>
        <h2>Results</h2>
        <Paragraphs text={data.resultSummary} />
      </section>
      <section>
        <h2>Reflection</h2>
        <Paragraphs text={data.reflection} />
      </section>
    </article>
  );
}
