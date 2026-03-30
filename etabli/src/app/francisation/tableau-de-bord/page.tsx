"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useProgress, type UserProgress } from "@/lib/learning-system";
import Link from "next/link";
import {
  Flame,
  Target,
  Trophy,
  TrendingUp,
  Calendar,
  BookOpen,
  Clock,
  Star,
  Zap,
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  Headphones,
  BookOpenCheck,
  PenTool,
  Mic,
  ChevronRight,
  Shield,
  Snowflake,
  Play,
  RotateCcw,
  FileText,
  Bot,
} from "lucide-react";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface DailyXP {
  [date: string]: number;
}

interface ActivityItem {
  id: string;
  type: "lesson" | "badge" | "exercise" | "exam" | "streak";
  titleFr: string;
  titleEn: string;
  timestamp: string;
}

interface PlacementResult {
  co: number;
  ce: number;
  ee: number;
  eo: number;
  overall: string;
  date: string;
  targetExamDate?: string;
}

interface StreakFreezeData {
  available: number;
  usedThisMonth: number;
  lastEarned: string;
  monthKey: string;
}

type GoalTier = "casual" | "regular" | "serious" | "intense";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const GOAL_TIERS: Record<GoalTier, { xp: number; labelFr: string; labelEn: string; emoji: string }> = {
  casual:  { xp: 10,  labelFr: "Décontracté",  labelEn: "Casual",  emoji: "🌱" },
  regular: { xp: 30,  labelFr: "Régulier",      labelEn: "Regular", emoji: "📖" },
  serious: { xp: 50,  labelFr: "Sérieux",        labelEn: "Serious", emoji: "🎯" },
  intense: { xp: 100, labelFr: "Intense",        labelEn: "Intense", emoji: "🔥" },
};

const CEFR_FROM_NCLC: Record<number, string> = {
  1: "A1-", 2: "A1", 3: "A1+", 4: "A2", 5: "A2+",
  6: "B1", 7: "B1+", 8: "B2", 9: "B2+", 10: "C1",
  11: "C1+", 12: "C2",
};

/* ═══════════════════════════════════════════
   LOCALSTORAGE HELPERS
   ═══════════════════════════════════════════ */

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded, silently fail */ }
}

/* ═══════════════════════════════════════════
   DERIVED DATA HELPERS
   ═══════════════════════════════════════════ */

function estimateCEFR(progress: UserProgress): { cefr: string; nclc: number } {
  const lvl = progress.level;
  if (lvl >= 15) return { cefr: "B2+", nclc: 9 };
  if (lvl >= 12) return { cefr: "B2", nclc: 8 };
  if (lvl >= 9) return { cefr: "B1+", nclc: 7 };
  if (lvl >= 6) return { cefr: "B1", nclc: 6 };
  if (lvl >= 4) return { cefr: "A2+", nclc: 5 };
  if (lvl >= 2) return { cefr: "A2", nclc: 4 };
  return { cefr: "A1", nclc: 2 };
}

