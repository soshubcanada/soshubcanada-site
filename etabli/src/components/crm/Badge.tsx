"use client";

interface BadgeProps {
  label: string;
  variant: "success" | "warning" | "danger" | "info" | "neutral" | "gold";
}

const variantStyles: Record<BadgeProps["variant"], string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  neutral: "bg-gray-100 text-gray-600 ring-gray-500/20",
  gold: "bg-[#D4A03C]/15 text-[#1B2559] ring-[#D4A03C]/30",
};

export default function Badge({ label, variant }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variantStyles[variant]}`}
    >
      {label}
    </span>
  );
}
