"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/learning-system";
import { GRAMMAR_LESSONS } from "@/lib/learning-system";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Lightbulb,
  PenLine,
  Trophy,
  Sparkles,
} from "lucide-react";

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  A2: { bg: "bg-orange-100", text: "text-orange-700" },
  B1: { bg: "bg-yellow-100", text: "text-yellow-700" },
  B2: { bg: "bg-emerald-100", text: "text-emerald-700" },
};

const CATEGORY_LABELS: Record<string, { fr: string; en: string; color: string }> = {
  "grammaire-base": { fr: "Grammaire de base", en: "Basic Grammar", color: "bg-sky-50 text-sky-600" },
  conjugaison: { fr: "Conjugaison", en: "Conjugation", color: "bg-violet-50 text-violet-600" },
};

interface FillBlankState {
  selected: string | null;
  answered: boolean;
}

interface ConjugationState {
  input: string;
  answered: boolean;
  correct: boolean;
}

interface WordOrderState {
  selectedWords: number[];
  answered: boolean;
  correct: boolean;
}

function GrammairePage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { addXP } = useProgress();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fillStates, setFillStates] = useState<Record<string, FillBlankState>>({});
  const [conjStates, setConjStates] = useState<Record<string, ConjugationState>>({});
  const [wordStates, setWordStates] = useState<Record<string, WordOrderState>>({});
  const [scores, setScores] = useState<Record<string, { correct: number; total: number }>>({});
  const [xpAwarded, setXpAwarded] = useState<Record<string, boolean>>({});

  // --- Fill-blank helpers ---
  const getFillState = (key: string): FillBlankState =>
    fillStates[key] ?? { selected: null, answered: false };

  const selectFillOption = (key: string, option: string) => {
    if (getFillState(key).answered) return;
    setFillStates((prev) => ({ ...prev, [key]: { selected: option, answered: false } }));
  };

  const checkFillAnswer = (key: string, correctAnswer: string, lessonId: string) => {
    const state = getFillState(key);
    if (state.selected === null) return;
    const isCorrect = state.selected === correctAnswer;
    setFillStates((prev) => ({ ...prev, [key]: { ...state, answered: true } }));
    recordAnswer(lessonId, isCorrect);
  };

  // --- Conjugation helpers ---
  const getConjState = (key: string): ConjugationState =>
    conjStates[key] ?? { input: "", answered: false, correct: false };

  const setConjInput = (key: string, value: string) => {
    if (getConjState(key).answered) return;
    setConjStates((prev) => ({
      ...prev,
      [key]: { input: value, answered: false, correct: false },
    }));
  };

  const checkConjAnswer = (key: string, correctAnswer: string, lessonId: string) => {
    const state = getConjState(key);
    if (!state.input.trim()) return;
    const isCorrect =
      state.input.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setConjStates((prev) => ({
      ...prev,
      [key]: { ...state, answered: true, correct: isCorrect },
    }));
    recordAnswer(lessonId, isCorrect);
  };

  // --- Word-order helpers ---
  const getWordState = (key: string): WordOrderState =>
    wordStates[key] ?? { selectedWords: [], answered: false, correct: false };

  const toggleWord = (key: string, wordIndex: number) => {
    const state = getWordState(key);
    if (state.answered) return;
    const exists = state.selectedWords.indexOf(wordIndex);
    let newSelected: number[];
    if (exists >= 0) {
      newSelected = state.selectedWords.filter((i) => i !== wordIndex);
    } else {
      newSelected = [...state.selectedWords, wordIndex];
    }
    setWordStates((prev) => ({
      ...prev,
      [key]: { selectedWords: newSelected, answered: false, correct: false },
    }));
  };

  const checkWordOrder = (
    key: string,
    options: string[],
    correctSentence: string,
    lessonId: string
  ) => {
    const state = getWordState(key);
    if (state.selectedWords.length !== options.length) return;
    const formed = state.selectedWords.map((i) => options[i]).join(" ");
    const isCorrect = formed === correctSentence;
    setWordStates((prev) => ({
      ...prev,
      [key]: { ...state, answered: true, correct: isCorrect },
    }));
    recordAnswer(lessonId, isCorrect);
  };

  const resetWordOrder = (key: string) => {
    setWordStates((prev) => ({
      ...prev,
      [key]: { selectedWords: [], answered: false, correct: false },
    }));
  };

  // --- Score tracking ---
  const recordAnswer = (lessonId: string, isCorrect: boolean) => {
    const answerKey = `${lessonId}-${Date.now()}`;
    if (isCorrect && !xpAwarded[answerKey]) {
      addXP(10);
      setXpAwarded((prev) => ({ ...prev, [answerKey]: true }));
    }
    setScores((prev) => {
      const current = prev[lessonId] ?? { correct: 0, total: 0 };
      return {
        ...prev,
        [lessonId]: {
          correct: current.correct + (isCorrect ? 1 : 0),
          total: current.total + 1,
        },
      };
    });
  };

  const resetLesson = (lessonId: string) => {
    const prefix = `${lessonId}-`;
    setFillStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(prefix)) delete next[k];
      });
      return next;
    });
    setConjStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(prefix)) delete next[k];
      });
      return next;
    });
    setWordStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(prefix)) delete next[k];
      });
      return next;
    });
    setScores((prev) => {
      const next = { ...prev };
      delete next[lessonId];
      return next;
    });
  };

  // Overall progress
  const totalExercises = GRAMMAR_LESSONS.reduce((sum, l) => sum + l.exercises.length, 0);
  const totalAnswered = Object.values(scores).reduce((sum, s) => sum + s.total, 0);
  const totalCorrect = Object.values(scores).reduce((sum, s) => sum + s.correct, 0);
  const progressPercent = totalExercises > 0 ? Math.round((totalAnswered / totalExercises) * 100) : 0;

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6b56] to-[#1D9E75] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-emerald-200 mb-6">
            <Link
              href="/francisation"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Francisation
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">
              {fr ? "Grammaire" : "Grammar"}
            </span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <BookOpen size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-2">
                {fr ? "Leçons de grammaire" : "Grammar Lessons"}
              </h1>
              <p className="text-emerald-100 text-lg leading-relaxed max-w-2xl">
                {fr
                  ? "Maitrisez les règles essentielles de la grammaire francaise avec des exemples concrets lies a la vie au Québec. De A2 a B2."
                  : "Master the essential rules of French grammar with concrete examples related to life in Québec. From A2 to B2."}
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
            <span className="text-sm font-semibold text-[#085041]">
              {fr ? "Score" : "Score"}: {totalCorrect}/{totalAnswered}{" "}
              {totalAnswered > 0 && (
                <span className="text-gray-400">
                  ({Math.round((totalCorrect / totalAnswered) * 100)}%)
                </span>
              )}
            </span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-2.5">
            <div
              className="bg-[#1D9E75] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Lesson Cards */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          {GRAMMAR_LESSONS.map((lesson, lessonIndex) => {
            const isExpanded = expandedId === lesson.id;
            const levelColor = LEVEL_COLORS[lesson.level] ?? LEVEL_COLORS.B1;
            const catInfo = CATEGORY_LABELS[lesson.category] ?? {
              fr: lesson.category,
              en: lesson.category,
              color: "bg-gray-100 text-gray-600",
            };
            const lessonScore = scores[lesson.id];
            const allDone = lessonScore && lessonScore.total >= lesson.exercises.length;

            return (
              <div
                key={lesson.id}
                className={`bg-white rounded-2xl border-2 transition-all ${
                  allDone
                    ? "border-emerald-200"
                    : isExpanded
                    ? "border-[#1D9E75] shadow-lg"
                    : "border-gray-100 hover:border-emerald-200 hover:shadow-sm"
                }`}
              >
                {/* Card Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : lesson.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <span className="text-lg font-bold text-gray-300 w-8 text-center flex-shrink-0">
                    {lessonIndex + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelColor.bg} ${levelColor.text}`}
                      >
                        {lesson.level}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catInfo.color}`}>
                        {fr ? catInfo.fr : catInfo.en}
                      </span>
                      {allDone && (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {fr ? lesson.titleFr : lesson.titleEn}
                    </p>
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
                    <div className="ml-12 space-y-8">
                      {/* ── Theory Section ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Lightbulb size={18} className="text-[#D97706]" />
                          <h3 className="text-base font-bold text-gray-900">
                            {fr ? "Theorie" : "Theory"}
                          </h3>
                        </div>
                        <div className="space-y-4">
                          {lesson.points.map((point, pIdx) => (
                            <div
                              key={pIdx}
                              className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4"
                            >
                              <p className="text-sm font-semibold text-[#085041] mb-3">
                                {fr ? point.ruleFr : point.ruleEn}
                              </p>
                              <div className="space-y-2">
                                {point.examples.map((ex, exIdx) => (
                                  <div
                                    key={exIdx}
                                    className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 bg-white rounded-lg px-3 py-2 border border-emerald-100"
                                  >
                                    <span className="text-sm font-medium text-gray-800">
                                      {ex.fr}
                                    </span>
                                    <span className="text-xs text-gray-400 sm:ml-auto flex-shrink-0">
                                      {ex.en}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ── Practice Exercises Section ── */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <PenLine size={18} className="text-[#1D9E75]" />
                          <h3 className="text-base font-bold text-gray-900">
                            {fr ? "Exercices pratiques" : "Practice Exercises"}
                          </h3>
                          {lessonScore && (
                            <span className="ml-auto text-sm font-medium text-gray-500">
                              {lessonScore.correct}/{lessonScore.total}
                            </span>
                          )}
                        </div>

                        <div className="space-y-5">
                          {lesson.exercises.map((exercise, exIdx) => {
                            const exKey = `${lesson.id}-${exIdx}`;

                            // ── Fill-blank exercise ──
                            if (exercise.type === "fill-blank" && exercise.options) {
                              const state = getFillState(exKey);
                              return (
                                <div
                                  key={exKey}
                                  className={`border rounded-xl p-4 transition-all ${
                                    state.answered
                                      ? state.selected === exercise.answer
                                        ? "border-green-200 bg-green-50/30"
                                        : "border-red-200 bg-red-50/30"
                                      : "border-gray-200 bg-white"
                                  }`}
                                >
                                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                                    {fr ? "Compléter la phrase" : "Fill in the blank"}
                                  </p>
                                  <p className="text-sm font-medium text-gray-800 mb-1">
                                    {fr ? exercise.questionFr : exercise.questionEn}
                                  </p>
                                  {exercise.hint && (
                                    <p className="text-xs text-gray-400 italic mb-3">
                                      {fr ? `Indice: ${exercise.hint}` : `Hint: ${exercise.hint}`}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {exercise.options.map((opt) => {
                                      const isSelected = state.selected === opt;
                                      const isCorrectOpt = opt === exercise.answer;

                                      let btnStyle =
                                        "border-gray-200 bg-white text-gray-700 hover:border-[#1D9E75] hover:bg-emerald-50";
                                      if (isSelected && !state.answered) {
                                        btnStyle =
                                          "border-[#1D9E75] bg-emerald-50 text-[#085041] ring-1 ring-emerald-200";
                                      }
                                      if (state.answered) {
                                        if (isCorrectOpt) {
                                          btnStyle =
                                            "border-green-400 bg-green-100 text-green-800 font-semibold";
                                        } else if (isSelected && !isCorrectOpt) {
                                          btnStyle =
                                            "border-red-400 bg-red-100 text-red-700";
                                        } else {
                                          btnStyle =
                                            "border-gray-100 bg-gray-50 text-gray-400";
                                        }
                                      }

                                      return (
                                        <button
                                          key={opt}
                                          onClick={() => selectFillOption(exKey, opt)}
                                          disabled={state.answered}
                                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${btnStyle} ${
                                            state.answered ? "cursor-default" : "cursor-pointer"
                                          }`}
                                        >
                                          {opt}
                                          {state.answered && isCorrectOpt && (
                                            <CheckCircle2
                                              size={14}
                                              className="inline ml-1.5 text-green-600"
                                            />
                                          )}
                                          {state.answered && isSelected && !isCorrectOpt && (
                                            <XCircle
                                              size={14}
                                              className="inline ml-1.5 text-red-500"
                                            />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {!state.answered ? (
                                    <button
                                      onClick={() =>
                                        checkFillAnswer(exKey, exercise.answer, lesson.id)
                                      }
                                      disabled={state.selected === null}
                                      className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                                        state.selected !== null
                                          ? "bg-[#1D9E75] text-white hover:bg-[#178a65] shadow-sm"
                                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      }`}
                                    >
                                      {fr ? "Verifier" : "Check"}
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-2 text-sm">
                                      {state.selected === exercise.answer ? (
                                        <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                                          <CheckCircle2 size={16} />
                                          {fr ? "Bonne réponse! +10 XP" : "Correct! +10 XP"}
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1.5 text-red-500 font-medium">
                                          <XCircle size={16} />
                                          {fr
                                            ? `Reponse correcte: ${exercise.answer}`
                                            : `Correct answer: ${exercise.answer}`}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            // ── Conjugation exercise ──
                            if (exercise.type === "conjugation") {
                              const state = getConjState(exKey);
                              return (
                                <div
                                  key={exKey}
                                  className={`border rounded-xl p-4 transition-all ${
                                    state.answered
                                      ? state.correct
                                        ? "border-green-200 bg-green-50/30"
                                        : "border-red-200 bg-red-50/30"
                                      : "border-gray-200 bg-white"
                                  }`}
                                >
                                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                                    {fr ? "Conjugaison" : "Conjugation"}
                                  </p>
                                  <p className="text-sm font-medium text-gray-800 mb-1">
                                    {fr ? exercise.questionFr : exercise.questionEn}
                                  </p>
                                  {exercise.hint && (
                                    <p className="text-xs text-gray-400 italic mb-3">
                                      {fr ? `Indice: ${exercise.hint}` : `Hint: ${exercise.hint}`}
                                    </p>
                                  )}
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
                                    <input
                                      type="text"
                                      value={state.input}
                                      onChange={(e) => setConjInput(exKey, e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                          checkConjAnswer(exKey, exercise.answer, lesson.id);
                                      }}
                                      disabled={state.answered}
                                      placeholder={fr ? "Tapez votre réponse..." : "Type your answer..."}
                                      className={`w-full sm:w-72 px-4 py-2 border-2 rounded-lg text-sm outline-none transition-all ${
                                        state.answered
                                          ? state.correct
                                            ? "border-green-300 bg-green-50"
                                            : "border-red-300 bg-red-50"
                                          : "border-gray-200 focus:border-[#1D9E75] focus:ring-1 focus:ring-emerald-200"
                                      }`}
                                    />
                                    {!state.answered && (
                                      <button
                                        onClick={() =>
                                          checkConjAnswer(exKey, exercise.answer, lesson.id)
                                        }
                                        disabled={!state.input.trim()}
                                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                                          state.input.trim()
                                            ? "bg-[#1D9E75] text-white hover:bg-[#178a65] shadow-sm"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }`}
                                      >
                                        {fr ? "Verifier" : "Check"}
                                      </button>
                                    )}
                                  </div>
                                  {state.answered && (
                                    <div className="flex items-center gap-2 text-sm">
                                      {state.correct ? (
                                        <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                                          <CheckCircle2 size={16} />
                                          {fr ? "Bonne réponse! +10 XP" : "Correct! +10 XP"}
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1.5 text-red-500 font-medium">
                                          <XCircle size={16} />
                                          {fr
                                            ? `Reponse correcte: ${exercise.answer}`
                                            : `Correct answer: ${exercise.answer}`}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            // ── Word-order exercise ──
                            if (exercise.type === "word-order" && exercise.options) {
                              const state = getWordState(exKey);
                              const words = exercise.options;
                              const formedSentence = state.selectedWords
                                .map((i) => words[i])
                                .join(" ");

                              return (
                                <div
                                  key={exKey}
                                  className={`border rounded-xl p-4 transition-all ${
                                    state.answered
                                      ? state.correct
                                        ? "border-green-200 bg-green-50/30"
                                        : "border-red-200 bg-red-50/30"
                                      : "border-gray-200 bg-white"
                                  }`}
                                >
                                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                                    {fr ? "Remettre dans l'ordre" : "Put in order"}
                                  </p>
                                  <p className="text-sm font-medium text-gray-800 mb-3">
                                    {fr ? exercise.questionFr : exercise.questionEn}
                                  </p>

                                  {/* Formed sentence area */}
                                  <div className="min-h-[44px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg px-3 py-2 mb-3 flex flex-wrap gap-1.5">
                                    {state.selectedWords.length === 0 ? (
                                      <span className="text-sm text-gray-300 italic">
                                        {fr
                                          ? "Cliquez sur les mots ci-dessous..."
                                          : "Click the words below..."}
                                      </span>
                                    ) : (
                                      state.selectedWords.map((wordIdx, posIdx) => (
                                        <button
                                          key={posIdx}
                                          onClick={() => toggleWord(exKey, wordIdx)}
                                          disabled={state.answered}
                                          className="px-3 py-1 bg-[#085041] text-white text-sm font-medium rounded-lg hover:bg-[#0a6b56] transition-colors cursor-pointer"
                                        >
                                          {words[wordIdx]}
                                        </button>
                                      ))
                                    )}
                                  </div>

                                  {/* Available words */}
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {words.map((word, wIdx) => {
                                      const isUsed = state.selectedWords.includes(wIdx);
                                      return (
                                        <button
                                          key={wIdx}
                                          onClick={() => toggleWord(exKey, wIdx)}
                                          disabled={state.answered || isUsed}
                                          className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                                            isUsed
                                              ? "border-gray-100 bg-gray-50 text-gray-300"
                                              : "border-[#1D9E75] bg-emerald-50 text-[#085041] hover:bg-emerald-100 cursor-pointer shadow-sm"
                                          }`}
                                        >
                                          {word}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-3">
                                    {!state.answered ? (
                                      <>
                                        <button
                                          onClick={() =>
                                            checkWordOrder(
                                              exKey,
                                              words,
                                              exercise.answer,
                                              lesson.id
                                            )
                                          }
                                          disabled={state.selectedWords.length !== words.length}
                                          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            state.selectedWords.length === words.length
                                              ? "bg-[#1D9E75] text-white hover:bg-[#178a65] shadow-sm"
                                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                          }`}
                                        >
                                          {fr ? "Verifier" : "Check"}
                                        </button>
                                        {state.selectedWords.length > 0 && (
                                          <button
                                            onClick={() => resetWordOrder(exKey)}
                                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                                          >
                                            <RotateCcw size={14} />
                                            {fr ? "Effacer" : "Clear"}
                                          </button>
                                        )}
                                      </>
                                    ) : (
                                      <div className="flex items-center gap-2 text-sm">
                                        {state.correct ? (
                                          <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                                            <CheckCircle2 size={16} />
                                            {fr ? "Bonne réponse! +10 XP" : "Correct! +10 XP"}
                                          </span>
                                        ) : (
                                          <div>
                                            <span className="flex items-center gap-1.5 text-red-500 font-medium mb-1">
                                              <XCircle size={16} />
                                              {fr ? "Incorrect" : "Incorrect"}
                                            </span>
                                            <p className="text-sm text-gray-600">
                                              {fr ? "Reponse correcte: " : "Correct answer: "}
                                              <span className="font-semibold">{exercise.answer}</span>
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          })}
                        </div>

                        {/* Lesson Score Summary */}
                        {lessonScore && lessonScore.total >= lesson.exercises.length && (
                          <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Trophy size={20} className="text-[#D97706]" />
                              <h4 className="text-lg font-bold text-[#085041] font-[family-name:var(--font-heading)]">
                                {fr ? "Leçon terminee!" : "Lesson Complete!"}
                              </h4>
                            </div>
                            <div className="text-3xl font-bold text-[#1D9E75] font-[family-name:var(--font-heading)] mb-1">
                              {lessonScore.correct}/{lessonScore.total}
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                              {Math.round((lessonScore.correct / lessonScore.total) * 100)}%{" "}
                              {fr ? "de bonnes réponses" : "correct answers"}
                            </p>
                            {lessonScore.correct === lessonScore.total && (
                              <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#D97706]">
                                <Sparkles size={16} />
                                {fr ? "Score parfait!" : "Perfect score!"}
                              </div>
                            )}
                            <button
                              onClick={() => resetLesson(lesson.id)}
                              className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 rounded-xl text-sm font-medium bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all"
                            >
                              <RotateCcw size={14} />
                              {fr ? "Recommencer" : "Retry"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Overall Score Summary & CTA */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {totalAnswered > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8 text-center">
              <h3 className="text-xl font-bold text-[#085041] font-[family-name:var(--font-heading)] mb-2">
                {fr ? "Score global" : "Overall Score"}
              </h3>
              <div className="text-4xl font-bold text-[#1D9E75] font-[family-name:var(--font-heading)] mb-1">
                {totalCorrect}/{totalAnswered}
              </div>
              <p className="text-sm text-emerald-600">
                {Math.round((totalCorrect / totalAnswered) * 100)}%{" "}
                {fr ? "de bonnes réponses" : "correct answers"}
                {" | "}
                {totalCorrect * 10} XP {fr ? "gagnes" : "earned"}
              </p>
              {totalAnswered === totalExercises && (
                <p className="text-sm text-[#D97706] font-semibold mt-3 flex items-center justify-center gap-1.5">
                  <Trophy size={16} />
                  {fr
                    ? "Felicitations! Vous avez complété toutes les leçons de grammaire!"
                    : "Congratulations! You have completed all grammar lessons!"}
                </p>
              )}
            </div>
          )}

          {/* Next step CTA */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <BookOpen size={22} className="text-blue-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                {fr ? "Continuez avec la compréhension orale" : "Continue with listening comprehension"}
              </h3>
              <p className="text-sm text-gray-500">
                {fr
                  ? "Écoutez des dialogues et conversations reelles du quotidien québécois."
                  : "Listen to real Québec daily dialogues and conversations."}
              </p>
            </div>
            <Link
              href="/francisation/comprehension-orale"
              className="px-5 py-2.5 bg-[#1D9E75] text-white font-semibold rounded-xl hover:bg-[#178a65] transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
            >
              {fr ? "Compréhension orale" : "Listening"}
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
      <GrammairePage />
    </Shell>
  );
}
