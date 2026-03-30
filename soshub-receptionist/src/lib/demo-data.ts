export type CallStatus = 'completed' | 'missed' | 'in-progress' | 'voicemail'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export type CallSentiment = 'positive' | 'neutral' | 'negative'

export interface Call {
  id: string
  callerName: string
  callerPhone: string
  callerEmail?: string
  timestamp: string
  duration: number // seconds
  status: CallStatus
  sentiment: CallSentiment
  language: 'fr' | 'en' | 'es' | 'ar'
  summary: string
  nextSteps: string[]
  transcript: string
  tags: string[]
  routedTo?: string
  isVIP: boolean
  leadCaptured: boolean
  crmSynced: boolean
  recording?: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  source: string
  status: LeadStatus
  service: string
  budget?: string
  createdAt: string
  lastContact: string
  notes: string
  score: number
  assignedTo: string
  callIds: string[]
}

export interface DailyRecap {
  date: string
  totalCalls: number
  answered: number
  missed: number
  voicemails: number
  avgDuration: number
  leadsCaptureed: number
  crmSynced: number
  topIssues: { issue: string; count: number }[]
  actionItems: string[]
  sentiment: { positive: number; neutral: number; negative: number }
}

export interface RoutingRule {
  id: string
  name: string
  condition: string
  action: string
  destination: string
  priority: number
  active: boolean
}

export interface BusinessHours {
  day: string
  enabled: boolean
  start: string
  end: string
}

