"use client";

import { CheckCircle2, XCircle, Volume2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useTTS } from "@/hooks/useTTS";

/**
 * Duolingo-style feedback banner that appears after answering.
 * Shows correct/wrong state with animation, encouragement, and optional TTS.
 */

const ENCOURAGE_FR = [
  "Excellent\u00a0!", "Bravo\u00a0!", "Parfait\u00a0!", "Super\u00a0!",
  "Bien joué\u00a0!", "Continue\u00a0!", "Impressionnant\u00a0!", "Génial\u00a0!",
];
const ENCOURAGE_EN = [
  "Excellent!", "Great job!", "Perfect!", "Awesome!",
  "Well done!", "Keep going!", "Impressive!", "Amazing!",
];
const RETRY_FR = [
  "Pas tout à fait!", "Presque!", "Essaie encore!", "Continue, tu progresses!",
];
const RETRY_EN = [
  "Not quite!", "Almost!", "Try again!", "Keep going, you're improving!",
];

function randomPick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface ExerciseFeedbackProps {
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
  xpEarned?: number;
  onContinue: () => void;
  /** If true, reads the correct answer aloud via TTS */
  speakAnswer?: boolean;
}

export default function ExerciseFeedback({
  isCorrect,
  correctAnswer,
  explanation,
  xpEarned = 10,
  onContinue,
  speakAnswer = false,
}: ExerciseFeedbackProps) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { speak } = useTTS();

  const message = isCorrect
    ? randomPick(fr ? ENCOURAGE_FR : ENCOURAGE_EN)
    : randomPick(fr ? RETRY_FR : RETRY_EN);

  return (
    <div
      className={`rounded-2xl p-4 mt-3 border-2 transition-all ${
        isCorrect
          ? "bg-emerald-50 border-emerald-200 exercise-correct"
          : "bg-red-50 border-red-200 exercise-wrong"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center celebration-pop ${
          isCorrect ? "bg-emerald-100" : "bg-red-100"
        }`}>
          {isCorrect ? (
            <CheckCircle2 size={24} className="text-emerald-600" />
          ) : (
            <XCircle size={24} className="text-red-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Encouragement message */}
          <p className={`font-bold text-lg ${isCorrect ? "text-emerald-700" : "text-red-600"}`}>
            {message}
          </p>

          {/* XP earned */}
          {isCorrect && xpEarned > 0 && (
            <span className="inline-block text-sm font-semibold text-emerald-600 xp-fly mt-1">
              +{xpEarned} XP
            </span>
          )}

          {/* Correct answer reveal (on wrong) */}
          {!isCorrect && correctAnswer && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-sm text-red-700">
                {fr ? "Réponse correcte\u00a0:" : "Correct answer:"}{" "}
                <strong className="text-red-800">{correctAnswer}</strong>
              </p>
              {speakAnswer && (
                <button
                  onClick={() => speak(correctAnswer, "slow")}
                  className="shrink-0 w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                  title={fr ? "Écouter" : "Listen"}
                >
                  <Volume2 size={14} className="text-red-600" />
                </button>
              )}
            </div>
          )}

          {/* Explanation */}
          {explanation && (
            <p className={`text-sm mt-2 ${isCorrect ? "text-emerald-600" : "text-red-600"}`}>
              {explanation}
            </p>
          )}
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={onContinue}
        className={`w-full mt-3 py-3 rounded-xl font-bold text-white text-base transition-all btn-press ${
          isCorrect
            ? "bg-emerald-500 hover:bg-emerald-600"
            : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {fr ? "Continuer" : "Continue"}
      </button>
    </div>
  );
}
