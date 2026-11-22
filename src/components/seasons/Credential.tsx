import Link from "next/link";
import type { ReactNode } from "react";
import BrandMark from "@/components/BrandMark";
import styles from "./credential.module.css";

/**
 * The record read as a credential: who issued it, to whom, when, and what was
 * assessed, in the shape of an Open Badges / Credly card. Used by the private
 * /record page and the public /r/[token] share. Server component: everything
 * here is in the first HTML response.
 */
export function CredentialHeader({
  visibility,
  title,
  lede,
  facts,
}: {
  visibility: string;
  title: ReactNode;
  lede: ReactNode;
  facts: { label: string; value: ReactNode }[];
}) {
  return (
    <header className={styles.header}>
      <div className={styles.issuer}>
        <span className={styles.brand}><BrandMark size={20} /> StrikeLab</span>
        <span className={styles.visibility}>{visibility}</span>
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lede}>{lede}</p>
      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

export type PlacingState =
  | { kind: "verified"; at: string }
  | { kind: "provisional" }
  | { kind: "final" };

/** Text first, colour second: the word says the status on its own. */
export function PlacingBadge({ state, date }: { state: PlacingState; date: (iso: string) => string }) {
  if (state.kind === "verified") {
    return (
      <span className={styles.badge} data-kind="verified">
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
          <path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Verified {date(state.at)}
      </span>
    );
  }
  return <span className={styles.badge} data-kind={state.kind}>{state.kind === "provisional" ? "Provisional" : "Final"}</span>;
}

export function CredentialSection({ id, title, meta, children }: { id: string; title: string; meta?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.sectionHead}>
        <h2 id={id}>{title}</h2>
        {meta && <span>{meta}</span>}
      </div>
      {children}
    </section>
  );
}

export function RulesLink() {
  return <Link href="/seasons#season-faq" className={styles.inlineLink}>How seasons are run and scored</Link>;
}

export { styles as credentialStyles };
