"use client";
import { useEffect, useRef, ReactNode } from "react";

/**
 * V2Frame — wraps inner pages with the same monochrome v2 theme as the homepage:
 *   • parallax background grid
 *   • subtle radial vignette
 *   • scroll-triggered fade-ups for [data-v2-head] and [data-v2-stagger] / .v2-rise
 *
 * Drop any page inside <V2Frame>…</V2Frame> and tag elements with:
 *   <div data-v2-head className="v2-page-head"> …title… </div>
 *   <div data-v2-stagger> <div className="v2-rise"/> <div className="v2-rise"/> … </div>
 */
export default function V2Frame({ children }: { children: ReactNode }) {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Section heads + page heads
    const headIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          headIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll("[data-v2-head]").forEach((el) => headIO.observe(el));

    // Stagger groups — apply .in to .v2-rise children sequentially
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

    // Lone .v2-rise elements without a group → fade-in on their own
    const loneIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          loneIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".v2-rise").forEach((el) => {
      if (!el.closest("[data-v2-stagger]")) loneIO.observe(el);
    });

    // Background parallax
    let raf = false;
    let lastY = 0;
    const onScroll = () => {
      lastY = window.scrollY;
      if (!raf) {
        raf = true;
        requestAnimationFrame(() => {
          const shift = -Math.min(8, (lastY / 2000) * 8);
          if (bgRef.current) bgRef.current.style.transform = `translate3d(0, ${shift}px, 0)`;
          raf = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="v2 v2-page">
      <div ref={bgRef} className="v2-bg-grid" />
      <div className="v2-bg-vignette" />
      <div className="v2-wrap">{children}</div>
    </div>
  );
}
