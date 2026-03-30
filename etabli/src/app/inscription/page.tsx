// ========================================================
// SOS Hub Canada - Page d'inscription client (publique)
// Auto-onboarding: profil, contrat, paiement, CRM
// ========================================================
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  User,
  Globe,
  FileText,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Languages,
  Shield,
  Building2,
  Banknote,
  ArrowRight,
  Loader2,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";

/* ────────────────────────────────────────── */
/*  CONSTANTS                                 */
/* ────────────────────────────────────────── */

const STEPS = [
  { label: "Informations personnelles", icon: User },
  { label: "Profil d’établissement", icon: Globe },
  { label: "Acceptation du contrat", icon: FileText },
  { label: "Paiement", icon: CreditCard },
] as const;

const MARITAL_OPTIONS = [
  { value: "", label: "-- Sélectionner --" },
  { value: "celibataire", label: "Célibataire" },
  { value: "marie", label: "Marié(e)" },
  { value: "conjoint_fait", label: "Conjoint(e) de fait" },
  { value: "divorce", label: "Divorcé(e)" },
  { value: "separe", label: "Séparé(e)" },
  { value: "veuf", label: "Veuf / Veuve" },
];

const STATUS_OPTIONS = [
  { value: "", label: "-- Sélectionner --" },
  { value: "visiteur", label: "Visiteur" },
  { value: "etudiant", label: "Étudiant" },
  { value: "travailleur", label: "Travailleur" },
  { value: "resident_permanent", label: "Résident permanent" },
  { value: "aucun", label: "Aucun statut au Canada" },
];

const PROGRAM_OPTIONS = [
  { value: "", label: "-- Sélectionner un programme --" },
  { value: "permis_etudes", label: "Permis d’études" },
  { value: "permis_travail", label: "Permis de travail" },
  { value: "residence_permanente", label: "Résidence permanente (général)" },
  { value: "peq", label: "PEQ — Programme de l’expérience québécoise" },
  { value: "pstq", label: "PSTQ — Programme de sélection des travailleurs qualifiés" },
  { value: "entree_express", label: "Entrée express (fédéral)" },
  { value: "parrainage_familial", label: "Parrainage familial" },
  { value: "asile", label: "Demande d’asile" },
  { value: "citoyennete", label: "Citoyenneté canadienne" },
];

const LANGUAGE_LEVELS = [
  { value: "", label: "-- Sélectionner --" },
  { value: "aucun", label: "Aucun" },
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Avancé" },
  { value: "natif", label: "Natif / Bilingue" },
];

const EDUCATION_OPTIONS = [
  { value: "", label: "-- Sélectionner --" },
  { value: "secondaire", label: "Secondaire (DES)" },
  { value: "dep", label: "DEP — Diplôme d’études professionnelles" },
  { value: "collegial", label: "Collégial (DEC)" },
  { value: "baccalaureat", label: "Baccalauréat" },
  { value: "maitrise", label: "Maîtrise" },
  { value: "doctorat", label: "Doctorat (PhD)" },
];

const PROVINCES = [
  "Alberta",
  "Colombie-Britannique",
  "Manitoba",
  "Nouveau-Brunswick",
  "Terre-Neuve-et-Labrador",
  "Nouvelle-Écosse",
  "Ontario",
  "Île-du-Prince-Édouard",
  "Québec",
  "Saskatchewan",
  "Territoires du Nord-Ouest",
  "Yukon",
  "Nunavut",
];

type PaymentMethod = "interac" | "square" | "en_personne" | null;

interface FormData {
  prenom: string;
  nom: string;
  dateNaissance: string;
  nationalite: string;
  situationMatrimoniale: string;
  courriel: string;
  telephone: string;
  adresseRue: string;
  adresseVille: string;
  adresseProvince: string;
  adresseCodePostal: string;
  adressePays: string;
  languePreferee: "fr" | "en";
  paysResidence: string;
  statutActuel: string;
  programmeInteret: string;
  niveauFrancais: string;
  niveauAnglais: string;
  education: string;
  anneesExperience: string;
  descriptionSituation: string;
  acceptConditions: boolean;
  acceptFrais: boolean;
  acceptRepresentation: boolean;
  paymentMethod: PaymentMethod;
  interacConfirmation: string;
}

