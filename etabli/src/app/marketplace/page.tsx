"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useState, useMemo } from "react";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import GradientAvatar from "@/components/GradientAvatar";
import {
  Search,
  Star,
  Clock,
  CheckCircle,
  ShieldCheck,
  Crown,
  ArrowRight,
  Globe,
  MapPin,
  BadgeCheck,
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
} from "lucide-react";

// ─── TYPES ───
type Professional = {
  id: number;
  name: string;
  title: { fr: string; en: string };
  badge: string;
  badgeLabel: { fr: string; en: string };
  city: { fr: string; en: string };
  languages: string[];
  specialties: { fr: string; en: string }[];
  rateMin: number;
  rateMax: number;
  rating: number;
  reviews: number;
  successRate?: number;
  responseTime: { fr: string; en: string };
  premium: boolean;
  avatarColor: string;
  initials: string;
};

// ─── DATA ───
const professionals: Professional[] = [
  {
    id: 1,
    name: "Me. Sophie Lavoie",
    title: { fr: "Avocate en immigration", en: "Immigration Lawyer" },
    badge: "Barreau QC #234567",
    badgeLabel: { fr: "Barreau vérifié", en: "Bar verified" },
    city: { fr: "Montreal", en: "Montreal" },
    languages: ["Français", "English", "العربية"],
    specialties: [
      { fr: "Entrée express", en: "Express Entry" },
      { fr: "Parrainage familial", en: "Family Sponsorship" },
      { fr: "Réfugiés", en: "Refugees" },
      { fr: "Révision judiciaire", en: "Judicial Review" },
    ],
    rateMin: 150,
    rateMax: 250,
    rating: 4.9,
    reviews: 127,
    successRate: 96,
    responseTime: { fr: "< 2h", en: "< 2h" },
    premium: true,
    avatarColor: "#085041",
    initials: "SL",
  },
  {
    id: 2,
    name: "Karim Benali, RCIC",
    title: { fr: "Consultant réglementé", en: "Regulated Consultant" },
    badge: "RCIC R512890 CICC",
    badgeLabel: { fr: "CICC vérifié", en: "CICC verified" },
    city: { fr: "Montreal", en: "Montreal" },
    languages: ["Français", "English", "العربية", "Amazigh"],
    specialties: [
      { fr: "PSTQ / Arrima", en: "PSTQ / Arrima" },
      { fr: "Travailleurs temporaires", en: "Temporary Workers" },
      { fr: "PEQ", en: "PEQ" },
      { fr: "Permis de travail", en: "Work Permits" },
    ],
    rateMin: 100,
    rateMax: 175,
    rating: 4.8,
    reviews: 93,
    successRate: 94,
    responseTime: { fr: "< 4h", en: "< 4h" },
    premium: false,
    avatarColor: "#1D9E75",
    initials: "KB",
  },
  {
    id: 3,
    name: "Me. Jean-Pierre Roy",
    title: { fr: "Avocat en immigration", en: "Immigration Lawyer" },
    badge: "Barreau QC #345678",
    badgeLabel: { fr: "Barreau vérifié", en: "Bar verified" },
    city: { fr: "Québec", en: "Québec City" },
    languages: ["Français", "English"],
    specialties: [
      { fr: "PSTQ / Arrima", en: "PSTQ / Arrima" },
      { fr: "Candidats provinciaux", en: "Provincial Nominees" },
      { fr: "Révision judiciaire", en: "Judicial Review" },
      { fr: "Asile", en: "Asylum" },
    ],
    rateMin: 200,
    rateMax: 300,
    rating: 4.7,
    reviews: 84,
    successRate: 95,
    responseTime: { fr: "< 6h", en: "< 6h" },
    premium: false,
    avatarColor: "#003DA5",
    initials: "JR",
  },
  {
    id: 4,
    name: "Amira Hassan, RCIC",
    title: { fr: "Consultante réglementée", en: "Regulated Consultant" },
    badge: "RCIC R523456 CICC",
    badgeLabel: { fr: "CICC vérifié", en: "CICC verified" },
    city: { fr: "Montreal", en: "Montreal" },
    languages: ["Français", "English", "العربية", "Wolof"],
    specialties: [
      { fr: "Entrée express", en: "Express Entry" },
      { fr: "Mobilité francophone", en: "Francophone Mobility" },
      { fr: "Permis d'études", en: "Study Permits" },
      { fr: "Visa visiteur", en: "Visitor Visa" },
    ],
    rateMin: 85,
    rateMax: 150,
    rating: 4.9,
    reviews: 156,
    successRate: 97,
    responseTime: { fr: "< 1h", en: "< 1h" },
    premium: true,
    avatarColor: "#D97706",
    initials: "AH",
  },
  {
    id: 5,
    name: "Me. Claire Tremblay",
    title: { fr: "Notaire", en: "Notary" },
    badge: "Chambre des notaires QC",
    badgeLabel: { fr: "Chambre vérifiée", en: "Chamber verified" },
    city: { fr: "Sherbrooke", en: "Sherbrooke" },
    languages: ["Français", "English"],
    specialties: [
      { fr: "Certification de documents", en: "Document certification" },
      { fr: "Parrainage familial", en: "Family sponsorship" },
      { fr: "Planification successorale", en: "Estate planning" },
    ],
    rateMin: 125,
    rateMax: 200,
    rating: 4.6,
    reviews: 62,
    successRate: undefined,
    responseTime: { fr: "< 24h", en: "< 24h" },
    premium: false,
    avatarColor: "#7C3AED",
    initials: "CT",
  },
];

