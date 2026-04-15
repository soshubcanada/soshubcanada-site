"use client";
import { crmFetch } from '@/lib/crm-fetch';
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCrm } from "@/lib/crm-store";
import {
  analyzeEligibility,
  calculateCRSScore,
  calculateFSWPoints,
  type ClientProfile,
  type EligibilityAnalysis,
  type ProgramEligibility,
} from "@/lib/eligibility-engine";
import {
  calculateCRS, calculateMIFI, getCrsImprovementAdvice, getMifiImprovementAdvice,
  getDefaultProfile, CRS_RECENT_CUTOFFS, MIFI_THRESHOLD_ESTIMATE,
  type ScoringProfile, type EducationLevel, type CanadianEducationLevel,
  type CrsBreakdown, type MifiBreakdown, type ImprovementAdvice,
} from "@/lib/crm-scoring";
import PremiumReport from "./premium-report";
import {
  Shield, ChevronRight, ChevronLeft, Check, Star, AlertTriangle,
  CheckCircle2, XCircle, Clock, DollarSign, FileText, Send, Save,
  Users, GraduationCap, Languages, Briefcase, Heart, Search,
  TrendingUp, Award, ArrowRight, Info, Sparkles, ChevronDown, ChevronUp,
  UserCheck, Globe2, MapPin, Calculator, Target, Lightbulb, BarChart3,
  Baby, FileCheck,
} from "lucide-react";

type TopTab = "leads" | "admissibilite" | "crs" | "mifi";

// ─── LEAD TYPE ──────────────────────────────────────────
interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  subject?: string;
  message?: string;
  form_data?: {
    age?: string; education?: string; workExperience?: string;
    canadianExperience?: string; frenchLevel?: string; englishLevel?: string;
    destination?: string; jobOffer?: string; familyInCanada?: string;
    maritalStatus?: string; funds?: string;
    results?: Array<{ name: string; eligible: boolean; score: number }>;
  };
  status: string;
  created_at: string;
}

// ─── DEFAULT PROFILE ─────────────────────────────────────

function getDefaultClientProfile(): ClientProfile {
  return {
    age: 30,
    nationality: "",
    maritalStatus: "single",
    hasSpouse: false,
    numberOfDependents: 0,
    currentCountry: "",
    isInCanada: false,
    isInQuebec: false,
    yearsInCanada: 0,
    yearsInQuebec: 0,
    highestEducation: "bachelors",
    hasCanadianEducation: false,
    canadianEducationLevel: undefined,
    canadianEducationProvince: undefined,
    hasECA: false,
    fieldOfStudy: "",
    frenchLevel: "none",
    frenchNCLC: undefined,
    englishLevel: "intermediate",
    englishCLB: undefined,
    hasLanguageTest: false,
    languageTestType: undefined,
    totalWorkExperienceYears: 0,
    canadianWorkExperienceYears: 0,
    quebecWorkExperienceYears: 0,
    currentOccupationNOC: undefined,
    nocTEER: undefined,
    hasJobOffer: false,
    jobOfferNOC: undefined,
    jobOfferProvince: undefined,
    isJobOfferLMIA: false,
    hasRelativeInCanada: false,
    relativeRelationship: undefined,
    hasSpouseInCanada: false,
    currentStatus: "none",
    hasValidPermit: false,
    settlementFunds: 0,
    spouseEducation: undefined,
    spouseFrenchNCLC: undefined,
    spouseEnglishCLB: undefined,
    spouseCanadianWorkYears: undefined,
    hasMultipleCredentials: false,
    hasCertificateOfQualification: false,
    isRefugee: false,
    hasCriminalRecord: false,
    hasMedicalIssue: false,
    hasBusinessExperience: false,
    businessNetWorth: undefined,
  };
}

// ─── CONSTANTS ───────────────────────────────────────────

const STEPS = [
  { id: 1, title: "Informations personnelles", icon: Users },
  { id: 2, title: "Education", icon: GraduationCap },
  { id: 3, title: "Langues", icon: Languages },
  { id: 4, title: "Experience professionnelle", icon: Briefcase },
  { id: 5, title: "Situation particuliere", icon: Heart },
];

const EDUCATION_OPTIONS: { value: ClientProfile["highestEducation"]; label: string }[] = [
  { value: "none", label: "Aucun diplome" },
  { value: "secondary", label: "Secondaire (DES)" },
  { value: "one_year_diploma", label: "Diplome 1 an (DEP, AEC)" },
  { value: "two_year_diploma", label: "Diplome 2 ans (DEC, technique)" },
  { value: "three_year_diploma", label: "Diplome 3 ans" },
  { value: "bachelors", label: "Baccalaureat" },
  { value: "masters", label: "Maitrise (MBA, MSc, MA)" },
  { value: "phd", label: "Doctorat (PhD)" },
];

const MARITAL_OPTIONS: { value: ClientProfile["maritalStatus"]; label: string }[] = [
  { value: "single", label: "Celibataire" },
  { value: "married", label: "Marie(e)" },
  { value: "common_law", label: "Conjoint(e) de fait" },
  { value: "separated", label: "Separe(e)" },
  { value: "divorced", label: "Divorce(e)" },
  { value: "widowed", label: "Veuf / Veuve" },
];

const LANGUAGE_LEVEL_OPTIONS = [
  { value: "none", label: "Aucun" },
  { value: "basic", label: "Debutant (A1-A2)" },
  { value: "intermediate", label: "Intermediaire (B1-B2)" },
  { value: "advanced", label: "Avance (C1-C2)" },
  { value: "native", label: "Langue maternelle" },
];

const STATUS_OPTIONS: { value: NonNullable<ClientProfile["currentStatus"]>; label: string }[] = [
  { value: "none", label: "Aucun statut au Canada" },
  { value: "citizen_other", label: "Citoyen d'un autre pays" },
  { value: "visitor", label: "Visiteur / Touriste" },
  { value: "student", label: "Etudiant (permis d'etudes)" },
  { value: "worker", label: "Travailleur (permis de travail)" },
  { value: "refugee_claimant", label: "Demandeur d'asile" },
  { value: "pr", label: "Resident permanent" },
];

const TEST_TYPE_OPTIONS: { value: NonNullable<ClientProfile["languageTestType"]>; label: string }[] = [
  { value: "TEF", label: "TEF Canada" },
  { value: "TCF", label: "TCF Canada" },
  { value: "IELTS", label: "IELTS General" },
  { value: "CELPIP", label: "CELPIP General" },
];

const TEER_OPTIONS: { value: 0 | 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 0, label: "FEER 0 - Gestion" },
  { value: 1, label: "FEER 1 - Professionnel" },
  { value: 2, label: "FEER 2 - Technique / Metier specialise" },
  { value: 3, label: "FEER 3 - Intermediaire" },
  { value: 4, label: "FEER 4 - Soutien" },
  { value: 5, label: "FEER 5 - Emploi non qualifie" },
];