export const demoCalls: Call[] = [
  {
    id: 'call-001',
    callerName: 'Maria Santos',
    callerPhone: '+1 514-555-0123',
    callerEmail: 'maria.santos@email.com',
    timestamp: '2026-03-26T09:15:00',
    duration: 245,
    status: 'completed',
    sentiment: 'positive',
    language: 'fr',
    summary: 'Maria souhaite obtenir des informations sur le Programme de l\'experience quebecoise (PEQ). Elle est diplomee en soins infirmiers d\'un cegep de Montreal et veut savoir si elle est admissible. Niveau de francais : B2 confirme.',
    nextSteps: [
      'Envoyer le formulaire d\'evaluation d\'admissibilite PEQ',
      'Planifier un rendez-vous avec un conseiller en immigration',
      'Verifier le niveau NCLC avec les resultats TEF'
    ],
    transcript: '[00:00] IA: SOS Hub Canada, bonjour! Comment puis-je vous aider?\n[00:05] Maria: Bonjour, je m\'appelle Maria Santos. Je voudrais des informations sur le PEQ...\n[00:15] IA: Bien sur Maria! Le PEQ est un programme accelere pour les diplomes du Quebec. Pouvez-vous me dire quel diplome vous avez obtenu?\n[00:25] Maria: J\'ai un DEC en soins infirmiers du Cegep du Vieux-Montreal.\n[00:32] IA: Excellent! Un DEC en soins infirmiers est admissible au PEQ. Avez-vous vos resultats de test de francais?\n[00:40] Maria: Oui, j\'ai un TEF avec B2 dans toutes les competences.\n[01:00] IA: Parfait! Avec un DEC et un B2, vous avez un bon profil pour le PEQ. Je vais noter vos coordonnees et un conseiller vous contactera dans les 24 heures.',
    tags: ['PEQ', 'soins-infirmiers', 'diplome-quebec', 'admissibilite'],
    routedTo: 'Amina Kabeche',
    isVIP: false,
    leadCaptured: true,
    crmSynced: true
  },
  {
    id: 'call-002',
    callerName: 'Ahmed Al-Rashid',
    callerPhone: '+1 438-555-0456',
    timestamp: '2026-03-26T09:45:00',
    duration: 0,
    status: 'missed',
    sentiment: 'neutral',
    language: 'ar',
    summary: 'Appel manque - pas de message vocal laisse.',
    nextSteps: ['Rappeler le client', 'Envoyer un SMS de suivi'],
    transcript: '',
    tags: ['rappel-necessaire'],
    isVIP: false,
    leadCaptured: false,
    crmSynced: false
  },
  {
    id: 'call-003',
    callerName: 'Sophie Tremblay',
    callerPhone: '+1 514-555-0789',
    callerEmail: 'sophie.tremblay@techboreal.ca',
    timestamp: '2026-03-26T10:30:00',
    duration: 480,
    status: 'completed',
    sentiment: 'positive',
    language: 'fr',
    summary: 'Sophie appelle au nom de Technologies Boreales pour discuter du recrutement de 5 developpeurs etrangers. Besoin d\'une EIMT simplifiee via le Programme des talents mondiaux. Budget confirme pour les services de SOS Hub.',
    nextSteps: [
      'Preparer une soumission pour 5 dossiers EIMT/PTM',
      'Envoyer le contrat de services employeur',
      'Planifier une rencontre avec la coordinatrice',
      'Verifier les CNP 21232 et 21234 pour les postes'
    ],
    transcript: '[00:00] IA: SOS Hub Canada, bonjour! Comment puis-je vous aider?\n[00:05] Sophie: Bonjour, je suis Sophie Tremblay, DRH chez Technologies Boreales. On a besoin de recruter 5 developpeurs a l\'international...\n[02:00] IA: Je comprends. Pour le recrutement international, nous offrons un service complet incluant l\'EIMT et les permis de travail. Le Programme des talents mondiaux pourrait accelerer le processus.\n[04:00] Sophie: Oui, c\'est exactement ce qu\'il nous faut. Quel serait le cout?\n[04:30] IA: Pour 5 dossiers, je vais demander a notre equipe de preparer une soumission detaillee. En general, nos forfaits employeur commencent a partir de 6 745$ par dossier.',
    tags: ['employeur', 'EIMT', 'PTM', 'tech', 'recrutement-international', 'VIP'],
    routedTo: 'Samira Guerrier',
    isVIP: true,
    leadCaptured: true,
    crmSynced: true
  },
  {
    id: 'call-004',
    callerName: 'Jean-Pierre Mukendi',
    callerPhone: '+1 514-555-0321',
    callerEmail: 'jp.mukendi@gmail.com',
    timestamp: '2026-03-26T11:00:00',
    duration: 185,
    status: 'voicemail',
    sentiment: 'negative',
    language: 'fr',
    summary: 'Message vocal de M. Mukendi qui est stresse par sa demande d\'asile. Son audience est dans 3 semaines et il n\'a pas encore de representant. Demande urgente de rappel.',
    nextSteps: [
      'URGENT: Rappeler dans l\'heure',
      'Verifier la disponibilite de Me Cadet pour une audience d\'asile',
      'Preparer un dossier prioritaire'
    ],
    transcript: '[Message vocal] Bonjour, c\'est Jean-Pierre Mukendi. J\'ai besoin d\'aide urgente pour ma demande d\'asile. Mon audience est le 16 avril et je n\'ai toujours pas de representant. S\'il vous plait, rappelez-moi le plus vite possible au 514-555-0321. Merci.',
    tags: ['asile', 'urgent', 'audience-proche', 'prioritaire'],
    isVIP: false,
    leadCaptured: true,
    crmSynced: true
  },
  {
    id: 'call-005',
    callerName: 'Inconnu',
    callerPhone: '+1 450-555-0999',
    timestamp: '2026-03-26T11:30:00',
    duration: 320,
    status: 'completed',
    sentiment: 'neutral',
    language: 'en',
    summary: 'English-speaking caller inquiring about Express Entry Federal Skilled Worker program. Has a Master\'s degree in Computer Science, 4 years experience, CLB 9 in English. Looking for CRS score estimate and guidance.',
    nextSteps: [
      'Send CRS calculator link',
      'Schedule consultation with bilingual advisor',
      'Provide Express Entry checklist'
    ],
    transcript: '[00:00] AI: SOS Hub Canada, hello! How can I help you today?\n[00:05] Caller: Hi, I want to know about Express Entry. I have a Master\'s in CS and 4 years of experience.\n[01:00] AI: That\'s great! With a Master\'s degree and 4 years of experience, you have a strong profile. Can you tell me your English test scores?\n[01:20] Caller: I have IELTS 7.5 overall.\n[02:00] AI: Excellent. Based on what you\'ve told me, your estimated CRS score would be around 470-490 points. Recent draws have been around 480-500.',
    tags: ['EE', 'FSW', 'anglophone', 'TI', 'CRS-estimation'],
    routedTo: 'Amina Kabeche',
    isVIP: false,
    leadCaptured: true,
    crmSynced: true
  },
  {
    id: 'call-006',
    callerName: 'Carlos Rodriguez',
    callerPhone: '+1 514-555-0147',
    callerEmail: 'carlos.rodriguez@email.com',
    timestamp: '2026-03-26T13:00:00',
    duration: 0,
    status: 'in-progress',
    sentiment: 'positive',
    language: 'fr',
    summary: 'Appel en cours - Client existant (PEQ), suivi de dossier...',
    nextSteps: [],
    transcript: '[En cours...]',
    tags: ['client-existant', 'PEQ', 'suivi'],
    routedTo: 'Patrick Cadet',
    isVIP: true,
    leadCaptured: false,
    crmSynced: false
  },
  {
    id: 'call-007',
    callerName: 'Priya Sharma',
    callerPhone: '+1 438-555-0852',
    callerEmail: 'priya.sharma@outlook.com',
    timestamp: '2026-03-26T08:30:00',
    duration: 195,
    status: 'completed',
    sentiment: 'positive',
    language: 'en',
    summary: 'Priya is interested in the Quebec Investor Program. She has $2M in net assets and 3 years of management experience. Wants to know about the new startup visa as well.',
    nextSteps: [
      'Send Startup Visa program details',
      'Schedule premium consultation',
      'Prepare comparative analysis: Investor vs Startup Visa'
    ],
    transcript: '[00:00] AI: SOS Hub Canada, hello!\n[00:05] Priya: Hi, I\'m looking into business immigration to Quebec...',
    tags: ['investisseur', 'startup-visa', 'premium', 'high-value'],
    routedTo: 'Patrick Cadet',
    isVIP: false,
    leadCaptured: true,
    crmSynced: true
  }
]

