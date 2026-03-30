"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import {
  useProgress,
  FILL_BLANK_EXERCISES,
  MATCHING_EXERCISES,
  WORD_ORDER_EXERCISES,
} from "@/lib/learning-system";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  XCircle,
  PenLine,
  Link2,
  ArrowUpDown,
  RotateCcw,
  Zap,
  Trophy,
  Lightbulb,
  Star,
  Filter,
} from "lucide-react";

type ExerciseTab = "fill-blank" | "matching" | "word-order";
type Level = "A2" | "B1" | "B2";

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── FILL-IN-THE-BLANK COMPONENT ───
function FillBlankMode({ fr }: { fr: boolean }) {
  const { addXP } = useProgress();
  const [levelFilter, setLevelFilter] = useState<Level | "all">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const topics = useMemo(() => {
    const set = new Set(FILL_BLANK_EXERCISES.map((e) => e.topic));
    return Array.from(set);
  }, []);

  const exercises = useMemo(() => {
    return FILL_BLANK_EXERCISES.filter((e) => {
      if (levelFilter !== "all" && e.level !== levelFilter) return false;
      if (topicFilter !== "all" && e.topic !== topicFilter) return false;
      return true;
    });
  }, [levelFilter, topicFilter]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setAnswered(0);
  }, [levelFilter, topicFilter]);

  const current = exercises[currentIndex];

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    const correct = option === current.answer;
    setIsCorrect(correct);
    setAnswered((a) => a + 1);
    if (correct) {
      setScore((s) => s + 1);
      addXP(10);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setAnswered(0);
  };

  const progressPercent = exercises.length > 0 ? ((currentIndex + (selectedOption !== null ? 1 : 0)) / exercises.length) * 100 : 0;
  const isFinished = exercises.length > 0 && currentIndex === exercises.length - 1 && selectedOption !== null;

  if (exercises.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <PenLine size={48} className="mx-auto mb-4 opacity-40" />
        <p className="text-lg">{fr ? "Aucun exercice pour ces filtres." : "No exercises for these filters."}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Filter size={16} className="text-gray-400" />
        <div className="flex gap-2">
          {(["all", "A2", "B1", "B2"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                levelFilter === lvl
                  ? "bg-[#085041] text-white"
                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {lvl === "all" ? (fr ? "Tous" : "All") : lvl}
            </button>
          ))}
        </div>
        <span className="text-gray-300">|</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTopicFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              topicFilter === "all"
                ? "bg-[#1D9E75] text-white"
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {fr ? "Tous" : "All"}
          </button>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setTopicFilter(t === topicFilter ? "all" : t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                topicFilter === t
                  ? "bg-[#1D9E75] text-white"
                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>
            {fr ? "Question" : "Question"} {currentIndex + 1} / {exercises.length}
          </span>
          <span className="flex items-center gap-1">
            <Star size={14} className="text-[#D97706]" />
            {score} / {answered}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-[#1D9E75] h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold bg-[#085041] text-white px-2 py-0.5 rounded-full">
              {current.level}
            </span>
            <span className="text-xs font-medium text-gray-400 capitalize">{current.topic}</span>
          </div>

          <p className="text-lg text-gray-700 mb-2 leading-relaxed">
            {fr ? current.sentenceFr : current.sentenceEn}
          </p>
          <p className="text-sm text-gray-400 mb-8">
            {fr ? current.sentenceEn : current.sentenceFr}
          </p>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {current.options.map((option) => {
              const isThis = selectedOption === option;
              const isAnswer = option === current.answer;
              let style = "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-[#1D9E75] text-gray-800";
              if (selectedOption !== null) {
                if (isAnswer) {
                  style = "bg-emerald-50 border-emerald-400 text-emerald-800";
                } else if (isThis && !isAnswer) {
                  style = "bg-red-50 border-red-400 text-red-800";
                } else {
                  style = "bg-gray-50 border-gray-200 text-gray-400";
                }
              }
              return (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  disabled={selectedOption !== null}
                  className={`px-4 py-3 rounded-xl border-2 font-medium transition-all flex items-center justify-between ${style}`}
                >
                  <span>{option}</span>
                  {selectedOption !== null && isAnswer && <CheckCircle2 size={18} className="text-emerald-500" />}
                  {selectedOption !== null && isThis && !isAnswer && <XCircle size={18} className="text-red-500" />}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {selectedOption !== null && (
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm">
                {isCorrect ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Zap size={14} /> {fr ? "Bonne réponse ! +10 XP" : "Correct! +10 XP"}
                  </span>
                ) : (
                  <span className="text-red-600">
                    {fr ? "La bonne réponse etait : " : "The correct answer was: "}
                    <strong>{current.answer}</strong>
                  </span>
                )}
              </div>
              {isFinished ? (
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#085041] text-white rounded-xl text-sm font-medium hover:bg-[#06392e] transition-colors"
                >
                  <RotateCcw size={14} />
                  {fr ? "Recommencer" : "Restart"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1D9E75] text-white rounded-xl text-sm font-medium hover:bg-[#178a64] transition-colors"
                >
                  {fr ? "Suivant" : "Next"}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Final score */}
        {isFinished && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
            <Trophy size={40} className="mx-auto mb-3 text-[#D97706]" />
            <h3 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-1">
              {fr ? "Exercice termine !" : "Exercise Complete!"}
            </h3>
            <p className="text-4xl font-bold font-[family-name:var(--font-heading)] my-4">
              <span className={score / exercises.length >= 0.7 ? "text-[#1D9E75]" : score / exercises.length >= 0.4 ? "text-[#D97706]" : "text-red-500"}>
                {Math.round((score / exercises.length) * 100)}%
              </span>
            </p>
            <p className="text-gray-500 text-sm">
              {score} / {exercises.length} {fr ? "réponses correctes" : "correct answers"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MATCHING PAIRS COMPONENT ───
function MatchingMode({ fr }: { fr: boolean }) {
  const { addXP } = useProgress();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  const [flashWrong, setFlashWrong] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const exercise = MATCHING_EXERCISES[exerciseIndex];

  const initExercise = useCallback(() => {
    const ex = MATCHING_EXERCISES[exerciseIndex];
    setShuffledRight(shuffleArray(ex.pairs.map((p) => p.right)));
    setSelectedLeft(null);
    setMatchedPairs(new Set());
    setIsComplete(false);
    setFlashWrong(null);
  }, [exerciseIndex]);

  useEffect(() => {
    initExercise();
  }, [initExercise]);

  const handleLeftClick = (left: string) => {
    if (matchedPairs.has(left)) return;
    setSelectedLeft(left === selectedLeft ? null : left);
  };

  const handleRightClick = (right: string) => {
    if (!selectedLeft) return;
    if (Array.from(matchedPairs).some((l) => exercise.pairs.find((p) => p.left === l)?.right === right)) return;

    const pair = exercise.pairs.find((p) => p.left === selectedLeft);
    if (pair && pair.right === right) {
      const newMatched = new Set(matchedPairs);
      newMatched.add(selectedLeft);
      setMatchedPairs(newMatched);
      setSelectedLeft(null);
      if (newMatched.size === exercise.pairs.length) {
        setIsComplete(true);
        addXP(25);
      }
    } else {
      setFlashWrong(right);
      setTimeout(() => setFlashWrong(null), 600);
    }
  };

  const handleNextExercise = () => {
    if (exerciseIndex + 1 < MATCHING_EXERCISES.length) {
      setExerciseIndex((i) => i + 1);
    }
  };

  const handleRestart = () => {
    setExerciseIndex(0);
  };

  const isRightMatched = (right: string) => {
    return Array.from(matchedPairs).some((l) => exercise.pairs.find((p) => p.left === l)?.right === right);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Exercise selector */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-sm text-gray-500 font-medium">
          {fr ? "Exercice" : "Exercise"} {exerciseIndex + 1} / {MATCHING_EXERCISES.length}
        </span>
        <div className="flex gap-1">
          {MATCHING_EXERCISES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setExerciseIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                idx === exerciseIndex
                  ? "bg-[#085041] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold bg-[#085041] text-white px-2 py-0.5 rounded-full ml-auto">
          {exercise.level}
        </span>
      </div>

      {/* Title */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-1">
          {fr ? exercise.titleFr : exercise.titleEn}
        </h3>
        <p className="text-sm text-gray-400">
          {fr ? "Clique sur un element a gauche, puis sur sa correspondance a droite." : "Click an item on the left, then its match on the right."}
        </p>
      </div>

      {/* Matching columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {fr ? "Elements" : "Items"}
          </p>
          {exercise.pairs.map((pair) => {
            const isMatched = matchedPairs.has(pair.left);
            const isSelected = selectedLeft === pair.left;
            return (
              <button
                key={pair.left}
                onClick={() => handleLeftClick(pair.left)}
                disabled={isMatched}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  isMatched
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : isSelected
                    ? "bg-[#085041]/10 border-[#085041] text-[#085041]"
                    : "bg-white border-gray-200 text-gray-800 hover:border-[#1D9E75] hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center justify-between">
                  {pair.left}
                  {isMatched && <CheckCircle2 size={16} className="text-emerald-500" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {fr ? "Correspondances" : "Matches"}
          </p>
          {shuffledRight.map((right) => {
            const matched = isRightMatched(right);
            const isFlashing = flashWrong === right;
            return (
              <button
                key={right}
                onClick={() => handleRightClick(right)}
                disabled={matched || !selectedLeft}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  matched
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : isFlashing
                    ? "bg-red-50 border-red-400 text-red-700 animate-pulse"
                    : selectedLeft
                    ? "bg-white border-gray-200 text-gray-800 hover:border-[#D97706] hover:bg-amber-50 cursor-pointer"
                    : "bg-gray-50 border-gray-200 text-gray-500 cursor-default"
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="line-clamp-2">{right}</span>
                  {matched && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 ml-2" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion */}
      {isComplete && (
        <div className="mt-8 bg-white rounded-2xl border border-emerald-200 p-6 text-center shadow-sm">
          <Trophy size={40} className="mx-auto mb-3 text-[#D97706]" />
          <h3 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-1">
            {fr ? "Parfait ! Toutes les paires trouvees !" : "Perfect! All pairs matched!"}
          </h3>
          <p className="text-sm text-emerald-600 font-medium mb-4">
            <Zap size={14} className="inline" /> +25 XP
          </p>
          <div className="flex justify-center gap-3">
            {exerciseIndex + 1 < MATCHING_EXERCISES.length ? (
              <button
                onClick={handleNextExercise}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D9E75] text-white rounded-xl font-medium hover:bg-[#178a64] transition-colors"
              >
                {fr ? "Exercice suivant" : "Next Exercise"}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#085041] text-white rounded-xl font-medium hover:bg-[#06392e] transition-colors"
              >
                <RotateCcw size={16} />
                {fr ? "Recommencer" : "Start Over"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WORD ORDER COMPONENT ───
function WordOrderMode({ fr }: { fr: boolean }) {
  const { addXP } = useProgress();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);

  const exercise = WORD_ORDER_EXERCISES[exerciseIndex];

  const initExercise = useCallback(() => {
    const ex = WORD_ORDER_EXERCISES[exerciseIndex];
    setAvailableWords(shuffleArray([...ex.words]));
    setPlacedWords([]);
    setResult(null);
    setShowHint(false);
  }, [exerciseIndex]);

  useEffect(() => {
    initExercise();
  }, [initExercise]);

  const handleWordClick = (word: string, index: number) => {
    if (result !== null) return;
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
    setPlacedWords((prev) => [...prev, word]);
  };

  const handlePlacedClick = (word: string, index: number) => {
    if (result !== null) return;
    setPlacedWords((prev) => prev.filter((_, i) => i !== index));
    setAvailableWords((prev) => [...prev, word]);
  };

  const handleCheck = () => {
    const attempt = placedWords.join(" ");
    if (attempt === exercise.correctSentence) {
      setResult("correct");
      addXP(15);
    } else {
      setResult("wrong");
    }
  };

  const handleNext = () => {
    if (exerciseIndex + 1 < WORD_ORDER_EXERCISES.length) {
      setExerciseIndex((i) => i + 1);
    }
  };

  const handleRetry = () => {
    initExercise();
  };

  const handleRestart = () => {
    setExerciseIndex(0);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Exercise selector */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-sm text-gray-500 font-medium">
          {fr ? "Exercice" : "Exercise"} {exerciseIndex + 1} / {WORD_ORDER_EXERCISES.length}
        </span>
        <div className="flex gap-1">
          {WORD_ORDER_EXERCISES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setExerciseIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                idx === exerciseIndex
                  ? "bg-[#085041] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold bg-[#085041] text-white px-2 py-0.5 rounded-full ml-auto">
          {exercise.level}
        </span>
      </div>

      {/* Instruction card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {fr ? exercise.hintFr : exercise.hintEn}
          </h3>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-[#D97706] hover:text-amber-600 transition-colors"
            title={fr ? "Indice" : "Hint"}
          >
            <Lightbulb size={20} />
          </button>
        </div>

        {showHint && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-700">
            <Lightbulb size={14} className="inline mr-1" />
            {fr ? exercise.hintFr : exercise.hintEn}
            <span className="block text-xs text-amber-500 mt-1">
              {fr ? "Phrase attendue : " : "Expected: "}{exercise.correctSentence.split(" ").length} {fr ? "mots" : "words"}
            </span>
          </div>
        )}

        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">
          {fr ? "Topique" : "Topic"}: <span className="capitalize">{exercise.topic}</span>
        </p>

        {/* Drop zone */}
        <div className="min-h-[64px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-4 mb-6 flex flex-wrap gap-2 items-start">
          {placedWords.length === 0 ? (
            <span className="text-gray-300 text-sm italic">
              {fr ? "Clique sur les mots ci-dessous pour former la phrase..." : "Click the words below to build the sentence..."}
            </span>
          ) : (
            placedWords.map((word, idx) => (
              <button
                key={`placed-${idx}`}
                onClick={() => handlePlacedClick(word, idx)}
                disabled={result !== null}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  result === "correct"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : result === "wrong"
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "bg-white text-[#085041] border border-[#085041] hover:bg-red-50 hover:border-red-300 hover:text-red-600 cursor-pointer"
                }`}
              >
                {word}
              </button>
            ))
          )}
        </div>

        {/* Available words */}
        <div className="flex flex-wrap gap-2 mb-6">
          {availableWords.map((word, idx) => (
            <button
              key={`avail-${idx}`}
              onClick={() => handleWordClick(word, idx)}
              disabled={result !== null}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#085041]/10 text-[#085041] border border-[#085041]/20 hover:bg-[#085041] hover:text-white transition-all cursor-pointer"
            >
              {word}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {result === null && (
            <button
              onClick={handleCheck}
              disabled={availableWords.length > 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                availableWords.length > 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#1D9E75] text-white hover:bg-[#178a64]"
              }`}
            >
              <CheckCircle2 size={16} />
              {fr ? "Verifier" : "Check"}
            </button>
          )}

          {result === "correct" && (
            <div className="flex items-center gap-3 w-full">
              <span className="text-emerald-600 font-semibold text-sm flex items-center gap-1">
                <Zap size={14} /> {fr ? "Bravo ! +15 XP" : "Great job! +15 XP"}
              </span>
              <div className="ml-auto flex gap-2">
                {exerciseIndex + 1 < WORD_ORDER_EXERCISES.length ? (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1D9E75] text-white rounded-xl text-sm font-medium hover:bg-[#178a64] transition-colors"
                  >
                    {fr ? "Suivant" : "Next"}
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#085041] text-white rounded-xl text-sm font-medium hover:bg-[#06392e] transition-colors"
                  >
                    <RotateCcw size={14} />
                    {fr ? "Recommencer" : "Start Over"}
                  </button>
                )}
              </div>
            </div>
          )}

          {result === "wrong" && (
            <div className="flex items-center gap-3 w-full flex-wrap">
              <div className="text-sm">
                <span className="text-red-600">
                  {fr ? "Ce n'est pas le bon ordre. La réponse etait :" : "Not the right order. The answer was:"}
                </span>
                <p className="font-semibold text-gray-900 mt-1">{exercise.correctSentence}</p>
              </div>
              <button
                onClick={handleRetry}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-[#D97706] text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                <RotateCcw size={14} />
                {fr ? "Reessayer" : "Retry"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───
function ExercicesPage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { progress } = useProgress();

  const [activeTab, setActiveTab] = useState<ExerciseTab>("fill-blank");

  const tabs: { key: ExerciseTab; icon: typeof PenLine; labelFr: string; labelEn: string }[] = [
    { key: "fill-blank", icon: PenLine, labelFr: "Texte a trous", labelEn: "Fill in the Blank" },
    { key: "matching", icon: Link2, labelFr: "Paires", labelEn: "Matching Pairs" },
    { key: "word-order", icon: ArrowUpDown, labelFr: "Ordre des mots", labelEn: "Word Order" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6351] to-[#1D9E75] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/francisation" className="hover:text-white transition-colors">
              {fr ? "Francisation" : "French Program"}
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">
              {fr ? "Exercices interactifs" : "Interactive Exercises"}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                  <PenLine size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)]">
                    {fr ? "Exercices interactifs" : "Interactive Exercises"}
                  </h1>
                  <p className="text-sm text-white/70 mt-1">
                    {fr
                      ? "Pratique la grammaire et le vocabulaire avec des exercices interactifs"
                      : "Practice grammar and vocabulary with interactive exercises"}
                  </p>
                </div>
              </div>
              <p className="text-white/80 max-w-xl">
                {fr
                  ? "Trois modes d'exercices pour renforcer tes compétences : texte a trous, paires correspondantes et remise en ordre des mots."
                  : "Three exercise modes to strengthen your skills: fill-in-the-blank, matching pairs, and word ordering."}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-white/60">{fr ? "Niveau" : "Level"}</p>
                <p className="text-lg font-bold">{progress.level}</p>
              </div>
              <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-white/60">XP</p>
                <p className="text-lg font-bold">{progress.xp}</p>
              </div>
              <Link
                href="/francisation"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap"
              >
                <ArrowLeft size={16} />
                {fr ? "Retour" : "Back"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-[#085041] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon size={16} />
                {fr ? tab.labelFr : tab.labelEn}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 bg-gray-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "fill-blank" && <FillBlankMode fr={fr} />}
          {activeTab === "matching" && <MatchingMode fr={fr} />}
          {activeTab === "word-order" && <WordOrderMode fr={fr} />}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
            {fr ? "Continue ton apprentissage" : "Continue Learning"}
          </h2>
          <p className="text-gray-500 mb-6">
            {fr
              ? "Explore d'autres sections pour améliorer ton français et preparer ton établissement au Québec."
              : "Explore other sections to improve your French and préparé for settlement in Québec."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/francisation/examen-blanc"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#085041] text-white font-semibold rounded-xl hover:bg-[#06392e] transition-all shadow-md"
            >
              <Trophy size={18} />
              {fr ? "Examen blanc" : "Mock Exam"}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/francisation/vocabulaire"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              {fr ? "Vocabulaire" : "Vocabulary"}
            </Link>
            <Link
              href="/francisation/grammaire"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              {fr ? "Grammaire" : "Grammar"}
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
      <ExercicesPage />
    </Shell>
  );
}
