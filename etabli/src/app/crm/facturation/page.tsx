"use client";
import { useState, useEffect, useCallback } from "react";
import { useCrm, getUserName } from "@/lib/crm-store";
import { ROLE_PERMISSIONS } from "@/lib/crm-types";
import {
  SERVICE_TEMPLATES, COMPANY_TAX_INFO, LEGAL_MENTIONS,
  TPS_RATE, TVQ_RATE, IS_TAX_REGISTERED,
  INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS, PAYMENT_METHOD_LABELS, TERMS_LABELS,
  REMINDER_TYPE_LABELS, REMINDER_STATUS_LABELS, REMINDER_STATUS_COLORS, REMINDER_TYPE_COLORS,
  DEFAULT_SEQUENCES, DEFAULT_REMINDER_SETTINGS,
  calculateItemTaxes, calculateInvoiceTotals, generateInvoiceNumber, getDueDate,
  getDaysOverdue, getOverdueLevel, interpolateReminderTemplate,
  generateRemindersForInvoice, getAllSequences,
  loadInvoices, saveInvoices, loadPayments, savePayments, loadCashEntries, saveCashEntries,
  loadReminders, saveReminders, loadReminderSettings, saveReminderSettings,
  recordPayment, exportCSV, getInvoiceClientName,
} from "@/lib/crm-facturation";
import type { Invoice, InvoiceItem, Payment, CashEntry, TaxCategory, InvoiceReminder, ReminderSettings, ReminderSequence, ReminderStatus } from "@/lib/crm-facturation";
import {
  DollarSign, Plus, Search, X, Printer, CreditCard, FileText, Send, CheckCircle2,
  Download, BookOpen, BarChart3, TrendingUp, Calendar, UserPlus, User, Package,
  ChevronDown, AlertCircle, Trash2, Copy, Eye, Edit3, Hash, Bell, BellRing, Clock,
  Mail, MessageSquare, Settings2, Play, Pause, RotateCcw, Zap, Shield,
} from "lucide-react";

const NAVY = "#1B2559";
const GOLD = "#D4A03C";

const TABS = [
  { id: 'factures', label: 'Factures', icon: FileText },
  { id: 'rappels', label: 'Rappels', icon: BellRing },
  { id: 'paiements', label: 'Journal des paiements', icon: BookOpen },
  { id: 'grandlivre', label: 'Grand livre', icon: BarChart3 },
  { id: 'dashboard', label: 'Tableau financier', icon: TrendingUp },
] as const;

type TabId = typeof TABS[number]['id'];

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]/30 outline-none";

// ============================================================
// New Invoice State
// ============================================================
interface NewInvoiceState {
  clientMode: 'crm' | 'manual';
  clientId: string;
  manualClientName: string;
  manualClientEmail: string;
  manualClientPhone: string;
  manualClientAddress: string;
  manualClientCity: string;
  manualClientProvince: string;
  manualClientPostalCode: string;
  caseId: string;
  terms: Invoice['terms'];
  notes: string;
  items: InvoiceItem[];
  invoiceDate: string;
}

const defaultNewInvoice = (): NewInvoiceState => ({
  clientMode: 'crm',
  clientId: '', manualClientName: '', manualClientEmail: '', manualClientPhone: '',
  manualClientAddress: '', manualClientCity: '', manualClientProvince: 'QC', manualClientPostalCode: '',
  caseId: '', terms: 'net30', notes: '', items: [],
  invoiceDate: new Date().toISOString().split('T')[0],
});

// ============================================================
// Main Page
// ============================================================

