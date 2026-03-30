// ========================================================
// SOS Hub Canada — Moteur de calcul paie Quebec 2025-2026
// Taux officiels: CRA, Revenu Quebec, CNESST
// ========================================================

// ============================================================
// Types
// ============================================================

export type FrequencePaie = 'hebdomadaire' | 'bi_hebdomadaire' | 'bimensuel' | 'mensuel';
export type PayStatus = 'brouillon' | 'approuve' | 'traite' | 'paye';

export interface PayrollCompany {
  id: string;
  name: string;
  neq: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  tpsNumber: string;
  tvqNumber: string;
  cnesstRate: number;
  fssRate: number;
  cntRate: number;
  payFrequency: FrequencePaie;
  active: boolean;
}

export interface CustomDeduction {
  name: string;
  amount: number;
  type: 'fixed' | 'percent';
}

export interface EmployeePayConfig {
  employeeId: string;
  companyId: string;
  payType: 'salaire' | 'horaire';
  rate: number;
  td1Federal: number;
  tp1015Provincial: number;
  vacationRate: number;
  customDeductions: CustomDeduction[];
  // Info personnelles employe
  poste: string;
  departement: string;
  address: string;
  city: string;
  postalCode: string;
  nas: string; // NAS/SIN masque (XXX-XXX-XXX)
  dateEmbauche: string;
}

export interface PayPeriod {
  id: string;
  companyId: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: PayStatus;
  periodNumber: number;
}

export interface PayStub {
  id: string;
  periodId: string;
  employeeId: string;
  companyId: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  // Heures
  heuresReg: number;
  heuresSupp: number;
  // Brut
  salaireBrut: number;
  // Deductions employe
  rrq: number;
  rrq2: number;
  ae: number;
  rqap: number;
  impotFederal: number;
  impotProvincial: number;
  vacances: number;
  customDeductions: { name: string; amount: number }[];
  totalDeductions: number;
  salaireNet: number;
  // Couts employeur
  rrqEmployeur: number;
  aeEmployeur: number;
  rqapEmployeur: number;
  cnesst: number;
  fss: number;
  cnt: number;
  coutEmployeurTotal: number;
  // YTD
  ytdBrut: number;
  ytdNet: number;
  ytdRrq: number;
  ytdAe: number;
  ytdRqap: number;
  ytdImpotFed: number;
  ytdImpotProv: number;
}

export interface T4Data {
  employeeId: string;
  year: number;
  box14: number; // Employment income
  box16: number; // Employee CPP/QPP
  box18: number; // Employee EI
  box22: number; // Income tax deducted
  box24: number; // EI insurable earnings
  box26: number; // CPP/QPP pensionable earnings
  box44: number; // Union dues
  box52: number; // CPP2/QPP2
  box55: number; // PPIP premiums (RQAP)
  box56: number; // PPIP insurable earnings
}

export interface RL1Data {
  employeeId: string;
  year: number;
  caseA: number; // Revenus d'emploi
  caseB: number; // Cotisation RRQ
  caseC: number; // Cotisation AE
  caseD: number; // Impot QC retenu
  caseE: number; // Impot fed retenu
  caseG: number; // Cotisation RQAP
  caseH: number; // Cotisation RPA
  caseI: number; // Salaire admissible RRQ
}

export interface PayrollData {
  companies: PayrollCompany[];
  employeeConfigs: EmployeePayConfig[];
  periods: PayPeriod[];
  stubs: PayStub[];
}

// ============================================================
// Constantes fiscales 2025-2026
// ============================================================

// -- Federal --
const FEDERAL_BRACKETS = [
  { min: 0, max: 57375, rate: 0.15 },
  { min: 57375, max: 114750, rate: 0.205 },
  { min: 114750, max: 158468, rate: 0.26 },
  { min: 158468, max: 220000, rate: 0.29 },
  { min: 220000, max: Infinity, rate: 0.33 },
];
export const FEDERAL_BASIC_PERSONAL = 16129;

// CPP/RPC
const CPP_RATE = 0.0595;
const CPP_MAX_PENSIONABLE = 71300;
const CPP_EXEMPTION = 3500;
const CPP_MAX_CONTRIBUTION = (CPP_MAX_PENSIONABLE - CPP_EXEMPTION) * CPP_RATE; // 4,034.10
// CPP2
const CPP2_RATE = 0.04;
const CPP2_MAX = 79400;
const CPP2_MAX_CONTRIBUTION = (CPP2_MAX - CPP_MAX_PENSIONABLE) * CPP2_RATE; // 324.00

