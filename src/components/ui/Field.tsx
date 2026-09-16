import { useId, type FieldsetHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import styles from "./ui.module.css";

interface FieldProps {
  label: string;
  help?: string;
  error?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean; className: string }) => React.ReactNode;
}

export function Field({ label, help, error, children }: FieldProps) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      {children({ id, describedBy, invalid: Boolean(error), className: styles.control })}
      {help && <span id={helpId} className={styles.help}>{help}</span>}
      {error && <span id={errorId} className={styles.error}>{error}</span>}
    </div>
  );
}

export function TextField({ label, help, error, className, ...props }: InputHTMLAttributes<HTMLInputElement> & Omit<FieldProps, "children">) {
  return <Field label={label} help={help} error={error}>{({ id, describedBy, invalid, className: controlClass }) => (
    <input {...props} id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={`${controlClass} ${className ?? ""}`} />
  )}</Field>;
}

export function SelectField({ label, help, error, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & Omit<FieldProps, "children">) {
  return <Field label={label} help={help} error={error}>{({ id, describedBy, invalid, className: controlClass }) => (
    <select {...props} id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={`${controlClass} ${className ?? ""}`}>{children}</select>
  )}</Field>;
}

export function TextareaField({ label, help, error, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & Omit<FieldProps, "children">) {
  return <Field label={label} help={help} error={error}>{({ id, describedBy, invalid, className: controlClass }) => (
    <textarea {...props} id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={`${controlClass} ${className ?? ""}`} />
  )}</Field>;
}

export function FieldGroup({ className, ...props }: FieldsetHTMLAttributes<HTMLFieldSetElement>) {
  return <fieldset className={`${styles.group} ${className ?? ""}`} {...props} />;
}
