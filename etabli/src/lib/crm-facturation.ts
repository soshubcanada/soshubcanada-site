// ========================================================
// SOS Hub Canada - Système de facturation
// Conforme aux standards comptables du Québec
// Loi sur la taxe de vente du Québec (LTVQ)
// Loi sur la taxe d'accise (LTA) - TPS
// ========================================================

// --- Taxes québécoises ---
// STATUT: NON-INSCRIT aux fichiers TPS/TVQ
// Obligation: ne PAS facturer de taxes, afficher la mention obligatoire
// Quand l'entreprise sera inscrite, changer IS_TAX_REGISTERED = true et remplir les vrais numéros
export const IS_TAX_REGISTERED = false;
// TPS (Taxe sur les produits et services) - fédéral
export const TPS_RATE = IS_TAX_REGISTERED ? 0.05 : 0; // 5% si inscrit, 0% sinon
// TVQ (Taxe de vente du Québec) - provincial
export const TVQ_RATE = IS_TAX_REGISTERED ? 0.09975 : 0; // 9.975% si inscrit, 0% sinon
export const TOTAL_TAX_RATE = TPS_RATE + TVQ_RATE;

// --- Informations de l'entreprise (obligatoires sur chaque facture) ---
export const COMPANY_TAX_INFO = {
  // Raison sociale
  nomLegal: 'SOS Hub Canada Inc.',
  nomCommercial: 'SOS Hub Canada',
  // Adresse du siège
  adresse: '3737 Crémazie Est, Bureau 402',
  ville: 'Montréal',
  province: 'QC',
  codePostal: 'H1Z 2K4',
  pays: 'Canada',
  // Contact
  telephone: '+1 (438) 630-2869',
  courriel: 'info@soshubcanada.com',
  siteWeb: 'soshubcanada.com',
  // Numéro d'entreprise du Québec (REQ)
  neq: '1179aborhp0001',
  // NON-INSCRIT aux fichiers TPS/TVQ — ne pas facturer de taxes
  tps: '',
  tvq: '',
};

// --- Types de services et taxabilité ---
// Au Québec selon la LTVQ:
// - Services de consultation en immigration = TAXABLES (TPS + TVQ)
// - Frais gouvernementaux (déboursés pour le compte du client) = NON-TAXABLES
// - Services exemptés par la loi (ex: certains services financiers) = EXEMPTS
export type TaxCategory = 'taxable' | 'exempt' | 'debourse';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxCategory: TaxCategory;
  tpsAmount: number;
  tvqAmount: number;
  total: number; // sous-total de la ligne (avant taxes pour affichage, total avec taxes pour grand total)
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // Format séquentiel: SHC-AAAA-NNNNN
  clientId: string;
  caseId?: string;
  // Client manuel (QuickBooks-style — facture sans création client CRM)
  manualClientName?: string;
  manualClientEmail?: string;
  manualClientPhone?: string;
  manualClientAddress?: string;
  manualClientCity?: string;
  manualClientProvince?: string;
  manualClientPostalCode?: string;
  // Dates
  date: string;        // Date d'émission
  dueDate: string;     // Date d'échéance
  // Statut
  status: 'brouillon' | 'envoyee' | 'payee' | 'partielle' | 'en_retard' | 'annulee';
  // Lignes de facturation
  items: InvoiceItem[];
  // Sous-totaux par catégorie (obligatoire QC: ventilation claire)
  subtotalTaxable: number;   // Services taxables (avant taxes)
  subtotalExempt: number;    // Services exemptés
  subtotalDebourse: number;  // Déboursés (frais gouvernementaux)
  // Taxes (chaque taxe sur sa propre ligne - obligation QC)
  tpsTotal: number;          // TPS 5%
  tvqTotal: number;          // TVQ 9.975%
  // Total
  grandTotal: number;        // Sous-totaux + TPS + TVQ
  // Paiements
  paidAmount: number;
  balanceDue: number;
  paymentMethod?: 'stripe' | 'square' | 'virement' | 'cheque' | 'comptant' | 'interac';
  paymentDate?: string;
  paymentReference?: string;
  // Métadonnées
  notes: string;
  createdBy: string;
  terms: 'immediat' | 'net15' | 'net30' | 'net60' | 'acompte_50';
}

/** Resolve display name for invoice client (CRM or manual) */
export function getInvoiceClientName(inv: Invoice, crmClientName: (id: string) => string): string {
  if (inv.manualClientName) return inv.manualClientName;
  if (inv.clientId) return crmClientName(inv.clientId);
  return 'Client inconnu';
}

export const INVOICE_STATUS_LABELS: Record<Invoice['status'], string> = {
  brouillon: 'Brouillon',
  envoyee: 'Envoyée',
  payee: 'Payée',
  partielle: 'Paiement partiel',
  en_retard: 'En retard',
  annulee: 'Annulée',
};

