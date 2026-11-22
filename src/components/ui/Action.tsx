import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentProps } from "react";
import styles from "./ui.module.css";

/**
 * The one button. Every new call-to-action uses <Button> (an action on this
 * page) or <ActionLink> (navigation). Styling is flat: a solid brand fill for
 * primary, a 1px hairline for secondary, nothing for ghost. No offset shadow,
 * no press bounce. See docs/ui-system.md#buttons.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "sm";

type StyleProps = {
  /** primary: the one main action in a view. secondary: alternatives. ghost: low-emphasis, toolbars. */
  variant?: ButtonVariant;
  /** md is 44px tall. sm is 32px tall with a 44px hit area. */
  size?: ButtonSize;
};

/** Class names for an element that should look like a button but isn't one
 *  of the two components below (a <summary>, a <label> for a file input). */
export function buttonClassName({ variant = "primary", size = "md", className }: StyleProps & { className?: string } = {}) {
  return [styles.action, styles[variant], size === "sm" ? styles.sm : "", className ?? ""].filter(Boolean).join(" ");
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & StyleProps) {
  return <button type={type} className={buttonClassName({ variant, size, className })} {...props} />;
}

type LinkHref = ComponentProps<typeof Link>["href"];

const LINK_ONLY_PROPS = new Set([
  "as", "replace", "scroll", "shallow", "passHref", "prefetch", "locale",
  "legacyBehavior", "onNavigate", "transitionTypes", "unstable_dynamicOnHover",
]);

/** Absolute URLs (https:, mailto:, tel:, protocol-relative) leave the app. */
export function isExternalHref(href: LinkHref): href is string {
  return typeof href === "string" && /^([a-z][a-z\d+.-]*:|\/\/)/i.test(href);
}

export function ActionLink({
  href,
  variant,
  size,
  className,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  StyleProps & { href: LinkHref }) {
  const cls = buttonClassName({ variant, size, className });
  if (isExternalHref(href)) {
    // Link-only props (prefetch, replace, scroll...) mean nothing on a plain
    // anchor and would end up as unknown DOM attributes.
    const anchorProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !LINK_ONLY_PROPS.has(key)),
    ) as AnchorHTMLAttributes<HTMLAnchorElement>;
    const rel = anchorProps.target === "_blank" ? anchorProps.rel ?? "noopener noreferrer" : anchorProps.rel;
    return <a href={href} className={cls} {...anchorProps} rel={rel} />;
  }
  return <Link href={href} className={cls} {...props} />;
}
