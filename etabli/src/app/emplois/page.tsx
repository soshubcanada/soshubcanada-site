"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Building2,
  Send,
  CheckCircle,
  Filter,
  Sparkles,
  GraduationCap,
  Languages,
  FileCheck,
  X,
  ArrowRight,
  Lock,
  Crown,
  User,
  Star,
  FileText,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

// ─── USER PROFILE HELPERS ───
type UserTier = "guest" | "standard" | "premium";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  tier: UserTier;
  cv?: string;
  message?: string;
}

function loadUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem("etabli_user_profile");
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function saveUserProfile(profile: UserProfile) {
  localStorage.setItem("etabli_user_profile", JSON.stringify(profile));
}

function loadApplications(): { jobId: number; date: string; status: string }[] {
  try {
    return JSON.parse(localStorage.getItem("etabli_applications") || "[]");
  } catch { return []; }
}

function saveApplication(jobId: number) {
  const apps = loadApplications();
  apps.push({ jobId, date: new Date().toISOString(), status: "sent" });
  localStorage.setItem("etabli_applications", JSON.stringify(apps));
}

// ─── TYPES ───
type Job = {
  id: number;
  company: string;
  title: { fr: string; en: string };
  location: string;
  salary: { fr: string; en: string };
  type: string;
  typeLabel: { fr: string; en: string };
  sector: { fr: string; en: string };
  description: { fr: string; en: string };
  daysAgo: number;
  tags: { fr: string; en: string }[];
  logoColor: string;
  initial: string;
  contactEmail: string;
  eimt: boolean;
  frenchBeginner: boolean;
  training: boolean;
};

