/**
 * Where to send someone after sign-in, from a `?next=` value. Only
 * same-origin paths are allowed: anything else (full URLs, protocol-relative
 * "//host", backslash tricks, "@host" that would read as userinfo after the
 * origin) falls back, so auth redirects can't be turned into open redirects.
 */
export function safeNextPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || value.length > 512) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  // Control characters and backslashes have no business in our paths.
  if (/[\u0000-\u001f\\]/.test(value)) return fallback;
  try {
    const parsed = new URL(value, "https://strikelab.invalid");
    if (parsed.origin !== "https://strikelab.invalid") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

/** `?next=` from the current URL (client only), sanitized. */
export function readNextPath(fallback = "/dashboard"): string {
  if (typeof window === "undefined") return fallback;
  return safeNextPath(new URLSearchParams(window.location.search).get("next"), fallback);
}
