"use client";
import React from "react";
import { useInView } from "@/hooks/useInView";

interface AnimatedProgressBarProps {
  percent: number;
  color?: string;
  height?: number;
  className?: string;
  label?: string;
}

export default function AnimatedProgressBar({
  percent,
  color = "#1D9E75",
  height = 10,
  className = "",
  label,
}: AnimatedProgressBarProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div ref={ref} className={className}>
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span className="font-semibold">{clamped}%</span>
        </div>
      )}
      <div
        style={{ height, borderRadius: height / 2 }}
        className="w-full bg-gray-200 overflow-hidden"
      >
        <div
          style={{
            width: isInView ? `${clamped}%` : "0%",
            height: "100%",
            borderRadius: height / 2,
            backgroundColor: color,
            transition: "width 1s ease-out",
          }}
        />
      </div>
    </div>
  );
}