// ─── JOB DATA ───
const jobs: Job[] = [
  {
    id: 1,
    company: "CHSLD Ste-Anne",
    title: { fr: "Préposé(e) aux bénéficiaires", en: "Patient Care Attendant" },
    location: "Montréal",
    salary: { fr: "22 – 26 $/h", en: "$22 – $26/h" },
    type: "temps_plein",
    typeLabel: { fr: "Temps plein", en: "Full-time" },
    sector: { fr: "Santé", en: "Healthcare" },
    description: {
      fr: "Rejoignez notre équipe de soins en CHSLD. Formation d'intégration offerte. Horaires stables, assurances collectives et possibilité d'obtenir une attestation d'études collégiales.",
      en: "Join our long-term care team. Integration training provided. Stable schedules, group insurance and possibility of obtaining a college certificate.",
    },
    daysAgo: 1,
    tags: [
      { fr: "Santé", en: "Healthcare" },
      { fr: "Formation offerte", en: "Training provided" },
    ],
    logoColor: "#085041",
    initial: "C",
    contactEmail: "rh@chsld-ste-anne.qc.ca",
    eimt: false,
    frenchBeginner: false,
    training: true,
  },
  {
    id: 2,
    company: "NovaTech Solutions",
    title: { fr: "Développeur(euse) web junior", en: "Junior Web Developer" },
    location: "Montréal",
    salary: { fr: "55 000 – 70 000 $/an", en: "$55K – $70K/year" },
    type: "temps_plein",
    typeLabel: { fr: "Temps plein", en: "Full-time" },
    sector: { fr: "TI", en: "IT" },
    description: {
      fr: "Startup du Plateau cherche développeur React/Node.js. Environnement bilingue, mentorat senior, bureau flexible et politique de télétravail hybride. Visa de travail sponsorisé.",
      en: "Plateau startup looking for React/Node.js developer. Bilingual environment, senior mentorship, flexible office and hybrid remote policy. Work visa sponsored.",
    },
    daysAgo: 2,
    tags: [
      { fr: "TI", en: "IT" },
      { fr: "Bilingue requis", en: "Bilingual required" },
    ],
    logoColor: "#6366f1",
    initial: "N",
    contactEmail: "jobs@novatech.io",
    eimt: true,
    frenchBeginner: false,
    training: false,
  },
  {
    id: 3,
    company: "Acier Progrès Inc.",
    title: { fr: "Soudeur(euse) certifié(e)", en: "Certified Welder" },
    location: "Laval",
    salary: { fr: "28 – 35 $/h", en: "$28 – $35/h" },
    type: "temps_plein",
    typeLabel: { fr: "Temps plein", en: "Full-time" },
    sector: { fr: "Construction", en: "Construction" },
    description: {
      fr: "Usine de fabrication métallique à Laval. EIMT disponible pour candidats internationaux qualifiés. Certification CWB un atout. Assurances et REER collectifs offerts.",
      en: "Metal fabrication plant in Laval. LMIA available for qualified international candidates. CWB certification an asset. Group insurance and RRSP offered.",
    },
    daysAgo: 3,
    tags: [
      { fr: "Construction", en: "Construction" },
      { fr: "EIMT disponible", en: "LMIA available" },
    ],
    logoColor: "#D97706",
    initial: "A",
    contactEmail: "emplois@acierprogres.com",
    eimt: true,
    frenchBeginner: true,
    training: true,
  },
  {
    id: 4,
    company: "Groupe Mallette CPA",
    title: { fr: "Commis comptable", en: "Accounting Clerk" },
    location: "Québec",
    salary: { fr: "45 000 – 55 000 $/an", en: "$45K – $55K/year" },
    type: "temps_plein",
    typeLabel: { fr: "Temps plein", en: "Full-time" },
    sector: { fr: "Administration", en: "Administration" },
    description: {
      fr: "Cabinet comptable établi recherche commis pour saisie de données, conciliations bancaires et soutien aux audits. Connaissance de Sage ou QuickBooks requise. Français intermédiaire minimum.",
      en: "Established accounting firm seeking clerk for data entry, bank reconciliations and audit support. Knowledge of Sage or QuickBooks required. Intermediate French minimum.",
    },
    daysAgo: 5,
    tags: [
      { fr: "Administration", en: "Administration" },
      { fr: "Temps plein", en: "Full-time" },
    ],
    logoColor: "#1D9E75",
    initial: "G",
    contactEmail: "carrieres@mallette.ca",
    eimt: false,
    frenchBeginner: false,
    training: false,
  },
  {
    id: 5,
    company: "CPE Les Petits Soleils",
    title: { fr: "Éducatrice en CPE", en: "Daycare Educator" },
    location: "Montréal",
    salary: { fr: "23 – 28 $/h", en: "$23 – $28/h" },
    type: "temps_plein",
    typeLabel: { fr: "Temps plein", en: "Full-time" },
    sector: { fr: "Éducation", en: "Education" },
    description: {
      fr: "Garderie à Rosemont cherche éducatrice qualifiée. AEC ou DEC en éducation à l'enfance requis (équivalence acceptée). Ambiance chaleureuse, ratio enfants-éducatrice respecté.",
      en: "Rosemont daycare seeking qualified educator. AEC or DEC in early childhood education required (equivalency accepted). Warm environment, child-educator ratio respected.",
    },
    daysAgo: 4,
    tags: [
      { fr: "Éducation", en: "Education" },
      { fr: "Français requis", en: "French required" },
    ],
    logoColor: "#ec4899",
    initial: "P",
    contactEmail: "direction@cpepetitssoleils.com",
    eimt: false,
    frenchBeginner: false,
    training: true,
  },
  {
    id: 6,
    company: "Amazon Flex",
    title: { fr: "Livreur(euse) Amazon Flex", en: "Amazon Flex Delivery Driver" },
    location: "Montréal",
    salary: { fr: "18 – 25 $/h", en: "$18 – $25/h" },
    type: "temps_partiel",
    typeLabel: { fr: "Temps partiel", en: "Part-time" },
    sector: { fr: "Transport", en: "Transport" },
    description: {
      fr: "Livraison flexible avec votre propre véhicule. Choisissez vos blocs horaires. Idéal comme revenu complémentaire. Permis de conduire québécois et véhicule requis.",
      en: "Flexible delivery with your own vehicle. Choose your time blocks. Ideal as supplementary income. Quebec driver's license and vehicle required.",
    },
    daysAgo: 1,
    tags: [
      { fr: "Transport", en: "Transport" },
      { fr: "Temps partiel", en: "Part-time" },
    ],
    logoColor: "#f59e0b",
    initial: "A",
    contactEmail: "flex@amazon.ca",
    eimt: false,
    frenchBeginner: true,
    training: false,
  },
  {
    id: 7,
    company: "InfoServ Technologies",
    title: { fr: "Technicien(ne) informatique", en: "IT Technician" },
    location: "Longueuil",
    salary: { fr: "50 000 – 60 000 $/an", en: "$50K – $60K/year" },
    type: "temps_plein",
    typeLabel: { fr: "Temps plein", en: "Full-time" },
    sector: { fr: "TI", en: "IT" },
    description: {
      fr: "PME de la Rive-Sud cherche technicien support niveau 1-2. Installation, maintenance réseau et support utilisateurs. Certification CompTIA A+ un atout. Télétravail partiel possible.",
      en: "South Shore SME seeking level 1-2 support technician. Installation, network maintenance and user support. CompTIA A+ certification an asset. Partial remote work possible.",
    },
    daysAgo: 6,
    tags: [
      { fr: "TI", en: "IT" },
      { fr: "Télétravail", en: "Remote" },
    ],
    logoColor: "#3b82f6",
    initial: "I",
    contactEmail: "hr@infoserv.ca",
    eimt: true,
    frenchBeginner: false,
    training: true,
  },
  {
    id: 8,
    company: "Bistro du Vieux-Port",
    title: { fr: "Aide-cuisinier(ière)", en: "Kitchen Helper" },
    location: "Montréal",
    salary: { fr: "17 – 20 $/h", en: "$17 – $20/h" },
    type: "temps_partiel",
    typeLabel: { fr: "Temps partiel", en: "Part-time" },
    sector: { fr: "Restauration", en: "Food Service" },
    description: {
      fr: "Restaurant populaire du Vieux-Port cherche aide-cuisinier. Soirs et weekends principalement. Expérience en cuisine un atout mais formation sur place offerte. Repas inclus.",
      en: "Popular Old Port restaurant seeking kitchen helper. Mainly evenings and weekends. Kitchen experience an asset but on-site training provided. Meals included.",
    },
    daysAgo: 2,
    tags: [
      { fr: "Restauration", en: "Food Service" },
      { fr: "Soirs/weekends", en: "Evenings/weekends" },
    ],
    logoColor: "#ef4444",
    initial: "B",
    contactEmail: "info@bistrovieuxport.com",
    eimt: false,
    frenchBeginner: true,
    training: true,
  },
];

