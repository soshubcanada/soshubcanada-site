"use client";
import { useState, useEffect } from "react";
import { crmFetch } from '@/lib/crm-fetch';
import { useCrm, DEMO_USERS } from "@/lib/crm-store";
import { ROLE_PERMISSIONS, ROLE_LABELS } from "@/lib/crm-types";
import type { RolePermissions, CrmRole, CrmUser } from "@/lib/crm-types";
import { fetchUsers } from "@/lib/crm-data-service";
import { IMMIGRATION_PROGRAMS, PROGRAM_CATEGORIES } from "@/lib/crm-programs";
import { resetPassword } from "@/lib/supabase-auth";
import {
  Settings, Users, Building2, BookOpen, Shield, ShieldX, Check, X as XIcon,
  Plus, Pencil, UserX, KeyRound, Loader2, AlertTriangle, CheckCircle2,
  Eye, EyeOff, Mail, Lock, RefreshCw, UserCheck, Search,
  Globe, UserCircle, Send, Trash2, ToggleLeft, ToggleRight,
} from "lucide-react";

const TABS = [
  { id: "equipe", label: "Équipe", icon: Users },
  { id: "portails", label: "Portails", icon: Globe },
  { id: "cabinet", label: "Cabinet", icon: Building2 },
  { id: "programmes", label: "Programmes", icon: BookOpen },
  { id: "securite", label: "Sécurité", icon: Shield },
] as const;

type TabId = (typeof TABS)[number]["id"];
type ModalMode = "add" | "edit" | "password" | "resetpw" | null;

const PERMISSION_LABELS: Record<keyof RolePermissions, string> = {
  canCreateClient: "Créer un client",
  canEditClient: "Modifier un client",
  canDeleteClient: "Supprimer un client",
  canViewAllClients: "Voir tous les clients",
  canCreateCase: "Créer un dossier",
  canEditCase: "Modifier un dossier",
  canDeleteCase: "Supprimer un dossier",
  canFillForms: "Remplir les formulaires",
  canApproveForms: "Approuver les formulaires",
  canSignForms: "Signer les formulaires",
  canViewReports: "Voir les rapports",
  canManageUsers: "Gérer les utilisateurs",
  canManageSettings: "Gérer les paramètres",
  canScheduleAppointments: "Planifier des rendez-vous",
  canViewFinancials: "Voir les finances",
  canExportData: "Exporter les données",
  canAccessLegalDocs: "Accès documents juridiques",
  canOverrideDecisions: "Annuler des décisions",
  canViewAuditLog: "Voir le journal d'audit",
  canAccessFacturation: "Accès facturation",
  canAccessPortailEmployeurs: "Accès portail employeurs",
  canAccessSOSIA: "Accès SOSIA (version client)",
  canAccessSOSIAConsultant: "Accès SOSIA (version consultant senior)",
  canAccessRH: "Accès RH (propre profil)",
  canAccessRHAdmin: "Accès RH admin (tous)",
  canAccessBackup: "Accès sauvegarde & export",
};

const ROLE_BADGE_COLORS: Record<CrmRole, string> = {
  receptionniste: "bg-gray-100 text-gray-700",
  conseiller: "bg-blue-100 text-blue-700",
  technicienne_juridique: "bg-cyan-100 text-cyan-700",
  avocat_consultant: "bg-indigo-100 text-indigo-700",
  coordinatrice: "bg-amber-100 text-amber-700",
  superadmin: "bg-purple-100 text-purple-700",
};

const ASSIGNABLE_ROLES: CrmRole[] = [
  "receptionniste", "conseiller", "technicienne_juridique", "avocat_consultant", "coordinatrice", "superadmin",
];

