"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/learning-system";
import { A1_EXERCISES } from "@/lib/curriculum-framework";
import Link from "next/link";
import { useState, useMemo } from "react";
import { SpeakButton } from "@/components/AudioPlayer";
import { ExerciseFeedback, XPPopup, CompletionCelebration, ExerciseProgress } from "@/components/exercise";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Zap,
  Trophy,
  Star,
  Filter,
  Heart,
  Sparkles,
  BookOpen,
} from "lucide-react";

type Category = "all" | "salutations" | "chiffres" | "lieux" | "besoins" | "formulaires" | "temps" | "urgences";

const CATEGORIES: { key: Category; labelFr: string; labelEn: string; emoji: string }[] = [
  { key: "all", labelFr: "Tout voir", labelEn: "Show all", emoji: "" },
  { key: "salutations", labelFr: "Salutations", labelEn: "Greetings", emoji: "" },
  { key: "chiffres", labelFr: "Chiffres", labelEn: "Numbers", emoji: "" },
  { key: "lieux", labelFr: "Lieux", labelEn: "Places", emoji: "" },
  { key: "besoins", labelFr: "Besoins", labelEn: "Needs", emoji: "" },
  { key: "formulaires", labelFr: "Formulaires", labelEn: "Forms", emoji: "" },
  { key: "temps", labelFr: "Temps", labelEn: "Time", emoji: "" },
  { key: "urgences", labelFr: "Urgences", labelEn: "Emergencies", emoji: "" },
];

const ENCOURAGEMENTS_FR = [
  "Bravo !",
  "Excellent !",
  "Continue comme ca !",
  "Tres bien !",
  "Magnifique !",
  "Super travail !",
  "Tu progresses !",
  "Felicitations !",
];

const ENCOURAGEMENTS_EN = [
  "Well done!",
  "Excellent!",
  "Keep it up!",
  "Very good!",
  "Wonderful!",
  "Great work!",
  "You're progressing!",
  "Congratulations!",
];

const CONSOLATION_FR = [
  "Pas grave, on apprend de ses erreurs !",
  "Continue, tu vas y arriver !",
  "C'est normal de se tromper au debut.",
  "Essaie encore, tu progresses !",
];

