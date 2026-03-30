"use client";
import React from "react";
import { useInView } from "@/hooks/useInView";

interface AnimateInProps {
  children: React.ReactNode;
  direction?: "up" | "left" | "right" | "scale";
  delay?: number;
  duration?: number;
  className?: string;
  /** When true, automatically staggers children instead of animating the wrapper */
  stagger?: boolean;
}

const initialStyles: Record<string, React.CSSProperties> = {
  up: { opacity: 0, transform: "translateY(20px)" },
  left: { opacity: 0, transform: "translateX(-20px)" },
  right: { opacity: 0, transform: "translateX(20px)" },
  scale: { opacity: 0, transform: "scale(0.92)" },
};

// Spring-like cubic-bezier — matches Linear/Stripe feel
const SPRING_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export default function AnimateIn({
  children,
  direction = "up",
  delay = 0,
  duration = 500,
  className = "",
  stagger = false,
}: AnimateInProps) {
  const { ref, isInView } = useInView({ threshold: 0.08, triggerOnce: true });

  // Stagger mode: add class that auto-staggers children via CSS
  if (stagger) {
    return (
      <div
        ref={ref}
        className={`${isInView ? "stagger-children" : ""} ${className}`}
        style={!isInView ? { opacity: 0 } : undefined}
      >
        {children}
      </div>
    );
  }

  const style: React.CSSProperties = isInView
    ? {
        opacity: 1,
        transform: "translate(0) scale(1)",
        transition: `opacity ${duration}ms ${SPRING_EASE} ${delay}ms, transform ${duration}ms ${SPRING_EASE} ${delay}ms`,
      }
    : {
        ...initialStyles[direction],
        transition: `opacity ${duration}ms ${SPRING_EASE} ${delay}ms, transform ${duration}ms ${SPRING_EASE} ${delay}ms`,
      };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
