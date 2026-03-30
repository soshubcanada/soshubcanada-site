"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePortalEmployerAuth } from "@/lib/portal-auth";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/crm-types";
import {
  Building2,
  FileText,
  FolderOpen,
  Users,
  MessageCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Globe,
  Phone,
  Mail,
  MapPin,
  Hash,
  User,
  Calendar,
  Edit3,
  Menu,
  X,
  Save,
  XCircle,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  FileUp,
  ListChecks,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── TYPES ───
type Tab = "entreprise" | "lmia" | "documents" | "travailleurs" | "messages";

type LmiaStatus = "en_preparation" | "soumis" | "en_traitement" | "approuve" | "refuse";

type DocUploadCategory =
  | "offre_emploi"
  | "preuve_recrutement"
  | "plan_transition"
  | "bilan_financier"
  | "enregistrement_entreprise"
  | "licence_permis"
  | "contrat_travail"
  | "autre";

type DocStatus = "en_attente" | "verifie" | "rejete";

interface LmiaRequest {
  id: string;
  position: string;
  nocCode: string;
  status: LmiaStatus;
  workersRequested: number;
  salaryOffered: number;
  lmiaNumber: string;
  submittedAt: string;
  timeline: { date: string; status: string; note: string }[];
}

interface EmployerDocument {
  id: string;
  name: string;
  category: DocUploadCategory;
  uploadedAt: string;
  status: DocStatus;
  size: number;
}

interface Worker {
  id: string;
  name: string;
  nationality: string;
  position: string;
  status: "en_recrutement" | "pt_obtenu" | "en_poste" | "termine";
}

interface ChatMessage {
  id: string;
  from: "employer" | "coordinator";
  text: string;
  timestamp: string;
  read: boolean;
}

interface CompanyInfo {
  name: string;
  legalName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  naicsCode: string;
  naicsDescription: string;
  neq: string;
  bnFederal: string;
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
}

type ChecklistItemStatus = "not_uploaded" | "uploaded" | "verified" | "missing";

interface EimtChecklistItem {
  id: string;
  label: string;
  required: boolean;
  status: ChecklistItemStatus;
  linkedDocId?: string;
}

// ─── MOCK DATA ───
const INITIAL_COMPANY: CompanyInfo = {
  name: "Constructions Laval Inc.",
  legalName: "9876-5432 Constructions Laval Inc.",
  address: "1250 Boulevard Chomedey, Laval, QC H7V 3Y7",
  phone: "(450) 555-1234",
  email: "info@constructionslaval.ca",
  website: "www.constructionslaval.ca",
  naicsCode: "236220",
  naicsDescription: "Construction commerciale et institutionnelle",
  neq: "1145678901",
  bnFederal: "876543210RC0001",
  contactName: "Jean-Pierre Tremblay",
  contactTitle: "Directeur des ressources humaines",
  contactPhone: "(450) 555-1235",
  contactEmail: "jp.tremblay@constructionslaval.ca",
};

const MOCK_LMIA: LmiaRequest[] = [
  {
    id: "lmia-001",
    position: "Charpentier-menuisier",
    nocCode: "72310",
    status: "approuve",
    workersRequested: 3,
    salaryOffered: 28.5,
    lmiaNumber: "A1234567",
    submittedAt: "2025-09-15",
    timeline: [
      { date: "2025-08-01", status: "en_preparation", note: "Dossier ouvert" },
      { date: "2025-09-15", status: "soumis", note: "Soumis a EDSC via le portail" },
      { date: "2025-10-20", status: "en_traitement", note: "Documents supplementaires demandes" },
      { date: "2025-12-10", status: "approuve", note: "EIMT approuvee - A1234567" },
    ],
  },
  {
    id: "lmia-002",
    position: "Soudeur",
    nocCode: "72106",
    status: "en_traitement",
    workersRequested: 2,
    salaryOffered: 30.0,
    lmiaNumber: "",
    submittedAt: "2026-01-20",
    timeline: [
      { date: "2025-12-15", status: "en_preparation", note: "Preparation des documents" },
      { date: "2026-01-20", status: "soumis", note: "Soumis a EDSC" },
      { date: "2026-02-15", status: "en_traitement", note: "En cours d'analyse" },
    ],
  },
  {
    id: "lmia-003",
    position: "Electricien industriel",
    nocCode: "72200",
    status: "en_preparation",
    workersRequested: 1,
    salaryOffered: 32.0,
    lmiaNumber: "",
    submittedAt: "",
    timeline: [
      { date: "2026-03-01", status: "en_preparation", note: "Collecte des documents en cours" },
    ],
  },
];

const MOCK_DOCUMENTS: EmployerDocument[] = [
  { id: "doc-1", name: "Certificat_NEQ_2025.pdf", category: "enregistrement_entreprise", uploadedAt: "2025-08-10", status: "verifie", size: 245000 },
  { id: "doc-2", name: "Etats_financiers_2024.pdf", category: "bilan_financier", uploadedAt: "2025-08-12", status: "verifie", size: 1230000 },
  { id: "doc-3", name: "Licence_RBQ.pdf", category: "licence_permis", uploadedAt: "2025-08-12", status: "verifie", size: 560000 },
  { id: "doc-4", name: "Preuve_recrutement_charpentier.pdf", category: "preuve_recrutement", uploadedAt: "2025-09-01", status: "verifie", size: 890000 },
  { id: "doc-5", name: "Plan_transition_soudeur.pdf", category: "plan_transition", uploadedAt: "2026-01-10", status: "en_attente", size: 420000 },
  { id: "doc-6", name: "Offre_emploi_electricien.pdf", category: "offre_emploi", uploadedAt: "2026-03-05", status: "en_attente", size: 310000 },
  { id: "doc-7", name: "Contrat_travail_charpentier.pdf", category: "contrat_travail", uploadedAt: "2025-09-10", status: "verifie", size: 175000 },
];

const INITIAL_CHECKLIST: EimtChecklistItem[] = [
  { id: "ck-1", label: "Enregistrement / incorporation de l\u2019entreprise", required: true, status: "verified", linkedDocId: "doc-1" },
  { id: "ck-2", label: "Licence ou permis provincial/territorial", required: true, status: "verified", linkedDocId: "doc-3" },
  { id: "ck-3", label: "Numero d\u2019entreprise de l\u2019ARC (NE)", required: true, status: "uploaded" },
  { id: "ck-4", label: "Preuve d\u2019activite commerciale (etats financiers)", required: true, status: "verified", linkedDocId: "doc-2" },
  { id: "ck-5", label: "Details de l\u2019offre d\u2019emploi", required: true, status: "uploaded", linkedDocId: "doc-6" },
  { id: "ck-6", label: "Preuves d\u2019efforts de recrutement (annonces, sites web)", required: true, status: "verified", linkedDocId: "doc-4" },
  { id: "ck-7", label: "Plan de transition (si applicable)", required: false, status: "uploaded", linkedDocId: "doc-5" },
  { id: "ck-8", label: "Plan des avantages pour le marche du travail", required: true, status: "missing" },
  { id: "ck-9", label: "Documentation du salaire en vigueur", required: true, status: "not_uploaded" },
];

const MOCK_WORKERS: Worker[] = [
  { id: "w-1", name: "Carlos Rodriguez", nationality: "Mexique", position: "Charpentier-menuisier", status: "en_poste" },
  { id: "w-2", name: "Miguel Santos", nationality: "Guatemala", position: "Charpentier-menuisier", status: "pt_obtenu" },
  { id: "w-3", name: "Ahmed Benali", nationality: "Tunisie", position: "Charpentier-menuisier", status: "en_recrutement" },
  { id: "w-4", name: "Philippe Nguyen", nationality: "Vietnam", position: "Soudeur", status: "en_recrutement" },
];

const MOCK_MESSAGES: ChatMessage[] = [
  { id: "m-1", from: "coordinator", text: "Bonjour M. Tremblay, votre EIMT pour le poste de charpentier-menuisier a ete approuvee. Le numero est A1234567.", timestamp: "2025-12-10T10:30:00", read: true },
  { id: "m-2", from: "employer", text: "Excellent! Merci beaucoup. Quelles sont les prochaines etapes pour le recrutement?", timestamp: "2025-12-10T11:15:00", read: true },
  { id: "m-3", from: "coordinator", text: "Nous allons lancer le recrutement sur nos plateformes partenaires. Je vous enverrai les profils d'ici 2 semaines.", timestamp: "2025-12-10T14:00:00", read: true },
  { id: "m-4", from: "coordinator", text: "Nous avons trouve 3 candidats potentiels pour le poste de soudeur. J'ai besoin de documents supplementaires pour la nouvelle EIMT. Pouvez-vous telecharger le plan de transition mis a jour?", timestamp: "2026-03-15T09:00:00", read: false },
];

// ─── LABEL / COLOR MAPS ───
const LMIA_STATUS_LABELS: Record<LmiaStatus, string> = {
  en_preparation: "En preparation",
  soumis: "Soumis",
  en_traitement: "En traitement EDSC",
  approuve: "Approuvee",
  refuse: "Refusee",
};

const LMIA_STATUS_COLORS: Record<LmiaStatus, string> = {
  en_preparation: "bg-amber-100 text-amber-700",
  soumis: "bg-indigo-100 text-indigo-700",
  en_traitement: "bg-yellow-100 text-yellow-700",
  approuve: "bg-green-100 text-green-700",
  refuse: "bg-red-100 text-red-700",
};

const PIPELINE_STEPS: LmiaStatus[] = ["en_preparation", "soumis", "en_traitement", "approuve"];

const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  en_attente: "En attente",
  verifie: "Verifie",
  rejete: "Rejete",
};

