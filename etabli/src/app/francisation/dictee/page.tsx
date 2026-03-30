"use client";
import Shell from "@/components/Shell";
import AudioPlayer from "@/components/AudioPlayer";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/learning-system";
import { DICTATION_EXERCISES } from "@/lib/curriculum-framework";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Volume2,
  Eye,
  PenLine,
  Target,
  Award,
  Info,
} from "lucide-react";

type LevelFilter = "A1" | "A2" | "B1" | "B2" | "C1";

interface WordResult {
  word: string;
  expected: string;
  correct: boolean;
}

function Dictee() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { addXP } = useProgress();

  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("A1");
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [userText, setUserText] = useState("");
  const [results, setResults] = useState<WordResult[] | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);

  const levels: LevelFilter[] = ["A1", "A2", "B1", "B2", "C1"];
  const filtered = DICTATION_EXERCISES.filter((ex) => ex.level === selectedLevel);
  const exercise = DICTATION_EXERCISES.find((ex) => ex.id === activeExercise);

  const textWords = exercise ? exercise.text.split(/\s+/) : [];
  const totalWords = textWords.length;

  function startExercise(id: string) {
    setActiveExercise(id);
    setRevealedCount(0);
    setUserText("");
    setResults(null);
    setXpAwarded(false);
  }

  function revealNextWord() {
    if (revealedCount < totalWords) {
      setRevealedCount((c) => c + 1);
    }
  }

  function revealAllWords() {
    setRevealedCount(totalWords);
  }

  function normalize(word: string): string {
    return word
      .toLowerCase()
      .replace(/[.,;:!?'"()\-\u2014\u2013\u00ab\u00bb]/g, "")
      .trim();
  }

  function checkDictation() {
    if (!exercise) return;

    const expectedWords = exercise.text.split(/\s+/);
    const typedWords = userText.trim().split(/\s+/).filter((w) => w.length > 0);

    const maxLen = Math.max(expectedWords.length, typedWords.length);
    const wordResults: WordResult[] = [];

    for (let i = 0; i < maxLen; i++) {
      const expected = expectedWords[i] || "";
      const typed = typedWords[i] || "";
      wordResults.push({
        word: typed,
        expected,
        correct: normalize(typed) === normalize(expected),
      });
    }

    setResults(wordResults);

    if (!xpAwarded) {
      const correctCount = wordResults.filter((r) => r.correct).length;
      const accuracy = expectedWords.length > 0 ? correctCount / expectedWords.length : 0;
      const xp = Math.round(accuracy * 30);
      if (xp > 0) {
        addXP(xp);
      }
      setXpAwarded(true);
    }
  }

  function backToList() {
    setActiveExercise(null);
    setRevealedCount(0);
    setUserText("");
    setResults(null);
    setXpAwarded(false);
  }

  function getAccuracy(): { correct: number; total: number; percent: number } {
    if (!results || !exercise) return { correct: 0, total: 0, percent: 0 };
    const expectedWords = exercise.text.split(/\s+/);
    const correct = results.filter((r) => r.correct).length;
    const total = expectedWords.length;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percent };
  }

  function getLevelColor(level: string): string {
    switch (level) {
      case "A1": return "bg-emerald-100 text-emerald-700";
      case "A2": return "bg-teal-100 text-teal-700";
      case "B1": return "bg-blue-100 text-blue-700";
      case "B2": return "bg-purple-100 text-purple-700";
      case "C1": return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#085041] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/francisation" className="hover:text-white transition-colors">
              Francisation
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">
              {fr ? "Dictee" : "Dictation"}
            </span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Volume2 size={26} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-2">
                {fr ? "Dictee" : "Dictation"}
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-2xl">
                {fr
                  ? "Lisez le texte mot par mot, puis tapez-le correctement. Un excellent exercice pour maîtriser l'orthographe, les accords et la ponctuation du français."
                  : "Read the text word by word, then type it correctly. An excellent exercise to master French spelling, agreements and punctuation."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info banner */}
      <section className="bg-green-50 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800 text-sm mb-1">
                {fr ? "Comment ca marche" : "How it works"}
              </p>
              <p className="text-sm text-green-700 leading-relaxed">
                {fr
                  ? "1. Choisissez un exercice selon votre niveau. 2. Cliquez sur \"Mot suivant\" pour reveler le texte mot par mot. 3. Tapez le texte complet dans la zone de saisie. 4. Vérifiez votre travail et gagnez des points XP selon votre precision!"
                  : "1. Choose an exercise matching your level. 2. Click \"Next word\" to reveal the text word by word. 3. Type the full text in the input area. 4. Check your work and earn XP points based on your accuracy!"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {!activeExercise ? (
        <>
          {/* Level filter tabs */}
          <section className="py-8 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 mr-2 font-medium">
                  {fr ? "Niveau:" : "Level:"}
                </span>
                {levels.map((level) => {
                  const count = DICTATION_EXERCISES.filter((e) => e.level === level).length;
                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedLevel === level
                          ? "bg-green-100 text-green-700 border-2 border-green-300 shadow-sm"
                          : "bg-gray-100 text-gray-500 border-2 border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {level}
                      <span className="ml-1.5 text-xs opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Exercise cards */}
          <section className="py-10 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Volume2 size={40} className="mx-auto mb-3 opacity-50" />
                  <p>{fr ? "Aucun exercice pour ce niveau." : "No exercises for this level."}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filtered.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => startExercise(ex.id)}
                      className="bg-white rounded-2xl border border-green-200 shadow-sm p-6 text-left hover:shadow-md hover:border-green-300 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${getLevelColor(ex.level)}`}>
                          {ex.level}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                          {ex.topic}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#085041] transition-colors">
                        {fr ? ex.titleFr : ex.titleEn}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {ex.audioDesc}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <BookOpen size={14} />
                        <span>{ex.text.split(/\s+/).length} {fr ? "mots" : "words"}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 text-[#1D9E75] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        {fr ? "Commencer" : "Start"}
                        <ArrowRight size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      ) : exercise ? (
        <>
          {/* Dictation mode */}
          <section className="py-10 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Back button + title */}
              <button
                onClick={backToList}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
              >
                <ChevronRight size={14} className="rotate-180" />
                {fr ? "Retour a la liste" : "Back to list"}
              </button>

              <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
                {/* Exercise header */}
                <div className="p-6 border-b border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${getLevelColor(exercise.level)}`}>
                      {exercise.level}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                      {exercise.topic}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-1">
                    {fr ? exercise.titleFr : exercise.titleEn}
                  </h2>
                  <p className="text-sm text-gray-500">{exercise.audioDesc}</p>
                </div>

                {/* Audio players */}
                <div className="p-6 border-b border-green-100 bg-green-50/30 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 size={16} className="text-[#085041]" />
                    <p className="text-sm font-semibold text-[#085041]">
                      {fr ? "Écouter la dictee" : "Listen to dictation"}
                    </p>
                  </div>

                  <AudioPlayer
                    text={exercise.text}
                    label={fr ? "Phrase complète" : "Full sentence"}
                    variant="full"
                  />
                  <AudioPlayer
                    text={exercise.text}
                    label={fr ? "Mot par mot" : "Word by word"}
                    variant="full"
                    wordByWord={true}
                    speed="slow"
                  />

                  {/* Text reveal area (kept for reference after listening) */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye size={16} className="text-[#085041]" />
                      <p className="text-sm font-semibold text-[#085041]">
                        {fr ? "Texte revele" : "Revealed text"}
                        <span className="ml-2 font-normal text-gray-500">
                          ({revealedCount}/{totalWords} {fr ? "mots" : "words"})
                        </span>
                      </p>
                    </div>

                    <div className="min-h-[60px] p-4 bg-white rounded-xl border border-green-200 mb-4">
                      {revealedCount === 0 ? (
                        <p className="text-gray-300 italic text-sm">
                          {fr
                            ? "Cliquez sur \"Mot suivant\" pour reveler le texte..."
                            : "Click \"Next word\" to reveal the text..."}
                        </p>
                      ) : (
                        <p className="text-gray-800 leading-relaxed">
                          {textWords.slice(0, revealedCount).join(" ")}
                          {revealedCount < totalWords && (
                            <span className="inline-block w-2 h-5 bg-[#1D9E75] ml-1 animate-pulse rounded-sm" />
                          )}
                        </p>
                      )}
                    </div>

                    {/* Reveal progress bar */}
                    <div className="w-full bg-green-100 rounded-full h-1.5 mb-4">
                      <div
                        className="bg-[#1D9E75] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${totalWords > 0 ? (revealedCount / totalWords) * 100 : 0}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={revealNextWord}
                        disabled={revealedCount >= totalWords}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          revealedCount >= totalWords
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : "bg-[#085041] text-white hover:bg-[#0a6350] shadow-md hover:shadow-lg"
                        }`}
                      >
                        <Volume2 size={14} />
                        {fr ? "Mot suivant" : "Next word"}
                      </button>
                      <button
                        onClick={revealAllWords}
                        disabled={revealedCount >= totalWords}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          revealedCount >= totalWords
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {fr ? "Reveler tout" : "Reveal all"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Textarea for typing */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <PenLine size={16} className="text-[#085041]" />
                    <p className="text-sm font-semibold text-[#085041]">
                      {fr ? "Votre dictee" : "Your dictation"}
                    </p>
                  </div>

                  <textarea
                    value={userText}
                    onChange={(e) => setUserText(e.target.value)}
                    disabled={!!results}
                    placeholder={
                      fr
                        ? "Tapez le texte ici en observant les mots reveles ci-dessus..."
                        : "Type the text here while observing the words revealed above..."
                    }
                    className="w-full min-h-[140px] p-4 border-2 border-gray-200 rounded-xl text-gray-800 text-sm leading-relaxed focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all resize-y placeholder:text-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />

                  {/* Focus points */}
                  {exercise.focusPoints.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-amber-600" />
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                          {fr ? "Points de vigilance" : "Focus points"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {exercise.focusPoints.map((fp, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 border border-amber-200"
                          >
                            {fp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Check button or results */}
                  {!results ? (
                    <div className="mt-6 flex items-center justify-end">
                      <button
                        onClick={checkDictation}
                        disabled={userText.trim().length === 0}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                          userText.trim().length === 0
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : "bg-[#085041] text-white hover:bg-[#0a6350] shadow-md hover:shadow-lg"
                        }`}
                      >
                        <CheckCircle2 size={16} />
                        {fr ? "Verifier" : "Check"}
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Results section */}
                      <div className="mt-6 space-y-4">
                        {/* Accuracy summary */}
                        {(() => {
                          const { correct, total, percent } = getAccuracy();
                          return (
                            <div className={`p-5 rounded-xl border ${
                              percent >= 90
                                ? "bg-green-50 border-green-200"
                                : percent >= 70
                                ? "bg-amber-50 border-amber-200"
                                : "bg-red-50 border-red-200"
                            }`}>
                              <div className="flex items-center gap-3 mb-3">
                                <Award size={24} className={
                                  percent >= 90
                                    ? "text-green-600"
                                    : percent >= 70
                                    ? "text-amber-600"
                                    : "text-red-500"
                                } />
                                <div>
                                  <p className="font-bold text-gray-900 text-lg">
                                    {percent}% {fr ? "de precision" : "accuracy"}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {correct}/{total} {fr ? "mots corrects" : "words correct"}
                                    {xpAwarded && (
                                      <span className="ml-2 text-[#D97706] font-semibold">
                                        +{Math.round((correct / Math.max(total, 1)) * 30)} XP
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Performance message */}
                              <p className="text-sm leading-relaxed text-gray-700">
                                {percent >= 90
                                  ? (fr ? "Excellent! Votre orthographe est remarquable. Continuez ainsi!" : "Excellent! Your spelling is remarkable. Keep it up!")
                                  : percent >= 70
                                  ? (fr ? "Bon travail! Quelques erreurs a corriger. Revoyez les points de vigilance." : "Good work! A few errors to correct. Review the focus points.")
                                  : (fr ? "Continuez a pratiquer. Concentrez-vous sur les mots en rouge ci-dessous." : "Keep practicing. Focus on the red words below.")}
                              </p>
                            </div>
                          );
                        })()}

                        {/* Word-by-word comparison */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            {fr ? "Comparaison mot par mot" : "Word-by-word comparison"}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {results.map((r, i) => (
                              <span
                                key={i}
                                className={`inline-block px-2 py-1 rounded text-sm font-mono ${
                                  r.correct
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                }`}
                                title={!r.correct ? `${fr ? "Attendu" : "Expected"}: ${r.expected}` : ""}
                              >
                                {r.word || (
                                  <span className="italic text-red-400">
                                    {fr ? "manquant" : "missing"}
                                  </span>
                                )}
                                {!r.correct && r.expected && (
                                  <span className="text-xs text-red-500 ml-1">
                                    ({r.expected})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Correct text reference */}
                        <div className="p-4 bg-white rounded-xl border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            {fr ? "Texte correct" : "Correct text"}
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {exercise.text}
                          </p>
                        </div>

                        {/* Focus points to review */}
                        {exercise.focusPoints.length > 0 && (
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Target size={16} className="text-amber-600" />
                              <p className="text-sm font-bold text-amber-800">
                                {fr ? "Points a revoir" : "Points to review"}
                              </p>
                            </div>
                            <ul className="space-y-1">
                              {exercise.focusPoints.map((fp, i) => (
                                <li key={i} className="text-sm text-amber-700 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                  {fp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Retry / back buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setUserText("");
                              setResults(null);
                              setRevealedCount(0);
                              setXpAwarded(false);
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#085041] text-white hover:bg-[#0a6350] shadow-md transition-all"
                          >
                            <RotateCcw size={14} />
                            {fr ? "Recommencer" : "Try again"}
                          </button>
                          <button
                            onClick={backToList}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
                          >
                            {fr ? "Autre exercice" : "Another exercise"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {/* Tips section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Lightbulb size={20} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              {fr ? "Pourquoi la dictee est efficace" : "Why dictation is effective"}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: fr ? "Orthographe et accents" : "Spelling and accents",
                desc: fr
                  ? "La dictee vous force a ecrire chaque mot correctement, y compris les accents (e, e, e), les apostrophes et les traits d'union. C'est la méthode classique francaise pour maîtriser l'orthographe."
                  : "Dictation forces you to write each word correctly, including accents, apostrophes and hyphens. It's the classic French method for mastering spelling.",
              },
              {
                title: fr ? "Accords grammaticaux" : "Grammatical agreements",
                desc: fr
                  ? "Vous devez accorder les adjectifs, les participes passes et les verbes. La dictee revele vos faiblesses en grammaire de maniere concrete et immediate."
                  : "You must match adjectives, past participles and verbs. Dictation reveals your grammar weaknesses in a concrete and immediate way.",
              },
              {
                title: fr ? "Vocabulaire en contexte" : "Vocabulary in context",
                desc: fr
                  ? "Contrairement aux listes de vocabulaire, la dictée présente les mots dans leur contexte naturel. Vous apprenez comment les mots s'utilisent dans des phrases reelles."
                  : "Unlike vocabulary lists, dictation presents words in their natural context. You learn how words are used in real sentences.",
              },
              {
                title: fr ? "Préparation aux tests" : "Test preparation",
                desc: fr
                  ? "Le TCF et le TEF evaluent l'expression écrite. La dictee entraîne votre capacite a transcrire correctement, une compétence essentielle pour les tests de français officiels."
                  : "TCF and TEF evaluate written expression. Dictation trains your ability to transcribe correctly, an essential skill for official French tests.",
              },
              {
                title: fr ? "Memoire musculaire" : "Muscle memory",
                desc: fr
                  ? "En tapant les mots, vous créez des connexions entre la forme visuelle et la forme écrite. Plus vous pratiquez, plus l'orthographe correcte devient automatique."
                  : "By typing the words, you create connections between the visual and written forms. The more you practice, the more correct spelling becomes automatic.",
              },
              {
                title: fr ? "Progression mesurable" : "Measurable progress",
                desc: fr
                  ? "Votre score de precision vous montre exactement ou vous en etes. Visez 90%+ a chaque niveau avant de passer au suivant. Les points de vigilance vous guident."
                  : "Your accuracy score shows exactly where you stand. Aim for 90%+ at each level before moving to the next. Focus points guide you.",
              },
            ].map((tip, i) => (
              <div key={i} className="p-5 bg-green-50 rounded-2xl border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-green-600 bg-green-100 w-6 h-6 rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold text-gray-900 text-sm">{tip.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: Try Expression Écrite */}
      <section className="py-16 bg-gradient-to-br from-[#085041] to-[#0a6350]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <PenLine size={26} className="text-amber-600" />
          </div>
          <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)] mb-3">
            {fr
              ? "Continuez avec l'expression écrite"
              : "Continue with written expression"}
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            {fr
              ? "Rédigez des courriels, articles et textes argumentatifs sur des themes d'établissement au Québec."
              : "Write emails, articles and argumentative texts on Québec settlement themes."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/francisation/expression-ecrite"
              className="px-6 py-3 bg-[#1D9E75] text-white font-semibold rounded-xl hover:bg-[#178a65] transition-all shadow-lg inline-flex items-center gap-2"
            >
              {fr ? "Expression écrite" : "Written Expression"}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/francisation"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
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
      <Dictee />
    </Shell>
  );
}
