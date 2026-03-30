"use client";
import { useEffect, useState, useCallback } from "react";
import { useInView } from "@/hooks/useInView";

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("fr-CA");
}

export default function CountUp({
  end,
  duration = 1500,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [display, setDisplay] = useState(0);

  const animate = useCallback(() => {
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplay(eased * end);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [end, duration]);

  useEffect(() => {
    if (isInView) {
      animate();
    }
  }, [isInView, animate]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(display)}
      {suffix}
    </span>
  );
}
