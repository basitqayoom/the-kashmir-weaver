"use client";

import { useEffect } from "react";

/**
 * Progressive scroll-reveal for `.reveal` nodes.
 *
 * Important: React re-renders reset `className` from JSX and will strip a
 * `.visible` class we added imperatively. We must re-apply when that happens
 * (see attribute MutationObserver) — otherwise grids stay at opacity:0 under
 * `.js-reveal .reveal` until a hard refresh.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /** Elements currently waiting on IntersectionObserver (not yet visible). */
    const observing = new WeakSet<Element>();

    let flushTimer = 0;
    let rafOuter = 0;
    let rafInner = 0;
    let safetyTimeout = 0;
    let flushQueued = false;

    function revealElement(el: Element) {
      if (!el.isConnected) return;
      observing.delete(el);
      if (!el.classList.contains("visible")) {
        el.classList.add("visible");
      }
    }

    function isInViewport(el: Element) {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }

    const observer = prefersReduced
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              revealElement(entry.target);
              observer!.unobserve(entry.target);
            }
          },
          { threshold: 0 },
        );

    function processAll() {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        if (prefersReduced || isInViewport(el)) {
          revealElement(el);
          return;
        }
        if (!observer || observing.has(el)) return;
        observing.add(el);
        observer.observe(el);
      });
    }

    /** Macrotask + two frames so Suspense hydration can finish first. */
    function scheduleFlush() {
      if (flushQueued) return;
      flushQueued = true;
      flushTimer = window.setTimeout(() => {
        flushTimer = 0;
        rafOuter = requestAnimationFrame(() => {
          rafInner = requestAnimationFrame(() => {
            flushQueued = false;
            processAll();
          });
        });
      }, 64);
    }

    function arm() {
      if (!prefersReduced) {
        root.classList.add("js-reveal");
      }
      scheduleFlush();
    }

    const startTimer = window.setTimeout(arm, 0);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "attributes") {
          const el = record.target;
          if (
            el instanceof Element &&
            el.classList.contains("reveal") &&
            !el.classList.contains("visible")
          ) {
            scheduleFlush();
            return;
          }
          continue;
        }

        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (
            node.matches?.(".reveal") ||
            node.querySelector?.(".reveal:not(.visible)")
          ) {
            scheduleFlush();
            return;
          }
        }
      }
    });
    mutations.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    safetyTimeout = window.setTimeout(() => {
      document.querySelectorAll(".reveal:not(.visible)").forEach(revealElement);
    }, 3500);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(flushTimer);
      window.clearTimeout(safetyTimeout);
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
      mutations.disconnect();
      observer?.disconnect();
    };
  }, []);

  return null;
}
