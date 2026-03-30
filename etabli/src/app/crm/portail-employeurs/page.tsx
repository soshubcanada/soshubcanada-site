"use client";
// Portail Employeurs v4.0 - Build 408f28c - CRUD + Search/Filter + Status + Archive
import { useState, useRef, useEffect } from "react";
import { crmFetch } from '@/lib/crm-fetch';
import { useCrm } from "@/lib/crm-store";
import {
  ROLE_PERMISSIONS,
  EMPLOYER_DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_STATUS_LABELS, DOCUMENT_STATUS_COLORS,
  ALLOWED_MIME_TYPES, MAX_FILE_SIZE,
} from "@/lib/crm-types";
import type { EmployerDocument, EmployerDocumentCategory, DocumentStatus } from "@/lib/crm-types";
import {
  DEMO_EMPLOYERS,
  EMPLOYER_STATUS_LABELS,
  EMPLOYER_STATUS_COLORS,
  LMIA_STATUS_LABELS,
  LMIA_STATUS_COLORS,
  CREDENTIAL_PLATFORMS,
  LMIA_FORMS,
  MIFI_FORMS,
  autoFillEmployerForm,
} from "@/lib/crm-employers";
import type { Employer, LmiaApplication, LmiaFormField } from "@/lib/crm-employers";
import { EMPLOYER_LMIA_CHECKLIST, getFormsForTarget } from "@/lib/document-checklists";
import { uploadEmployerDocument } from "@/lib/document-service";
import {
  Building2, ArrowLeft, Eye, EyeOff, Plus, FileText, DollarSign,
  Users, KeyRound, TrendingUp, TrendingDown, ShieldX, ClipboardList,
  MapPin, Phone, Mail, Globe, Calendar, Hash, Factory, Briefcase,
  ChevronDown, ChevronUp, CheckCircle2, Clock, AlertCircle, Lock,
  Upload, Trash2, Search, ExternalLink, ShieldCheck, Send, Loader2, Camera,
  Pencil, Check, X, Archive, Filter, SortAsc, MessageSquare, Star, Tag,
} from "lucide-react";

type Tab = "apercu" | "financier" | "documents" | "lmia" | "formulaires" | "credentials";
type SortOption = "name_asc" | "date_desc" | "employees_desc";

const LOGOS_STORAGE_KEY = 'soshub_employer_logos';
const EMPLOYER_EDITS_STORAGE_KEY = 'soshub_employer_edits';
import NotesSection, { EMPLOYER_NOTE_CATEGORIES } from "@/components/NotesSection";
const EMPLOYERS_STORAGE_KEY = 'soshub_employers_list';
const LOGO_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const LOGO_MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface EditableEmployerFields {
  companyName: string;
  companyNameLegal: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  industry: string;
  nombreEmployes: number;
  dateIncorporation: string;
  naicsCode: string;
  neq: string;
  bnFederal: string;
  cnesst: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactTitle: string;
}

interface NewEmployerForm {
  companyName: string;
  companyNameLegal: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  industry: string;
  nombreEmployes: string;
  dateIncorporation: string;
  neq: string;
  bnFederal: string;
  cnesst: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactTitle: string;
}

const EMPTY_NEW_EMPLOYER: NewEmployerForm = {
  companyName: "",
  companyNameLegal: "",
  address: "",
  city: "",
  province: "Québec",
  postalCode: "",
  phone: "",
  email: "",
  website: "",
  industry: "",
  nombreEmployes: "",
  dateIncorporation: "",
  neq: "",
  bnFederal: "",
  cnesst: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  contactTitle: "",
};