const INITIAL_FORM: FormData = {
  prenom: "",
  nom: "",
  dateNaissance: "",
  nationalite: "",
  situationMatrimoniale: "",
  courriel: "",
  telephone: "",
  adresseRue: "",
  adresseVille: "",
  adresseProvince: "Québec",
  adresseCodePostal: "",
  adressePays: "Canada",
  languePreferee: "fr",
  paysResidence: "",
  statutActuel: "",
  programmeInteret: "",
  niveauFrancais: "",
  niveauAnglais: "",
  education: "",
  anneesExperience: "",
  descriptionSituation: "",
  acceptConditions: false,
  acceptFrais: false,
  acceptRepresentation: false,
  paymentMethod: null,
  interacConfirmation: "",
};

/* ────────────────────────────────────────── */
/*  HELPERS                                   */
/* ────────────────────────────────────────── */

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\d\s()+-]{7,20}$/.test(phone);
}

function getProgramLabel(value: string): string {
  return PROGRAM_OPTIONS.find((p) => p.value === value)?.label ?? value;
}

function generateRefNumber(): string {
  const d = new Date();
  const prefix = "SOS";
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${y}${m}-${rand}`;
}

/* ────────────────────────────────────────── */
/*  REUSABLE UI                               */
/* ────────────────────────────────────────── */

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-[#1B2559] mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  ...rest
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type">) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/40 focus:border-[#D4A03C] ${
          error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
        }`}
        {...rest}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/40 focus:border-[#D4A03C] ${
          error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer group">
        <div
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            checked ? "bg-[#1B2559] border-[#1B2559]" : "border-gray-300 bg-white group-hover:border-[#D4A03C]"
          }`}
          onClick={() => onChange(!checked)}
        >
          {checked && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="text-sm text-gray-700 leading-relaxed" onClick={() => onChange(!checked)}>
          {label}
        </span>
      </label>
      {error && <p className="text-xs text-red-500 mt-1 ml-8">{error}</p>}
    </div>
  );
}

/* ────────────────────────────────────────── */
/*  MAIN PAGE                                 */
/* ────────────────────────────────────────── */

export default function InscriptionPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [squarePaymentDone, setSquarePaymentDone] = useState(false);
  const [squareError, setSquareError] = useState("");

  const update = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  /* ── Validation ── */
  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (s === 0) {
      if (!form.prenom.trim()) errs.prenom = "Le prénom est requis";
      if (!form.nom.trim()) errs.nom = "Le nom est requis";
      if (!form.courriel.trim()) errs.courriel = "Le courriel est requis";
      else if (!isValidEmail(form.courriel)) errs.courriel = "Format de courriel invalide";
      if (!form.telephone.trim()) errs.telephone = "Le téléphone est requis";
      else if (!isValidPhone(form.telephone)) errs.telephone = "Format de téléphone invalide";
    }
    if (s === 1) {
      if (!form.paysResidence.trim()) errs.paysResidence = "Le pays de résidence est requis";
      if (!form.statutActuel) errs.statutActuel = "Veuillez sélectionner un statut";
      if (!form.programmeInteret) errs.programmeInteret = "Veuillez sélectionner un programme";
    }
    if (s === 2) {
      if (!form.acceptConditions) errs.acceptConditions = "Vous devez accepter les conditions de service";
      if (!form.acceptFrais) errs.acceptFrais = "Vous devez accepter la politique de frais";
      if (!form.acceptRepresentation) errs.acceptRepresentation = "Vous devez autoriser la représentation";
    }
    if (s === 3) {
      if (!form.paymentMethod) errs.paymentMethod = "Veuillez sélectionner un mode de paiement";
      if (form.paymentMethod === "interac" && !form.interacConfirmation.trim()) {
        errs.interacConfirmation = "Veuillez entrer votre numéro de confirmation";
      }
      if (form.paymentMethod === "square" && !squarePaymentDone) {
        errs.paymentMethod = "Veuillez compléter le paiement par carte";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setSubmitError("");
    const ref = generateRefNumber();

    try {
      const res = await fetch("/api/crm/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, referenceNumber: ref }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erreur lors de la soumission");
      }

      setRefNumber(ref);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inattendue";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function copyEmail() {
    navigator.clipboard.writeText("paiement@soshubcanada.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  /* ──────────────────────── RENDER ──────────────────────── */

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2559] via-[#1B2559] to-[#2a3770] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center animate-fadeInUp">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2559] mb-2">
            Votre dossier a été ouvert avec succès!
          </h1>
          <p className="text-gray-600 mb-6">
            Merci pour votre confiance. Notre équipe vous contactera dans les <strong>24 à 48 heures</strong> pour la suite de votre dossier.
          </p>
          <div className="bg-[#1B2559]/5 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Numéro de référence</p>
            <p className="text-xl font-bold text-[#1B2559] tracking-wider">{refNumber}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Un courriel de confirmation a été envoyé à <strong>{form.courriel}</strong>. Veuillez conserver votre numéro de référence.
          </p>
          <a
            href="https://soshubca.vercel.app/client"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A03C] text-white font-semibold rounded-xl hover:bg-[#c4922e] transition-colors"
          >
            Accéder au portail client <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-[#1B2559] text-white">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#D4A03C] flex items-center justify-center font-bold text-[#1B2559] text-lg">S</div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">SOS Hub Canada</h1>
            <p className="text-xs text-gray-300">Votre guide vers une nouvelle vie au Canada</p>
          </div>
        </div>
      </header>

      {/* ── Progress Bar ── */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isDone
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-[#D4A03C] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      isActive ? "text-[#1B2559]" : isDone ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${isDone ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4A03C] to-[#e8b84d] rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
          {/* ═══════════ STEP 0 : Infos personnelles ═══════════ */}
          {step === 0 && (
            <div className="animate-fadeInUp">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#1B2559]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#1B2559]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1B2559]">Étape 1 — Informations personnelles</h2>
                  <p className="text-sm text-gray-500">Remplissez vos informations de base</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label required>Prénom</Label>
                  <Input value={form.prenom} onChange={(v) => update("prenom", v)} placeholder="Jean" error={errors.prenom} />
                </div>
                <div>
                  <Label required>Nom</Label>
                  <Input value={form.nom} onChange={(v) => update("nom", v)} placeholder="Tremblay" error={errors.nom} />
                </div>
                <div>
                  <Label>Date de naissance</Label>
                  <Input type="date" value={form.dateNaissance} onChange={(v) => update("dateNaissance", v)} />
                </div>
                <div>
                  <Label>Nationalité</Label>
                  <Input value={form.nationalite} onChange={(v) => update("nationalite", v)} placeholder="Canadienne" />
                </div>
                <div>
                  <Label>Situation matrimoniale</Label>
                  <Select value={form.situationMatrimoniale} onChange={(v) => update("situationMatrimoniale", v)} options={MARITAL_OPTIONS} />
                </div>
                <div>
                  <Label required>Courriel</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={form.courriel}
                      onChange={(e) => update("courriel", e.target.value)}
                      placeholder="jean@exemple.com"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/40 focus:border-[#D4A03C] ${
                        errors.courriel ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                      }`}
                    />
                  </div>
                  {errors.courriel && <p className="text-xs text-red-500 mt-1">{errors.courriel}</p>}
                </div>
                <div>
                  <Label required>Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.telephone}
                      onChange={(e) => update("telephone", e.target.value)}
                      placeholder="+1 (514) 555-0000"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/40 focus:border-[#D4A03C] ${
                        errors.telephone ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                      }`}
                    />
                  </div>
                  {errors.telephone && <p className="text-xs text-red-500 mt-1">{errors.telephone}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-[#D4A03C]" />
                  <span className="text-sm font-semibold text-[#1B2559]">Adresse complète</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input value={form.adresseRue} onChange={(v) => update("adresseRue", v)} placeholder="123 rue Sainte-Catherine Ouest" />
                  </div>
                  <Input value={form.adresseVille} onChange={(v) => update("adresseVille", v)} placeholder="Montréal" />
                  <Select
                    value={form.adresseProvince}
                    onChange={(v) => update("adresseProvince", v)}
                    options={[{ value: "", label: "-- Province --" }, ...PROVINCES.map((p) => ({ value: p, label: p }))]}
                  />
                  <Input value={form.adresseCodePostal} onChange={(v) => update("adresseCodePostal", v)} placeholder="H2X 1Y1" />
                  <Input value={form.adressePays} onChange={(v) => update("adressePays", v)} placeholder="Canada" />
                </div>
              </div>

              {/* Langue préférée */}
              <div className="mt-6">
                <Label>Langue préférée</Label>
                <div className="flex gap-3 mt-1">
                  {[
                    { value: "fr" as const, label: "Français" },
                    { value: "en" as const, label: "English" },
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => update("languePreferee", lang.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        form.languePreferee === lang.value
                          ? "bg-[#1B2559] text-white border-[#1B2559]"
                          : "bg-white text-gray-600 border-gray-300 hover:border-[#D4A03C]"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 1 : Votre profil ═══════════ */}
          {step === 1 && (
            <div className="animate-fadeInUp">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#1B2559]/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#1B2559]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1B2559]">Étape 2 — Profil d&apos;établissement</h2>
                  <p className="text-sm text-gray-500">Aidez-nous à comprendre votre situation</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label required>Pays de résidence actuel</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={form.paysResidence}
                      onChange={(e) => update("paysResidence", e.target.value)}
                      placeholder="France, Maroc, Cameroun..."
                      className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/40 focus:border-[#D4A03C] ${
                        errors.paysResidence ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                      }`}
                    />
                  </div>
                  {errors.paysResidence && <p className="text-xs text-red-500 mt-1">{errors.paysResidence}</p>}
                </div>
                <div>
                  <Label required>Statut actuel au Canada</Label>
                  <Select value={form.statutActuel} onChange={(v) => update("statutActuel", v)} options={STATUS_OPTIONS} error={errors.statutActuel} />
                </div>
                <div className="md:col-span-2">
                  <Label required>Programme d&apos;intérêt</Label>
                  <Select
                    value={form.programmeInteret}
                    onChange={(v) => update("programmeInteret", v)}
                    options={PROGRAM_OPTIONS}
                    error={errors.programmeInteret}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Languages className="w-4 h-4 text-[#D4A03C]" />
                    <Label>Niveau de français</Label>
                  </div>
                  <Select value={form.niveauFrancais} onChange={(v) => update("niveauFrancais", v)} options={LANGUAGE_LEVELS} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Languages className="w-4 h-4 text-[#D4A03C]" />
                    <Label>Niveau d&apos;anglais</Label>
                  </div>
                  <Select value={form.niveauAnglais} onChange={(v) => update("niveauAnglais", v)} options={LANGUAGE_LEVELS} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-[#D4A03C]" />
                    <Label>Plus haut niveau d&apos;éducation</Label>
                  </div>
                  <Select value={form.education} onChange={(v) => update("education", v)} options={EDUCATION_OPTIONS} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-[#D4A03C]" />
                    <Label>Années d&apos;expérience professionnelle</Label>
                  </div>
                  <Input
                    type="number"
                    value={form.anneesExperience}
                    onChange={(v) => update("anneesExperience", v)}
                    placeholder="0"
                    min={0}
                    max={50}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description courte de votre situation</Label>
                  <textarea
                    value={form.descriptionSituation}
                    onChange={(e) => update("descriptionSituation", e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Décrivez brièvement votre parcours et vos objectifs d’établissement..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/40 focus:border-[#D4A03C] resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">
                    {form.descriptionSituation.length}/500
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 2 : Contrat ═══════════ */}
          {step === 2 && (
            <div className="animate-fadeInUp">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#1B2559]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#1B2559]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1B2559]">Étape 3 — Acceptation du contrat</h2>
                  <p className="text-sm text-gray-500">Veuillez lire attentivement les conditions</p>
                </div>
              </div>

              {/* Programme summary */}
              <div className="bg-[#1B2559]/5 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Programme sélectionné</p>
                <p className="font-semibold text-[#1B2559]">{getProgramLabel(form.programmeInteret)}</p>
              </div>

              {/* Contract box */}
              <div className="border rounded-xl max-h-72 overflow-y-auto p-5 mb-6 bg-gray-50 text-sm text-gray-700 leading-relaxed space-y-4">
                <h3 className="font-bold text-[#1B2559] text-base">Conditions de service — SOS Hub Canada Inc.</h3>

                <div>
                  <h4 className="font-semibold text-[#1B2559] mb-1">1. Frais d&apos;ouverture de dossier</h4>
                  <p>
                    Les frais d&apos;ouverture de dossier de <strong>250,00 $ CAD</strong> sont non remboursables. Ce montant couvre l&apos;évaluation initiale de votre dossier, la création de votre profil dans notre système, ainsi que la première consultation avec un membre de notre équipe.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#1B2559] mb-1">2. Services inclus</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Évaluation complète de votre admissibilité</li>
                    <li>Consultation initiale avec un conseiller en établissement</li>
                    <li>Plan d&apos;action personnalisé</li>
                    <li>Accès au portail client sécurisé</li>
                    <li>Suivi de votre dossier en temps réel</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[#1B2559] mb-1">3. Politique de confidentialité</h4>
                  <p>
                    SOS Hub Canada Inc. s&apos;engage à protéger vos renseignements personnels conformément à la Loi sur la protection des renseignements personnels dans le secteur privé du Québec (Loi 25). Vos données ne seront jamais partagées avec des tiers sans votre consentement explicite.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#1B2559] mb-1">4. Droit de résiliation</h4>
                  <p>
                    Vous pouvez résilier le contrat de services à tout moment en envoyant un avis écrit. Les frais d&apos;ouverture de dossier demeurent non remboursables. Les honoraires pour services déjà rendus ne sont pas remboursables.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-[#1B2559] mb-1">5. Règlement du CICC</h4>
                  <p>
                    SOS Hub Canada Inc. opère conformément au Règlement du Collège des consultants en immigration et en citoyenneté (CICC). Les consultants réglementés en immigration canadienne (CRIC) sont liés par un code de déontologie strict.
                  </p>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <Checkbox
                  checked={form.acceptConditions}
                  onChange={(v) => update("acceptConditions", v)}
                  label="J'ai lu et j'accepte les conditions de service de SOS Hub Canada Inc."
                  error={errors.acceptConditions}
                />
                <Checkbox
                  checked={form.acceptFrais}
                  onChange={(v) => update("acceptFrais", v)}
                  label="Je comprends que les frais d'ouverture de 250 $ sont non remboursables"
                  error={errors.acceptFrais}
                />
                <Checkbox
                  checked={form.acceptRepresentation}
                  onChange={(v) => update("acceptRepresentation", v)}
                  label="J'autorise SOS Hub Canada à me représenter dans mes démarches administratives"
                  error={errors.acceptRepresentation}
                />
              </div>
            </div>
          )}

          {/* ═══════════ STEP 3 : Paiement ═══════════ */}
          {step === 3 && (
            <div className="animate-fadeInUp">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#1B2559]/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#1B2559]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1B2559]">Étape 4 — Paiement</h2>
                  <p className="text-sm text-gray-500">Frais d&apos;ouverture de dossier</p>
                </div>
              </div>

              {/* Summary card */}
              <div className="bg-gradient-to-r from-[#1B2559] to-[#2a3770] text-white rounded-xl p-5 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-300">Client</p>
                    <p className="font-semibold text-lg">{form.prenom} {form.nom}</p>
                    <p className="text-sm text-gray-300 mt-1">{getProgramLabel(form.programmeInteret)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">Montant</p>
                    <p className="text-2xl font-bold text-[#D4A03C]">250,00 $</p>
                    <p className="text-xs text-gray-400">CAD</p>
                  </div>
                </div>
              </div>

              {/* Payment methods */}
              <p className="text-sm font-semibold text-[#1B2559] mb-3">Choisissez votre mode de paiement</p>
              {errors.paymentMethod && (
                <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.paymentMethod}
                </p>
              )}

              <div className="space-y-3 mb-6">
                {/* Interac */}
                <button
                  type="button"
                  onClick={() => update("paymentMethod", "interac")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    form.paymentMethod === "interac"
                      ? "border-[#D4A03C] bg-[#D4A03C]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-[#D4A03C]" />
                    <div>
                      <p className="font-semibold text-[#1B2559]">Virement Interac</p>
                      <p className="text-xs text-gray-500">Transférez directement depuis votre banque</p>
                    </div>
                  </div>
                </button>

                {/* Square */}
                <button
                  type="button"
                  onClick={() => update("paymentMethod", "square")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    form.paymentMethod === "square"
                      ? "border-[#D4A03C] bg-[#D4A03C]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#D4A03C]" />
                    <div>
                      <p className="font-semibold text-[#1B2559]">Payer par carte</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, Amex (Square)</p>
                    </div>
                  </div>
                </button>

                {/* En personne */}
                <button
                  type="button"
                  onClick={() => update("paymentMethod", "en_personne")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    form.paymentMethod === "en_personne"
                      ? "border-[#D4A03C] bg-[#D4A03C]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-[#D4A03C]" />
                    <div>
                      <p className="font-semibold text-[#1B2559]">En personne</p>
                      <p className="text-xs text-gray-500">Je paierai au bureau</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Interac details */}
              {form.paymentMethod === "interac" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 animate-slideUp">
                  <h4 className="font-semibold text-[#1B2559] mb-3">Instructions de virement Interac</h4>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal ml-5 mb-4">
                    <li>Ouvrez votre application bancaire</li>
                    <li>
                      Envoyez <strong>250,00 $</strong> à l&apos;adresse suivante :
                    </li>
                  </ol>
                  <div className="flex items-center gap-2 bg-white rounded-lg p-3 border mb-4">
                    <Mail className="w-4 h-4 text-[#D4A03C] flex-shrink-0" />
                    <span className="text-sm font-mono font-semibold text-[#1B2559]">paiement@soshubcanada.com</span>
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="ml-auto text-gray-400 hover:text-[#D4A03C] transition-colors"
                      title="Copier"
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal ml-5 mb-4" start={3}>
                    <li>Indiquez votre nom complet dans le message</li>
                    <li>Entrez le numéro de confirmation ci-dessous</li>
                  </ol>
                  <div>
                    <Label required>Numéro de confirmation du virement</Label>
                    <Input
                      value={form.interacConfirmation}
                      onChange={(v) => update("interacConfirmation", v)}
                      placeholder="Ex: CA1234567890"
                      error={errors.interacConfirmation}
                    />
                  </div>
                </div>
              )}

              {/* Square Web Payments */}
              {form.paymentMethod === "square" && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 animate-slideUp">
                  <h4 className="font-semibold text-[#1B2559] mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Paiement par carte — Square
                  </h4>
                  <div id="square-card-container" className="mb-4">
                    <SquarePaymentForm
                      amount={250}
                      onSuccess={(paymentId) => {
                        update("interacConfirmation", paymentId);
                        setSquarePaymentDone(true);
                      }}
                      onError={(msg) => setSquareError(msg)}
                    />
                  </div>
                  {squareError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mb-2">
                      <AlertCircle className="w-3.5 h-3.5" /> {squareError}
                    </p>
                  )}
                  {squarePaymentDone && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Paiement de 250,00 $ effectué avec succès !
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    🔒 Paiement sécurisé traité par Square. Vos données bancaires ne sont jamais stockées sur nos serveurs.
                  </p>
                </div>
              )}

              {/* En personne */}
              {form.paymentMethod === "en_personne" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 animate-slideUp">
                  <h4 className="font-semibold text-[#1B2559] mb-2">Paiement en personne</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Vous pouvez payer directement à nos bureaux. Nous acceptons les paiements par débit, crédit ou comptant.
                  </p>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-[#D4A03C] mt-0.5 flex-shrink-0" />
                    <p>Nous vous contacterons dans les 24 à 48 heures pour planifier un rendez-vous.</p>
                  </div>
                </div>
              )}

              {/* Submit error */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-[#1B2559] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Précédent
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#D4A03C] text-white text-sm font-semibold rounded-xl hover:bg-[#c4922e] transition-colors btn-press"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || (form.paymentMethod === "square" && !squarePaymentDone)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1B2559] text-white text-sm font-semibold rounded-xl hover:bg-[#253370] transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-press"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...
                  </>
                ) : (
                  <>
                    Soumettre mon inscription <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#1B2559] text-gray-400 text-center py-6 text-xs">
        <p>SOS Hub Canada Inc. — Votre guide vers une nouvelle vie au Canada</p>
        <p className="mt-1">© {new Date().getFullYear()} Tous droits réservés</p>
      </footer>
    </div>
  );
}

// ========================================================
// Square Web Payments SDK Component
// ========================================================
function SquarePaymentForm({
  amount,
  onSuccess,
  onError,
}: {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInstanceRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const paymentsRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID || '';
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '';
  const isConfigured = Boolean(appId && locationId);

  // Load Square SDK
  useEffect(() => {
    if (!isConfigured) return;
    if (document.getElementById('square-web-sdk')) {
      setSdkLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'square-web-sdk';
    script.src = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'sandbox'
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js';
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => onError('Impossible de charger le SDK Square.');
    document.head.appendChild(script);
  }, [isConfigured]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize card form
  useEffect(() => {
    if (!sdkLoaded || !isConfigured || !cardRef.current || cardInstanceRef.current) return;

    const initCard = async () => {
      try {
        const win = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!win.Square) return;
        const payments = win.Square.payments(appId, locationId);
        paymentsRef.current = payments;
        const card = await payments.card();
        await card.attach(cardRef.current!);
        cardInstanceRef.current = card;
        setCardReady(true);
      } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        onError(e?.message || 'Erreur d\'initialisation Square.');
      }
    };
    initCard();

    return () => {
      if (cardInstanceRef.current) {
        try { cardInstanceRef.current.destroy(); } catch { /* */ }
        cardInstanceRef.current = null;
      }
    };
  }, [sdkLoaded, isConfigured, appId, locationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePay = async () => {
    if (!cardInstanceRef.current) return;
    setLoading(true);
    try {
      const result = await cardInstanceRef.current.tokenize();
      if (result.status === 'OK') {
        // Send token to our API to process payment
        const res = await fetch('/api/crm/square-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: result.token,
            amount: amount * 100, // cents
            currency: 'CAD',
            note: 'Frais d\'ouverture de dossier - SOS Hub Canada',
          }),
        });
        const data = await res.json();
        if (res.ok && data.paymentId) {
          onSuccess(data.paymentId);
        } else {
          onError(data.error || 'Erreur de paiement.');
        }
      } else {
        onError('Veuillez vérifier les informations de votre carte.');
      }
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      onError(e?.message || 'Erreur de paiement.');
    }
    setLoading(false);
  };

  if (!isConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <p className="text-sm text-amber-700 font-medium mb-1">Configuration Square requise</p>
        <p className="text-xs text-amber-600">
          Ajoutez NEXT_PUBLIC_SQUARE_APP_ID et NEXT_PUBLIC_SQUARE_LOCATION_ID dans vos variables d&apos;environnement.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={cardRef}
        className="min-h-[90px] rounded-lg border border-gray-300 bg-white"
        style={{ minHeight: 90 }}
      />
      <button
        type="button"
        onClick={handlePay}
        disabled={!cardReady || loading}
        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1B2559] text-white rounded-lg font-semibold text-sm hover:bg-[#1B2559]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" /> Payer {amount.toFixed(2)} $ CAD
          </>
        )}
      </button>
    </div>
  );
}