// EI/AE
const EI_RATE = 0.0158;
const EI_MAX_INSURABLE = 65700;
const EI_MAX_CONTRIBUTION = EI_MAX_INSURABLE * EI_RATE; // 1,038.06
const EI_EMPLOYER_MULT = 1.4;

// Quebec abatement
const QC_ABATEMENT = 0.165;

// -- Quebec --
const QUEBEC_BRACKETS = [
  { min: 0, max: 51780, rate: 0.14 },
  { min: 51780, max: 103545, rate: 0.19 },
  { min: 103545, max: 126000, rate: 0.24 },
  { min: 126000, max: Infinity, rate: 0.2575 },
];
export const QC_BASIC_PERSONAL = 18056;

// RRQ/QPP (Quebec uses QPP not CPP)
const QPP_RATE = 0.064;
const QPP_MAX_PENSIONABLE = 71300;
const QPP_EXEMPTION = 3500;
const QPP_MAX_CONTRIBUTION = (QPP_MAX_PENSIONABLE - QPP_EXEMPTION) * QPP_RATE; // 4,339.20
// QPP2
const QPP2_RATE = 0.04;
const QPP2_MAX = 79400;
const QPP2_MAX_CONTRIBUTION = (QPP2_MAX - QPP_MAX_PENSIONABLE) * QPP2_RATE; // 324.00

// RQAP/QPIP
const QPIP_EMPLOYEE_RATE = 0.00494;
const QPIP_EMPLOYER_RATE = 0.00692;
const QPIP_MAX_INSURABLE = 94000;
const QPIP_MAX_EMPLOYEE = QPIP_MAX_INSURABLE * QPIP_EMPLOYEE_RATE; // 464.36

// Employer only
const DEFAULT_CNT_RATE = 0.0007;
const DEFAULT_FSS_RATE = 0.0165;

// ============================================================
// Helpers
// ============================================================

export function getPeriodsPerYear(freq: FrequencePaie): number {
  switch (freq) {
    case 'hebdomadaire': return 52;
    case 'bi_hebdomadaire': return 26;
    case 'bimensuel': return 24;
    case 'mensuel': return 12;
  }
}

function round2(n: number): number { return Math.round(n * 100) / 100; }

