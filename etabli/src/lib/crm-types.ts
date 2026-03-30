// ========================================================
// SOS Hub Canada - CRM Immigration - Types & Permissions
// Tout en français pour l'équipe de Montréal
// ========================================================

export type CrmRole = 'receptionniste' | 'conseiller' | 'technicienne_juridique' | 'avocat_consultant' | 'coordinatrice' | 'superadmin';

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  role: CrmRole;
  avatar?: string;
  active: boolean;
}

export interface RolePermissions {
  canCreateClient: boolean;
  canEditClient: boolean;
  canDeleteClient: boolean;
  canViewAllClients: boolean;
  canCreateCase: boolean;
  canEditCase: boolean;
  canDeleteCase: boolean;
  canFillForms: boolean;
  canApproveForms: boolean;
  canSignForms: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canScheduleAppointments: boolean;
  canViewFinancials: boolean;
  canExportData: boolean;
  canAccessLegalDocs: boolean;
  canOverrideDecisions: boolean;
  canViewAuditLog: boolean;
  // Granular module access (v2)
  canAccessFacturation: boolean;
  canAccessPortailEmployeurs: boolean;
  canAccessSOSIA: boolean;           // version client (tous sauf tech juri)
  canAccessSOSIAConsultant: boolean;  // version consultant senior (tech juri, avocat, coord, admin)
  canAccessRH: boolean;
  canAccessRHAdmin: boolean;
  canAccessBackup: boolean;
}

export const ROLE_PERMISSIONS: Record<CrmRole, RolePermissions> = {
  receptionniste: {
    canCreateClient: true, canEditClient: false, canDeleteClient: false, canViewAllClients: true,
    canCreateCase: false, canEditCase: false, canDeleteCase: false,
    canFillForms: false, canApproveForms: false, canSignForms: false,
    canViewReports: false, canManageUsers: false, canManageSettings: false,
    canScheduleAppointments: true, canViewFinancials: false, canExportData: false,
    canAccessLegalDocs: false, canOverrideDecisions: false, canViewAuditLog: false,
    // Modules: SOSIA version CLIENT, RH own profile, no billing/employer/backup
    canAccessFacturation: false, canAccessPortailEmployeurs: false,
    canAccessSOSIA: true, canAccessSOSIAConsultant: false,
    canAccessRH: true, canAccessRHAdmin: false, canAccessBackup: false,
  },
  conseiller: {
    canCreateClient: true, canEditClient: true, canDeleteClient: false, canViewAllClients: true,
    canCreateCase: true, canEditCase: true, canDeleteCase: false,
    canFillForms: true, canApproveForms: false, canSignForms: false,
    canViewReports: true, canManageUsers: false, canManageSettings: false,
    canScheduleAppointments: true, canViewFinancials: false, canExportData: false,
    canAccessLegalDocs: false, canOverrideDecisions: false, canViewAuditLog: false,
    // Modules: SOSIA version CLIENT, RH own profile, no billing/employer/backup
    canAccessFacturation: false, canAccessPortailEmployeurs: false,
    canAccessSOSIA: true, canAccessSOSIAConsultant: false,
    canAccessRH: true, canAccessRHAdmin: false, canAccessBackup: false,
  },
  technicienne_juridique: {
    canCreateClient: true, canEditClient: true, canDeleteClient: false, canViewAllClients: true,
    canCreateCase: true, canEditCase: true, canDeleteCase: false,
    canFillForms: true, canApproveForms: true, canSignForms: false,
    canViewReports: true, canManageUsers: false, canManageSettings: false,
    canScheduleAppointments: true, canViewFinancials: true, canExportData: true,
    canAccessLegalDocs: true, canOverrideDecisions: false, canViewAuditLog: true,
    // Modules: SOSIA version CONSULTANT (senior), RH own profile, no billing/employer/backup
    canAccessFacturation: false, canAccessPortailEmployeurs: false,
    canAccessSOSIA: true, canAccessSOSIAConsultant: true,
    canAccessRH: true, canAccessRHAdmin: false, canAccessBackup: false,
  },
  avocat_consultant: {
    canCreateClient: true, canEditClient: true, canDeleteClient: true, canViewAllClients: true,
    canCreateCase: true, canEditCase: true, canDeleteCase: true,
    canFillForms: true, canApproveForms: true, canSignForms: true,
    canViewReports: true, canManageUsers: false, canManageSettings: false,
    canScheduleAppointments: true, canViewFinancials: true, canExportData: true,
    canAccessLegalDocs: true, canOverrideDecisions: true, canViewAuditLog: true,
    // Modules: SOSIA version CONSULTANT (senior), RH own profile, no billing/employer/backup
    canAccessFacturation: false, canAccessPortailEmployeurs: false,
    canAccessSOSIA: true, canAccessSOSIAConsultant: true,
    canAccessRH: true, canAccessRHAdmin: false, canAccessBackup: false,
  },
  coordinatrice: {
    canCreateClient: true, canEditClient: true, canDeleteClient: true, canViewAllClients: true,
    canCreateCase: true, canEditCase: true, canDeleteCase: true,
    canFillForms: true, canApproveForms: true, canSignForms: true,
    canViewReports: true, canManageUsers: true, canManageSettings: true,
    canScheduleAppointments: true, canViewFinancials: true, canExportData: true,
    canAccessLegalDocs: true, canOverrideDecisions: true, canViewAuditLog: true,
    // Modules: ALL access — SOSIA consultant, facturation, employeurs, RH admin, backup
    canAccessFacturation: true, canAccessPortailEmployeurs: true,
    canAccessSOSIA: true, canAccessSOSIAConsultant: true,
    canAccessRH: true, canAccessRHAdmin: true, canAccessBackup: true,
  },
  superadmin: {
    canCreateClient: true, canEditClient: true, canDeleteClient: true, canViewAllClients: true,
    canCreateCase: true, canEditCase: true, canDeleteCase: true,
    canFillForms: true, canApproveForms: true, canSignForms: true,
    canViewReports: true, canManageUsers: true, canManageSettings: true,
    canScheduleAppointments: true, canViewFinancials: true, canExportData: true,
    canAccessLegalDocs: true, canOverrideDecisions: true, canViewAuditLog: true,
    // Modules: ALL access
    canAccessFacturation: true, canAccessPortailEmployeurs: true,
    canAccessSOSIA: true, canAccessSOSIAConsultant: true,
    canAccessRH: true, canAccessRHAdmin: true, canAccessBackup: true,
  },
};

