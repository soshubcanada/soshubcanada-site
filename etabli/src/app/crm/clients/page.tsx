"use client";
import { crmFetch } from '@/lib/crm-fetch';
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useCrm, getUserName, DEMO_USERS } from "@/lib/crm-store";
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS, CLIENT_SOURCE_LABELS, CLIENT_PRIORITY_LABELS, ROLE_PERMISSIONS, DOCUMENT_CATEGORY_LABELS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE, FORM_STATUS_LABELS, APPOINTMENT_TYPE_LABELS, APPOINTMENT_TYPE_COLORS } from "@/lib/crm-types";
import type { DocumentCategory, ClientDocument, ClientSource, ClientPriority, AppointmentType } from "@/lib/crm-types";
import { getChecklistForProgram, getFormsForTarget, type DocumentChecklistItem, type GovernmentForm } from "@/lib/document-checklists";
import { IMMIGRATION_PROGRAMS } from "@/lib/crm-programs";
import { analyzeEligibility, descriptiveToNCLC, descriptiveToCLB, type ClientProfile, type EligibilityAnalysis } from "@/lib/eligibility-engine";
import { calculateCRS, calculateMIFI, getCrsImprovementAdvice, getMifiImprovementAdvice, getDefaultProfile, CRS_RECENT_CUTOFFS, MIFI_THRESHOLD_ESTIMATE, type ScoringProfile, type CrsBreakdown, type MifiBreakdown } from "@/lib/crm-scoring";
import { insertClient, updateClient, fetchClients as fetchClientsFromDB } from "@/lib/crm-data-service";
import { uploadClientDocument, deleteDocument } from "@/lib/document-service";
import type { Client, FamilyMember } from "@/lib/crm-types";
import type { ServiceContract } from "@/lib/crm-pricing-2026";
import { supabase } from "@/lib/supabase";
import {
  Users, Plus, Search, Eye, Edit3, Trash2, X, UserPlus, ChevronDown, Camera, Upload,
  FileText, Calendar, Tag, AlertCircle, ArrowUpDown, Shield, PhoneCall, Hash, Clock,
  CheckSquare, FolderOpen, FileCheck, KeyRound, Send, RefreshCw, Loader2, MessageSquare,
  ChevronLeft, CheckCircle2, Circle, ExternalLink, Activity, BarChart3, Mail,
} from "lucide-react";
import CSVImportModal from "./csv-import-modal";
import NotesSection, { CLIENT_NOTE_CATEGORIES } from "@/components/NotesSection";

// Use `const db = supabase as any` pattern for all Supabase calls
const db = supabase as any;

// Document categories for the upload form
const DOC_UPLOAD_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'identite', label: 'Identite' },
  { value: 'education', label: 'Education' },
  { value: 'emploi', label: 'Emploi' },
  { value: 'medical', label: 'Medical' },
  { value: 'legal', label: 'Police' },
  { value: 'financier', label: 'Financier' },
  { value: 'langue', label: 'Immigration' },
  { value: 'autre', label: 'Autre' },
];

// Map status labels for display in detail panel
const DOC_DISPLAY_STATUS: Record<string, { label: string; color: string }> = {
  televerse: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  verifie: { label: 'Verifie', color: 'bg-green-100 text-green-700' },
  rejete: { label: 'Rejete', color: 'bg-red-100 text-red-700' },
  expire: { label: 'Expire', color: 'bg-orange-100 text-orange-700' },
  requis: { label: 'Requis', color: 'bg-gray-100 text-gray-600' },
};

const PHOTO_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_MAX_SIZE = 5 * 1024 * 1024; // 5MB

const STATUS_COLORS: Record<string, string> = {
  prospect: 'bg-blue-100 text-blue-700 border border-blue-200',
  actif: 'bg-green-100 text-green-700 border border-green-200',
  en_attente: 'bg-amber-100 text-amber-700 border border-amber-200',
  complete: 'bg-purple-100 text-purple-700 border border-purple-200',
  annule: 'bg-red-100 text-red-700 border border-red-200',
  archive: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  haute: 'bg-red-100 text-red-700',
  moyenne: 'bg-yellow-100 text-yellow-700',
  basse: 'bg-green-100 text-green-700',
};

const IMMIGRATION_STATUS: Record<string, string> = {
  visiteur: 'Visiteur', etudiant: 'Etudiant', travailleur: 'Travailleur',
  resident_permanent: 'Resident permanent', citoyen: 'Citoyen',
  demandeur_asile: 'Demandeur d\'asile', personne_protegee: 'Personne protegee',
  sans_statut: 'Sans statut', etranger: 'A l\'etranger',
};

const PROGRAMME_INTERET_OPTIONS = [
  'Entree express',
  'Programme des travailleurs qualifies (federal)',
  'Programme de l\'experience canadienne',
  'Programme des travailleurs de metiers specialises',
  'Programme des candidats des provinces (PCP)',
  'PEQ - Programme de l\'experience quebecoise',
  'PRTQ - Programme regulier des travailleurs qualifies',
  'Parrainage familial',
  'Permis de travail ferme',
  'Permis de travail ouvert',
  'Permis d\'etudes',
  'Visa visiteur',
  'Residence permanente - Refugie',
  'Citoyennete canadienne',
  'Autre',
];

// Case status labels for the Dossiers tab
const CASE_STATUS_LABELS_INLINE: Record<string, string> = {
  nouveau: 'Nouveau',
  consultation: 'Consultation',
  en_preparation: 'En preparation',
  formulaires_remplis: 'Formulaires remplis',
  revision: 'Revision',
  soumis: 'Soumis',
  en_traitement_ircc: 'En traitement IRCC',
  approuve: 'Approuve',
  refuse: 'Refuse',
  complete: 'Complete',
  annule: 'Annule',
};

const CASE_STATUS_COLORS_INLINE: Record<string, string> = {
  nouveau: 'bg-blue-100 text-blue-700',
  consultation: 'bg-cyan-100 text-cyan-700',
  en_preparation: 'bg-yellow-100 text-yellow-700',
  formulaires_remplis: 'bg-indigo-100 text-indigo-700',
  revision: 'bg-orange-100 text-orange-700',
  soumis: 'bg-purple-100 text-purple-700',
  en_traitement_ircc: 'bg-amber-100 text-amber-700',
  approuve: 'bg-green-100 text-green-700',
  refuse: 'bg-red-100 text-red-700',
  complete: 'bg-emerald-100 text-emerald-700',
  annule: 'bg-gray-100 text-gray-500',
};

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  envoye: 'Envoye',
  signe: 'Signe',
  actif: 'Actif',
  complete: 'Complete',
  annule: 'Annule',
};

const CONTRACT_STATUS_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-600',
  envoye: 'bg-blue-100 text-blue-700',
  signe: 'bg-green-100 text-green-700',
  actif: 'bg-emerald-100 text-emerald-700',
  complete: 'bg-purple-100 text-purple-700',
  annule: 'bg-red-100 text-red-600',
};

/** Format ISO date to French display */
function formatDateFr(isoDate: string | undefined): string {
  if (!isoDate) return 'N/A';
  try {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return isoDate;
  }
}

