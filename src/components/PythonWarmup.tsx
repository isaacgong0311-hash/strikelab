"use client";

import { useEffect, useRef } from "react";
import { loadPythonRuntime } from "@/lib/pythonRuntime";

/**
 * Starts loading the Python runtime (about 5.8 MB the first time) once the
 * exercise it sits in comes within a screen of the viewport. Run is still
 * fast, but opening a lesson no longer downloads Python for every visitor,
 * which on a school network meant a whole class pulling it at once
 * (roadmap BV-X6). With Save-Data on, nothing loads until Run is pressed.
 *
 * Render it as the first child of the exercise; it watches its parent.
 */
export default function PythonWarmup() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = marker.current?.parentElement;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!target || saveData) return;

    const start = () => {
      loadPythonRuntime().catch(() => {
        // Reported when the student clicks Run, which retries.
      });
    };
    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      },
      // One screen of lead time above and below the viewport.
      { rootMargin: "100% 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return <span ref={marker} hidden />;
}