export const INVOICE_STATUS_COLORS: Record<Invoice['status'], string> = {
  brouillon: 'bg-gray-100 text-gray-700',
  envoyee: 'bg-blue-100 text-blue-700',
  payee: 'bg-green-100 text-green-700',
  partielle: 'bg-amber-100 text-amber-700',
  en_retard: 'bg-red-100 text-red-700',
  annulee: 'bg-gray-100 text-gray-400',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  stripe: 'Carte de crédit (Stripe)',
  square: 'Terminal (Square)',
  virement: 'Virement bancaire',
  cheque: 'Chèque',
  comptant: 'Comptant',
  interac: 'Virement Interac',
};

export const TERMS_LABELS: Record<string, string> = {
  immediat: 'Paiement immédiat',
  net15: 'Net 15 jours',
  net30: 'Net 30 jours',
  net60: 'Net 60 jours',
  acompte_50: 'Acompte 50%',
};

// --- Services prédéfinis ---
export interface ServiceTemplate {
  id: string;
  description: string;
  category: string;
  defaultPrice: number;
  taxCategory: TaxCategory;
}

export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  // Services de consultation (TAXABLES - TPS 5% + TVQ 9.975%)
  { id: 'srv-consultation-init', description: 'Consultation initiale — Évaluation du profil', category: 'consultation', defaultPrice: 150, taxCategory: 'taxable' },
  { id: 'srv-consultation-suivi', description: 'Consultation de suivi', category: 'consultation', defaultPrice: 100, taxCategory: 'taxable' },
  { id: 'srv-ouverture-dossier', description: 'Frais d\'ouverture de dossier', category: 'consultation', defaultPrice: 250, taxCategory: 'taxable' },

  // Express Entry
  { id: 'srv-ee-fsw', description: 'Service complet — Entrée express (FSW)', category: 'service', defaultPrice: 3500, taxCategory: 'taxable' },
  { id: 'srv-ee-cec', description: 'Service complet — Catégorie expérience canadienne (CEC)', category: 'service', defaultPrice: 3000, taxCategory: 'taxable' },
  { id: 'srv-ee-fst', description: 'Service complet — Métiers spécialisés (FST)', category: 'service', defaultPrice: 3000, taxCategory: 'taxable' },

  // Québec
  { id: 'srv-pstq', description: 'Service complet — PSTQ / Arrima', category: 'service', defaultPrice: 4000, taxCategory: 'taxable' },
  { id: 'srv-peq', description: 'Service complet — PEQ', category: 'service', defaultPrice: 3500, taxCategory: 'taxable' },
  { id: 'srv-pnp', description: 'Service complet — Programme provincial (PNP)', category: 'service', defaultPrice: 4000, taxCategory: 'taxable' },

  // Parrainage
  { id: 'srv-family-spouse', description: 'Service complet — Parrainage époux/conjoint', category: 'service', defaultPrice: 4000, taxCategory: 'taxable' },
  { id: 'srv-family-parents', description: 'Service complet — Parrainage parents/grands-parents', category: 'service', defaultPrice: 4500, taxCategory: 'taxable' },

  // Temporaire
  { id: 'srv-study', description: 'Service — Permis d\'études', category: 'service', defaultPrice: 1500, taxCategory: 'taxable' },
  { id: 'srv-work', description: 'Service — Permis de travail', category: 'service', defaultPrice: 2000, taxCategory: 'taxable' },
  { id: 'srv-trv', description: 'Service — Visa de résident temporaire', category: 'service', defaultPrice: 800, taxCategory: 'taxable' },
  { id: 'srv-pgwp', description: 'Service — PTPD post-diplôme', category: 'service', defaultPrice: 1000, taxCategory: 'taxable' },
  { id: 'srv-super-visa', description: 'Service — Super visa', category: 'service', defaultPrice: 1200, taxCategory: 'taxable' },

  // Réfugiés
  { id: 'srv-asile', description: 'Service complet — Demande d\'asile', category: 'service', defaultPrice: 5000, taxCategory: 'taxable' },
  { id: 'srv-protected-pr', description: 'Service — RP personne protégée', category: 'service', defaultPrice: 3000, taxCategory: 'taxable' },

  // Citoyenneté
  { id: 'srv-citizenship', description: 'Service — Demande de citoyenneté', category: 'service', defaultPrice: 1500, taxCategory: 'taxable' },
  { id: 'srv-pr-card', description: 'Service — Renouvellement carte RP', category: 'service', defaultPrice: 500, taxCategory: 'taxable' },

  // Humanitaire & Affaires
  { id: 'srv-hc', description: 'Service — Considérations humanitaires (CH)', category: 'service', defaultPrice: 5000, taxCategory: 'taxable' },
  { id: 'srv-startup', description: 'Service — Visa démarrage d\'entreprise', category: 'service', defaultPrice: 5000, taxCategory: 'taxable' },

  // Services additionnels (TAXABLES)
  { id: 'srv-traduction', description: 'Traduction certifiée (par page)', category: 'additionnel', defaultPrice: 35, taxCategory: 'taxable' },
  { id: 'srv-photos', description: 'Photos d\'identité conformes IRCC', category: 'additionnel', defaultPrice: 20, taxCategory: 'taxable' },
  { id: 'srv-notarisation', description: 'Notarisation / Commissaire à l\'assermentation', category: 'additionnel', defaultPrice: 50, taxCategory: 'taxable' },
  { id: 'srv-revision-urgente', description: 'Supplément traitement urgent', category: 'additionnel', defaultPrice: 250, taxCategory: 'taxable' },
  { id: 'srv-prep-entrevue', description: 'Préparation à l\'entrevue (CISR / IRCC)', category: 'additionnel', defaultPrice: 300, taxCategory: 'taxable' },

  // Frais gouvernementaux — DÉBOURSÉS (non taxables, art. 178 LTA)
  // Transmis au client sans majoration — pas de TPS/TVQ
  { id: 'gov-rp-principal', description: '[Déboursé] Frais gouv. — RP demandeur principal', category: 'gouvernement', defaultPrice: 1365, taxCategory: 'debourse' },
  { id: 'gov-rp-conjoint', description: '[Déboursé] Frais gouv. — RP conjoint/partenaire', category: 'gouvernement', defaultPrice: 1365, taxCategory: 'debourse' },
  { id: 'gov-rp-enfant', description: '[Déboursé] Frais gouv. — RP enfant à charge', category: 'gouvernement', defaultPrice: 260, taxCategory: 'debourse' },
  { id: 'gov-parrainage', description: '[Déboursé] Frais gouv. — Parrainage', category: 'gouvernement', defaultPrice: 1625, taxCategory: 'debourse' },
  { id: 'gov-study', description: '[Déboursé] Frais gouv. — Permis d\'études', category: 'gouvernement', defaultPrice: 150, taxCategory: 'debourse' },
  { id: 'gov-work', description: '[Déboursé] Frais gouv. — Permis de travail', category: 'gouvernement', defaultPrice: 155, taxCategory: 'debourse' },
  { id: 'gov-work-open', description: '[Déboursé] Frais gouv. — Permis travail ouvert', category: 'gouvernement', defaultPrice: 255, taxCategory: 'debourse' },
  { id: 'gov-trv', description: '[Déboursé] Frais gouv. — Visa résident temporaire', category: 'gouvernement', defaultPrice: 100, taxCategory: 'debourse' },
  { id: 'gov-citizenship', description: '[Déboursé] Frais gouv. — Citoyenneté adulte', category: 'gouvernement', defaultPrice: 630, taxCategory: 'debourse' },
  { id: 'gov-pr-card', description: '[Déboursé] Frais gouv. — Carte RP', category: 'gouvernement', defaultPrice: 50, taxCategory: 'debourse' },
  { id: 'gov-biometrie', description: '[Déboursé] Frais gouv. — Biométrie', category: 'gouvernement', defaultPrice: 85, taxCategory: 'debourse' },
  { id: 'gov-examen-medical', description: '[Déboursé] Examen médical d\'immigration', category: 'gouvernement', defaultPrice: 250, taxCategory: 'debourse' },
  { id: 'gov-csq', description: '[Déboursé] Frais gouv. — Certificat de sélection du Québec', category: 'gouvernement', defaultPrice: 883, taxCategory: 'debourse' },
  { id: 'gov-caq', description: '[Déboursé] Frais gouv. — CAQ (études)', category: 'gouvernement', defaultPrice: 127, taxCategory: 'debourse' },
];