// ─── FILTER OPTIONS ───
const filterOptions = [
  { key: "tous", fr: "Tous", en: "All" },
  { key: "temps_plein", fr: "Temps plein", en: "Full-time" },
  { key: "temps_partiel", fr: "Temps partiel", en: "Part-time" },
  { key: "stage", fr: "Stage", en: "Internship" },
  { key: "teletravail", fr: "Télétravail", en: "Remote" },
  { key: "bilingue", fr: "Bilingue requis", en: "Bilingual required" },
];

const cityOptions = [
  { value: "Montréal", fr: "Montréal", en: "Montreal" },
  { value: "Québec", fr: "Québec", en: "Quebec City" },
  { value: "Laval", fr: "Laval", en: "Laval" },
  { value: "Gatineau", fr: "Gatineau", en: "Gatineau" },
  { value: "Sherbrooke", fr: "Sherbrooke", en: "Sherbrooke" },
  { value: "Trois-Rivières", fr: "Trois-Rivières", en: "Trois-Rivières" },
  { value: "Autre", fr: "Autre", en: "Other" },
];

const typeOptions = [
  { value: "temps_plein", fr: "Temps plein", en: "Full-time" },
  { value: "temps_partiel", fr: "Temps partiel", en: "Part-time" },
  { value: "contractuel", fr: "Contractuel", en: "Contract" },
  { value: "stage", fr: "Stage", en: "Internship" },
];

const sectorOptions = [
  { value: "sante", fr: "Santé", en: "Healthcare" },
  { value: "ti", fr: "TI", en: "IT" },
  { value: "construction", fr: "Construction", en: "Construction" },
  { value: "restauration", fr: "Restauration", en: "Food Service" },
  { value: "commerce", fr: "Commerce", en: "Retail" },
  { value: "education", fr: "Éducation", en: "Education" },
  { value: "manufacture", fr: "Manufacture", en: "Manufacturing" },
  { value: "transport", fr: "Transport", en: "Transport" },
  { value: "administration", fr: "Administration", en: "Administration" },
  { value: "autre", fr: "Autre", en: "Other" },
];

