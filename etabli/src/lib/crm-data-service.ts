// ========================================================
// SOS Hub Canada - Service de données CRM
// Couche d'abstraction entre Supabase et les types CRM
// Mode: Supabase si configuré, sinon fallback sur données démo
// ========================================================
import { supabase } from './supabase';
import type { Client, Case, CaseForm, Appointment, CrmUser, TimelineEvent, FamilyMember, ClientDocument } from './crm-types';
import type { ServiceContract } from './crm-pricing-2026';
import { DEMO_USERS, DEMO_CLIENTS, DEMO_CASES, DEMO_APPOINTMENTS } from './crm-store';
import { DEMO_CONTRACTS } from './crm-pricing-2026';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================
// Détection du mode (Supabase ou démo)
// ============================================================
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('VOTRE-PROJET');
};

// Helper: cast supabase pour contourner les types `never` de v2.99
const db = supabase as any;

// ============================================================
// USERS
// ============================================================
export async function fetchUsers(): Promise<CrmUser[]> {
  if (!isSupabaseConfigured()) return DEMO_USERS;

  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error || !data) { console.error('fetchUsers error:', error); return DEMO_USERS; }
  return (data as any[]).map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar_url ?? undefined,
    active: u.active,
  }));
}

export async function fetchUserById(id: string): Promise<CrmUser | null> {
  if (!isSupabaseConfigured()) return DEMO_USERS.find(u => u.id === id) ?? null;

  const { data, error } = await db.from('users').select('*').eq('id', id).single();
  if (error || !data) return null;
  const u = data as any;
  return { id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar_url ?? undefined, active: u.active };
}

// ============================================================
// CLIENTS
// ============================================================
export async function fetchClients(): Promise<Client[]> {
  if (!isSupabaseConfigured()) return DEMO_CLIENTS;

  const { data: clients, error } = await db
    .from('clients')
    .select(`
      *,
      family_members (*),
      client_documents (*)
    `)
    .order('last_name');

  if (error || !clients) { console.error('fetchClients error:', error); return DEMO_CLIENTS; }

  return (clients as any[]).map((c: any) => ({
    id: c.id,
    firstName: c.first_name,
    lastName: c.last_name,
    email: c.email,
    phone: c.phone,
    dateOfBirth: c.date_of_birth ?? '',
    nationality: c.nationality,
    currentCountry: c.current_country,
    currentStatus: c.current_status,
    passportNumber: c.passport_number,
    passportExpiry: c.passport_expiry ?? '',
    address: c.address,
    city: c.city,
    province: c.province,
    postalCode: c.postal_code,
    status: c.status,
    assignedTo: c.assigned_to ?? '',
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    notes: c.notes,
    languageEnglish: c.language_english,
    languageFrench: c.language_french,
    education: c.education,
    workExperience: c.work_experience,
    maritalStatus: c.marital_status,
    dependants: c.dependants,
    familyMembers: (c.family_members ?? []).map((fm: any) => ({
      id: fm.id,
      relationship: fm.relationship,
      firstName: fm.first_name,
      lastName: fm.last_name,
      dateOfBirth: fm.date_of_birth ?? '',
      nationality: fm.nationality,
      passportNumber: fm.passport_number,
      accompany: fm.accompany,
    })),
    documents: (c.client_documents ?? []).map((d: any) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      uploadedAt: d.uploaded_at,
    })),
  }));
}

