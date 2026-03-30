"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  Heart,
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  Eye,
  FileText,
  Users,
  LogOut,
  Plus,
  Edit3,
  ExternalLink,
  AlertCircle,
  MapPin,
  DollarSign,
  Send,
  Star,
  Globe,
  Phone,
  Mail,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Trash2,
  Save,
  X,
  BadgeCheck,
  Sparkles,
  GraduationCap,
  Languages,
  FileCheck,
  MessageSquare,
  LayoutDashboard,
  User,
  Settings,
  CalendarDays,
} from "lucide-react";

// ─── TYPES ───
type PartnerBase = {
  email: string;
  type: "employeur" | "professionnel" | "organisme";
  name: string;
  status?: "pending" | "verified";
  registeredAt?: string;
  lastLogin?: string;
};

type EmployerPartner = PartnerBase & {
  type: "employeur";
  company?: string;
  phone?: string;
  website?: string;
};

type ProfessionalPartner = PartnerBase & {
  type: "professionnel";
  title?: string;
  specialties?: string[];
  languages?: string[];
  rate?: string;
  city?: string;
  description?: string;
  badge?: string;
};

type OrganismePartner = PartnerBase & {
  type: "organisme";
  mission?: string;
  services?: string[];
  territory?: string;
  phone?: string;
  website?: string;
  hours?: string;
};

type Partner = EmployerPartner | ProfessionalPartner | OrganismePartner;

type EmployerPost = {
  companyName: string;
  contactEmail: string;
  jobTitle: string;
  city: string;
  type: string;
  sector: string;
  salary: string;
  description: string;
  eimt: boolean;
  frenchBeginner: boolean;
  training: boolean;
  submittedAt: string;
  status?: "active" | "expired";
};

// ─── OPTIONS ───
const cityOptions = [
  "Montreal",
  "Quebec",
  "Laval",
  "Gatineau",
  "Sherbrooke",
  "Trois-Rivieres",
  "Autre",
];

const typeOptions = [
  { value: "temps_plein", fr: "Temps plein", en: "Full-time" },
  { value: "temps_partiel", fr: "Temps partiel", en: "Part-time" },
  { value: "contractuel", fr: "Contractuel", en: "Contract" },
  { value: "stage", fr: "Stage", en: "Internship" },
];

const sectorOptions = [
  { value: "sante", fr: "Sante", en: "Healthcare" },
  { value: "ti", fr: "TI", en: "IT" },
  { value: "construction", fr: "Construction", en: "Construction" },
  { value: "restauration", fr: "Restauration", en: "Food Service" },
  { value: "commerce", fr: "Commerce", en: "Retail" },
  { value: "education", fr: "Education", en: "Education" },
  { value: "manufacture", fr: "Manufacture", en: "Manufacturing" },
  { value: "transport", fr: "Transport", en: "Transport" },
  { value: "administration", fr: "Administration", en: "Administration" },
  { value: "autre", fr: "Autre", en: "Other" },
];

const defaultServices = [
  { fr: "Aide à l'établissement", en: "Settlement assistance" },
  { fr: "Cours de francisation", en: "French language courses" },
  { fr: "Aide à l'emploi", en: "Employment assistance" },
  { fr: "Services juridiques", en: "Legal services" },
  { fr: "Aide au logement", en: "Housing assistance" },
  { fr: "Soutien psychosocial", en: "Psychosocial support" },
  { fr: "Aide à la reconnaissance des diplômes", en: "Credential recognition help" },
  { fr: "Activités communautaires", en: "Community activities" },
];