const DOC_STATUS_COLORS: Record<DocStatus, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  verifie: "bg-green-100 text-green-700",
  rejete: "bg-red-100 text-red-700",
};

const DOC_UPLOAD_CATEGORIES: Record<DocUploadCategory, string> = {
  offre_emploi: "Offre d\u2019emploi",
  preuve_recrutement: "Preuve de recrutement",
  plan_transition: "Plan de transition",
  bilan_financier: "Bilan financier",
  enregistrement_entreprise: "Enregistrement entreprise",
  licence_permis: "Licence / permis",
  contrat_travail: "Contrat de travail",
  autre: "Autre",
};

const CHECKLIST_STATUS_CONFIG: Record<ChecklistItemStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  not_uploaded: { label: "Non telecharge", color: "bg-gray-100 text-gray-500", icon: Clock },
  uploaded: { label: "Telecharge", color: "bg-blue-100 text-blue-700", icon: FileUp },
  verified: { label: "Verifie", color: "bg-green-100 text-green-700", icon: ShieldCheck },
  missing: { label: "Manquant", color: "bg-red-100 text-red-700", icon: AlertTriangle },
};

const WORKER_STATUS_LABELS: Record<string, string> = {
  en_recrutement: "En recrutement",
  pt_obtenu: "Permis obtenu",
  en_poste: "En poste",
  termine: "Termine",
};

