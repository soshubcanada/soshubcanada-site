"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { CE_EXERCISES } from "@/lib/francisation-data";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Info,
  RotateCcw,
} from "lucide-react";

type LevelFilter = "A2" | "B1" | "B2" | "C1";

function ComprehensionEcrite() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("A2");
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const levels: LevelFilter[] = ["A2", "B1", "B2", "C1"];

  const filteredExercises = CE_EXERCISES.filter(
    (ex) => ex.level === selectedLevel
  );

  const totalAnswered = Object.values(checked).filter(Boolean).length;
  const totalCorrect = CE_EXERCISES.filter(
    (ex) => checked[ex.id] && answers[ex.id] === ex.correct
  ).length;
  const totalExercises = CE_EXERCISES.length;

  const handleSelect = (exerciseId: string, optionIndex: number) => {
    if (checked[exerciseId]) return;
    setAnswers((prev) => ({ ...prev, [exerciseId]: optionIndex }));
  };

  const handleCheck = (exerciseId: string) => {
    if (answers[exerciseId] == null) return;
    setChecked((prev) => ({ ...prev, [exerciseId]: true }));
  };

  const handleReset = () => {
    setAnswers({});
    setChecked({});
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <>
      {/* Header / Breadcrumb */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#085041] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link
              href="/francisation"
              className="hover:text-white transition-colors"
            >
              Francisation
            </Link>
            <ChevronRight size={14} />
            <span className="text-white">
              {fr ? "Compréhension écrite" : "Reading Comprehension"}
            </span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
                {fr ? "Compréhension écrite (CE)" : "Reading Comprehension (CE)"}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {fr
                  ? "Lisez des textes reels et repondez aux questions — format TCF/TEF"
                  : "Read real texts and answer questions — TCF/TEF format"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm mt-6">
            <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
              <Target size={16} />
              <span>
                {totalExercises} {fr ? "exercices" : "exercises"}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
              <Clock size={16} />
              <span>TCF: 39 Q / 60 min</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
              <CheckCircle2 size={16} />
              <span>
                {totalAnswered}/{totalExercises}{" "}
                {fr ? "repondues" : "answered"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="bg-white border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">
              {fr ? "Progression" : "Progress"}
            </span>
            <span className="text-emerald-600 font-semibold">
              {totalAnswered}/{totalExercises} —{" "}
              {totalAnswered > 0
                ? Math.round((totalCorrect / totalAnswered) * 100)
                : 0}
              % {fr ? "correct" : "correct"}
            </span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-2.5">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{
                width: `${
                  totalExercises > 0
                    ? (totalAnswered / totalExercises) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <section className="bg-emerald-50 border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-sm text-emerald-800">
              <span className="font-semibold">
                {fr ? "Format TCF Compréhension écrite:" : "TCF Reading Comprehension format:"}
              </span>{" "}
              {fr
                ? "39 questions, 60 minutes, textes de difficulté progressive. Les textes vont de l'avis simple (A2) a l'editorial argumentatif (C1). Lisez attentivement chaque texte avant de repondre."
                : "39 questions, 60 minutes, texts of progressive difficulty. Texts range from simple notices (A2) to argumentative editorials (C1). Read each text carefully before answering."}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Level Filter Tabs */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
              {levels.map((level) => {
                const count = CE_EXERCISES.filter(
                  (ex) => ex.level === level
                ).length;
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      selectedLevel === level
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                    }`}
                  >
                    {level}{" "}
                    <span
                      className={`ml-1 text-xs ${
                        selectedLevel === level
                          ? "text-emerald-200"
                          : "text-gray-400"
                      }`}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-600 transition-colors"
            >
              <RotateCcw size={14} />
              {fr ? "Reinitialiser" : "Reset"}
            </button>
          </div>

          {/* Exercises */}
          {filteredExercises.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">
                {fr
                  ? `Aucun exercice de niveau ${selectedLevel} pour le moment.`
                  : `No ${selectedLevel} level exercises available yet.`}
              </p>
              <p className="text-sm mt-1">
                {fr ? "Essayez un autre niveau." : "Try another level."}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredExercises.map((exercise, idx) => {
                const selected = answers[exercise.id];
                const isChecked = checked[exercise.id];
                const isCorrect = isChecked && selected === exercise.correct;
                const isWrong = isChecked && selected !== exercise.correct;

                return (
                  <div
                    key={exercise.id}
                    className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                      isCorrect
                        ? "border-emerald-400 shadow-emerald-100 shadow-lg"
                        : isWrong
                        ? "border-red-300 shadow-red-100 shadow-lg"
                        : "border-gray-200 hover:border-emerald-200"
                    }`}
                  >
                    {/* Exercise Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                      <span className="text-sm font-bold text-white bg-emerald-600 px-2.5 py-0.5 rounded-lg">
                        {exercise.level}
                      </span>
                      {exercise.topic && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {exercise.topic}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        {fr ? "Question" : "Question"} {idx + 1}/
                        {filteredExercises.length}
                      </span>
                    </div>

                    {/* Reading Passage */}
                    <div className="px-6 py-5 bg-emerald-50/50 border-b border-emerald-100">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5 shrink-0">
                          &#128214;
                        </span>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
                            {fr ? "Texte a lire" : "Reading passage"}
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                            {exercise.context}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Question & Options */}
                    <div className="px-6 py-5">
                      <p className="font-semibold text-gray-900 mb-4">
                        {exercise.question}
                      </p>

                      <div className="space-y-2.5">
                        {exercise.options.map((option, optIdx) => {
                          const isSelected = selected === optIdx;
                          const isCorrectOption = optIdx === exercise.correct;

                          let optionStyle =
                            "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer";
                          if (isSelected && !isChecked) {
                            optionStyle =
                              "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200";
                          }
                          if (isChecked) {
                            if (isCorrectOption) {
                              optionStyle =
                                "border-emerald-500 bg-emerald-50 text-emerald-800";
                            } else if (isSelected && !isCorrectOption) {
                              optionStyle =
                                "border-red-400 bg-red-50 text-red-700";
                            } else {
                              optionStyle =
                                "border-gray-100 bg-gray-50 text-gray-400 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                handleSelect(exercise.id, optIdx)
                              }
                              disabled={isChecked}
                              className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-sm ${optionStyle}`}
                            >
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isChecked && isCorrectOption
                                    ? "bg-emerald-500 text-white"
                                    : isChecked &&
                                      isSelected &&
                                      !isCorrectOption
                                    ? "bg-red-400 text-white"
                                    : isSelected && !isChecked
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {optionLabels[optIdx]}
                              </span>
                              <span className="flex-1">{option}</span>
                              {isChecked && isCorrectOption && (
                                <CheckCircle2
                                  size={18}
                                  className="text-emerald-500 shrink-0"
                                />
                              )}
                              {isChecked &&
                                isSelected &&
                                !isCorrectOption && (
                                  <XCircle
                                    size={18}
                                    className="text-red-400 shrink-0"
                                  />
                                )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Check Button */}
                      {!isChecked && (
                        <button
                          onClick={() => handleCheck(exercise.id)}
                          disabled={selected == null}
                          className={`mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            selected != null
                              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {fr ? "Verifier" : "Check"}
                        </button>
                      )}

                      {/* Explanation */}
                      {isChecked && (
                        <div
                          className={`mt-5 p-4 rounded-xl border text-sm ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                              : "bg-red-50 border-red-200 text-red-800"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-semibold mb-1">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 size={16} />
                                {fr ? "Correct!" : "Correct!"}
                              </>
                            ) : (
                              <>
                                <XCircle size={16} />
                                {fr ? "Incorrect" : "Incorrect"}
                              </>
                            )}
                          </div>
                          <p>{exercise.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Score Summary */}
      <section className="py-10 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50 rounded-2xl border-2 border-emerald-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-4 flex items-center gap-2">
              <Target size={22} className="text-emerald-600" />
              {fr ? "Votre score" : "Your Score"}
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 text-center border border-emerald-100">
                <div className="text-3xl font-bold text-[#085041] font-[family-name:var(--font-heading)]">
                  {totalAnswered}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {fr ? "Repondues" : "Answered"}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-emerald-100">
                <div className="text-3xl font-bold text-emerald-600 font-[family-name:var(--font-heading)]">
                  {totalCorrect}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {fr ? "Correctes" : "Correct"}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-emerald-100">
                <div className="text-3xl font-bold text-[#1D9E75] font-[family-name:var(--font-heading)]">
                  {totalAnswered > 0
                    ? Math.round((totalCorrect / totalAnswered) * 100)
                    : 0}
                  %
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {fr ? "Taux de réussite" : "Success rate"}
                </div>
              </div>
            </div>
            {totalAnswered > 0 && totalAnswered === totalExercises && (
              <p className="text-sm text-emerald-700 bg-emerald-100 rounded-xl px-4 py-3 text-center">
                {fr
                  ? totalCorrect === totalExercises
                    ? "Excellent! Score parfait! Vous etes pret(e) pour le TCF."
                    : totalCorrect >= totalExercises * 0.7
                    ? "Bon travail! Continuez a vous entrainer pour améliorer votre score."
                    : "Continuez vos efforts. Relisez les explications et reessayez."
                  : totalCorrect === totalExercises
                  ? "Excellent! Perfect score! You are ready for the TCF."
                  : totalCorrect >= totalExercises * 0.7
                  ? "Good work! Keep practicing to improve your score."
                  : "Keep going. Review the explanations and try again."}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA / Navigation */}
      <section className="py-10 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/francisation"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#085041] transition-colors"
            >
              <ArrowLeft size={16} />
              {fr
                ? "Retour a la page Francisation"
                : "Back to Francisation page"}
            </Link>
            <Link
              href="/francisation/expression-ecrite"
              className="flex items-center gap-2 px-6 py-3 bg-[#1D9E75] text-white font-semibold rounded-xl hover:bg-[#178a65] transition-all shadow-md"
            >
              {fr
                ? "Essayer l'Expression écrite"
                : "Try Written Expression"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Shell>
      <ComprehensionEcrite />
    </Shell>
  );
}
