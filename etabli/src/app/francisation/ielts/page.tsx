"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import {
  Headphones,
  BookOpen,
  PenLine,
  Mic,
  Target,
  GraduationCap,
  ArrowRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Award,
  BarChart3,
  Globe,
  DollarSign,
  MapPin,
  FileText,
  Zap,
  BookText,
  Play,
} from "lucide-react";

function IELTSPreparation() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const modules = [
    {
      icon: Headphones,
      title: "Listening",
      titleFr: "Compréhension orale",
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200",
      details: fr
        ? "40 questions, 30 minutes + 10 min de transfert"
        : "40 questions, 30 minutes + 10 min transfer time",
      desc: fr
        ? "4 sections avec difficulté croissante : conversations quotidiennes, monologues, discussions académiques, conférences."
        : "4 sections with increasing difficulty: everyday conversations, monologues, academic discussions, lectures.",
    },
    {
      icon: BookOpen,
      title: "Reading",
      titleFr: "Compréhension écrite",
      color: "bg-emerald-50 text-emerald-600",
      borderColor: "border-emerald-200",
      details: fr
        ? "40 questions, 60 minutes (Academic vs General Training)"
        : "40 questions, 60 minutes (Academic vs General Training)",
      desc: fr
        ? "Academic : textes de revues, livres, journaux. General Training : avis, publicités, documents de travail, textes généraux."
        : "Academic: journal, book, newspaper texts. General Training: notices, ads, work documents, general texts.",
    },
    {
      icon: PenLine,
      title: "Writing",
      titleFr: "Expression écrite",
      color: "bg-amber-50 text-amber-600",
      borderColor: "border-amber-200",
      details: fr
        ? "2 tâches, 60 minutes (Tâche 1 : 150 mots, Tâche 2 : 250 mots)"
        : "2 tasks, 60 minutes (Task 1: 150 words, Task 2: 250 words)",
      desc: fr
        ? "Tâche 1 : décrire un graphique/processus. Tâche 2 : essai argumentatif. Évalué sur cohérence, vocabulaire, grammaire."
        : "Task 1: describe a graph/process. Task 2: argumentative essay. Scored on coherence, vocabulary, grammar.",
    },
    {
      icon: Mic,
      title: "Speaking",
      titleFr: "Expression orale",
      color: "bg-purple-50 text-purple-600",
      borderColor: "border-purple-200",
      details: fr
        ? "3 parties, 11-14 minutes (Entretien, Exposé, Discussion)"
        : "3 parts, 11-14 minutes (Interview, Long turn, Discussion)",
      desc: fr
        ? "Partie 1 : questions personnelles. Partie 2 : exposé de 2 min sur un sujet. Partie 3 : discussion approfondie."
        : "Part 1: personal questions. Part 2: 2-min talk on a topic. Part 3: in-depth discussion.",
    },
  ];

  const bandScores = [
    {
      clb: "CLB 4",
      ielts: "4.0 - 4.5",
      desc: fr
        ? "Minimum pour certains programmes provinciaux"
        : "Minimum for some provincial programs",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    {
      clb: "CLB 5",
      ielts: "5.0",
      desc: fr
        ? "Minimum pour la Catégorie de l'expérience canadienne (CEC)"
        : "Minimum for Canadian Experience Class (CEC)",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    {
      clb: "CLB 7",
      ielts: "6.0",
      desc: fr
        ? "Requis pour le Programme des travailleurs qualifiés (fédéral) + bonus CRS"
        : "Required for Federal Skilled Worker + CRS bonus",
      color: "text-[#1D9E75]",
      bg: "bg-[#E1F5EE]",
      border: "border-[#1D9E75]/30",
    },
    {
      clb: "CLB 9",
      ielts: "7.0",
      desc: fr
        ? "Bonus CRS maximum : +50 points au classement"
        : "Maximum CRS bonus: +50 ranking points",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      clb: "CLB 10+",
      ielts: "8.0 - 9.0",
      desc: fr
        ? "Score le plus élevé possible — maîtrise complète"
        : "Highest possible score — complete mastery",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  ];

  const practiceModules = [
    {
      icon: Headphones,
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200",
      title: fr ? "Pratique d'écoute" : "Listening Practice",
      desc: fr
        ? "Exercices thématiques sur l'établissement : logement, emploi, services communautaires, vie quotidienne au Canada."
        : "Settlement-themed exercises: housing, employment, community services, daily life in Canada.",
      tag: fr ? "4 sections" : "4 sections",
    },
    {
      icon: BookOpen,
      color: "bg-emerald-50 text-emerald-600",
      borderColor: "border-emerald-200",
      title: fr ? "Pratique de lecture" : "Reading Practice",
      desc: fr
        ? "Textes Academic et General Training : articles, graphiques, publicités, documents administratifs canadiens."
        : "Academic and General Training texts: articles, charts, ads, Canadian administrative documents.",
      tag: "Academic + GT",
    },
    {
      icon: PenLine,
      color: "bg-amber-50 text-amber-600",
      borderColor: "border-amber-200",
      title: fr ? "Pratique d'écriture" : "Writing Task 1 & 2 Practice",
      desc: fr
        ? "Tâche 1 : graphiques, tableaux, processus. Tâche 2 : essais argumentatifs sur des thèmes d'immigration et société."
        : "Task 1: graphs, tables, processes. Task 2: argumentative essays on immigration and society themes.",
      tag: fr ? "2 tâches" : "2 tasks",
    },
    {
      icon: Mic,
      color: "bg-purple-50 text-purple-600",
      borderColor: "border-purple-200",
      title: fr ? "Test oral simulé" : "Speaking Mock Test",
      desc: fr
        ? "Simulation des 3 parties avec chronomètre : entretien, exposé long, discussion. Thèmes liés à l'établissement."
        : "Simulation of all 3 parts with timer: interview, long turn, discussion. Settlement-related themes.",
      tag: fr ? "11-14 min" : "11-14 min",
    },
    {
      icon: Target,
      color: "bg-teal-50 text-teal-600",
      borderColor: "border-teal-200",
      title: fr ? "Examen blanc complet" : "Full Mock Test",
      desc: fr
        ? "Simulation complète en conditions d'examen : chronomètre, 4 modules, score estimé avec équivalence CLB."
        : "Complete simulation under exam conditions: timer, 4 modules, estimated score with CLB equivalence.",
      tag: fr ? "2h45 min" : "2h45 min",
    },
    {
      icon: BookText,
      color: "bg-rose-50 text-rose-600",
      borderColor: "border-rose-200",
      title: fr ? "Vocabulaire académique" : "Vocabulary Builder",
      desc: fr
        ? "Liste de mots académiques IELTS (AWL), collocations fréquentes, expressions idiomatiques pour un score Band 7+."
        : "IELTS Academic Word List (AWL), frequent collocations, idiomatic expressions for Band 7+ score.",
      tag: "AWL",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#085041] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={24} />
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                {fr ? "Préparation IELTS" : "IELTS Preparation"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-heading)] leading-tight mb-4">
              {fr
                ? "Préparation IELTS pour l'immigration"
                : "IELTS Preparation for Immigration"}
            </h1>
            <p className="text-lg text-white/80 mb-6 leading-relaxed">
              {fr
                ? "L'IELTS est l'examen d'anglais le plus reconnu pour l'immigration au Canada. Un score élevé augmente vos points CRS pour l'Entrée express, les programmes provinciaux et la citoyenneté. CLB 9 (IELTS 7.0) = jusqu'à +50 points CRS."
                : "IELTS is the most recognized English exam for Canadian immigration. A high score boosts your CRS points for Express Entry, Provincial Nominee Programs and citizenship. CLB 9 (IELTS 7.0) = up to +50 CRS points."}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
                <TrendingUp size={16} />
                <span>{fr ? "Boost CRS +50 pts" : "CRS Boost +50 pts"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
                <Globe size={16} />
                <span>{fr ? "Entrée express" : "Express Entry"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
                <Award size={16} />
                <span>{fr ? "Programmes provinciaux" : "Provincial Programs"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl">
                <FileText size={16} />
                <span>{fr ? "4 modules" : "4 modules"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IELTS Format Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
              {fr ? "Format de l'examen IELTS" : "IELTS Exam Format"}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {fr
                ? "L'IELTS General Training est requis pour l'immigration canadienne. 4 modules évaluent vos compétences en anglais."
                : "IELTS General Training is required for Canadian immigration. 4 modules assess your English skills."}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((mod, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-6 border ${mod.borderColor} hover:shadow-lg transition-all`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${mod.color}`}
                >
                  <mod.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {fr ? mod.titleFr : mod.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-[#1D9E75] font-semibold mb-3">
                  <Clock size={12} />
                  {mod.details}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Band Score Reference for Immigration */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2 text-center">
            {fr
              ? "Équivalence IELTS — CLB pour l'immigration"
              : "IELTS — CLB Equivalence for Immigration"}
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8 max-w-2xl mx-auto">
            {fr
              ? "Les Canadian Language Benchmarks (CLB) déterminent vos points CRS. Voici les correspondances avec les scores IELTS."
              : "Canadian Language Benchmarks (CLB) determine your CRS points. Here are the IELTS score equivalences."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {bandScores.map((bs, i) => (
              <div
                key={i}
                className={`${bs.bg} rounded-xl p-5 border-2 ${bs.border} text-center`}
              >
                <div
                  className={`text-xl font-bold font-[family-name:var(--font-heading)] ${bs.color}`}
                >
                  {bs.clb}
                </div>
                <div className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] my-2">
                  {bs.ielts}
                </div>
                <div className="text-xs text-gray-600 leading-snug">{bs.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {fr
                ? "Objectif recommandé : CLB 9 (IELTS 7.0) pour le bonus CRS maximum de +50 points"
                : "Recommended target: CLB 9 (IELTS 7.0) for the maximum CRS bonus of +50 points"}
            </p>
          </div>
        </div>
      </section>

      {/* Why IELTS Matters Banner */}
      <section className="bg-[#FEF3C7] border-b border-[#D97706]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-[#D97706]" />
              <span className="font-bold text-[#92400E]">
                {fr ? "Pourquoi l'IELTS est crucial" : "Why IELTS matters"}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-[#92400E]">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} /> CLB 9 = +50 pts CRS
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} />{" "}
                {fr ? "Requis Entrée express" : "Required Express Entry"}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} />{" "}
                {fr ? "Programmes provinciaux (PNP)" : "Provincial Nominee Programs (PNP)"}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} />{" "}
                {fr ? "Citoyenneté canadienne" : "Canadian citizenship"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Modules */}
      <section className="py-16 bg-[#F0FAF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
              {fr ? "Modules de pratique" : "Practice Modules"}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {fr
                ? "Entraînez-vous par module ou passez un examen blanc complet. Thèmes adaptés à l'immigration et l'établissement au Canada."
                : "Practice by module or take a full mock test. Themes adapted to immigration and settlement in Canada."}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {practiceModules.map((mod, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-5 border ${mod.borderColor} hover:shadow-lg transition-all group cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${mod.color}`}
                  >
                    <mod.icon size={20} />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#1D9E75]">
                    {mod.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1">
                  {mod.title}
                  <ChevronRight
                    size={14}
                    className="text-gray-300 group-hover:text-[#1D9E75] transition-colors"
                  />
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Test Info Section — Two Columns */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-6 text-center">
            {fr
              ? "Informations sur l'examen IELTS"
              : "IELTS Exam Information"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Academic */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold text-[#085041] font-[family-name:var(--font-heading)]">
                  IELTS Academic
                </span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                  {fr ? "Études postsecondaires" : "Post-secondary studies"}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <DollarSign size={18} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fr ? "Coût" : "Cost"}
                    </div>
                    <div className="text-xs text-gray-500">~309 $ CAD</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin size={18} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fr ? "Centres d'examen" : "Test Centres"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fr
                        ? "Toronto, Vancouver, Montréal, Calgary, Ottawa, Edmonton"
                        : "Toronto, Vancouver, Montreal, Calgary, Ottawa, Edmonton"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Target size={18} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fr ? "Utilisation" : "Purpose"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fr
                        ? "Admission universitaire, programmes professionnels, certains PNP"
                        : "University admission, professional programs, some PNPs"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Clock size={18} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fr ? "Durée totale" : "Total Duration"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fr ? "2 heures 45 minutes" : "2 hours 45 minutes"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* General Training */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#1D9E75]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold text-[#085041] font-[family-name:var(--font-heading)]">
                  IELTS General Training
                </span>
                <span className="text-xs bg-[#E1F5EE] px-2 py-0.5 rounded text-[#1D9E75] font-semibold">
                  {fr ? "Requis pour l'immigration" : "Required for immigration"}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <DollarSign size={18} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fr ? "Coût" : "Cost"}
                    </div>
                    <div className="text-xs text-gray-500">~309 $ CAD</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin size={18} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fr ? "Centres d'examen" : "Test Centres"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fr
                        ? "Toronto, Vancouver, Montréal, Calgary, Ottawa, Edmonton"
                        : "Toronto, Vancouver, Montreal, Calgary, Ottawa, Edmonton"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Globe size={18} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fr ? "Utilisation" : "Purpose"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fr
                        ? "Entrée express, PNP, parrainage, citoyenneté canadienne"
                        : "Express Entry, PNP, sponsorship, Canadian citizenship"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <BarChart3 size={18} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {fr ? "Score accepté" : "Accepted Score"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fr
                        ? "Valide 2 ans — soumis via le profil Entrée express"
                        : "Valid 2 years — submitted via Express Entry profile"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#085041] to-[#0a6350]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            {fr
              ? "Prêt à obtenir votre score IELTS cible?"
              : "Ready to achieve your target IELTS score?"}
          </h2>
          <p className="text-white/70 mb-8">
            {fr
              ? "Le plan Premium d'etabli inclut la préparation IELTS complète : examens blancs, exercices par module et suivi de progression."
              : "The etabli Premium plan includes full IELTS preparation: mock exams, module exercises and progress tracking."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tarifs"
              className="px-6 py-3 bg-[#1D9E75] text-white font-semibold rounded-xl hover:bg-[#178a65] transition-all shadow-lg inline-flex items-center gap-2"
            >
              {fr ? "Voir le plan Premium" : "See Premium Plan"}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/francisation"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              {fr ? "Retour Francisation" : "Back to French"}
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
      <IELTSPreparation />
    </Shell>
  );
}