const WORKER_STATUS_COLORS: Record<string, string> = {
  en_recrutement: "bg-blue-100 text-blue-700",
  pt_obtenu: "bg-amber-100 text-amber-700",
  en_poste: "bg-green-100 text-green-700",
  termine: "bg-gray-100 text-gray-700",
};

// ─── COMPANY FIELD DEFINITIONS ───
interface CompanyField {
  key: keyof CompanyInfo;
  label: string;
  icon: typeof Building2;
  editable: boolean;
  type?: "text" | "email" | "tel" | "url";
}

const COMPANY_FIELDS: CompanyField[] = [
  { key: "legalName", label: "Raison sociale", icon: Building2, editable: false },
  { key: "name", label: "Nom commercial", icon: Building2, editable: true },
  { key: "address", label: "Adresse", icon: MapPin, editable: true },
  { key: "phone", label: "Telephone", icon: Phone, editable: true, type: "tel" },
  { key: "email", label: "Courriel", icon: Mail, editable: true, type: "email" },
  { key: "website", label: "Site web", icon: Globe, editable: true, type: "url" },
  { key: "neq", label: "NEQ", icon: Hash, editable: false },
  { key: "bnFederal", label: "NE federal (ARC)", icon: Hash, editable: false },
];

const CONTACT_FIELDS: CompanyField[] = [
  { key: "contactName", label: "Nom", icon: User, editable: true },
  { key: "contactTitle", label: "Titre", icon: Building2, editable: true },
  { key: "contactPhone", label: "Telephone", icon: Phone, editable: true, type: "tel" },
  { key: "contactEmail", label: "Courriel", icon: Mail, editable: true, type: "email" },
];