// ========================================================
// Calcul des taxes québécoises — conforme LTVQ + LTA
// ========================================================

/**
 * Calcule TPS et TVQ pour une ligne de facture.
 * Au Québec, la TVQ est calculée sur le montant AVANT TPS (pas après).
 * C'est une particularité du Québec vs le reste du Canada.
 *
 * Référence: Revenu Québec — Calcul des taxes
 */
export function calculateItemTaxes(item: Omit<InvoiceItem, 'tpsAmount' | 'tvqAmount' | 'total'>): InvoiceItem {
  const subtotal = item.quantity * item.unitPrice;
  let tpsAmount = 0;
  let tvqAmount = 0;

  if (item.taxCategory === 'taxable') {
    // TPS sur le montant
    tpsAmount = Math.round(subtotal * TPS_RATE * 100) / 100;
    // TVQ calculée sur le montant (PAS sur montant + TPS — c'est unique au QC)
    tvqAmount = Math.round(subtotal * TVQ_RATE * 100) / 100;
  }
  // debourse et exempt: aucune taxe

  return {
    ...item,
    tpsAmount,
    tvqAmount,
    total: Math.round((subtotal + tpsAmount + tvqAmount) * 100) / 100,
  };
}

/**
 * Calcule les totaux d'une facture avec ventilation obligatoire:
 * - Sous-total services taxables
 * - Sous-total services exemptés
 * - Sous-total déboursés (frais gouvernementaux)
 * - TPS (5%)
 * - TVQ (9.975%)
 * - TOTAL
 *
 * Conforme à l'article 449 LTVQ et art. 223 LTA.
 */
