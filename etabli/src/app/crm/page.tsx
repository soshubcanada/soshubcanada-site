"use client";
import { crmFetch } from '@/lib/crm-fetch';
import { useCrm, getUserName } from "@/lib/crm-store";
import { CASE_STATUS_LABELS, CASE_STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/crm-types";
import { IMMIGRATION_PROGRAMS } from "@/lib/crm-programs";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Users, FolderOpen, FileText, Calendar, AlertTriangle,
  Clock, ArrowRight, TrendingUp, DollarSign, Bell,
  Activity, CheckCircle2, BarChart3, RefreshCw, Loader2, ExternalLink,
  Mail, Send, Eye, ChevronDown,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  url: string;
  source: string;
  tag: string;
  tagColor: string;
}

export default function CrmDashboard() {
  const { currentUser, clients, cases, appointments, contracts } = useCrm();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);
  const [lastFetched, setLastFetched] = useState("");

  // Email tracking state
  interface EmailLog {
    id: string;
    clientId: string;
    clientName: string | null;
    toEmail: string;
    subject: string;
    type: string;
    sentBy: string;
    sentAt: string;
  }
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [emailsError, setEmailsError] = useState(false);
  const [emailsTotal, setEmailsTotal] = useState(0);
  const [emailFilter, setEmailFilter] = useState<string>("all");
  const [emailExpanded, setEmailExpanded] = useState<string | null>(null);

  const fetchNews = async () => {
    setNewsLoading(true);
    setNewsError(false);
    try {
      const res = await crmFetch("/api/crm/news");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setNews(data.news || []);
      setLastFetched(data.fetchedAt ? new Date(data.fetchedAt).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }) : "");
    } catch {
      setNewsError(true);
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchEmails = async () => {
    setEmailsLoading(true);
    setEmailsError(false);
    try {
      const url = emailFilter === "all" ? "/api/crm/emails?limit=30" : `/api/crm/emails?type=${emailFilter}&limit=30`;
      const res = await crmFetch(url);
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
        setEmailsTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Erreur chargement courriels:', err);
      setEmailsError(true);
    }
    setEmailsLoading(false);
  };

  useEffect(() => { fetchNews(); fetchEmails(); }, []);
  useEffect(() => { fetchEmails(); }, [emailFilter]);

  if (!currentUser) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#D4A03C]" />
        <p className="text-sm text-gray-500">Chargement du tableau de bord...</p>
      </div>
    </div>
  );

  const activeClients = clients.filter(c => c.status === 'actif').length;
  const openCases = cases.filter(c => !['ferme', 'approuve', 'refuse'].includes(c.status)).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === todayStr).length;
  const pendingContracts = contracts.filter(ct => ct.status === 'brouillon' || ct.status === 'envoye').length;

  // Revenus du mois courant
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const revenusMois = contracts.reduce((sum, ct) => {
    const ctDate = new Date(ct.createdAt);
    if (ctDate.getMonth() === currentMonth && ctDate.getFullYear() === currentYear) {
      return sum + (ct.grandTotal || 0);
    }
    return sum;
  }, 0);

  // Alertes documents
  const alertesDocuments = clients.reduce((acc, cl) => {
    return acc + cl.documents.filter(d => {
      if (!d.expiryDate) return false;
      const daysLeft = Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 30;
    }).length;
  }, 0);

  const stats = [
    { icon: Users, label: "Clients actifs", value: activeClients || 0, color: "text-blue-600 bg-blue-50", trend: `${clients.length || 0} total` },
    { icon: FolderOpen, label: "Dossiers actifs", value: openCases || 0, color: "text-emerald-600 bg-emerald-50", trend: `${cases.length || 0} total` },
    { icon: FileText, label: "Contrats en attente", value: pendingContracts || 0, color: "text-purple-600 bg-purple-50", trend: `${contracts.length || 0} total` },
    { icon: DollarSign, label: "Revenus du mois", value: `${(revenusMois || 0).toLocaleString('fr-CA')} $`, color: "text-amber-600 bg-amber-50", trend: new Date().toLocaleDateString('fr-CA', { month: 'long' }) },
    { icon: Calendar, label: "RDV aujourd'hui", value: todayAppts || 0, color: "text-indigo-600 bg-indigo-50", trend: todayStr },
    { icon: AlertTriangle, label: "Alertes documents", value: alertesDocuments || 0, color: "text-red-600 bg-red-50", trend: "expiration < 30j" },
  ];

  // Pipeline des dossiers
  const pipelineStatuses = ['nouveau', 'consultation', 'en_preparation', 'formulaires_remplis', 'revision', 'soumis', 'en_traitement_ircc'] as const;
  const pipeline = pipelineStatuses.map(s => ({
    status: s,
    label: CASE_STATUS_LABELS[s],
    count: cases.filter(c => c.status === s).length,
    color: CASE_STATUS_COLORS[s],
  }));
  const maxPipeline = Math.max(...pipeline.map(p => p.count), 1);

  // Revenus 6 derniers mois (pure CSS)
  const revenusParMois: { label: string; montant: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const mois = d.toLocaleDateString('fr-CA', { month: 'short' });
    const montant = contracts.reduce((sum, ct) => {
      const ctDate = new Date(ct.createdAt);
      if (ctDate.getMonth() === d.getMonth() && ctDate.getFullYear() === d.getFullYear()) {
        return sum + (ct.grandTotal || 0);
      }
      return sum;
    }, 0);
    revenusParMois.push({ label: mois, montant });
  }
  const maxRevenu = Math.max(...revenusParMois.map(r => r.montant), 1);

  // Alertes urgentes
  const urgentCases = cases.filter(c => c.priority === 'urgente' && !['ferme', 'approuve', 'refuse'].includes(c.status));
  const deadlineCases = cases.filter(c => {
    if (!c.deadline || ['ferme', 'approuve', 'refuse'].includes(c.status)) return false;
    const days = (new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 14;
  });
  const overdueCases = cases.filter(c => {
    if (!c.deadline || ['ferme', 'approuve', 'refuse'].includes(c.status)) return false;
    return new Date(c.deadline) < new Date();
  });

  // Activite recente (derniers evenements timeline)
  const recentActivity = cases
    .flatMap(c => c.timeline.map(t => ({ ...t, caseTitle: c.title, clientId: c.clientId })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  // Charge equipe
  const teamLoad = [
    ...new Set([
      ...cases.map(c => c.assignedTo),
      ...cases.filter(c => c.assignedLawyer).map(c => c.assignedLawyer),
    ]),
  ].filter(Boolean).map(userId => {
    const userCases = cases.filter(c => c.assignedTo === userId || c.assignedLawyer === userId);
    const activeCases = userCases.filter(c => !['ferme', 'approuve', 'refuse'].includes(c.status));
    return {
      userId: userId!,
      name: getUserName(userId!),
      total: userCases.length,
      active: activeCases.length,
      urgent: activeCases.filter(c => c.priority === 'urgente').length,
    };
  }).sort((a, b) => b.active - a.active);

  // Repartition par programme
  const parProgramme: Record<string, number> = {};
  cases.forEach(c => {
    const prog = IMMIGRATION_PROGRAMS.find(p => p.id === c.programId);
    const name = prog?.name ?? c.programId;
    parProgramme[name] = (parProgramme[name] || 0) + 1;
  });
  const topProgrammes = Object.entries(parProgramme).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxProg = Math.max(...topProgrammes.map(([, v]) => v), 1);

  return (
    <div className="space-y-6">
      {/* Banniere de bienvenue */}
      <div className="bg-gradient-to-r from-[#1B2559] to-[#242E6B] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Bonjour, {currentUser.name.split(' ')[0]}</h1>
        <p className="text-white/70 text-sm mt-1">
          {new Date().toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Row 1: 6 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
            <div className="text-[10px] text-gray-400 mt-2">{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Row 2: Pipeline Donut + Revenus Area Chart + Pie Revenus par programme */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline Donut Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#D4A03C]" />
            Pipeline dossiers
          </h2>
          {(() => {
            const approvedCount = cases.filter(c => c.status === 'approuve').length;
            const refusedCount = cases.filter(c => c.status === 'refuse').length;
            const donutData = [
              ...pipeline.filter(p => p.count > 0).map(p => ({ label: p.label, value: p.count, color: p.color })),
              ...(approvedCount > 0 ? [{ label: 'Approuvé', value: approvedCount, color: '#10B981' }] : []),
              ...(refusedCount > 0 ? [{ label: 'Refusé', value: refusedCount, color: '#EF4444' }] : []),
            ];
            const total = donutData.reduce((s, d) => s + d.value, 0) || 1;
            const cx = 80, cy = 80, r = 60, sw = 18;
            const circ = 2 * Math.PI * r;
            let offset = 0;
            return (
              <div className="flex flex-col items-center">
                <svg viewBox="0 0 160 160" width="160" height="160">
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={sw} />
                  {donutData.map((d, i) => {
                    const pct = d.value / total;
                    const dash = circ * pct;
                    const gap = circ - dash;
                    const rot = -90 + (offset / total) * 360;
                    offset += d.value;
                    return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={sw}
                      strokeDasharray={`${dash} ${gap}`} transform={`rotate(${rot} ${cx} ${cy})`}
                      style={{ transition: 'stroke-dasharray 0.6s ease' }} />;
                  })}
                  <text x={cx} y={cy - 6} textAnchor="middle" fontSize="24" fontWeight="900" fill="#1B2559">{cases.length}</text>
                  <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#94A3B8">dossiers</text>
                </svg>
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
                  {donutData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-[9px] text-gray-500">{d.label} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Revenus 6 mois — Area Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-[#D4A03C]" />
            Revenus — 6 mois
          </h2>
          {(() => {
            const w = 280, h = 140, padX = 30, padY = 10;
            const pts = revenusParMois.map((r, i) => ({
              x: padX + (i / Math.max(revenusParMois.length - 1, 1)) * (w - padX * 2),
              y: padY + (1 - (maxRevenu > 0 ? r.montant / maxRevenu : 0)) * (h - padY * 2),
              montant: r.montant, label: r.label,
            }));
            const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const areaPath = linePath + ` L${pts[pts.length - 1].x},${h - padY} L${pts[0].x},${h - padY} Z`;
            return (
              <div>
                <svg viewBox={`0 0 ${w} ${h + 20}`} width="100%" height="180">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4A03C" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#D4A03C" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                    const y = padY + (1 - pct) * (h - padY * 2);
                    return <line key={pct} x1={padX} y1={y} x2={w - padX} y2={y} stroke="#F1F5F9" strokeWidth="1" />;
                  })}
                  {/* Area */}
                  <path d={areaPath} fill="url(#areaGrad)" />
                  {/* Line */}
                  <path d={linePath} fill="none" stroke="#D4A03C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Points + labels */}
                  {pts.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="4" fill="#D4A03C" stroke="#FFF" strokeWidth="2" />
                      <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="8" fontWeight="700" fill="#1B2559">
                        {p.montant > 0 ? `${Math.round(p.montant / 1000)}k` : '0'}
                      </text>
                      <text x={p.x} y={h + 14} textAnchor="middle" fontSize="8" fill="#94A3B8" style={{ textTransform: 'capitalize' }}>
                        {p.label}
                      </text>
                    </g>
                  ))}
                </svg>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">Total 6 mois</span>
                  <span className="text-sm font-bold" style={{ color: '#1B2559' }}>
                    {revenusParMois.reduce((s, r) => s + r.montant, 0).toLocaleString('fr-CA')} $
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Pie Chart — Revenus par programme */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#D4A03C]" />
            Revenus par programme
          </h2>
          {(() => {
            const colors = ['#1B2559', '#D4A03C', '#059669', '#2563EB', '#7C3AED', '#EA580C', '#0891B2', '#DC2626'];
            // Revenue per program from contracts
            const revByProg: Record<string, number> = {};
            contracts.forEach(ct => {
              if (ct.grandTotal > 0) {
                const tier = ct.pricingTierId || '';
                const caseForContract = cases.find(c => c.id === ct.caseId);
                const prog = caseForContract ? IMMIGRATION_PROGRAMS.find(p => p.id === caseForContract.programId) : null;
                const name = prog?.name ?? tier ?? 'Autre';
                revByProg[name] = (revByProg[name] || 0) + ct.grandTotal;
              }
            });
            const sorted = Object.entries(revByProg).sort((a, b) => b[1] - a[1]).slice(0, 8);
            const totalRev = sorted.reduce((s, [, v]) => s + v, 0) || 1;
            const cx = 80, cy = 80, r = 65;
            const circ = 2 * Math.PI * r;
            let pieOffset = 0;
            return sorted.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Aucun revenu</div>
            ) : (
              <div className="flex flex-col items-center">
                <svg viewBox="0 0 160 160" width="150" height="150">
                  {sorted.map(([name, val], i) => {
                    const pct = val / totalRev;
                    const dash = circ * pct;
                    const gap = circ - dash;
                    const rot = -90 + (pieOffset / totalRev) * 360;
                    pieOffset += val;
                    return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={colors[i % colors.length]} strokeWidth="24"
                      strokeDasharray={`${dash} ${gap}`} transform={`rotate(${rot} ${cx} ${cy})`} />;
                  })}
                  <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="900" fill="#1B2559">
                    {Math.round(totalRev / 1000)}k $
                  </text>
                  <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#94A3B8">total</text>
                </svg>
                <div className="w-full mt-2 space-y-1">
                  {sorted.map(([name, val], i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                      <span className="text-[10px] text-gray-600 truncate flex-1">{name}</span>
                      <span className="text-[10px] font-bold text-gray-800">{val.toLocaleString('fr-CA')} $</span>
                      <span className="text-[9px] text-gray-400">{Math.round((val / totalRev) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Row 3: Alertes urgentes + Activite recente */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Alertes urgentes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            Alertes urgentes
            {(urgentCases.length + deadlineCases.length + overdueCases.length) > 0 && (
              <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {urgentCases.length + deadlineCases.length + overdueCases.length}
              </span>
            )}
          </h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {overdueCases.map(c => {
              const client = clients.find(cl => cl.id === c.clientId);
              const days = Math.abs(Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              return (
                <div key={`od-${c.id}`} className="flex items-center gap-3 p-2 rounded-lg bg-red-50 text-sm">
                  <span className="px-2 py-0.5 rounded bg-red-200 text-red-800 text-[10px] font-bold">RETARD</span>
                  <span className="text-gray-700 text-xs truncate flex-1">{c.title} — {client?.firstName} {client?.lastName}</span>
                  <span className="text-red-600 text-[10px] font-medium shrink-0">-{days}j</span>
                </div>
              );
            })}
            {urgentCases.map(c => {
              const client = clients.find(cl => cl.id === c.clientId);
              return (
                <div key={`urg-${c.id}`} className="flex items-center gap-3 p-2 rounded-lg bg-orange-50 text-sm">
                  <span className="px-2 py-0.5 rounded bg-orange-200 text-orange-800 text-[10px] font-bold">URGENT</span>
                  <span className="text-gray-700 text-xs truncate flex-1">{c.title} — {client?.firstName} {client?.lastName}</span>
                  {c.deadline && <span className="text-orange-600 text-[10px] shrink-0">{c.deadline}</span>}
                </div>
              );
            })}
            {deadlineCases.map(c => {
              const client = clients.find(cl => cl.id === c.clientId);
              const days = Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={`dl-${c.id}`} className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 text-sm">
                  <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                    <Clock size={10} />{days}j
                  </span>
                  <span className="text-gray-700 text-xs truncate flex-1">{c.title} — {client?.firstName} {client?.lastName}</span>
                </div>
              );
            })}
            {urgentCases.length === 0 && deadlineCases.length === 0 && overdueCases.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-green-400" />
                <p className="text-sm">Aucune alerte urgente</p>
              </div>
            )}
          </div>
        </div>

        {/* Activite recente */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-[#D4A03C]" />
            Activite recente
          </h2>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {recentActivity.map(ev => {
              const client = clients.find(cl => cl.id === ev.clientId);
              return (
                <div key={ev.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: '#D4A03C' }} />
                    <div className="w-px flex-1 bg-gray-200" />
                  </div>
                  <div className="pb-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] text-gray-400">{ev.date}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#EAEDF5', color: '#1B2559' }}>
                        {ev.caseTitle}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 truncate">{ev.description}</p>
                    <p className="text-[10px] text-gray-400">
                      {getUserName(ev.userId)} {client ? `— ${client.firstName} ${client.lastName}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
            {recentActivity.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Aucune activite recente</p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ SUIVI COURRIELS AUTOMATIQUES ═══ */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Mail size={18} className="text-[#D4A03C]" />
            Suivi des courriels
            {emailsTotal > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">{emailsTotal} envoyes</span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={emailFilter}
              onChange={e => setEmailFilter(e.target.value)}
              className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4A03C]"
            >
              <option value="all">Tous les types</option>
              <option value="scoring_results">Auto 23h (gratuit)</option>
              <option value="premium_report">Auto 23h (premium)</option>
              <option value="general">Manuels</option>
              <option value="contract">Contrats</option>
              <option value="appointment">RDV</option>
            </select>
            <button onClick={fetchEmails} disabled={emailsLoading}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50" title="Rafraichir">
              {emailsLoading ? <Loader2 size={14} className="animate-spin text-gray-400" /> : <RefreshCw size={14} className="text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Stats row */}
        {(() => {
          const autoGratuit = emails.filter(e => e.type === 'scoring_results').length;
          const autoPremium = emails.filter(e => e.type === 'premium_report').length;
          const manuels = emails.filter(e => e.type === 'general').length;
          const autres = emails.length - autoGratuit - autoPremium - manuels;
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-gradient-to-br from-[#D4A03C]/10 to-[#D4A03C]/5 rounded-lg p-3 border border-[#D4A03C]/20">
                <div className="text-lg font-bold text-[#D4A03C]">{autoGratuit}</div>
                <div className="text-[10px] text-[#D4A03C]/80 font-medium">Auto 23h (gratuit)</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-25 rounded-lg p-3 border border-purple-200">
                <div className="text-lg font-bold text-purple-700">{autoPremium}</div>
                <div className="text-[10px] text-purple-600 font-medium">Auto 23h (premium)</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-25 rounded-lg p-3 border border-blue-200">
                <div className="text-lg font-bold text-blue-700">{manuels}</div>
                <div className="text-[10px] text-blue-600 font-medium">Envois manuels</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-25 rounded-lg p-3 border border-gray-200">
                <div className="text-lg font-bold text-gray-700">{autres}</div>
                <div className="text-[10px] text-gray-500 font-medium">Autres (contrats, RDV)</div>
              </div>
            </div>
          );
        })()}

        {/* Email error banner */}
        {emailsError && (
          <div className="mb-3 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertTriangle size={16} className="shrink-0" />
            <span>Impossible de charger les courriels.</span>
            <button onClick={fetchEmails} className="ml-auto text-red-600 underline text-xs font-medium">Reessayer</button>
          </div>
        )}

        {/* Email list */}
        {emailsLoading && emails.length === 0 ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
                </div>
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Mail size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">Aucun courriel envoye</p>
            <p className="text-xs mt-1">Les courriels automatiques (23h) et manuels apparaitront ici</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {emails.map(email => {
              const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
                scoring_results: { label: 'Auto 23h', color: 'bg-[#D4A03C]/10 text-[#D4A03C] border-[#D4A03C]/20', icon: '⏰' },
                premium_report: { label: 'Premium', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '👑' },
                general: { label: 'Manuel', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '✉️' },
                contract: { label: 'Contrat', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '📄' },
                appointment: { label: 'RDV', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '📅' },
              };
              const config = typeConfig[email.type] || { label: email.type, color: 'bg-gray-100 text-gray-600 border-gray-200', icon: '📧' };
              const isAuto = email.sentBy === 'system_auto' || email.type === 'scoring_results' || email.type === 'premium_report';
              const sentDate = new Date(email.sentAt);
              const isExpanded = emailExpanded === email.id;

              return (
                <div key={email.id}
                  className={`rounded-lg border transition-all ${isExpanded ? 'border-[#D4A03C]/30 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                  <button onClick={() => setEmailExpanded(isExpanded ? null : email.id)}
                    className="w-full flex items-center gap-3 p-3 text-left">
                    {/* Status icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${isAuto ? 'bg-[#D4A03C]/10' : 'bg-blue-50'}`}>
                      {config.icon}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-900 truncate">{email.clientName || email.toEmail}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${config.color}`}>{config.label}</span>
                        {isAuto && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-0.5">
                            <CheckCircle2 size={8} /> Envoye
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate mt-0.5">{email.subject}</div>
                    </div>
                    {/* Date */}
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-gray-400">{sentDate.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })}</div>
                      <div className="text-[10px] text-gray-300">{sentDate.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <ChevronDown size={14} className={`text-gray-300 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 pb-3 border-t border-gray-100 pt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <span className="text-gray-400">Destinataire</span>
                          <div className="font-medium text-gray-700">{email.toEmail}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <span className="text-gray-400">Envoye par</span>
                          <div className="font-medium text-gray-700">{isAuto ? 'Systeme automatique' : email.sentBy || 'Manuel'}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <span className="text-gray-400">Type</span>
                          <div className="font-medium text-gray-700">{config.label}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <span className="text-gray-400">Date exacte</span>
                          <div className="font-medium text-gray-700">{sentDate.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-xs">
                        <span className="text-gray-400">Sujet</span>
                        <div className="font-medium text-gray-700 mt-0.5">{email.subject}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            Courriels auto envoyes 23h apres inscription (gratuit) et 23h apres achat (premium)
          </span>
          <Link href="/crm/marketing" className="inline-flex items-center gap-1 text-xs text-[#D4A03C] hover:underline font-medium">
            Module marketing <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Row 4: Charge equipe + Repartition par programme */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Charge equipe */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} className="text-[#1B2559]" />
            Charge de l&apos;equipe
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ backgroundColor: '#EAEDF5' }}>
                  <th className="text-left p-2 text-xs font-semibold" style={{ color: '#1B2559' }}>Membre</th>
                  <th className="text-center p-2 text-xs font-semibold" style={{ color: '#1B2559' }}>Actifs</th>
                  <th className="text-center p-2 text-xs font-semibold" style={{ color: '#1B2559' }}>Total</th>
                  <th className="text-center p-2 text-xs font-semibold" style={{ color: '#1B2559' }}>Urgents</th>
                </tr>
              </thead>
              <tbody>
                {teamLoad.map(t => (
                  <tr key={t.userId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-2 text-xs font-medium text-gray-800">{t.name}</td>
                    <td className="p-2 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">{t.active}</span>
                    </td>
                    <td className="p-2 text-center text-xs text-gray-600">{t.total}</td>
                    <td className="p-2 text-center">
                      {t.urgent > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">{t.urgent}</span>
                      ) : (
                        <span className="text-xs text-gray-300">0</span>
                      )}
                    </td>
                  </tr>
                ))}
                {teamLoad.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-4 text-xs text-gray-400">Aucune donnee</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Repartition par programme — Premium bars */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#D4A03C]" />
            Dossiers par programme
          </h2>
          {(() => {
            const progColors = ['#1B2559', '#D4A03C', '#059669', '#2563EB', '#7C3AED', '#EA580C'];
            return (
              <div className="space-y-3">
                {topProgrammes.map(([name, count], i) => {
                  const pct = maxProg > 0 ? (count / maxProg) * 100 : 0;
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-700 font-medium truncate max-w-[70%]" title={name}>{name}</span>
                        <span className="text-xs font-bold" style={{ color: progColors[i % progColors.length] }}>{count}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%`, backgroundColor: progColors[i % progColors.length] }} />
                      </div>
                    </div>
                  );
                })}
                {topProgrammes.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Aucun dossier</p>
                )}
              </div>
            );
          })()}
          {Object.keys(parProgramme).length > 6 && (
            <Link href="/crm/rapports" className="inline-flex items-center gap-1 mt-3 text-xs text-[#D4A03C] hover:underline">
              Voir tous les programmes <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>

      {/* ═══ VOLET NEWS — IRCC & MIFI (LIVE FEED) ═══ */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Bell size={18} className="text-[#D4A03C]" />
            Nouvelles IRCC &amp; Quebec
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700">LIVE</span>
          </h2>
          <div className="flex items-center gap-2">
            {lastFetched && <span className="text-[10px] text-gray-400">Maj : {lastFetched}</span>}
            <button onClick={fetchNews} disabled={newsLoading}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50" title="Rafraichir">
              {newsLoading ? <Loader2 size={14} className="animate-spin text-gray-400" /> : <RefreshCw size={14} className="text-gray-400" />}
            </button>
          </div>
        </div>

        {newsError && (
          <div className="text-center py-6 text-gray-400">
            <AlertTriangle size={24} className="mx-auto mb-2 text-amber-400" />
            <p className="text-sm">Impossible de charger les nouvelles. <button onClick={fetchNews} className="text-[#D4A03C] underline">Reessayer</button></p>
          </div>
        )}

        {newsLoading && news.length === 0 && !newsError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="p-4 rounded-lg border border-gray-100 animate-pulse">
                <div className="flex gap-2 mb-3"><div className="h-4 w-12 bg-gray-200 rounded-full" /><div className="h-3 w-16 bg-gray-100 rounded" /></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-3 w-3/4 bg-gray-100 rounded mb-1" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {news.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.slice(0, 6).map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                className="block p-4 rounded-lg border border-gray-100 hover:border-[#D4A03C] hover:shadow-md transition-all group">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.tagColor}`}>{item.tag}</span>
                  <span className="text-[10px] text-gray-400">{item.date}</span>
                </div>
                <h3 className="text-sm font-bold text-[#1B2559] mb-1 group-hover:text-[#D4A03C] transition-colors leading-tight line-clamp-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.summary}</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-[#D4A03C] font-medium">
                  Lire plus <ExternalLink size={10} />
                </span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            Sources : IRCC (canada.ca) &amp; MIFI (quebec.ca) — Mise a jour auto toutes les 30 min
          </span>
          <a href="https://www.canada.ca/fr/immigration-refugies-citoyennete/nouvelles.html" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#D4A03C] hover:underline font-medium">
            Toutes les nouvelles IRCC <ArrowRight size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
