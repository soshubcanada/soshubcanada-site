"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Building2,
  Briefcase,
  Heart,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Globe,
  Phone,
  Mail,
  User,
  MapPin,
  FileText,
  Clock,
  DollarSign,
  Users,
  Shield,
  Sparkles,
} from "lucide-react";

// ─── TYPES ───
type PartnerType = "employeur" | "professionnel" | "organisme";

type FormData = {
  // Common
  fullName: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  // Employeur
  companyName: string;
  sector: string;
  employeeCount: string;
  eimtAvailable: boolean;
  tempWorkers: boolean;
  companyDescription: string;
  // Professionnel
  professionalTitle: string;
  orderNumber: string;
  languages: string[];
  specialties: string[];
  hourlyRate: string;
  servicesDescription: string;
  // Organisme
  orgName: string;
  mission: string;
  servicesOffered: string[];
  territory: string;
  hours: string;
  freeServices: boolean;
  // Confirmation
  acceptTerms: boolean;
  acceptContact: boolean;
};

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  website: "",
  city: "",
  companyName: "",
  sector: "",
  employeeCount: "",
  eimtAvailable: false,
  tempWorkers: false,
  companyDescription: "",
  professionalTitle: "",
  orderNumber: "",
  languages: [],
  specialties: [],
  hourlyRate: "",
  servicesDescription: "",
  orgName: "",
  mission: "",
  servicesOffered: [],
  territory: "",
  hours: "",
  freeServices: false,
  acceptTerms: false,
  acceptContact: false,
};

// ─── OPTIONS ───
const CITIES = [
  "Montréal",
  "Québec",
  "Laval",
  "Gatineau",
  "Sherbrooke",
  "Trois-Rivières",
  "Autre",
];

const SECTORS_FR = [
  "Santé",
  "TI",
  "Construction",
  "Restauration",
  "Commerce",
  "Éducation",
  "Manufacture",
  "Transport",
  "Administration",
  "Autre",
];
const SECTORS_EN = [
  "Healthcare",
  "IT",
  "Construction",
  "Food Services",
  "Retail",
  "Education",
  "Manufacturing",
  "Transportation",
  "Administration",
  "Other",
];

const EMPLOYEE_COUNTS = ["1-10", "11-50", "51-200", "200+"];

const PRO_TITLES_FR = [
  "Conseiller juridique",
  "RCIC",
  "CPA/Comptable",
  "Notaire",
  "Traducteur agréé",
  "Courtier immobilier",
  "Conseiller financier",
  "Autre",
];
const PRO_TITLES_EN = [
  "Legal Advisor",
  "RCIC",
  "CPA/Accountant",
  "Notary",
  "Certified Translator",
  "Real Estate Broker",
  "Financial Advisor",
  "Other",
];

const LANGUAGES_OPTIONS = [
  "Français",
  "English",
  "العربية",
  "Español",
  "中文",
  "Português",
  "Filipino",
  "Autre",
];

const SPECIALTIES_FR = [
  "Établissement permanent",
  "Permis de travail",
  "Regroupement familial",
  "Demande d'asile",
  "Citoyenneté",
  "Fiscalité internationale",
  "Évaluation de diplômes",
  "Droit du travail",
];
const SPECIALTIES_EN = [
  "Permanent Settlement",
  "Work Permits",
  "Family Reunification",
  "Asylum Claims",
  "Citizenship",
  "International Taxation",
  "Credential Assessment",
  "Labour Law",
];

const SERVICES_FR = [
  "Aide administrative",
  "Francisation",
  "Recherche d'emploi",
  "Hébergement temporaire",
  "Aide juridique",
  "Santé mentale",
  "Aide alimentaire",
  "Jumelage/mentorat",
  "Cours de français",
  "Ateliers d'intégration",
];
const SERVICES_EN = [
  "Administrative Help",
  "Francization",
  "Job Search",
  "Temporary Housing",
  "Legal Aid",
  "Mental Health",
  "Food Aid",
  "Mentoring",
  "French Courses",
  "Integration Workshops",
];

const TERRITORIES_FR = [
  "Montréal",
  "Rive-Sud",
  "Rive-Nord",
  "Québec",
  "Sherbrooke",
  "Gatineau",
  "Province entière",
];
const TERRITORIES_EN = [
  "Montreal",
  "South Shore",
  "North Shore",
  "Quebec City",
  "Sherbrooke",
  "Gatineau",
  "Entire Province",
];