export function calculateInvoiceTotals(items: InvoiceItem[]): {
  subtotalTaxable: number;
  subtotalExempt: number;
  subtotalDebourse: number;
  tpsTotal: number;
  tvqTotal: number;
  grandTotal: number;
} {
  let subtotalTaxable = 0;
  let subtotalExempt = 0;
  let subtotalDebourse = 0;
  let tpsTotal = 0;
  let tvqTotal = 0;

  for (const item of items) {
    const subtotal = item.quantity * item.unitPrice;
    if (item.taxCategory === 'taxable') subtotalTaxable += subtotal;
    else if (item.taxCategory === 'exempt') subtotalExempt += subtotal;
    else if (item.taxCategory === 'debourse') subtotalDebourse += subtotal;
    tpsTotal += item.tpsAmount;
    tvqTotal += item.tvqAmount;
  }

  return {
    subtotalTaxable: Math.round(subtotalTaxable * 100) / 100,
    subtotalExempt: Math.round(subtotalExempt * 100) / 100,
    subtotalDebourse: Math.round(subtotalDebourse * 100) / 100,
    tpsTotal: Math.round(tpsTotal * 100) / 100,
    tvqTotal: Math.round(tvqTotal * 100) / 100,
    grandTotal: Math.round((subtotalTaxable + subtotalExempt + subtotalDebourse + tpsTotal + tvqTotal) * 100) / 100,
  };
}

/**
 * Génère un numéro de facture séquentiel.
 * Format: SHC-AAAA-NNNNN (ex: SHC-2026-00001)
 * Obligation QC: numérotation séquentielle sans interruption pour piste d'audit.
 */
export function generateInvoiceNumber(existingInvoices: Invoice[]): string {
  const year = new Date().getFullYear();
  const prefix = `SHC-${year}-`;
  // Parse actual max number from existing invoice numbers to avoid duplicates
  // (counting .length would produce duplicates if invoices were deleted or created concurrently)
  let maxNum = 0;
  for (const inv of existingInvoices) {
    if (inv.invoiceNumber.startsWith(prefix)) {
      const numPart = parseInt(inv.invoiceNumber.slice(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
    }
  }
  // Use maxNum + 1 as the base, but also check localStorage for a lock to prevent
  // race conditions when multiple tabs create invoices simultaneously.
  const lockKey = `shc_inv_lock_${year}`;
  const lastLocked = parseInt(localStorage.getItem(lockKey) || '0', 10);
  const nextNum = Math.max(maxNum + 1, lastLocked + 1);
  // Persist the claimed number so other tabs won't reuse it
  try { localStorage.setItem(lockKey, String(nextNum)); } catch { /* quota */ }
  return `SHC-${year}-${String(nextNum).padStart(5, '0')}`;
}

/**
 * Calcule la date d'échéance selon les termes de paiement.
 */
export function getDueDate(date: string, terms: Invoice['terms']): string {
  const d = new Date(date);
  switch (terms) {
    case 'immediat': return date;
    case 'net15': d.setDate(d.getDate() + 15); break;
    case 'net30': d.setDate(d.getDate() + 30); break;
    case 'net60': d.setDate(d.getDate() + 60); break;
    case 'acompte_50': return date;
  }
  return d.toISOString().split('T')[0];
}

// --- Mention légale obligatoire sur chaque facture ---
export const LEGAL_MENTIONS = {
  // Mention NON-INSCRIT (OBLIGATOIRE sur chaque facture)
  taxStatus: IS_TAX_REGISTERED
    ? `TPS: ${COMPANY_TAX_INFO.tps} | TVQ: ${COMPANY_TAX_INFO.tvq}`
    : 'Fournisseur non inscrit aux fichiers de la TPS/TVQ — Aucune taxe applicable.',
  // Intérêts de retard (taux légal QC: 5% + taux Banque du Canada)
  latePayment: 'Des intérêts de 1,5 % par mois (18 % par année) seront facturés sur tout solde impayé après la date d\'échéance.',
  // Juridiction
  jurisdiction: 'Toute réclamation sera soumise aux tribunaux du district judiciaire de Montréal, province de Québec.',
  // NEQ
  neq: `NEQ: ${COMPANY_TAX_INFO.neq}`,
};

// ========================================================
// Journal des paiements — comptabilité de caisse
// ========================================================

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
  receivedBy: string;
  notes: string;
}

export interface CashEntry {
  id: string;
  date: string;
  type: 'revenu' | 'depense' | 'remboursement' | 'ajustement';
  category: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
  invoiceId?: string;
  paymentId?: string;
}

// ========================================================
// Persistance localStorage
// ========================================================

const LS_INVOICES = 'shc_invoices';
const LS_PAYMENTS = 'shc_payments';
const LS_CASH = 'shc_cash_entries';

function safeLoadJSON<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function safeSaveJSON<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
}

export function loadInvoices(): Invoice[] { return safeLoadJSON<Invoice>(LS_INVOICES, []); }
export function saveInvoices(invoices: Invoice[]): void { safeSaveJSON(LS_INVOICES, invoices); }
export function loadPayments(): Payment[] { return safeLoadJSON<Payment>(LS_PAYMENTS, []); }
export function savePayments(payments: Payment[]): void { safeSaveJSON(LS_PAYMENTS, payments); }
export function loadCashEntries(): CashEntry[] { return safeLoadJSON<CashEntry>(LS_CASH, []); }
export function saveCashEntries(entries: CashEntry[]): void { safeSaveJSON(LS_CASH, entries); }

