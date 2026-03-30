"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { useState } from "react";
import {
  Home,
  Briefcase,
  Languages,
  ClipboardList,
  Snowflake,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Bot,
} from "lucide-react";

type Pillar = {
  id: number;
  icon: typeof Home;
  colorText: string;
  colorBg: string;
  colorBorder: string;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  itemsFr: string[];
  itemsEn: string[];
  aiFr: string[];
  aiEn: string[];
  note?: { fr: string; en: string };
  links?: { label: string; href: string }[];
};

const pillars: Pillar[] = [
  {
    id: 1,
    icon: Home,
    colorText: "text-blue-600",
    colorBg: "bg-blue-50",
    colorBorder: "border-blue-200",
    titleFr: "Logement",
    titleEn: "Housing",
    descFr:
      "Guide locataire, droits TAL, quartiers Montreal, alertes arnaques et checklist déménagement.",
    descEn:
      "Tenant guide, TAL rights, Montreal neighborhoods, scam alerts, and move-in checklist.",
    itemsFr: [
      "Guide locataire Québec, droits TAL, modèles de bail",
      "Quartiers Montreal (analyse AI : prix, transport, sécurité, communautés)",
      "Calcul budget logement AI",
      "Alertes arnaques Kijiji / Marketplace",
      "Checklist emmenagement",
    ],
    itemsEn: [
      "Québec tenant guide, TAL rights, lease templates",
      "Montreal neighborhoods (AI analysis: prices, transit, safety, communities)",
      "AI housing budget calculator",
      "Kijiji / Marketplace scam alerts",
      "Move-in checklist",
    ],
    aiFr: [
      "Analyse quartiers personnalisee",
      "Calcul budget intelligent",
      "Detection arnaques automatique",
    ],
    aiEn: [
      "Personalized neighborhood analysis",
      "Smart budget calculator",
      "Automatic scam detection",
    ],
  },
  {
    id: 2,
    icon: Briefcase,
    colorText: "text-emerald-600",
    colorBg: "bg-emerald-50",
    colorBorder: "border-emerald-200",
    titleFr: "Emploi",
    titleEn: "Employment",
    descFr:
      "CV canadien AI, reconnaissance diplômes, préparation entrevue et recherche emploi.",
    descEn:
      "AI Canadian résumé, credential recognition, interview prep, and job search.",
    itemsFr: [
      "Redaction CV format canadien (AI)",
      "Reconnaissance diplômes (ECA / WES)",
      "Profil LinkedIn adapte au Québec",
      "Préparation entrevue AI (simulation)",
      "Recherche emploi (Indeed, LinkedIn, Jobillico)",
    ],
    itemsEn: [
      "Canadian-format résumé writing (AI)",
      "Credential recognition (ECA / WES)",
      "Québec-adapted LinkedIn profile",
      "AI interview préparation (simulation)",
      "Job search (Indeed, LinkedIn, Jobillico)",
    ],
    aiFr: [
      "Redaction CV automatique",
      "Simulation entrevue",
      "Orientation carrieres",
    ],
    aiEn: [
      "Automatic résumé writing",
      "Interview simulation",
      "Career guidance",
    ],
  },
  {
    id: 3,
    icon: Languages,
    colorText: "text-purple-600",
    colorBg: "bg-purple-50",
    colorBorder: "border-purple-200",
    titleFr: "Francisation",
    titleEn: "French",
    descFr:
      "Tuteur AI 24/7, préparation TCF/TEF, cours live Zoom et suivi progression NCLC.",
    descEn:
      "24/7 AI tutor, TCF/TEF prep, live Zoom classes, and NCLC progress tracking.",
    itemsFr: [
      "Tuteur AI français 24/7",
      "Préparation TCF/TEF (4 programmes : 499$ a 1 499$)",
      "Cours live Zoom mini-groupes",
      "Vocabulaire établissement (pas générique)",
      "Suivi progression NCLC",
    ],
    itemsEn: [
      "24/7 AI French tutor",
      "TCF/TEF préparation (4 programs: $499 to $1,499)",
      "Live Zoom mini-group classes",
      "Settlement vocabulary (not generic)",
      "NCLC progress tracking",
    ],
    aiFr: [
      "Corrections en temps reel",
      "Simulations d'examen",
      "Suivi NCLC",
    ],
    aiEn: [
      "Real-time corrections",
      "Exam simulations",
      "NCLC tracking",
    ],
    note: {
      fr: "NCLC 7 = jusqu'a 50 points CRS bonus + requis pour PSTQ",
      en: "NCLC 7 = up to 50 CRS bonus points + required for PSTQ",
    },
  },
  {
    id: 4,
    icon: ClipboardList,
    colorText: "text-orange-600",
    colorBg: "bg-orange-50",
    colorBorder: "border-orange-200",
    titleFr: "Administration",
    titleEn: "Administration",
    descFr:
      "NAS, RAMQ, permis de conduire, impots et ouverture de compte bancaire.",
    descEn:
      "SIN, RAMQ, driver's license, taxes, and bank account opening.",
    itemsFr: [
      "NAS / SIN (demandé en ligne)",
      "RAMQ (délai de carence 3 mois)",
      "Permis de conduire (échange ou examen)",
      "Déclaration impots (première annee)",
      "Ouverture compte bancaire",
    ],
    itemsEn: [
      "SIN / NAS (online application)",
      "RAMQ (3-month waiting period)",
      "Driver's license (exchange or exam)",
      "Tax return (first year)",
      "Bank account opening",
    ],
    aiFr: [
      "Checklist personnalisee",
      "Rappels intelligents",
      "Formulaires guides",
    ],
    aiEn: [
      "Personalized checklist",
      "Smart reminders",
      "Guided forms",
    ],
  },
  {
    id: 5,
    icon: Snowflake,
    colorText: "text-sky-600",
    colorBg: "bg-sky-50",
    colorBorder: "border-sky-200",
    titleFr: "Vie quotidienne",
    titleEn: "Daily Life",
    descFr:
      "Transport STM/RTC, préparation hiver, système de sante, culture et communautés.",
    descEn:
      "STM/RTC transit, winter prep, healthcare system, culture, and communities.",
    itemsFr: [
      "Transport STM / RTC",
      "Preparer l'hiver (vetements, conduite, mentalite)",
      "Système de sante (CLSC, urgences, médecin famille)",
      "Culture et intégration",
      "Communautes et reseautage",
    ],
    itemsEn: [
      "STM / RTC transit",
      "Winter préparation (clothing, driving, mindset)",
      "Healthcare system (CLSC, ER, family doctor)",
      "Culture and intégration",
      "Communities and networking",
    ],
    aiFr: [
      "Recommandations personnalisees",
      "Guide quartier",
      "Alertes meteo",
    ],
    aiEn: [
      "Personalized recommendations",
      "Neighborhood guide",
      "Weather alerts",
    ],
  },
  {
    id: 6,
    icon: FileCheck,
    colorText: "text-amber-600",
    colorBg: "bg-amber-50",
    colorBorder: "border-amber-200",
    titleFr: "Votre parcours",
    titleEn: "Your Journey",
    descFr:
      "Simulateur CRS + Arrima, eligibilite 10 programmes, checklist documents et marketplace pros.",
    descEn:
      "CRS + Arrima simulator, 10-program eligibility, document checklist, and pro marketplace.",
    itemsFr: [
      "Simulateur CRS Express Entry (federal)",
      "Simulateur Arrima / PSTQ (Québec)",
      "Eligibilite 10 programmes",
      "Checklist documents (cochable)",
      "Marketplace professionnels reglementes",
    ],
    itemsEn: [
      "CRS Express Entry simulator (federal)",
      "Arrima / PSTQ simulator (Québec)",
      "10-program eligibility",
      "Document checklist (checkable)",
      "Regulated professional marketplace",
    ],
    aiFr: [
      "Simulation what-if",
      "Recommandations personnalisees",
      "Plan d'action AI personnalise",
    ],
    aiEn: [
      "What-if simulation",
      "Personalized recommendations",
      "Personalized AI action plan",
    ],
    note: {
      fr: "Acces direct aux simulateurs et au marketplace",
      en: "Direct access to simulators and marketplace",
    },
    links: [
      { label: "Simulateur CRS", href: "/simulateur-crs" },
      { label: "Simulateur Arrima", href: "/simulateur-arrima" },
      { label: "Marketplace", href: "/marketplace" },
    ],
  },
];

