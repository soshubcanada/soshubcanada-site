"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/learning-system";
import { LEARNING_PATHS, STUDY_TIPS } from "@/lib/curriculum-framework";
import { useState } from "react";
import {
  GraduationCap,
  Clock,
  Target,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Brain,
  Headphones,
  Mic,
  Layers,
  AlertCircle,
  Flag,
  Lightbulb,
  Sparkles,
  Map,
  Star,
  TrendingUp,
} from "lucide-react";

// Map icon string names from STUDY_TIPS to lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  brain: Brain,
  headphones: Headphones,
  mic: Mic,
  target: Target,
  book: BookOpen,
  layers: Layers,
  alert: AlertCircle,
  flag: Flag,
};

// Map estimated CEFR level to approximate NCLC
function cefrToNclc(cefr: string): number {
  const map: Record<string, number> = { A1: 2, A2: 4, B1: 5, B2: 7, C1: 9, C2: 10 };
  return map[cefr] || 2;
}

function nclcToCefr(nclc: number): string {
  if (nclc <= 2) return "A1";
  if (nclc <= 4) return "A2";
  if (nclc <= 6) return "B1";
  if (nclc <= 8) return "B2";
  if (nclc <= 9) return "C1";
  return "C2";
}

function LearningPathsPage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { progress } = useProgress();

  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("pstq");
  const [tipFilter, setTipFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

  // Estimate user level from progress
  const userLevel = progress.level;
  const estimatedNclc = Math.min(Math.max(Math.floor(userLevel / 2) + 2, 2), 10);
  const estimatedCefr = nclcToCefr(estimatedNclc);

  const filteredTips = STUDY_TIPS.filter((tip) => tipFilter === "all" || tip.level === "all" || tip.level === tipFilter);

  const selectedPath = LEARNING_PATHS.find((p) => p.id === selectedProgram);
  const nclcGap = selectedPath ? Math.max(0, selectedPath.nclcRequired - estimatedNclc) : 0;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#085041] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Map size={20} />
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                {fr ? "Parcours personnalises" : "Personalized Paths"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-4">
              {fr ? "Parcours d'apprentissage" : "Learning Paths"}
            </h1>
            <p className="text-lg text-white/80 mb-6 leading-relaxed">
              {fr
                ? "Choisissez votre programme d'immigration et obtenez un plan d'étude personnalise. Chaque parcours indique le niveau NCLC requis, les compétences a maîtriser et les étapes clés vers votre objectif."
                : "Choose your immigration program and get a personalized study plan. Each path shows the required NCLC level, skills to master, and key milestones toward your goal."}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
                <GraduationCap size={16} />
                <span>{fr ? "4 programmes" : "4 programs"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
                <Target size={16} />
                <span>{fr ? "Jalons progressifs" : "Progressive milestones"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
                <Lightbulb size={16} />
                <span>{fr ? "Conseils methodologiques" : "Study methodology tips"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Level Indicator */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1D9E75] to-[#085041] text-white flex items-center justify-center">
                <span className="text-lg font-bold font-[family-name:var(--font-heading)]">{estimatedCefr}</span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  {fr ? "Votre niveau estimé" : "Your estimated level"}
                </div>
                <div className="text-xs text-gray-500">
                  {fr ? `NCLC ${estimatedNclc} / CECR ${estimatedCefr}` : `NCLC ${estimatedNclc} / CEFR ${estimatedCefr}`}
                  {" "}&middot;{" "}
                  {fr ? `${progress.exercisesCompleted} exercices completes` : `${progress.exercisesCompleted} exercises completed`}
                </div>
              </div>
            </div>
            <div className="flex-1 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-400">{fr ? "Serie actuelle" : "Current streak"}</div>
                <div className="text-sm font-bold text-[#D97706]">{progress.streak} {fr ? "jours" : "days"}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">{fr ? "XP total" : "Total XP"}</div>
                <div className="text-sm font-bold text-[#1D9E75]">{progress.xp} XP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
              {fr ? "Choisissez votre programme" : "Choose your program"}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {fr
                ? "Chaque programme d'immigration a des exigences linguistiques differentes. Selectionnez le votre pour voir le parcours detaille."
                : "Each immigration program has different language requirements. Select yours to see the detailed path."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {LEARNING_PATHS.map((path) => {
              const isExpanded = expandedPath === path.id;
              const isAtTarget = estimatedNclc >= path.nclcRequired;
              const gap = Math.max(0, path.nclcRequired - estimatedNclc);

              return (
                <div
                  key={path.id}
                  className={`bg-white rounded-2xl border-2 transition-all ${
                    isExpanded ? "shadow-lg" : "hover:shadow-md"
                  }`}
                  style={{ borderColor: isExpanded ? path.color : "#e5e7eb" }}
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: path.color }}
                      >
                        {path.cefrEquiv}
                      </div>
                      {isAtTarget && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-600 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          {fr ? "Niveau atteint" : "Level reached"}
                        </span>
                      )}
                      {!isAtTarget && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-600">
                          NCLC +{gap}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-1">
                      {fr ? path.programFr : path.programEn}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {fr ? path.descFr : path.descEn}
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-1.5 text-xs bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Target size={13} className="text-gray-400" />
                        <span className="text-gray-600 font-semibold">NCLC {path.nclcRequired}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs bg-gray-50 px-3 py-1.5 rounded-lg">
                        <GraduationCap size={13} className="text-gray-400" />
                        <span className="text-gray-600">{fr ? "CECR" : "CEFR"} {path.cefrEquiv}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Clock size={13} className="text-gray-400" />
                        <span className="text-gray-600">{path.estimatedHours}h {fr ? "estimees" : "estimated"}</span>
                      </div>
                    </div>

                    {/* Skills required */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {path.skills.map((s) => (
                        <span
                          key={s.skill}
                          className="text-xs px-2 py-1 rounded-full border"
                          style={{ borderColor: path.color + "40", color: path.color, backgroundColor: path.color + "10" }}
                        >
                          {s.skill} &ge; NCLC {s.minNCLC}
                        </span>
                      ))}
                    </div>

                    {/* Expand/collapse button */}
                    <button
                      onClick={() => setExpandedPath(isExpanded ? null : path.id)}
                      className="flex items-center gap-1 text-sm font-semibold transition-colors"
                      style={{ color: path.color }}
                    >
                      {isExpanded
                        ? (fr ? "Masquer les étapes" : "Hide milestones")
                        : (fr ? "Voir les étapes" : "View milestones")}
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Milestone Timeline (expandable) */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        {fr ? "Jalons du parcours" : "Path Milestones"}
                      </h4>
                      <div className="relative">
                        {/* Vertical line */}
                        <div
                          className="absolute left-4 top-2 bottom-2 w-0.5 rounded-full"
                          style={{ backgroundColor: path.color + "30" }}
                        />

                        <div className="space-y-5">
                          {path.milestones.map((milestone, idx) => {
                            const isCurrent = estimatedNclc >= milestone.nclc;
                            const isTarget = idx === path.milestones.length - 1;
                            return (
                              <div key={idx} className="relative flex items-start gap-4 pl-1">
                                {/* Node */}
                                <div
                                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${
                                    isCurrent
                                      ? "text-white"
                                      : "bg-white"
                                  }`}
                                  style={{
                                    borderColor: path.color,
                                    backgroundColor: isCurrent ? path.color : "white",
                                    color: isCurrent ? "white" : path.color,
                                  }}
                                >
                                  {isCurrent ? <CheckCircle2 size={14} /> : milestone.nclc}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-gray-900">
                                      NCLC {milestone.nclc}
                                    </span>
                                    <span className="text-xs text-gray-400">&mdash;</span>
                                    <span className="text-sm text-gray-700">
                                      {fr ? milestone.labelFr : milestone.labelEn}
                                    </span>
                                    {isTarget && (
                                      <Star size={14} className="text-[#D97706] flex-shrink-0" />
                                    )}
                                  </div>

                                  <div className="flex flex-wrap gap-1.5 mb-1">
                                    {milestone.skills.map((skill) => (
                                      <span
                                        key={skill}
                                        className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="text-xs text-gray-400">
                                    {milestone.exercises} {fr ? "exercices recommandes" : "recommended exercises"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Study Tips */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
              {fr ? "Conseils d'étude" : "Study Tips"}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {fr
                ? "Methodologies prouvees par la recherche en acquisition des langues secondes."
                : "Methodologies proven by second language acquisition research."}
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {(["all", "beginner", "intermediate", "advanced"] as const).map((level) => {
              const labels: Record<string, { fr: string; en: string }> = {
                all: { fr: "Tous", en: "All" },
                beginner: { fr: "Débutant", en: "Beginner" },
                intermediate: { fr: "Intermédiaire", en: "Intermediate" },
                advanced: { fr: "Avance", en: "Advanced" },
              };
              return (
                <button
                  key={level}
                  onClick={() => setTipFilter(level)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    tipFilter === level
                      ? "bg-[#085041] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {fr ? labels[level].fr : labels[level].en}
                </button>
              );
            })}
          </div>

          {/* Tips grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTips.map((tip) => {
              const IconComp = ICON_MAP[tip.icon] || Lightbulb;
              return (
                <div
                  key={tip.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] text-[#1D9E75] flex items-center justify-center">
                      <IconComp size={20} />
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                      {tip.level === "all"
                        ? (fr ? "Tous niveaux" : "All levels")
                        : fr
                          ? tip.level === "beginner" ? "Débutant" : tip.level === "intermediate" ? "Intermédiaire" : "Avance"
                          : tip.level}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">
                    {fr ? tip.titleFr : tip.titleEn}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    {fr ? tip.descFr : tip.descEn}
                  </p>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Sparkles size={11} />
                    {tip.source}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recommended Next Steps */}
      <section className="py-16 bg-gradient-to-br from-[#085041] to-[#0a6350]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)] mb-3">
              {fr ? "Prochaines étapes recommandees" : "Recommended Next Steps"}
            </h2>
            <p className="text-white/70">
              {fr
                ? `Base sur votre niveau estimé (NCLC ${estimatedNclc} / ${estimatedCefr})`
                : `Based on your estimated level (NCLC ${estimatedNclc} / ${estimatedCefr})`}
            </p>
          </div>

          {/* Program selector */}
          <div className="flex justify-center gap-2 mb-8">
            {LEARNING_PATHS.map((path) => (
              <button
                key={path.id}
                onClick={() => setSelectedProgram(path.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  selectedProgram === path.id
                    ? "bg-white text-[#085041] shadow-md"
                    : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20"
                }`}
              >
                {path.program}
              </button>
            ))}
          </div>

          {/* Recommendations */}
          {selectedPath && (
            <div className="space-y-4">
              {estimatedNclc >= selectedPath.nclcRequired ? (
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 size={24} className="text-[#1D9E75]" />
                    <h3 className="text-lg font-bold text-white">
                      {fr ? "Felicitations!" : "Congratulations!"}
                    </h3>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {fr
                      ? `Votre niveau estimé (NCLC ${estimatedNclc}) atteint le requis pour ${selectedPath.programFr}. Continuez a pratiquer pour maintenir et améliorer votre niveau.`
                      : `Your estimated level (NCLC ${estimatedNclc}) meets the requirement for ${selectedPath.programEn}. Keep practicing to maintain and improve your level.`}
                  </p>
                </div>
              ) : (
                <>
                  {/* Gap summary */}
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp size={24} className="text-[#D97706]" />
                      <h3 className="text-lg font-bold text-white">
                        {fr ? `${nclcGap} niveaux NCLC a gagner` : `${nclcGap} NCLC levels to gain`}
                      </h3>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed mb-4">
                      {fr
                        ? `Vous etes a NCLC ${estimatedNclc} et devez atteindre NCLC ${selectedPath.nclcRequired} (${selectedPath.cefrEquiv}). Estimation: ${Math.round(selectedPath.estimatedHours * (nclcGap / selectedPath.nclcRequired))} heures d'étude.`
                        : `You are at NCLC ${estimatedNclc} and need NCLC ${selectedPath.nclcRequired} (${selectedPath.cefrEquiv}). Estimated: ${Math.round(selectedPath.estimatedHours * (nclcGap / selectedPath.nclcRequired))} study hours.`}
                    </p>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min((estimatedNclc / selectedPath.nclcRequired) * 100, 100)}%`,
                          backgroundColor: selectedPath.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/50 mt-1">
                      <span>NCLC {estimatedNclc}</span>
                      <span>NCLC {selectedPath.nclcRequired}</span>
                    </div>
                  </div>

                  {/* Action steps */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {estimatedNclc < 4 && (
                      <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                        <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                          <BookOpen size={16} className="text-[#1D9E75]" />
                          {fr ? "Construire la base" : "Build the foundation"}
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed">
                          {fr
                            ? "Commencez par le vocabulaire de base et les exercices A1. Focalisez sur la compréhension orale et l'expression orale quotidienne."
                            : "Start with basic vocabulary and A1 exercises. Focus on daily listening and speaking practice."}
                        </p>
                      </div>
                    )}
                    {estimatedNclc >= 4 && estimatedNclc < 7 && (
                      <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                        <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                          <Layers size={16} className="text-[#1D9E75]" />
                          {fr ? "Renforcer les 4 compétences" : "Strengthen all 4 skills"}
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed">
                          {fr
                            ? "Pratiquez chaque compétence (CO/CE/EO/EE) en alternance. Visez 30 minutes par jour minimum et faites des examens blancs regulierement."
                            : "Practice each skill (CO/CE/EO/EE) in rotation. Aim for 30 minutes per day minimum and take mock exams regularly."}
                        </p>
                      </div>
                    )}
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                      <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <Brain size={16} className="text-[#1D9E75]" />
                        {fr ? "Révision espacee" : "Spaced répétition"}
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {fr
                          ? "Utilisez les cartes memoire chaque jour. Le système Leitner optimise la retention a long terme en espaçant les revisions."
                          : "Use flashcards every day. The Leitner system optimizes long-term retention by spacing out reviews."}
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                      <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <Headphones size={16} className="text-[#1D9E75]" />
                        {fr ? "Immersion quotidienne" : "Daily immersion"}
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {fr
                          ? "Écoutez Radio-Canada, regardez Tou.tv, lisez La Presse. L'exposition reguliere est essentielle pour progresser."
                          : "Listen to Radio-Canada, watch Tou.tv, read La Presse. Regular exposure is essential for progress."}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* CTA */}
              <div className="text-center pt-4">
                <a
                  href="/francisation"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D9E75] text-white font-semibold rounded-xl hover:bg-[#178a65] transition-all shadow-lg"
                >
                  {fr ? "Commencer a pratiquer" : "Start practicing"}
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return <Shell><LearningPathsPage /></Shell>;
}
