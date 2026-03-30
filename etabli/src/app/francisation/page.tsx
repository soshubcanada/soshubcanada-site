"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { useState } from "react";
import AnimateIn from "@/components/AnimateIn";
import { useProgress, getXPForNextLevel, BADGES } from "@/lib/learning-system";
import {
  Headphones,
  BookOpen,
  PenLine,
  Mic,
  BookText,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Clock,
  Target,
  Star,
  CheckCircle2,
  ChevronRight,
  Zap,
  Flame,
  Trophy,
  Puzzle,
  Volume2,
  Dumbbell,
  Brain,
  ClipboardCheck,
  Baby,
  Map,
  PenTool,
  MessageCircle,
  GraduationCap as GradCap2,
  BarChart3,
} from "lucide-react";

function FrancisationHub() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const { progress } = useProgress();
  const [selectedLevel, setSelectedLevel] = useState<string>("B1");
  const xpInfo = getXPForNextLevel(progress.xp);
  const earnedBadges = BADGES.filter((b) => progress.badges.includes(b.id));

  const newTools = [
    {
      icon: Puzzle, color: "bg-teal-50 text-teal-600", borderColor: "border-teal-200",
      href: "/francisation/grammaire",
      title: fr ? "Leçons de grammaire" : "Grammar Lessons",
      desc: fr ? "5 leçons avec théorie + exercices pratiques: articles, négation, passé composé, conditionnel, subjonctif." : "5 lessons with theory + practice: articles, negation, passé composé, conditional, subjunctive.",
      tag: fr ? "Nouveau" : "New",
    },
    {
      icon: Dumbbell, color: "bg-orange-50 text-orange-600", borderColor: "border-orange-200",
      href: "/francisation/exercices",
      title: fr ? "Exercices interactifs" : "Interactive Exercises",
      desc: fr ? "Textes à trous, paires à associer, remise en ordre de mots. 3 modes d'exercices." : "Fill-in-the-blank, matching pairs, word ordering. 3 exercise modes.",
      tag: fr ? "Nouveau" : "New",
    },
    {
      icon: Zap, color: "bg-yellow-50 text-yellow-600", borderColor: "border-yellow-200",
      href: "/francisation/pratique-rapide",
      title: fr ? "Pratique rapide (5 min)" : "Quick Practice (5 min)",
      desc: fr ? "Sessions quotidiennes de 5 minutes mélangeant tous les types d'exercices. Idéal pour garder ta série." : "5-minute daily sessions mixing all exercise types. Perfect for keeping your streak.",
      tag: fr ? "Quotidien" : "Daily",
    },
    {
      icon: Volume2, color: "bg-pink-50 text-pink-600", borderColor: "border-pink-200",
      href: "/francisation/prononciation",
      title: fr ? "Guide de prononciation" : "Pronunciation Guide",
      desc: fr ? "Voyelles nasales, le R français, le U, les liaisons + particularités québécoises avec phonétique IPA." : "Nasal vowels, French R, the U, liaisons + Québec features with IPA phonetics.",
      tag: "IPA",
    },
    {
      icon: Brain, color: "bg-violet-50 text-violet-600", borderColor: "border-violet-200",
      href: "/francisation/revision",
      title: fr ? "Révision espacée (Leitner)" : "Spaced Review (Leitner)",
      desc: fr ? "Système de répétition espacée scientifique. 5 boîtes Leitner : les cartes maîtrisées sont révisées moins souvent." : "Scientific spaced repetition system. 5 Leitner boxes: mastered cards are reviewed less often.",
      tag: "SRS",
    },
    {
      icon: ClipboardCheck, color: "bg-sky-50 text-sky-600", borderColor: "border-sky-200",
      href: "/francisation/auto-evaluation",
      title: fr ? "Auto-évaluation CECR" : "CEFR Self-Assessment",
      desc: fr ? "Évaluez votre niveau avec les descripteurs officiels du CECR. Recommandations personnalisées pour votre programme d'immigration." : "Assess your level with official CEFR descriptors. Personalized recommendations for your immigration program.",
      tag: "CECR",
    },
    {
      icon: BarChart3, color: "bg-teal-50 text-teal-600", borderColor: "border-teal-200",
      href: "/francisation/tableau-de-bord",
      title: fr ? "Tableau de bord" : "Progress Dashboard",
      desc: fr ? "Suivez votre progression : série, XP, compétences, objectifs hebdomadaires, calendrier d'activité et préparation aux examens." : "Track your progress: streak, XP, skills, weekly goals, activity calendar and exam readiness.",
      tag: fr ? "Progression" : "Progress",
    },
    {
      icon: Target, color: "bg-violet-50 text-violet-600", borderColor: "border-violet-200",
      href: "/francisation/placement",
      title: fr ? "Test de placement" : "Placement Test",
      desc: fr ? "Évaluez votre niveau actuel en 20 questions, recevez un plan d'étude personnalisé aligné sur votre programme d'immigration." : "Assess your current level in 20 questions, receive a personalized study plan aligned with your immigration program.",
      tag: fr ? "Nouveau" : "New",
    },
    {
      icon: Baby, color: "bg-lime-50 text-lime-600", borderColor: "border-lime-200",
      href: "/francisation/debutant",
      title: fr ? "Débutant (A1)" : "Beginner (A1)",
      desc: fr ? "20 exercices pour les débutants absolus: salutations, chiffres, lieux, besoins de base, formulaires, urgences." : "20 exercises for absolute beginners: greetings, numbers, places, basic needs, forms, emergencies.",
      tag: "A1",
    },
    {
      icon: Map, color: "bg-indigo-50 text-indigo-600", borderColor: "border-indigo-200",
      href: "/francisation/parcours",
      title: fr ? "Parcours immigration" : "Immigration Paths",
      desc: fr ? "Plans d'étude personnalisés: PSTQ, Entrée Express, CAQ, Citoyennete. Jalons NCLC et conseils d'experts." : "Personalized study plans: PSTQ, Express Entry, CAQ, Citizenship. NCLC milestones and expert tips.",
      tag: fr ? "Parcours" : "Paths",
    },
    {
      icon: PenTool, color: "bg-cyan-50 text-cyan-600", borderColor: "border-cyan-200",
      href: "/francisation/dictee",
      title: fr ? "Dictée" : "Dictation",
      desc: fr ? "Exercices de dictée A1 à C1. Écoutez mot par mot, écrivez, vérifiez l'orthographe et la grammaire." : "Dictation exercises A1 to C1. Listen word by word, write, check spelling and grammar.",
      tag: fr ? "Écriture" : "Writing",
    },
    {
      icon: MessageCircle, color: "bg-rose-50 text-rose-600", borderColor: "border-rose-200",
      href: "/francisation/assistant",
      title: fr ? "Assistant IA" : "AI Assistant",
      desc: fr ? "Obtenez des corrections grammaticales, des explications, un plan d'étude personnalise et des conseils sur le français québécois." : "Get grammar corrections, explanations, a personalized study plan, and Québec French tips.",
      tag: "AI",
    },
    {
      icon: GradCap2, color: "bg-amber-50 text-amber-600", borderColor: "border-amber-200",
      href: "/formation/eleve",
      title: fr ? "Formation en classe" : "In-Class Training",
      desc: fr ? "Espace étudiant pour la formation en présentiel: suivi de progression, devoirs, notes de cours et calendrier." : "Student space for in-person training: progress tracking, homework, class notes, and schedule.",
      tag: fr ? "Présentiel" : "In-person",
    },
  ];

  const skills = [
    {
      icon: Headphones, color: "bg-blue-50 text-blue-600", borderColor: "border-blue-200",
      href: "/francisation/comprehension-orale",
      title: fr ? "Compréhension orale (CO)" : "Listening Comprehension (CO)",
      desc: fr ? "Écoutez des dialogues, annonces et conversations réelles du quotidien québécois. Format TCF: 39 questions." : "Listen to real Québec daily dialogues, announcements and conversations. TCF format: 39 questions.",
      questions: fr ? "12 exercices" : "12 exercises",
      exam: "TCF: 39 Q / 35 min — TEF: 60 Q / 40 min",
    },
    {
      icon: BookOpen, color: "bg-emerald-50 text-emerald-600", borderColor: "border-emerald-200",
      href: "/francisation/comprehension-ecrite",
      title: fr ? "Compréhension écrite (CE)" : "Reading Comprehension (CE)",
      desc: fr ? "Lisez des textes réels: avis de logement, offres d'emploi, articles de presse, documents administratifs." : "Read real texts: housing notices, job postings, news articles, administrative documents.",
      questions: fr ? "10 exercices" : "10 exercises",
      exam: "TCF: 39 Q / 60 min — TEF: 50 Q / 60 min",
    },
    {
      icon: PenLine, color: "bg-amber-50 text-amber-600", borderColor: "border-amber-200",
      href: "/francisation/expression-ecrite",
      title: fr ? "Expression écrite (EE)" : "Written Expression (EE)",
      desc: fr ? "Rédigez des courriels, lettres, articles et textes argumentatifs sur des thèmes d'établissement." : "Write emails, letters, articles and argumentative texts on settlement themes.",
      questions: fr ? "8 exercices" : "8 exercises",
      exam: "TCF: 3 tâches / 60 min — TEF: 2 sections / 60 min",
    },
    {
      icon: Mic, color: "bg-purple-50 text-purple-600", borderColor: "border-purple-200",
      href: "/francisation/expression-orale",
      title: fr ? "Expression orale (EO)" : "Oral Expression (EO)",
      desc: fr ? "Entraînez-vous aux entretiens, interactions et débats. Thèmes liés à l'immigration et l'établissement." : "Practice interviews, interactions and debates. Themes related to immigration and settlement.",
      questions: fr ? "7 exercices" : "7 exercises",
      exam: "TCF: 3 tâches / 12 min — TEF: 2 sections / 15 min",
    },
    {
      icon: BookText, color: "bg-rose-50 text-rose-600", borderColor: "border-rose-200",
      href: "/francisation/vocabulaire",
      title: fr ? "Vocabulaire d'établissement" : "Settlement Vocabulary",
      desc: fr ? "Apprenez le vocabulaire essentiel: logement, emploi, administration, santé, immigration. Pas générique." : "Learn essential vocabulary: housing, employment, administration, health, immigration. Not generic.",
      questions: fr ? "40+ mots clés" : "40+ key words",
      exam: fr ? "Flashcards + quiz par catégorie" : "Flashcards + quiz by category",
    },
    {
      icon: GraduationCap, color: "bg-indigo-50 text-indigo-600", borderColor: "border-indigo-200",
      href: "/francisation/examen-blanc",
      title: fr ? "Examen blanc TCF/TEF" : "TCF/TEF Mock Exam",
      desc: fr ? "Simulation complète d'examen en conditions réelles: chronomètre, nombre de questions, format officiel." : "Complete exam simulation under real conditions: timer, question count, official format.",
      questions: fr ? "Simulation complète" : "Full simulation",
      exam: fr ? "TCF Canada ou TEF Canada" : "TCF Canada or TEF Canada",
    },
  ];

  const nclcLevels = [
    { nclc: "NCLC 4", cecr: "A2", desc: fr ? "Minimum CAQ après 3 ans" : "Minimum CAQ after 3 years", color: "text-orange-600" },
    { nclc: "NCLC 5", cecr: "B1", desc: fr ? "Intermédiaire — base fonctionnelle" : "Intermediate — functional base", color: "text-yellow-600" },
    { nclc: "NCLC 7", cecr: "B2", desc: fr ? "Requis PSTQ + 50 pts CRS bonus" : "Required PSTQ + 50 CRS bonus pts", color: "text-[#1D9E75]" },
    { nclc: "NCLC 9", cecr: "C1", desc: fr ? "Avancé — bonus CRS maximum" : "Advanced — maximum CRS bonus", color: "text-blue-600" },
    { nclc: "NCLC 10+", cecr: "C2", desc: fr ? "Maîtrise complète" : "Complete mastery", color: "text-purple-600" },
  ];

  const tcfPrograms = [
    { name: fr ? "Intensif 4 sem." : "Intensive 4 wks", price: "499$", desc: fr ? "16 sessions live Zoom, mini-groupes 3-6" : "16 live Zoom sessions, mini-groups 3-6", note: fr ? "Inclus dans etabli Premium" : "Included in etabli Premium", highlighted: true },
    { name: fr ? "Standard 8 sem." : "Standard 8 wks", price: "799$", desc: fr ? "Programme complet A2 → B2, 16 sessions + exercices AI" : "Complete A2 → B2 program, 16 sessions + AI exercises", note: null, highlighted: false },
    { name: fr ? "Hybride Québec" : "Hybrid Québec", price: "1 199$", desc: fr ? "Online + 2 samedis presentiel MTL" : "Online + 2 in-person Saturdays MTL", note: null, highlighted: false },
    { name: fr ? "Hybride Canada" : "Hybrid Canada", price: "1 499$", desc: fr ? "4 épreuves + 4 samedis + garantie réussite" : "4 tests + 4 Saturdays + success guarantee", note: fr ? "Garantie réussite" : "Success guarantee", highlighted: false },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#085041] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🗣️</span>
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                {fr ? "Francisation + Préparation TCF/TEF" : "French + TCF/TEF Preparation"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-4">
              {fr ? "Maîtrise le français. Réussis ton examen. Obtiens tes points." : "Master French. Pass your exam. Get your points."}
            </h1>
            <p className="text-lg text-white/80 mb-6 leading-relaxed">
              {fr
                ? "Le français est LE facteur déterminant pour l'immigration au Québec. NCLC 7 = jusqu'à 50 points CRS bonus + requis pour le PSTQ. Nos exercices utilisent du vocabulaire réel d'établissement, pas du contenu générique."
                : "French is THE determining factor for Québec immigration. NCLC 7 = up to 50 CRS bonus points + required for PSTQ. Our exercises use real settlement vocabulary, not generic content."}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
                <Target size={16} />
                <span>{fr ? "4 compétences TCF/TEF" : "4 TCF/TEF skills"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
                <BookText size={16} />
                <span>{fr ? "Vocabulaire d'établissement" : "Settlement vocabulary"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
                <GraduationCap size={16} />
                <span>{fr ? "Examens blancs complets" : "Full mock exams"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
                <TrendingUp size={16} />
                <span>{fr ? "Niveaux A2 → C1" : "Levels A2 → C1"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Dashboard */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Level & XP */}
            <div className="col-span-2 bg-gradient-to-br from-[#E1F5EE] to-[#F0FAF5] rounded-2xl p-5 border border-[#1D9E75]/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-xl font-bold font-[family-name:var(--font-heading)]">
                  {progress.level}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{fr ? "Niveau" : "Level"} {progress.level}</div>
                  <div className="text-xs text-gray-500">{progress.xp} XP {fr ? "au total" : "total"}</div>
                </div>
              </div>
              <div className="w-full bg-[#1D9E75]/20 rounded-full h-2.5">
                <div className="bg-[#1D9E75] h-2.5 rounded-full transition-all" style={{ width: `${Math.min(xpInfo.progress, 100)}%` }} />
              </div>
              <div className="text-xs text-gray-400 mt-1">{xpInfo.current} / {xpInfo.needed} XP</div>
            </div>
            {/* Streak */}
            <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200 flex flex-col items-center justify-center text-center">
              <Flame size={24} className="text-orange-500 mb-1" />
              <div className="text-2xl font-bold text-orange-600 font-[family-name:var(--font-heading)]">{progress.streak}</div>
              <div className="text-xs text-orange-500">{fr ? "jours de suite" : "day streak"}</div>
            </div>
            {/* Daily Goal */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 flex flex-col items-center justify-center text-center">
              <Target size={24} className="text-blue-500 mb-1" />
              <div className="text-2xl font-bold text-blue-600 font-[family-name:var(--font-heading)]">{progress.dailyXP}/{progress.dailyGoal}</div>
              <div className="text-xs text-blue-500">XP {fr ? "aujourd'hui" : "today"}</div>
            </div>
            {/* Badges */}
            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200 flex flex-col items-center justify-center text-center">
              <Trophy size={24} className="text-purple-500 mb-1" />
              <div className="text-2xl font-bold text-purple-600 font-[family-name:var(--font-heading)]">{earnedBadges.length}/{BADGES.length}</div>
              <div className="text-xs text-purple-500">{fr ? "badges gagnes" : "badges earned"}</div>
            </div>
          </div>
          {/* Badge row */}
          {earnedBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {earnedBadges.map((b) => (
                <span key={b.id} className="text-sm bg-white border border-gray-200 px-3 py-1 rounded-full" title={fr ? b.descFr : b.descEn}>
                  {b.icon} {fr ? b.nameFr : b.nameEn}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Learning Tools */}
      <section className="py-12 bg-[#F0FAF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
              {fr ? "Outils d'apprentissage" : "Learning Tools"}
            </h2>
            <p className="text-sm text-gray-500">{fr ? "Gamification, exercices interactifs et pratique quotidienne" : "Gamification, interactive exercises and daily practice"}</p>
          </div>
          </AnimateIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newTools.map((tool, i) => (
              <AnimateIn key={i} delay={i * 80}>
              <Link href={tool.href}
                className={`bg-white rounded-2xl p-5 border ${tool.borderColor} hover:shadow-lg transition-all group card-hover block`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.color}`}>
                    <tool.icon size={20} />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#1D9E75]">{tool.tag}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1">
                  {tool.title}
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-[#1D9E75] transition-colors" />
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
              </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* NCLC Importance Banner */}
      <section className="bg-[#FEF3C7] border-b border-[#D97706]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <span className="font-bold text-[#92400E]">{fr ? "Pourquoi le français est crucial" : "Why French is crucial"}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-[#92400E]">
              <span className="flex items-center gap-1"><CheckCircle2 size={14} /> NCLC 7 = +50 pts CRS</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} /> {fr ? "Requis PSTQ (Arrima)" : "Required PSTQ (Arrima)"}</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} /> {fr ? "NCLC 4 = CAQ apres 3 ans" : "NCLC 4 = CAQ after 3 years"}</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} /> {fr ? "Tirages francophones CRS 380-420" : "Francophone CRS draws 380-420"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* NCLC Reference */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn>
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-6 text-center">
            {fr ? "Échelle NCLC — Quel niveau viser?" : "NCLC Scale — What level to target?"}
          </h2>
          </AnimateIn>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {nclcLevels.map((lvl, i) => (
              <button key={i} onClick={() => setSelectedLevel(lvl.cecr)}
                className={`rounded-xl p-4 border-2 text-center transition-all ${selectedLevel === lvl.cecr ? "border-[#1D9E75] bg-white shadow-md" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                <div className={`text-xl font-bold font-[family-name:var(--font-heading)] ${lvl.color}`}>{lvl.nclc}</div>
                <div className="text-xs text-gray-400 mt-0.5">{lvl.cecr}</div>
                <div className="text-xs text-gray-600 mt-2 leading-snug">{lvl.desc}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {fr
                ? "🎯 Objectif recommandé: NCLC 7 (B2) — requis pour le PSTQ et donne les meilleurs bonus CRS"
                : "🎯 Recommended target: NCLC 7 (B2) — required for PSTQ and gives the best CRS bonus"}
            </p>
          </div>
        </div>
      </section>

      {/* Skills Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
              {fr ? "Entraîne-toi par compétence" : "Practice by skill"}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {fr
                ? "Chaque module suit le format officiel des examens TCF Canada et TEF Canada. Vocabulaire tiré de situations réelles d'établissement au Québec."
                : "Each module follows the official TCF Canada and TEF Canada exam format. Vocabulary drawn from real Québec settlement situations."}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map((skill, i) => (
              <AnimateIn key={i} delay={i * 100}>
              <Link href={skill.href}
                className={`bg-white rounded-2xl p-6 border ${skill.borderColor} hover:shadow-lg transition-all group card-hover block`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${skill.color}`}>
                  <skill.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {skill.title}
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1D9E75] transition-colors" />
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{skill.desc}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{skill.questions}</span>
                  <span className="text-gray-400 bg-gray-50 px-2 py-1 rounded">{skill.exam}</span>
                </div>
              </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* TCF/TEF Programs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
              {fr ? "Programmes de préparation TCF/TEF" : "TCF/TEF Prep Programs"}
            </h2>
            <p className="text-gray-500">
              {fr ? "Cours live Zoom + exercices AI + vocabulaire d'établissement" : "Live Zoom classes + AI exercises + settlement vocabulary"}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tcfPrograms.map((prog, i) => (
              <AnimateIn key={i} delay={i * 100}>
              <div className={`bg-white rounded-2xl p-5 border-2 ${prog.highlighted ? "border-[#1D9E75]" : "border-gray-200"}`}>
                {prog.note && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mb-3 inline-block ${prog.highlighted ? "bg-[#E1F5EE] text-[#1D9E75]" : "bg-amber-50 text-amber-700"}`}>
                    {prog.note}
                  </span>
                )}
                <div className="text-sm font-semibold text-gray-900">{prog.name}</div>
                <div className="text-3xl font-bold text-[#1D9E75] font-[family-name:var(--font-heading)] my-2">{prog.price}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{prog.desc}</p>
              </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Format Reference */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-6 text-center">
            {fr ? "Format des examens TCF et TEF" : "TCF and TEF Exam Format"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* TCF */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold text-[#085041] font-[family-name:var(--font-heading)]">TCF Canada</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">France Education international</span>
              </div>
              <div className="space-y-3">
                {[
                  { skill: "CO", name: fr ? "Compréhension orale" : "Listening", detail: "39 questions — 35 min", icon: "🎧" },
                  { skill: "CE", name: fr ? "Compréhension écrite" : "Reading", detail: "39 questions — 60 min", icon: "📖" },
                  { skill: "EO", name: fr ? "Expression orale" : "Speaking", detail: fr ? "3 tâches — 12 min" : "3 tasks — 12 min", icon: "🎤" },
                  { skill: "EE", name: fr ? "Expression écrite" : "Writing", detail: fr ? "3 tâches — 60 min" : "3 tasks — 60 min", icon: "✍️" },
                ].map((e, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-lg">{e.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{e.name}</div>
                      <div className="text-xs text-gray-500">{e.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-400">
                {fr ? "Coût: ~300-400$ CAD — Centres d'examen à Montréal, Québec, Ottawa" : "Cost: ~$300-400 CAD — Exam centres in Montreal, Québec, Ottawa"}
              </div>
            </div>
            {/* TEF */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold text-[#085041] font-[family-name:var(--font-heading)]">TEF Canada</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">CCI Paris Ile-de-France</span>
              </div>
              <div className="space-y-3">
                {[
                  { skill: "CO", name: fr ? "Compréhension orale" : "Listening", detail: "60 questions — 40 min", icon: "🎧" },
                  { skill: "CE", name: fr ? "Compréhension écrite" : "Reading", detail: "50 questions — 60 min", icon: "📖" },
                  { skill: "EO", name: fr ? "Expression orale" : "Speaking", detail: fr ? "2 sections — 15 min" : "2 sections — 15 min", icon: "🎤" },
                  { skill: "EE", name: fr ? "Expression écrite" : "Writing", detail: fr ? "2 sections — 60 min" : "2 sections — 60 min", icon: "✍️" },
                ].map((e, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-lg">{e.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{e.name}</div>
                      <div className="text-xs text-gray-500">{e.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-400">
                {fr ? "Coût: ~350-450$ CAD — Centres d'examen McGill, Alliance Française, etc." : "Cost: ~$350-450 CAD — Exam centres McGill, Alliance Française, etc."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#085041] to-[#0a6350]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            {fr ? "Prêt à améliorer ton français?" : "Ready to improve your French?"}
          </h2>
          <p className="text-white/70 mb-8">
            {fr
              ? "Commence avec les exercices gratuits, puis passe au plan Standard ou Premium pour un accès illimité + cours live TCF/TEF."
              : "Start with free exercises, then upgrade to Standard or Premium for unlimited access + live TCF/TEF classes."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/francisation/comprehension-orale"
              className="px-6 py-3 bg-[#1D9E75] text-white font-semibold rounded-xl hover:bg-[#178a65] transition-all shadow-lg inline-flex items-center gap-2">
              {fr ? "Commencer les exercices" : "Start exercises"}
              <ArrowRight size={16} />
            </Link>
            <Link href="/tarifs"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all">
              {fr ? "Voir les plans" : "See plans"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return <Shell><FrancisationHub /></Shell>;
}
