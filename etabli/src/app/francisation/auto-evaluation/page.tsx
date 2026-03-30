"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import {
  CAN_DO_STATEMENTS,
  loadSelfAssessment,
  saveSelfAssessment,
  estimateLevel,
} from "@/lib/curriculum-framework";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  BarChart3,
  Target,
  Award,
  Headphones,
  BookOpen,
  MessageSquare,
  PenLine,
  ArrowRight,
  Info,
  TrendingUp,
} from "lucide-react";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const SKILL_META: Record<string, { labelFr: string; labelEn: string; icon: typeof Headphones; color: string }> = {
  CO: { labelFr: "Compréhension orale", labelEn: "Listening", icon: Headphones, color: "blue" },
  CE: { labelFr: "Compréhension écrite", labelEn: "Reading", icon: BookOpen, color: "purple" },
  EO: { labelFr: "Expression orale", labelEn: "Speaking", icon: MessageSquare, color: "emerald" },
  EE: { labelFr: "Expression écrite", labelEn: "Writing", icon: PenLine, color: "amber" },
};

const SKILL_COLORS: Record<string, { bg: string; border: string; text: string; light: string }> = {
  CO: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", light: "bg-blue-100" },
  CE: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", light: "bg-purple-100" },
  EO: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", light: "bg-emerald-100" },
  EE: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", light: "bg-amber-100" },
};