const CONSOLATION_EN = [
  "No worries, we learn from mistakes!",
  "Keep going, you'll get it!",
  "It's normal to make mistakes at first.",
  "Try again, you're progressing!",
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── BEGINNER MODULE PAGE ───
function DebutantPage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { progress, addXP } = useProgress();

  const [categoryFilter, setCategoryFilter] = useState<Category>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [encouragement, setEncouragement] = useState<string>("");

  const exercises = useMemo(() => {
    if (categoryFilter === "all") return A1_EXERCISES;
    return A1_EXERCISES.filter((e) => e.category === categoryFilter);
  }, [categoryFilter]);

  const current = exercises[currentIndex];
  const progressPercent = exercises.length > 0 ? ((currentIndex + (selectedOption !== null ? 1 : 0)) / exercises.length) * 100 : 0;
  const isFinished = exercises.length > 0 && currentIndex === exercises.length - 1 && selectedOption !== null;

  const handleCategoryChange = (cat: Category) => {
    setCategoryFilter(cat);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setAnswered(0);
    setEncouragement("");
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    const correct = option === current.answer;
    setIsCorrect(correct);
    setAnswered((a) => a + 1);
    if (correct) {
      setScore((s) => s + 1);
      addXP(10);
      setEncouragement(getRandomItem(fr ? ENCOURAGEMENTS_FR : ENCOURAGEMENTS_EN));
    } else {
      setEncouragement(getRandomItem(fr ? CONSOLATION_FR : CONSOLATION_EN));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setEncouragement("");
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setAnswered(0);
    setEncouragement("");
  };

  // Render the question text, highlighting the blank
  const renderQuestion = (text: string) => {
    const parts = text.split("___");
    if (parts.length === 1) return <span>{text}</span>;
    return (
      <span>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="inline-block min-w-[80px] border-b-4 border-[#1D9E75] mx-1 text-center font-bold text-[#085041]">
                {selectedOption !== null && isCorrect ? current.answer : selectedOption !== null && !isCorrect ? current.answer : "\u00A0\u00A0\u00A0\u00A0\u00A0"}
              </span>
            )}
          </span>
        ))}
      </span>
    );
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6351] to-[#1D9E75] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/francisation" className="hover:text-white transition-colors">
              {fr ? "Francisation" : "French Program"}
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">
              {fr ? "Débutant A1" : "Beginner A1"}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                  <Sparkles size={26} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)]">
                    {fr ? "Premiers pas en français" : "First Steps in French"}
                  </h1>
                  <p className="text-lg text-white/80 mt-1 font-medium">
                    {fr ? "Niveau A1 — Découverte" : "Level A1 — Discovery"}
                  </p>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 max-w-xl border border-white/10">
                <div className="flex items-start gap-3">
                  <Heart size={20} className="text-white/80 mt-0.5 flex-shrink-0" />
                  <p className="text-white/90 text-base leading-relaxed">
                    {fr
                      ? "Bienvenue ! Ce module est concu pour les vrais débutants. Chaque exercice est simple, avec de grands boutons et des explications claires. Allez a votre rythme, il n'y a pas de pression."
                      : "Welcome! This module is designed for absolute beginners. Each exercise is simple, with large buttons and clear explanations. Go at your own pace, there is no pressure."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/15 rounded-xl px-5 py-3 text-center">
                <p className="text-xs text-white/60">{fr ? "Niveau" : "Level"}</p>
                <p className="text-xl font-bold">{progress.level}</p>
              </div>
              <div className="bg-white/15 rounded-xl px-5 py-3 text-center">
                <p className="text-xs text-white/60">XP</p>
                <p className="text-xl font-bold">{progress.xp}</p>
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

      {/* Category filter pills */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter size={16} className="text-gray-400 flex-shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  categoryFilter === cat.key
                    ? "bg-[#1D9E75] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                {fr ? cat.labelFr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-10 bg-gray-50 min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress bar — Duolingo-style */}
          <ExerciseProgress
            current={answered}
            total={exercises.length}
            score={score}
            closeHref="/francisation"
          />
          <div className="h-4" />

          {exercises.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg">{fr ? "Aucun exercice pour cette catégorie." : "No exercises for this category."}</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* XP Popup */}
              <XPPopup amount={10} trigger={score} />
              {/* Exercise card — slide animation on question change */}
              <div key={currentIndex} className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 shadow-sm slide-question">
                {/* Category & type badge */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xs font-bold bg-[#085041] text-white px-3 py-1 rounded-full">
                    A1
                  </span>
                  <span className="text-xs font-medium text-gray-400 capitalize">{current.category}</span>
                  <span className="text-xs text-gray-300 ml-auto">
                    {current.type === "fill-blank" && (fr ? "Completez" : "Fill in")}
                    {current.type === "complete-dialogue" && (fr ? "Dialogue" : "Dialogue")}
                    {current.type === "true-false" && (fr ? "Vrai ou Faux" : "True or False")}
                  </span>
                </div>

                {/* Question */}
                <div className="mb-3">
                  <p className="text-xl md:text-2xl text-gray-800 leading-relaxed whitespace-pre-line font-medium flex items-center gap-2">
                    <span>
                      {(current.type === "fill-blank" || current.type === "complete-dialogue")
                        ? renderQuestion(current.questionFr)
                        : current.questionFr}
                    </span>
                    <SpeakButton text={current.questionFr} />
                  </p>
                </div>
                <p className="text-sm text-gray-400 mb-8">
                  {current.questionEn}
                </p>

                {/* Options */}
                {current.type === "true-false" ? (
                  <div className="grid grid-cols-2 gap-4">
                    {(current.options ?? ["vrai", "faux"]).map((option) => {
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
                          className={`px-6 py-5 rounded-2xl border-2 text-xl font-bold transition-all flex items-center justify-center gap-3 ${style}`}
                        >
                          <SpeakButton text={option} />
                          <span>{option === "vrai" ? (fr ? "Vrai" : "True") : (fr ? "Faux" : "False")}</span>
                          {selectedOption !== null && isAnswer && <CheckCircle2 size={24} className="text-emerald-500" />}
                          {selectedOption !== null && isThis && !isAnswer && <XCircle size={24} className="text-red-500" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(current.options ?? []).map((option) => {
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
                          className={`px-5 py-4 rounded-xl border-2 text-base font-medium transition-all flex items-center justify-between ${style}`}
                        >
                          <span className="flex items-center gap-2">
                            <SpeakButton text={option} />
                            {option}
                          </span>
                          {selectedOption !== null && isAnswer && <CheckCircle2 size={20} className="text-emerald-500" />}
                          {selectedOption !== null && isThis && !isAnswer && <XCircle size={20} className="text-red-500" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Feedback — Duolingo-style */}
                {selectedOption !== null && (
                  <ExerciseFeedback
                    isCorrect={!!isCorrect}
                    correctAnswer={!isCorrect ? current.answer : undefined}
                    xpEarned={isCorrect ? 10 : 0}
                    onContinue={isFinished ? handleRestart : handleNext}
                    speakAnswer={true}
                  />
                )}
              </div>

              {/* Completion — Duolingo-style celebration */}
              {isFinished && (
                <div className="mt-8">
                  <CompletionCelebration
                    score={score}
                    total={exercises.length}
                    xpEarned={score * 10}
                    onRestart={handleRestart}
                    nextHref="/francisation/grammaire"
                    nextLabel="Grammaire"
                    nextLabelEn="Grammar"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
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
              href="/francisation/exercices"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#085041] text-white font-semibold rounded-xl hover:bg-[#06392e] transition-all shadow-md"
            >
              <BookOpen size={18} />
              {fr ? "Exercices interactifs" : "Interactive Exercises"}
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
      <DebutantPage />
    </Shell>
  );
}
