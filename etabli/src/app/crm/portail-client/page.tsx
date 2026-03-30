"use client";
import { useState, useRef, useCallback } from "react";
import { crmFetch } from '@/lib/crm-fetch';
import { useCrm, getUserName } from "@/lib/crm-store";
import {
  CASE_STATUS_LABELS, CASE_STATUS_COLORS, FORM_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS, APPOINTMENT_TYPE_COLORS,
  DOCUMENT_CATEGORY_LABELS, DOCUMENT_STATUS_LABELS, DOCUMENT_STATUS_COLORS,
  ALLOWED_MIME_TYPES, MAX_FILE_SIZE,
} from "@/lib/crm-types";
import type { ClientDocument, DocumentCategory, DocumentStatus } from "@/lib/crm-types";
import { IMMIGRATION_PROGRAMS } from "@/lib/crm-programs";
import { IRCC_FORMS } from "@/lib/ircc-forms";
import { getChecklistForProgram, getFormsForTarget, GOVERNMENT_FORM_LIBRARY } from "@/lib/document-checklists";
import type { GovernmentForm } from "@/lib/document-checklists";
import { uploadClientDocument } from "@/lib/document-service";
import {
  UserCircle, FolderOpen, FileText, Calendar, Clock, CheckCircle2,
  AlertTriangle, ChevronRight, Shield, Eye, ArrowLeft, Phone, Mail,
  MapPin, Globe, MessageSquare, Upload, Download, Trash2, X,
  Search, ExternalLink, ShieldCheck, FileWarning, Send, Loader2,
} from "lucide-react";

const STATUS_STEP_ORDER = [
  "nouveau", "consultation", "en_preparation", "formulaires_remplis",
  "revision", "soumis", "en_traitement_ircc", "approuve",
] as const;

const STATUS_STEP_ICONS: Record<string, typeof CheckCircle2> = {
  nouveau: FolderOpen,
  consultation: MessageSquare,
  en_preparation: FileText,
  formulaires_remplis: FileText,
  revision: Eye,
  soumis: Globe,
  en_traitement_ircc: Clock,
  approuve: CheckCircle2,
};

