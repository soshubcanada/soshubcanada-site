"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { CO_EXERCISES, CE_EXERCISES, MCQQuestion } from "@/lib/francisation-data";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Headphones,
  Trophy,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

// ─── EXAM CONFIG ───
type ExamType = "TCF" | "TEF";
type Section = "CO" | "CE";

interface ExamConfig {
  type: ExamType;
  section: Section;
  duration: number; // minutes
  questionCount: string;
}

const EXAM_CONFIGS: Record<ExamType, Record<Section, { duration: number; officialCount: number }>> = {
  TCF: {
    CO: { duration: 35, officialCount: 39 },
    CE: { duration: 60, officialCount: 39 },
  },
  TEF: {
    CO: { duration: 40, officialCount: 60 },
    CE: { duration: 60, officialCount: 50 },
  },
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function estimateNCLC(percentage: number): { nclc: number; label: string } {
  if (percentage >= 95) return { nclc: 9, label: "NCLC 9 (C1)" };
  if (percentage >= 85) return { nclc: 8, label: "NCLC 8 (B2+)" };
  if (percentage >= 70) return { nclc: 7, label: "NCLC 7 (B2)" };
  if (percentage >= 55) return { nclc: 6, label: "NCLC 6 (B1+)" };
  if (percentage >= 40) return { nclc: 5, label: "NCLC 5 (B1)" };
  return { nclc: 4, label: "NCLC 4 (A2)" };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ─── MAIN COMPONENT ───
function ExamenBlanc() {
  const { lang } = useLang();
  const fr = lang === "fr";

  // State machine: "select" | "exam" | "results"
  const [phase, setPhase] = useState<"select" | "exam" | "results">("select");

  // Sélection state
  const [examType, setExamType] = useState<ExamType>("TCF");
  const [section, setSection] = useState<Section>("CO");

  // Exam state
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Results state
  const [expandedReview, setExpandedReview] = useState<Set<number>>(new Set());

  // ─── START EXAM ───
  const startExam = useCallback(() => {
    const pool = section === "CO" ? CO_EXERCISES : CE_EXERCISES;
    const shuffled = shuffleArray(pool);
    const config = EXAM_CONFIGS[examType][section];
    const duration = config.duration * 60; // seconds

    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(null));
    setCurrentIndex(0);
    setSelectedOption(null);
    setTimeLeft(duration);
    setTotalTime(duration);
    setExpandedReview(new Set());
    setPhase("exam");
  }, [examType, section]);

  // ─── TIMER ───
  useEffect(() => {
    if (phase !== "exam") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto-submit
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase("results");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // ─── NEXT QUESTION / FINISH ───
  const handleNext = useCallback(() => {
    // Save current answer
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = selectedOption;
      return updated;
    });

    if (currentIndex === questions.length - 1) {
      // Last question - finish
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase("results");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  }, [currentIndex, questions.length, selectedOption]);

  // ─── RESULTS CALCULATIONS ───
  const score = answers.reduce<number>(
    (acc, ans, i) => acc + (ans === questions[i]?.correct ? 1 : 0),
    0
  );
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const nclcEstimate = estimateNCLC(percentage);

  // Topic breakdown
  const topicBreakdown = (() => {
    const map = new Map<string, { correct: number; total: number }>();
    questions.forEach((q, i) => {
      const topic = q.topic || (fr ? "Autre" : "Other");
      const entry = map.get(topic) || { correct: 0, total: 0 };
      entry.total++;
      if (answers[i] === q.correct) entry.correct++;
      map.set(topic, entry);
    });
    return Array.from(map.entries()).map(([topic, stats]) => ({
      topic,
      ...stats,
      pct: Math.round((stats.correct / stats.total) * 100),
    }));
  })();

  const toggleReview = (index: number) => {
    setExpandedReview((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const config = EXAM_CONFIGS[examType][section];
  const timerPct = totalTime > 0 ? (timeLeft / totalTime) * 100 : 100;
  const isTimeLow = timeLeft < 120; // less than 2 minutes

  // ─── SELECTION SCREEN ───
  if (phase === "select") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-3">
            {fr ? "Examen blanc TCF / TEF" : "TCF / TEF Mock Exam"}
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            {fr
              ? "Simulez un examen officiel en conditions reelles : chronometre, format officiel, questions melangees aleatoirement."
              : "Simulate an official exam under real conditions: timer, official format, randomly shuffled questions."}
          </p>
        </div>

        {/* Exam type sélection */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {fr ? "Type d'examen" : "Exam Type"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {(["TCF", "TEF"] as ExamType[]).map((type) => (
              <button
                key={type}
                onClick={() => setExamType(type)}
                className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                  examType === type
                    ? "border-indigo-500 bg-indigo-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {examType === type && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  </div>
                )}
                <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900">
                  {type} Canada
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {type === "TCF"
                    ? fr
                      ? "Test de connaissance du français"
                      : "Test de connaissance du français"
                    : fr
                    ? "Test d'évaluation de français"
                    : "Test d'évaluation de français"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Section sélection */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {fr ? "Section" : "Section"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSection("CO")}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                section === "CO"
                  ? "border-indigo-500 bg-indigo-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {section === "CO" && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                </div>
              )}
              <Headphones className="w-6 h-6 text-indigo-600 mb-2" />
              <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-gray-900">
                {fr ? "Compréhension orale" : "Listening Comprehension"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">CO</p>
            </button>
            <button
              onClick={() => setSection("CE")}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                section === "CE"
                  ? "border-indigo-500 bg-indigo-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {section === "CE" && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                </div>
              )}
              <BookOpen className="w-6 h-6 text-indigo-600 mb-2" />
              <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-gray-900">
                {fr ? "Compréhension écrite" : "Reading Comprehension"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">CE</p>
            </button>
          </div>
        </div>

        {/* Exam Info */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-8">
          <h3 className="font-bold font-[family-name:var(--font-heading)] text-indigo-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {fr ? "Informations sur l'examen" : "Exam Information"}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-indigo-600 font-medium">{fr ? "Duree" : "Duration"}</span>
              <p className="text-gray-700 font-bold">{config.duration} min</p>
            </div>
            <div>
              <span className="text-indigo-600 font-medium">
                {fr ? "Questions officielles" : "Official questions"}
              </span>
              <p className="text-gray-700 font-bold">{config.officialCount}</p>
            </div>
            <div>
              <span className="text-indigo-600 font-medium">
                {fr ? "Questions disponibles" : "Available questions"}
              </span>
              <p className="text-gray-700 font-bold">
                {section === "CO" ? CO_EXERCISES.length : CE_EXERCISES.length}
              </p>
            </div>
            <div>
              <span className="text-indigo-600 font-medium">{fr ? "Format" : "Format"}</span>
              <p className="text-gray-700 font-bold">{fr ? "QCM - 4 choix" : "MCQ - 4 choices"}</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-200">
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                {fr
                  ? "- Vous ne pouvez pas revenir a une question precedente"
                  : "- You cannot go back to a previous question"}
              </li>
              <li>
                {fr
                  ? "- L'examen se termine automatiquement quand le temps est ecoule"
                  : "- The exam ends automatically when time runs out"}
              </li>
              <li>
                {fr
                  ? "- Les questions sont melangees aleatoirement"
                  : "- Questions are randomly shuffled"}
              </li>
            </ul>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startExam}
          className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:shadow-lg"
          style={{ backgroundColor: "#085041" }}
        >
          {fr ? "Commencer l'examen" : "Start Exam"}
          <ArrowRight className="inline-block ml-2 w-5 h-5" />
        </button>
      </div>
    );
  }

  // ─── EXAM MODE ───
  if (phase === "exam") {
    const currentQ = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Top bar: timer + question counter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${isTimeLow ? "text-red-500" : "text-indigo-600"}`} />
              <span
                className={`text-lg font-mono font-bold ${
                  isTimeLow ? "text-red-600" : "text-gray-900"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-500">
              {examType} Canada - {section}
            </div>
            <div className="text-sm font-bold text-gray-700">
              Question {currentIndex + 1} / {questions.length}
            </div>
          </div>
          {/* Timer bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                isTimeLow ? "bg-red-500" : "bg-indigo-500"
              }`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        </div>

        {/* Question progress dots */}
        <div className="flex gap-1 mb-6 flex-wrap">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === currentIndex
                  ? "bg-indigo-600"
                  : i < currentIndex
                  ? answers[i] !== null
                    ? "bg-indigo-300"
                    : "bg-gray-300"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Audio player for CO (listening) section */}
        {section === "CO" && (
          <div className="mb-4">
            <AudioPlayer text={currentQ.context} variant="full" label={fr ? "Écouter l'audio" : "Listen to audio"} />
          </div>
        )}

        {/* Context / Passage */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            {section === "CO" ? (
              <Headphones className="w-4 h-4 text-indigo-600" />
            ) : (
              <BookOpen className="w-4 h-4 text-indigo-600" />
            )}
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              {section === "CO"
                ? fr
                  ? "Document sonore"
                  : "Audio Document"
                : fr
                ? "Document ecrit"
                : "Written Document"}
            </span>
            <span className="text-xs text-indigo-400 ml-auto">{currentQ.level}</span>
          </div>
          <p className="text-gray-800 text-sm leading-relaxed">{currentQ.context}</p>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{currentQ.question}</h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, i) => (
              <button
                key={i}
                onClick={() => setSelectedOption(i)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedOption === i
                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedOption === i
                        ? "border-indigo-500 bg-indigo-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedOption === i && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-800">
                    <span className="font-bold text-gray-500 mr-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Next / Finish button */}
        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          className={`w-full py-3 rounded-xl font-bold text-white text-base transition-all ${
            selectedOption === null
              ? "bg-gray-300 cursor-not-allowed"
              : isLast
              ? "bg-red-600 hover:bg-red-700 hover:shadow-lg"
              : "hover:shadow-lg"
          }`}
          style={selectedOption !== null && !isLast ? { backgroundColor: "#085041" } : undefined}
        >
          {isLast
            ? fr
              ? "Terminer l'examen"
              : "Finish Exam"
            : fr
            ? "Question suivante"
            : "Next Question"}
          <ArrowRight className="inline-block ml-2 w-4 h-4" />
        </button>
      </div>
    );
  }

  // ─── RESULTS SCREEN ───
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Score header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-4">
          <Trophy className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-1">
          {fr ? "Resultats de l'examen" : "Exam Results"}
        </h1>
        <p className="text-gray-500">
          {examType} Canada - {section === "CO" ? (fr ? "Compréhension orale" : "Listening") : (fr ? "Compréhension écrite" : "Reading")}
        </p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-indigo-200 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-500 mb-1">{fr ? "Score" : "Score"}</p>
          <p className="text-3xl font-bold text-gray-900">
            {score} / {questions.length}
          </p>
        </div>
        <div className="bg-white border border-indigo-200 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-500 mb-1">{fr ? "Pourcentage" : "Percentage"}</p>
          <p
            className={`text-3xl font-bold ${
              percentage >= 70 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-red-600"
            }`}
          >
            {percentage}%
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center">
          <p className="text-sm text-indigo-600 mb-1">{fr ? "Niveau estimé" : "Estimated Level"}</p>
          <p className="text-2xl font-bold text-indigo-700">{nclcEstimate.label}</p>
        </div>
      </div>

      {/* NCLC context */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            {nclcEstimate.nclc >= 7 ? (
              <p>
                {fr
                  ? "Excellent ! Votre niveau estimatif atteint le NCLC 7+, le seuil requis pour le PSTQ et les programmes d'immigration federaux. Continuez a pratiquer pour consolider vos acquis."
                  : "Excellent! Your estimated level reaches NCLC 7+, the threshold required for PSTQ and federal immigration programs. Keep practicing to consolidate your skills."}
              </p>
            ) : nclcEstimate.nclc >= 5 ? (
              <p>
                {fr
                  ? "Bon travail ! Vous avez un niveau fonctionnel. Pour atteindre le NCLC 7 requis pour les programmes d'immigration, continuez a vous entrainer regulierement."
                  : "Good job! You have a functional level. To reach NCLC 7 required for immigration programs, keep practicing regularly."}
              </p>
            ) : (
              <p>
                {fr
                  ? "Vous etes sur la bonne voie. Concentrez-vous sur les exercices de pratique pour renforcer vos compétences et augmenter votre score."
                  : "You're on the right track. Focus on practice exercises to strengthen your skills and increase your score."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Topic breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h3 className="font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-4">
          {fr ? "Resultats par theme" : "Results by Topic"}
        </h3>
        <div className="space-y-3">
          {topicBreakdown.map(({ topic, correct, total, pct }) => (
            <div key={topic}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">{topic}</span>
                <span
                  className={`text-sm font-bold ${
                    pct >= 70 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"
                  }`}
                >
                  {correct}/{total} ({pct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question review */}
      <div className="mb-8">
        <h3 className="font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-4">
          {fr ? "Révision des questions" : "Question Review"}
        </h3>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            const isExpanded = expandedReview.has(i);
            return (
              <div
                key={q.id}
                className={`border rounded-xl overflow-hidden ${
                  isCorrect ? "border-green-200" : "border-red-200"
                }`}
              >
                <button
                  onClick={() => toggleReview(i)}
                  className={`w-full flex items-center gap-3 p-4 text-left ${
                    isCorrect ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium text-gray-800 flex-1">
                    <span className="text-gray-400 mr-2">Q{i + 1}.</span>
                    {q.question}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="p-4 bg-white border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-3 italic">{q.context}</p>
                    <div className="space-y-2 mb-3">
                      {q.options.map((opt, j) => {
                        const isUserAnswer = answers[i] === j;
                        const isCorrectAnswer = q.correct === j;
                        return (
                          <div
                            key={j}
                            className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                              isCorrectAnswer
                                ? "bg-green-50 text-green-800 font-medium"
                                : isUserAnswer
                                ? "bg-red-50 text-red-800"
                                : "text-gray-600"
                            }`}
                          >
                            <span className="font-bold text-gray-400 w-5">
                              {String.fromCharCode(65 + j)}.
                            </span>
                            {opt}
                            {isCorrectAnswer && (
                              <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <XCircle className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-bold text-indigo-700">
                          {fr ? "Explication : " : "Explanation: "}
                        </span>
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => {
            setPhase("select");
            setAnswers([]);
            setQuestions([]);
            setCurrentIndex(0);
            setSelectedOption(null);
          }}
          className="w-full py-3 rounded-xl font-bold text-white text-base transition-all hover:shadow-lg flex items-center justify-center gap-2"
          style={{ backgroundColor: "#085041" }}
        >
          <RotateCcw className="w-4 h-4" />
          {fr ? "Refaire l'examen" : "Retake Exam"}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/francisation"
            className="py-3 rounded-xl font-medium text-center border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-all text-sm"
          >
            {fr ? "Plus de pratique" : "More Practice"}
          </Link>
          <Link
            href="/tarifs"
            className="py-3 rounded-xl font-medium text-white text-center transition-all hover:shadow-lg text-sm"
            style={{ backgroundColor: "#1D9E75" }}
          >
            {fr ? "Acces complet" : "Full Access"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ExamenBlancPage() {
  return (
    <Shell>
      <ExamenBlanc />
    </Shell>
  );
}
