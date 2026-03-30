"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import {
  LESSON_PLANS,
  ASSESSMENT_RUBRICS,
  CLASSROOM_ACTIVITIES,
  TEACHING_METHODS,
  TRAINER_EVALUATION,
} from "@/lib/training-system";
import type { LessonPlan, ActivityBlock, ClassroomActivity } from "@/lib/training-system";
import { useState, useMemo } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Users,
  User,
  GraduationCap,
  ClipboardCheck,
  Lightbulb,
  Printer,
  Filter,
  Star,
  Target,
  BookText,
  Layers,
  CheckSquare,
  AlertCircle,
  ExternalLink,
  Award,
  Sparkles,
  FileText,
  Bookmark,
  Play,
  MessageSquare,
} from "lucide-react";

type Tab = "curriculum" | "activities" | "assessment" | "methodology" | "évaluation";

// ─── HELPERS ───

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    A1: "bg-emerald-100 text-emerald-800 border-emerald-300",
    A2: "bg-teal-100 text-teal-800 border-teal-300",
    B1: "bg-sky-100 text-sky-800 border-sky-300",
    B2: "bg-indigo-100 text-indigo-800 border-indigo-300",
    C1: "bg-purple-100 text-purple-800 border-purple-300",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${colors[level] || "bg-gray-100 text-gray-800 border-gray-300"}`}>
      {level}
    </span>
  );
}

function TypeBadge({ type, fr }: { type: string; fr: boolean }) {
  const labels: Record<string, { fr: string; en: string; color: string }> = {
    individual: { fr: "Individuel", en: "Individual", color: "bg-gray-100 text-gray-700" },
    pair: { fr: "En paire", en: "Pair", color: "bg-blue-100 text-blue-700" },
    group: { fr: "Groupe", en: "Group", color: "bg-violet-100 text-violet-700" },
    plenary: { fr: "Plenier", en: "Plenary", color: "bg-amber-100 text-amber-700" },
    "role-play": { fr: "Jeu de role", en: "Role-play", color: "bg-pink-100 text-pink-700" },
    presentation: { fr: "Présentation", en: "Presentation", color: "bg-teal-100 text-teal-700" },
  };
  const info = labels[type] || { fr: type, en: type, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${info.color}`}>
      {fr ? info.fr : info.en}
    </span>
  );
}

