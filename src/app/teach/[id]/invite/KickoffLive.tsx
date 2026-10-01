"use client";
import { useEffect, useState } from "react";
import type { KickoffLive as KickoffLiveData } from "@/lib/teach/kickoffLive";
import KickoffLiveView from "./KickoffLiveView";

const POLL_MS = 10_000;

/**
 * During the first meeting: who has joined and who has finished the first
 * short lesson, refreshed every 10 seconds while this tab is visible, so the
 * leader can walk over to whoever is stuck (mega plan Q2).
 */
export default function KickoffLive({ classId }: { classId: string }) {
  const [live, setLive] = useState<KickoffLiveData | null>(null);
  const [failed, setFailed] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    const poll = async () => {
      if (document.visibilityState === "visible") {
        try {
          const res = await fetch(`/api/classes/${classId}/live`, { cache: "no-store" });
          if (!res.ok) throw new Error(String(res.status));
          const data = (await res.json()) as KickoffLiveData;
          if (!active) return;
          setLive(data);
          setFailed(false);
          setUpdatedAt(new Date());
        } catch {
          if (active) setFailed(true);
        }
      }
      if (active) timer = window.setTimeout(poll, POLL_MS);
    };
    void poll();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        window.clearTimeout(timer);
        void poll();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [classId]);

  return <KickoffLiveView live={live} failed={failed} updatedAt={updatedAt} />;
}
