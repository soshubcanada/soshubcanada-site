"use client";
import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, FolderOpen, FileText, Calendar,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Shield, Bell, Search, DollarSign, Bot, UserCircle, Building2, FileSignature, Calculator,
  Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Briefcase, MessageSquare, Wallet,
  Menu, X, ChevronDown, Database, Download, BookOpen,
} from "lucide-react";
import { CrmContext } from "@/lib/crm-store";
import { useAuth } from "@/lib/useAuth";
import { resetPassword } from "@/lib/supabase-auth";
import type { CrmUser, Client, Case, Appointment } from "@/lib/crm-types";
import type { ServiceContract } from "@/lib/crm-pricing-2026";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/lib/crm-types";
import NotificationPanel from "@/components/NotificationPanel";
import {
  getNotifications, markAsRead as markNotifRead, markAllRead as markAllNotifRead,
  type Notification,
} from "@/lib/notifications";
import { useRealtimeSync } from "@/lib/useRealtimeSync";

// Navigation items — some are grouped into dropdowns to save space
type NavItem = { href: string; icon: typeof LayoutDashboard; label: string; perm?: keyof import("@/lib/crm-types").RolePermissions };
type NavGroup = { groupLabel: string; icon: typeof LayoutDashboard; items: NavItem[]; perm?: keyof import("@/lib/crm-types").RolePermissions };
type NavSeparator = { separator: true; label?: string };
type NavEntry = NavItem | NavGroup | NavSeparator;

const isGroup = (entry: NavEntry): entry is NavGroup => 'items' in entry;
const isSeparator = (entry: NavEntry): entry is NavSeparator => 'separator' in entry;

// ═══════════════════════════════════════════════════════════
// Navigation CRM — Architecture premium (Salesforce/HubSpot)
// Groupes logiques par fonction métier
// ═══════════════════════════════════════════════════════════
const NAV: NavEntry[] = [
  // ══ PRINCIPAL ══
  { href: "/crm", icon: LayoutDashboard, label: "Tableau de bord" },

  { separator: true, label: "Immigration" },

  // ── GESTION CLIENT — Clients + Analyse + Dossiers ──
  {
    groupLabel: "Gestion client", icon: Users, items: [
      { href: "/crm/clients", icon: Users, label: "Clients" },
      { href: "/crm/analyse-admissibilite", icon: Calculator, label: "Analyse immigration" },
      { href: "/crm/dossiers", icon: FolderOpen, label: "Dossiers" },
    ],
  },

  // ── DOCUMENTS — Formulaires + Contrats ──
  {
    groupLabel: "Documents", icon: FileSignature, items: [
      { href: "/crm/formulaires", icon: FileText, label: "Formulaires IRCC" },
      { href: "/crm/contrats", icon: FileSignature, label: "Contrats & tarifs" },
    ],
  },

  { separator: true, label: "Opérations" },

  // ── AGENDA & COMMUNICATION ──
  { href: "/crm/calendrier", icon: Calendar, label: "Calendrier" },
  { href: "/crm/messagerie", icon: MessageSquare, label: "Messagerie" },

  // ── FINANCES — Facturation (accès direct, pas dans un groupe) ──
  { href: "/crm/facturation", icon: DollarSign, label: "Facturation", perm: "canAccessFacturation" },

  { separator: true, label: "Croissance" },

  // ── INTELLIGENCE — SOSIA + Marketing ──
  { href: "/crm/agent-ai", icon: Bot, label: "SOSIA", perm: "canAccessSOSIA" },
  { href: "/crm/marketing", icon: Mail, label: "Marketing", perm: "canViewReports" },

  // ── PORTAILS EXTERNES ──
  {
    groupLabel: "Portails", icon: UserCircle, items: [
      { href: "/crm/portail-client", icon: UserCircle, label: "Portail client" },
      { href: "/crm/portail-employeurs", icon: Building2, label: "Portail employeurs", perm: "canAccessPortailEmployeurs" },
    ],
  },

  { separator: true, label: "Entreprise" },

  // ── RH & PAIE (regroupés) ──
  {
    groupLabel: "Ressources humaines", icon: Briefcase, perm: "canAccessRH", items: [
      { href: "/crm/ressources-humaines", icon: Briefcase, label: "Gestion RH" },
      { href: "/crm/paie", icon: Wallet, label: "Paie", perm: "canManageSettings" },
    ],
  },

  // ── RAPPORTS ──
  { href: "/crm/rapports", icon: BarChart3, label: "Rapports", perm: "canViewReports" },

  // ── ADMINISTRATION ──
  {
    groupLabel: "Administration", icon: Settings, perm: "canManageSettings", items: [
      { href: "/crm/parametres", icon: Settings, label: "Paramètres" },
      { href: "/crm/backup", icon: Database, label: "Sauvegarde & Export", perm: "canAccessBackup" },
      { href: "/crm/guide-staff", icon: BookOpen, label: "Guide Staff" },
    ],
  },
];