export default function PortailEmployeursPage() {
  const { currentUser } = useCrm();
  const [employers, setEmployers] = useState<Employer[]>(DEMO_EMPLOYERS);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("apercu");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [expandedLmia, setExpandedLmia] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [empDocs, setEmpDocs] = useState<EmployerDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCat, setUploadCat] = useState<EmployerDocumentCategory>("incorporation");
  const [dragOver, setDragOver] = useState(false);
  const [formSearch, setFormSearch] = useState("");
  const empFileRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const detailLogoInputRef = useRef<HTMLInputElement>(null);

  const [employerLogos, setEmployerLogos] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState<EditableEmployerFields | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New CRUD state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployer, setNewEmployer] = useState<NewEmployerForm>(EMPTY_NEW_EMPLOYER);
  const [addMessage, setAddMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Search/Filter/Sort state
  const [listSearch, setListSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [sortOption, setSortOption] = useState<SortOption>("name_asc");

  // Load employers from localStorage + fetch leads from CRM API
  useEffect(() => {
    // 1. Load from localStorage
    let localEmployers: Employer[] = [];
    try {
      const stored = localStorage.getItem(EMPLOYERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Employer[];
        const demoIds = new Set(DEMO_EMPLOYERS.map(e => e.id));
        const extras = parsed.filter((e: Employer) => !demoIds.has(e.id));
        const statusOverrides: Record<string, Employer['status']> = {};
        parsed.forEach((e: Employer) => { if (demoIds.has(e.id)) statusOverrides[e.id] = e.status; });
        const merged = DEMO_EMPLOYERS.map(e => statusOverrides[e.id] ? { ...e, status: statusOverrides[e.id] } : e);
        localEmployers = [...merged, ...extras];
      }
    } catch { /* ignore */ }

    // 2. Fetch employer leads from CRM API
    const fetchLeads = async () => {
      try {
        const res = await crmFetch('/api/crm/leads?status=new');
        if (!res.ok) return;
        const leads = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const employerLeads = (Array.isArray(leads) ? leads : []).filter((l: any) =>
          l.source === 'employeurs' || l.subject?.toLowerCase().includes('employeur')
        );

        // Convert leads to Employer prospects (avoid duplicates by email)
        const existingEmails = new Set([
          ...DEMO_EMPLOYERS.map(e => e.email.toLowerCase()),
          ...localEmployers.map(e => e.email.toLowerCase()),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newProspects: Employer[] = employerLeads
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((l: any) => l.email && !existingEmails.has(l.email.toLowerCase()))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((l: any) => {
            const fd = l.form_data || {};
            const nameParts = (l.name || '').split(' ');
            return {
              id: `lead-${l.id}`,
              companyName: fd.company || l.subject?.replace('Dossier employeur — ', '') || 'Entreprise (à compléter)',
              companyNameLegal: '',
              neq: '', bnFederal: '', naicsCode: '', naicsDescription: '',
              industry: fd.sector || '',
              address: '', city: '', province: 'Québec', postalCode: '',
              phone: l.phone || '',
              email: l.email || '',
              website: '',
              contactName: l.name || '',
              contactTitle: '',
              contactPhone: l.phone || '',
              contactEmail: l.email || '',
              dateIncorporation: '',
              nombreEmployes: parseInt(fd.positions_count) || 0,
              nombreEmployesTempo: 0,
              syndicat: false,
              conventionCollective: '',
              cnesst: '', revenuQuebec: '', tpsGst: '',
              status: 'prospect' as const,
              assignedTo: '',
              createdAt: l.created_at || new Date().toISOString(),
              updatedAt: l.created_at || new Date().toISOString(),
              notes: `═══ LEAD SITE WEB ═══\nDate: ${new Date(l.created_at).toLocaleDateString('fr-CA')}\nSource: ${l.source}\n${l.message ? `Message: ${l.message}\n` : ''}${fd.description ? `Description: ${fd.description}\n` : ''}Secteur: ${fd.sector || 'N/A'}\nPostes: ${fd.positions_count || 'N/A'}`,
              financials: [],
              credentials: [],
              lmiaApplications: [],
            } as Employer;
          });

        if (newProspects.length > 0 || localEmployers.length > 0) {
          const final = localEmployers.length > 0
            ? [...localEmployers, ...newProspects]
            : [...DEMO_EMPLOYERS, ...newProspects];
          setEmployers(final);
        }
      } catch { /* API not available — use local data only */ }
    };

    if (localEmployers.length > 0) {
      setEmployers(localEmployers);
    }
    fetchLeads();
  }, []);

  // Persist employers to localStorage on change
  const persistEmployers = (list: Employer[]) => {
    setEmployers(list);
    try { localStorage.setItem(EMPLOYERS_STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOGOS_STORAGE_KEY);
      if (stored) setEmployerLogos(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveEmployerLogo = (employerId: string, base64: string) => {
    const updated = { ...employerLogos, [employerId]: base64 };
    setEmployerLogos(updated);
    try { localStorage.setItem(LOGOS_STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const handleLogoUpload = (file: File, employerId: string) => {
    if (!LOGO_ALLOWED_TYPES.includes(file.type)) {
      alert('Format non supporté. JPG, PNG, WebP ou SVG seulement.');
      return;
    }
    if (file.size > LOGO_MAX_SIZE) {
      alert('Logo trop volumineux (max 5 Mo)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      saveEmployerLogo(employerId, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (emp: Employer) => {
    setEditFields({
      companyName: emp.companyName,
      companyNameLegal: emp.companyNameLegal,
      address: `${emp.address}, ${emp.city}, ${emp.province} ${emp.postalCode}`,
      city: emp.city,
      province: emp.province,
      postalCode: emp.postalCode,
      phone: emp.phone,
      email: emp.email,
      website: emp.website,
      industry: emp.industry,
      nombreEmployes: emp.nombreEmployes,
      dateIncorporation: emp.dateIncorporation,
      naicsCode: emp.naicsCode,
      neq: emp.neq,
      bnFederal: emp.bnFederal,
      cnesst: emp.cnesst,
      contactName: emp.contactName,
      contactPhone: emp.contactPhone,
      contactEmail: emp.contactEmail,
      contactTitle: emp.contactTitle,
    });
    setEditMode(true);
    setEditMessage(null);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditFields(null);
    setEditMessage(null);
  };

  const saveEdit = async () => {
    if (!editFields || !selectedEmployer) return;
    setEditSaving(true);
    setEditMessage(null);
    try {
      // Attempt Supabase save
      const res = await crmFetch('/api/crm/employer-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedEmployer.id, ...editFields }),
      });
      if (res.ok) {
        // Update local state
        const updated: Employer = {
          ...selectedEmployer,
          companyName: editFields.companyName,
          companyNameLegal: editFields.companyNameLegal,
          phone: editFields.phone,
          email: editFields.email,
          website: editFields.website,
          industry: editFields.industry,
          nombreEmployes: editFields.nombreEmployes,
          dateIncorporation: editFields.dateIncorporation,
          naicsCode: editFields.naicsCode,
          neq: editFields.neq,
          bnFederal: editFields.bnFederal,
          cnesst: editFields.cnesst,
          contactName: editFields.contactName,
          contactPhone: editFields.contactPhone,
          contactEmail: editFields.contactEmail,
          contactTitle: editFields.contactTitle,
        };
        setSelectedEmployer(updated);
        persistEmployers(employers.map(e => e.id === updated.id ? updated : e));
        setEditMode(false);
        setEditFields(null);
        setEditMessage({ type: 'success', text: 'Modifications enregistrées avec succès.' });
        setTimeout(() => setEditMessage(null), 4000);
      } else {
        throw new Error('API error');
      }
    } catch {
      // Fallback: save to localStorage
      try {
        const storageKey = `${EMPLOYER_EDITS_STORAGE_KEY}_${selectedEmployer.id}`;
        localStorage.setItem(storageKey, JSON.stringify(editFields));
        const updated: Employer = {
          ...selectedEmployer,
          companyName: editFields.companyName,
          companyNameLegal: editFields.companyNameLegal,
          phone: editFields.phone,
          email: editFields.email,
          website: editFields.website,
          industry: editFields.industry,
          nombreEmployes: editFields.nombreEmployes,
          dateIncorporation: editFields.dateIncorporation,
          naicsCode: editFields.naicsCode,
          neq: editFields.neq,
          bnFederal: editFields.bnFederal,
          cnesst: editFields.cnesst,
          contactName: editFields.contactName,
          contactPhone: editFields.contactPhone,
          contactEmail: editFields.contactEmail,
          contactTitle: editFields.contactTitle,
        };
        setSelectedEmployer(updated);
        persistEmployers(employers.map(e => e.id === updated.id ? updated : e));
        setEditMode(false);
        setEditFields(null);
        setEditMessage({ type: 'success', text: 'Modifications enregistrées localement.' });
        setTimeout(() => setEditMessage(null), 4000);
      } catch {
        setEditMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' });
      }
    }
    setEditSaving(false);
  };

  const updateEditField = (field: keyof EditableEmployerFields, value: string | number) => {
    if (!editFields) return;
    setEditFields({ ...editFields, [field]: value });
  };

  // Add new employer with enhanced validation
  const handleAddEmployer = () => {
    // Required field validation
    if (!newEmployer.companyName.trim() || !newEmployer.phone.trim() || !newEmployer.email.trim()) {
      setAddMessage({ type: 'error', text: 'Veuillez remplir les champs obligatoires (Nom, Telephone, Courriel).' });
      return;
    }
    // Company name length validation
    if (newEmployer.companyName.trim().length < 2 || newEmployer.companyName.trim().length > 200) {
      setAddMessage({ type: 'error', text: 'Le nom de l\'entreprise doit contenir entre 2 et 200 caracteres.' });
      return;
    }
    // Email format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
    if (!emailRegex.test(newEmployer.email.trim())) {
      setAddMessage({ type: 'error', text: 'Veuillez entrer une adresse courriel valide.' });
      return;
    }
    // Phone format validation (basic: at least 10 digits)
    const phoneDigits = newEmployer.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setAddMessage({ type: 'error', text: 'Veuillez entrer un numero de telephone valide (minimum 10 chiffres).' });
      return;
    }
    // Postal code validation if provided
    if (newEmployer.postalCode.trim() && !/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(newEmployer.postalCode.trim())) {
      setAddMessage({ type: 'error', text: 'Le code postal doit etre au format canadien (ex: H2X 1Y4).' });
      return;
    }
    // NEQ validation if provided (10 digits)
    if (newEmployer.neq.trim() && !/^\d{10}$/.test(newEmployer.neq.trim())) {
      setAddMessage({ type: 'error', text: 'Le NEQ doit contenir exactement 10 chiffres.' });
      return;
    }
    // Duplicate check by email
    if (employers.some(e => e.email.toLowerCase() === newEmployer.email.trim().toLowerCase())) {
      setAddMessage({ type: 'error', text: 'Un employeur avec ce courriel existe deja.' });
      return;
    }
    const newEmp: Employer = {
      id: `emp-${Date.now()}`,
      companyName: newEmployer.companyName.trim(),
      companyNameLegal: newEmployer.companyNameLegal.trim() || newEmployer.companyName.trim(),
      neq: newEmployer.neq.trim(),
      bnFederal: newEmployer.bnFederal.trim(),
      naicsCode: "",
      naicsDescription: "",
      industry: newEmployer.industry.trim(),
      address: newEmployer.address.trim(),
      city: newEmployer.city.trim(),
      province: newEmployer.province.trim(),
      postalCode: newEmployer.postalCode.trim(),
      phone: newEmployer.phone.trim(),
      email: newEmployer.email.trim(),
      website: newEmployer.website.trim(),
      contactName: newEmployer.contactName.trim(),
      contactTitle: newEmployer.contactTitle.trim(),
      contactPhone: newEmployer.contactPhone.trim(),
      contactEmail: newEmployer.contactEmail.trim(),
      dateIncorporation: newEmployer.dateIncorporation || "",
      nombreEmployes: parseInt(newEmployer.nombreEmployes) || 0,
      nombreEmployesTempo: 0,
      syndicat: false,
      conventionCollective: "",
      cnesst: newEmployer.cnesst.trim(),
      revenuQuebec: "",
      tpsGst: "",
      status: "actif",
      assignedTo: currentUser?.id || "",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      notes: "",
      financials: [],
      credentials: [],
      lmiaApplications: [],
    };
    const updatedList = [...employers, newEmp];
    persistEmployers(updatedList);
    setShowAddModal(false);
    setNewEmployer(EMPTY_NEW_EMPLOYER);
    setAddMessage(null);
    // Show brief success on list
    setEditMessage({ type: 'success', text: `Employeur « ${newEmp.companyName} » ajouté avec succès.` });
    setTimeout(() => setEditMessage(null), 4000);
  };

  // Archive employer (soft delete)
  const handleArchiveEmployer = () => {
    if (!selectedEmployer) return;
    const updated: Employer = { ...selectedEmployer, status: 'inactif' };
    setSelectedEmployer(null);
    persistEmployers(employers.map(e => e.id === updated.id ? updated : e));
    setShowArchiveConfirm(false);
    setEditMessage({ type: 'success', text: `Employeur « ${updated.companyName} » archivé.` });
    setTimeout(() => setEditMessage(null), 4000);
  };

  // Change employer status
  const changeEmployerStatus = (empId: string, newStatus: Employer['status']) => {
    const updatedList = employers.map(e => e.id === empId ? { ...e, status: newStatus } : e);
    persistEmployers(updatedList);
    if (selectedEmployer?.id === empId) {
      setSelectedEmployer({ ...selectedEmployer, status: newStatus });
    }
  };

  // Permission check — only authenticated CRM users can access the portail
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Lock size={48} className="text-gray-300 mb-4" />
        <h2 className="text-lg font-bold" style={{ color: "#1B2559" }}>Acces restreint</h2>
        <p className="text-sm text-gray-500 mt-2">Vous devez etre connecte pour acceder au portail employeurs.</p>
      </div>
    );
  }

  // Role-based permission: block roles that should not see employer data
  const ALLOWED_EMPLOYER_ROLES = ['coordinatrice', 'avocat_consultant', 'technicien', 'agent', 'superadmin'];
  if (!ALLOWED_EMPLOYER_ROLES.includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Lock size={48} className="text-red-300 mb-4" />
        <h2 className="text-lg font-bold" style={{ color: "#1B2559" }}>Permission insuffisante</h2>
        <p className="text-sm text-gray-500 mt-2">Votre role ne permet pas d&apos;acceder au portail employeurs.</p>
      </div>
    );
  }

  const perms = ROLE_PERMISSIONS[currentUser.role];
  const isAdmin = currentUser.role === "coordinatrice" || currentUser.role === "avocat_consultant";

  const handleEmpUpload = async (files: FileList | File[]) => {
    if (!selectedEmployer) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) { alert(`Type non autorisé: ${file.name}`); continue; }
      if (file.size > MAX_FILE_SIZE) { alert(`Trop volumineux: ${file.name}`); continue; }
      const doc = await uploadEmployerDocument(selectedEmployer.id, file, {
        category: uploadCat,
        uploadedBy: currentUser?.id,
      });
      if (doc) setEmpDocs(prev => [...prev, doc]);
    }
    setUploading(false);
  };

  const handleEmpDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleEmpUpload(e.dataTransfer.files);
  };

  // Filter and sort employers
  const filteredEmployers = employers
    .filter(emp => {
      // Status filter
      if (statusFilter !== "tous" && emp.status !== statusFilter) return false;
      // Search filter
      if (listSearch.trim()) {
        const q = listSearch.toLowerCase();
        return (
          emp.companyName.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.contactName.toLowerCase().includes(q) ||
          emp.contactEmail.toLowerCase().includes(q) ||
          emp.city.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "name_asc": return a.companyName.localeCompare(b.companyName, 'fr-CA');
        case "date_desc": return (b.createdAt || "").localeCompare(a.createdAt || "");
        case "employees_desc": return b.nombreEmployes - a.nombreEmployes;
        default: return 0;
      }
    });

  // --- Liste des employeurs ---
  if (!selectedEmployer) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "#EAEDF5" }}>
              <Building2 className="w-6 h-6" style={{ color: "#1B2559" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#1B2559" }}>Portail employeurs</h1>
              <p className="text-sm text-gray-500">Gestion des employeurs, EIMT/LMIA et formulaires MIFI</p>
            </div>
          </div>
          <button
            onClick={() => { setShowAddModal(true); setAddMessage(null); setNewEmployer(EMPTY_NEW_EMPLOYER); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-colors shrink-0"
            style={{ backgroundColor: "#D4A03C" }}
          >
            <Plus size={16} />
            Ajouter un employeur
          </button>
        </div>

        {/* Success/error message */}
        {editMessage && (
          <div className={`rounded-xl border p-3 flex items-center gap-2 text-sm ${
            editMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {editMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {editMessage.text}
          </div>
        )}

        {/* Search, Filter, Sort bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, courriel, personne-ressource..."
              value={listSearch}
              onChange={e => setListSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C] transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A03C]"
            >
              <option value="tous">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="en_attente">En attente</option>
              <option value="inactif">Inactif</option>
              <option value="suspendu">Suspendu</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <SortAsc size={14} className="text-gray-400" />
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value as SortOption)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4A03C]"
            >
              <option value="name_asc">Nom A-Z</option>
              <option value="date_desc">Date d&apos;ajout</option>
              <option value="employees_desc">Nombre d&apos;employés</option>
            </select>
          </div>
        </div>

        {/* Employer list */}
        {filteredEmployers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            Aucun employeur trouvé
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEmployers.map((emp) => {
              const activeLmia = emp.lmiaApplications.filter(l => ["approuve", "en_traitement", "soumis"].includes(l.status)).length;
              const totalWorkers = emp.lmiaApplications.reduce((s, l) => s + l.workersFound, 0);
              return (
                <div
                  key={emp.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-[#D4A03C] hover:shadow-md transition-all p-5 group"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => { setSelectedEmployer(emp); setActiveTab("apercu"); }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden text-lg font-bold"
                      style={{ backgroundColor: "#EAEDF5", color: "#1B2559" }}
                    >
                      {employerLogos[emp.id] ? (
                        <img src={employerLogos[emp.id]} alt={emp.companyName} className="w-full h-full object-cover" />
                      ) : (
                        emp.companyName[0]
                      )}
                    </button>
                    <button
                      onClick={() => { setSelectedEmployer(emp); setActiveTab("apercu"); }}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold" style={{ color: "#1B2559" }}>{emp.companyName}</span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">{emp.industry} — {emp.city}, {emp.province}</div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users size={14} /> {emp.nombreEmployes} employés
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Briefcase size={14} /> {activeLmia} EIMT actives
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users size={14} /> {totalWorkers} travailleurs trouvés
                        </span>
                        {emp.financials[0] && (
                          <span className="flex items-center gap-1 text-gray-600">
                            <DollarSign size={14} /> {(emp.financials[0].revenuBrut / 1000000).toFixed(1)}M$ rev.
                          </span>
                        )}
                      </div>
                    </button>
                    {/* Status dropdown */}
                    <div className="shrink-0">
                      <select
                        value={emp.status}
                        onChange={e => { e.stopPropagation(); changeEmployerStatus(emp.id, e.target.value as Employer['status']); }}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer appearance-none text-center pr-5 ${EMPLOYER_STATUS_COLORS[emp.status] || 'bg-gray-100 text-gray-700'}`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' fill='none' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                      >
                        <option value="actif">Actif</option>
                        <option value="en_attente">En attente</option>
                        <option value="inactif">Inactif</option>
                        <option value="suspendu">Suspendu</option>
                        <option value="prospect">Prospect</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========== ADD EMPLOYER MODAL ========== */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white rounded-t-2xl border-b px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: "#EAEDF5" }}>
                    <Building2 size={18} style={{ color: "#1B2559" }} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: "#1B2559" }}>Ajouter un employeur</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-5">
                {addMessage && (
                  <div className={`rounded-xl border p-3 flex items-center gap-2 text-sm ${
                    addMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {addMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {addMessage.text}
                  </div>
                )}

                {/* Section: Entreprise */}
                <div>
                  <h3 className="text-sm font-bold mb-3 pb-2 border-b" style={{ color: "#1B2559" }}>Informations de l&apos;entreprise</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Nom de l&apos;entreprise <span className="text-red-500">*</span></label>
                      <input type="text" value={newEmployer.companyName} onChange={e => setNewEmployer({ ...newEmployer, companyName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="Ex: Technologies ABC inc." />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Raison sociale</label>
                      <input type="text" value={newEmployer.companyNameLegal} onChange={e => setNewEmployer({ ...newEmployer, companyNameLegal: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="Nom légal si différent" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Adresse</label>
                      <input type="text" value={newEmployer.address} onChange={e => setNewEmployer({ ...newEmployer, address: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="123 rue Principale" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Ville</label>
                      <input type="text" value={newEmployer.city} onChange={e => setNewEmployer({ ...newEmployer, city: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="Montréal" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Province</label>
                      <input type="text" value={newEmployer.province} onChange={e => setNewEmployer({ ...newEmployer, province: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Code postal</label>
                      <input type="text" value={newEmployer.postalCode} onChange={e => setNewEmployer({ ...newEmployer, postalCode: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="H2X 1Y4" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Téléphone <span className="text-red-500">*</span></label>
                      <input type="tel" value={newEmployer.phone} onChange={e => setNewEmployer({ ...newEmployer, phone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="514-555-0123" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Courriel <span className="text-red-500">*</span></label>
                      <input type="email" value={newEmployer.email} onChange={e => setNewEmployer({ ...newEmployer, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="info@entreprise.ca" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Site web</label>
                      <input type="url" value={newEmployer.website} onChange={e => setNewEmployer({ ...newEmployer, website: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="https://www.exemple.ca" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Secteur d&apos;activité / Industrie</label>
                      <input type="text" value={newEmployer.industry} onChange={e => setNewEmployer({ ...newEmployer, industry: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="Technologies de l'information" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Nombre d&apos;employés</label>
                      <input type="number" value={newEmployer.nombreEmployes} onChange={e => setNewEmployer({ ...newEmployer, nombreEmployes: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="0" min="0" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Date d&apos;incorporation</label>
                      <input type="date" value={newEmployer.dateIncorporation} onChange={e => setNewEmployer({ ...newEmployer, dateIncorporation: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" />
                    </div>
                  </div>
                </div>

                {/* Section: Numéros d'entreprise */}
                <div>
                  <h3 className="text-sm font-bold mb-3 pb-2 border-b" style={{ color: "#1B2559" }}>Numéros d&apos;entreprise</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">NEQ (Numéro d&apos;entreprise du Québec)</label>
                      <input type="text" value={newEmployer.neq} onChange={e => setNewEmployer({ ...newEmployer, neq: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="1234567890" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Numéro d&apos;entreprise fédéral</label>
                      <input type="text" value={newEmployer.bnFederal} onChange={e => setNewEmployer({ ...newEmployer, bnFederal: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="123456789 RC0001" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Numéro CNESST</label>
                      <input type="text" value={newEmployer.cnesst} onChange={e => setNewEmployer({ ...newEmployer, cnesst: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="" />
                    </div>
                  </div>
                </div>

                {/* Section: Personne-ressource */}
                <div>
                  <h3 className="text-sm font-bold mb-3 pb-2 border-b" style={{ color: "#1B2559" }}>Personne-ressource</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Nom</label>
                      <input type="text" value={newEmployer.contactName} onChange={e => setNewEmployer({ ...newEmployer, contactName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="Jean Tremblay" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Poste / Titre</label>
                      <input type="text" value={newEmployer.contactTitle} onChange={e => setNewEmployer({ ...newEmployer, contactTitle: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="Directeur des RH" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Téléphone</label>
                      <input type="tel" value={newEmployer.contactPhone} onChange={e => setNewEmployer({ ...newEmployer, contactPhone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="514-555-0124" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Courriel</label>
                      <input type="email" value={newEmployer.contactEmail} onChange={e => setNewEmployer({ ...newEmployer, contactEmail: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]" placeholder="jean@entreprise.ca" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="sticky bottom-0 bg-white rounded-b-2xl border-t px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddEmployer}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-colors"
                  style={{ backgroundColor: "#D4A03C" }}
                >
                  <Plus size={16} />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Détail employeur ---
  const emp = selectedEmployer;
  const latestFinancials = emp.financials[0];
  const prevFinancials = emp.financials[1];

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: "apercu", label: "Aperçu", icon: Building2 },
    { id: "financier", label: "Bilan financier", icon: DollarSign },
    { id: "documents", label: `Documents (${empDocs.length})`, icon: Upload },
    { id: "lmia", label: "EIMT / LMIA", icon: ClipboardList },
    { id: "formulaires", label: "Formulaires", icon: FileText },
    { id: "credentials", label: "Accès portails", icon: KeyRound },
  ];

  // Filter credentials tab for admin only
  const visibleTabs = tabs.filter(t => t.id !== "credentials" || isAdmin);

  const platformName = (id: string) => CREDENTIAL_PLATFORMS.find(p => p.id === id)?.name ?? id;

  const formatMoney = (n: number) => n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

  const pctChange = (cur: number, prev: number) => {
    if (!prev) return null;
    return Math.round(((cur - prev) / prev) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => { setSelectedEmployer(null); setEditMode(false); setEditFields(null); }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0 overflow-hidden cursor-pointer relative group text-2xl font-bold"
          style={{ backgroundColor: "#EAEDF5", color: "#1B2559" }}
          onClick={() => detailLogoInputRef.current?.click()}
        >
          {employerLogos[emp.id] ? (
            <img src={employerLogos[emp.id]} alt={emp.companyName} className="w-full h-full object-cover" />
          ) : (
            emp.companyName[0]
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
            <Camera size={22} className="text-white" />
          </div>
        </div>
        <input
          ref={detailLogoInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.svg"
          className="hidden"
          onChange={e => { if (e.target.files?.[0] && emp) { handleLogoUpload(e.target.files[0], emp.id); } e.target.value = ''; }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: "#1B2559" }}>{emp.companyName}</h1>
            {!editMode && (
              <button
                onClick={() => startEdit(emp)}
                className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border flex items-center gap-1.5 text-sm"
                style={{ borderColor: "#D4A03C", color: "#1B2559" }}
              >
                <Pencil size={14} style={{ color: "#D4A03C" }} />
                Modifier
              </button>
            )}
            {activeTab === "apercu" && editMode && (
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={saveEdit}
                  disabled={editSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "#1B2559" }}
                >
                  {editSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Enregistrer
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={editSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <X size={14} />
                  Annuler
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">{emp.companyNameLegal}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${EMPLOYER_STATUS_COLORS[emp.status]}`}>
          {EMPLOYER_STATUS_LABELS[emp.status]}
        </span>
        {/* Archive button */}
        <button
          onClick={() => setShowArchiveConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-600"
        >
          <Archive size={14} />
          Archiver
        </button>
        <InviteEmployerButton email={emp.contactEmail} name={emp.companyName} entityId={emp.id} />
      </div>

      {/* Archive confirmation dialog */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowArchiveConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-100">
                <Archive size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold" style={{ color: "#1B2559" }}>Archiver l&apos;employeur</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Voulez-vous archiver cet employeur ? Son statut sera changé à « Inactif ». Vous pourrez le réactiver ultérieurement.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleArchiveEmployer}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Archiver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedForm(null); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-[#D4A03C] text-[#1B2559]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== APERÇU ========== */}
      {activeTab === "apercu" && (
        <div className="space-y-6">
          {/* Edit message */}
          {editMessage && (
            <div className={`rounded-xl border p-3 flex items-center gap-2 text-sm ${
              editMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {editMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {editMessage.text}
            </div>
          )}

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard icon={Users} label="Employés" value={`${emp.nombreEmployes}`} sub={`+ ${emp.nombreEmployesTempo} temporaires`} />
            <InfoCard icon={Briefcase} label="EIMT actives" value={`${emp.lmiaApplications.filter(l => l.status === "approuve").length}`} sub={`${emp.lmiaApplications.length} total`} />
            <InfoCard icon={Users} label="Travailleurs trouvés" value={`${emp.lmiaApplications.reduce((s, l) => s + l.workersFound, 0)}`} sub={`sur ${emp.lmiaApplications.reduce((s, l) => s + l.workersRequested, 0)} demandés`} />
            {latestFinancials && (
              <InfoCard icon={DollarSign} label={`Revenus ${latestFinancials.year}`} value={formatMoney(latestFinancials.revenuBrut)} sub={`Net: ${formatMoney(latestFinancials.revenuNet)}`} />
            )}
          </div>

          {/* Coordonnées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>Informations de l&apos;entreprise</h3>
              <div className="space-y-3 text-sm">
                {editMode && editFields ? (
                  <>
                    <EditableRow icon={MapPin} label="Nom de l'entreprise" value={editFields.companyName} onChange={(v) => updateEditField('companyName', v)} type="text" />
                    <EditableRow icon={MapPin} label="Raison sociale" value={editFields.companyNameLegal} onChange={(v) => updateEditField('companyNameLegal', v)} type="text" />
                    <EditableRow icon={MapPin} label="Adresse" value={editFields.address} onChange={(v) => updateEditField('address', v)} type="text" />
                    <EditableRow icon={Phone} label="Téléphone" value={editFields.phone} onChange={(v) => updateEditField('phone', v)} type="text" />
                    <EditableRow icon={Mail} label="Courriel" value={editFields.email} onChange={(v) => updateEditField('email', v)} type="text" />
                    <EditableRow icon={Globe} label="Site web" value={editFields.website} onChange={(v) => updateEditField('website', v)} type="text" />
                    <EditableRow icon={Factory} label="Secteur / Industrie" value={editFields.industry} onChange={(v) => updateEditField('industry', v)} type="text" />
                    <EditableRow icon={Users} label="Nombre d'employés" value={String(editFields.nombreEmployes)} onChange={(v) => updateEditField('nombreEmployes', parseInt(v) || 0)} type="number" />
                    <EditableRow icon={Calendar} label="Date d'incorporation" value={editFields.dateIncorporation} onChange={(v) => updateEditField('dateIncorporation', v)} type="date" />
                    <EditableRow icon={Factory} label="Code SCIAN/NAICS" value={editFields.naicsCode} onChange={(v) => updateEditField('naicsCode', v)} type="text" />
                    <EditableRow icon={Hash} label="NEQ" value={editFields.neq} onChange={(v) => updateEditField('neq', v)} type="text" />
                    <EditableRow icon={Hash} label="NE fédéral (ARC)" value={editFields.bnFederal} onChange={(v) => updateEditField('bnFederal', v)} type="text" />
                    <EditableRow icon={Hash} label="CNESST" value={editFields.cnesst} onChange={(v) => updateEditField('cnesst', v)} type="text" />
                  </>
                ) : (
                  <>
                    <InfoRow icon={MapPin} label="Adresse" value={`${emp.address}, ${emp.city}, ${emp.province} ${emp.postalCode}`} />
                    <InfoRow icon={Phone} label="Téléphone" value={emp.phone} />
                    <InfoRow icon={Mail} label="Courriel" value={emp.email} />
                    {emp.website && <InfoRow icon={Globe} label="Site web" value={emp.website} />}
                    <InfoRow icon={Calendar} label="Incorporée le" value={emp.dateIncorporation} />
                    <InfoRow icon={Factory} label="Secteur SCIAN" value={`${emp.naicsCode} — ${emp.naicsDescription}`} />
                    <InfoRow icon={Hash} label="NEQ" value={emp.neq} />
                    <InfoRow icon={Hash} label="NE fédéral (ARC)" value={emp.bnFederal} />
                    <InfoRow icon={Hash} label="CNESST" value={emp.cnesst} />
                    <InfoRow icon={Hash} label="TVQ (Revenu Québec)" value={emp.revenuQuebec} />
                    <InfoRow icon={Hash} label="TPS/GST" value={emp.tpsGst} />
                    {emp.syndicat && <InfoRow icon={Users} label="Convention collective" value={emp.conventionCollective || "Oui"} />}
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>Personne-ressource</h3>
              <div className="space-y-3 text-sm">
                {editMode && editFields ? (
                  <>
                    <EditableRow icon={Users} label="Nom" value={editFields.contactName} onChange={(v) => updateEditField('contactName', v)} type="text" />
                    <EditableRow icon={Briefcase} label="Titre / Poste" value={editFields.contactTitle} onChange={(v) => updateEditField('contactTitle', v)} type="text" />
                    <EditableRow icon={Phone} label="Téléphone" value={editFields.contactPhone} onChange={(v) => updateEditField('contactPhone', v)} type="text" />
                    <EditableRow icon={Mail} label="Courriel" value={editFields.contactEmail} onChange={(v) => updateEditField('contactEmail', v)} type="text" />
                  </>
                ) : (
                  <>
                    <InfoRow icon={Users} label="Nom" value={emp.contactName} />
                    <InfoRow icon={Briefcase} label="Titre" value={emp.contactTitle} />
                    <InfoRow icon={Phone} label="Téléphone" value={emp.contactPhone} />
                    <InfoRow icon={Mail} label="Courriel" value={emp.contactEmail} />
                  </>
                )}
              </div>

              {/* Notes & Remarques */}
              <NotesSection
                entityId={emp.id}
                entityType="employer"
                categories={EMPLOYER_NOTE_CATEGORIES}
                storageKey="soshub_employer_notes"
                currentUser={currentUser}
                emptyMessage="Aucune note pour cet employeur"
              />

              {/* LMIA summary */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 mb-3">Historique EIMT</h4>
                <div className="space-y-2">
                  {emp.lmiaApplications.map((lmia) => (
                    <div key={lmia.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50">
                      <span className="text-gray-700 truncate mr-2">{lmia.position}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${LMIA_STATUS_COLORS[lmia.status]}`}>
                        {LMIA_STATUS_LABELS[lmia.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== BILAN FINANCIER ========== */}
      {activeTab === "financier" && (
        <div className="space-y-6">
          {!latestFinancials ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
              Aucune donnée financière disponible
            </div>
          ) : (
            <>
              {/* Revenus */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>
                  Revenus et résultats — {latestFinancials.year}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FinancialCard label="Revenu brut" value={formatMoney(latestFinancials.revenuBrut)} change={prevFinancials ? pctChange(latestFinancials.revenuBrut, prevFinancials.revenuBrut) : null} />
                  <FinancialCard label="Revenu net" value={formatMoney(latestFinancials.revenuNet)} change={prevFinancials ? pctChange(latestFinancials.revenuNet, prevFinancials.revenuNet) : null} />
                  <FinancialCard label="Masse salariale" value={formatMoney(latestFinancials.masseSalariale)} change={prevFinancials ? pctChange(latestFinancials.masseSalariale, prevFinancials.masseSalariale) : null} />
                </div>
              </div>

              {/* Bilan */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>Bilan annuel</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FinancialCard label="Actif total" value={formatMoney(latestFinancials.actifTotal)} change={prevFinancials ? pctChange(latestFinancials.actifTotal, prevFinancials.actifTotal) : null} />
                  <FinancialCard label="Passif total" value={formatMoney(latestFinancials.passifTotal)} change={prevFinancials ? pctChange(latestFinancials.passifTotal, prevFinancials.passifTotal) : null} />
                  <FinancialCard label="Capitaux propres" value={formatMoney(latestFinancials.capitauxPropres)} change={prevFinancials ? pctChange(latestFinancials.capitauxPropres, prevFinancials.capitauxPropres) : null} />
                </div>
              </div>

              {/* Obligations fiscales */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>Obligations fiscales et cotisations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl p-4" style={{ backgroundColor: "#EAEDF5" }}>
                    <div className="text-xs text-gray-500 mb-1">Impôt provincial (QC)</div>
                    <div className="text-xl font-bold" style={{ color: "#1B2559" }}>{formatMoney(latestFinancials.impotProvincial)}</div>
                  </div>
                  <div className="rounded-xl p-4" style={{ backgroundColor: "#EAEDF5" }}>
                    <div className="text-xs text-gray-500 mb-1">Impôt fédéral</div>
                    <div className="text-xl font-bold" style={{ color: "#1B2559" }}>{formatMoney(latestFinancials.impotFederal)}</div>
                  </div>
                  <div className="rounded-xl p-4" style={{ backgroundColor: "#EAEDF5" }}>
                    <div className="text-xs text-gray-500 mb-1">Cotisations CNESST</div>
                    <div className="text-xl font-bold" style={{ color: "#1B2559" }}>{formatMoney(latestFinancials.cotisationsCNESST)}</div>
                  </div>
                  <div className="rounded-xl p-4" style={{ backgroundColor: "#EAEDF5" }}>
                    <div className="text-xs text-gray-500 mb-1">TPS/TVQ perçu</div>
                    <div className="text-xl font-bold" style={{ color: "#1B2559" }}>{formatMoney(latestFinancials.tpsTvqPercu)}</div>
                  </div>
                </div>
              </div>

              {/* Historique */}
              {emp.financials.length > 1 && (
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>Comparaison annuelle</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b" style={{ backgroundColor: "#EAEDF5" }}>
                          <th className="text-left p-3 font-semibold" style={{ color: "#1B2559" }}>Poste</th>
                          {emp.financials.map(f => (
                            <th key={f.year} className="text-right p-3 font-semibold" style={{ color: "#1B2559" }}>{f.year}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: "Revenu brut", key: "revenuBrut" as const },
                          { label: "Revenu net", key: "revenuNet" as const },
                          { label: "Masse salariale", key: "masseSalariale" as const },
                          { label: "Actif total", key: "actifTotal" as const },
                          { label: "Passif total", key: "passifTotal" as const },
                          { label: "Capitaux propres", key: "capitauxPropres" as const },
                          { label: "Impôt provincial", key: "impotProvincial" as const },
                          { label: "Impôt fédéral", key: "impotFederal" as const },
                          { label: "CNESST", key: "cotisationsCNESST" as const },
                        ].map(row => (
                          <tr key={row.key} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-700">{row.label}</td>
                            {emp.financials.map(f => (
                              <td key={f.year} className="p-3 text-right text-gray-700">{formatMoney(f[row.key])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========== EIMT / LMIA ========== */}
      {activeTab === "lmia" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold" style={{ color: "#1B2559" }}>Demandes d&apos;EIMT / LMIA</h3>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "#D4A03C" }}>
              <Plus size={16} /> Nouvelle demande
            </button>
          </div>

          {emp.lmiaApplications.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
              Aucune demande d&apos;EIMT
            </div>
          ) : (
            emp.lmiaApplications.map((lmia) => (
              <div key={lmia.id} className="bg-white rounded-xl border overflow-hidden">
                <button
                  onClick={() => setExpandedLmia(expandedLmia === lmia.id ? null : lmia.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#EAEDF5" }}>
                      {lmia.status === "approuve" ? <CheckCircle2 className="text-green-600" size={20} /> :
                       lmia.status === "refuse" ? <AlertCircle className="text-red-600" size={20} /> :
                       <Clock className="text-amber-600" size={20} />}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{lmia.position}</div>
                      <div className="text-sm text-gray-500">CNP {lmia.nocCode} — {lmia.workersRequested} poste(s)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${LMIA_STATUS_COLORS[lmia.status]}`}>
                      {LMIA_STATUS_LABELS[lmia.status]}
                    </span>
                    {expandedLmia === lmia.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {expandedLmia === lmia.id && (
                  <div className="border-t p-5 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Salaire offert</div>
                        <div className="font-semibold">{lmia.wageOffered.toFixed(2)} $/h</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Salaire médian</div>
                        <div className="font-semibold">{lmia.medianWage.toFixed(2)} $/h</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Travailleurs trouvés</div>
                        <div className="font-semibold">{lmia.workersFound} / {lmia.workersRequested}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Plan de transition</div>
                        <div className="font-semibold">{lmia.transitionPlan ? "Oui" : "Non requis"}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      {lmia.lmiaNumber && (
                        <div>
                          <div className="text-xs text-gray-500">Numéro EIMT</div>
                          <div className="font-semibold text-sm">{lmia.lmiaNumber}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-500">Date de soumission</div>
                        <div className="font-semibold text-sm">{lmia.submittedAt || "—"}</div>
                      </div>
                      {lmia.expiresAt && (
                        <div>
                          <div className="text-xs text-gray-500">Date d&apos;expiration</div>
                          <div className="font-semibold text-sm">{lmia.expiresAt}</div>
                        </div>
                      )}
                    </div>
                    {lmia.notes && (
                      <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border">{lmia.notes}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== DOCUMENTS EMPLOYEUR ========== */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Upload zone */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#1B2559" }}><Upload size={18} /> Téléverser un document</h3>
            <div className="flex gap-3 mb-4 flex-wrap">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Catégorie</label>
                <select value={uploadCat} onChange={e => setUploadCat(e.target.value as EmployerDocumentCategory)} className="border rounded-lg px-3 py-2 text-sm">
                  {(Object.entries(EMPLOYER_DOCUMENT_CATEGORY_LABELS) as [EmployerDocumentCategory, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={() => empFileRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-[#1B2559] text-white rounded-lg text-sm font-medium hover:bg-[#2a3a7c] transition disabled:opacity-50">
                  {uploading ? "Envoi..." : "Choisir un fichier"}
                </button>
                <input ref={empFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple className="hidden" onChange={e => { if (e.target.files) handleEmpUpload(e.target.files); e.target.value = ""; }} />
              </div>
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleEmpDrop}
              onClick={() => empFileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragOver ? "border-[#D4A03C] bg-[#F7F3E8]" : "border-gray-300 hover:border-[#D4A03C]"}`}
            >
              <Upload size={32} className={`mx-auto mb-2 ${dragOver ? "text-[#D4A03C]" : "text-gray-400"}`} />
              <p className="text-sm text-gray-500">Glissez-déposez vos fichiers ici</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, WebP — max 10 MB</p>
            </div>
          </div>

          {/* LMIA Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: "#1B2559" }}><ShieldCheck size={18} /> Checklist EIMT/LMIA</h3>
            <p className="text-xs text-gray-400 mb-4">Documents requis pour une demande d&apos;Étude d&apos;impact sur le marché du travail</p>
            <div className="space-y-2">
              {EMPLOYER_LMIA_CHECKLIST.map(item => {
                const match = empDocs.find(d => d.category === item.category);
                const uploaded = !!match;
                return (
                  <div key={item.documentType} className={`flex items-center gap-3 p-3 rounded-lg ${uploaded ? "bg-green-50" : "bg-gray-50"}`}>
                    {uploaded ? <CheckCircle2 size={16} className="text-green-600 shrink-0" /> :
                     <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${item.required ? "border-red-300" : "border-gray-300"}`} />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2">{item.label} {item.required && <span className="text-[10px] text-red-500 font-normal">Requis</span>}</div>
                      <div className="text-xs text-gray-400 truncate">{item.description}</div>
                    </div>
                    {match && <span className={`text-xs px-2 py-0.5 rounded-full ${DOCUMENT_STATUS_COLORS[match.status]}`}>{DOCUMENT_STATUS_LABELS[match.status]}</span>}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-gray-400">
              {EMPLOYER_LMIA_CHECKLIST.filter(i => empDocs.some(d => d.category === i.category)).length}/{EMPLOYER_LMIA_CHECKLIST.length} documents fournis
            </div>
          </div>

          {/* Document list */}
          {empDocs.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <FileText size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">Aucun document televerse</p>
              <p className="text-gray-400 text-xs mt-1">Utilisez la zone ci-dessus pour televerser des documents.</p>
            </div>
          )}
          {empDocs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>Documents téléversés ({empDocs.length})</h3>
              <div className="space-y-2">
                {empDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                    <FileText size={18} className="text-[#1B2559] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{doc.name || doc.fileName}</div>
                      <div className="text-xs text-gray-400">{EMPLOYER_DOCUMENT_CATEGORY_LABELS[doc.category]} — {doc.uploadedAt?.split('T')[0]}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${DOCUMENT_STATUS_COLORS[doc.status]}`}>{DOCUMENT_STATUS_LABELS[doc.status]}</span>
                    <button onClick={() => setEmpDocs(prev => prev.filter(d => d.id !== doc.id))} className="p-1 hover:bg-red-100 rounded transition">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Government forms for employers */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: "#1B2559" }}><FileText size={18} /> Formulaires gouvernementaux</h3>
            <p className="text-xs text-gray-400 mb-3">Formulaires EDSC et MIFI pour employeurs</p>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Rechercher (ex: EMP 5593, EIMT...)" value={formSearch} onChange={e => setFormSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
            </div>
            {(['edsc', 'mifi'] as const).map(cat => {
              const forms = getFormsForTarget('employer').filter(f => f.category === cat && (
                !formSearch || f.code.toLowerCase().includes(formSearch.toLowerCase()) || f.name.toLowerCase().includes(formSearch.toLowerCase())
              ));
              if (forms.length === 0) return null;
              return (
                <div key={cat} className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {cat === 'edsc' ? 'EDSC — Emploi Canada (LMIA)' : 'MIFI — Québec'}
                  </h4>
                  <div className="space-y-1">
                    {forms.map(form => (
                      <div key={form.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F7F3E8] transition">
                        <span className="text-xs font-mono font-bold text-[#1B2559] bg-[#EAEDF5] px-2 py-1 rounded min-w-[90px] text-center">{form.code}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{form.name}</div>
                          <div className="text-xs text-gray-400 truncate">{form.description}</div>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><ExternalLink size={12} /> PDF</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========== FORMULAIRES LMIA / MIFI ========== */}
      {activeTab === "formulaires" && !selectedForm && (
        <div className="space-y-6">
          {/* LMIA Forms */}
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: "#1B2559" }}>Formulaires EIMT / LMIA (EDSC)</h3>
            <div className="grid gap-3">
              {LMIA_FORMS.map((form) => (
                <button
                  key={form.id}
                  onClick={() => setSelectedForm(form.id)}
                  className="bg-white rounded-xl border p-4 text-left hover:border-[#D4A03C] hover:shadow-sm transition-all flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAEDF5" }}>
                    <FileText size={20} style={{ color: "#1B2559" }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{form.code}</div>
                    <div className="text-sm text-gray-500">{form.name}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">Fédéral</span>
                </button>
              ))}
            </div>
          </div>

          {/* MIFI Forms */}
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: "#1B2559" }}>Formulaires MIFI (Québec)</h3>
            <div className="grid gap-3">
              {MIFI_FORMS.map((form) => (
                <button
                  key={form.id}
                  onClick={() => setSelectedForm(form.id)}
                  className="bg-white rounded-xl border p-4 text-left hover:border-[#D4A03C] hover:shadow-sm transition-all flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#F7F3E8" }}>
                    <FileText size={20} style={{ color: "#D4A03C" }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{form.code}</div>
                    <div className="text-sm text-gray-500">{form.name}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-600 font-medium">Provincial</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form detail with auto-fill */}
      {activeTab === "formulaires" && selectedForm && (
        <FormViewer
          formId={selectedForm}
          employer={emp}
          onBack={() => setSelectedForm(null)}
        />
      )}

      {/* ========== ACCÈS PORTAILS (Admin only) ========== */}
      {activeTab === "credentials" && (
        <div className="space-y-4">
          {!isAdmin ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
              <div className="p-4 rounded-full bg-red-50 mb-4">
                <ShieldX className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Accès restreint</h2>
              <p className="text-gray-500">Seuls les administrateurs peuvent voir les identifiants des portails gouvernementaux.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#1B2559" }}>Accès aux portails gouvernementaux</h3>
                  <p className="text-sm text-gray-500">Identifiants fédéraux et provinciaux de l&apos;employeur</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "#D4A03C" }}>
                  <Plus size={16} /> Ajouter un accès
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Lock size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800">
                  <strong>Information confidentielle</strong> — Ces identifiants sont fournis par l&apos;employeur pour permettre au cabinet d&apos;accéder à leurs portails gouvernementaux. Accès réservé aux administrateurs uniquement.
                </div>
              </div>

              <div className="grid gap-4">
                {emp.credentials.map((cred, idx) => (
                  <div key={idx} className="bg-white rounded-xl border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#EAEDF5" }}>
                          <KeyRound size={18} style={{ color: "#1B2559" }} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{platformName(cred.platform)}</div>
                          <div className="text-xs text-gray-400">Dernier accès: {cred.lastAccessed}</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Nom d&apos;utilisateur</label>
                        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono text-gray-700 border">
                          {cred.username}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Mot de passe</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono text-gray-700 border">
                            {showPasswords[`${emp.id}-${idx}`] ? cred.password : "••••••••••••"}
                          </div>
                          <button
                            onClick={() => setShowPasswords(prev => ({ ...prev, [`${emp.id}-${idx}`]: !prev[`${emp.id}-${idx}`] }))}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                          >
                            {showPasswords[`${emp.id}-${idx}`] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    {cred.notes && (
                      <p className="text-xs text-gray-500 mt-3">{cred.notes}</p>
                    )}
                  </div>
                ))}

                {emp.credentials.length === 0 && (
                  <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
                    Aucun identifiant enregistré pour cet employeur
                  </div>
                )}

                {/* Platforms not yet added */}
                {CREDENTIAL_PLATFORMS.filter(p => !emp.credentials.find(c => c.platform === p.id)).length > 0 && (
                  <div className="bg-white rounded-xl border p-5">
                    <h4 className="font-semibold text-gray-700 mb-3">Portails disponibles (non configurés)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CREDENTIAL_PLATFORMS.filter(p => !emp.credentials.find(c => c.platform === p.id)).map(p => (
                        <button key={p.id} className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-gray-300 hover:border-[#D4A03C] hover:bg-[#F7F3E8] transition-all text-left text-sm">
                          <Plus size={14} className="text-gray-400" />
                          <span className="text-gray-600">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function InfoCard({ icon: Icon, label, value, sub }: { icon: typeof Building2; label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="p-2 rounded-lg" style={{ backgroundColor: "#EAEDF5" }}>
          <Icon className="w-4 h-4" style={{ color: "#1B2559" }} />
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color: "#1B2559" }}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-gray-400 mt-0.5 shrink-0" />
      <div>
        <span className="text-gray-500">{label}:</span>{" "}
        <span className="text-gray-900 font-medium">{value}</span>
      </div>
    </div>
  );
}

function EditableRow({ icon: Icon, label, value, onChange, type = "text" }: {
  icon: typeof Building2;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "date";
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-gray-400 mt-1.5 shrink-0" />
      <div className="flex-1">
        <label className="text-gray-500 text-xs block mb-1">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C] transition-colors"
        />
      </div>
    </div>
  );
}

function FinancialCard({ label, value, change }: { label: string; value: string; change: number | null }) {
  return (
    <div className="rounded-xl p-4 bg-white border">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color: "#1B2559" }}>{value}</div>
      {change !== null && (
        <div className={`flex items-center gap-1 text-xs mt-2 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
          {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change >= 0 ? "+" : ""}{change}% vs année précédente
        </div>
      )}
    </div>
  );
}

function FormViewer({ formId, employer, onBack }: { formId: string; employer: Employer; onBack: () => void }) {
  const allForms = [...LMIA_FORMS, ...MIFI_FORMS];
  const form = allForms.find(f => f.id === formId);
  if (!form) return null;

  const autoFilledData = autoFillEmployerForm(employer, form.fields);
  const isMifi = MIFI_FORMS.some(f => f.id === formId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold" style={{ color: "#1B2559" }}>{form.code}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isMifi ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
              {isMifi ? "Provincial" : "Fédéral"}
            </span>
          </div>
          <p className="text-sm text-gray-500">{form.name}</p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700">
        <CheckCircle2 size={16} />
        Les champs marqués en vert ont été auto-remplis à partir du profil de l&apos;employeur.
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="grid grid-cols-1 gap-4">
          {form.fields.map((field) => {
            if (field.type === "section_header") {
              return (
                <div key={field.id} className="pt-4 first:pt-0">
                  <h4 className="text-sm font-bold tracking-wide pb-2 border-b" style={{ color: "#1B2559" }}>
                    {field.label}
                  </h4>
                </div>
              );
            }

            const autoFilled = field.id in autoFilledData;
            const value = autoFilled ? String(autoFilledData[field.id] ?? "") : "";
            const widthClass = field.width === "half" ? "sm:col-span-1" : field.width === "third" ? "sm:col-span-1" : "sm:col-span-2";

            return (
              <div key={field.id} className={`${widthClass}`}>
                <label className="text-xs text-gray-500 block mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${autoFilled ? "bg-green-50 border-green-300" : "bg-white border-gray-200"}`}
                    defaultValue={value}
                    placeholder={field.helpText || ""}
                    rows={3}
                  />
                ) : field.type === "select" ? (
                  <select
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${autoFilled ? "bg-green-50 border-green-300" : "bg-white border-gray-200"}`}
                    defaultValue={value}
                  >
                    <option value="">— Sélectionner —</option>
                    {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" defaultChecked={!!value} />
                    <span className="text-sm text-gray-600">{field.helpText || "Oui"}</span>
                  </div>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${autoFilled ? "bg-green-50 border-green-300" : "bg-white border-gray-200"}`}
                    defaultValue={value}
                    placeholder={field.helpText || ""}
                  />
                )}
                {autoFilled && (
                  <span className="text-xs text-green-600 mt-0.5 block">Auto-rempli</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-50">Sauvegarder brouillon</button>
          <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "#D4A03C" }}>Soumettre</button>
        </div>
      </div>
    </div>
  );
}

// Bouton d'invitation portail employeur
function InviteEmployerButton({ email, name, entityId }: { email: string; name: string; entityId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [tempPw, setTempPw] = useState('');

  const handleInvite = async () => {
    if (status === 'loading' || !email) return;
    // Input validation
    if (!email.includes('@') || email.length < 5) {
      setStatus('error');
      return;
    }
    if (!name || name.trim().length < 2) {
      setStatus('error');
      return;
    }
    if (!entityId) {
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
          entityType: 'employer',
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

  if (!email) return null;

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
      className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
      style={{ backgroundColor: '#D4A03C' }}>
      {status === 'loading' ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
      {status === 'error' ? 'Réessayer' : 'Envoyer accès portail'}
    </button>
  );
}

// EmployerNotesSection — migrated to generic <NotesSection /> component (src/components/NotesSection.tsx)