export default function FacturationPage() {
  const { currentUser, clients, cases } = useCrm();
  const [activeTab, setActiveTab] = useState<TabId>('factures');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [showPayment, setShowPayment] = useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [methodFilter, setMethodFilter] = useState('');
  const [loaded, setLoaded] = useState(false);
  // Rappels
  const [reminders, setReminders] = useState<InvoiceReminder[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [showReminderModal, setShowReminderModal] = useState<Invoice | null>(null);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [viewReminder, setViewReminder] = useState<InvoiceReminder | null>(null);
  const [reminderFilter, setReminderFilter] = useState<'tous' | 'planifie' | 'envoye' | 'aujourdhui' | 'retard'>('tous');

  const [newInv, setNewInv] = useState<NewInvoiceState>(defaultNewInvoice);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invoiceErrorMsg, setInvoiceErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setInvoices(loadInvoices());
    setPayments(loadPayments());
    setCashEntries(loadCashEntries());
    setReminders(loadReminders());
    setReminderSettings(loadReminderSettings());
    setLoaded(true);
  }, []);

  useEffect(() => { if (loaded) saveInvoices(invoices); }, [invoices, loaded]);
  useEffect(() => { if (loaded) savePayments(payments); }, [payments, loaded]);
  useEffect(() => { if (loaded) saveCashEntries(cashEntries); }, [cashEntries, loaded]);
  useEffect(() => { if (loaded) saveReminders(reminders); }, [reminders, loaded]);
  useEffect(() => { if (loaded) saveReminderSettings(reminderSettings); }, [reminderSettings, loaded]);

  if (!currentUser) return null;
  const perms = ROLE_PERMISSIONS[currentUser.role];
  if (!perms.canViewFinancials) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Accès refusé</h2>
          <p className="text-gray-500 mt-2">Vous n&apos;avez pas les permissions pour accéder à la facturation.</p>
        </div>
      </div>
    );
  }

  // Reminder operations (component level)
  const markReminderSent = (rem: InvoiceReminder) => {
    const t = new Date().toISOString().split('T')[0];
    setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, status: 'envoye' as ReminderStatus, sentDate: t } : r));
    setViewReminder(null);
  };
  const cancelReminder = (rem: InvoiceReminder) => {
    setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, status: 'annule' as ReminderStatus } : r));
    setViewReminder(null);
  };
  const deleteAllRemindersForInvoice = (invoiceId: string) => {
    setReminders(prev => prev.filter(r => !(r.invoiceId === invoiceId && r.status === 'planifie')));
  };

  // Helpers
  const crmClientName = (cid: string) => { const c = clients.find(cl => cl.id === cid); return c ? `${c.firstName} ${c.lastName}` : 'Inconnu'; };
  const invoiceClientName = (inv: Invoice) => getInvoiceClientName(inv, crmClientName);

  const scheduleForInvoice = (inv: Invoice, seq: ReminderSequence) => {
    setReminders(prev => {
      const kept = prev.filter(r => !(r.invoiceId === inv.id && r.status === 'planifie'));
      const clientName = invoiceClientName(inv);
      const clientEmail = inv.manualClientEmail || (() => { const c = clients.find(cl => cl.id === inv.clientId); return c?.email || ''; })();
      const newRems = generateRemindersForInvoice(inv, clientName, clientEmail, seq, currentUser!.id);
      return [...kept, ...newRems];
    });
    setShowReminderModal(null);
  };
  const fmt = (n: number) => n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const today = new Date().toISOString().split('T')[0];

  // KPIs
  const totalRevenu = payments.reduce((s, p) => s + p.amount, 0);
  const totalEnAttente = invoices.filter(i => ['envoyee', 'partielle', 'en_retard'].includes(i.status)).reduce((s, i) => s + i.balanceDue, 0);
  const totalFactures = invoices.length;
  const tauxRecouvrement = totalFactures > 0 ? Math.round((invoices.filter(i => i.status === 'payee').length / totalFactures) * 100) : 0;

  // Dashboard data
  const monthlyRevenue = (() => {
    const months: Record<string, number> = {};
    payments.forEach(p => { const m = p.date.substring(0, 7); months[m] = (months[m] || 0) + p.amount; });
    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
  })();
  const todayRevenue = payments.filter(p => p.date === today).reduce((s, p) => s + p.amount, 0);
  const weekStart = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split('T')[0]; })();
  const weekRevenue = payments.filter(p => p.date >= weekStart).reduce((s, p) => s + p.amount, 0);
  const monthStart = today.substring(0, 7) + '-01';
  const monthRevenue = payments.filter(p => p.date >= monthStart).reduce((s, p) => s + p.amount, 0);
  const yearStart = today.substring(0, 4) + '-01-01';
  const ytdRevenue = payments.filter(p => p.date >= yearStart).reduce((s, p) => s + p.amount, 0);
  const topClients = (() => {
    const map: Record<string, number> = {};
    payments.forEach(p => {
      const inv = invoices.find(i => i.id === p.invoiceId);
      const name = inv ? invoiceClientName(inv) : crmClientName(p.clientId);
      map[name] = (map[name] || 0) + p.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, amount]) => ({ name, amount }));
  })();
  const methodBreakdown = (() => {
    const map: Record<string, number> = {};
    payments.forEach(p => { map[p.method] = (map[p.method] || 0) + p.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  })();
  const overdueInvoices = invoices.filter(i => i.status !== 'payee' && i.status !== 'annulee' && i.status !== 'brouillon' && i.dueDate < today);
  const maxMonthly = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map(([, v]) => v)) : 1;

  // Invoice operations
  const filtered = invoices.filter(inv => {
    const name = invoiceClientName(inv);
    const matchSearch = `${inv.invoiceNumber} ${name}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // --- Line item operations ---
  const addServiceItem = (templateId: string) => {
    const template = SERVICE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    const item = calculateItemTaxes({
      id: `ii${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      description: template.description,
      quantity: 1, unitPrice: template.defaultPrice, taxCategory: template.taxCategory,
    });
    setNewInv(prev => ({ ...prev, items: [...prev.items, item] }));
  };

  const addCustomItem = () => {
    const item = calculateItemTaxes({
      id: `ii${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      description: '',
      quantity: 1, unitPrice: 0, taxCategory: 'taxable' as TaxCategory,
    });
    setNewInv(prev => ({ ...prev, items: [...prev.items, item] }));
  };

  const updateItem = (idx: number, field: string, value: number | string) => {
    setNewInv(prev => {
      const items = [...prev.items];
      const item = { ...items[idx], [field]: value };
      items[idx] = calculateItemTaxes(item);
      return { ...prev, items };
    });
  };

  const removeItem = (idx: number) => {
    setNewInv(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const duplicateItem = (idx: number) => {
    setNewInv(prev => {
      const dup = { ...prev.items[idx], id: `ii${Date.now()}${Math.random().toString(36).slice(2, 6)}` };
      return { ...prev, items: [...prev.items, dup] };
    });
  };

  const totals = calculateInvoiceTotals(newInv.items);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateInvoice = (): string | null => {
    // Client validation
    if (newInv.clientMode === 'crm' && !newInv.clientId) {
      return 'Veuillez sélectionner un client CRM.';
    }
    if (newInv.clientMode === 'manual' && !newInv.manualClientName.trim()) {
      return 'Le nom du client est obligatoire.';
    }
    // Email format validation for manual client
    if (newInv.clientMode === 'manual' && newInv.manualClientEmail.trim() && !EMAIL_REGEX.test(newInv.manualClientEmail.trim())) {
      return 'Le format du courriel est invalide.';
    }
    // Line items validation
    if (newInv.items.length === 0) {
      return 'Ajoutez au moins une ligne de facturation.';
    }
    // Line item amounts > 0
    const invalidItem = newInv.items.find(item => item.unitPrice <= 0);
    if (invalidItem) {
      return `Le prix unitaire de "${invalidItem.description || 'ligne sans description'}" doit être supérieur à 0.`;
    }
    // Due date validation (must be today or in the future)
    const date = newInv.invoiceDate || new Date().toISOString().split('T')[0];
    const dueDate = getDueDate(date, newInv.terms);
    const todayStr = new Date().toISOString().split('T')[0];
    if (dueDate < todayStr) {
      return "La date d'échéance ne peut pas être dans le passé.";
    }
    return null;
  };

  const canCreateInvoice = () => {
    const hasClient = newInv.clientMode === 'crm' ? !!newInv.clientId : !!newInv.manualClientName.trim();
    return hasClient && newInv.items.length > 0;
  };

  const createInvoice = () => {
    const validationError = validateInvoice();
    if (validationError) {
      setInvoiceErrorMsg(validationError);
      return;
    }
    setInvoiceErrorMsg(null);
    const date = newInv.invoiceDate || new Date().toISOString().split('T')[0];
    const inv: Invoice = {
      id: `inv${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(invoices),
      clientId: newInv.clientMode === 'crm' ? newInv.clientId : '',
      caseId: newInv.caseId || undefined,
      // Manual client
      ...(newInv.clientMode === 'manual' ? {
        manualClientName: newInv.manualClientName,
        manualClientEmail: newInv.manualClientEmail,
        manualClientPhone: newInv.manualClientPhone,
        manualClientAddress: newInv.manualClientAddress,
        manualClientCity: newInv.manualClientCity,
        manualClientProvince: newInv.manualClientProvince,
        manualClientPostalCode: newInv.manualClientPostalCode,
      } : {}),
      date, dueDate: getDueDate(date, newInv.terms), status: 'brouillon',
      items: newInv.items, ...totals,
      paidAmount: 0, balanceDue: totals.grandTotal,
      notes: newInv.notes, createdBy: currentUser.id, terms: newInv.terms,
    };
    setInvoices(prev => [...prev, inv]);
    setShowModal(false);
    setNewInv(defaultNewInvoice());
  };

  const sendInvoice = (inv: Invoice) => {
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'envoyee' as const } : i));
    // Auto-planifier les rappels si activé
    if (reminderSettings.autoSchedule) {
      const sequences = getAllSequences(reminderSettings);
      const activeSeq = sequences.find(s => s.id === reminderSettings.activeSequenceId) || sequences[0];
      const clientName = invoiceClientName(inv);
      const clientEmail = inv.manualClientEmail || (() => { const c = clients.find(cl => cl.id === inv.clientId); return c?.email || ''; })();
      const newReminders = generateRemindersForInvoice(inv, clientName, clientEmail, activeSeq, currentUser.id);
      setReminders(prev => [...prev, ...newReminders]);
    }
    setViewInvoice(null);
  };

  const cancelInvoice = (inv: Invoice) => {
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'annulee' as const } : i));
    setViewInvoice(null);
  };

  const duplicateInvoice = (inv: Invoice) => {
    const dup: Invoice = {
      ...inv,
      id: `inv${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(invoices),
      date: today,
      dueDate: getDueDate(today, inv.terms),
      status: 'brouillon',
      paidAmount: 0,
      balanceDue: inv.grandTotal,
      paymentMethod: undefined,
      paymentDate: undefined,
      paymentReference: undefined,
    };
    setInvoices(prev => [...prev, dup]);
    setViewInvoice(null);
  };

  const markPaid = (inv: Invoice, method: string, amount: number, reference: string) => {
    // Payment amount validation
    if (!amount || amount <= 0) {
      setErrorMsg('Le montant doit être supérieur à 0.');
      return;
    }
    if (amount > inv.balanceDue) {
      setErrorMsg(`Le montant (${fmt(amount)} $) dépasse le solde restant (${fmt(inv.balanceDue)} $).`);
      return;
    }
    setErrorMsg(null);
    const { updatedInvoice, payment, cashEntry } = recordPayment(inv, amount, method, reference, currentUser.id);
    setInvoices(prev => prev.map(i => i.id === inv.id ? updatedInvoice : i));
    setPayments(prev => [...prev, payment]);
    setCashEntries(prev => [...prev, cashEntry]);
    setShowPayment(null);
    setViewInvoice(null);
  };

  // Filtered
  const filteredPayments = payments.filter(p => {
    if (dateFilter.from && p.date < dateFilter.from) return false;
    if (dateFilter.to && p.date > dateFilter.to) return false;
    if (methodFilter && p.method !== methodFilter) return false;
    return true;
  });
  const filteredEntries = cashEntries.filter(e => {
    if (dateFilter.from && e.date < dateFilter.from) return false;
    if (dateFilter.to && e.date > dateFilter.to) return false;
    return true;
  });

  // PIE chart
  const PIE_COLORS = ['#1B2559', '#D4A03C', '#059669', '#7C3AED', '#DC2626', '#0EA5E9'];
  const renderPie = (data: [string, number][], size: number = 180) => {
    const total = data.reduce((s, [, v]) => s + v, 0);
    if (total === 0) return <p className="text-gray-400 text-sm text-center py-8">Aucune donnée</p>;
    let cumAngle = 0;
    const slices = data.map(([, value], i) => {
      const pct = value / total;
      const startAngle = cumAngle;
      cumAngle += pct * 360;
      const endAngle = cumAngle;
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      const r = size / 2 - 4;
      const cx = size / 2, cy = size / 2;
      const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad);
      const largeArc = pct > 0.5 ? 1 : 0;
      const path = pct >= 0.999
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      return <path key={i} d={path} fill={PIE_COLORS[i % PIE_COLORS.length]} />;
    });
    return (
      <div className="flex items-center gap-6">
        <svg width={size} height={size} className="shrink-0">{slices}</svg>
        <div className="space-y-1.5">
          {data.map(([label, value], i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="text-xs text-gray-600">{PAYMENT_METHOD_LABELS[label] || label}</span>
              <span className="text-xs font-bold text-gray-800 ml-auto">{fmt(value)} $ ({Math.round((value / total) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: NAVY }}>
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
            <p className="text-sm text-gray-500">{COMPANY_TAX_INFO.nomCommercial}</p>
          </div>
        </div>
        <button onClick={() => { setNewInv(defaultNewInvoice()); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity" style={{ background: GOLD }}>
          <Plus size={16} /> Nouvelle facture
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenus encaissés', value: `${fmt(totalRevenu)} $`, color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp },
          { label: 'En attente', value: `${fmt(totalEnAttente)} $`, color: 'text-amber-600', bg: 'bg-amber-50', icon: Calendar },
          { label: 'Factures totales', value: String(totalFactures), color: 'text-blue-600', bg: 'bg-blue-50', icon: FileText },
          { label: 'Taux recouvrement', value: `${tauxRecouvrement} %`, color: tauxRecouvrement >= 80 ? 'text-green-600' : 'text-red-600', bg: tauxRecouvrement >= 80 ? 'bg-green-50' : 'bg-red-50', icon: CheckCircle2 },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{s.label}</span>
              <s.icon size={14} className={s.color} />
            </div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB 1: FACTURES ═══ */}
      {activeTab === 'factures' && (
        <>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par numéro ou client..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Tous les statuts</option>
              {Object.entries(INVOICE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button onClick={() => exportCSV(
              ['N° Facture', 'Client', 'Date', 'Échéance', 'Total', 'Payé', 'Solde', 'Statut'],
              invoices.map(i => [i.invoiceNumber, invoiceClientName(i), i.date, i.dueDate, fmt(i.grandTotal), fmt(i.paidAmount), fmt(i.balanceDue), INVOICE_STATUS_LABELS[i.status]]),
              `factures_${today}.csv`
            )} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Download size={14} /> CSV
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">N° Facture</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Échéance</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Solde</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setViewInvoice(inv)}>
                    <td className="px-4 py-3 font-mono font-medium" style={{ color: NAVY }}>{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{invoiceClientName(inv)}</p>
                        {inv.manualClientName && <p className="text-[10px] text-gray-400">Client manuel</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{inv.date}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.dueDate}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(inv.grandTotal)} $</td>
                    <td className="px-4 py-3 text-right font-medium">{inv.balanceDue > 0 ? <span className="text-red-600">{fmt(inv.balanceDue)} $</span> : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUS_COLORS[inv.status]}`}>
                        {INVOICE_STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewInvoice(inv)} className="p-1.5 rounded hover:bg-gray-100" title="Voir"><Eye size={14} className="text-gray-400" /></button>
                        <button onClick={() => duplicateInvoice(inv)} className="p-1.5 rounded hover:bg-gray-100" title="Dupliquer"><Copy size={14} className="text-gray-400" /></button>
                        {inv.status !== 'payee' && inv.status !== 'annulee' && (
                          <button onClick={() => { setErrorMsg(null); setShowPayment(inv); }} className="p-1.5 rounded hover:bg-green-50" title="Encaisser"><CreditCard size={14} className="text-green-500" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                {invoices.length === 0 ? (
                  <>
                    <FileText size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">Aucune facture pour le moment</p>
                    <p className="text-gray-300 text-xs mt-1">Cliquez sur &laquo; Nouvelle facture &raquo; pour commencer</p>
                  </>
                ) : (
                  <>
                    <Search size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">Aucune facture ne correspond aux filtres</p>
                    <p className="text-gray-300 text-xs mt-1">Modifiez votre recherche ou le filtre de statut</p>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ TAB 2: RAPPELS ═══ */}
      {activeTab === 'rappels' && (() => {
        const today2 = new Date().toISOString().split('T')[0];
        const unpaidInvoices = invoices.filter(i => ['envoyee', 'partielle', 'en_retard'].includes(i.status));
        const overdueCount = unpaidInvoices.filter(i => i.dueDate < today2).length;
        const todayReminders = reminders.filter(r => r.scheduledDate === today2 && r.status === 'planifie');
        const plannedReminders = reminders.filter(r => r.status === 'planifie');
        const sentReminders = reminders.filter(r => r.status === 'envoye');

        const filteredReminders = reminders.filter(r => {
          if (reminderFilter === 'tous') return true;
          if (reminderFilter === 'planifie') return r.status === 'planifie';
          if (reminderFilter === 'envoye') return r.status === 'envoye';
          if (reminderFilter === 'aujourdhui') return r.scheduledDate === today2 && r.status === 'planifie';
          if (reminderFilter === 'retard') {
            const inv = invoices.find(i => i.id === r.invoiceId);
            return inv && inv.dueDate < today2 && r.status === 'planifie';
          }
          return true;
        }).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

        const sequences = getAllSequences(reminderSettings);
        const activeSeq = sequences.find(s => s.id === reminderSettings.activeSequenceId) || sequences[0];

        return (
          <>
            {/* KPIs rappels */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Factures impayées', value: String(unpaidInvoices.length), color: 'text-amber-600', bg: 'bg-amber-50', icon: FileText },
                { label: 'En retard', value: String(overdueCount), color: overdueCount > 0 ? 'text-red-600' : 'text-green-600', bg: overdueCount > 0 ? 'bg-red-50' : 'bg-green-50', icon: AlertCircle },
                { label: 'Rappels aujourd\'hui', value: String(todayReminders.length), color: 'text-blue-600', bg: 'bg-blue-50', icon: Bell },
                { label: 'Planifiés', value: String(plannedReminders.length), color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Clock },
                { label: 'Envoyés', value: String(sentReminders.length), color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</span>
                    <s.icon size={13} className={s.color} />
                  </div>
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Alerte rappels aujourd'hui */}
            {todayReminders.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <BellRing size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">{todayReminders.length} rappel(s) à envoyer aujourd'hui</p>
                  <div className="mt-2 space-y-1">
                    {todayReminders.slice(0, 5).map(r => (
                      <div key={r.id} className="flex items-center gap-2 text-xs">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${REMINDER_TYPE_COLORS[r.type]}`}>{REMINDER_TYPE_LABELS[r.type]}</span>
                        <span className="font-mono text-amber-700">{r.invoiceNumber}</span>
                        <span className="text-amber-600">{r.clientName}</span>
                        <button onClick={() => setViewReminder(r)} className="ml-auto text-amber-700 underline hover:no-underline">Voir</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                {([
                  { id: 'tous', label: 'Tous' },
                  { id: 'aujourdhui', label: "Aujourd'hui" },
                  { id: 'planifie', label: 'Planifiés' },
                  { id: 'envoye', label: 'Envoyés' },
                  { id: 'retard', label: 'En retard' },
                ] as const).map(f => (
                  <button key={f.id} onClick={() => setReminderFilter(f.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${reminderFilter === f.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <button onClick={() => setShowReminderSettings(true)}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Settings2 size={14} /> Paramètres
              </button>
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90" style={{ background: GOLD }}>
                  <Plus size={14} /> Planifier des rappels
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl w-80 z-20 hidden group-hover:block">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Factures impayées</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {unpaidInvoices.length === 0 ? (
                      <p className="text-sm text-gray-400 p-4 text-center">Aucune facture impayée</p>
                    ) : unpaidInvoices.map(inv => {
                      const hasReminders = reminders.some(r => r.invoiceId === inv.id && r.status === 'planifie');
                      const daysOv = getDaysOverdue(inv.dueDate);
                      const level = getOverdueLevel(daysOv);
                      return (
                        <button key={inv.id} onClick={() => setShowReminderModal(inv)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-medium" style={{ color: NAVY }}>{inv.invoiceNumber}</span>
                              {hasReminders && <span className="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-700">Actif</span>}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{invoiceClientName(inv)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold">{fmt(inv.balanceDue)} $</p>
                            {daysOv > 0 && <p className={`text-[10px] font-medium ${level.color}`}>{daysOv}j retard</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des rappels */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date prévue</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Facture</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Canal</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReminders.map(rem => {
                    const isOverdue = rem.scheduledDate < today2 && rem.status === 'planifie';
                    const isToday2 = rem.scheduledDate === today2;
                    return (
                      <tr key={rem.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50/40' : isToday2 && rem.status === 'planifie' ? 'bg-amber-50/40' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : isToday2 ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                              {rem.scheduledDate}
                            </span>
                            {isOverdue && <span className="text-[9px] px-1 py-0.5 rounded bg-red-100 text-red-600 font-medium">En retard</span>}
                            {isToday2 && rem.status === 'planifie' && <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-600 font-medium">Aujourd'hui</span>}
                          </div>
                          {rem.sentDate && <p className="text-[10px] text-gray-400 mt-0.5">Envoyé: {rem.sentDate}</p>}
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-xs" style={{ color: NAVY }}>{rem.invoiceNumber}</td>
                        <td className="px-4 py-3 text-gray-700">{rem.clientName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${REMINDER_TYPE_COLORS[rem.type]}`}>
                            {REMINDER_TYPE_LABELS[rem.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            {rem.channel === 'email' ? <Mail size={12} /> : rem.channel === 'sms' ? <MessageSquare size={12} /> : <User size={12} />}
                            {rem.channel === 'email' ? 'Email' : rem.channel === 'sms' ? 'SMS' : 'Manuel'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${REMINDER_STATUS_COLORS[rem.status]}`}>
                            {REMINDER_STATUS_LABELS[rem.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setViewReminder(rem)} className="p-1.5 rounded hover:bg-gray-100" title="Voir"><Eye size={13} className="text-gray-400" /></button>
                            {rem.status === 'planifie' && (
                              <>
                                <button onClick={() => markReminderSent(rem)} className="p-1.5 rounded hover:bg-green-50" title="Marquer envoyé">
                                  <CheckCircle2 size={13} className="text-green-500" />
                                </button>
                                <button onClick={() => cancelReminder(rem)} className="p-1.5 rounded hover:bg-red-50" title="Annuler">
                                  <X size={13} className="text-red-400" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredReminders.length === 0 && (
                <div className="text-center py-12">
                  <Bell size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Aucun rappel {reminderFilter !== 'tous' ? 'dans ce filtre' : ''}</p>
                  <p className="text-gray-300 text-xs mt-1">Les rappels sont planifiés automatiquement lors de l'envoi des factures</p>
                </div>
              )}
              {filteredReminders.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
                  {filteredReminders.length} rappel(s) &middot; Séquence active: <span className="font-medium">{activeSeq.name}</span>
                  {reminderSettings.autoSchedule && <span className="ml-2 text-green-600"><Zap size={10} className="inline" /> Auto-planification activée</span>}
                </div>
              )}
            </div>

            {/* Factures impayées — vue aging */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: NAVY }}>
                <Shield size={15} /> Vieillissement des comptes clients (Aging Report)
              </h3>
              {unpaidInvoices.length === 0 ? (
                <p className="text-sm text-green-600 text-center py-4">Aucune facture impayée</p>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const buckets = [
                      { label: 'Courant (pas dû)', min: -Infinity, max: 0, color: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
                      { label: '1-7 jours', min: 1, max: 7, color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700' },
                      { label: '8-14 jours', min: 8, max: 14, color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700' },
                      { label: '15-30 jours', min: 15, max: 30, color: 'bg-orange-100 border-orange-300', textColor: 'text-orange-800' },
                      { label: '31-60 jours', min: 31, max: 60, color: 'bg-red-50 border-red-200', textColor: 'text-red-600' },
                      { label: '61-90 jours', min: 61, max: 90, color: 'bg-red-100 border-red-300', textColor: 'text-red-700' },
                      { label: '90+ jours', min: 91, max: Infinity, color: 'bg-red-200 border-red-400', textColor: 'text-red-900' },
                    ];
                    const totalUnpaid = unpaidInvoices.reduce((s, i) => s + i.balanceDue, 0);
                    return (
                      <>
                        <div className="grid grid-cols-7 gap-2 mb-4">
                          {buckets.map((b, i) => {
                            const invs = unpaidInvoices.filter(inv => {
                              const d = getDaysOverdue(inv.dueDate);
                              return d >= b.min && d <= b.max;
                            });
                            const total = invs.reduce((s, inv) => s + inv.balanceDue, 0);
                            return (
                              <div key={i} className={`rounded-lg border p-2 text-center ${b.color}`}>
                                <p className="text-[10px] font-medium text-gray-500">{b.label}</p>
                                <p className={`text-sm font-bold ${b.textColor}`}>{fmt(total)} $</p>
                                <p className="text-[10px] text-gray-400">{invs.length} fact.</p>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <span className="text-sm font-semibold text-gray-700">Total comptes clients:</span>
                          <span className="text-lg font-bold" style={{ color: NAVY }}>{fmt(totalUnpaid)} $</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* ═══ MODAL: PLANIFIER RAPPELS POUR FACTURE ═══ */}
      {showReminderModal && (() => {
        const inv = showReminderModal;
        const sequences = getAllSequences(reminderSettings);
        const existingReminders = reminders.filter(r => r.invoiceId === inv.id);
        const plannedCount = existingReminders.filter(r => r.status === 'planifie').length;
        const sentCount = existingReminders.filter(r => r.status === 'envoye').length;
        const daysOv = getDaysOverdue(inv.dueDate);
        const level = getOverdueLevel(daysOv);

        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowReminderModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><BellRing size={20} style={{ color: GOLD }} /> Rappels de facture</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-mono font-medium" style={{ color: NAVY }}>{inv.invoiceNumber}</span> — {invoiceClientName(inv)} — <span className="font-medium">{fmt(inv.balanceDue)} $</span>
                    </p>
                    {daysOv > 0 && (
                      <p className={`text-xs mt-1 font-medium ${level.color}`}>
                        <AlertCircle size={11} className="inline mr-1" />{daysOv} jours de retard ({level.label})
                      </p>
                    )}
                  </div>
                  <button onClick={() => setShowReminderModal(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-400" /></button>
                </div>

                {/* Existing reminders summary */}
                {existingReminders.length > 0 && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Rappels existants: {plannedCount} planifié(s), {sentCount} envoyé(s)</p>
                    <div className="space-y-1">
                      {existingReminders.map(r => (
                        <div key={r.id} className="flex items-center gap-2 text-xs">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${REMINDER_STATUS_COLORS[r.status]}`}>
                            {REMINDER_STATUS_LABELS[r.status]}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${REMINDER_TYPE_COLORS[r.type]}`}>
                            {REMINDER_TYPE_LABELS[r.type]}
                          </span>
                          <span className="text-gray-500">{r.scheduledDate}</span>
                          {r.sentDate && <span className="text-green-600">envoyé {r.sentDate}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Choisir une séquence de rappels</p>
                <div className="space-y-3">
                  {sequences.map(seq => (
                    <div key={seq.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            {seq.name}
                            {seq.id === reminderSettings.activeSequenceId && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Par défaut</span>}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">{seq.description}</p>
                        </div>
                        <button onClick={() => { const seqToUse = seq; scheduleForInvoice(inv, seqToUse); }}
                          className="px-3 py-1.5 text-white rounded-lg text-xs font-medium hover:opacity-90 shrink-0" style={{ background: NAVY }}>
                          <Play size={11} className="inline mr-1" /> Planifier
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {seq.steps.filter(s => s.enabled).map((step, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-medium ${REMINDER_TYPE_COLORS[step.type]}`}>
                            {step.daysRelative < 0 ? `J${step.daysRelative}` : step.daysRelative === 0 ? 'J' : `J+${step.daysRelative}`}: {REMINDER_TYPE_LABELS[step.type]}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {plannedCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button onClick={() => { deleteAllRemindersForInvoice(inv.id); setShowReminderModal(null); }}
                      className="flex items-center gap-1.5 px-3 py-2 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-50">
                      <Trash2 size={12} /> Supprimer tous les rappels planifiés
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ MODAL: VUE DÉTAIL RAPPEL ═══ */}
      {viewReminder && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={() => setViewReminder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Mail size={18} style={{ color: GOLD }} /> Détail du rappel
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${REMINDER_TYPE_COLORS[viewReminder.type]}`}>
                      {REMINDER_TYPE_LABELS[viewReminder.type]}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${REMINDER_STATUS_COLORS[viewReminder.status]}`}>
                      {REMINDER_STATUS_LABELS[viewReminder.status]}
                    </span>
                  </div>
                </div>
                <button onClick={() => setViewReminder(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-400" /></button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Facture</p>
                    <p className="font-mono font-medium" style={{ color: NAVY }}>{viewReminder.invoiceNumber}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Client</p>
                    <p className="font-medium text-gray-900">{viewReminder.clientName}</p>
                    {viewReminder.clientEmail && <p className="text-xs text-gray-500">{viewReminder.clientEmail}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Date prévue</p>
                    <p className="font-medium">{viewReminder.scheduledDate}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Canal</p>
                    <p className="font-medium flex items-center gap-1">
                      {viewReminder.channel === 'email' ? <Mail size={13} /> : <MessageSquare size={13} />}
                      {viewReminder.channel === 'email' ? 'Courriel' : viewReminder.channel === 'sms' ? 'SMS' : 'Manuel'}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-600">Objet: {viewReminder.subject}</p>
                  </div>
                  <div className="p-4 bg-white">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{viewReminder.body}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-between">
              <button onClick={() => setViewReminder(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">Fermer</button>
              <div className="flex gap-2">
                {viewReminder.status === 'planifie' && (
                  <>
                    <button onClick={() => { cancelReminder(viewReminder); }}
                      className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50 flex items-center gap-1.5">
                      <X size={13} /> Annuler
                    </button>
                    <button onClick={() => { markReminderSent(viewReminder); }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 flex items-center gap-1.5">
                      <Send size={13} /> Marquer comme envoyé
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: PARAMÈTRES RAPPELS ═══ */}
      {showReminderSettings && (() => {
        const sequences = getAllSequences(reminderSettings);
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowReminderSettings(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Settings2 size={20} style={{ color: GOLD }} /> Paramètres des rappels</h2>
                <p className="text-xs text-gray-500 mt-1">Configurez le comportement des rappels automatiques</p>
              </div>
              <div className="p-6 space-y-5">
                {/* Auto-schedule toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Auto-planification</p>
                    <p className="text-xs text-gray-500">Planifier automatiquement les rappels lors de l'envoi d'une facture</p>
                  </div>
                  <button onClick={() => setReminderSettings(prev => ({ ...prev, autoSchedule: !prev.autoSchedule }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${reminderSettings.autoSchedule ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${reminderSettings.autoSchedule ? 'translate-x-5.5 left-[1px]' : 'left-0.5'}`}
                      style={{ left: reminderSettings.autoSchedule ? '22px' : '2px' }} />
                  </button>
                </div>

                {/* Default sequence */}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Séquence par défaut</p>
                  <div className="space-y-2">
                    {sequences.map(seq => (
                      <button key={seq.id} onClick={() => setReminderSettings(prev => ({ ...prev, activeSequenceId: seq.id }))}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${reminderSettings.activeSequenceId === seq.id ? 'border-2 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                        style={reminderSettings.activeSequenceId === seq.id ? { borderColor: NAVY } : {}}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{seq.name}</p>
                            <p className="text-xs text-gray-500">{seq.description}</p>
                          </div>
                          {reminderSettings.activeSequenceId === seq.id && <CheckCircle2 size={18} style={{ color: NAVY }} />}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {seq.steps.filter(s => s.enabled).map((s, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {s.daysRelative < 0 ? `J${s.daysRelative}` : s.daysRelative === 0 ? 'Jour J' : `J+${s.daysRelative}`}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default channel */}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Canal par défaut</p>
                  <div className="flex gap-2">
                    {([
                      { id: 'email' as const, label: 'Courriel', icon: Mail },
                      { id: 'sms' as const, label: 'SMS', icon: MessageSquare },
                      { id: 'manuel' as const, label: 'Manuel', icon: User },
                    ]).map(ch => (
                      <button key={ch.id} onClick={() => setReminderSettings(prev => ({ ...prev, defaultChannel: ch.id }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${reminderSettings.defaultChannel === ch.id ? 'border-2 bg-blue-50/50 font-medium' : 'border-gray-200 hover:border-gray-300'}`}
                        style={reminderSettings.defaultChannel === ch.id ? { borderColor: NAVY } : {}}>
                        <ch.icon size={14} /> {ch.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button onClick={() => setShowReminderSettings(false)} className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90" style={{ background: NAVY }}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ TAB 3: JOURNAL DES PAIEMENTS ═══ */}
      {activeTab === 'paiements' && (
        <>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Du</label>
              <input type="date" value={dateFilter.from} onChange={e => setDateFilter({ ...dateFilter, from: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Au</label>
              <input type="date" value={dateFilter.to} onChange={e => setDateFilter({ ...dateFilter, to: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Toutes les méthodes</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button onClick={() => exportCSV(
              ['Date', 'Facture', 'Client', 'Montant', 'Méthode', 'Référence', 'Reçu par'],
              filteredPayments.map(p => {
                const inv = invoices.find(i => i.id === p.invoiceId);
                const name = inv ? invoiceClientName(inv) : crmClientName(p.clientId);
                return [p.date, p.invoiceNumber, name, fmt(p.amount), PAYMENT_METHOD_LABELS[p.method] || p.method, p.reference, getUserName(p.receivedBy)];
              }),
              `journal_paiements_${today}.csv`
            )} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Download size={14} /> CSV
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">N° Facture</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Montant</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Méthode</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Référence</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reçu par</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map(p => {
                  const inv = invoices.find(i => i.id === p.invoiceId);
                  const name = inv ? invoiceClientName(inv) : crmClientName(p.clientId);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{p.date}</td>
                      <td className="px-4 py-3 font-mono font-medium" style={{ color: NAVY }}>{p.invoiceNumber}</td>
                      <td className="px-4 py-3">{name}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-700">{fmt(p.amount)} $</td>
                      <td className="px-4 py-3 text-gray-600">{PAYMENT_METHOD_LABELS[p.method] || p.method}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.reference || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{getUserName(p.receivedBy)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                {payments.length === 0 ? (
                  <>
                    <CreditCard size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">Aucun paiement enregistré</p>
                    <p className="text-gray-300 text-xs mt-1">Les paiements apparaîtront ici une fois encaissés</p>
                  </>
                ) : (
                  <>
                    <Search size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">Aucun paiement ne correspond aux filtres</p>
                    <p className="text-gray-300 text-xs mt-1">Modifiez les dates ou la méthode de paiement</p>
                  </>
                )}
              </div>
            )}
            {filteredPayments.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-between">
                <span className="font-medium text-gray-600">{filteredPayments.length} paiement(s)</span>
                <span className="font-bold text-green-700">Total: {fmt(filteredPayments.reduce((s, p) => s + p.amount, 0))} $</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ TAB 3: GRAND LIVRE ═══ */}
      {activeTab === 'grandlivre' && (
        <>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Du</label>
              <input type="date" value={dateFilter.from} onChange={e => setDateFilter({ ...dateFilter, from: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Au</label>
              <input type="date" value={dateFilter.to} onChange={e => setDateFilter({ ...dateFilter, to: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <button onClick={() => exportCSV(
              ['Date', 'Description', 'Catégorie', 'Débit', 'Crédit', 'Solde', 'Référence'],
              filteredEntries.map(e => [e.date, e.description, e.category, fmt(e.debit), fmt(e.credit), fmt(e.balance), e.reference]),
              `grand_livre_${today}.csv`
            )} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Download size={14} /> CSV
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ background: NAVY }} className="text-white"><tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium">Catégorie</th>
                <th className="text-right px-4 py-3 font-medium">Débit (+)</th>
                <th className="text-right px-4 py-3 font-medium">Crédit (−)</th>
                <th className="text-right px-4 py-3 font-medium">Solde</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEntries.map((e, i) => (
                  <tr key={e.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-600">{e.date}</td>
                    <td className="px-4 py-3">{e.description}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{e.category}</span></td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">{e.debit > 0 ? `${fmt(e.debit)} $` : ''}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">{e.credit > 0 ? `${fmt(e.credit)} $` : ''}</td>
                    <td className="px-4 py-3 text-right font-bold" style={{ color: NAVY }}>{fmt(e.balance)} $</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                {cashEntries.length === 0 ? (
                  <>
                    <BookOpen size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">Aucune écriture comptable</p>
                    <p className="text-gray-300 text-xs mt-1">Les écritures seront générées automatiquement lors des paiements</p>
                  </>
                ) : (
                  <>
                    <Search size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">Aucune écriture ne correspond aux filtres de dates</p>
                  </>
                )}
              </div>
            )}
            {filteredEntries.length > 0 && (
              <div className="border-t-2 bg-gray-50 px-4 py-3 flex justify-between font-bold" style={{ borderColor: NAVY }}>
                <span style={{ color: NAVY }}>Solde courant</span>
                <span style={{ color: NAVY }} className="text-lg">{fmt(filteredEntries[filteredEntries.length - 1]?.balance || 0)} $</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ TAB 4: DASHBOARD ═══ */}
      {activeTab === 'dashboard' && (() => {
        const isManager = ['coordinatrice', 'superadmin', 'avocat_consultant'].includes(currentUser.role);
        if (!isManager) return (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            Vue limitée — Les données financières détaillées sont réservées à la direction.
          </div>
        );
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Aujourd'hui", value: todayRevenue },
                { label: 'Cette semaine', value: weekRevenue },
                { label: 'Ce mois', value: monthRevenue },
                { label: 'Année (YTD)', value: ytdRevenue },
              ].map((k, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-xs text-gray-500 mb-1">{k.label}</div>
                  <div className="text-xl font-bold text-green-600">{fmt(k.value)} $</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-bold mb-4" style={{ color: NAVY }}>Revenus par méthode de paiement</h3>
                {renderPie(methodBreakdown)}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-bold mb-4" style={{ color: NAVY }}>Revenus mensuels</h3>
                {monthlyRevenue.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">Aucune donnée</p> : (
                  <div className="space-y-3">
                    {monthlyRevenue.slice(-6).map(([month, amount]) => (
                      <div key={month} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-16 shrink-0">{month}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(4, (amount / maxMonthly) * 100)}%`, background: `linear-gradient(to right, ${NAVY}, ${GOLD})` }} />
                        </div>
                        <span className="text-sm font-bold w-24 text-right" style={{ color: NAVY }}>{fmt(amount)} $</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-bold mb-4" style={{ color: NAVY }}>Top 5 clients</h3>
                {topClients.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">Aucune donnée</p> : (
                  <div className="space-y-2">
                    {topClients.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: NAVY }}>{i + 1}</span>
                          <span className="text-sm font-medium text-gray-800">{c.name}</span>
                        </div>
                        <span className="text-sm font-bold text-green-700">{fmt(c.amount)} $</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-red-600 mb-4">Factures en retard ({overdueInvoices.length})</h3>
                {overdueInvoices.length === 0 ? <p className="text-green-600 text-sm text-center py-8">Aucune facture en retard</p> : (
                  <div className="space-y-2">
                    {overdueInvoices.map(inv => {
                      const days = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000);
                      return (
                        <div key={inv.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-red-50 border border-red-100">
                          <div><span className="text-sm font-mono" style={{ color: NAVY }}>{inv.invoiceNumber}</span><span className="text-xs text-gray-500 ml-2">{invoiceClientName(inv)}</span></div>
                          <div className="text-right"><span className="text-sm font-bold text-red-600">{fmt(inv.balanceDue)} $</span><span className="text-xs text-red-400 ml-2">{days}j</span></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* ═══ MODAL: VUE FACTURE ═══ */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewInvoice(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold" style={{ color: NAVY }}>SOS Hub</span>
                    <span className="text-2xl font-bold" style={{ color: GOLD }}>Canada</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p className="font-medium text-gray-700">{COMPANY_TAX_INFO.nomLegal}</p>
                    <p>{COMPANY_TAX_INFO.adresse}</p>
                    <p>{COMPANY_TAX_INFO.ville}, {COMPANY_TAX_INFO.province} {COMPANY_TAX_INFO.codePostal}</p>
                    <p>{COMPANY_TAX_INFO.telephone} | {COMPANY_TAX_INFO.courriel}</p>
                    <div className="mt-1.5 pt-1.5 border-t border-gray-100 font-mono text-[10px]">
                      <p>NEQ: {COMPANY_TAX_INFO.neq}</p>
                      {IS_TAX_REGISTERED ? (<><p>TPS: {COMPANY_TAX_INFO.tps}</p><p>TVQ: {COMPANY_TAX_INFO.tvq}</p></>) : (<p className="text-gray-400">Taxes incluses dans le tarif</p>)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">FACTURE</h2>
                  <p className="font-mono text-lg font-bold" style={{ color: GOLD }}>{viewInvoice.invoiceNumber}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    <p>Date: {viewInvoice.date}</p>
                    <p>Échéance: {viewInvoice.dueDate}</p>
                    <p>Termes: {TERMS_LABELS[viewInvoice.terms]}</p>
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUS_COLORS[viewInvoice.status]}`}>
                    {INVOICE_STATUS_LABELS[viewInvoice.status]}
                  </span>
                </div>
              </div>
              {/* Client info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-500 mb-1">Facturé à:</p>
                <p className="font-semibold text-gray-900">{invoiceClientName(viewInvoice)}</p>
                {viewInvoice.manualClientName ? (
                  <div className="text-xs text-gray-500 mt-1">
                    {viewInvoice.manualClientAddress && <p>{viewInvoice.manualClientAddress}</p>}
                    {(viewInvoice.manualClientCity || viewInvoice.manualClientProvince) && <p>{viewInvoice.manualClientCity}{viewInvoice.manualClientProvince ? `, ${viewInvoice.manualClientProvince}` : ''} {viewInvoice.manualClientPostalCode}</p>}
                    {viewInvoice.manualClientEmail && <p>{viewInvoice.manualClientEmail}</p>}
                    {viewInvoice.manualClientPhone && <p>{viewInvoice.manualClientPhone}</p>}
                  </div>
                ) : (() => { const c = clients.find(cl => cl.id === viewInvoice.clientId); return c ? (
                  <div className="text-xs text-gray-500 mt-1"><p>{c.address}</p><p>{c.city}, {c.province} {c.postalCode}</p><p>{c.email}</p></div>
                ) : null; })()}
              </div>
              {/* Items table */}
              <table className="w-full text-sm mb-6">
                <thead className="border-b-2" style={{ borderColor: NAVY }}><tr>
                  <th className="text-left py-2 font-semibold" style={{ color: NAVY }}>Description</th>
                  <th className="text-center py-2 font-semibold w-12" style={{ color: NAVY }}>Qté</th>
                  <th className="text-right py-2 font-semibold w-24" style={{ color: NAVY }}>Prix unit.</th>
                  <th className="text-right py-2 font-semibold w-24" style={{ color: NAVY }}>Montant</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {viewInvoice.items.map(item => (
                    <tr key={item.id} className={item.taxCategory === 'debourse' ? 'bg-gray-50' : ''}>
                      <td className="py-2">{item.description}{item.taxCategory === 'debourse' && <span className="ml-1 text-[10px] text-gray-400">(déboursé)</span>}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right">{fmt(item.unitPrice)} $</td>
                      <td className="py-2 text-right font-medium">{fmt(item.quantity * item.unitPrice)} $</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-80 text-sm border border-gray-200 rounded-lg overflow-hidden">
                  {viewInvoice.subtotalTaxable > 0 && <div className="flex justify-between px-4 py-1.5 bg-gray-50"><span className="text-gray-600">Services professionnels:</span><span>{fmt(viewInvoice.subtotalTaxable)} $</span></div>}
                  {viewInvoice.subtotalDebourse > 0 && <div className="flex justify-between px-4 py-1.5"><span className="text-gray-600">Déboursés (frais gouv.):</span><span>{fmt(viewInvoice.subtotalDebourse)} $</span></div>}
                  {viewInvoice.subtotalExempt > 0 && <div className="flex justify-between px-4 py-1.5 bg-gray-50"><span className="text-gray-600">Autres services:</span><span>{fmt(viewInvoice.subtotalExempt)} $</span></div>}
                  <div className="flex justify-between px-4 py-1.5 border-t border-gray-200"><span className="text-gray-600">TPS ({(TPS_RATE * 100).toFixed(0)} %):</span><span>{fmt(viewInvoice.tpsTotal)} $</span></div>
                  <div className="flex justify-between px-4 py-1.5 bg-gray-50"><span className="text-gray-600">TVQ ({(TVQ_RATE * 100).toFixed(3)} %):</span><span>{fmt(viewInvoice.tvqTotal)} $</span></div>
                  {!IS_TAX_REGISTERED && <div className="px-4 py-1 text-xs text-gray-400 italic">Taxes incluses dans le tarif</div>}
                  <div className="flex justify-between px-4 py-2.5 text-white font-bold text-base" style={{ background: NAVY }}><span>TOTAL:</span><span>{fmt(viewInvoice.grandTotal)} $</span></div>
                  {viewInvoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between px-4 py-1.5 text-green-700 bg-green-50"><span>Montant payé:</span><span>-{fmt(viewInvoice.paidAmount)} $</span></div>
                      <div className="flex justify-between px-4 py-2 font-bold text-red-700 bg-red-50"><span>SOLDE DÛ:</span><span>{fmt(viewInvoice.balanceDue)} $</span></div>
                    </>
                  )}
                </div>
              </div>
              {viewInvoice.notes && <div className="mt-6 bg-yellow-50 rounded-lg p-3 text-xs text-gray-600"><span className="font-medium">Notes: </span>{viewInvoice.notes}</div>}
              <div className="mt-6 border-t-2 border-gray-200 pt-4 space-y-1">
                <div className="text-[10px] text-gray-400 space-y-0.5">
                  <p className="font-semibold text-gray-500">{COMPANY_TAX_INFO.nomLegal}</p>
                  <p>{COMPANY_TAX_INFO.adresse}, {COMPANY_TAX_INFO.ville}, {COMPANY_TAX_INFO.province} {COMPANY_TAX_INFO.codePostal}</p>
                  <p className="font-mono">NEQ: {COMPANY_TAX_INFO.neq}</p>
                </div>
                <div className="text-[9px] text-gray-400 pt-2 space-y-0.5">
                  <p>{LEGAL_MENTIONS.latePayment}</p>
                  <p>{LEGAL_MENTIONS.jurisdiction}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 p-4 flex justify-between">
              <button onClick={() => setViewInvoice(null)} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg text-sm">Fermer</button>
              <div className="flex gap-2">
                {viewInvoice.status === 'brouillon' && (
                  <button onClick={() => sendInvoice(viewInvoice)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Send size={14} /> Envoyer</button>
                )}
                {viewInvoice.status !== 'payee' && viewInvoice.status !== 'annulee' && (
                  <>
                    <button onClick={() => { setErrorMsg(null); setShowPayment(viewInvoice); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><CreditCard size={14} /> Encaisser</button>
                    <button onClick={() => cancelInvoice(viewInvoice)} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50"><X size={14} /> Annuler</button>
                  </>
                )}
                <button onClick={() => duplicateInvoice(viewInvoice)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><Copy size={14} /> Dupliquer</button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm"><Printer size={14} /> Imprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: PAIEMENT ═══ */}
      {showPayment && (() => {
        const inv = showPayment;
        const clientEmail = inv.manualClientEmail || (() => { const c = clients.find(cl => cl.id === inv.clientId); return c?.email || ''; })();
        const clientName = invoiceClientName(inv);

        const generatePaymentLink = async (provider: 'stripe' | 'square') => {
          const endpoint = provider === 'stripe' ? '/api/crm/stripe-invoice' : '/api/crm/square-invoice';
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                invoiceNumber: inv.invoiceNumber,
                amount: inv.balanceDue,
                clientName,
                clientEmail,
                description: `Facture ${inv.invoiceNumber} — ${clientName}`,
              }),
            });
            const data = await res.json();
            if (data.paymentUrl) {
              window.open(data.paymentUrl, '_blank');
            } else {
              alert(data.error || `Erreur ${provider}`);
            }
          } catch {
            alert(`Impossible de contacter le service ${provider}. Vérifiez la configuration.`);
          }
        };

        const copyPaymentLink = async (provider: 'stripe' | 'square') => {
          const endpoint = provider === 'stripe' ? '/api/crm/stripe-invoice' : '/api/crm/square-invoice';
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                invoiceNumber: inv.invoiceNumber,
                amount: inv.balanceDue,
                clientName,
                clientEmail,
                description: `Facture ${inv.invoiceNumber} — ${clientName}`,
              }),
            });
            const data = await res.json();
            if (data.paymentUrl) {
              await navigator.clipboard.writeText(data.paymentUrl);
              alert('Lien de paiement copié dans le presse-papiers!');
            } else {
              alert(data.error || `Erreur ${provider}`);
            }
          } catch {
            alert(`Impossible de contacter le service ${provider}.`);
          }
        };

        return (
          <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center" onClick={() => setShowPayment(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <CreditCard size={20} className="text-green-600" /> Encaisser un paiement
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Facture <span className="font-mono font-medium" style={{ color: NAVY }}>{inv.invoiceNumber}</span> — {clientName} — Solde: <span className="font-bold text-gray-900">{fmt(inv.balanceDue)} $</span>
              </p>

              {/* Online payment options */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Zap size={11} /> Paiement en ligne</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Stripe */}
                  <div className="border border-gray-200 rounded-xl p-3 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <CreditCard size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Stripe</p>
                        <p className="text-[10px] text-gray-400">Carte / Link</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => generatePaymentLink('stripe')}
                        className="flex-1 px-2 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-medium hover:bg-indigo-700 flex items-center justify-center gap-1">
                        <Send size={10} /> Envoyer
                      </button>
                      <button onClick={() => copyPaymentLink('stripe')}
                        className="px-2 py-1.5 border border-indigo-200 text-indigo-600 rounded-lg text-[10px] font-medium hover:bg-indigo-50 flex items-center gap-1">
                        <Copy size={10} /> Lien
                      </button>
                    </div>
                  </div>
                  {/* Square */}
                  <div className="border border-gray-200 rounded-xl p-3 hover:border-gray-400 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                        <Hash size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Square</p>
                        <p className="text-[10px] text-gray-400">Terminal / Lien</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => generatePaymentLink('square')}
                        className="flex-1 px-2 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-medium hover:bg-gray-800 flex items-center justify-center gap-1">
                        <Send size={10} /> Envoyer
                      </button>
                      <button onClick={() => copyPaymentLink('square')}
                        className="px-2 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-[10px] font-medium hover:bg-gray-50 flex items-center gap-1">
                        <Copy size={10} /> Lien
                      </button>
                    </div>
                  </div>
                </div>
                {clientEmail && (
                  <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                    <Mail size={10} /> Le lien sera envoyé à: {clientEmail}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">ou enregistrer manuellement</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* Manual payment */}
              {errorMsg && (
                <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errorMsg}</p>
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Montant reçu *</label>
                  <input id="pay-amount" type="number" step="0.01" min="0.01" max={inv.balanceDue} defaultValue={inv.balanceDue} className={inputCls} />
                  <p className="text-[10px] text-gray-400 mt-0.5">Maximum: {fmt(inv.balanceDue)} $</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Mode de paiement *</label>
                  <select id="pay-method" className={inputCls}>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Référence (# chèque, # transaction, etc.)</label>
                  <input id="pay-reference" type="text" placeholder="Optionnel" className={inputCls} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setErrorMsg(null); setShowPayment(null); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">Annuler</button>
                <button onClick={() => {
                  const amount = parseFloat((document.getElementById('pay-amount') as HTMLInputElement).value);
                  const method = (document.getElementById('pay-method') as HTMLSelectElement).value;
                  const reference = (document.getElementById('pay-reference') as HTMLInputElement).value;
                  markPaid(inv, method, amount, reference);
                }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Confirmer le paiement
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ MODAL: NOUVELLE FACTURE — QuickBooks Style ═══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ background: `${NAVY}08` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GOLD }}>
                  <FileText size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Nouvelle facture</h2>
                  <p className="text-xs text-gray-400">Créez une facture manuellement — client CRM ou nouveau client</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-400" /></button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Section 1: Client — Toggle CRM / Manuel */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1"><User size={12} /> Client</p>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                    <button onClick={() => setNewInv(prev => ({ ...prev, clientMode: 'crm' }))}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${newInv.clientMode === 'crm' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                      <User size={11} className="inline mr-1" /> Client CRM
                    </button>
                    <button onClick={() => setNewInv(prev => ({ ...prev, clientMode: 'manual' }))}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${newInv.clientMode === 'manual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                      <UserPlus size={11} className="inline mr-1" /> Nouveau client
                    </button>
                  </div>
                </div>

                {newInv.clientMode === 'crm' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-0.5 block">Client *</label>
                      <select value={newInv.clientId} onChange={e => setNewInv(prev => ({ ...prev, clientId: e.target.value }))} className={inputCls}>
                        <option value="">Sélectionner un client...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-0.5 block">Dossier associé</label>
                      <select value={newInv.caseId} onChange={e => setNewInv(prev => ({ ...prev, caseId: e.target.value }))} className={inputCls}>
                        <option value="">Aucun</option>
                        {cases.filter(c => c.clientId === newInv.clientId).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-0.5 block">Nom complet *</label>
                        <input className={inputCls} value={newInv.manualClientName} onChange={e => setNewInv(prev => ({ ...prev, manualClientName: e.target.value }))} placeholder="Jean Dupont" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-0.5 block">Courriel</label>
                        <input type="email" className={inputCls} value={newInv.manualClientEmail} onChange={e => setNewInv(prev => ({ ...prev, manualClientEmail: e.target.value }))} placeholder="jean@email.com" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-0.5 block">Téléphone</label>
                        <input className={inputCls} value={newInv.manualClientPhone} onChange={e => setNewInv(prev => ({ ...prev, manualClientPhone: e.target.value }))} placeholder="(514) 555-0000" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-0.5 block">Adresse</label>
                        <input className={inputCls} value={newInv.manualClientAddress} onChange={e => setNewInv(prev => ({ ...prev, manualClientAddress: e.target.value }))} placeholder="123 rue Principale" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-0.5 block">Ville</label>
                        <input className={inputCls} value={newInv.manualClientCity} onChange={e => setNewInv(prev => ({ ...prev, manualClientCity: e.target.value }))} placeholder="Montréal" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 mb-0.5 block">Province</label>
                          <select className={inputCls} value={newInv.manualClientProvince} onChange={e => setNewInv(prev => ({ ...prev, manualClientProvince: e.target.value }))}>
                            {['QC','ON','BC','AB','MB','SK','NS','NB','PE','NL','NT','YT','NU'].map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-0.5 block">Code postal</label>
                          <input className={inputCls} value={newInv.manualClientPostalCode} onChange={e => setNewInv(prev => ({ ...prev, manualClientPostalCode: e.target.value }))} placeholder="H2X 1Y4" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Invoice details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-0.5 block">Date de facturation</label>
                  <input type="date" className={inputCls} value={newInv.invoiceDate} onChange={e => setNewInv(prev => ({ ...prev, invoiceDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-0.5 block">Termes de paiement</label>
                  <select value={newInv.terms} onChange={e => setNewInv(prev => ({ ...prev, terms: e.target.value as Invoice['terms'] }))} className={inputCls}>
                    {Object.entries(TERMS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Section 3: Line Items */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Package size={12} /> Lignes de facturation</p>

                {/* Add from template or custom */}
                <div className="flex gap-2 mb-3">
                  <select onChange={e => { if (e.target.value) { addServiceItem(e.target.value); e.target.value = ''; } }} className={`flex-1 ${inputCls}`}>
                    <option value="">+ Ajouter un service prédéfini...</option>
                    <optgroup label="Consultations">{SERVICE_TEMPLATES.filter(t => t.category === 'consultation').map(t => <option key={t.id} value={t.id}>{t.description} — {t.defaultPrice} $</option>)}</optgroup>
                    <optgroup label="Services immigration">{SERVICE_TEMPLATES.filter(t => t.category === 'service').map(t => <option key={t.id} value={t.id}>{t.description} — {t.defaultPrice} $</option>)}</optgroup>
                    <optgroup label="Services additionnels">{SERVICE_TEMPLATES.filter(t => t.category === 'additionnel').map(t => <option key={t.id} value={t.id}>{t.description} — {t.defaultPrice} $</option>)}</optgroup>
                    <optgroup label="Frais gouvernementaux (déboursés)">{SERVICE_TEMPLATES.filter(t => t.category === 'gouvernement').map(t => <option key={t.id} value={t.id}>{t.description} — {t.defaultPrice} $</option>)}</optgroup>
                  </select>
                  <button onClick={addCustomItem}
                    className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 whitespace-nowrap flex items-center gap-1.5 transition-colors">
                    <Plus size={14} /> Ligne personnalisée
                  </button>
                </div>

                {/* Items table */}
                {newInv.items.length > 0 ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b"><tr>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">Description</th>
                        <th className="text-center px-2 py-2 font-medium text-gray-600 w-14">Qté</th>
                        <th className="text-right px-2 py-2 font-medium text-gray-600 w-24">Prix unit.</th>
                        <th className="text-center px-2 py-2 font-medium text-gray-600 w-24">Taxe</th>
                        <th className="text-right px-2 py-2 font-medium text-gray-600 w-24">Total</th>
                        <th className="w-16"></th>
                      </tr></thead>
                      <tbody>
                        {newInv.items.map((item, idx) => (
                          <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-3 py-2">
                              <input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)}
                                className="w-full text-sm border-0 bg-transparent p-0 outline-none focus:ring-0 placeholder-gray-300"
                                placeholder="Description du service..." />
                            </td>
                            <td className="px-1 py-2">
                              <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-12 text-center text-sm border border-gray-200 rounded p-1" />
                            </td>
                            <td className="px-1 py-2">
                              <input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-20 text-right text-sm border border-gray-200 rounded p-1" />
                            </td>
                            <td className="px-1 py-2">
                              <select value={item.taxCategory} onChange={e => updateItem(idx, 'taxCategory', e.target.value)}
                                className="w-20 text-[11px] border border-gray-200 rounded p-1">
                                <option value="taxable">Taxable</option>
                                <option value="exempt">Exempt</option>
                                <option value="debourse">Déboursé</option>
                              </select>
                            </td>
                            <td className="px-2 py-2 text-right font-medium text-gray-900">{fmt(item.quantity * item.unitPrice)} $</td>
                            <td className="px-1 py-2">
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => duplicateItem(idx)} className="p-1 rounded hover:bg-gray-100 text-gray-300 hover:text-gray-500" title="Dupliquer"><Copy size={12} /></button>
                                <button onClick={() => removeItem(idx)} className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500" title="Supprimer"><Trash2 size={12} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                    <Package size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Ajoutez des services prédéfinis ou créez des lignes personnalisées</p>
                  </div>
                )}

                {/* Totals */}
                {newInv.items.length > 0 && (
                  <div className="flex justify-end mt-4">
                    <div className="w-72 space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Sous-total:</span><span>{fmt(totals.subtotalTaxable + totals.subtotalDebourse + totals.subtotalExempt)} $</span></div>
                      <div className="flex justify-between text-gray-500"><span>TPS ({(TPS_RATE * 100).toFixed(0)}%):</span><span>{fmt(totals.tpsTotal)} $</span></div>
                      <div className="flex justify-between text-gray-500"><span>TVQ ({(TVQ_RATE * 100).toFixed(3)}%):</span><span>{fmt(totals.tvqTotal)} $</span></div>
                      {!IS_TAX_REGISTERED && <div className="text-xs text-gray-400 italic">Taxes incluses dans le tarif</div>}
                      <div className="flex justify-between font-bold text-lg border-t-2 pt-2 mt-2" style={{ borderColor: NAVY, color: NAVY }}>
                        <span>TOTAL:</span><span>{fmt(totals.grandTotal)} $</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-gray-500 mb-0.5 block">Notes / conditions particulières</label>
                <textarea value={newInv.notes} onChange={e => setNewInv(prev => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Notes visibles sur la facture..." className={inputCls} />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 rounded-b-2xl space-y-2">
              {invoiceErrorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{invoiceErrorMsg}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {newInv.items.length} ligne(s) &middot; {newInv.clientMode === 'manual' ? 'Client manuel' : 'Client CRM'}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setInvoiceErrorMsg(null); setShowModal(false); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-100">Annuler</button>
                  <button onClick={createInvoice} disabled={!canCreateInvoice()}
                    className="px-6 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-40 transition-opacity flex items-center gap-2" style={{ background: canCreateInvoice() ? GOLD : '#999' }}>
                    <CheckCircle2 size={14} /> Créer la facture
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