export const demoLeads: Lead[] = [
  {
    id: 'lead-001',
    name: 'Maria Santos',
    phone: '+1 514-555-0123',
    email: 'maria.santos@email.com',
    source: 'Appel entrant',
    status: 'new',
    service: 'PEQ - Programme experience quebecoise',
    budget: '6 135 $',
    createdAt: '2026-03-26T09:15:00',
    lastContact: '2026-03-26T09:15:00',
    notes: 'DEC soins infirmiers, TEF B2, admissible PEQ',
    score: 85,
    assignedTo: 'Amina Kabeche',
    callIds: ['call-001']
  },
  {
    id: 'lead-002',
    name: 'Technologies Boreales (Sophie Tremblay)',
    phone: '+1 514-555-0789',
    email: 'sophie.tremblay@techboreal.ca',
    source: 'Appel entrant',
    status: 'qualified',
    service: 'EIMT / Programme talents mondiaux (x5)',
    budget: '33 725 $ - 48 725 $',
    createdAt: '2026-03-26T10:30:00',
    lastContact: '2026-03-26T10:30:00',
    notes: '5 developpeurs, CNP 21232/21234, budget confirme',
    score: 95,
    assignedTo: 'Samira Guerrier',
    callIds: ['call-003']
  },
  {
    id: 'lead-003',
    name: 'Jean-Pierre Mukendi',
    phone: '+1 514-555-0321',
    email: 'jp.mukendi@gmail.com',
    source: 'Message vocal',
    status: 'new',
    service: 'Demande d\'asile - Audience CISR',
    budget: '7 000 $',
    createdAt: '2026-03-26T11:00:00',
    lastContact: '2026-03-26T11:00:00',
    notes: 'URGENT - Audience dans 3 semaines, pas de representant',
    score: 90,
    assignedTo: 'Patrick Cadet',
    callIds: ['call-004']
  },
  {
    id: 'lead-004',
    name: 'Priya Sharma',
    phone: '+1 438-555-0852',
    email: 'priya.sharma@outlook.com',
    source: 'Appel entrant',
    status: 'contacted',
    service: 'Startup Visa / Investisseur',
    budget: '12 860 $',
    createdAt: '2026-03-26T08:30:00',
    lastContact: '2026-03-26T08:30:00',
    notes: 'Actifs nets 2M$, 3 ans experience gestion, interesse Startup Visa',
    score: 88,
    assignedTo: 'Patrick Cadet',
    callIds: ['call-007']
  },
  {
    id: 'lead-005',
    name: 'Appelant Anglophone (EE)',
    phone: '+1 450-555-0999',
    email: '',
    source: 'Appel entrant',
    status: 'new',
    service: 'Entree Express - FSW',
    budget: '4 635 $ - 5 635 $',
    createdAt: '2026-03-26T11:30:00',
    lastContact: '2026-03-26T11:30:00',
    notes: 'MSc Computer Science, 4 ans exp, IELTS 7.5, CRS ~470-490',
    score: 75,
    assignedTo: 'Amina Kabeche',
    callIds: ['call-005']
  }
]