export async function insertClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'familyMembers' | 'documents'>): Promise<Client | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await db.from('clients').insert({
    first_name: client.firstName,
    last_name: client.lastName,
    email: client.email,
    phone: client.phone,
    date_of_birth: client.dateOfBirth || null,
    nationality: client.nationality,
    current_country: client.currentCountry,
    current_status: client.currentStatus,
    passport_number: client.passportNumber,
    passport_expiry: client.passportExpiry || null,
    address: client.address,
    city: client.city,
    province: client.province,
    postal_code: client.postalCode,
    status: client.status,
    assigned_to: client.assignedTo || null,
    notes: client.notes,
    language_english: client.languageEnglish,
    language_french: client.languageFrench,
    education: client.education,
    work_experience: client.workExperience,
    marital_status: client.maritalStatus,
    dependants: client.dependants,
  }).select().single();

  if (error || !data) { console.error('insertClient error:', error); return null; }
  const clients = await fetchClients();
  return clients.find(c => c.id === (data as any).id) ?? null;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const dbUpdates: Record<string, unknown> = {};
  // Identity & contact
  if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
  if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth || null;
  if (updates.nationality !== undefined) dbUpdates.nationality = updates.nationality;
  if (updates.currentCountry !== undefined) dbUpdates.current_country = updates.currentCountry;
  if (updates.currentStatus !== undefined) dbUpdates.current_status = updates.currentStatus;
  if (updates.passportNumber !== undefined) dbUpdates.passport_number = updates.passportNumber;
  if (updates.passportExpiry !== undefined) dbUpdates.passport_expiry = updates.passportExpiry || null;
  // Address
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.city !== undefined) dbUpdates.city = updates.city;
  if (updates.province !== undefined) dbUpdates.province = updates.province;
  if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode;
  // Profile
  if (updates.education !== undefined) dbUpdates.education = updates.education;
  if (updates.workExperience !== undefined) dbUpdates.work_experience = updates.workExperience;
  if (updates.languageEnglish !== undefined) dbUpdates.language_english = updates.languageEnglish;
  if (updates.languageFrench !== undefined) dbUpdates.language_french = updates.languageFrench;
  if (updates.maritalStatus !== undefined) dbUpdates.marital_status = updates.maritalStatus;
  if (updates.dependants !== undefined) dbUpdates.dependants = updates.dependants;
  // Notes & CRM
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo || null;
  if (updates.source !== undefined) dbUpdates.source = updates.source;
  if (updates.referePar !== undefined) dbUpdates.refere_par = updates.referePar;
  if (updates.priorite !== undefined) dbUpdates.priorite = updates.priorite;
  if (updates.dateDernierContact !== undefined) dbUpdates.date_dernier_contact = updates.dateDernierContact || null;
  if (updates.prochaineRelance !== undefined) dbUpdates.prochaine_relance = updates.prochaineRelance || null;
  // Immigration
  if (updates.numeroUCI !== undefined) dbUpdates.numero_uci = updates.numeroUCI;
  if (updates.numeroDossierIRCC !== undefined) dbUpdates.numero_dossier_ircc = updates.numeroDossierIRCC;
  if (updates.dateExpirationStatut !== undefined) dbUpdates.date_expiration_statut = updates.dateExpirationStatut || null;
  if (updates.programmeInteret !== undefined) dbUpdates.programme_interet = updates.programmeInteret;
  // Consent
  if (updates.consentementCommunication !== undefined) dbUpdates.consentement_communication = updates.consentementCommunication;
  if (updates.consentementPartage !== undefined) dbUpdates.consentement_partage = updates.consentementPartage;
  if (updates.dateConsentement !== undefined) dbUpdates.date_consentement = updates.dateConsentement || null;
  // Dates
  if (updates.dateInscription !== undefined) dbUpdates.date_inscription = updates.dateInscription || null;

  const { error } = await db.from('clients').update(dbUpdates).eq('id', id);
  if (error) { console.error('updateClient error:', error); return false; }
  return true;
}

// ============================================================
// CASES
// ============================================================
export async function fetchCases(): Promise<Case[]> {
  if (!isSupabaseConfigured()) return DEMO_CASES;

  const { data: cases, error } = await db
    .from('cases')
    .select(`
      *,
      case_forms (*),
      timeline_events (*)
    `)
    .order('created_at', { ascending: false });

  if (error || !cases) { console.error('fetchCases error:', error); return DEMO_CASES; }

  return (cases as any[]).map((c: any) => ({
    id: c.id,
    clientId: c.client_id,
    programId: c.program_id,
    title: c.title,
    status: c.status,
    assignedTo: c.assigned_to ?? '',
    assignedLawyer: c.assigned_lawyer ?? '',
    priority: c.priority,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    deadline: c.deadline ?? '',
    irccAppNumber: c.ircc_app_number,
    uciNumber: c.uci_number,
    notes: c.notes,
    forms: (c.case_forms ?? []).map((f: any) => ({
      id: f.id,
      formId: f.form_id,
      status: f.status as CaseForm['status'],
      filledBy: f.filled_by ?? '',
      reviewedBy: f.reviewed_by ?? '',
      approvedBy: f.approved_by ?? '',
      data: f.data ?? {},
      lastUpdated: f.last_updated,
    })),
    timeline: (c.timeline_events ?? []).map((e: any) => ({
      id: e.id,
      date: e.date,
      type: e.type as TimelineEvent['type'],
      description: e.description,
      userId: e.user_id ?? '',
    })),
  }));
}

export async function insertCase(caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'forms' | 'timeline'>): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await db.from('cases').insert({
    client_id: caseData.clientId,
    program_id: caseData.programId,
    title: caseData.title,
    status: caseData.status,
    assigned_to: caseData.assignedTo || null,
    assigned_lawyer: caseData.assignedLawyer || null,
    priority: caseData.priority,
    deadline: caseData.deadline || null,
    ircc_app_number: caseData.irccAppNumber,
    uci_number: caseData.uciNumber,
    notes: caseData.notes,
  }).select('id').single();

  if (error || !data) { console.error('insertCase error:', error); return null; }
  return (data as any).id;
}

export async function updateCaseStatus(id: string, status: Case['status']): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await db.from('cases').update({ status }).eq('id', id);
  if (error) { console.error('updateCaseStatus error:', error); return false; }
  return true;
}

// ============================================================
// TIMELINE EVENTS
// ============================================================
export async function insertTimelineEvent(event: Omit<TimelineEvent, 'id'> & { caseId: string }): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await db.from('timeline_events').insert({
    case_id: event.caseId,
    date: event.date,
    type: event.type,
    description: event.description,
    user_id: event.userId || null,
  });

  if (error) { console.error('insertTimelineEvent error:', error); return false; }
  return true;
}

