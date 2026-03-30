"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

/**
 * Duolingo-style top progress bar for exercises.
 * Shows progress, question count, and close button.
 */

interface ExerciseProgressProps {
  current: number;
  total: number;
  score?: number;
  closeHref?: string;
}

export default function ExerciseProgress({
  current,
  total,
  score,
  closeHref = "/francisation",
}: ExerciseProgressProps) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        {/* Close button */}
        <Link
          href={closeHref}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title={fr ? "Quitter" : "Close"}
        >
          <X size={20} />
        </Link>

        {/* Progress bar */}
        <div className="flex-1">
          <div className="exercise-progress-bar">
            <div className="exercise-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Counter */}
        <div className="shrink-0 flex items-center gap-2 text-sm">
          <span className="font-semibold text-gray-700">
            {current}/{total}
          </span>
          {score !== undefined && (
            <span className="text-emerald-600 font-bold">
              {score} ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
