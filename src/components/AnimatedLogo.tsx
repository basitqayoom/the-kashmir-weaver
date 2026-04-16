"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
  variant?: "navbar" | "footer" | "section";
}

const logos = [
  { src: "/images/logo/goat-gold-transparent.png", alt: "The Kashmir Weaver logo" },
  { src: "/images/logo/goat-white-transparent.png", alt: "The Kashmir Weaver logo" },
];

const animations = ["logo-flip-y", "logo-flip-x"] as const;

export default function AnimatedLogo({
  size = 44,
  className = "",
  variant = "navbar",
}: AnimatedLogoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animClass, setAnimClass] = useState("");

  const interval = variant === "footer" ? 5000 : 4000;

  const advance = useCallback(() => {
    const nextAnim = animations[currentIndex % animations.length];
    setAnimClass(`${nextAnim}-out`);

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % logos.length);
      setAnimClass(`${nextAnim}-in`);

      setTimeout(() => {
        setAnimClass("");
      }, 600);
    }, 500);
  }, [currentIndex]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval]);

  const logo = logos[currentIndex];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width: size, height: size, perspective: "600px" }}
    >
      <div
        className={`logo-animate-wrapper ${animClass}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={logo.src}
          alt={variant === "footer" ? "" : logo.alt}
          width={size}
          height={size}
          className="h-full w-full rounded-full object-cover"
          priority={variant === "navbar"}
        />
      </div>
    </div>
  );
}