export const ROLE_LABELS: Record<CrmRole, string> = {
  receptionniste: 'Réceptionniste',
  conseiller: 'Conseiller(ère)',
  technicienne_juridique: 'Technicienne juridique',
  avocat_consultant: 'Avocat / Consultant',
  coordinatrice: 'Coordinatrice',
  superadmin: 'Super Admin',
};

// --- Client ---
export type ClientStatus = 'prospect' | 'actif' | 'en_attente' | 'complete' | 'annule' | 'archive';

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  prospect: 'Prospect',
  actif: 'Actif',
  en_attente: 'En attente',
  complete: 'Complété',
  annule: 'Annulé',
  archive: 'Archivé',
};

export const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  prospect: 'bg-blue-100 text-blue-700',
  actif: 'bg-green-100 text-green-700',
  en_attente: 'bg-amber-100 text-amber-700',
  complete: 'bg-purple-100 text-purple-700',
  annule: 'bg-red-100 text-red-700',
  archive: 'bg-gray-100 text-gray-500',
};

export const CLIENT_STATUS_ICONS: Record<ClientStatus, string> = {
  prospect: '🔵',
  actif: '🟢',
  en_attente: '🟡',
  complete: '🟣',
  annule: '🔴',
  archive: '⚫',
};

export type ClientSource = 'site_web' | 'reseaux_sociaux' | 'reference_client' | 'reference_partenaire' | 'walk_in' | 'evenement' | 'publicite' | 'test_admissibilite' | 'autre';

