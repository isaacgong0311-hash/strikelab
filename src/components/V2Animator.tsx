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
    // Reset any "in" classes only on elements that exist for the new route.
    // We use 'once' semantics by unobserving after firing — so just re-bind.
    const bg = document.getElementById("v2-bg-grid");

    const headIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); headIO.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll("[data-v2-head]").forEach((el) => headIO.observe(el));

    const staggerIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll<HTMLElement>(".v2-rise").forEach((c, i) => {
          setTimeout(() => c.classList.add("in"), i * 100);
        });
        staggerIO.unobserve(e.target);
      });
    }, { threshold: 0.1 });
    document.querySelectorAll("[data-v2-stagger]").forEach((g) => staggerIO.observe(g));

    const loneIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); loneIO.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".v2-rise").forEach((el) => {
      if (!el.closest("[data-v2-stagger]")) loneIO.observe(el);
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
    };
  }, [path]);

  return null;
}