/**
 * Enregistre un paiement et crée l'écriture comptable correspondante.
 * Retourne la facture mise à jour, le paiement et l'écriture de caisse.
 */
export function recordPayment(
  invoice: Invoice,
  amount: number,
  method: string,
  reference: string,
  receivedBy: string,
  notes: string = '',
): { updatedInvoice: Invoice; payment: Payment; cashEntry: CashEntry } {
  const newPaid = invoice.paidAmount + amount;
  const newBalance = Math.max(0, invoice.grandTotal - newPaid);
  const newStatus: Invoice['status'] = newBalance <= 0 ? 'payee' : 'partielle';
  const now = new Date().toISOString().split('T')[0];

  const updatedInvoice: Invoice = {
    ...invoice,
    status: newStatus,
    paidAmount: newPaid,
    balanceDue: newBalance,
    paymentMethod: method as Invoice['paymentMethod'],
    paymentDate: now,
    paymentReference: reference,
  };

  const payment: Payment = {
    id: `pay_${Date.now()}`,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    clientId: invoice.clientId,
    date: now,
    amount,
    method,
    reference,
    receivedBy,
    notes,
  };

  // Écriture de caisse (comptabilité simple: débit = entrée d'argent)
  const existingEntries = loadCashEntries();
  const lastBalance = existingEntries.length > 0 ? existingEntries[existingEntries.length - 1].balance : 0;

  const cashEntry: CashEntry = {
    id: `ce_${Date.now()}`,
    date: now,
    type: 'revenu',
    category: 'honoraires',
    description: `Paiement ${invoice.invoiceNumber} — ${PAYMENT_METHOD_LABELS[method] || method}${reference ? ` (réf: ${reference})` : ''}`,
    debit: amount,
    credit: 0,
    balance: Math.round((lastBalance + amount) * 100) / 100,
    reference: invoice.invoiceNumber,
    invoiceId: invoice.id,
    paymentId: payment.id,
  };

  return { updatedInvoice, payment, cashEntry };
}

/**
 * Exporte des données en CSV.
 */
export function exportCSV(headers: string[], rows: string[][], filename: string): void {
  const BOM = '\uFEFF';
  const csv = BOM + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ========================================================
// Système de rappels de facture — Best Practice
// Séquence standard: QuickBooks / Sage / FreshBooks / Xero
// ========================================================

export type ReminderType =
  | 'avant_echeance'     // Rappel courtois avant la date d'échéance
  | 'jour_echeance'      // Le jour même de l'échéance
  | 'retard_7'           // 7 jours de retard — rappel poli
  | 'retard_14'          // 14 jours — rappel ferme
  | 'retard_30'          // 30 jours — avis formel
  | 'retard_60'          // 60 jours — dernier avis
  | 'retard_90'          // 90 jours — mise en demeure
  | 'personnalise';      // Rappel manuel personnalisé

export type ReminderStatus = 'planifie' | 'envoye' | 'annule' | 'echoue';
export type ReminderChannel = 'email' | 'sms' | 'manuel';

export interface InvoiceReminder {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  type: ReminderType;
  channel: ReminderChannel;
  status: ReminderStatus;
  scheduledDate: string;       // Date prévue d'envoi
  sentDate?: string;           // Date réelle d'envoi
  subject: string;
  body: string;
  createdBy: string;
  createdAt: string;
  notes?: string;
}

export interface ReminderSequence {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  steps: ReminderSequenceStep[];
}

export interface ReminderSequenceStep {
  type: ReminderType;
  daysRelative: number;        // Négatif = avant échéance, 0 = jour même, positif = après
  channel: ReminderChannel;
  subject: string;
  body: string;
  enabled: boolean;
}

// --- Séquences prédéfinies (best practice industrie) ---

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  avant_echeance: 'Avant échéance',
  jour_echeance: 'Jour d\'échéance',
  retard_7: '7 jours de retard',
  retard_14: '14 jours de retard',
  retard_30: '30 jours de retard',
  retard_60: '60 jours de retard',
  retard_90: '90 jours de retard',
  personnalise: 'Personnalisé',
};

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  planifie: 'Planifié',
  envoye: 'Envoyé',
  annule: 'Annulé',
  echoue: 'Échoué',
};

export const REMINDER_STATUS_COLORS: Record<ReminderStatus, string> = {
  planifie: 'bg-blue-100 text-blue-700',
  envoye: 'bg-green-100 text-green-700',
  annule: 'bg-gray-100 text-gray-400',
  echoue: 'bg-red-100 text-red-700',
};