export const CLIENT_SOURCE_LABELS: Record<ClientSource, string> = {
  site_web: 'Site web',
  reseaux_sociaux: 'Réseaux sociaux',
  reference_client: 'Référence client',
  reference_partenaire: 'Référence partenaire',
  walk_in: 'Walk-in',
  evenement: 'Événement',
  publicite: 'Publicité',
  test_admissibilite: 'Test admissibilité gratuit',
  autre: 'Autre',
};

export type ClientPriority = 'haute' | 'moyenne' | 'basse';

export const CLIENT_PRIORITY_LABELS: Record<ClientPriority, string> = {
  haute: 'Haute',
  moyenne: 'Moyenne',
  basse: 'Basse',
};

export interface FamilyMember {
  id: string;
  relationship: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  accompany: boolean;
}

// --- Documents ---
export type DocumentCategory = 'identite' | 'education' | 'emploi' | 'financier' | 'medical' | 'legal' | 'photos' | 'langue' | 'autre';
export type DocumentStatus = 'requis' | 'televerse' | 'verifie' | 'expire' | 'rejete';

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  identite: 'Identité', education: 'Éducation', emploi: 'Emploi',
  financier: 'Financier', medical: 'Médical', legal: 'Juridique',
  photos: 'Photos', langue: 'Langue', autre: 'Autre',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  requis: 'Requis', televerse: 'Téléversé', verifie: 'Vérifié', expire: 'Expiré', rejete: 'Rejeté',
};

export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  requis: 'bg-gray-100 text-gray-600',
  televerse: 'bg-blue-100 text-blue-700',
  verifie: 'bg-green-100 text-green-700',
  expire: 'bg-red-100 text-red-700',
  rejete: 'bg-orange-100 text-orange-700',
};

export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface ClientDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  fileName?: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  expiryDate?: string;
  version?: number;
  notes?: string;
  caseId?: string;
}

export type EmployerDocumentCategory = 'incorporation' | 'financier' | 'lmia' | 'assurance' | 'permis' | 'fiscal' | 'cnesst' | 'autre';

export const EMPLOYER_DOCUMENT_CATEGORY_LABELS: Record<EmployerDocumentCategory, string> = {
  incorporation: 'Incorporation', financier: 'Financier', lmia: 'EIMT/LMIA',
  assurance: 'Assurance', permis: 'Permis', fiscal: 'Fiscal', cnesst: 'CNESST', autre: 'Autre',
};

export interface EmployerDocument {
  id: string;
  name: string;
  fileName?: string;
  category: EmployerDocumentCategory;
  status: DocumentStatus;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
  uploadedBy?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  expiryDate?: string;
  version?: number;
  notes?: string;
  lmiaId?: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  currentCountry: string;
  currentStatus: string;
  passportNumber: string;
  passportExpiry: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  status: ClientStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  languageEnglish: string;
  languageFrench: string;
  education: string;
  workExperience: string;
  maritalStatus: string;
  dependants: number;
  familyMembers: FamilyMember[];
  documents: ClientDocument[];
  // New CRM fields
  dateInscription?: string;
  source?: ClientSource;
  referePar?: string;
  priorite?: ClientPriority;
  dateDernierContact?: string;
  prochaineRelance?: string;
  numeroUCI?: string;
  numeroDossierIRCC?: string;
  dateExpirationStatut?: string;
  programmeInteret?: string;
  consentementCommunication?: boolean;
  consentementPartage?: boolean;
  dateConsentement?: string;
}

// --- Dossier (Case) ---
export type CaseStatus =
  | 'nouveau' | 'consultation' | 'en_preparation' | 'formulaires_remplis'
  | 'revision' | 'soumis' | 'en_traitement_ircc' | 'approuve' | 'refuse' | 'appel' | 'ferme';

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  nouveau: 'Nouveau',
  consultation: 'Consultation',
  en_preparation: 'En préparation',
  formulaires_remplis: 'Formulaires remplis',
  revision: 'Révision',
  soumis: 'Soumis',
  en_traitement_ircc: 'En traitement IRCC',
  approuve: 'Approuvé',
  refuse: 'Refusé',
  appel: 'Appel',
  ferme: 'Fermé',
};

