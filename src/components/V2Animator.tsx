"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll-reveal driver. Mount once in layout.tsx.
 *
 *   • Observes [data-v2-head] elements and adds .in on scroll-enter (fade-up).
 *   • Observes [data-v2-stagger] groups and adds .in to .v2-rise children sequentially.
 *   • Observes lone .v2-rise elements (no stagger parent) and adds .in on scroll-enter.
 *
 * Progressive enhancement only: content is visible in the server-rendered
 * HTML. Only an element this effect marks data-sl-reveal="pending" (below the
 * fold, motion allowed) is hidden (globals.css, foundation.css), and every
 * pending element is revealed once the page has loaded, whether or not it is
 * ever scrolled to, so a full-page capture or a print never shows gaps.
 * Without JavaScript, or with reduced motion, nothing is ever hidden.
 *
 * Re-runs on every route change so newly mounted DOM gets wired.
 */
export default function V2Animator() {
  const path = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = root.dataset.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) root.classList.add("sl-motion-ready");
    // 'Once' semantics: each observer unobserves after firing, so a route
    // change just re-binds whatever the new page mounted.

    // Only elements explicitly marked data-sl-reveal="pending" are hidden (see
    // foundation.css), so anything this effect never reaches — DOM mounted
    // later, a failed observer — stays visible. Threshold 0 (not a fraction of
    // the element) because a lesson body is many viewports tall and can never
    // be 15% on screen at once; that is what left lessons blank.
    const reveal = (el: Element) => {
      el.classList.add("in");
      el.removeAttribute("data-sl-reveal");
    };
    const inOrAboveViewport = (el: Element) => el.getBoundingClientRect().top < window.innerHeight;
    const observerOptions: IntersectionObserverInit = { threshold: 0, rootMargin: "0px 0px -8% 0px" };

    const headIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { reveal(e.target); headIO.unobserve(e.target); }
      });
    }, observerOptions);
    document.querySelectorAll("[data-v2-head]").forEach((el) => {
      if (reduceMotion || el.classList.contains("in") || inOrAboveViewport(el)) return reveal(el);
      el.setAttribute("data-sl-reveal", "pending");
      headIO.observe(el);
    });

    const staggerIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll<HTMLElement>(".v2-rise").forEach((c, i) => {
          setTimeout(() => reveal(c), i * 100);
        });
        staggerIO.unobserve(e.target);
      });
    }, observerOptions);
    document.querySelectorAll("[data-v2-stagger]").forEach((g) => {
      const children = g.querySelectorAll(".v2-rise:not(.in)");
      if (reduceMotion || inOrAboveViewport(g)) return children.forEach(reveal);
      children.forEach((el) => el.setAttribute("data-sl-reveal", "pending"));
      staggerIO.observe(g);
    });

    const loneIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { reveal(e.target); loneIO.unobserve(e.target); }
      });
    }, observerOptions);
    document.querySelectorAll(".v2-rise:not(.in)").forEach((el) => {
      if (el.closest("[data-v2-stagger]")) return;
      if (reduceMotion || inOrAboveViewport(el)) return reveal(el);
      el.setAttribute("data-sl-reveal", "pending");
      loneIO.observe(el);
    });

    // Never leave anything hidden waiting for a scroll that may not come.
    const revealPending = () => document.querySelectorAll("[data-sl-reveal]").forEach(reveal);
    let loadTimer: number | undefined;
    const onLoad = () => { loadTimer = window.setTimeout(revealPending, 300); };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(loadTimer);
      headIO.disconnect();
      staggerIO.disconnect();
      loneIO.disconnect();
      document.querySelectorAll("[data-sl-reveal]").forEach(reveal);
      root.classList.remove("sl-motion-ready");
    };
  }, [path]);

  return null;
}