export const REMINDER_TYPE_COLORS: Record<ReminderType, string> = {
  avant_echeance: 'bg-sky-100 text-sky-700',
  jour_echeance: 'bg-amber-100 text-amber-700',
  retard_7: 'bg-orange-100 text-orange-700',
  retard_14: 'bg-orange-200 text-orange-800',
  retard_30: 'bg-red-100 text-red-700',
  retard_60: 'bg-red-200 text-red-800',
  retard_90: 'bg-red-300 text-red-900',
  personnalise: 'bg-purple-100 text-purple-700',
};

/** Séquence standard — équilibrée entre courtoisie et fermeté */
export const DEFAULT_SEQUENCES: ReminderSequence[] = [
  {
    id: 'seq_standard',
    name: 'Séquence standard',
    description: 'Rappels progressifs — recommandé pour la majorité des clients (QuickBooks/Sage standard)',
    isDefault: true,
    steps: [
      {
        type: 'avant_echeance', daysRelative: -3, channel: 'email', enabled: true,
        subject: 'Rappel — Facture {{numero}} à venir',
        body: `Bonjour {{client}},

Nous vous rappelons que la facture {{numero}} d'un montant de {{montant}} $ sera due le {{echeance}}.

Vous pouvez effectuer votre paiement par virement Interac, chèque ou carte de crédit.

Si le paiement a déjà été effectué, veuillez ignorer ce message.

Cordialement,
${COMPANY_TAX_INFO.nomCommercial}
${COMPANY_TAX_INFO.telephone}`,
      },
      {
        type: 'jour_echeance', daysRelative: 0, channel: 'email', enabled: true,
        subject: 'Facture {{numero}} — Paiement dû aujourd\'hui',
        body: `Bonjour {{client}},

La facture {{numero}} d'un montant de {{montant}} $ arrive à échéance aujourd'hui ({{echeance}}).

Nous vous invitons à procéder au paiement dans les meilleurs délais.

Si le paiement a déjà été effectué, veuillez ignorer ce message.

Cordialement,
${COMPANY_TAX_INFO.nomCommercial}
${COMPANY_TAX_INFO.telephone}`,
      },
      {
        type: 'retard_7', daysRelative: 7, channel: 'email', enabled: true,
        subject: 'Rappel — Facture {{numero}} en retard de 7 jours',
        body: `Bonjour {{client}},

Sauf erreur de notre part, la facture {{numero}} d'un montant de {{montant}} $ demeure impayée depuis le {{echeance}}.

Nous vous serions reconnaissants de bien vouloir procéder au paiement à votre plus proche convenance.

N'hésitez pas à nous contacter si vous avez des questions ou si vous souhaitez convenir d'un arrangement de paiement.

Cordialement,
${COMPANY_TAX_INFO.nomCommercial}
${COMPANY_TAX_INFO.telephone}`,
      },
      {
        type: 'retard_14', daysRelative: 14, channel: 'email', enabled: true,
        subject: 'RAPPEL IMPORTANT — Facture {{numero}} en retard de 14 jours',
        body: `Bonjour {{client}},

Malgré nos précédents rappels, la facture {{numero}} d'un montant de {{montant}} $ reste impayée. La date d'échéance était le {{echeance}}.

Conformément à nos conditions, des intérêts de retard de 1,5 % par mois s'appliquent sur tout solde en souffrance.

Nous vous prions de régulariser cette situation dans les plus brefs délais.

Cordialement,
${COMPANY_TAX_INFO.nomCommercial}
${COMPANY_TAX_INFO.telephone}`,
      },
      {
        type: 'retard_30', daysRelative: 30, channel: 'email', enabled: true,
        subject: 'AVIS FORMEL — Facture {{numero}} impayée depuis 30 jours',
        body: `Bonjour {{client}},

La facture {{numero}} d'un montant de {{montant}} $ est en souffrance depuis 30 jours (échéance: {{echeance}}).

Ceci constitue un avis formel de paiement. Sans régularisation dans les 15 prochains jours, nous nous réservons le droit de:
- Suspendre les services en cours
- Appliquer les intérêts de retard prévus
- Transférer le dossier à notre service de recouvrement

Nous demeurons disponibles pour discuter d'un plan de paiement si nécessaire.

${COMPANY_TAX_INFO.nomCommercial}
${COMPANY_TAX_INFO.adresse}, ${COMPANY_TAX_INFO.ville}, ${COMPANY_TAX_INFO.province} ${COMPANY_TAX_INFO.codePostal}
${COMPANY_TAX_INFO.telephone}`,
      },
      {
        type: 'retard_60', daysRelative: 60, channel: 'email', enabled: false,
        subject: 'DERNIER AVIS — Facture {{numero}} impayée depuis 60 jours',
        body: `Bonjour {{client}},

La facture {{numero}} d'un montant de {{montant}} $ est impayée depuis 60 jours malgré nos multiples rappels.

Ceci constitue notre DERNIER AVIS avant le transfert du dossier à notre service de recouvrement.

Veuillez procéder au paiement intégral dans les 10 prochains jours ouvrables.

${COMPANY_TAX_INFO.nomLegal}
NEQ: ${COMPANY_TAX_INFO.neq}
${COMPANY_TAX_INFO.adresse}, ${COMPANY_TAX_INFO.ville}, ${COMPANY_TAX_INFO.province} ${COMPANY_TAX_INFO.codePostal}
${COMPANY_TAX_INFO.telephone}`,
      },
      {
        type: 'retard_90', daysRelative: 90, channel: 'email', enabled: false,
        subject: 'MISE EN DEMEURE — Facture {{numero}} impayée depuis 90 jours',
        body: `{{client}},

OBJET: MISE EN DEMEURE — Facture {{numero}}

La présente constitue une mise en demeure formelle concernant la facture {{numero}} d'un montant de {{montant}} $, échue depuis le {{echeance}}, soit plus de 90 jours.

Nous vous mettons en demeure de payer la totalité de la somme due, majorée des intérêts de retard, dans un délai de 10 jours suivant la réception de la présente.

À défaut de paiement dans le délai prescrit, nous n'aurons d'autre choix que de confier le dossier à nos avocats pour entreprendre les recours judiciaires appropriés, conformément aux lois du Québec.

Toute réclamation sera soumise aux tribunaux du district judiciaire de Montréal, province de Québec.

${COMPANY_TAX_INFO.nomLegal}
NEQ: ${COMPANY_TAX_INFO.neq}
${COMPANY_TAX_INFO.adresse}, ${COMPANY_TAX_INFO.ville}, ${COMPANY_TAX_INFO.province} ${COMPANY_TAX_INFO.codePostal}
${COMPANY_TAX_INFO.telephone}`,
      },
    ],
  },
  {
    id: 'seq_doux',
    name: 'Séquence douce',
    description: 'Rappels espacés et courtois — idéal pour les clients fidèles ou sensibles',
    isDefault: false,
    steps: [
      {
        type: 'jour_echeance', daysRelative: 0, channel: 'email', enabled: true,
        subject: 'Facture {{numero}} — Échéance aujourd\'hui',
        body: `Bonjour {{client}},

Un petit rappel que la facture {{numero}} ({{montant}} $) arrive à échéance aujourd'hui.

Si le paiement a déjà été effectué, merci de ne pas tenir compte de ce message.

Bonne journée!
${COMPANY_TAX_INFO.nomCommercial}`,
      },
      {
        type: 'retard_14', daysRelative: 14, channel: 'email', enabled: true,
        subject: 'Rappel amical — Facture {{numero}}',
        body: `Bonjour {{client}},

Nous souhaitons simplement vous rappeler que la facture {{numero}} ({{montant}} $) est en attente depuis le {{echeance}}.

N'hésitez pas à nous contacter si vous avez besoin de plus de temps ou si vous avez des questions.

Cordialement,
${COMPANY_TAX_INFO.nomCommercial}`,
      },
      {
        type: 'retard_30', daysRelative: 30, channel: 'email', enabled: true,
        subject: 'Suivi — Facture {{numero}} en souffrance',
        body: `Bonjour {{client}},

La facture {{numero}} ({{montant}} $, échue le {{echeance}}) n'a pas encore été réglée.

Nous comprenons que des imprévus peuvent survenir. Si vous souhaitez discuter d'un arrangement de paiement, nous sommes à votre disposition.

Cordialement,
${COMPANY_TAX_INFO.nomCommercial}
${COMPANY_TAX_INFO.telephone}`,
      },
    ],
  },
  {
    id: 'seq_ferme',
    name: 'Séquence ferme',
    description: 'Rappels rapprochés et directs — pour les clients à risque ou montants élevés',
    isDefault: false,
    steps: [
      {
        type: 'avant_echeance', daysRelative: -5, channel: 'email', enabled: true,
        subject: 'Rappel — Facture {{numero}} échéance dans 5 jours',
        body: `Bonjour {{client}},

La facture {{numero}} ({{montant}} $) sera due le {{echeance}}, soit dans 5 jours.

Merci de vous assurer que le paiement sera effectué à temps.

${COMPANY_TAX_INFO.nomCommercial}`,
      },
      {
        type: 'jour_echeance', daysRelative: 0, channel: 'email', enabled: true,
        subject: 'Facture {{numero}} — Paiement requis aujourd\'hui',
        body: `Bonjour {{client}},

La facture {{numero}} ({{montant}} $) est due aujourd'hui. Merci de procéder au paiement.

${COMPANY_TAX_INFO.nomCommercial}`,
      },
      {
        type: 'retard_7', daysRelative: 3, channel: 'email', enabled: true,
        subject: 'URGENT — Facture {{numero}} en retard',
        body: `Bonjour {{client}},

La facture {{numero}} ({{montant}} $) est en retard depuis le {{echeance}}.

Veuillez régulariser la situation immédiatement. Des intérêts de retard s'appliquent.

${COMPANY_TAX_INFO.nomCommercial}`,
      },
      {
        type: 'retard_14', daysRelative: 10, channel: 'email', enabled: true,
        subject: 'AVIS — Facture {{numero}} impayée',
        body: `Bonjour {{client}},

La facture {{numero}} ({{montant}} $) demeure impayée. Sans paiement dans les 5 prochains jours, les services en cours seront suspendus.

${COMPANY_TAX_INFO.nomCommercial}`,
      },
      {
        type: 'retard_30', daysRelative: 21, channel: 'email', enabled: true,
        subject: 'DERNIER AVIS — Facture {{numero}}',
        body: `{{client}},

Malgré nos rappels répétés, la facture {{numero}} ({{montant}} $) reste impayée.

Sans paiement dans les 7 prochains jours, le dossier sera transféré au recouvrement.

${COMPANY_TAX_INFO.nomLegal}
${COMPANY_TAX_INFO.telephone}`,
      },
    ],
  },
];

