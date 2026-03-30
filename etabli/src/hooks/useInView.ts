"use client";
import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export function useInView(options: UseInViewOptions = {}) {
  const { threshold = 0.1, triggerOnce = true, rootMargin = "0px" } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce && ref.current) observer.unobserve(ref.current);
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, triggerOnce, rootMargin]);

  return { ref, isInView };
}
