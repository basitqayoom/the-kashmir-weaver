"use client";

import { useEffect } from "react";

/** Defer decorative motion (marquee, shawl scroll) until after first paint settles. */
export default function MotionReady() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("motion-ready")) return;

    const enable = () => root.classList.add("motion-ready");
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const onLoad = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(enable, { timeout: 2500 });
      } else {
        timeoutId = window.setTimeout(enable, 1200);
      }
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      window.removeEventListener("load", onLoad);
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
