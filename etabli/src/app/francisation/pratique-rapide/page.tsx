"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import {
  useProgress,
  FILL_BLANK_EXERCISES,
  WORD_ORDER_EXERCISES,
  type FillBlankExercise,
  type WordOrderExercise,
} from "@/lib/learning-system";
import { CO_EXERCISES, type MCQQuestion } from "@/lib/francisation-data";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  RotateCcw,
  Timer,
  Zap,
  Trophy,
  Flame,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";

// ─── Types ───

type ExerciseType = "fill-blank" | "mcq" | "word-order";

interface SessionExercise {
  type: ExerciseType;
  data: FillBlankExercise | MCQQuestion | WordOrderExercise;
}

type SessionPhase = "start" | "active" | "results";

// ─── Helpers ───

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateSession(): SessionExercise[] {
  const fillBlanks: SessionExercise[] = shuffleArray(FILL_BLANK_EXERCISES)
    .slice(0, 4)
    .map((ex) => ({ type: "fill-blank" as ExerciseType, data: ex }));

  const mcqs: SessionExercise[] = shuffleArray(CO_EXERCISES)
    .slice(0, 3)
    .map((ex) => ({ type: "mcq" as ExerciseType, data: ex }));

  const wordOrders: SessionExercise[] = shuffleArray(WORD_ORDER_EXERCISES)
    .slice(0, 3)
    .map((ex) => ({ type: "word-order" as ExerciseType, data: ex }));

  return shuffleArray([...fillBlanks, ...mcqs, ...wordOrders]);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Main Component ───

function PratiqueRapidePage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { progress, addXP, completeExercise } = useProgress();

  // Session state
  const [phase, setPhase] = useState<SessionPhase>("start");
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Exercise-specific state
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wordOrderSelection, setWordOrderSelection] = useState<string[]>([]);
  const [wordOrderPool, setWordOrderPool] = useState<string[]>([]);

  // Timer
  useEffect(() => {
    if (phase === "active" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, timeLeft]);

  // Auto-finish when timer hits zero
  useEffect(() => {
    if (phase === "active" && timeLeft === 0) {
      setPhase("results");
    }
  }, [phase, timeLeft]);

  // Reset word-order pool when exercise changes
  useEffect(() => {
    if (
      phase === "active" &&
      exercises[currentIndex]?.type === "word-order"
    ) {
      const ex = exercises[currentIndex].data as WordOrderExercise;
      setWordOrderPool(shuffleArray([...ex.words]));
      setWordOrderSelection([]);
    }
  }, [phase, currentIndex, exercises]);

  const startSession = useCallback(() => {
    const session = generateSession();
    setExercises(session);
    setCurrentIndex(0);
    setScore(0);
    setTotalXP(0);
    setTimeLeft(5 * 60);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setWordOrderSelection([]);
    setWordOrderPool([]);
    setPhase("active");
  }, []);

  const handleAnswer = useCallback(
    (answer: string | number) => {
      if (selectedAnswer !== null) return;

      const exercise = exercises[currentIndex];
      let correct = false;

      if (exercise.type === "fill-blank") {
        const ex = exercise.data as FillBlankExercise;
        correct = answer === ex.answer;
      } else if (exercise.type === "mcq") {
        const ex = exercise.data as MCQQuestion;
        correct = answer === ex.correct;
      }

      setSelectedAnswer(answer);
      setIsCorrect(correct);

      if (correct) {
        setScore((s) => s + 1);
        setTotalXP((x) => x + 10);
        addXP(10);
      }
    },
    [selectedAnswer, exercises, currentIndex, addXP]
  );

  const handleWordOrderSubmit = useCallback(() => {
    if (selectedAnswer !== null) return;
    const ex = exercises[currentIndex].data as WordOrderExercise;
    const attempt = wordOrderSelection.join(" ");
    const correct = attempt === ex.correctSentence;

    setSelectedAnswer(attempt);
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      setTotalXP((x) => x + 10);
      addXP(10);
    }
  }, [selectedAnswer, exercises, currentIndex, wordOrderSelection, addXP]);

  const addWord = (word: string, poolIndex: number) => {
    if (selectedAnswer !== null) return;
    setWordOrderSelection((prev) => [...prev, word]);
    setWordOrderPool((prev) => prev.filter((_, i) => i !== poolIndex));
  };

  const removeWord = (selectionIndex: number) => {
    if (selectedAnswer !== null) return;
    const word = wordOrderSelection[selectionIndex];
    setWordOrderSelection((prev) => prev.filter((_, i) => i !== selectionIndex));
    setWordOrderPool((prev) => [...prev, word]);
  };

  const nextExercise = useCallback(() => {
    if (currentIndex + 1 >= exercises.length) {
      completeExercise("pratique-rapide");
      setPhase("results");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  }, [currentIndex, exercises.length, completeExercise]);

  const currentExercise = exercises[currentIndex];
  const scorePercent = exercises.length > 0 ? Math.round((score / exercises.length) * 100) : 0;

  return (
    <>
      {/* ─── START SCREEN ─── */}
      {phase === "start" && (
        <>
          {/* Hero */}
          <section className="bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#1D9E75] text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
              {/* Breadcrumb */}
              <nav className="flex items-center justify-center gap-2 text-sm text-white/60 mb-8">
                <Link href="/francisation" className="hover:text-white transition-colors">
                  {fr ? "Francisation" : "French Program"}
                </Link>
                <ChevronRight size={14} />
                <span className="text-white font-medium">
                  {fr ? "Pratique rapide" : "Quick Practice"}
                </span>
              </nav>

              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Zap size={32} className="text-amber-300" />
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-heading)] mb-4">
                {fr ? "Pratique rapide quotidienne" : "Daily Quick Practice"}
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
                {fr
                  ? "5 minutes d'exercices varies pour garder ton français actif. Grammaire, vocabulaire et compréhension melanges."
                  : "5 minutes of mixed exercises to keep your French active. Grammar, vocabulary and compréhension blended."}
              </p>

              {/* Streak & Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <Flame size={22} className="text-orange-400" />
                  <div className="text-left">
                    <p className="text-xs text-white/60">{fr ? "Serie" : "Streak"}</p>
                    <p className="text-xl font-bold">{progress.streak} {fr ? "jours" : "days"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <Star size={22} className="text-amber-300" />
                  <div className="text-left">
                    <p className="text-xs text-white/60">{fr ? "Niveau" : "Level"}</p>
                    <p className="text-xl font-bold">{progress.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <Zap size={22} className="text-emerald-300" />
                  <div className="text-left">
                    <p className="text-xs text-white/60">{fr ? "XP aujourd'hui" : "XP today"}</p>
                    <p className="text-xl font-bold">{progress.dailyXP} / {progress.dailyGoal}</p>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startSession}
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#085041] font-bold text-lg rounded-2xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play size={24} fill="currentColor" />
                {fr ? "Commencer la session" : "Start Session"}
              </button>

              <p className="text-sm text-white/50 mt-4">
                {fr ? "~10 exercices en 5 minutes" : "~10 exercises in 5 minutes"}
              </p>
            </div>
          </section>

          {/* How it works */}
          <section className="py-14 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] text-center mb-8">
                {fr ? "Comment ca marche" : "How it works"}
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    icon: Timer,
                    titleFr: "5 minutes chrono",
                    titleEn: "5-minute timer",
                    descFr: "Un compte a rebours te garde concentre. Pas de temps a perdre !",
                    descEn: "A countdown keeps you focused. No time to waste!",
                  },
                  {
                    icon: Zap,
                    titleFr: "Exercices varies",
                    titleEn: "Mixed exercises",
                    descFr: "Textes a trous, QCM de compréhension et remise en ordre de mots.",
                    descEn: "Fill-in-the-blank, comprehension MCQ, and word ordering.",
                  },
                  {
                    icon: Trophy,
                    titleFr: "Gagne des XP",
                    titleEn: "Earn XP",
                    descFr: "+10 XP par bonne réponse. Maintiens ta serie quotidienne !",
                    descEn: "+10 XP per correct answer. Maintain your daily streak!",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 p-6 text-center"
                  >
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <item.icon size={24} className="text-[#1D9E75]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 font-[family-name:var(--font-heading)]">
                      {fr ? item.titleFr : item.titleEn}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {fr ? item.descFr : item.descEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ─── ACTIVE SESSION ─── */}
      {phase === "active" && currentExercise && (
        <section className="min-h-[80vh] bg-gray-50">
          {/* Timer Bar */}
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Timer size={18} className={timeLeft <= 60 ? "text-red-500" : "text-[#085041]"} />
                  <span
                    className={`text-lg font-bold font-mono ${
                      timeLeft <= 60 ? "text-red-500" : "text-[#085041]"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Zap size={14} className="text-amber-500" />
                  <span className="font-semibold text-[#D97706]">+{totalXP} XP</span>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {exercises.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      i < currentIndex
                        ? "bg-[#1D9E75]"
                        : i === currentIndex
                        ? "bg-[#085041]"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Exercise Content */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <p className="text-sm text-gray-400 mb-2">
              {fr ? "Question" : "Question"} {currentIndex + 1} / {exercises.length}
            </p>

            {/* ── Fill-in-the-Blank ── */}
            {currentExercise.type === "fill-blank" && (() => {
              const ex = currentExercise.data as FillBlankExercise;
              return (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-[#1D9E75]">
                      {fr ? "Texte a trous" : "Fill in the blank"}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {ex.level}
                    </span>
                  </div>

                  <p className="text-lg md:text-xl font-semibold text-gray-900 mb-2 leading-relaxed">
                    {ex.sentenceFr}
                  </p>
                  <p className="text-sm text-gray-400 mb-8 italic">{ex.sentenceEn}</p>

                  <div className="grid grid-cols-2 gap-3">
                    {ex.options.map((opt) => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrectOpt = opt === ex.answer;
                      let style =
                        "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-800";
                      if (selectedAnswer !== null) {
                        if (isCorrectOpt) {
                          style = "bg-emerald-50 border-emerald-400 text-emerald-800";
                        } else if (isSelected && !isCorrectOpt) {
                          style = "bg-red-50 border-red-400 text-red-800";
                        } else {
                          style = "bg-gray-50 border-gray-200 text-gray-400";
                        }
                      }
                      return (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          disabled={selectedAnswer !== null}
                          className={`px-4 py-3.5 rounded-xl border-2 font-medium transition-all text-center flex items-center justify-center gap-2 ${style}`}
                        >
                          <span>{opt}</span>
                          {selectedAnswer !== null && isCorrectOpt && (
                            <CheckCircle2 size={18} className="text-emerald-500" />
                          )}
                          {selectedAnswer !== null && isSelected && !isCorrectOpt && (
                            <XCircle size={18} className="text-red-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  {selectedAnswer !== null && (
                    <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="text-sm">
                        {isCorrect ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={16} />
                            {fr ? "Bonne réponse ! +10 XP" : "Correct! +10 XP"}
                          </span>
                        ) : (
                          <span className="text-red-600">
                            {fr ? "La bonne réponse etait : " : "The correct answer was: "}
                            <strong>{ex.answer}</strong>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={nextExercise}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#085041] text-white rounded-xl text-sm font-medium hover:bg-[#06392e] transition-colors"
                      >
                        {currentIndex + 1 >= exercises.length
                          ? fr ? "Voir les résultats" : "See Results"
                          : fr ? "Suivant" : "Next"}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── MCQ (Compréhension) ── */}
            {currentExercise.type === "mcq" && (() => {
              const ex = currentExercise.data as MCQQuestion;
              return (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      {fr ? "Compréhension" : "Compréhension"}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {ex.level}
                    </span>
                  </div>

                  {/* Audio for listening comprehension */}
                  <AudioPlayer text={ex.context} variant="compact" label={fr ? "Écouter" : "Listen"} />

                  {/* Context */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {ex.context}
                    </p>
                  </div>

                  <p className="text-lg font-semibold text-gray-900 mb-6">{ex.question}</p>

                  <div className="space-y-3">
                    {ex.options.map((opt, oi) => {
                      const isSelected = selectedAnswer === oi;
                      const isCorrectOpt = oi === ex.correct;
                      let style =
                        "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-800";
                      if (selectedAnswer !== null) {
                        if (isCorrectOpt) {
                          style = "bg-emerald-50 border-emerald-400 text-emerald-800";
                        } else if (isSelected && !isCorrectOpt) {
                          style = "bg-red-50 border-red-400 text-red-800";
                        } else {
                          style = "bg-gray-50 border-gray-200 text-gray-400";
                        }
                      }
                      return (
                        <button
                          key={oi}
                          onClick={() => handleAnswer(oi)}
                          disabled={selectedAnswer !== null}
                          className={`w-full text-left px-5 py-3.5 rounded-xl border-2 font-medium transition-all flex items-center justify-between ${style}`}
                        >
                          <span>{opt}</span>
                          {selectedAnswer !== null && isCorrectOpt && (
                            <CheckCircle2 size={18} className="text-emerald-500" />
                          )}
                          {selectedAnswer !== null && isSelected && !isCorrectOpt && (
                            <XCircle size={18} className="text-red-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation & Feedback */}
                  {selectedAnswer !== null && (
                    <div className="mt-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-amber-800">
                          <strong>{fr ? "Explication : " : "Explanation: "}</strong>
                          {ex.explanation}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="text-sm">
                          {isCorrect ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 size={16} />
                              {fr ? "Bonne réponse ! +10 XP" : "Correct! +10 XP"}
                            </span>
                          ) : (
                            <span className="text-red-600">
                              {fr ? "Reponse incorrecte." : "Incorrect answer."}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={nextExercise}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#085041] text-white rounded-xl text-sm font-medium hover:bg-[#06392e] transition-colors"
                        >
                          {currentIndex + 1 >= exercises.length
                            ? fr ? "Voir les résultats" : "See Results"
                            : fr ? "Suivant" : "Next"}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Word Order ── */}
            {currentExercise.type === "word-order" && (() => {
              const ex = currentExercise.data as WordOrderExercise;
              return (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
                      {fr ? "Ordre des mots" : "Word Order"}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {ex.level}
                    </span>
                  </div>

                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {fr ? ex.hintFr : ex.hintEn}
                  </p>
                  <p className="text-sm text-gray-400 mb-6 italic">
                    {fr
                      ? "Cliquer sur les mots dans le bon ordre"
                      : "Click the words in the correct order"}
                  </p>

                  {/* Selected words (sentence being built) */}
                  <div className="min-h-[56px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-3 mb-4 flex flex-wrap gap-2">
                    {wordOrderSelection.length === 0 ? (
                      <span className="text-sm text-gray-300 italic">
                        {fr ? "Ta phrase apparaitra ici..." : "Your sentence will appear here..."}
                      </span>
                    ) : (
                      wordOrderSelection.map((word, i) => (
                        <button
                          key={`sel-${i}`}
                          onClick={() => removeWord(i)}
                          disabled={selectedAnswer !== null}
                          className="px-3 py-1.5 bg-[#085041] text-white rounded-lg text-sm font-medium hover:bg-[#06392e] transition-colors"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Available words */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {wordOrderPool.map((word, i) => (
                      <button
                        key={`pool-${i}`}
                        onClick={() => addWord(word, i)}
                        disabled={selectedAnswer !== null}
                        className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-[#1D9E75] hover:bg-emerald-50 transition-all"
                      >
                        {word}
                      </button>
                    ))}
                  </div>

                  {/* Submit / Feedback */}
                  {selectedAnswer === null ? (
                    <button
                      onClick={handleWordOrderSubmit}
                      disabled={wordOrderSelection.length === 0}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D9E75] text-white rounded-xl font-medium hover:bg-[#178a64] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {fr ? "Verifier" : "Check"}
                    </button>
                  ) : (
                    <div className="mt-2">
                      {!isCorrect && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                          <p className="text-sm text-amber-800">
                            <strong>{fr ? "Reponse correcte : " : "Correct answer: "}</strong>
                            {ex.correctSentence}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="text-sm">
                          {isCorrect ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 size={16} />
                              {fr ? "Parfait ! +10 XP" : "Perfect! +10 XP"}
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <XCircle size={16} />
                              {fr ? "Pas tout a fait..." : "Not quite..."}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={nextExercise}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#085041] text-white rounded-xl text-sm font-medium hover:bg-[#06392e] transition-colors"
                        >
                          {currentIndex + 1 >= exercises.length
                            ? fr ? "Voir les résultats" : "See Results"
                            : fr ? "Suivant" : "Next"}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* ─── RESULTS SCREEN ─── */}
      {phase === "results" && (
        <section className="min-h-[80vh] bg-gradient-to-br from-gray-50 to-white flex items-center">
          <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 w-full">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 text-center shadow-lg">
              {/* Trophy */}
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy
                  size={40}
                  className={
                    scorePercent >= 70
                      ? "text-[#D97706]"
                      : scorePercent >= 40
                      ? "text-amber-400"
                      : "text-gray-400"
                  }
                />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
                {fr ? "Session terminee !" : "Session Complete!"}
              </h2>

              {/* Score */}
              <div className="text-5xl font-bold font-[family-name:var(--font-heading)] my-6">
                <span
                  className={
                    scorePercent >= 70
                      ? "text-[#1D9E75]"
                      : scorePercent >= 40
                      ? "text-[#D97706]"
                      : "text-red-500"
                  }
                >
                  {scorePercent}%
                </span>
              </div>

              <p className="text-gray-600 mb-1">
                {score} / {exercises.length}{" "}
                {fr ? "réponses correctes" : "correct answers"}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                {scorePercent >= 70
                  ? fr
                    ? "Excellent travail ! Continue comme ca."
                    : "Excellent work! Keep it up."
                  : scorePercent >= 40
                  ? fr
                    ? "Bon effort ! Revise les points difficiles."
                    : "Good effort! Review the difficult topics."
                  : fr
                  ? "Continue de pratiquer, tu vas t'améliorer !"
                  : "Keep practicing, you will improve!"}
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <Zap size={20} className="mx-auto mb-1 text-[#1D9E75]" />
                  <p className="text-lg font-bold text-[#085041]">+{totalXP}</p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <Flame size={20} className="mx-auto mb-1 text-orange-500" />
                  <p className="text-lg font-bold text-orange-700">{progress.streak}</p>
                  <p className="text-xs text-gray-500">{fr ? "Serie" : "Streak"}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <Star size={20} className="mx-auto mb-1 text-[#D97706]" />
                  <p className="text-lg font-bold text-amber-700">{progress.level}</p>
                  <p className="text-xs text-gray-500">{fr ? "Niveau" : "Level"}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={startSession}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#085041] text-white font-semibold rounded-xl hover:bg-[#06392e] transition-all shadow-md"
                >
                  <RotateCcw size={18} />
                  {fr ? "Rejouer" : "Practice Again"}
                </button>
                <Link
                  href="/francisation"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  <ArrowLeft size={16} />
                  {fr ? "Retour" : "Back"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Shell>
      <PratiqueRapidePage />
    </Shell>
  );
}
