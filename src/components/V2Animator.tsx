"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Global animation + parallax driver. Mount once in layout.tsx.
 *
 *   • Parallax-shifts the global #v2-bg-grid element 8px on scroll.
 *   • Observes [data-v2-head] elements and adds .in on scroll-enter (fade-up).
 *   • Observes [data-v2-stagger] groups and adds .in to .v2-rise children sequentially.
 *   • Observes lone .v2-rise elements (no stagger parent) and adds .in on scroll-enter.
 *
 * Re-runs on every route change so newly mounted DOM gets wired.
 */
export default function V2Animator() {
  const rafRef = useRef(false);
  const path = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = root.dataset.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) root.classList.add("sl-motion-ready");
    // Reset any "in" classes only on elements that exist for the new route.
    // We use 'once' semantics by unobserving after firing — so just re-bind.
    const bg = document.getElementById("v2-bg-grid");

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

    const onScroll = () => {
      const y = window.scrollY;
      if (!rafRef.current) {
        rafRef.current = true;
        requestAnimationFrame(() => {
          const shift = -Math.min(8, (y / 2000) * 8);
          if (bg) bg.style.transform = `translate3d(0, ${shift}px, 0)`;
          rafRef.current = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      headIO.disconnect();
      staggerIO.disconnect();
      loneIO.disconnect();
      document.querySelectorAll("[data-sl-reveal]").forEach(reveal);
      root.classList.remove("sl-motion-ready");
    };
  }, [path]);

  return null;
}
