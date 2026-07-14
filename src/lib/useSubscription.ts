/**
 * useSubscription — client-side hook that checks whether the current user
 * has an active Pro subscription.
 *
 * Strategy (no database needed):
 *  1. On checkout success, we store the Stripe customer ID in localStorage.
 *  2. This hook reads that ID and asks our /api/stripe/status route to verify
 *     subscription status directly with Stripe.
 *  3. Result is cached in state (one API call per session).
 *
 * Limitations: localStorage is device-specific, so logging in on a new
 * browser won't auto-restore Pro status until we have real auth (Clerk).
 * Adding `email` to localStorage from the sign-up flow partially mitigates this.
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
    let customerId: string | null = null;
    let email: string | null = null;
    let readFailed = false;

    try {
      customerId = localStorage.getItem("sl_stripe_customer");
      const user = JSON.parse(localStorage.getItem("sl_user") || "null");
      email = user?.email ?? null;
    } catch {
      readFailed = true;
    }

    if (readFailed || (!customerId && !email)) {
      const id = window.setTimeout(() => setState((s) => ({ ...s, hydrated: true })), 0);
      return () => window.clearTimeout(id);
    }

    const params = new URLSearchParams();
    if (customerId) params.set("customerId", customerId);
    else if (email) params.set("email", email);

    fetch(`/api/stripe/status?${params}`)
      .then((r) => r.json())
      .then((data) => {
        // Cache the customer ID if we got one back
        if (data.customerId) {
          try { localStorage.setItem("sl_stripe_customer", data.customerId); } catch {}
        }
        setState({
          isPro: data.isPro ?? false,
          plan: data.plan ?? null,
          customerId: data.customerId ?? null,
          status: data.status ?? null,
          hydrated: true,
        });
      })
      .catch(() => setState((s) => ({ ...s, hydrated: true })));
  }, []);

  return state;
}

/** Opens Stripe Customer Portal so users can manage/cancel */
export async function openCustomerPortal(customerId: string): Promise<void> {
  const res = await fetch("/api/stripe/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId }),
  });
  const data = await res.json() as { url?: string; error?: string };
  if (data.url) window.location.href = data.url;
  else throw new Error(data.error ?? "Could not open portal");
}

/** Starts the Pro checkout flow */
export async function startCheckout(plan: "pro" | "school" = "pro"): Promise<void> {
  let email: string | undefined;
  try {
    const user = JSON.parse(localStorage.getItem("sl_user") || "null");
    email = user?.email;
  } catch {}

  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, email }),
  });
  const data = await res.json() as { url?: string; error?: string };
  if (data.url) window.location.href = data.url;
  else throw new Error(data.error ?? "Could not start checkout");
}
