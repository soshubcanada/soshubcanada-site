"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { crmFetch } from '@/lib/crm-fetch';
import { useCrm, DEMO_USERS } from "@/lib/crm-store";
import { ROLE_LABELS } from "@/lib/crm-types";
import type { CrmUser, CrmRole } from "@/lib/crm-types";
import {
  Users, FileText, CalendarDays, ClipboardList,
  Plus, Search, Eye, EyeOff, Edit3, Upload,
  ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle,
  AlertTriangle, Shield, HardHat, Target, BookOpen, MessageSquare,
  Trash2, Bell, UserCheck, Briefcase, MapPin,
  Phone, Heart, X, Lock, AlertCircle,
} from "lucide-react";

// ============================================================
// Types RH
// ============================================================

type StatutEmploi = 'temps_plein' | 'temps_partiel' | 'contractuel' | 'probation' | 'termine';
type TypePoste = 'permanent' | 'temporaire' | 'saisonnier';
type TypeConge = 'vacances' | 'maladie' | 'personnel' | 'ferie' | 'cnesst' | 'maternite_paternite' | 'sans_solde';
type StatutConge = 'en_attente' | 'approuve' | 'refuse';
type StatutDocument = 'en_attente' | 'verifie' | 'expire';
type CategorieDocument = 'contrat' | 'cv' | 'diplome' | 'certificat' | 'releve_emploi' | 't4_releve1' | 'cnesst' | 'evaluation' | 'avertissement' | 'autre';
type StatutObjectif = 'en_cours' | 'atteint' | 'non_atteint';
type Sexe = 'homme' | 'femme' | 'autre' | 'prefere_ne_pas_repondre';
type EtatCivil = 'celibataire' | 'marie' | 'conjoint_de_fait' | 'divorce' | 'veuf';
type ModePaiement = 'virement' | 'cheque';
type FrequencePaie = 'hebdomadaire' | 'bi_hebdomadaire' | 'bimensuel' | 'mensuel';
type RelationUrgence = 'conjoint' | 'parent' | 'enfant' | 'ami' | 'autre';
type StatutPresence = 'present' | 'absent' | 'retard' | 'teletravail' | 'conge' | 'ferie';

// New document category type for per-employee document uploads
type EmployeeDocCategory = 'contrat_travail' | 'piece_identite' | 'releve_emploi' | 't4_releve1' | 'formulaire_td1' | 'attestation_cnesst' | 'formation_sst' | 'evaluation_rendement' | 'avertissement_disciplinaire' | 'autre';

interface ContactUrgence {
  nom: string;
  telephone: string;
  relation: RelationUrgence | string;
}

interface AccidentTravail {
  id: string;
  date: string;
  description: string;
  gravite: 'mineur' | 'modere' | 'grave';
  statut: 'ouvert' | 'ferme';
}

interface FormationSST {
  id: string;
  nom: string;
  dateCompletee: string;
  dateExpiration: string;
}

interface HRProfile {
  userId: string;
  employeeNumber: string;
  // Informations personnelles
  prenom: string;
  nomFamille: string;
  dateNaissance: string;
  sexe: Sexe;
  etatCivil: EtatCivil;
  nasLastThree: string;
  langueMaternelle: string;
  languesParlees: string;
  // Coordonnees
  adresseRue: string;
  adresseVille: string;
  adresseProvince: string;
  adresseCodePostal: string;
  telephonePersonnel: string;
  telephoneUrgence: string;
  courrielPersonnel: string;
  // Contact urgence
  contactUrgence: ContactUrgence;
  // Emploi
  dateEmbauche: string;
  dateFin: string;
  statutEmploi: StatutEmploi;
  typePoste: TypePoste;
  departement: string;
  poste: string;
  superviseur: string;
  salaire: string;
  tauxHoraire: string;
  modePaiement: ModePaiement;
  frequencePaie: FrequencePaie;
  // CNESST
  classificationEmploi: string;
  tauxCotisation: string;
  accidentsTravail: AccidentTravail[];
  formationsSST: FormationSST[];
  // Legacy compat
  adresse: string;
}

interface HRDocument {
  id: string;
  employeeId: string;
  nom: string;
  categorie: CategorieDocument;
  statut: StatutDocument;
  dateTelechargement: string;
  dateExpiration: string;
  tailleFichier: number;
  typeFichier: string;
}

// Per-employee private document
interface EmployeePrivateDocument {
  id: string;
  employeeId: string;
  nom: string;
  categorie: EmployeeDocCategory;
  dateTelechargement: string;
  tailleFichier: number;
  typeFichier: string;
  fileDataUrl?: string; // stored as base64 data URL in localStorage
}

interface DemandeConge {
  id: string;
  employeeId: string;
  type: TypeConge;
  dateDebut: string;
  dateFin: string;
  notes: string;
  statut: StatutConge;
  dateCreation: string;
  approvedBy?: string;
  refusedBy?: string;
  refusalReason?: string;
}

interface BalanceConge {
  employeeId: string;
  vacances: { utilises: number; disponibles: number };
  maladie: { utilises: number; disponibles: number };
  personnel: { utilises: number; disponibles: number };
}

interface NoteSuivi {
  id: string;
  employeeId: string;
  date: string;
  auteur: string;
  texte: string;
  type: 'evaluation' | 'note' | 'formation' | 'avertissement' | 'objectif';
}

interface Objectif {
  id: string;
  employeeId: string;
  titre: string;
  description: string;
  dateCreation: string;
  dateEcheance: string;
  statut: StatutObjectif;
}

interface PresenceEntry {
  employeeId: string;
  date: string; // YYYY-MM-DD
  statut: StatutPresence;
  time?: string; // HH:MM - heure du pointage (legacy / punch-in time)
  punchIn?: string; // HH:MM
  punchOut?: string; // HH:MM
  breakStart?: string; // HH:MM
  breakEnd?: string; // HH:MM
  location?: string; // GPS or manual location label
}

interface HRData {
  profiles: Record<string, HRProfile>;
  documents: HRDocument[];
  conges: DemandeConge[];
  balances: Record<string, BalanceConge>;
  notes: NoteSuivi[];
  objectifs: Objectif[];
  cnesstNumero: string;
  presences: PresenceEntry[];
}

// ============================================================
// Constantes
// ============================================================

const STORAGE_KEY = 'soshub_hr_data';
const EMPLOYEE_DOCS_STORAGE_KEY = 'soshub_hr_employee_docs';

// Coordinatrice has same access level as superadmin
const ADMIN_ROLES: CrmRole[] = ['superadmin', 'coordinatrice'];

const TABS = [
  { id: 'employes', label: 'Employes', icon: Users },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'conges', label: 'Conges & Absences', icon: CalendarDays },
  { id: 'suivi', label: 'Suivi & Evaluations', icon: ClipboardList },
  { id: 'presences', label: 'Presences', icon: UserCheck },
] as const;

const STATUT_EMPLOI_LABELS: Record<StatutEmploi, string> = {
  temps_plein: 'Temps plein',
  temps_partiel: 'Temps partiel',
  contractuel: 'Contractuel',
  probation: 'Probation',
  termine: 'Termine',
};

const TYPE_POSTE_LABELS: Record<TypePoste, string> = {
  permanent: 'Permanent',
  temporaire: 'Temporaire',
  saisonnier: 'Saisonnier',
};

const TYPE_CONGE_LABELS: Record<TypeConge, string> = {
  vacances: 'Vacances',
  maladie: 'Maladie',
  personnel: 'Personnel / Famille',
  ferie: 'Jour ferie',
  cnesst: 'CNESST',
  maternite_paternite: 'Maternite / Paternite',
  sans_solde: 'Sans solde',
};

const STATUT_CONGE_LABELS: Record<StatutConge, string> = {
  en_attente: 'En attente',
  approuve: 'Approuve',
  refuse: 'Refuse',
};

const STATUT_CONGE_COLORS: Record<StatutConge, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  approuve: 'bg-green-100 text-green-700',
  refuse: 'bg-red-100 text-red-700',
};

const CATEGORIE_DOC_LABELS: Record<CategorieDocument, string> = {
  contrat: 'Contrat de travail',
  cv: 'CV',
  diplome: 'Diplomes',
  certificat: 'Certificats',
  releve_emploi: "Releve d'emploi",
  t4_releve1: 'T4 / Releve 1',
  cnesst: 'CNESST',
  evaluation: 'Evaluation de rendement',
  avertissement: 'Avertissement',
  autre: 'Autre',
};

const EMPLOYEE_DOC_CATEGORY_LABELS: Record<EmployeeDocCategory, string> = {
  contrat_travail: 'Contrat de travail',
  piece_identite: "Piece d'identite",
  releve_emploi: "Releve d'emploi",
  t4_releve1: 'T4 / Releve 1',
  formulaire_td1: 'Formulaire TD1',
  attestation_cnesst: 'Attestation CNESST',
  formation_sst: 'Formation SST',
  evaluation_rendement: 'Evaluation de rendement',
  avertissement_disciplinaire: 'Avertissement disciplinaire',
  autre: 'Autre',
};

const STATUT_DOC_COLORS: Record<StatutDocument, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  verifie: 'bg-green-100 text-green-700',
  expire: 'bg-red-100 text-red-700',
};

const STATUT_DOC_LABELS: Record<StatutDocument, string> = {
  en_attente: 'En attente',
  verifie: 'Verifie',
  expire: 'Expire',
};

const STATUT_OBJECTIF_LABELS: Record<StatutObjectif, string> = {
  en_cours: 'En cours',
  atteint: 'Atteint',
  non_atteint: 'Non atteint',
};

const STATUT_OBJECTIF_COLORS: Record<StatutObjectif, string> = {
  en_cours: 'bg-blue-100 text-blue-700',
  atteint: 'bg-green-100 text-green-700',
  non_atteint: 'bg-red-100 text-red-700',
};

const NOTE_TYPE_LABELS: Record<string, string> = {
  evaluation: 'Evaluation de rendement',
  note: 'Note de suivi',
  formation: 'Formation & developpement',
  avertissement: 'Avertissement / Mesure disciplinaire',
  objectif: 'Objectif',
};

const NOTE_TYPE_COLORS: Record<string, string> = {
  evaluation: 'bg-purple-100 text-purple-700',
  note: 'bg-blue-100 text-blue-700',
  formation: 'bg-teal-100 text-teal-700',
  avertissement: 'bg-red-100 text-red-700',
  objectif: 'bg-amber-100 text-amber-700',
};

const SEXE_LABELS: Record<Sexe, string> = {
  homme: 'Homme',
  femme: 'Femme',
  autre: 'Autre',
  prefere_ne_pas_repondre: 'Prefere ne pas repondre',
};

const ETAT_CIVIL_LABELS: Record<EtatCivil, string> = {
  celibataire: 'Celibataire',
  marie: 'Marie(e)',
  conjoint_de_fait: 'Conjoint(e) de fait',
  divorce: 'Divorce(e)',
  veuf: 'Veuf / Veuve',
};

const MODE_PAIEMENT_LABELS: Record<ModePaiement, string> = {
  virement: 'Virement',
  cheque: 'Cheque',
};

const FREQUENCE_PAIE_LABELS: Record<FrequencePaie, string> = {
  hebdomadaire: 'Hebdomadaire',
  bi_hebdomadaire: 'Bi-hebdomadaire',
  bimensuel: 'Bimensuel',
  mensuel: 'Mensuel',
};

const RELATION_URGENCE_LABELS: Record<RelationUrgence, string> = {
  conjoint: 'Conjoint(e)',
  parent: 'Parent',
  enfant: 'Enfant',
  ami: 'Ami(e)',
  autre: 'Autre',
};

const STATUT_PRESENCE_LABELS: Record<StatutPresence, string> = {
  present: 'Present',
  absent: 'Absent',
  retard: 'Retard',
  teletravail: 'Teletravail',
  conge: 'Conge',
  ferie: 'Ferie',
};

const STATUT_PRESENCE_COLORS: Record<StatutPresence, string> = {
  present: 'bg-green-500',
  absent: 'bg-red-500',
  retard: 'bg-yellow-500',
  teletravail: 'bg-blue-500',
  conge: 'bg-gray-400',
  ferie: 'bg-purple-500',
};

const STATUT_PRESENCE_TEXT_COLORS: Record<StatutPresence, string> = {
  present: 'text-green-700 bg-green-100',
  absent: 'text-red-700 bg-red-100',
  retard: 'text-yellow-700 bg-yellow-100',
  teletravail: 'text-blue-700 bg-blue-100',
  conge: 'text-gray-700 bg-gray-100',
  ferie: 'text-purple-700 bg-purple-100',
};

// ============================================================
// Helpers
// ============================================================

function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