const ALL_LANGUAGES = ["Français", "English", "العربية", "Amazigh", "Wolof"];

const ALL_SPECIALTIES_FR = [
  "Entrée express",
  "Parrainage familial",
  "Réfugiés",
  "Révision judiciaire",
  "PSTQ / Arrima",
  "Travailleurs temporaires",
  "PEQ",
  "Permis de travail",
  "Candidats provinciaux",
  "Asile",
  "Mobilité francophone",
  "Permis d'études",
  "Visa visiteur",
  "Certification de documents",
  "Planification successorale",
];

const ALL_SPECIALTIES_EN = [
  "Express Entry",
  "Family Sponsorship",
  "Refugees",
  "Judicial Review",
  "PSTQ / Arrima",
  "Temporary Workers",
  "PEQ",
  "Work Permits",
  "Provincial Nominees",
  "Asylum",
  "Francophone Mobility",
  "Study Permits",
  "Visitor Visa",
  "Document certification",
  "Estate planning",
];

// ─── STARS COMPONENT ───
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={
            s <= Math.floor(rating)
              ? "fill-[#D97706] text-[#D97706]"
              : s - 0.5 <= rating
              ? "fill-[#D97706]/50 text-[#D97706]"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

// ─── PROFESSIONAL CARD ───
function ProfessionalCard({ pro, fr }: { pro: Professional; fr: boolean }) {
  return (
    <div
      className={`bg-white rounded-2xl border transition-shadow hover:shadow-lg card-hover ${
        pro.premium
          ? "border-[#D97706]/40 shadow-[0_0_0_1px_rgba(217,119,6,0.1)]"
          : "border-gray-200"
      }`}
    >
      {/* Premium ribbon */}
      {pro.premium && (
        <div className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white text-[11px] font-semibold px-3 py-1 rounded-t-2xl flex items-center gap-1.5 justify-center">
          <Crown size={12} />
          <span>Premium</span>
        </div>
      )}

      <div className="p-5">
        {/* Header: Avatar + Name + Title */}
        <div className="flex items-start gap-3 mb-4">
          <GradientAvatar name={pro.name} size={48} />
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 font-[family-name:var(--font-heading)] truncate">
              {pro.name}
            </h3>
            <p className="text-sm text-gray-500">{fr ? pro.title.fr : pro.title.en}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck size={13} className="text-[#1D9E75] shrink-0" />
              <span className="text-[11px] text-[#1D9E75] font-medium">
                {fr ? pro.badgeLabel.fr : pro.badgeLabel.en}
              </span>
              <span className="text-[10px] text-gray-400">({pro.badge})</span>
            </div>
          </div>
        </div>

        {/* City */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
          <MapPin size={13} className="text-gray-400 shrink-0" />
          <span>{fr ? pro.city.fr : pro.city.en}</span>
        </div>

        {/* Languages */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <Globe size={13} className="text-gray-400 shrink-0" />
          {pro.languages.map((l) => (
            <span
              key={l}
              className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {l}
            </span>
          ))}
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {pro.specialties.map((s, i) => (
            <span
              key={i}
              className="text-[11px] bg-[#E1F5EE] text-[#085041] px-2 py-0.5 rounded-full font-medium"
            >
              {fr ? s.fr : s.en}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-sm mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <Stars rating={pro.rating} />
            <span className="font-semibold text-gray-900 text-sm">{pro.rating}</span>
            <span className="text-xs text-gray-400">({pro.reviews})</span>
          </div>
          <span className="text-sm font-semibold text-[#085041]">
            {pro.rateMin}-{pro.rateMax}$/h
          </span>
        </div>

        {/* Secondary stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {pro.successRate && (
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-[#1D9E75]" />
              <span>
                {pro.successRate}% {fr ? "succès" : "success"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-[#D97706]" />
            <span>
              {fr ? "Réponse" : "Response"} {fr ? pro.responseTime.fr : pro.responseTime.en}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="#"
          className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors bg-[#085041] text-white hover:bg-[#085041]/90"
        >
          {fr ? "Consulter le profil" : "View profile"}
        </Link>
      </div>
    </div>
  );
}

// ─── MAIN PAGE COMPONENT ───
function MarketplacePage() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  const specialties = fr ? ALL_SPECIALTIES_FR : ALL_SPECIALTIES_EN;

  const filtered = useMemo(() => {
    return professionals.filter((pro) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = pro.name.toLowerCase().includes(q);
        const cityMatch =
          pro.city.fr.toLowerCase().includes(q) ||
          pro.city.en.toLowerCase().includes(q);
        const specMatch = pro.specialties.some(
          (s) =>
            s.fr.toLowerCase().includes(q) || s.en.toLowerCase().includes(q)
        );
        if (!nameMatch && !cityMatch && !specMatch) return false;
      }

      // Language
      if (languageFilter && !pro.languages.includes(languageFilter)) {
        return false;
      }

      // Specialty
      if (specialtyFilter) {
        const match = pro.specialties.some(
          (s) => s.fr === specialtyFilter || s.en === specialtyFilter
        );
        if (!match) return false;
      }

      return true;
    });
  }, [searchQuery, languageFilter, specialtyFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
          {fr ? "Marketplace des professionnels" : "Professional Marketplace"}
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          {fr
            ? "Consultants RCIC, avocats et notaires vérifiés pour votre projet d'immigration"
            : "Verified RCIC consultants, lawyers and notaries for your immigration project"}
        </p>
      </div>

      {/* Trust banner */}
      <div className="bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-2xl p-4 mb-4 flex items-start gap-3">
        <CheckCircle size={20} className="text-[#1D9E75] shrink-0 mt-0.5" />
        <p className="text-sm text-[#085041]">
          {fr
            ? "Tous les professionnels sont vérifiés via les registres publics (CICC, Barreau du Québec, Chambre des notaires). Vos données restent confidentielles."
            : "All professionals are verified through public registries (CICC, Québec Bar, Chamber of Notaries). Your data remains confidential."}
        </p>
      </div>

      {/* Premium callout */}
      <div className="bg-[#FEF3C7] border border-[#D97706]/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Crown size={20} className="text-[#D97706] shrink-0 mt-0.5" />
        <p className="text-sm text-[#92400E]">
          {fr
            ? "Les membres etabli Premium bénéficient de 10% de rabais chez tous les professionnels Premium."
            : "etabli Premium members get 10% off all Premium professionals."}
          <Link
            href="/tarifs"
            className="ml-1 font-semibold text-[#D97706] underline underline-offset-2 hover:text-[#B45309]"
          >
            {fr ? "En savoir plus" : "Learn more"}
          </Link>
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={
                fr
                  ? "Rechercher par nom, ville, spécialité..."
                  : "Search by name, city, specialty..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] outline-none"
            />
          </div>

          {/* Language filter */}
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] outline-none min-w-[160px]"
          >
            <option value="">{fr ? "Toutes les langues" : "All languages"}</option>
            {ALL_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Specialty filter */}
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] outline-none min-w-[180px]"
          >
            <option value="">
              {fr ? "Toutes les spécialités" : "All specialties"}
            </option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Result count */}
        <div className="mt-3 text-xs text-gray-400">
          {filtered.length}{" "}
          {fr
            ? `professionnel${filtered.length > 1 ? "s" : ""} trouvé${filtered.length > 1 ? "s" : ""}`
            : `professional${filtered.length !== 1 ? "s" : ""} found`}
        </div>
      </div>

      {/* Professional cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {filtered.map((pro) => (
          <ProfessionalCard key={pro.id} pro={pro} fr={fr} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              {fr
                ? "Aucun professionnel ne correspond à vos critères"
                : "No professionals match your criteria"}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setLanguageFilter("");
                setSpecialtyFilter("");
              }}
              className="mt-2 text-sm text-[#1D9E75] hover:underline"
            >
              {fr ? "Réinitialiser les filtres" : "Reset filters"}
            </button>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-[#F0FAF5] rounded-2xl p-6 md:p-8 mb-8">
        <h2 className="text-xl font-bold text-[#085041] font-[family-name:var(--font-heading)] mb-6 text-center">
          {fr ? "Comment ça fonctionne" : "How it works"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: <Zap size={24} className="text-[#D97706]" />,
              step: "1",
              title: { fr: "Simulez votre score", en: "Simulate your score" },
              desc: {
                fr: "Utilisez nos simulateurs Arrima ou CRS pour évaluer votre profil gratuitement.",
                en: "Use our Arrima or CRS simulators to evaluate your profile for free.",
              },
            },
            {
              icon: <Search size={24} className="text-[#1D9E75]" />,
              step: "2",
              title: {
                fr: "Parcourez les professionnels",
                en: "Browse professionals",
              },
              desc: {
                fr: "Filtrez par spécialité, langue et ville pour trouver le professionnel idéal.",
                en: "Filter by specialty, language and city to find the ideal professional.",
              },
            },
            {
              icon: <MessageSquare size={24} className="text-[#085041]" />,
              step: "3",
              title: {
                fr: "Demandez une consultation",
                en: "Request consultation",
              },
              desc: {
                fr: "Envoyez votre demande avec votre profil et recevez une réponse rapide.",
                en: "Send your request with your profile and receive a quick response.",
              },
            },
            {
              icon: <BadgeCheck size={24} className="text-[#003DA5]" />,
              step: "4",
              title: {
                fr: "Obtenez un accompagnement",
                en: "Get guided support",
              },
              desc: {
                fr: "Le professionnel vous accompagne dans toutes les étapes de votre dossier.",
                en: "The professional guides you through every step of your application.",
              },
            },
          ].map((item, i) => (
            <AnimateIn key={i} delay={i * 150}>
            <div className="bg-white rounded-xl p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-3">
                {item.icon}
              </div>
              <div className="text-[11px] font-bold text-[#1D9E75] uppercase tracking-wider mb-1">
                {fr ? "Étape" : "Step"} {item.step}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                {fr ? item.title.fr : item.title.en}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {fr ? item.desc.fr : item.desc.en}
              </p>
            </div>
            </AnimateIn>
          ))}
        </div>
      </div>

      {/* CTA for professionals */}
      <AnimateIn direction="scale">
      <div className="bg-gradient-to-r from-[#085041] to-[#1D9E75] rounded-2xl p-6 md:p-8 text-white text-center">
        <h2 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-heading)] mb-2">
          {fr
            ? "Vous êtes professionnel en immigration?"
            : "Are you an immigration professional?"}
        </h2>
        <p className="text-white/80 text-sm md:text-base mb-5 max-w-xl mx-auto">
          {fr
            ? "Rejoignez le marketplace d'etabli et connectez-vous avec des clients qualifiés. RCIC, avocats et notaires bienvenus."
            : "Join the etabli marketplace and connect with qualified clients. RCIC consultants, lawyers and notaries welcome."}
        </p>
        <Link
          href="/portail/inscription?type=professionnel"
          className="inline-flex items-center gap-2 bg-white text-[#085041] font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors"
        >
          {fr ? "Inscription gratuite" : "Free registration"}
          <ArrowRight size={16} />
        </Link>
      </div>
      </AnimateIn>

      {/* Footer disclaimer */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {fr
            ? "etabli ne fournit pas de conseils juridiques. Les professionnels listés sont indépendants et vérifiés via les registres publics."
            : "etabli does not provide legal advice. Listed professionals are independent and verified through public registries."}
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Shell>
      <MarketplacePage />
    </Shell>
  );
}