// ==========================================================================
// Supabase Storage helpers for photos
// ==========================================================================
async function uploadPhotoToStorage(clientId: string, file: File): Promise<string | null> {
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${clientId}.${ext}`;
    // Upsert to overwrite existing photo
    const { error } = await db.storage
      .from('client-photos')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      console.error('Photo upload error:', error);
      return null;
    }
    const { data: urlData } = db.storage.from('client-photos').getPublicUrl(path);
    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('Photo upload exception:', err);
    return null;
  }
}

async function getPhotoUrl(clientId: string): Promise<string | null> {
  try {
    // Try common extensions
    for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
      const path = `${clientId}.${ext}`;
      const { data: urlData } = db.storage.from('client-photos').getPublicUrl(path);
      if (urlData?.publicUrl) return urlData.publicUrl;
    }
    return null;
  } catch {
    return null;
  }
}

// ==========================================================================
// Supabase Storage helpers for documents
// ==========================================================================
async function uploadDocToStorage(clientId: string, file: File): Promise<string | null> {
  try {
    const path = `${clientId}/${file.name}`;
    const { error } = await db.storage
      .from('client-documents')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      console.error('Document upload error:', error);
      return null;
    }
    const { data: urlData } = db.storage.from('client-documents').getPublicUrl(path);
    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('Document upload exception:', err);
    return null;
  }
}

async function listDocsFromStorage(clientId: string): Promise<{ name: string; id: string; created_at: string }[]> {
  try {
    const { data, error } = await db.storage
      .from('client-documents')
      .list(clientId);
    if (error || !data) return [];
    return (data as any[]).map((f: any) => ({
      name: f.name,
      id: f.id || f.name,
      created_at: f.created_at || '',
    }));
  } catch {
    return [];
  }
}

async function deleteDocFromStorage(clientId: string, fileName: string): Promise<boolean> {
  try {
    const { error } = await db.storage
      .from('client-documents')
      .remove([`${clientId}/${fileName}`]);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================================================
// Tab types for the detail panel
// ==========================================================================
type DetailTab = 'profil' | 'analyse' | 'notes' | 'documents' | 'dossiers' | 'rdv' | 'contrats' | 'courriels' | 'portail';

// ==========================================================================
// Portal access types
// ==========================================================================
interface PortalAccess {
  id: string;
  entity_type: string;
  entity_id: string;
  email: string;
  status: 'active' | 'invited' | 'revoked';
  last_login?: string;
  created_at: string;
  permissions?: Record<string, boolean>;
}

// ==========================================================================
// Client Email History Component
// ==========================================================================
function ClientEmailHistory({ clientId, clientEmail }: { clientId: string; clientEmail: string }) {
  const [emails, setEmails] = useState<Array<{
    id: string; toEmail: string; subject: string; type: string; sentBy: string; sentAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await crmFetch(`/api/crm/emails?client_id=${clientId}&limit=50`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setEmails(data.emails || []);
        }
      } catch (err) {
        console.error('Erreur chargement courriels client:', err);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [clientId]);

  const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
    scoring_results: { label: 'Auto 23h (gratuit)', color: 'bg-[#D4A03C]/10 text-[#D4A03C] border-[#D4A03C]/20', icon: '⏰' },
    premium_report: { label: 'Auto 23h (premium)', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '👑' },
    general: { label: 'Manuel', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '✉️' },
    contract: { label: 'Contrat', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '📄' },
    appointment: { label: 'RDV', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '📅' },
  };

  return (
    <div>
      <h3 className="font-semibold text-[#1B2559] mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
        <Mail size={14} className="text-[#D4A03C]" /> Historique des courriels
      </h3>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1"><div className="h-3 w-3/4 bg-gray-200 rounded" /><div className="h-2.5 w-1/2 bg-gray-100 rounded" /></div>
            </div>
          ))}
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center py-8">
          <Mail size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500 font-medium">Aucun courriel envoye a ce client</p>
          <p className="text-xs text-gray-400 mt-1">{clientEmail}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Summary */}
          <div className="flex items-center gap-3 mb-3 text-xs">
            <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">{emails.length} courriel{emails.length > 1 ? 's' : ''}</span>
            {emails.some(e => e.type === 'scoring_results') && (
              <span className="px-2 py-1 rounded-full bg-[#D4A03C]/10 text-[#D4A03C] font-bold border border-[#D4A03C]/20">
                ✅ Auto 23h envoye
              </span>
            )}
            {emails.some(e => e.type === 'premium_report') && (
              <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200">
                ✅ Premium envoye
              </span>
            )}
          </div>

          {/* Email list */}
          {emails.map(email => {
            const config = typeConfig[email.type] || { label: email.type, color: 'bg-gray-100 text-gray-600 border-gray-200', icon: '📧' };
            const sentDate = new Date(email.sentAt);
            const isAuto = email.sentBy === 'system_auto' || email.type === 'scoring_results' || email.type === 'premium_report';
            const isOpen = expandedId === email.id;

            return (
              <div key={email.id} className={`rounded-lg border transition-all ${isOpen ? 'border-[#D4A03C]/30 shadow-sm' : 'border-gray-100'}`}>
                <button onClick={() => setExpandedId(isOpen ? null : email.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${isAuto ? 'bg-[#D4A03C]/10' : 'bg-blue-50'}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${config.color}`}>{config.label}</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle2 size={8} className="inline mr-0.5" />Envoye
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600 truncate mt-0.5 font-medium">{email.subject}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-gray-500 font-medium">{sentDate.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div className="text-[10px] text-gray-400">{sentDate.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-3 border-t border-gray-100 pt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <span className="text-gray-400">Destinataire</span>
                        <div className="font-medium text-gray-700">{email.toEmail}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <span className="text-gray-400">Envoye par</span>
                        <div className="font-medium text-gray-700">{isAuto ? 'Systeme automatique (23h)' : 'Manuel'}</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-xs">
                      <span className="text-gray-400">Sujet complet</span>
                      <div className="font-medium text-gray-700 mt-0.5">{email.subject}</div>
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

// ==========================================================================
// Main component
// ==========================================================================
export default function ClientsPage() {
  const { currentUser, clients, setClients, cases, contracts, appointments, refreshData } = useCrm();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [prioriteFilter, setPrioriteFilter] = useState('');
  const [sortBy, setSortBy] = useState<'dateInscription' | 'name'>('dateInscription');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Detail panel tab state
  const [detailTab, setDetailTab] = useState<DetailTab>('profil');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [govFormSearch, setGovFormSearch] = useState('');

  if (!currentUser) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#D4A03C]" />
        <p className="text-sm text-gray-500">Chargement des clients...</p>
      </div>
    </div>
  );
  const perms = ROLE_PERMISSIONS[currentUser.role];

  const filtered = useMemo(() => {
    const result = clients.filter(c => {
      const matchSearch = `${c.firstName} ${c.lastName} ${c.email} ${c.nationality}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || c.status === statusFilter;
      const matchSource = !sourceFilter || c.source === sourceFilter;
      const matchPriorite = !prioriteFilter || c.priorite === prioriteFilter;
      return matchSearch && matchStatus && matchSource && matchPriorite;
    });
    result.sort((a, b) => {
      if (sortBy === 'dateInscription') {
        const da = a.dateInscription || a.createdAt || '';
        const dbVal = b.dateInscription || b.createdAt || '';
        return sortDir === 'desc' ? dbVal.localeCompare(da) : da.localeCompare(dbVal);
      }
      const na = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nb = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortDir === 'desc' ? nb.localeCompare(na) : na.localeCompare(nb);
    });
    return result;
  }, [clients, search, statusFilter, sourceFilter, prioriteFilter, sortBy, sortDir]);

  // Reset to page 1 when filters or sort change
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, sourceFilter, prioriteFilter, sortBy, sortDir]);

  // Pagination calculations
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalFiltered);
  const paginatedClients = filtered.slice(startIndex, endIndex);

  const todayISO = new Date().toISOString().split('T')[0];

  const emptyClient = (): Partial<Client> => ({
    id: `c${Date.now()}`, firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', nationality: '', currentCountry: 'Canada', currentStatus: 'visiteur',
    passportNumber: '', passportExpiry: '', address: '', city: 'Montreal', province: 'QC',
    postalCode: '', status: 'prospect', assignedTo: currentUser.id,
    createdAt: todayISO, updatedAt: todayISO,
    notes: '', languageEnglish: '', languageFrench: '', education: '', workExperience: '',
    maritalStatus: 'Celibataire', dependants: 0, familyMembers: [], documents: [],
    dateInscription: todayISO,
    source: undefined,
    referePar: '',
    priorite: 'moyenne',
    dateDernierContact: todayISO,
    prochaineRelance: '',
    numeroUCI: '',
    numeroDossierIRCC: '',
    dateExpirationStatut: '',
    programmeInteret: '',
    consentementCommunication: false,
    consentementPartage: false,
    dateConsentement: '',
  });

  const [formData, setFormData] = useState<Partial<Client>>(emptyClient());

  const openNew = () => { setFormData(emptyClient()); setFormPhoto(null); setEditMode(false); setShowModal(true); };
  const openEdit = (c: Client) => { setFormData({ ...c }); setFormPhoto(clientPhotos[c.id] || null); setEditMode(true); setShowModal(true); };

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // --- Document upload state ---
  const [clientDocs, setClientDocs] = useState<ClientDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('identite');
  const [uploadExpiry, setUploadExpiry] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const modalPhotoInputRef = useRef<HTMLInputElement>(null);

  // --- Client photo state (Supabase Storage URLs) ---
  const [clientPhotos, setClientPhotos] = useState<Record<string, string>>({});
  const [formPhoto, setFormPhoto] = useState<string | null>(null);

  // --- Portal access state ---
  const [portalAccess, setPortalAccess] = useState<PortalAccess | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalSending, setPortalSending] = useState(false);

  // --- Storage docs list state ---
  const [storageDocs, setStorageDocs] = useState<{ name: string; id: string; created_at: string }[]>([]);

  // Load photo for a client from Supabase Storage (cache in state)
  const loadClientPhoto = useCallback(async (clientId: string) => {
    if (clientPhotos[clientId]) return; // already cached
    const url = await getPhotoUrl(clientId);
    if (url) {
      setClientPhotos(prev => ({ ...prev, [clientId]: url }));
    }
  }, [clientPhotos]);

  // Upload photo to Supabase Storage
  const handlePhotoUpload = async (file: File, targetClientId?: string) => {
    if (!PHOTO_ALLOWED_TYPES.includes(file.type)) {
      showToast('Format non supporte. JPG, PNG ou WebP seulement.', 'error');
      return;
    }
    if (file.size > PHOTO_MAX_SIZE) {
      showToast('Photo trop volumineuse (max 5 Mo)', 'error');
      return;
    }
    if (targetClientId) {
      // Upload directly to Supabase Storage
      const url = await uploadPhotoToStorage(targetClientId, file);
      if (url) {
        setClientPhotos(prev => ({ ...prev, [targetClientId]: url + '?t=' + Date.now() }));
        showToast('Photo mise a jour');
      } else {
        // Fallback: read as base64 in memory (won't persist but won't crash)
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setClientPhotos(prev => ({ ...prev, [targetClientId]: base64 }));
        };
        reader.readAsDataURL(file);
        showToast('Photo mise a jour localement (stockage distant indisponible)', 'error');
      }
    } else {
      // For the form modal - read as base64 temporarily
      const reader = new FileReader();
      reader.onload = () => {
        setFormPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load docs from Supabase Storage when viewing a client
  const loadClientDocs = useCallback(async (clientId: string) => {
    // First try Supabase Storage listing
    const storageFiles = await listDocsFromStorage(clientId);
    setStorageDocs(storageFiles);
    // Also keep any in-memory docs (from the document-service upload)
    setClientDocs([]);
  }, []);

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!viewClient) return;
    setUploading(true);
    const newDocs = [...clientDocs];
    for (const file of Array.from(files)) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        showToast(`Type non autorise: ${file.name}. PDF, JPG, PNG ou WebP seulement.`, 'error');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast(`Fichier trop volumineux: ${file.name} (max 10 MB)`, 'error');
        continue;
      }
      // Upload to Supabase Storage bucket 'client-documents'
      const storageUrl = await uploadDocToStorage(viewClient.id, file);
      if (storageUrl) {
        // Also call the document-service for DB record
        const doc = await uploadClientDocument(viewClient.id, file, {
          category: uploadCategory,
          expiryDate: uploadExpiry || undefined,
          uploadedBy: currentUser?.id,
        });
        if (doc) newDocs.push(doc);
      } else {
        // Fallback: still create doc record via service
        const doc = await uploadClientDocument(viewClient.id, file, {
          category: uploadCategory,
          expiryDate: uploadExpiry || undefined,
          uploadedBy: currentUser?.id,
        });
        if (doc) newDocs.push(doc);
        showToast(`Document enregistre (stockage distant indisponible pour ${file.name})`, 'error');
      }
    }
    setClientDocs(newDocs);
    // Refresh storage docs list
    const storageFiles = await listDocsFromStorage(viewClient.id);
    setStorageDocs(storageFiles);
    setUploading(false);
    setUploadExpiry('');
    if (newDocs.length > clientDocs.length) showToast('Document(s) televerse(s) avec succes');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files);
  };

  const removeDoc = async (docId: string, fileName?: string) => {
    if (!viewClient) return;
    // Try to delete from Supabase Storage if filename given
    if (fileName) {
      await deleteDocFromStorage(viewClient.id, fileName);
      setStorageDocs(prev => prev.filter(d => d.name !== fileName));
    }
    // Delete from document-service
    await deleteDocument(docId, 'client');
    setClientDocs(prev => prev.filter(d => d.id !== docId));
    showToast('Document supprime');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveClient = async () => {
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      showToast('Prenom et nom requis', 'error');
      return;
    }
    if (!formData.email?.trim()) {
      showToast('Courriel requis', 'error');
      return;
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showToast('Format de courriel invalide (ex: nom@domaine.com)', 'error');
      return;
    }
    // Phone format warning (does not block save)
    if (formData.phone?.trim()) {
      const phoneClean = formData.phone.replace(/[\s\-().+]/g, '');
      if (phoneClean.length > 0 && (phoneClean.length < 10 || !/^\d+$/.test(phoneClean))) {
        showToast('Le format du telephone semble invalide — verifiez le numero', 'error');
      }
    }
    setSaving(true);
    try {
      if (editMode) {
        const updated = { ...formData, updatedAt: new Date().toISOString().split('T')[0] } as Client;
        setClients(clients.map(c => c.id === formData.id ? { ...c, ...updated } : c));
        await updateClient(formData.id!, updated);
        showToast('Client modifie avec succes');
      } else {
        const newClient = formData as Client;
        setClients([...clients, newClient]);
        await insertClient(newClient);
        // Auto-create portal access for the new client
        if (newClient.email) {
          try {
            await crmFetch('/api/crm/portal-invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: newClient.email,
                name: `${newClient.firstName} ${newClient.lastName}`,
                entityType: 'client',
                entityId: newClient.id,
              }),
            });
            showToast('Client cree + acces portail envoye');
          } catch (err) {
            console.error('Erreur envoi portail:', err);
            showToast('Client cree (acces portail non envoye)', 'error');
          }
        } else {
          showToast('Client cree avec succes');
        }
      }
      // Save photo to Supabase Storage if present and it's a base64 string
      if (formPhoto && formData.id && formPhoto.startsWith('data:')) {
        try {
          const resp = await fetch(formPhoto);
          const blob = await resp.blob();
          const file = new File([blob], `${formData.id}.jpg`, { type: 'image/jpeg' });
          const url = await uploadPhotoToStorage(formData.id, file);
          if (url) {
            setClientPhotos(prev => ({ ...prev, [formData.id!]: url + '?t=' + Date.now() }));
          }
        } catch (err) {
          console.error('Erreur upload photo:', err);
          showToast('Client sauvegarde, mais la photo n\'a pas pu etre telechargee', 'error');
        }
      }
      setShowModal(false);
    } catch (err) {
      console.error('Erreur sauvegarde client:', err);
      showToast('Erreur lors de la sauvegarde', 'error');
    }
    setSaving(false);
  };

  const deleteClient = (id: string) => {
    if (confirm('Etes-vous sur de vouloir archiver ce client?')) {
      setClients(clients.map(c => c.id === id ? { ...c, status: 'archive' as const } : c));
      showToast('Client archive');
    }
  };

  // ====== CSV Import: now uses Supabase insertClient for each row ======
  const handleImportComplete = async (newClients: Client[]) => {
    // Add to local state immediately
    setClients([...clients, ...newClients]);
    // Persist each to Supabase
    let successCount = 0;
    let failCount = 0;
    for (const nc of newClients) {
      try {
        await insertClient(nc);
        successCount++;
      } catch (err) {
        console.error('Erreur import client:', err);
        failCount++;
      }
    }
    if (failCount > 0) {
      showToast(`${successCount} client(s) importe(s), ${failCount} echec(s)`, failCount > 0 ? 'error' : 'success');
    } else {
      showToast(`${successCount} client(s) importe(s) avec succes`);
    }
    // Refresh client list from DB to sync
    try {
      const refreshed = await fetchClientsFromDB();
      if (refreshed && refreshed.length > 0) {
        setClients(refreshed);
      }
    } catch (err) {
      console.error('Erreur sync clients:', err);
      // local state is still valid
    }
  };

  const addFamilyMember = () => {
    const fm: FamilyMember = { id: `fm${Date.now()}`, relationship: '', firstName: '', lastName: '', dateOfBirth: '', nationality: '', passportNumber: '', accompany: true };
    setFormData({ ...formData, familyMembers: [...(formData.familyMembers || []), fm] });
  };

  const updateFM = (idx: number, key: keyof FamilyMember, val: string | boolean) => {
    const fms = [...(formData.familyMembers || [])];
    fms[idx] = { ...fms[idx], [key]: val };
    setFormData({ ...formData, familyMembers: fms });
  };

  const removeFM = (idx: number) => {
    setFormData({ ...formData, familyMembers: (formData.familyMembers || []).filter((_, i) => i !== idx) });
  };

  const up = (key: keyof Client, val: unknown) => setFormData({ ...formData, [key]: val });

  const toggleSort = (col: 'dateInscription' | 'name') => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir(col === 'dateInscription' ? 'desc' : 'asc');
    }
  };

  // ====== Portal access helpers ======
  const loadPortalAccess = useCallback(async (clientId: string, email: string) => {
    setPortalLoading(true);
    setPortalAccess(null);
    try {
      const res = await crmFetch(`/api/crm/portal-invite?entity_type=client&entity_id=${clientId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPortalAccess(data[0]);
        }
      }
    } catch (err) {
      console.error('Erreur chargement acces portail:', err);
    }
    setPortalLoading(false);
  }, []);

  const sendPortalInvite = async () => {
    if (!viewClient) return;
    setPortalSending(true);
    try {
      const res = await crmFetch('/api/crm/portal-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: viewClient.email,
          name: `${viewClient.firstName} ${viewClient.lastName}`,
          entityType: 'client',
          entityId: viewClient.id,
        }),
      });
      if (res.ok) {
        showToast('Acces portail envoye avec succes');
        await loadPortalAccess(viewClient.id, viewClient.email);
      } else {
        showToast('Erreur lors de l\'envoi de l\'acces portail', 'error');
      }
    } catch {
      showToast('Erreur de connexion', 'error');
    }
    setPortalSending(false);
  };

  const reactivatePortal = async () => {
    if (!viewClient || !portalAccess) return;
    setPortalSending(true);
    try {
      const res = await crmFetch('/api/crm/portal-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: viewClient.email,
          name: `${viewClient.firstName} ${viewClient.lastName}`,
          entityType: 'client',
          entityId: viewClient.id,
        }),
      });
      if (res.ok) {
        showToast('Acces portail reactive');
        await loadPortalAccess(viewClient.id, viewClient.email);
      } else {
        showToast('Erreur lors de la reactivation', 'error');
      }
    } catch {
      showToast('Erreur de connexion', 'error');
    }
    setPortalSending(false);
  };

  // When opening a client detail, load portal + photo data
  const openClientDetail = useCallback(async (c: Client) => {
    setViewClient(c);
    setDetailTab('profil');
    setExpandedCaseId(null);
    setGovFormSearch('');
    loadClientDocs(c.id);
    loadClientPhoto(c.id);
    loadPortalAccess(c.id, c.email);
  }, [loadClientDocs, loadClientPhoto, loadPortalAccess]);

  // Get cases for the currently viewed client
  const clientCases = viewClient ? cases.filter(cs => cs.clientId === viewClient.id) : [];
  // Get contracts for the currently viewed client
  const clientContracts: ServiceContract[] = viewClient ? contracts.filter((ct: ServiceContract) => ct.clientId === viewClient.id) : [];

  // Suppress unused var warnings
  void selectedClient;
  void saving;

  // ====== Detail Panel Tab Definitions ======
  const DETAIL_TABS: { key: DetailTab; label: string; icon: typeof Users }[] = [
    { key: 'profil', label: 'Profil', icon: Users },
    { key: 'analyse', label: 'Analyse', icon: BarChart3 },
    { key: 'notes', label: 'Notes & Suivi', icon: MessageSquare },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'dossiers', label: 'Dossiers', icon: FolderOpen },
    { key: 'rdv', label: 'RDV', icon: Calendar },
    { key: 'contrats', label: 'Contrats', icon: FileCheck },
    { key: 'courriels', label: 'Courriels', icon: Mail },
    { key: 'portail', label: 'Acces portail', icon: KeyRound },
  ];

  return (
    <div className="space-y-6">
      {/* En-tete + liste — masques quand un client est selectionne */}
      {!viewClient && (<>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-[#D4A03C]" />
          <h1 className="text-2xl font-bold text-gray-900">Gestion des clients</h1>
          <span className="text-sm text-gray-500">({filtered.length} clients)</span>
          <button
            onClick={async () => {
              setRefreshing(true);
              try { await refreshData(); setLastRefreshed(new Date()); } finally { setRefreshing(false); }
            }}
            disabled={refreshing}
            title={`Derniere mise a jour: ${lastRefreshed.toLocaleTimeString('fr-CA')}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-[#1B2559] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{refreshing ? 'Mise a jour...' : 'Rafraichir'}</span>
          </button>
          <span className="text-[10px] text-gray-400 hidden md:inline">
            Sync auto active
          </span>
        </div>
        {perms.canCreateClient && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 border border-[#D4A03C] text-[#D4A03C] rounded-lg font-medium hover:bg-[#FDF8ED] transition-colors">
              <Upload size={16} /> Importer CSV
            </button>
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#D4A03C] text-white rounded-lg font-medium hover:bg-[#B8892F] transition-colors">
              <Plus size={16} /> Nouveau client
            </button>
          </div>
        )}
      </div>

      {/* Stats par statut */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {([
          { key: 'actif', icon: '🟢', color: 'border-green-200 bg-green-50' },
          { key: 'prospect', icon: '🔵', color: 'border-blue-200 bg-blue-50' },
          { key: 'en_attente', icon: '🟡', color: 'border-amber-200 bg-amber-50' },
          { key: 'complete', icon: '🟣', color: 'border-purple-200 bg-purple-50' },
          { key: 'annule', icon: '🔴', color: 'border-red-200 bg-red-50' },
          { key: 'archive', icon: '⚫', color: 'border-gray-200 bg-gray-50' },
        ] as const).map(s => {
          const count = clients.filter(c => c.status === s.key).length;
          return (
            <button key={s.key} onClick={() => setStatusFilter(statusFilter === s.key ? '' : s.key)}
              className={`rounded-xl border p-3 text-center transition-all ${s.color} ${statusFilter === s.key ? 'ring-2 ring-[#D4A03C] shadow-sm' : 'hover:shadow-sm'}`}>
              <div className="text-lg font-bold text-gray-900">{count}</div>
              <div className="text-[10px] text-gray-600 flex items-center justify-center gap-1">
                <span>{s.icon}</span> {CLIENT_STATUS_LABELS[s.key]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, courriel, nationalite..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">Tous les statuts</option>
          {Object.entries(CLIENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">Toutes les sources</option>
          {Object.entries(CLIENT_SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={prioriteFilter} onChange={e => setPrioriteFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">Toutes les priorites</option>
          {Object.entries(CLIENT_PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-[#1B2559]">
                    Client <ArrowUpDown size={12} className={sortBy === 'name' ? 'text-[#D4A03C]' : 'text-gray-400'} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  <button onClick={() => toggleSort('dateInscription')} className="flex items-center gap-1 hover:text-[#1B2559]">
                    Inscription <ArrowUpDown size={12} className={sortBy === 'dateInscription' ? 'text-[#D4A03C]' : 'text-gray-400'} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Priorite</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Immigration</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Assigne a</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedClients.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openClientDetail(c)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#EAEDF5] to-[#d5daf0] text-[#1B2559] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden ring-1 ring-gray-200">
                        {clientPhotos[c.id] ? (
                          <img src={clientPhotos[c.id]} alt={`${c.firstName} ${c.lastName}`} className="w-full h-full object-cover" />
                        ) : (
                          <>{c.firstName[0]}{c.lastName[0]}</>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[#1B2559] flex items-center gap-1.5 hover:underline">
                          {c.firstName} {c.lastName}
                          {(c.source === 'test_admissibilite' || c.notes?.includes('admissibility_test') || c.notes?.includes('Test admissibilit')) && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r from-[#D4A03C] to-[#F59E0B] text-white shadow-sm">Test gratuit</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                    {formatDateFr(c.dateInscription || c.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {c.source ? CLIENT_SOURCE_LABELS[c.source] || c.source : '\u2014'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {CLIENT_STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.priorite ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[c.priorite] || ''}`}>
                        {CLIENT_PRIORITY_LABELS[c.priorite] || c.priorite}
                      </span>
                    ) : <span className="text-gray-300 text-xs">\u2014</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{IMMIGRATION_STATUS[c.currentStatus] || c.currentStatus}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{getUserName(c.assignedTo)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {perms.canEditClient && <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100" title="Modifier"><Edit3 size={14} className="text-blue-500" /></button>}
                      {perms.canDeleteClient && <button onClick={() => deleteClient(c.id)} className="p-1.5 rounded hover:bg-gray-100" title="Supprimer"><Trash2 size={14} className="text-red-500" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            {search || statusFilter || sourceFilter || prioriteFilter ? (
              <>
                <Search size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">Aucun client ne correspond aux filtres</p>
                <p className="text-xs text-gray-400 mt-1">Essayez de modifier vos criteres de recherche</p>
                <button onClick={() => { setSearch(''); setStatusFilter(''); setSourceFilter(''); setPrioriteFilter(''); }} className="mt-3 text-xs text-[#D4A03C] font-medium hover:underline">Reinitialiser les filtres</button>
              </>
            ) : (
              <>
                <Users size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">Aucun client pour le moment</p>
                <p className="text-xs text-gray-400 mt-1">Ajoutez votre premier client pour commencer</p>
              </>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalFiltered > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Affichage {startIndex + 1}-{endIndex} sur {totalFiltered} clients
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Precedent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => {
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - currentPage) <= 2) return true;
                  return false;
                })
                .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                  if (i > 0 && arr[i - 1] !== undefined && p - (arr[i - 1] as number) > 1) {
                    acc.push('ellipsis');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === 'ellipsis' ? (
                    <span key={`e${i}`} className="px-2 py-1.5 text-sm text-gray-400">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item as number)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        currentPage === item
                          ? 'bg-[#D4A03C] text-white border-[#D4A03C]'
                          : 'border-gray-200 hover:bg-white'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
      </>)}

      {/* ================================================================ */}
      {/* Vue pleine page detail client - style Portail Client             */}
      {/* ================================================================ */}
      {viewClient && (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header client - pleine largeur */}
          <div className="flex items-center gap-4">
            <button onClick={() => setViewClient(null)} className="p-2 rounded-lg hover:bg-gray-100 transition">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>

            {/* Client avatar + info */}
            <div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-[#EAEDF5] to-[#d5daf0] text-[#1B2559] flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden cursor-pointer relative group ring-2 ring-white shadow-md"
              onClick={() => photoInputRef.current?.click()}
            >
              {clientPhotos[viewClient.id] ? (
                <img src={clientPhotos[viewClient.id]} alt={`${viewClient.firstName} ${viewClient.lastName}`} className="w-full h-full object-cover" />
              ) : (
                <>{viewClient.firstName[0]}{viewClient.lastName[0]}</>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera size={16} className="text-white" />
              </div>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={e => { if (e.target.files?.[0] && viewClient) { handlePhotoUpload(e.target.files[0], viewClient.id); } e.target.value = ''; }}
            />
            <div>
              <h1 className="text-xl font-bold text-[#1B2559] flex items-center gap-2">
                {viewClient.firstName} {viewClient.lastName}
                {(viewClient.source === 'test_admissibilite' || viewClient.notes?.includes('admissibility_test') || viewClient.notes?.includes('Test admissibilit')) && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#D4A03C] to-[#F59E0B] text-white shadow-sm">Test gratuit</span>
                )}
              </h1>
              <p className="text-sm text-gray-500">{viewClient.nationality} — {IMMIGRATION_STATUS[viewClient.currentStatus] || viewClient.currentStatus}</p>
            </div>
            <div className="ml-auto flex items-center gap-3 flex-wrap">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[viewClient.status] || 'bg-gray-100 text-gray-700'}`}>
                {CLIENT_STATUS_LABELS[viewClient.status] || viewClient.status}
              </span>
              {/* Quick convert prospect → actif */}
              {viewClient.status === 'prospect' && perms.canEditClient && (
                <button onClick={async () => {
                  // 1. Change status to actif
                  const updated = clients.map(c => c.id === viewClient.id ? { ...c, status: 'actif' as const, dateInscription: new Date().toISOString().split('T')[0], dateDernierContact: new Date().toISOString().split('T')[0] } : c);
                  setClients(updated);
                  setViewClient({ ...viewClient, status: 'actif' as typeof viewClient.status, dateInscription: new Date().toISOString().split('T')[0] });
                  // 2. Add conversion note
                  const noteKey = `soshub_client_notes_${viewClient.id}`;
                  const existing = JSON.parse(localStorage.getItem(noteKey) || '[]');
                  existing.unshift({ id: `n${Date.now()}`, category: 'suivi', content: 'Prospect converti en client actif — Invitation portail envoyée automatiquement', author: currentUser.name, authorId: currentUser.id, createdAt: new Date().toISOString(), pinned: false });
                  localStorage.setItem(noteKey, JSON.stringify(existing));
                  // 3. Auto-send portal invite
                  try {
                    const res = await crmFetch('/api/crm/portal-invite', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: viewClient.email,
                        name: `${viewClient.firstName} ${viewClient.lastName}`,
                        entityType: 'client',
                        entityId: viewClient.id,
                      }),
                    });
                    if (res.ok) {
                      showToast('Client converti + accès portail envoyé par courriel');
                      await loadPortalAccess(viewClient.id, viewClient.email);
                    } else {
                      showToast('Client converti — Erreur envoi portail (à renvoyer manuellement)', 'error');
                    }
                  } catch (err) {
                    console.error('Erreur envoi portail:', err);
                    showToast('Client converti — Portail a envoyer manuellement', 'error');
                  }
                }} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={12} /> Convertir en client
                </button>
              )}
              {/* Quick status change for non-prospects */}
              {viewClient.status !== 'prospect' && perms.canEditClient && (
                <select
                  value={viewClient.status}
                  onChange={e => {
                    const newStatus = e.target.value as typeof viewClient.status;
                    const updated = clients.map(c => c.id === viewClient.id ? { ...c, status: newStatus, dateDernierContact: new Date().toISOString().split('T')[0] } : c);
                    setClients(updated);
                    setViewClient({ ...viewClient, status: newStatus });
                    const noteKey = `soshub_client_notes_${viewClient.id}`;
                    const existing = JSON.parse(localStorage.getItem(noteKey) || '[]');
                    existing.unshift({ id: `n${Date.now()}`, category: 'suivi', content: `Statut changé en : ${CLIENT_STATUS_LABELS[newStatus] || newStatus}`, author: currentUser.name, authorId: currentUser.id, createdAt: new Date().toISOString(), pinned: false });
                    localStorage.setItem(noteKey, JSON.stringify(existing));
                  }}
                  className="px-2 py-1 border border-gray-200 rounded-lg text-xs font-medium bg-white"
                >
                  {Object.entries(CLIENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              )}
              <span className="flex items-center gap-1 text-sm text-gray-500"><Mail size={14} /> {viewClient.email}</span>
              <span className="flex items-center gap-1 text-sm text-gray-500"><PhoneCall size={14} /> {viewClient.phone}</span>
              {perms.canEditClient && (
                <button onClick={() => { openEdit(viewClient); }} className="px-3 py-1.5 bg-[#D4A03C] text-white text-xs font-medium rounded-lg hover:bg-[#b8882f] transition-colors flex items-center gap-1">
                  <Edit3 size={12} /> Modifier
                </button>
              )}
            </div>
          </div>

          {/* ====== TAB NAVIGATION - HORIZONTAL PILLS ====== */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {DETAIL_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key)}
                  className={`flex items-center gap-2 flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    detailTab === tab.key
                      ? 'bg-[#1B2559] text-white shadow'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ====== TAB CONTENT ====== */}
          <div className="space-y-6">
              {/* ---- TAB: Profil ---- */}
              {detailTab === 'profil' && (
                <>
                  {/* KPI Summary Cards */}
                  {(() => {
                    const activeCases = clientCases.filter(cs => !['ferme', 'annule', 'refuse', 'approuve'].includes(cs.status));
                    const totalForms = clientCases.reduce((acc, cs) => acc + cs.forms.length, 0);
                    const completedForms = clientCases.reduce((acc, cs) => acc + cs.forms.filter(f => ['rempli', 'revise', 'approuve', 'signe'].includes(f.status)).length, 0);
                    const formPct = totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;
                    const clientAppts = appointments.filter(a => a.clientId === viewClient.id);
                    const nextAppt = clientAppts.filter(a => new Date(`${a.date}T${a.time}`) >= new Date()).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0];
                    const totalDocs = viewClient.documents?.length || 0;
                    const verifiedDocs = viewClient.documents?.filter(d => d.status === 'verifie').length || 0;
                    return (
                      <div className="grid grid-cols-4 gap-3 mb-5">
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                          <div className="text-lg font-bold text-blue-700">{activeCases.length}</div>
                          <div className="text-[10px] text-blue-600 uppercase font-medium">Dossiers actifs</div>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3 text-center">
                          <div className="text-lg font-bold text-amber-700">{formPct}%</div>
                          <div className="text-[10px] text-amber-600 uppercase font-medium">Formulaires</div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                          <div className="text-xs font-bold text-purple-700 leading-tight">{nextAppt ? `${formatDateFr(nextAppt.date)}` : '—'}</div>
                          <div className="text-[10px] text-purple-600 uppercase font-medium mt-0.5">Prochain RDV</div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                          <div className="text-lg font-bold text-green-700">{verifiedDocs}/{totalDocs}</div>
                          <div className="text-[10px] text-green-600 uppercase font-medium">Docs verifies</div>
                        </div>
                      </div>
                    );
                  })()}
                  {/* Section: Informations personnelles */}
                  <div>
                    <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                      <Users size={14} className="text-[#D4A03C]" /> Informations personnelles
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Courriel:</span><br/><span className="font-medium">{viewClient.email}</span></div>
                      <div><span className="text-gray-500">Telephone:</span><br/><span className="font-medium">{viewClient.phone}</span></div>
                      <div><span className="text-gray-500">Date de naissance:</span><br/><span className="font-medium">{formatDateFr(viewClient.dateOfBirth)}</span></div>
                      <div><span className="text-gray-500">Nationalite:</span><br/><span className="font-medium">{viewClient.nationality}</span></div>
                      <div><span className="text-gray-500">Etat civil:</span><br/><span className="font-medium">{viewClient.maritalStatus}</span></div>
                      <div><span className="text-gray-500">Personnes a charge:</span><br/><span className="font-medium">{viewClient.dependants}</span></div>
                      <div><span className="text-gray-500">Anglais (CLB):</span><br/><span className="font-medium">{viewClient.languageEnglish || 'N/A'}</span></div>
                      <div><span className="text-gray-500">Francais (NCLC):</span><br/><span className="font-medium">{viewClient.languageFrench || 'N/A'}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Education:</span><br/><span className="font-medium">{viewClient.education || 'N/A'}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Experience:</span><br/><span className="font-medium">{viewClient.workExperience || 'N/A'}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Adresse:</span><br/><span className="font-medium">{viewClient.address}, {viewClient.city}, {viewClient.province} {viewClient.postalCode}</span></div>
                    </div>
                  </div>

                  {/* Section: Immigration */}
                  <div>
                    <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                      <Shield size={14} className="text-[#D4A03C]" /> Immigration
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Statut immigration:</span><br/><span className="font-medium">{IMMIGRATION_STATUS[viewClient.currentStatus] || viewClient.currentStatus}</span></div>
                      <div><span className="text-gray-500">Passeport:</span><br/><span className="font-medium">{viewClient.passportNumber || 'N/A'}</span></div>
                      <div><span className="text-gray-500">Expiration passeport:</span><br/><span className="font-medium">{viewClient.passportExpiry ? formatDateFr(viewClient.passportExpiry) : 'N/A'}</span></div>
                      <div><span className="text-gray-500">Numero UCI:</span><br/><span className="font-medium">{viewClient.numeroUCI || 'N/A'}</span></div>
                      <div><span className="text-gray-500">Dossier IRCC:</span><br/><span className="font-medium">{viewClient.numeroDossierIRCC || 'N/A'}</span></div>
                      <div><span className="text-gray-500">Expiration du statut:</span><br/><span className="font-medium">{viewClient.dateExpirationStatut ? formatDateFr(viewClient.dateExpirationStatut) : 'N/A'}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Programme d&apos;interet:</span><br/><span className="font-medium">{viewClient.programmeInteret || 'N/A'}</span></div>
                    </div>
                  </div>

                  {/* Section: Suivi CRM */}
                  <div>
                    <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                      <PhoneCall size={14} className="text-[#D4A03C]" /> Suivi CRM
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Date d&apos;inscription:</span><br/><span className="font-medium">{formatDateFr(viewClient.dateInscription || viewClient.createdAt)}</span></div>
                      <div><span className="text-gray-500">Source d&apos;acquisition:</span><br/><span className="font-medium">{viewClient.source ? CLIENT_SOURCE_LABELS[viewClient.source] || viewClient.source : 'N/A'}</span></div>
                      {viewClient.referePar && <div><span className="text-gray-500">Refere par:</span><br/><span className="font-medium">{viewClient.referePar}</span></div>}
                      <div><span className="text-gray-500">Priorite:</span><br/>
                        {viewClient.priorite ? (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[viewClient.priorite]}`}>
                            {CLIENT_PRIORITY_LABELS[viewClient.priorite]}
                          </span>
                        ) : <span className="font-medium">N/A</span>}
                      </div>
                      <div><span className="text-gray-500">Dernier contact:</span><br/><span className="font-medium">{viewClient.dateDernierContact ? formatDateFr(viewClient.dateDernierContact) : 'N/A'}</span></div>
                      <div><span className="text-gray-500">Prochaine relance:</span><br/><span className="font-medium">{viewClient.prochaineRelance ? formatDateFr(viewClient.prochaineRelance) : 'N/A'}</span></div>
                      <div><span className="text-gray-500">Agent assigne:</span><br/><span className="font-medium">{getUserName(viewClient.assignedTo)}</span></div>
                    </div>
                  </div>

                  {/* Section: Consentements */}
                  <div>
                    <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                      <CheckSquare size={14} className="text-[#D4A03C]" /> Consentements
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${viewClient.consentementCommunication ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-gray-600">Communication</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${viewClient.consentementPartage ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-gray-600">Partage de donnees</span>
                      </div>
                      {viewClient.dateConsentement && (
                        <div className="col-span-2"><span className="text-gray-500">Date du consentement:</span> <span className="font-medium">{formatDateFr(viewClient.dateConsentement)}</span></div>
                      )}
                    </div>
                  </div>

                  {/* Famille */}
                  {viewClient.familyMembers.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Membres de la famille ({viewClient.familyMembers.length})</h3>
                      <div className="space-y-2">
                        {viewClient.familyMembers.map(fm => (
                          <div key={fm.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="font-medium">{fm.firstName} {fm.lastName}</div>
                            <div className="text-gray-500">{fm.relationship} \u2014 {fm.nationality} \u2014 Ne(e): {fm.dateOfBirth} {fm.accompany ? '\u2014 Accompagne' : ''}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewClient.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                      <p className="text-sm text-gray-700 bg-yellow-50 rounded-lg p-3">{viewClient.notes}</p>
                    </div>
                  )}
                </>
              )}

              {/* ---- TAB: Analyse d'admissibilite — PREMIUM ---- */}
              {detailTab === 'analyse' && viewClient && (
                <div className="space-y-6" id="analyse-report">
                  {(() => {
                    // Build ClientProfile from client data
                    const birthYear = viewClient.dateOfBirth ? new Date(viewClient.dateOfBirth).getFullYear() : 1990;
                    const age = new Date().getFullYear() - birthYear;
                    const frenchNCLC = viewClient.languageFrench ? parseInt(viewClient.languageFrench.replace(/\D/g, '')) || 5 : 0;
                    const englishCLB = viewClient.languageEnglish ? parseInt(viewClient.languageEnglish.replace(/\D/g, '')) || 5 : 0;
                    const workYears = viewClient.workExperience ? parseInt(viewClient.workExperience) || 3 : 0;
                    const isInQC = (viewClient.province || '').toUpperCase() === 'QC' || viewClient.currentCountry === 'Canada';

                    const profile: ClientProfile = {
                      age,
                      nationality: viewClient.nationality || '',
                      maritalStatus: (viewClient.maritalStatus || '').toLowerCase().includes('mari') || (viewClient.maritalStatus || '').toLowerCase().includes('conjoint') ? 'married' : 'single',
                      hasSpouse: viewClient.dependants > 0 || (viewClient.maritalStatus || '').toLowerCase().includes('mari'),
                      numberOfDependents: viewClient.dependants || 0,
                      currentCountry: viewClient.currentCountry || '',
                      isInCanada: viewClient.currentCountry === 'Canada',
                      isInQuebec: isInQC,
                      yearsInCanada: viewClient.currentCountry === 'Canada' ? Math.min(workYears, 5) : 0,
                      yearsInQuebec: isInQC ? Math.min(workYears, 5) : 0,
                      highestEducation: (viewClient.education || '').toLowerCase().includes('doctor') ? 'phd' as const :
                        (viewClient.education || '').toLowerCase().includes('maitrise') || (viewClient.education || '').toLowerCase().includes('master') ? 'masters' as const :
                        (viewClient.education || '').toLowerCase().includes('bac') ? 'bachelors' as const :
                        (viewClient.education || '').toLowerCase().includes('diplome') ? 'two_year_diploma' as const : 'secondary' as const,
                      hasCanadianEducation: false,
                      canadianEducationProvince: '',
                      hasECA: false,
                      fieldOfStudy: '',
                      frenchLevel: frenchNCLC >= 10 ? 'native' : frenchNCLC >= 7 ? 'advanced' : frenchNCLC >= 5 ? 'intermediate' : frenchNCLC >= 3 ? 'basic' : 'none',
                      frenchNCLC,
                      englishLevel: englishCLB >= 10 ? 'native' : englishCLB >= 7 ? 'advanced' : englishCLB >= 5 ? 'intermediate' : englishCLB >= 3 ? 'basic' : 'none',
                      englishCLB,
                      hasLanguageTest: frenchNCLC > 0 || englishCLB > 0,
                      languageTestType: frenchNCLC > 0 ? 'TEF' : 'IELTS',
                      totalWorkExperienceYears: workYears,
                      canadianWorkExperienceYears: viewClient.currentCountry === 'Canada' ? Math.min(workYears, 5) : 0,
                      quebecWorkExperienceYears: isInQC ? Math.min(workYears, 3) : 0,
                      currentOccupationNOC: '',
                      nocTEER: 1,
                      hasJobOffer: false,
                      jobOfferNOC: '',
                      jobOfferProvince: '',
                      isJobOfferLMIA: false,
                      hasRelativeInCanada: false,
                      relativeRelationship: '',
                      hasSpouseInCanada: false,
                      currentStatus: viewClient.currentStatus === 'resident_permanent' ? 'pr' :
                        viewClient.currentStatus === 'etudiant' ? 'student' :
                        viewClient.currentStatus === 'travailleur' ? 'worker' :
                        viewClient.currentStatus === 'demandeur_asile' ? 'refugee_claimant' : 'none',
                      hasValidPermit: viewClient.currentStatus !== 'etranger',
                      settlementFunds: 20000,
                      spouseEducation: 'secondary',
                      spouseFrenchNCLC: 0,
                      spouseEnglishCLB: 0,
                      spouseCanadianWorkYears: 0,
                      hasMultipleCredentials: false,
                      hasCertificateOfQualification: false,
                      isRefugee: viewClient.currentStatus === 'demandeur_asile' || viewClient.currentStatus === 'personne_protegee',
                      hasCriminalRecord: false,
                      hasMedicalIssue: false,
                      hasBusinessExperience: false,
                    };

                    const analysis = analyzeEligibility(profile, `${viewClient.firstName} ${viewClient.lastName}`);
                    const eligible = analysis.programs.filter(p => p.eligibility === 'eligible' || p.eligibility === 'likely_eligible');
                    const possible = analysis.programs.filter(p => p.eligibility === 'possibly_eligible');
                    const notEligible = analysis.programs.filter(p => p.eligibility === 'not_eligible' || p.eligibility === 'ended');

                    const ELIG_COLORS: Record<string, string> = {
                      eligible: 'bg-green-100 text-green-700 border-green-200',
                      likely_eligible: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                      possibly_eligible: 'bg-amber-100 text-amber-700 border-amber-200',
                      not_eligible: 'bg-red-100 text-red-700 border-red-200',
                      ended: 'bg-gray-100 text-gray-500 border-gray-200',
                    };
                    const ELIG_LABELS: Record<string, string> = {
                      eligible: 'Eligible', likely_eligible: 'Probablement eligible',
                      possibly_eligible: 'Possiblement eligible', not_eligible: 'Non eligible', ended: 'Programme termine',
                    };

                    // CRS scoring
                    const scoringProfile = getDefaultProfile();
                    scoringProfile.age = age;
                    scoringProfile.educationLevel = profile.highestEducation === 'phd' ? 'doctoral' : profile.highestEducation === 'masters' ? 'masters' : profile.highestEducation === 'bachelors' ? 'bachelors' : 'secondary';
                    scoringProfile.firstLanguage = frenchNCLC >= englishCLB ? 'french' : 'english';
                    scoringProfile.firstLanguageScores = frenchNCLC >= englishCLB
                      ? { speaking: frenchNCLC, listening: frenchNCLC, reading: frenchNCLC, writing: frenchNCLC }
                      : { speaking: englishCLB, listening: englishCLB, reading: englishCLB, writing: englishCLB };
                    scoringProfile.secondLanguageScores = frenchNCLC >= englishCLB && englishCLB > 0
                      ? { speaking: englishCLB, listening: englishCLB, reading: englishCLB, writing: englishCLB }
                      : frenchNCLC > 0 && frenchNCLC < englishCLB ? { speaking: frenchNCLC, listening: frenchNCLC, reading: frenchNCLC, writing: frenchNCLC } : null;
                    scoringProfile.canadianWorkExperienceYears = profile.canadianWorkExperienceYears;
                    scoringProfile.foreignWorkExperienceYears = Math.max(0, workYears - profile.canadianWorkExperienceYears);
                    scoringProfile.maritalStatus = profile.hasSpouse ? 'married_common_law' : 'single';

                    const crs = calculateCRS(scoringProfile);
                    const mifi = calculateMIFI(scoringProfile);
                    const crsAdvice = getCrsImprovementAdvice(scoringProfile, crs);
                    const mifiAdvice = getMifiImprovementAdvice(scoringProfile, mifi);
                    const lastCutoff = CRS_RECENT_CUTOFFS[0];

                    // Pie chart CSS helper
                    const pieStyle = (pct: number, color: string) => ({
                      background: `conic-gradient(${color} 0% ${pct}%, #E5E7EB ${pct}% 100%)`,
                      borderRadius: '50%',
                    });
                    const crsPct = Math.round((crs.total / 1200) * 100);
                    const mifiPct = Math.round((mifi.total / 100) * 100);
                    const eligPct = analysis.programs.length > 0 ? Math.round((eligible.length / analysis.programs.length) * 100) : 0;

                    const handleExportPDF = () => {
                      const w = window.open('', '_blank');
                      if (!w) return;

                      const eligibleHtml = eligible.map(p => `
                        <div style="border-left:4px solid #10B981;border-radius:0 8px 8px 0;padding:16px;margin:8px 0;background:#F0FDF4">
                          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                            <strong style="font-size:14px;color:#111827">${p.programNameFr || p.programName}</strong>
                            <span style="background:#DEF7EC;color:#03543F;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700">${ELIG_LABELS[p.eligibility]} — ${p.score}/100</span>
                          </div>
                          ${p.keyStrengths.length > 0 ? `<div style="font-size:12px;color:#059669;margin-bottom:4px">${p.keyStrengths.map(s => '+ ' + s).join(' | ')}</div>` : ''}
                          ${p.recommendations.length > 0 ? `<div style="font-size:12px;color:#2563EB">${p.recommendations.map(r => '→ ' + r).join('<br>')}</div>` : ''}
                          <div style="font-size:11px;color:#9CA3AF;margin-top:6px">Délai: ${p.estimatedProcessingTime || 'N/A'} | Frais: ${p.governmentFees ? p.governmentFees + ' $' : 'N/A'}</div>
                          <div style="margin-top:8px;padding-top:8px;border-top:1px solid #E5E7EB;font-size:12px;color:#4B5563"><strong style="color:#1B2559">SOS Hub Canada</strong> peut vous accompagner pour déposer votre demande et maximiser vos chances.</div>
                        </div>`).join('');

                      const possibleHtml = possible.map(p => `
                        <div style="border-left:4px solid #F59E0B;border-radius:0 8px 8px 0;padding:12px;margin:8px 0;background:#FFFBEB">
                          <strong style="font-size:13px">${p.programNameFr || p.programName}</strong> <span style="font-size:12px;color:#D97706">${p.score}/100</span>
                          ${p.missingRequirements.length > 0 ? `<div style="font-size:11px;color:#DC2626;margin-top:4px">${p.missingRequirements.slice(0, 2).map(r => '! ' + r).join('<br>')}</div>` : ''}
                        </div>`).join('');

                      const crsBarHtml = [
                        { label: 'Capital humain', pts: crs.coreHumanCapital.subtotal, max: 500, color: '#3B82F6' },
                        { label: 'Conjoint', pts: crs.spouseFactors.subtotal, max: 40, color: '#8B5CF6' },
                        { label: 'Transférabilité', pts: crs.skillTransferability.subtotal, max: 100, color: '#10B981' },
                        { label: 'Additionnel', pts: crs.additional.subtotal, max: 600, color: '#D4A03C' },
                      ].map(b => `
                        <div style="margin-bottom:8px">
                          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span style="color:#6B7280">${b.label}</span><strong>${b.pts}/${b.max}</strong></div>
                          <div style="height:8px;background:#E5E7EB;border-radius:4px;overflow:hidden"><div style="height:100%;width:${b.max > 0 ? (b.pts / b.max) * 100 : 0}%;background:${b.color};border-radius:4px"></div></div>
                        </div>`).join('');

                      const adviceHtml = crsAdvice.slice(0, 5).map(a => `
                        <div style="border:1px solid #E5E7EB;border-radius:8px;padding:12px;margin:6px 0">
                          <div style="display:flex;justify-content:space-between"><strong style="font-size:13px">${a.category}</strong><span style="font-size:11px;color:#D4A03C;font-weight:700">+${a.maxPoints - a.currentPoints} pts</span></div>
                          <div style="font-size:12px;color:#6B7280;margin-top:4px">${a.advice}</div>
                        </div>`).join('');

                      w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
                        <title>Analyse Premium — ${viewClient.firstName} ${viewClient.lastName} | SOS Hub Canada</title>
                        <style>
                          *{margin:0;padding:0;box-sizing:border-box}
                          body{font-family:system-ui,-apple-system,sans-serif;color:#1B2559;max-width:800px;margin:0 auto;padding:20px;line-height:1.5}
                          @media print{body{margin:0;padding:15mm}-webkit-print-color-adjust:exact;print-color-adjust:exact}
                        </style></head><body>
                        <div style="text-align:center;padding:24px 0;border-bottom:3px solid #D4A03C;margin-bottom:24px">
                          <div style="font-size:24px;font-weight:900;color:#1B2559">[ SOS <span style="color:#D4A03C">HUB</span> ] Canada</div>
                          <div style="font-size:11px;color:#D4A03C;font-weight:700;letter-spacing:3px;margin-top:4px">RAPPORT D'ANALYSE D'ADMISSIBILITÉ</div>
                          <div style="font-size:12px;color:#9CA3AF;margin-top:8px">${new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>

                        <h2 style="font-size:18px;color:#1B2559;margin-bottom:12px">${viewClient.firstName} ${viewClient.lastName}</h2>
                        <div style="background:#F8FAFC;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #E2E8F0">
                          <table style="width:100%;font-size:13px"><tr>
                            <td style="padding:4px 0;color:#6B7280">Nationalité: <strong style="color:#1B2559">${viewClient.nationality}</strong></td>
                            <td style="padding:4px 0;color:#6B7280">Âge: <strong style="color:#1B2559">${age} ans</strong></td>
                            <td style="padding:4px 0;color:#6B7280">Éducation: <strong style="color:#1B2559">${viewClient.education || 'N/A'}</strong></td>
                          </tr><tr>
                            <td style="padding:4px 0;color:#6B7280">Français: <strong style="color:#1B2559">NCLC ${frenchNCLC}</strong></td>
                            <td style="padding:4px 0;color:#6B7280">Anglais: <strong style="color:#1B2559">CLB ${englishCLB}</strong></td>
                            <td style="padding:4px 0;color:#6B7280">Expérience: <strong style="color:#1B2559">${workYears} ans</strong></td>
                          </tr></table>
                        </div>

                        <div style="display:flex;gap:16px;margin-bottom:24px;text-align:center">
                          <div style="flex:1;background:#1B2559;color:white;border-radius:12px;padding:16px">
                            <div style="font-size:28px;font-weight:900;color:#D4A03C">${eligible.length}</div>
                            <div style="font-size:11px;color:rgba(255,255,255,0.7)">Programme(s) éligible(s)</div>
                          </div>
                          <div style="flex:1;background:#1B2559;color:white;border-radius:12px;padding:16px">
                            <div style="font-size:28px;font-weight:900">${crs.total}</div>
                            <div style="font-size:11px;color:rgba(255,255,255,0.7)">Score CRS / 1200</div>
                          </div>
                          <div style="flex:1;background:#1B2559;color:white;border-radius:12px;padding:16px">
                            <div style="font-size:28px;font-weight:900">${mifi.total}</div>
                            <div style="font-size:11px;color:rgba(255,255,255,0.7)">Score MIFI</div>
                          </div>
                        </div>

                        ${analysis.topRecommendation ? `<div style="background:#FEF3C7;border-left:4px solid #D4A03C;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;font-size:13px"><strong style="color:#D4A03C">Recommandation:</strong> ${analysis.topRecommendation}</div>` : ''}

                        <h3 style="color:#059669;font-size:14px;margin:20px 0 8px">Programmes éligibles (${eligible.length})</h3>
                        ${eligibleHtml}

                        ${possible.length > 0 ? `<h3 style="color:#D97706;font-size:14px;margin:20px 0 8px">À évaluer (${possible.length})</h3>${possibleHtml}` : ''}

                        <h3 style="color:#1B2559;font-size:14px;margin:24px 0 8px">Score CRS détaillé — ${crs.total}/1200</h3>
                        ${crsBarHtml}
                        ${lastCutoff ? `<div style="font-size:12px;color:#6B7280;margin-top:8px">Dernier tirage: ${lastCutoff.program} — seuil ${lastCutoff.score} pts (${lastCutoff.date}) ${crs.total >= lastCutoff.score ? '<strong style="color:#059669">✓ Au-dessus du seuil</strong>' : `<strong style="color:#DC2626">✗ Sous le seuil (-${lastCutoff.score - crs.total} pts)</strong>`}</div>` : ''}

                        <h3 style="color:#1B2559;font-size:14px;margin:24px 0 8px">Plan d'amélioration</h3>
                        ${adviceHtml}

                        <div style="margin-top:32px;padding:24px;background:#1B2559;border-radius:12px;text-align:center;color:white">
                          <div style="font-size:18px;font-weight:900">SOS <span style="color:#D4A03C">Hub</span> Canada</div>
                          <div style="margin-top:8px;font-size:13px;color:rgba(255,255,255,0.8)">WhatsApp: <strong>+1 (438) 630-2869</strong></div>
                          <div style="font-size:13px;color:rgba(255,255,255,0.8)">Courriel: <strong>info@soshubcanada.com</strong></div>
                          <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:8px">3737 Crémazie Est #402, Montréal QC H1Z 2K4</div>
                        </div>

                        <div style="text-align:center;margin-top:16px;font-size:10px;color:#9CA3AF">
                          Ce rapport est généré automatiquement à titre indicatif. Consultez un conseiller réglementé pour une évaluation officielle.
                        </div>
                      </body></html>`);
                      w.document.close();
                      setTimeout(() => w.print(), 500);
                    };

                    return (
                      <>
                        {/* ═══ PREMIUM HEADER ═══ */}
                        <div className="relative bg-gradient-to-br from-[#1B2559] via-[#242E6B] to-[#1B2559] text-white rounded-2xl p-6 overflow-hidden">
                          <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4A03C]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4A03C]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#D4A03C] to-[#F59E0B] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Analyse Premium</span>
                                  <span className="text-xs text-white/50">{new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <h2 className="text-xl font-bold">{viewClient.firstName} {viewClient.lastName}</h2>
                                <p className="text-sm text-white/60">{viewClient.nationality} — {age} ans — {viewClient.education || 'N/A'}</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={handleExportPDF} className="px-4 py-2 bg-[#D4A03C] text-white text-xs font-bold rounded-lg hover:bg-[#b8882f] transition-colors flex items-center gap-1.5 shadow-lg">
                                  <FileText size={14} /> Exporter PDF
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!viewClient.email) { alert('Aucun courriel pour ce client'); return; }
                                    const confirmed = confirm(`Envoyer le courriel d'analyse à ${viewClient.email} ?`);
                                    if (!confirmed) return;
                                    try {
                                      const previewUrl = `/api/crm/email-preview?name=${encodeURIComponent(viewClient.firstName)}&fullName=${encodeURIComponent(viewClient.firstName + ' ' + viewClient.lastName)}&email=${encodeURIComponent(viewClient.email)}&fr=${encodeURIComponent(viewClient.languageFrench || 'N/A')}&en=${encodeURIComponent(viewClient.languageEnglish || 'N/A')}&edu=${encodeURIComponent(viewClient.education || 'N/A')}&exp=${encodeURIComponent(viewClient.workExperience || 'N/A')}`;
                                      const htmlRes = await crmFetch(previewUrl);
                                      const emailHtml = await htmlRes.text();
                                      const res = await crmFetch('/api/crm/send-email', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          clientId: viewClient.id,
                                          toEmail: viewClient.email,
                                          subject: `${viewClient.firstName}, votre analyse d'admissibilité est prête — SOS Hub Canada`,
                                          emailBody: emailHtml,
                                          type: 'scoring_results',
                                          sentBy: currentUser?.id || 'manual',
                                        }),
                                      });
                                      if (res.ok) alert('Courriel envoyé avec succès !');
                                      else { const err = await res.json(); alert(`Erreur: ${err.error || 'Échec de l\'envoi'}`); }
                                    } catch (e) { alert('Erreur réseau lors de l\'envoi'); }
                                  }}
                                  className="px-4 py-2 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#1da851] transition-colors flex items-center gap-1.5 shadow-lg"
                                >
                                  <Send size={14} /> Envoyer au client
                                </button>
                              </div>
                            </div>

                            {/* Pie Charts Row */}
                            <div className="grid grid-cols-3 gap-6 mt-6">
                              {[
                                { label: 'Score CRS', value: crs.total, max: 1200, pct: crsPct, color: '#D4A03C', sub: `Seuil: ${lastCutoff?.score || 'N/A'}` },
                                { label: 'Score MIFI', value: mifi.total, max: 100, pct: mifiPct, color: '#10B981', sub: `Seuil: ~${MIFI_THRESHOLD_ESTIMATE}` },
                                { label: 'Eligibilite', value: eligible.length, max: analysis.programs.length, pct: eligPct, color: '#3B82F6', sub: `${eligible.length}/${analysis.programs.length} programmes` },
                              ].map(chart => (
                                <div key={chart.label} className="flex flex-col items-center">
                                  <div className="relative w-20 h-20 mb-2">
                                    <div className="w-20 h-20" style={pieStyle(chart.pct, chart.color)} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-14 h-14 bg-[#1B2559] rounded-full flex items-center justify-center">
                                        <span className="text-lg font-black text-white">{chart.value}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-xs font-semibold text-white">{chart.label}</div>
                                  <div className="text-[10px] text-white/50">{chart.sub}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* ═══ TOP RECOMMENDATION (urgency) ═══ */}
                        {analysis.topRecommendation && (
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-[#D4A03C] rounded-r-xl p-4 flex items-start gap-3">
                            <div className="w-8 h-8 bg-[#D4A03C] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                              <AlertCircle size={16} className="text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-[#1B2559] mb-0.5">Recommandation prioritaire</h4>
                              <p className="text-sm text-gray-700">{analysis.topRecommendation}</p>
                            </div>
                          </div>
                        )}

                        {/* ═══ PROFIL SNAPSHOT ═══ */}
                        <div className="bg-white border rounded-xl p-4">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-1"><Users size={12} /> Profil du candidat</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            {[
                              { l: 'Age', v: `${age} ans` }, { l: 'Nationalite', v: viewClient.nationality }, { l: 'Education', v: viewClient.education || 'N/A' },
                              { l: 'Francais', v: `NCLC ${frenchNCLC}` }, { l: 'Anglais', v: `CLB ${englishCLB}` }, { l: 'Experience', v: `${workYears} ans` },
                              { l: 'Statut', v: viewClient.currentStatus }, { l: 'Situation', v: viewClient.maritalStatus }, { l: 'Dependants', v: String(viewClient.dependants) },
                            ].map(item => (
                              <div key={item.l}><span className="text-gray-400 text-xs">{item.l}</span><div className="font-semibold text-gray-900">{item.v}</div></div>
                            ))}
                          </div>
                        </div>

                        {/* ═══ PROGRAMMES ELIGIBLES ═══ */}
                        {eligible.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-green-700 uppercase mb-3 flex items-center gap-1"><CheckCircle2 size={12} /> Programmes eligibles ({eligible.length})</h4>
                            <div className="space-y-3">
                              {(() => {
                                // Priority sort: work permits first, study permits second, then by score
                                const PROGRAM_PRIORITY: Record<string, number> = {
                                  'work_permit': 1, 'work-permit-lmia': 1, 'work-permit-open': 1, 'mobilite-francophone': 1, 'pgwp': 1,
                                  'study_permit': 2, 'study-permit': 2, 'study-extension': 2,
                                  'pnp-peq': 3, 'pnp-quebec-pstq': 3,
                                  'ee-fsw': 4, 'ee-cec': 4, 'ee-fst': 4,
                                  'family-spouse': 5, 'family-parents': 5,
                                };
                                const sorted = [...eligible].sort((a, b) => {
                                  const pa = PROGRAM_PRIORITY[a.programId] || 10;
                                  const pb = PROGRAM_PRIORITY[b.programId] || 10;
                                  return pa !== pb ? pa - pb : b.score - a.score;
                                });
                                return sorted.map((p, idx) => (
                                  <div key={p.programId} className={`bg-white border-l-4 ${idx === 0 ? 'border-[#D4A03C] ring-1 ring-[#D4A03C]/20' : 'border-green-500'} rounded-r-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
                                    {idx === 0 && <div className="text-[10px] font-bold text-[#D4A03C] uppercase tracking-wider mb-2">Recommande en priorite</div>}
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-bold text-sm text-gray-900">{p.programNameFr || p.programName}</h5>
                                      <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">{ELIG_LABELS[p.eligibility]}</span>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-[#D4A03C]/10 border-2 border-[#D4A03C]' : 'bg-green-50 border-2 border-green-200'}`}>
                                          <span className={`text-xs font-black ${idx === 0 ? 'text-[#D4A03C]' : 'text-green-700'}`}>{p.score}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {p.keyStrengths.length > 0 && <div className="flex flex-wrap gap-1 mb-2">{p.keyStrengths.map((s, i) => <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded-full">+ {s}</span>)}</div>}
                                    {p.recommendations.length > 0 && <div className="text-xs text-blue-600 space-y-0.5">{p.recommendations.map((r, i) => <div key={i}>→ {r}</div>)}</div>}
                                    <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400"><span>Delai: {p.estimatedProcessingTime || 'N/A'}</span><span>Frais: {p.governmentFees ? `${p.governmentFees} $` : 'N/A'}</span></div>
                                    {/* SOS Hub CTA per program */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                                      <div className="w-5 h-5 bg-gradient-to-br from-[#D4A03C] to-[#F59E0B] rounded-full flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={10} className="text-white" />
                                      </div>
                                      <p className="text-xs text-gray-600"><strong className="text-[#1B2559]">SOS Hub Canada</strong> peut vous accompagner pour deposer votre demande de <strong>{p.programNameFr || p.programName}</strong> et maximiser vos chances d'approbation.</p>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Programmes a evaluer */}
                        {possible.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-amber-700 uppercase mb-3 flex items-center gap-1"><AlertCircle size={12} /> A evaluer ({possible.length})</h4>
                            <div className="space-y-2">
                              {possible.map(p => (
                                <div key={p.programId} className="bg-white border-l-4 border-amber-400 rounded-r-xl p-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-semibold text-sm text-gray-900">{p.programNameFr || p.programName}</h5>
                                    <span className="text-sm font-bold text-amber-600">{p.score}/100</span>
                                  </div>
                                  {p.missingRequirements.length > 0 && <div className="text-xs text-red-500 space-y-0.5">{p.missingRequirements.slice(0, 2).map((r, i) => <div key={i}>! {r}</div>)}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Non eligible collapsed */}
                        {notEligible.length > 0 && (
                          <details className="border rounded-xl bg-gray-50">
                            <summary className="p-3 cursor-pointer text-xs font-semibold text-gray-400 uppercase">Non eligible ({notEligible.length})</summary>
                            <div className="px-3 pb-3 space-y-1">{notEligible.map(p => <div key={p.programId} className="text-xs text-gray-500 py-1 border-b border-gray-100 last:border-0">{p.programNameFr || p.programName}</div>)}</div>
                          </details>
                        )}

                        {/* ═══ CRS BREAKDOWN ═══ */}
                        <div className="bg-white border rounded-xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-sm text-[#1B2559]">Score CRS detaille</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-black text-[#D4A03C]">{crs.total}</span>
                              <span className="text-xs text-gray-400">/ 1200</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {[
                              { label: 'Capital humain (age, education, langues, experience)', pts: crs.coreHumanCapital.subtotal, max: 500, color: 'bg-blue-500' },
                              { label: 'Facteurs du conjoint', pts: crs.spouseFactors.subtotal, max: 40, color: 'bg-purple-500' },
                              { label: 'Transferabilite des competences', pts: crs.skillTransferability.subtotal, max: 100, color: 'bg-emerald-500' },
                              { label: 'Facteurs additionnels (PNP, emploi, francais)', pts: crs.additional.subtotal, max: 600, color: 'bg-[#D4A03C]' },
                            ].map(item => (
                              <div key={item.label}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-gray-600">{item.label}</span>
                                  <span className="font-bold text-gray-900">{item.pts} / {item.max}</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.max > 0 ? (item.pts / item.max) * 100 : 0}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          {lastCutoff && (
                            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${crs.total >= lastCutoff.score ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {crs.total >= lastCutoff.score
                                ? `Votre score est AU-DESSUS du dernier seuil (${lastCutoff.score} pts — ${lastCutoff.program}, ${lastCutoff.date})`
                                : `Il vous manque ${lastCutoff.score - crs.total} points pour atteindre le dernier seuil (${lastCutoff.score} pts — ${lastCutoff.program}, ${lastCutoff.date})`
                              }
                            </div>
                          )}
                        </div>

                        {/* ═══ PLAN AMELIORATION (Top 3 visible, rest blurred) ═══ */}
                        <div>
                          <h4 className="font-bold text-sm text-[#1B2559] mb-3">Plan d'amelioration personnalise</h4>
                          <div className="space-y-2">
                            {crsAdvice.slice(0, 3).map((a, i) => {
                              const impactColors: Record<string, string> = { 'très_élevé': 'bg-red-500', 'élevé': 'bg-orange-500', 'moyen': 'bg-yellow-500', 'faible': 'bg-gray-400' };
                              return (
                                <div key={i} className="bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-2 h-8 rounded-full ${impactColors[a.impact] || 'bg-gray-300'}`} />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm text-gray-900">{a.category}</span>
                                        <span className="text-xs font-bold text-[#D4A03C]">+{a.maxPoints - a.currentPoints} pts</span>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-0.5">{a.advice}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {crsAdvice.length > 3 && (
                            <div className="relative mt-2">
                              <div className="space-y-2 opacity-30 blur-[2px] pointer-events-none">
                                {crsAdvice.slice(3, 5).map((a, i) => (
                                  <div key={i} className="bg-white border rounded-xl p-4">
                                    <span className="font-semibold text-sm text-gray-900">{a.category}</span>
                                    <p className="text-xs text-gray-500">{a.advice?.slice(0, 60)}...</p>
                                  </div>
                                ))}
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="px-4 py-2 bg-gradient-to-r from-[#D4A03C] to-[#F59E0B] text-white text-xs font-bold rounded-full shadow-lg">
                                  +{crsAdvice.length - 3} recommandations dans le rapport complet
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ═══ PROCHAINES ETAPES ═══ */}
                        <div className="bg-gradient-to-r from-[#F7F3E8] to-[#FEF3C7] border border-[#D4A03C]/20 rounded-xl p-5">
                          <h4 className="font-bold text-sm text-[#1B2559] mb-3">Prochaines etapes recommandees</h4>
                          <div className="space-y-2">
                            {[
                              ...(frenchNCLC < 7 ? ['Passer le TEF/TCF Canada pour atteindre NCLC 7+ (priorite haute)'] : []),
                              ...(englishCLB < 7 ? ["Passer l'IELTS pour atteindre CLB 7+"] : []),
                              ...(!profile.hasECA ? ["Obtenir l'evaluation des diplomes (ECA/WES)"] : []),
                              'Obtenir les certificats de police de chaque pays',
                              'Preparer les preuves de fonds (min. 13 757 $ pour 1 personne)',
                              'Consulter un conseiller SOS Hub pour optimiser votre dossier',
                            ].map((step, i) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-[#D4A03C] flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-white text-[10px] font-bold">{i + 1}</span>
                                </div>
                                <span className="text-sm text-gray-700">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ═══════════════════════════════════════════ */}
                        {/* CTA — CONVERSION SECTION                    */}
                        {/* ═══════════════════════════════════════════ */}
                        <div className="relative bg-gradient-to-br from-[#1B2559] via-[#242E6B] to-[#1B2559] text-white rounded-2xl p-8 overflow-hidden text-center">
                          <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <div className="absolute top-4 right-8 w-24 h-24 border-2 border-[#D4A03C] rounded-full" />
                            <div className="absolute bottom-4 left-12 w-16 h-16 border border-white/30 rounded-full" />
                          </div>
                          <div className="relative z-10">
                            <div className="inline-block px-3 py-1 bg-[#D4A03C] text-white text-[10px] font-bold rounded-full uppercase tracking-wider mb-4">
                              Ne laissez pas votre reve canadien en attente
                            </div>
                            <h3 className="text-2xl font-black mb-2">
                              Votre dossier a du potentiel.
                            </h3>
                            <p className="text-white/70 text-sm max-w-md mx-auto mb-6">
                              {eligible.length > 0
                                ? `Avec ${eligible.length} programme(s) eligible(s) et un score CRS de ${crs.total}, vous avez de reelles chances. Nos experts peuvent maximiser votre dossier et accelerer votre processus.`
                                : `Meme avec des defis, nos experts ont aide des centaines de familles dans des situations similaires. Chaque dossier a une solution — laissez-nous trouver la votre.`
                              }
                            </p>

                            <div className="bg-white/10 backdrop-blur rounded-xl p-5 mb-6 max-w-sm mx-auto">
                              <div className="text-3xl font-black text-[#D4A03C] mb-1">SOS Hub Canada</div>
                              <div className="space-y-2 text-sm text-white/80">
                                <div className="flex items-center justify-center gap-2"><MessageSquare size={14} className="text-[#25D366]" /> <strong className="text-white">WhatsApp: +1 (438) 630-2869</strong></div>
                                <div className="flex items-center justify-center gap-2"><Mail size={14} className="text-[#D4A03C]" /> <strong className="text-white">info@soshubcanada.com</strong></div>
                                <div className="text-xs text-white/50 mt-2">3737 Cremazie Est #402, Montreal QC H1Z 2K4</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-center gap-3 flex-wrap">
                              <a href="https://wa.me/14386302869" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1da851] transition-all shadow-lg shadow-[#25D366]/30 flex items-center gap-2 text-sm">
                                <MessageSquare size={16} /> WhatsApp
                              </a>
                              <a href="mailto:info@soshubcanada.com?subject=Suite analyse admissibilite - ${encodeURIComponent(viewClient.firstName + ' ' + viewClient.lastName)}" className="px-6 py-3 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 text-sm">
                                <Mail size={16} /> Envoyer un courriel
                              </a>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-6 text-[10px] text-white/40">
                              <span>500+ familles accompagnees</span>
                              <span>|</span>
                              <span>Consultation gratuite</span>
                              <span>|</span>
                              <span>Taux de reussite 94%</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[9px] text-gray-300 text-center">
                          Ce rapport est genere automatiquement a titre indicatif. Seule une consultation avec un conseiller en immigration reglemente constitue un avis officiel. SOS Hub Canada Inc.
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* ---- TAB: Notes & Suivi ---- */}
              {detailTab === 'notes' && viewClient && (
                <div>
                  {/* Legacy notes display */}
                  {viewClient.notes && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="text-xs font-semibold text-yellow-700 uppercase mb-1 flex items-center gap-1">
                        <Clock size={10} /> Note initiale
                      </h4>
                      <p className="text-sm text-gray-700">{viewClient.notes}</p>
                    </div>
                  )}
                  <NotesSection
                    entityId={viewClient.id}
                    entityType="client"
                    categories={CLIENT_NOTE_CATEGORIES}
                    storageKey="soshub_client_notes"
                    currentUser={currentUser}
                    emptyMessage="Aucune note pour ce client"
                  />
                </div>
              )}

              {/* ---- TAB: Documents (Supabase Storage) ---- */}
              {detailTab === 'documents' && (
                <div>
                  {/* Document Checklist by program */}
                  {(() => {
                    const activeCase = clientCases.find(cs => !['ferme', 'annule', 'refuse', 'approuve'].includes(cs.status));
                    if (!activeCase) return null;
                    const CHECKLIST_MAP: Record<string, string> = {
                      'pnp-peq': 'peq_travailleurs', 'ee-fsw': 'entree_express_fsw', 'ee-cec': 'entree_express_fsw',
                      'work-permit-lmia': 'permis_travail', 'work-permit-open': 'permis_travail',
                      'asile-inland': 'demande_asile', 'asile-poe': 'demande_asile',
                      'study-permit': 'permis_etudes', 'citizenship-adult': 'citoyennete',
                    };
                    const checklistKey = CHECKLIST_MAP[activeCase.programId] || activeCase.programId;
                    const checklist = getChecklistForProgram(checklistKey);
                    const allDocs = [...(viewClient.documents || []), ...clientDocs];
                    const matchDoc = (item: DocumentChecklistItem) => allDocs.find(d =>
                      (d.category === item.category && d.name?.toLowerCase().includes(item.documentType.replace('_', ' '))) ||
                      d.name?.toLowerCase().includes(item.label.toLowerCase().slice(0, 15))
                    );
                    const provided = checklist.filter(item => matchDoc(item));
                    return (
                      <div className="mb-4 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-semibold text-[#1B2559] uppercase tracking-wider flex items-center gap-1">
                            <CheckSquare size={12} className="text-[#D4A03C]" /> Checklist — {activeCase.title}
                          </h4>
                          <span className="text-xs font-bold text-blue-700">{provided.length}/{checklist.length}</span>
                        </div>
                        <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${checklist.length > 0 ? (provided.length / checklist.length) * 100 : 0}%` }} />
                        </div>
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                          {checklist.map((item, i) => {
                            const doc = matchDoc(item);
                            const isVerified = doc?.status === 'verifie';
                            const isUploaded = !!doc;
                            const isExpired = doc?.expiryDate ? new Date(doc.expiryDate) < new Date() : false;
                            return (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                {isVerified ? <CheckCircle2 size={14} className="text-green-500 shrink-0" /> :
                                 isExpired ? <AlertCircle size={14} className="text-red-500 shrink-0" /> :
                                 isUploaded ? <CheckCircle2 size={14} className="text-blue-400 shrink-0" /> :
                                 <Circle size={14} className="text-gray-300 shrink-0" />}
                                <span className={`flex-1 ${isVerified ? 'text-green-700' : isUploaded ? 'text-gray-700' : 'text-gray-400'}`}>
                                  {item.label}
                                </span>
                                {item.required && <span className="text-[9px] text-red-400 font-medium">Requis</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Government Forms Library */}
                  {(() => {
                    const clientForms = getFormsForTarget('client');
                    const filtered = govFormSearch
                      ? clientForms.filter(f => f.code.toLowerCase().includes(govFormSearch.toLowerCase()) || f.name.toLowerCase().includes(govFormSearch.toLowerCase()))
                      : clientForms;
                    return (
                      <details className="mb-4 bg-gray-50 rounded-xl border">
                        <summary className="p-3 cursor-pointer text-xs font-semibold text-[#1B2559] uppercase tracking-wider flex items-center gap-1">
                          <ExternalLink size={12} className="text-[#D4A03C]" /> Formulaires gouvernementaux ({clientForms.length})
                        </summary>
                        <div className="px-3 pb-3">
                          <input
                            value={govFormSearch} onChange={e => setGovFormSearch(e.target.value)}
                            placeholder="Rechercher par code ou nom..."
                            className="w-full px-3 py-1.5 border rounded-lg text-xs mb-2 focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]"
                          />
                          <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {filtered.map(f => (
                              <div key={f.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border">
                                <div>
                                  <span className={`font-bold ${f.category === 'ircc' ? 'text-red-700' : 'text-blue-700'}`}>{f.code}</span>
                                  <span className="text-gray-600 ml-2">{f.name}</span>
                                </div>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded ${f.category === 'ircc' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                  {f.category.toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    );
                  })()}

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#1B2559] text-sm uppercase tracking-wider flex items-center gap-2">
                      <FileText size={14} className="text-[#D4A03C]" />
                      Documents
                      {(clientDocs.length + storageDocs.length) > 0 && (
                        <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#1B2559] text-white">{clientDocs.length + storageDocs.length}</span>
                      )}
                    </h3>
                  </div>

                  {/* Upload zone */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><Tag size={12} /> Categorie</label>
                        <select
                          value={uploadCategory}
                          onChange={e => setUploadCategory(e.target.value as DocumentCategory)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/30"
                        >
                          {DOC_UPLOAD_CATEGORIES.map((cat, i) => (
                            <option key={`${cat.value}-${i}`} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><Calendar size={12} /> Expiration (optionnel)</label>
                        <input
                          type="date"
                          value={uploadExpiry}
                          onChange={e => setUploadExpiry(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/30"
                        />
                      </div>
                    </div>

                    {/* Drag and drop zone */}
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        dragOver ? 'border-[#D4A03C] bg-[#F7F3E8]' : 'border-gray-300 hover:border-[#D4A03C]'
                      }`}
                    >
                      <Upload size={28} className={`mx-auto mb-2 ${dragOver ? 'text-[#D4A03C]' : 'text-gray-400'}`} />
                      <p className="text-sm text-gray-500">Glissez-deposez vos fichiers ici</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, WebP \u2014 max 10 MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      multiple
                      className="hidden"
                      onChange={e => { if (e.target.files) handleFileUpload(e.target.files); e.target.value = ''; }}
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full px-4 py-2 bg-[#1B2559] text-white rounded-lg text-sm font-medium hover:bg-[#2a3a7c] transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Upload size={14} />
                      {uploading ? 'Televersement en cours...' : 'Televerser un document'}
                    </button>
                  </div>

                  {/* Document list - from Supabase Storage */}
                  {storageDocs.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium">Fichiers (Supabase Storage)</h4>
                      {storageDocs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-[#EAEDF5] flex items-center justify-center shrink-0">
                              <FileText size={14} className="text-[#1B2559]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                              {doc.created_at && <div className="text-xs text-gray-400">{formatDateFr(doc.created_at.split('T')[0])}</div>}
                            </div>
                          </div>
                          <button
                            onClick={() => removeDoc(doc.id, doc.name)}
                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Document list - from document service */}
                  {clientDocs.length > 0 && (
                    <div className="space-y-2">
                      {clientDocs.map(doc => {
                        const statusInfo = DOC_DISPLAY_STATUS[doc.status || 'televerse'] || DOC_DISPLAY_STATUS.televerse;
                        const isExpired = doc.expiryDate ? new Date(doc.expiryDate) < new Date() : false;
                        const displayStatus = isExpired ? DOC_DISPLAY_STATUS.expire : statusInfo;
                        return (
                          <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-[#EAEDF5] flex items-center justify-center shrink-0">
                                <FileText size={14} className="text-[#1B2559]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 truncate">{doc.fileName || doc.name}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                  <span>{DOC_UPLOAD_CATEGORIES.find(c => c.value === doc.category)?.label || DOCUMENT_CATEGORY_LABELS[doc.category || 'autre']}</span>
                                  {doc.fileSize && <span>- {formatFileSize(doc.fileSize)}</span>}
                                  {doc.expiryDate && <span>- Exp: {doc.expiryDate}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${displayStatus.color}`}>
                                {displayStatus.label}
                              </span>
                              <button
                                onClick={() => removeDoc(doc.id)}
                                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {clientDocs.length === 0 && storageDocs.length === 0 && (
                    <div className="text-center py-4">
                      <AlertCircle size={20} className="mx-auto text-gray-300 mb-1" />
                      <p className="text-sm text-gray-400">Aucun document televerse</p>
                    </div>
                  )}
                </div>
              )}

              {/* ---- TAB: Dossiers (enrichi avec pipeline, forms, timeline) ---- */}
              {detailTab === 'dossiers' && (
                <div>
                  {(() => {
                    const PIPELINE_STEPS = ['nouveau', 'consultation', 'en_preparation', 'formulaires_remplis', 'revision', 'soumis', 'en_traitement_ircc', 'approuve'] as const;
                    const STEP_ICONS: Record<string, string> = {
                      nouveau: '📋', consultation: '💬', en_preparation: '📝', formulaires_remplis: '📄',
                      revision: '🔍', soumis: '📤', en_traitement_ircc: '🏛️', approuve: '✅',
                    };
                    const FORM_STATUS_COLORS_LOCAL: Record<string, string> = {
                      vide: 'bg-gray-100 text-gray-600', en_cours: 'bg-amber-100 text-amber-700',
                      rempli: 'bg-blue-100 text-blue-700', revise: 'bg-blue-100 text-blue-700',
                      approuve: 'bg-green-100 text-green-700', signe: 'bg-emerald-100 text-emerald-700',
                    };

                    const expandedCase = expandedCaseId ? clientCases.find(cs => cs.id === expandedCaseId) : null;

                    if (expandedCase) {
                      const program = IMMIGRATION_PROGRAMS.find(p => p.id === expandedCase.programId);
                      const stepIdx = PIPELINE_STEPS.indexOf(expandedCase.status as typeof PIPELINE_STEPS[number]);
                      const completedForms = expandedCase.forms.filter(f => ['rempli', 'revise', 'approuve', 'signe'].includes(f.status)).length;
                      const formPct = expandedCase.forms.length > 0 ? Math.round((completedForms / expandedCase.forms.length) * 100) : 0;
                      const isOverdue = expandedCase.deadline && new Date(expandedCase.deadline) < new Date();

                      return (
                        <div>
                          {/* Back button */}
                          <button onClick={() => setExpandedCaseId(null)} className="flex items-center gap-1 text-sm text-[#D4A03C] hover:underline mb-3">
                            <ChevronLeft size={14} /> Retour aux dossiers
                          </button>

                          {/* Case header */}
                          <div className="bg-[#1B2559] text-white rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{expandedCase.title}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CASE_STATUS_COLORS_INLINE[expandedCase.status] || 'bg-white/20 text-white'}`}>
                                {CASE_STATUS_LABELS_INLINE[expandedCase.status] || expandedCase.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                              <div>Programme: <span className="text-white font-medium">{program?.name || expandedCase.programId}</span></div>
                              <div>Conseiller: <span className="text-white font-medium">{getUserName(expandedCase.assignedTo)}</span></div>
                              {expandedCase.deadline && (
                                <div className={isOverdue ? 'text-red-300' : ''}>Echeance: <span className="font-medium">{formatDateFr(expandedCase.deadline)}</span>{isOverdue && ' ⚠️'}</div>
                              )}
                              {expandedCase.uciNumber && <div>UCI: <span className="text-white font-medium">{expandedCase.uciNumber}</span></div>}
                              {expandedCase.irccAppNumber && <div>IRCC#: <span className="text-white font-medium">{expandedCase.irccAppNumber}</span></div>}
                            </div>
                          </div>

                          {/* Pipeline 8 steps */}
                          <div className="mb-4">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Progression</h5>
                            <div className="flex items-center gap-1">
                              {PIPELINE_STEPS.map((step, i) => {
                                const isDone = i <= stepIdx;
                                const isCurrent = i === stepIdx;
                                return (
                                  <div key={step} className="flex-1 flex flex-col items-center">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1 ${
                                      isCurrent ? 'bg-[#D4A03C] text-white ring-2 ring-[#D4A03C]/30 scale-110' :
                                      isDone ? 'bg-[#1B2559] text-white' : 'bg-gray-200 text-gray-400'
                                    }`}>
                                      {STEP_ICONS[step] || (i + 1)}
                                    </div>
                                    <span className={`text-[8px] text-center leading-tight ${isCurrent ? 'text-[#D4A03C] font-bold' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                                      {CASE_STATUS_LABELS_INLINE[step]?.replace('En ', '').replace('traitement ', 'trait. ') || step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-[#D4A03C] rounded-full transition-all" style={{ width: `${Math.max(5, ((stepIdx + 1) / PIPELINE_STEPS.length) * 100)}%` }} />
                            </div>
                          </div>

                          {/* Forms status */}
                          {expandedCase.forms.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                <FileText size={12} /> Formulaires ({completedForms}/{expandedCase.forms.length}) — {formPct}%
                              </h5>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${formPct}%` }} />
                              </div>
                              <div className="space-y-1.5">
                                {expandedCase.forms.map(f => (
                                  <div key={f.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                                    <span className="font-medium text-gray-700">{f.formId.toUpperCase()}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${FORM_STATUS_COLORS_LOCAL[f.status] || 'bg-gray-100 text-gray-600'}`}>
                                      {FORM_STATUS_LABELS[f.status] || f.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timeline */}
                          {expandedCase.timeline.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                <Activity size={12} /> Historique
                              </h5>
                              <div className="space-y-2">
                                {[...expandedCase.timeline].reverse().map(ev => (
                                  <div key={ev.id} className="flex gap-3 text-xs">
                                    <div className="flex flex-col items-center">
                                      <div className="w-2 h-2 rounded-full bg-[#D4A03C] mt-1" />
                                      <div className="w-px flex-1 bg-gray-200" />
                                    </div>
                                    <div className="pb-3">
                                      <div className="text-gray-400">{formatDateFr(ev.date)} — {getUserName(ev.userId)}</div>
                                      <div className="text-gray-700">{ev.description}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // List view (default)
                    return (
                      <>
                        <h3 className="font-semibold text-[#1B2559] mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                          <FolderOpen size={14} className="text-[#D4A03C]" /> Dossiers lies
                        </h3>
                        {clientCases.length > 0 ? (
                          <div className="space-y-3">
                            {clientCases.map(cs => {
                              const completedF = cs.forms.filter(f => ['rempli', 'revise', 'approuve', 'signe'].includes(f.status)).length;
                              const pct = cs.forms.length > 0 ? Math.round((completedF / cs.forms.length) * 100) : 0;
                              return (
                                <button
                                  key={cs.id}
                                  onClick={() => setExpandedCaseId(cs.id)}
                                  className="block w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#D4A03C]/30 transition-all"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900 text-sm">{cs.title}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CASE_STATUS_COLORS_INLINE[cs.status] || 'bg-gray-100 text-gray-600'}`}>
                                      {CASE_STATUS_LABELS_INLINE[cs.status] || cs.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                    <span className="flex items-center gap-1"><FolderOpen size={12} /> {IMMIGRATION_PROGRAMS.find(p => p.id === cs.programId)?.name?.slice(0, 30) || cs.programId}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                      cs.priority === 'haute' || cs.priority === 'urgente' ? 'bg-red-100 text-red-700' :
                                      cs.priority === 'normale' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                    }`}>{cs.priority}</span>
                                    {cs.deadline && <span className="flex items-center gap-1"><Clock size={12} /> {formatDateFr(cs.deadline)}</span>}
                                  </div>
                                  {cs.forms.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                      <span className="text-[10px] text-gray-400">{pct}%</span>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FolderOpen size={24} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-400">Aucun dossier lie a ce client</p>
                            <a href="/crm/dossiers" className="inline-block mt-3 text-sm text-[#D4A03C] font-medium hover:underline">
                              Ouvrir les dossiers
                            </a>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* ---- TAB: Rendez-vous ---- */}
              {detailTab === 'rdv' && (
                <div>
                  <h3 className="font-semibold text-[#1B2559] mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={14} className="text-[#D4A03C]" /> Rendez-vous
                  </h3>
                  {(() => {
                    const clientAppts = appointments
                      .filter(a => a.clientId === viewClient.id)
                      .sort((a, b) => {
                        const da = new Date(`${a.date}T${a.time}`);
                        const db = new Date(`${b.date}T${b.time}`);
                        return db.getTime() - da.getTime();
                      });

                    if (clientAppts.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Calendar size={24} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-sm text-gray-400">Aucun rendez-vous pour ce client</p>
                        </div>
                      );
                    }

                    const now = new Date();
                    return (
                      <div className="space-y-2">
                        {clientAppts.map(appt => {
                          const apptDate = new Date(`${appt.date}T${appt.time}`);
                          const isPast = apptDate < now;
                          const typeColor = APPOINTMENT_TYPE_COLORS[appt.type as AppointmentType] || 'bg-gray-100 text-gray-700 border-gray-200';
                          return (
                            <div key={appt.id} className={`border rounded-xl p-3 transition-all ${isPast ? 'opacity-50 bg-gray-50' : 'bg-white hover:shadow-sm'}`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <h4 className="font-medium text-sm text-gray-900">{appt.title}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColor}`}>
                                  {APPOINTMENT_TYPE_LABELS[appt.type as AppointmentType] || appt.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} /> {formatDateFr(appt.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={11} /> {appt.time} ({appt.duration} min)
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users size={11} /> {getUserName(appt.userId)}
                                </span>
                              </div>
                              {appt.notes && (
                                <p className="text-xs text-gray-400 mt-1.5 italic">{appt.notes}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ---- TAB: Contrats ---- */}
              {detailTab === 'contrats' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#1B2559] text-sm uppercase tracking-wider flex items-center gap-2">
                      <FileCheck size={14} className="text-[#D4A03C]" /> Contrats
                    </h3>
                    <a
                      href="/crm/contrats"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A03C] text-white rounded-lg text-xs font-medium hover:bg-[#B8892F] transition-colors"
                    >
                      <Plus size={12} /> Nouveau contrat
                    </a>
                  </div>
                  {clientContracts.length > 0 ? (
                    <div className="space-y-3">
                      {clientContracts.map(ct => (
                        <div key={ct.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">Contrat #{ct.id.slice(0, 8)}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONTRACT_STATUS_COLORS[ct.status] || 'bg-gray-100 text-gray-600'}`}>
                              {CONTRACT_STATUS_LABELS[ct.status] || ct.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Programme: {ct.pricingTierId || 'N/A'}</span>
                            <span>Total: {ct.grandTotal?.toFixed(2)} $</span>
                            <span>{formatDateFr(ct.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileCheck size={24} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">Aucun contrat lie a ce client</p>
                    </div>
                  )}
                </div>
              )}

              {/* ---- TAB: Acces portail ---- */}
              {detailTab === 'courriels' && viewClient && (
                <ClientEmailHistory clientId={viewClient.id} clientEmail={viewClient.email} />
              )}

              {detailTab === 'portail' && (
                <div>
                  <h3 className="font-semibold text-[#1B2559] mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <KeyRound size={14} className="text-[#D4A03C]" /> Acces portail client
                  </h3>

                  {portalLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={24} className="text-[#D4A03C] animate-spin" />
                      <span className="ml-2 text-sm text-gray-500">Chargement...</span>
                    </div>
                  ) : portalAccess ? (
                    <div className="space-y-4">
                      {/* Portal status card */}
                      <div className={`rounded-xl p-4 border ${
                        portalAccess.status === 'active' ? 'bg-green-50 border-green-200' :
                        portalAccess.status === 'invited' ? 'bg-blue-50 border-blue-200' :
                        'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            portalAccess.status === 'active' ? 'bg-green-500' :
                            portalAccess.status === 'invited' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-semibold text-sm">
                            {portalAccess.status === 'active' ? 'Acces actif' :
                             portalAccess.status === 'invited' ? 'Invitation envoyee' :
                             'Acces revoque'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-gray-500">Courriel:</span><br/><span className="font-medium">{portalAccess.email}</span></div>
                          <div><span className="text-gray-500">Date de creation:</span><br/><span className="font-medium">{formatDateFr(portalAccess.created_at?.split('T')[0])}</span></div>
                          {portalAccess.last_login && (
                            <div><span className="text-gray-500">Derniere connexion:</span><br/><span className="font-medium">{formatDateFr(portalAccess.last_login?.split('T')[0])}</span></div>
                          )}
                        </div>
                      </div>

                      {/* Actions based on status */}
                      {portalAccess.status === 'revoked' && (
                        <button
                          onClick={reactivatePortal}
                          disabled={portalSending}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D4A03C] text-white rounded-lg text-sm font-medium hover:bg-[#B8892F] transition disabled:opacity-50"
                        >
                          {portalSending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                          Reactiver l&apos;acces portail
                        </button>
                      )}

                      {portalAccess.status === 'active' && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Permissions</h4>
                          <div className="space-y-2">
                            {['voir_dossiers', 'televerser_documents', 'voir_rendez_vous'].map(perm => (
                              <div key={perm} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">
                                  {perm === 'voir_dossiers' ? 'Voir ses dossiers' :
                                   perm === 'televerser_documents' ? 'Televerser des documents' :
                                   'Voir ses rendez-vous'}
                                </span>
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-4">
                      <KeyRound size={32} className="mx-auto text-gray-300" />
                      <p className="text-sm text-gray-500">Ce client n&apos;a pas encore d&apos;acces au portail.</p>
                      <button
                        onClick={sendPortalInvite}
                        disabled={portalSending}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4A03C] text-white rounded-lg text-sm font-medium hover:bg-[#B8892F] transition disabled:opacity-50"
                      >
                        {portalSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Envoyer acces portail
                      </button>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      )}

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlus size={20} className="text-[#D4A03C]" />
                {editMode ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Photo du client */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[#EAEDF5] to-[#d5daf0] text-[#1B2559] flex items-center justify-center text-2xl font-bold overflow-hidden cursor-pointer relative group ring-2 ring-gray-100 shadow-md"
                  onClick={() => modalPhotoInputRef.current?.click()}
                >
                  {formPhoto ? (
                    <img src={formPhoto} alt="Photo du client" className="w-full h-full object-cover" />
                  ) : formData.firstName && formData.lastName ? (
                    <>{formData.firstName[0]}{formData.lastName[0]}</>
                  ) : (
                    <Camera size={24} className="text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => modalPhotoInputRef.current?.click()}
                  className="text-xs text-[#D4A03C] font-medium hover:underline"
                >
                  {formPhoto ? 'Changer la photo' : 'Ajouter une photo'}
                </button>
                <input
                  ref={modalPhotoInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) { handlePhotoUpload(e.target.files[0]); } e.target.value = ''; }}
                />
              </div>

              {/* Informations personnelles */}
              <div>
                <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Users size={14} className="text-[#D4A03C]" /> Informations personnelles
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input value={formData.firstName || ''} onChange={e => up('firstName', e.target.value)} placeholder="Prenom *" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input value={formData.lastName || ''} onChange={e => up('lastName', e.target.value)} placeholder="Nom de famille *" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input value={formData.email || ''} onChange={e => up('email', e.target.value)} placeholder="Courriel *" type="email" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input value={formData.phone || ''} onChange={e => up('phone', e.target.value)} placeholder="Telephone" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <div><label className="text-xs text-gray-500">Date de naissance</label><input value={formData.dateOfBirth || ''} onChange={e => up('dateOfBirth', e.target.value)} type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                  <input value={formData.nationality || ''} onChange={e => up('nationality', e.target.value)} placeholder="Nationalite" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <select value={formData.maritalStatus || ''} onChange={e => up('maritalStatus', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Etat civil</option>
                    <option value="Celibataire">Celibataire</option><option value="Marie">Marie(e)</option>
                    <option value="Conjoint de fait">Conjoint(e) de fait</option><option value="Divorce">Divorce(e)</option>
                    <option value="Separe">Separe(e)</option><option value="Veuf">Veuf/Veuve</option>
                  </select>
                  <div>
                    <label className="text-xs text-gray-500">Personnes a charge</label>
                    <input type="number" min={0} value={formData.dependants ?? 0} onChange={e => up('dependants', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              {/* Immigration */}
              <div>
                <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Shield size={14} className="text-[#D4A03C]" /> Immigration
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <select value={formData.currentCountry || ''} onChange={e => up('currentCountry', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Pays actuel</option><option value="Canada">Canada</option>
                    <option value="autre">Autre pays (a l&apos;etranger)</option>
                  </select>
                  <select value={formData.currentStatus || ''} onChange={e => up('currentStatus', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Statut actuel</option>
                    {Object.entries(IMMIGRATION_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <input value={formData.passportNumber || ''} onChange={e => up('passportNumber', e.target.value)} placeholder="Numero de passeport" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <div><label className="text-xs text-gray-500">Expiration passeport</label><input value={formData.passportExpiry || ''} onChange={e => up('passportExpiry', e.target.value)} type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                  <input value={formData.numeroUCI || ''} onChange={e => up('numeroUCI', e.target.value)} placeholder="Numero UCI (IRCC)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input value={formData.numeroDossierIRCC || ''} onChange={e => up('numeroDossierIRCC', e.target.value)} placeholder="Numero de dossier IRCC" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <div><label className="text-xs text-gray-500">Expiration du statut actuel</label><input value={formData.dateExpirationStatut || ''} onChange={e => up('dateExpirationStatut', e.target.value)} type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                  <div>
                    <label className="text-xs text-gray-500">Programme d&apos;interet principal</label>
                    <select value={formData.programmeInteret || ''} onChange={e => up('programmeInteret', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option value="">Selectionner...</option>
                      {PROGRAMME_INTERET_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Langues */}
              <div>
                <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider">Langues</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input value={formData.languageEnglish || ''} onChange={e => up('languageEnglish', e.target.value)} placeholder="Niveau anglais (ex: CLB 7)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input value={formData.languageFrench || ''} onChange={e => up('languageFrench', e.target.value)} placeholder="Niveau francais (ex: NCLC 8)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>

              {/* Education et emploi */}
              <div>
                <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider">Education et emploi</h3>
                <div className="grid grid-cols-1 gap-3">
                  <input value={formData.education || ''} onChange={e => up('education', e.target.value)} placeholder="Plus haut niveau d'education" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input value={formData.workExperience || ''} onChange={e => up('workExperience', e.target.value)} placeholder="Experience de travail" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>

              {/* Adresse */}
              <div>
                <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider">Adresse</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input value={formData.address || ''} onChange={e => up('address', e.target.value)} placeholder="Adresse" className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input value={formData.city || ''} onChange={e => up('city', e.target.value)} placeholder="Ville" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <div className="flex gap-2">
                    <input value={formData.province || ''} onChange={e => up('province', e.target.value)} placeholder="Province" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input value={formData.postalCode || ''} onChange={e => up('postalCode', e.target.value)} placeholder="Code postal" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              {/* Suivi CRM */}
              <div>
                <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                  <PhoneCall size={14} className="text-[#D4A03C]" /> Suivi CRM
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Date d&apos;inscription</label>
                    <input value={formData.dateInscription || ''} onChange={e => up('dateInscription', e.target.value)} type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <select value={formData.status || 'prospect'} onChange={e => up('status', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    {Object.entries(CLIENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <select value={formData.source || ''} onChange={e => up('source', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Source d&apos;acquisition</option>
                    {Object.entries(CLIENT_SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <input value={formData.referePar || ''} onChange={e => up('referePar', e.target.value)} placeholder="Refere par (optionnel)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <select value={formData.priorite || ''} onChange={e => up('priorite', e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Priorite</option>
                    {Object.entries(CLIENT_PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <div>
                    <label className="text-xs text-gray-500">Dernier contact</label>
                    <input value={formData.dateDernierContact || ''} onChange={e => up('dateDernierContact', e.target.value)} type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Prochaine relance</label>
                    <input value={formData.prochaineRelance || ''} onChange={e => up('prochaineRelance', e.target.value)} type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Agent assigne</label>
                    <select value={formData.assignedTo || ''} onChange={e => up('assignedTo', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Consentements */}
              <div>
                <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare size={14} className="text-[#D4A03C]" /> Consentements
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input type="checkbox" checked={formData.consentementCommunication || false} onChange={e => up('consentementCommunication', e.target.checked)} className="rounded border-gray-300 text-[#D4A03C] focus:ring-[#D4A03C]" />
                    Communication
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input type="checkbox" checked={formData.consentementPartage || false} onChange={e => up('consentementPartage', e.target.checked)} className="rounded border-gray-300 text-[#D4A03C] focus:ring-[#D4A03C]" />
                    Partage de donnees
                  </label>
                  <div>
                    <label className="text-xs text-gray-500">Date du consentement</label>
                    <input value={formData.dateConsentement || ''} onChange={e => up('dateConsentement', e.target.value)} type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              {/* Famille */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#1B2559] text-sm uppercase tracking-wider">Membres de la famille</h3>
                  <button onClick={addFamilyMember} className="text-xs text-[#D4A03C] font-medium flex items-center gap-1"><Plus size={14} /> Ajouter</button>
                </div>
                {(formData.familyMembers || []).map((fm, idx) => (
                  <div key={fm.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500">Membre {idx + 1}</span>
                      <button onClick={() => removeFM(idx)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <select value={fm.relationship} onChange={e => updateFM(idx, 'relationship', e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded text-xs">
                        <option value="">Lien</option><option value="Epouse">Epouse</option><option value="Epoux">Epoux</option>
                        <option value="Fils">Fils</option><option value="Fille">Fille</option><option value="Pere">Pere</option>
                        <option value="Mere">Mere</option><option value="Frere">Frere</option><option value="Soeur">Soeur</option>
                      </select>
                      <input value={fm.firstName} onChange={e => updateFM(idx, 'firstName', e.target.value)} placeholder="Prenom" className="px-2 py-1.5 border border-gray-200 rounded text-xs" />
                      <input value={fm.lastName} onChange={e => updateFM(idx, 'lastName', e.target.value)} placeholder="Nom" className="px-2 py-1.5 border border-gray-200 rounded text-xs" />
                      <input value={fm.dateOfBirth} onChange={e => updateFM(idx, 'dateOfBirth', e.target.value)} type="date" className="px-2 py-1.5 border border-gray-200 rounded text-xs" />
                      <input value={fm.nationality} onChange={e => updateFM(idx, 'nationality', e.target.value)} placeholder="Nationalite" className="px-2 py-1.5 border border-gray-200 rounded text-xs" />
                      <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={fm.accompany} onChange={e => updateFM(idx, 'accompany', e.target.checked)} /> Accompagne
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-semibold text-[#1B2559] mb-3 text-sm uppercase tracking-wider">Notes</h3>
                <textarea value={formData.notes || ''} onChange={e => up('notes', e.target.value)} rows={3} placeholder="Notes sur le client..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg text-sm">Annuler</button>
              <button onClick={saveClient} className="px-4 py-2 bg-[#D4A03C] text-white rounded-lg text-sm font-medium hover:bg-[#B8892F]">
                {editMode ? 'Enregistrer les modifications' : 'Creer le client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        existingClients={clients}
        currentUserId={currentUser.id}
        onImportComplete={handleImportComplete}
      />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
