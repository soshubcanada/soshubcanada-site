"use client";
import Shell from "@/components/Shell";
import AudioPlayer from "@/components/AudioPlayer";
import { useLang } from "@/lib/i18n";
import { CO_EXERCISES } from "@/lib/francisation-data";
import Link from "next/link";
import { useState } from "react";
import {
  Headphones,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Info,
  BookOpen,
  RotateCcw,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

const LEVELS = ["A2", "B1", "B2", "C1"] as const;

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A2: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  B1: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  B2: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
  C1: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
};

const TOPIC_COLORS: Record<string, string> = {
  logement: "bg-rose-50 text-rose-600",
  transport: "bg-cyan-50 text-cyan-600",
  emploi: "bg-violet-50 text-violet-600",
  administration: "bg-slate-100 text-slate-600",
  sante: "bg-pink-50 text-pink-600",
  immigration: "bg-indigo-50 text-indigo-600",
  culture: "bg-amber-50 text-amber-600",
  finances: "bg-lime-50 text-lime-600",
  société: "bg-fuchsia-50 text-fuchsia-600",
};

interface ExerciseState {
  selected: number | null;
  answered: boolean;
}

function ComprehensionOrale() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exerciseStates, setExerciseStates] = useState<Record<string, ExerciseState>>({});
  const [showText, setShowText] = useState<Record<string, boolean>>({});

  const filtered =
    selectedLevel === "all"
      ? CO_EXERCISES
      : CO_EXERCISES.filter((ex) => ex.level === selectedLevel);

  const getState = (id: string): ExerciseState =>
    exerciseStates[id] ?? { selected: null, answered: false };

  const setSelected = (id: string, optionIndex: number) => {
    setExerciseStates((prev) => ({
      ...prev,
      [id]: { ...getState(id), selected: optionIndex },
    }));
  };

  const verify = (id: string) => {
    setExerciseStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], answered: true },
    }));
  };

  const resetExercise = (id: string) => {
    setExerciseStates((prev) => ({
      ...prev,
      [id]: { selected: null, answered: false },
    }));
  };

  const resetAll = () => {
    setExerciseStates({});
    setExpandedId(null);
  };

  // Score tracking
  const answeredExercises = CO_EXERCISES.filter((ex) => getState(ex.id).answered);
  const correctCount = answeredExercises.filter(
    (ex) => getState(ex.id).selected === ex.correct
  ).length;
  const totalAnswered = answeredExercises.length;
  const totalExercises = CO_EXERCISES.length;
  const progressPercent = totalExercises > 0 ? Math.round((totalAnswered / totalExercises) * 100) : 0;

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6">
            <Link href="/francisation" className="hover:text-white transition-colors flex items-center gap-1">
              <ChevronLeft size={14} />
              Francisation
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">
              {fr ? "Compréhension orale" : "Listening Comprehension"}
            </span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Headphones size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-2">
                {fr ? "Compréhension orale (CO)" : "Listening Comprehension (CO)"}
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed max-w-2xl">
                {fr
                  ? "Écoutez des dialogues, annonces et conversations reelles du quotidien québécois. Entrainez-vous au format TCF Canada."
                  : "Listen to real Québec daily dialogues, announcements, and conversations. Practice the TCF Canada format."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TCF Format Info Box */}
      <section className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">
                {fr ? "Format officiel TCF CO" : "Official TCF CO Format"}
              </p>
              <p className="text-sm text-blue-600">
                {fr
                  ? "39 questions, 35 minutes, du plus facile au plus difficile. Les questions vont de A2 a C1. Chaque question ne s'écoute qu'une seule fois."
                  : "39 questions, 35 minutes, easiest to hardest. Questions range from A2 to C1. Each recording is played only once."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {fr ? "Progression" : "Progress"}: {totalAnswered}/{totalExercises}{" "}
              {fr ? "exercices completes" : "exercises completed"}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {fr ? "Score" : "Score"}: {correctCount}/{totalAnswered}{" "}
              {totalAnswered > 0 && (
                <span className="text-gray-400">
                  ({Math.round((correctCount / totalAnswered) * 100)}%)
                </span>
              )}
            </span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Level Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-sm font-medium text-gray-500 mr-2">
              {fr ? "Niveau:" : "Level:"}
            </span>
            <button
              onClick={() => setSelectedLevel("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedLevel === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
              }`}
            >
              {fr ? "Tous" : "All"} ({CO_EXERCISES.length})
            </button>
            {LEVELS.map((lvl) => {
              const count = CO_EXERCISES.filter((ex) => ex.level === lvl).length;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedLevel === lvl
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {lvl} ({count})
                </button>
              );
            })}

            {totalAnswered > 0 && (
              <button
                onClick={resetAll}
                className="ml-auto flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                <RotateCcw size={14} />
                {fr ? "Reinitialiser" : "Reset"}
              </button>
            )}
          </div>

          {/* Exercise Cards */}
          <div className="space-y-4">
            {filtered.map((exercise, index) => {
              const state = getState(exercise.id);
              const isExpanded = expandedId === exercise.id;
              const levelColor = LEVEL_COLORS[exercise.level] ?? LEVEL_COLORS.B1;
              const topicColor = TOPIC_COLORS[exercise.topic ?? ""] ?? "bg-gray-100 text-gray-600";

              return (
                <div
                  key={exercise.id}
                  className={`bg-white rounded-2xl border-2 transition-all ${
                    state.answered
                      ? state.selected === exercise.correct
                        ? "border-green-200"
                        : "border-red-200"
                      : isExpanded
                      ? "border-blue-300 shadow-md"
                      : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  {/* Card Header (always visible) */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : exercise.id)}
                    className="w-full flex items-center gap-4 p-5 text-left"
                  >
                    <span className="text-lg font-bold text-gray-300 w-8 text-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelColor.bg} ${levelColor.text}`}
                        >
                          {exercise.level}
                        </span>
                        {exercise.topic && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${topicColor}`}>
                            {exercise.topic}
                          </span>
                        )}
                        {state.answered && (
                          <span className="flex items-center gap-1">
                            {state.selected === exercise.correct ? (
                              <CheckCircle2 size={16} className="text-green-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 truncate">{exercise.question}</p>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-300 transition-transform flex-shrink-0 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-0">
                      <div className="ml-12">
                        {/* Audio player */}
                        <div className="mb-4">
                          <AudioPlayer
                            text={exercise.context}
                            label={fr ? "Écouter le dialogue" : "Listen to dialogue"}
                          />
                        </div>

                        {/* Show/hide transcript toggle */}
                        <div className="flex items-center gap-2 mb-3">
                          <button
                            onClick={() =>
                              setShowText((prev) => ({
                                ...prev,
                                [exercise.id]: !prev[exercise.id],
                              }))
                            }
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {showText[exercise.id] ? (
                              <>
                                <EyeOff size={14} />
                                {fr ? "Masquer la transcription" : "Hide transcript"}
                              </>
                            ) : (
                              <>
                                <Eye size={14} />
                                {fr ? "Afficher la transcription" : "Show transcript"}
                              </>
                            )}
                          </button>
                        </div>

                        {/* Context / Transcript box (toggleable) */}
                        {showText[exercise.id] && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                            <p className="text-sm text-gray-700 leading-relaxed italic whitespace-pre-line">
                              {exercise.context}
                            </p>
                            <p className="text-xs text-blue-400 mt-2">
                              {fr
                                ? "Transcription — en situation d'examen, vous entendriez cet enregistrement audio."
                                : "Transcript — in an exam situation, you would hear this audio recording."}
                            </p>
                          </div>
                        )}

                        {/* Question */}
                        <p className="text-base font-semibold text-gray-900 mb-4">
                          {exercise.question}
                        </p>

                        {/* Options */}
                        <div className="space-y-2 mb-5">
                          {exercise.options.map((option, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const isSelected = state.selected === optIdx;
                            const isCorrect = exercise.correct === optIdx;

                            let optionStyle = "border-gray-200 hover:border-blue-300 bg-white";
                            if (isSelected && !state.answered) {
                              optionStyle = "border-blue-400 bg-blue-50 ring-1 ring-blue-200";
                            }
                            if (state.answered) {
                              if (isCorrect) {
                                optionStyle = "border-green-400 bg-green-50";
                              } else if (isSelected && !isCorrect) {
                                optionStyle = "border-red-400 bg-red-50";
                              } else {
                                optionStyle = "border-gray-100 bg-gray-50 opacity-60";
                              }
                            }

                            return (
                              <label
                                key={optIdx}
                                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${optionStyle} ${
                                  state.answered ? "cursor-default" : ""
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${exercise.id}`}
                                  checked={isSelected}
                                  onChange={() => !state.answered && setSelected(exercise.id, optIdx)}
                                  disabled={state.answered}
                                  className="mt-0.5 accent-blue-600"
                                />
                                <span className="text-sm">
                                  <span className="font-semibold text-gray-500 mr-1.5">{letter}.</span>
                                  <span className={state.answered && isCorrect ? "font-semibold text-green-700" : "text-gray-700"}>
                                    {option}
                                  </span>
                                </span>
                                {state.answered && isCorrect && (
                                  <CheckCircle2 size={16} className="text-green-500 ml-auto flex-shrink-0 mt-0.5" />
                                )}
                                {state.answered && isSelected && !isCorrect && (
                                  <XCircle size={16} className="text-red-500 ml-auto flex-shrink-0 mt-0.5" />
                                )}
                              </label>
                            );
                          })}
                        </div>

                        {/* Verify / Reset buttons */}
                        <div className="flex items-center gap-3">
                          {!state.answered ? (
                            <button
                              onClick={() => state.selected !== null && verify(exercise.id)}
                              disabled={state.selected === null}
                              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                                state.selected !== null
                                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {fr ? "Verifier" : "Check"}
                            </button>
                          ) : (
                            <button
                              onClick={() => resetExercise(exercise.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                            >
                              <RotateCcw size={14} />
                              {fr ? "Refaire" : "Retry"}
                            </button>
                          )}
                        </div>

                        {/* Explanation callout */}
                        {state.answered && (
                          <div
                            className={`mt-4 p-4 rounded-xl border ${
                              state.selected === exercise.correct
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {state.selected === exercise.correct ? (
                                <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                              )}
                              <div>
                                <p className="text-sm font-semibold mb-1">
                                  {state.selected === exercise.correct
                                    ? fr ? "Bonne réponse!" : "Correct!"
                                    : fr ? "Mauvaise réponse" : "Incorrect"}
                                </p>
                                <p className="text-sm text-gray-700">{exercise.explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">
                {fr
                  ? "Aucun exercice pour ce niveau."
                  : "No exercises for this level."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Score Summary & CTA */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Score summary */}
          {totalAnswered > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 text-center">
              <h3 className="text-xl font-bold text-blue-800 font-[family-name:var(--font-heading)] mb-2">
                {fr ? "Votre score" : "Your Score"}
              </h3>
              <div className="text-4xl font-bold text-blue-600 font-[family-name:var(--font-heading)] mb-1">
                {correctCount}/{totalAnswered}
              </div>
              <p className="text-sm text-blue-500">
                {Math.round((correctCount / totalAnswered) * 100)}%{" "}
                {fr ? "de bonnes réponses" : "correct answers"}
              </p>
              {totalAnswered === totalExercises && (
                <p className="text-sm text-blue-600 font-medium mt-3">
                  {fr
                    ? "Vous avez complété tous les exercices de compréhension orale!"
                    : "You have completed all listening compréhension exercises!"}
                </p>
              )}
            </div>
          )}

          {/* Next step CTA */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <BookOpen size={22} className="text-emerald-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                {fr ? "Continuez avec la compréhension écrite" : "Continue with reading comprehension"}
              </h3>
              <p className="text-sm text-gray-500">
                {fr
                  ? "Lisez des textes reels: avis de logement, offres d'emploi, articles de presse, documents administratifs."
                  : "Read real texts: housing notices, job postings, news articles, administrative documents."}
              </p>
            </div>
            <Link
              href="/francisation/comprehension-ecrite"
              className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
            >
              {fr ? "Compréhension écrite" : "Reading Comprehension"}
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/francisation"
              className="text-sm text-gray-400 hover:text-[#085041] transition-colors inline-flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              {fr ? "Retour a Francisation" : "Back to Francisation"}
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
      <ComprehensionOrale />
    </Shell>
  );
}
