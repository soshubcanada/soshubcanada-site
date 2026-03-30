"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { EE_EXERCISES } from "@/lib/francisation-data";
import Link from "next/link";
import { useState } from "react";
import {
  PenLine,
  ChevronRight,
  Info,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Mic,
  Send,
  BookOpen,
  Star,
  RotateCcw,
} from "lucide-react";

type LevelFilter = "A2" | "B1" | "B2" | "C1";

function ExpressionEcrite() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("A2");
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [checkedCriteria, setCheckedCriteria] = useState<Record<string, Set<number>>>({});
  const [completedCount, setCompletedCount] = useState(0);

  const levels: LevelFilter[] = ["A2", "B1", "B2", "C1"];

  const filtered = EE_EXERCISES.filter((ex) => ex.level === selectedLevel);

  function getWordCount(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  function wordCountColor(count: number, min: number, max: number): string {
    if (count === 0) return "text-gray-400";
    if (count < min) return "text-orange-500";
    if (count > max) return "text-red-500";
    return "text-green-600";
  }

  function wordCountBg(count: number, min: number, max: number): string {
    if (count === 0) return "bg-gray-100";
    if (count < min) return "bg-orange-50 border-orange-200";
    if (count > max) return "bg-red-50 border-red-200";
    return "bg-green-50 border-green-200";
  }

  function handleTextChange(id: string, value: string) {
    setTexts((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit(id: string) {
    setSubmitted((prev) => {
      const wasSubmitted = prev[id];
      if (!wasSubmitted) {
        setCompletedCount((c) => c + 1);
      }
      return { ...prev, [id]: true };
    });
  }

  function handleReset(id: string) {
    setTexts((prev) => ({ ...prev, [id]: "" }));
    setSubmitted((prev) => ({ ...prev, [id]: false }));
    setCheckedCriteria((prev) => ({ ...prev, [id]: new Set() }));
    setCompletedCount((c) => Math.max(0, c - 1));
  }

  function toggleCriterion(exerciseId: string, criterionIndex: number) {
    setCheckedCriteria((prev) => {
      const current = new Set(prev[exerciseId] || []);
      if (current.has(criterionIndex)) {
        current.delete(criterionIndex);
      } else {
        current.add(criterionIndex);
      }
      return { ...prev, [exerciseId]: current };
    });
  }

  function getTypeBadge(type: "message" | "article" | "argumentatif") {
    switch (type) {
      case "message":
        return { label: fr ? "Message / Courriel" : "Message / Email", color: "bg-blue-100 text-blue-700" };
      case "article":
        return { label: fr ? "Article / Recit" : "Article / Narrative", color: "bg-emerald-100 text-emerald-700" };
      case "argumentatif":
        return { label: fr ? "Texte argumentatif" : "Argumentative text", color: "bg-purple-100 text-purple-700" };
    }
  }

  const totalExercises = EE_EXERCISES.length;

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#085041] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/francisation" className="hover:text-white transition-colors">
              Francisation
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">
              {fr ? "Expression écrite" : "Written Expression"}
            </span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <PenLine size={26} className="text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-2">
                {fr ? "Expression écrite (EE)" : "Written Expression (EE)"}
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-2xl">
                {fr
                  ? "Rédigez des courriels, articles et textes argumentatifs sur des themes d'établissement au Québec. Format TCF: 3 tâches de difficulté progressive, 60 minutes."
                  : "Write emails, articles and argumentative texts on Québec settlement themes. TCF format: 3 progressively difficult tasks, 60 minutes."}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-8 bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">
                {fr ? "Progression" : "Progress"}
              </span>
              <span className="text-sm font-semibold">
                {completedCount}/{totalExercises} {fr ? "exercices completes" : "exercises completed"}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div
                className="bg-[#1D9E75] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TCF EE Format Info */}
      <section className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm mb-1">
                {fr ? "Format TCF Expression écrite" : "TCF Written Expression Format"}
              </p>
              <p className="text-sm text-amber-700 leading-relaxed">
                {fr
                  ? "3 tâches de difficulté progressive: message / courriel (A2), article / recit (B1-B2), texte argumentatif (C1). Duree totale: 60 minutes. L'évaluation porte sur la grammaire, le vocabulaire, la coherence et l'adequation a la consigne."
                  : "3 progressively difficult tasks: message / email (A2), article / narrative (B1-B2), argumentative text (C1). Total duration: 60 minutes. Évaluation covers grammar, vocabulary, coherence and task compliance."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Level filter tabs */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500 mr-2 font-medium">
              {fr ? "Niveau:" : "Level:"}
            </span>
            {levels.map((level) => {
              const count = EE_EXERCISES.filter((e) => e.level === level).length;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedLevel === level
                      ? "bg-amber-100 text-amber-700 border-2 border-amber-300 shadow-sm"
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

      {/* Exercises */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <PenLine size={40} className="mx-auto mb-3 opacity-50" />
              <p>{fr ? "Aucun exercice pour ce niveau." : "No exercises for this level."}</p>
            </div>
          )}

          {filtered.map((exercise) => {
            const text = texts[exercise.id] || "";
            const wc = getWordCount(text);
            const isSubmitted = submitted[exercise.id] || false;
            const typeBadge = getTypeBadge(exercise.type);
            const criteriaChecked = checkedCriteria[exercise.id] || new Set();
            const criteriaProgress = exercise.criteria.length > 0
              ? Math.round((criteriaChecked.size / exercise.criteria.length) * 100)
              : 0;

            return (
              <div
                key={exercise.id}
                className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div className="p-6 border-b border-amber-100">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700">
                      {exercise.level}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${typeBadge.color}`}>
                      {typeBadge.label}
                    </span>
                    {exercise.topic && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                        {exercise.topic}
                      </span>
                    )}
                  </div>

                  {/* Prompt */}
                  <p className="text-gray-800 leading-relaxed">
                    {fr ? exercise.prompt_fr : exercise.prompt_en}
                  </p>

                  {/* Word count requirement */}
                  <div className="mt-3 flex items-center gap-2 text-sm text-amber-700">
                    <BookOpen size={14} />
                    <span>
                      Minimum {exercise.wordCount.min} {fr ? "mots" : "words"} — Maximum{" "}
                      {exercise.wordCount.max} {fr ? "mots" : "words"}
                    </span>
                  </div>
                </div>

                {/* Writing area */}
                <div className="p-6">
                  {!isSubmitted ? (
                    <>
                      {/* Criteria preview */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          {fr ? "Criteres d'évaluation" : "Évaluation criteria"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {exercise.criteria.map((c, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-100"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Textarea */}
                      <textarea
                        value={text}
                        onChange={(e) => handleTextChange(exercise.id, e.target.value)}
                        placeholder={
                          fr
                            ? "Ecrivez votre texte ici..."
                            : "Write your text here..."
                        }
                        className="w-full min-h-[200px] p-4 border-2 border-gray-200 rounded-xl text-gray-800 text-sm leading-relaxed focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-y placeholder:text-gray-300"
                      />

                      {/* Word counter + submit */}
                      <div className="flex items-center justify-between mt-3">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${wordCountBg(wc, exercise.wordCount.min, exercise.wordCount.max)}`}
                        >
                          <span className={wordCountColor(wc, exercise.wordCount.min, exercise.wordCount.max)}>
                            {wc} {fr ? "mots" : "words"}
                          </span>
                          <span className="text-gray-300">
                            / {exercise.wordCount.min}-{exercise.wordCount.max}
                          </span>
                        </div>

                        <button
                          onClick={() => handleSubmit(exercise.id)}
                          disabled={wc === 0}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                            wc === 0
                              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                              : "bg-[#085041] text-white hover:bg-[#0a6350] shadow-md hover:shadow-lg"
                          }`}
                        >
                          <Send size={14} />
                          {fr ? "Soumettre" : "Submit"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Submitted state */}
                      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 size={20} className="text-green-600" />
                          <span className="font-bold text-green-800">
                            {fr ? "Texte soumis!" : "Text submitted!"}
                          </span>
                        </div>
                        <p className="text-sm text-green-700 leading-relaxed">
                          {fr
                            ? "Bravo! Vous avez complété cet exercice. Utilisez la grille ci-dessous pour auto-evaluer votre texte. Chaque critère coche vous rapproche de la maîtrise!"
                            : "Well done! You completed this exercise. Use the checklist below to self-evaluate your text. Each checked criterion brings you closer to mastery!"}
                        </p>
                      </div>

                      {/* Submitted text preview */}
                      <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          {fr ? "Votre texte" : "Your text"}
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{text}</p>
                        <div className="mt-2 text-xs text-gray-400">
                          {wc} {fr ? "mots" : "words"}
                        </div>
                      </div>

                      {/* Self-évaluation criteria checklist */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold text-gray-800">
                            {fr ? "Auto-évaluation" : "Self-évaluation"}
                          </p>
                          <span className="text-xs font-semibold text-amber-600">
                            {criteriaChecked.size}/{exercise.criteria.length} ({criteriaProgress}%)
                          </span>
                        </div>
                        <div className="space-y-2">
                          {exercise.criteria.map((criterion, i) => (
                            <label
                              key={i}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                criteriaChecked.has(i)
                                  ? "bg-green-50 border-green-200"
                                  : "bg-white border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={criteriaChecked.has(i)}
                                onChange={() => toggleCriterion(exercise.id, i)}
                                className="w-4 h-4 rounded text-green-600 border-gray-300 focus:ring-green-500"
                              />
                              <span
                                className={`text-sm ${
                                  criteriaChecked.has(i) ? "text-green-800" : "text-gray-700"
                                }`}
                              >
                                {criterion}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Motivational message based on criteria completion */}
                      {criteriaProgress === 100 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                          <Star size={20} className="text-amber-500 flex-shrink-0" />
                          <p className="text-sm text-amber-800 font-medium">
                            {fr
                              ? "Excellent! Tous les critères sont coches. Vous etes sur la bonne voie pour réussir le TCF!"
                              : "Excellent! All criteria are checked. You are on track to pass the TCF!"}
                          </p>
                        </div>
                      )}

                      {/* Sample response */}
                      {exercise.sampleResponse && (
                        <details className="mt-4">
                          <summary className="text-sm font-semibold text-amber-600 cursor-pointer hover:text-amber-700">
                            {fr ? "Voir un exemple de réponse" : "View a sample response"}
                          </summary>
                          <div className="mt-2 p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                              {exercise.sampleResponse}
                            </p>
                          </div>
                        </details>
                      )}

                      {/* Reset button */}
                      <button
                        onClick={() => handleReset(exercise.id)}
                        className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <RotateCcw size={14} />
                        {fr ? "Recommencer" : "Start over"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tips section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Lightbulb size={20} className="text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              {fr ? "Conseils pour l'expression écrite" : "Tips for Written Expression"}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: fr ? "Lisez attentivement la consigne" : "Read the instructions carefully",
                desc: fr
                  ? "Identifiez le type de texte demandé (courriel, article, argumentatif), le destinataire et le registre (formel ou informel). Une mauvaise interpretation de la consigne peut couter beaucoup de points."
                  : "Identify the text type required (email, article, argumentative), the audience and the register (formal or informal). Misunderstanding the instructions can cost many points.",
              },
              {
                title: fr ? "Respectez le nombre de mots" : "Respect the word count",
                desc: fr
                  ? "Ecrire trop peu ou trop long est penalise. Visez le milieu de la fourchette. En pratique, comptez environ 10 mots par ligne manuscrite. Utilisez notre compteur en temps reel pour vous entrainer."
                  : "Writing too little or too much is penalized. Aim for the middle of the range. In practice, count about 10 words per handwritten line. Use our real-time counter to practice.",
              },
              {
                title: fr ? "Structurez votre texte" : "Structure your text",
                desc: fr
                  ? "Introduction, developpement, conclusion. Utilisez des connecteurs logiques: d'abord, ensuite, de plus, cependant, en conclusion. Les correcteurs apprecient un texte bien organise."
                  : "Introduction, development, conclusion. Use logical connectors: first, then, moreover, however, in conclusion. Evaluators appreciate a well-organized text.",
              },
              {
                title: fr
                  ? "Variez le vocabulaire et les structures"
                  : "Vary vocabulary and structures",
                desc: fr
                  ? "Evitez de répéter les memes mots. Utilisez des synonymes et des tournures variees. Pour les niveaux B2-C1, montrez que vous maitrisez le subjonctif, les hypotheses et les nuances."
                  : "Avoid repeating the same words. Use synonyms and varied expressions. For B2-C1 levels, show mastery of subjunctive, hypotheses and nuances.",
              },
              {
                title: fr ? "Relisez-vous!" : "Proofread!",
                desc: fr
                  ? "Gardez 5-10 minutes pour la relecture. Vérifiez les accords (sujet-verbe, adjectifs), les accents, la ponctuation. Les erreurs basiques de grammaire coutent plus de points que le manque de complexite."
                  : "Keep 5-10 minutes for proofreading. Check agreements (subject-verb, adjectives), accents, punctuation. Basic grammar errors cost more points than lack of complexity.",
              },
            ].map((tip, i) => (
              <div key={i} className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 w-6 h-6 rounded-full flex items-center justify-center">
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

      {/* CTA: Try Expression Orale */}
      <section className="py-16 bg-gradient-to-br from-[#085041] to-[#0a6350]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Mic size={26} className="text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)] mb-3">
            {fr
              ? "Continuez avec l'expression orale"
              : "Continue with oral expression"}
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            {fr
              ? "Entrainez-vous aux entretiens, interactions et debats. L'expression orale est evaluee en face-a-face avec un examinateur — il faut pratiquer!"
              : "Practice interviews, interactions and debates. Oral expression is evaluated face-to-face with an examiner -- you need to practice!"}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/francisation/expression-orale"
              className="px-6 py-3 bg-[#1D9E75] text-white font-semibold rounded-xl hover:bg-[#178a65] transition-all shadow-lg inline-flex items-center gap-2"
            >
              {fr ? "Expression orale" : "Oral Expression"}
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
      <ExpressionEcrite />
    </Shell>
  );
}
