"use client";

import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "warning" | "default";
}

const variantStyles: Record<
  NonNullable<ConfirmModalProps["variant"]>,
  string
> = {
  danger:
    "bg-red-600 hover:bg-red-700 focus:ring-red-500/50 text-white",
  warning:
    "bg-[#D4A03C] hover:bg-[#c4922e] focus:ring-[#D4A03C]/50 text-white",
  default:
    "bg-[#1B2559] hover:bg-[#243070] focus:ring-[#1B2559]/50 text-white",
};

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "default",
}: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ animation: "fadeIn 200ms ease-out" }}
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
        style={{ animation: "scaleIn 200ms ease-out" }}
      >
        {/* Title */}
        <h2 className="text-lg font-semibold text-[#1B2559]">{title}</h2>

        {/* Description */}
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          {description}
        </p>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300/50 focus:ring-offset-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] ${variantStyles[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
