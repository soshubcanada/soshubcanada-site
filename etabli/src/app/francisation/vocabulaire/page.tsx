"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { VOCABULARY, VOCAB_CATEGORIES } from "@/lib/francisation-data";
import Link from "next/link";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookText,
  GraduationCap,
  RotateCcw,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  HelpCircle,
  List,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type ViewMode = "flashcard" | "quiz" | "list";
type SortField = "category" | "nclc";
type SortDir = "asc" | "desc";

const CATEGORY_META: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
  logement: { emoji: "\u{1F3E0}", color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-300" },
  emploi: { emoji: "\u{1F4BC}", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-300" },
  administration: { emoji: "\u{1F4CB}", color: "text-orange-700", bg: "bg-orange-100", border: "border-orange-300" },
  sante: { emoji: "\u{1F3E5}", color: "text-red-700", bg: "bg-red-100", border: "border-red-300" },
  transport: { emoji: "\u{1F687}", color: "text-sky-700", bg: "bg-sky-100", border: "border-sky-300" },
  finances: { emoji: "\u{1F4B0}", color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-300" },
  immigration: { emoji: "\u{1F6C2}", color: "text-indigo-700", bg: "bg-indigo-100", border: "border-indigo-300" },
  "vie-quotidienne": { emoji: "\u2600\uFE0F", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300" },
};

const CATEGORY_LABELS: Record<string, { fr: string; en: string }> = {
  logement: { fr: "Logement", en: "Housing" },
  emploi: { fr: "Emploi", en: "Employment" },
  administration: { fr: "Administration", en: "Administration" },
  sante: { fr: "Sant\u00e9", en: "Health" },
  transport: { fr: "Transport", en: "Transport" },
  finances: { fr: "Finances", en: "Finances" },
  immigration: { fr: "Immigration", en: "Immigration" },
  "vie-quotidienne": { fr: "Vie quotidienne", en: "Daily Life" },
};

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function VocabulairePage() {
  const { lang } = useLang();
  const fr = lang === "fr";

  // Shared state
  const [mode, setMode] = useState<ViewMode>("flashcard");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedNclc, setSelectedNclc] = useState<number | null>(null);

  // Flashcard state
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<
    { word: typeof VOCABULARY[number]; options: string[]; correctIndex: number }[]
  >([]);

  // List state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("category");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Filtered vocab
  const filteredVocab = useMemo(() => {
    return VOCABULARY.filter((w) => {
      if (selectedCategory !== "all" && w.category !== selectedCategory) return false;
      if (selectedNclc !== null && w.nclc !== selectedNclc) return false;
      return true;
    });
  }, [selectedCategory, selectedNclc]);

  // List-specific filtering and sorting
  const listVocab = useMemo(() => {
    let items = [...filteredVocab];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (w) =>
          w.fr.toLowerCase().includes(q) ||
          w.en.toLowerCase().includes(q) ||
          w.example.toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === "category") cmp = a.category.localeCompare(b.category);
      else cmp = a.nclc - b.nclc;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return items;
  }, [filteredVocab, searchQuery, sortField, sortDir]);

  // Generate quiz questions
  const generateQuiz = useCallback(() => {
    const pool = shuffleArray(filteredVocab);
    const questions = pool.map((word) => {
      const distractors = shuffleArray(
        VOCABULARY.filter((w) => w.fr !== word.fr).map((w) => w.fr)
      ).slice(0, 3);
      const options = shuffleArray([word.fr, ...distractors]);
      return {
        word,
        options,
        correctIndex: options.indexOf(word.fr),
      };
    });
    return questions;
  }, [filteredVocab]);

  // Reset quiz when filters change or mode switches to quiz
  useEffect(() => {
    if (mode === "quiz") {
      const q = generateQuiz();
      setQuizQuestions(q);
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(null);
      setQuizFinished(false);
    }
  }, [mode, selectedCategory, selectedNclc, generateQuiz]);

  // Reset flipped cards when filters change
  useEffect(() => {
    setFlippedCards(new Set());
  }, [selectedCategory, selectedNclc]);

  const toggleFlip = (idx: number) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (quizAnswered !== null) return;
    setQuizAnswered(optionIndex);
    if (optionIndex === quizQuestions[quizIndex].correctIndex) {
      setQuizScore((s) => s + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (quizIndex + 1 >= quizQuestions.length) {
      setQuizFinished(true);
    } else {
      setQuizIndex((i) => i + 1);
      setQuizAnswered(null);
    }
  };

  const restartQuiz = () => {
    const q = generateQuiz();
    setQuizQuestions(q);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(null);
    setQuizFinished(false);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={14} className="text-gray-300" />;
    return sortDir === "asc" ? (
      <ChevronUp size={14} className="text-rose-500" />
    ) : (
      <ChevronDown size={14} className="text-rose-500" />
    );
  };

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-rose-50 via-white to-rose-50 border-b border-rose-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/francisation" className="hover:text-[#085041] transition-colors">
              {fr ? "Francisation" : "French Program"}
            </Link>
            <ChevronRight size={14} />
            <span className="text-rose-600 font-medium">
              {fr ? "Vocabulaire" : "Vocabulary"}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <BookText size={22} className="text-rose-600" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                    {fr ? "Vocabulaire d'\u00e9tablissement" : "Settlement Vocabulary"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {fr
                      ? `${VOCABULARY.length} mots cl\u00e9s pour l'\u00e9tablissement au Qu\u00e9bec`
                      : `${VOCABULARY.length} key words for settlement in Québec`}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 max-w-xl">
                {fr
                  ? "Apprends le vocabulaire essentiel utilis\u00e9 dans les d\u00e9marches d'immigration, de logement, d'emploi, de sant\u00e9 et de la vie quotidienne au Qu\u00e9bec."
                  : "Learn essential vocabulary used in immigration, housing, employment, health and daily life in Québec."}
              </p>
            </div>

            <Link
              href="/francisation"
              className="inline-flex items-center gap-2 text-sm text-rose-600 hover:text-[#085041] transition-colors whitespace-nowrap"
            >
              <ArrowLeft size={16} />
              {fr ? "Retour \u00e0 Francisation" : "Back to French Program"}
            </Link>
          </div>
        </div>
      </section>

      {/* Mode Toggle + Filters */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              {[
                { key: "flashcard" as ViewMode, icon: Layers, label: fr ? "Flashcards" : "Flashcards" },
                { key: "quiz" as ViewMode, icon: HelpCircle, label: "Quiz" },
                { key: "list" as ViewMode, icon: List, label: fr ? "Liste" : "List" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === m.key
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <m.icon size={16} />
                  {m.label}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500">
              {filteredVocab.length} / {VOCABULARY.length}{" "}
              {fr ? "mots" : "words"}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-rose-100 text-rose-700 border border-rose-300"
                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {fr ? "Toutes" : "All"}
            </button>
            {VOCAB_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const label = CATEGORY_LABELS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? "all" : cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? `${meta.bg} ${meta.color} border ${meta.border}`
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {meta.emoji} {fr ? label.fr : label.en}
                </button>
              );
            })}
          </div>

          {/* NCLC Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">NCLC:</span>
            {[4, 5, 6, 7].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedNclc(selectedNclc === lvl ? null : lvl)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedNclc === lvl
                    ? "bg-[#085041] text-white"
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 bg-gray-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredVocab.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookText size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg">{fr ? "Aucun mot trouv\u00e9 pour ces filtres." : "No words found for these filters."}</p>
            </div>
          ) : mode === "flashcard" ? (
            /* ─── FLASHCARD MODE ─── */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVocab.map((word, idx) => {
                const isFlipped = flippedCards.has(idx);
                const meta = CATEGORY_META[word.category] || CATEGORY_META["logement"];
                const label = CATEGORY_LABELS[word.category] || CATEGORY_LABELS["logement"];
                return (
                  <div
                    key={`${word.fr}-${idx}`}
                    className="perspective-1000 cursor-pointer"
                    style={{ perspective: "1000px" }}
                    onClick={() => toggleFlip(idx)}
                  >
                    <div
                      className="relative w-full transition-transform duration-500"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        minHeight: "200px",
                      }}
                    >
                      {/* Front */}
                      <div
                        className="absolute inset-0 bg-white rounded-2xl border border-rose-200 p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <span className="text-3xl mb-3">{meta.emoji}</span>
                        <h3 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)] text-center">
                          {word.fr}
                        </h3>
                        <p className="text-xs text-gray-400 mt-3">
                          {fr ? "Cliquer pour voir la traduction" : "Click to see translation"}
                        </p>
                      </div>

                      {/* Back */}
                      <div
                        className="absolute inset-0 bg-white rounded-2xl border border-rose-200 p-6 flex flex-col justify-between shadow-sm"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}
                            >
                              {meta.emoji} {fr ? label.fr : label.en}
                            </span>
                            <span className="text-xs font-bold bg-[#085041] text-white px-2 py-0.5 rounded-full">
                              NCLC {word.nclc}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[#085041] mb-1">{word.fr}</h3>
                          <p className="text-base text-gray-700 mb-3">{word.en}</p>
                          <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                            <p className="text-sm text-gray-600 italic leading-relaxed">
                              &laquo; {word.example} &raquo;
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-3">
                          {fr ? "Cliquer pour retourner" : "Click to flip back"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : mode === "quiz" ? (
            /* ─── QUIZ MODE ─── */
            <div className="max-w-2xl mx-auto">
              {quizQuestions.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p>{fr ? "Aucun mot disponible pour le quiz." : "No words available for quiz."}</p>
                </div>
              ) : quizFinished ? (
                /* Quiz Results */
                <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center">
                  <GraduationCap size={48} className="mx-auto mb-4 text-rose-500" />
                  <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
                    {fr ? "Quiz termin\u00e9 !" : "Quiz Complete!"}
                  </h2>
                  <div className="text-5xl font-bold font-[family-name:var(--font-heading)] my-6">
                    <span
                      className={
                        quizScore / quizQuestions.length >= 0.7
                          ? "text-[#1D9E75]"
                          : quizScore / quizQuestions.length >= 0.4
                          ? "text-amber-500"
                          : "text-red-500"
                      }
                    >
                      {Math.round((quizScore / quizQuestions.length) * 100)}%
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {quizScore} / {quizQuestions.length}{" "}
                    {fr ? "r\u00e9ponses correctes" : "correct answers"}
                  </p>
                  <p className="text-sm text-gray-400 mb-8">
                    {quizScore / quizQuestions.length >= 0.7
                      ? fr
                        ? "Excellent travail ! Continue comme \u00e7a."
                        : "Excellent work! Keep it up."
                      : quizScore / quizQuestions.length >= 0.4
                      ? fr
                        ? "Bon effort ! R\u00e9vise les mots difficiles."
                        : "Good effort! Review the difficult words."
                      : fr
                      ? "Continue de pratiquer, tu vas t'am\u00e9liorer !"
                      : "Keep practicing, you will improve!"}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={restartQuiz}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
                    >
                      <RotateCcw size={16} />
                      {fr ? "Recommencer" : "Try Again"}
                    </button>
                    <Link
                      href="/francisation/examen-blanc"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#085041] text-white rounded-xl font-medium hover:bg-[#06392e] transition-colors"
                    >
                      <GraduationCap size={16} />
                      {fr ? "Essayer l'examen blanc" : "Try Mock Exam"}
                    </Link>
                  </div>
                </div>
              ) : (
                /* Quiz Question */
                <div>
                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>
                        {fr ? "Question" : "Question"} {quizIndex + 1} / {quizQuestions.length}
                      </span>
                      <span>
                        {fr ? "Score" : "Score"}: {quizScore} / {quizIndex + (quizAnswered !== null ? 1 : 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-rose-500 h-2.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${((quizIndex + (quizAnswered !== null ? 1 : 0)) / quizQuestions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-rose-200 p-8">
                    {/* Question */}
                    <p className="text-sm text-gray-400 mb-2">
                      {fr ? "Quel est le mot fran\u00e7ais pour :" : "What is the French word for:"}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-8">
                      {quizQuestions[quizIndex].word.en}
                    </h3>

                    {/* Options */}
                    <div className="space-y-3">
                      {quizQuestions[quizIndex].options.map((option, oi) => {
                        const isCorrect = oi === quizQuestions[quizIndex].correctIndex;
                        const isSelected = quizAnswered === oi;
                        let optionStyle = "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-800";
                        if (quizAnswered !== null) {
                          if (isCorrect) {
                            optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-800";
                          } else if (isSelected && !isCorrect) {
                            optionStyle = "bg-red-50 border-red-400 text-red-800";
                          } else {
                            optionStyle = "bg-gray-50 border-gray-200 text-gray-400";
                          }
                        }
                        return (
                          <button
                            key={oi}
                            onClick={() => handleQuizAnswer(oi)}
                            disabled={quizAnswered !== null}
                            className={`w-full text-left px-5 py-3.5 rounded-xl border-2 font-medium transition-all flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{option}</span>
                            {quizAnswered !== null && isCorrect && <CheckCircle2 size={20} className="text-emerald-500" />}
                            {quizAnswered !== null && isSelected && !isCorrect && <XCircle size={20} className="text-red-500" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback + Next */}
                    {quizAnswered !== null && (
                      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="text-sm">
                          {quizAnswered === quizQuestions[quizIndex].correctIndex ? (
                            <span className="text-emerald-600 font-semibold">
                              {fr ? "Bonne r\u00e9ponse !" : "Correct!"}
                            </span>
                          ) : (
                            <span className="text-red-600">
                              {fr ? "La bonne r\u00e9ponse \u00e9tait : " : "The correct answer was: "}
                              <strong>{quizQuestions[quizIndex].word.fr}</strong>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={nextQuizQuestion}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors"
                        >
                          {quizIndex + 1 >= quizQuestions.length
                            ? fr
                              ? "Voir le r\u00e9sultat"
                              : "See Results"
                            : fr
                            ? "Suivant"
                            : "Next"}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ─── LIST MODE ─── */
            <div>
              {/* Search */}
              <div className="relative mb-6 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={fr ? "Rechercher un mot..." : "Search for a word..."}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
                />
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                          {fr ? "Fran\u00e7ais" : "French"}
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                          {fr ? "Anglais" : "English"}
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                          <button
                            onClick={() => toggleSort("category")}
                            className="inline-flex items-center gap-1 hover:text-rose-600 transition-colors"
                          >
                            {fr ? "Cat\u00e9gorie" : "Category"}
                            <SortIcon field="category" />
                          </button>
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                          <button
                            onClick={() => toggleSort("nclc")}
                            className="inline-flex items-center gap-1 hover:text-rose-600 transition-colors"
                          >
                            NCLC
                            <SortIcon field="nclc" />
                          </button>
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">
                          {fr ? "Exemple" : "Example"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {listVocab.map((word, idx) => {
                        const meta = CATEGORY_META[word.category] || CATEGORY_META["logement"];
                        const label = CATEGORY_LABELS[word.category] || CATEGORY_LABELS["logement"];
                        return (
                          <tr
                            key={`${word.fr}-${idx}`}
                            className="border-b border-gray-50 hover:bg-rose-50/40 transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold text-gray-900">{word.fr}</td>
                            <td className="px-4 py-3 text-gray-600">{word.en}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}
                              >
                                {meta.emoji} {fr ? label.fr : label.en}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                {word.nclc}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs italic hidden md:table-cell max-w-xs truncate">
                              {word.example}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {listVocab.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    {fr ? "Aucun r\u00e9sultat pour cette recherche." : "No results for this search."}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
            {fr ? "Pr\u00eat \u00e0 tester tes connaissances ?" : "Ready to test your knowledge?"}
          </h2>
          <p className="text-gray-500 mb-6">
            {fr
              ? "Passe un examen blanc complet en conditions r\u00e9elles pour \u00e9valuer ton niveau TCF/TEF."
              : "Take a complete mock exam under real conditions to evaluate your TCF/TEF level."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/francisation/examen-blanc"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#085041] text-white font-semibold rounded-xl hover:bg-[#06392e] transition-all shadow-md"
            >
              <GraduationCap size={18} />
              {fr ? "Essayer l'examen blanc" : "Try Mock Exam"}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/francisation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              <ArrowLeft size={16} />
              {fr ? "Retour \u00e0 Francisation" : "Back to French Program"}
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
      <VocabulairePage />
    </Shell>
  );
}
