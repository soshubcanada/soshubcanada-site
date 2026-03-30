"use client";

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon circle */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#F0C46A]/20 mb-5">
        <Icon className="w-7 h-7 text-[#D4A03C]" strokeWidth={1.8} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[#1B2559] mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        {description}
      </p>

      {/* Optional CTA */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#D4A03C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#c4922e] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/50 focus:ring-offset-2 active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
