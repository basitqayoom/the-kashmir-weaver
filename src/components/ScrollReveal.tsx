"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      document.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("visible");
      });
      return;
    }

    root.classList.add("js-reveal");

    function revealElement(el: Element) {
      el.classList.add("visible");
    }

    function isInViewport(el: Element) {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0 }
    );

    function observeAll() {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        if (isInViewport(el)) {
          revealElement(el);
        } else {
          observer.observe(el);
        }
      });
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        observeAll();
      });
    });

    const safetyTimeout = setTimeout(() => {
      document.querySelectorAll(".reveal:not(.visible)").forEach(revealElement);
    }, 3500);

    return () => {
      observer.disconnect();
      clearTimeout(safetyTimeout);
    };
  }, []);

  return null;
}