export const CASE_STATUS_COLORS: Record<CaseStatus, string> = {
  nouveau: 'bg-blue-100 text-blue-700',
  consultation: 'bg-purple-100 text-purple-700',
  en_preparation: 'bg-amber-100 text-amber-700',
  formulaires_remplis: 'bg-cyan-100 text-cyan-700',
  revision: 'bg-orange-100 text-orange-700',
  soumis: 'bg-indigo-100 text-indigo-700',
  en_traitement_ircc: 'bg-yellow-100 text-yellow-700',
  approuve: 'bg-green-100 text-green-700',
  refuse: 'bg-red-100 text-red-700',
  appel: 'bg-pink-100 text-pink-700',
  ferme: 'bg-gray-100 text-gray-700',
};

export const PRIORITY_LABELS: Record<string, string> = {
  basse: 'Basse',
  normale: 'Normale',
  haute: 'Haute',
  urgente: 'Urgente',
};

export const PRIORITY_COLORS: Record<string, string> = {
  basse: 'bg-gray-100 text-gray-600',
  normale: 'bg-blue-100 text-blue-600',
  haute: 'bg-orange-100 text-orange-600',
  urgente: 'bg-red-100 text-red-600',
};

export interface CaseForm {
  id: string;
  formId: string;
  status: 'vide' | 'en_cours' | 'rempli' | 'revise' | 'approuve' | 'signe';
  filledBy: string;
  reviewedBy: string;
  approvedBy: string;
  data: Record<string, unknown>;
  lastUpdated: string;
}

export const FORM_STATUS_LABELS: Record<string, string> = {
  vide: 'Vide',
  en_cours: 'En cours',
  rempli: 'Rempli',
  revise: 'Révisé',
  approuve: 'Approuvé',
  signe: 'Signé',
};

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'note' | 'status_change' | 'form_update' | 'document' | 'appointment' | 'email' | 'ircc_update';
  description: string;
  userId: string;
}

export interface Case {
  id: string;
  clientId: string;
  programId: string;
  title: string;
  status: CaseStatus;
  assignedTo: string;
  assignedLawyer: string;
  priority: 'basse' | 'normale' | 'haute' | 'urgente';
  createdAt: string;
  updatedAt: string;
  deadline: string;
  irccAppNumber: string;
  uciNumber: string;
  notes: string;
  forms: CaseForm[];
  timeline: TimelineEvent[];
}

// --- Rendez-vous ---
export type AppointmentType = 'consultation_initiale' | 'suivi' | 'revision_formulaires' | 'preparation_entrevue' | 'signature' | 'autre';
export type AppointmentStatus = 'planifie' | 'confirme' | 'en_cours' | 'complete' | 'annule' | 'no_show';

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  consultation_initiale: 'Consultation initiale',
  suivi: 'Suivi',
  revision_formulaires: 'Révision formulaires',
  preparation_entrevue: 'Préparation entrevue',
  signature: 'Signature',
  autre: 'Autre',
};

export const APPOINTMENT_TYPE_COLORS: Record<AppointmentType, string> = {
  consultation_initiale: 'bg-blue-100 text-blue-700 border-blue-200',
  suivi: 'bg-green-100 text-green-700 border-green-200',
  revision_formulaires: 'bg-amber-100 text-amber-700 border-amber-200',
  preparation_entrevue: 'bg-purple-100 text-purple-700 border-purple-200',
  signature: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  autre: 'bg-gray-100 text-gray-700 border-gray-200',
};

export interface Appointment {
  id: string;
  clientId: string;
  caseId?: string;
  userId: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
}

// --- Programme immigration ---
export interface ImmigrationProgram {
  id: string;
  name: string;
  category: string;
  description: string;
  requiredForms: string[];
  processingTime: string;
  fees: { government: number; service: number };
  requirements: string[];
}

// --- Formulaire IRCC ---
export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'checkbox' | 'radio' | 'number' | 'email' | 'phone' | 'country' | 'section_header';
  required: boolean;
  options?: FormFieldOption[];
  placeholder?: string;
  autoFillFrom?: string;
  section: string;
  width?: 'full' | 'half' | 'third';
  helpText?: string;
}

export interface IrccFormDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  fields: FormFieldDefinition[];
  version: string;
}