// ─── COMPONENTS ───

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                i + 1 < step
                  ? "bg-[#1D9E75] text-white"
                  : i + 1 === step
                  ? "bg-[#085041] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[#085041] to-[#1D9E75] transition-all duration-500"
          style={{ width: `${((step - 1) / (total - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function ChipSelect({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
              active
                ? "border-[#1D9E75] bg-[#1D9E75]/10 text-[#085041]"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {active && <Check className="w-3 h-3 inline mr-1" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
      <AlertCircle className="w-3.5 h-3.5" />
      {msg}
    </p>
  );
}

// ─── INNER PAGE (needs Suspense for useSearchParams) ───
function InscriptionPageInner() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = searchParams.get("type") as PartnerType | null;
  const validType =
    typeParam &&
    ["employeur", "professionnel", "organisme"].includes(typeParam);

  const [step, setStep] = useState(validType ? 2 : 1);
  const [partnerType, setPartnerType] = useState<PartnerType | null>(
    validType ? typeParam : null
  );
  const [form, setForm] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = useCallback(
    (field: keyof FormData, value: FormData[keyof FormData]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  // ─── VALIDATION ───
  const validateStep2 = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    const req = fr ? "Ce champ est requis" : "This field is required";
    const badEmail = fr ? "Courriel invalide" : "Invalid email";
    const badPhone = fr ? "Téléphone invalide" : "Invalid phone";

    if (!form.fullName.trim()) errs.fullName = req;
    if (!form.email.trim()) errs.email = req;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = badEmail;
    if (!form.phone.trim()) errs.phone = req;
    else if (!/^[\d\s\-+().]{7,}$/.test(form.phone)) errs.phone = badPhone;
    if (!form.city) errs.city = req;

    if (partnerType === "employeur") {
      if (!form.companyName.trim()) errs.companyName = req;
      if (!form.sector) errs.sector = req;
      if (!form.employeeCount) errs.employeeCount = req;
      if (!form.companyDescription.trim()) errs.companyDescription = req;
    }

    if (partnerType === "professionnel") {
      if (!form.professionalTitle) errs.professionalTitle = req;
      if (!form.servicesDescription.trim()) errs.servicesDescription = req;
    }

    if (partnerType === "organisme") {
      if (!form.orgName.trim()) errs.orgName = req;
      if (!form.mission.trim()) errs.mission = req;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, partnerType, fr]);

  const validateStep3 = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!form.acceptTerms)
      errs.acceptTerms = fr
        ? "Vous devez accepter les conditions"
        : "You must accept the terms";
    if (!form.acceptContact)
      errs.acceptContact = fr
        ? "Vous devez accepter d'être contacté"
        : "You must accept to be contacted";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form.acceptTerms, form.acceptContact, fr]);

  // ─── SUBMIT ───
  const handleSubmit = useCallback(() => {
    if (!validateStep3()) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      id,
      type: partnerType,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      ...form,
    };

    try {
      const existing = JSON.parse(
        localStorage.getItem("etabli_partners") || "[]"
      );
      existing.push(record);
      localStorage.setItem("etabli_partners", JSON.stringify(existing));
    } catch {
      // fallback
      localStorage.setItem("etabli_partners", JSON.stringify([record]));
    }

    setSubmitted(true);
  }, [form, partnerType, validateStep3]);

  // ─── TYPE CARDS (STEP 1) ───
  const typeCards: {
    type: PartnerType;
    icon: React.ReactNode;
    title: string;
    desc: string;
  }[] = [
    {
      type: "employeur",
      icon: <Building2 className="w-8 h-8" />,
      title: fr ? "Employeur" : "Employer",
      desc: fr
        ? "Recrutez des talents internationaux et bénéficiez d'un accompagnement EIMT/LMIA."
        : "Recruit international talent and benefit from LMIA support.",
    },
    {
      type: "professionnel",
      icon: <Briefcase className="w-8 h-8" />,
      title: fr ? "Professionnel" : "Professional",
      desc: fr
        ? "Offrez vos services d'accompagnement, juridiques ou financiers aux nouveaux arrivants."
        : "Offer your établissement, legal, or financial services to newcomers.",
    },
    {
      type: "organisme",
      icon: <Heart className="w-8 h-8" />,
      title: fr ? "Organisme" : "Organization",
      desc: fr
        ? "Connectez votre organisme communautaire avec les personnes qui ont besoin de vos services."
        : "Connect your community organization with people who need your services.",
    },
  ];

  // ─── SUCCESS SCREEN ───
  if (submitted) {
    return (
      <Shell>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-[#1D9E75] rounded-full flex items-center justify-center mx-auto mb-6 animate-[scaleIn_0.5s_ease-out]">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#085041] mb-3 font-[family-name:var(--font-heading)]">
              {fr ? "Inscription reçue!" : "Registration received!"}
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              {fr
                ? "Votre profil sera vérifié sous 24-48h. Vous recevrez un courriel de confirmation."
                : "Your profile will be verified within 24-48h. You will receive a confirmation email."}
            </p>
            <button
              onClick={() =>
                router.push(
                  `/portail/dashboard?email=${encodeURIComponent(form.email)}`
                )
              }
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#085041] text-white rounded-xl font-semibold hover:bg-[#085041]/90 transition-colors"
            >
              {fr ? "Accéder à mon espace" : "Access my dashboard"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <style jsx>{`
          @keyframes scaleIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </Shell>
    );
  }

  // ─── RENDER ───
  return (
    <Shell>
      <section className="py-10 px-4 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#085041] font-[family-name:var(--font-heading)]">
            {fr ? "Inscription partenaire" : "Partner Registration"}
          </h1>
          <p className="text-gray-600 mt-2">
            {fr
              ? "Rejoignez le réseau etabli. et connectez-vous avec les nouveaux arrivants."
              : "Join the etabli. network and connect with newcomers."}
          </p>
        </div>

        {/* Progress */}
        <ProgressBar step={step} total={3} />

        {/* ─── STEP 1: TYPE SELECTION ─── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#085041] font-[family-name:var(--font-heading)] mb-4">
              {fr
                ? "Quel type de partenaire êtes-vous?"
                : "What type of partner are you?"}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {typeCards.map((card) => (
                <button
                  key={card.type}
                  onClick={() => {
                    setPartnerType(card.type);
                    setStep(2);
                  }}
                  className="text-left p-6 rounded-2xl border-2 border-gray-200 hover:border-[#1D9E75] hover:shadow-lg transition-all duration-200 group bg-white"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#085041]/10 flex items-center justify-center text-[#085041] mb-4 group-hover:bg-[#1D9E75]/10 group-hover:text-[#1D9E75] transition-colors">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#085041] mb-2 font-[family-name:var(--font-heading)]">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500">{card.desc}</p>
                  <div className="mt-4 text-[#1D9E75] flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {fr ? "Sélectionner" : "Select"}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP 2: PROFILE FORM ─── */}
        {step === 2 && partnerType && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => {
                  setErrors({});
                  setStep(validType ? 2 : 1);
                }}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${validType ? "invisible" : ""}`}
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <h2 className="text-xl font-semibold text-[#085041] font-[family-name:var(--font-heading)]">
                {fr ? "Informations du profil" : "Profile Information"}
              </h2>
            </div>

            {/* Common Fields */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                {fr ? "Informations générales" : "General Information"}
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  {fr ? "Nom complet" : "Full name"}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder={fr ? "Jean Dupont" : "John Doe"}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.fullName ? "border-red-400" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors`}
                />
                <FieldError msg={errors.fullName} />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  {fr ? "Courriel" : "Email"}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder={fr ? "nom@exemple.com" : "name@example.com"}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.email ? "border-red-400" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors`}
                />
                <FieldError msg={errors.email} />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  {fr ? "Téléphone" : "Phone"}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="(514) 555-1234"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.phone ? "border-red-400" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors`}
                />
                <FieldError msg={errors.phone} />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  {fr ? "Site web" : "Website"}
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  {fr ? "Ville" : "City"}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.city ? "border-red-400" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors bg-white`}
                >
                  <option value="">
                    {fr ? "-- Sélectionner --" : "-- Select --"}
                  </option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.city} />
              </div>
            </div>

            {/* ─── EMPLOYEUR FIELDS ─── */}
            {partnerType === "employeur" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {fr ? "Détails de l'entreprise" : "Company Details"}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fr ? "Nom de l'entreprise" : "Company name"}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.companyName ? "border-red-400" : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors`}
                  />
                  <FieldError msg={errors.companyName} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fr ? "Secteur" : "Sector"}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.sector}
                    onChange={(e) => set("sector", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.sector ? "border-red-400" : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors bg-white`}
                  >
                    <option value="">
                      {fr ? "-- Sélectionner --" : "-- Select --"}
                    </option>
                    {(fr ? SECTORS_FR : SECTORS_EN).map((s, i) => (
                      <option key={s} value={SECTORS_FR[i]}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={errors.sector} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="w-4 h-4 inline mr-1.5 text-gray-400" />
                    {fr ? "Nombre d'employés" : "Number of employees"}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.employeeCount}
                    onChange={(e) => set("employeeCount", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.employeeCount
                        ? "border-red-400"
                        : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors bg-white`}
                  >
                    <option value="">
                      {fr ? "-- Sélectionner --" : "-- Select --"}
                    </option>
                    {EMPLOYEE_COUNTS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={errors.employeeCount} />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.eimtAvailable}
                    onChange={(e) => set("eimtAvailable", e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#1D9E75] focus:ring-[#1D9E75]"
                  />
                  <span className="text-sm text-gray-700">
                    {fr
                      ? "EIMT/LMIA disponible pour certains postes"
                      : "LMIA available for some positions"}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.tempWorkers}
                    onChange={(e) => set("tempWorkers", e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#1D9E75] focus:ring-[#1D9E75]"
                  />
                  <span className="text-sm text-gray-700">
                    {fr
                      ? "Prêt à embaucher des travailleurs temporaires"
                      : "Ready to hire temporary workers"}
                  </span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-4 h-4 inline mr-1.5 text-gray-400" />
                    {fr
                      ? "Description de l'entreprise"
                      : "Company description"}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.companyDescription}
                    onChange={(e) =>
                      set("companyDescription", e.target.value)
                    }
                    rows={4}
                    placeholder={
                      fr
                        ? "Décrivez votre entreprise et vos besoins en recrutement..."
                        : "Describe your company and recruitment needs..."
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.companyDescription
                        ? "border-red-400"
                        : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors resize-none`}
                  />
                  <FieldError msg={errors.companyDescription} />
                </div>
              </div>
            )}

            {/* ─── PROFESSIONNEL FIELDS ─── */}
            {partnerType === "professionnel" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {fr ? "Détails professionnels" : "Professional Details"}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fr ? "Titre professionnel" : "Professional title"}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.professionalTitle}
                    onChange={(e) => set("professionalTitle", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.professionalTitle
                        ? "border-red-400"
                        : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors bg-white`}
                  >
                    <option value="">
                      {fr ? "-- Sélectionner --" : "-- Select --"}
                    </option>
                    {(fr ? PRO_TITLES_FR : PRO_TITLES_EN).map((t, i) => (
                      <option key={t} value={PRO_TITLES_FR[i]}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={errors.professionalTitle} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Shield className="w-4 h-4 inline mr-1.5 text-gray-400" />
                    {fr
                      ? "Numéro de membre de l'ordre professionnel"
                      : "Professional order number"}
                  </label>
                  <input
                    type="text"
                    value={form.orderNumber}
                    onChange={(e) => set("orderNumber", e.target.value)}
                    placeholder={fr ? "Ex: 12345-67" : "E.g. 12345-67"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {fr ? "Langues parlées" : "Languages spoken"}
                  </label>
                  <ChipSelect
                    options={LANGUAGES_OPTIONS}
                    selected={form.languages}
                    onChange={(val) => set("languages", val)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Sparkles className="w-4 h-4 inline mr-1.5 text-gray-400" />
                    {fr ? "Spécialités" : "Specialties"}
                  </label>
                  <ChipSelect
                    options={fr ? SPECIALTIES_FR : SPECIALTIES_EN}
                    selected={form.specialties}
                    onChange={(val) => set("specialties", val)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1.5 text-gray-400" />
                    {fr ? "Tarif horaire" : "Hourly rate"}
                  </label>
                  <input
                    type="text"
                    value={form.hourlyRate}
                    onChange={(e) => set("hourlyRate", e.target.value)}
                    placeholder={fr ? "ex: 150-250$/h" : "e.g., $150-250/h"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-4 h-4 inline mr-1.5 text-gray-400" />
                    {fr
                      ? "Description de vos services"
                      : "Description of your services"}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.servicesDescription}
                    onChange={(e) =>
                      set("servicesDescription", e.target.value)
                    }
                    rows={4}
                    placeholder={
                      fr
                        ? "Décrivez vos services et votre expérience..."
                        : "Describe your services and experience..."
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.servicesDescription
                        ? "border-red-400"
                        : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors resize-none`}
                  />
                  <FieldError msg={errors.servicesDescription} />
                </div>
              </div>
            )}

            {/* ─── ORGANISME FIELDS ─── */}
            {partnerType === "organisme" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  {fr
                    ? "Détails de l'organisme"
                    : "Organization Details"}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fr ? "Nom de l'organisme" : "Organization name"}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.orgName}
                    onChange={(e) => set("orgName", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.orgName ? "border-red-400" : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors`}
                  />
                  <FieldError msg={errors.orgName} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fr ? "Mission" : "Mission"}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.mission}
                    onChange={(e) => set("mission", e.target.value)}
                    rows={3}
                    placeholder={
                      fr
                        ? "Décrivez la mission de votre organisme..."
                        : "Describe your organization's mission..."
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.mission ? "border-red-400" : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors resize-none`}
                  />
                  <FieldError msg={errors.mission} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {fr ? "Services offerts" : "Services offered"}
                  </label>
                  <ChipSelect
                    options={fr ? SERVICES_FR : SERVICES_EN}
                    selected={form.servicesOffered}
                    onChange={(val) => set("servicesOffered", val)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1.5 text-gray-400" />
                    {fr ? "Territoire desservi" : "Territory served"}
                  </label>
                  <select
                    value={form.territory}
                    onChange={(e) => set("territory", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors bg-white"
                  >
                    <option value="">
                      {fr ? "-- Sélectionner --" : "-- Select --"}
                    </option>
                    {(fr ? TERRITORIES_FR : TERRITORIES_EN).map((t, i) => (
                      <option key={t} value={TERRITORIES_FR[i]}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline mr-1.5 text-gray-400" />
                    {fr ? "Heures d'ouverture" : "Hours of operation"}
                  </label>
                  <input
                    type="text"
                    value={form.hours}
                    onChange={(e) => set("hours", e.target.value)}
                    placeholder={
                      fr ? "Ex: Lun-Ven 9h-17h" : "E.g. Mon-Fri 9am-5pm"
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/30 focus:border-[#1D9E75] transition-colors"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.freeServices}
                    onChange={(e) => set("freeServices", e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#1D9E75] focus:ring-[#1D9E75]"
                  />
                  <span className="text-sm text-gray-700">
                    {fr ? "Services gratuits" : "Free services"}
                  </span>
                </label>
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#085041] text-white rounded-xl font-semibold hover:bg-[#085041]/90 transition-colors"
              >
                {fr ? "Continuer" : "Continue"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: REVIEW & CONFIRM ─── */}
        {step === 3 && partnerType && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => {
                  setErrors({});
                  setStep(2);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <h2 className="text-xl font-semibold text-[#085041] font-[family-name:var(--font-heading)]">
                {fr ? "Révision et confirmation" : "Review & Confirm"}
              </h2>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="px-3 py-1 bg-[#D97706]/10 text-[#D97706] rounded-full text-sm font-semibold capitalize">
                  {partnerType === "employeur"
                    ? fr
                      ? "Employeur"
                      : "Employer"
                    : partnerType === "professionnel"
                    ? fr
                      ? "Professionnel"
                      : "Professional"
                    : fr
                    ? "Organisme"
                    : "Organization"}
                </div>
              </div>

              <SummaryRow
                label={fr ? "Nom complet" : "Full name"}
                value={form.fullName}
              />
              <SummaryRow
                label={fr ? "Courriel" : "Email"}
                value={form.email}
              />
              <SummaryRow
                label={fr ? "Téléphone" : "Phone"}
                value={form.phone}
              />
              {form.website && (
                <SummaryRow
                  label={fr ? "Site web" : "Website"}
                  value={form.website}
                />
              )}
              <SummaryRow
                label={fr ? "Ville" : "City"}
                value={form.city}
              />

              {partnerType === "employeur" && (
                <>
                  <hr className="border-gray-100" />
                  <SummaryRow
                    label={fr ? "Entreprise" : "Company"}
                    value={form.companyName}
                  />
                  <SummaryRow
                    label={fr ? "Secteur" : "Sector"}
                    value={form.sector}
                  />
                  <SummaryRow
                    label={fr ? "Employés" : "Employees"}
                    value={form.employeeCount}
                  />
                  {form.eimtAvailable && (
                    <SummaryRow label="EIMT/LMIA" value="Yes" />
                  )}
                  {form.tempWorkers && (
                    <SummaryRow
                      label={
                        fr ? "Travailleurs temporaires" : "Temporary workers"
                      }
                      value={fr ? "Oui" : "Yes"}
                    />
                  )}
                  <SummaryRow
                    label="Description"
                    value={form.companyDescription}
                  />
                </>
              )}

              {partnerType === "professionnel" && (
                <>
                  <hr className="border-gray-100" />
                  <SummaryRow
                    label={fr ? "Titre" : "Title"}
                    value={form.professionalTitle}
                  />
                  {form.orderNumber && (
                    <SummaryRow
                      label={fr ? "No. d'ordre" : "Order number"}
                      value={form.orderNumber}
                    />
                  )}
                  {form.languages.length > 0 && (
                    <SummaryRow
                      label={fr ? "Langues" : "Languages"}
                      value={form.languages.join(", ")}
                    />
                  )}
                  {form.specialties.length > 0 && (
                    <SummaryRow
                      label={fr ? "Spécialités" : "Specialties"}
                      value={form.specialties.join(", ")}
                    />
                  )}
                  {form.hourlyRate && (
                    <SummaryRow
                      label={fr ? "Tarif" : "Rate"}
                      value={form.hourlyRate}
                    />
                  )}
                  <SummaryRow
                    label="Description"
                    value={form.servicesDescription}
                  />
                </>
              )}

              {partnerType === "organisme" && (
                <>
                  <hr className="border-gray-100" />
                  <SummaryRow
                    label={fr ? "Organisme" : "Organization"}
                    value={form.orgName}
                  />
                  <SummaryRow label="Mission" value={form.mission} />
                  {form.servicesOffered.length > 0 && (
                    <SummaryRow
                      label={fr ? "Services" : "Services"}
                      value={form.servicesOffered.join(", ")}
                    />
                  )}
                  {form.territory && (
                    <SummaryRow
                      label={fr ? "Territoire" : "Territory"}
                      value={form.territory}
                    />
                  )}
                  {form.hours && (
                    <SummaryRow
                      label={fr ? "Heures" : "Hours"}
                      value={form.hours}
                    />
                  )}
                  {form.freeServices && (
                    <SummaryRow
                      label={fr ? "Services gratuits" : "Free services"}
                      value={fr ? "Oui" : "Yes"}
                    />
                  )}
                </>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(e) => set("acceptTerms", e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#1D9E75] focus:ring-[#1D9E75]"
                />
                <span className="text-sm text-gray-700">
                  {fr
                    ? "J'accepte les conditions d'utilisation d'etabli."
                    : "I accept the terms of use of etabli."}
                  <span className="text-red-400 ml-1">*</span>
                </span>
              </label>
              <FieldError msg={errors.acceptTerms} />

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.acceptContact}
                  onChange={(e) => set("acceptContact", e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#1D9E75] focus:ring-[#1D9E75]"
                />
                <span className="text-sm text-gray-700">
                  {fr
                    ? "J'accepte d'être contacté par etabli. pour vérification"
                    : "I accept to be contacted by etabli. for verification"}
                  <span className="text-red-400 ml-1">*</span>
                </span>
              </label>
              <FieldError msg={errors.acceptContact} />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#1D9E75] text-white rounded-xl font-semibold hover:bg-[#1D9E75]/90 transition-colors shadow-lg shadow-[#1D9E75]/20"
              >
                <CheckCircle2 className="w-5 h-5" />
                {fr ? "Compléter l'inscription" : "Complete registration"}
              </button>
            </div>
          </div>
        )}
      </section>
    </Shell>
  );
}

// ─── EXPORT WITH SUSPENSE ───
export default function InscriptionPage() {
  return (
    <Suspense fallback={<Shell><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin" /></div></Shell>}>
      <InscriptionPageInner />
    </Suspense>
  );
}

// ─── SUMMARY ROW ───
function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-sm font-medium text-gray-400 sm:w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-800 break-words">{value}</span>
    </div>
  );
}