function SelfAssessmentPage() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeLevel, setActiveLevel] = useState<string>("A1");
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const data = loadSelfAssessment();
    setCompletedIds(data.completedStatements);
    setLoaded(true);
  }, []);

  // Save to localStorage whenever completedIds changes
  useEffect(() => {
    if (!loaded) return;
    const level = estimateLevel(completedIds);
    saveSelfAssessment({
      completedStatements: completedIds,
      lastAssessment: new Date().toISOString().slice(0, 10),
      estimatedLevel: level,
    });
  }, [completedIds, loaded]);

  const estimated = useMemo(() => estimateLevel(completedIds), [completedIds]);

  const toggleStatement = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Stats per level
  const levelStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {};
    for (const lvl of LEVELS) {
      const stmts = CAN_DO_STATEMENTS.filter((s) => s.level === lvl);
      const done = stmts.filter((s) => completedIds.includes(s.id));
      stats[lvl] = { total: stmts.length, completed: done.length };
    }
    return stats;
  }, [completedIds]);

  const totalStatements = CAN_DO_STATEMENTS.length;
  const totalCompleted = completedIds.length;
  const overallPercent = totalStatements > 0 ? Math.round((totalCompleted / totalStatements) * 100) : 0;

  // Statements for active level grouped by skill
  const activeLevelStatements = useMemo(() => {
    const stmts = CAN_DO_STATEMENTS.filter((s) => s.level === activeLevel);
    const grouped: Record<string, typeof stmts> = {};
    for (const s of stmts) {
      if (!grouped[s.skill]) grouped[s.skill] = [];
      grouped[s.skill].push(s);
    }
    return grouped;
  }, [activeLevel]);

  // Immigration recommendations
  const recommendations = useMemo(() => {
    const recs: { text: string; color: string; icon: typeof Award }[] = [];
    const levelIndex = LEVELS.indexOf(estimated as typeof LEVELS[number]);
    if (levelIndex >= 1) {
      recs.push({
        text: fr
          ? "Pret pour l'exigence CAQ permanent"
          : "Ready for CAQ permanent requirement",
        color: "amber",
        icon: Target,
      });
    }
    if (levelIndex >= 3) {
      recs.push({
        text: fr
          ? "Pret pour le PSTQ et le bonus CRS français"
          : "Ready for PSTQ and CRS French bonus",
        color: "emerald",
        icon: Award,
      });
    }
    if (levelIndex >= 4) {
      recs.push({
        text: fr
          ? "Points CRS français maximum"
          : "Maximum CRS French points",
        color: "blue",
        icon: TrendingUp,
      });
    }
    return recs;
  }, [estimated, fr]);

  const estimatedIndex = LEVELS.indexOf(estimated as typeof LEVELS[number]);

  return (
    <>
      {/* Hero */}
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
              {fr ? "Auto-évaluation" : "Self-Assessment"}
            </span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-2">
                {fr ? "Auto-évaluation CECR" : "CEFR Self-Assessment"}
              </h1>
              <p className="text-emerald-100 text-lg leading-relaxed max-w-2xl">
                {fr
                  ? "Évaluez vos compétences en français selon le Cadre europeen commun de reference. Cochez les énoncés que vous maitrisez pour estimer votre niveau."
                  : "Assess your French skills using the Common European Framework of Reference. Check the statements you can do to estimate your level."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estimated Level & Progress Bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Level estimate headline */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#085041] flex items-center justify-center">
                <BarChart3 size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {fr ? "Niveau estimé" : "Estimated Level"}
                </p>
                <p className="text-2xl font-bold text-[#085041] font-[family-name:var(--font-heading)]">
                  {estimated}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {fr
                  ? `${totalCompleted}/${totalStatements} énoncés completes`
                  : `${totalCompleted}/${totalStatements} statements completed`}
              </p>
              <p className="text-lg font-bold text-[#085041]">{overallPercent}%</p>
            </div>
          </div>

          {/* Visual progress bar across levels */}
          <div className="flex items-center gap-1">
            {LEVELS.map((lvl, i) => {
              const stats = levelStats[lvl];
              const pct = stats.total > 0 ? stats.completed / stats.total : 0;
              const isEstimated = i === estimatedIndex;
              return (
                <div key={lvl} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isEstimated
                          ? "bg-[#D97706]"
                          : i <= estimatedIndex
                          ? "bg-[#1D9E75]"
                          : "bg-gray-300"
                      }`}
                      style={{ width: `${Math.round(pct * 100)}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isEstimated
                        ? "text-[#D97706]"
                        : i <= estimatedIndex
                        ? "text-[#085041]"
                        : "text-gray-400"
                    }`}
                  >
                    {lvl}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Immigration Recommendations */}
      {recommendations.length > 0 && (
        <section className="bg-emerald-50 border-b border-emerald-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-start gap-3">
              <Award size={18} className="text-[#1D9E75] mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-emerald-800">
                  {fr ? "Programmes d'immigration" : "Immigration Programs"}
                </p>
                {recommendations.map((rec, i) => {
                  const Icon = rec.icon;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <Icon size={14} className="text-[#1D9E75] flex-shrink-0" />
                      <p className="text-sm text-emerald-700">{rec.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Level Tabs + Content */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Level Tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {LEVELS.map((lvl) => {
              const stats = levelStats[lvl];
              const isActive = lvl === activeLevel;
              const allDone = stats.total > 0 && stats.completed === stats.total;
              return (
                <button
                  key={lvl}
                  onClick={() => setActiveLevel(lvl)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-[#085041] text-white shadow-md"
                      : allDone
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-[#1D9E75] hover:text-[#085041]"
                  }`}
                >
                  {allDone && <CheckCircle2 size={14} />}
                  {lvl}
                  <span
                    className={`text-xs ${
                      isActive ? "text-emerald-200" : "text-gray-400"
                    }`}
                  >
                    {stats.completed}/{stats.total}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress summary for active level */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                {fr ? `Niveau ${activeLevel}` : `Level ${activeLevel}`}
              </h2>
              <span className="text-sm text-gray-500">
                {levelStats[activeLevel].completed}/{levelStats[activeLevel].total}{" "}
                {fr ? "completes" : "completed"}
                {" — "}
                {levelStats[activeLevel].total > 0
                  ? Math.round(
                      (levelStats[activeLevel].completed / levelStats[activeLevel].total) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#1D9E75] transition-all duration-500"
                style={{
                  width: `${
                    levelStats[activeLevel].total > 0
                      ? Math.round(
                          (levelStats[activeLevel].completed / levelStats[activeLevel].total) * 100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Statements grouped by skill */}
          <div className="space-y-6">
            {(["CO", "CE", "EO", "EE"] as const).map((skill) => {
              const statements = activeLevelStatements[skill];
              if (!statements || statements.length === 0) return null;
              const meta = SKILL_META[skill];
              const colors = SKILL_COLORS[skill];
              const Icon = meta.icon;

              return (
                <div
                  key={skill}
                  className={`rounded-2xl border-2 ${colors.border} ${colors.bg} overflow-hidden`}
                >
                  {/* Skill header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div
                      className={`w-9 h-9 rounded-lg ${colors.light} flex items-center justify-center`}
                    >
                      <Icon size={18} className={colors.text} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${colors.text}`}>
                        {skill}
                      </p>
                      <p className="text-xs text-gray-500">
                        {fr ? meta.labelFr : meta.labelEn}
                      </p>
                    </div>
                  </div>

                  {/* Statements */}
                  <div className="divide-y divide-gray-100">
                    {statements.map((stmt) => {
                      const isChecked = completedIds.includes(stmt.id);
                      return (
                        <button
                          key={stmt.id}
                          onClick={() => toggleStatement(stmt.id)}
                          className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-white/60 transition-colors"
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isChecked ? (
                              <CheckCircle2 size={20} className="text-[#1D9E75]" />
                            ) : (
                              <Circle size={20} className="text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm leading-relaxed ${
                                isChecked
                                  ? "text-gray-900 font-medium"
                                  : "text-gray-700"
                              }`}
                            >
                              {fr ? stmt.descFr : stmt.descEn}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Info size={11} className="flex-shrink-0" />
                              {stmt.immigrationContext}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Target size={22} className="text-emerald-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                {fr
                  ? "Ameliorez votre niveau avec des exercices"
                  : "Improve your level with exercises"}
              </h3>
              <p className="text-sm text-gray-500">
                {fr
                  ? "Pratiquez les compétences ou vous avez des lacunes avec nos exercices interactifs adaptes a votre niveau."
                  : "Practice the skills where you have gaps with our interactive exercises adapted to your level."}
              </p>
            </div>
            <Link
              href="/francisation"
              className="px-5 py-2.5 bg-[#085041] text-white font-semibold rounded-xl hover:bg-[#0a6b56] transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
            >
              {fr ? "Voir les exercices" : "View Exercises"}
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
      <SelfAssessmentPage />
    </Shell>
  );
}
