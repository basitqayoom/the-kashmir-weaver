"use client";

import { useEffect, useRef, useState, type IframeHTMLAttributes } from "react";

type Props = IframeHTMLAttributes<HTMLIFrameElement>;

export default function LazyIframe(props: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? <iframe {...props} /> : null}
    </div>
  );
}