// ─── MAIN COMPONENT ───
export default function EmployeurDashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = usePortalEmployerAuth();
  const [activeTab, setActiveTab] = useState<Tab>("entreprise");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Company edit state
  const [company, setCompany] = useState<CompanyInfo>(INITIAL_COMPANY);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<CompanyInfo>(INITIAL_COMPANY);
  const [saving, setSaving] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState<EmployerDocument[]>(MOCK_DOCUMENTS);
  const [uploadCategory, setUploadCategory] = useState<DocUploadCategory>("offre_emploi");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docFilter, setDocFilter] = useState<DocUploadCategory | "all">("all");
  const fileRef = useRef<HTMLInputElement>(null);

  // EIMT checklist state
  const [checklist, setChecklist] = useState<EimtChecklistItem[]>(INITIAL_CHECKLIST);
  const checklistFileRef = useRef<HTMLInputElement>(null);
  const [checklistUploadTarget, setChecklistUploadTarget] = useState<string | null>(null);

  // LMIA state
  const [expandedLmia, setExpandedLmia] = useState<string | null>(null);

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth redirect
  useEffect(() => {
    if (!loading && !user) {
      router.push("/employeur");
    }
  }, [loading, user, router]);

  // Scroll messages
  const scrollMessages = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (activeTab === "messages") scrollMessages();
  }, [activeTab, messages.length, scrollMessages]);

  const unreadCount = messages.filter((m) => !m.read && m.from === "coordinator").length;

  // ─── COMPANY EDIT HANDLERS ───
  const handleEditStart = () => {
    setEditDraft({ ...company });
    setEditMode(true);
  };

  const handleEditCancel = () => {
    setEditDraft({ ...company });
    setEditMode(false);
  };

  const handleEditSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setCompany({ ...editDraft });
    setEditMode(false);
    setSaving(false);
  };

  const updateDraftField = (key: keyof CompanyInfo, value: string) => {
    setEditDraft((prev) => ({ ...prev, [key]: value }));
  };

  // ─── FILE UPLOAD HANDLER ───
  const handleUpload = async (files: FileList | File[]) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type) && !ALLOWED_MIME_TYPES.includes(file.type)) {
        alert(`Type de fichier non autorise: ${file.name}\nFormats acceptes: PDF, JPG, PNG`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`Fichier trop volumineux (max 10 Mo): ${file.name}`);
        continue;
      }
      const newDoc: EmployerDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        category: uploadCategory,
        uploadedAt: new Date().toISOString().split("T")[0],
        status: "en_attente",
        size: file.size,
      };
      setDocuments((prev) => [...prev, newDoc]);
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // ─── CHECKLIST UPLOAD HANDLER ───
  const handleChecklistUpload = async (files: FileList | File[]) => {
    if (!checklistUploadTarget) return;
    const file = Array.from(files)[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type) && !ALLOWED_MIME_TYPES.includes(file.type)) {
      alert(`Type de fichier non autorise: ${file.name}\nFormats acceptes: PDF, JPG, PNG`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert(`Fichier trop volumineux (max 10 Mo): ${file.name}`);
      return;
    }

    const newDocId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newDoc: EmployerDocument = {
      id: newDocId,
      name: file.name,
      category: "autre",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "en_attente",
      size: file.size,
    };
    setDocuments((prev) => [...prev, newDoc]);

    setChecklist((prev) =>
      prev.map((item) =>
        item.id === checklistUploadTarget
          ? { ...item, status: "uploaded", linkedDocId: newDocId }
          : item
      )
    );
    setChecklistUploadTarget(null);
  };

  // ─── MESSAGE HANDLER ───
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      from: "employer",
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  // Filtered documents
  const filteredDocs = docFilter === "all" ? documents : documents.filter((d) => d.category === docFilter);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#D4A03C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Building2; badge?: number }[] = [
    { id: "entreprise", label: "Mon entreprise", icon: Building2 },
    { id: "lmia", label: "Demandes EIMT", icon: FileText },
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "travailleurs", label: "Travailleurs", icon: Users },
    { id: "messages", label: "Messages", icon: MessageCircle, badge: unreadCount },
  ];

  // ─── RENDER HELPERS ───
  const renderCompanyFieldRow = (field: CompanyField, section: "company" | "contact") => {
    const value = editMode ? editDraft[field.key] : company[field.key];
    const displayValue =
      field.key === "naicsCode"
        ? `${company.naicsCode} - ${company.naicsDescription}`
        : company[field.key];

    return (
      <div key={field.key} className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
          <field.icon size={14} className="text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-0.5">{field.label}</div>
          {editMode && field.editable ? (
            <input
              type={field.type || "text"}
              value={value}
              onChange={(e) => updateDraftField(field.key, e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C] outline-none"
            />
          ) : (
            <div className="text-sm font-medium text-gray-900">
              {field.key === "naicsCode" ? displayValue : company[field.key]}
              {editMode && !field.editable && (
                <span className="ml-2 text-[10px] text-gray-400 italic">Non modifiable</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── SIDEBAR (Desktop) ─── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1B2559] text-white shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4A03C] flex items-center justify-center">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <div>
              <div className="text-sm font-bold">SOS Hub Canada</div>
              <div className="text-[10px] text-white/50">Portail Employeur</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={18} />
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#D4A03C]/20 flex items-center justify-center">
              <User size={16} className="text-[#D4A03C]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{user.companyName}</div>
              <div className="text-[10px] text-white/50 truncate">{user.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} />
            Deconnexion
          </button>
        </div>
      </aside>

      {/* ─── MOBILE SIDEBAR OVERLAY ─── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#1B2559] text-white flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4A03C] flex items-center justify-center">
                  <span className="text-lg font-bold text-white">S</span>
                </div>
                <div className="text-sm font-bold">SOS Hub Canada</div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                <LogOut size={16} />
                Deconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold" style={{ color: "#1B2559" }}>
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-gray-500">{company.name}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={14} />
            {new Date().toLocaleDateString("fr-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">

          {/* ════════════ TAB: MON ENTREPRISE ════════════ */}
          {activeTab === "entreprise" && (
            <div className="space-y-6 max-w-4xl">
              {/* Company Info */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 size={18} style={{ color: "#1B2559" }} />
                    Informations de l&apos;entreprise
                  </h2>
                  <div className="flex items-center gap-2">
                    {editMode ? (
                      <>
                        <button
                          onClick={handleEditCancel}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          <XCircle size={14} />
                          Annuler
                        </button>
                        <button
                          onClick={handleEditSave}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-60"
                          style={{ backgroundColor: "#D4A03C" }}
                        >
                          {saving ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save size={14} />
                          )}
                          {saving ? "Sauvegarde..." : "Sauvegarder"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEditStart}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#D4A03C] hover:bg-[#D4A03C]/10 transition-colors"
                      >
                        <Edit3 size={14} />
                        Modifier
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COMPANY_FIELDS.map((field) => renderCompanyFieldRow(field, "company"))}
                </div>
                {editMode && (
                  <div className="px-6 pb-4">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <AlertCircle size={10} />
                      Les champs marques &laquo; Non modifiable &raquo; necessitent une demande aupres de votre coordinateur.
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Person */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User size={18} style={{ color: "#1B2559" }} />
                    Personne-ressource
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CONTACT_FIELDS.map((field) => renderCompanyFieldRow(field, "contact"))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ TAB: DEMANDES EIMT ════════════ */}
          {activeTab === "lmia" && (
            <div className="space-y-6 max-w-4xl">
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total", value: MOCK_LMIA.length, color: "bg-blue-100 text-blue-700" },
                  { label: "Approuvees", value: MOCK_LMIA.filter((l) => l.status === "approuve").length, color: "bg-green-100 text-green-700" },
                  { label: "En traitement", value: MOCK_LMIA.filter((l) => l.status === "en_traitement" || l.status === "soumis").length, color: "bg-amber-100 text-amber-700" },
                  { label: "En preparation", value: MOCK_LMIA.filter((l) => l.status === "en_preparation").length, color: "bg-gray-100 text-gray-700" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${stat.color}`}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* LMIA List */}
              <div className="space-y-4">
                {MOCK_LMIA.map((lmia) => {
                  const isExpanded = expandedLmia === lmia.id;
                  const currentStepIdx = PIPELINE_STEPS.indexOf(lmia.status === "refuse" ? "en_traitement" : lmia.status);

                  return (
                    <div key={lmia.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {/* Header */}
                      <button
                        onClick={() => setExpandedLmia(isExpanded ? null : lmia.id)}
                        className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{lmia.position}</span>
                            <span className="text-xs text-gray-400">CNP {lmia.nocCode}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LMIA_STATUS_COLORS[lmia.status]}`}>
                              {LMIA_STATUS_LABELS[lmia.status]}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                            <span>{lmia.workersRequested} travailleur{lmia.workersRequested > 1 ? "s" : ""}</span>
                            <span>{lmia.salaryOffered.toFixed(2)} $/h</span>
                            {lmia.lmiaNumber && <span className="font-medium text-green-700">EIMT: {lmia.lmiaNumber}</span>}
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                          {/* Pipeline visual */}
                          <div className="flex items-center gap-1">
                            {PIPELINE_STEPS.map((step, idx) => {
                              const isCompleted = idx <= currentStepIdx;
                              const isCurrent = idx === currentStepIdx;
                              return (
                                <div key={step} className="flex-1 flex flex-col items-center">
                                  <div
                                    className={`w-full h-2 rounded-full ${
                                      isCompleted
                                        ? lmia.status === "refuse" && idx === currentStepIdx
                                          ? "bg-red-400"
                                          : "bg-[#D4A03C]"
                                        : "bg-gray-200"
                                    }`}
                                  />
                                  <span className={`text-[10px] mt-1 ${isCurrent ? "font-semibold text-gray-900" : "text-gray-400"}`}>
                                    {LMIA_STATUS_LABELS[step]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Timeline */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2">Historique</h4>
                            <div className="space-y-2">
                              {lmia.timeline.map((event, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                  <div className="w-2 h-2 rounded-full bg-[#D4A03C] mt-1.5 shrink-0" />
                                  <div>
                                    <div className="text-xs text-gray-500">{event.date}</div>
                                    <div className="text-sm text-gray-900">{event.note}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════ TAB: DOCUMENTS ════════════ */}
          {activeTab === "documents" && (
            <div className="space-y-6 max-w-4xl">

              {/* Upload zone */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Upload size={18} style={{ color: "#D4A03C" }} />
                  Telecharger un document
                </h3>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <label className="text-xs font-medium text-gray-600">Categorie :</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as DocUploadCategory)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-900 focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C] outline-none"
                  >
                    {Object.entries(DOC_UPLOAD_CATEGORIES).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? "border-[#D4A03C] bg-[#D4A03C]/5"
                      : "border-gray-200 hover:border-[#D4A03C]/50 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#D4A03C] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-500">Telechargement en cours...</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-sm text-gray-600 font-medium">
                        Glissez vos fichiers ici ou cliquez pour parcourir
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF, JPG, PNG &mdash; Max 10 Mo par fichier
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* EIMT Checklist */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <ListChecks size={18} style={{ color: "#1B2559" }} />
                  Liste de verification EIMT
                </h3>
                <p className="text-xs text-gray-400 mb-4">Documents requis pour une demande d&apos;Etude d&apos;impact sur le marche du travail</p>

                {/* Hidden file input for checklist uploads */}
                <input
                  ref={checklistFileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files && handleChecklistUpload(e.target.files)}
                  className="hidden"
                />

                {/* Progress bar */}
                {(() => {
                  const total = checklist.length;
                  const done = checklist.filter((c) => c.status === "verified" || c.status === "uploaded").length;
                  const pct = Math.round((done / total) * 100);
                  return (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">{done}/{total} documents fournis</span>
                        <span className="text-xs font-semibold" style={{ color: "#D4A03C" }}>{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: "#D4A03C" }} />
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-1">
                  {checklist.map((item) => {
                    const cfg = CHECKLIST_STATUS_CONFIG[item.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <div key={item.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          item.status === "verified" ? "bg-green-100" :
                          item.status === "uploaded" ? "bg-blue-100" :
                          item.status === "missing" ? "bg-red-100" : "bg-gray-100"
                        }`}>
                          <StatusIcon size={14} className={
                            item.status === "verified" ? "text-green-600" :
                            item.status === "uploaded" ? "text-blue-600" :
                            item.status === "missing" ? "text-red-500" : "text-gray-400"
                          } />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${item.status === "verified" || item.status === "uploaded" ? "text-gray-900" : "text-gray-600"}`}>
                            {item.label}
                          </span>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.required ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"}`}>
                          {item.required ? "Requis" : "Optionnel"}
                        </span>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {(item.status === "not_uploaded" || item.status === "missing") && (
                          <button
                            onClick={() => {
                              setChecklistUploadTarget(item.id);
                              checklistFileRef.current?.click();
                            }}
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-white transition-colors hover:opacity-90"
                            style={{ backgroundColor: "#1B2559" }}
                          >
                            <Upload size={12} />
                            Telecharger
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FolderOpen size={18} style={{ color: "#1B2559" }} />
                    Documents telecharges ({filteredDocs.length})
                  </h3>
                  <select
                    value={docFilter}
                    onChange={(e) => setDocFilter(e.target.value as DocUploadCategory | "all")}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-900 focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C] outline-none"
                  >
                    <option value="all">Toutes les categories</option>
                    {Object.entries(DOC_UPLOAD_CATEGORIES).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                {filteredDocs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FolderOpen size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Aucun document dans cette categorie</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 group">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                          <div className="text-xs text-gray-400 flex flex-wrap gap-2">
                            <span>{DOC_UPLOAD_CATEGORIES[doc.category]}</span>
                            <span>&middot;</span>
                            <span>{formatFileSize(doc.size)}</span>
                            <span>&middot;</span>
                            <span>{doc.uploadedAt}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${DOC_STATUS_COLORS[doc.status]}`}>
                          {DOC_STATUS_LABELS[doc.status]}
                        </span>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════ TAB: TRAVAILLEURS ════════════ */}
          {activeTab === "travailleurs" && (
            <div className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total", value: MOCK_WORKERS.length, color: "bg-blue-100 text-blue-700" },
                  { label: "En poste", value: MOCK_WORKERS.filter((w) => w.status === "en_poste").length, color: "bg-green-100 text-green-700" },
                  { label: "Permis obtenu", value: MOCK_WORKERS.filter((w) => w.status === "pt_obtenu").length, color: "bg-amber-100 text-amber-700" },
                  { label: "En recrutement", value: MOCK_WORKERS.filter((w) => w.status === "en_recrutement").length, color: "bg-blue-100 text-blue-600" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${stat.color}`}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users size={18} style={{ color: "#1B2559" }} />
                    Travailleurs assignes
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {MOCK_WORKERS.map((worker) => (
                    <div key={worker.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#1B2559]/10 flex items-center justify-center shrink-0">
                        <User size={18} style={{ color: "#1B2559" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                        <div className="text-xs text-gray-500">
                          {worker.nationality} - {worker.position}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${WORKER_STATUS_COLORS[worker.status]}`}>
                        {WORKER_STATUS_LABELS[worker.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ TAB: MESSAGES ════════════ */}
          {activeTab === "messages" && (
            <div className="max-w-3xl mx-auto flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
              {/* Messages area */}
              <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1B2559] flex items-center justify-center">
                    <MessageCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Messages avec votre coordinateur</div>
                    <div className="text-xs text-gray-500">SOS Hub Canada</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isMe = msg.from === "employer";
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            isMe
                              ? "bg-[#1B2559] text-white rounded-br-md"
                              : "bg-gray-100 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <div className={`text-[10px] mt-1.5 ${isMe ? "text-white/50" : "text-gray-400"}`}>
                            {new Date(msg.timestamp).toLocaleString("fr-CA", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {!msg.read && !isMe && (
                              <span className="ml-2 text-red-400 font-medium">Nouveau</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="Ecrivez votre message..."
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-900 focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C] outline-none placeholder:text-gray-400"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-colors disabled:opacity-40"
                      style={{ backgroundColor: "#1B2559" }}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