function defaultProfile(userId: string, index: number): HRProfile {
  return {
    userId,
    employeeNumber: `EMP-${String(index + 1).padStart(3, '0')}`,
    prenom: '',
    nomFamille: '',
    dateNaissance: '',
    sexe: 'prefere_ne_pas_repondre',
    etatCivil: 'celibataire',
    nasLastThree: '',
    langueMaternelle: '',
    languesParlees: '',
    adresseRue: '',
    adresseVille: '',
    adresseProvince: 'QC',
    adresseCodePostal: '',
    telephonePersonnel: '',
    telephoneUrgence: '',
    courrielPersonnel: '',
    contactUrgence: { nom: '', telephone: '', relation: 'autre' },
    dateEmbauche: '',
    dateFin: '',
    statutEmploi: 'temps_plein',
    typePoste: 'permanent',
    departement: '',
    poste: '',
    superviseur: '',
    salaire: '',
    tauxHoraire: '',
    modePaiement: 'virement',
    frequencePaie: 'bi_hebdomadaire',
    classificationEmploi: '',
    tauxCotisation: '',
    accidentsTravail: [],
    formationsSST: [],
    adresse: '',
  };
}

function defaultBalance(employeeId: string): BalanceConge {
  return {
    employeeId,
    vacances: { utilises: 0, disponibles: 10 },
    maladie: { utilises: 0, disponibles: 2 },
    personnel: { utilises: 0, disponibles: 2 },
  };
}

function defaultHRData(): HRData {
  const profiles: Record<string, HRProfile> = {};
  const balances: Record<string, BalanceConge> = {};
  DEMO_USERS.forEach((u, i) => {
    profiles[u.id] = defaultProfile(u.id, i);
    balances[u.id] = defaultBalance(u.id);
  });
  return {
    profiles,
    documents: [],
    conges: [],
    balances,
    notes: [],
    objectifs: [],
    cnesstNumero: '',
    presences: [],
  };
}

function migrateProfile(p: HRProfile, userId: string, index: number): HRProfile {
  const def = defaultProfile(userId, index);
  return { ...def, ...p };
}

function loadHRData(): HRData {
  if (typeof window === 'undefined') return defaultHRData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HRData;
      DEMO_USERS.forEach((u, i) => {
        if (!parsed.profiles[u.id]) {
          parsed.profiles[u.id] = defaultProfile(u.id, i);
        } else {
          parsed.profiles[u.id] = migrateProfile(parsed.profiles[u.id], u.id, i);
        }
        if (!parsed.balances[u.id]) {
          parsed.balances[u.id] = defaultBalance(u.id);
        }
      });
      if (!parsed.objectifs) parsed.objectifs = [];
      if (!parsed.cnesstNumero) parsed.cnesstNumero = '';
      if (!parsed.presences) parsed.presences = [];
      return parsed;
    }
  } catch (e) { console.error("Erreur chargement donnees RH:", e); }
  return defaultHRData();
}

function saveHRData(data: HRData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// Employee private documents storage helpers
function loadEmployeeDocs(): EmployeePrivateDocument[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EMPLOYEE_DOCS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EmployeePrivateDocument[];
  } catch (e) { console.error("Erreur chargement documents employe:", e); }
  return [];
}

