"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ImageModalContextValue {
  open: (src: string, alt: string) => void;
}

const ImageModalContext = createContext<ImageModalContextValue | null>(null);

export function useImageModal() {
  const ctx = useContext(ImageModalContext);
  if (!ctx) throw new Error("useImageModal must be used within ImageModalProvider");
  return ctx;
}

export default function ImageModalProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);
  const [visible, setVisible] = useState(false);

  const open = useCallback((src: string, alt: string) => {
    setImage({ src, alt });
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(() => setImage(null), 300);
  }, []);

  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [image, close]);

  return (
    <ImageModalContext.Provider value={{ open }}>
      {children}

      {image && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
            visible ? "bg-black/90 backdrop-blur-sm" : "bg-black/0"
          }`}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={image.alt}
        >
          <button
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close image"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/60">
            {image.alt}
          </p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl transition-all duration-300 ${
              visible ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          />
        </div>
      )}
    </ImageModalContext.Provider>
  );
}
