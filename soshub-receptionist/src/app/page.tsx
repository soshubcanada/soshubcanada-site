'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import {
  Phone, PhoneIncoming, PhoneMissed, PhoneOff, Voicemail,
  Users, UserPlus, TrendingUp, Clock, Bot, Settings, BarChart3,
  ChevronRight, Search, Filter, Play, Pause, ArrowRight,
  Globe, Mic, Brain, Shield, Zap, Star, Check, X,
  MessageSquare, Mail, Calendar, FileText, AlertTriangle,
  Volume2, Languages, Route, CreditCard, Building2, Headphones,
  CircleDot, ArrowUpRight, RefreshCw, Tag, ExternalLink,
  Sun, Moon, Bell, ChevronDown, Menu, Home, DollarSign
} from 'lucide-react'
import {
  demoCalls, demoLeads, demoRecap, demoRoutingRules, demoBusinessHours,
  teamMembers, formatDuration, formatTime, formatDate,
  type Call, type Lead
} from '@/lib/demo-data'

type View = 'dashboard' | 'calls' | 'leads' | 'routing' | 'settings' | 'analytics' | 'pricing'

// Toast context
type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' }
const ToastContext = createContext<{ addToast: (message: string, type?: Toast['type']) => void }>({ addToast: () => {} })

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`animate-slide-up px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${
            t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-brand-600'
          }`}>
            {t.type === 'success' ? <Check className="w-4 h-4" /> : t.type === 'error' ? <X className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function useToast() { return useContext(ToastContext) }

// Settings types
interface AISettings {
  aiName: string
  companyName: string
  greeting: string
  activeVoice: number
  languages: { lang: string; code: string; flag: string; active: boolean }[]
  integrations: { name: string; desc: string; connected: boolean }[]
  websiteUrl: string
  pagesIndexed: number
  scenarios: number
}

interface RoutingSettings {
  businessHours: { day: string; enabled: boolean; start: string; end: string }[]
  rules: { id: string; name: string; condition: string; action: string; destination: string; priority: number; active: boolean }[]
  vipContacts: { name: string; phone: string }[]
}

const DEFAULT_AI_SETTINGS: AISettings = {
  aiName: 'Sarah',
  companyName: 'SOS Hub Canada',
  greeting: "SOS Hub Canada, bonjour! Je suis Sarah, votre assistante virtuelle. Comment puis-je vous aider aujourd'hui?",
  activeVoice: 0,
  languages: [
    { lang: 'Francais', code: 'FR', flag: '\u{1F1EB}\u{1F1F7}', active: true },
    { lang: 'English', code: 'EN', flag: '\u{1F1EC}\u{1F1E7}', active: true },
    { lang: 'Espanol', code: 'ES', flag: '\u{1F1EA}\u{1F1F8}', active: true },
    { lang: 'Arabe', code: 'AR', flag: '\u{1F1F8}\u{1F1E6}', active: true },
  ],
  integrations: [
    { name: 'SOS Hub CRM', desc: 'Sync automatique des leads et contacts', connected: true },
    { name: 'Google Calendar', desc: 'Prise de rendez-vous automatique', connected: true },
    { name: 'Gmail / Outlook', desc: 'Brouillons de reponses par email', connected: true },
    { name: 'HubSpot', desc: 'CRM externe et marketing', connected: false },
    { name: 'Zapier', desc: '7,000+ integrations supplementaires', connected: false },
    { name: 'Square', desc: 'Paiements et facturation', connected: true },
  ],
  websiteUrl: 'soshubcanada.com',
  pagesIndexed: 47,
  scenarios: 12,
}

const DEFAULT_ROUTING: RoutingSettings = {
  businessHours: [
    { day: 'Lundi', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Mardi', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Mercredi', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Jeudi', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Vendredi', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Samedi', enabled: false, start: '10:00', end: '14:00' },
    { day: 'Dimanche', enabled: false, start: '', end: '' },
  ],
  rules: [...demoRoutingRules],
  vipContacts: [
    { name: 'Sophie Tremblay', phone: '+1 514-555-0789' },
    { name: 'Carlos Rodriguez', phone: '+1 514-555-0147' },
  ],
}

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS)
  const [routingSettings, setRoutingSettings] = useState<RoutingSettings>(DEFAULT_ROUTING)

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 flex items-center gap-3 border-b border-slate-700">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-sm">SOS Hub</h1>
              <p className="text-xs text-slate-400">Receptionniste IA</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: 'dashboard' as View, icon: Home, label: 'Tableau de bord' },
            { id: 'calls' as View, icon: Phone, label: 'Appels' },
            { id: 'leads' as View, icon: Users, label: 'Leads & CRM' },
            { id: 'routing' as View, icon: Route, label: 'Routage' },
            { id: 'analytics' as View, icon: BarChart3, label: 'Analytique' },
            { id: 'settings' as View, icon: Settings, label: 'Parametres IA' },
            { id: 'pricing' as View, icon: CreditCard, label: 'Tarification' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSelectedCall(null); setSelectedLead(null) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                view === item.id
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 live-pulse" />
              </div>
              <span className="text-xs text-emerald-400 font-medium">IA Active - 24/7</span>
            </div>
            <p className="text-xs text-slate-500">v1.0.0 - SOS Hub Canada</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h2 className="font-semibold text-slate-900">
                {{ dashboard: 'Tableau de bord', calls: 'Journal des appels', leads: 'Leads & CRM', routing: 'Routage intelligent', analytics: 'Analytique & Recap', settings: 'Parametres IA', pricing: 'Tarification' }[view]}
              </h2>
              <p className="text-xs text-slate-500">{formatDate('2026-03-26')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">1 appel en cours</span>
            </div>
            <button className="relative p-2 hover:bg-slate-100 rounded-lg">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <div className="p-6">
          {view === 'dashboard' && <DashboardView onViewCall={(c) => { setSelectedCall(c); setView('calls') }} onViewLead={(l) => { setSelectedLead(l); setView('leads') }} />}
          {view === 'calls' && <CallsView selectedCall={selectedCall} onSelectCall={setSelectedCall} />}
          {view === 'leads' && <LeadsView selectedLead={selectedLead} onSelectLead={setSelectedLead} />}
          {view === 'routing' && <RoutingView settings={routingSettings} onChange={setRoutingSettings} />}
          {view === 'analytics' && <AnalyticsView />}
          {view === 'settings' && <SettingsView settings={aiSettings} onChange={setAiSettings} />}
          {view === 'pricing' && <PricingView />}
        </div>
      </main>
      </div>
    </ToastProvider>
  )
}