function ParcoursPage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (id: number) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#085041]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Bot className="w-4 h-4 text-[#1D9E75]" />
            <span className="text-sm text-white/90">
              {fr ? "Propulse par l'AI Claude" : "Powered by Claude AI"}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-[family-name:var(--font-heading)] leading-tight mb-6">
            {fr
              ? "Ton parcours d'établissement en 6 piliers"
              : "Your 6-pillar settlement journey"}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            {fr
              ? "Un accompagnement personnalise propulse par l'AI pour chaque étape de ton installation au Québec. Du logement a l'établissement, on couvre tout."
              : "Personalized AI-powered guidance for every step of your settlement in Québec. From housing to établissement, we've got you covered."}
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="space-y-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            const isOpen = expanded === pillar.id;
            const items = fr ? pillar.itemsFr : pillar.itemsEn;
            const aiFeatures = fr ? pillar.aiFr : pillar.aiEn;

            return (
              <div
                key={pillar.id}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? `${pillar.colorBorder} shadow-lg`
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {/* Card Header */}
                <button
                  onClick={() => toggle(pillar.id)}
                  className="w-full flex items-center gap-4 p-5 md:p-6 text-left cursor-pointer"
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${pillar.colorBg}`}
                  >
                    <Icon className={`w-6 h-6 md:w-7 md:h-7 ${pillar.colorText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-gray-400">
                        {String(pillar.id).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                        {fr ? pillar.titleFr : pillar.titleEn}
                      </h3>
                    </div>
                    <p className="text-sm md:text-base text-gray-500 line-clamp-1">
                      {fr ? pillar.descFr : pillar.descEn}
                    </p>
                  </div>
                  {/* AI badge */}
                  <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                    AI
                  </div>
                  {/* Chevron */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-gray-100" : "bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Expanded Content */}
                {isOpen && (
                  <div className="px-5 md:px-6 pb-6 border-t border-gray-100">
                    <div className="grid md:grid-cols-2 gap-8 pt-6">
                      {/* Items list */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                          {fr ? "Ce qui est inclus" : "What's included"}
                        </h4>
                        <ul className="space-y-3">
                          {items.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${pillar.colorText}`} />
                              <span className="text-gray-700 text-sm md:text-base">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* AI Features */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Bot className="w-4 h-4 text-[#1D9E75]" />
                          {fr ? "Fonctions AI" : "AI Features"}
                        </h4>
                        <div className="space-y-3">
                          {aiFeatures.map((feat, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 bg-emerald-50 rounded-lg px-4 py-3"
                            >
                              <div className="w-2 h-2 rounded-full bg-[#1D9E75] flex-shrink-0" />
                              <span className="text-emerald-800 text-sm font-medium">
                                {feat}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Note */}
                        {pillar.note && (
                          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                            <p className="text-amber-800 text-sm font-medium">
                              {fr ? pillar.note.fr : pillar.note.en}
                            </p>
                          </div>
                        )}

                        {/* Links */}
                        {pillar.links && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {pillar.links.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#085041] hover:text-[#1D9E75] bg-white border border-gray-200 rounded-lg px-3 py-2 transition-colors"
                              >
                                {link.label}
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-[#085041] to-[#0a6350]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            {fr
              ? "Pret a commencer ton parcours?"
              : "Ready to start your journey?"}
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            {fr
              ? "Rejoins des milliers de nouveaux arrivants qui utilisent etabli pour s'installer au Québec avec confiance."
              : "Join thousands of newcomers using etabli to settle in Québec with confidence."}
          </p>
          <Link
            href="/tarifs"
            className="inline-flex items-center gap-2 bg-[#D97706] hover:bg-[#b45309] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-amber-900/20"
          >
            {fr ? "Commencer mon parcours" : "Start my journey"}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Shell>
      <ParcoursPage />
    </Shell>
  );
}
