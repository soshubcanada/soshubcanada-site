"use client";
import { useCrm, DEMO_USERS } from "@/lib/crm-store";
import {
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  ROLE_PERMISSIONS,
} from "@/lib/crm-types";
import type { CrmUser } from "@/lib/crm-types";
import { IMMIGRATION_PROGRAMS, PROGRAM_CATEGORIES } from "@/lib/crm-programs";
import { BarChart3, Users, FolderOpen, TrendingUp, DollarSign, ShieldX, Download, Printer, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const BOM = '\uFEFF';
  const headerLine = headers.join(';');
  const body = rows.map(r => r.map(cell => `"${(cell ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
  const csv = BOM + headerLine + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RapportsPage() {
  const { currentUser, clients, cases, contracts } = useCrm();
  const [users, setUsers] = useState<CrmUser[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const svc = await import("@/lib/crm-data-service");
        const fetched = await svc.fetchUsers();
        if (!cancelled && fetched.length > 0) setUsers(fetched);
      } catch (e) {
        console.error("Erreur chargement utilisateurs:", e);
        if (!cancelled) setLoadError("Impossible de charger les utilisateurs depuis le serveur. Utilisation des donnees locales.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Use fetched users if available, otherwise fall back to DEMO_USERS
  const activeUsers = users.length > 0 ? users : DEMO_USERS;

  if (!currentUser) return null;
  const perms = ROLE_PERMISSIONS[currentUser.role];

  if (!perms.canViewReports) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="p-4 rounded-full bg-red-50 mb-4">
          <ShieldX className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acces refuse</h1>
        <p className="text-gray-500">
          Vous n&apos;avez pas la permission de consulter les rapports et statistiques.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B2559] mb-4" />
        <p className="text-gray-500 text-sm">Chargement des rapports...</p>
      </div>
    );
  }

  // Date range filter (use proper Date objects for comparison)
  const filteredCases = cases.filter(c => {
    if (!c.createdAt) return true;
    const cDate = new Date(c.createdAt).getTime();
    if (dateFrom && cDate < new Date(dateFrom).getTime()) return false;
    if (dateTo && cDate > new Date(dateTo + "T23:59:59").getTime()) return false;
    return true;
  });

  const filteredContracts = contracts.filter(ct => {
    if (!ct.createdAt) return true;
    const ctDate = new Date(ct.createdAt).getTime();
    if (dateFrom && ctDate < new Date(dateFrom).getTime()) return false;
    if (dateTo && ctDate > new Date(dateTo + "T23:59:59").getTime()) return false;
    return true;
  });

  // --- Calculs KPI ---
  const totalClients = clients.length;
  const dossiersOuverts = filteredCases.filter(
    (c) => !["approuve", "refuse", "ferme"].includes(c.status)
  ).length;

  const approuves = filteredCases.filter((c) => c.status === "approuve").length;
  const refuses = filteredCases.filter((c) => c.status === "refuse").length;
  const tauxApprobation =
    approuves + refuses > 0
      ? Math.round((approuves / (approuves + refuses)) * 100)
      : 0;

  // Taux de conversion (prospect -> dossier actif)
  const prospects = clients.filter(c => c.status === 'prospect').length;
  const clientsAvecDossier = new Set(filteredCases.map(c => c.clientId)).size;
  const tauxConversion = totalClients > 0 ? Math.round((clientsAvecDossier / totalClients) * 100) : 0;

  // Delai moyen de traitement (creation -> approbation)
  const completedCases = filteredCases.filter(c => c.status === 'approuve' && c.createdAt);
  const avgDelay = completedCases.length > 0
    ? Math.round(completedCases.reduce((sum, c) => {
        const created = new Date(c.createdAt).getTime();
        const updated = new Date(c.updatedAt).getTime();
        return sum + (updated - created) / (1000 * 60 * 60 * 24);
      }, 0) / completedCases.length)
    : 0;

  // Calculate revenue from actual contracts when available, fallback to program catalog fees
  const revenusEstimesRaw = filteredContracts && filteredContracts.length > 0
    ? filteredContracts.reduce((sum, ct) => sum + (ct.grandTotal || 0), 0)
    : filteredCases.reduce((sum, c) => {
        const prog = IMMIGRATION_PROGRAMS.find((p) => p.id === c.programId);
        if (!prog) return sum;
        return sum + (prog.fees.service || 0);
      }, 0);
  const revenusEstimes = isNaN(revenusEstimesRaw) ? 0 : revenusEstimesRaw;

  // --- Dossiers par programme ---
  const parProgramme: Record<string, number> = {};
  filteredCases.forEach((c) => {
    const prog = IMMIGRATION_PROGRAMS.find((p) => p.id === c.programId);
    const name = prog?.name ?? c.programId;
    parProgramme[name] = (parProgramme[name] || 0) + 1;
  });
  const maxProgramme = Math.max(...Object.values(parProgramme), 1);

  // Top 5 programmes
  const top5Programmes = Object.entries(parProgramme).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Revenus par programme
  const revenusParProgramme: Record<string, number> = {};
  filteredCases.forEach(c => {
    const prog = IMMIGRATION_PROGRAMS.find(p => p.id === c.programId);
    const name = prog?.name ?? c.programId;
    const contract = contracts.find(ct => ct.caseId === c.id);
    const rev = contract ? contract.grandTotal : (prog?.fees.service ?? 0);
    revenusParProgramme[name] = (revenusParProgramme[name] || 0) + rev;
  });

  // --- Pipeline (funnel par statut) ---
  const statusOrder = [
    "nouveau",
    "consultation",
    "en_preparation",
    "formulaires_remplis",
    "revision",
    "soumis",
    "en_traitement_ircc",
    "approuve",
    "refuse",
    "appel",
    "ferme",
  ] as const;
  const pipeline = statusOrder.map((s) => ({
    status: s,
    label: CASE_STATUS_LABELS[s],
    colors: CASE_STATUS_COLORS[s],
    count: filteredCases.filter((c) => c.status === s).length,
  }));
  const maxPipeline = Math.max(...pipeline.map((p) => p.count), 1);

  // --- Repartition par categorie ---
  const parCategorie: Record<string, number> = {};
  filteredCases.forEach((c) => {
    const prog = IMMIGRATION_PROGRAMS.find((p) => p.id === c.programId);
    const catKey = prog?.category ?? "autre";
    const catLabel = PROGRAM_CATEGORIES[catKey] ?? catKey;
    parCategorie[catLabel] = (parCategorie[catLabel] || 0) + 1;
  });

  // --- Performance par conseiller ---
  const conseillerStats = activeUsers.map((u) => {
    const userCases = filteredCases.filter(
      (c) => c.assignedTo === u.id || c.assignedLawyer === u.id
    );
    const userClients = new Set(userCases.map((c) => c.clientId)).size;
    const userApproved = userCases.filter((c) => c.status === "approuve").length;
    const userRefused = userCases.filter((c) => c.status === "refuse").length;
    const userOpen = userCases.filter(
      (c) => !["approuve", "refuse", "ferme"].includes(c.status)
    ).length;
    return {
      user: u,
      totalCases: userCases.length,
      clients: userClients,
      approved: userApproved,
      refused: userRefused,
      open: userOpen,
    };
  });

  const kpis = [
    { label: "Total clients", value: totalClients, icon: Users, color: "#1B2559" },
    { label: "Dossiers ouverts", value: dossiersOuverts, icon: FolderOpen, color: "#D4A03C" },
    { label: "Taux d'approbation", value: `${tauxApprobation}%`, icon: TrendingUp, color: "#1B2559" },
    {
      label: "Revenus estimes",
      value: `${revenusEstimes.toLocaleString("fr-CA")} $`,
      icon: DollarSign,
      color: "#D4A03C",
    },
    { label: "Taux de conversion", value: `${tauxConversion}%`, icon: TrendingUp, color: "#1B2559" },
    { label: "Delai moyen (jours)", value: isNaN(avgDelay) ? 0 : avgDelay, icon: Calendar, color: "#D4A03C" },
  ];

  // --- Export functions ---
  const exportClientsCSV = () => {
    const headers = ['Prenom', 'Nom', 'Courriel', 'Telephone', 'Nationalite', 'Statut', 'Date creation'];
    const rows = clients.map(c => [c.firstName, c.lastName, c.email, c.phone, c.nationality, c.status, c.createdAt]);
    exportCSV('clients_export.csv', headers, rows);
  };

  const exportDossiersCSV = () => {
    const headers = ['Titre', 'Client', 'Programme', 'Statut', 'Priorite', 'Assigne', 'Echeance', 'Date creation'];
    const rows = filteredCases.map(c => {
      const client = clients.find(cl => cl.id === c.clientId);
      const prog = IMMIGRATION_PROGRAMS.find(p => p.id === c.programId);
      const assignee = activeUsers.find(u => u.id === c.assignedTo);
      return [
        c.title,
        client ? `${client.firstName} ${client.lastName}` : c.clientId,
        prog?.name ?? c.programId,
        CASE_STATUS_LABELS[c.status] ?? c.status,
        c.priority,
        assignee?.name ?? c.assignedTo,
        c.deadline,
        c.createdAt,
      ];
    });
    exportCSV('dossiers_export.csv', headers, rows);
  };

  const exportFacturesCSV = () => {
    const headers = ['ID Contrat', 'Client', 'Programme', 'Montant total', 'Statut', 'Date creation'];
    const rows = filteredContracts.map(ct => {
      const client = clients.find(cl => cl.id === ct.clientId);
      const caseObj = cases.find(c => c.id === ct.caseId);
      const prog = caseObj ? IMMIGRATION_PROGRAMS.find(p => p.id === caseObj.programId) : null;
      return [
        ct.id,
        client ? `${client.firstName} ${client.lastName}` : ct.clientId,
        prog?.name ?? '',
        ct.grandTotal.toLocaleString('fr-CA'),
        ct.status,
        ct.createdAt,
      ];
    });
    exportCSV('factures_export.csv', headers, rows);
  };

  const exportRapportComplet = () => {
    const headers = [
      'Section', 'Donnee', 'Valeur',
    ];
    const rows: string[][] = [];
    // KPIs
    kpis.forEach(k => rows.push(['KPI', k.label, String(k.value)]));
    // Pipeline
    pipeline.forEach(p => rows.push(['Pipeline', p.label, String(p.count)]));
    // Par programme
    Object.entries(parProgramme).forEach(([name, count]) => rows.push(['Programme', name, String(count)]));
    // Revenus par programme
    Object.entries(revenusParProgramme).forEach(([name, rev]) => rows.push(['Revenus/Programme', name, `${rev.toLocaleString('fr-CA')} $`]));
    // Top 5
    top5Programmes.forEach(([name, count], i) => rows.push(['Top 5', `${i + 1}. ${name}`, String(count)]));
    // Conseillers
    conseillerStats.forEach(cs => rows.push(['Conseiller', cs.user.name, `${cs.totalCases} dossiers, ${cs.approved} approuves, ${cs.refused} refuses`]));
    exportCSV('rapport_complet.csv', headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* En-tete */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#EAEDF5" }}>
            <BarChart3 className="w-6 h-6" style={{ color: "#1B2559" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1B2559" }}>
              Rapports et statistiques
            </h1>
            <p className="text-sm text-gray-500">Vue d&apos;ensemble de l&apos;activite du cabinet</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors print:hidden"
        >
          <Printer size={16} /> Imprimer
        </button>
      </div>

      {/* Load error */}
      {loadError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 text-sm border border-amber-200">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          {loadError}
        </div>
      )}

      {/* Date range filter + Export buttons */}
      <div className="bg-white rounded-xl border p-5 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date debut</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date fin</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Reinitialiser
            </button>
          )}
          <div className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <button onClick={exportClientsCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700">
              <Download size={14} /> Clients CSV
            </button>
            <button onClick={exportDossiersCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700">
              <Download size={14} /> Dossiers CSV
            </button>
            <button onClick={exportFacturesCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700">
              <Download size={14} /> Factures CSV
            </button>
            <button onClick={exportRapportComplet}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#1B2559' }}>
              <Download size={14} /> Rapport complet
            </button>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#EAEDF5" }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="text-3xl font-bold" style={{ color: kpi.color }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state when date filter returns no data */}
      {(dateFrom || dateTo) && filteredCases.length === 0 && filteredContracts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border">
          <BarChart3 className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm font-medium">Aucune donnee pour cette periode</p>
          <p className="text-gray-400 text-xs mt-1">Essayez d&apos;elargir la plage de dates ou reinitialiser les filtres.</p>
        </div>
      )}

      {/* Top 5 programmes + Revenus par programme */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 5 */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>
            Top 5 programmes
          </h2>
          <div className="space-y-3">
            {top5Programmes.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#D4A03C' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700 truncate">{name}</div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max((count / (top5Programmes[0]?.[1] ?? 1)) * 100, 10)}%`,
                        backgroundColor: '#1B2559',
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: '#1B2559' }}>{count}</span>
              </div>
            ))}
            {top5Programmes.length === 0 && (
              <p className="text-sm text-gray-400">Aucun dossier</p>
            )}
          </div>
        </div>

        {/* Revenus par programme */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>
            Revenus par programme
          </h2>
          <div className="space-y-3">
            {Object.entries(revenusParProgramme)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([name, rev]) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-40 text-sm text-gray-700 truncate flex-shrink-0">{name}</div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 text-[10px] font-bold text-white transition-all"
                      style={{
                        width: `${Math.max((rev / Math.max(...Object.values(revenusParProgramme), 1)) * 100, 12)}%`,
                        backgroundColor: '#D4A03C',
                      }}
                    >
                      {rev.toLocaleString('fr-CA')} $
                    </div>
                  </div>
                </div>
              ))}
            {Object.keys(revenusParProgramme).length === 0 && (
              <p className="text-sm text-gray-400">Aucun revenu</p>
            )}
          </div>
        </div>
      </div>

      {/* Dossiers par programme */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>
          Dossiers par programme
        </h2>
        <div className="space-y-3">
          {Object.entries(parProgramme)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-48 text-sm text-gray-700 truncate flex-shrink-0">{name}</div>
                <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2 text-xs font-bold text-white transition-all"
                    style={{
                      width: `${Math.max((count / maxProgramme) * 100, 12)}%`,
                      backgroundColor: "#D4A03C",
                    }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            ))}
          {Object.keys(parProgramme).length === 0 && (
            <p className="text-sm text-gray-400">Aucun dossier</p>
          )}
        </div>
      </div>

      {/* Pipeline funnel */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>
          Pipeline - Entonnoir des dossiers
        </h2>
        <div className="space-y-2">
          {pipeline.map((p) => (
            <div key={p.status} className="flex items-center gap-3">
              <div className="w-40 text-sm text-gray-700 flex-shrink-0">{p.label}</div>
              <div className="flex-1 h-8 bg-gray-50 rounded overflow-hidden">
                <div
                  className={`h-full rounded flex items-center px-3 text-xs font-bold transition-all ${p.colors}`}
                  style={{
                    width: `${Math.max((p.count / maxPipeline) * 100, 8)}%`,
                  }}
                >
                  {p.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Repartition par categorie */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>
          Repartition par categorie
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(parCategorie)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => (
              <div
                key={cat}
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: "#EAEDF5" }}
              >
                <div className="text-2xl font-bold" style={{ color: "#1B2559" }}>
                  {count}
                </div>
                <div className="text-sm text-gray-600 mt-1">{cat}</div>
              </div>
            ))}
          {Object.keys(parCategorie).length === 0 && (
            <p className="text-sm text-gray-400 col-span-full">Aucun dossier</p>
          )}
        </div>
      </div>

      {/* Performance par conseiller */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: "#1B2559" }}>
          Performance par conseiller
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ backgroundColor: "#EAEDF5" }}>
                <th className="text-left p-3 font-semibold" style={{ color: "#1B2559" }}>
                  Conseiller
                </th>
                <th className="text-center p-3 font-semibold" style={{ color: "#1B2559" }}>
                  Clients
                </th>
                <th className="text-center p-3 font-semibold" style={{ color: "#1B2559" }}>
                  Dossiers
                </th>
                <th className="text-center p-3 font-semibold" style={{ color: "#1B2559" }}>
                  En cours
                </th>
                <th className="text-center p-3 font-semibold" style={{ color: "#1B2559" }}>
                  Approuves
                </th>
                <th className="text-center p-3 font-semibold" style={{ color: "#1B2559" }}>
                  Refuses
                </th>
              </tr>
            </thead>
            <tbody>
              {conseillerStats.map((cs) => (
                <tr key={cs.user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{cs.user.name}</td>
                  <td className="p-3 text-center">{cs.clients}</td>
                  <td className="p-3 text-center">{cs.totalCases}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                      {cs.open}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                      {cs.approved}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                      {cs.refused}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