/* ============================================
   DASHBOARD VIEW
   ============================================ */
function DashboardView({ onViewCall, onViewLead }: { onViewCall: (c: Call) => void; onViewLead: (l: Lead) => void }) {
  const liveCall = demoCalls.find(c => c.status === 'in-progress')
  const stats = [
    { label: 'Appels aujourd\'hui', value: '7', change: '+23%', icon: Phone, color: 'bg-brand-50 text-brand-600' },
    { label: 'Leads captures', value: '5', change: '+67%', icon: UserPlus, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Syncs CRM', value: '5/5', change: '100%', icon: RefreshCw, color: 'bg-purple-50 text-purple-600' },
    { label: 'Duree moyenne', value: '3:57', change: '-12%', icon: Clock, color: 'bg-amber-50 text-amber-500' },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Live Call Banner */}
      {liveCall && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Phone className="w-6 h-6 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Appel en cours</p>
              <p className="font-bold text-lg">{liveCall.callerName}</p>
              <p className="text-emerald-100 text-sm">{liveCall.callerPhone} &middot; Route vers {liveCall.routedTo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">02:34</span>
            <button className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{s.change}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Calls */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Derniers appels</h3>
            <span className="text-xs text-slate-500">{demoCalls.length} appels</span>
          </div>
          <div className="divide-y divide-slate-100">
            {demoCalls.slice(0, 5).map(call => (
              <button key={call.id} onClick={() => onViewCall(call)} className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  call.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                  call.status === 'missed' ? 'bg-red-50 text-red-500' :
                  call.status === 'in-progress' ? 'bg-brand-50 text-brand-600' :
                  'bg-amber-50 text-amber-500'
                }`}>
                  {call.status === 'completed' ? <PhoneIncoming className="w-4 h-4" /> :
                   call.status === 'missed' ? <PhoneMissed className="w-4 h-4" /> :
                   call.status === 'in-progress' ? <Phone className="w-4 h-4 animate-pulse" /> :
                   <Voicemail className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-slate-900 truncate">{call.callerName}</p>
                    {call.isVIP && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{call.summary.slice(0, 60)}...</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-slate-700">{formatTime(call.timestamp)}</p>
                  <p className="text-xs text-slate-400">{formatDuration(call.duration)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* New Leads */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Nouveaux leads</h3>
            <span className="text-xs text-slate-500">{demoLeads.length} leads</span>
          </div>
          <div className="divide-y divide-slate-100">
            {demoLeads.map(lead => (
              <button key={lead.id} onClick={() => onViewLead(lead)} className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{lead.name}</p>
                  <p className="text-xs text-slate-500 truncate">{lead.service}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    lead.score >= 90 ? 'bg-emerald-50 text-emerald-700' :
                    lead.score >= 75 ? 'bg-brand-50 text-brand-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    Score: {lead.score}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{lead.budget}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items from Daily Recap */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-xl border border-amber-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-amber-900">Actions requises aujourd'hui</h3>
        </div>
        <div className="space-y-2">
          {demoRecap.actionItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/60 rounded-lg p-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                i === 0 ? 'bg-red-500 text-white' : 'bg-amber-200 text-amber-800'
              }`}>
                {i + 1}
              </div>
              <p className="text-sm text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Equipe disponible</h3>
        <div className="grid grid-cols-3 gap-3">
          {teamMembers.map((member, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className={`w-2.5 h-2.5 rounded-full ${member.available ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <div>
                <p className="text-sm font-medium text-slate-900">{member.name}</p>
                <p className="text-xs text-slate-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================
   CALLS VIEW
   ============================================ */
function CallsView({ selectedCall, onSelectCall }: { selectedCall: Call | null; onSelectCall: (c: Call | null) => void }) {
  const [filter, setFilter] = useState<string>('all')
  const filtered = filter === 'all' ? demoCalls : demoCalls.filter(c => c.status === filter)

  return (
    <div className="flex gap-6 animate-slide-up">
      {/* Call List */}
      <div className={`${selectedCall ? 'w-2/5' : 'w-full'} space-y-4 transition-all`}>
        <div className="flex items-center gap-3">
          {['all', 'completed', 'missed', 'voicemail', 'in-progress'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>
              {f === 'all' ? 'Tous' : f === 'completed' ? 'Completes' : f === 'missed' ? 'Manques' : f === 'voicemail' ? 'Vocaux' : 'En cours'}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map(call => (
            <button key={call.id} onClick={() => onSelectCall(call)}
              className={`w-full bg-white rounded-xl border p-4 flex items-center gap-4 text-left transition-all hover:shadow-md ${
                selectedCall?.id === call.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
              }`}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                call.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                call.status === 'missed' ? 'bg-red-50 text-red-500' :
                call.status === 'in-progress' ? 'bg-brand-50 text-brand-600' :
                'bg-amber-50 text-amber-500'
              }`}>
                {call.status === 'completed' ? <PhoneIncoming className="w-5 h-5" /> :
                 call.status === 'missed' ? <PhoneMissed className="w-5 h-5" /> :
                 call.status === 'in-progress' ? <Phone className="w-5 h-5 animate-pulse" /> :
                 <Voicemail className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{call.callerName}</p>
                  {call.isVIP && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  {call.sentiment === 'negative' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
                <p className="text-sm text-slate-500">{call.callerPhone}</p>
                <p className="text-xs text-slate-400 mt-1 truncate">{call.summary.slice(0, 80)}...</p>
                <div className="flex items-center gap-2 mt-2">
                  {call.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 rounded-full text-xs text-slate-600">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <p className="text-sm font-medium text-slate-700">{formatTime(call.timestamp)}</p>
                <p className="text-xs text-slate-400">{formatDuration(call.duration)}</p>
                <div className="flex items-center gap-1 justify-end mt-1">
                  {call.leadCaptured && <UserPlus className="w-3.5 h-3.5 text-emerald-500" />}
                  {call.crmSynced && <RefreshCw className="w-3.5 h-3.5 text-brand-500" />}
                </div>
                <span className={`inline-block w-2 h-2 rounded-full ${
                  call.language === 'fr' ? 'bg-brand-500' :
                  call.language === 'en' ? 'bg-red-400' :
                  call.language === 'es' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} title={call.language.toUpperCase()} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Call Detail */}
      {selectedCall && (
        <div className="w-3/5 bg-white rounded-xl border border-slate-200 overflow-y-auto max-h-[calc(100vh-160px)] sticky top-0">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedCall.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600' :
                  selectedCall.sentiment === 'negative' ? 'bg-red-50 text-red-500' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{selectedCall.callerName}</h3>
                    {selectedCall.isVIP && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">VIP</span>}
                  </div>
                  <p className="text-sm text-slate-500">{selectedCall.callerPhone} {selectedCall.callerEmail && `| ${selectedCall.callerEmail}`}</p>
                </div>
              </div>
              <button onClick={() => onSelectCall(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">{formatTime(selectedCall.timestamp)}</span>
              <span className="text-slate-500">{formatDuration(selectedCall.duration)}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                selectedCall.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                selectedCall.status === 'missed' ? 'bg-red-50 text-red-700' :
                selectedCall.status === 'in-progress' ? 'bg-brand-50 text-brand-700' :
                'bg-amber-50 text-amber-700'
              }`}>
                {selectedCall.status === 'completed' ? 'Complete' : selectedCall.status === 'missed' ? 'Manque' : selectedCall.status === 'in-progress' ? 'En cours' : 'Message vocal'}
              </span>
              <span className="text-slate-400">{selectedCall.language.toUpperCase()}</span>
              {selectedCall.routedTo && <span className="text-slate-500">Route: {selectedCall.routedTo}</span>}
            </div>
          </div>

          {/* AI Summary */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-500" />
              <h4 className="font-semibold text-slate-900 text-sm">Resume IA</h4>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{selectedCall.summary}</p>
          </div>

          {/* Next Steps */}
          {selectedCall.nextSteps.length > 0 && (
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight className="w-4 h-4 text-brand-500" />
                <h4 className="font-semibold text-slate-900 text-sm">Prochaines etapes</h4>
              </div>
              <div className="space-y-2">
                {selectedCall.nextSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-slate-500" />
              <h4 className="font-semibold text-slate-900 text-sm">Tags</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCall.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-700 font-medium">{tag}</span>
              ))}
            </div>
          </div>

          {/* CRM Status */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                selectedCall.leadCaptured ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                <UserPlus className="w-3.5 h-3.5" />
                {selectedCall.leadCaptured ? 'Lead capture' : 'Pas de lead'}
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                selectedCall.crmSynced ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500'
              }`}>
                <RefreshCw className="w-3.5 h-3.5" />
                {selectedCall.crmSynced ? 'Sync CRM' : 'Non synchronise'}
              </div>
            </div>
          </div>

          {/* Transcript */}
          {selectedCall.transcript && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-slate-500" />
                <h4 className="font-semibold text-slate-900 text-sm">Transcription</h4>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                {selectedCall.transcript.split('\n').map((line, i) => (
                  <p key={i} className={`text-xs leading-relaxed mb-1 ${
                    line.includes('IA:') || line.includes('AI:') ? 'text-brand-700 font-medium' : 'text-slate-600'
                  }`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ============================================
   LEADS VIEW
   ============================================ */
function LeadsView({ selectedLead, onSelectLead }: { selectedLead: Lead | null; onSelectLead: (l: Lead | null) => void }) {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Pipeline Summary */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Nouveaux', count: demoLeads.filter(l => l.status === 'new').length, color: 'bg-brand-500' },
          { label: 'Contactes', count: demoLeads.filter(l => l.status === 'contacted').length, color: 'bg-amber-500' },
          { label: 'Qualifies', count: demoLeads.filter(l => l.status === 'qualified').length, color: 'bg-purple-500' },
          { label: 'Convertis', count: demoLeads.filter(l => l.status === 'converted').length, color: 'bg-emerald-500' },
          { label: 'Perdus', count: demoLeads.filter(l => l.status === 'lost').length, color: 'bg-red-500' },
        ].map((stage, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className={`w-3 h-3 rounded-full ${stage.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-slate-900">{stage.count}</p>
            <p className="text-xs text-slate-500">{stage.label}</p>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Tous les leads</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Auto-capture par IA</span>
            <span className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-full">Sync CRM actif</span>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Assigne a</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {demoLeads.map(lead => (
              <tr key={lead.id} onClick={() => onSelectLead(lead)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{lead.name}</p>
                    <p className="text-xs text-slate-500">{lead.email || lead.phone}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{lead.service}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{lead.budget}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        lead.score >= 90 ? 'bg-emerald-500' : lead.score >= 75 ? 'bg-brand-500' : 'bg-amber-500'
                      }`} style={{ width: `${lead.score}%` }} />
                    </div>
                    <span className="text-xs font-medium text-slate-700">{lead.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    lead.status === 'new' ? 'bg-brand-50 text-brand-700' :
                    lead.status === 'contacted' ? 'bg-amber-50 text-amber-700' :
                    lead.status === 'qualified' ? 'bg-purple-50 text-purple-700' :
                    lead.status === 'converted' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {lead.status === 'new' ? 'Nouveau' : lead.status === 'contacted' ? 'Contacte' : lead.status === 'qualified' ? 'Qualifie' : lead.status === 'converted' ? 'Converti' : 'Perdu'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{lead.assignedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-8" onClick={() => onSelectLead(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedLead.name}</h3>
                <p className="text-sm text-slate-500">{selectedLead.phone} | {selectedLead.email}</p>
              </div>
              <button onClick={() => onSelectLead(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Service</p>
                  <p className="text-sm font-medium text-slate-900">{selectedLead.service}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Budget estime</p>
                  <p className="text-sm font-medium text-slate-900">{selectedLead.budget}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Score</p>
                  <p className="text-sm font-medium text-slate-900">{selectedLead.score}/100</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Source</p>
                  <p className="text-sm font-medium text-slate-900">{selectedLead.source}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Notes IA</p>
                <p className="text-sm text-slate-700">{selectedLead.notes}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Voir dans CRM
                </button>
                <button className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> Rappeler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================
   ROUTING VIEW (EDITABLE)
   ============================================ */
function RoutingView({ settings, onChange }: { settings: RoutingSettings; onChange: (s: RoutingSettings) => void }) {
  const { addToast } = useToast()
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [newVipName, setNewVipName] = useState('')
  const [newVipPhone, setNewVipPhone] = useState('')
  const [showAddRule, setShowAddRule] = useState(false)
  const [newRule, setNewRule] = useState({ name: '', condition: '', action: 'Transferer', destination: '', priority: 5 })

  const toggleDay = (i: number) => {
    const updated = { ...settings, businessHours: settings.businessHours.map((h, idx) => idx === i ? { ...h, enabled: !h.enabled } : h) }
    onChange(updated)
    addToast(`${settings.businessHours[i].day} ${!settings.businessHours[i].enabled ? 'active' : 'desactive'}`)
  }

  const updateHours = (i: number, field: 'start' | 'end', value: string) => {
    const updated = { ...settings, businessHours: settings.businessHours.map((h, idx) => idx === i ? { ...h, [field]: value } : h) }
    onChange(updated)
  }

  const toggleRule = (id: string) => {
    const updated = { ...settings, rules: settings.rules.map(r => r.id === id ? { ...r, active: !r.active } : r) }
    onChange(updated)
    const rule = settings.rules.find(r => r.id === id)!
    addToast(`Regle "${rule.name}" ${!rule.active ? 'activee' : 'desactivee'}`)
  }

  const deleteRule = (id: string) => {
    const rule = settings.rules.find(r => r.id === id)!
    const updated = { ...settings, rules: settings.rules.filter(r => r.id !== id) }
    onChange(updated)
    addToast(`Regle "${rule.name}" supprimee`, 'info')
  }

  const addRule = () => {
    if (!newRule.name || !newRule.condition || !newRule.destination) { addToast('Remplir tous les champs', 'error'); return }
    const rule = { ...newRule, id: `rule-${Date.now()}`, active: true }
    onChange({ ...settings, rules: [...settings.rules, rule].sort((a, b) => a.priority - b.priority) })
    setNewRule({ name: '', condition: '', action: 'Transferer', destination: '', priority: 5 })
    setShowAddRule(false)
    addToast(`Regle "${rule.name}" ajoutee`)
  }

  const addVip = () => {
    if (!newVipName || !newVipPhone) { addToast('Nom et telephone requis', 'error'); return }
    onChange({ ...settings, vipContacts: [...settings.vipContacts, { name: newVipName, phone: newVipPhone }] })
    setNewVipName(''); setNewVipPhone('')
    addToast(`${newVipName} ajoute aux VIP`)
  }

  const removeVip = (i: number) => {
    const name = settings.vipContacts[i].name
    onChange({ ...settings, vipContacts: settings.vipContacts.filter((_, idx) => idx !== i) })
    addToast(`${name} retire des VIP`, 'info')
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Business Hours - Editable */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-slate-900">Heures d'ouverture</h3>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full ml-auto">IA active 24/7 en dehors des heures</span>
        </div>
        <div className="space-y-2">
          {settings.businessHours.map((day, i) => (
            <div key={i} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${day.enabled ? 'border-brand-200 bg-brand-50/50' : 'border-slate-200 bg-slate-50'}`}>
              <button onClick={() => toggleDay(i)} className={`w-10 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${day.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${day.enabled ? 'translate-x-4' : ''}`} />
              </button>
              <span className={`text-sm font-medium w-24 ${day.enabled ? 'text-slate-900' : 'text-slate-400'}`}>{day.day}</span>
              {day.enabled ? (
                <div className="flex items-center gap-2">
                  <input type="time" value={day.start} onChange={e => updateHours(i, 'start', e.target.value)}
                    className="px-2 py-1 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                  <span className="text-slate-400">a</span>
                  <input type="time" value={day.end} onChange={e => updateHours(i, 'end', e.target.value)}
                    className="px-2 py-1 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
              ) : (
                <span className="text-sm text-slate-400">Ferme - IA repond</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Routing Rules - Editable */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Regles de routage intelligent</h3>
          </div>
          <button onClick={() => setShowAddRule(!showAddRule)} className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition-colors">
            {showAddRule ? 'Annuler' : '+ Ajouter une regle'}
          </button>
        </div>

        {showAddRule && (
          <div className="p-4 bg-brand-50 border-b border-brand-200">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input placeholder="Nom de la regle" value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white" />
              <input placeholder="Condition (ex: Mots-cles: asile)" value={newRule.condition} onChange={e => setNewRule({...newRule, condition: e.target.value})}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white" />
              <select value={newRule.action} onChange={e => setNewRule({...newRule, action: e.target.value})}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                <option>Transferer</option>
                <option>Transferer directement</option>
                <option>IA repond + capture lead</option>
                <option>Message vocal + SMS</option>
              </select>
              <input placeholder="Destination (ex: Patrick Cadet)" value={newRule.destination} onChange={e => setNewRule({...newRule, destination: e.target.value})}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white" />
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Priorite:</label>
                <input type="number" min="0" max="99" value={newRule.priority} onChange={e => setNewRule({...newRule, priority: parseInt(e.target.value) || 0})}
                  className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white" />
              </div>
              <button onClick={addRule} className="py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                Ajouter
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {settings.rules.map(rule => (
            <div key={rule.id} className="p-4 flex items-center gap-4 group">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                {rule.priority}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-slate-900">{rule.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">Si: {rule.condition} &rarr; {rule.action} &rarr; {rule.destination}</p>
              </div>
              <button onClick={() => deleteRule(rule.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                <X className="w-4 h-4" />
              </button>
              <button onClick={() => toggleRule(rule.id)} className={`w-10 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${rule.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${rule.active ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* VIP Contacts - Editable */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900">Contacts VIP</h3>
          <span className="text-xs text-slate-500 ml-auto">L'IA ne repond jamais - transfert direct</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {settings.vipContacts.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200 group">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">{c.phone}</p>
              </div>
              <button onClick={() => removeVip(i)} className="p-1 rounded-lg text-red-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <Star className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input placeholder="Nom du contact" value={newVipName} onChange={e => setNewVipName(e.target.value)}
            className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white" />
          <input placeholder="+1 514-555-0000" value={newVipPhone} onChange={e => setNewVipPhone(e.target.value)}
            className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white" />
          <button onClick={addVip} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors">
            Ajouter VIP
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   ANALYTICS VIEW
   ============================================ */
function AnalyticsView() {
  const recap = demoRecap
  const totalSentiment = recap.sentiment.positive + recap.sentiment.neutral + recap.sentiment.negative

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Daily Recap Header */}
      <div className="bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="w-6 h-6" />
          <h3 className="text-lg font-bold">Recap quotidien IA - {formatDate(recap.date)}</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total appels', value: recap.totalCalls },
            { label: 'Repondus', value: recap.answered },
            { label: 'Manques', value: recap.missed },
            { label: 'Messages vocaux', value: recap.voicemails },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Analyse de sentiment</h3>
          <div className="space-y-3">
            {[
              { label: 'Positif', value: recap.sentiment.positive, total: totalSentiment, color: 'bg-emerald-500' },
              { label: 'Neutre', value: recap.sentiment.neutral, total: totalSentiment, color: 'bg-slate-400' },
              { label: 'Negatif', value: recap.sentiment.negative, total: totalSentiment, color: 'bg-red-500' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700">{s.label}</span>
                  <span className="font-medium text-slate-900">{s.value} ({Math.round(s.value / s.total * 100)}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${s.value / s.total * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Issues */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Sujets principaux</h3>
          <div className="space-y-3">
            {recap.topIssues.map((issue, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-xs font-bold text-brand-700">
                  {issue.count}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{issue.issue}</p>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${issue.count / recap.totalCalls * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Metriques de performance</h3>
          <div className="space-y-4">
            {[
              { label: 'Taux de reponse', value: '86%', bar: 86, color: 'bg-emerald-500' },
              { label: 'Taux capture lead', value: '71%', bar: 71, color: 'bg-brand-500' },
              { label: 'Sync CRM reussi', value: '100%', bar: 100, color: 'bg-purple-500' },
              { label: 'Satisfaction client', value: '4.7/5', bar: 94, color: 'bg-amber-500' },
            ].map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{m.label}</span>
                  <span className="font-bold text-slate-900">{m.value}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.bar}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Attribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Revenus potentiels (leads du jour)</h3>
          <div className="space-y-3">
            {demoLeads.map((lead, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.service}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">{lead.budget}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-3 mt-3 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Pipeline total</span>
              <span className="text-lg font-bold text-emerald-600">64 355 $ - 79 955 $</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   SETTINGS VIEW (EDITABLE)
   ============================================ */
function SettingsView({ settings, onChange }: { settings: AISettings; onChange: (s: AISettings) => void }) {
  const { addToast } = useToast()
  const [hasChanges, setHasChanges] = useState(false)
  const [retraining, setRetraining] = useState(false)
  const voices = [
    { name: 'Sarah (FR)', desc: 'Professionnelle, chaleureuse' },
    { name: 'Emma (EN)', desc: 'Professional, friendly' },
    { name: 'Lucia (ES)', desc: 'Profesional, amable' },
  ]

  const update = (partial: Partial<AISettings>) => {
    onChange({ ...settings, ...partial })
    setHasChanges(true)
  }

  const save = () => {
    setHasChanges(false)
    addToast('Parametres IA sauvegardes')
  }

  const toggleLanguage = (i: number) => {
    const langs = settings.languages.map((l, idx) => idx === i ? { ...l, active: !l.active } : l)
    if (langs.filter(l => l.active).length === 0) { addToast('Au moins une langue requise', 'error'); return }
    update({ languages: langs })
    addToast(`${settings.languages[i].lang} ${!settings.languages[i].active ? 'active' : 'desactive'}`)
  }

  const toggleIntegration = (i: number) => {
    const integrations = settings.integrations.map((int, idx) => idx === i ? { ...int, connected: !int.connected } : int)
    update({ integrations })
    addToast(`${settings.integrations[i].name} ${!settings.integrations[i].connected ? 'connecte' : 'deconnecte'}`)
  }

  const retrain = () => {
    setRetraining(true)
    addToast('Re-entrainement lance...', 'info')
    setTimeout(() => { setRetraining(false); addToast('IA re-entrainee avec succes') }, 2500)
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl">
      {/* Save Bar */}
      {hasChanges && (
        <div className="sticky top-0 z-10 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Modifications non sauvegardees</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onChange(DEFAULT_AI_SETTINGS); setHasChanges(false); addToast('Modifications annulees', 'info') }}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
            <button onClick={save}
              className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1">
              <Check className="w-4 h-4" /> Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* AI Identity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-slate-900">Identite de l'IA</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la receptionniste</label>
            <input type="text" value={settings.aiName} onChange={e => update({ aiName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'entreprise</label>
            <input type="text" value={settings.companyName} onChange={e => update({ companyName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Message d'accueil</label>
            <textarea value={settings.greeting} onChange={e => update({ greeting: e.target.value })} rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none" />
            <p className="text-xs text-slate-400 mt-1">{settings.greeting.length} caracteres</p>
          </div>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-slate-900">Voix & Ton</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {voices.map((voice, i) => (
            <button key={i} onClick={() => { update({ activeVoice: i }); addToast(`Voix "${voice.name}" selectionnee`) }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${settings.activeVoice === i ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-slate-900">{voice.name}</span>
                {settings.activeVoice === i && <Check className="w-4 h-4 text-brand-600" />}
              </div>
              <p className="text-xs text-slate-500">{voice.desc}</p>
              <span className="mt-2 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700">
                <Play className="w-3 h-3" /> Ecouter
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Languages className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-900">Langues supportees</h3>
          <span className="text-xs text-slate-500 ml-auto">{settings.languages.filter(l => l.active).length} actives</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {settings.languages.map((l, i) => (
            <button key={i} onClick={() => toggleLanguage(i)}
              className={`p-3 rounded-lg border text-center transition-all ${l.active ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100' : 'border-slate-200 bg-slate-50 opacity-50 hover:opacity-75'}`}>
              <p className="text-2xl mb-1">{l.flag}</p>
              <p className="text-sm font-medium text-slate-900">{l.lang}</p>
              <p className="text-xs text-slate-500">{l.code}</p>
              <div className={`mt-2 w-6 h-3.5 rounded-full mx-auto p-0.5 transition-colors ${l.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${l.active ? 'translate-x-2.5' : ''}`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Website Training */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-slate-900">Entrainement IA</h3>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full ml-auto">Entraine le 26 mars 2026</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Globe className="w-4 h-4 text-slate-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Site web indexe</p>
              <div className="flex items-center gap-2 mt-1">
                <input type="text" value={settings.websiteUrl} onChange={e => update({ websiteUrl: e.target.value })}
                  className="px-2 py-1 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-brand-500 outline-none w-48" />
                <span className="text-xs text-slate-500">- {settings.pagesIndexed} pages indexees</span>
              </div>
            </div>
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <FileText className="w-4 h-4 text-slate-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Base de connaissances</p>
              <p className="text-xs text-slate-500">45+ programmes immigration, grille tarifaire 2026, FAQ</p>
            </div>
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Scripts personnalises</p>
              <p className="text-xs text-slate-500">{settings.scenarios} scenarios configures (asile, PEQ, EE, EIMT, etc.)</p>
            </div>
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <button onClick={retrain} disabled={retraining}
          className={`mt-4 w-full py-2.5 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${retraining ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>
          <RefreshCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
          {retraining ? 'Re-entrainement en cours...' : 'Re-entrainer l\'IA'}
        </button>
      </div>

      {/* Integrations */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900">Integrations</h3>
          <span className="text-xs text-slate-500 ml-auto">{settings.integrations.filter(i => i.connected).length}/{settings.integrations.length} connectees</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {settings.integrations.map((int, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 group">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${int.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{int.name}</p>
                <p className="text-xs text-slate-500">{int.desc}</p>
              </div>
              <button onClick={() => toggleIntegration(i)}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${int.connected ? 'bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-600' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}>
                {int.connected ? 'Connecte' : 'Connecter'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-900">Securite & Conformite</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Chiffrement TLS 1.3', active: true },
            { label: 'SOC 2 Type II', active: true },
            { label: 'LPRPDE / PIPEDA', active: true },
            { label: 'Loi 25 Quebec', active: true },
            { label: 'Stockage AWS Canada', active: true },
            { label: 'Retention 90 jours', active: true },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 p-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-slate-700">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================
   PRICING VIEW
   ============================================ */
function PricingView() {
  const TPS_RATE = 0.05 // 5% TPS federal
  const TVQ_RATE = 0.09975 // 9.975% TVQ Quebec
  const [includeTPS, setIncludeTPS] = useState(true)
  const [includeTVQ, setIncludeTVQ] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [taxExemptNumber, setTaxExemptNumber] = useState('')
  const [showTaxExempt, setShowTaxExempt] = useState(false)

  const plans = [
    { name: 'Starter', desc: 'Pour les consultants independants', price: 29.99, featured: false, dark: false,
      features: ['1 ligne telephonique', 'IA receptionniste 24/7', 'Capture de leads automatique', "Resumes d'appels IA", 'Transcriptions completes', 'Support FR/EN', '100 minutes/mois incluses', 'Sync CRM basique'] },
    { name: 'Business', desc: 'Pour les cabinets en croissance', price: 49.99, featured: true, dark: false,
      features: ["Jusqu'a 3 lignes telephoniques", 'Tout le plan Starter +', 'Routage intelligent multi-equipe', 'Support FR/EN/ES/AR', 'Clonage de voix personnalise', 'Recap quotidien IA', '500 minutes/mois incluses', 'Sync CRM avance (HubSpot, etc.)', 'Contacts VIP & listes prioritaires', 'Analyse de sentiment', 'Textos & emails IA'] },
    { name: 'Premium', desc: 'Pour SOS Hub Canada', price: 149.99, featured: false, dark: true,
      features: ['Lignes illimitees', 'Tout le plan Business +', 'IA entrainee sur vos programmes', 'Scoring de leads automatique', 'Prise de rendez-vous auto', 'Minutes illimitees', 'Webhooks & API personnalises', 'Portail employeurs integre', 'Multi-utilisateurs & roles', 'Rapports & analytique avances', 'Support prioritaire dedie', 'Conformite Loi 25 Quebec', 'SOC 2 Type II certifie'] },
  ]

  const calcPrice = (base: number) => {
    let price = billingCycle === 'annual' ? base * 0.8 : base // 20% rabais annuel
    let tps = 0
    let tvq = 0
    if (includeTPS) tps = price * TPS_RATE
    if (includeTVQ) tvq = price * TVQ_RATE
    return { subtotal: price, tps, tvq, total: price + tps + tvq }
  }

  const fmt = (n: number) => n.toFixed(2).replace('.', ',')

  const handleTaxExempt = () => {
    if (taxExemptNumber.trim().length > 5) {
      setIncludeTPS(false)
      setIncludeTVQ(false)
      setShowTaxExempt(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Tarification SOS Hub Receptionniste IA</h2>
        <p className="text-slate-500">Standards premium inspires de Beside.com, adaptes pour l'immigration</p>
      </div>

      {/* Billing Toggle + Tax Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Billing Cycle */}
          <div className="flex items-center gap-2">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>Mensuel</span>
            <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${billingCycle === 'annual' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${billingCycle === 'annual' ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`text-sm ${billingCycle === 'annual' ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>Annuel</span>
            {billingCycle === 'annual' && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">-20%</span>}
          </div>

          {/* Tax Toggles */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setIncludeTPS(!includeTPS)}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors ${includeTPS ? 'bg-brand-500' : 'bg-slate-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${includeTPS ? 'translate-x-4' : ''}`} />
              </button>
              <span className="text-sm text-slate-700">TPS <span className="text-slate-400">(5%)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIncludeTVQ(!includeTVQ)}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors ${includeTVQ ? 'bg-brand-500' : 'bg-slate-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${includeTVQ ? 'translate-x-4' : ''}`} />
              </button>
              <span className="text-sm text-slate-700">TVQ <span className="text-slate-400">(9,975%)</span></span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <button onClick={() => setShowTaxExempt(!showTaxExempt)}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium underline underline-offset-2">
              {(!includeTPS && !includeTVQ) ? 'Taxes exemptes' : 'Exemption de taxes?'}
            </button>
          </div>
        </div>

        {/* Tax Exempt Form */}
        {showTaxExempt && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-slide-up">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 mb-2">Exemption de TPS/TVQ</p>
                <p className="text-xs text-amber-700 mb-3">Si vous etes un organisme exempte (diplomate, organisme de bienfaisance, Premiere Nation, etc.), entrez votre numero d'exemption pour retirer automatiquement les taxes.</p>
                <div className="flex items-center gap-2">
                  <input type="text" value={taxExemptNumber} onChange={e => setTaxExemptNumber(e.target.value)}
                    placeholder="No d'exemption (ex: RT0001-1234)" className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-white" />
                  <button onClick={handleTaxExempt}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                    Appliquer
                  </button>
                  <button onClick={() => setShowTaxExempt(false)}
                    className="px-3 py-2 text-amber-700 hover:bg-amber-100 rounded-lg text-sm transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tax Status Indicator */}
        {(!includeTPS || !includeTVQ) && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs text-amber-700 font-medium">
              {!includeTPS && !includeTVQ ? 'Aucune taxe appliquee' :
               !includeTPS ? 'TPS retiree' : 'TVQ retiree'}
              {taxExemptNumber && ` (Exemption: ${taxExemptNumber})`}
            </span>
            <button onClick={() => { setIncludeTPS(true); setIncludeTVQ(true); setTaxExemptNumber('') }}
              className="text-xs text-slate-500 hover:text-slate-700 underline ml-1">Reinitialiser</button>
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-3 gap-6">
        {plans.map((plan) => {
          const pricing = calcPrice(plan.price)
          return (
            <div key={plan.name} className={`rounded-2xl p-6 hover:shadow-lg transition-shadow ${
              plan.dark ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' :
              plan.featured ? 'bg-white border-2 border-brand-500 relative shadow-lg shadow-brand-100' :
              'bg-white border border-slate-200'
            }`}>
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                  RECOMMANDE
                </div>
              )}
              <div className="mb-4">
                <h3 className={`text-lg font-bold ${plan.dark ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`text-sm mt-1 ${plan.dark ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
              </div>

              {/* Price Breakdown */}
              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold ${plan.dark ? 'text-white' : 'text-slate-900'}`}>{fmt(pricing.subtotal)}</span>
                  <span className={`text-sm ${plan.dark ? 'text-slate-400' : 'text-slate-500'}`}>$/{billingCycle === 'annual' ? 'mo (annuel)' : 'mo'}</span>
                </div>
                {(includeTPS || includeTVQ) && (
                  <div className={`mt-2 space-y-0.5 text-xs ${plan.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {includeTPS && <div className="flex justify-between"><span>TPS (5%)</span><span>+{fmt(pricing.tps)} $</span></div>}
                    {includeTVQ && <div className="flex justify-between"><span>TVQ (9,975%)</span><span>+{fmt(pricing.tvq)} $</span></div>}
                    <div className={`flex justify-between pt-1 border-t font-semibold ${plan.dark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-900'}`}>
                      <span>Total</span><span>{fmt(pricing.total)} $/mo</span>
                    </div>
                  </div>
                )}
                {billingCycle === 'annual' && (
                  <p className={`text-xs mt-1 ${plan.dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Economie: {fmt((plan.price * 12) - (pricing.subtotal * 12))} $/an
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${plan.dark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.dark ? 'text-emerald-400' : plan.featured ? 'text-brand-500' : 'text-emerald-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                plan.dark ? 'bg-white text-slate-900 hover:bg-slate-100' :
                plan.featured ? 'bg-brand-600 text-white hover:bg-brand-700' :
                'border-2 border-brand-600 text-brand-600 hover:bg-brand-50'
              }`}>
                {plan.dark ? 'Contacter les ventes' : "Commencer l'essai gratuit"}
              </button>
            </div>
          )
        })}
      </div>

      {/* Feature Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Comparaison detaillee</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase">
              <th className="px-6 py-3">Fonctionnalite</th>
              <th className="px-6 py-3 text-center">Starter</th>
              <th className="px-6 py-3 text-center">Business</th>
              <th className="px-6 py-3 text-center">Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {[
              { feature: 'Lignes telephoniques', s: '1', b: '3', p: 'Illimite' },
              { feature: 'Minutes incluses/mois', s: '100', b: '500', p: 'Illimite' },
              { feature: 'Receptionniste IA 24/7', s: true, b: true, p: true },
              { feature: 'Capture de leads', s: true, b: true, p: true },
              { feature: 'Resumes & transcriptions', s: true, b: true, p: true },
              { feature: 'Langues', s: 'FR/EN', b: '4 langues', p: '4+ langues' },
              { feature: 'Routage intelligent', s: false, b: true, p: true },
              { feature: 'Contacts VIP', s: false, b: true, p: true },
              { feature: 'Clonage de voix', s: false, b: true, p: true },
              { feature: 'Recap quotidien', s: false, b: true, p: true },
              { feature: 'Analyse de sentiment', s: false, b: true, p: true },
              { feature: 'Scoring de leads IA', s: false, b: false, p: true },
              { feature: 'Prise de RDV auto', s: false, b: false, p: true },
              { feature: 'API & Webhooks', s: false, b: false, p: true },
              { feature: 'Multi-utilisateurs', s: false, b: false, p: true },
              { feature: 'SOC 2 Type II', s: false, b: false, p: true },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-3 text-slate-700">{row.feature}</td>
                {[row.s, row.b, row.p].map((val, j) => (
                  <td key={j} className="px-6 py-3 text-center">
                    {typeof val === 'boolean' ? (
                      val ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />
                    ) : (
                      <span className="text-slate-900 font-medium">{val}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tax Info */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Information sur les taxes</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <p className="font-medium text-slate-900 mb-1">TPS (Taxe sur les produits et services)</p>
            <p>Taux: 5% | No TPS: A completer</p>
            <p className="text-xs text-slate-400 mt-1">Administree par l'ARC (Agence du revenu du Canada)</p>
          </div>
          <div>
            <p className="font-medium text-slate-900 mb-1">TVQ (Taxe de vente du Quebec)</p>
            <p>Taux: 9,975% | No TVQ: A completer</p>
            <p className="text-xs text-slate-400 mt-1">Administree par Revenu Quebec</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-500">
          <p><strong>Exemptions possibles:</strong> Organismes de bienfaisance enregistres, diplomates, Premieres Nations (avec certificat d'exemption valide), revendeurs avec no de TVQ valide. Contactez-nous pour appliquer votre exemption.</p>
        </div>
      </div>

      {/* 7-Day Trial Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">7 jours d'essai gratuit</h3>
        <p className="text-brand-100 mb-4">Acces complet, sans limites, sans carte de credit</p>
        <button className="bg-white text-brand-700 px-8 py-3 rounded-xl font-bold hover:bg-brand-50 transition-colors">
          Demarrer maintenant
        </button>
      </div>
    </div>
  )
}
