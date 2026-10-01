"use client";

import { useEffect } from "react";
import ErrorScreen from "@/components/errors/ErrorScreen";
import { captureError } from "@/lib/monitoring";

export default function Error({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    captureError(error);
  }, [error]);
  return <ErrorScreen digest={error.digest} onRetry={unstable_retry} />;
}