/**
 * Remplace les variables de template dans le sujet/corps du rappel.
 */
export function interpolateReminderTemplate(
  template: string,
  invoice: Invoice,
  clientName: string,
): string {
  return template
    .replace(/\{\{client\}\}/g, clientName)
    .replace(/\{\{numero\}\}/g, invoice.invoiceNumber)
    .replace(/\{\{montant\}\}/g, invoice.grandTotal.toLocaleString('fr-CA', { minimumFractionDigits: 2 }))
    .replace(/\{\{solde\}\}/g, invoice.balanceDue.toLocaleString('fr-CA', { minimumFractionDigits: 2 }))
    .replace(/\{\{echeance\}\}/g, invoice.dueDate)
    .replace(/\{\{date\}\}/g, invoice.date);
}

/**
 * Génère les rappels planifiés pour une facture selon une séquence.
 */
export function generateRemindersForInvoice(
  invoice: Invoice,
  clientName: string,
  clientEmail: string,
  sequence: ReminderSequence,
  createdBy: string,
): InvoiceReminder[] {
  const dueDate = new Date(invoice.dueDate);
  const now = new Date().toISOString().split('T')[0];

  return sequence.steps
    .filter(step => step.enabled)
    .map(step => {
      const schedDate = new Date(dueDate);
      schedDate.setDate(schedDate.getDate() + step.daysRelative);
      const scheduledDate = schedDate.toISOString().split('T')[0];

      return {
        id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName,
        clientEmail,
        type: step.type,
        channel: step.channel,
        status: 'planifie' as ReminderStatus,
        scheduledDate,
        subject: interpolateReminderTemplate(step.subject, invoice, clientName),
        body: interpolateReminderTemplate(step.body, invoice, clientName),
        createdBy,
        createdAt: now,
      };
    });
}

