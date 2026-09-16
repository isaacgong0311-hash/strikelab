"use client";

import { useEffect, useRef } from "react";

export default function AuthError({ message }: { message: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);
  if (!message) return null;
  return <div ref={ref} className="auth-error sl-status" data-tone="danger" role="alert" tabIndex={-1}>{message}</div>;
}
