"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/learning-system";
import {
  loadSRSCards,
  saveSRSCards,
  reviewCard,
  getDueCards,
  LEITNER_INTERVALS,
  DEFAULT_SRS_CARDS,
  SRSCard,
} from "@/lib/curriculum-framework";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
  Box,
  CalendarDays,
  Info,
  Play,
  Target,
} from "lucide-react";

type Phase = "dashboard" | "review" | "results";

const BOX_COLORS = [
  "", // index 0 unused
  "from-red-500 to-red-600",
  "from-orange-400 to-orange-500",
  "from-yellow-400 to-amber-500",
  "from-emerald-400 to-emerald-500",
  "from-green-500 to-green-600",
];

const BOX_BG = [
  "",
  "bg-red-50 border-red-200",
  "bg-orange-50 border-orange-200",
  "bg-yellow-50 border-amber-200",
  "bg-emerald-50 border-emerald-200",
  "bg-green-50 border-green-200",
];

const BOX_TEXT = [
  "",
  "text-red-700",
  "text-orange-700",
  "text-amber-700",
  "text-emerald-700",
  "text-green-700",
];

function RevisionPage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { addXP } = useProgress();

  const [phase, setPhase] = useState<Phase>("dashboard");
  const [allCards, setAllCards] = useState<SRSCard[]>([]);
  const [dueCards, setDueCards] = useState<SRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load cards from localStorage
  useEffect(() => {
    const cards = loadSRSCards();
    setAllCards(cards);
    setDueCards(getDueCards(cards));
    setLoaded(true);
  }, []);

  // Counts per box
  const boxCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0]; // index 0 unused
    for (const card of allCards) {
      const b = Math.min(Math.max(card.box, 1), 5);
      counts[b]++;
    }
    return counts;
  }, [allCards]);

  const totalCards = allCards.length;
  const masteredCards = allCards.filter((c) => c.box >= 4).length;
  const masteryPct = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  // Next review dates per box
  const nextReviewInfo = useMemo(() => {
    const today = new Date();
    return [1, 2, 3, 4, 5].map((box) => {
      const days = LEITNER_INTERVALS[box];
      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + days);
      return {
        box,
        days,
        date: nextDate.toLocaleDateString(fr ? "fr-CA" : "en-CA", {
          month: "short",
          day: "numeric",
        }),
      };
    });
  }, [fr]);

  const startReview = useCallback(() => {
    const cards = loadSRSCards();
    const due = getDueCards(cards);
    setAllCards(cards);
    setDueCards(due);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCorrect(0);
    setSessionTotal(0);
    setStreak(0);
    if (due.length > 0) {
      setPhase("review");
    }
  }, []);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (currentIndex >= dueCards.length) return;

      const card = dueCards[currentIndex];
      const updated = reviewCard(card, correct);

      // Update allCards with the reviewed card
      const newAll = allCards.map((c) => (c.id === updated.id ? updated : c));
      setAllCards(newAll);
      saveSRSCards(newAll);

      if (correct) {
        setSessionCorrect((s) => s + 1);
        setStreak((s) => s + 1);
        addXP(5);
      } else {
        setStreak(0);
      }
      setSessionTotal((s) => s + 1);

      // Move to next card or results
      if (currentIndex + 1 >= dueCards.length) {
        setPhase("results");
      } else {
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
      }
    },
    [currentIndex, dueCards, allCards, addXP]
  );

  const backToDashboard = useCallback(() => {
    const cards = loadSRSCards();
    setAllCards(cards);
    setDueCards(getDueCards(cards));
    setPhase("dashboard");
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">
          {fr ? "Chargement..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6b56] to-[#1D9E75] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-emerald-200 mb-6">
            <Link
              href="/francisation"
              className="hover:text-white transition-colors"
            >
              {fr ? "Francisation" : "French Program"}
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">
              {fr ? "Révision espacee" : "Spaced Review"}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Brain size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)]">
                    {fr ? "Révision espacee" : "Spaced Review"}
                  </h1>
                  <p className="text-sm text-emerald-200 mt-1">
                    {fr
                      ? "Système Leitner — memorisez durablement"
                      : "Leitner System — long-term memorization"}
                  </p>
                </div>
              </div>
              <p className="text-emerald-100 max-w-xl">
                {fr
                  ? "Revisez vos cartes memoire avec la répétition espacee. Les cartes que vous maitrisez sont revues moins souvent, celles que vous oubliez reviennent plus vite."
                  : "Review your flashcards with spaced répétition. Cards you master are reviewed less often, while forgotten cards come back sooner."}
              </p>
            </div>

            <Link
              href="/francisation"
              className="inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-white transition-colors whitespace-nowrap"
            >
              <ArrowLeft size={16} />
              {fr ? "Retour a Francisation" : "Back to French Program"}
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 bg-gray-50 min-h-[60vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {phase === "dashboard" && (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Due today */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                  <Clock size={20} className="mx-auto mb-2 text-[#D97706]" />
                  <p className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                    {dueCards.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fr ? "Cartes a revoir" : "Cards due today"}
                  </p>
                </div>

                {/* Total cards */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                  <Box size={20} className="mx-auto mb-2 text-[#085041]" />
                  <p className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                    {totalCards}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fr ? "Cartes totales" : "Total cards"}
                  </p>
                </div>

                {/* Mastery */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                  <Trophy size={20} className="mx-auto mb-2 text-[#1D9E75]" />
                  <p className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                    {masteryPct}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fr ? "Maîtrise" : "Mastery"}
                  </p>
                </div>

                {/* Mastered count */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                  <Sparkles size={20} className="mx-auto mb-2 text-[#D97706]" />
                  <p className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                    {masteredCards}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fr ? "Cartes maitrisees" : "Cards mastered"}
                  </p>
                </div>
              </div>

              {/* Leitner Boxes Visualization */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-4 flex items-center gap-2">
                  <Box size={18} className="text-[#085041]" />
                  {fr ? "Boites de Leitner" : "Leitner Boxes"}
                </h2>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((box) => {
                    const count = boxCounts[box];
                    const pct =
                      totalCards > 0
                        ? Math.round((count / totalCards) * 100)
                        : 0;
                    return (
                      <div
                        key={box}
                        className={`rounded-xl border p-4 text-center ${BOX_BG[box]}`}
                      >
                        <div
                          className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${BOX_COLORS[box]} flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {box}
                        </div>
                        <p
                          className={`text-2xl font-bold font-[family-name:var(--font-heading)] ${BOX_TEXT[box]}`}
                        >
                          {count}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {pct}%
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {LEITNER_INTERVALS[box]}{" "}
                          {fr ? "jour(s)" : "day(s)"}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Mastery progress bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">
                      {fr ? "Progression vers la maîtrise" : "Progress toward mastery"}
                    </span>
                    <span className="text-[#1D9E75] font-bold">{masteryPct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[#1D9E75] to-[#085041] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${masteryPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {fr
                      ? `${masteredCards} carte(s) en boite 4-5 sur ${totalCards}`
                      : `${masteredCards} card(s) in box 4-5 out of ${totalCards}`}
                  </p>
                </div>
              </div>

              {/* Next Review Dates */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-4 flex items-center gap-2">
                  <CalendarDays size={18} className="text-[#085041]" />
                  {fr ? "Prochaines revisions" : "Next Reviews"}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {nextReviewInfo.map(({ box, days, date }) => (
                    <div
                      key={box}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${BOX_COLORS[box]} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                      >
                        {box}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {days === 1
                            ? fr
                              ? "Demain"
                              : "Tomorrow"
                            : fr
                            ? `${days} jours`
                            : `${days} days`}
                        </p>
                        <p className="text-xs text-gray-400">{date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Review Button */}
              <div className="text-center">
                <button
                  onClick={startReview}
                  disabled={dueCards.length === 0}
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                    dueCards.length > 0
                      ? "bg-gradient-to-r from-[#085041] to-[#1D9E75] text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Play size={22} />
                  {dueCards.length > 0
                    ? fr
                      ? `Commencer la révision (${dueCards.length} carte${dueCards.length > 1 ? "s" : ""})`
                      : `Start Review (${dueCards.length} card${dueCards.length > 1 ? "s" : ""})`
                    : fr
                    ? "Aucune carte a revoir aujourd'hui"
                    : "No cards due today"}
                </button>
                {dueCards.length === 0 && (
                  <p className="text-sm text-gray-400 mt-3">
                    {fr
                      ? "Revenez demain pour votre prochaine session !"
                      : "Come back tomorrow for your next session!"}
                  </p>
                )}
              </div>
            </>
          )}

          {phase === "review" && dueCards.length > 0 && currentIndex < dueCards.length && (
            <div className="max-w-2xl mx-auto">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>
                    {fr ? "Carte" : "Card"} {currentIndex + 1} / {dueCards.length}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-[#1D9E75]" />
                      {sessionCorrect}
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle size={14} className="text-red-500" />
                      {sessionTotal - sessionCorrect}
                    </span>
                    {streak >= 3 && (
                      <span className="flex items-center gap-1 text-[#D97706] font-semibold">
                        <Flame size={14} />
                        {streak}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-[#1D9E75] to-[#085041] h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentIndex) / dueCards.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Card info badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#085041] text-white">
                  {dueCards[currentIndex].level}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {dueCards[currentIndex].type}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {dueCards[currentIndex].category}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${BOX_BG[dueCards[currentIndex].box]} ${BOX_TEXT[dueCards[currentIndex].box]}`}
                >
                  {fr ? "Boite" : "Box"} {dueCards[currentIndex].box}
                </span>
              </div>

              {/* Flashcard */}
              <div
                className="cursor-pointer"
                style={{ perspective: "1200px" }}
                onClick={() => {
                  if (!isFlipped) setIsFlipped(true);
                }}
              >
                <div
                  className="relative w-full transition-transform duration-500"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    minHeight: "280px",
                  }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 bg-white rounded-2xl border-2 border-[#1D9E75]/30 p-8 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider">
                      {dueCards[currentIndex].frontLang === "fr"
                        ? fr
                          ? "Français"
                          : "French"
                        : fr
                        ? "Anglais"
                        : "English"}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] text-center leading-relaxed">
                      {dueCards[currentIndex].front}
                    </h3>
                    <p className="text-sm text-[#1D9E75] mt-6 flex items-center gap-2">
                      <RotateCcw size={14} />
                      {fr ? "Cliquer pour voir la réponse" : "Click to reveal answer"}
                    </p>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 bg-white rounded-2xl border-2 border-[#1D9E75]/30 p-8 flex flex-col items-center justify-center shadow-lg"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      {fr ? "Reponse" : "Answer"}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#085041] font-[family-name:var(--font-heading)] text-center leading-relaxed mb-2">
                      {dueCards[currentIndex].back}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      {dueCards[currentIndex].front}
                    </p>
                  </div>
                </div>
              </div>

              {/* Answer buttons */}
              {isFlipped && (
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => handleAnswer(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 font-bold hover:bg-red-100 hover:border-red-300 transition-all active:scale-[0.98]"
                  >
                    <XCircle size={20} />
                    {fr ? "Je ne savais pas" : "I didn't know"}
                  </button>
                  <button
                    onClick={() => handleAnswer(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-100 hover:border-emerald-300 transition-all active:scale-[0.98]"
                  >
                    <CheckCircle2 size={20} />
                    {fr ? "Je savais" : "I knew it"}
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === "results" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <Trophy size={48} className="mx-auto mb-4 text-[#D97706]" />
                <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
                  {fr ? "Session terminee !" : "Session Complete!"}
                </h2>

                {/* Score */}
                <div className="text-5xl font-bold font-[family-name:var(--font-heading)] my-6">
                  <span
                    className={
                      sessionTotal > 0 && sessionCorrect / sessionTotal >= 0.7
                        ? "text-[#1D9E75]"
                        : sessionTotal > 0 && sessionCorrect / sessionTotal >= 0.4
                        ? "text-[#D97706]"
                        : "text-red-500"
                    }
                  >
                    {sessionTotal > 0
                      ? Math.round((sessionCorrect / sessionTotal) * 100)
                      : 0}
                    %
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={20} className="mx-auto mb-1 text-[#1D9E75]" />
                    <p className="text-2xl font-bold text-[#1D9E75] font-[family-name:var(--font-heading)]">
                      {sessionCorrect}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fr ? "Correctes" : "Correct"}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <XCircle size={20} className="mx-auto mb-1 text-red-500" />
                    <p className="text-2xl font-bold text-red-500 font-[family-name:var(--font-heading)]">
                      {sessionTotal - sessionCorrect}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fr ? "A revoir" : "To review"}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <Flame size={20} className="mx-auto mb-1 text-[#D97706]" />
                    <p className="text-2xl font-bold text-[#D97706] font-[family-name:var(--font-heading)]">
                      +{sessionCorrect * 5}
                    </p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                </div>

                {/* Feedback */}
                <p className="text-gray-600 mb-6">
                  {sessionTotal > 0 && sessionCorrect / sessionTotal >= 0.7
                    ? fr
                      ? "Excellent travail ! Vos cartes progressent dans les boites superieures."
                      : "Excellent work! Your cards are progressing to higher boxes."
                    : sessionTotal > 0 && sessionCorrect / sessionTotal >= 0.4
                    ? fr
                      ? "Bon effort ! Les cartes oubliees reviendront demain."
                      : "Good effort! Forgotten cards will come back tomorrow."
                    : fr
                    ? "Continuez a pratiquer ! La répétition est la clé de la memoire."
                    : "Keep practicing! Répétition is the key to memory."}
                </p>

                {/* Next review info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                    <CalendarDays size={14} />
                    {fr
                      ? "Les cartes incorrectes sont revenues en Boite 1 (révision demain). Les cartes correctes avancent d'une boite."
                      : "Incorrect cards returned to Box 1 (review tomorrow). Correct cards moved up one box."}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={backToDashboard}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#085041] to-[#1D9E75] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    <Target size={18} />
                    {fr ? "Tableau de bord" : "Dashboard"}
                  </button>
                  <Link
                    href="/francisation"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <ArrowLeft size={16} />
                    {fr ? "Retour a Francisation" : "Back to French Program"}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Leitner System Info Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Info size={20} className="text-[#085041]" />
              <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                {fr
                  ? "Comment fonctionne le système Leitner ?"
                  : "How does the Leitner System work?"}
              </h2>
            </div>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {fr
                ? "La répétition espacee est la méthode scientifiquement prouvee la plus efficace pour memoriser a long terme. Chaque carte progresse a travers 5 boites."
                : "Spaced répétition is the most scientifically proven method for long-term memorization. Each card progresses through 5 boxes."}
            </p>
          </div>

          {/* Visual Diagram */}
          <div className="bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl border border-gray-200 p-6 md:p-8">
            {/* Flow diagram */}
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((box, idx) => (
                <div key={box} className="flex items-center gap-2 md:flex-1 w-full md:w-auto">
                  <div className="flex-1 md:flex-none md:w-full">
                    <div
                      className={`rounded-xl border-2 p-4 text-center ${BOX_BG[box]} transition-all`}
                    >
                      <div
                        className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${BOX_COLORS[box]} flex items-center justify-center text-white font-bold`}
                      >
                        {box}
                      </div>
                      <p className={`text-sm font-bold ${BOX_TEXT[box]}`}>
                        {fr ? "Boite" : "Box"} {box}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {box === 1
                          ? fr
                            ? "Chaque jour"
                            : "Every day"
                          : box === 2
                          ? fr
                            ? "Tous les 3 jours"
                            : "Every 3 days"
                          : box === 3
                          ? fr
                            ? "Tous les 7 jours"
                            : "Every 7 days"
                          : box === 4
                          ? fr
                            ? "Tous les 14 jours"
                            : "Every 14 days"
                          : fr
                          ? "Tous les 30 jours"
                          : "Every 30 days"}
                      </p>
                      {box === 5 && (
                        <p className="text-[10px] font-bold text-green-600 mt-1 uppercase tracking-wider">
                          {fr ? "Maîtrise !" : "Mastered!"}
                        </p>
                      )}
                    </div>
                  </div>
                  {idx < 4 && (
                    <ArrowRight
                      size={18}
                      className="text-gray-300 shrink-0 hidden md:block"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Rules */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-[#1D9E75] mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {fr ? "Bonne réponse" : "Correct answer"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {fr
                        ? "La carte avancé d'une boite. L'intervalle de révision augmenté progressivement."
                        : "The card moves up one box. The review interval increases progressively."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-red-100">
                <div className="flex items-start gap-3">
                  <XCircle
                    size={20}
                    className="text-red-500 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {fr ? "Mauvaise réponse" : "Wrong answer"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {fr
                        ? "La carte retourne en Boite 1, peu importe sa position. Elle sera revue le lendemain."
                        : "The card goes back to Box 1, regardless of its position. It will be reviewed the next day."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Intervals summary table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">
                      {fr ? "Boite" : "Box"}
                    </th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">
                      {fr ? "Intervalle" : "Interval"}
                    </th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">
                      {fr ? "Signification" : "Meaning"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      box: 1,
                      interval: fr ? "1 jour" : "1 day",
                      meaning: fr
                        ? "Nouveau ou oublie — révision quotidienne"
                        : "New or forgotten -- daily review",
                    },
                    {
                      box: 2,
                      interval: fr ? "3 jours" : "3 days",
                      meaning: fr
                        ? "En apprentissage — debut de memorisation"
                        : "Learning -- early memorization",
                    },
                    {
                      box: 3,
                      interval: fr ? "7 jours" : "7 days",
                      meaning: fr
                        ? "En consolidation — memoire a moyen terme"
                        : "Consolidating -- medium-term memory",
                    },
                    {
                      box: 4,
                      interval: fr ? "14 jours" : "14 days",
                      meaning: fr
                        ? "Bien connu — memoire a long terme"
                        : "Well known -- long-term memory",
                    },
                    {
                      box: 5,
                      interval: fr ? "30 jours" : "30 days",
                      meaning: fr
                        ? "Maîtrise ! Verification mensuelle"
                        : "Mastered! Monthly verification",
                    },
                  ].map((row) => (
                    <tr
                      key={row.box}
                      className="border-b border-gray-50 hover:bg-gray-50/50"
                    >
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br ${BOX_COLORS[row.box]} text-white text-xs font-bold`}
                        >
                          {row.box}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-gray-800">
                        {row.interval}
                      </td>
                      <td className="py-2 px-3 text-gray-500">
                        {row.meaning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Shell>
      <RevisionPage />
    </Shell>
  );
}
