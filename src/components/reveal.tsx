"use client";

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}

/** Fades/slides children into view the first time they scroll onto screen. */
export function Reveal({ children, delay = 0, className = "", as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const supportsObserver = typeof IntersectionObserver !== "undefined";
  const [visible, setVisible] = useState(!supportsObserver);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
