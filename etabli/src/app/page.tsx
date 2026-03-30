"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import {
  Home,
  Briefcase,
  Languages,
  ClipboardList,
  Snowflake,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  Bot,
  TrendingUp,
} from "lucide-react";
import AnimateIn from "@/components/AnimateIn";
import CountUp from "@/components/CountUp";
import MontrealSkyline from "@/components/illustrations/MontrealSkyline";
import TestimonialCarousel from "@/components/TestimonialCarousel";

function HomePage() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const pillars = [
    { icon: Home, color: "text-blue-600 bg-blue-50", href: "/guide-etablissement", title: fr ? "Logement" : "Housing", desc: fr ? "Guide locataire, droits TAL, quartiers MTL, alertes arnaques" : "Tenant guide, TAL rights, MTL neighborhoods, scam alerts" },
    { icon: Briefcase, color: "text-emerald-600 bg-emerald-50", href: "/emplois", title: fr ? "Emploi" : "Employment", desc: fr ? "Offres d'emploi vérifiées, CV canadien, prep entrevue, Guichet-Emplois" : "Verified job listings, Canadian resume, interview prep, Job Bank" },
    { icon: Languages, color: "text-purple-600 bg-purple-50", href: "/francisation", title: fr ? "Francisation" : "French", desc: fr ? "Tuteur AI, préparation TCF/TEF, cours live, suivi NCLC" : "AI tutor, TCF/TEF prep, live classes, NCLC tracking" },
    { icon: ClipboardList, color: "text-orange-600 bg-orange-50", href: "/guide-etablissement", title: "Administration", desc: fr ? "NAS, RAMQ, permis conduire, impôts, banque" : "SIN, RAMQ, driver's license, taxes, banking" },
    { icon: Snowflake, color: "text-sky-600 bg-sky-50", href: "/guide-etablissement", title: fr ? "Vie quotidienne" : "Daily Life", desc: fr ? "Transport STM, hiver, santé, culture, communautés" : "STM transit, winter, health, culture, communities" },
    { icon: FileCheck, color: "text-amber-600 bg-amber-50", href: "/simulateur-arrima", title: fr ? "Votre parcours" : "Your Journey", desc: fr ? "Simulateur CRS + Arrima, 10 programmes, marketplace pros" : "CRS + Arrima simulator, 10 programs, pro marketplace" },
  ];

  const stats = [
    { value: "105K+", label: fr ? "Arrivants/an au QC" : "Newcomers/yr in QC" },
    { value: "10", label: fr ? "Programmes couverts" : "Programs covered" },
    { value: "24/7", label: fr ? "Assistant AI Claude" : "Claude AI Assistant" },
    { value: "2", label: fr ? "Simulateurs (CRS + Arrima)" : "Simulators (CRS + Arrima)" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#085041]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl md:text-6xl font-bold text-white font-[family-name:var(--font-heading)]">
                  etabli
                </span>
                <span className="text-5xl md:text-6xl font-bold text-[#1D9E75]">.</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white font-[family-name:var(--font-heading)] leading-tight mb-4">
                {fr ? "Sois etabli. Sois chez toi." : "Be established. Be home."}
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl">
                {fr
                  ? "La plateforme complète d'établissement et de francisation pour les nouveaux arrivants au Québec. Simulateur CRS + Arrima, préparation TCF/TEF, marketplace de professionnels réglementés, le tout propulsé par l'AI."
                  : "The complete settlement and francization platform for newcomers to Québec. CRS + Arrima simulator, TCF/TEF prep, regulated professional marketplace, all powered by AI."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/simulateur-arrima"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D9E75] text-white font-semibold rounded-xl hover:bg-[#178a65] transition-all shadow-lg shadow-[#1D9E75]/25"
                >
                  {fr ? "Simuler mon score Arrima" : "Simulate my Arrima score"}
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/simulateur-crs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                >
                  {fr ? "Simuler mon score CRS" : "Simulate my CRS score"}
                </Link>
                <Link
                  href="/tarifs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-amber-500/25"
                >
                  {fr ? "Voir les tarifs" : "See pricing"}
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <MontrealSkyline />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#085041] font-[family-name:var(--font-heading)]">
                  {s.value === "105K+" ? (
                    <CountUp end={105} suffix="K+" />
                  ) : s.value === "10" ? (
                    <CountUp end={10} />
                  ) : s.value === "2" ? (
                    <CountUp end={2} />
                  ) : (
                    s.value
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 Pillars */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
                {fr ? "6 piliers pour réussir ton établissement" : "6 pillars for successful settlement"}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                {fr
                  ? "Un parcours complet et personnalisé, propulsé par l'intelligence artificielle Claude."
                  : "A complete and personalized journey, powered by Claude AI."}
              </p>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillars.map((p, i) => (
              <AnimateIn key={i} delay={i * 100}>
                <Link
                  href={p.href}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#1D9E75]/30 hover:shadow-lg transition-all group block card-hover"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${p.color}`}
                  >
                    <p.icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#085041] transition-colors">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </Link>
              </AnimateIn>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/parcours"
              className="inline-flex items-center gap-2 text-[#1D9E75] font-semibold hover:underline"
            >
              {fr ? "Explorer les 6 piliers" : "Explore the 6 pillars"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Simulators CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Arrima */}
            <AnimateIn direction="left">
            <div className="bg-gradient-to-br from-[#003DA5] to-[#0055B8] rounded-2xl p-8 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">⚜️</span>
                <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                  Arrima / PSTQ
                </span>
              </div>
              <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-3">
                {fr ? "Simulateur Arrima" : "Arrima Simulator"}
              </h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                {fr
                  ? "Le seul programme de sélection permanente au Québec. Calcule ton score, vois tes chances d'invitation, et reçois des recommandations personnalisées."
                  : "Québec's only permanent sélection program. Calculate your score, see your invitation chances, and get personalized recommendations."}
              </p>
              <div className="flex items-center gap-4 mb-6 text-sm text-white/70">
                <span>{fr ? "Score compétitif: 590-620" : "Competitive score: 590-620"}</span>
                <span>~800 pts max</span>
              </div>
              <Link
                href="/simulateur-arrima"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#003DA5] font-semibold rounded-xl hover:bg-white/90 transition-all"
              >
                {fr ? "Calculer mon score" : "Calculate my score"}
                <ArrowRight size={16} />
              </Link>
            </div>
            </AnimateIn>

            {/* CRS */}
            <AnimateIn direction="right">
            <div className="bg-gradient-to-br from-[#DC2626] to-[#B91C1C] rounded-2xl p-8 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🍁</span>
                <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                  Express Entry
                </span>
              </div>
              <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-3">
                {fr ? "Simulateur CRS" : "CRS Simulator"}
              </h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                {fr
                  ? "Système fédéral de classement. Calcule ton Comprehensive Ranking System score et découvre tes options parmi les 10 programmes couverts."
                  : "Federal ranking system. Calculate your Comprehensive Ranking System score and discover your options among 10 covered programs."}
              </p>
              <div className="flex items-center gap-4 mb-6 text-sm text-white/70">
                <span>{fr ? "Score sur 1 200 pts" : "Score out of 1,200 pts"}</span>
                <span>{fr ? "Tirages francophones 380-420" : "Francophone draws 380-420"}</span>
              </div>
              <Link
                href="/simulateur-crs"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#DC2626] font-semibold rounded-xl hover:bg-white/90 transition-all"
              >
                {fr ? "Calculer mon score" : "Calculate my score"}
                <ArrowRight size={16} />
              </Link>
            </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Why etabli */}
      <section className="py-16 md:py-20 bg-[#F0FAF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-3">
              {fr ? "Pourquoi etabli. ?" : "Why etabli. ?"}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Bot, title: fr ? "AI Claude 24/7" : "Claude AI 24/7", desc: fr ? "Assistant intelligent pour toutes tes questions d'établissement et d'intégration" : "Smart assistant for all your établissement and settlement questions" },
              { icon: CheckCircle2, title: fr ? "Pros vérifiés" : "Verified Pros", desc: fr ? "RCIC et avocats licenciés, vérifiés via les registres publics CICC et Barreau" : "Licensed RCICs and lawyers, verified through CICC and Bar public registries" },
              { icon: TrendingUp, title: fr ? "2 Simulateurs" : "2 Simulators", desc: fr ? "CRS fédéral et Arrima Québec côte à côte pour choisir le meilleur parcours" : "Federal CRS and Québec Arrima side by side to choose the best path" },
              { icon: Star, title: fr ? "Prépa TCF/TEF" : "TCF/TEF Prep", desc: fr ? "Cours live + AI tuteur avec vocabulaire réel d'établissement, pas générique" : "Live classes + AI tutor with real settlement vocabulary, not generic" },
            ].map((f, i) => (
              <AnimateIn key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 border border-[#1D9E75]/10">
                  <div className="w-10 h-10 rounded-lg bg-[#E1F5EE] text-[#1D9E75] flex items-center justify-center mb-4">
                    <f.icon size={20} />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{f.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-white">
        <AnimateIn>
          <TestimonialCarousel />
        </AnimateIn>
      </section>

      {/* Marketplace Preview */}
      <section className="py-16 md:py-20">
        <AnimateIn>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <Users className="text-[#1D9E75]" size={24} />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                  {fr ? "Marketplace de professionnels réglementés" : "Regulated Professional Marketplace"}
                </h2>
              </div>
              <p className="text-gray-500 mb-6 max-w-2xl">
                {fr
                  ? "Consultants RCIC, avocats et notaires — tous vérifiés via les registres publics. Filtrez par langue, spécialité, et prix. Les membres Premium obtiennent 10% de rabais."
                  : "RCIC consultants, lawyers and notaries — all verified via public registries. Filter by language, specialty, and price. Premium members get 10% off."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { badge: "Barreau QC", name: "Me. Sophie Lavoie", spec: fr ? "Avocate spécialisée" : "Legal Advisor", rating: "4.9" },
                  { badge: "RCIC / CICC", name: "Karim Benali", spec: fr ? "Consultant réglementé" : "Regulated Consultant", rating: "4.8" },
                  { badge: "Barreau QC", name: "Me. Jean-Pierre Roy", spec: fr ? "Droit du travail" : "Employment Law", rating: "4.7" },
                ].map((p, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-[#E1F5EE] text-[#1D9E75] flex items-center justify-center font-bold text-sm mb-3">
                      {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-xs font-semibold text-[#1D9E75] bg-[#E1F5EE] px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                    <div className="font-semibold text-gray-900 text-sm mt-2">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.spec}</div>
                    <div className="text-xs text-amber-600 mt-1">&#9733; {p.rating}</div>
                  </div>
                ))}
              </div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-[#1D9E75] font-semibold hover:underline"
              >
                {fr ? "Voir tous les professionnels" : "View all professionals"}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        </AnimateIn>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#085041] to-[#0a6350]">
        <AnimateIn direction="scale">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            {fr ? "Prêt à commencer ton parcours ?" : "Ready to start your journey?"}
          </h2>
          <p className="text-white/70 mb-8">
            {fr
              ? "Rejoins des milliers de nouveaux arrivants qui utilisent etabli. pour réussir leur établissement au Québec."
              : "Join thousands of newcomers using etabli. to succeed in their settlement in Québec."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tarifs"
              className="px-6 py-3 bg-[#1D9E75] text-white font-semibold rounded-xl hover:bg-[#178a65] transition-all shadow-lg"
            >
              {fr ? "Commencer gratuitement" : "Start for free"}
            </Link>
            <Link
              href="/simulateur-arrima"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              {fr ? "Essayer le simulateur" : "Try the simulator"}
            </Link>
          </div>
        </div>
        </AnimateIn>
      </section>
    </>
  );
}

export default function Page() {
  return (
    <Shell>
      <HomePage />
    </Shell>
  );
}
