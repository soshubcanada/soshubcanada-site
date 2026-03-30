"use client";
// ========================================================
// SOS Hub Canada - Portail Client - Tableau de bord
// Dashboard self-service pour les clients
// ========================================================
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePortalAuth } from "@/lib/portal-auth";
import type { PortalProfile } from "@/lib/portal-auth";
import {
  LayoutDashboard, FolderOpen, FileText, Calendar, MessageSquare,
  LogOut, ChevronRight, Upload, Clock, CheckCircle2, AlertTriangle,
  X, Send, Paperclip, Eye, Shield, Bell, User, Menu, ChevronDown,
  FileUp, Loader2, Filter, Search,
} from "lucide-react";

// ============================================================
// Types locaux
// ============================================================
type TabId = "apercu" | "dossiers" | "documents" | "rdv" | "messages";

interface NavItem {
  id: TabId;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { id: "apercu", label: "Aperçu", icon: LayoutDashboard },
  { id: "dossiers", label: "Mes Dossiers", icon: FolderOpen },
  { id: "documents", label: "Mes Documents", icon: FileText },
  { id: "rdv", label: "Mes Rendez-vous", icon: Calendar },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

const STATUS_PIPELINE = [
  { key: "nouveau", label: "Nouveau", color: "bg-blue-500" },
  { key: "consultation", label: "Consultation", color: "bg-purple-500" },
  { key: "en_preparation", label: "Préparation", color: "bg-amber-500" },
  { key: "formulaires_remplis", label: "Formulaires", color: "bg-cyan-500" },
  { key: "revision", label: "Révision", color: "bg-orange-500" },
  { key: "soumis", label: "Soumis", color: "bg-indigo-500" },
  { key: "en_traitement_ircc", label: "Traitement IRCC", color: "bg-yellow-500" },
  { key: "approuve", label: "Approuvé", color: "bg-green-500" },
] as const;

const STATUS_LABELS: Record<string, string> = {
  nouveau: "Nouveau", consultation: "Consultation", en_preparation: "En préparation",
  formulaires_remplis: "Formulaires remplis", revision: "Révision", soumis: "Soumis",
  en_traitement_ircc: "En traitement IRCC", approuve: "Approuvé", refuse: "Refusé",
  appel: "Appel", ferme: "Fermé",
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  nouveau: "bg-blue-100 text-blue-700", consultation: "bg-purple-100 text-purple-700",
  en_preparation: "bg-amber-100 text-amber-700", formulaires_remplis: "bg-cyan-100 text-cyan-700",
  revision: "bg-orange-100 text-orange-700", soumis: "bg-indigo-100 text-indigo-700",
  en_traitement_ircc: "bg-yellow-100 text-yellow-700", approuve: "bg-green-100 text-green-700",
  refuse: "bg-red-100 text-red-700", appel: "bg-pink-100 text-pink-700", ferme: "bg-gray-100 text-gray-600",
};

const DOC_CATEGORIES = [
  { value: "identite", label: "Identité" },
  { value: "education", label: "Éducation" },
  { value: "emploi", label: "Emploi" },
  { value: "medical", label: "Médical" },
  { value: "legal", label: "Police / Juridique" },
  { value: "financier", label: "Financier" },
  { value: "autre", label: "Autre" },
] as const;

const DOC_STATUS_LABELS: Record<string, string> = {
  requis: "En attente", televerse: "Téléversé", verifie: "Vérifié", expire: "Expiré", rejete: "Rejeté",
};

const DOC_STATUS_COLORS: Record<string, string> = {
  requis: "bg-gray-100 text-gray-600", televerse: "bg-blue-100 text-blue-700",
  verifie: "bg-green-100 text-green-700", expire: "bg-red-100 text-red-700", rejete: "bg-orange-100 text-orange-700",
};

// ============================================================
// Mock Data (mode démo)
// ============================================================
interface MockCase {
  id: string;
  program: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  notes: string;
}

interface MockDocument {
  id: string;
  name: string;
  category: string;
  status: string;
  uploadedAt: string;
  fileSize: number;
  expiryDate?: string;
}

interface MockAppointment {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  status: string;
  adviser: string;
  notes?: string;
}

interface MockMessage {
  id: string;
  from: string;
  fromName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

const MOCK_CASES: MockCase[] = [
  { id: "case-1", program: "Résidence permanente - PEQ Travailleurs", status: "en_preparation", priority: "normale", createdAt: "2024-01-20", updatedAt: "2026-03-18", deadline: "2026-06-15", notes: "Dossier PEQ en préparation, en attente des résultats TEF." },
  { id: "case-2", program: "Permis de travail - Renouvellement", status: "soumis", priority: "haute", createdAt: "2025-11-10", updatedAt: "2026-03-15", deadline: "2026-04-30", notes: "Renouvellement soumis en ligne. Accusé de réception reçu." },
];

const MOCK_DOCUMENTS: MockDocument[] = [
  { id: "doc-1", name: "Passeport Carlos Rodriguez", category: "identite", status: "verifie", uploadedAt: "2025-11-15", fileSize: 2048000, expiryDate: "2028-03-20" },
  { id: "doc-2", name: "Résultats TEF Canada", category: "education", status: "verifie", uploadedAt: "2025-12-01", fileSize: 512000, expiryDate: "2027-12-01" },
  { id: "doc-3", name: "Certificat de police Colombie", category: "legal", status: "televerse", uploadedAt: "2026-01-10", fileSize: 1024000 },
  { id: "doc-4", name: "Lettre employeur Montréal", category: "emploi", status: "verifie", uploadedAt: "2026-02-05", fileSize: 256000 },
  { id: "doc-5", name: "Photos d'identité", category: "identite", status: "verifie", uploadedAt: "2026-01-20", fileSize: 3072000 },
  { id: "doc-6", name: "Relevé bancaire", category: "financier", status: "requis", uploadedAt: "", fileSize: 0 },
  { id: "doc-7", name: "Examen médical", category: "medical", status: "requis", uploadedAt: "", fileSize: 0 },
];

const MOCK_APPOINTMENTS: MockAppointment[] = [
  { id: "apt-1", title: "Consultation de suivi - PEQ", date: "2026-03-28", time: "10:00", type: "suivi", status: "confirme", adviser: "A. Kabeche" },
  { id: "apt-2", title: "Révision des documents", date: "2026-04-05", time: "14:00", type: "revision", status: "confirme", adviser: "A. Kabeche" },
  { id: "apt-3", title: "Consultation initiale", date: "2025-12-10", time: "09:00", type: "consultation", status: "complete", adviser: "A. Kabeche", notes: "Évaluation du profil PEQ complétée." },
  { id: "apt-4", title: "Soumission en ligne", date: "2026-01-15", time: "11:00", type: "soumission", status: "complete", adviser: "A. Kabeche" },
];

const MOCK_MESSAGES: MockMessage[] = [
  { id: "msg-1", from: "adviser", fromName: "A. Kabeche", text: "Bonjour Carlos, votre dossier PEQ avance bien. N'oubliez pas de nous envoyer votre relevé bancaire dès que possible.", timestamp: "2026-03-20T14:30:00", read: true },
  { id: "msg-2", from: "client", fromName: "Carlos Rodriguez", text: "Merci! Je vais l'envoyer cette semaine. Est-ce que je dois aussi fournir les relevés de mon épouse?", timestamp: "2026-03-20T15:10:00", read: true },
  { id: "msg-3", from: "adviser", fromName: "A. Kabeche", text: "Oui, les relevés des 3 derniers mois pour vous et votre épouse sont nécessaires. Aussi, votre examen médical doit être planifié bientôt.", timestamp: "2026-03-21T09:15:00", read: false },
];

// ============================================================
// Composant principal
// ============================================================
export default function ClientDashboardPage() {
  const router = useRouter();
  const { portalProfile, loading, isDemo, logout } = usePortalAuth();
  const [activeTab, setActiveTab] = useState<TabId>("apercu");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !portalProfile && !isDemo) {
      router.push("/client");
    }
  }, [loading, portalProfile, isDemo, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[#1B2559] mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  // If demo mode, use demo profile
  const profile: PortalProfile | null = portalProfile ?? (isDemo ? {
    access: {
      id: "pa-demo-client-1", auth_id: "demo-auth-client-1", entity_type: "client" as const,
      entity_id: "c1", email: "carlos@email.com", active: true,
      permissions: ["view_cases", "upload_documents", "view_appointments", "send_messages"],
      created_at: "2024-01-15", last_login: "2026-03-20",
    },
    entity: { id: "c1", firstName: "Carlos", lastName: "Rodriguez", email: "carlos@email.com", phone: "+1-514-555-0101", nationality: "Colombie", assignedTo: "u2", assignedToName: "A. Kabeche" },
    displayName: "Carlos Rodriguez",
  } : null);

  if (!profile) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/client");
  };

  const unreadMessages = MOCK_MESSAGES.filter(m => !m.read).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#1B2559] text-white flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4A03C] to-[#C4902C] rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <div className="font-bold text-sm">SOS Hub Canada</div>
              <div className="text-[#D4A03C] text-xs">Espace Client</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
              <User size={18} className="text-white/70" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{profile.displayName}</div>
              <div className="text-xs text-white/50 truncate">{profile.access.email}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.id === "messages" && unreadMessages > 0 && (
                <span className="ml-auto bg-[#D4A03C] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label ?? "Aperçu"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isDemo && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                Mode démo
              </span>
            )}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-500" />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {activeTab === "apercu" && <TabApercu profile={profile} />}
          {activeTab === "dossiers" && <TabDossiers />}
          {activeTab === "documents" && <TabDocuments />}
          {activeTab === "rdv" && <TabRendezvous />}
          {activeTab === "messages" && <TabMessages profile={profile} />}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// Tab: Aperçu (Overview)
// ============================================================
function TabApercu({ profile }: { profile: PortalProfile }) {
  const activeCases = MOCK_CASES.filter(c => !["ferme", "approuve", "refuse"].includes(c.status)).length;
  const verifiedDocs = MOCK_DOCUMENTS.filter(d => d.status === "verifie").length;
  const nextAppt = MOCK_APPOINTMENTS.filter(a => a.status !== "complete").sort((a, b) => a.date.localeCompare(b.date))[0];
  const unread = MOCK_MESSAGES.filter(m => !m.read).length;

  const stats = [
    { icon: FolderOpen, label: "Dossiers actifs", value: activeCases, color: "text-blue-600 bg-blue-50" },
    { icon: FileText, label: "Documents vérifiés", value: verifiedDocs, color: "text-emerald-600 bg-emerald-50" },
    { icon: Calendar, label: "Prochain RDV", value: nextAppt ? formatDateShort(nextAppt.date) : "Aucun", color: "text-purple-600 bg-purple-50", isText: true },
    { icon: MessageSquare, label: "Messages non lus", value: unread, color: "text-amber-600 bg-amber-50" },
  ];

  const recentActivity = [
    { date: "2026-03-21", text: "Nouveau message de votre conseiller", icon: MessageSquare, color: "text-blue-500" },
    { date: "2026-03-18", text: "Dossier PEQ mis à jour", icon: FolderOpen, color: "text-purple-500" },
    { date: "2026-03-15", text: "Permis de travail soumis à IRCC", icon: CheckCircle2, color: "text-green-500" },
    { date: "2026-02-05", text: "Lettre d'employeur téléversée et vérifiée", icon: FileText, color: "text-emerald-500" },
    { date: "2026-01-20", text: "Photos d'établissement téléversées", icon: Upload, color: "text-cyan-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#1B2559] to-[#242E6B] rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">Bienvenue, {profile.displayName.split(" ")[0]}</h2>
        <p className="text-white/60 text-sm mt-1">
          {new Date().toLocaleDateString("fr-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        {profile.entity?.assignedToName && (
          <p className="text-white/50 text-xs mt-3">
            Conseiller(ère) assigné(e) : <span className="text-[#D4A03C] font-medium">{profile.entity.assignedToName}</span>
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <div className={`font-bold text-gray-900 ${s.isText ? "text-sm" : "text-2xl"}`}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-[#D4A03C]" />
          Activité récente
        </h3>
        <div className="space-y-4">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5">
                <a.icon size={16} className={a.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{a.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDateLong(a.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab: Mes Dossiers
// ============================================================
function TabDossiers() {
  const [selectedCase, setSelectedCase] = useState<MockCase | null>(null);

  if (selectedCase) {
    const stepIndex = STATUS_PIPELINE.findIndex(s => s.key === selectedCase.status);

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCase(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2559] transition-colors"
        >
          <ChevronRight size={16} className="rotate-180" />
          Retour aux dossiers
        </button>

        {/* Case header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{selectedCase.program}</h3>
              <p className="text-sm text-gray-500 mt-1">Dossier #{selectedCase.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_COLORS[selectedCase.status] ?? "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[selectedCase.status] ?? selectedCase.status}
            </span>
          </div>

          {selectedCase.deadline && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Clock size={14} />
              <span>Échéance : {formatDateLong(selectedCase.deadline)}</span>
            </div>
          )}

          {selectedCase.notes && (
            <p className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">{selectedCase.notes}</p>
          )}
        </div>

        {/* Progress tracker */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Shield size={16} className="text-[#D4A03C]" />
            Progression du dossier
          </h4>
          <div className="relative">
            {/* Progress bar background */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 rounded-full" />
            <div
              className="absolute top-4 left-4 h-1 bg-gradient-to-r from-[#1B2559] to-[#D4A03C] rounded-full transition-all duration-500"
              style={{ width: stepIndex >= 0 ? `${(stepIndex / (STATUS_PIPELINE.length - 1)) * 100}%` : "0%" }}
            />

            <div className="relative flex justify-between">
              {STATUS_PIPELINE.map((step, i) => {
                const isCompleted = i <= stepIndex;
                const isCurrent = i === stepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center w-0 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                      isCurrent ? "bg-[#D4A03C] text-white ring-4 ring-[#D4A03C]/20" :
                      isCompleted ? "bg-[#1B2559] text-white" :
                      "bg-gray-200 text-gray-400"
                    }`}>
                      {isCompleted && !isCurrent ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <span className={`text-[10px] mt-2 text-center leading-tight ${
                      isCurrent ? "text-[#D4A03C] font-bold" :
                      isCompleted ? "text-[#1B2559] font-medium" :
                      "text-gray-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Vos dossiers d&apos;établissement en cours</p>

      {MOCK_CASES.map((c) => {
        const stepIndex = STATUS_PIPELINE.findIndex(s => s.key === c.status);
        const progress = stepIndex >= 0 ? Math.round(((stepIndex + 1) / STATUS_PIPELINE.length) * 100) : 0;

        return (
          <button
            key={c.id}
            onClick={() => setSelectedCase(c)}
            className="w-full bg-white rounded-xl border border-gray-200 p-5 hover:border-[#1B2559]/30 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm">{c.program}</h4>
                <p className="text-xs text-gray-400 mt-0.5">Ouvert le {formatDateShort(c.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_COLORS[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[c.status] ?? c.status}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progression</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1B2559] to-[#D4A03C] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </button>
        );
      })}

      {MOCK_CASES.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucun dossier actif</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Tab: Mes Documents
// ============================================================
function TabDocuments() {
  const [documents, setDocuments] = useState<MockDocument[]>(MOCK_DOCUMENTS);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("identite");
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  const MAX_SIZE = 10 * 1024 * 1024;

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArr = Array.from(files);
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newDocs: MockDocument[] = fileArr
        .filter(f => {
          if (!ALLOWED_TYPES.includes(f.type)) {
            alert(`Type non autorisé : ${f.name}. PDF, JPG, PNG ou WebP seulement.`);
            return false;
          }
          if (f.size > MAX_SIZE) {
            alert(`Fichier trop volumineux : ${f.name} (max 10 Mo)`);
            return false;
          }
          return true;
        })
        .map((f, i) => ({
          id: `doc-new-${Date.now()}-${i}`,
          name: f.name,
          category: uploadCategory,
          status: "televerse",
          uploadedAt: new Date().toISOString().split("T")[0],
          fileSize: f.size,
          expiryDate: uploadExpiry || undefined,
        }));
      setDocuments(prev => [...newDocs, ...prev]);
      setUploading(false);
      setUploadExpiry("");
    }, 1500);
  }, [uploadCategory, uploadExpiry]);

  const filtered = filterCategory === "all" ? documents : documents.filter(d => d.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileUp size={18} className="text-[#D4A03C]" />
          Téléverser un document
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20 focus:border-[#1B2559]"
            >
              {DOC_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date d&apos;expiration (optionnel)</label>
            <input
              type="date"
              value={uploadExpiry}
              onChange={(e) => setUploadExpiry(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20 focus:border-[#1B2559]"
            />
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver ? "border-[#D4A03C] bg-[#D4A03C]/5" : "border-gray-300 hover:border-[#1B2559]/30 hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            multiple
            onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ""; }}
          />
          {uploading ? (
            <Loader2 size={32} className="animate-spin text-[#1B2559] mx-auto mb-2" />
          ) : (
            <Upload size={32} className="text-gray-400 mx-auto mb-2" />
          )}
          <p className="text-sm text-gray-600 font-medium">
            {uploading ? "Téléversement en cours..." : "Glissez-déposez vos fichiers ici"}
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG ou WebP — max 10 Mo</p>
        </div>
      </div>

      {/* Document list */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={18} className="text-[#D4A03C]" />
            Mes documents ({filtered.length})
          </h3>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20"
            >
              <option value="all">Toutes catégories</option>
              {DOC_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
              <div className="w-10 h-10 bg-[#1B2559]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-[#1B2559]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  {doc.uploadedAt && <span>{formatDateShort(doc.uploadedAt)}</span>}
                  {doc.fileSize > 0 && <span>{formatFileSize(doc.fileSize)}</span>}
                  {doc.expiryDate && <span>Exp: {formatDateShort(doc.expiryDate)}</span>}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${DOC_STATUS_COLORS[doc.status] ?? "bg-gray-100 text-gray-600"}`}>
                {DOC_STATUS_LABELS[doc.status] ?? doc.status}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun document dans cette catégorie</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab: Mes Rendez-vous
// ============================================================
function TabRendezvous() {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = MOCK_APPOINTMENTS.filter(a => a.date >= today && a.status !== "complete").sort((a, b) => a.date.localeCompare(b.date));
  const past = MOCK_APPOINTMENTS.filter(a => a.date < today || a.status === "complete").sort((a, b) => b.date.localeCompare(a.date));

  const typeLabels: Record<string, string> = {
    consultation: "Consultation", suivi: "Suivi", revision: "Révision", soumission: "Soumission", autre: "Autre",
  };
  const typeColors: Record<string, string> = {
    consultation: "bg-blue-100 text-blue-700", suivi: "bg-purple-100 text-purple-700",
    revision: "bg-amber-100 text-amber-700", soumission: "bg-green-100 text-green-700", autre: "bg-gray-100 text-gray-600",
  };
  const statusLabels: Record<string, string> = {
    confirme: "Confirmé", en_attente: "En attente", annule: "Annulé", complete: "Complété",
  };

  return (
    <div className="space-y-6">
      {/* Upcoming */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-[#D4A03C]" />
          Prochains rendez-vous ({upcoming.length})
        </h3>

        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((apt) => (
              <div key={apt.id} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-[#1B2559]/[0.02] to-transparent border border-[#1B2559]/10">
                <div className="flex flex-col items-center bg-[#1B2559] text-white rounded-xl px-3 py-2 min-w-[60px]">
                  <span className="text-lg font-bold leading-none">{new Date(apt.date + "T12:00:00").getDate()}</span>
                  <span className="text-[10px] uppercase mt-0.5">{new Date(apt.date + "T12:00:00").toLocaleDateString("fr-CA", { month: "short" })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm">{apt.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Clock size={12} /> {apt.time}</span>
                    <span className="flex items-center gap-1"><User size={12} /> {apt.adviser}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColors[apt.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {typeLabels[apt.type] ?? apt.type}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                  {statusLabels[apt.status] ?? apt.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun rendez-vous à venir</p>
          </div>
        )}
      </div>

      {/* Past */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-gray-400" />
          Rendez-vous passés ({past.length})
        </h3>

        {past.length > 0 ? (
          <div className="space-y-2">
            {past.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-xs text-gray-400 w-20 flex-shrink-0">{formatDateShort(apt.date)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{apt.title}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColors[apt.type] ?? "bg-gray-100 text-gray-600"}`}>
                  {typeLabels[apt.type] ?? apt.type}
                </span>
                {apt.notes && (
                  <span className="text-xs text-gray-400 hidden lg:block max-w-[200px] truncate">{apt.notes}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-sm text-gray-400">Aucun rendez-vous passé</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Tab: Messages
// ============================================================
function TabMessages({ profile }: { profile: PortalProfile }) {
  const [messages, setMessages] = useState<MockMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark as read on mount
  useEffect(() => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const newMsg: MockMessage = {
      id: `msg-${Date.now()}`,
      from: "client",
      fromName: profile.displayName,
      text,
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}>
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1B2559]/10 rounded-full flex items-center justify-center">
            <User size={18} className="text-[#1B2559]" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">
              {profile.entity?.assignedToName ?? "Votre conseiller"}
            </h4>
            <p className="text-xs text-green-500">En ligne</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isClient = msg.from === "client";
          return (
            <div key={msg.id} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isClient
                  ? "bg-[#1B2559] text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1.5 ${isClient ? "text-white/50" : "text-gray-400"}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Écrivez votre message..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20 focus:border-[#1B2559] transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 bg-[#1B2559] hover:bg-[#242E6B] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Utility helpers
// ============================================================
function formatDateShort(d: string): string {
  if (!d) return "";
  try {
    return new Date(d + "T12:00:00").toLocaleDateString("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return d;
  }
}

function formatDateLong(d: string): string {
  if (!d) return "";
  try {
    return new Date(d + "T12:00:00").toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return d;
  }
}

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