// ─── COMPONENT ───
export default function EmploisPage() {
  const { lang } = useLang();
  const fr = lang === "fr";

  // ── User Profile State ──
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<Job | null>(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);
  const [applications, setApplications] = useState<{ jobId: number; date: string; status: string }[]>([]);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", tier: "standard" as UserTier });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const profile = loadUserProfile();
    if (profile) setUserProfile(profile);
    setApplications(loadApplications());
  }, []);

  const hasApplied = (jobId: number) => applications.some((a) => a.jobId === jobId);

  function handleCreateProfile() {
    if (!profileForm.name || !profileForm.email) return;
    const profile: UserProfile = { ...profileForm };
    saveUserProfile(profile);
    setUserProfile(profile);
    setShowProfileModal(false);
  }

  function handleApply(job: Job) {
    if (!userProfile) { setShowProfileModal(true); return; }
    if (userProfile.tier === "standard" || userProfile.tier === "premium") {
      setShowApplyModal(job);
      setApplyMessage("");
      setApplySuccess(false);
    }
  }

  function submitApplication() {
    if (!showApplyModal || !userProfile) return;
    saveApplication(showApplyModal.id);
    setApplications(loadApplications());
    setApplySuccess(true);
    // Auto-close after 2s
    setTimeout(() => { setShowApplyModal(null); setApplySuccess(false); }, 2500);
  }

  // ── Job Board State ──
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("tous");
  const [visibleCount, setVisibleCount] = useState(4);

  // ── Employer Form State ──
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactEmail: "",
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

  // ── Filtered Jobs ──
  const filtered = useMemo(() => {
    let result = [...jobs];

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.fr.toLowerCase().includes(q) ||
          j.title.en.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.fr.toLowerCase().includes(q) ||
          j.description.en.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }

    // Filter chips
    if (activeFilter !== "tous") {
      if (activeFilter === "teletravail") {
        result = result.filter((j) =>
          j.tags.some(
            (t) =>
              t.fr.toLowerCase().includes("télétravail") ||
              t.en.toLowerCase().includes("remote")
          )
        );
      } else if (activeFilter === "bilingue") {
        result = result.filter((j) =>
          j.tags.some(
            (t) =>
              t.fr.toLowerCase().includes("bilingue") ||
              t.en.toLowerCase().includes("bilingual")
          )
        );
      } else {
        result = result.filter((j) => j.type === activeFilter);
      }
    }

    return result;
  }, [search, activeFilter]);

  const visibleJobs = filtered.slice(0, visibleCount);

  // ── Form Handlers ──
  const updateForm = (
    field: string,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.description.length < 50) return;

    const existing = JSON.parse(
      localStorage.getItem("etabli_employer_posts") || "[]"
    );
    existing.push({ ...form, submittedAt: new Date().toISOString() });
    localStorage.setItem("etabli_employer_posts", JSON.stringify(existing));

    setToast(true);
    setTimeout(() => setToast(false), 4000);
    setForm({
      companyName: "",
      contactEmail: "",
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

  // ── Days ago helper ──
  const daysAgoLabel = (d: number) => {
    if (d === 0) return fr ? "Aujourd'hui" : "Today";
    if (d === 1) return fr ? "Ajouté hier" : "Added yesterday";
    return fr ? `Ajouté il y a ${d} jours` : `Added ${d} days ago`;
  };

  return (
    <Shell>
      <div className="min-h-screen bg-gray-50">
        {/* ═══ HERO ═══ */}
        <section
          className="relative overflow-hidden py-14 md:py-20"
          style={{
            background:
              "linear-gradient(135deg, #085041 0%, #0a6b56 50%, #1D9E75 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-10 left-10 w-72 h-72 rounded-full"
              style={{ background: "#1D9E75", filter: "blur(80px)" }}
            />
            <div
              className="absolute bottom-10 right-20 w-96 h-96 rounded-full"
              style={{ background: "#D97706", filter: "blur(100px)" }}
            />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Briefcase className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-medium text-white/90">
                {fr
                  ? `${jobs.length} offres vérifiées`
                  : `${jobs.length} verified listings`}
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {fr
                ? "Emplois pour nouveaux arrivants au Québec"
                : "Jobs for newcomers to Quebec"}
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              {fr
                ? "Offres vérifiées d'employeurs partenaires qui accueillent les immigrants"
                : "Verified listings from partner employers who welcome immigrants"}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(4);
                }}
                placeholder={
                  fr
                    ? "Rechercher un poste, entreprise ou ville..."
                    : "Search for a position, company or city..."
                }
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-800 placeholder-gray-400 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </section>

        {/* ═══ FILTER CHIPS ═══ */}
        <div className="max-w-5xl mx-auto px-4 -mt-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            {filterOptions.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setActiveFilter(f.key);
                  setVisibleCount(4);
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === f.key
                    ? "text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
                style={
                  activeFilter === f.key
                    ? { background: "#085041" }
                    : undefined
                }
              >
                {fr ? f.fr : f.en}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ JOB LISTINGS ═══ */}
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {filtered.length}{" "}
              {fr
                ? filtered.length === 1
                  ? "offre trouvée"
                  : "offres trouvées"
                : filtered.length === 1
                ? "listing found"
                : "listings found"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {fr
                  ? "Aucune offre ne correspond à votre recherche."
                  : "No listings match your search."}
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveFilter("tous");
                }}
                className="mt-4 text-sm font-medium hover:underline"
                style={{ color: "#1D9E75" }}
              >
                {fr ? "Réinitialiser les filtres" : "Reset filters"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 hover:shadow-lg hover:border-gray-300 transition-all group"
                >
                  <div className="flex gap-4">
                    {/* Logo placeholder */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                      style={{ background: job.logoColor }}
                    >
                      {job.initial}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg text-gray-900 group-hover:text-[#085041] transition-colors">
                            {fr ? job.title.fr : job.title.en}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              {fr ? job.salary.fr : job.salary.en}
                            </span>
                          </div>
                        </div>

                        {job.daysAgo <= 2 && (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full text-white shrink-0"
                            style={{ background: "#D97706" }}
                          >
                            <Sparkles className="w-3 h-3" />
                            {fr ? "Nouveau" : "New"}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span
                          className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{
                            background: "#085041" + "15",
                            color: "#085041",
                          }}
                        >
                          {fr ? job.typeLabel.fr : job.typeLabel.en}
                        </span>
                        {job.tags.map((t, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                          >
                            {fr ? t.fr : t.en}
                          </span>
                        ))}
                        {job.eimt && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                            <FileCheck className="w-3 h-3" />
                            {fr ? "EIMT" : "LMIA"}
                          </span>
                        )}
                        {job.frenchBeginner && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                            <Languages className="w-3 h-3" />
                            {fr ? "FR débutant OK" : "Beginner FR OK"}
                          </span>
                        )}
                        {job.training && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                            <GraduationCap className="w-3 h-3" />
                            {fr ? "Formation" : "Training"}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {fr ? job.description.fr : job.description.en}
                      </p>

                      {/* Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {daysAgoLabel(job.daysAgo)}
                        </span>
                        {mounted && hasApplied(job.id) ? (
                          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-[#1D9E75] bg-[#E1F5EE]">
                            <CheckCircle className="w-4 h-4" />
                            {fr ? "Candidature envoyée" : "Application sent"}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApply(job)}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md"
                            style={{ background: "#1D9E75" }}
                          >
                            <Send className="w-4 h-4" />
                            {fr ? "Postuler" : "Apply"}
                            {!userProfile && <Lock className="w-3 h-3 ml-1 opacity-60" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Voir plus */}
          {visibleCount < filtered.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount((prev) => prev + 4)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-md"
                style={{
                  borderColor: "#085041",
                  color: "#085041",
                }}
              >
                <ChevronDown className="w-4 h-4" />
                {fr
                  ? `Voir plus (${filtered.length - visibleCount} restantes)`
                  : `Show more (${filtered.length - visibleCount} remaining)`}
              </button>
            </div>
          )}
        </section>

        {/* ═══ EMPLOYER PORTAL CTA ═══ */}
        <section className="max-w-5xl mx-auto px-4 pb-6">
          <Link
            href="/portail/inscription?type=employeur"
            className="flex items-center justify-between p-5 bg-gradient-to-r from-[#085041] to-[#1D9E75] rounded-2xl text-white hover:opacity-95 transition-opacity group"
          >
            <div>
              <h3 className="font-bold text-lg font-[family-name:var(--font-heading)]">
                {fr ? "Créez votre espace employeur gratuit" : "Create your free employer space"}
              </h3>
              <p className="text-white/70 text-sm mt-1">
                {fr ? "Gérez vos offres, suivez les candidatures et accédez au bassin de talents internationaux" : "Manage your listings, track applications and access the international talent pool"}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 flex-shrink-0 ml-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

        {/* ═══ EMPLOYER POSTING FORM ═══ */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Accordion Header */}
            <button
              onClick={() => setFormOpen(!formOpen)}
              className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "#085041" + "15" }}
                >
                  <Building2 className="w-6 h-6" style={{ color: "#085041" }} />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl font-bold text-gray-900">
                    {fr
                      ? "Vous recrutez? Publiez une offre gratuitement"
                      : "Hiring? Post a job for free"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {fr
                      ? "Rejoignez nos employeurs partenaires et recrutez des talents internationaux"
                      : "Join our partner employers and recruit international talent"}
                  </p>
                </div>
              </div>
              {formOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
              )}
            </button>

            {/* Form Content */}
            {formOpen && (
              <form
                onSubmit={handleSubmit}
                className="border-t border-gray-100 p-6 md:p-8"
              >
                <div className="grid md:grid-cols-2 gap-5">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {fr ? "Nom de l'entreprise" : "Company name"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.companyName}
                      onChange={(e) =>
                        updateForm("companyName", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={
                        {
                          "--tw-ring-color": "#1D9E75",
                        } as React.CSSProperties
                      }
                      placeholder={
                        fr ? "ex: Groupe ABC Inc." : "e.g. ABC Group Inc."
                      }
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {fr ? "Courriel de contact" : "Contact email"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.contactEmail}
                      onChange={(e) =>
                        updateForm("contactEmail", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={
                        {
                          "--tw-ring-color": "#1D9E75",
                        } as React.CSSProperties
                      }
                      placeholder="rh@entreprise.com"
                    />
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {fr ? "Titre du poste" : "Job title"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.jobTitle}
                      onChange={(e) => updateForm("jobTitle", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={
                        {
                          "--tw-ring-color": "#1D9E75",
                        } as React.CSSProperties
                      }
                      placeholder={
                        fr ? "ex: Technicien en soudage" : "e.g. Welding Technician"
                      }
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {fr ? "Ville" : "City"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.city}
                      onChange={(e) => updateForm("city", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={
                        {
                          "--tw-ring-color": "#1D9E75",
                        } as React.CSSProperties
                      }
                    >
                      <option value="">
                        {fr ? "Sélectionner..." : "Select..."}
                      </option>
                      {cityOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {fr ? c.fr : c.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {fr ? "Type d'emploi" : "Employment type"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.type}
                      onChange={(e) => updateForm("type", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={
                        {
                          "--tw-ring-color": "#1D9E75",
                        } as React.CSSProperties
                      }
                    >
                      <option value="">
                        {fr ? "Sélectionner..." : "Select..."}
                      </option>
                      {typeOptions.map((t) => (
                        <option key={t.value} value={t.value}>
                          {fr ? t.fr : t.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {fr ? "Secteur" : "Sector"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.sector}
                      onChange={(e) => updateForm("sector", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                      style={
                        {
                          "--tw-ring-color": "#1D9E75",
                        } as React.CSSProperties
                      }
                    >
                      <option value="">
                        {fr ? "Sélectionner..." : "Select..."}
                      </option>
                      {sectorOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {fr ? s.fr : s.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Salary */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {fr ? "Salaire" : "Salary"}{" "}
                      <span className="text-gray-400 font-normal">
                        ({fr ? "optionnel" : "optional"})
                      </span>
                    </label>
                    <input
                      type="text"
                      value={form.salary}
                      onChange={(e) => updateForm("salary", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={
                        {
                          "--tw-ring-color": "#1D9E75",
                        } as React.CSSProperties
                      }
                      placeholder={
                        fr
                          ? "ex: 25$/h ou 55 000$/an"
                          : "e.g. $25/h or $55,000/year"
                      }
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {fr ? "Description du poste" : "Job description"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      minLength={50}
                      rows={5}
                      value={form.description}
                      onChange={(e) =>
                        updateForm("description", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-y"
                      style={
                        {
                          "--tw-ring-color": "#1D9E75",
                        } as React.CSSProperties
                      }
                      placeholder={
                        fr
                          ? "Décrivez le poste, les responsabilités, les qualifications requises..."
                          : "Describe the position, responsibilities, required qualifications..."
                      }
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {form.description.length}/50{" "}
                      {fr ? "caractères minimum" : "characters minimum"}
                    </p>
                  </div>

                  {/* Checkboxes */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.eimt}
                        onChange={(e) => updateForm("eimt", e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#1D9E75]"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {fr
                            ? "EIMT disponible pour ce poste"
                            : "LMIA available for this position"}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fr
                            ? "Étude d'impact sur le marché du travail"
                            : "Labour Market Impact Assessment"}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.frenchBeginner}
                        onChange={(e) =>
                          updateForm("frenchBeginner", e.target.checked)
                        }
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#1D9E75]"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {fr
                            ? "Français débutant accepté"
                            : "Beginner French accepted"}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fr
                            ? "Le candidat peut avoir un niveau de français de base"
                            : "The candidate may have a basic level of French"}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.training}
                        onChange={(e) =>
                          updateForm("training", e.target.checked)
                        }
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#1D9E75]"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {fr ? "Formation offerte" : "Training provided"}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fr
                            ? "Vous offrez une formation d'intégration aux nouveaux employés"
                            : "You provide onboarding training for new employees"}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <div className="mt-6 flex items-center gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ background: "#085041" }}
                  >
                    <Send className="w-4 h-4" />
                    {fr ? "Soumettre l'offre" : "Submit listing"}
                  </button>
                  <span className="text-xs text-gray-400">
                    {fr
                      ? "Les offres sont vérifiées avant publication"
                      : "Listings are reviewed before publishing"}
                  </span>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* ═══ TOAST ═══ */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.3s_ease-out]">
            <div
              className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-white shadow-2xl"
              style={{ background: "#085041" }}
            >
              <CheckCircle className="w-5 h-5 text-emerald-300" />
              <span className="text-sm font-medium">
                {fr
                  ? "Votre offre a été soumise pour vérification!"
                  : "Your listing has been submitted for review!"}
              </span>
              <button
                onClick={() => setToast(false)}
                className="ml-2 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast animation */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ═══ USER PROFILE BAR (floating) ═══ */}
      {mounted && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[calc(100%-2rem)]">
          {userProfile ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${userProfile.tier === "premium" ? "bg-[#D97706]" : "bg-[#1D9E75]"}`}>
                  {userProfile.tier === "premium" ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{userProfile.name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    {userProfile.tier === "premium" ? (
                      <><Crown className="w-3 h-3 text-[#D97706]" /> Premium</>
                    ) : (
                      <>Standard</>
                    )}
                    {" — "}{applications.length} {fr ? "candidature(s)" : "application(s)"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {userProfile.tier === "standard" && (
                  <button
                    onClick={() => { const p = { ...userProfile, tier: "premium" as UserTier }; saveUserProfile(p); setUserProfile(p); }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Crown className="w-3 h-3 inline mr-1" />
                    {fr ? "Passer Premium" : "Upgrade"}
                  </button>
                )}
                <button
                  onClick={() => { localStorage.removeItem("etabli_user_profile"); setUserProfile(null); }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  {fr ? "Déconnexion" : "Logout"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full bg-[#085041] text-white rounded-2xl shadow-lg px-5 py-3.5 flex items-center justify-between hover:bg-[#0a6350] transition-colors"
            >
              <div className="text-left">
                <p className="font-semibold text-sm">{fr ? "Créez votre profil pour postuler" : "Create your profile to apply"}</p>
                <p className="text-xs text-white/60 mt-0.5">{fr ? "Gratuit — Standard ou Premium" : "Free — Standard or Premium"}</p>
              </div>
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </button>
          )}
        </div>
      )}

      {/* ═══ PROFILE CREATION MODAL ═══ */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-1">
              {fr ? "Créer mon profil candidat" : "Create my candidate profile"}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {fr ? "Postulez directement depuis l'application et suivez vos candidatures." : "Apply directly from the app and track your applications."}
            </p>

            {/* Tier selection */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => setProfileForm({ ...profileForm, tier: "standard" })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${profileForm.tier === "standard" ? "border-[#1D9E75] bg-[#f0fdf8]" : "border-gray-200 hover:border-gray-300"}`}
              >
                <User className="w-5 h-5 text-[#1D9E75] mb-2" />
                <p className="font-bold text-sm">Standard</p>
                <p className="text-xs text-gray-500 mt-1">{fr ? "Gratuit — 5 candidatures/mois" : "Free — 5 applications/month"}</p>
              </button>
              <button
                onClick={() => setProfileForm({ ...profileForm, tier: "premium" })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${profileForm.tier === "premium" ? "border-[#D97706] bg-amber-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <Crown className="w-5 h-5 text-[#D97706] mb-2" />
                <p className="font-bold text-sm">Premium</p>
                <p className="text-xs text-gray-500 mt-1">{fr ? "Candidatures illimitées + priorité" : "Unlimited applications + priority"}</p>
              </button>
            </div>

            {/* Form fields */}
            <div className="space-y-3">
              <input type="text" placeholder={fr ? "Nom complet *" : "Full name *"} value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] outline-none" />
              <input type="email" placeholder={fr ? "Courriel *" : "Email *"} value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] outline-none" />
              <input type="tel" placeholder={fr ? "Téléphone" : "Phone"} value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] outline-none" />
            </div>

            <button
              onClick={handleCreateProfile}
              disabled={!profileForm.name || !profileForm.email}
              className="w-full mt-5 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: profileForm.tier === "premium" ? "#D97706" : "#1D9E75" }}
            >
              {profileForm.tier === "premium"
                ? (fr ? "Créer mon profil Premium" : "Create Premium profile")
                : (fr ? "Créer mon profil Standard" : "Create Standard profile")}
            </button>
          </div>
        </div>
      )}

      {/* ═══ APPLICATION MODAL ═══ */}
      {showApplyModal && userProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowApplyModal(null); setApplySuccess(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setShowApplyModal(null); setApplySuccess(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>

            {applySuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#1D9E75]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                  {fr ? "Candidature envoyée!" : "Application sent!"}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {fr
                    ? `Votre candidature pour "${showApplyModal.title.fr}" a été transmise à ${showApplyModal.company}. Vous recevrez une réponse dans votre espace.`
                    : `Your application for "${showApplyModal.title.en}" has been sent to ${showApplyModal.company}. You'll receive a response in your space.`}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-1">
                  {fr ? "Postuler" : "Apply"}
                </h2>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-4 mt-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm`} style={{ background: showApplyModal.logoColor }}>
                    {showApplyModal.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{fr ? showApplyModal.title.fr : showApplyModal.title.en}</p>
                    <p className="text-xs text-gray-500">{showApplyModal.company} — {showApplyModal.location}</p>
                  </div>
                </div>

                {/* Profile summary */}
                <div className="bg-[#f0fdf8] rounded-xl p-3 mb-4 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${userProfile.tier === "premium" ? "bg-[#D97706]" : "bg-[#1D9E75]"}`}>
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
                    <p className="text-xs text-gray-500">{userProfile.email} — {userProfile.tier === "premium" ? "Premium" : "Standard"}</p>
                  </div>
                </div>

                {/* Message */}
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MessageSquare className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  {fr ? "Message à l'employeur" : "Message to employer"}
                  {userProfile.tier === "premium" && <span className="text-[#D97706] text-xs ml-2">{fr ? "(Premium)" : "(Premium)"}</span>}
                </label>
                {userProfile.tier === "premium" ? (
                  <textarea
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    placeholder={fr ? "Présentez-vous brièvement et expliquez votre intérêt pour ce poste..." : "Briefly introduce yourself and explain your interest in this position..."}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] outline-none resize-none"
                  />
                ) : (
                  <div className="relative">
                    <textarea
                      disabled
                      placeholder={fr ? "Message personnalisé disponible en Premium" : "Custom message available in Premium"}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 resize-none"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => { const p = { ...userProfile, tier: "premium" as UserTier }; saveUserProfile(p); setUserProfile(p); }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white font-semibold hover:opacity-90"
                      >
                        <Crown className="w-3 h-3 inline mr-1" />
                        {fr ? "Débloquer avec Premium" : "Unlock with Premium"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Premium benefits reminder */}
                {userProfile.tier === "standard" && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    <Crown className="w-3.5 h-3.5 inline mr-1 text-[#D97706]" />
                    {fr
                      ? "Standard : candidature automatique (nom + courriel). Premium : message personnalisé + badge priorité + suivi en temps réel."
                      : "Standard: automatic application (name + email). Premium: custom message + priority badge + real-time tracking."}
                  </div>
                )}

                <button
                  onClick={submitApplication}
                  className="w-full mt-4 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "#1D9E75" }}
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  {fr ? "Envoyer ma candidature" : "Send my application"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}