export default function PortailClientPage() {
  const { currentUser, clients, cases, appointments } = useCrm();
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [activeTab, setActiveTab] = useState<"apercu" | "dossiers" | "documents" | "formulaires" | "rdv">("apercu");
  const [clientDocs, setClientDocs] = useState<ClientDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>("identite");
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [formSearch, setFormSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Permission check — only authenticated CRM users can access the portail
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center">
        <Shield size={48} className="text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-[#1B2559] mb-2">Acces restreint</h2>
        <p className="text-sm text-gray-500">Vous devez etre connecte pour acceder au portail client.</p>
      </div>
    );
  }

  // Role-based permission: block roles that should not see client data
  const ALLOWED_ROLES = ['coordinatrice', 'avocat_consultant', 'technicien', 'agent', 'superadmin'];
  if (!ALLOWED_ROLES.includes(currentUser.role)) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center">
        <Shield size={48} className="text-red-300 mb-4" />
        <h2 className="text-lg font-bold text-[#1B2559] mb-2">Permission insuffisante</h2>
        <p className="text-sm text-gray-500">Votre role ne permet pas d&apos;acceder au portail client.</p>
      </div>
    );
  }

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientCases = selectedClient ? cases.filter(c => c.clientId === selectedClient.id) : [];
  const clientAppts = selectedClient ? appointments.filter(a => a.clientId === selectedClient.id) : [];
  const selectedCase = cases.find(c => c.id === selectedCaseId);

  const getStatusStepIndex = (status: string) => {
    const idx = STATUS_STEP_ORDER.indexOf(status as typeof STATUS_STEP_ORDER[number]);
    return idx >= 0 ? idx : -1;
  };

  // Initialize client docs when selecting a client
  const initDocs = useCallback((client: typeof selectedClient) => {
    if (client) setClientDocs(client.documents || []);
  }, []);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!selectedClient) return;
    setUploading(true);
    setUploadError(null);
    let successCount = 0;
    for (const file of Array.from(files)) {
      // Validate file name for suspicious characters
      if (/[<>"{}|\\^`]/.test(file.name)) {
        setUploadError(`Nom de fichier invalide: ${file.name}`);
        continue;
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setUploadError(`Type non autorise: ${file.name}. PDF, JPG, PNG ou WebP seulement.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`Fichier trop volumineux: ${file.name} (max 10 MB)`);
        continue;
      }
      if (file.size === 0) {
        setUploadError(`Fichier vide: ${file.name}`);
        continue;
      }
      try {
        const doc = await uploadClientDocument(selectedClient.id, file, {
          category: uploadCategory,
          expiryDate: uploadExpiry || undefined,
          uploadedBy: currentUser?.id,
        });
        if (doc) {
          setClientDocs(prev => [...prev, doc]);
          successCount++;
        } else {
          setUploadError(`Erreur lors du televersement de ${file.name}.`);
        }
      } catch {
        setUploadError(`Erreur reseau lors du televersement de ${file.name}. Veuillez reessayer.`);
      }
    }
    setUploading(false);
    setUploadExpiry("");
    if (successCount > 0 && !uploadError) {
      // Clear any previous error on full success
      setUploadError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files);
  };

  const removeDoc = (docId: string) => {
    setClientDocs(prev => prev.filter(d => d.id !== docId));
  };

  const isExpiringSoon = (date?: string) => {
    if (!date) return false;
    const diff = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 90 && diff > 0;
  };
  const isExpired = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  // Selection screen
  if (!selectedClientId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B2559] to-[#D4A03C] flex items-center justify-center mx-auto mb-4">
            <UserCircle size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2559]">Portail Client</h1>
          <p className="text-gray-500 text-sm mt-2">Sélectionnez un client pour accéder à son portail de suivi</p>
        </div>

        <div className="grid gap-3">
          {clients.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <UserCircle size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucun client</p>
              <p className="text-gray-400 text-sm mt-1">Il n&apos;y a aucun client dans le systeme pour le moment.</p>
            </div>
          )}
          {clients.map(client => {
            const caseCount = cases.filter(c => c.clientId === client.id).length;
            const activeCases = cases.filter(c => c.clientId === client.id && !["ferme", "approuve", "refuse"].includes(c.status)).length;
            return (
              <button
                key={client.id}
                onClick={() => { setSelectedClientId(client.id); setActiveTab("apercu"); const c = clients.find(cl => cl.id === client.id); if (c) setClientDocs(c.documents || []); }}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#D4A03C] hover:bg-[#F7F3E8] transition-all text-left group bg-white"
              >
                <div className="w-12 h-12 rounded-full bg-[#EAEDF5] text-[#1B2559] flex items-center justify-center font-bold text-lg">
                  {client.firstName[0]}{client.lastName[0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{client.firstName} {client.lastName}</div>
                  <div className="text-sm text-gray-500">{client.nationality} — {client.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[#1B2559]">{caseCount} dossier(s)</div>
                  {activeCases > 0 && (
                    <div className="text-xs text-[#D4A03C]">{activeCases} en cours</div>
                  )}
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-[#D4A03C]" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!selectedClient) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={48} className="text-amber-300 mb-4" />
        <h2 className="text-lg font-bold text-[#1B2559] mb-2">Client introuvable</h2>
        <p className="text-sm text-gray-500 mb-4">Le client selectionne n&apos;existe plus ou a ete supprime.</p>
        <button onClick={() => setSelectedClientId("")} className="px-4 py-2 bg-[#1B2559] text-white text-sm rounded-lg hover:bg-[#2a3a7c] transition">
          Retour a la liste
        </button>
      </div>
    );
  }

  // Case detail view
  if (selectedCase) {
    const prog = IMMIGRATION_PROGRAMS.find(p => p.id === selectedCase.programId);
    const currentStepIdx = getStatusStepIndex(selectedCase.status);
    const isOverdue = selectedCase.deadline && new Date(selectedCase.deadline) < new Date();
    const formsDone = selectedCase.forms.filter(f => ["rempli", "revise", "approuve", "signe"].includes(f.status)).length;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => setSelectedCaseId("")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2559] transition"
        >
          <ArrowLeft size={16} /> Retour aux dossiers
        </button>

        {/* Case header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#1B2559]">{selectedCase.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{prog?.name || "Programme inconnu"}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${CASE_STATUS_COLORS[selectedCase.status]}`}>
                {CASE_STATUS_LABELS[selectedCase.status]}
              </span>
              {isOverdue && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-xs">
                  <AlertTriangle size={12} /> Échéance dépassée
                </div>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400 text-xs">Conseiller</span>
              <p className="font-medium">{getUserName(selectedCase.assignedTo)}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Avocat</span>
              <p className="font-medium">{selectedCase.assignedLawyer ? getUserName(selectedCase.assignedLawyer) : "—"}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Échéance</span>
              <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>{selectedCase.deadline || "Non définie"}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">N° UCI / IRCC</span>
              <p className="font-medium">{selectedCase.uciNumber || "—"} / {selectedCase.irccAppNumber || "—"}</p>
            </div>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-[#1B2559] mb-4">Progression du dossier</h3>
          <div className="relative">
            <div className="flex items-center justify-between">
              {STATUS_STEP_ORDER.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isFinal = selectedCase.status === "approuve" && idx === STATUS_STEP_ORDER.length - 1;
                const StepIcon = STATUS_STEP_ICONS[step] || FolderOpen;

                return (
                  <div key={step} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted || isFinal
                          ? "bg-[#1B2559] border-[#1B2559] text-white"
                          : isCurrent
                            ? "bg-[#D4A03C] border-[#D4A03C] text-white scale-110 shadow-lg"
                            : "bg-gray-100 border-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={18} /> : <StepIcon size={16} />}
                    </div>
                    <span className={`text-[10px] mt-2 text-center leading-tight max-w-[70px] ${
                      isCurrent ? "font-bold text-[#D4A03C]" : isCompleted ? "text-[#1B2559] font-medium" : "text-gray-400"
                    }`}>
                      {CASE_STATUS_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Progress line */}
            <div className="absolute top-5 left-[6%] right-[6%] h-0.5 bg-gray-200">
              <div
                className="h-full bg-[#1B2559] transition-all duration-500"
                style={{ width: `${Math.max(0, (currentStepIdx / (STATUS_STEP_ORDER.length - 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Forms status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1B2559]">Formulaires ({formsDone}/{selectedCase.forms.length} complétés)</h3>
            <div className="text-sm text-gray-500">
              {selectedCase.forms.length > 0 ? `${Math.round((formsDone / selectedCase.forms.length) * 100)}%` : "—"}
            </div>
          </div>
          {selectedCase.forms.length > 0 && (
            <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-[#D4A03C] rounded-full transition-all"
                style={{ width: `${selectedCase.forms.length > 0 ? (formsDone / selectedCase.forms.length) * 100 : 0}%` }}
              />
            </div>
          )}
          <div className="space-y-2">
            {selectedCase.forms.map(f => {
              const formDef = IRCC_FORMS.find(fd => fd.id === f.formId);
              const isDone = ["rempli", "revise", "approuve", "signe"].includes(f.status);
              return (
                <div key={f.id} className={`flex items-center justify-between p-3 rounded-lg ${isDone ? "bg-green-50" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <FileText size={16} className="text-gray-400" />
                    )}
                    <div>
                      <span className="text-sm font-medium">{formDef?.code || f.formId}</span>
                      <span className="text-xs text-gray-500 ml-2">{formDef?.name}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    f.status === "vide" ? "bg-gray-100 text-gray-600" :
                    f.status === "en_cours" ? "bg-amber-100 text-amber-700" :
                    f.status === "rempli" ? "bg-blue-100 text-blue-700" :
                    f.status === "approuve" ? "bg-green-100 text-green-700" :
                    f.status === "signe" ? "bg-emerald-100 text-emerald-800" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {FORM_STATUS_LABELS[f.status] || f.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-[#1B2559] mb-4">Historique du dossier</h3>
          <div className="space-y-4">
            {[...selectedCase.timeline].reverse().map(ev => (
              <div key={ev.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#D4A03C] mt-1" />
                  <div className="w-px flex-1 bg-gray-200 mt-1" />
                </div>
                <div className="pb-2">
                  <div className="text-xs text-gray-400">{ev.date}</div>
                  <p className="text-sm text-gray-700">{ev.description}</p>
                  <p className="text-xs text-gray-400">{getUserName(ev.userId)}</p>
                </div>
              </div>
            ))}
            {selectedCase.timeline.length === 0 && (
              <p className="text-sm text-gray-400">Aucun événement enregistré</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Client portal main view
  const TABS = [
    { id: "apercu" as const, label: "Aperçu", icon: UserCircle },
    { id: "dossiers" as const, label: `Dossiers (${clientCases.length})`, icon: FolderOpen },
    { id: "documents" as const, label: `Documents (${clientDocs.length})`, icon: Upload },
    { id: "formulaires" as const, label: "Formulaires", icon: FileText },
    { id: "rdv" as const, label: "Rendez-vous", icon: Calendar },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => { setSelectedClientId(""); setSelectedCaseId(""); }}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div className="w-14 h-14 rounded-full bg-[#EAEDF5] text-[#1B2559] flex items-center justify-center font-bold text-xl">
          {selectedClient.firstName[0]}{selectedClient.lastName[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B2559]">{selectedClient.firstName} {selectedClient.lastName}</h1>
          <p className="text-sm text-gray-500">{selectedClient.nationality} — {selectedClient.currentStatus}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm text-gray-500"><Mail size={14} /> {selectedClient.email}</span>
          <span className="flex items-center gap-1 text-sm text-gray-500"><Phone size={14} /> {selectedClient.phone}</span>
          <InvitePortalButton email={selectedClient.email} name={`${selectedClient.firstName} ${selectedClient.lastName}`} entityType="client" entityId={selectedClient.id} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-[#1B2559] text-white shadow" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Aperçu tab */}
      {activeTab === "apercu" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Dossiers actifs</div>
              <div className="text-2xl font-bold text-[#1B2559]">
                {clientCases.filter(c => !["ferme", "approuve", "refuse"].includes(c.status)).length}
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Formulaires complétés</div>
              <div className="text-2xl font-bold text-[#D4A03C]">
                {clientCases.reduce((acc, c) => acc + c.forms.filter(f => ["rempli", "revise", "approuve", "signe"].includes(f.status)).length, 0)}
                <span className="text-sm font-normal text-gray-400">
                  /{clientCases.reduce((acc, c) => acc + c.forms.length, 0)}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Prochain RDV</div>
              <div className="text-sm font-bold text-[#1B2559]">
                {(() => {
                  const next = clientAppts
                    .filter(a => a.status !== "annule" && a.status !== "complete" && a.date >= new Date().toISOString().split("T")[0])
                    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
                  return next ? `${next.date} à ${next.time}` : "Aucun";
                })()}
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Documents</div>
              <div className="text-2xl font-bold text-[#1B2559]">
                {clientDocs.filter(d => d.status === 'verifie' || d.status === 'televerse').length}
                <span className="text-sm font-normal text-gray-400">/{clientDocs.length}</span>
              </div>
              {clientDocs.some(d => isExpired(d.expiryDate)) && (
                <div className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Expiré</div>
              )}
            </div>
          </div>

          {/* Active cases summary */}
          {clientCases.filter(c => !["ferme", "approuve", "refuse"].includes(c.status)).length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-[#1B2559] mb-4">Dossiers en cours</h3>
              <div className="space-y-3">
                {clientCases
                  .filter(c => !["ferme", "approuve", "refuse"].includes(c.status))
                  .map(c => {
                    const prog = IMMIGRATION_PROGRAMS.find(p => p.id === c.programId);
                    const formsDone = c.forms.filter(f => ["rempli", "revise", "approuve", "signe"].includes(f.status)).length;
                    const formsPct = c.forms.length > 0 ? Math.round((formsDone / c.forms.length) * 100) : 0;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCaseId(c.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#D4A03C] hover:shadow-sm transition text-left"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{c.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{prog?.name}</div>
                        </div>
                        <div className="w-32">
                          <div className="text-[10px] text-gray-400 mb-1 text-right">{formsPct}% formulaires</div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#D4A03C] rounded-full" style={{ width: `${formsPct}%` }} />
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${CASE_STATUS_COLORS[c.status]}`}>
                          {CASE_STATUS_LABELS[c.status]}
                        </span>
                        <ChevronRight size={16} className="text-gray-300" />
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dossiers tab */}
      {activeTab === "dossiers" && (
        <div className="space-y-3">
          {clientCases.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <FolderOpen size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun dossier pour ce client</p>
            </div>
          ) : (
            clientCases.map(c => {
              const prog = IMMIGRATION_PROGRAMS.find(p => p.id === c.programId);
              const isOverdue = c.deadline && new Date(c.deadline) < new Date() && !["ferme", "approuve", "refuse"].includes(c.status);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className="w-full bg-white rounded-xl border border-gray-200 p-5 hover:border-[#D4A03C] hover:shadow-sm transition text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.title}</h3>
                      <p className="text-sm text-gray-500">{prog?.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${CASE_STATUS_COLORS[c.status]}`}>
                      {CASE_STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Créé le {c.createdAt}</span>
                    {c.deadline && (
                      <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                        {isOverdue && <AlertTriangle size={12} className="inline mr-1" />}
                        Échéance: {c.deadline}
                      </span>
                    )}
                    <span>Formulaires: {c.forms.filter(f => ["rempli", "revise", "approuve", "signe"].includes(f.status)).length}/{c.forms.length}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Documents tab */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Upload zone */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-[#1B2559] mb-4 flex items-center gap-2"><Upload size={18} /> Téléverser un document</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Catégorie</label>
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value as DocumentCategory)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {(Object.entries(DOCUMENT_CATEGORY_LABELS) as [DocumentCategory, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date d&apos;expiration (optionnel)</label>
                <input
                  type="date"
                  value={uploadExpiry}
                  onChange={e => setUploadExpiry(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-[#1B2559] text-white rounded-lg text-sm font-medium hover:bg-[#2a3a7c] transition disabled:opacity-50"
                >
                  {uploading ? "Envoi..." : "Choisir un fichier"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  multiple
                  className="hidden"
                  onChange={e => { if (e.target.files) handleFileUpload(e.target.files); e.target.value = ""; }}
                />
              </div>
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragOver ? "border-[#D4A03C] bg-[#F7F3E8]" : "border-gray-300 hover:border-[#D4A03C]"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} className={`mx-auto mb-2 ${dragOver ? "text-[#D4A03C]" : "text-gray-400"}`} />
              <p className="text-sm text-gray-500">Glissez-déposez vos fichiers ici</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, WebP — max 10 MB</p>
            </div>
            {uploadError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                {uploadError}
                <button onClick={() => setUploadError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
              </div>
            )}
          </div>

          {/* Document checklist based on active case program */}
          {(() => {
            const activeCase = clientCases.find(c => !["ferme", "approuve", "refuse"].includes(c.status));
            if (!activeCase) return null;
            const checklist = getChecklistForProgram(activeCase.programId);
            const prog = IMMIGRATION_PROGRAMS.find(p => p.id === activeCase.programId);
            return (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-[#1B2559] mb-1 flex items-center gap-2">
                  <ShieldCheck size={18} /> Checklist — {prog?.name || activeCase.title}
                </h3>
                <p className="text-xs text-gray-400 mb-4">Documents requis pour ce programme</p>
                <div className="space-y-2">
                  {checklist.map(item => {
                    const match = clientDocs.find(d => d.category === item.category && d.name?.toLowerCase().includes(item.documentType.replace(/_/g, ' ')));
                    const uploaded = !!match;
                    const verified = match?.status === 'verifie';
                    const expired = match ? isExpired(match.expiryDate) : false;
                    return (
                      <div key={item.documentType} className={`flex items-center gap-3 p-3 rounded-lg ${
                        verified ? "bg-green-50" : uploaded ? (expired ? "bg-red-50" : "bg-blue-50") : "bg-gray-50"
                      }`}>
                        {verified ? <CheckCircle2 size={16} className="text-green-600 shrink-0" /> :
                         uploaded ? (expired ? <FileWarning size={16} className="text-red-600 shrink-0" /> : <Upload size={16} className="text-blue-600 shrink-0" />) :
                         <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${item.required ? "border-red-300" : "border-gray-300"}`} />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium flex items-center gap-2">
                            {item.label}
                            {item.required && <span className="text-[10px] text-red-500 font-normal">Requis</span>}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{item.description}</div>
                        </div>
                        {match && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${DOCUMENT_STATUS_COLORS[match.status || 'televerse']}`}>
                            {DOCUMENT_STATUS_LABELS[match.status || 'televerse']}
                          </span>
                        )}
                        {item.expiryTracked && match?.expiryDate && (
                          <span className={`text-xs ${expired ? "text-red-600 font-medium" : isExpiringSoon(match.expiryDate) ? "text-amber-600" : "text-gray-400"}`}>
                            {expired ? "Expiré" : match.expiryDate}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  {checklist.filter(i => clientDocs.some(d => d.category === i.category)).length}/{checklist.length} documents fournis
                </div>
              </div>
            );
          })()}

          {/* Document list */}
          {clientDocs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-[#1B2559] mb-4">Documents téléversés ({clientDocs.length})</h3>
              <div className="space-y-2">
                {clientDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                    <FileText size={18} className="text-[#1B2559] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{doc.name || doc.fileName}</div>
                      <div className="text-xs text-gray-400">
                        {doc.category ? DOCUMENT_CATEGORY_LABELS[doc.category] : doc.type} — {doc.uploadedAt?.split('T')[0]}
                        {doc.fileSize ? ` — ${(doc.fileSize / 1024).toFixed(0)} KB` : ''}
                      </div>
                    </div>
                    {doc.expiryDate && (
                      <span className={`text-xs ${isExpired(doc.expiryDate) ? "text-red-600 font-medium" : isExpiringSoon(doc.expiryDate) ? "text-amber-600" : "text-gray-400"}`}>
                        {isExpired(doc.expiryDate) ? "Expiré" : `Exp: ${doc.expiryDate}`}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${DOCUMENT_STATUS_COLORS[doc.status || 'televerse']}`}>
                      {DOCUMENT_STATUS_LABELS[doc.status || 'televerse']}
                    </span>
                    <button onClick={() => removeDoc(doc.id)} className="p-1 hover:bg-red-100 rounded transition">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Government forms library */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-[#1B2559] mb-1 flex items-center gap-2">
              <FileText size={18} /> Formulaires gouvernementaux
            </h3>
            <p className="text-xs text-gray-400 mb-3">Formulaires officiels IRCC et MIFI à télécharger</p>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un formulaire (ex: IMM 0008, CSQ...)"
                value={formSearch}
                onChange={e => setFormSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            {(['ircc', 'mifi'] as const).map(cat => {
              const forms = getFormsForTarget('client').filter(f => f.category === cat && (
                !formSearch || f.code.toLowerCase().includes(formSearch.toLowerCase()) || f.name.toLowerCase().includes(formSearch.toLowerCase())
              ));
              if (forms.length === 0) return null;
              return (
                <div key={cat} className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {cat === 'ircc' ? 'IRCC — Immigration Canada' : 'MIFI — Québec'}
                  </h4>
                  <div className="space-y-1">
                    {forms.map(form => (
                      <div key={form.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F7F3E8] transition">
                        <span className="text-xs font-mono font-bold text-[#1B2559] bg-[#EAEDF5] px-2 py-1 rounded min-w-[90px] text-center">
                          {form.code}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{form.name}</div>
                          <div className="text-xs text-gray-400 truncate">{form.description}</div>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <ExternalLink size={12} /> PDF
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulaires tab */}
      {activeTab === "formulaires" && (
        <div className="space-y-4">
          {clientCases.map(c => (
            <div key={c.id} className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold text-[#1B2559] mb-3">{c.title}</h3>
              {c.forms.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun formulaire</p>
              ) : (
                <div className="space-y-2">
                  {c.forms.map(f => {
                    const formDef = IRCC_FORMS.find(fd => fd.id === f.formId);
                    const isDone = ["rempli", "revise", "approuve", "signe"].includes(f.status);
                    return (
                      <div key={f.id} className={`flex items-center justify-between p-3 rounded-lg ${isDone ? "bg-green-50" : "bg-gray-50"}`}>
                        <div className="flex items-center gap-2">
                          {isDone ? <CheckCircle2 size={16} className="text-green-600" /> : <Clock size={16} className="text-gray-400" />}
                          <span className="text-sm font-medium">{formDef?.code || f.formId}</span>
                          <span className="text-xs text-gray-500">{formDef?.name}</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          f.status === "vide" ? "bg-gray-100 text-gray-600" :
                          f.status === "en_cours" ? "bg-amber-100 text-amber-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {FORM_STATUS_LABELS[f.status] || f.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {clientCases.length === 0 && (
            <div className="bg-white rounded-xl border p-12 text-center">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun formulaire</p>
            </div>
          )}
        </div>
      )}

      {/* Rendez-vous tab */}
      {activeTab === "rdv" && (
        <div className="space-y-3">
          {clientAppts.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun rendez-vous</p>
            </div>
          ) : (
            [...clientAppts]
              .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
              .map(a => {
                const isPast = a.date < new Date().toISOString().split("T")[0];
                return (
                  <div key={a.id} className={`bg-white rounded-xl border p-4 ${isPast ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[50px]">
                          <div className="text-xs text-gray-500">{a.date}</div>
                          <div className="text-sm font-bold text-[#1B2559]">{a.time}</div>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div>
                          <div className="font-medium text-gray-900">{a.title}</div>
                          <div className="text-xs text-gray-500">{a.duration} min — {getUserName(a.userId)}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${APPOINTMENT_TYPE_COLORS[a.type]}`}>
                        {APPOINTMENT_TYPE_LABELS[a.type]}
                      </span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}

// Bouton d'invitation portail
function InvitePortalButton({ email, name, entityType, entityId }: { email: string; name: string; entityType: string; entityId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [tempPw, setTempPw] = useState('');

  const handleInvite = async () => {
    if (status === 'loading') return;
    // Input validation
    if (!email || !email.includes('@') || email.length < 5) {
      setStatus('error');
      return;
    }
    if (!name || name.trim().length < 2) {
      setStatus('error');
      return;
    }
    if (!entityId || !entityType) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await crmFetch('/api/crm/portal-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          entityType,
          entityId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('sent');
        if (data.tempPassword) setTempPw(data.tempPassword);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
          <CheckCircle2 size={14} /> Accès envoyé
        </span>
        {tempPw && <span className="text-xs text-gray-400">MDP: {tempPw}</span>}
      </div>
    );
  }

  return (
    <button onClick={handleInvite} disabled={status === 'loading'}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A03C] text-white text-xs font-medium rounded-lg hover:bg-[#b8882f] transition-colors disabled:opacity-50">
      {status === 'loading' ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
      {status === 'error' ? 'Réessayer' : 'Envoyer accès portail'}
    </button>
  );
}