function calcBracketTax(income: number, brackets: { min: number; max: number; rate: number }[]): number {
  let tax = 0;
  for (const b of brackets) {
    if (income <= b.min) break;
    const taxable = Math.min(income, b.max) - b.min;
    tax += taxable * b.rate;
  }
  return tax;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ============================================================
// Calculateurs individuels
// ============================================================

export function calculateQPP(periodGross: number, periodsPerYear: number, ytdQPP: number): { employee: number; employer: number } {
  const annualPensionable = Math.min(periodGross * periodsPerYear, QPP_MAX_PENSIONABLE);
  const annualContrib = Math.max(0, (annualPensionable - QPP_EXEMPTION) * QPP_RATE);
  const maxRemaining = Math.max(0, QPP_MAX_CONTRIBUTION - ytdQPP);
  const periodContrib = round2(Math.min(annualContrib / periodsPerYear, maxRemaining));
  return { employee: periodContrib, employer: periodContrib };
}

export function calculateQPP2(periodGross: number, periodsPerYear: number, ytdQPP2: number): { employee: number; employer: number } {
  const annualGross = periodGross * periodsPerYear;
  if (annualGross <= QPP_MAX_PENSIONABLE) return { employee: 0, employer: 0 };
  const excess = Math.min(annualGross, QPP2_MAX) - QPP_MAX_PENSIONABLE;
  const annualContrib = excess * QPP2_RATE;
  const maxRemaining = Math.max(0, QPP2_MAX_CONTRIBUTION - ytdQPP2);
  const periodContrib = round2(Math.min(annualContrib / periodsPerYear, maxRemaining));
  return { employee: periodContrib, employer: periodContrib };
}

export function calculateEI(periodGross: number, periodsPerYear: number, ytdEI: number): { employee: number; employer: number } {
  const annualInsurable = Math.min(periodGross * periodsPerYear, EI_MAX_INSURABLE);
  const annualContrib = annualInsurable * EI_RATE;
  const maxRemaining = Math.max(0, EI_MAX_CONTRIBUTION - ytdEI);
  const periodContrib = round2(Math.min(annualContrib / periodsPerYear, maxRemaining));
  return { employee: periodContrib, employer: round2(periodContrib * EI_EMPLOYER_MULT) };
}

export function calculateQPIP(periodGross: number, periodsPerYear: number, ytdQPIP: number): { employee: number; employer: number } {
  const annualInsurable = Math.min(periodGross * periodsPerYear, QPIP_MAX_INSURABLE);
  const annualEE = annualInsurable * QPIP_EMPLOYEE_RATE;
  const annualER = annualInsurable * QPIP_EMPLOYER_RATE;
  const maxRemainingEE = Math.max(0, QPIP_MAX_EMPLOYEE - ytdQPIP);
  const periodEE = round2(Math.min(annualEE / periodsPerYear, maxRemainingEE));
  const periodER = round2(annualER / periodsPerYear);
  return { employee: periodEE, employer: periodER };
}

export function calculateFederalTax(annualTaxableIncome: number, td1Amount: number, periodsPerYear: number): number {
  if (annualTaxableIncome <= 0) return 0;
  const grossTax = calcBracketTax(annualTaxableIncome, FEDERAL_BRACKETS);
  const personalCredit = td1Amount * 0.15;
  let netTax = Math.max(0, grossTax - personalCredit);
  // Quebec abatement
  netTax = netTax * (1 - QC_ABATEMENT);
  return round2(Math.max(0, netTax) / periodsPerYear);
}

export function calculateQuebecTax(annualTaxableIncome: number, tp1015Amount: number, periodsPerYear: number): number {
  if (annualTaxableIncome <= 0) return 0;
  const grossTax = calcBracketTax(annualTaxableIncome, QUEBEC_BRACKETS);
  const personalCredit = tp1015Amount * 0.14;
  const netTax = Math.max(0, grossTax - personalCredit);
  return round2(netTax / periodsPerYear);
}

export function calculateEmployerCosts(periodGross: number, company: PayrollCompany): { cnesst: number; fss: number; cnt: number } {
  return {
    cnesst: round2(periodGross * (company.cnesstRate / 100)),
    fss: round2(periodGross * (company.fssRate / 100)),
    cnt: round2(periodGross * (company.cntRate / 100)),
  };
}

// ============================================================
// Orchestrateur principal
// ============================================================

export interface CalculatePayStubInput {
  employeeId: string;
  config: EmployeePayConfig;
  company: PayrollCompany;
  period: PayPeriod;
  heuresReg: number;
  heuresSupp: number;
  // YTD accumulators (from prior stubs in same year)
  ytdBrut: number;
  ytdRrq: number;
  ytdRrq2: number;
  ytdAe: number;
  ytdRqap: number;
  ytdImpotFed: number;
  ytdImpotProv: number;
  ytdNet: number;
}

export function calculatePayStub(input: CalculatePayStubInput): PayStub {
  const { config, company, period, heuresReg, heuresSupp } = input;
  const periodsPerYear = getPeriodsPerYear(company.payFrequency);

  // Brut
  let salaireBrut: number;
  if (config.payType === 'salaire') {
    salaireBrut = round2(config.rate / periodsPerYear);
  } else {
    salaireBrut = round2((heuresReg * config.rate) + (heuresSupp * config.rate * 1.5));
  }

  // Deductions employe
  const qpp = calculateQPP(salaireBrut, periodsPerYear, input.ytdRrq);
  const qpp2 = calculateQPP2(salaireBrut, periodsPerYear, input.ytdRrq2);
  const ei = calculateEI(salaireBrut, periodsPerYear, input.ytdAe);
  const qpip = calculateQPIP(salaireBrut, periodsPerYear, input.ytdRqap);

  // Revenu imposable annualise (brut - QPP - EI - QPIP)
  const annualTaxable = (salaireBrut - qpp.employee - qpp2.employee - ei.employee - qpip.employee) * periodsPerYear;

  const impotFederal = calculateFederalTax(annualTaxable, config.td1Federal, periodsPerYear);
  const impotProvincial = calculateQuebecTax(annualTaxable, config.tp1015Provincial, periodsPerYear);

  // Vacances
  const vacances = round2(salaireBrut * (config.vacationRate / 100));

  // Deductions personnalisees
  const customDeds = config.customDeductions.map(d => ({
    name: d.name,
    amount: round2(d.type === 'percent' ? salaireBrut * (d.amount / 100) : d.amount),
  }));
  const customTotal = customDeds.reduce((s, d) => s + d.amount, 0);

  const totalDeductions = round2(
    qpp.employee + qpp2.employee + ei.employee + qpip.employee +
    impotFederal + impotProvincial + vacances + customTotal
  );
  const salaireNet = round2(salaireBrut - totalDeductions);

  // Couts employeur
  const empCosts = calculateEmployerCosts(salaireBrut, company);
  const coutEmployeurTotal = round2(
    salaireBrut + qpp.employer + qpp2.employer + ei.employer + qpip.employer +
    empCosts.cnesst + empCosts.fss + empCosts.cnt
  );

  return {
    id: generateId(),
    periodId: period.id,
    employeeId: input.employeeId,
    companyId: company.id,
    periodStart: period.startDate,
    periodEnd: period.endDate,
    payDate: period.payDate,
    heuresReg,
    heuresSupp,
    salaireBrut,
    rrq: qpp.employee,
    rrq2: qpp2.employee,
    ae: ei.employee,
    rqap: qpip.employee,
    impotFederal,
    impotProvincial,
    vacances,
    customDeductions: customDeds,
    totalDeductions,
    salaireNet,
    rrqEmployeur: qpp.employer + qpp2.employer,
    aeEmployeur: ei.employer,
    rqapEmployeur: qpip.employer,
    cnesst: empCosts.cnesst,
    fss: empCosts.fss,
    cnt: empCosts.cnt,
    coutEmployeurTotal,
    ytdBrut: round2(input.ytdBrut + salaireBrut),
    ytdNet: round2(input.ytdNet + salaireNet),
    ytdRrq: round2(input.ytdRrq + qpp.employee + qpp2.employee),
    ytdAe: round2(input.ytdAe + ei.employee),
    ytdRqap: round2(input.ytdRqap + qpip.employee),
    ytdImpotFed: round2(input.ytdImpotFed + impotFederal),
    ytdImpotProv: round2(input.ytdImpotProv + impotProvincial),
  };
}

// ============================================================
// Generateurs T4 / RL-1
// ============================================================

export function generateT4(stubs: PayStub[], employeeId: string, year: number): T4Data {
  const yearStubs = stubs.filter(s => s.employeeId === employeeId && s.periodStart.startsWith(String(year)));
  const sum = (fn: (s: PayStub) => number) => round2(yearStubs.reduce((a, s) => a + fn(s), 0));
  return {
    employeeId,
    year,
    box14: sum(s => s.salaireBrut),
    box16: sum(s => s.rrq + s.rrq2),
    box18: sum(s => s.ae),
    box22: sum(s => s.impotFederal),
    box24: sum(s => s.salaireBrut), // EI insurable
    box26: sum(s => s.salaireBrut), // QPP pensionable
    box44: 0,
    box52: sum(s => s.rrq2),
    box55: sum(s => s.rqap),
    box56: sum(s => s.salaireBrut), // QPIP insurable
  };
}

export function generateRL1(stubs: PayStub[], employeeId: string, year: number): RL1Data {
  const yearStubs = stubs.filter(s => s.employeeId === employeeId && s.periodStart.startsWith(String(year)));
  const sum = (fn: (s: PayStub) => number) => round2(yearStubs.reduce((a, s) => a + fn(s), 0));
  return {
    employeeId,
    year,
    caseA: sum(s => s.salaireBrut),
    caseB: sum(s => s.rrq + s.rrq2),
    caseC: sum(s => s.ae),
    caseD: sum(s => s.impotProvincial),
    caseE: sum(s => s.impotFederal),
    caseG: sum(s => s.rqap),
    caseH: 0,
    caseI: sum(s => s.salaireBrut), // Salaire admissible RRQ
  };
}

// ============================================================
// Persistance localStorage
// ============================================================

const PAYROLL_STORAGE_KEY = 'soshub_payroll_data';

export function defaultCompany(): PayrollCompany {
  return {
    id: 'company-1',
    name: 'SOS Hub Canada Inc.',
    neq: '1179aborl33',
    address: '1275 avenue des Canadiens-de-Montreal',
    city: 'Montreal',
    province: 'QC',
    postalCode: 'H3B 0G4',
    tpsNumber: '',
    tvqNumber: '',
    cnesstRate: 1.65,
    fssRate: DEFAULT_FSS_RATE * 100,
    cntRate: DEFAULT_CNT_RATE * 100,
    payFrequency: 'bi_hebdomadaire',
    active: true,
  };
}

export function defaultPayrollData(): PayrollData {
  return {
    companies: [defaultCompany()],
    employeeConfigs: [],
    periods: [],
    stubs: [],
  };
}

export function loadPayrollData(): PayrollData {
  if (typeof window === 'undefined') return defaultPayrollData();
  try {
    const raw = localStorage.getItem(PAYROLL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PayrollData;
      if (!parsed.companies?.length) parsed.companies = [defaultCompany()];
      if (!parsed.employeeConfigs) parsed.employeeConfigs = [];
      if (!parsed.periods) parsed.periods = [];
      if (!parsed.stubs) parsed.stubs = [];
      return parsed;
    }
  } catch { /* ignore */ }
  return defaultPayrollData();
}

export function savePayrollData(data: PayrollData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ============================================================
// Calcul heures depuis presences
// ============================================================

export interface PresenceEntry {
  employeeId: string;
  date: string;
  statut: string;
  punchIn?: string;
  punchOut?: string;
  breakStart?: string;
  breakEnd?: string;
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function getISOWeek(dateStr: string): string {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${weekNum}`;
}

export function calculatePeriodHours(
  presences: PresenceEntry[], employeeId: string, startDate: string, endDate: string
): { regularHours: number; overtimeHours: number; totalDays: number; missingPunches: number } {
  const entries = presences.filter(p =>
    p.employeeId === employeeId && p.date >= startDate && p.date <= endDate
  );

  let totalMinutes = 0;
  let missingPunches = 0;
  const weeklyMinutes: Record<string, number> = {};

  for (const entry of entries) {
    if (!entry.punchIn || !entry.punchOut) {
      if (entry.punchIn && !entry.punchOut) missingPunches++;
      continue;
    }
    let mins = parseTime(entry.punchOut) - parseTime(entry.punchIn);
    if (entry.breakStart && entry.breakEnd) {
      mins -= parseTime(entry.breakEnd) - parseTime(entry.breakStart);
    }
    mins = Math.max(0, mins);
    totalMinutes += mins;
    const wk = getISOWeek(entry.date);
    weeklyMinutes[wk] = (weeklyMinutes[wk] || 0) + mins;
  }

  let overtimeMinutes = 0;
  for (const wk of Object.values(weeklyMinutes)) {
    if (wk > 2400) overtimeMinutes += wk - 2400; // >40h = OT
  }
  const regularMinutes = totalMinutes - overtimeMinutes;

  return {
    regularHours: round2(regularMinutes / 60),
    overtimeHours: round2(overtimeMinutes / 60),
    totalDays: entries.filter(e => e.punchIn && e.punchOut).length,
    missingPunches,
  };
}

// Get YTD totals for an employee
export function getYTD(stubs: PayStub[], employeeId: string, year: number, beforePeriodId?: string): {
  ytdBrut: number; ytdNet: number; ytdRrq: number; ytdRrq2: number;
  ytdAe: number; ytdRqap: number; ytdImpotFed: number; ytdImpotProv: number;
} {
  let yearStubs = stubs.filter(s => s.employeeId === employeeId && s.periodStart.startsWith(String(year)));
  if (beforePeriodId) {
    const idx = yearStubs.findIndex(s => s.periodId === beforePeriodId);
    if (idx >= 0) yearStubs = yearStubs.slice(0, idx);
  }
  const sum = (fn: (s: PayStub) => number) => round2(yearStubs.reduce((a, s) => a + fn(s), 0));
  return {
    ytdBrut: sum(s => s.salaireBrut),
    ytdNet: sum(s => s.salaireNet),
    ytdRrq: sum(s => s.rrq),
    ytdRrq2: sum(s => s.rrq2),
    ytdAe: sum(s => s.ae),
    ytdRqap: sum(s => s.rqap),
    ytdImpotFed: sum(s => s.impotFederal),
    ytdImpotProv: sum(s => s.impotProvincial),
  };
}