/**
 * Calcule le nombre de jours de retard d'une facture.
 */
export function getDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - due.getTime()) / 86400000);
  return Math.max(0, diff);
}

/**
 * Détermine le niveau d'urgence d'une facture en retard.
 */
export function getOverdueLevel(daysOverdue: number): { label: string; color: string; severity: number } {
  if (daysOverdue <= 0) return { label: 'À jour', color: 'text-green-600', severity: 0 };
  if (daysOverdue <= 7) return { label: '1-7 jours', color: 'text-amber-500', severity: 1 };
  if (daysOverdue <= 14) return { label: '8-14 jours', color: 'text-orange-500', severity: 2 };
  if (daysOverdue <= 30) return { label: '15-30 jours', color: 'text-orange-600', severity: 3 };
  if (daysOverdue <= 60) return { label: '31-60 jours', color: 'text-red-500', severity: 4 };
  if (daysOverdue <= 90) return { label: '61-90 jours', color: 'text-red-600', severity: 5 };
  return { label: '90+ jours', color: 'text-red-800', severity: 6 };
}

// --- Persistance rappels ---
const LS_REMINDERS = 'shc_reminders';
const LS_REMINDER_SETTINGS = 'shc_reminder_settings';

export function loadReminders(): InvoiceReminder[] { return safeLoadJSON<InvoiceReminder>(LS_REMINDERS, []); }
export function saveReminders(reminders: InvoiceReminder[]): void { safeSaveJSON(LS_REMINDERS, reminders); }

export interface ReminderSettings {
  activeSequenceId: string;
  autoSchedule: boolean;           // Auto-planifier à l'envoi de facture
  defaultChannel: ReminderChannel;
  customSequences: ReminderSequence[];
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  activeSequenceId: 'seq_standard',
  autoSchedule: true,
  defaultChannel: 'email',
  customSequences: [],
};

export function loadReminderSettings(): ReminderSettings {
  if (typeof window === 'undefined') return DEFAULT_REMINDER_SETTINGS;
  try {
    const raw = localStorage.getItem(LS_REMINDER_SETTINGS);
    return raw ? { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(raw) } : DEFAULT_REMINDER_SETTINGS;
  } catch { return DEFAULT_REMINDER_SETTINGS; }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_REMINDER_SETTINGS, JSON.stringify(settings)); } catch { /* quota */ }
}

/**
 * Récupère toutes les séquences (prédéfinies + personnalisées).
 */
export function getAllSequences(settings: ReminderSettings): ReminderSequence[] {
  return [...DEFAULT_SEQUENCES, ...settings.customSequences];
}

// --- Factures démo vidées (vrais clients Supabase seulement) ---
export const DEMO_INVOICES: Invoice[] = [];