// ============================================================
// CONTRACTS
// ============================================================
export async function fetchContracts(): Promise<ServiceContract[]> {
  if (!isSupabaseConfigured()) return DEMO_CONTRACTS;

  const { data, error } = await db
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) { console.error('fetchContracts error:', error); return DEMO_CONTRACTS; }

  return (data as any[]).map((c: any) => ({
    id: c.id,
    caseId: c.case_id ?? '',
    clientId: c.client_id,
    pricingTierId: c.tier_id ?? c.program_id ?? '',
    status: c.status,
    serviceFee: Number(c.service_fee),
    governmentFee: Number(c.government_fee),
    governmentFeePayeur: c.government_fee_payeur,
    addOns: [],
    totalBeforeTax: Number(c.service_fee) + Number(c.frais_ouverture ?? 0),
    tps: Number(c.tps),
    tvq: Number(c.tvq),
    grandTotal: Number(c.grand_total),
    installments: c.installments ?? [],
    paymentOption: c.payment_plan ?? '',
    createdBy: c.created_by ?? '',
    signedAt: c.signed_at ?? '',
    createdAt: c.created_at,
    notes: c.notes ?? '',
  }));
}

export async function insertContract(contract: ServiceContract): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await db.from('contracts').insert({
    id: contract.id,
    case_id: contract.caseId || null,
    client_id: contract.clientId,
    program_id: contract.pricingTierId,
    tier_id: contract.pricingTierId,
    status: contract.status,
    service_fee: contract.serviceFee,
    government_fee: contract.governmentFee,
    government_fee_payeur: contract.governmentFeePayeur,
    frais_ouverture: 0,
    tps: contract.tps,
    tvq: contract.tvq,
    grand_total: contract.grandTotal,
    installments: JSON.stringify(contract.installments),
    payment_plan: contract.paymentOption,
    created_by: contract.createdBy || null,
  });

  if (error) { console.error('insertContract error:', error); return false; }
  return true;
}

// ============================================================
// APPOINTMENTS
// ============================================================
export async function fetchAppointments(): Promise<Appointment[]> {
  if (!isSupabaseConfigured()) return DEMO_APPOINTMENTS;

  const { data, error } = await db
    .from('appointments')
    .select('*')
    .order('date', { ascending: true });

  if (error || !data) { console.error('fetchAppointments error:', error); return DEMO_APPOINTMENTS; }

  return (data as any[]).map((a: any) => ({
    id: a.id,
    clientId: a.client_id,
    caseId: a.case_id ?? undefined,
    userId: a.user_id,
    title: a.title,
    date: a.date,
    time: a.time,
    duration: a.duration,
    type: a.type,
    status: a.status,
    notes: a.notes,
  }));
}

// ============================================================
// SCORING RESULTS
// ============================================================
export async function insertScoringResult(result: {
  caseId: string;
  clientId: string;
  scoringType: 'crs' | 'mifi';
  score: number;
  threshold: number;
  breakdown: unknown;
  advice: unknown;
  profileSnapshot: unknown;
  createdBy: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await db.from('scoring_results').insert({
    case_id: result.caseId,
    client_id: result.clientId,
    scoring_type: result.scoringType,
    score: result.score,
    threshold: result.threshold,
    breakdown: result.breakdown,
    advice: result.advice,
    profile_snapshot: result.profileSnapshot,
    created_by: result.createdBy,
  });

  if (error) { console.error('insertScoringResult error:', error); return false; }
  return true;
}

// ============================================================
// EMAILS
// ============================================================
export async function insertEmailRecord(email: {
  clientId: string;
  caseId?: string;
  toEmail: string;
  subject: string;
  body: string;
  type: 'scoring_results' | 'contract' | 'appointment' | 'general';
  sentBy: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { error } = await db.from('emails_sent').insert({
    client_id: email.clientId,
    case_id: email.caseId || null,
    to_email: email.toEmail,
    subject: email.subject,
    body: email.body,
    type: email.type,
    sent_by: email.sentBy,
  });

  if (error) { console.error('insertEmailRecord error:', error); return false; }
  return true;
}

// ========================================================
// Gestion des utilisateurs (CRUD)
// ========================================================
export async function insertUser(user: { name: string; email: string; role: string; active?: boolean }): Promise<CrmUser | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await db.from('users').insert({
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active ?? true,
  }).select().single();
  if (error) { console.error('insertUser error:', error); return null; }
  return { id: data.id, name: data.name, email: data.email, role: data.role, active: data.active };
}

export async function updateUser(id: string, updates: { name?: string; role?: string; active?: boolean }): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await db.from('users').update(updates).eq('id', id);
  if (error) { console.error('updateUser error:', error); return false; }
  return true;
}

export async function deactivateUser(id: string): Promise<boolean> {
  return updateUser(id, { active: false });
}
