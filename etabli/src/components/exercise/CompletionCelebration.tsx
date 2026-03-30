"use client";

import { Trophy, Star, ArrowRight, RotateCcw, Flame } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/learning-system";

/**
 * Duolingo-style completion celebration screen.
 * Shows confetti, score, streak, XP earned, and next steps.
 */

interface CompletionCelebrationProps {
  score: number;
  total: number;
  xpEarned: number;
  onRestart?: () => void;
  nextHref?: string;
  nextLabel?: string;
  nextLabelEn?: string;
}

function ConfettiPiece({ index }: { index: number }) {
  const colors = ["#1D9E75", "#D97706", "#3B82F6", "#EF4444", "#8B5CF6", "#F59E0B"];
  const color = colors[index % colors.length];
  const left = 10 + (index * 17) % 80;
  const delay = (index * 0.1) % 0.8;
  const size = 6 + (index % 4) * 2;

  return (
    <div
      className="confetti-piece absolute rounded-sm"
      style={{
        left: `${left}%`,
        top: "40%",
        width: size,
        height: size,
        backgroundColor: color,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export default function CompletionCelebration({
  score,
  total,
  xpEarned,
  onRestart,
  nextHref,
  nextLabel,
  nextLabelEn,
}: CompletionCelebrationProps) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { progress } = useProgress();
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const getMessage = () => {
    if (pct >= 90) return fr ? "Extraordinaire\u00a0! Tu maîtrises ce sujet\u00a0!" : "Outstanding! You've mastered this topic!";
    if (pct >= 70) return fr ? "Très bien\u00a0! Continue comme ça\u00a0!" : "Great job! Keep it up!";
    if (pct >= 50) return fr ? "Bon travail\u00a0! Tu progresses\u00a0!" : "Good work! You're improving!";
    return fr ? "Continue de pratiquer, tu vas y arriver\u00a0!" : "Keep practicing, you'll get there!";
  };

  const getStars = () => {
    if (pct >= 90) return 3;
    if (pct >= 70) return 2;
    if (pct >= 40) return 1;
    return 0;
  };

  const stars = getStars();

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-lg p-6 text-center">
      {/* Confetti */}
      {pct >= 70 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      {/* Trophy */}
      <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 celebration-pop ${
        pct >= 70 ? "bg-emerald-100" : pct >= 40 ? "bg-amber-100" : "bg-gray-100"
      }`}>
        <Trophy size={40} className={
          pct >= 70 ? "text-emerald-500" : pct >= 40 ? "text-amber-500" : "text-gray-400"
        } />
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-1 mb-3">
        {[1, 2, 3].map((n) => (
          <Star
            key={n}
            size={28}
            className={`transition-all ${
              n <= stars ? "text-amber-400 fill-amber-400" : "text-gray-200"
            }`}
            style={{ animationDelay: `${n * 0.15}s` }}
          />
        ))}
      </div>

      {/* Score */}
      <div className="celebration-pop" style={{ animationDelay: "0.2s" }}>
        <p className={`text-5xl font-bold font-[family-name:var(--font-heading)] ${
          pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-gray-500"
        }`}>
          {pct}%
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {score}/{total} {fr ? "correct" : "correct"}
        </p>
      </div>

      {/* Message */}
      <p className="text-lg font-semibold text-gray-800 mt-3">{getMessage()}</p>

      {/* Stats row */}
      <div className="flex justify-center gap-6 mt-5 mb-5">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600 font-[family-name:var(--font-heading)]">
            +{xpEarned}
          </div>
          <div className="text-xs text-gray-500 font-medium">XP</div>
        </div>
        {progress.streak > 0 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame size={20} className="text-orange-500" />
              <span className="text-2xl font-bold text-orange-500 font-[family-name:var(--font-heading)]">
                {progress.streak}
              </span>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {fr ? "Série" : "Streak"}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRestart && (
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors btn-press"
          >
            <RotateCcw size={18} />
            {fr ? "Recommencer" : "Try Again"}
          </button>
        )}
        {nextHref && (
          <Link
            href={nextHref}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1D9E75] text-white font-semibold hover:bg-[#178a65] transition-colors btn-press shadow-sm"
          >
            {fr ? (nextLabel || "Continuer") : (nextLabelEn || "Continue")}
            <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}
