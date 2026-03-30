"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useProgress, getXPForNextLevel, BADGES } from "@/lib/learning-system";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  Zap,
  Flame,
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Target,
  Star,
  StickyNote,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Brain,
  Dumbbell,
  Volume2,
  PenLine,
  Baby,
  ClipboardCheck,
  ArrowRight,
  BarChart3,
} from "lucide-react";

// ─── TYPES ───
interface WeekData {
  week: number;
  titleFr: string;
  titleEn: string;
  level: string;
  assignmentsFr: string[];
  assignmentsEn: string[];
  links: string[];
}

interface ClassSchedule {
  session1Day: string;
  session1Time: string;
  session2Day: string;
  session2Time: string;
  location: string;
}

// ─── 16-WEEK CURRICULUM ───
const WEEKS: WeekData[] = [
  // A1 Foundation (W1-4)
  { week: 1, titleFr: "Salutations et presentations", titleEn: "Greetings and introductions", level: "A1",
    assignmentsFr: ["Pratiquer se presenter (nom, pays, langue)", "Apprendre les chiffres 1-20", "Écouter les salutations québécoises"],
    assignmentsEn: ["Practice introducing yourself (name, country, language)", "Learn numbers 1-20", "Listen to Québec greetings"],
    links: ["/francisation/debutant", "/francisation/vocabulaire"] },
  { week: 2, titleFr: "La vie quotidienne", titleEn: "Daily life", level: "A1",
    assignmentsFr: ["Vocabulaire: jours, mois, heures", "Exercice: remplir un formulaire simple", "Pratique rapide: 5 minutes par jour"],
    assignmentsEn: ["Vocabulary: days, months, times", "Exercise: fill in a simple form", "Quick practice: 5 minutes per day"],
    links: ["/francisation/debutant", "/francisation/pratique-rapide"] },
  { week: 3, titleFr: "Faire ses courses", titleEn: "Shopping and errands", level: "A1",
    assignmentsFr: ["Vocabulaire: aliments, vetements, prix", "Dialogue: au supermarche", "Exercice: les articles (le, la, les, un, une)"],
    assignmentsEn: ["Vocabulary: food, clothing, prices", "Dialogue: at the supermarket", "Exercise: articles (le, la, les, un, une)"],
    links: ["/francisation/vocabulaire", "/francisation/grammaire"] },
  { week: 4, titleFr: "Se deplacer en ville", titleEn: "Getting around the city", level: "A1",
    assignmentsFr: ["Vocabulaire: transports, directions", "Exercice: demander son chemin", "Révision des semaines 1-4"],
    assignmentsEn: ["Vocabulary: transport, directions", "Exercise: asking for directions", "Review of weeks 1-4"],
    links: ["/francisation/vocabulaire", "/francisation/revision"] },
  // A2 Employment/Intégration (W5-8)
  { week: 5, titleFr: "Chercher un logement", titleEn: "Finding housing", level: "A2",
    assignmentsFr: ["Vocabulaire: logement, bail, loyer", "Exercice: comprendre une annonce", "Grammaire: la négation"],
    assignmentsEn: ["Vocabulary: housing, lease, rent", "Exercise: understanding a listing", "Grammar: negation"],
    links: ["/francisation/vocabulaire", "/francisation/grammaire"] },
  { week: 6, titleFr: "Le monde du travail", titleEn: "The working world", level: "A2",
    assignmentsFr: ["Vocabulaire: emploi, CV, entrevue", "Exercice: rédiger un CV simple", "Dictee: termes d'emploi"],
    assignmentsEn: ["Vocabulary: employment, résumé, interview", "Exercise: write a simple CV", "Dictation: employment terms"],
    links: ["/francisation/vocabulaire", "/francisation/dictee"] },
  { week: 7, titleFr: "La sante et les services", titleEn: "Health and services", level: "A2",
    assignmentsFr: ["Vocabulaire: sante, RAMQ, clinique", "Exercice: prendre rendez-vous", "Grammaire: le passe composé (introduction)"],
    assignmentsEn: ["Vocabulary: health, RAMQ, clinic", "Exercise: making an appointment", "Grammar: past tense (introduction)"],
    links: ["/francisation/vocabulaire", "/francisation/exercices"] },
  { week: 8, titleFr: "L'administration quebecoise", titleEn: "Québec administration", level: "A2",
    assignmentsFr: ["Vocabulaire: NAS, permis, formulaires", "Exercices interactifs: textes a trous", "Examen blanc A2"],
    assignmentsEn: ["Vocabulary: SIN, permits, forms", "Interactive exercises: fill-in-the-blank", "A2 mock exam"],
    links: ["/francisation/exercices", "/francisation/examen-blanc"] },
  // B1 Argumentation (W9-12)
  { week: 9, titleFr: "Exprimer son opinion", titleEn: "Expressing your opinion", level: "B1",
    assignmentsFr: ["Structures: je pense que, a mon avis", "Exercice: debat simple sur un sujet", "Grammaire: le conditionnel"],
    assignmentsEn: ["Structures: I think that, in my opinion", "Exercise: simple debate on a topic", "Grammar: conditional tense"],
    links: ["/francisation/grammaire", "/francisation/exercices"] },
  { week: 10, titleFr: "Raconter une experience", titleEn: "Telling an experience", level: "B1",
    assignmentsFr: ["Grammaire: passe composé vs imparfait", "Exercice: raconter son parcours migratoire", "Dictee: recit au passe"],
    assignmentsEn: ["Grammar: past tense vs imperfect", "Exercise: telling your migration story", "Dictation: past tense narrative"],
    links: ["/francisation/grammaire", "/francisation/dictee"] },
  { week: 11, titleFr: "Comprendre les medias", titleEn: "Understanding media", level: "B1",
    assignmentsFr: ["Compréhension écrite: article de journal", "Compréhension orale: bulletin de nouvelles", "Vocabulaire: medias et actualites"],
    assignmentsEn: ["Reading compréhension: newspaper article", "Listening compréhension: news bulletin", "Vocabulary: media and current events"],
    links: ["/francisation/vocabulaire", "/francisation/exercices"] },
  { week: 12, titleFr: "Resoudre un problème", titleEn: "Solving a problem", level: "B1",
    assignmentsFr: ["Exercice: ecrire une lettre de plainte", "Grammaire: le subjonctif (introduction)", "Révision des semaines 9-12"],
    assignmentsEn: ["Exercise: writing a complaint letter", "Grammar: subjunctive (introduction)", "Review of weeks 9-12"],
    links: ["/francisation/grammaire", "/francisation/revision"] },
  // B2 Exam Prep (W13-16)
  { week: 13, titleFr: "Argumentation avancee", titleEn: "Advanced argumentation", level: "B2",
    assignmentsFr: ["Structures: bien que, malgre, en revanche", "Exercice: essai argumentatif", "Prononciation: les liaisons"],
    assignmentsEn: ["Structures: although, despite, however", "Exercise: argumentative essay", "Pronunciation: liaisons"],
    links: ["/francisation/grammaire", "/francisation/prononciation"] },
  { week: 14, titleFr: "Compréhension approfondie", titleEn: "In-depth comprehension", level: "B2",
    assignmentsFr: ["Compréhension écrite: texte long", "Compréhension orale: entrevue radio", "Révision espacee: tous les themes"],
    assignmentsEn: ["Reading: long text", "Listening: radio interview", "Spaced review: all themes"],
    links: ["/francisation/exercices", "/francisation/revision"] },
  { week: 15, titleFr: "Simulation d'examen", titleEn: "Exam simulation", level: "B2",
    assignmentsFr: ["Examen blanc complet (4 compétences)", "Analyse des résultats", "Plan de révision personnalise"],
    assignmentsEn: ["Full mock exam (4 skills)", "Results analysis", "Personalized review plan"],
    links: ["/francisation/examen-blanc", "/francisation/revision"] },
  { week: 16, titleFr: "Préparation finale", titleEn: "Final preparation", level: "B2",
    assignmentsFr: ["Révision des points faibles", "Dernier examen blanc", "Stratégies pour le jour de l'examen"],
    assignmentsEn: ["Review weak points", "Final mock exam", "Exam day strategies"],
    links: ["/francisation/examen-blanc", "/francisation/pratique-rapide"] },
];