const MOCK_AUDIT_LOG = [
  { id: "log1", date: "2026-03-22 09:15", user: "P. Cadet", action: "Connexion au système", ip: "192.168.1.100" },
  { id: "log2", date: "2026-03-22 09:20", user: "A. Kabeche", action: "Création du client Carlos Rodriguez", ip: "192.168.1.101" },
  { id: "log3", date: "2026-03-21 16:45", user: "N. Saadou", action: "Révision formulaire IMM 5645", ip: "192.168.1.103" },
  { id: "log4", date: "2026-03-21 14:30", user: "S. Loulidi", action: "Modification du dossier PEQ", ip: "192.168.1.103" },
  { id: "log5", date: "2026-03-21 10:00", user: "F. Madjer", action: "Ajout rendez-vous - Amina Diallo", ip: "192.168.1.104" },
  { id: "log6", date: "2026-03-20 17:00", user: "S. Guerrier", action: "Export des données clients", ip: "192.168.1.100" },
  { id: "log7", date: "2026-03-20 11:22", user: "Direction", action: "Mise à jour statut dossier -> en_preparation", ip: "192.168.1.101" },
  { id: "log8", date: "2026-03-19 09:00", user: "P. Cadet", action: "Modification rôle S. Loulidi → Technicienne juridique", ip: "192.168.1.100" },
];