function MethodTag({ method }: { method: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-[#085041]/10 text-[#085041] border border-[#085041]/20">
      {method}
    </span>
  );
}

function ActivityTypeBadge({ type, fr }: { type: string; fr: boolean }) {
  const labels: Record<string, { fr: string; en: string; color: string }> = {
    "warm-up": { fr: "Echauffement", en: "Warm-up", color: "bg-orange-100 text-orange-700 border-orange-200" },
    main: { fr: "Activite principale", en: "Main activity", color: "bg-blue-100 text-blue-700 border-blue-200" },
    practice: { fr: "Pratique", en: "Practice", color: "bg-green-100 text-green-700 border-green-200" },
    review: { fr: "Révision", en: "Review", color: "bg-purple-100 text-purple-700 border-purple-200" },
    assessment: { fr: "Évaluation", en: "Assessment", color: "bg-red-100 text-red-700 border-red-200" },
  };
  const info = labels[type] || { fr: type, en: type, color: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${info.color}`}>
      {fr ? info.fr : info.en}
    </span>
  );
}

// ─── ACTIVITY BLOCK COMPONENT ───

function ActivityBlockCard({ block, fr, label }: { block: ActivityBlock; fr: boolean; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="mt-0.5">
          {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#085041]">{label}</span>
            <TypeBadge type={block.type} fr={fr} />
            <MethodTag method={block.methodology} />
          </div>
          <p className="font-semibold text-gray-900 mt-1">{fr ? block.titleFr : block.titleEn}</p>
        </div>
        <div className="flex items-center gap-1 text-gray-500 shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{block.duration} min</span>
        </div>
      </button>
      {open && (
        <div className="px-10 pb-4 space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">{fr ? block.instructionsFr : block.instructionsEn}</p>
          {block.differentiation && (
            <div className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="font-semibold text-amber-800 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5" />
                {fr ? "Differenciation" : "Differentiation"}
              </p>
              <p className="text-amber-700">{fr ? block.differentiation.fr : block.differentiation.en}</p>
            </div>
          )}
          {block.materials && block.materials.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {block.materials.map((m, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{m}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── LESSON PLAN CARD ───

function LessonPlanCard({ plan, fr }: { plan: LessonPlan; fr: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 p-5 text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-[#085041] text-white flex items-center justify-center font-bold text-sm shrink-0">
          S{plan.sessionNumber}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <LevelBadge level={plan.level} />
            <span className="text-xs text-gray-500">NCLC {plan.nclcTarget}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />{plan.duration} min
            </span>
          </div>
          <h4 className="font-semibold text-gray-900">{fr ? plan.titleFr : plan.titleEn}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {plan.objectives.length} {fr ? "objectifs" : "objectives"} &middot; {plan.mainActivities.length + 3} {fr ? "activités" : "activities"}
          </p>
        </div>
        <div className="shrink-0 mt-2">
          {open ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 space-y-5">
          {/* Objectives */}
          <div className="pt-4">
            <h5 className="text-sm font-bold text-[#085041] flex items-center gap-1.5 mb-2">
              <Target className="w-4 h-4" />
              {fr ? "Objectifs" : "Objectives"}
            </h5>
            <ul className="space-y-1">
              {plan.objectives.map((obj, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-[#1D9E75] shrink-0 mt-0.5" />
                  {fr ? obj.fr : obj.en}
                </li>
              ))}
            </ul>
          </div>

          {/* Activity blocks */}
          <div className="space-y-2">
            <ActivityBlockCard block={plan.warmUp} fr={fr} label={fr ? "Echauffement" : "Warm-up"} />
            {plan.mainActivities.map((act, i) => (
              <ActivityBlockCard key={i} block={act} fr={fr} label={`${fr ? "Activite" : "Activity"} ${i + 1}`} />
            ))}
            <ActivityBlockCard block={plan.practice} fr={fr} label={fr ? "Pratique" : "Practice"} />
            <ActivityBlockCard block={plan.coolDown} fr={fr} label={fr ? "Bilan" : "Cool-down"} />
          </div>

          {/* Trainer Notes */}
          {plan.trainerNotes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h5 className="text-sm font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4" />
                {fr ? "Notes pour le formateur" : "Trainer Notes"}
              </h5>
              <ul className="space-y-1.5">
                {plan.trainerNotes.map((note, i) => (
                  <li key={i} className="text-sm text-amber-700">&bull; {fr ? note.fr : note.en}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Materials */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4" />
              {fr ? "Materiel" : "Materials"}
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {plan.materials.map((m, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{m}</span>
              ))}
            </div>
          </div>

          {/* Homework */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-2">
              <BookOpen className="w-4 h-4" />
              {fr ? "Devoirs" : "Homework"}
            </h5>
            <ul className="space-y-1">
              {plan.homework.map((hw, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-[#1D9E75] font-bold shrink-0">{i + 1}.</span>
                  {fr ? hw.fr : hw.en}
                </li>
              ))}
            </ul>
          </div>

          {/* Assessment Criteria */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-2">
              <ClipboardCheck className="w-4 h-4" />
              {fr ? "Criteres d'évaluation" : "Assessment Criteria"}
            </h5>
            <ul className="space-y-1">
              {plan.assessmentCriteria.map((c, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <Star className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Online companion */}
          <a
            href={plan.onlineCompanion}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1D9E75] hover:text-[#085041] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {fr ? "Exercices en ligne complementaires" : "Companion online exercises"}
          </a>
        </div>
      )}
    </div>
  );
}

// ─── CURRICULUM TAB ───

function CurriculumTab({ fr }: { fr: boolean }) {
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [printMode, setPrintMode] = useState(false);

  const weeks = useMemo(() => {
    const set = new Set(LESSON_PLANS.map((p) => p.week));
    return Array.from(set).sort((a, b) => a - b);
  }, []);

  const weekLevels: Record<number, string> = {};
  LESSON_PLANS.forEach((p) => {
    if (!weekLevels[p.week]) weekLevels[p.week] = p.level;
  });

  const filteredPlans = selectedWeek === "all" ? LESSON_PLANS : LESSON_PLANS.filter((p) => p.week === selectedWeek);

  const levelColorMap: Record<string, string> = {
    A1: "bg-emerald-500",
    A2: "bg-teal-500",
    B1: "bg-sky-500",
    B2: "bg-indigo-500",
  };

  return (
    <div className={`space-y-6 ${printMode ? "print-friendly" : ""}`}>
      {/* Week Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#085041]" />
            {fr ? "Curriculum 16 semaines" : "16-Week Curriculum"}
          </h3>
          <button
            onClick={() => setPrintMode(!printMode)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#085041] transition-colors"
          >
            <Printer className="w-4 h-4" />
            {fr ? "Version imprimable" : "Print view"}
          </button>
        </div>

        {/* Visual timeline */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedWeek("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedWeek === "all"
                ? "bg-[#085041] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {fr ? "Toutes" : "All"}
          </button>
          {weeks.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
                selectedWeek === w
                  ? "bg-[#085041] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${levelColorMap[weekLevels[w]] || "bg-gray-400"}`} />
              S{w}
            </button>
          ))}
        </div>

        {/* Level legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> A1</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> A2</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> B1</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> B2</span>
        </div>
      </div>

      {/* Lesson plans */}
      {selectedWeek !== "all" && (
        <div className="bg-[#085041]/5 rounded-xl p-4 border border-[#085041]/10">
          <h3 className="font-bold text-[#085041] text-lg">
            {fr ? `Semaine ${selectedWeek}` : `Week ${selectedWeek}`}
            <span className="ml-2"><LevelBadge level={weekLevels[selectedWeek] || "A1"} /></span>
          </h3>
        </div>
      )}

      <div className="space-y-3">
        {filteredPlans.map((plan) => (
          <div key={plan.id}>
            {selectedWeek === "all" && plan.sessionNumber === 1 && (
              <div className="flex items-center gap-3 mt-6 mb-2 first:mt-0">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-sm font-bold text-[#085041] bg-[#085041]/5 px-3 py-1 rounded-full">
                  {fr ? `Semaine ${plan.week}` : `Week ${plan.week}`}
                </span>
                <LevelBadge level={plan.level} />
                <div className="h-px flex-1 bg-gray-200" />
              </div>
            )}
            <LessonPlanCard plan={plan} fr={fr} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ACTIVITIES TAB ───

function ActivitiesTab({ fr }: { fr: boolean }) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const types = ["all", "warm-up", "main", "practice", "review", "assessment"];
  const levels = ["all", "A1", "A2", "B1", "B2", "C1"];

  const filtered = CLASSROOM_ACTIVITIES.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (levelFilter !== "all" && !a.levels.includes(levelFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#085041]" />
          {fr ? "Filtres" : "Filters"}
        </h3>
        <div className="flex flex-wrap gap-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              {fr ? "Type d'activité" : "Activity Type"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === t ? "bg-[#085041] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t === "all" ? (fr ? "Tous" : "All") : fr
                    ? { "warm-up": "Echauffement", main: "Principal", practice: "Pratique", review: "Révision", assessment: "Évaluation" }[t]
                    : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              {fr ? "Niveau" : "Level"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevelFilter(l)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    levelFilter === l ? "bg-[#085041] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {l === "all" ? (fr ? "Tous" : "All") : l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity cards grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((act) => {
          const isOpen = expandedId === act.id;
          return (
            <div key={act.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setExpandedId(isOpen ? null : act.id)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ActivityTypeBadge type={act.type} fr={fr} />
                      <MethodTag method={act.methodology} />
                    </div>
                    <h4 className="font-semibold text-gray-900">{fr ? act.nameFr : act.nameEn}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{fr ? act.descFr : act.descEn}</p>
                  </div>
                  <div className="shrink-0 ml-3 mt-1">
                    {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{act.duration} min</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{act.groupSize}</span>
                  <span className="flex items-center gap-1">
                    {act.levels.map((l) => <LevelBadge key={l} level={l} />)}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 px-5 pb-5 space-y-4">
                  {/* Steps */}
                  <div className="pt-4">
                    <h5 className="text-sm font-bold text-[#085041] flex items-center gap-1.5 mb-2">
                      <Play className="w-4 h-4" />
                      {fr ? "Étapes" : "Steps"}
                    </h5>
                    <ol className="space-y-1.5">
                      {act.steps.map((step, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#085041]/10 text-[#085041] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {fr ? step.fr : step.en}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Materials */}
                  {act.materials.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                        <FileText className="w-4 h-4" />
                        {fr ? "Materiel" : "Materials"}
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {act.materials.map((m, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Variations */}
                  {act.variations.length > 0 && (
                    <div className="bg-[#1D9E75]/5 border border-[#1D9E75]/15 rounded-lg p-3">
                      <h5 className="text-sm font-bold text-[#1D9E75] flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-4 h-4" />
                        {fr ? "Variations" : "Variations"}
                      </h5>
                      <ul className="space-y-1">
                        {act.variations.map((v, i) => (
                          <li key={i} className="text-sm text-gray-700">&bull; {fr ? v.fr : v.en}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{fr ? "Aucune activité trouvee pour ces filtres." : "No activities found for these filters."}</p>
        </div>
      )}
    </div>
  );
}

// ─── ASSESSMENT TAB ───

function AssessmentTab({ fr }: { fr: boolean }) {
  const [selectedRubric, setSelectedRubric] = useState(0);
  const rubric = ASSESSMENT_RUBRICS[selectedRubric];

  const skillLabels: Record<string, { fr: string; en: string }> = {
    CO: { fr: "Compréhension orale", en: "Oral comprehension" },
    CE: { fr: "Compréhension écrite", en: "Reading comprehension" },
    EO: { fr: "Expression orale", en: "Oral expression" },
    EE: { fr: "Expression écrite", en: "Written expression" },
  };

  return (
    <div className="space-y-6">
      {/* Rubric selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#085041]" />
            {fr ? "Grilles d'évaluation" : "Assessment Rubrics"}
          </h3>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#085041] transition-colors"
          >
            <Printer className="w-4 h-4" />
            {fr ? "Imprimer" : "Print"}
          </button>
        </div>

        <div className="flex gap-2">
          {ASSESSMENT_RUBRICS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setSelectedRubric(i)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                selectedRubric === i
                  ? "bg-[#085041] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r.skill} &mdash; {fr ? skillLabels[r.skill]?.fr : skillLabels[r.skill]?.en}
            </button>
          ))}
        </div>
      </div>

      {/* Rubric grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-[#085041] text-white px-5 py-3 flex items-center justify-between">
          <h4 className="font-bold">
            {rubric.skill} &mdash; NCLC {rubric.nclcLevel}
          </h4>
          <span className="text-sm opacity-80">{fr ? "Échelle 0-4" : "Scale 0-4"}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-bold text-gray-700 min-w-[160px]">
                  {fr ? "Critere" : "Criterion"}
                </th>
                <th className="text-center px-2 py-3 font-bold text-gray-500 w-[60px]">
                  {fr ? "Poids" : "Weight"}
                </th>
                {[0, 1, 2, 3, 4].map((s) => (
                  <th key={s} className="text-center px-3 py-3 font-bold text-gray-600 min-w-[140px]">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold ${
                      s === 0 ? "bg-red-400" : s === 1 ? "bg-orange-400" : s === 2 ? "bg-yellow-400" : s === 3 ? "bg-[#1D9E75]" : "bg-[#085041]"
                    }`}>
                      {s}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rubric.criteria.map((crit, ci) => (
                <tr key={ci} className={ci % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 font-semibold text-gray-800 border-r border-gray-100">
                    {fr ? crit.nameFr : crit.nameEn}
                  </td>
                  <td className="text-center px-2 py-3 text-[#D97706] font-bold border-r border-gray-100">
                    {crit.weight}%
                  </td>
                  {crit.levels.map((level) => (
                    <td key={level.score} className="px-3 py-3 text-xs text-gray-600 border-r border-gray-50 last:border-r-0">
                      {fr ? level.descFr : level.descEn}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total weights */}
      <div className="bg-[#D97706]/5 border border-[#D97706]/15 rounded-xl p-4">
        <p className="text-sm text-[#D97706] font-medium">
          {fr ? "Total des poids" : "Total weights"}: {rubric.criteria.reduce((sum, c) => sum + c.weight, 0)}%
          &nbsp;&mdash;&nbsp;
          {fr ? "Score maximum" : "Maximum score"}: {rubric.criteria.length * 4} {fr ? "points" : "points"}
        </p>
      </div>
    </div>
  );
}

// ─── METHODOLOGY TAB ───

function MethodologyTab({ fr }: { fr: boolean }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <BookText className="w-5 h-5 text-[#085041]" />
          {fr ? "Reference methodologique" : "Methodology Reference"}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {fr
            ? "Les approches pedagogiques utilisees dans notre curriculum de francisation."
            : "The pedagogical approaches used in our francisation curriculum."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {TEACHING_METHODS.map((method) => (
          <div key={method.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-black bg-[#085041] text-white">
                    {method.abbr}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                  {fr ? method.nameFr : method.nameEn}
                </h4>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">{fr ? method.descFr : method.descEn}</p>

            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {fr ? "Principes clés" : "Key Principles"}
              </h5>
              <ul className="space-y-1.5">
                {method.principles.map((p, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                    {fr ? p.fr : p.en}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {method.bestFor.map((tag, i) => (
                <span key={i} className="text-xs bg-[#1D9E75]/10 text-[#1D9E75] px-2.5 py-0.5 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-3">
              {method.source}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EVALUATION TAB ───

function EvaluationTab({ fr }: { fr: boolean }) {
  const [scores, setScores] = useState<Record<string, number>>({});

  const totalWeight = TRAINER_EVALUATION.flatMap((c) => c.criteria).reduce((s, c) => s + c.weight, 0);
  const maxScore = totalWeight * 4;
  const currentScore = Object.values(scores).reduce((s, v) => s + v, 0);
  const answeredCount = Object.keys(scores).length;
  const totalCriteria = TRAINER_EVALUATION.flatMap((c) => c.criteria).length;

  const handleScore = (key: string, weight: number, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value * weight }));
  };

  const pct = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Score summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-[#085041]" />
          {fr ? "Auto-évaluation du formateur" : "Trainer Self-Évaluation"}
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#e5e7eb" strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke={pct >= 75 ? "#1D9E75" : pct >= 50 ? "#D97706" : "#ef4444"} strokeWidth="3"
                strokeDasharray={`${pct}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900">{answeredCount > 0 ? `${pct}%` : "--"}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <p>{fr ? `${answeredCount}/${totalCriteria} critères evalues` : `${answeredCount}/${totalCriteria} criteria rated`}</p>
            <p>{fr ? `Score pondere: ${currentScore}/${maxScore}` : `Weighted score: ${currentScore}/${maxScore}`}</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      {TRAINER_EVALUATION.map((cat, ci) => {
        const catIcons: Record<string, typeof GraduationCap> = {
          Préparation: FileText,
          Delivery: MessageSquare,
          Interaction: Users,
        };
        const Icon = catIcons[cat.category] || GraduationCap;

        return (
          <div key={ci} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center gap-2">
              <Icon className="w-5 h-5 text-[#085041]" />
              <h4 className="font-bold text-gray-900">{cat.category}</h4>
              <span className="text-xs text-gray-400 ml-auto">
                {cat.criteria.reduce((s, c) => s + c.weight, 0)}% {fr ? "du total" : "of total"}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {cat.criteria.map((crit, cri) => {
                const key = `${ci}-${cri}`;
                const rawScore = scores[key] !== undefined ? scores[key] / crit.weight : undefined;
                return (
                  <div key={cri} className="px-5 py-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{fr ? crit.fr : crit.en}</p>
                      <p className="text-xs text-[#D97706] mt-0.5">{fr ? `Poids: ${crit.weight}%` : `Weight: ${crit.weight}%`}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {[0, 1, 2, 3, 4].map((v) => (
                        <button
                          key={v}
                          onClick={() => handleScore(key, crit.weight, v)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            rawScore === v
                              ? v <= 1 ? "bg-red-500 text-white scale-110" : v === 2 ? "bg-yellow-500 text-white scale-110" : "bg-[#1D9E75] text-white scale-110"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Reset */}
      <div className="text-center">
        <button
          onClick={() => setScores({})}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          {fr ? "Reinitialiser l'évaluation" : "Reset évaluation"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───

function TrainerPortal() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const [activeTab, setActiveTab] = useState<Tab>("curriculum");

  const tabs: { id: Tab; labelFr: string; labelEn: string; icon: typeof BookOpen }[] = [
    { id: "curriculum", labelFr: "Curriculum", labelEn: "Curriculum", icon: BookOpen },
    { id: "activities", labelFr: "Activites", labelEn: "Activities", icon: Layers },
    { id: "assessment", labelFr: "Évaluation", labelEn: "Assessment", icon: ClipboardCheck },
    { id: "methodology", labelFr: "Méthodologie", labelEn: "Methodology", icon: BookText },
    { id: "évaluation", labelFr: "Auto-évaluation", labelEn: "Self-Évaluation", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#085041]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.04%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <GraduationCap className="w-4 h-4" />
            {fr ? "Espace professionnel" : "Professional Area"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            {fr ? "Portail Formateur" : "Trainer Portal"}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {fr
              ? "Materiel pedagogique, plans de leçon, grilles d'évaluation et ressources pour les formateurs en francisation."
              : "Teaching materials, lesson plans, assessment rubrics, and resources for francisation trainers."}
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{LESSON_PLANS.length} {fr ? "leçons" : "lessons"}</span>
            <span className="text-white/30">|</span>
            <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" />{CLASSROOM_ACTIVITIES.length} {fr ? "activités" : "activities"}</span>
            <span className="text-white/30">|</span>
            <span className="flex items-center gap-1.5"><ClipboardCheck className="w-4 h-4" />{ASSESSMENT_RUBRICS.length} {fr ? "grilles" : "rubrics"}</span>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto py-2 -mb-px" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-[#085041] text-white"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {fr ? tab.labelFr : tab.labelEn}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "curriculum" && <CurriculumTab fr={fr} />}
        {activeTab === "activities" && <ActivitiesTab fr={fr} />}
        {activeTab === "assessment" && <AssessmentTab fr={fr} />}
        {activeTab === "methodology" && <MethodologyTab fr={fr} />}
        {activeTab === "évaluation" && <EvaluationTab fr={fr} />}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Shell>
      <TrainerPortal />
    </Shell>
  );
}