function DemoLoginPanel({ loginDemo }: { loginDemo: (user: CrmUser) => void }) {
  const [demoUsers, setDemoUsers] = useState<CrmUser[]>([]);
  useEffect(() => {
    import("@/lib/crm-store").then(m => setDemoUsers(m.DEMO_USERS));
  }, []);
  if (demoUsers.length === 0) return <div className="text-center py-8"><Loader2 size={24} className="animate-spin mx-auto text-[#D4A03C]" /></div>;
  return (
    <>
      <p className="text-gray-500 text-sm mb-4 text-center">Sélectionnez votre profil pour accéder au système</p>
      <div className="grid gap-3">
        {demoUsers.map((user) => (
          <button key={user.id} onClick={() => loginDemo(user)}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#D4A03C] hover:bg-[#F7F3E8] transition-all text-left group">
            <div className="w-12 h-12 rounded-full bg-[#EAEDF5] text-[#1B2559] flex items-center justify-center font-bold text-lg">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">{ROLE_LABELS[user.role]}</div>
            </div>
            <Shield size={18} className="text-gray-300 group-hover:text-[#D4A03C]" />
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">Chaque profil a des permissions différentes selon son rôle</p>
    </>
  );
}

export default function CrmLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // Close mobile sidebar on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Dynamic page title
  useEffect(() => {
    const segments: Record<string, string> = {
      '/crm': 'Tableau de bord', '/crm/clients': 'Clients', '/crm/dossiers': 'Dossiers',
      '/crm/analyse-admissibilite': 'Analyse immigration', '/crm/formulaires': 'Formulaires IRCC',
      '/crm/contrats': 'Contrats & tarifs', '/crm/facturation': 'Facturation',
      '/crm/calendrier': 'Calendrier', '/crm/portail-client': 'Portail Client',
      '/crm/portail-employeurs': 'Portail Employeurs', '/crm/agent-ai': 'SOSIA', '/crm/marketing': 'Marketing',
      '/crm/rapports': 'Rapports', '/crm/parametres': 'Paramètres',
      '/crm/ressources-humaines': 'Gestion RH', '/crm/paie': 'Paie', '/crm/messagerie': 'Messagerie',
      '/crm/backup': 'Sauvegarde', '/crm/guide-staff': 'Guide Staff',
    };
    const label = segments[pathname] || 'CRM';
    document.title = `${label} — SOS Hub Canada CRM`;
  }, [pathname]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [contracts, setContracts] = useState<ServiceContract[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { currentUser, loading, isDemo, error, login, loginDemo, logout } = useAuth();

  // --- Notifications state ---
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications on mount and when user changes
  useEffect(() => {
    if (!currentUser) return;
    const notifs = getNotifications(currentUser.id);
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.read).length);
  }, [currentUser, notifPanelOpen]);

  const handleMarkRead = useCallback((id: string) => {
    markNotifRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    if (!currentUser) return;
    markAllNotifRead(currentUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [currentUser]);

  // Reset dataLoaded when auth mode changes (demo → supabase)
  const prevIsDemo = useRef(isDemo);
  useEffect(() => {
    if (prevIsDemo.current !== isDemo) {
      prevIsDemo.current = isDemo;
      setDataLoaded(false);
    }
  }, [isDemo]);

  // Data load error tracking
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [dataLoadRetries, setDataLoadRetries] = useState(0);

  // Load data ONLY after login (lazy import to speed up initial page load)
  useEffect(() => {
    if (!currentUser || dataLoaded) return;
    let cancelled = false;
    setDataLoadError(null);
    const loadTimeout = setTimeout(() => {
      // If data takes more than 15s, mark loaded but show warning
      if (!cancelled) {
        setDataLoadError('Chargement lent — données partielles possibles');
        setDataLoaded(true);
      }
    }, 15000);
    (async () => {
      try {
        if (isDemo) {
          const [store, pricing] = await Promise.all([
            import("@/lib/crm-store"),
            import("@/lib/crm-pricing-2026"),
          ]);
          if (cancelled) return;
          setClients(store.DEMO_CLIENTS);
          setCases(store.DEMO_CASES);
          setAppointments(store.DEMO_APPOINTMENTS);
          setContracts(pricing.DEMO_CONTRACTS);
        } else {
          const svc = await import("@/lib/crm-data-service");
          const [dbClients, dbCases, dbAppts, dbContracts] = await Promise.all([
            svc.fetchClients(), svc.fetchCases(), svc.fetchAppointments(), svc.fetchContracts(),
          ]);
          if (cancelled) return;
          // Validate: warn if Supabase returned empty but we expected data
          if (dbClients.length === 0 && dbCases.length === 0) {
            console.warn('[CRM Layout] Supabase returned 0 clients and 0 cases — possible connection issue');
            setDataLoadError('Base de données: aucun client trouvé. Vérifiez la connexion Supabase.');
          }
          setClients(dbClients);
          setCases(dbCases);
          setAppointments(dbAppts);
          setContracts(dbContracts);
        }
      } catch (err: any) {
        console.error('[CRM Layout] Data load error:', err);
        setDataLoadError(`Erreur de chargement: ${err?.message || 'connexion échouée'}. Les données affichées peuvent être incomplètes.`);
      }
      if (!cancelled) {
        clearTimeout(loadTimeout);
        setDataLoaded(true);
      }
    })();
    return () => { cancelled = true; clearTimeout(loadTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isDemo, dataLoadRetries]);

  // --- Supabase Realtime + Polling (auto-refresh clients & data) ---
  const realtimeTables = useMemo(() => ['clients', 'cases', 'appointments', 'contracts', 'leads'], []);

  const handleRealtimeRefresh = useCallback(async () => {
    if (!currentUser || isDemo) return;
    try {
      const svc = await import("@/lib/crm-data-service");
      const [dbClients, dbCases, dbAppts, dbContracts] = await Promise.all([
        svc.fetchClients(), svc.fetchCases(), svc.fetchAppointments(), svc.fetchContracts(),
      ]);
      setClients(dbClients);
      setCases(dbCases);
      setAppointments(dbAppts);
      setContracts(dbContracts);
    } catch (err) {
      console.error("[CRM Layout] Realtime refresh error:", err);
    }
  }, [currentUser, isDemo]);

  const { refresh: manualRefresh } = useRealtimeSync({
    tables: realtimeTables,
    onRefresh: handleRealtimeRefresh,
    pollingInterval: 30_000, // 30 secondes — sync rapide pour nouveaux clients
    enabled: !!currentUser && !isDemo && dataLoaded,
  });

  // --- Global search ---
  const router = useRouter();
  const [globalSearch, setGlobalSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(globalSearch), 300);
    return () => clearTimeout(timer);
  }, [globalSearch]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSearchResults(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  type SearchResult = { type: 'client' | 'case' | 'employer'; id: string; name: string; subtitle: string; href: string };

  const searchResults: SearchResult[] = (() => {
    if (!debouncedSearch || debouncedSearch.length < 2) return [];
    const q = debouncedSearch.toLowerCase();
    const results: SearchResult[] = [];

    // Search clients by name and email
    for (const c of clients) {
      if (results.length >= 10) break;
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      if (fullName.includes(q) || c.email.toLowerCase().includes(q)) {
        results.push({ type: 'client', id: c.id, name: `${c.firstName} ${c.lastName}`, subtitle: c.email, href: '/crm/clients' });
      }
    }

    // Search cases by title
    for (const cs of cases) {
      if (results.length >= 10) break;
      if (cs.title.toLowerCase().includes(q)) {
        const client = clients.find(c => c.id === cs.clientId);
        results.push({ type: 'case', id: cs.id, name: cs.title, subtitle: client ? `${client.firstName} ${client.lastName}` : '', href: '/crm/dossiers' });
      }
    }

    return results;
  })();

  const handleSearchResultClick = useCallback((result: SearchResult) => {
    setShowSearchResults(false);
    setGlobalSearch('');
    router.push(result.href);
  }, [router]);

  // État du formulaire de login
  // loginMode removed - demo mode disabled for production
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const setCurrentUser = (user: CrmUser | null) => {
    if (user) loginDemo(user);
    else logout();
  };

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2559] via-[#242E6B] to-[#1B2559] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-[#D4A03C] animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  // --- Écran de connexion ---
  if (!currentUser) {
    const handleSupabaseLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginLoading(true);
      setLoginError(null);
      try {
        const success = await login(email, password);
        if (!success) {
          // Wait a tick for useAuth state to update with the real error
          setTimeout(() => {
            setLoginLoading(false);
          }, 100);
          return;
        }
      } catch (err) {
        setLoginError(`Erreur: ${err instanceof Error ? err.message : String(err)}`);
      }
      setLoginLoading(false);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2559] via-[#242E6B] to-[#1B2559] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <svg viewBox="0 0 280 120" width="160" height="69" aria-label="SOS Hub Canada">
                <path d="M10 10 H30 V18 H18 V102 H30 V110 H10 V10Z" fill="#1B2559"/>
                <path d="M250 10 H270 V110 H250 V102 H262 V18 H250 V10Z" fill="#1B2559"/>
                <text x="140" y="72" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="62" fill="#1B2559" letterSpacing="-1">SOS</text>
                <text x="140" y="105" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="36" fill="#D4A03C" letterSpacing="8">HUB</text>
              </svg>
            </div>
            <h1 className="text-sm font-medium text-gray-400 uppercase tracking-wider">CRM Immigration</h1>
          </div>

          {(
            <form onSubmit={handleSupabaseLogin} className="space-y-4">
              {(loginError || error) && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <div className="flex-1">
                    <span>{loginError || error}</span>
                    {(error?.includes('introuvable') || error?.includes('non disponible')) && (
                      <button type="button" onClick={() => window.location.reload()} className="ml-2 underline font-medium hover:text-red-900">
                        Réessayer
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Courriel</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="votre@courriel.ca"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]"
                    required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]"
                    required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {!forgotMode ? (
                <>
                  <button type="submit" disabled={loginLoading}
                    className="w-full py-2.5 bg-[#1B2559] text-white rounded-lg text-sm font-medium hover:bg-[#242E6B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loginLoading ? (<><Loader2 size={16} className="animate-spin" />Connexion en cours...</>) : 'Se connecter'}
                  </button>
                  <button type="button" onClick={() => { setForgotMode(true); setResetSent(false); setResetEmail(email); }}
                    className="w-full text-center text-sm text-[#D4A03C] hover:text-[#b8882f] transition-colors">
                    Mot de passe oublié ?
                  </button>
                </>
              ) : (
                <div className="space-y-3 border-t pt-4">
                  <p className="text-sm text-gray-600 text-center">Entrez votre courriel pour recevoir un lien de réinitialisation</p>
                  {resetSent ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
                      Courriel envoyé ! Vérifiez votre boîte de réception.
                    </div>
                  ) : (
                    <>
                      <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                        placeholder="votre@courriel.ca"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/30 focus:border-[#D4A03C]" />
                      <button type="button" disabled={resetLoading || !resetEmail}
                        onClick={async () => { setResetLoading(true); await resetPassword(resetEmail); setResetSent(true); setResetLoading(false); }}
                        className="w-full py-2.5 bg-[#D4A03C] text-white rounded-lg text-sm font-medium hover:bg-[#b8882f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {resetLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                        Envoyer le lien
                      </button>
                    </>
                  )}
                  <button type="button" onClick={() => setForgotMode(false)}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700">
                    Retour à la connexion
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Demo access panel — visible in dev only */}
          {process.env.NODE_ENV === 'development' && (
            <div className="border-t mt-6 pt-4">
              <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wider">Accès démo</p>
              <DemoLoginPanel loginDemo={loginDemo} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const perms = ROLE_PERMISSIONS[currentUser.role];

  // Breadcrumb generation
  const breadcrumbs = (() => {
    const segmentLabels: Record<string, string> = {
      'crm': 'CRM', 'clients': 'Clients', 'dossiers': 'Dossiers', 'formulaires': 'Formulaires IRCC',
      'calendrier': 'Calendrier', 'contrats': 'Contrats', 'facturation': 'Facturation',
      'analyse-admissibilite': 'Analyse', 'agent-ai': 'SOSIA', 'marketing': 'Marketing',
      'portail-client': 'Portail Client', 'portail-employeurs': 'Employeurs',
      'ressources-humaines': 'RH', 'messagerie': 'Messagerie', 'rapports': 'Rapports',
      'parametres': 'Paramètres', 'backup': 'Sauvegarde',
    };
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, i) => ({
      label: segmentLabels[part] || part,
      href: '/' + parts.slice(0, i + 1).join('/'),
      isLast: i === parts.length - 1,
    }));
  })();

  // Sidebar content (shared between mobile drawer and desktop)
  const sidebarContent = (isMobile: boolean) => (
    <>
      <div className="p-4 border-b border-white/10">
        {!isMobile && collapsed ? (
          <div className="w-10 h-10 flex items-center justify-center mx-auto">
            <svg viewBox="0 0 280 120" width="36" height="16">
              <text x="140" y="72" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="62" fill="#FFFFFF" letterSpacing="-1">SOS</text>
              <text x="140" y="105" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="36" fill="#D4A03C" letterSpacing="8">HUB</text>
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-1">
              <svg viewBox="0 0 280 120" width="120" height="52" aria-label="SOS Hub Canada">
                <path d="M10 10 H30 V18 H18 V102 H30 V110 H10 V10Z" fill="#FFFFFF"/>
                <path d="M250 10 H270 V110 H250 V102 H262 V18 H250 V10Z" fill="#FFFFFF"/>
                <text x="140" y="72" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="62" fill="#FFFFFF" letterSpacing="-1">SOS</text>
                <text x="140" y="105" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="36" fill="#D4A03C" letterSpacing="8">HUB</text>
              </svg>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Relocalisation &amp; Services</p>
            </div>
            {isMobile && (
              <button onClick={() => setMobileOpen(false)} className="p-1 text-white/60 hover:text-white">
                <X size={20} />
              </button>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {NAV.map((entry, idx) => {
          // Separator
          if (isSeparator(entry)) {
            if (!isMobile && collapsed) {
              return <div key={`sep-${idx}`} className="my-2 border-t border-white/10" />;
            }
            return (
              <div key={`sep-${idx}`} className="pt-3 pb-1 px-3">
                {entry.label && <p className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">{entry.label}</p>}
                {!entry.label && <div className="border-t border-white/10" />}
              </div>
            );
          }

          // Check top-level perm
          if (entry.perm && !perms[entry.perm]) return null;

          // Simple nav item
          if (!isGroup(entry)) {
            const item = entry;
            const active = pathname === item.href || (item.href !== "/crm" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active ? "bg-[#D4A03C] text-white shadow-lg shadow-[#D4A03C]/20" : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                title={!isMobile && collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {(isMobile || !collapsed) && <span>{item.label}</span>}
              </Link>
            );
          }

          // Dropdown group
          const group = entry;
          const visibleItems = group.items.filter(i => !i.perm || perms[i.perm]);
          if (visibleItems.length === 0) return null;
          const groupKey = group.groupLabel;
          const groupOpen = openGroups.has(groupKey);
          const groupActive = visibleItems.some(i => pathname === i.href || pathname.startsWith(i.href));

          if (!isMobile && collapsed) {
            // In collapsed mode show first visible item as icon-only
            return visibleItems.map(i => {
              const active = pathname === i.href || pathname.startsWith(i.href);
              return (
                <Link key={i.href} href={i.href} title={i.label}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg transition-all ${
                    active ? "bg-[#D4A03C] text-white shadow-lg shadow-[#D4A03C]/20" : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <i.icon size={18} />
                </Link>
              );
            });
          }

          return (
            <div key={`group-${idx}`}>
              <button
                onClick={() => setOpenGroups(prev => {
                  const next = new Set(prev);
                  if (next.has(groupKey)) next.delete(groupKey); else next.add(groupKey);
                  return next;
                })}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  groupActive && !groupOpen ? "bg-[#D4A03C]/30 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <group.icon size={18} className="shrink-0" />
                <span className="flex-1 text-left">{group.groupLabel}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${groupOpen ? "rotate-180" : ""}`} />
              </button>
              {groupOpen && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                  {visibleItems.map(i => {
                    const active = pathname === i.href || pathname.startsWith(i.href);
                    return (
                      <Link key={i.href} href={i.href}
                        onClick={() => isMobile && setMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          active ? "bg-[#D4A03C] text-white shadow-lg shadow-[#D4A03C]/20" : "text-white/60 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <i.icon size={14} className="shrink-0" />
                        <span>{i.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className={`flex items-center ${!isMobile && collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4A03C] to-[#b8882f] flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-white/20 overflow-hidden">
            {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          {(isMobile || !collapsed) && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{currentUser.name}</div>
              <div className="text-[10px] text-white/40 truncate uppercase tracking-wide">{ROLE_LABELS[currentUser.role]}</div>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setDataLoaded(false); setClients([]); setCases([]); setAppointments([]); setContracts([]);
            logout();
          }}
          className={`mt-3 flex items-center gap-2 text-xs text-white/50 hover:text-red-400 transition-colors ${!isMobile && collapsed ? "justify-center w-full" : ""}`}
        >
          <LogOut size={14} />
          {(isMobile || !collapsed) && <span>Déconnexion</span>}
        </button>
      </div>
    </>
  );

  return (
    <CrmContext.Provider value={{ currentUser, clients, cases, appointments, contracts, setCurrentUser, setClients, setCases, setAppointments, setContracts, refreshData: manualRefresh }}>
      <div className="min-h-screen bg-gray-50 flex">

        {/* Mobile backdrop */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Mobile sidebar drawer */}
        <aside className={`fixed inset-y-0 left-0 w-72 bg-[#1B2559] text-white flex flex-col z-50 transform transition-transform duration-300 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {sidebarContent(true)}
        </aside>

        {/* Desktop sidebar */}
        <aside className={`${collapsed ? "w-16" : "w-64"} bg-[#1B2559] text-white flex-col transition-all duration-300 fixed h-full z-40 hidden md:flex`}>
          {sidebarContent(false)}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-[#1B2559] border-2 border-gray-200 rounded-full flex items-center justify-center text-white hover:bg-[#D4A03C] transition-colors"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </aside>

        {/* Main content */}
        <div className={`flex-1 transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-64"}`}>
          <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 md:px-6 sticky top-0 z-30">
            {/* Mobile hamburger */}
            <button className="p-2 -ml-2 mr-2 text-gray-600 hover:text-gray-900 md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>

            <div className="flex-1 flex items-center gap-3">
              {/* Breadcrumbs — desktop only */}
              <nav className="hidden lg:flex items-center gap-1 text-xs text-gray-400 mr-4">
                {breadcrumbs.map((bc, i) => (
                  <span key={bc.href} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight size={12} className="text-gray-300" />}
                    {bc.isLast ? (
                      <span className="text-gray-700 font-medium">{bc.label}</span>
                    ) : (
                      <Link href={bc.href} className="hover:text-[#1B2559] transition-colors">{bc.label}</Link>
                    )}
                  </span>
                ))}
              </nav>
              <div className="relative flex-1 max-w-sm" ref={searchRef}>
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={e => { setGlobalSearch(e.target.value); setShowSearchResults(true); }}
                  onFocus={() => { if (globalSearch.length >= 2) setShowSearchResults(true); }}
                  placeholder="Rechercher... ⌘K"
                  className="pl-9 pr-4 py-1.5 bg-gray-100 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#D4A03C]/30 focus:bg-white border border-transparent focus:border-[#D4A03C]/30"
                />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-full md:w-96 bg-white rounded-xl border border-gray-200 shadow-xl z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((r) => (
                      <button
                        key={`${r.type}-${r.id}`}
                        onClick={() => handleSearchResultClick(r)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#EAEDF5' }}>
                          {r.type === 'client' && <Users size={14} style={{ color: '#1B2559' }} />}
                          {r.type === 'case' && <FolderOpen size={14} style={{ color: '#1B2559' }} />}
                          {r.type === 'employer' && <Building2 size={14} style={{ color: '#1B2559' }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{r.name}</div>
                          <div className="text-xs text-gray-500 truncate">{r.subtitle}</div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium uppercase shrink-0">
                          {r.type === 'client' ? 'Client' : r.type === 'case' ? 'Dossier' : 'Employeur'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {showSearchResults && debouncedSearch.length >= 2 && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 mt-1 w-full md:w-96 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-4 text-center text-sm text-gray-500">
                    Aucun résultat pour &laquo; {debouncedSearch} &raquo;
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                className="relative p-2 text-gray-400 hover:text-gray-600"
                onClick={() => setNotifPanelOpen(true)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-700">{currentUser.name}</div>
                <div className="text-xs text-gray-400">{ROLE_LABELS[currentUser.role]}</div>
              </div>
            </div>
          </header>
          {dataLoadError && (
            <div className="mx-4 mt-4 md:mx-6 md:mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                <span>{dataLoadError}</span>
              </div>
              <button
                onClick={() => { setDataLoaded(false); setDataLoadError(null); setDataLoadRetries(r => r + 1); }}
                className="px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 transition-colors flex-shrink-0"
              >
                Réessayer
              </button>
            </div>
          )}
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
      <NotificationPanel
        isOpen={notifPanelOpen}
        onClose={() => setNotifPanelOpen(false)}
        userId={currentUser.id}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </CrmContext.Provider>
  );
}
