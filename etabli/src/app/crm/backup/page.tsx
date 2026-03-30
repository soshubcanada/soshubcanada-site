"use client";
import { useState } from "react";
import { crmFetch } from '@/lib/crm-fetch';
import { useCrm } from "@/lib/crm-store";
import { ROLE_PERMISSIONS } from "@/lib/crm-types";
import {
  Database, Download, FileJson, FileSpreadsheet, Shield,
  Clock, CheckCircle2, AlertTriangle, Loader2, HardDrive,
  Users, FolderOpen, FileText, Calendar, FileSignature,
  Mail, Archive, RefreshCw,
} from "lucide-react";

const NAVY = "#1B2559";
const GOLD = "#D4A03C";

type ExportFormat = "json" | "csv";
type ExportModule = "clients" | "cases" | "appointments" | "contracts" | "emails" | "all";

interface BackupRecord {
  id: string;
  date: string;
  modules: string[];
  format: ExportFormat;
  size: string;
  status: "success" | "failed";
}

export default function BackupPage() {
  const { currentUser, clients, cases, appointments, contracts } = useCrm();
  const [exporting, setExporting] = useState(false);
  const [selectedModules, setSelectedModules] = useState<Set<ExportModule>>(new Set(["all"]));
  const [format, setFormat] = useState<ExportFormat>("json");
  const [lastExport, setLastExport] = useState<BackupRecord | null>(null);
  const [history, setHistory] = useState<BackupRecord[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!currentUser) return null;
  const perms = ROLE_PERMISSIONS[currentUser.role];
  if (!perms.canAccessBackup) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield size={48} className="mx-auto mb-4 text-red-300" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Acces restreint</h2>
          <p className="text-sm text-gray-500">Seuls la coordinatrice et le super admin ont acces aux sauvegardes.</p>
        </div>
      </div>
    );
  }

  const modules: { key: ExportModule; label: string; icon: typeof Users; count: number; color: string }[] = [
    { key: "clients", label: "Clients", icon: Users, count: clients.length, color: "text-blue-600 bg-blue-50" },
    { key: "cases", label: "Dossiers", icon: FolderOpen, count: cases.length, color: "text-emerald-600 bg-emerald-50" },
    { key: "appointments", label: "Rendez-vous", icon: Calendar, count: appointments.length, color: "text-indigo-600 bg-indigo-50" },
    { key: "contracts", label: "Contrats", icon: FileSignature, count: contracts.length, color: "text-purple-600 bg-purple-50" },
    { key: "emails", label: "Courriels envoyes", icon: Mail, count: 0, color: "text-amber-600 bg-amber-50" },
  ];

  const toggleModule = (mod: ExportModule) => {
    setSelectedModules(prev => {
      const next = new Set(prev);
      if (mod === "all") {
        return new Set(["all"]);
      }
      next.delete("all");
      if (next.has(mod)) next.delete(mod); else next.add(mod);
      if (next.size === 0) return new Set(["all"]);
      return next;
    });
  };

  const isModuleSelected = (mod: ExportModule) =>
    selectedModules.has("all") || selectedModules.has(mod);

  // Convert data to CSV format
  const toCSV = (data: Record<string, unknown>[]): string => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val === null || val === undefined ? "" :
          typeof val === "object" ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };

  // Flatten client data for CSV
  const flattenClients = () => clients.map(c => ({
    id: c.id,
    prenom: c.firstName,
    nom: c.lastName,
    email: c.email,
    telephone: c.phone,
    status: c.status,
    nationalite: c.nationality,
    pays_residence: c.currentCountry,
    date_naissance: c.dateOfBirth,
    programme: c.programmeInteret || "",
    notes: c.notes,
    date_creation: c.createdAt,
  }));

  const flattenCases = () => cases.map(c => ({
    id: c.id,
    titre: c.title,
    client_id: c.clientId,
    programme: c.programId,
    statut: c.status,
    priorite: c.priority,
    assigne_a: c.assignedTo,
    avocat: c.assignedLawyer || "",
    date_limite: c.deadline || "",
    date_creation: c.createdAt,
    derniere_maj: c.updatedAt,
  }));

  const flattenAppointments = () => appointments.map(a => ({
    id: a.id,
    titre: a.title,
    client_id: a.clientId,
    date: a.date,
    heure: a.time,
    duree_min: a.duration,
    type: a.type,
    statut: a.status,
    notes: a.notes,
  }));

  const flattenContracts = () => contracts.map(ct => ({
    id: ct.id,
    dossier_id: ct.caseId,
    tarif_id: ct.pricingTierId,
    frais_service: ct.serviceFee,
    frais_gouvernement: ct.governmentFee,
    total_avant_taxes: ct.totalBeforeTax,
    tps: ct.tps,
    tvq: ct.tvq,
    total: ct.grandTotal,
    statut: ct.status,
    date_creation: ct.createdAt,
  }));

  const handleExport = async () => {
    setExporting(true);
    setShowSuccess(false);

    try {
      const exportAll = selectedModules.has("all");
      const exportData: Record<string, unknown> = {};
      const exportedModules: string[] = [];

      // Collect data
      if (exportAll || selectedModules.has("clients")) {
        exportData.clients = format === "csv" ? flattenClients() : clients;
        exportedModules.push("Clients");
      }
      if (exportAll || selectedModules.has("cases")) {
        exportData.dossiers = format === "csv" ? flattenCases() : cases;
        exportedModules.push("Dossiers");
      }
      if (exportAll || selectedModules.has("appointments")) {
        exportData.rendez_vous = format === "csv" ? flattenAppointments() : appointments;
        exportedModules.push("RDV");
      }
      if (exportAll || selectedModules.has("contracts")) {
        exportData.contrats = format === "csv" ? flattenContracts() : contracts;
        exportedModules.push("Contrats");
      }
      if (exportAll || selectedModules.has("emails")) {
        try {
          const res = await crmFetch("/api/crm/emails?limit=200");
          if (res.ok) {
            const data = await res.json();
            exportData.courriels = data.emails || [];
            exportedModules.push("Courriels");
          }
        } catch { /* skip */ }
      }

      // Generate file
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
      let blob: Blob;
      let filename: string;

      if (format === "json") {
        const json = JSON.stringify({
          _meta: {
            export_date: now.toISOString(),
            export_by: currentUser.name,
            crm_version: "SOS Hub Canada CRM v2.0",
            modules: exportedModules,
          },
          ...exportData,
        }, null, 2);
        blob = new Blob([json], { type: "application/json" });
        filename = `soshub-crm-backup-${dateStr}.json`;
      } else {
        // CSV: zip multiple files or single concatenated
        const csvParts: string[] = [];
        for (const [key, data] of Object.entries(exportData)) {
          if (Array.isArray(data) && data.length > 0) {
            csvParts.push(`\n--- ${key.toUpperCase()} ---\n`);
            csvParts.push(toCSV(data as Record<string, unknown>[]));
          }
        }
        blob = new Blob([csvParts.join("\n\n")], { type: "text/csv;charset=utf-8" });
        filename = `soshub-crm-backup-${dateStr}.csv`;
      }

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Record
      const record: BackupRecord = {
        id: crypto.randomUUID(),
        date: now.toISOString(),
        modules: exportedModules,
        format,
        size: `${(blob.size / 1024).toFixed(1)} Ko`,
        status: "success",
      };
      setLastExport(record);
      setHistory(prev => [record, ...prev].slice(0, 20));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch {
      const record: BackupRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        modules: [],
        format,
        size: "0 Ko",
        status: "failed",
      };
      setHistory(prev => [record, ...prev]);
    }

    setExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B2559] to-[#242E6B] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Database size={28} className="text-[#D4A03C]" />
          <h1 className="text-2xl font-bold">Sauvegarde & Export</h1>
        </div>
        <p className="text-white/60 text-sm">
          Exportez vos donnees CRM en JSON ou CSV. Best practice: sauvegarde hebdomadaire recommandee.
        </p>
      </div>

      {/* Success banner */}
      {showSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-in slide-in-from-top">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Sauvegarde telechargee avec succes</p>
            <p className="text-xs text-emerald-600">
              {lastExport?.modules.join(", ")} — {lastExport?.size} ({lastExport?.format.toUpperCase()})
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Export config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Module selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HardDrive size={18} style={{ color: GOLD }} />
              Modules a exporter
            </h2>

            {/* Select all */}
            <button
              onClick={() => setSelectedModules(new Set(["all"]))}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 mb-3 transition-all ${
                selectedModules.has("all")
                  ? "border-[#D4A03C] bg-[#D4A03C]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Archive size={20} style={{ color: selectedModules.has("all") ? GOLD : "#9CA3AF" }} />
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-gray-900">Sauvegarde complete</div>
                <div className="text-xs text-gray-500">Tous les modules — recommande</div>
              </div>
              {selectedModules.has("all") && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4A03C]/10 text-[#D4A03C] border border-[#D4A03C]/20">
                  SELECTIONNE
                </span>
              )}
            </button>

            <div className="grid sm:grid-cols-2 gap-2">
              {modules.map(mod => (
                <button
                  key={mod.key}
                  onClick={() => toggleModule(mod.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    isModuleSelected(mod.key) && !selectedModules.has("all")
                      ? "border-[#D4A03C] bg-[#D4A03C]/5"
                      : selectedModules.has("all")
                      ? "border-gray-100 bg-gray-50 opacity-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  disabled={selectedModules.has("all")}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mod.color}`}>
                    <mod.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{mod.label}</div>
                    <div className="text-xs text-gray-400">{mod.count > 0 ? `${mod.count} enregistrements` : "Via API"}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Format selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} style={{ color: GOLD }} />
              Format d&apos;export
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setFormat("json")}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  format === "json" ? "border-[#D4A03C] bg-[#D4A03C]/5" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileJson size={24} className={format === "json" ? "text-[#D4A03C]" : "text-gray-400"} />
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">JSON</div>
                  <div className="text-xs text-gray-500">Structure complete, reimportable</div>
                </div>
                {format === "json" && <CheckCircle2 size={16} className="ml-auto text-[#D4A03C]" />}
              </button>
              <button
                onClick={() => setFormat("csv")}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  format === "csv" ? "border-[#D4A03C] bg-[#D4A03C]/5" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileSpreadsheet size={24} className={format === "csv" ? "text-[#D4A03C]" : "text-gray-400"} />
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">CSV</div>
                  <div className="text-xs text-gray-500">Compatible Excel / Google Sheets</div>
                </div>
                {format === "csv" && <CheckCircle2 size={16} className="ml-auto text-[#D4A03C]" />}
              </button>
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-bold text-base transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            style={{ backgroundColor: NAVY }}
          >
            {exporting ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download size={22} />
                Lancer la sauvegarde
              </>
            )}
          </button>
        </div>

        {/* Right: Info + History */}
        <div className="space-y-6">
          {/* Info card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield size={18} style={{ color: GOLD }} />
              Securite
            </h2>
            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Les exports sont telecharges localement — aucune donnee n&apos;est envoyee a un serveur tiers</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Acces reserve a la coordination et au super admin</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Le fichier JSON est reimportable pour restaurer le CRM</span>
              </div>
              <div className="flex gap-2">
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Conservez vos sauvegardes dans un endroit securise (chiffre)</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Database size={18} style={{ color: GOLD }} />
              Donnees actuelles
            </h2>
            <div className="space-y-2">
              {modules.map(mod => (
                <div key={mod.key} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <mod.icon size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-600">{mod.label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: NAVY }}>
                    {mod.count > 0 ? mod.count : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-xl p-4 border-2 border-dashed" style={{ borderColor: `${GOLD}40`, backgroundColor: `${GOLD}08` }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} style={{ color: GOLD }} />
              <span className="text-sm font-semibold" style={{ color: NAVY }}>Recommandation</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Effectuez une <strong>sauvegarde complete en JSON</strong> chaque semaine.
              Conservez au moins 4 versions (1 mois) dans un stockage securise (Google Drive chiffre, OneDrive, etc.).
            </p>
          </div>

          {/* Export history */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <RefreshCw size={18} style={{ color: GOLD }} />
                Historique (session)
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map(rec => (
                  <div key={rec.id} className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${
                    rec.status === "success" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                  }`}>
                    {rec.status === "success" ? (
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle size={14} className="text-red-600 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {rec.modules.join(", ") || "Echec"}
                      </div>
                      <div className="text-gray-500">
                        {new Date(rec.date).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })} — {rec.format.toUpperCase()} — {rec.size}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