const ELIGIBILITY_CONFIG: Record<ProgramEligibility["eligibility"], { label: string; color: string; bg: string; border: string }> = {
  eligible: { label: "Admissible", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  likely_eligible: { label: "Probablement admissible", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  possibly_eligible: { label: "Possiblement admissible", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  not_eligible: { label: "Non admissible", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  ended: { label: "Programme termine", color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
};

const CATEGORY_LABELS: Record<ProgramEligibility["category"], { label: string; color: string }> = {
  temporaire: { label: "Temporaire", color: "bg-sky-100 text-sky-700" },
  permanent: { label: "Permanent", color: "bg-indigo-100 text-indigo-700" },
  quebec: { label: "Quebec", color: "bg-blue-100 text-blue-700" },
  refugie: { label: "Refugie", color: "bg-orange-100 text-orange-700" },
  citoyennete: { label: "Citoyennete", color: "bg-emerald-100 text-emerald-700" },
};

// ─── COMPONENT HELPERS ───────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/40 ${
          checked ? "bg-[#D4A03C]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </label>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-600 mb-1">{children}</label>;
}

function InputField({ label, type = "text", value, onChange, min, max, placeholder, disabled }: {
  label: string; type?: string; value: string | number; onChange: (v: string) => void;
  min?: number; max?: number; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C] transition-colors disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}

function SelectField<T extends string>({ label, value, onChange, options }: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C] transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── SCORE GAUGE ─────────────────────────────────────────

function CRSGauge({ score, max = 1200 }: { score: number; max?: number }) {
  const pct = Math.min((score / max) * 100, 100);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const dashOffset = arcLength - (arcLength * pct) / 100;
  const color = score >= 500 ? "#10b981" : score >= 400 ? "#D4A03C" : score >= 300 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-[135deg]">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="14" strokeDasharray={`${arcLength} ${circumference}`} strokeLinecap="round" />
        <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="14" strokeDasharray={`${arcLength} ${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-500 mt-1">/ {max} CRS</span>
      </div>
    </div>
  );
}

function FSWBar({ score, passing = 67 }: { score: number; passing?: number }) {
  const max = 100;
  const pct = Math.min((score / max) * 100, 100);
  const passPct = (passing / max) * 100;
  const passed = score >= passing;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Points FSW (67 requis)</span>
        <span className={`font-bold ${passed ? "text-emerald-600" : "text-red-500"}`}>{score} / {max}</span>
      </div>
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${passed ? "bg-emerald-500" : "bg-red-400"}`}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute top-0 bottom-0 w-0.5 bg-gray-800" style={{ left: `${passPct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>0</span>
        <span className="text-gray-600 font-medium">Seuil: {passing}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function PriorityStars({ priority }: { priority: number }) {
  const filled = Math.max(0, 5 - priority + 1);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < filled ? "text-[#D4A03C] fill-[#D4A03C]" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

// ─── PROGRAM CARD ────────────────────────────────────────

function ProgramCard({ program }: { program: ProgramEligibility }) {
  const [expanded, setExpanded] = useState(false);
  const config = ELIGIBILITY_CONFIG[program.eligibility];
  const catConfig = CATEGORY_LABELS[program.category];

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden transition-all duration-300 hover:shadow-md`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className={`font-semibold text-sm ${program.eligibility === "ended" ? "line-through text-gray-400" : "text-gray-900"}`}>
                {program.programNameFr}
              </h4>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${catConfig.color}`}>
                {catConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                {config.label}
              </span>
              <PriorityStars priority={program.priority} />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-gray-900">{program.score}</div>
            <div className="text-[10px] text-gray-400">/ 100</div>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-3 h-2 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              program.score >= 80 ? "bg-emerald-500" : program.score >= 60 ? "bg-blue-500" : program.score >= 40 ? "bg-amber-500" : "bg-red-400"
            }`}
            style={{ width: `${program.score}%` }}
          />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1"><Clock size={11} /> {program.estimatedProcessingTime}</span>
          <span className="flex items-center gap-1"><DollarSign size={11} /> {program.governmentFees.toLocaleString("fr-CA")} $</span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-[#1B2559] hover:text-[#D4A03C] transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Masquer les details" : "Voir les details"}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/40">
          {program.keyStrengths.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> Points forts
              </div>
              <ul className="space-y-1">
                {program.keyStrengths.map((s, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <Check size={11} className="text-emerald-500 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {program.missingRequirements.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                <XCircle size={12} /> Exigences manquantes
              </div>
              <ul className="space-y-1">
                {program.missingRequirements.map((m, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <XCircle size={11} className="text-red-400 mt-0.5 shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {program.recommendations.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                <Sparkles size={12} /> Recommandations
              </div>
              <ul className="space-y-1">
                {program.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <ArrowRight size={11} className="text-[#D4A03C] mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {program.notes && (
            <div className="text-xs text-gray-500 italic flex items-start gap-1.5 mt-2">
              <Info size={11} className="mt-0.5 shrink-0" /> {program.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE COMPONENT (wrapper with top tabs) ─────────

export default function AnalyseImmigrationPage() {
  const [topTab, setTopTab] = useState<TopTab>("leads");
  const [leadCount, setLeadCount] = useState(0);

  return (
    <div className="space-y-6">
      {/* Top-level tab bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={28} className="text-[#1B2559]" />
            Analyse immigration
            <span className="inline-flex items-center gap-1 ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4A03C]/10 text-[#D4A03C]">
              <Sparkles size={12} /> Exclusif
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Leads entrants, admissibilité, calculateur CRS et grille MIFI
          </p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTopTab("leads")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            topTab === "leads" ? "bg-white shadow text-[#1B2559]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users size={16} />
          Leads
          {leadCount > 0 && (
            <span className="ml-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5">
              {leadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTopTab("admissibilite")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            topTab === "admissibilite" ? "bg-white shadow text-[#1B2559]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Shield size={16} />
          Admissibilité
        </button>
        <button
          onClick={() => setTopTab("crs")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            topTab === "crs" ? "bg-white shadow text-[#1B2559]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Globe2 size={16} />
          CRS
        </button>
        <button
          onClick={() => setTopTab("mifi")}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            topTab === "mifi" ? "bg-white shadow text-[#1B2559]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <MapPin size={16} />
          MIFI
        </button>
      </div>

      {topTab === "leads" && <LeadsTab onCountUpdate={setLeadCount} />}
      {topTab === "admissibilite" && <AdmissibiliteTab />}
      {topTab === "crs" && <CrsCalculatorTab />}
      {topTab === "mifi" && <MifiCalculatorTab />}
    </div>
  );
}

// ─── LEADS TAB — Incoming leads from soshub.ca ──────────

function LeadsTab({ onCountUpdate }: { onCountUpdate: (n: number) => void }) {
  const { clients, setClients } = useCrm();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "qualified">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load leads from API + fallback to client prospects
  useEffect(() => {
    let cancelled = false;
    async function fetchLeads() {
      setLoading(true);
      try {
        // Use internal endpoint (service role, no auth needed)
        const res = await crmFetch("/api/crm/leads/list");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data)) {
            setLeads(data);
            onCountUpdate(data.filter((l: Lead) => l.status === "new").length);

            // Sync leads into CRM clients store as prospects
            // so they appear in the Clients page too
            const existingEmails = new Set(clients.map(c => c.email?.toLowerCase()));
            const newProspects = data
              .filter((l: Lead) => l.email && !existingEmails.has(l.email.toLowerCase()))
              .map((l: Lead) => {
                const parts = (l.name || "").split(" ");
                return {
                  id: l.id,
                  firstName: parts[0] || "",
                  lastName: parts.slice(1).join(" ") || "",
                  email: l.email,
                  phone: l.phone || "",
                  status: "prospect" as const,
                  source: l.source || "website",
                  notes: l.form_data ? `Source: ${l.source}\n${l.message || ""}` : "",
                  createdAt: l.created_at,
                  dateOfBirth: "", nationality: "", currentCountry: "", currentStatus: "prospect",
                  passportNumber: "", passportExpiry: "", address: "", city: "", province: "",
                  postalCode: "", assignedTo: "", updatedAt: l.created_at,
                  languageEnglish: l.form_data?.englishLevel || "", languageFrench: l.form_data?.frenchLevel || "",
                  education: l.form_data?.education || "", workExperience: l.form_data?.workExperience || "",
                  maritalStatus: l.form_data?.maritalStatus || "", dependants: 0,
                  familyMembers: [], documents: [], priorite: "moyenne" as const,
                  dateInscription: l.created_at?.split("T")[0] || "",
                  dateDernierContact: "",
                } as import("@/lib/crm-types").Client;
              });
            if (newProspects.length > 0) {
              setClients([...clients, ...newProspects]);
            }

            setLoading(false);
            return;
          }
        }
      } catch { /* fallback below */ }

      // Fallback: use prospects from CRM store
      if (!cancelled) {
        const prospects = clients
          .filter(c => c.status === "prospect" || c.source === "test_admissibilite")
          .map(c => ({
            id: c.id,
            name: c.firstName + " " + c.lastName,
            email: c.email,
            phone: c.phone || "",
            source: c.source || "website",
            status: "new",
            created_at: c.createdAt || new Date().toISOString(),
          }));
        setLeads(prospects as Lead[]);
        onCountUpdate(prospects.length);
      }
      if (!cancelled) setLoading(false);
    }
    fetchLeads();
    return () => { cancelled = true; };
  }, [clients, onCountUpdate]);

  const filteredLeads = filter === "all" ? leads : leads.filter(l => l.status === filter);

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await crmFetch("/api/crm/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
    } catch { /* ignore — local update still applies */ }
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    onCountUpdate(leads.filter(l => l.status === "new" && l.id !== leadId).length + (newStatus === "new" ? 1 : 0));
  };

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-amber-100 text-amber-700",
    qualified: "bg-emerald-100 text-emerald-700",
    converted: "bg-[#1B2559] text-white",
    lost: "bg-gray-200 text-gray-500",
  };
  const statusLabels: Record<string, string> = {
    new: "Nouveau", contacted: "Contacté", qualified: "Qualifié", converted: "Converti", lost: "Perdu",
  };

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + " min";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h";
    const days = Math.floor(hrs / 24);
    return days + "j";
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", count: leads.length, color: "bg-gray-100 text-gray-700", filterVal: "all" as const },
          { label: "Nouveaux", count: leads.filter(l => l.status === "new").length, color: "bg-blue-50 text-blue-700", filterVal: "new" as const },
          { label: "Contactés", count: leads.filter(l => l.status === "contacted").length, color: "bg-amber-50 text-amber-700", filterVal: "contacted" as const },
          { label: "Qualifiés", count: leads.filter(l => l.status === "qualified").length, color: "bg-emerald-50 text-emerald-700", filterVal: "qualified" as const },
          { label: "Convertis", count: leads.filter(l => l.status === "converted").length, color: "bg-[#1B2559]/5 text-[#1B2559]", filterVal: "all" as const },
        ].map(s => (
          <button key={s.label} onClick={() => setFilter(s.filterVal)}
            className={`rounded-xl p-3 text-center transition-all border ${filter === s.filterVal ? "border-[#D4A03C] ring-2 ring-[#D4A03C]/20" : "border-transparent"} ${s.color}`}>
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-xs font-medium">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Source info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
        <Globe2 size={18} className="text-blue-600 shrink-0" />
        <span className="text-blue-800">
          Les leads arrivent automatiquement depuis le <strong>test d&apos;admissibilité</strong> sur{" "}
          <a href="https://soshub.ca/admissibilite" target="_blank" rel="noopener noreferrer" className="underline font-semibold">soshub.ca</a>.
          Chaque soumission crée un prospect + une tâche de suivi sous 24h.
        </span>
      </div>

      {/* Leads list */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Users size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucun lead {filter !== "all" ? statusLabels[filter]?.toLowerCase() : ""}</p>
          <p className="text-gray-400 text-sm mt-1">Les nouveaux leads apparaîtront ici automatiquement</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLeads.map(lead => {
            const isExpanded = expandedId === lead.id;
            const eligiblePrograms = lead.form_data?.results?.filter(r => r.eligible) || [];
            const allPrograms = lead.form_data?.results || [];
            return (
              <div key={lead.id} className={`bg-white rounded-xl border transition-all ${lead.status === "new" ? "border-blue-200 shadow-sm" : "border-gray-200"}`}>
                {/* Lead row */}
                <button onClick={() => setExpandedId(isExpanded ? null : lead.id)} className="w-full px-4 py-3 flex items-center gap-3 text-left">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${lead.status === "new" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                    {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate">{lead.name}</span>
                      {lead.status === "new" && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />}
                      {(lead.source === "admissibility_test" || lead.source === "test_admissibilite") && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4A03C]/15 text-[#D4A03C] border border-[#D4A03C]/30 uppercase tracking-wider shrink-0">
                          <Shield size={10} /> Test gratuit
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{lead.email}{lead.phone ? " • " + lead.phone : ""}</div>
                  </div>
                  {/* Programs badge */}
                  {eligiblePrograms.length > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      <CheckCircle2 size={12} /> {eligiblePrograms.length} prog.
                    </span>
                  )}
                  {/* Status */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[lead.status] || "bg-gray-100 text-gray-600"}`}>
                    {statusLabels[lead.status] || lead.status}
                  </span>
                  {/* Time */}
                  <span className="text-xs text-gray-400 w-10 text-right shrink-0">{timeAgo(lead.created_at)}</span>
                  {/* Chevron */}
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
                    {/* Test results */}
                    {allPrograms.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Résultats du test</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {allPrograms.map((p, i) => (
                            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${p.eligible ? "bg-emerald-50 text-emerald-800" : "bg-gray-50 text-gray-500"}`}>
                              {p.eligible ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : <XCircle size={14} className="text-gray-400 shrink-0" />}
                              <span className="truncate font-medium">{p.name}</span>
                              <span className="ml-auto text-xs font-semibold">{p.score}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Form data summary */}
                    {lead.form_data && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {lead.form_data.age && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Âge</span><br /><span className="font-semibold text-gray-700">{lead.form_data.age}</span></div>}
                        {lead.form_data.education && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Éducation</span><br /><span className="font-semibold text-gray-700">{lead.form_data.education}</span></div>}
                        {lead.form_data.frenchLevel && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Français</span><br /><span className="font-semibold text-gray-700">{lead.form_data.frenchLevel}</span></div>}
                        {lead.form_data.destination && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Destination</span><br /><span className="font-semibold text-gray-700">{lead.form_data.destination}</span></div>}
                        {lead.form_data.workExperience && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Expérience</span><br /><span className="font-semibold text-gray-700">{lead.form_data.workExperience}</span></div>}
                        {lead.form_data.jobOffer && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Offre emploi</span><br /><span className="font-semibold text-gray-700">{lead.form_data.jobOffer}</span></div>}
                        {lead.form_data.maritalStatus && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Statut</span><br /><span className="font-semibold text-gray-700">{lead.form_data.maritalStatus}</span></div>}
                        {lead.form_data.funds && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400">Fonds</span><br /><span className="font-semibold text-gray-700">{lead.form_data.funds}</span></div>}
                      </div>
                    )}

                    {/* Source + date */}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Source: <strong className="text-gray-600">{lead.source === "admissibility_test" || lead.source === "test_admissibilite" ? "Test admissibilité soshub.ca" : lead.source}</strong></span>
                      <span>Reçu: <strong className="text-gray-600">{new Date(lead.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong></span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      {lead.status === "new" && (
                        <button onClick={() => updateLeadStatus(lead.id, "contacted")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors flex items-center gap-1">
                          <Send size={12} /> Marquer contacté
                        </button>
                      )}
                      {(lead.status === "new" || lead.status === "contacted") && (
                        <button onClick={() => updateLeadStatus(lead.id, "qualified")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors flex items-center gap-1">
                          <UserCheck size={12} /> Qualifier
                        </button>
                      )}
                      <button onClick={() => updateLeadStatus(lead.id, "converted")}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1B2559] text-white hover:bg-[#243070] transition-colors flex items-center gap-1">
                        <Award size={12} /> Convertir en client
                      </button>
                      <a href={`mailto:${lead.email}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1">
                        <Send size={12} /> Envoyer courriel
                      </a>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1">
                          📞 Appeler
                        </a>
                      )}
                      {lead.status !== "lost" && (
                        <button onClick={() => updateLeadStatus(lead.id, "lost")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors ml-auto">
                          ✕ Perdu
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ADMISSIBILITE TAB ──────────────────────────────────

function AdmissibiliteTab() {
  const { clients, currentUser } = useCrm();
  const [mode, setMode] = useState<"client" | "new">("new");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [profile, setProfile] = useState<ClientProfile>(getDefaultClientProfile());
  const [currentStep, setCurrentStep] = useState(1);
  const [analysis, setAnalysis] = useState<EligibilityAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Auto-dismiss notifications after 5s
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(t);
  }, [notification]);

  const activeClients = clients.filter((c) => c.status !== "archive");

  const updateProfile = useCallback((partial: Partial<ClientProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  // Load client data into profile
  function loadClient(clientId: string) {
    setSelectedClientId(clientId);
    if (!clientId) return;
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    const p = { ...getDefaultClientProfile() };

    // Age
    if (client.dateOfBirth) {
      const birth = new Date(client.dateOfBirth);
      const today = new Date();
      p.age = Math.floor((today.getTime() - birth.getTime()) / 31557600000);
    }

    // Nationality
    if (client.nationality) p.nationality = client.nationality;

    // Marital status
    const ms = client.maritalStatus?.toLowerCase() || "";
    if (ms.includes("mari")) { p.maritalStatus = "married"; p.hasSpouse = true; }
    else if (ms.includes("conjoint") || ms.includes("common")) { p.maritalStatus = "common_law"; p.hasSpouse = true; }
    else if (ms.includes("separ")) p.maritalStatus = "separated";
    else if (ms.includes("divorc")) p.maritalStatus = "divorced";
    else if (ms.includes("veuf") || ms.includes("veuve")) p.maritalStatus = "widowed";

    // Dependants
    p.numberOfDependents = client.dependants || 0;

    // Location
    if (client.currentCountry) {
      p.currentCountry = client.currentCountry;
      if (client.currentCountry.toLowerCase() === "canada") {
        p.isInCanada = true;
        if (client.province === "QC") p.isInQuebec = true;
      }
    }

    // Education
    const edu = (client.education || "").toLowerCase();
    if (edu.includes("doctorat") || edu.includes("phd")) p.highestEducation = "phd";
    else if (edu.includes("maitrise") || edu.includes("master") || edu.includes("mba")) p.highestEducation = "masters";
    else if (edu.includes("baccalaureat") || edu.includes("bachelor")) p.highestEducation = "bachelors";
    else if (edu.includes("dec") || edu.includes("2 ans")) p.highestEducation = "two_year_diploma";
    else if (edu.includes("dep") || edu.includes("aec") || edu.includes("1 an")) p.highestEducation = "one_year_diploma";
    else if (edu.includes("secondaire")) p.highestEducation = "secondary";

    // Languages
    function parseCLB(str: string): number {
      const m = str.match(/(\d+)/);
      return m ? parseInt(m[1]) : 5;
    }
    if (client.languageFrench) {
      const nclc = parseCLB(client.languageFrench);
      if (nclc >= 10) p.frenchLevel = "native";
      else if (nclc >= 7) p.frenchLevel = "advanced";
      else if (nclc >= 5) p.frenchLevel = "intermediate";
      else if (nclc >= 1) p.frenchLevel = "basic";
      p.frenchNCLC = nclc;
    }
    if (client.languageEnglish) {
      const clb = parseCLB(client.languageEnglish);
      if (clb >= 10) p.englishLevel = "native";
      else if (clb >= 7) p.englishLevel = "advanced";
      else if (clb >= 5) p.englishLevel = "intermediate";
      else if (clb >= 1) p.englishLevel = "basic";
      p.englishCLB = clb;
    }

    // Work experience
    const expMatch = (client.workExperience || "").match(/(\d+)\s*ans?/i);
    if (expMatch) {
      const years = parseInt(expMatch[1]);
      p.totalWorkExperienceYears = years;
      if (client.currentCountry?.toLowerCase() === "canada") {
        p.canadianWorkExperienceYears = years;
        if (client.province === "QC") p.quebecWorkExperienceYears = years;
      }
    }

    // Current status
    const status = (client.currentStatus || "").toLowerCase();
    if (status.includes("etudiant") || status.includes("student")) p.currentStatus = "student";
    else if (status.includes("travail") || status.includes("worker")) p.currentStatus = "worker";
    else if (status.includes("visiteur") || status.includes("visitor") || status.includes("touriste")) p.currentStatus = "visitor";
    else if (status.includes("refugi") || status.includes("asile")) p.currentStatus = "refugee_claimant";
    else if (status.includes("resident") || status.includes("pr")) p.currentStatus = "pr";

    setProfile(p);
  }

  // Run analysis
  function runAnalysis() {
    setIsAnalyzing(true);
    // Small delay for animation effect
    setTimeout(() => {
      const clientName = selectedClientId
        ? (() => { const c = clients.find((cl) => cl.id === selectedClientId); return c ? `${c.firstName} ${c.lastName}` : "Client"; })()
        : "Nouveau profil";
      const result = analyzeEligibility(profile, clientName);
      setAnalysis(result);
      setShowResults(true);
      setIsAnalyzing(false);
    }, 800);
  }

  // ─── Send analysis by email — best practice ────────────────
  // Pre-fills client email, builds rich HTML body with CRS/MIFI scores,
  // links to CRM via clientId, persists notification state, handles errors
  const sendAnalysisByEmail = useCallback(async (
    analysisData: EligibilityAnalysis,
    opts: { crsTotal?: number; mifiTotal?: number; fswTotal?: number } = {}
  ) => {
    if (isSending) return;
    const selectedClient = selectedClientId ? clients.find(c => c.id === selectedClientId) : null;
    const defaultEmail = selectedClient?.email || '';

    const toEmail = window.prompt(
      selectedClient
        ? `Confirmer le courriel pour ${selectedClient.firstName} ${selectedClient.lastName} :`
        : 'Courriel du client :',
      defaultEmail,
    );
    if (!toEmail || !toEmail.trim()) return;
    const emailTrim = toEmail.trim();

    // Simple client-side email validation to fail fast
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setNotification({ type: 'error', message: 'Adresse courriel invalide.' });
      return;
    }

    setIsSending(true);
    try {
      const eligible = analysisData.programs.filter(p => p.eligibility === 'eligible' || p.eligibility === 'likely_eligible');
      const possibly = analysisData.programs.filter(p => p.eligibility === 'possibly_eligible');
      const dateStr = new Date(analysisData.analysisDate).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
      const firstName = analysisData.clientName.split(' ')[0] || 'cher client';

      // Rich HTML email body — branded, scannable, mobile-friendly
      const programCards = eligible.slice(0, 5).map(p => `
        <tr><td style="padding:12px 16px;background:#f8f9fc;border-left:4px solid #D4A03C;border-radius:6px;">
          <div style="font-weight:700;color:#1B2559;font-size:15px;">${p.programNameFr}</div>
          <div style="color:#6b7280;font-size:13px;margin-top:4px;">Score : ${p.score}/100 &middot; D\u00e9lai : ${p.estimatedProcessingTime}</div>
          ${p.keyStrengths && p.keyStrengths.length ? `<div style="color:#16a34a;font-size:12px;margin-top:6px;"><strong>Points forts :</strong> ${p.keyStrengths.slice(0, 2).join(' &middot; ')}</div>` : ''}
        </td></tr>
        <tr><td style="height:8px;"></td></tr>
      `).join('');

      const scoresBlock = (opts.crsTotal || opts.mifiTotal || opts.fswTotal) ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
          <tr>
            ${opts.crsTotal ? `<td align="center" style="background:#1B2559;color:#fff;padding:12px;border-radius:8px;"><div style="font-size:11px;letter-spacing:1px;opacity:.8;">SCORE CRS</div><div style="font-size:22px;font-weight:800;">${opts.crsTotal}<span style="font-size:12px;opacity:.7;"> / 1200</span></div></td>` : ''}
            ${opts.crsTotal && opts.mifiTotal ? '<td width="8"></td>' : ''}
            ${opts.mifiTotal ? `<td align="center" style="background:#D4A03C;color:#fff;padding:12px;border-radius:8px;"><div style="font-size:11px;letter-spacing:1px;opacity:.9;">SCORE MIFI (QC)</div><div style="font-size:22px;font-weight:800;">${opts.mifiTotal}</div></td>` : ''}
          </tr>
        </table>
      ` : '';

      const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1a1a1a;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 12px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">
      <!-- Header -->
      <tr><td style="background:#1B2559;padding:24px 28px;">
        <div style="font-size:20px;font-weight:800;color:#fff;">SOS <span style="color:#D4A03C;">HUB</span> CANADA</div>
        <div style="color:#D4A03C;font-size:10px;font-weight:700;letter-spacing:2px;margin-top:4px;">RELOCALISATION &amp; SERVICES PROFESSIONNELS</div>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:28px;">
        <h1 style="font-size:20px;color:#1B2559;margin:0 0 8px;">Votre analyse d'admissibilit\u00e9</h1>
        <p style="color:#6b7280;font-size:13px;margin:0 0 20px;">R\u00e9alis\u00e9e le ${dateStr}</p>
        <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Bonjour <strong>${firstName}</strong>,</p>
        <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Merci de votre confiance. Suite \u00e0 l'analyse compl\u00e8te de votre profil, voici nos conclusions :</p>
        <div style="background:#f0f4ff;border-left:4px solid #1B2559;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0;">
          <div style="font-size:11px;color:#1B2559;font-weight:700;letter-spacing:1px;margin-bottom:6px;">R\u00c9SUM\u00c9</div>
          <div style="font-size:14px;line-height:1.6;color:#333;">${analysisData.overallSummary || 'Analyse compl\u00e9t\u00e9e.'}</div>
        </div>
        ${scoresBlock}
        ${eligible.length > 0 ? `
          <h2 style="font-size:16px;color:#1B2559;margin:24px 0 12px;">\u2605 Programmes recommand\u00e9s (${eligible.length})</h2>
          <table width="100%" cellpadding="0" cellspacing="0">${programCards}</table>
        ` : `
          <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin:20px 0;">
            <div style="font-weight:700;color:#92400e;font-size:14px;">Aucun programme imm\u00e9diatement accessible</div>
            <div style="color:#78350f;font-size:13px;margin-top:6px;">Ne vous d\u00e9couragez pas : avec un plan d'am\u00e9lioration cibl\u00e9, vous pourrez devenir admissible. Contactez-nous pour en parler.</div>
          </div>
        `}
        ${possibly.length > 0 ? `<p style="font-size:13px;color:#6b7280;margin:12px 0;"><em>${possibly.length} autre(s) programme(s) sont \u00e9galement possibles avec quelques ajustements.</em></p>` : ''}
        <div style="background:#fffbf0;border:1px solid #D4A03C;border-radius:8px;padding:16px 20px;margin:24px 0;">
          <div style="font-size:11px;color:#D4A03C;font-weight:700;letter-spacing:1px;margin-bottom:6px;">RECOMMANDATION PRINCIPALE</div>
          <div style="font-size:14px;line-height:1.6;color:#333;">${analysisData.topRecommendation || 'Nous vous contacterons sous peu pour d\u00e9finir la meilleure strat\u00e9gie.'}</div>
        </div>
        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 12px;">
          <tr><td align="center">
            <a href="https://wa.me/14386302869?text=${encodeURIComponent('Bonjour, j\'ai re\u00e7u mon analyse d\'admissibilit\u00e9 et je souhaite discuter de la suite.')}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">Discuter sur WhatsApp</a>
          </td></tr>
        </table>
        <p style="text-align:center;font-size:12px;color:#9ca3af;margin:8px 0 0;">R\u00e9ponse moyenne : moins de 2 heures</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8f9fc;padding:20px 28px;border-top:1px solid #e5e7eb;">
        <div style="font-size:12px;color:#6b7280;line-height:1.6;">
          <strong style="color:#1B2559;">SOS Hub Canada Inc.</strong><br>
          3737, boul. Cr\u00e9mazie Est, bureau 402, Montr\u00e9al (Qu\u00e9bec) H1Z 2K4<br>
          T\u00e9l. : <a href="tel:+15145330482" style="color:#1B2559;text-decoration:none;">514-533-0482</a> &middot;
          WhatsApp : <a href="https://wa.me/14386302869" style="color:#1B2559;text-decoration:none;">438-630-2869</a><br>
          Courriel : <a href="mailto:info@soshubcanada.com" style="color:#1B2559;text-decoration:none;">info@soshubcanada.com</a>
        </div>
        <div style="font-size:10px;color:#9ca3af;margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;">
          Ce rapport est fourni \u00e0 titre indicatif et ne constitue pas un avis juridique.
          Les d\u00e9cisions finales rel\u00e8vent des autorit\u00e9s gouvernementales comp\u00e9tentes.
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

      const res = await crmFetch('/api/crm/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient?.id || null,
          toEmail: emailTrim,
          subject: `Votre analyse d'admissibilit\u00e9 \u2014 SOS Hub Canada`,
          emailBody: htmlBody,
          type: 'analysis',
          sentBy: currentUser?.id || null,
          from_name: 'SOS Hub Canada',
          reply_to: 'info@soshubcanada.com',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      // Tag client with a follow-up note on success
      if (selectedClient?.email) {
        try {
          await crmFetch('/api/crm/sync-client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: selectedClient.email,
              firstName: selectedClient.firstName,
              lastName: selectedClient.lastName,
              source: 'analyse_admissibilite',
              notes: `\n\u2500\u2500\u2500 Analyse envoy\u00e9e le ${dateStr} \u2500\u2500\u2500\nR\u00e9cipiendaire : ${emailTrim}\nProgrammes admissibles : ${eligible.map(p => p.programNameFr).join(', ') || 'Aucun'}\nSuivi requis : oui`,
            }),
          });
        } catch { /* best effort only */ }
      }

      setNotification({
        type: 'success',
        message: `Analyse envoy\u00e9e \u00e0 ${emailTrim}${selectedClient ? ' et not\u00e9e au dossier client' : ''}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setNotification({ type: 'error', message: `\u00c9chec de l'envoi : ${msg}` });
    } finally {
      setIsSending(false);
    }
  }, [isSending, selectedClientId, clients, currentUser]);

  // CRS / FSW computed
  const crsResult = useMemo(() => calculateCRSScore(profile), [profile]);
  const fswResult = useMemo(() => calculateFSWPoints(profile), [profile]);

  // ─── WIZARD STEPS ──────────────────────────────────────

  function renderStep1() {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <InputField label="Age" type="number" value={profile.age} onChange={(v) => updateProfile({ age: parseInt(v) || 18 })} min={0} max={99} />
        <InputField label="Nationalite" value={profile.nationality} onChange={(v) => updateProfile({ nationality: v })} placeholder="Ex: France, Maroc, Cameroun..." />
        <SelectField label="Situation matrimoniale" value={profile.maritalStatus} onChange={(v) => updateProfile({ maritalStatus: v, hasSpouse: v === "married" || v === "common_law" })} options={MARITAL_OPTIONS} />
        {(profile.maritalStatus === "married" || profile.maritalStatus === "common_law") && (
          <Toggle checked={profile.hasSpouse} onChange={(v) => updateProfile({ hasSpouse: v })} label="Conjoint(e) vous accompagne ?" />
        )}
        <InputField label="Nombre de personnes a charge" type="number" value={profile.numberOfDependents} onChange={(v) => updateProfile({ numberOfDependents: parseInt(v) || 0 })} min={0} max={20} />
        <InputField label="Pays de residence actuel" value={profile.currentCountry} onChange={(v) => updateProfile({ currentCountry: v })} placeholder="Ex: Canada, France..." />
        <Toggle checked={profile.isInCanada} onChange={(v) => updateProfile({ isInCanada: v, isInQuebec: v ? profile.isInQuebec : false })} label="Etes-vous au Canada ?" />
        {profile.isInCanada && (
          <>
            <Toggle checked={profile.isInQuebec} onChange={(v) => updateProfile({ isInQuebec: v })} label="Etes-vous au Quebec ?" />
            <InputField label="Annees au Canada" type="number" value={profile.yearsInCanada} onChange={(v) => updateProfile({ yearsInCanada: parseInt(v) || 0 })} min={0} max={50} />
            {profile.isInQuebec && (
              <InputField label="Annees au Quebec" type="number" value={profile.yearsInQuebec} onChange={(v) => updateProfile({ yearsInQuebec: parseInt(v) || 0 })} min={0} max={50} />
            )}
          </>
        )}
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <SelectField label="Plus haut niveau d'education" value={profile.highestEducation} onChange={(v) => updateProfile({ highestEducation: v })} options={EDUCATION_OPTIONS} />
        <Toggle checked={profile.hasCanadianEducation} onChange={(v) => updateProfile({ hasCanadianEducation: v })} label="Diplome canadien ?" />
        {profile.hasCanadianEducation && (
          <InputField label="Province du diplome" value={profile.canadianEducationProvince || ""} onChange={(v) => updateProfile({ canadianEducationProvince: v })} placeholder="Ex: Quebec, Ontario..." />
        )}
        <Toggle checked={profile.hasECA} onChange={(v) => updateProfile({ hasECA: v })} label="Evaluation des diplomes (ECA) ?" />
        <InputField label="Domaine d'etudes" value={profile.fieldOfStudy || ""} onChange={(v) => updateProfile({ fieldOfStudy: v })} placeholder="Ex: Informatique, Genie civil..." />
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <SelectField label="Niveau de francais" value={profile.frenchLevel} onChange={(v) => updateProfile({ frenchLevel: v as ClientProfile["frenchLevel"] })} options={LANGUAGE_LEVEL_OPTIONS as { value: ClientProfile["frenchLevel"]; label: string }[]} />
        <InputField label="Score NCLC (optionnel, 1-12)" type="number" value={profile.frenchNCLC ?? ""} onChange={(v) => updateProfile({ frenchNCLC: v ? parseInt(v) : undefined })} min={1} max={12} placeholder="Ex: 7" />
        <SelectField label="Niveau d'anglais" value={profile.englishLevel} onChange={(v) => updateProfile({ englishLevel: v as ClientProfile["englishLevel"] })} options={LANGUAGE_LEVEL_OPTIONS as { value: ClientProfile["englishLevel"]; label: string }[]} />
        <InputField label="Score CLB (optionnel, 1-12)" type="number" value={profile.englishCLB ?? ""} onChange={(v) => updateProfile({ englishCLB: v ? parseInt(v) : undefined })} min={1} max={12} placeholder="Ex: 7" />
        <Toggle checked={profile.hasLanguageTest} onChange={(v) => updateProfile({ hasLanguageTest: v })} label="Test de langue passe ?" />
        {profile.hasLanguageTest && (
          <SelectField label="Type de test" value={profile.languageTestType || "TEF"} onChange={(v) => updateProfile({ languageTestType: v as ClientProfile["languageTestType"] })} options={TEST_TYPE_OPTIONS} />
        )}
      </div>
    );
  }

  function renderStep4() {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <InputField label="Annees d'experience totale" type="number" value={profile.totalWorkExperienceYears} onChange={(v) => updateProfile({ totalWorkExperienceYears: parseInt(v) || 0 })} min={0} max={50} />
        <InputField label="Annees d'experience au Canada" type="number" value={profile.canadianWorkExperienceYears} onChange={(v) => updateProfile({ canadianWorkExperienceYears: parseInt(v) || 0 })} min={0} max={50} />
        <InputField label="Annees d'experience au Quebec" type="number" value={profile.quebecWorkExperienceYears} onChange={(v) => updateProfile({ quebecWorkExperienceYears: parseInt(v) || 0 })} min={0} max={50} />
        <InputField label="Code CNP/NOC (optionnel)" value={profile.currentOccupationNOC || ""} onChange={(v) => updateProfile({ currentOccupationNOC: v || undefined })} placeholder="Ex: 21232" />
        <SelectField
          label="Categorie FEER"
          value={String(profile.nocTEER ?? "") as string}
          onChange={(v) => updateProfile({ nocTEER: v !== "" ? (parseInt(v) as 0 | 1 | 2 | 3 | 4 | 5) : undefined })}
          options={[{ value: "" as string, label: "-- Non specifie --" }, ...TEER_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))]}
        />
        <Toggle checked={profile.hasJobOffer} onChange={(v) => updateProfile({ hasJobOffer: v })} label="Offre d'emploi au Canada ?" />
        {profile.hasJobOffer && (
          <>
            <InputField label="Province de l'offre" value={profile.jobOfferProvince || ""} onChange={(v) => updateProfile({ jobOfferProvince: v })} placeholder="Ex: Ontario, Quebec..." />
            <Toggle checked={profile.isJobOfferLMIA || false} onChange={(v) => updateProfile({ isJobOfferLMIA: v })} label="EIMT / LMIA obtenue ?" />
          </>
        )}
      </div>
    );
  }

  function renderStep5() {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <Toggle checked={profile.hasRelativeInCanada} onChange={(v) => updateProfile({ hasRelativeInCanada: v })} label="Parent / famille au Canada ?" />
        {profile.hasRelativeInCanada && (
          <InputField label="Lien familial" value={profile.relativeRelationship || ""} onChange={(v) => updateProfile({ relativeRelationship: v })} placeholder="Ex: frere, soeur, parent..." />
        )}
        <SelectField label="Statut actuel" value={profile.currentStatus || "none"} onChange={(v) => updateProfile({ currentStatus: v })} options={STATUS_OPTIONS} />
        <Toggle checked={profile.hasValidPermit} onChange={(v) => updateProfile({ hasValidPermit: v })} label="Permis valide actuellement ?" />
        <InputField label="Fonds disponibles en $CAD" type="number" value={profile.settlementFunds} onChange={(v) => updateProfile({ settlementFunds: parseInt(v) || 0 })} min={0} placeholder="Ex: 15000" />
        <Toggle checked={profile.isRefugee} onChange={(v) => updateProfile({ isRefugee: v })} label="Demandeur d'asile ?" />
        <Toggle checked={profile.hasCriminalRecord} onChange={(v) => updateProfile({ hasCriminalRecord: v })} label="Casier judiciaire ?" />
        <Toggle checked={profile.hasMedicalIssue} onChange={(v) => updateProfile({ hasMedicalIssue: v })} label="Probleme medical ?" />
        <Toggle checked={profile.hasBusinessExperience} onChange={(v) => updateProfile({ hasBusinessExperience: v })} label="Experience en affaires ?" />
      </div>
    );
  }

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  // ─── RESULTS VIEW ──────────────────────────────────────

  function renderResults() {
    if (!analysis) return null;

    const eligiblePrograms = analysis.programs.filter((p) => p.eligibility === "eligible" || p.eligibility === "likely_eligible");
    const possiblePrograms = analysis.programs.filter((p) => p.eligibility === "possibly_eligible");
    const notEligiblePrograms = analysis.programs.filter((p) => p.eligibility === "not_eligible" || p.eligibility === "ended");

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
        {/* Back button */}
        <button
          onClick={() => setShowResults(false)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2559] transition-colors"
        >
          <ChevronLeft size={16} /> Retour au questionnaire
        </button>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-[#1B2559] to-[#2a3a7a] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Shield size={28} className="text-[#D4A03C]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold">Resultat de l&apos;analyse</h2>
                <span className="text-xs bg-[#D4A03C]/20 text-[#D4A03C] px-2 py-0.5 rounded-full">{analysis.clientName}</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{analysis.overallSummary}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
                <span className="flex items-center gap-1"><Clock size={12} /> Analyse du {analysis.analysisDate}</span>
                <span className="flex items-center gap-1"><Award size={12} /> {eligiblePrograms.length} programme(s) admissible(s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* CRS + FSW Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CRS Gauge */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe2 size={16} className="text-[#1B2559]" />
              Score CRS estime (Entree express)
            </h3>
            <CRSGauge score={crsResult.total} />
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-500">Capital humain</div>
                <div className="font-bold text-gray-900">{crsResult.breakdown.coreHumanCapital.subtotal}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-500">Conjoint(e)</div>
                <div className="font-bold text-gray-900">{crsResult.breakdown.spouseFactors.subtotal}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-500">Transf. competences</div>
                <div className="font-bold text-gray-900">{crsResult.breakdown.skillTransferability.subtotal}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-gray-500">Facteurs additionnels</div>
                <div className="font-bold text-gray-900">{crsResult.breakdown.additionalFactors.subtotal}</div>
              </div>
            </div>
          </div>

          {/* FSW Points */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#1B2559]" />
              Grille FSW (67 points)
            </h3>
            <FSWBar score={fswResult.total} />
            <div className="mt-4 space-y-2">
              {[
                { label: "Age", value: fswResult.breakdown.age, max: 12 },
                { label: "Education", value: fswResult.breakdown.education, max: 25 },
                { label: "1re langue", value: fswResult.breakdown.firstLanguage, max: 24 },
                { label: "2e langue", value: fswResult.breakdown.secondLanguage, max: 4 },
                { label: "Experience", value: fswResult.breakdown.workExperience, max: 15 },
                { label: "Emploi reserve", value: fswResult.breakdown.arrangedEmployment, max: 10 },
                { label: "Adaptabilite", value: fswResult.breakdown.adaptability, max: 10 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <span className="w-24 text-gray-500 shrink-0">{item.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1B2559] rounded-full" style={{ width: `${item.max > 0 ? (item.value / item.max) * 100 : 0}%` }} />
                  </div>
                  <span className="text-gray-700 font-medium w-10 text-right">{item.value}/{item.max}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Program Cards */}
        {eligiblePrograms.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Programmes admissibles ({eligiblePrograms.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligiblePrograms.map((p) => <ProgramCard key={p.programId} program={p} />)}
            </div>
          </div>
        )}
        {possiblePrograms.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Possiblement admissible ({possiblePrograms.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {possiblePrograms.map((p) => <ProgramCard key={p.programId} program={p} />)}
            </div>
          </div>
        )}
        {notEligiblePrograms.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <XCircle size={16} className="text-gray-400" />
              Non admissible ({notEligiblePrograms.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notEligiblePrograms.map((p) => <ProgramCard key={p.programId} program={p} />)}
            </div>
          </div>
        )}

        {/* Top 3 Recommendations */}
        <div className="bg-gradient-to-br from-[#D4A03C]/5 to-[#D4A03C]/10 border border-[#D4A03C]/20 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-[#D4A03C]" />
            Plan d&apos;action recommande
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">{analysis.topRecommendation}</p>
          <div className="space-y-3">
            {analysis.programs
              .filter((p) => p.eligibility === "eligible" || p.eligibility === "likely_eligible")
              .slice(0, 3)
              .map((p, i) => (
                <div key={p.programId} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-[#D4A03C]/10">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#D4A03C] text-white text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{p.programNameFr}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Score: {p.score}/100 &middot; {p.estimatedProcessingTime} &middot; {p.governmentFees.toLocaleString("fr-CA")} $</div>
                    {p.recommendations.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">{p.recommendations[0]}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (!analysis) return;
              const w = window.open('', '_blank');
              if (!w) return;
              const eligible = analysis.programs.filter(p => p.eligibility === 'eligible' || p.eligibility === 'likely_eligible');
              const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Analyse d'admissibilité - ${analysis.clientName}</title>
              <style>body{font-family:system-ui;max-width:800px;margin:0 auto;padding:40px;color:#333}
              h1{color:#1B2559;border-bottom:3px solid #D4A03C;padding-bottom:10px}
              h2{color:#1B2559;margin-top:30px}h3{color:#D4A03C}
              .badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600}
              .green{background:#dcfce7;color:#166534}.blue{background:#dbeafe;color:#1e40af}
              .amber{background:#fef3c7;color:#92400e}.red{background:#fee2e2;color:#991b1b}
              .gray{background:#f3f4f6;color:#6b7280}
              .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:12px 0}
              .strength{color:#16a34a}.missing{color:#dc2626}.rec{color:#2563eb}
              ul{padding-left:20px}li{margin:4px 0}
              .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;text-align:center}
              @media print{body{padding:20px}}</style></head><body>
              <h1>Analyse d'admissibilité</h1>
              <p><strong>Client :</strong> ${analysis.clientName}</p>
              <p><strong>Date :</strong> ${new Date(analysis.analysisDate).toLocaleDateString('fr-CA')}</p>
              ${crsResult ? `<p><strong>Score CRS estimé :</strong> ${crsResult.total} / 1200</p>` : ''}
              ${fswResult ? `<p><strong>Points FSW :</strong> ${fswResult.total} / 100 ${fswResult.total >= 67 ? '✅ Admissible' : '❌ Insuffisant'}</p>` : ''}
              <h2>Résumé</h2><p>${analysis.overallSummary}</p>
              <h2>Recommandation principale</h2><p>${analysis.topRecommendation}</p>
              <h2>Programmes admissibles (${eligible.length})</h2>
              ${analysis.programs.map(p => `<div class="card">
                <h3>${p.programNameFr} <span class="badge ${
                  p.eligibility === 'eligible' ? 'green' : p.eligibility === 'likely_eligible' ? 'blue' :
                  p.eligibility === 'possibly_eligible' ? 'amber' : p.eligibility === 'ended' ? 'gray' : 'red'
                }">${p.eligibility === 'eligible' ? 'Admissible' : p.eligibility === 'likely_eligible' ? 'Probablement admissible' :
                  p.eligibility === 'possibly_eligible' ? 'Possiblement admissible' : p.eligibility === 'ended' ? 'Terminé' : 'Non admissible'}</span></h3>
                <p>Score : ${p.score}/100 | Priorité : ${'★'.repeat(p.priority)}${'☆'.repeat(5-p.priority)} | Délai : ${p.estimatedProcessingTime} | Frais gouv. : ${p.governmentFees} $</p>
                ${p.keyStrengths.length ? `<p class="strength"><strong>✅ Points forts :</strong></p><ul>${p.keyStrengths.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
                ${p.missingRequirements.length ? `<p class="missing"><strong>❌ Exigences manquantes :</strong></p><ul>${p.missingRequirements.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
                ${p.recommendations.length ? `<p class="rec"><strong>💡 Recommandations :</strong></p><ul>${p.recommendations.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
                ${p.notes ? `<p><em>${p.notes}</em></p>` : ''}
              </div>`).join('')}
              <div class="footer"><p>Rapport généré par SOS Hub Canada — Système exclusif d'analyse d'admissibilité</p>
              <p>Ce rapport est fourni à titre indicatif uniquement et ne constitue pas un avis juridique.</p></div>
              </body></html>`;
              w.document.write(html);
              w.document.close();
              setTimeout(() => w.print(), 500);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B2559] text-white rounded-lg text-sm font-medium hover:bg-[#1B2559]/90 transition-colors">
            <FileText size={16} /> Générer rapport PDF
          </button>
          <button
            onClick={async () => {
              if (!analysis) return;
              // Sauvegarder localement
              const saved = JSON.parse(localStorage.getItem('soshub_analyses') || '[]');
              saved.unshift({ ...analysis, savedAt: new Date().toISOString() });
              localStorage.setItem('soshub_analyses', JSON.stringify(saved.slice(0, 50)));
              // Sync vers Supabase via API unifiée (met à jour le profil client)
              const selectedClient = selectedClientId ? clients.find(c => c.id === selectedClientId) : null;
              if (selectedClient?.email) {
                try {
                  const eligible = analysis.programs?.filter((p: any) => p.eligibility === 'eligible' || p.eligibility === 'likely_eligible') || [];
                  await fetch('/api/crm/sync-client', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: selectedClient.email,
                      firstName: selectedClient.firstName,
                      lastName: selectedClient.lastName,
                      source: 'analyse_admissibilite',
                      notes: `\n═══ ANALYSE IMMIGRATION ═══\nDate: ${new Date().toLocaleDateString('fr-CA')}\nRésumé: ${analysis.overallSummary || ''}\nProgrammes admissibles: ${eligible.map((p: any) => p.programNameFr).join(', ') || 'Aucun'}`,
                    }),
                  });
                } catch { /* sync failed silently */ }
              }
              alert('Analyse sauvegardée avec succès !');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D4A03C] text-white rounded-lg text-sm font-medium hover:bg-[#D4A03C]/90 transition-colors">
            <Save size={16} /> Sauvegarder l&apos;analyse
          </button>
          <button
            onClick={() => analysis && sendAnalysisByEmail(analysis)}
            disabled={isSending || !analysis}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Send size={16} /> {isSending ? 'Envoi en cours...' : 'Envoyer au client'}
          </button>
        </div>
        {/* In-page notification (replaces alert()) */}
        {notification && (
          <div className={`mt-4 flex items-start justify-between gap-3 p-4 rounded-xl border ${
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
            'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center gap-2 text-sm">
              {notification.type === 'error' ? <XCircle size={16} /> : notification.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-sm font-medium hover:underline shrink-0">Fermer</button>
          </div>
        )}
      </div>
    );
  }

  // ─── CRS/MIFI scoring for premium report ────────────────
  const scoringProfile = useMemo<ScoringProfile>(() => {
    const p = getDefaultProfile();
    p.age = profile.age;
    const eduMap: Record<string, EducationLevel> = {
      none: "secondary", secondary: "secondary", one_year_diploma: "one_year_post_secondary",
      two_year_diploma: "two_year_post_secondary", three_year_diploma: "two_year_post_secondary",
      bachelors: "bachelors", two_or_more: "two_or_more_post_secondary",
      masters: "masters", doctorate: "doctoral",
    };
    p.educationLevel = eduMap[profile.highestEducation] || "bachelors";
    p.firstLanguage = "french";
    const frNclc = profile.frenchNCLC || 5;
    const enClb = profile.englishCLB || 4;
    p.firstLanguageScores = { speaking: frNclc, listening: frNclc, reading: frNclc, writing: frNclc };
    p.secondLanguageScores = { speaking: enClb, listening: enClb, reading: enClb, writing: enClb };
    p.canadianWorkExperienceYears = profile.canadianWorkExperienceYears;
    p.foreignWorkExperienceYears = Math.max(0, profile.totalWorkExperienceYears - profile.canadianWorkExperienceYears);
    p.validJobOffer = profile.hasJobOffer;
    p.provincialNomination = false;
    p.foreignCredentialECA = profile.hasECA;
    if (profile.hasSpouse) {
      p.maritalStatus = "married_common_law";
      p.spouseAccompanying = true;
      p.spouseEducation = eduMap[profile.spouseEducation || ""] || "secondary";
      p.spouseCanadianExperienceYears = profile.spouseCanadianWorkYears || 0;
      const spFr = profile.spouseFrenchNCLC || 0;
      const spEn = profile.spouseEnglishCLB || 0;
      if (spFr > 0 || spEn > 0) {
        p.spouseLanguageScores = { speaking: spFr || spEn, listening: spFr || spEn, reading: spFr || spEn, writing: spFr || spEn };
      }
    }
    p.sejourQuebec = !!profile.isInQuebec;
    p.familleQuebec = !!profile.hasRelativeInCanada;
    p.enfants = profile.numberOfDependents;
    p.offreEmploiValidee = !!profile.isJobOfferLMIA;
    return p;
  }, [profile]);

  const crsBreakdown = useMemo(() => calculateCRS(scoringProfile), [scoringProfile]);
  const mifiBreakdown = useMemo(() => calculateMIFI(scoringProfile), [scoringProfile]);
  const crsAdvice = useMemo(() => getCrsImprovementAdvice(scoringProfile, crsBreakdown), [scoringProfile, crsBreakdown]);
  const mifiAdvice = useMemo(() => getMifiImprovementAdvice(scoringProfile, mifiBreakdown), [scoringProfile, mifiBreakdown]);

  // ─── MAIN RENDER ───────────────────────────────────────

  if (showResults && analysis) {
    return (
      <div className="space-y-6">
        <button onClick={() => setShowResults(false)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2559] transition-colors">
          <ChevronLeft size={16} /> Retour au formulaire
        </button>
        <PremiumReport
          analysis={analysis}
          crsBreakdown={crsBreakdown}
          mifiBreakdown={mifiBreakdown}
          crsAdvice={crsAdvice}
          mifiAdvice={mifiAdvice}
          isPremium={true}
          onExportPDF={() => {
            const w = window.open('', '_blank');
            if (!w) return;
            const eligible = analysis.programs.filter(p => p.eligibility === 'eligible' || p.eligibility === 'likely_eligible');
            const eligMap: Record<string, [string, string]> = {
              eligible: ['Admissible', 'green'], likely_eligible: ['Probablement admissible', 'blue'],
              possibly_eligible: ['Possiblement admissible', 'amber'], not_eligible: ['Non admissible', 'red'], ended: ['Terminé', 'gray']
            };
            const programsHtml = analysis.programs.map(p => {
              const [lbl, cls] = eligMap[p.eligibility] || ['—', 'gray'];
              let html = '<div class="card"><h3>' + p.programNameFr + ' <span class="badge ' + cls + '">' + lbl + '</span></h3>';
              html += '<p>Score : ' + p.score + '/100 | Délai : ' + p.estimatedProcessingTime + '</p>';
              if (p.keyStrengths.length) html += '<p class="strength"><strong>Points forts :</strong></p><ul>' + p.keyStrengths.map(s => '<li>' + s + '</li>').join('') + '</ul>';
              if (p.missingRequirements.length) html += '<p class="missing"><strong>Exigences manquantes :</strong></p><ul>' + p.missingRequirements.map(s => '<li>' + s + '</li>').join('') + '</ul>';
              if (p.recommendations.length) html += '<p class="rec"><strong>Recommandations :</strong></p><ul>' + p.recommendations.map(s => '<li>' + s + '</li>').join('') + '</ul>';
              return html + '</div>';
            }).join('');
            const adviceHtml = (crsAdvice && crsAdvice.length > 0) ? "<h2>Plan d'amélioration</h2>" + crsAdvice.map((a, i) => '<div class="card"><strong>' + (i+1) + '. ' + a.category + '</strong> <span class="badge green">+' + (a.maxPoints - a.currentPoints) + ' pts potentiels</span><p>' + a.advice + '</p></div>').join('') : '';
            const css = 'body{font-family:system-ui;max-width:800px;margin:0 auto;padding:40px;color:#333}h1{color:#1B2559;border-bottom:3px solid #D4A03C;padding-bottom:10px}h2{color:#1B2559;margin-top:30px}h3{color:#D4A03C}.badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600}.green{background:#dcfce7;color:#166534}.blue{background:#dbeafe;color:#1e40af}.amber{background:#fef3c7;color:#92400e}.red{background:#fee2e2;color:#991b1b}.gray{background:#f3f4f6;color:#6b7280}.card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:12px 0}.strength{color:#16a34a}.missing{color:#dc2626}.rec{color:#2563eb}ul{padding-left:20px}li{margin:4px 0}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;text-align:center}@media print{body{padding:20px}}';
            const fullHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Analyse - ' + analysis.clientName + '</title><style>' + css + '</style></head><body>' +
              '<div style="text-align:center;margin-bottom:30px"><div style="font-size:28px;font-weight:900;color:#1B2559">[ SOS <span style="color:#D4A03C">HUB</span> ]</div><div style="color:#D4A03C;font-size:11px;font-weight:700;letter-spacing:4px">RELOCALISATION &amp; SERVICES</div></div>' +
              '<h1>Rapport d\'analyse — PREMIUM</h1>' +
              '<p><strong>Client :</strong> ' + analysis.clientName + '</p>' +
              '<p><strong>Date :</strong> ' + new Date(analysis.analysisDate).toLocaleDateString('fr-CA') + '</p>' +
              (crsBreakdown ? '<p><strong>Score CRS :</strong> ' + crsBreakdown.total + ' / 1200</p>' : '') +
              (mifiBreakdown ? '<p><strong>Score MIFI :</strong> ' + mifiBreakdown.total + '</p>' : '') +
              '<h2>Résumé</h2><p>' + analysis.overallSummary + '</p>' +
              '<h2>Recommandation principale</h2><p>' + analysis.topRecommendation + '</p>' +
              '<h2>Programmes (' + eligible.length + ' admissibles sur ' + analysis.programs.length + ')</h2>' +
              programsHtml + adviceHtml +
              '<div class="footer"><p><strong>SOS Hub Canada</strong> | +1 (438) 630-2869 | info@soshubcanada.com</p><p>3737 Crémazie Est #402, Montréal QC H1Z 2K4</p><p style="margin-top:12px">Ce rapport est fourni à titre indicatif et ne constitue pas un avis juridique.</p></div></body></html>';
            w.document.write(fullHtml);
            w.document.close();
            setTimeout(() => w.print(), 500);
          }}
          onSendEmail={() => analysis && sendAnalysisByEmail(analysis, {
            crsTotal: crsBreakdown?.total,
            mifiTotal: mifiBreakdown?.total,
            fswTotal: fswResult?.total,
          })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => { setMode("client"); setShowResults(false); }}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            mode === "client" ? "bg-white shadow text-[#1B2559]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <UserCheck size={16} />
          Selectionner un client existant
        </button>
        <button
          onClick={() => { setMode("new"); setShowResults(false); }}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            mode === "new" ? "bg-white shadow text-[#1B2559]" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Search size={16} />
          Nouvelle analyse de profil
        </button>
      </div>

      {/* Client Selector Mode */}
      {mode === "client" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} /> Charger un client
          </h2>
          <select
            value={selectedClientId}
            onChange={(e) => loadClient(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C] mb-4"
          >
            <option value="">-- Choisir un client --</option>
            {activeClients.map((c) => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.nationality || "N/A"})</option>
            ))}
          </select>
          {selectedClientId && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 flex items-center gap-2">
              <CheckCircle2 size={16} />
              Profil charge. Completez les champs manquants dans le questionnaire, puis lancez l&apos;analyse.
            </div>
          )}
        </div>
      )}

      {/* Wizard Form */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Progress Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Etapes</div>
            <div className="space-y-1">
              {STEPS.map((step) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isComplete = currentStep > step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                      isActive
                        ? "bg-[#1B2559] text-white shadow-md"
                        : isComplete
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${
                      isActive ? "bg-white/20" : isComplete ? "bg-emerald-200" : "bg-gray-100"
                    }`}>
                      {isComplete ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <StepIcon size={14} className={isActive ? "text-white" : "text-gray-400"} />
                      )}
                    </div>
                    <span className="truncate">{step.title}</span>
                  </button>
                );
              })}
            </div>
            {/* Progress bar */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Progression</span>
                <span className="font-semibold">{Math.round((currentStep / STEPS.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1B2559] to-[#D4A03C] rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              {(() => { const StepIcon = STEPS[currentStep - 1].icon; return <StepIcon size={20} className="text-[#1B2559]" />; })()}
              <div>
                <h2 className="font-semibold text-gray-900">{STEPS[currentStep - 1].title}</h2>
                <p className="text-xs text-gray-500">Etape {currentStep} sur {STEPS.length}</p>
              </div>
            </div>

            {/* Step Content */}
            {stepRenderers[currentStep - 1]()}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Precedent
              </button>
              <div className="flex items-center gap-3">
                {currentStep < STEPS.length ? (
                  <button
                    onClick={() => setCurrentStep((s) => Math.min(STEPS.length, s + 1))}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[#1B2559] text-white hover:bg-[#1B2559]/90 transition-colors shadow-sm"
                  >
                    Suivant <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#D4A03C] to-[#c4912c] text-white hover:from-[#c4912c] hover:to-[#b0811f] transition-all shadow-lg shadow-[#D4A03C]/20 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Shield size={16} /> Analyser l&apos;admissibilite
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live preview sidebar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp size={14} /> Apercu en temps reel
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#1B2559]">{crsResult.total}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Score CRS estime</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className={`text-2xl font-bold ${fswResult.total >= 67 ? "text-emerald-600" : "text-red-500"}`}>{fswResult.total}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Points FSW / 100</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
              <Info size={11} /> Les scores se mettent a jour en temps reel selon vos reponses.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCORING CONSTANTS ──────────────────────────────────

const SCORING_EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "secondary", label: "Secondaire (DES)" },
  { value: "one_year_post_secondary", label: "Postsecondaire 1 an (DEP, AEC)" },
  { value: "two_year_post_secondary", label: "Postsecondaire 2 ans (DEC)" },
  { value: "bachelors", label: "Baccalaureat" },
  { value: "two_or_more_post_secondary", label: "2+ diplomes postsecondaires" },
  { value: "masters", label: "Maitrise" },
  { value: "doctoral", label: "Doctorat" },
];

const CAN_EDUCATION_OPTIONS: { value: CanadianEducationLevel; label: string }[] = [
  { value: "none", label: "Aucune" },
  { value: "one_two_year", label: "1-2 ans" },
  { value: "three_year_or_more", label: "3 ans ou plus" },
];

// ─── SCORING SHARED HELPERS ─────────────────────────────

function ScoringLanguageInput({
  label,
  scores,
  onChange,
}: {
  label: string;
  scores: { speaking: number; listening: number; reading: number; writing: number };
  onChange: (skill: "speaking" | "listening" | "reading" | "writing", val: number) => void;
}) {
  const skills: { key: "speaking" | "listening" | "reading" | "writing"; label: string }[] = [
    { key: "speaking", label: "Expression orale" },
    { key: "listening", label: "Comprehension orale" },
    { key: "reading", label: "Comprehension ecrite" },
    { key: "writing", label: "Expression ecrite" },
  ];
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 mb-1.5">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        {skills.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-24 truncate" title={s.label}>{s.label}</label>
            <input
              type="number"
              min={1}
              max={12}
              value={scores[s.key]}
              onChange={(e) => onChange(s.key, parseInt(e.target.value) || 1)}
              className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoringToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded" />
      {label}
    </label>
  );
}

function ScoringScoreGauge({ score, max, label, threshold, thresholdLabel }: {
  score: number; max: number; label: string; threshold?: number; thresholdLabel?: string;
}) {
  const pct = Math.min((score / max) * 100, 100);
  const thresholdPct = threshold ? Math.min((threshold / max) * 100, 100) : undefined;
  const aboveThreshold = threshold ? score >= threshold : false;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="text-center mb-4">
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div className={`text-5xl font-bold ${aboveThreshold ? "text-green-600" : "text-[#1B2559]"}`}>
          {score}
        </div>
        <div className="text-sm text-gray-400">/ {max} points</div>
      </div>
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${aboveThreshold ? "bg-green-500" : "bg-[#D4A03C]"}`}
          style={{ width: `${pct}%` }}
        />
        {thresholdPct !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500"
            style={{ left: `${thresholdPct}%` }}
            title={thresholdLabel}
          />
        )}
      </div>
      {threshold !== undefined && (
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-gray-400">0</span>
          <span className={`font-medium ${aboveThreshold ? "text-green-600" : "text-red-500"}`}>
            {aboveThreshold ? (
              <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Au-dessus du seuil ({threshold})</span>
            ) : (
              <span className="flex items-center gap-1"><AlertTriangle size={12} /> {threshold - score} pts sous le seuil ({threshold})</span>
            )}
          </span>
          <span className="text-gray-400">{max}</span>
        </div>
      )}
    </div>
  );
}

function ScoringBreakdownRow({ label, points, max, icon }: { label: string; points: number; max: number; icon?: React.ReactNode }) {
  const pct = max > 0 ? Math.min((points / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2">
      {icon && <div className="text-gray-400">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700 truncate">{label}</span>
          <span className="text-sm font-semibold text-gray-900 shrink-0 ml-2">{points} <span className="text-gray-400 font-normal">/ {max}</span></span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#1B2559] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function ScoringAdvicePanel({ advice, title }: { advice: ImprovementAdvice[]; title: string }) {
  if (advice.length === 0) return null;

  const impactColorsMap: Record<string, string> = {
    "tres_eleve": "bg-red-50 border-red-200",
    "eleve": "bg-orange-50 border-orange-200",
    moyen: "bg-yellow-50 border-yellow-200",
    faible: "bg-gray-50 border-gray-200",
  };
  const impactBadgeMap: Record<string, string> = {
    "tres_eleve": "bg-red-100 text-red-700",
    "eleve": "bg-orange-100 text-orange-700",
    moyen: "bg-yellow-100 text-yellow-700",
    faible: "bg-gray-100 text-gray-600",
  };
  const impactLabels: Record<string, string> = {
    "tres_eleve": "Impact tres eleve",
    "eleve": "Impact eleve",
    moyen: "Impact moyen",
    faible: "Impact faible",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Lightbulb size={18} className="text-[#D4A03C]" /> {title}
      </h3>
      <div className="space-y-3">
        {advice.map((a, i) => (
          <div key={i} className={`rounded-lg border p-4 ${impactColorsMap[a.impact] || "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{a.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${impactBadgeMap[a.impact] || "bg-gray-100 text-gray-600"}`}>
                  {impactLabels[a.impact] || a.impact}
                </span>
              </div>
              <span className="text-xs text-gray-500 shrink-0">
                {a.currentPoints} / {a.maxPoints} pts
              </span>
            </div>
            <p className="text-sm text-gray-700">{a.advice}</p>
            {a.actionable && (
              <div className="flex items-center gap-1 mt-2 text-xs text-[#1B2559] font-medium">
                <ArrowRight size={12} /> Action recommandee
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SCORING FORM (shared between CRS and MIFI) ────────

function useScoringState() {
  const { clients } = useCrm();
  const [profile, setProfile] = useState<ScoringProfile>(getDefaultProfile());
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);

  function loadClientProfile(clientId: string) {
    setSelectedClientId(clientId);
    if (!clientId) return;
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    const p = { ...getDefaultProfile() };

    if (client.dateOfBirth) {
      const birth = new Date(client.dateOfBirth);
      const today = new Date();
      p.age = Math.floor((today.getTime() - birth.getTime()) / 31557600000);
    }

    const married = ['marie', 'mariee', 'marié', 'mariée', 'conjoint de fait', 'common_law', 'married'].includes((client.maritalStatus || '').toLowerCase());
    if (married) {
      p.maritalStatus = "married_common_law";
      p.spouseAccompanying = (client.familyMembers || []).some((fm: { relationship: string; accompany: boolean }) =>
        ["Epoux", "Epouse", "Conjoint", "Conjointe"].includes(fm.relationship) && fm.accompany
      );
    }

    const eduLower = (client.education || '').toLowerCase();
    if (eduLower.includes("doctorat") || eduLower.includes("phd")) p.educationLevel = "doctoral";
    else if (eduLower.includes("maitrise") || eduLower.includes("master") || eduLower.includes("mba")) p.educationLevel = "masters";
    else if (eduLower.includes("baccalaureat") || eduLower.includes("bachelor")) p.educationLevel = "bachelors";
    else if (eduLower.includes("dec") || eduLower.includes("2 ans")) p.educationLevel = "two_year_post_secondary";
    else if (eduLower.includes("dep") || eduLower.includes("aec") || eduLower.includes("1 an")) p.educationLevel = "one_year_post_secondary";

    function parseCLB(str: string): number {
      const m = str.match(/(\d+)/);
      return m ? parseInt(m[1]) : 5;
    }
    if (client.languageFrench) {
      const nclc = parseCLB(client.languageFrench);
      p.firstLanguage = "french";
      p.firstLanguageScores = { speaking: nclc, listening: nclc, reading: nclc, writing: nclc };
    }
    if (client.languageEnglish) {
      const clb = parseCLB(client.languageEnglish);
      if (p.firstLanguage === "french") {
        p.secondLanguageScores = { speaking: clb, listening: clb, reading: clb, writing: clb };
      } else {
        p.firstLanguage = "english";
        p.firstLanguageScores = { speaking: clb, listening: clb, reading: clb, writing: clb };
      }
    }

    const expMatch = (client.workExperience || '').match(/(\d+)\s*ans?/i);
    if (expMatch) {
      const years = parseInt(expMatch[1]);
      if (client.currentCountry === "Canada") {
        p.canadianWorkExperienceYears = years;
      } else {
        p.foreignWorkExperienceYears = years;
      }
    }

    p.enfants = client.dependants || 0;

    if (client.province === "QC" || client.currentCountry === "Canada") {
      p.sejourQuebec = true;
    }

    setProfile(p);
  }

  function updateProfile(partial: Partial<ScoringProfile>) {
    setProfile((prev) => ({ ...prev, ...partial }));
  }

  function updateLanguageScores(
    field: "firstLanguageScores" | "secondLanguageScores" | "spouseLanguageScores",
    skill: "speaking" | "listening" | "reading" | "writing",
    value: number
  ) {
    setProfile((prev) => {
      const current = prev[field] || { speaking: 5, listening: 5, reading: 5, writing: 5 };
      return { ...prev, [field]: { ...current, [skill]: value } };
    });
  }

  const crsBreakdown = useMemo(() => calculateCRS(profile), [profile]);
  const mifiBreakdown = useMemo(() => calculateMIFI(profile), [profile]);
  const crsAdvice = useMemo(() => getCrsImprovementAdvice(profile, crsBreakdown), [profile, crsBreakdown]);
  const mifiAdvice = useMemo(() => getMifiImprovementAdvice(profile, mifiBreakdown), [profile, mifiBreakdown]);

  const eligibleClients = clients.filter((c) => c.status !== "archive");

  return {
    profile, updateProfile, updateLanguageScores,
    selectedClientId, loadClientProfile,
    showDetails, setShowDetails,
    crsBreakdown, mifiBreakdown, crsAdvice, mifiAdvice,
    eligibleClients,
  };
}

function ScoringFormFields({ profile, updateProfile, updateLanguageScores, mode }: {
  profile: ScoringProfile;
  updateProfile: (partial: Partial<ScoringProfile>) => void;
  updateLanguageScores: (field: "firstLanguageScores" | "secondLanguageScores" | "spouseLanguageScores", skill: "speaking" | "listening" | "reading" | "writing", value: number) => void;
  mode: "crs" | "mifi";
}) {
  return (
    <div className="xl:col-span-1 space-y-4">
      {/* Profil */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={18} /> Profil du candidat
        </h2>
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-600">Age</label>
          <input type="number" min={17} max={60} value={profile.age}
            onChange={(e) => updateProfile({ age: parseInt(e.target.value) || 18 })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
        </div>
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-600">Situation maritale</label>
          <select value={profile.maritalStatus}
            onChange={(e) => updateProfile({ maritalStatus: e.target.value as "single" | "married_common_law", spouseAccompanying: e.target.value === "married_common_law" })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1">
            <option value="single">Celibataire</option>
            <option value="married_common_law">Marie(e) / Conjoint de fait</option>
          </select>
        </div>
        {profile.maritalStatus === "married_common_law" && (
          <label className="flex items-center gap-2 mb-3 text-sm text-gray-700">
            <input type="checkbox" checked={profile.spouseAccompanying}
              onChange={(e) => updateProfile({ spouseAccompanying: e.target.checked })} className="rounded" />
            Conjoint(e) accompagne
          </label>
        )}
      </div>

      {/* Education */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap size={18} /> Education
        </h2>
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-600">Niveau d&apos;education</label>
          <select value={profile.educationLevel}
            onChange={(e) => updateProfile({ educationLevel: e.target.value as EducationLevel })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1">
            {SCORING_EDUCATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {mode === "crs" && (
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600">Etudes canadiennes</label>
            <select value={profile.canadianEducation}
              onChange={(e) => updateProfile({ canadianEducation: e.target.value as CanadianEducationLevel })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1">
              {CAN_EDUCATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
        {mode === "mifi" && (
          <label className="flex items-center gap-2 mb-3 text-sm text-gray-700">
            <input type="checkbox" checked={profile.domaineFormationDemande}
              onChange={(e) => updateProfile({ domaineFormationDemande: e.target.checked })} className="rounded" />
            Domaine de formation en demande (MIFI)
          </label>
        )}
      </div>

      {/* Langues */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe2 size={18} /> Competences linguistiques
        </h2>
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-600">Premiere langue officielle</label>
          <select value={profile.firstLanguage}
            onChange={(e) => updateProfile({ firstLanguage: e.target.value as "french" | "english" })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1">
            <option value="french">Francais (NCLC)</option>
            <option value="english">Anglais (CLB)</option>
          </select>
        </div>
        <ScoringLanguageInput
          label={profile.firstLanguage === "french" ? "Francais (NCLC)" : "Anglais (CLB)"}
          scores={profile.firstLanguageScores}
          onChange={(skill, val) => updateLanguageScores("firstLanguageScores", skill, val)}
        />
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
            <input type="checkbox" checked={!!profile.secondLanguageScores}
              onChange={(e) => updateProfile({ secondLanguageScores: e.target.checked ? { speaking: 5, listening: 5, reading: 5, writing: 5 } : null })}
              className="rounded" />
            Deuxieme langue officielle
          </label>
          {profile.secondLanguageScores && (
            <ScoringLanguageInput
              label={profile.firstLanguage === "french" ? "Anglais (CLB)" : "Francais (NCLC)"}
              scores={profile.secondLanguageScores}
              onChange={(skill, val) => updateLanguageScores("secondLanguageScores", skill, val)}
            />
          )}
        </div>
      </div>

      {/* Experience */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase size={18} /> Experience de travail
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Exp. canadienne (ans)</label>
            <input type="number" min={0} max={15} value={profile.canadianWorkExperienceYears}
              onChange={(e) => updateProfile({ canadianWorkExperienceYears: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Exp. etrangere (ans)</label>
            <input type="number" min={0} max={20} value={profile.foreignWorkExperienceYears}
              onChange={(e) => updateProfile({ foreignWorkExperienceYears: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-600">Niveau NOC TEER</label>
          <select value={profile.nocTeerLevel}
            onChange={(e) => updateProfile({ nocTeerLevel: parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1">
            <option value={0}>TEER 0 — Gestion</option>
            <option value={1}>TEER 1 — Professionnel</option>
            <option value={2}>TEER 2 — Technique</option>
            <option value={3}>TEER 3 — Intermediaire</option>
            <option value={4}>TEER 4 — Elementaire</option>
            <option value={5}>TEER 5 — Soutien</option>
          </select>
        </div>
      </div>

      {/* Additional factors */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award size={18} /> Facteurs additionnels
        </h2>
        {mode === "crs" ? (
          <div className="space-y-2">
            <ScoringToggle label="Nomination provinciale (PNP)" checked={profile.provincialNomination} onChange={(v) => updateProfile({ provincialNomination: v })} />
            <ScoringToggle label="Offre d&apos;emploi valide (EIMT)" checked={profile.validJobOffer} onChange={(v) => updateProfile({ validJobOffer: v })} />
            {profile.validJobOffer && (
              <div className="ml-6">
                <label className="text-xs font-medium text-gray-600">Niveau NOC de l&apos;offre</label>
                <select value={profile.jobOfferNocLevel}
                  onChange={(e) => updateProfile({ jobOfferNocLevel: parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1">
                  <option value={0}>TEER 0 — Gestion (+200 pts)</option>
                  <option value={1}>TEER 1-3 (+50 pts)</option>
                </select>
              </div>
            )}
            <ScoringToggle label="Frere/soeur citoyen ou RP au Canada" checked={profile.siblingInCanada} onChange={(v) => updateProfile({ siblingInCanada: v })} />
          </div>
        ) : (
          <div className="space-y-2">
            <ScoringToggle label="Offre d&apos;emploi validee (MIFI)" checked={profile.offreEmploiValidee} onChange={(v) => updateProfile({ offreEmploiValidee: v })} />
            <ScoringToggle label="Sejour / etudes au Quebec" checked={profile.sejourQuebec} onChange={(v) => updateProfile({ sejourQuebec: v })} />
            <ScoringToggle label="Famille au Quebec" checked={profile.familleQuebec} onChange={(v) => updateProfile({ familleQuebec: v })} />
            <ScoringToggle label="Capacite financiere demontree" checked={profile.capaciteFinanciere} onChange={(v) => updateProfile({ capaciteFinanciere: v })} />
            <div>
              <label className="text-xs font-medium text-gray-600">Enfants</label>
              <input type="number" min={0} max={10} value={profile.enfants}
                onChange={(e) => updateProfile({ enfants: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          </div>
        )}
      </div>

      {/* Spouse (CRS only) */}
      {mode === "crs" && profile.maritalStatus === "married_common_law" && profile.spouseAccompanying && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} /> Profil du conjoint
          </h2>
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600">Education du conjoint</label>
            <select value={profile.spouseEducation || "secondary"}
              onChange={(e) => updateProfile({ spouseEducation: e.target.value as EducationLevel })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1">
              {SCORING_EDUCATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600">Exp. canadienne conjoint (ans)</label>
            <input type="number" min={0} max={10} value={profile.spouseCanadianExperienceYears}
              onChange={(e) => updateProfile({ spouseCanadianExperienceYears: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
            <input type="checkbox" checked={!!profile.spouseLanguageScores}
              onChange={(e) => updateProfile({ spouseLanguageScores: e.target.checked ? { speaking: 5, listening: 5, reading: 5, writing: 5 } : null })}
              className="rounded" />
            Resultats de test de langue du conjoint
          </label>
          {profile.spouseLanguageScores && (
            <ScoringLanguageInput
              label="Langue du conjoint (CLB/NCLC)"
              scores={profile.spouseLanguageScores}
              onChange={(skill, val) => updateLanguageScores("spouseLanguageScores", skill, val)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── CRS RESULTS PANEL ──────────────────────────────────

function CrsResultsPanel({ breakdown, advice, showDetails, setShowDetails }: {
  breakdown: CrsBreakdown;
  advice: ImprovementAdvice[];
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
}) {
  const latestCutoff = CRS_RECENT_CUTOFFS.find((c) => c.program === "General")?.score ?? 520;

  return (
    <>
      <ScoringScoreGauge
        score={breakdown.total}
        max={1200}
        label="Score CRS — Entree express"
        threshold={latestCutoff}
        thresholdLabel={`Dernier seuil general: ${latestCutoff}`}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 size={18} /> Ventilation du score
          </h3>
          <button onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-[#1B2559] hover:text-[#D4A03C] flex items-center gap-1">
            {showDetails ? "Masquer" : "Details"} {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <ScoringBreakdownRow label="Capital humain (base)" points={breakdown.coreHumanCapital.subtotal} max={500} />
        <ScoringBreakdownRow label="Facteurs du conjoint" points={breakdown.spouseFactors.subtotal} max={40} />
        <ScoringBreakdownRow label="Transferabilite des competences" points={breakdown.skillTransferability.subtotal} max={100} />
        <ScoringBreakdownRow label="Points additionnels" points={breakdown.additional.subtotal} max={600} />

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Capital humain</div>
            <ScoringBreakdownRow label="Age" points={breakdown.coreHumanCapital.age} max={110} icon={<Users size={14} />} />
            <ScoringBreakdownRow label="Education" points={breakdown.coreHumanCapital.education} max={150} icon={<GraduationCap size={14} />} />
            <ScoringBreakdownRow label="1re langue officielle" points={breakdown.coreHumanCapital.firstLanguage} max={136} icon={<Globe2 size={14} />} />
            <ScoringBreakdownRow label="2e langue officielle" points={breakdown.coreHumanCapital.secondLanguage} max={24} icon={<Globe2 size={14} />} />
            <ScoringBreakdownRow label="Experience canadienne" points={breakdown.coreHumanCapital.canadianExperience} max={80} icon={<Briefcase size={14} />} />

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">Transferabilite</div>
            <ScoringBreakdownRow label="Education + Langue" points={breakdown.skillTransferability.educationLanguage} max={50} />
            <ScoringBreakdownRow label="Education + Exp. canadienne" points={breakdown.skillTransferability.educationExperience} max={50} />
            <ScoringBreakdownRow label="Exp. etrangere + canadienne" points={breakdown.skillTransferability.foreignCanadianExperience} max={50} />

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">Additionnels</div>
            <ScoringBreakdownRow label="Nomination provinciale" points={breakdown.additional.provincialNomination} max={600} icon={<Award size={14} />} />
            <ScoringBreakdownRow label="Offre d&apos;emploi" points={breakdown.additional.jobOffer} max={200} icon={<Briefcase size={14} />} />
            <ScoringBreakdownRow label="Etudes canadiennes" points={breakdown.additional.canadianEducation} max={30} icon={<GraduationCap size={14} />} />
            <ScoringBreakdownRow label="Bonus francophone" points={breakdown.additional.frenchLanguageBonus} max={50} icon={<Globe2 size={14} />} />
            <ScoringBreakdownRow label="Frere/soeur au Canada" points={breakdown.additional.siblingBonus} max={15} icon={<Users size={14} />} />
          </div>
        )}
      </div>

      {/* Recent cutoffs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Target size={18} /> Seuils recents des tirages
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Programme</th>
                <th className="pb-2 font-medium text-right">Score min.</th>
                <th className="pb-2 font-medium text-right">Invitations</th>
                <th className="pb-2 font-medium text-center">Votre position</th>
              </tr>
            </thead>
            <tbody>
              {CRS_RECENT_CUTOFFS.slice(0, 6).map((c, i) => {
                const above = breakdown.total >= c.score;
                return (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 text-gray-600">{c.date}</td>
                    <td className="py-2 text-gray-700">{c.program}</td>
                    <td className="py-2 text-right font-medium">{c.score}</td>
                    <td className="py-2 text-right text-gray-500">{c.invitations.toLocaleString()}</td>
                    <td className="py-2 text-center">
                      {above ? (
                        <span className="text-green-600 flex items-center justify-center gap-1 text-xs font-medium">
                          <CheckCircle2 size={12} /> Qualifie
                        </span>
                      ) : (
                        <span className="text-red-500 text-xs font-medium">-{c.score - breakdown.total} pts</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ScoringAdvicePanel advice={advice} title="Conseils pour ameliorer votre score CRS" />
    </>
  );
}

// ─── MIFI RESULTS PANEL ─────────────────────────────────

function MifiResultsPanel({ breakdown, advice, showDetails, setShowDetails }: {
  breakdown: MifiBreakdown;
  advice: ImprovementAdvice[];
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
}) {
  return (
    <>
      <ScoringScoreGauge
        score={breakdown.total}
        max={100}
        label="Score MIFI — PSTQ / Arrima"
        threshold={MIFI_THRESHOLD_ESTIMATE}
        thresholdLabel={`Seuil estime: ${MIFI_THRESHOLD_ESTIMATE}`}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 size={18} /> Ventilation du score MIFI
          </h3>
          <button onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-[#1B2559] hover:text-[#D4A03C] flex items-center gap-1">
            {showDetails ? "Masquer" : "Details"} {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <ScoringBreakdownRow label="Formation" points={breakdown.formation.subtotal} max={18} icon={<GraduationCap size={14} />} />
        <ScoringBreakdownRow label="Experience professionnelle" points={breakdown.experience.subtotal} max={10} icon={<Briefcase size={14} />} />
        <ScoringBreakdownRow label="Age" points={breakdown.age} max={16} icon={<Users size={14} />} />
        <ScoringBreakdownRow label="Langues" points={breakdown.langues.subtotal} max={20} icon={<Globe2 size={14} />} />
        <ScoringBreakdownRow label="Sejour / etudes au Quebec" points={breakdown.sejourEtudes} max={5} icon={<MapPin size={14} />} />
        <ScoringBreakdownRow label="Offre d&apos;emploi validee" points={breakdown.offreEmploi} max={10} icon={<FileCheck size={14} />} />
        <ScoringBreakdownRow label="Enfants" points={breakdown.enfants} max={12} icon={<Baby size={14} />} />
        <ScoringBreakdownRow label="Capacite financiere" points={breakdown.capaciteFinanciere} max={1} />
        <ScoringBreakdownRow label="Connexion au Quebec" points={breakdown.connexionQuebec} max={3} icon={<MapPin size={14} />} />

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Details formation</div>
            <ScoringBreakdownRow label="Niveau de formation" points={breakdown.formation.niveau} max={14} />
            <ScoringBreakdownRow label="Domaine en demande" points={breakdown.formation.domaine} max={4} />

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">Details langues</div>
            <ScoringBreakdownRow label="Francais (NCLC)" points={breakdown.langues.francais} max={14} />
            <ScoringBreakdownRow label="Anglais (CLB)" points={breakdown.langues.anglais} max={6} />
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <AlertTriangle size={14} /> Note importante — Arrima / PSTQ
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>- Le PSTQ utilise le portail <strong>Arrima</strong> pour les declarations d&apos;interet et les invitations</li>
          <li>- Les seuils de score varient selon les rondes d&apos;invitation du MIFI</li>
          <li>- Le francais oral B2 (NCLC 7) est <strong>obligatoire</strong> pour la majorite des volets</li>
          <li>- L&apos;attestation de connaissance des valeurs democratiques est requise</li>
          <li>- Apres le CSQ, une demande de RP federale est necessaire (delai additionnel 12-18 mois)</li>
        </ul>
      </div>

      <ScoringAdvicePanel advice={advice} title="Conseils pour ameliorer votre profil MIFI" />
    </>
  );
}

// ─── CRS CALCULATOR TAB ─────────────────────────────────

function CrsCalculatorTab() {
  const {
    profile, updateProfile, updateLanguageScores,
    selectedClientId, loadClientProfile,
    showDetails, setShowDetails,
    crsBreakdown, crsAdvice,
    eligibleClients,
  } = useScoringState();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          Calculateur CRS (Entree express) — Estimez votre score de classement global
        </p>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Charger un client :</label>
          <select value={selectedClientId} onChange={(e) => loadClientProfile(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]">
            <option value="">— Saisie manuelle —</option>
            {eligibleClients.map((c) => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ScoringFormFields profile={profile} updateProfile={updateProfile} updateLanguageScores={updateLanguageScores} mode="crs" />
        <div className="xl:col-span-2 space-y-5">
          <CrsResultsPanel breakdown={crsBreakdown} advice={crsAdvice} showDetails={showDetails} setShowDetails={setShowDetails} />
        </div>
      </div>
    </div>
  );
}

// ─── MIFI CALCULATOR TAB ────────────────────────────────

function MifiCalculatorTab() {
  const {
    profile, updateProfile, updateLanguageScores,
    selectedClientId, loadClientProfile,
    showDetails, setShowDetails,
    mifiBreakdown, mifiAdvice,
    eligibleClients,
  } = useScoringState();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          Grille MIFI (PSTQ / Arrima) — Estimez votre score pour le Quebec
        </p>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Charger un client :</label>
          <select value={selectedClientId} onChange={(e) => loadClientProfile(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]">
            <option value="">— Saisie manuelle —</option>
            {eligibleClients.map((c) => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ScoringFormFields profile={profile} updateProfile={updateProfile} updateLanguageScores={updateLanguageScores} mode="mifi" />
        <div className="xl:col-span-2 space-y-5">
          <MifiResultsPanel breakdown={mifiBreakdown} advice={mifiAdvice} showDetails={showDetails} setShowDetails={setShowDetails} />
        </div>
      </div>
    </div>
  );
}
