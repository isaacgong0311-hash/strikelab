/**
 * useSubscription — client-side hook that checks whether the current user
 * has an active Pro subscription.
 *
 * Strategy: /api/stripe/status reads `public.subscriptions` for the signed-in
 * Supabase user (cookie-authenticated) — no localStorage involved, so it
 * works the same on any device once you're signed in.
 */
"use client";
import { useState, useEffect } from "react";

interface SubscriptionState {
  isPro: boolean;
  plan: "pro" | "school" | null;
  customerId: string | null;
  status: string | null;
  hydrated: boolean;
}

export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    isPro: false,
    plan: null,
    customerId: null,
    status: null,
    hydrated: false,
  });

  useEffect(() => {
    let active = true;
    fetch("/api/stripe/status")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setState({
          isPro: data.isPro ?? false,
          plan: data.plan ?? null,
          customerId: data.customerId ?? null,
          status: data.status ?? null,
          hydrated: true,
        });
      })
      .catch(() => {
        if (active) setState((s) => ({ ...s, hydrated: true }));
      });
    return () => { active = false; };
  }, []);

  return state;
}

/** Opens Stripe Customer Portal so users can manage/cancel */
export async function openCustomerPortal(): Promise<void> {
  const res = await fetch("/api/stripe/portal", { method: "POST" });
  if (res.status === 401) {
    window.location.href = "/sign-in";
    return;
  }
  const data = await res.json() as { url?: string; error?: string };
  if (data.url) window.location.href = data.url;
  else throw new Error(data.error ?? "Could not open portal");
}

/** Starts the Pro checkout flow. Redirects to sign-in if not authenticated. */
export async function startCheckout(plan: "pro" | "school" = "pro"): Promise<void> {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  if (res.status === 401) {
    window.location.href = "/sign-in";
    return;
  }
  const data = await res.json() as { url?: string; error?: string };
  if (data.url) window.location.href = data.url;
  else throw new Error(data.error ?? "Could not start checkout");
}
