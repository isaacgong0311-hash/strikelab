import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import styles from "./ui.module.css";

type Variant = "primary" | "secondary" | "quiet" | "danger";

function classes(variant: Variant, small?: boolean, className?: string) {
  return [styles.action, styles[variant], small ? styles.small : "", className ?? ""].filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  small,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; small?: boolean }) {
  return <button type={type} className={classes(variant, small, className)} {...props} />;
}

export function ActionLink({
  variant = "primary",
  small,
  className,
  ...props
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; small?: boolean }) {
  return <Link className={classes(variant, small, className)} {...props} />;
}