export default function ParametresPage() {
  const { currentUser } = useCrm();
  const [activeTab, setActiveTab] = useState<TabId>("equipe");
  const [teamSearch, setTeamSearch] = useState("");

  // User management state
  const [teamMembers, setTeamMembers] = useState<CrmUser[]>([...DEMO_USERS]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  // Load real users from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const users = await fetchUsers();
        if (!cancelled && users.length > 0) setTeamMembers(users);
      } catch { /* fallback to DEMO_USERS */ }
      if (!cancelled) setLoadingTeam(false);
    })();
    return () => { cancelled = true; };
  }, []);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingUser, setEditingUser] = useState<CrmUser | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<CrmRole>("receptionniste");
  const [formPassword, setFormPassword] = useState("");
  const [formPasswordConfirm, setFormPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(null);

  // Cabinet form state
  const [cabinetInfo, setCabinetInfo] = useState({
    nom: "SOS Hub Canada",
    adresse: "1455 Boulevard de Maisonneuve Ouest, Bureau 400",
    ville: "Montréal",
    province: "QC",
    codePostal: "H3G 1M8",
    telephone: "+1 (514) 555-0199",
    email: "info@soshubcanada.com",
    siteWeb: "www.soshubcanada.com",
    licenceRcic: "R123456",
    numeroCICC: "CICC-2024-00567",
  });

  if (!currentUser) return null;
  const perms = ROLE_PERMISSIONS[currentUser.role];
  const isSuperAdmin = currentUser.role === "superadmin";

  if (!perms.canManageSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="p-4 rounded-full bg-red-50 mb-4">
          <ShieldX className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès refusé</h1>
        <p className="text-gray-500">Vous n&apos;avez pas la permission de gérer les paramètres du système.</p>
      </div>
    );
  }

  const roles = Object.keys(ROLE_PERMISSIONS) as CrmRole[];
  const permKeys = Object.keys(PERMISSION_LABELS) as (keyof RolePermissions)[];

  const canEditUser = (target: CrmUser) => {
    if (isSuperAdmin) return true;
    if (target.role === "superadmin") return false;
    if (target.role === "coordinatrice" && !isSuperAdmin) return false;
    return perms.canManageUsers;
  };

  const resetForm = () => {
    setFormName(""); setFormEmail(""); setFormRole("receptionniste");
    setFormPassword(""); setFormPasswordConfirm(""); setShowPw(false);
    setFormActive(true); setFormError(""); setFormSuccess("");
  };

  const openModal = (mode: ModalMode, user?: CrmUser) => {
    resetForm();
    setEditingUser(user || null);
    if (user) {
      setFormName(user.name);
      setFormEmail(user.email);
      setFormRole(user.role);
      setFormActive(user.active);
    }
    setModalMode(mode);
  };

  const handleSaveUser = async () => {
    setFormError(""); setFormSuccess("");

    if (modalMode === "add") {
      if (!formName.trim() || !formEmail.trim()) { setFormError("Nom et email requis"); return; }
      if (!formPassword.trim() || formPassword.length < 8) { setFormError("Mot de passe requis (min. 8 caractères)"); return; }
      if (formPassword !== formPasswordConfirm) { setFormError("Les mots de passe ne correspondent pas"); return; }
      if (teamMembers.some(u => u.email === formEmail.trim())) { setFormError("Cet email est déjà utilisé"); return; }

      setSaving(true);
      const newUser: CrmUser = { id: `u${Date.now()}`, name: formName.trim(), email: formEmail.trim(), role: formRole, active: true };
      setTeamMembers(prev => [...prev, newUser]);
      crmFetch("/api/crm/users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail.trim(), password: formPassword, name: formName.trim(), role: formRole }),
      }).catch(() => {});
      setSaving(false);
      setModalMode(null);
    }

    if (modalMode === "edit" && editingUser) {
      if (!formName.trim()) { setFormError("Nom requis"); return; }
      setSaving(true);
      setTeamMembers(prev => prev.map(u =>
        u.id === editingUser.id ? { ...u, name: formName.trim(), role: formRole, active: formActive } : u
      ));
      crmFetch("/api/crm/users", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: editingUser.id, name: formName.trim(), role: formRole, active: formActive }),
      }).catch(() => {});
      setSaving(false);
      setModalMode(null);
    }

    if (modalMode === "password" && editingUser) {
      if (!formPassword.trim() || formPassword.length < 8) { setFormError("Min. 8 caractères"); return; }
      if (formPassword !== formPasswordConfirm) { setFormError("Les mots de passe ne correspondent pas"); return; }
      setSaving(true);
      try {
        const res = await crmFetch("/api/crm/users", {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: editingUser.id, password: formPassword }),
        });
        if (res.ok) {
          setFormSuccess("Mot de passe modifié avec succès");
          setTimeout(() => setModalMode(null), 1500);
        } else {
          setFormError("Erreur lors de la modification");
        }
      } catch { setFormError("Erreur de connexion"); }
      setSaving(false);
    }

    if (modalMode === "resetpw" && editingUser) {
      setSaving(true);
      try {
        await resetPassword(editingUser.email);
        setFormSuccess(`Lien de réinitialisation envoyé à ${editingUser.email}`);
        setTimeout(() => setModalMode(null), 2000);
      } catch { setFormError("Erreur lors de l'envoi"); }
      setSaving(false);
    }
  };

  const handleDeactivate = (userId: string) => {
    setTeamMembers(prev => prev.map(u => u.id === userId ? { ...u, active: false } : u));
    crmFetch("/api/crm/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) }).catch(() => {});
    setConfirmDeactivate(null);
  };

  const handleReactivate = (userId: string) => {
    setTeamMembers(prev => prev.map(u => u.id === userId ? { ...u, active: true } : u));
    crmFetch("/api/crm/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, active: true }) }).catch(() => {});
  };

  const filteredMembers = teamMembers.filter(u =>
    !teamSearch || u.name.toLowerCase().includes(teamSearch.toLowerCase()) || u.email.toLowerCase().includes(teamSearch.toLowerCase()) || ROLE_LABELS[u.role].toLowerCase().includes(teamSearch.toLowerCase())
  );

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#EAEDF5]">
          <Settings className="w-6 h-6 text-[#1B2559]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2559]">Paramètres</h1>
          <p className="text-sm text-gray-500">Configuration du système CRM</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-[#1B2559] text-white shadow" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* === Onglet Équipe === */}
      {activeTab === "equipe" && (
        <div className="space-y-6">
          {/* Stats rapides */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Total membres</div>
              <div className="text-2xl font-bold text-[#1B2559]">{teamMembers.length}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Actifs</div>
              <div className="text-2xl font-bold text-green-600">{teamMembers.filter(u => u.active).length}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Inactifs</div>
              <div className="text-2xl font-bold text-red-500">{teamMembers.filter(u => !u.active).length}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Admins</div>
              <div className="text-2xl font-bold text-purple-600">{teamMembers.filter(u => u.role === "superadmin" || u.role === "coordinatrice").length}</div>
            </div>
          </div>

          {/* Tableau des membres */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-bold text-[#1B2559]">Gestion des comptes</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Rechercher..." value={teamSearch} onChange={e => setTeamSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48"
                  />
                </div>
                {perms.canManageUsers && (
                  <button onClick={() => openModal("add")}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1B2559] text-white rounded-lg text-sm font-medium hover:bg-[#2a3a7c] transition"
                  >
                    <Plus size={16} /> Ajouter
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-[#EAEDF5]">
                    <th className="text-left p-3 font-semibold text-[#1B2559]">Membre</th>
                    <th className="text-left p-3 font-semibold text-[#1B2559]">Courriel</th>
                    <th className="text-left p-3 font-semibold text-[#1B2559]">Rôle</th>
                    <th className="text-center p-3 font-semibold text-[#1B2559]">Statut</th>
                    {perms.canManageUsers && <th className="text-center p-3 font-semibold text-[#1B2559]">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((u) => (
                    <tr key={u.id} className={`border-b hover:bg-gray-50 ${!u.active ? "opacity-50" : ""}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                            u.role === "superadmin" ? "bg-purple-100 text-purple-700" : "bg-[#EAEDF5] text-[#1B2559]"
                          }`}>
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <span className="font-medium block">{u.name}</span>
                            {u.role === "superadmin" && <span className="text-[10px] text-purple-600 font-medium">SUPER ADMIN</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 text-xs">{u.email}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_BADGE_COLORS[u.role]}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {u.active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      {perms.canManageUsers && (
                        <td className="p-3">
                          {canEditUser(u) ? (
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => openModal("edit", u)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition" title="Modifier profil">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => openModal("password", u)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition" title="Changer mot de passe">
                                <KeyRound size={14} />
                              </button>
                              <button onClick={() => openModal("resetpw", u)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition" title="Envoyer lien de réinitialisation">
                                <Mail size={14} />
                              </button>
                              {u.active ? (
                                confirmDeactivate === u.id ? (
                                  <div className="flex items-center gap-1 ml-1">
                                    <button onClick={() => handleDeactivate(u.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Oui</button>
                                    <button onClick={() => setConfirmDeactivate(null)} className="px-2 py-1 bg-gray-200 rounded text-xs">Non</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmDeactivate(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition" title="Désactiver">
                                    <UserX size={14} />
                                  </button>
                                )
                              ) : (
                                <button onClick={() => handleReactivate(u.id)} className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium" title="Réactiver">
                                  <UserCheck size={12} /> Réactiver
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 block text-center">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Aucun résultat</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matrice des permissions */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1B2559]">Matrice des permissions par rôle</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-[#EAEDF5]">
                    <th className="text-left p-2 font-semibold min-w-[200px] text-[#1B2559]">Permission</th>
                    {roles.map((r) => (
                      <th key={r} className="text-center p-2 font-semibold text-[#1B2559]">{ROLE_LABELS[r]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permKeys.map((perm) => (
                    <tr key={perm} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-gray-700">{PERMISSION_LABELS[perm]}</td>
                      {roles.map((r) => (
                        <td key={r} className="p-2 text-center">
                          {ROLE_PERMISSIONS[r][perm] ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <XIcon className="w-3.5 h-3.5 text-red-300 mx-auto" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* === Onglet Portails === */}
      {activeTab === "portails" && (
        <PortailsTab />
      )}

      {/* === Onglet Cabinet === */}
      {activeTab === "cabinet" && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-bold mb-6 text-[#1B2559]">Informations du cabinet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              ["nom", "Nom du cabinet"], ["licenceRcic", "Licence RCIC"],
              ["adresse", "Adresse", true], ["ville", "Ville"],
              ["province", "Province"], ["codePostal", "Code postal"],
              ["telephone", "Téléphone"], ["email", "Courriel"],
              ["siteWeb", "Site Web"], ["numeroCICC", "Numéro CICC"],
            ] as [keyof typeof cabinetInfo, string, boolean?][]).map(([key, label, full]) => (
              <div key={key} className={full ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={key === "email" ? "email" : "text"} value={cabinetInfo[key]}
                  onChange={(e) => setCabinetInfo({ ...cabinetInfo, [key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button className="text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 bg-[#D4A03C]">Enregistrer</button>
          </div>
        </div>
      )}

      {/* === Onglet Programmes === */}
      {activeTab === "programmes" && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-bold mb-4 text-[#1B2559]">Programmes d&apos;immigration disponibles</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-[#EAEDF5]">
                  <th className="text-left p-3 font-semibold text-[#1B2559]">Programme</th>
                  <th className="text-left p-3 font-semibold text-[#1B2559]">Catégorie</th>
                  <th className="text-right p-3 font-semibold text-[#1B2559]">Frais gouv.</th>
                  <th className="text-right p-3 font-semibold text-[#1B2559]">Honoraires</th>
                  <th className="text-center p-3 font-semibold text-[#1B2559]">Délai</th>
                  <th className="text-center p-3 font-semibold text-[#1B2559]">Formulaires</th>
                </tr>
              </thead>
              <tbody>
                {IMMIGRATION_PROGRAMS.map((prog) => (
                  <tr key={prog.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium max-w-[280px]"><div className="truncate">{prog.name}</div></td>
                    <td className="p-3"><span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-[#EAEDF5] text-[#1B2559]">{PROGRAM_CATEGORIES[prog.category] ?? prog.category}</span></td>
                    <td className="p-3 text-right">{prog.fees.government.toLocaleString("fr-CA")} $</td>
                    <td className="p-3 text-right">{prog.fees.service.toLocaleString("fr-CA")} $</td>
                    <td className="p-3 text-center text-gray-600">{prog.processingTime}</td>
                    <td className="p-3 text-center"><span className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">{prog.requiredForms.length}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === Onglet Sécurité === */}
      {activeTab === "securite" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1B2559]">Journal d&apos;audit</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-[#EAEDF5]">
                    <th className="text-left p-3 font-semibold text-[#1B2559]">Date</th>
                    <th className="text-left p-3 font-semibold text-[#1B2559]">Utilisateur</th>
                    <th className="text-left p-3 font-semibold text-[#1B2559]">Action</th>
                    <th className="text-left p-3 font-semibold text-[#1B2559]">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_AUDIT_LOG.map((e) => (
                    <tr key={e.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-600 whitespace-nowrap">{e.date}</td>
                      <td className="p-3 font-medium">{e.user}</td>
                      <td className="p-3">{e.action}</td>
                      <td className="p-3 text-gray-500 font-mono text-xs">{e.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1B2559]">Politique de sécurité</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Longueur minimale mot de passe", value: "8 caractères" },
                { label: "Majuscules requises", value: "Au moins 1" },
                { label: "Chiffres requis", value: "Au moins 1" },
                { label: "Caractères spéciaux", value: "Au moins 1 (!@#$%)" },
                { label: "Expiration mot de passe", value: "Tous les 90 jours" },
                { label: "Historique", value: "5 derniers interdits" },
                { label: "Tentatives maximales", value: "5 avant verrouillage" },
                { label: "Durée de verrouillage", value: "30 minutes" },
                { label: "2FA", value: "Recommandé pour tous" },
                { label: "Session inactive", value: "Déconnexion après 30 min" },
              ].map((rule) => (
                <div key={rule.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{rule.label}</span>
                  <span className="text-sm font-medium text-[#1B2559]">{rule.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === MODALE UNIFIÉE === */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalMode(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                {modalMode === "add" && <Plus size={20} className="text-[#1B2559]" />}
                {modalMode === "edit" && <Pencil size={20} className="text-blue-600" />}
                {modalMode === "password" && <KeyRound size={20} className="text-amber-600" />}
                {modalMode === "resetpw" && <Mail size={20} className="text-green-600" />}
                <h2 className="text-lg font-bold text-[#1B2559]">
                  {modalMode === "add" && "Nouveau membre"}
                  {modalMode === "edit" && "Modifier le profil"}
                  {modalMode === "password" && "Changer le mot de passe"}
                  {modalMode === "resetpw" && "Réinitialiser le mot de passe"}
                </h2>
              </div>
              <button onClick={() => setModalMode(null)} className="p-1 hover:bg-gray-100 rounded-lg"><XIcon size={20} className="text-gray-400" /></button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* User info header for edit/password/reset */}
              {editingUser && modalMode !== "add" && (
                <div className="flex items-center gap-3 p-3 bg-[#EAEDF5] rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${ROLE_BADGE_COLORS[editingUser.role]}`}>
                    {getInitials(editingUser.name)}
                  </div>
                  <div>
                    <div className="font-medium text-[#1B2559]">{editingUser.name}</div>
                    <div className="text-xs text-gray-500">{editingUser.email} — {ROLE_LABELS[editingUser.role]}</div>
                  </div>
                </div>
              )}

              {/* ADD / EDIT fields */}
              {(modalMode === "add" || modalMode === "edit") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                    <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Prénom Nom"
                      className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  {modalMode === "add" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Courriel *</label>
                      <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@soshubcanada.com"
                        className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                    <select value={formRole} onChange={e => setFormRole(e.target.value as CrmRole)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      {ASSIGNABLE_ROLES.filter(r => isSuperAdmin || r !== "superadmin").map(r => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </div>
                  {modalMode === "edit" && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Statut du compte :</label>
                      <button onClick={() => setFormActive(!formActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${formActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {formActive ? "Actif" : "Inactif"}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* PASSWORD fields (add + password mode) */}
              {(modalMode === "add" || modalMode === "password") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {modalMode === "add" ? "Mot de passe temporaire *" : "Nouveau mot de passe *"}
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPw ? "text" : "password"} value={formPassword} onChange={e => setFormPassword(e.target.value)}
                        placeholder="Min. 8 caractères" className="w-full pl-10 pr-10 py-2 border rounded-lg text-sm" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {formPassword.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {[
                          { ok: formPassword.length >= 8, text: "8 caractères minimum" },
                          { ok: /[A-Z]/.test(formPassword), text: "1 majuscule" },
                          { ok: /[0-9]/.test(formPassword), text: "1 chiffre" },
                          { ok: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formPassword), text: "1 caractère spécial" },
                        ].map(rule => (
                          <div key={rule.text} className={`flex items-center gap-2 text-xs ${rule.ok ? "text-green-600" : "text-gray-400"}`}>
                            {rule.ok ? <Check size={12} /> : <XIcon size={12} />} {rule.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPw ? "text" : "password"} value={formPasswordConfirm} onChange={e => setFormPasswordConfirm(e.target.value)}
                        placeholder="Répéter le mot de passe" className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
                    </div>
                    {formPasswordConfirm.length > 0 && formPassword !== formPasswordConfirm && (
                      <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>
                </>
              )}

              {/* RESET PASSWORD confirmation */}
              {modalMode === "resetpw" && !formSuccess && (
                <div className="text-center py-4">
                  <RefreshCw size={32} className="text-green-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    Un courriel de réinitialisation sera envoyé à <strong>{editingUser?.email}</strong>.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">L&apos;utilisateur recevra un lien pour définir un nouveau mot de passe.</p>
                </div>
              )}

              {/* Messages */}
              {formError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertTriangle size={16} /> {formError}
                </div>
              )}
              {formSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                  <CheckCircle2 size={16} /> {formSuccess}
                </div>
              )}
            </div>

            {/* Footer */}
            {!formSuccess && (
              <div className="flex justify-end gap-3 p-6 border-t">
                <button onClick={() => setModalMode(null)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                <button onClick={handleSaveUser} disabled={saving}
                  className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                    modalMode === "resetpw" ? "bg-green-600 hover:bg-green-700" :
                    modalMode === "password" ? "bg-amber-600 hover:bg-amber-700" :
                    "bg-[#1B2559] hover:bg-[#2a3a7c]"
                  }`}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {modalMode === "add" && "Créer le compte"}
                  {modalMode === "edit" && "Enregistrer"}
                  {modalMode === "password" && "Changer le mot de passe"}
                  {modalMode === "resetpw" && "Envoyer le lien"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================
// Composant Onglet Portails
// ========================================================
interface PortalAccessRecord {
  id: string;
  entity_type: string;
  entity_id: string;
  email: string;
  access_level: string;
  permissions: { upload_docs: boolean; view_forms: boolean; messaging: boolean };
  invited_at: string;
  last_login: string | null;
  active: boolean;
}

function PortailsTab() {
  const [portalAccess, setPortalAccess] = useState<PortalAccessRecord[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [filter, setFilter] = useState<'all' | 'client' | 'employer'>('all');
  const [revoking, setRevoking] = useState<string | null>(null);
  const [clientPortalEnabled, setClientPortalEnabled] = useState(true);
  const [employerPortalEnabled, setEmployerPortalEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await crmFetch('/api/crm/portal-invite');
        if (res.ok) {
          const data = await res.json();
          setPortalAccess(data);
        }
      } catch { /* demo mode */ }
      setLoadingAccess(false);
    })();
  }, []);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      const res = await crmFetch('/api/crm/portal-invite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessId: id }),
      });
      if (res.ok) {
        setPortalAccess(prev => prev.map(a => a.id === id ? { ...a, active: false } : a));
      }
    } catch { /* */ }
    setRevoking(null);
  };

  const filtered = portalAccess.filter(a => filter === 'all' || a.entity_type === filter);
  const activeCount = portalAccess.filter(a => a.active).length;
  const clientCount = portalAccess.filter(a => a.entity_type === 'client' && a.active).length;
  const employerCount = portalAccess.filter(a => a.entity_type === 'employer' && a.active).length;

  return (
    <div className="space-y-6">
      {/* Toggles d'activation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <UserCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Portail Client</h3>
                <p className="text-xs text-gray-500">Accès self-service pour les clients</p>
              </div>
            </div>
            <button onClick={() => setClientPortalEnabled(!clientPortalEnabled)}
              className={`p-1 rounded-full transition-colors ${clientPortalEnabled ? 'text-green-600' : 'text-gray-400'}`}>
              {clientPortalEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>{clientCount} accès actifs</span>
            <a href="/client" target="_blank" className="text-[#D4A03C] hover:underline">Voir le portail →</a>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Portail Employeur</h3>
                <p className="text-xs text-gray-500">Accès self-service pour les employeurs</p>
              </div>
            </div>
            <button onClick={() => setEmployerPortalEnabled(!employerPortalEnabled)}
              className={`p-1 rounded-full transition-colors ${employerPortalEnabled ? 'text-green-600' : 'text-gray-400'}`}>
              {employerPortalEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>{employerCount} accès actifs</span>
            <a href="/employeur" target="_blank" className="text-[#D4A03C] hover:underline">Voir le portail →</a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-[#1B2559]">{portalAccess.length}</div>
          <div className="text-xs text-gray-500">Total invitations</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-xs text-gray-500">Accès actifs</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">{portalAccess.length - activeCount}</div>
          <div className="text-xs text-gray-500">Révoqués</div>
        </div>
      </div>

      {/* Liste des accès */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-[#1B2559]">Accès portails</h2>
          <div className="flex gap-2">
            {(['all', 'client', 'employer'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  filter === f ? 'bg-[#1B2559] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {f === 'all' ? 'Tous' : f === 'client' ? 'Clients' : 'Employeurs'}
              </button>
            ))}
          </div>
        </div>

        {loadingAccess ? (
          <div className="text-center py-8"><Loader2 size={24} className="animate-spin mx-auto text-gray-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Globe className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun accès portail configuré</p>
            <p className="text-xs mt-1">Invitez des clients ou employeurs depuis leur fiche dans le CRM</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(access => (
              <div key={access.id} className={`flex items-center justify-between p-3 rounded-lg border ${access.active ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    access.entity_type === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {access.entity_type === 'client' ? 'C' : 'E'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{access.email}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        access.entity_type === 'client' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {access.entity_type === 'client' ? 'Client' : 'Employeur'}
                      </span>
                      <span>Invité {new Date(access.invited_at).toLocaleDateString('fr-CA')}</span>
                      {access.last_login && (
                        <span>Dernière connexion: {new Date(access.last_login).toLocaleDateString('fr-CA')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {access.active ? (
                    <>
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">Actif</span>
                      <button onClick={() => handleRevoke(access.id)} disabled={revoking === access.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Révoquer l'accès">
                        {revoking === access.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">Révoqué</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 text-sm mb-2">Comment inviter un client ou employeur ?</h3>
        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
          <li>Allez sur la fiche du client (Portail client) ou de l&apos;employeur (Portail employeurs)</li>
          <li>Cliquez sur le bouton <strong>&quot;Envoyer accès portail&quot;</strong></li>
          <li>Un courriel avec les identifiants temporaires sera envoyé automatiquement</li>
          <li>Le client/employeur pourra se connecter sur son portail dédié</li>
        </ol>
      </div>
    </div>
  );
}
