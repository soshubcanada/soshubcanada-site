"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useCrm, DEMO_USERS } from "@/lib/crm-store";
import type { CrmUser } from "@/lib/crm-types";
import {
  LayoutDashboard, Calculator, FileText, Users, BarChart3, FileCheck,
  DollarSign, Clock, AlertTriangle, CheckCircle2, Play, Printer,
  Download, Plus, X, ChevronDown, ChevronRight, Building2,
  TrendingUp, Wallet, Calendar, ArrowRight, Eye, Settings,
  UserCheck, AlertCircle, CircleDot, Loader2, MapPin, Pencil, Save, Shield,
} from "lucide-react";
import {
  type PayrollData, type PayrollCompany, type EmployeePayConfig, type PayPeriod, type PayStub,
  type PayStatus, type FrequencePaie, type PresenceEntry, type T4Data, type RL1Data,
  type CustomDeduction, type CalculatePayStubInput,
  loadPayrollData, savePayrollData, defaultCompany, generateId,
  getPeriodsPerYear, calculatePayStub, calculatePeriodHours, getYTD,
  generateT4, generateRL1, FEDERAL_BASIC_PERSONAL, QC_BASIC_PERSONAL,
} from "@/lib/paie-engine";

// ============================================================
// Constants
// ============================================================

const NAVY = "#1B2559";
const GOLD = "#D4A03C";
const HR_STORAGE_KEY = "soshub_hr_data";

const TABS = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "traitement", label: "Traitement", icon: Calculator },
  { id: "bulletins", label: "Bulletins", icon: FileText },
  { id: "registre", label: "Registre", icon: Users },
  { id: "rapports", label: "Rapports", icon: BarChart3 },
  { id: "fin_annee", label: "T4 / RL-1", icon: FileCheck },
] as const;
type TabId = (typeof TABS)[number]["id"];

const STATUS_COLORS: Record<PayStatus, string> = {
  brouillon: "bg-gray-100 text-gray-700",
  approuve: "bg-blue-100 text-blue-700",
  traite: "bg-amber-100 text-amber-700",
  paye: "bg-green-100 text-green-700",
};
const STATUS_LABELS: Record<PayStatus, string> = {
  brouillon: "Brouillon",
  approuve: "Approuvé",
  traite: "Traité",
  paye: "Payé",
};

const FREQ_LABELS: Record<FrequencePaie, string> = {
  hebdomadaire: "Hebdomadaire",
  bi_hebdomadaire: "Aux 2 semaines",
  bimensuel: "Bimensuel",
  mensuel: "Mensuel",
};

// ============================================================
// HR Data Loader (reads from HR localStorage)
// ============================================================

interface HRProfile {
  userId: string;
  prenom: string;
  nomFamille: string;
  salaire: string;
  tauxHoraire: string;
  departement: string;
  poste: string;
  modePaiement: string;
  frequencePaie: FrequencePaie;
  statutEmploi: string;
  employeeNumber: string;
}

interface HRData {
  profiles: Record<string, HRProfile>;
  presences: PresenceEntry[];
}

function loadHRData(): HRData {
  if (typeof window === "undefined") return { profiles: {}, presences: [] };
  try {
    const raw = localStorage.getItem(HR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { profiles: parsed.profiles || {}, presences: parsed.presences || [] };
    }
  } catch (err) {
    console.error("Erreur lors du chargement des donnees RH:", err);
  }
  return { profiles: {}, presences: [] };
}

// ============================================================
// Helpers
// ============================================================

const fmt = (n: number) => n.toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
const fmtH = (h: number) => `${Math.floor(h)}h${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;

/** Mask NAS to show only last 4 digits: 123-456-789 -> ***-***-6789, or ***-***-789 for 9-digit */
function maskNAS(nas: string): string {
  if (!nas) return "";
  const digits = nas.replace(/\D/g, "");
  if (digits.length < 4) return "***-***-" + digits;
  return "***-***-" + digits.slice(-4);
}

/** Validate hours: must be >= 0 and reasonably < 24h per day for the period */
function validateHours(hours: number, maxPerDay: number = 24): string | null {
  if (hours < 0) return "Les heures ne peuvent pas etre negatives.";
  if (hours > maxPerDay * 31) return `Les heures depassent le maximum raisonnable (${maxPerDay * 31}h pour une periode).`;
  return null;
}

/** Validate pay rate: must be > 0 */
function validatePayRate(rate: number): string | null {
  if (rate <= 0) return "Le taux de remuneration doit etre superieur a 0.";
  return null;
}

function getUserName(id: string): string {
  return DEMO_USERS.find(u => u.id === id)?.name || id;
}

function generatePeriods(company: PayrollCompany, year: number): PayPeriod[] {
  const periods: PayPeriod[] = [];
  const freq = company.payFrequency;
  const ppYear = getPeriodsPerYear(freq);
  const start = new Date(year, 0, 1);

  for (let i = 0; i < ppYear; i++) {
    const pStart = new Date(start);
    let pEnd: Date;
    if (freq === "mensuel") {
      pStart.setMonth(i); pStart.setDate(1);
      pEnd = new Date(year, i + 1, 0);
    } else if (freq === "bimensuel") {
      const month = Math.floor(i / 2);
      pStart.setMonth(month); pStart.setDate(i % 2 === 0 ? 1 : 16);
      pEnd = i % 2 === 0 ? new Date(year, month, 15) : new Date(year, month + 1, 0);
    } else if (freq === "bi_hebdomadaire") {
      pStart.setDate(1 + i * 14);
      pEnd = new Date(pStart); pEnd.setDate(pEnd.getDate() + 13);
    } else {
      pStart.setDate(1 + i * 7);
      pEnd = new Date(pStart); pEnd.setDate(pEnd.getDate() + 6);
    }
    const payDate = new Date(pEnd); payDate.setDate(payDate.getDate() + 5);
    periods.push({
      id: `period-${year}-${String(i + 1).padStart(2, "0")}`,
      companyId: company.id,
      startDate: pStart.toISOString().split("T")[0],
      endDate: pEnd.toISOString().split("T")[0],
      payDate: payDate.toISOString().split("T")[0],
      status: "brouillon",
      periodNumber: i + 1,
    });
  }
  return periods;
}

// ============================================================
// Shared input class
// ============================================================
const inputCls = "w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-[#D4A03C] focus:ring-1 focus:ring-[#D4A03C]/30 outline-none";

// ============================================================
// Main Component
// ============================================================

export default function PaiePage() {
  const { currentUser } = useCrm();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [data, setData] = useState<PayrollData>(loadPayrollData);
  const [hrData, setHrData] = useState<HRData>({ profiles: {}, presences: [] });
  const [loaded, setLoaded] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const pd = loadPayrollData();
    const hr = loadHRData();
    setData(pd);
    setHrData(hr);

    // Auto-init employee configs from HR profiles
    if (pd.employeeConfigs.length === 0 && Object.keys(hr.profiles).length > 0) {
      const configs: EmployeePayConfig[] = DEMO_USERS.filter(u => u.active).map(u => {
        const p = hr.profiles[u.id];
        const rate = p?.salaire ? parseFloat(p.salaire) || 0 : (p?.tauxHoraire ? parseFloat(p.tauxHoraire) || 20 : 20);
        return {
          employeeId: u.id,
          companyId: pd.companies[0]?.id || "company-1",
          payType: p?.salaire && parseFloat(p.salaire) > 0 ? "salaire" as const : "horaire" as const,
          rate,
          td1Federal: FEDERAL_BASIC_PERSONAL,
          tp1015Provincial: QC_BASIC_PERSONAL,
          vacationRate: 4,
          customDeductions: [],
          poste: p?.poste || "",
          departement: p?.departement || "",
          address: "",
          city: "",
          postalCode: "",
          nas: "",
          dateEmbauche: "",
        };
      });
      pd.employeeConfigs = configs;
      setData({ ...pd });
      savePayrollData({ ...pd });
    }
    setLoaded(true);
  }, []);

  const updateData = useCallback((fn: (prev: PayrollData) => PayrollData) => {
    setData(prev => {
      const next = fn(prev);
      savePayrollData(next);
      return next;
    });
  }, []);

  const company = data.companies[0] || defaultCompany();
  const activeUsers = DEMO_USERS.filter(u => u.active);

  if (!currentUser) return <div className="flex items-center justify-center h-[60vh]"><p className="text-gray-400">Connectez-vous pour accéder à la paie</p></div>;

  // *** SUPERADMIN ONLY ***
  if (currentUser.role !== "superadmin") return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-red-50">
          <Shield className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-gray-700 font-semibold text-lg">Accès restreint</p>
        <p className="text-gray-400 text-sm max-w-xs">Le module de paie est réservé au super-administrateur uniquement.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: NAVY }}>
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paie</h1>
            <p className="text-sm text-gray-500">{company.name} &middot; {FREQ_LABELS[company.payFrequency]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 flex items-center gap-1">
            <Shield size={10} /> Super-admin
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notification banner */}
      {notification && (
        <div className={`flex items-center justify-between p-4 rounded-xl border ${notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span className="text-sm">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-sm font-medium hover:underline">Fermer</button>
        </div>
      )}

      {/* Content */}
      {activeTab === "dashboard" && <TabDashboard data={data} hrData={hrData} company={company} users={activeUsers} />}
      {activeTab === "traitement" && <TabTraitement data={data} hrData={hrData} company={company} users={activeUsers} updateData={updateData} setNotification={setNotification} />}
      {activeTab === "bulletins" && <TabBulletins data={data} users={activeUsers} company={company} />}
      {activeTab === "registre" && <TabRegistre data={data} hrData={hrData} users={activeUsers} updateData={updateData} />}
      {activeTab === "rapports" && <TabRapports data={data} hrData={hrData} users={activeUsers} company={company} />}
      {activeTab === "fin_annee" && <TabFinAnnee data={data} users={activeUsers} company={company} />}
    </div>
  );
}