export const demoRecap: DailyRecap = {
  date: '2026-03-26',
  totalCalls: 7,
  answered: 5,
  missed: 1,
  voicemails: 1,
  avgDuration: 237,
  leadsCaptureed: 5,
  crmSynced: 5,
  topIssues: [
    { issue: 'PEQ / Immigration permanente', count: 3 },
    { issue: 'Recrutement international / EIMT', count: 1 },
    { issue: 'Demande d\'asile', count: 1 },
    { issue: 'Entree Express', count: 1 },
    { issue: 'Immigration affaires', count: 1 }
  ],
  actionItems: [
    'URGENT: Rappeler Jean-Pierre Mukendi (asile, audience 16 avril)',
    'Preparer soumission 5 dossiers pour Technologies Boreales',
    'Envoyer formulaire admissibilite PEQ a Maria Santos',
    'Rappeler Ahmed Al-Rashid (appel manque)',
    'Planifier consultation premium pour Priya Sharma (Startup Visa)'
  ],
  sentiment: { positive: 4, neutral: 2, negative: 1 }
}

export const demoRoutingRules: RoutingRule[] = [
  { id: 'rule-1', name: 'Clients VIP', condition: 'Contact marque VIP', action: 'Transferer directement', destination: 'Patrick Cadet', priority: 1, active: true },
  { id: 'rule-2', name: 'Demandes d\'asile', condition: 'Mots-cles: asile, refugie, CISR', action: 'Transferer', destination: 'Patrick Cadet', priority: 2, active: true },
  { id: 'rule-3', name: 'Employeurs / EIMT', condition: 'Mots-cles: recrutement, EIMT, employeur', action: 'Transferer', destination: 'Samira Guerrier', priority: 3, active: true },
  { id: 'rule-4', name: 'Consultations generales', condition: 'Aucune regle specifique', action: 'IA repond + capture lead', destination: 'File d\'attente generale', priority: 10, active: true },
  { id: 'rule-5', name: 'Heures fermees', condition: 'En dehors des heures d\'ouverture', action: 'Message vocal + SMS', destination: 'Boite vocale IA', priority: 0, active: true }
]

export const demoBusinessHours: BusinessHours[] = [
  { day: 'Lundi', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Mardi', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Mercredi', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Jeudi', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Vendredi', enabled: true, start: '09:00', end: '17:00' },
  { day: 'Samedi', enabled: false, start: '10:00', end: '14:00' },
  { day: 'Dimanche', enabled: false, start: '', end: '' }
]

export const teamMembers = [
  { name: 'Patrick Cadet', role: 'Superadmin / RCIC', available: true },
  { name: 'Amina Kabeche', role: 'Coordinatrice', available: true },
  { name: 'Samira Guerrier', role: 'Coordinatrice', available: true },
  { name: 'Nadia Saadou', role: 'Technicienne juridique', available: false },
  { name: 'Sabrina Loulidi', role: 'Technicienne juridique', available: true },
  { name: 'Fatima Madjer', role: 'Receptionniste', available: true }
]

export function formatDuration(seconds: number): string {
  if (seconds === 0) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })
}