function skillNclc(skillLevel: number): number {
  return Math.min(12, Math.max(1, Math.floor(skillLevel * 2) + 1));
}

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function TableauDeBord() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { progress } = useProgress();

  // ── State ──
  const [dailyXP, setDailyXP] = useState<DailyXP>({});
  const [goalTier, setGoalTier] = useState<GoalTier>("regular");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [placement, setPlacement] = useState<PlacementResult | null>(null);
  const [freezeData, setFreezeData] = useState<StreakFreezeData>({
    available: 0, usedThisMonth: 0, lastEarned: "", monthKey: "",
  });
  const [mounted, setMounted] = useState(false);

  // ── Load from localStorage on mount ──
  useEffect(() => {
    setDailyXP(lsGet<DailyXP>("etabli_daily_xp", {}));
    setGoalTier(lsGet<GoalTier>("etabli_weekly_goal", "regular"));
    setActivities(lsGet<ActivityItem[]>("etabli_activity_log", []));
    setPlacement(lsGet<PlacementResult | null>("etabli_placement_result", null));

    const currentMonth = new Date().toISOString().slice(0, 7);
    const storedFreeze = lsGet<StreakFreezeData>("etabli_streak_freeze", {
      available: 0, usedThisMonth: 0, lastEarned: "", monthKey: currentMonth,
    });
    // Reset monthly counter if new month
    if (storedFreeze.monthKey !== currentMonth) {
      storedFreeze.usedThisMonth = 0;
      storedFreeze.monthKey = currentMonth;
    }
    setFreezeData(storedFreeze);

    // Record today's XP if not yet saved
    const dxp = lsGet<DailyXP>("etabli_daily_xp", {});
    const todayStr = today();
    if (!(todayStr in dxp)) {
      dxp[todayStr] = progress.dailyXP || 0;
      lsSet("etabli_daily_xp", dxp);
      setDailyXP(dxp);
    }

    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived values ──
  const cefrEst = useMemo(() => estimateCEFR(progress), [progress]);
  const weekDates = useMemo(() => getWeekDates(), []);

  const weekXP = useMemo(() => {
    return weekDates.reduce((sum, d) => sum + (dailyXP[d] || 0), 0);
  }, [weekDates, dailyXP]);

  const dailyGoalXP = GOAL_TIERS[goalTier].xp;
  const weeklyGoalXP = dailyGoalXP * 7;
  const weekProgress = Math.min(100, Math.round((weekXP / weeklyGoalXP) * 100));

  // Skills from progress.skillLevels
  const skills = useMemo(() => {
    const sl = progress.skillLevels || {};
    return {
      co: { level: sl["comprehension-orale"] ?? sl["compréhension-orale"] ?? 0, done: Math.floor((sl["comprehension-orale"] ?? sl["compréhension-orale"] ?? 0) * 4), total: 20 },
      ce: { level: sl["comprehension-ecrite"] ?? sl["compréhension-écrite"] ?? 0, done: Math.floor((sl["comprehension-ecrite"] ?? sl["compréhension-écrite"] ?? 0) * 5), total: 25 },
      ee: { level: sl["expression-ecrite"] ?? sl["expression-écrite"] ?? 0, done: Math.floor((sl["expression-ecrite"] ?? sl["expression-écrite"] ?? 0) * 3.6), total: 18 },
      eo: { level: sl["expression-orale"] ?? sl["expression-orale"] ?? 0, done: Math.floor((sl["expression-orale"] ?? sl["expression-orale"] ?? 0) * 3), total: 15 },
    };
  }, [progress.skillLevels]);

  // ── Calendar heatmap data (last 12 weeks = 84 days) ──
  const heatmapData = useMemo(() => {
    const days: { date: string; xp: number; dayOfWeek: number }[] = [];
    const todayDate = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ date: dateStr, xp: dailyXP[dateStr] || 0, dayOfWeek: d.getDay() });
    }
    return days;
  }, [dailyXP]);

  // Heatmap organized into weeks (columns)
  const heatmapWeeks = useMemo(() => {
    const weeks: { date: string; xp: number; dayOfWeek: number }[][] = [];
    let currentWeek: { date: string; xp: number; dayOfWeek: number }[] = [];
    for (const day of heatmapData) {
      if (day.dayOfWeek === 1 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  }, [heatmapData]);

  // ── Goal change handler ──
  const handleGoalChange = useCallback((tier: GoalTier) => {
    setGoalTier(tier);
    lsSet("etabli_weekly_goal", tier);
  }, []);

  // ── Streak freeze handler ──
  const useStreakFreeze = useCallback(() => {
    if (freezeData.available <= 0) return;
    const updated: StreakFreezeData = {
      ...freezeData,
      available: freezeData.available - 1,
      usedThisMonth: freezeData.usedThisMonth + 1,
    };
    setFreezeData(updated);
    lsSet("etabli_streak_freeze", updated);
  }, [freezeData]);

  // ── Heatmap color ──
  const heatColor = (xp: number): string => {
    if (xp === 0) return "bg-gray-200";
    if (xp <= 25) return "bg-emerald-200";
    if (xp <= 50) return "bg-emerald-400";
    if (xp <= 100) return "bg-emerald-600";
    return "bg-[#085041]";
  };

  // ── Prevent hydration mismatch ──
  if (!mounted) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-[#085041] font-[family-name:var(--font-heading)] text-xl">
            {fr ? "Chargement..." : "Loading..."}
          </div>
        </div>
      </Shell>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <Shell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#085041] font-[family-name:var(--font-heading)]">
              {fr ? "Tableau de bord" : "Dashboard"}
            </h1>
            <p className="text-gray-500 mt-1">
              {fr ? "Suivez votre progression en francisation" : "Track your francisation progress"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString(fr ? "fr-CA" : "en-CA", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════
           1. HERO STAT CARDS
           ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Streak */}
          <StatCard
            icon={<Flame className="w-6 h-6 text-orange-500" />}
            label={fr ? "Serie en cours" : "Current streak"}
            value={`${progress.streak}`}
            unit={fr ? (progress.streak === 1 ? "jour" : "jours") : (progress.streak === 1 ? "day" : "days")}
            accent="orange"
            sub={
              freezeData.available > 0
                ? <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                    <Snowflake className="w-3 h-3" />
                    {freezeData.available} {fr ? "gel(s) dispo." : "freeze(s) avail."}
                  </span>
                : <span className="text-xs text-gray-400">{fr ? "Aucun gel disponible" : "No freezes available"}</span>
            }
          />

          {/* XP this week */}
          <StatCard
            icon={<Zap className="w-6 h-6 text-[#D97706]" />}
            label={fr ? "XP cette semaine" : "XP this week"}
            value={`${weekXP}`}
            unit={`/ ${weeklyGoalXP} XP`}
            accent="gold"
            sub={
              <div className="w-full mt-1">
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#D97706] transition-all duration-700 ease-out"
                    style={{ width: `${weekProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5 text-right">{weekProgress}%</p>
              </div>
            }
          />

          {/* CEFR level */}
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-[#1D9E75]" />}
            label={fr ? "Niveau estime" : "Estimated level"}
            value={cefrEst.cefr}
            unit="CECR / CEFR"
            accent="green"
            sub={
              <span className="text-xs text-gray-500">
                NCLC {cefrEst.nclc}
              </span>
            }
          />

          {/* Lessons completed */}
          <StatCard
            icon={<BookOpen className="w-6 h-6 text-[#085041]" />}
            label={fr ? "Lecons completes" : "Lessons completed"}
            value={`${progress.lessonsCompleted}`}
            unit={fr ? "lecons" : "lessons"}
            accent="primary"
            sub={
              <span className="text-xs text-gray-500">
                {progress.exercisesCompleted} {fr ? "exercices faits" : "exercises done"}
              </span>
            }
          />
        </div>

        {/* ═══════════════════════════════════════
           2. CALENDAR HEATMAP
           ═══════════════════════════════════════ */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#085041]" />
            <h2 className="text-lg font-semibold text-[#085041] font-[family-name:var(--font-heading)]">
              {fr ? "Activite quotidienne" : "Daily activity"}
            </h2>
            <span className="text-xs text-gray-400 ml-auto">
              {fr ? "12 dernieres semaines" : "Last 12 weeks"}
            </span>
          </div>

          {/* Heatmap grid */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-[3px] min-w-fit">
              {heatmapWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {/* Pad first week so days align to correct row */}
                  {wi === 0 && week[0] && Array.from({ length: (week[0].dayOfWeek + 6) % 7 }).map((_, pi) => (
                    <div key={`pad-${pi}`} className="w-[14px] h-[14px] sm:w-4 sm:h-4" />
                  ))}
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.xp} XP`}
                      className={`w-[14px] h-[14px] sm:w-4 sm:h-4 rounded-[3px] ${heatColor(day.xp)} transition-colors duration-200 hover:ring-2 hover:ring-[#1D9E75]/40 cursor-default`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <span>{fr ? "Moins" : "Less"}</span>
            <div className="w-3 h-3 rounded-[2px] bg-gray-200" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-200" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-400" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-600" />
            <div className="w-3 h-3 rounded-[2px] bg-[#085041]" />
            <span>{fr ? "Plus" : "More"}</span>
          </div>
        </section>

        {/* Two-column layout for goals + skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ═══════════════════════════════════════
             3. SKILL BREAKDOWN
             ═══════════════════════════════════════ */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Brain className="w-5 h-5 text-[#085041]" />
              <h2 className="text-lg font-semibold text-[#085041] font-[family-name:var(--font-heading)]">
                {fr ? "Competences" : "Skills"}
              </h2>
            </div>

            <div className="space-y-5">
              <SkillBar
                icon={<Headphones className="w-4 h-4" />}
                label="CO"
                fullLabel={fr ? "Compréhension orale" : "Listening"}
                done={skills.co.done}
                total={skills.co.total}
                nclc={skillNclc(skills.co.level)}
                fr={fr}
              />
              <SkillBar
                icon={<BookOpenCheck className="w-4 h-4" />}
                label="CE"
                fullLabel={fr ? "Compréhension écrite" : "Reading"}
                done={skills.ce.done}
                total={skills.ce.total}
                nclc={skillNclc(skills.ce.level)}
                fr={fr}
              />
              <SkillBar
                icon={<PenTool className="w-4 h-4" />}
                label="EE"
                fullLabel={fr ? "Expression écrite" : "Writing"}
                done={skills.ee.done}
                total={skills.ee.total}
                nclc={skillNclc(skills.ee.level)}
                fr={fr}
              />
              <SkillBar
                icon={<Mic className="w-4 h-4" />}
                label="EO"
                fullLabel={fr ? "Expression orale" : "Speaking"}
                done={skills.eo.done}
                total={skills.eo.total}
                nclc={skillNclc(skills.eo.level)}
                fr={fr}
              />
            </div>
          </section>

          {/* ═══════════════════════════════════════
             4. WEEKLY GOALS PANEL
             ═══════════════════════════════════════ */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-5 h-5 text-[#D97706]" />
              <h2 className="text-lg font-semibold text-[#085041] font-[family-name:var(--font-heading)]">
                {fr ? "Objectif hebdomadaire" : "Weekly goal"}
              </h2>
            </div>

            {/* Progress ring */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="#D97706" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${weekProgress * 2.639} ${263.9 - weekProgress * 2.639}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[#085041]">{weekProgress}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">
                  {weekXP} / {weeklyGoalXP} XP
                </p>
                <p className="text-xs text-gray-400">
                  {fr
                    ? `${GOAL_TIERS[goalTier].emoji} Mode ${GOAL_TIERS[goalTier].labelFr} - ${dailyGoalXP} XP/jour`
                    : `${GOAL_TIERS[goalTier].emoji} ${GOAL_TIERS[goalTier].labelEn} mode - ${dailyGoalXP} XP/day`
                  }
                </p>

                {/* Day checkmarks */}
                <div className="flex gap-1.5 mt-3">
                  {weekDates.map((d) => {
                    const xp = dailyXP[d] || 0;
                    const hit = xp >= dailyGoalXP;
                    const isToday = d === today();
                    return (
                      <div
                        key={d}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all duration-300 ${
                          hit
                            ? "bg-[#1D9E75] border-[#1D9E75] text-white"
                            : isToday
                            ? "border-[#D97706] text-[#D97706] bg-amber-50"
                            : "border-gray-200 text-gray-400"
                        }`}
                        title={`${d}: ${xp} XP`}
                      >
                        {hit ? <CheckCircle2 className="w-3.5 h-3.5" /> : (fr ? ["L","M","M","J","V","S","D"] : ["M","T","W","T","F","S","S"])[weekDates.indexOf(d)] ?? ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Goal selector */}
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(GOAL_TIERS) as [GoalTier, typeof GOAL_TIERS[GoalTier]][]).map(([key, tier]) => (
                <button
                  key={key}
                  onClick={() => handleGoalChange(key)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                    goalTier === key
                      ? "border-[#D97706] bg-amber-50 text-[#D97706]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {tier.emoji} {fr ? tier.labelFr : tier.labelEn}
                  <span className="block text-xs opacity-70">{tier.xp} XP/{fr ? "jour" : "day"}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Two-column: streak freeze + recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ═══════════════════════════════════════
             5. STREAK FREEZE MECHANIC
             ═══════════════════════════════════════ */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-[#085041] font-[family-name:var(--font-heading)]">
                {fr ? "Gel de serie" : "Streak freeze"}
              </h2>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {fr
                ? "Protegez votre serie si vous manquez un jour. Gagnez un gel chaque 7 jours consecutifs (max 2/mois)."
                : "Protect your streak if you miss a day. Earn a freeze every 7 consecutive days (max 2/month)."
              }
            </p>

            <div className="flex items-center gap-4 mb-4">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    i < freezeData.available
                      ? "bg-blue-100 text-blue-600 shadow-sm"
                      : "bg-gray-100 text-gray-300"
                  }`}
                >
                  <Snowflake className="w-7 h-7" />
                </div>
              ))}
              <div className="flex-1 text-sm text-gray-500">
                <p className="font-medium text-[#085041]">
                  {freezeData.available}/2 {fr ? "disponibles" : "available"}
                </p>
                <p className="text-xs text-gray-400">
                  {freezeData.usedThisMonth}/2 {fr ? "utilises ce mois" : "used this month"}
                </p>
              </div>
            </div>

            <button
              onClick={useStreakFreeze}
              disabled={freezeData.available <= 0}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                freezeData.available > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Snowflake className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              {fr ? "Utiliser un gel de serie" : "Use a streak freeze"}
            </button>
          </section>

          {/* ═══════════════════════════════════════
             6. RECENT ACTIVITY FEED
             ═══════════════════════════════════════ */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#085041]" />
              <h2 className="text-lg font-semibold text-[#085041] font-[family-name:var(--font-heading)]">
                {fr ? "Activite recente" : "Recent activity"}
              </h2>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{fr ? "Aucune activite encore." : "No activity yet."}</p>
                <p className="text-xs mt-1">{fr ? "Commencez une lecon!" : "Start a lesson!"}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {activities.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.type === "badge" ? "bg-amber-100 text-[#D97706]"
                        : item.type === "lesson" ? "bg-emerald-100 text-[#1D9E75]"
                        : item.type === "streak" ? "bg-orange-100 text-orange-500"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {item.type === "badge" ? <Award className="w-4 h-4" />
                        : item.type === "lesson" ? <CheckCircle2 className="w-4 h-4" />
                        : item.type === "streak" ? <Flame className="w-4 h-4" />
                        : <Star className="w-4 h-4" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">
                        {fr ? item.titleFr : item.titleEn}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleDateString(fr ? "fr-CA" : "en-CA", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ═══════════════════════════════════════
           7. EXAM READINESS SCORE
           ═══════════════════════════════════════ */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-[#085041]" />
            <h2 className="text-lg font-semibold text-[#085041] font-[family-name:var(--font-heading)]">
              {fr ? "Preparation aux examens" : "Exam readiness"}
            </h2>
          </div>

          {placement ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Skill radar (pure CSS) */}
              <div className="md:col-span-1">
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: "co", label: "CO", color: "bg-blue-500", val: placement.co },
                    { key: "ce", label: "CE", color: "bg-emerald-500", val: placement.ce },
                    { key: "ee", label: "EE", color: "bg-amber-500", val: placement.ee },
                    { key: "eo", label: "EO", color: "bg-purple-500", val: placement.eo },
                  ] as const).map((s) => (
                    <div key={s.key} className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-1">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                          <circle
                            cx="50" cy="50" r="42" fill="none"
                            stroke="currentColor"
                            strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${(s.val / 12) * 263.9} ${263.9 - (s.val / 12) * 263.9}`}
                            className={`${s.color.replace("bg-", "text-")} transition-all duration-700`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                          {CEFR_FROM_NCLC[s.val] || `N${s.val}`}
                        </div>
                      </div>
                      <p className="text-xs font-medium text-gray-600">{s.label}</p>
                      <p className="text-[10px] text-gray-400">NCLC {s.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scores + readiness */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-gradient-to-r from-[#085041]/5 to-[#1D9E75]/5 rounded-xl p-4">
                  <p className="text-sm font-medium text-[#085041]">
                    {fr ? "Estimation TCF" : "Estimated TCF score"}
                  </p>
                  <p className="text-2xl font-bold text-[#085041] font-[family-name:var(--font-heading)]">
                    {placement.overall}
                  </p>
                </div>

                {/* Program readiness */}
                <div className="space-y-3">
                  <ReadinessBar
                    label="PSTQ"
                    subLabel={fr ? "Programme de selection des travailleurs qualifies" : "Skilled worker selection program"}
                    percent={Math.min(100, Math.round(((placement.co + placement.ce + placement.ee + placement.eo) / 32) * 100))}
                    color="bg-[#1D9E75]"
                  />
                  <ReadinessBar
                    label={fr ? "Citoyennete" : "Citizenship"}
                    subLabel={fr ? "Exigence linguistique pour la citoyennete canadienne" : "Language requirement for Canadian citizenship"}
                    percent={Math.min(100, Math.round(((placement.co + placement.eo) / 16) * 100))}
                    color="bg-[#D97706]"
                  />
                </div>

                {/* Target exam date */}
                {placement.targetExamDate && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
                    <Calendar className="w-4 h-4 text-[#D97706]" />
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{daysUntil(placement.targetExamDate)}</span>{" "}
                      {fr ? "jours avant votre examen" : "days until your exam"}
                      <span className="text-xs text-gray-400 ml-2">({placement.targetExamDate})</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium text-gray-500">
                {fr ? "Pas encore de test de placement" : "No placement test yet"}
              </p>
              <p className="text-xs mt-1 max-w-sm mx-auto">
                {fr
                  ? "Completez un test de placement pour voir votre estimation de score TCF et votre preparation aux programmes d'immigration."
                  : "Complete a placement test to see your estimated TCF score and immigration program readiness."
                }
              </p>
              <Link
                href="/francisation/examen-blanc"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#085041] text-white text-sm font-medium rounded-xl hover:bg-[#085041]/90 transition-colors"
              >
                <Play className="w-4 h-4" />
                {fr ? "Passer le test" : "Take the test"}
              </Link>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════
           8. QUICK ACTIONS
           ═══════════════════════════════════════ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            href="/francisation/lecons/1"
            icon={<Play className="w-5 h-5" />}
            label={fr ? "Continuer la lecon" : "Continue lesson"}
            sub={fr ? "Reprendre ou vous etiez" : "Pick up where you left off"}
            color="bg-[#085041]"
          />
          <QuickAction
            href="/francisation/revision"
            icon={<RotateCcw className="w-5 h-5" />}
            label={fr ? "Revision quotidienne" : "Daily review"}
            sub={fr ? "Renforcez votre memoire" : "Strengthen your memory"}
            color="bg-[#1D9E75]"
          />
          <QuickAction
            href="/francisation/examen-blanc"
            icon={<FileText className="w-5 h-5" />}
            label={fr ? "Examen blanc" : "Mock exam"}
            sub={fr ? "Testez votre niveau" : "Test your level"}
            color="bg-[#D97706]"
          />
          <QuickAction
            href="/francisation/assistant"
            icon={<Bot className="w-5 h-5" />}
            label={fr ? "Assistant IA" : "AI Assistant"}
            sub={fr ? "Posez vos questions" : "Ask your questions"}
            color="bg-purple-600"
          />
        </section>

      </div>
    </Shell>
  );
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

function StatCard({
  icon,
  label,
  value,
  unit,
  accent,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  accent: "orange" | "gold" | "green" | "primary";
  sub?: React.ReactNode;
}) {
  const bgMap = {
    orange: "from-orange-50 to-orange-100/50",
    gold: "from-amber-50 to-amber-100/50",
    green: "from-emerald-50 to-emerald-100/50",
    primary: "from-[#085041]/5 to-[#085041]/10",
  };

  return (
    <div className={`bg-gradient-to-br ${bgMap[accent]} rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-shadow duration-300`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-[#085041] font-[family-name:var(--font-heading)]">{value}</span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
      {sub && <div className="mt-2">{sub}</div>}
    </div>
  );
}

function SkillBar({
  icon,
  label,
  fullLabel,
  done,
  total,
  nclc,
  fr,
}: {
  icon: React.ReactNode;
  label: string;
  fullLabel: string;
  done: number;
  total: number;
  nclc: number;
  fr: boolean;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[#085041]">{icon}</span>
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className="text-xs text-gray-400">{fullLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">{done}/{total} {fr ? "ex." : "ex."}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-[#085041]/10 text-[#085041] font-medium text-[10px]">
            NCLC {nclc}
          </span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1D9E75] to-[#085041] transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ReadinessBar({
  label,
  subLabel,
  percent,
  color,
}: {
  label: string;
  subLabel: string;
  percent: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className="text-xs text-gray-400 ml-2">{subLabel}</span>
        </div>
        <span className={`text-sm font-bold ${percent >= 80 ? "text-[#1D9E75]" : percent >= 50 ? "text-[#D97706]" : "text-red-500"}`}>
          {percent}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  sub,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200"
    >
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 truncate">{sub}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
    </Link>
  );
}