function saveEmployeeDocs(docs: EmployeePrivateDocument[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EMPLOYEE_DOCS_STORAGE_KEY, JSON.stringify(docs));
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1048576).toFixed(1)} Mo`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
];

function getUserById(id: string): CrmUser | undefined {
  return DEMO_USERS.find(u => u.id === id);
}

function daysBetween(d1: string, d2: string): number {
  const a = new Date(d1);
  const b = new Date(d2);
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function isAdminRole(role: CrmRole): boolean {
  return ADMIN_ROLES.includes(role);
}

function canApproveLeave(role: CrmRole): boolean {
  return role === 'superadmin' || role === 'coordinatrice';
}

function canViewSalary(role: CrmRole): boolean {
  return role === 'superadmin' || role === 'coordinatrice';
}

function canEditAllProfiles(role: CrmRole): boolean {
  return role === 'superadmin' || role === 'coordinatrice';
}

// Document visibility -- employee themselves + admin roles (superadmin, coordinatrice)
function canViewEmployeeDocs(viewerRole: CrmRole, viewerId: string, employeeId: string): boolean {
  if (viewerRole === 'superadmin' || viewerRole === 'coordinatrice') return true;
  return viewerId === employeeId;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

// ============================================================
// Main Page Component
// ============================================================

export default function RessourcesHumainesPage() {
  const { currentUser } = useCrm();
  const [activeTab, setActiveTab] = useState<string>('employes');
  const [hrData, setHrData] = useState<HRData>(defaultHRData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHrData(loadHRData());
    setIsLoaded(true);
  }, []);

  const updateData = useCallback((updater: (prev: HRData) => HRData) => {
    setHrData(prev => {
      const next = updater(prev);
      saveHRData(next);
      return next;
    });
  }, []);

  if (!currentUser) return null;
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B2559] mb-4" />
        <p className="text-gray-500 text-sm">Chargement des donnees RH...</p>
      </div>
    );
  }

  const isAdmin = isAdminRole(currentUser.role);
  const isSuperAdmin = currentUser.role === 'superadmin';

  const pendingCongesCount = hrData.conges.filter(c => c.statut === 'en_attente').length;

  // Non-admin users see only their own profile
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B2559] flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ressources humaines</h1>
            <p className="text-sm text-gray-500">Mon profil employe</p>
          </div>
        </div>

        <NonAdminView
          currentUser={currentUser}
          hrData={hrData}
          updateData={updateData}
        />
      </div>
    );
  }

  // Superadmin view with full access
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1B2559] flex items-center justify-center">
          <Users size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ressources humaines</h1>
          <p className="text-sm text-gray-500">Gestion du personnel - SOS Hub Canada</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center relative ${
              activeTab === tab.id
                ? 'bg-white text-[#1B2559] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.id === 'conges' && pendingCongesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCongesCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'employes' && (
        <TabEmployes hrData={hrData} updateData={updateData} isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} currentUser={currentUser} />
      )}
      {activeTab === 'documents' && (
        <TabDocuments hrData={hrData} updateData={updateData} />
      )}
      {activeTab === 'conges' && (
        <TabConges hrData={hrData} updateData={updateData} currentUser={currentUser} />
      )}
      {activeTab === 'suivi' && (
        <TabSuivi hrData={hrData} updateData={updateData} />
      )}
      {activeTab === 'presences' && (
        <TabPresences hrData={hrData} updateData={updateData} currentUser={currentUser} />
      )}
    </div>
  );
}

// ============================================================
// Non-Admin View (now includes coordinatrice)
// ============================================================

function NonAdminView({
  currentUser, hrData, updateData,
}: {
  currentUser: CrmUser;
  hrData: HRData;
  updateData: (fn: (prev: HRData) => HRData) => void;
}) {
  // CHANGE 3: tabs now include "Mes documents"
  const [subTab, setSubTab] = useState<'profil' | 'documents' | 'conges' | 'presences'>('profil');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
        {[
          { id: 'profil' as const, label: 'Mon profil', icon: Users },
          { id: 'documents' as const, label: 'Mes documents', icon: FileText },
          { id: 'conges' as const, label: 'Mes conges', icon: CalendarDays },
          { id: 'presences' as const, label: 'Mes presences', icon: UserCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              subTab === tab.id
                ? 'bg-white text-[#1B2559] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'profil' && (
        <EmployeeDetailPanel
          user={currentUser}
          profile={hrData?.profiles?.[currentUser?.id]}
          isSuperAdmin={false}
          isAdmin={false}
          hrData={hrData}
          onClose={() => {}}
          updateData={updateData}
          isOwnProfile
          currentUserRole={currentUser.role}
          currentUserId={currentUser.id}
        />
      )}
      {subTab === 'documents' && (
        <EmployeeDocumentsSection
          employeeId={currentUser.id}
          viewerRole={currentUser.role}
          viewerId={currentUser.id}
        />
      )}
      {subTab === 'conges' && (
        <NonAdminConges currentUser={currentUser} hrData={hrData} updateData={updateData} />
      )}
      {subTab === 'presences' && (
        <NonAdminPresences currentUser={currentUser} hrData={hrData} updateData={updateData} />
      )}
    </div>
  );
}

// ============================================================
// Non-Admin Conges (own requests only)
// ============================================================

function NonAdminConges({
  currentUser, hrData, updateData,
}: {
  currentUser: CrmUser;
  hrData: HRData;
  updateData: (fn: (prev: HRData) => HRData) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    type: 'vacances' as TypeConge,
    dateDebut: '',
    dateFin: '',
    notes: '',
  });

  const myConges = hrData.conges
    .filter(c => c.employeeId === currentUser.id)
    .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));

  const balance = hrData.balances[currentUser.id] || defaultBalance(currentUser.id);

  const submitRequest = () => {
    if (!requestForm.dateDebut || !requestForm.dateFin) return;
    const conge: DemandeConge = {
      id: generateId(),
      employeeId: currentUser.id,
      type: requestForm.type,
      dateDebut: requestForm.dateDebut,
      dateFin: requestForm.dateFin,
      notes: requestForm.notes,
      statut: 'en_attente',
      dateCreation: todayStr(),
    };
    updateData(prev => ({ ...prev, conges: [...prev.conges, conge] }));
    setRequestForm({ type: 'vacances', dateDebut: '', dateFin: '', notes: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Balance */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h4 className="font-semibold text-gray-900 mb-3">Mon solde de conges</h4>
        <div className="space-y-3">
          <BalanceBar label="Vacances" used={balance.vacances.utilises} total={balance.vacances.disponibles} color="bg-blue-500" />
          <BalanceBar label="Maladie" used={balance.maladie.utilises} total={balance.maladie.disponibles} color="bg-red-400" />
          <BalanceBar label="Personnel" used={balance.personnel.utilises} total={balance.personnel.disponibles} color="bg-purple-400" />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1B2559] text-white text-sm font-medium rounded-xl hover:bg-[#1B2559]/90 transition-all">
          <Plus size={16} /> Demander un conge
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h4 className="font-semibold text-gray-900">Nouvelle demande de conge</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={requestForm.type} onChange={e => setRequestForm({ ...requestForm, type: e.target.value as TypeConge })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
                {Object.entries(TYPE_CONGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date de debut</label>
              <input type="date" value={requestForm.dateDebut} onChange={e => setRequestForm({ ...requestForm, dateDebut: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date de fin</label>
              <input type="date" value={requestForm.dateFin} onChange={e => setRequestForm({ ...requestForm, dateFin: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <textarea value={requestForm.notes} onChange={e => setRequestForm({ ...requestForm, notes: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" rows={2}
              placeholder="Notes optionnelles..." />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:underline">Annuler</button>
            <button onClick={submitRequest} className="px-4 py-2 bg-[#1B2559] text-white text-sm rounded-lg hover:bg-[#1B2559]/90">
              Soumettre
            </button>
          </div>
        </div>
      )}

      {/* My requests */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h4 className="font-semibold text-gray-900 mb-3">Mes demandes</h4>
        {myConges.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Aucune demande de conge</p>
        ) : (
          <div className="space-y-2">
            {myConges.map(conge => (
              <div key={conge.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {TYPE_CONGE_LABELS[conge.type]} &middot; {conge.dateDebut} au {conge.dateFin}
                  </p>
                  {conge.notes && <p className="text-xs text-gray-500">{conge.notes}</p>}
                  {conge.refusalReason && <p className="text-xs text-red-600 mt-0.5">Raison du refus : {conge.refusalReason}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUT_CONGE_COLORS[conge.statut]}`}>
                  {STATUT_CONGE_LABELS[conge.statut]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Non-Admin Presences — KIOSK-STYLE Punch In / Out
// Big buttons, touch-friendly, designed for market stand use
// ============================================================

function NonAdminPresences({
  currentUser, hrData, updateData,
}: {
  currentUser: CrmUser;
  hrData: HRData;
  updateData: (fn: (prev: HRData) => HRData) => void;
}) {
  const [liveClock, setLiveClock] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const todayPresence = hrData.presences.find(p => p.employeeId === currentUser.id && p.date === todayStr());
  const hh = String(liveClock.getHours()).padStart(2, '0');
  const mm = String(liveClock.getMinutes()).padStart(2, '0');
  const ss = String(liveClock.getSeconds()).padStart(2, '0');
  const timeNow = `${hh}:${mm}`;

  // Determine current state
  const isPunchedIn = !!todayPresence?.punchIn && !todayPresence?.punchOut;
  const isPunchedOut = !!todayPresence?.punchIn && !!todayPresence?.punchOut;
  const isOnBreak = !!todayPresence?.breakStart && !todayPresence?.breakEnd;
  const hasNotStarted = !todayPresence?.punchIn;

  // Calculate worked hours
  const calcWorkedMinutes = () => {
    if (!todayPresence?.punchIn) return 0;
    const [inH, inM] = todayPresence.punchIn.split(':').map(Number);
    const endTime = todayPresence.punchOut
      ? todayPresence.punchOut.split(':').map(Number)
      : [liveClock.getHours(), liveClock.getMinutes()];
    let totalMin = (endTime[0] - inH) * 60 + (endTime[1] - inM);
    // Subtract break time
    if (todayPresence.breakStart && todayPresence.breakEnd) {
      const [bsH, bsM] = todayPresence.breakStart.split(':').map(Number);
      const [beH, beM] = todayPresence.breakEnd.split(':').map(Number);
      totalMin -= (beH - bsH) * 60 + (beM - bsM);
    } else if (todayPresence.breakStart && !todayPresence.breakEnd) {
      const [bsH, bsM] = todayPresence.breakStart.split(':').map(Number);
      totalMin -= (liveClock.getHours() - bsH) * 60 + (liveClock.getMinutes() - bsM);
    }
    // Guard against unreasonable values (max 24h = 1440 min)
    const result = Math.max(0, totalMin);
    return result > 1440 ? 0 : result;
  };

  const workedMin = calcWorkedMinutes();
  const workedHours = Math.floor(workedMin / 60);
  const workedMins = workedMin % 60;

  const updatePresence = (patch: Partial<PresenceEntry>) => {
    const dateKey = todayStr();
    updateData(prev => {
      const idx = prev.presences.findIndex(p => p.employeeId === currentUser.id && p.date === dateKey);
      const updated = [...prev.presences];
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], ...patch };
      } else {
        updated.push({ employeeId: currentUser.id, date: dateKey, statut: 'present', time: timeNow, ...patch });
      }
      return { ...prev, presences: updated };
    });
  };

  const handlePunchIn = () => {
    updatePresence({ punchIn: timeNow, punchOut: undefined, breakStart: undefined, breakEnd: undefined, statut: 'present', time: timeNow });
  };

  const handlePunchOut = () => {
    updatePresence({ punchOut: timeNow });
  };

  const handleBreakStart = () => {
    updatePresence({ breakStart: timeNow, breakEnd: undefined });
  };

  const handleBreakEnd = () => {
    updatePresence({ breakEnd: timeNow });
  };

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Compact Clock */}
      <div className="bg-[#1B2559] rounded-2xl p-5 text-center shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-white/60 text-xs tracking-wider uppercase">
            {dayNames[liveClock.getDay()]} {liveClock.getDate()} {monthNames[liveClock.getMonth()]}
          </p>
          <p className="text-white/40 text-xs">{currentUser.name}</p>
        </div>
        <p className="text-white text-4xl font-bold tracking-tight mt-2 font-mono">
          {hh}:{mm}<span className="text-xl text-[#D4A03C]">:{ss}</span>
        </p>
      </div>

      {/* Status + Timer */}
      {todayPresence?.punchIn && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Heures travaillées</p>
              <p className="text-2xl font-bold text-[#1B2559] mt-0.5">
                {workedHours}h {String(workedMins).padStart(2, '0')}min
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isPunchedOut ? 'bg-gray-400' : isOnBreak ? 'bg-amber-400 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <div className="bg-green-50 rounded-lg px-3 py-1.5 text-center flex-1 min-w-0">
              <p className="text-[9px] text-green-600 uppercase">Arrivée</p>
              <p className="text-sm font-bold text-green-800">{todayPresence.punchIn}</p>
            </div>
            {todayPresence.breakStart && (
              <div className="bg-amber-50 rounded-lg px-3 py-1.5 text-center flex-1 min-w-0">
                <p className="text-[9px] text-amber-600 uppercase">Pause</p>
                <p className="text-sm font-bold text-amber-800">
                  {todayPresence.breakStart}{todayPresence.breakEnd ? ` — ${todayPresence.breakEnd}` : ' ...'}
                </p>
              </div>
            )}
            {todayPresence.punchOut && (
              <div className="bg-red-50 rounded-lg px-3 py-1.5 text-center flex-1 min-w-0">
                <p className="text-[9px] text-red-600 uppercase">Départ</p>
                <p className="text-sm font-bold text-red-800">{todayPresence.punchOut}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS — standard size */}
      <div className="space-y-2">
        {hasNotStarted && (
          <button onClick={handlePunchIn}
            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 active:scale-[0.98] text-white font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-3">
            <Clock className="w-5 h-5" />
            Punch In
          </button>
        )}

        {isPunchedIn && !isOnBreak && (
          <div className="flex gap-2">
            <button onClick={handlePunchOut}
              className="flex-1 py-4 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 active:scale-[0.98] text-white font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-2">
              <XCircle className="w-5 h-5" />
              Punch Out
            </button>
            {!todayPresence?.breakStart && (
              <button onClick={handleBreakStart}
                className="py-4 px-5 rounded-xl bg-amber-100 hover:bg-amber-200 active:bg-amber-300 active:scale-[0.98] text-amber-800 font-semibold text-sm border border-amber-300 transition-all flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Pause
              </button>
            )}
          </div>
        )}

        {isOnBreak && (
          <button onClick={handleBreakEnd}
            className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 active:scale-[0.98] text-white font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            Fin de pause
          </button>
        )}

        {isPunchedOut && (
          <div className="bg-white rounded-xl border border-green-200 p-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-base font-bold text-[#1B2559]">Journée terminée</p>
            <p className="text-xs text-gray-500">{todayPresence?.punchIn} — {todayPresence?.punchOut}</p>
            <p className="text-lg font-bold text-green-600 mt-1">
              {workedHours}h {String(workedMins).padStart(2, '0')}min
            </p>
          </div>
        )}

        {hasNotStarted && (
          <div className="flex gap-2 justify-center">
            {(['teletravail', 'absent'] as StatutPresence[]).map(s => (
              <button key={s} onClick={() => updatePresence({ statut: s, time: timeNow })}
                className="px-4 py-2 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-all">
                {STATUT_PRESENCE_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-[11px] text-blue-700">
          <strong>Note :</strong> Pointage pour aujourd&apos;hui uniquement.
          Pour corrections, contactez votre superviseur.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// CHANGE 2: Employee Documents Section (private per-employee)
// ============================================================

function EmployeeDocumentsSection({
  employeeId,
  viewerRole,
  viewerId,
}: {
  employeeId: string;
  viewerRole: CrmRole;
  viewerId: string;
}) {
  const [docs, setDocs] = useState<EmployeePrivateDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EmployeeDocCategory>('contrat_travail');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const all = loadEmployeeDocs();
    setDocs(all.filter(d => d.employeeId === employeeId));
  }, [employeeId]);

  const canView = canViewEmployeeDocs(viewerRole, viewerId, employeeId);

  if (!canView) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
        <Lock size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">Acces restreint</p>
        <p className="text-gray-400 text-xs mt-1">Seul l&apos;employe et les administrateurs peuvent voir ces documents</p>
      </div>
    );
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024;

    Array.from(files).forEach(file => {
      if (!allowed.includes(file.type)) {
        alert(`Type de fichier non accepte: ${file.name}. Accepte: PDF, JPG, PNG`);
        return;
      }
      if (file.size > maxSize) {
        alert(`Fichier trop volumineux: ${file.name}. Maximum: 10 Mo`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newDoc: EmployeePrivateDocument = {
          id: generateId(),
          employeeId,
          nom: file.name,
          categorie: selectedCategory,
          dateTelechargement: todayStr(),
          tailleFichier: file.size,
          typeFichier: file.type,
          fileDataUrl: reader.result as string,
        };
        const allDocs = loadEmployeeDocs();
        allDocs.push(newDoc);
        saveEmployeeDocs(allDocs);
        setDocs(allDocs.filter(d => d.employeeId === employeeId));
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteDoc = (docId: string) => {
    const allDocs = loadEmployeeDocs().filter(d => d.id !== docId);
    saveEmployeeDocs(allDocs);
    setDocs(allDocs.filter(d => d.employeeId === employeeId));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={18} className="text-[#1B2559]" />
        <h4 className="font-semibold text-gray-900">Documents</h4>
        <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
          <Lock size={10} /> Prive - visible seulement par l&apos;employe et les administrateurs
        </span>
      </div>

      {/* Upload area */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as EmployeeDocCategory)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20"
          >
            {Object.entries(EMPLOYEE_DOC_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            dragActive ? 'border-[#D4A03C] bg-[#D4A03C]/5' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={e => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={28} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Glissez-deposez vos fichiers ici ou cliquez pour selectionner</p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG - Maximum 10 Mo</p>
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
            multiple onChange={e => handleFileUpload(e.target.files)} />
        </div>
      </div>

      {/* Documents list */}
      {docs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Aucun document telecharge</p>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.nom}</p>
                  <p className="text-xs text-gray-500">
                    {EMPLOYEE_DOC_CATEGORY_LABELS[doc.categorie]} &middot; {doc.dateTelechargement} &middot; {formatFileSize(doc.tailleFichier)}
                  </p>
                </div>
              </div>
              <button onClick={() => deleteDoc(doc.id)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0" title="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CHANGE 1: Add Employee Modal (superadmin only)
// ============================================================

function AddEmployeeModal({
  onClose,
  hrData,
  updateData,
}: {
  onClose: () => void;
  hrData: HRData;
  updateData: (fn: (prev: HRData) => HRData) => void;
}) {
  const [form, setForm] = useState({
    prenom: '',
    nomFamille: '',
    email: '',
    role: 'receptionniste' as CrmRole,
    dateEmbauche: '',
    dateNaissance: '',
    sexe: 'prefere_ne_pas_repondre' as Sexe,
    etatCivil: 'celibataire' as EtatCivil,
    telephonePersonnel: '',
    departement: '',
    poste: '',
    statutEmploi: 'temps_plein' as StatutEmploi,
    typePoste: 'permanent' as TypePoste,
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; password?: string; message?: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const inputCls = "border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20";
  const inputErrorCls = "border border-red-300 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-200";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\d+\-() ]{7,20}$/;

  const isValid = form.prenom.trim() && form.nomFamille.trim() && form.email.trim() && form.dateEmbauche;

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!form.prenom.trim()) errors.push("Le prenom est obligatoire.");
    if (!form.nomFamille.trim()) errors.push("Le nom de famille est obligatoire.");
    if (!form.email.trim()) {
      errors.push("Le courriel est obligatoire.");
    } else if (!emailRegex.test(form.email.trim())) {
      errors.push("Le format du courriel est invalide (ex: nom@domaine.com).");
    }
    if (!form.dateEmbauche) errors.push("La date d'embauche est obligatoire.");
    if (form.telephonePersonnel && !phoneRegex.test(form.telephonePersonnel)) {
      errors.push("Le format du telephone est invalide (ex: +1-514-555-0000).");
    }
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    setValidationErrors(errors);
    if (errors.length > 0 || submitting) return;
    setSubmitting(true);

    const password = generatePassword();
    const newUserId = `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const profileCount = Object.keys(hrData.profiles).length;

    // Create the HR profile locally
    const newProfile: HRProfile = {
      ...defaultProfile(newUserId, profileCount),
      prenom: form.prenom,
      nomFamille: form.nomFamille,
      dateEmbauche: form.dateEmbauche,
      dateNaissance: form.dateNaissance,
      sexe: form.sexe,
      etatCivil: form.etatCivil,
      telephonePersonnel: form.telephonePersonnel,
      departement: form.departement,
      poste: form.poste,
      statutEmploi: form.statutEmploi,
      typePoste: form.typePoste,
    };

    updateData(prev => ({
      ...prev,
      profiles: { ...prev.profiles, [newUserId]: newProfile },
      balances: { ...prev.balances, [newUserId]: defaultBalance(newUserId) },
    }));

    // Try to create Supabase Auth account via API (only if real session exists)
    let apiSuccess = false;
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const res = await crmFetch('/api/crm/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: `${form.prenom} ${form.nomFamille}`,
            email: form.email,
            password,
            role: form.role,
          }),
        });
        if (res.ok) apiSuccess = true;
      }
    } catch (e) { console.error("Erreur creation compte Supabase (profil sauvegarde localement):", e); }

    setResult({
      success: true,
      password,
      message: apiSuccess
        ? 'Employe cree avec succes. Le compte Supabase a ete cree.'
        : 'Employe cree avec succes (mode local).',
    });

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">Ajouter un employe</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {result ? (
          <div className="p-5 space-y-4">
            <div className={`rounded-xl p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? 'Succes!' : 'Erreur'}
              </p>
              <p className="text-sm text-gray-700 mt-1">{result.message}</p>
            </div>
            {result.password && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-700 font-semibold mb-1">Mot de passe genere (affiche une seule fois) :</p>
                <p className="font-mono text-lg text-amber-900 bg-amber-100 rounded-lg px-3 py-2 select-all">{result.password}</p>
                <p className="text-xs text-amber-600 mt-2">Copiez ce mot de passe maintenant. Il ne sera plus affiche.</p>
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-[#1B2559] text-white text-sm rounded-lg hover:bg-[#1B2559]/90">
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Prenom *</label>
                <input type="text" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
                  className={inputCls} placeholder="Prenom" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nom de famille *</label>
                <input type="text" value={form.nomFamille} onChange={e => setForm({ ...form, nomFamille: e.target.value })}
                  className={inputCls} placeholder="Nom de famille" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Courriel (travail) *</label>
                <input type="email" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setValidationErrors([]); }}
                  className={form.email && !emailRegex.test(form.email) ? inputErrorCls : inputCls} placeholder="prenom@soshubcanada.com" />
                {form.email && !emailRegex.test(form.email) && (
                  <p className="text-[10px] text-red-500 mt-0.5">Format invalide</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Role *</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as CrmRole })}
                  className={inputCls}>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Date d&apos;embauche *</label>
                <input type="date" value={form.dateEmbauche} onChange={e => setForm({ ...form, dateEmbauche: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Date de naissance</label>
                <input type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Sexe</label>
                <select value={form.sexe} onChange={e => setForm({ ...form, sexe: e.target.value as Sexe })}
                  className={inputCls}>
                  {Object.entries(SEXE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Etat civil</label>
                <select value={form.etatCivil} onChange={e => setForm({ ...form, etatCivil: e.target.value as EtatCivil })}
                  className={inputCls}>
                  {Object.entries(ETAT_CIVIL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Telephone personnel</label>
                <input type="tel" value={form.telephonePersonnel} onChange={e => { setForm({ ...form, telephonePersonnel: e.target.value }); setValidationErrors([]); }}
                  className={form.telephonePersonnel && !phoneRegex.test(form.telephonePersonnel) ? inputErrorCls : inputCls} placeholder="+1-514-555-0000" />
                {form.telephonePersonnel && !phoneRegex.test(form.telephonePersonnel) && (
                  <p className="text-[10px] text-red-500 mt-0.5">Format invalide</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Departement</label>
                <input type="text" value={form.departement} onChange={e => setForm({ ...form, departement: e.target.value })}
                  className={inputCls} placeholder="Ex: Immigration" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Poste / Titre</label>
                <input type="text" value={form.poste} onChange={e => setForm({ ...form, poste: e.target.value })}
                  className={inputCls} placeholder="Ex: Technicienne juridique" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Statut d&apos;emploi</label>
                <select value={form.statutEmploi} onChange={e => setForm({ ...form, statutEmploi: e.target.value as StatutEmploi })}
                  className={inputCls}>
                  {Object.entries(STATUT_EMPLOI_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Type de poste</label>
                <select value={form.typePoste} onChange={e => setForm({ ...form, typePoste: e.target.value as TypePoste })}
                  className={inputCls}>
                  {Object.entries(TYPE_POSTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
                {validationErrors.map((err, i) => (
                  <p key={i} className="text-xs text-red-700 flex items-center gap-1.5">
                    <AlertCircle size={12} className="flex-shrink-0" /> {err}
                  </p>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400">* Champs obligatoires. Un mot de passe sera genere automatiquement et affiche une seule fois.</p>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
              <button
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  isValid && !submitting
                    ? 'bg-[#1B2559] text-white hover:bg-[#1B2559]/90'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Creation en cours...' : 'Creer l\'employe'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Tab 1: Employes
// ============================================================

function TabEmployes({
  hrData, updateData, isSuperAdmin, isAdmin, currentUser,
}: {
  hrData: HRData;
  updateData: (fn: (prev: HRData) => HRData) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  currentUser: CrmUser;
}) {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showCnesst, setShowCnesst] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const users = DEMO_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Also include dynamically created profiles (users not in DEMO_USERS)
  const dynamicUserIds = Object.keys(hrData.profiles).filter(
    id => !DEMO_USERS.some(u => u.id === id)
  );

  const selectedUser = selectedUserId ? getUserById(selectedUserId) : null;
  const selectedProfile = selectedUserId ? hrData?.profiles?.[selectedUserId] ?? null : null;

  // For dynamically created users, build a synthetic CrmUser object
  const getDynamicUser = (userId: string): CrmUser | undefined => {
    const profile = hrData.profiles[userId];
    if (!profile) return undefined;
    return {
      id: userId,
      name: `${profile.prenom} ${profile.nomFamille}`.trim() || `Employe ${profile.employeeNumber}`,
      email: profile.courrielPersonnel || '',
      role: 'receptionniste',
      active: profile.statutEmploi !== 'termine',
    };
  };

  const effectiveSelectedUser = selectedUser || (selectedUserId ? getDynamicUser(selectedUserId) : null);

  return (
    <div className="space-y-4">
      {/* Search + CNESST toggle + Add button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un employe..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20 focus:border-[#1B2559]"
          />
        </div>
        <button
          onClick={() => setShowCnesst(!showCnesst)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            showCnesst ? 'bg-[#1B2559] text-white border-[#1B2559]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Shield size={16} />
          CNESST
        </button>
        {/* Add Employee button - admin roles (superadmin + coordinatrice) */}
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1B2559] text-white text-sm font-medium rounded-xl hover:bg-[#1B2559]/90 transition-all"
          >
            <Plus size={16} /> Ajouter un employe
          </button>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          hrData={hrData}
          updateData={updateData}
        />
      )}

      {/* CNESST Section */}
      {showCnesst && (
        <CnesstSection hrData={hrData} updateData={updateData} />
      )}

      {/* Employee Grid */}
      {effectiveSelectedUser && selectedProfile ? (
        <EmployeeDetailPanel
          user={effectiveSelectedUser}
          profile={selectedProfile}
          isSuperAdmin={isSuperAdmin}
          isAdmin={isAdmin}
          hrData={hrData}
          onClose={() => setSelectedUserId(null)}
          updateData={updateData}
          currentUserRole={currentUser.role}
          currentUserId={currentUser.id}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.length === 0 && dynamicUserIds.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Aucun employe trouve</p>
            </div>
          ) : (
            <>
              {users.map(user => {
                const profile = hrData.profiles[user.id];
                if (!profile) return null;
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-left hover:shadow-md hover:border-[#D4A03C]/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#1B2559] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <p className="text-xs text-[#1B2559] font-medium mt-0.5">
                          {ROLE_LABELS[user.role]}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono">
                        {profile.employeeNumber}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        profile.statutEmploi === 'probation' ? 'bg-yellow-100 text-yellow-700' :
                        profile.statutEmploi === 'termine' ? 'bg-red-100 text-red-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {STATUT_EMPLOI_LABELS[profile.statutEmploi]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {TYPE_POSTE_LABELS[profile.typePoste]}
                      </span>
                    </div>
                    {profile.dateEmbauche && (
                      <p className="text-xs text-gray-400 mt-2">
                        Depuis le {new Date(profile.dateEmbauche).toLocaleDateString('fr-CA')}
                      </p>
                    )}
                  </button>
                );
              })}
              {/* Dynamic users (created via Add Employee) */}
              {dynamicUserIds.map(userId => {
                const profile = hrData.profiles[userId];
                if (!profile) return null;
                const displayName = `${profile.prenom} ${profile.nomFamille}`.trim() || `Employe ${profile.employeeNumber}`;
                if (search && !displayName.toLowerCase().includes(search.toLowerCase())) return null;
                return (
                  <button
                    key={userId}
                    onClick={() => setSelectedUserId(userId)}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-left hover:shadow-md hover:border-[#D4A03C]/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#1B2559] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {displayName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
                        <p className="text-xs text-gray-500 truncate">{profile.courrielPersonnel || 'Nouveau'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono">
                        {profile.employeeNumber}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        profile.statutEmploi === 'probation' ? 'bg-yellow-100 text-yellow-700' :
                        profile.statutEmploi === 'termine' ? 'bg-red-100 text-red-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {STATUT_EMPLOI_LABELS[profile.statutEmploi]}
                      </span>
                    </div>
                    {profile.dateEmbauche && (
                      <p className="text-xs text-gray-400 mt-2">
                        Depuis le {new Date(profile.dateEmbauche).toLocaleDateString('fr-CA')}
                      </p>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CNESST Section
// ============================================================

function CnesstSection({ hrData, updateData }: { hrData: HRData; updateData: (fn: (prev: HRData) => HRData) => void }) {
  const [editingNumero, setEditingNumero] = useState(false);
  const [numero, setNumero] = useState(hrData.cnesstNumero);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Shield size={20} className="text-[#1B2559]" />
        <h3 className="font-semibold text-gray-900">Conformite CNESST</h3>
      </div>

      {/* Numero employeur */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 font-medium">Numero d&apos;employeur CNESST :</span>
        {editingNumero ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={numero}
              onChange={e => setNumero(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20"
              placeholder="Ex: 1234567-8"
            />
            <button
              onClick={() => {
                updateData(prev => ({ ...prev, cnesstNumero: numero }));
                setEditingNumero(false);
              }}
              className="text-sm text-[#1B2559] font-medium hover:underline"
            >
              Sauvegarder
            </button>
            <button onClick={() => { setNumero(hrData.cnesstNumero); setEditingNumero(false); }} className="text-sm text-gray-400 hover:underline">
              Annuler
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-900">{hrData.cnesstNumero || 'Non défini'}</span>
            <button onClick={() => setEditingNumero(true)} className="text-gray-400 hover:text-[#1B2559]">
              <Edit3 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Employes actifs</p>
          <p className="text-xl font-bold text-gray-900">{DEMO_USERS.filter(u => u.active).length}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Accidents ouverts</p>
          <p className="text-xl font-bold text-gray-900">
            {Object.values(hrData.profiles).reduce((acc, p) => acc + (p.accidentsTravail?.filter(a => a.statut === 'ouvert').length || 0), 0)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Formations SST a jour</p>
          <p className="text-xl font-bold text-gray-900">
            {Object.values(hrData.profiles).reduce((acc, p) => {
              const valid = (p.formationsSST || []).filter(f => !f.dateExpiration || new Date(f.dateExpiration) > new Date());
              return acc + (valid.length > 0 ? 1 : 0);
            }, 0)} / {DEMO_USERS.length}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Employee Detail Panel - Extended profile
// ============================================================

function EmployeeDetailPanel({
  user, profile, isSuperAdmin, isAdmin, hrData, onClose, updateData, isOwnProfile, currentUserRole, currentUserId,
}: {
  user: CrmUser;
  profile: HRProfile | undefined;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  hrData: HRData;
  onClose: () => void;
  updateData: (fn: (prev: HRData) => HRData) => void;
  isOwnProfile?: boolean;
  currentUserRole?: CrmRole;
  currentUserId?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [form, setForm] = useState<HRProfile>(profile ? { ...profile } : defaultProfile(user?.id ?? '', 0));

  if (!profile) return <div className="text-center py-8 text-gray-400">Profil non disponible</div>;
  const [showAccidentForm, setShowAccidentForm] = useState(false);
  const [showSSTForm, setShowSSTForm] = useState(false);
  const [section, setSection] = useState<'personnel' | 'coordonnees' | 'urgence' | 'emploi' | 'cnesst' | 'documents'>('personnel');

  const effectiveRole = currentUserRole || 'receptionniste';
  const canEdit = isSuperAdmin || isOwnProfile || (isAdmin && canEditAllProfiles(effectiveRole));
  const showSalarySection = canViewSalary(effectiveRole);

  // Can this viewer see employee documents?
  const viewerId = currentUserId || '';
  const canSeeDocuments = canViewEmployeeDocs(effectiveRole, viewerId, user?.id ?? '');

  const handleSave = () => {
    // If coordinatrice, strip salary fields
    const toSave = { ...form };
    if (!showSalarySection) {
      toSave.salaire = profile.salaire;
      toSave.tauxHoraire = profile.tauxHoraire;
    }
    if (user?.id) {
      updateData(prev => ({
        ...prev,
        profiles: { ...prev.profiles, [user.id]: toSave },
      }));
    }
    setEditing(false);
  };

  const addAccident = (accident: Omit<AccidentTravail, 'id'>) => {
    const newA: AccidentTravail = { ...accident, id: generateId() };
    updateData(prev => {
      const existing = prev.profiles?.[user?.id];
      if (!existing) return prev;
      const p = { ...existing };
      p.accidentsTravail = [...(p.accidentsTravail || []), newA];
      return { ...prev, profiles: { ...prev.profiles, [user.id]: p } };
    });
    setShowAccidentForm(false);
  };

  const addFormationSST = (f: Omit<FormationSST, 'id'>) => {
    const newF: FormationSST = { ...f, id: generateId() };
    updateData(prev => {
      const existing = prev.profiles?.[user?.id];
      if (!existing) return prev;
      const p = { ...existing };
      p.formationsSST = [...(p.formationsSST || []), newF];
      return { ...prev, profiles: { ...prev.profiles, [user.id]: p } };
    });
    setShowSSTForm(false);
  };

  const inputCls = "border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20";

  const sectionTabs = [
    { id: 'personnel' as const, label: 'Informations personnelles', icon: Users },
    { id: 'coordonnees' as const, label: 'Coordonnees', icon: MapPin },
    { id: 'urgence' as const, label: 'Contact d\'urgence', icon: Phone },
    { id: 'emploi' as const, label: 'Emploi', icon: Briefcase },
    { id: 'cnesst' as const, label: 'CNESST / SST', icon: Shield },
    // CHANGE 2: Documents sub-tab in profile
    ...(canSeeDocuments ? [{ id: 'documents' as const, label: 'Documents', icon: FileText }] : []),
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isOwnProfile && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 mr-1">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="w-12 h-12 rounded-xl bg-[#1B2559] flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0) ?? '?'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user?.name ?? 'Inconnu'}</h3>
            <p className="text-xs text-gray-500">{user?.email ?? ''} &middot; {ROLE_LABELS[user?.role]}</p>
            <span className="text-xs font-mono text-[#1B2559]">{profile?.employeeNumber}</span>
          </div>
        </div>
        {canEdit && section !== 'documents' && (
          <button
            onClick={() => { if (editing) handleSave(); else { setForm({ ...profile }); setEditing(true); } }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              editing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {editing ? <><CheckCircle2 size={14} /> Sauvegarder</> : <><Edit3 size={14} /> Modifier</>}
          </button>
        )}
      </div>

      {/* Section tabs */}
      <div className="px-5 pt-3 flex gap-1 overflow-x-auto border-b border-gray-100 pb-0">
        {sectionTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSection(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
              section === tab.id
                ? 'border-[#1B2559] text-[#1B2559]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-6">
        {/* SECTION: Informations personnelles */}
        {section === 'personnel' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldRow label="Prenom" editing={editing}>
              {editing ? (
                <input type="text" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
                  className={inputCls} placeholder="Prenom" />
              ) : (
                <span className="text-sm text-gray-900">{profile?.prenom || 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="Nom de famille" editing={editing}>
              {editing ? (
                <input type="text" value={form.nomFamille} onChange={e => setForm({ ...form, nomFamille: e.target.value })}
                  className={inputCls} placeholder="Nom de famille" />
              ) : (
                <span className="text-sm text-gray-900">{profile?.nomFamille || 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="Date de naissance" editing={editing}>
              {editing ? (
                <input type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })}
                  className={inputCls} />
              ) : (
                <span className="text-sm text-gray-900">{profile.dateNaissance ? new Date(profile.dateNaissance).toLocaleDateString('fr-CA') : 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="Sexe" editing={editing}>
              {editing ? (
                <select value={form.sexe} onChange={e => setForm({ ...form, sexe: e.target.value as Sexe })}
                  className={inputCls}>
                  {Object.entries(SEXE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              ) : (
                <span className="text-sm text-gray-900">{SEXE_LABELS[profile.sexe] || 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="Etat civil" editing={editing}>
              {editing ? (
                <select value={form.etatCivil} onChange={e => setForm({ ...form, etatCivil: e.target.value as EtatCivil })}
                  className={inputCls}>
                  {Object.entries(ETAT_CIVIL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              ) : (
                <span className="text-sm text-gray-900">{ETAT_CIVIL_LABELS[profile.etatCivil] || 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="NAS (3 derniers chiffres)" editing={editing}>
              {editing ? (
                <input type="text" value={form.nasLastThree} onChange={e => setForm({ ...form, nasLastThree: e.target.value.slice(0, 3) })}
                  className={inputCls} placeholder="XXX" maxLength={3} />
              ) : (
                <span className="text-sm text-gray-900 font-mono">
                  {profile.nasLastThree ? `***-***-${profile.nasLastThree}` : 'Non défini'}
                </span>
              )}
            </FieldRow>
            <FieldRow label="Langue maternelle" editing={editing}>
              {editing ? (
                <input type="text" value={form.langueMaternelle} onChange={e => setForm({ ...form, langueMaternelle: e.target.value })}
                  className={inputCls} placeholder="Ex: Francais" />
              ) : (
                <span className="text-sm text-gray-900">{profile.langueMaternelle || 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="Langues parlees" editing={editing}>
              {editing ? (
                <input type="text" value={form.languesParlees} onChange={e => setForm({ ...form, languesParlees: e.target.value })}
                  className={inputCls} placeholder="Ex: Francais, Anglais, Arabe" />
              ) : (
                <span className="text-sm text-gray-900">{profile.languesParlees || 'Non défini'}</span>
              )}
            </FieldRow>
          </div>
        )}

        {/* SECTION: Coordonnees */}
        {section === 'coordonnees' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldRow label="Adresse (rue)" editing={editing}>
              {editing ? (
                <input type="text" value={form.adresseRue} onChange={e => setForm({ ...form, adresseRue: e.target.value })}
                  className={inputCls} placeholder="123 rue Exemple" />
              ) : (
                <span className="text-sm text-gray-900">{profile.adresseRue || 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="Ville" editing={editing}>
              {editing ? (
                <input type="text" value={form.adresseVille} onChange={e => setForm({ ...form, adresseVille: e.target.value })}
                  className={inputCls} placeholder="Montreal" />
              ) : (
                <span className="text-sm text-gray-900">{profile.adresseVille || 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="Province" editing={editing}>
              {editing ? (
                <input type="text" value={form.adresseProvince} onChange={e => setForm({ ...form, adresseProvince: e.target.value })}
                  className={inputCls} placeholder="QC" />
              ) : (
                <span className="text-sm text-gray-900">{profile.adresseProvince || 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="Code postal" editing={editing}>
              {editing ? (
                <input type="text" value={form.adresseCodePostal} onChange={e => setForm({ ...form, adresseCodePostal: e.target.value })}
                  className={inputCls} placeholder="H2X 1Y4" />
              ) : (
                <span className="text-sm text-gray-900">{profile.adresseCodePostal || 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="Telephone personnel" editing={editing}>
              {editing ? (
                <input type="tel" value={form.telephonePersonnel} onChange={e => setForm({ ...form, telephonePersonnel: e.target.value })}
                  className={inputCls} placeholder="+1-514-555-0000" />
              ) : (
                <span className="text-sm text-gray-900">{profile.telephonePersonnel || 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="Telephone d'urgence" editing={editing}>
              {editing ? (
                <input type="tel" value={form.telephoneUrgence} onChange={e => setForm({ ...form, telephoneUrgence: e.target.value })}
                  className={inputCls} placeholder="+1-514-555-0000" />
              ) : (
                <span className="text-sm text-gray-900">{profile.telephoneUrgence || 'Non défini'}</span>
              )}
            </FieldRow>
            <FieldRow label="Courriel personnel" editing={editing}>
              {editing ? (
                <input type="email" value={form.courrielPersonnel} onChange={e => setForm({ ...form, courrielPersonnel: e.target.value })}
                  className={inputCls} placeholder="personnel@email.com" />
              ) : (
                <span className="text-sm text-gray-900">{profile.courrielPersonnel || 'Non défini'}</span>
              )}
            </FieldRow>
          </div>
        )}

        {/* SECTION: Contact d'urgence */}
        {section === 'urgence' && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <Heart size={14} /> Contact d&apos;urgence
            </h4>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nom</label>
                  <input type="text" placeholder="Nom" value={form?.contactUrgence?.nom ?? ''}
                    onChange={e => setForm({ ...form, contactUrgence: { ...(form?.contactUrgence ?? { nom: '', telephone: '', relation: 'autre' }), nom: e.target.value } })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Telephone</label>
                  <input type="text" placeholder="Telephone" value={form?.contactUrgence?.telephone ?? ''}
                    onChange={e => setForm({ ...form, contactUrgence: { ...(form?.contactUrgence ?? { nom: '', telephone: '', relation: 'autre' }), telephone: e.target.value } })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Relation</label>
                  <select value={form?.contactUrgence?.relation ?? 'autre'}
                    onChange={e => setForm({ ...form, contactUrgence: { ...(form?.contactUrgence ?? { nom: '', telephone: '', relation: 'autre' }), relation: e.target.value } })}
                    className={inputCls}>
                    {Object.entries(RELATION_URGENCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                {profile?.contactUrgence?.nom ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Nom</p>
                      <p className="text-sm text-gray-900 font-medium">{profile.contactUrgence?.nom}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Telephone</p>
                      <p className="text-sm text-gray-900">{profile.contactUrgence?.telephone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Relation</p>
                      <p className="text-sm text-gray-900">{RELATION_URGENCE_LABELS[profile.contactUrgence?.relation as RelationUrgence] || profile.contactUrgence?.relation || 'Non défini'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Aucun contact d&apos;urgence defini</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* SECTION: Emploi */}
        {section === 'emploi' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow label="Date d'embauche" editing={editing}>
                {editing ? (
                  <input type="date" value={form.dateEmbauche} onChange={e => setForm({ ...form, dateEmbauche: e.target.value })}
                    className={inputCls} />
                ) : (
                  <span className="text-sm text-gray-900">{profile.dateEmbauche ? new Date(profile.dateEmbauche).toLocaleDateString('fr-CA') : 'Non défini'}</span>
                )}
              </FieldRow>
              <FieldRow label="Date de fin" editing={editing}>
                {editing ? (
                  <input type="date" value={form.dateFin} onChange={e => setForm({ ...form, dateFin: e.target.value })}
                    className={inputCls} />
                ) : (
                  <span className="text-sm text-gray-900">{profile.dateFin ? new Date(profile.dateFin).toLocaleDateString('fr-CA') : 'N/A'}</span>
                )}
              </FieldRow>
              <FieldRow label="Statut d'emploi" editing={editing}>
                {editing ? (
                  <select value={form.statutEmploi} onChange={e => setForm({ ...form, statutEmploi: e.target.value as StatutEmploi })}
                    className={inputCls}>
                    {Object.entries(STATUT_EMPLOI_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                ) : (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    profile.statutEmploi === 'probation' ? 'bg-yellow-100 text-yellow-700' :
                    profile.statutEmploi === 'termine' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>{STATUT_EMPLOI_LABELS[profile.statutEmploi]}</span>
                )}
              </FieldRow>
              <FieldRow label="Type de poste" editing={editing}>
                {editing ? (
                  <select value={form.typePoste} onChange={e => setForm({ ...form, typePoste: e.target.value as TypePoste })}
                    className={inputCls}>
                    {Object.entries(TYPE_POSTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                ) : (
                  <span className="text-sm text-gray-900">{TYPE_POSTE_LABELS[profile.typePoste]}</span>
                )}
              </FieldRow>
              <FieldRow label="Departement" editing={editing}>
                {editing ? (
                  <input type="text" value={form.departement} onChange={e => setForm({ ...form, departement: e.target.value })}
                    className={inputCls} placeholder="Ex: Immigration" />
                ) : (
                  <span className="text-sm text-gray-900">{profile.departement || 'Non défini'}</span>
                )}
              </FieldRow>
              <FieldRow label="Poste / Titre" editing={editing}>
                {editing ? (
                  <input type="text" value={form.poste} onChange={e => setForm({ ...form, poste: e.target.value })}
                    className={inputCls} placeholder="Ex: Technicienne juridique" />
                ) : (
                  <span className="text-sm text-gray-900">{profile.poste || 'Non défini'}</span>
                )}
              </FieldRow>
              <FieldRow label="Superviseur" editing={editing}>
                {editing ? (
                  <select value={form.superviseur} onChange={e => setForm({ ...form, superviseur: e.target.value })}
                    className={inputCls}>
                    <option value="">Aucun</option>
                    {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                ) : (
                  <span className="text-sm text-gray-900">{profile.superviseur ? getUserById(profile.superviseur)?.name || 'Non défini' : 'Non défini'}</span>
                )}
              </FieldRow>
              <FieldRow label="Mode de paiement" editing={editing}>
                {editing ? (
                  <select value={form.modePaiement} onChange={e => setForm({ ...form, modePaiement: e.target.value as ModePaiement })}
                    className={inputCls}>
                    {Object.entries(MODE_PAIEMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                ) : (
                  <span className="text-sm text-gray-900">{MODE_PAIEMENT_LABELS[profile.modePaiement] || 'Non défini'}</span>
                )}
              </FieldRow>
              <FieldRow label="Frequence de paie" editing={editing}>
                {editing ? (
                  <select value={form.frequencePaie} onChange={e => setForm({ ...form, frequencePaie: e.target.value as FrequencePaie })}
                    className={inputCls}>
                    {Object.entries(FREQUENCE_PAIE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                ) : (
                  <span className="text-sm text-gray-900">{FREQUENCE_PAIE_LABELS[profile.frequencePaie] || 'Non défini'}</span>
                )}
              </FieldRow>

              {/* Salary - superadmin only */}
              {showSalarySection && (
                <>
                  <FieldRow label="Salaire annuel" editing={editing}>
                    {editing ? (
                      <input type="text" value={form.salaire} onChange={e => setForm({ ...form, salaire: e.target.value })}
                        className={inputCls} placeholder="Ex: 55 000 $" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{showSalary ? (profile.salaire || 'Non défini') : '********'}</span>
                        <button onClick={() => setShowSalary(!showSalary)} className="text-gray-400 hover:text-gray-700">
                          {showSalary ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    )}
                  </FieldRow>
                  <FieldRow label="Taux horaire" editing={editing}>
                    {editing ? (
                      <input type="text" value={form.tauxHoraire} onChange={e => setForm({ ...form, tauxHoraire: e.target.value })}
                        className={inputCls} placeholder="Ex: 28,50 $/h" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{showSalary ? (profile.tauxHoraire || 'Non défini') : '********'}</span>
                      </div>
                    )}
                  </FieldRow>
                </>
              )}
            </div>
          </div>
        )}

        {/* SECTION: CNESST / SST */}
        {section === 'cnesst' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow label="Classification emploi" editing={editing}>
                {editing ? (
                  <input type="text" value={form.classificationEmploi} onChange={e => setForm({ ...form, classificationEmploi: e.target.value })}
                    className={inputCls} placeholder="Classification CNESST" />
                ) : (
                  <span className="text-sm text-gray-900">{profile.classificationEmploi || 'Non défini'}</span>
                )}
              </FieldRow>
              <FieldRow label="Taux de cotisation" editing={editing}>
                {editing ? (
                  <input type="text" value={form.tauxCotisation} onChange={e => setForm({ ...form, tauxCotisation: e.target.value })}
                    className={inputCls} placeholder="Ex: 1.65 %" />
                ) : (
                  <span className="text-sm text-gray-900">{profile.tauxCotisation || 'Non défini'}</span>
                )}
              </FieldRow>
            </div>

            {/* Accidents de travail */}
            {(isSuperAdmin || isAdmin) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <HardHat size={14} /> Accidents de travail
                  </h4>
                  <button onClick={() => setShowAccidentForm(!showAccidentForm)} className="text-xs text-[#1B2559] font-medium hover:underline flex items-center gap-1">
                    <Plus size={12} /> Ajouter
                  </button>
                </div>
                {showAccidentForm && (
                  <AccidentForm onSubmit={addAccident} onCancel={() => setShowAccidentForm(false)} />
                )}
                {(profile.accidentsTravail || []).length === 0 ? (
                  <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-3">Aucun accident enregistre</p>
                ) : (
                  <div className="space-y-2">
                    {(profile.accidentsTravail || []).map(a => (
                      <div key={a.id} className="bg-gray-50 rounded-xl p-3 flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-900">{a.description}</p>
                          <p className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString('fr-CA')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            a.gravite === 'grave' ? 'bg-red-100 text-red-700' :
                            a.gravite === 'modere' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>{a.gravite === 'grave' ? 'Grave' : a.gravite === 'modere' ? 'Modere' : 'Mineur'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            a.statut === 'ouvert' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                          }`}>{a.statut === 'ouvert' ? 'Ouvert' : 'Ferme'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Formations SST */}
            {(isSuperAdmin || isAdmin) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <BookOpen size={14} /> Formations SST
                  </h4>
                  <button onClick={() => setShowSSTForm(!showSSTForm)} className="text-xs text-[#1B2559] font-medium hover:underline flex items-center gap-1">
                    <Plus size={12} /> Ajouter
                  </button>
                </div>
                {showSSTForm && (
                  <SSTForm onSubmit={addFormationSST} onCancel={() => setShowSSTForm(false)} />
                )}
                {(profile.formationsSST || []).length === 0 ? (
                  <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-3">Aucune formation SST enregistree</p>
                ) : (
                  <div className="space-y-2">
                    {(profile.formationsSST || []).map(f => {
                      const expired = f.dateExpiration && new Date(f.dateExpiration) < new Date();
                      return (
                        <div key={f.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-900">{f.nom}</p>
                            <p className="text-xs text-gray-500">
                              Completee : {new Date(f.dateCompletee).toLocaleDateString('fr-CA')}
                              {f.dateExpiration && ` | Expire : ${new Date(f.dateExpiration).toLocaleDateString('fr-CA')}`}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            expired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>{expired ? 'Expiree' : 'Valide'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SECTION: Documents (CHANGE 2) */}
        {section === 'documents' && canSeeDocuments && user?.id && (
          <EmployeeDocumentsSection
            employeeId={user.id}
            viewerRole={effectiveRole}
            viewerId={viewerId}
          />
        )}

        {editing && section !== 'documents' && (
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
            <button onClick={handleSave} className="px-4 py-2 bg-[#1B2559] text-white text-sm rounded-lg hover:bg-[#1B2559]/90">
              Sauvegarder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldRow({ label, editing, children }: { label: string; editing: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function AccidentForm({ onSubmit, onCancel }: { onSubmit: (a: Omit<AccidentTravail, 'id'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ date: '', description: '', gravite: 'mineur' as 'mineur' | 'modere' | 'grave', statut: 'ouvert' as 'ouvert' | 'ferme' });
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-3 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" />
        <select value={form.gravite} onChange={e => setForm({ ...form, gravite: e.target.value as 'mineur' | 'modere' | 'grave' })}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
          <option value="mineur">Mineur</option>
          <option value="modere">Modere</option>
          <option value="grave">Grave</option>
        </select>
      </div>
      <input type="text" placeholder="Description de l'accident" value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="text-sm text-gray-500 hover:underline">Annuler</button>
        <button onClick={() => { if (form.date && form.description) onSubmit(form); }}
          className="px-3 py-1.5 bg-[#1B2559] text-white text-sm rounded-lg hover:bg-[#1B2559]/90">Ajouter</button>
      </div>
    </div>
  );
}

function SSTForm({ onSubmit, onCancel }: { onSubmit: (f: Omit<FormationSST, 'id'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ nom: '', dateCompletee: '', dateExpiration: '' });
  return (
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-3 space-y-3">
      <input type="text" placeholder="Nom de la formation" value={form.nom}
        onChange={e => setForm({ ...form, nom: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Date completee</label>
          <input type="date" value={form.dateCompletee} onChange={e => setForm({ ...form, dateCompletee: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Date d&apos;expiration</label>
          <input type="date" value={form.dateExpiration} onChange={e => setForm({ ...form, dateExpiration: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="text-sm text-gray-500 hover:underline">Annuler</button>
        <button onClick={() => { if (form.nom && form.dateCompletee) onSubmit(form); }}
          className="px-3 py-1.5 bg-[#1B2559] text-white text-sm rounded-lg hover:bg-[#1B2559]/90">Ajouter</button>
      </div>
    </div>
  );
}

// ============================================================
// Tab 2: Documents RH (global admin view)
// ============================================================

function TabDocuments({ hrData, updateData }: { hrData: HRData; updateData: (fn: (prev: HRData) => HRData) => void }) {
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    employeeId: '',
    categorie: 'contrat' as CategorieDocument,
    dateExpiration: '',
  });

  const filteredDocs = hrData.documents.filter(d => {
    const matchEmp = !filterEmployee || d.employeeId === filterEmployee;
    const matchCat = !filterCategory || d.categorie === filterCategory;
    return matchEmp && matchCat;
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files || !uploadForm.employeeId) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024;

    Array.from(files).forEach(file => {
      if (!allowed.includes(file.type)) return;
      if (file.size > maxSize) return;
      const doc: HRDocument = {
        id: generateId(),
        employeeId: uploadForm.employeeId,
        nom: file.name,
        categorie: uploadForm.categorie,
        statut: 'en_attente',
        dateTelechargement: todayStr(),
        dateExpiration: uploadForm.dateExpiration,
        tailleFichier: file.size,
        typeFichier: file.type,
      };
      updateData(prev => ({ ...prev, documents: [...prev.documents, doc] }));
    });
    setShowUploadForm(false);
    setUploadForm({ employeeId: '', categorie: 'contrat', dateExpiration: '' });
  };

  const deleteDoc = (docId: string) => {
    updateData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== docId),
    }));
  };

  const updateDocStatus = (docId: string, statut: StatutDocument) => {
    updateData(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.id === docId ? { ...d, statut } : d),
    }));
  };

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
          <option value="">Tous les employes</option>
          {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
          <option value="">Toutes les categories</option>
          {Object.entries(CATEGORIE_DOC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1B2559] text-white text-sm font-medium rounded-xl hover:bg-[#1B2559]/90 transition-all">
          <Upload size={16} /> Telecharger un document
        </button>
      </div>

      {/* Upload form */}
      {showUploadForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h4 className="font-semibold text-gray-900">Telecharger un document</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Employe</label>
              <select value={uploadForm.employeeId} onChange={e => setUploadForm({ ...uploadForm, employeeId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
                <option value="">Selectionner...</option>
                {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Categorie</label>
              <select value={uploadForm.categorie} onChange={e => setUploadForm({ ...uploadForm, categorie: e.target.value as CategorieDocument })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
                {Object.entries(CATEGORIE_DOC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date d&apos;expiration (optionnel)</label>
              <input type="date" value={uploadForm.dateExpiration} onChange={e => setUploadForm({ ...uploadForm, dateExpiration: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" />
            </div>
          </div>

          {/* Drag and drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragActive ? 'border-[#D4A03C] bg-[#D4A03C]/5' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Glissez-deposez vos fichiers ici</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG - Maximum 10 Mo</p>
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
              multiple onChange={e => handleFileUpload(e.target.files)} />
          </div>
        </div>
      )}

      {/* Documents list */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">Aucun document RH enregistre</p>
          <p className="text-gray-400 text-xs mt-1">Commencez par telecharger les documents de vos employes</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Document</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Employe</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Categorie</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => {
                const emp = getUserById(doc.employeeId);
                const isExpired = doc.dateExpiration && new Date(doc.dateExpiration) < new Date();
                return (
                  <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{doc.nom}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(doc.tailleFichier)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{emp?.name ?? 'Inconnu'}</td>
                    <td className="px-5 py-3 text-gray-600">{CATEGORIE_DOC_LABELS[doc.categorie]}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isExpired ? STATUT_DOC_COLORS.expire : STATUT_DOC_COLORS[doc.statut]
                      }`}>
                        {isExpired ? 'Expire' : STATUT_DOC_LABELS[doc.statut]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{doc.dateTelechargement}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {doc.statut === 'en_attente' && (
                          <button onClick={() => updateDocStatus(doc.id, 'verifie')}
                            className="text-green-600 hover:text-green-800 p-1" title="Marquer verifie">
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        <button onClick={() => deleteDoc(doc.id)} className="text-red-400 hover:text-red-600 p-1" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Tab 3: Conges & Absences (Admin view with approval workflow)
// ============================================================

function TabConges({ hrData, updateData, currentUser }: {
  hrData: HRData;
  updateData: (fn: (prev: HRData) => HRData) => void;
  currentUser: CrmUser;
}) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [refusalReason, setRefusalReason] = useState('');
  const [refusingId, setRefusingId] = useState<string | null>(null);

  const [requestForm, setRequestForm] = useState({
    employeeId: '',
    type: 'vacances' as TypeConge,
    dateDebut: '',
    dateFin: '',
    notes: '',
  });

  const pendingConges = hrData.conges.filter(c => c.statut === 'en_attente');
  const canApprove = canApproveLeave(currentUser.role);

  const submitRequest = () => {
    if (!requestForm.employeeId || !requestForm.dateDebut || !requestForm.dateFin) return;
    const conge: DemandeConge = {
      id: generateId(),
      ...requestForm,
      statut: 'en_attente',
      dateCreation: todayStr(),
    };
    updateData(prev => ({ ...prev, conges: [...prev.conges, conge] }));
    setRequestForm({ employeeId: '', type: 'vacances', dateDebut: '', dateFin: '', notes: '' });
    setShowRequestForm(false);
  };

  const approveConge = (congeId: string) => {
    updateData(prev => {
      const updated = prev.conges.map(c =>
        c.id === congeId ? { ...c, statut: 'approuve' as StatutConge, approvedBy: currentUser.id } : c
      );
      const conge = prev.conges.find(c => c.id === congeId);
      const balances = { ...prev.balances };
      if (conge) {
        const days = daysBetween(conge.dateDebut, conge.dateFin);
        const existing = balances[conge.employeeId];
        const bal = existing ? { ...existing } : defaultBalance(conge.employeeId);
        if (conge.type === 'vacances') bal.vacances = { ...bal.vacances, utilises: bal.vacances.utilises + days };
        if (conge.type === 'maladie') bal.maladie = { ...bal.maladie, utilises: bal.maladie.utilises + days };
        if (conge.type === 'personnel') bal.personnel = { ...bal.personnel, utilises: bal.personnel.utilises + days };
        balances[conge.employeeId] = bal;
      }
      return { ...prev, conges: updated, balances };
    });
  };

  const refuseConge = (congeId: string, reason: string) => {
    updateData(prev => ({
      ...prev,
      conges: prev.conges.map(c =>
        c.id === congeId ? { ...c, statut: 'refuse' as StatutConge, refusedBy: currentUser.id, refusalReason: reason } : c
      ),
    }));
    setRefusingId(null);
    setRefusalReason('');
  };

  // Build calendar data
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const calDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calDays.push(i);

  const congesThisMonth = hrData.conges.filter(c => {
    if (c.statut === 'refuse') return false;
    const start = new Date(c.dateDebut);
    const end = new Date(c.dateFin);
    const monthStart = new Date(calYear, calMonth, 1);
    const monthEnd = new Date(calYear, calMonth + 1, 0);
    return start <= monthEnd && end >= monthStart;
  });

  const getCongesForDay = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return congesThisMonth.filter(c => dateStr >= c.dateDebut && dateStr <= c.dateFin);
  };

  const balanceEmployee = selectedEmployee || DEMO_USERS[0]?.id || '';
  const balance = hrData.balances[balanceEmployee] || defaultBalance(balanceEmployee);

  return (
    <div className="space-y-4">
      {/* Pending requests dashboard (admin only) */}
      {canApprove && pendingConges.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-amber-600" />
            <h4 className="font-semibold text-amber-900">
              Demandes en attente ({pendingConges.length})
            </h4>
          </div>
          <div className="space-y-2">
            {pendingConges.map(conge => {
              const emp = getUserById(conge.employeeId);
              return (
                <div key={conge.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1B2559] flex items-center justify-center text-white text-xs font-bold">
                      {emp?.name.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp?.name ?? 'Inconnu'}</p>
                      <p className="text-xs text-gray-500">
                        {TYPE_CONGE_LABELS[conge.type]} &middot; {conge.dateDebut} au {conge.dateFin}
                        ({daysBetween(conge.dateDebut, conge.dateFin)} jours)
                        {conge.notes && ` - ${conge.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {refusingId === conge.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={refusalReason}
                          onChange={e => setRefusalReason(e.target.value)}
                          placeholder="Raison du refus..."
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                        <button onClick={() => refuseConge(conge.id, refusalReason)}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700">Refuser</button>
                        <button onClick={() => { setRefusingId(null); setRefusalReason(''); }}
                          className="text-xs text-gray-400 hover:text-gray-600">Annuler</button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => approveConge(conge.id)}
                          className="flex items-center gap-1 text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-700 transition-all">
                          <CheckCircle2 size={12} /> Approuver
                        </button>
                        <button onClick={() => setRefusingId(conge.id)}
                          className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-200 transition-all">
                          <XCircle size={12} /> Refuser
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
          <option value="">Tous les employes</option>
          {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => setShowRequestForm(!showRequestForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1B2559] text-white text-sm font-medium rounded-xl hover:bg-[#1B2559]/90 transition-all">
          <Plus size={16} /> Nouvelle demande
        </button>
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h4 className="font-semibold text-gray-900">Nouvelle demande de conge</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Employe</label>
              <select value={requestForm.employeeId} onChange={e => setRequestForm({ ...requestForm, employeeId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
                <option value="">Selectionner...</option>
                {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={requestForm.type} onChange={e => setRequestForm({ ...requestForm, type: e.target.value as TypeConge })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
                {Object.entries(TYPE_CONGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date de debut</label>
              <input type="date" value={requestForm.dateDebut} onChange={e => setRequestForm({ ...requestForm, dateDebut: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date de fin</label>
              <input type="date" value={requestForm.dateFin} onChange={e => setRequestForm({ ...requestForm, dateFin: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <textarea value={requestForm.notes} onChange={e => setRequestForm({ ...requestForm, notes: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" rows={2}
              placeholder="Notes optionnelles..." />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowRequestForm(false)} className="text-sm text-gray-500 hover:underline">Annuler</button>
            <button onClick={submitRequest} className="px-4 py-2 bg-[#1B2559] text-white text-sm rounded-lg hover:bg-[#1B2559]/90">
              Soumettre la demande
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
              className="text-gray-400 hover:text-gray-700"><ChevronLeft size={20} /></button>
            <h4 className="font-semibold text-gray-900">{MONTH_NAMES[calMonth]} {calYear}</h4>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
              className="text-gray-400 hover:text-gray-700"><ChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
            {calDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const conges = getCongesForDay(day);
              const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
              return (
                <div key={`day-${day}`} className={`min-h-[48px] rounded-lg p-1 text-xs ${
                  isToday ? 'bg-[#1B2559]/10 font-bold' : 'hover:bg-gray-50'
                }`}>
                  <span className={`${isToday ? 'text-[#1B2559]' : 'text-gray-700'}`}>{day}</span>
                  {conges.slice(0, 2).map(c => {
                    const emp = getUserById(c.employeeId);
                    return (
                      <div key={c.id} className={`mt-0.5 truncate rounded px-0.5 text-[10px] ${
                        c.statut === 'approuve' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {emp?.name.split(' ')[0] ?? '?'}
                      </div>
                    );
                  })}
                  {conges.length > 2 && <div className="text-[10px] text-gray-400">+{conges.length - 2}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Balance + Quebec info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h4 className="font-semibold text-gray-900 mb-3">Solde de conges</h4>
            <select value={balanceEmployee} onChange={e => setSelectedEmployee(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
              {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <div className="space-y-3">
              <BalanceBar label="Vacances" used={balance.vacances.utilises} total={balance.vacances.disponibles} color="bg-blue-500" />
              <BalanceBar label="Maladie" used={balance.maladie.utilises} total={balance.maladie.disponibles} color="bg-red-400" />
              <BalanceBar label="Personnel" used={balance.personnel.utilises} total={balance.personnel.disponibles} color="bg-purple-400" />
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <h5 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
              <AlertTriangle size={12} /> Normes du travail - Quebec
            </h5>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>&bull; 2 semaines de vacances apres 1 an</li>
              <li>&bull; 3 semaines apres 3 ans</li>
              <li>&bull; 2 jours conge personnel/famille (payes)</li>
              <li>&bull; Jours de maladie selon les normes</li>
              <li>&bull; Conge de maternite: 18 semaines</li>
              <li>&bull; Conge de paternite: 5 semaines</li>
            </ul>
          </div>
        </div>
      </div>

      {/* All requests */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h4 className="font-semibold text-gray-900 mb-3">Toutes les demandes de conge</h4>
        {hrData.conges.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Aucune demande de conge enregistree</p>
        ) : (
          <div className="space-y-2">
            {[...hrData.conges]
              .filter(c => !selectedEmployee || c.employeeId === selectedEmployee)
              .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation))
              .map(conge => {
                const emp = getUserById(conge.employeeId);
                const approver = conge.approvedBy ? getUserById(conge.approvedBy) : null;
                const refuser = conge.refusedBy ? getUserById(conge.refusedBy) : null;
                return (
                  <div key={conge.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1B2559] flex items-center justify-center text-white text-xs font-bold">
                        {emp?.name.charAt(0) ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp?.name ?? 'Inconnu'}</p>
                        <p className="text-xs text-gray-500">
                          {TYPE_CONGE_LABELS[conge.type]} &middot; {conge.dateDebut} au {conge.dateFin}
                          {conge.notes && ` - ${conge.notes}`}
                        </p>
                        {approver && <p className="text-xs text-green-600 mt-0.5">Approuve par {approver.name}</p>}
                        {refuser && <p className="text-xs text-red-600 mt-0.5">Refuse par {refuser.name}{conge.refusalReason ? ` : ${conge.refusalReason}` : ''}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUT_CONGE_COLORS[conge.statut]}`}>
                        {STATUT_CONGE_LABELS[conge.statut]}
                      </span>
                      {conge.statut === 'en_attente' && canApprove && (
                        <>
                          <button onClick={() => approveConge(conge.id)}
                            className="text-green-600 hover:text-green-800 p-1" title="Approuver">
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => setRefusingId(conge.id)}
                            className="text-red-400 hover:text-red-600 p-1" title="Refuser">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

function BalanceBar({ label, used, total, color }: { label: string; used: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-500">{used} / {total} jours</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ============================================================
// Tab 4: Suivi & Evaluations
// ============================================================

function TabSuivi({ hrData, updateData }: { hrData: HRData; updateData: (fn: (prev: HRData) => HRData) => void }) {
  const { currentUser } = useCrm();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showObjectifForm, setShowObjectifForm] = useState(false);

  const [noteForm, setNoteForm] = useState({
    employeeId: '',
    type: 'note' as 'evaluation' | 'note' | 'formation' | 'avertissement' | 'objectif',
    texte: '',
  });

  const [objectifForm, setObjectifForm] = useState({
    employeeId: '',
    titre: '',
    description: '',
    dateEcheance: '',
  });

  const submitNote = () => {
    if (!noteForm.employeeId || !noteForm.texte) return;
    const note: NoteSuivi = {
      id: generateId(),
      employeeId: noteForm.employeeId,
      date: todayStr(),
      auteur: currentUser?.name ?? 'Inconnu',
      texte: noteForm.texte,
      type: noteForm.type,
    };
    updateData(prev => ({ ...prev, notes: [...prev.notes, note] }));
    setNoteForm({ employeeId: '', type: 'note', texte: '' });
    setShowNoteForm(false);
  };

  const submitObjectif = () => {
    if (!objectifForm.employeeId || !objectifForm.titre) return;
    const obj: Objectif = {
      id: generateId(),
      employeeId: objectifForm.employeeId,
      titre: objectifForm.titre,
      description: objectifForm.description,
      dateCreation: todayStr(),
      dateEcheance: objectifForm.dateEcheance,
      statut: 'en_cours',
    };
    updateData(prev => ({ ...prev, objectifs: [...prev.objectifs, obj] }));
    setObjectifForm({ employeeId: '', titre: '', description: '', dateEcheance: '' });
    setShowObjectifForm(false);
  };

  const updateObjectifStatus = (objId: string, statut: StatutObjectif) => {
    updateData(prev => ({
      ...prev,
      objectifs: prev.objectifs.map(o => o.id === objId ? { ...o, statut } : o),
    }));
  };

  const filteredNotes = hrData.notes
    .filter(n => !selectedEmployee || n.employeeId === selectedEmployee)
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredObjectifs = hrData.objectifs
    .filter(o => !selectedEmployee || o.employeeId === selectedEmployee)
    .sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
          <option value="">Tous les employes</option>
          {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => setShowObjectifForm(!showObjectifForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
          <Target size={16} /> Nouvel objectif
        </button>
        <button onClick={() => setShowNoteForm(!showNoteForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1B2559] text-white text-sm font-medium rounded-xl hover:bg-[#1B2559]/90 transition-all">
          <Plus size={16} /> Ajouter une note
        </button>
      </div>

      {/* Note Form */}
      {showNoteForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h4 className="font-semibold text-gray-900">Nouvelle note de suivi</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Employe</label>
              <select value={noteForm.employeeId} onChange={e => setNoteForm({ ...noteForm, employeeId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
                <option value="">Selectionner...</option>
                {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={noteForm.type} onChange={e => setNoteForm({ ...noteForm, type: e.target.value as typeof noteForm.type })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
                {Object.entries(NOTE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Contenu</label>
            <textarea value={noteForm.texte} onChange={e => setNoteForm({ ...noteForm, texte: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" rows={3}
              placeholder="Detaillez la note de suivi..." />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNoteForm(false)} className="text-sm text-gray-500 hover:underline">Annuler</button>
            <button onClick={submitNote} className="px-4 py-2 bg-[#1B2559] text-white text-sm rounded-lg hover:bg-[#1B2559]/90">
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Objectif Form */}
      {showObjectifForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h4 className="font-semibold text-gray-900">Nouvel objectif</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Employe</label>
              <select value={objectifForm.employeeId} onChange={e => setObjectifForm({ ...objectifForm, employeeId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
                <option value="">Selectionner...</option>
                {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date d&apos;echeance</label>
              <input type="date" value={objectifForm.dateEcheance} onChange={e => setObjectifForm({ ...objectifForm, dateEcheance: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Titre</label>
            <input type="text" value={objectifForm.titre} onChange={e => setObjectifForm({ ...objectifForm, titre: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20"
              placeholder="Titre de l'objectif" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea value={objectifForm.description} onChange={e => setObjectifForm({ ...objectifForm, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20" rows={2}
              placeholder="Description detaillee..." />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowObjectifForm(false)} className="text-sm text-gray-500 hover:underline">Annuler</button>
            <button onClick={submitObjectif} className="px-4 py-2 bg-[#1B2559] text-white text-sm rounded-lg hover:bg-[#1B2559]/90">
              Creer l&apos;objectif
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={16} /> Historique de suivi
          </h4>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Aucune note de suivi</p>
              <p className="text-xs text-gray-400 mt-1">Ajoutez des evaluations, formations ou notes de suivi</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredNotes.map(note => {
                const emp = getUserById(note.employeeId);
                return (
                  <div key={note.id} className="relative pl-4 border-l-2 border-gray-200">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#1B2559]" />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${NOTE_TYPE_COLORS[note.type] ?? 'bg-gray-100 text-gray-600'}`}>
                            {NOTE_TYPE_LABELS[note.type] ?? note.type}
                          </span>
                          <span className="text-xs text-gray-400">{emp?.name ?? 'Inconnu'}</span>
                        </div>
                        <p className="text-sm text-gray-900">{note.texte}</p>
                        <p className="text-xs text-gray-400 mt-1">{note.date} - par {note.auteur}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Objectifs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={16} /> Objectifs
          </h4>
          {filteredObjectifs.length === 0 ? (
            <div className="text-center py-8">
              <Target size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Aucun objectif defini</p>
              <p className="text-xs text-gray-400 mt-1">Creez des objectifs pour suivre la progression des employes</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredObjectifs.map(obj => {
                const emp = getUserById(obj.employeeId);
                return (
                  <div key={obj.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{obj.titre}</p>
                        <p className="text-xs text-gray-500">{emp?.name ?? 'Inconnu'}</p>
                        {obj.description && <p className="text-xs text-gray-600 mt-1">{obj.description}</p>}
                        {obj.dateEcheance && (
                          <p className="text-xs text-gray-400 mt-1">Echeance : {new Date(obj.dateEcheance).toLocaleDateString('fr-CA')}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUT_OBJECTIF_COLORS[obj.statut]}`}>
                          {STATUT_OBJECTIF_LABELS[obj.statut]}
                        </span>
                        {obj.statut === 'en_cours' && (
                          <div className="flex gap-1 mt-1">
                            <button onClick={() => updateObjectifStatus(obj.id, 'atteint')}
                              className="text-green-600 hover:text-green-800 p-0.5" title="Marquer atteint">
                              <CheckCircle2 size={14} />
                            </button>
                            <button onClick={() => updateObjectifStatus(obj.id, 'non_atteint')}
                              className="text-red-400 hover:text-red-600 p-0.5" title="Marquer non atteint">
                              <XCircle size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab 5: Presences (Admin view)
// ============================================================

function TabPresences({ hrData, updateData, currentUser }: {
  hrData: HRData;
  updateData: (fn: (prev: HRData) => HRData) => void;
  currentUser: CrmUser;
}) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showReport, setShowReport] = useState(false);

  const isAdmin = isAdminRole(currentUser.role);
  const todayKey = todayStr();

  const markPresence = (employeeId: string, date: string, statut: StatutPresence) => {
    updateData(prev => {
      const idx = prev.presences.findIndex(p => p.employeeId === employeeId && p.date === date);
      const updated = [...prev.presences];
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], statut };
      } else {
        updated.push({ employeeId, date, statut });
      }
      return { ...prev, presences: updated };
    });
  };

  const employeesToShow = selectedEmployee
    ? DEMO_USERS.filter(u => u.id === selectedEmployee)
    : DEMO_USERS;

  // Today's summary
  const todayPresences = hrData.presences.filter(p => p.date === todayKey);
  const pointed = DEMO_USERS.filter(u => todayPresences.some(p => p.employeeId === u.id));
  const notPointed = DEMO_USERS.filter(u => u.active !== false && !todayPresences.some(p => p.employeeId === u.id));
  const presentCount = todayPresences.filter(p => p.statut === 'present' || p.statut === 'teletravail').length;
  const absentCount = todayPresences.filter(p => p.statut === 'absent').length;
  const retardCount = todayPresences.filter(p => p.statut === 'retard').length;
  const teleCount = todayPresences.filter(p => p.statut === 'teletravail').length;

  // Generate end-of-day report text
  const generateReport = () => {
    const now = new Date();
    let report = `RAPPORT DE PRÉSENCES — ${now.toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    report += `Généré à ${now.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}\n\n`;
    report += `RÉSUMÉ:\n`;
    report += `• Présents: ${presentCount}\n`;
    report += `• Télétravail: ${teleCount}\n`;
    report += `• Retards: ${retardCount}\n`;
    report += `• Absents: ${absentCount}\n`;
    report += `• Non pointé: ${notPointed.length}\n\n`;
    report += `DÉTAIL PAR EMPLOYÉ:\n`;
    DEMO_USERS.forEach(u => {
      const p = todayPresences.find(tp => tp.employeeId === u.id);
      const time = p ? ((p as any).time || '--:--') : '';
      report += `• ${u.name} (${ROLE_LABELS[u.role]}): ${p ? STATUT_PRESENCE_LABELS[p.statut] : '❌ NON POINTÉ'}${time ? ` à ${time}` : ''}\n`;
    });
    if (notPointed.length > 0) {
      report += `\n⚠️ ALERTES - EMPLOYÉS N'AYANT PAS POINTÉ:\n`;
      notPointed.forEach(u => {
        report += `• ${u.name} (${ROLE_LABELS[u.role]})\n`;
      });
    }
    report += `\n---\nSOS Hub Canada Inc. — Système RH\n`;
    return report;
  };

  const downloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-presences-${todayKey}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* ===== TODAY'S DASHBOARD ===== */}
      <div className="bg-gradient-to-r from-[#1B2559] to-[#2E3A7B] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Qui a pointé aujourd&apos;hui ?</h3>
            <p className="text-sm text-white/60">{today.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowReport(!showReport)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">
              {showReport ? 'Masquer rapport' : 'Rapport du jour'}
            </button>
            <button onClick={downloadReport}
              className="px-3 py-1.5 bg-[#D4A03C] hover:bg-[#b8882f] rounded-lg text-xs font-medium transition-colors">
              Télécharger
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{presentCount}</div>
            <div className="text-xs text-white/70">Présents</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{teleCount}</div>
            <div className="text-xs text-white/70">Télétravail</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{retardCount}</div>
            <div className="text-xs text-white/70">Retards</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{absentCount}</div>
            <div className="text-xs text-white/70">Absents</div>
          </div>
          <div className={`rounded-xl p-3 text-center ${notPointed.length > 0 ? 'bg-red-500/30 border border-red-400/30' : 'bg-green-500/20'}`}>
            <div className="text-2xl font-bold">{notPointed.length}</div>
            <div className="text-xs text-white/70">Non pointé</div>
          </div>
        </div>

        {/* Pointed employees */}
        <div className="flex flex-wrap gap-2">
          {pointed.map(u => {
            const p = todayPresences.find(tp => tp.employeeId === u.id);
            return (
              <div key={u.id} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                <div className={`w-2 h-2 rounded-full ${p?.statut === 'present' ? 'bg-green-400' : p?.statut === 'teletravail' ? 'bg-blue-400' : p?.statut === 'retard' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                <span className="text-xs">{u.name}</span>
                <span className="text-[10px] text-white/50">{(p as any)?.time || ''}</span>
              </div>
            );
          })}
        </div>

        {/* Alert: Not pointed */}
        {notPointed.length > 0 && (
          <div className="mt-3 bg-red-500/20 border border-red-400/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-300" />
              <span className="text-sm font-semibold text-red-200">
                {notPointed.length} employé{notPointed.length > 1 ? 's' : ''} n&apos;{notPointed.length > 1 ? 'ont' : 'a'} pas encore pointé
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {notPointed.map(u => (
                <span key={u.id} className="text-xs bg-red-500/30 rounded-full px-2 py-0.5 text-red-100">
                  {u.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* End-of-day report modal */}
      {showReport && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-[#1B2559]">Rapport de fin de journée</h4>
            <button onClick={() => setShowReport(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <pre className="text-xs text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap font-mono overflow-auto max-h-[400px]">
            {generateReport()}
          </pre>
        </div>
      )}

      {/* ===== MONTHLY VIEW ===== */}
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2559]/20">
          <option value="">Tous les employés</option>
          {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
            className="text-gray-400 hover:text-gray-700 p-1"><ChevronLeft size={18} /></button>
          <span className="text-sm font-semibold text-gray-900 min-w-[140px] text-center">{MONTH_NAMES[calMonth]} {calYear}</span>
          <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
            className="text-gray-400 hover:text-gray-700 p-1"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {(Object.keys(STATUT_PRESENCE_LABELS) as StatutPresence[]).map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${STATUT_PRESENCE_COLORS[s]}`} />
            <span className="text-xs text-gray-600">{STATUT_PRESENCE_LABELS[s]}</span>
          </div>
        ))}
      </div>

      {/* Grid per employee */}
      {employeesToShow.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border">
          <UserCheck size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm font-medium">Aucun employe a afficher</p>
          <p className="text-gray-400 text-xs mt-1">Selectionnez un employe ou verifiez les filtres.</p>
        </div>
      )}
      {employeesToShow.map(user => {
        const empPresences = hrData.presences.filter(p => p.employeeId === user.id);
        const daysInM = getDaysInMonth(calYear, calMonth);

        return (
          <div key={user.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#1B2559] flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-16 lg:grid-cols-31 gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(daysInM, 31)}, minmax(0, 1fr))` }}>
              {Array.from({ length: daysInM }, (_, i) => i + 1).map(day => {
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const entry = empPresences.find(p => p.date === dateStr);
                const dayOfWeek = new Date(calYear, calMonth, day).getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const isCurrentDay = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();

                return (
                  <div key={day} className="relative group">
                    <button
                      onClick={() => {
                        if (!isAdmin) return;
                        const statuses: StatutPresence[] = ['present', 'absent', 'retard', 'teletravail', 'conge', 'ferie'];
                        const currentIdx = entry ? statuses.indexOf(entry.statut) : -1;
                        const nextStatut = statuses[(currentIdx + 1) % statuses.length];
                        markPresence(user.id, dateStr, nextStatut);
                      }}
                      disabled={!isAdmin}
                      className={`w-full aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all ${
                        entry ? `${STATUT_PRESENCE_COLORS[entry.statut]} text-white` :
                        isWeekend ? 'bg-gray-100 text-gray-300' :
                        'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      } ${isCurrentDay ? 'ring-2 ring-[#D4A03C]' : ''}`}
                      title={`${day} ${MONTH_NAMES[calMonth]} - ${entry ? STATUT_PRESENCE_LABELS[entry.statut] : 'Non défini'}`}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <PresenceStats employeeId={user.id} presences={empPresences} calYear={calYear} calMonth={calMonth} />
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Shared Presence Components
// ============================================================

function PresenceCalendar({
  employeeId, presences, calYear, calMonth, setCalYear, setCalMonth,
}: {
  employeeId: string;
  presences: PresenceEntry[];
  calYear: number;
  calMonth: number;
  setCalYear: (y: number) => void;
  setCalMonth: (m: number) => void;
}) {
  const today = new Date();
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const calDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calDays.push(i);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
          className="text-gray-400 hover:text-gray-700"><ChevronLeft size={20} /></button>
        <h4 className="font-semibold text-gray-900">{MONTH_NAMES[calMonth]} {calYear}</h4>
        <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
          className="text-gray-400 hover:text-gray-700"><ChevronRight size={20} /></button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap mb-3">
        {(Object.keys(STATUT_PRESENCE_LABELS) as StatutPresence[]).map(s => (
          <div key={s} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-sm ${STATUT_PRESENCE_COLORS[s]}`} />
            <span className="text-[10px] text-gray-500">{STATUT_PRESENCE_LABELS[s]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
        {calDays.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entry = presences.find(p => p.date === dateStr);
          const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();

          return (
            <div key={`day-${day}`} className={`min-h-[40px] rounded-lg p-1 text-xs flex flex-col items-center justify-center ${
              isToday ? 'ring-2 ring-[#D4A03C]' : ''
            } ${entry ? '' : 'bg-gray-50'}`}>
              <span className={`text-[10px] ${isToday ? 'text-[#1B2559] font-bold' : 'text-gray-500'}`}>{day}</span>
              {entry && (
                <div className={`w-5 h-5 rounded-full mt-0.5 ${STATUT_PRESENCE_COLORS[entry.statut]}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PresenceStats({ employeeId, presences, calYear, calMonth }: {
  employeeId: string;
  presences: PresenceEntry[];
  calYear: number;
  calMonth: number;
}) {
  const monthPresences = presences.filter(p => {
    const d = new Date(p.date);
    return d.getFullYear() === calYear && d.getMonth() === calMonth;
  });

  const counts: Record<StatutPresence, number> = {
    present: 0, absent: 0, retard: 0, teletravail: 0, conge: 0, ferie: 0,
  };
  monthPresences.forEach(p => { counts[p.statut]++; });

  const workDays = monthPresences.length || 1;
  const presentDays = counts.present + counts.teletravail;
  const tauxPresence = Math.round((presentDays / workDays) * 100);

  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
      <div className="bg-green-50 rounded-lg p-2 text-center">
        <p className="text-lg font-bold text-green-700">{counts.present}</p>
        <p className="text-[10px] text-green-600">Presents</p>
      </div>
      <div className="bg-red-50 rounded-lg p-2 text-center">
        <p className="text-lg font-bold text-red-700">{counts.absent}</p>
        <p className="text-[10px] text-red-600">Absents</p>
      </div>
      <div className="bg-yellow-50 rounded-lg p-2 text-center">
        <p className="text-lg font-bold text-yellow-700">{counts.retard}</p>
        <p className="text-[10px] text-yellow-600">Retards</p>
      </div>
      <div className="bg-blue-50 rounded-lg p-2 text-center">
        <p className="text-lg font-bold text-blue-700">{counts.teletravail}</p>
        <p className="text-[10px] text-blue-600">Teletravail</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-2 text-center">
        <p className="text-lg font-bold text-gray-700">{counts.conge}</p>
        <p className="text-[10px] text-gray-600">Conges</p>
      </div>
      <div className="bg-purple-50 rounded-lg p-2 text-center">
        <p className="text-lg font-bold text-purple-700">{tauxPresence}%</p>
        <p className="text-[10px] text-purple-600">Taux presence</p>
      </div>
    </div>
  );
}