// ─── STATUS BANNER ───
function StatusBanner({ status, fr }: { status: string; fr: boolean }) {
  const isPending = status === "pending" || !status;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
        isPending
          ? "bg-amber-50 text-amber-800 border border-amber-200"
          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
      }`}
    >
      {isPending ? (
        <Clock size={18} className="text-amber-600 shrink-0" />
      ) : (
        <CheckCircle size={18} className="text-emerald-600 shrink-0" />
      )}
      <span>
        {isPending
          ? fr
            ? "Votre profil est en cours de vérification"
            : "Your profile is being verified"
          : fr
          ? "Profil vérifié"
          : "Profile verified"}
      </span>
      {!isPending && (
        <BadgeCheck size={18} className="text-emerald-600 shrink-0 ml-auto" />
      )}
    </div>
  );
}

// ─── EMPLOYER DASHBOARD ───
function EmployerDashboard({
  partner,
  fr,
  onUpdate,
}: {
  partner: EmployerPartner;
  fr: boolean;
  onUpdate: (p: Partner) => void;
}) {
  const [posts, setPosts] = useState<EmployerPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"offres" | "profil">("offres");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    companyName: partner.company || partner.name || "",
    contactEmail: partner.email,
    jobTitle: "",
    city: "",
    type: "",
    sector: "",
    salary: "",
    description: "",
    eimt: false,
    frenchBeginner: false,
    training: false,
  });

  // Load posts
  useEffect(() => {
    try {
      const raw = localStorage.getItem("etabli_employer_posts");
      if (raw) {
        const all: EmployerPost[] = JSON.parse(raw);
        const mine = all.filter(
          (p) => p.contactEmail.toLowerCase() === partner.email.toLowerCase()
        );
        setPosts(mine);
      }
    } catch {
      /* ignore */
    }
  }, [partner.email]);

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.description.length < 50) return;

    const existing = JSON.parse(
      localStorage.getItem("etabli_employer_posts") || "[]"
    );
    const newPost = { ...form, submittedAt: new Date().toISOString(), status: "active" as const };
    existing.push(newPost);
    localStorage.setItem("etabli_employer_posts", JSON.stringify(existing));

    setPosts((prev) => [...prev, newPost]);
    setToast(fr ? "Offre soumise avec succes!" : "Listing submitted successfully!");
    setTimeout(() => setToast(""), 4000);
    setShowForm(false);
    setForm({
      companyName: partner.company || partner.name || "",
      contactEmail: partner.email,
      jobTitle: "",
      city: "",
      type: "",
      sector: "",
      salary: "",
      description: "",
      eimt: false,
      frenchBeginner: false,
      training: false,
    });
  };

  const stats = {
    offres: posts.length,
    vues: posts.length * 47,
    candidatures: posts.length * 8,
  };

  const tabs = [
    { key: "offres" as const, label: fr ? "Mes offres" : "My listings", icon: FileText },
    { key: "profil" as const, label: fr ? "Mon profil" : "My profile", icon: User },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-[#085041] text-[#085041]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: fr ? "Offres publiees" : "Published listings",
            value: stats.offres,
            icon: FileText,
            color: "#085041",
          },
          {
            label: fr ? "Vues totales" : "Total views",
            value: stats.vues,
            icon: Eye,
            color: "#1D9E75",
          },
          {
            label: fr ? "Candidatures recues" : "Applications received",
            value: stats.candidatures,
            icon: Users,
            color: "#D97706",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: stat.color + "15" }}
            >
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {activeTab === "offres" && (
        <>
          {/* My Job Listings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                {fr ? "Mes offres d'emploi" : "My job listings"}
              </h3>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#085041" }}
              >
                <Plus size={16} />
                {fr ? "Nouvelle offre" : "New listing"}
              </button>
            </div>

            {posts.length === 0 && !showForm ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  {fr
                    ? "Vous n'avez pas encore publie d'offres."
                    : "You haven't published any listings yet."}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#1D9E75" }}
                >
                  <Plus size={16} />
                  {fr ? "Publier une nouvelle offre" : "Publish a new listing"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post, i) => {
                  const date = new Date(post.submittedAt);
                  const daysAgo = Math.floor(
                    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const isExpired = daysAgo > 30;
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: isExpired ? "#9ca3af" : "#085041" }}
                      >
                        {post.jobTitle.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {post.jobTitle}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {post.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} />
                            {date.toLocaleDateString(fr ? "fr-CA" : "en-CA")}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                          isExpired
                            ? "bg-gray-100 text-gray-500"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {isExpired
                          ? fr ? "Expirée" : "Expired"
                          : fr ? "Active" : "Active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inline Job Form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                  {fr ? "Publier une nouvelle offre" : "Publish a new listing"}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {fr ? "Titre du poste" : "Job title"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.jobTitle}
                      onChange={(e) => updateForm("jobTitle", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                      placeholder={fr ? "ex: Technicien en soudage" : "e.g. Welding Technician"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {fr ? "Ville" : "City"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.city}
                      onChange={(e) => updateForm("city", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent bg-white"
                    >
                      <option value="">{fr ? "Selectionner..." : "Select..."}</option>
                      {cityOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {fr ? "Type d'emploi" : "Employment type"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.type}
                      onChange={(e) => updateForm("type", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent bg-white"
                    >
                      <option value="">{fr ? "Selectionner..." : "Select..."}</option>
                      {typeOptions.map((t) => (
                        <option key={t.value} value={t.value}>{fr ? t.fr : t.en}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {fr ? "Secteur" : "Sector"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.sector}
                      onChange={(e) => updateForm("sector", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent bg-white"
                    >
                      <option value="">{fr ? "Selectionner..." : "Select..."}</option>
                      {sectorOptions.map((s) => (
                        <option key={s.value} value={s.value}>{fr ? s.fr : s.en}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {fr ? "Salaire" : "Salary"}{" "}
                      <span className="text-gray-400 font-normal">({fr ? "optionnel" : "optional"})</span>
                    </label>
                    <input
                      type="text"
                      value={form.salary}
                      onChange={(e) => updateForm("salary", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                      placeholder={fr ? "ex: 25$/h ou 55 000$/an" : "e.g. $25/h or $55,000/year"}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {fr ? "Description du poste" : "Job description"} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      minLength={50}
                      rows={4}
                      value={form.description}
                      onChange={(e) => updateForm("description", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent resize-y"
                      placeholder={
                        fr
                          ? "Decrivez le poste, les responsabilites, les qualifications..."
                          : "Describe the position, responsibilities, qualifications..."
                      }
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {form.description.length}/50 {fr ? "caracteres minimum" : "characters minimum"}
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    {[
                      {
                        key: "eimt",
                        label: fr ? "EIMT disponible" : "LMIA available",
                        sub: fr ? "Etude d'impact sur le marche du travail" : "Labour Market Impact Assessment",
                      },
                      {
                        key: "frenchBeginner",
                        label: fr ? "Francais debutant accepte" : "Beginner French accepted",
                        sub: fr ? "Niveau de francais de base accepte" : "Basic French level accepted",
                      },
                      {
                        key: "training",
                        label: fr ? "Formation offerte" : "Training provided",
                        sub: fr ? "Formation d'integration offerte" : "Onboarding training provided",
                      },
                    ].map((cb) => (
                      <label key={cb.key} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form[cb.key as keyof typeof form] as boolean}
                          onChange={(e) => updateForm(cb.key, e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#1D9E75]"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">{cb.label}</span>
                          <p className="text-xs text-gray-400">{cb.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: "#085041" }}
                  >
                    <Send size={16} />
                    {fr ? "Soumettre l'offre" : "Submit listing"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
                  >
                    {fr ? "Annuler" : "Cancel"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Links */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/emplois"
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-[#1D9E75] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center shrink-0">
                <ExternalLink size={18} className="text-[#1D9E75]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 group-hover:text-[#085041]">
                  {fr ? "Voir mes offres sur le site" : "View my listings on site"}
                </div>
                <div className="text-xs text-gray-500">{fr ? "Page emplois" : "Jobs page"}</div>
              </div>
              <ArrowRight size={16} className="text-gray-400 ml-auto group-hover:text-[#1D9E75]" />
            </Link>
            <button
              onClick={() => setActiveTab("profil")}
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-[#1D9E75] transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[#085041]/10 flex items-center justify-center shrink-0">
                <Edit3 size={18} className="text-[#085041]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 group-hover:text-[#085041]">
                  {fr ? "Modifier mon profil" : "Edit my profile"}
                </div>
                <div className="text-xs text-gray-500">
                  {fr ? "Informations de l'entreprise" : "Company information"}
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 ml-auto group-hover:text-[#1D9E75]" />
            </button>
          </div>
        </>
      )}

      {activeTab === "profil" && (
        <EmployerProfileEdit partner={partner} fr={fr} onUpdate={onUpdate} />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-2xl bg-[#085041]">
            <CheckCircle size={18} className="text-emerald-300" />
            <span className="text-sm font-medium">{toast}</span>
            <button onClick={() => setToast("")} className="text-white/60 hover:text-white ml-2">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EMPLOYER PROFILE EDIT ───
function EmployerProfileEdit({
  partner,
  fr,
  onUpdate,
}: {
  partner: EmployerPartner;
  fr: boolean;
  onUpdate: (p: Partner) => void;
}) {
  const [name, setName] = useState(partner.company || partner.name || "");
  const [phone, setPhone] = useState(partner.phone || "");
  const [website, setWebsite] = useState(partner.website || "");
  const [saved, setSaved] = useState(false);

  const save = () => {
    const updated: EmployerPartner = { ...partner, company: name, name, phone, website };
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
        {fr ? "Informations de l'entreprise" : "Company information"}
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {fr ? "Nom de l'entreprise" : "Company name"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {fr ? "Courriel" : "Email"}
          </label>
          <input
            type="email"
            value={partner.email}
            disabled
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {fr ? "Telephone" : "Phone"}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
            placeholder="514-555-0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {fr ? "Site web" : "Website"}
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#085041" }}
        >
          <Save size={16} />
          {fr ? "Enregistrer" : "Save"}
        </button>
        {saved && (
          <span className="text-sm text-emerald-600 flex items-center gap-1">
            <CheckCircle size={14} /> {fr ? "Enregistre!" : "Saved!"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── PROFESSIONAL DASHBOARD ───
function ProfessionalDashboard({
  partner,
  fr,
  onUpdate,
}: {
  partner: ProfessionalPartner;
  fr: boolean;
  onUpdate: (p: Partner) => void;
}) {
  const [activeTab, setActiveTab] = useState<"profil" | "modifier" | "demandes">("profil");
  const [specialties, setSpecialties] = useState(partner.specialties?.join(", ") || "");
  const [languages, setLanguages] = useState(partner.languages?.join(", ") || "");
  const [rate, setRate] = useState(partner.rate || "");
  const [city, setCity] = useState(partner.city || "");
  const [description, setDescription] = useState(partner.description || "");
  const [saved, setSaved] = useState(false);

  const tabs = [
    { key: "profil" as const, label: fr ? "Apercu du profil" : "Profile preview", icon: User },
    { key: "modifier" as const, label: fr ? "Modifier" : "Edit", icon: Edit3 },
    { key: "demandes" as const, label: fr ? "Demandes" : "Requests", icon: MessageSquare },
  ];

  const save = () => {
    const updated: ProfessionalPartner = {
      ...partner,
      specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean),
      languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
      rate,
      city,
      description,
    };
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-[#085041] text-[#085041]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profil" && (
        <div className="space-y-4">
          {/* Profile Preview Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ backgroundColor: "#085041" }}
              >
                {partner.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-gray-600">{partner.title || (fr ? "Professionnel" : "Professional")}</p>
                  </div>
                  {partner.badge && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      <BadgeCheck size={12} />
                      {partner.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                  {partner.city && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {partner.city}
                    </span>
                  )}
                  {partner.rate && (
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} /> {partner.rate}
                    </span>
                  )}
                  {partner.languages && partner.languages.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Globe size={14} /> {partner.languages.join(", ")}
                    </span>
                  )}
                </div>

                {partner.specialties && partner.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {partner.specialties.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#085041]/10 text-[#085041]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {partner.description && (
                  <p className="text-sm text-gray-600 mt-3">{partner.description}</p>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/marketplace"
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-[#1D9E75] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center shrink-0">
              <ExternalLink size={18} className="text-[#1D9E75]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 group-hover:text-[#085041]">
                {fr ? "Voir mon profil sur la marketplace" : "View my profile on the marketplace"}
              </div>
              <div className="text-xs text-gray-500">{fr ? "Page marketplace" : "Marketplace page"}</div>
            </div>
            <ArrowRight size={16} className="text-gray-400 ml-auto group-hover:text-[#1D9E75]" />
          </Link>
        </div>
      )}

      {activeTab === "modifier" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {fr ? "Modifier mon profil" : "Edit my profile"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fr ? "Specialites" : "Specialties"}{" "}
                <span className="text-gray-400 font-normal">({fr ? "separees par des virgules" : "comma separated"})</span>
              </label>
              <input
                type="text"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                placeholder={fr ? "Établissement, Droit du travail..." : "Établissement, Labour law..."}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fr ? "Langues" : "Languages"}{" "}
                <span className="text-gray-400 font-normal">({fr ? "separees par des virgules" : "comma separated"})</span>
              </label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                placeholder="Francais, English, ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fr ? "Tarif" : "Rate"}
              </label>
              <input
                type="text"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                placeholder={fr ? "100$ - 200$/h" : "$100 - $200/h"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fr ? "Ville" : "City"}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                placeholder="Montreal"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fr ? "Description" : "Description"}
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent resize-y"
                placeholder={fr ? "Decrivez vos services..." : "Describe your services..."}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={save}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#085041" }}
            >
              <Save size={16} />
              {fr ? "Enregistrer" : "Save"}
            </button>
            {saved && (
              <span className="text-sm text-emerald-600 flex items-center gap-1">
                <CheckCircle size={14} /> {fr ? "Enregistre!" : "Saved!"}
              </span>
            )}
          </div>
        </div>
      )}

      {activeTab === "demandes" && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
            {fr ? "Demandes de clients" : "Client requests"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {fr
              ? "Vous recevrez des demandes de clients ici. Cette fonctionnalite sera activee prochainement."
              : "You will receive client requests here. This feature will be activated soon."}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── ORGANISME DASHBOARD ───
function OrganismeDashboard({
  partner,
  fr,
  onUpdate,
}: {
  partner: OrganismePartner;
  fr: boolean;
  onUpdate: (p: Partner) => void;
}) {
  const [activeTab, setActiveTab] = useState<"apercu" | "services" | "contact">("apercu");
  const [services, setServices] = useState<string[]>(
    partner.services || defaultServices.slice(0, 3).map((s) => (fr ? s.fr : s.en))
  );
  const [phone, setPhone] = useState(partner.phone || "");
  const [email] = useState(partner.email);
  const [website, setWebsite] = useState(partner.website || "");
  const [hours, setHours] = useState(partner.hours || "");
  const [mission, setMission] = useState(partner.mission || "");
  const [territory, setTerritory] = useState(partner.territory || "");
  const [saved, setSaved] = useState(false);

  const tabs = [
    { key: "apercu" as const, label: fr ? "Apercu" : "Overview", icon: LayoutDashboard },
    { key: "services" as const, label: fr ? "Services" : "Services", icon: Settings },
    { key: "contact" as const, label: fr ? "Contact" : "Contact", icon: Phone },
  ];

  const toggleService = (service: string) => {
    setServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const saveAll = () => {
    const updated: OrganismePartner = {
      ...partner,
      services,
      phone,
      website,
      hours,
      mission,
      territory,
    };
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-[#085041] text-[#085041]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "apercu" && (
        <div className="space-y-4">
          {/* Organization Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ backgroundColor: "#D97706" }}
              >
                {partner.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                  {partner.name}
                </h3>
                {partner.mission && (
                  <p className="text-sm text-gray-600 mt-1">{partner.mission}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                  {partner.territory && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {partner.territory}
                    </span>
                  )}
                  {partner.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={14} /> {partner.phone}
                    </span>
                  )}
                </div>

                {services.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {services.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Edit */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              {fr ? "Informations de l'organisme" : "Organization information"}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {fr ? "Mission" : "Mission"}
                </label>
                <textarea
                  rows={3}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent resize-y"
                  placeholder={fr ? "Decrivez la mission de votre organisme..." : "Describe your organization's mission..."}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {fr ? "Territoire desservi" : "Territory served"}
                </label>
                <input
                  type="text"
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                  placeholder={fr ? "ex: Grand Montreal" : "e.g. Greater Montreal"}
                />
              </div>
            </div>
          </div>

          <Link
            href="/guide-etablissement"
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-[#D97706] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <ExternalLink size={18} className="text-[#D97706]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 group-hover:text-[#085041]">
                {fr ? "Voir mon organisme dans le guide" : "View my organization in the guide"}
              </div>
              <div className="text-xs text-gray-500">
                {fr ? "Guide d'établissement" : "Settlement guide"}
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-400 ml-auto group-hover:text-[#D97706]" />
          </Link>
        </div>
      )}

      {activeTab === "services" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {fr ? "Services offerts" : "Services offered"}
          </h3>
          <p className="text-sm text-gray-500">
            {fr
              ? "Cochez les services que votre organisme offre aux nouveaux arrivants."
              : "Check the services your organization offers to newcomers."}
          </p>
          <div className="space-y-2">
            {defaultServices.map((svc, i) => {
              const label = fr ? svc.fr : svc.en;
              const checked = services.includes(label);
              return (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? "border-[#1D9E75] bg-[#1D9E75]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleService(label)}
                    className="w-4 h-4 rounded border-gray-300 accent-[#1D9E75]"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              );
            })}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#085041" }}
            >
              <Save size={16} />
              {fr ? "Enregistrer" : "Save"}
            </button>
            {saved && (
              <span className="text-sm text-emerald-600 flex items-center gap-1">
                <CheckCircle size={14} /> {fr ? "Enregistre!" : "Saved!"}
              </span>
            )}
          </div>
        </div>
      )}

      {activeTab === "contact" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            {fr ? "Coordonnees" : "Contact information"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fr ? "Telephone" : "Phone"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                placeholder="514-555-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fr ? "Courriel" : "Email"}
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fr ? "Site web" : "Website"}
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fr ? "Heures d'ouverture" : "Business hours"}
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                placeholder={fr ? "Lun-Ven 9h-17h" : "Mon-Fri 9am-5pm"}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#085041" }}
            >
              <Save size={16} />
              {fr ? "Enregistrer" : "Save"}
            </button>
            {saved && (
              <span className="text-sm text-emerald-600 flex items-center gap-1">
                <CheckCircle size={14} /> {fr ? "Enregistre!" : "Saved!"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LOGIN FORM ───
function LoginForm({ fr }: { fr: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    if (!email.trim()) {
      setError(fr ? "Veuillez entrer votre courriel." : "Please enter your email.");
      return;
    }
    try {
      const raw = localStorage.getItem("etabli_partners");
      if (raw) {
        const partners: Partner[] = JSON.parse(raw);
        const found = partners.find(
          (p) => p.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (found) {
          window.location.href = `/portail/dashboard?email=${encodeURIComponent(found.email)}`;
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setError(
      fr
        ? "Aucun compte partenaire trouve avec ce courriel."
        : "No partner account found with this email."
    );
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#085041]/10 flex items-center justify-center mx-auto mb-4">
          <Mail size={28} className="text-[#085041]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
          {fr ? "Espace partenaire" : "Partner space"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {fr
            ? "Entrez votre courriel pour acceder a votre espace"
            : "Enter your email to access your space"}
        </p>

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder={fr ? "votre@courriel.com" : "your@email.com"}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] outline-none placeholder:text-gray-400"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#085041] hover:bg-[#085041]/90 transition-colors flex items-center justify-center gap-2"
          >
            {fr ? "Acceder a mon espace" : "Access my space"}
            <ArrowRight size={16} />
          </button>
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-red-600">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            {fr ? "Pas encore inscrit?" : "Not registered yet?"}
          </p>
          <Link
            href="/portail"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D9E75] hover:underline"
          >
            {fr ? "S'inscrire comme partenaire" : "Register as a partner"}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── NOT FOUND ───
function PartnerNotFound({ fr }: { fr: boolean }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
          {fr ? "Partenaire introuvable" : "Partner not found"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {fr
            ? "Aucun compte partenaire n'est associe a cette adresse courriel."
            : "No partner account is associated with this email address."}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/portail"
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#085041] hover:bg-[#085041]/90 transition-colors flex items-center justify-center gap-2"
          >
            {fr ? "S'inscrire comme partenaire" : "Register as a partner"}
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/portail"
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            {fr ? "Retour au portail" : "Back to portal"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD PAGE ───
function DashboardPage() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [noEmail, setNoEmail] = useState(false);

  // Mount guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth lookup
  useEffect(() => {
    if (!mounted) return;

    const emailParam = searchParams.get("email");
    if (!emailParam) {
      setNoEmail(true);
      return;
    }

    try {
      const raw = localStorage.getItem("etabli_partners");
      if (raw) {
        const partners: Partner[] = JSON.parse(raw);
        const found = partners.find(
          (p) => p.email.toLowerCase() === emailParam.toLowerCase()
        );
        if (found) {
          // Update last login
          const updated = { ...found, lastLogin: new Date().toISOString() };
          const updatedList = partners.map((p) =>
            p.email.toLowerCase() === emailParam.toLowerCase() ? updated : p
          );
          localStorage.setItem("etabli_partners", JSON.stringify(updatedList));
          setPartner(updated);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setNotFound(true);
  }, [mounted, searchParams]);

  // Update partner in localStorage
  const handleUpdatePartner = useCallback(
    (updated: Partner) => {
      try {
        const raw = localStorage.getItem("etabli_partners");
        if (raw) {
          const partners: Partner[] = JSON.parse(raw);
          const updatedList = partners.map((p) =>
            p.email.toLowerCase() === updated.email.toLowerCase() ? updated : p
          );
          localStorage.setItem("etabli_partners", JSON.stringify(updatedList));
          setPartner(updated);
        }
      } catch {
        /* ignore */
      }
    },
    []
  );

  // Logout
  const handleLogout = () => {
    window.location.href = "/portail";
  };

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#085041] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No email param → show login form
  if (noEmail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoginForm fr={fr} />
      </div>
    );
  }

  // Partner not found
  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PartnerNotFound fr={fr} />
      </div>
    );
  }

  // Still loading
  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#085041] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Partner type labels
  const typeLabels: Record<string, { fr: string; en: string; icon: typeof Building2; color: string }> = {
    employeur: { fr: "Employeur", en: "Employer", icon: Building2, color: "#059669" },
    professionnel: { fr: "Professionnel", en: "Professional", icon: Briefcase, color: "#2563EB" },
    organisme: { fr: "Organisme", en: "Organization", icon: Heart, color: "#D97706" },
  };

  const typeInfo = typeLabels[partner.type];
  const TypeIcon = typeInfo.icon;

  // Welcome name
  const welcomeName = partner.type === "employeur"
    ? (partner as EmployerPartner).company || partner.name
    : partner.type === "professionnel"
    ? `${partner.name}${(partner as ProfessionalPartner).title ? ` — ${(partner as ProfessionalPartner).title}` : ""}`
    : partner.name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#085041] via-[#0a6350] to-[#1D9E75] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: typeInfo.color + "30" }}
                >
                  <TypeIcon size={16} className="text-white" />
                </div>
                <span className="text-white/70 text-sm font-medium">
                  {fr ? typeInfo.fr : typeInfo.en}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-heading)]">
                {fr ? "Bienvenue, " : "Welcome, "}
                {welcomeName}
              </h1>
              {partner.lastLogin && (
                <p className="text-white/50 text-xs mt-2 flex items-center gap-1">
                  <Clock size={12} />
                  {fr ? "Derniere connexion : " : "Last login: "}
                  {new Date(partner.lastLogin).toLocaleDateString(
                    fr ? "fr-CA" : "en-CA",
                    { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
                  )}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/80 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors self-start"
            >
              <LogOut size={16} />
              {fr ? "Deconnexion" : "Logout"}
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Status Banner */}
        <StatusBanner status={partner.status || "pending"} fr={fr} />

        {/* Type-specific dashboard */}
        {partner.type === "employeur" && (
          <EmployerDashboard
            partner={partner as EmployerPartner}
            fr={fr}
            onUpdate={handleUpdatePartner}
          />
        )}
        {partner.type === "professionnel" && (
          <ProfessionalDashboard
            partner={partner as ProfessionalPartner}
            fr={fr}
            onUpdate={handleUpdatePartner}
          />
        )}
        {partner.type === "organisme" && (
          <OrganismeDashboard
            partner={partner as OrganismePartner}
            fr={fr}
            onUpdate={handleUpdatePartner}
          />
        )}
      </div>
    </div>
  );
}

// ─── EXPORT ───
export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin" /></div>}>
        <DashboardPage />
      </Suspense>
    </Shell>
  );
}