// ============================================================
// Tab 1: Tableau de bord
// ============================================================

function TabDashboard({ data, hrData, company, users }: {
  data: PayrollData; hrData: HRData; company: PayrollCompany; users: CrmUser[];
}) {
  const year = new Date().getFullYear();
  const yearStubs = data.stubs.filter(s => s.periodStart.startsWith(String(year)));
  const totalBrut = yearStubs.reduce((a, s) => a + s.salaireBrut, 0);
  const totalDeductions = yearStubs.reduce((a, s) => a + s.totalDeductions, 0);
  const totalNet = yearStubs.reduce((a, s) => a + s.salaireNet, 0);
  const totalEmployeur = yearStubs.reduce((a, s) => a + s.coutEmployeurTotal, 0);

  const today = new Date().toISOString().split("T")[0];
  const currentPeriods = data.periods.filter(p => p.startDate <= today && p.endDate >= today);
  const upcomingPeriods = data.periods.filter(p => p.startDate > today).slice(0, 3);

  const alerts: string[] = [];
  const todayPresences = hrData.presences.filter(p => p.date === today);
  for (const u of users) {
    const p = todayPresences.find(t => t.employeeId === u.id);
    if (p?.punchIn && !p?.punchOut) alerts.push(`${u.name}: punch de sortie manquant`);
  }
  const unconfigured = users.filter(u => !data.employeeConfigs.find(c => c.employeeId === u.id));
  if (unconfigured.length) alerts.push(`${unconfigured.length} employé(s) sans configuration paie`);
  const missingInfo = data.employeeConfigs.filter(c => !c.address || !c.nas);
  if (missingInfo.length) alerts.push(`${missingInfo.length} employé(s) avec infos personnelles incomplètes`);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Masse salariale brute", value: fmt(totalBrut), icon: DollarSign, color: "text-blue-600 bg-blue-50" },
          { label: "Déductions totales", value: fmt(totalDeductions), icon: ArrowRight, color: "text-red-600 bg-red-50" },
          { label: "Net versé", value: fmt(totalNet), icon: CheckCircle2, color: "text-green-600 bg-green-50" },
          { label: "Coût employeur total", value: fmt(totalEmployeur), icon: Building2, color: "text-purple-600 bg-purple-50" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon size={18} />
              </div>
              <p className="text-xs text-gray-500">{kpi.label}</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-[10px] text-gray-400 mt-1">Année {year}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" /> Période courante
          </h3>
          {currentPeriods.length ? currentPeriods.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{p.startDate} au {p.endDate}</p>
                <p className="text-xs text-gray-400">Paie le {p.payDate}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                {STATUS_LABELS[p.status]}
              </span>
            </div>
          )) : (
            <p className="text-sm text-gray-400">Aucune période active. Générez les périodes dans l&apos;onglet Traitement.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Alertes
          </h3>
          {alerts.length ? alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-600">{a}</p>
            </div>
          )) : (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle2 size={14} /> Aucune alerte
            </p>
          )}
        </div>
      </div>

      {upcomingPeriods.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Prochaines dates de paie</h3>
          <div className="space-y-2">
            {upcomingPeriods.map(p => (
              <div key={p.id} className="flex items-center gap-3 text-sm">
                <CircleDot size={12} className="text-gray-300" />
                <span className="text-gray-700">{p.payDate}</span>
                <span className="text-gray-400">({p.startDate} au {p.endDate})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employees summary — premium card style */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{users.length} employés actifs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map(u => {
            const cfg = data.employeeConfigs.find(c => c.employeeId === u.id);
            const hr = hrData.profiles[u.id];
            const yearEmpStubs = yearStubs.filter(s => s.employeeId === u.id);
            const empBrut = yearEmpStubs.reduce((a, s) => a + s.salaireBrut, 0);
            return (
              <div key={u.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: NAVY }}>
                    {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-[11px] text-gray-400">{cfg?.poste || hr?.poste || u.role}</p>
                  </div>
                  {cfg ? <CheckCircle2 size={14} className="text-green-500 shrink-0" /> : <AlertCircle size={14} className="text-amber-500 shrink-0" />}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white rounded-lg px-2 py-1.5">
                    <p className="text-gray-400">Rémunération</p>
                    <p className="font-semibold text-gray-700">{cfg ? (cfg.payType === "salaire" ? fmt(cfg.rate) + "/an" : fmt(cfg.rate) + "/h") : "—"}</p>
                  </div>
                  <div className="bg-white rounded-lg px-2 py-1.5">
                    <p className="text-gray-400">YTD Brut</p>
                    <p className="font-semibold text-gray-700">{fmt(empBrut)}</p>
                  </div>
                </div>
                {cfg && (!cfg.address || !cfg.nas) && (
                  <p className="text-[10px] text-amber-500 mt-2 flex items-center gap-1"><AlertCircle size={10} /> Infos personnelles incomplètes</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab 2: Traitement de la paie — with manual hour editing
// ============================================================

function TabTraitement({ data, hrData, company, users, updateData, setNotification }: {
  data: PayrollData; hrData: HRData; company: PayrollCompany; users: CrmUser[];
  updateData: (fn: (prev: PayrollData) => PayrollData) => void;
  setNotification?: (n: { type: 'success' | 'error'; message: string } | null) => void;
}) {
  const year = new Date().getFullYear();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [computing, setComputing] = useState(false);
  const [hourOverrides, setHourOverrides] = useState<Record<string, { reg: number; supp: number }>>({});
  const [editingHours, setEditingHours] = useState<string | null>(null);

  const yearPeriods = data.periods.filter(p => p.companyId === company.id && p.startDate.startsWith(String(year)));
  const selectedPeriod = yearPeriods.find(p => p.id === selectedPeriodId);
  const periodStubs = selectedPeriod ? data.stubs.filter(s => s.periodId === selectedPeriod.id) : [];

  useEffect(() => {
    if (!selectedPeriodId && yearPeriods.length) {
      const today = new Date().toISOString().split("T")[0];
      const current = yearPeriods.find(p => p.startDate <= today && p.endDate >= today);
      setSelectedPeriodId(current?.id || yearPeriods[0].id);
    }
  }, [yearPeriods, selectedPeriodId]);

  // Init hour overrides from punches or existing stubs
  useEffect(() => {
    if (!selectedPeriod) return;
    const overrides: Record<string, { reg: number; supp: number }> = {};
    for (const u of users) {
      const existingStub = data.stubs.find(s => s.periodId === selectedPeriod.id && s.employeeId === u.id);
      if (existingStub) {
        overrides[u.id] = { reg: existingStub.heuresReg, supp: existingStub.heuresSupp };
      } else {
        const hours = calculatePeriodHours(hrData.presences, u.id, selectedPeriod.startDate, selectedPeriod.endDate);
        overrides[u.id] = { reg: hours.regularHours, supp: hours.overtimeHours };
      }
    }
    setHourOverrides(overrides);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriodId]);

  const handleGeneratePeriods = () => {
    const periods = generatePeriods(company, year);
    updateData(prev => ({
      ...prev,
      periods: [...prev.periods.filter(p => !p.startDate.startsWith(String(year)) || p.companyId !== company.id), ...periods],
    }));
    setSelectedPeriodId(periods[0]?.id || "");
  };

  const handleCalculateAll = () => {
    if (!selectedPeriod) return;
    setComputing(true);
    setTimeout(() => {
      const newStubs: PayStub[] = [];
      const warnings: string[] = [];
      for (const u of users) {
        const cfg = data.employeeConfigs.find(c => c.employeeId === u.id);
        if (!cfg) continue;
        // Validate pay rate
        const rateError = validatePayRate(cfg.rate);
        if (rateError) {
          warnings.push(`${u.name}: ${rateError} Ignoring.`);
          continue;
        }
        const override = hourOverrides[u.id];
        const heuresReg = Math.max(0, override?.reg ?? 0);
        const heuresSupp = Math.max(0, override?.supp ?? 0);
        const ytd = getYTD(data.stubs, u.id, year, selectedPeriod.id);
        const input: CalculatePayStubInput = {
          employeeId: u.id,
          config: cfg,
          company,
          period: selectedPeriod,
          heuresReg,
          heuresSupp,
          ...ytd,
        };
        newStubs.push(calculatePayStub(input));
      }
      updateData(prev => ({
        ...prev,
        stubs: [...prev.stubs.filter(s => s.periodId !== selectedPeriod.id), ...newStubs],
      }));
      if (warnings.length > 0 && setNotification) {
        setNotification({ type: 'error', message: `Avertissements: ${warnings.join(' | ')}` });
      } else if (newStubs.length > 0 && setNotification) {
        setNotification({ type: 'success', message: `${newStubs.length} bulletin(s) calcule(s) avec succes.` });
      }
      setComputing(false);
    }, 300);
  };

  const handleSetStatus = (status: PayStatus) => {
    if (!selectedPeriod) return;
    updateData(prev => ({
      ...prev,
      periods: prev.periods.map(p => p.id === selectedPeriod.id ? { ...p, status } : p),
    }));
  };

  const updateHours = (employeeId: string, field: "reg" | "supp", value: number) => {
    // Validate: hours must be >= 0 and reasonable
    const sanitized = Math.max(0, value);
    const error = validateHours(sanitized);
    if (error && setNotification) {
      setNotification({ type: 'error', message: `${getUserName(employeeId)}: ${error}` });
      return;
    }
    setHourOverrides(prev => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], [field]: sanitized },
    }));
  };

  const resetHoursFromPunches = (employeeId: string) => {
    if (!selectedPeriod) return;
    const hours = calculatePeriodHours(hrData.presences, employeeId, selectedPeriod.startDate, selectedPeriod.endDate);
    setHourOverrides(prev => ({
      ...prev,
      [employeeId]: { reg: hours.regularHours, supp: hours.overtimeHours },
    }));
  };

  const totalBrut = periodStubs.reduce((a, s) => a + s.salaireBrut, 0);
  const totalDed = periodStubs.reduce((a, s) => a + s.totalDeductions, 0);
  const totalNet = periodStubs.reduce((a, s) => a + s.salaireNet, 0);

  return (
    <div className="space-y-6">
      {/* Period controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Période de paie</h3>
            {yearPeriods.length > 0 ? (
              <select value={selectedPeriodId} onChange={e => setSelectedPeriodId(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
                {yearPeriods.map(p => (
                  <option key={p.id} value={p.id}>#{p.periodNumber} — {p.startDate} au {p.endDate}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-400">Aucune période pour {year}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {yearPeriods.length === 0 && (
              <button onClick={handleGeneratePeriods}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ background: NAVY }}>
                <Plus size={14} className="inline mr-1" /> Générer périodes {year}
              </button>
            )}
            {selectedPeriod && (
              <>
                <button onClick={handleCalculateAll} disabled={computing}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-1.5" style={{ background: GOLD }}>
                  {computing ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />}
                  Calculer tout
                </button>
                {selectedPeriod.status === "brouillon" && periodStubs.length > 0 && (
                  <button onClick={() => handleSetStatus("approuve")}
                    className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
                    Approuver
                  </button>
                )}
                {selectedPeriod.status === "approuve" && (
                  <button onClick={() => handleSetStatus("traite")}
                    className="px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100">
                    Traiter
                  </button>
                )}
                {selectedPeriod.status === "traite" && (
                  <button onClick={() => handleSetStatus("paye")}
                    className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100">
                    <CheckCircle2 size={14} className="inline mr-1" /> Marquer payé
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {selectedPeriod && (
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            <span>Statut: <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selectedPeriod.status]}`}>{STATUS_LABELS[selectedPeriod.status]}</span></span>
            <span>Date de paie: {selectedPeriod.payDate}</span>
            <span>{periodStubs.length} bulletin(s)</span>
          </div>
        )}
      </div>

      {/* Summary */}
      {periodStubs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-600">Brut total</p>
            <p className="text-lg font-bold text-blue-800">{fmt(totalBrut)}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-xs text-red-600">Déductions</p>
            <p className="text-lg font-bold text-red-800">{fmt(totalDed)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-xs text-green-600">Net à verser</p>
            <p className="text-lg font-bold text-green-800">{fmt(totalNet)}</p>
          </div>
        </div>
      )}

      {/* Info banner for manual hours */}
      {selectedPeriod && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <Pencil size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            Les heures sont pré-remplies depuis les punchs. Cliquez sur le <strong>crayon</strong> pour modifier manuellement les heures d&apos;un employé avant de calculer.
          </p>
        </div>
      )}

      {/* Employee grid with editable hours */}
      {data.employeeConfigs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500 mb-1">Aucun employe configure pour la paie.</p>
          <p className="text-xs text-gray-400">Allez dans l&apos;onglet Registre pour configurer les employes.</p>
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Employé</th>
                <th className="text-right px-3 py-3 font-medium text-gray-600">H. rég.</th>
                <th className="text-right px-3 py-3 font-medium text-gray-600">H. supp.</th>
                <th className="text-center px-2 py-3 font-medium text-gray-600 w-10"></th>
                <th className="text-right px-3 py-3 font-medium text-gray-600">Brut</th>
                <th className="text-right px-3 py-3 font-medium text-gray-600">RRQ</th>
                <th className="text-right px-3 py-3 font-medium text-gray-600">AE</th>
                <th className="text-right px-3 py-3 font-medium text-gray-600">RQAP</th>
                <th className="text-right px-3 py-3 font-medium text-gray-600">Imp. Fed.</th>
                <th className="text-right px-3 py-3 font-medium text-gray-600">Imp. QC</th>
                <th className="text-right px-3 py-3 font-medium text-gray-600 bg-green-50">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => {
                const stub = periodStubs.find(s => s.employeeId === u.id);
                const cfg = data.employeeConfigs.find(c => c.employeeId === u.id);
                const override = hourOverrides[u.id] || { reg: 0, supp: 0 };
                const isEditing = editingHours === u.id;

                if (!cfg) return (
                  <tr key={u.id} className="text-gray-400">
                    <td className="px-4 py-3">{u.name} <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Non configuré</span></td>
                    <td colSpan={10} className="px-3 py-3 text-center text-xs">Configurez l&apos;employé dans l&apos;onglet Registre</td>
                  </tr>
                );

                return (
                  <tr key={u.id} className={`hover:bg-gray-50 ${isEditing ? "bg-amber-50/50" : ""}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div>
                        <p>{u.name}</p>
                        <p className="text-[10px] text-gray-400">{cfg.poste || "—"}</p>
                      </div>
                    </td>
                    {isEditing ? (
                      <>
                        <td className="text-right px-2 py-2">
                          <input type="number" step="0.25" min="0" className="w-16 px-2 py-1 text-right border border-amber-300 rounded text-sm bg-white focus:ring-1 focus:ring-amber-400 outline-none"
                            value={override.reg} onChange={e => updateHours(u.id, "reg", parseFloat(e.target.value) || 0)} />
                        </td>
                        <td className="text-right px-2 py-2">
                          <input type="number" step="0.25" min="0" className="w-16 px-2 py-1 text-right border border-amber-300 rounded text-sm bg-white focus:ring-1 focus:ring-amber-400 outline-none"
                            value={override.supp} onChange={e => updateHours(u.id, "supp", parseFloat(e.target.value) || 0)} />
                        </td>
                        <td className="text-center px-1 py-2">
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => setEditingHours(null)} className="p-1 rounded hover:bg-green-100 text-green-600" title="Confirmer"><Save size={13} /></button>
                            <button onClick={() => resetHoursFromPunches(u.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400" title="Réinitialiser depuis punchs"><Clock size={12} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="text-right px-3 py-3">{fmtH(stub?.heuresReg ?? override.reg)}</td>
                        <td className="text-right px-3 py-3">{(stub?.heuresSupp ?? override.supp) > 0 ? <span className="text-amber-600 font-medium">{fmtH(stub?.heuresSupp ?? override.supp)}</span> : "—"}</td>
                        <td className="text-center px-1 py-3">
                          <button onClick={() => setEditingHours(u.id)} className="p-1 rounded hover:bg-amber-50 text-gray-300 hover:text-amber-500 transition-colors" title="Modifier heures">
                            <Pencil size={12} />
                          </button>
                        </td>
                      </>
                    )}
                    {stub ? (
                      <>
                        <td className="text-right px-3 py-3 font-medium">{fmt(stub.salaireBrut)}</td>
                        <td className="text-right px-3 py-3 text-red-600">{fmt(stub.rrq)}</td>
                        <td className="text-right px-3 py-3 text-red-600">{fmt(stub.ae)}</td>
                        <td className="text-right px-3 py-3 text-red-600">{fmt(stub.rqap)}</td>
                        <td className="text-right px-3 py-3 text-red-600">{fmt(stub.impotFederal)}</td>
                        <td className="text-right px-3 py-3 text-red-600">{fmt(stub.impotProvincial)}</td>
                        <td className="text-right px-3 py-3 font-bold text-green-700 bg-green-50">{fmt(stub.salaireNet)}</td>
                      </>
                    ) : (
                      <td colSpan={7} className="px-3 py-3 text-center text-xs text-gray-400">Cliquer &quot;Calculer tout&quot;</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab 3: Bulletins de paie
// ============================================================

function TabBulletins({ data, users, company }: {
  data: PayrollData; users: CrmUser[]; company: PayrollCompany;
}) {
  const [viewStub, setViewStub] = useState<PayStub | null>(null);
  const sortedStubs = [...data.stubs].sort((a, b) => b.payDate.localeCompare(a.payDate));

  if (viewStub) {
    const cfg = data.employeeConfigs.find(c => c.employeeId === viewStub.employeeId);
    return (
      <div className="space-y-4">
        <button onClick={() => setViewStub(null)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          ← Retour à la liste
        </button>
        <PayStubView stub={viewStub} company={company} config={cfg} allStubs={data.stubs} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{sortedStubs.length} bulletin(s) de paie</h3>
      </div>
      {sortedStubs.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <FileText size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun bulletin généré. Lancez un traitement de paie d&apos;abord.</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 text-gray-600">Employé</th>
              <th className="text-left px-3 py-2 text-gray-600">Période</th>
              <th className="text-right px-3 py-2 text-gray-600">Brut</th>
              <th className="text-right px-3 py-2 text-gray-600">Déductions</th>
              <th className="text-right px-3 py-2 text-gray-600">Net</th>
              <th className="text-center px-3 py-2 text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedStubs.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium">{getUserName(s.employeeId)}</td>
                <td className="px-3 py-2.5 text-gray-500">{s.periodStart} au {s.periodEnd}</td>
                <td className="text-right px-3 py-2.5">{fmt(s.salaireBrut)}</td>
                <td className="text-right px-3 py-2.5 text-red-600">{fmt(s.totalDeductions)}</td>
                <td className="text-right px-3 py-2.5 font-bold text-green-700">{fmt(s.salaireNet)}</td>
                <td className="text-center px-3 py-2.5">
                  <button onClick={() => setViewStub(s)} className="text-gray-400 hover:text-gray-700" title="Voir"><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ============================================================
// Pay Stub View — PREMIUM — Employee info, no employer contributions
// ============================================================

function PayStubView({ stub, company, config, allStubs }: {
  stub: PayStub; company: PayrollCompany; config?: EmployeePayConfig; allStubs: PayStub[];
}) {
  const year = stub.periodStart.substring(0, 4);
  const empYearStubs = allStubs
    .filter(s => s.employeeId === stub.employeeId && s.periodStart.startsWith(year) && s.payDate <= stub.payDate);
  const annualBrut = empYearStubs.reduce((a, s) => a + s.salaireBrut, 0);
  const annualNet = empYearStubs.reduce((a, s) => a + s.salaireNet, 0);
  const annualRrq = empYearStubs.reduce((a, s) => a + s.rrq + s.rrq2, 0);
  const annualAe = empYearStubs.reduce((a, s) => a + s.ae, 0);
  const annualRqap = empYearStubs.reduce((a, s) => a + s.rqap, 0);
  const annualImpFed = empYearStubs.reduce((a, s) => a + s.impotFederal, 0);
  const annualImpProv = empYearStubs.reduce((a, s) => a + s.impotProvincial, 0);
  const annualVacances = empYearStubs.reduce((a, s) => a + s.vacances, 0);

  const deductionLines = [
    { label: "RRQ — Régime de rentes du Québec", current: stub.rrq + stub.rrq2, annual: annualRrq },
    { label: "AE — Assurance-emploi", current: stub.ae, annual: annualAe },
    { label: "RQAP — Régime québécois d'assurance parentale", current: stub.rqap, annual: annualRqap },
    { label: "Impôt fédéral", current: stub.impotFederal, annual: annualImpFed },
    { label: "Impôt provincial (Québec)", current: stub.impotProvincial, annual: annualImpProv },
    { label: `Vacances (${config?.vacationRate || 4}%)`, current: stub.vacances, annual: annualVacances },
    ...stub.customDeductions.map(d => {
      const annualCustom = empYearStubs.reduce((a, s) => a + (s.customDeductions.find(cd => cd.name === d.name)?.amount || 0), 0);
      return { label: d.name, current: d.amount, annual: annualCustom };
    }),
  ].filter(d => d.current > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-3xl mx-auto print:border-none print:shadow-none print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b-2" style={{ borderColor: NAVY }}>
        <div>
          <h2 className="text-lg font-bold" style={{ color: NAVY }}>{company.name}</h2>
          <p className="text-xs text-gray-500">{company.address}, {company.city} {company.province} {company.postalCode}</p>
          {company.neq && <p className="text-xs text-gray-400">NEQ: {company.neq}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold" style={{ color: GOLD }}>BULLETIN DE PAIE</p>
          <p className="text-xs text-gray-500">Période: {stub.periodStart} au {stub.periodEnd}</p>
          <p className="text-xs text-gray-500">Date de paie: {stub.payDate}</p>
        </div>
      </div>

      {/* Employee Info — with personal details */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-bold text-gray-900">{getUserName(stub.employeeId)}</p>
            {config?.poste && <p className="text-xs text-gray-500 mt-0.5">{config.poste}{config.departement ? ` — ${config.departement}` : ""}</p>}
            {config?.address && (
              <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                <MapPin size={10} className="mt-0.5 shrink-0" />
                {config.address}{config.city ? `, ${config.city}` : ""}{config.postalCode ? ` ${config.postalCode}` : ""}
              </p>
            )}
            {config?.nas && (
              <p className="text-xs text-gray-400 mt-0.5">NAS: {maskNAS(config.nas)}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Rémunération</p>
            {config && (
              <p className="text-sm font-semibold text-gray-700">
                {config.payType === "salaire" ? `${fmt(config.rate)} / an` : `${fmt(config.rate)} / heure`}
              </p>
            )}
            {config?.dateEmbauche && <p className="text-[10px] text-gray-400 mt-0.5">Embauche: {config.dateEmbauche}</p>}
          </div>
        </div>
      </div>

      {/* Earnings */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Revenus</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Heures régulières ({fmtH(stub.heuresReg)})</span>
            <span className="font-medium">{fmt(stub.salaireBrut - (stub.heuresSupp > 0 ? stub.heuresSupp * (stub.salaireBrut / (stub.heuresReg + stub.heuresSupp * 1.5)) * 1.5 : 0))}</span>
          </div>
          {stub.heuresSupp > 0 && (
            <div className="flex justify-between text-sm text-amber-700">
              <span>Heures supplémentaires ({fmtH(stub.heuresSupp)} x 1.5)</span>
              <span className="font-medium">{fmt(stub.heuresSupp * (stub.salaireBrut / (stub.heuresReg + stub.heuresSupp * 1.5)) * 1.5)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-200">
            <span>Salaire brut</span><span>{fmt(stub.salaireBrut)}</span>
          </div>
        </div>
      </div>

      {/* Deductions — Current + Annual columns */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Détail des retenues</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-gray-400 uppercase tracking-wider">
              <th className="text-left pb-1 font-medium">Retenue</th>
              <th className="text-right pb-1 font-medium">Période</th>
              <th className="text-right pb-1 font-medium">Cumulatif annuel</th>
            </tr>
          </thead>
          <tbody>
            {deductionLines.map(d => (
              <tr key={d.label} className="border-t border-gray-50">
                <td className="py-1.5 text-gray-700">{d.label}</td>
                <td className="py-1.5 text-right text-red-700 font-medium">-{fmt(d.current)}</td>
                <td className="py-1.5 text-right text-gray-500">{fmt(d.annual)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-200 font-bold text-red-800">
              <td className="py-2">Total retenues</td>
              <td className="py-2 text-right">-{fmt(stub.totalDeductions)}</td>
              <td className="py-2 text-right text-gray-600">{fmt(empYearStubs.reduce((a, s) => a + s.totalDeductions, 0))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net */}
      <div className="p-4 rounded-xl mb-6" style={{ background: `${NAVY}10` }}>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-base font-bold" style={{ color: NAVY }}>SALAIRE NET</span>
            <p className="text-[10px] text-gray-400">Montant versé à l&apos;employé</p>
          </div>
          <span className="text-2xl font-bold" style={{ color: NAVY }}>{fmt(stub.salaireNet)}</span>
        </div>
      </div>

      {/* YTD Summary */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cumulatif annuel ({year})</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="rounded-lg px-3 py-2 bg-blue-50 text-blue-800">
            <p className="opacity-60 text-[10px]">Brut</p>
            <p className="font-bold text-sm">{fmt(annualBrut)}</p>
          </div>
          <div className="rounded-lg px-3 py-2 bg-red-50 text-red-800">
            <p className="opacity-60 text-[10px]">Retenues totales</p>
            <p className="font-bold text-sm">{fmt(empYearStubs.reduce((a, s) => a + s.totalDeductions, 0))}</p>
          </div>
          <div className="rounded-lg px-3 py-2 bg-green-50 text-green-800">
            <p className="opacity-60 text-[10px]">Net versé</p>
            <p className="font-bold text-sm">{fmt(annualNet)}</p>
          </div>
          <div className="rounded-lg px-3 py-2 bg-gray-50 text-gray-800">
            <p className="opacity-60 text-[10px]">Périodes traitées</p>
            <p className="font-bold text-sm">{empYearStubs.length}</p>
          </div>
        </div>
      </div>

      {/* No employer contributions — note */}
      <div className="text-[10px] text-gray-300 border-t border-gray-100 pt-3 italic">
        Ce bulletin reflète uniquement les retenues de l&apos;employé. Les contributions de l&apos;employeur sont disponibles dans le rapport administratif.
      </div>

      {/* Print button */}
      <div className="mt-4 flex justify-end print:hidden">
        <button onClick={() => window.print()} className="px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2" style={{ background: NAVY }}>
          <Printer size={14} /> Imprimer
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Tab 4: Registre employés — with personal info
// ============================================================

function TabRegistre({ data, hrData, users, updateData }: {
  data: PayrollData; hrData: HRData; users: CrmUser[];
  updateData: (fn: (prev: PayrollData) => PayrollData) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [showCompany, setShowCompany] = useState(false);
  const company = data.companies[0];

  const saveConfig = (cfg: EmployeePayConfig) => {
    updateData(prev => ({
      ...prev,
      employeeConfigs: prev.employeeConfigs.some(c => c.employeeId === cfg.employeeId)
        ? prev.employeeConfigs.map(c => c.employeeId === cfg.employeeId ? cfg : c)
        : [...prev.employeeConfigs, cfg],
    }));
    setEditId(null);
  };

  const saveCompany = (co: PayrollCompany) => {
    updateData(prev => ({
      ...prev,
      companies: prev.companies.map(c => c.id === co.id ? co : c),
    }));
    setShowCompany(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200">
        <button onClick={() => setShowCompany(!showCompany)}
          className="w-full flex items-center justify-between p-4 text-left">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-900">{company.name}</span>
            <span className="text-xs text-gray-400">NEQ: {company.neq || "—"}</span>
          </div>
          {showCompany ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </button>
        {showCompany && (
          <CompanyForm company={company} onSave={saveCompany} onCancel={() => setShowCompany(false)} />
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Configuration paie & infos personnelles</h3>
          <p className="text-xs text-gray-400 mt-0.5">Adresse, poste, salaire, déductions, NAS — toutes les informations de l&apos;employé</p>
        </div>
        <div className="divide-y divide-gray-100">
          {users.length === 0 && (
            <div className="p-12 text-center">
              <Users size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">Aucun employe actif dans le systeme.</p>
              <p className="text-xs text-gray-400 mt-1">Ajoutez des employes via le module RH pour configurer la paie.</p>
            </div>
          )}
          {users.map(u => {
            const cfg = data.employeeConfigs.find(c => c.employeeId === u.id);
            const hr = hrData.profiles[u.id];
            const isEditing = editId === u.id;

            if (isEditing) {
              return <EmployeeConfigForm key={u.id} user={u} config={cfg} hr={hr} companyId={company.id} onSave={saveConfig} onCancel={() => setEditId(null)} />;
            }

            return (
              <div key={u.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={{ background: NAVY }}>
                      {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {cfg?.poste || hr?.poste || "Poste non défini"}{cfg?.departement ? ` — ${cfg.departement}` : ""}
                      </p>
                      {cfg ? (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px]">
                          <span className="text-gray-500">
                            <strong className="text-gray-700">{cfg.payType === "salaire" ? "Salarié" : "Horaire"}</strong> — {fmt(cfg.rate)}{cfg.payType === "salaire" ? "/an" : "/h"}
                          </span>
                          <span className="text-gray-400">Vacances {cfg.vacationRate}%</span>
                          {cfg.address && (
                            <span className="text-gray-400 flex items-center gap-0.5"><MapPin size={9} /> {cfg.city || cfg.address}</span>
                          )}
                          {cfg.nas && (
                            <span className="text-gray-400">NAS: {maskNAS(cfg.nas)}</span>
                          )}
                          {cfg.dateEmbauche && (
                            <span className="text-gray-400">Embauche: {cfg.dateEmbauche}</span>
                          )}
                          {cfg.customDeductions.length > 0 && (
                            <span className="text-purple-500">{cfg.customDeductions.length} déduction(s) perso.</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> Non configuré</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setEditId(u.id)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 shrink-0 mt-1">
                    {cfg ? "Modifier" : "Configurer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CompanyForm({ company, onSave, onCancel }: {
  company: PayrollCompany; onSave: (c: PayrollCompany) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(company);
  return (
    <div className="p-4 border-t border-gray-100 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label className="text-xs text-gray-500 mb-0.5 block">Nom</label><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="text-xs text-gray-500 mb-0.5 block">NEQ</label><input className={inputCls} value={form.neq} onChange={e => setForm({ ...form, neq: e.target.value })} /></div>
        <div><label className="text-xs text-gray-500 mb-0.5 block">Adresse</label><input className={inputCls} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
        <div><label className="text-xs text-gray-500 mb-0.5 block">Ville</label><input className={inputCls} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
        <div><label className="text-xs text-gray-500 mb-0.5 block">Taux CNESST (%)</label><input type="number" step="0.01" className={inputCls} value={form.cnesstRate} onChange={e => setForm({ ...form, cnesstRate: parseFloat(e.target.value) || 0 })} /></div>
        <div><label className="text-xs text-gray-500 mb-0.5 block">Taux FSS (%)</label><input type="number" step="0.01" className={inputCls} value={form.fssRate} onChange={e => setForm({ ...form, fssRate: parseFloat(e.target.value) || 0 })} /></div>
        <div><label className="text-xs text-gray-500 mb-0.5 block">Taux CNT (%)</label><input type="number" step="0.001" className={inputCls} value={form.cntRate} onChange={e => setForm({ ...form, cntRate: parseFloat(e.target.value) || 0 })} /></div>
        <div><label className="text-xs text-gray-500 mb-0.5 block">Fréquence paie</label>
          <select className={inputCls} value={form.payFrequency} onChange={e => setForm({ ...form, payFrequency: e.target.value as FrequencePaie })}>
            {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">Annuler</button>
        <button onClick={() => onSave(form)} className="px-4 py-1.5 text-sm text-white rounded-lg" style={{ background: NAVY }}>Sauvegarder</button>
      </div>
    </div>
  );
}

function EmployeeConfigForm({ user, config, hr, companyId, onSave, onCancel }: {
  user: CrmUser; config?: EmployeePayConfig; hr?: HRProfile; companyId: string;
  onSave: (c: EmployeePayConfig) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<EmployeePayConfig>(config || {
    employeeId: user.id,
    companyId,
    payType: hr?.salaire && parseFloat(hr.salaire) > 0 ? "salaire" : "horaire",
    rate: hr?.salaire ? parseFloat(hr.salaire) || 0 : (hr?.tauxHoraire ? parseFloat(hr.tauxHoraire) || 20 : 20),
    td1Federal: FEDERAL_BASIC_PERSONAL,
    tp1015Provincial: QC_BASIC_PERSONAL,
    vacationRate: 4,
    customDeductions: [],
    poste: hr?.poste || "",
    departement: hr?.departement || "",
    address: "",
    city: "",
    postalCode: "",
    nas: "",
    dateEmbauche: "",
  });

  const [configErrors, setConfigErrors] = useState<string[]>([]);

  const addDeduction = () => setForm({ ...form, customDeductions: [...form.customDeductions, { name: "", amount: 0, type: "fixed" }] });
  const removeDeduction = (i: number) => setForm({ ...form, customDeductions: form.customDeductions.filter((_, idx) => idx !== i) });

  const handleSave = () => {
    const errors: string[] = [];
    if (form.rate <= 0) errors.push("Le taux de remuneration doit etre superieur a 0.");
    if (form.vacationRate < 0) errors.push("Le taux de vacances ne peut pas etre negatif.");
    if (form.td1Federal < 0) errors.push("Le credit TD1 federal ne peut pas etre negatif.");
    if (form.tp1015Provincial < 0) errors.push("Le credit TP-1015.3 provincial ne peut pas etre negatif.");
    if (errors.length > 0) {
      setConfigErrors(errors);
      return;
    }
    setConfigErrors([]);
    onSave(form);
  };

  return (
    <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: NAVY }}>
          {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <p className="text-sm font-bold text-gray-900">{user.name}</p>
      </div>

      {/* Informations personnelles */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <MapPin size={11} /> Informations personnelles
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><label className="text-xs text-gray-500 mb-0.5 block">Poste</label>
            <input className={inputCls} value={form.poste} onChange={e => setForm({ ...form, poste: e.target.value })} placeholder="ex: Développeur, Coordonnateur..." />
          </div>
          <div><label className="text-xs text-gray-500 mb-0.5 block">Département</label>
            <input className={inputCls} value={form.departement} onChange={e => setForm({ ...form, departement: e.target.value })} placeholder="ex: TI, RH, Admin..." />
          </div>
          <div><label className="text-xs text-gray-500 mb-0.5 block">NAS (No. assurance sociale)</label>
            <input className={inputCls} value={form.nas} onChange={e => setForm({ ...form, nas: e.target.value })} placeholder="XXX-XXX-XXX" maxLength={11} />
          </div>
          <div><label className="text-xs text-gray-500 mb-0.5 block">Adresse</label>
            <input className={inputCls} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 rue Principale" />
          </div>
          <div><label className="text-xs text-gray-500 mb-0.5 block">Ville</label>
            <input className={inputCls} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Montréal" />
          </div>
          <div><label className="text-xs text-gray-500 mb-0.5 block">Code postal</label>
            <input className={inputCls} value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} placeholder="H2X 1Y4" maxLength={7} />
          </div>
          <div><label className="text-xs text-gray-500 mb-0.5 block">Date d&apos;embauche</label>
            <input type="date" className={inputCls} value={form.dateEmbauche} onChange={e => setForm({ ...form, dateEmbauche: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Rémunération */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <DollarSign size={11} /> Rémunération
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><label className="text-xs text-gray-500 mb-0.5 block">Type</label>
            <select className={inputCls} value={form.payType} onChange={e => setForm({ ...form, payType: e.target.value as "salaire" | "horaire" })}>
              <option value="salaire">Salarié (annuel)</option>
              <option value="horaire">Horaire</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-0.5 block">{form.payType === "salaire" ? "Salaire annuel ($)" : "Taux horaire ($)"}</label>
            <input type="number" step="0.01" className={inputCls} value={form.rate} onChange={e => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })} />
          </div>
          <div><label className="text-xs text-gray-500 mb-0.5 block">Vacances (%)</label>
            <select className={inputCls} value={form.vacationRate} onChange={e => setForm({ ...form, vacationRate: parseFloat(e.target.value) })}>
              <option value={4}>4% (standard)</option>
              <option value={6}>6% (5+ ans)</option>
              <option value={8}>8% (personnalisé)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Crédits fiscaux */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Calculator size={11} /> Crédits fiscaux
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500 mb-0.5 block">Montant TD1 fédéral ($)</label>
            <input type="number" className={inputCls} value={form.td1Federal} onChange={e => setForm({ ...form, td1Federal: parseFloat(e.target.value) || 0 })} />
            <p className="text-[10px] text-gray-300 mt-0.5">Base 2025: {fmt(FEDERAL_BASIC_PERSONAL)}</p>
          </div>
          <div><label className="text-xs text-gray-500 mb-0.5 block">Montant TP-1015.3 QC ($)</label>
            <input type="number" className={inputCls} value={form.tp1015Provincial} onChange={e => setForm({ ...form, tp1015Provincial: parseFloat(e.target.value) || 0 })} />
            <p className="text-[10px] text-gray-300 mt-0.5">Base 2025: {fmt(QC_BASIC_PERSONAL)}</p>
          </div>
        </div>
      </div>

      {/* Custom deductions */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Déductions personnalisées</p>
        {form.customDeductions.length > 0 && (
          <div className="space-y-2 mb-2">
            {form.customDeductions.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={inputCls} placeholder="Nom (ex: REER, Syndicat...)" value={d.name} onChange={e => {
                  const deds = [...form.customDeductions]; deds[i] = { ...deds[i], name: e.target.value }; setForm({ ...form, customDeductions: deds });
                }} />
                <input type="number" step="0.01" className={`${inputCls} w-24`} value={d.amount} onChange={e => {
                  const deds = [...form.customDeductions]; deds[i] = { ...deds[i], amount: parseFloat(e.target.value) || 0 }; setForm({ ...form, customDeductions: deds });
                }} />
                <select className={`${inputCls} w-24`} value={d.type} onChange={e => {
                  const deds = [...form.customDeductions]; deds[i] = { ...deds[i], type: e.target.value as "fixed" | "percent" }; setForm({ ...form, customDeductions: deds });
                }}>
                  <option value="fixed">$</option><option value="percent">%</option>
                </select>
                <button onClick={() => removeDeduction(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
        <button onClick={addDeduction} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"><Plus size={12} /> Ajouter déduction</button>
      </div>

      {/* Validation errors */}
      {configErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <ul className="list-disc list-inside text-sm text-red-600 space-y-0.5">
            {configErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Annuler</button>
        <button onClick={handleSave} className="px-5 py-2 text-sm text-white rounded-lg font-medium" style={{ background: NAVY }}>
          <Save size={14} className="inline mr-1" /> Sauvegarder
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Tab 5: Rapports
// ============================================================

function TabRapports({ data, hrData, users, company }: {
  data: PayrollData; hrData: HRData; users: CrmUser[]; company: PayrollCompany;
}) {
  const [report, setReport] = useState<"journal" | "retenues" | "heures" | "employeur">("journal");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const year = new Date().getFullYear();
  const yearPeriods = data.periods.filter(p => p.startDate.startsWith(String(year)));

  useEffect(() => {
    if (!selectedPeriodId && yearPeriods.length) setSelectedPeriodId(yearPeriods[0].id);
  }, [yearPeriods, selectedPeriodId]);

  const periodStubs = data.stubs.filter(s => s.periodId === selectedPeriodId);

  const exportCSV = (rows: string[][], filename: string) => {
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const reports = [
    { id: "journal" as const, label: "Journal de paie", icon: FileText },
    { id: "retenues" as const, label: "Sommaire retenues", icon: Calculator },
    { id: "heures" as const, label: "Registre heures", icon: Clock },
    { id: "employeur" as const, label: "Coût employeur", icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {reports.map(r => (
            <button key={r.id} onClick={() => setReport(r.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${report === r.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
              <r.icon size={13} /> {r.label}
            </button>
          ))}
        </div>
        <select value={selectedPeriodId} onChange={e => setSelectedPeriodId(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
          {yearPeriods.map(p => <option key={p.id} value={p.id}>#{p.periodNumber} — {p.startDate} au {p.endDate}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {report === "journal" && (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-sm font-semibold">Journal de paie</h3>
              <button onClick={() => exportCSV(
                [["Employe", "Brut", "RRQ", "AE", "RQAP", "Impot Fed", "Impot QC", "Net"],
                ...periodStubs.map(s => [getUserName(s.employeeId), String(s.salaireBrut), String(s.rrq), String(s.ae), String(s.rqap), String(s.impotFederal), String(s.impotProvincial), String(s.salaireNet)])],
                `journal-paie-${selectedPeriodId}.csv`
              )} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"><Download size={12} /> CSV</button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="text-left px-4 py-2">Employé</th>
                <th className="text-right px-3 py-2">Brut</th><th className="text-right px-3 py-2">Déductions</th>
                <th className="text-right px-3 py-2">Net</th>
              </tr></thead>
              <tbody className="divide-y">
                {periodStubs.map(s => (
                  <tr key={s.id}><td className="px-4 py-2">{getUserName(s.employeeId)}</td>
                  <td className="text-right px-3 py-2">{fmt(s.salaireBrut)}</td>
                  <td className="text-right px-3 py-2 text-red-600">{fmt(s.totalDeductions)}</td>
                  <td className="text-right px-3 py-2 font-bold text-green-700">{fmt(s.salaireNet)}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {report === "retenues" && (
          <>
            <div className="p-4 border-b"><h3 className="text-sm font-semibold">Sommaire des retenues</h3></div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "RRQ total", value: periodStubs.reduce((a, s) => a + s.rrq + s.rrq2, 0) },
                { label: "AE total", value: periodStubs.reduce((a, s) => a + s.ae, 0) },
                { label: "RQAP total", value: periodStubs.reduce((a, s) => a + s.rqap, 0) },
                { label: "Impôt fédéral", value: periodStubs.reduce((a, s) => a + s.impotFederal, 0) },
                { label: "Impôt Québec", value: periodStubs.reduce((a, s) => a + s.impotProvincial, 0) },
                { label: "Vacances", value: periodStubs.reduce((a, s) => a + s.vacances, 0) },
              ].map(d => (
                <div key={d.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{d.label}</p>
                  <p className="text-lg font-bold text-gray-900">{fmt(d.value)}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {report === "heures" && (
          <>
            <div className="p-4 border-b"><h3 className="text-sm font-semibold">Registre des heures</h3></div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="text-left px-4 py-2">Employé</th>
                <th className="text-right px-3 py-2">Jours</th>
                <th className="text-right px-3 py-2">H. rég.</th>
                <th className="text-right px-3 py-2">H. supp.</th>
                <th className="text-right px-3 py-2">Total</th>
                <th className="text-right px-3 py-2">Manquants</th>
              </tr></thead>
              <tbody className="divide-y">
                {users.map(u => {
                  const p = yearPeriods.find(p => p.id === selectedPeriodId);
                  if (!p) return null;
                  const h = calculatePeriodHours(hrData.presences, u.id, p.startDate, p.endDate);
                  return (
                    <tr key={u.id}><td className="px-4 py-2">{u.name}</td>
                    <td className="text-right px-3 py-2">{h.totalDays}</td>
                    <td className="text-right px-3 py-2">{fmtH(h.regularHours)}</td>
                    <td className="text-right px-3 py-2">{h.overtimeHours > 0 ? <span className="text-amber-600">{fmtH(h.overtimeHours)}</span> : "—"}</td>
                    <td className="text-right px-3 py-2 font-medium">{fmtH(h.regularHours + h.overtimeHours)}</td>
                    <td className="text-right px-3 py-2">{h.missingPunches > 0 ? <span className="text-red-600">{h.missingPunches}</span> : "—"}</td></tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {report === "employeur" && (
          <>
            <div className="p-4 border-b"><h3 className="text-sm font-semibold">Coût employeur total</h3></div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="text-left px-4 py-2">Employé</th>
                <th className="text-right px-3 py-2">RRQ ER</th>
                <th className="text-right px-3 py-2">AE ER</th>
                <th className="text-right px-3 py-2">RQAP ER</th>
                <th className="text-right px-3 py-2">CNESST</th>
                <th className="text-right px-3 py-2">FSS</th>
                <th className="text-right px-3 py-2">CNT</th>
                <th className="text-right px-3 py-2 font-semibold">Total</th>
              </tr></thead>
              <tbody className="divide-y">
                {periodStubs.map(s => (
                  <tr key={s.id}><td className="px-4 py-2">{getUserName(s.employeeId)}</td>
                  <td className="text-right px-3 py-2">{fmt(s.rrqEmployeur)}</td>
                  <td className="text-right px-3 py-2">{fmt(s.aeEmployeur)}</td>
                  <td className="text-right px-3 py-2">{fmt(s.rqapEmployeur)}</td>
                  <td className="text-right px-3 py-2">{fmt(s.cnesst)}</td>
                  <td className="text-right px-3 py-2">{fmt(s.fss)}</td>
                  <td className="text-right px-3 py-2">{fmt(s.cnt)}</td>
                  <td className="text-right px-3 py-2 font-bold">{fmt(s.coutEmployeurTotal)}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {periodStubs.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune donnée pour cette période. Lancez un traitement de paie.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Tab 6: Fin d'année T4 / RL-1
// ============================================================

function TabFinAnnee({ data, users, company }: {
  data: PayrollData; users: CrmUser[]; company: PayrollCompany;
}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [viewType, setViewType] = useState<"t4" | "rl1" | null>(null);
  const [viewEmployee, setViewEmployee] = useState<string | null>(null);

  const yearStubs = data.stubs.filter(s => s.periodStart.startsWith(String(year)));
  const employeesWithStubs = [...new Set(yearStubs.map(s => s.employeeId))];

  if (viewType && viewEmployee) {
    const formData = viewType === "t4"
      ? generateT4(data.stubs, viewEmployee, year)
      : generateRL1(data.stubs, viewEmployee, year);
    const cfg = data.employeeConfigs.find(c => c.employeeId === viewEmployee);
    return (
      <div className="space-y-4">
        <button onClick={() => { setViewType(null); setViewEmployee(null); }} className="text-sm text-gray-500 hover:text-gray-700">← Retour</button>
        {viewType === "t4"
          ? <T4View data={formData as T4Data} company={company} employeeName={getUserName(viewEmployee)} config={cfg} />
          : <RL1View data={formData as RL1Data} company={company} employeeName={getUserName(viewEmployee)} config={cfg} />
        }
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h3 className="text-sm font-semibold text-gray-900">Formulaires de fin d&apos;année</h3>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {employeesWithStubs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <FileCheck size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun bulletin pour {year}. Traitez la paie d&apos;abord.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-4 py-3">Employé</th>
              <th className="text-right px-3 py-3">Revenus bruts</th>
              <th className="text-right px-3 py-3">Périodes</th>
              <th className="text-center px-3 py-3">T4 (Fédéral)</th>
              <th className="text-center px-3 py-3">RL-1 (Québec)</th>
            </tr></thead>
            <tbody className="divide-y">
              {employeesWithStubs.map(eId => {
                const eStubs = yearStubs.filter(s => s.employeeId === eId);
                const totalBrut = eStubs.reduce((a, s) => a + s.salaireBrut, 0);
                return (
                  <tr key={eId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{getUserName(eId)}</td>
                    <td className="text-right px-3 py-3">{fmt(totalBrut)}</td>
                    <td className="text-right px-3 py-3 text-gray-500">{eStubs.length}</td>
                    <td className="text-center px-3 py-3">
                      <button onClick={() => { setViewType("t4"); setViewEmployee(eId); }}
                        className="px-3 py-1 text-xs font-medium rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50">
                        Voir T4
                      </button>
                    </td>
                    <td className="text-center px-3 py-3">
                      <button onClick={() => { setViewType("rl1"); setViewEmployee(eId); }}
                        className="px-3 py-1 text-xs font-medium rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50">
                        Voir RL-1
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {employeesWithStubs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Sommaire {year}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Revenus bruts totaux", value: yearStubs.reduce((a, s) => a + s.salaireBrut, 0) },
              { label: "RRQ total (EE+ER)", value: yearStubs.reduce((a, s) => a + s.rrq + s.rrq2 + s.rrqEmployeur, 0) },
              { label: "AE total (EE+ER)", value: yearStubs.reduce((a, s) => a + s.ae + s.aeEmployeur, 0) },
              { label: "Impôts retenus", value: yearStubs.reduce((a, s) => a + s.impotFederal + s.impotProvincial, 0) },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500">{s.label}</p>
                <p className="text-lg font-bold text-gray-900">{fmt(s.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function T4View({ data, company, employeeName, config }: { data: T4Data; company: PayrollCompany; employeeName: string; config?: EmployeePayConfig }) {
  const boxes: { box: string; label: string; value: number }[] = [
    { box: "14", label: "Revenus d'emploi", value: data.box14 },
    { box: "16", label: "Cotisations de l'employé au RPC/RRQ", value: data.box16 },
    { box: "18", label: "Cotisations de l'employé à l'AE", value: data.box18 },
    { box: "22", label: "Impôt sur le revenu retenu", value: data.box22 },
    { box: "24", label: "Gains assurables d'AE", value: data.box24 },
    { box: "26", label: "Gains ouvrant droit à pension RPC/RRQ", value: data.box26 },
    { box: "52", label: "Cotisations de l'employé au RPC/RRQ2", value: data.box52 },
    { box: "55", label: "Cotisations au RPAP/RQAP", value: data.box55 },
    { box: "56", label: "Gains assurables du RPAP/RQAP", value: data.box56 },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl mx-auto print:border-none">
      <div className="text-center mb-6 pb-4 border-b-2 border-blue-600">
        <h2 className="text-lg font-bold text-blue-800">T4 — État de la rémunération payée</h2>
        <p className="text-xs text-gray-500">Agence du revenu du Canada &middot; Année {data.year}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400">Employeur</p>
          <p className="font-medium">{company.name}</p>
          <p className="text-xs text-gray-500">NEQ: {company.neq}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400">Employe</p>
          <p className="font-medium">{employeeName}</p>
          {config?.nas && <p className="text-xs text-gray-400">NAS: {config.nas}</p>}
          {config?.address && <p className="text-xs text-gray-400">{config.address}, {config.city} {config.postalCode}</p>}
        </div>
      </div>
      <div className="space-y-2">
        {boxes.filter(b => b.value > 0).map(b => (
          <div key={b.box} className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{b.box}</span>
              <span className="text-sm text-gray-700">{b.label}</span>
            </div>
            <span className="text-sm font-bold">{fmt(b.value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end print:hidden">
        <button onClick={() => window.print()} className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-2 bg-blue-700"><Printer size={14} /> Imprimer T4</button>
      </div>
    </div>
  );
}

function RL1View({ data, company, employeeName, config }: { data: RL1Data; company: PayrollCompany; employeeName: string; config?: EmployeePayConfig }) {
  const cases: { code: string; label: string; value: number }[] = [
    { code: "A", label: "Revenus d'emploi", value: data.caseA },
    { code: "B", label: "Cotisation au RRQ", value: data.caseB },
    { code: "C", label: "Cotisation à l'assurance-emploi", value: data.caseC },
    { code: "D", label: "Impôt du Québec retenu", value: data.caseD },
    { code: "E", label: "Impôt fédéral retenu", value: data.caseE },
    { code: "G", label: "Cotisation au RQAP", value: data.caseG },
    { code: "I", label: "Salaire admissible au RRQ", value: data.caseI },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl mx-auto print:border-none">
      <div className="text-center mb-6 pb-4 border-b-2 border-purple-600">
        <h2 className="text-lg font-bold text-purple-800">RL-1 — Revenus d&apos;emploi et revenus divers</h2>
        <p className="text-xs text-gray-500">Revenu Québec &middot; Année {data.year}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400">Employeur</p>
          <p className="font-medium">{company.name}</p>
          <p className="text-xs text-gray-500">NEQ: {company.neq}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400">Employe</p>
          <p className="font-medium">{employeeName}</p>
          {config?.nas && <p className="text-xs text-gray-400">NAS: {config.nas}</p>}
          {config?.address && <p className="text-xs text-gray-400">{config.address}, {config.city} {config.postalCode}</p>}
        </div>
      </div>
      <div className="space-y-2">
        {cases.filter(c => c.value > 0).map(c => (
          <div key={c.code} className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">{c.code}</span>
              <span className="text-sm text-gray-700">{c.label}</span>
            </div>
            <span className="text-sm font-bold">{fmt(c.value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end print:hidden">
        <button onClick={() => window.print()} className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-2 bg-purple-700"><Printer size={14} /> Imprimer RL-1</button>
      </div>
    </div>
  );
}