// ─── QUICK ACCESS LINKS ───
const QUICK_LINKS = [
  { href: "/francisation/debutant", iconType: "Baby" as const, labelFr: "Débutant A1", labelEn: "Beginner A1", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { href: "/francisation/vocabulaire", iconType: "BookOpen" as const, labelFr: "Vocabulaire", labelEn: "Vocabulary", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { href: "/francisation/grammaire", iconType: "PenLine" as const, labelFr: "Grammaire", labelEn: "Grammar", color: "bg-sky-50 text-sky-700 border-sky-200" },
  { href: "/francisation/exercices", iconType: "Dumbbell" as const, labelFr: "Exercices interactifs", labelEn: "Interactive Exercises", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { href: "/francisation/pratique-rapide", iconType: "Zap" as const, labelFr: "Pratique rapide", labelEn: "Quick Practice", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { href: "/francisation/examen-blanc", iconType: "ClipboardCheck" as const, labelFr: "Examen blanc", labelEn: "Mock Exam", color: "bg-red-50 text-red-700 border-red-200" },
  { href: "/francisation/revision", iconType: "Brain" as const, labelFr: "Révision espacee", labelEn: "Spaced Review", color: "bg-violet-50 text-violet-700 border-violet-200" },
  { href: "/francisation/dictee", iconType: "Volume2" as const, labelFr: "Dictee", labelEn: "Dictation", color: "bg-pink-50 text-pink-700 border-pink-200" },
];

const ICON_MAP = { Baby, BookOpen, PenLine, Dumbbell, Zap, ClipboardCheck, Brain, Volume2 } as const;

// ─── NCLC LEVELS ───
const NCLC_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// ─── HELPER: localStorage ───
function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

function saveJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── MAIN COMPONENT ───
function EleveDashboard() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { progress } = useProgress();
  const xpInfo = getXPForNextLevel(progress.xp);
  const earnedBadges = BADGES.filter((b) => progress.badges.includes(b.id));

  // ── State ──
  const [mounted, setMounted] = useState(false);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [assignmentChecks, setAssignmentChecks] = useState<Record<number, boolean[]>>({});
  const [schedule, setSchedule] = useState<ClassSchedule>({
    session1Day: fr ? "Lundi" : "Monday",
    session1Time: "09:00",
    session2Day: fr ? "Mercredi" : "Wednesday",
    session2Time: "09:00",
    location: "",
  });
  const [ncicTarget, setNcicTarget] = useState(7);
  const [hoursStudied, setHoursStudied] = useState(0);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [showNotes, setShowNotes] = useState(false);

  // ── Load from localStorage ──
  useEffect(() => {
    setCompletedWeeks(loadJSON("etabli-training-progress", []));
    setCurrentWeek(loadJSON("etabli-training-current-week", 1));
    setAssignmentChecks(loadJSON("etabli-training-assignments", {}));
    setSchedule(loadJSON("etabli-training-schedule", {
      session1Day: fr ? "Lundi" : "Monday",
      session1Time: "09:00",
      session2Day: fr ? "Mercredi" : "Wednesday",
      session2Time: "09:00",
      location: "",
    }));
    setNcicTarget(loadJSON("etabli-training-nclc-target", 7));
    setHoursStudied(loadJSON("etabli-training-hours", 0));
    setNotes(loadJSON("etabli-training-notes", {}));
    setMounted(true);
  }, [fr]);

  // ── Save helpers ──
  const toggleWeekComplete = useCallback((week: number) => {
    setCompletedWeeks((prev) => {
      const next = prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week];
      saveJSON("etabli-training-progress", next);
      return next;
    });
  }, []);

  const toggleAssignment = useCallback((week: number, idx: number) => {
    setAssignmentChecks((prev) => {
      const weekChecks = prev[week] ? [...prev[week]] : WEEKS[week - 1].assignmentsFr.map(() => false);
      weekChecks[idx] = !weekChecks[idx];
      const next = { ...prev, [week]: weekChecks };
      saveJSON("etabli-training-assignments", next);
      return next;
    });
  }, []);

  const updateSchedule = useCallback((field: keyof ClassSchedule, value: string) => {
    setSchedule((prev) => {
      const next = { ...prev, [field]: value };
      saveJSON("etabli-training-schedule", next);
      return next;
    });
  }, []);

  const updateNotes = useCallback((text: string) => {
    setNotes((prev) => {
      const next = { ...prev, [currentWeek]: text };
      saveJSON("etabli-training-notes", next);
      return next;
    });
  }, [currentWeek]);

  const updateHours = useCallback((val: number) => {
    const h = Math.max(0, val);
    setHoursStudied(h);
    saveJSON("etabli-training-hours", h);
  }, []);

  const updateTarget = useCallback((val: number) => {
    setNcicTarget(val);
    saveJSON("etabli-training-nclc-target", val);
  }, []);

  // ── Derived ──
  const currentWeekData = WEEKS[currentWeek - 1];
  const weekAssignments = fr ? currentWeekData.assignmentsFr : currentWeekData.assignmentsEn;
  const weekChecks = assignmentChecks[currentWeek] || weekAssignments.map(() => false);
  const estimatedNCLC = Math.min(12, Math.max(1, Math.floor(hoursStudied / 100) + 1));
  const hoursToTarget = Math.max(0, (ncicTarget - estimatedNCLC) * 100);

  const levelColor = (level: string) => {
    switch (level) {
      case "A1": return "bg-emerald-100 text-emerald-800";
      case "A2": return "bg-teal-100 text-teal-800";
      case "B1": return "bg-sky-100 text-sky-800";
      case "B2": return "bg-violet-100 text-violet-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[#085041] text-lg">{fr ? "Chargement..." : "Loading..."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ─── HERO ─── */}
      <section className="relative bg-gradient-to-br from-[#085041] via-[#0a6b55] to-[#1D9E75] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold mb-2">
            {fr ? "Mon espace formation" : "My Training Space"}
          </h1>
          <p className="text-white/80 text-lg mb-8">
            {fr
              ? "Bienvenue ! Suis ta progression et préparé ton avenir au Québec."
              : "Welcome! Track your progress and préparé for your future in Québec."}
          </p>

          {/* XP / Level / Streak row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <div className="text-sm text-white/70">{fr ? "Niveau" : "Level"}</div>
                <div className="text-2xl font-bold">{progress.level}</div>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <div className="text-sm text-white/70">XP</div>
                <div className="text-2xl font-bold">{progress.xp}</div>
                <div className="w-32 bg-white/20 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-yellow-300 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, xpInfo.progress)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-300" />
              </div>
              <div>
                <div className="text-sm text-white/70">{fr ? "Serie" : "Streak"}</div>
                <div className="text-2xl font-bold">
                  {progress.streak} {fr ? "jours" : "days"}
                </div>
              </div>
            </div>
          </div>

          {/* Earned badges */}
          {earnedBadges.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {earnedBadges.map((b) => (
                <span key={b.id} className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                  {b.icon} {fr ? b.nameFr : b.nameEn}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* ─── 16-WEEK PROGRESS TRACKER ─── */}
        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#085041] mb-1">
            {fr ? "Progression 16 semaines" : "16-Week Progress"}
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            {fr
              ? "Coche chaque semaine terminee. Clique sur une semaine pour voir les devoirs."
              : "Check off each completed week. Click a week to see assignments."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {WEEKS.map((w) => {
              const done = completedWeeks.includes(w.week);
              const isCurrent = w.week === currentWeek;
              return (
                <div
                  key={w.week}
                  role="button"
                  tabIndex={0}
                  onClick={() => setCurrentWeek(w.week)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setCurrentWeek(w.week); }}
                  className={`
                    relative rounded-xl border-2 p-3 text-left transition-all hover:shadow-md cursor-pointer
                    ${isCurrent ? "border-[#D97706] bg-amber-50 shadow-md" : done ? "border-[#1D9E75] bg-emerald-50" : "border-gray-200 bg-white hover:border-gray-300"}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-400">S{w.week}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${levelColor(w.level)}`}>
                      {w.level}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-800 leading-tight mb-2">
                    {fr ? w.titleFr : w.titleEn}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWeekComplete(w.week);
                    }}
                    className={`
                      w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
                      ${done ? "bg-[#1D9E75] border-[#1D9E75] text-white" : "border-gray-300 hover:border-[#1D9E75]"}
                    `}
                    aria-label={done ? (fr ? "Marquer comme non termine" : "Mark as incomplete") : (fr ? "Marquer comme termine" : "Mark as complete")}
                  >
                    {done && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  {isCurrent && (
                    <div className="absolute -top-2 -right-2 bg-[#D97706] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {fr ? "En cours" : "Current"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── THIS WEEK'S ASSIGNMENTS ─── */}
        <section>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#085041] to-[#1D9E75] px-6 py-4">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-white flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                {fr ? `Semaine ${currentWeek} : ${currentWeekData.titleFr}` : `Week ${currentWeek}: ${currentWeekData.titleEn}`}
              </h3>
              <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded ${levelColor(currentWeekData.level)}`}>
                {fr ? "Niveau" : "Level"} {currentWeekData.level}
              </span>
            </div>
            <div className="p-6">
              <h4 className="font-semibold text-gray-700 mb-3">
                {fr ? "Devoirs et exercices" : "Homework and exercises"}
              </h4>
              <ul className="space-y-3 mb-6">
                {weekAssignments.map((task, idx) => (
                  <li key={idx}>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={weekChecks[idx] || false}
                        onChange={() => toggleAssignment(currentWeek, idx)}
                        className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#1D9E75] focus:ring-[#1D9E75] accent-[#1D9E75]"
                      />
                      <span className={`text-sm transition-colors ${weekChecks[idx] ? "line-through text-gray-400" : "text-gray-700 group-hover:text-gray-900"}`}>
                        {task}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              {/* Links to exercises */}
              <div className="flex flex-wrap gap-2">
                {currentWeekData.links.map((link) => (
                  <Link
                    key={link}
                    href={link}
                    className="inline-flex items-center gap-1.5 text-sm bg-[#085041]/5 text-[#085041] hover:bg-[#085041]/10 rounded-lg px-3 py-1.5 transition-colors font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {link.split("/").pop()?.replace(/-/g, " ")}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── QUICK ACCESS GRID ─── */}
        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#085041] mb-1">
            {fr ? "Outils en ligne" : "Online Tools"}
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            {fr ? "Acces rapide aux modules complementaires en ligne." : "Quick access to complementary online modules."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_LINKS.map((ql) => {
              const Icon = ICON_MAP[ql.iconType];
              return (
                <Link
                  key={ql.href}
                  href={ql.href}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${ql.color}`}
                >
                  <Icon className="w-7 h-7" />
                  <span className="text-sm font-semibold leading-tight">{fr ? ql.labelFr : ql.labelEn}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── SCHEDULE + NCLC SIDE BY SIDE ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Weekly class schedule ── */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#085041] flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" />
              {fr ? "Horaire des cours" : "Class Schedule"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  {fr ? "Seance 1" : "Session 1"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={schedule.session1Day}
                    onChange={(e) => updateSchedule("session1Day", e.target.value)}
                    placeholder={fr ? "Jour" : "Day"}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                  />
                  <input
                    type="time"
                    value={schedule.session1Time}
                    onChange={(e) => updateSchedule("session1Time", e.target.value)}
                    className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  {fr ? "Seance 2" : "Session 2"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={schedule.session2Day}
                    onChange={(e) => updateSchedule("session2Day", e.target.value)}
                    placeholder={fr ? "Jour" : "Day"}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                  />
                  <input
                    type="time"
                    value={schedule.session2Time}
                    onChange={(e) => updateSchedule("session2Time", e.target.value)}
                    className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  {fr ? "Lieu" : "Location"}
                </label>
                <input
                  type="text"
                  value={schedule.location}
                  onChange={(e) => updateSchedule("location", e.target.value)}
                  placeholder={fr ? "Adresse ou nom de l'école" : "Address or school name"}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
                />
              </div>
            </div>
          </section>

          {/* ── NCLC Progress ── */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#085041] flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5" />
              {fr ? "Ma progression NCLC" : "My NCLC Progress"}
            </h3>

            {/* Visual level bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>NCLC 1</span>
                <span>NCLC 12</span>
              </div>
              <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                {/* Current level fill */}
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1D9E75] to-[#085041] rounded-full transition-all duration-500"
                  style={{ width: `${(estimatedNCLC / 12) * 100}%` }}
                />
                {/* Target marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-[#D97706]"
                  style={{ left: `${(ncicTarget / 12) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-semibold text-[#085041]">
                  {fr ? "Niveau estimé" : "Estimated level"}: NCLC {estimatedNCLC}
                </span>
                <span className="text-xs text-[#D97706] font-medium">
                  {fr ? "Cible" : "Target"}: NCLC {ncicTarget}
                </span>
              </div>
            </div>

            {/* Target selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                <Target className="w-3.5 h-3.5 inline mr-1" />
                {fr ? "Niveau cible" : "Target level"}
              </label>
              <select
                value={ncicTarget}
                onChange={(e) => updateTarget(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
              >
                {NCLC_LEVELS.map((l) => (
                  <option key={l} value={l}>NCLC {l}</option>
                ))}
              </select>
            </div>

            {/* Hours studied */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                {fr ? "Heures d'étude" : "Hours studied"}
              </label>
              <input
                type="number"
                min={0}
                value={hoursStudied}
                onChange={(e) => updateHours(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75]"
              />
            </div>

            {/* Estimated time to target */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <div className="font-medium text-amber-800">
                {estimatedNCLC >= ncicTarget ? (
                  <span className="text-[#1D9E75] font-bold">
                    {fr ? "Felicitations ! Tu as atteint ta cible !" : "Congratulations! You have reached your target!"}
                  </span>
                ) : (
                  <>
                    {fr ? "Temps estimé pour atteindre ta cible : " : "Estimated time to reach your target: "}
                    <span className="font-bold text-[#D97706]">~{hoursToTarget}h</span>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* ─── NOTES SECTION ─── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#085041] flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              {fr ? `Notes - Semaine ${currentWeek}` : `Notes - Week ${currentWeek}`}
            </h3>
            {showNotes ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {showNotes && (
            <div className="px-6 pb-6">
              <textarea
                value={notes[currentWeek] || ""}
                onChange={(e) => updateNotes(e.target.value)}
                placeholder={fr ? "Ecris tes notes de cours ici..." : "Write your class notes here..."}
                rows={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">
                {fr ? "Sauvegarde automatique." : "Automatically saved."}
              </p>
            </div>
          )}
        </section>

        {/* ─── ENCOURAGEMENT FOOTER ─── */}
        <div className="text-center py-6">
          <p className="text-[#085041] font-medium text-lg">
            {fr
              ? "Chaque effort compte. Tu es sur la bonne voie !"
              : "Every effort counts. You are on the right track!"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {fr
              ? `${completedWeeks.length}/16 semaines completees`
              : `${completedWeeks.length}/16 weeks completed`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Shell>
      <EleveDashboard />
    </Shell>
  );
}
