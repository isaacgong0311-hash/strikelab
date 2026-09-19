"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// The Spline runtime is ~1MB of WebGL machinery. `ssr: false` keeps it out of
// the server render entirely, and the dynamic() call keeps it in its own chunk
// so it is never part of the initial bundle for the homepage — it is only
// fetched once `shouldMount` flips true below.
const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

/** True when the browser can actually give us a WebGL context. */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * True when downloading a megabyte of 3D would be rude: the visitor asked the
 * browser to save data, or the device has too little memory to run a WebGL
 * scene without hurting the rest of the page.
 *
 * Both APIs are Chromium-only, so this is a best-effort check — absent means
 * "no objection", not "definitely fine".
 */
function isConstrainedDevice(): boolean {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return true;
  return false;
}

/** The project's resolved motion signal — system query *and* the in-app
 *  accessibility toggle, already merged onto <html> by ACCESSIBILITY_BOOT_SCRIPT. */
function motionIsReduced(): boolean {
  return document.documentElement.dataset.motion === "reduce";
}

export interface SplineSceneProps {
  /**
   * A published Spline scene URL (…/scene.splinecode). Defaults to
   * NEXT_PUBLIC_SPLINE_HERO_SCENE so the scene can be swapped per environment
   * without a code change. With no URL configured the component renders
   * nothing at all and whatever sits behind it shows through.
   */
  scene?: string;
  className?: string;
  /** Decorative by default; set false if a scene ever becomes real content. */
  decorative?: boolean;
}

/**
 * Ambient 3D backdrop.
 *
 * This is progressive enhancement in the strict sense: it is mounted *only*
 * when every one of the following holds, and the page is complete without it
 * in every other case.
 *
 *   - a scene URL is configured
 *   - the visitor has not asked for reduced motion
 *   - the device isn't on Save-Data or short on memory
 *   - WebGL is actually available
 *   - the host element has scrolled near the viewport
 *
 * It also never intercepts input (`pointer-events-none`), so the hero's CTAs
 * keep working even while the canvas is on top of them, and it is hidden from
 * assistive tech.
 */
export default function SplineScene({
  scene = process.env.NEXT_PUBLIC_SPLINE_HERO_SCENE,
  className,
  decorative = true,
}: SplineSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!scene) return;

    const host = hostRef.current;
    if (!host) return;

    let inView = false;

    const allowed = () =>
      !motionIsReduced() && !isConstrainedDevice() && hasWebGL();

    // Mount state is derived from both conditions every time either changes,
    // rather than latched on first success. That matters for the accessibility
    // menu: toggling "reduce motion" on tears the canvas down, and toggling it
    // back off brings it back, with no reload either way.
    const sync = () => {
      const next = inView && allowed();
      setShouldMount(next);
      if (!next) setLoaded(false);
    };

    // `rootMargin` starts the download slightly before the scene is on screen,
    // so it fades in rather than popping.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          inView = true;
          io.disconnect();
          sync();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(host);

    const motionWatcher = new MutationObserver(sync);
    motionWatcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });

    return () => {
      io.disconnect();
      motionWatcher.disconnect();
    };
  }, [scene]);

  if (!scene) return null;

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden={decorative ? true : undefined}
      style={{
        pointerEvents: "none",
        opacity: loaded ? 1 : 0,
        transition: "opacity 700ms ease",
      }}
    >
      {shouldMount ? (
        <Spline
          scene={scene}
          // Only redraws when the scene actually changes, rather than pinning
          // a rAF loop at 60fps for a backdrop nobody is interacting with.
          renderOnDemand
          onLoad={() => setLoaded(true)}
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </div>
  );
}
