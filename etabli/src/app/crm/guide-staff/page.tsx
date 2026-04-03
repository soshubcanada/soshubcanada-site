"use client";
import { useState } from "react";
import { useCrm } from "@/lib/crm-store";
import {
  BookOpen, ChevronDown, ChevronRight, CheckCircle2, Users, FolderOpen,
  Calendar, MessageSquare, Receipt, Bot, BarChart3, FileText, Shield,
  Briefcase, Globe, ArrowRight, Lightbulb, AlertTriangle, Star,
  Layout, Search, Bell, Settings, LogIn, UserPlus, ClipboardList,
  Paperclip, Upload, Mail, Clock, Target, Zap, Eye, Lock,
} from "lucide-react";

// ========================================================
// GUIDE RAPIDE — ONBOARDING STAFF
// SOS Hub Canada — CRM Immigration
// ========================================================

interface GuideStep {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  path?: string;
  content: {
    overview: string;
    steps: { text: string; tip?: string }[];
    bestPractices?: string[];
    screenshot?: string; // description for visual reference
  };
}

const GUIDE_SECTIONS: GuideStep[] = [
  {
    id: "connexion",
    title: "1. Connexion au systeme",
    icon: LogIn,
    color: "bg-blue-50 border-blue-200 text-blue-700",
    description: "Acceder au CRM et se connecter",
    path: "/crm",
    content: {
      overview: "Le CRM SOS Hub Canada est accessible a l'adresse crm.soshub.ca. Chaque membre du personnel a un compte avec des permissions adaptees a son role.",
      steps: [
        { text: "Ouvrez votre navigateur et allez a crm.soshub.ca", tip: "Chrome ou Edge recommande pour une experience optimale" },
        { text: "Entrez votre courriel professionnel (@soshubcanada.com)" },
        { text: "Entrez votre mot de passe" },
        { text: "Cliquez 'Se connecter'" },
        { text: "Vous arrivez sur le Tableau de bord avec vos statistiques personnalisees" },
      ],
      bestPractices: [
        "Changez votre mot de passe lors de la premiere connexion",
        "Ne partagez jamais vos identifiants avec un collegue",
        "En cas d'oubli, utilisez 'Mot de passe oublie'",
      ],
      screenshot: "Ecran de connexion avec les profils demo disponibles",
    },
  },
  {
    id: "dashboard",
    title: "2. Tableau de bord",
    icon: Layout,
    color: "bg-indigo-50 border-indigo-200 text-indigo-700",
    description: "Vue d'ensemble de votre activite",
    path: "/crm",
    content: {
      overview: "Le tableau de bord affiche en un coup d'oeil : clients actifs, dossiers en cours, revenus, rendez-vous et alertes. C'est votre page d'accueil.",
      steps: [
        { text: "Verifiez vos KPI du jour : clients actifs, dossiers, contrats en attente" },
        { text: "Consultez le pipeline des dossiers pour voir la progression" },
        { text: "Regardez les revenus des 6 derniers mois et par programme" },
        { text: "Verifiez les alertes urgentes (documents expirants, echeances)" },
        { text: "Consultez l'activite recente pour les derniers changements" },
      ],
      bestPractices: [
        "Commencez TOUJOURS votre journee par le tableau de bord",
        "Reagissez aux alertes rouges en priorite",
        "Le graphique revenus vous aide a suivre la performance mensuelle",
      ],
      screenshot: "Tableau de bord avec KPI, pipeline, revenus et alertes",
    },
  },
  {
    id: "clients",
    title: "3. Gestion des clients",
    icon: Users,
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    description: "Ajouter et gerer les fiches clients",
    path: "/crm/clients",
    content: {
      overview: "Le module Clients centralise toutes les informations de chaque client : identite, immigration, documents, notes. C'est le coeur du CRM.",
      steps: [
        { text: "Cliquez '+ Nouveau client' pour creer une fiche", tip: "Remplissez au minimum : nom, prenom, courriel, telephone, nationalite" },
        { text: "Remplissez les informations personnelles (identite, passeport, adresse)" },
        { text: "Ajoutez le profil immigration : statut actuel, pays, langues, education" },
        { text: "Definissez la source (site web, referral, reseaux sociaux) et la priorite" },
        { text: "Assignez le client a un membre de l'equipe" },
        { text: "Utilisez les filtres et la recherche pour retrouver un client rapidement" },
      ],
      bestPractices: [
        "Remplissez la fiche le plus completement possible des le premier contact",
        "Mettez a jour le statut du client (Prospect → Actif → Complete) au fur et a mesure",
        "Utilisez les notes pour documenter chaque interaction",
        "La barre de statut en haut filtre par : Actif, Prospect, En attente, Complete, Annule, Archive",
        "Vous pouvez importer des clients en lot via 'Importer CSV'",
      ],
      screenshot: "Page clients avec filtres par statut, recherche et tableau",
    },
  },
  {
    id: "dossiers",
    title: "4. Gestion des dossiers",
    icon: FolderOpen,
    color: "bg-amber-50 border-amber-200 text-amber-700",
    description: "Creer et suivre les dossiers d'immigration",
    path: "/crm/dossiers",
    content: {
      overview: "Chaque client peut avoir un ou plusieurs dossiers (permis de travail, RP, asile, etc.). Le dossier suit tout le processus : de la consultation initiale a l'approbation.",
      steps: [
        { text: "Cliquez '+ Nouveau dossier' et selectionnez le client" },
        { text: "Choisissez le programme d'immigration (Entree express, PSTQ, PT ferme, etc.)" },
        { text: "Definissez la priorite et le statut initial" },
        { text: "Ajoutez les formulaires IRCC requis (ils se pre-remplissent automatiquement)" },
        { text: "Suivez la progression via la checklist de documents" },
        { text: "Mettez a jour le statut a chaque etape : Nouveau → Consultation → Preparation → Soumis → etc." },
      ],
      bestPractices: [
        "Un dossier = une demande specifique (ne melangez pas PT et RP dans le meme dossier)",
        "Utilisez la vue Kanban (icone grille) pour voir le pipeline visuellement",
        "Mettez a jour le statut IMMEDIATEMENT apres chaque action importante",
        "Ajoutez des notes detaillees a chaque etape pour la tracabilite",
      ],
      screenshot: "Page dossiers avec vue liste/kanban et pipeline",
    },
  },
  {
    id: "documents",
    title: "5. Documents et formulaires",
    icon: FileText,
    color: "bg-purple-50 border-purple-200 text-purple-700",
    description: "Gerer les documents clients et formulaires IRCC",
    content: {
      overview: "Le module Documents gere les fichiers clients (passeports, diplomes, preuves de fonds) et les formulaires IRCC. Chaque document a un statut de verification.",
      steps: [
        { text: "Dans la fiche client, section Documents, cliquez '+ Ajouter un document'" },
        { text: "Selectionnez la categorie : Identite, Education, Emploi, Financier, Medical, Langue, etc." },
        { text: "Televersez le fichier (PDF, image — max 10 Mo)" },
        { text: "Le document apparait avec le statut 'Televerse'" },
        { text: "Verifiez le document et changez le statut : Televerse → Verifie (ou Rejete si probleme)" },
        { text: "Suivez les dates d'expiration (passeport, examen medical, test de langue)" },
      ],
      bestPractices: [
        "Verifiez CHAQUE document avant de le marquer 'Verifie'",
        "Configurez les alertes d'expiration (30 jours avant)",
        "Utilisez la section Formulaires IRCC pour les formulaires pre-remplis",
        "Statuts : Requis (manquant) → Televerse → Verifie → Expire/Rejete",
      ],
      screenshot: "Section documents avec categories, statuts et dates d'expiration",
    },
  },
  {
    id: "calendrier",
    title: "6. Calendrier et rendez-vous",
    icon: Calendar,
    color: "bg-sky-50 border-sky-200 text-sky-700",
    description: "Planifier les consultations et suivis",
    path: "/crm/calendrier",
    content: {
      overview: "Le calendrier gere les rendez-vous avec les clients : consultations initiales, suivis, accompagnement. Il se synchronise avec votre lien de reservation en ligne.",
      steps: [
        { text: "Cliquez '+ Nouveau rendez-vous' pour planifier" },
        { text: "Selectionnez le client, le type de RDV et la duree" },
        { text: "Choisissez la date et l'heure dans le calendrier" },
        { text: "Ajoutez des notes pour le rendez-vous" },
        { text: "Utilisez l'onglet 'Disponibilites' pour gerer vos horaires" },
        { text: "L'onglet 'Demandes' montre les RDV en attente de confirmation" },
      ],
      bestPractices: [
        "Partagez votre lien de reservation (Mon lien) avec les clients pour les autorisations de RDV",
        "Filtrez par employe pour voir les disponibilites de chaque membre",
        "Confirmez les demandes de RDV dans les 24h",
        "Ajoutez toujours le type de consultation (initial, suivi, urgence)",
      ],
      screenshot: "Calendrier hebdomadaire avec vue par jour et disponibilites",
    },
  },
  {
    id: "messagerie",
    title: "7. Messagerie interne",
    icon: MessageSquare,
    color: "bg-teal-50 border-teal-200 text-teal-700",
    description: "Communiquer avec l'equipe",
    path: "/crm/messagerie",
    content: {
      overview: "La messagerie interne permet a l'equipe de communiquer par canaux thematiques et en messages directs. C'est votre Slack interne.",
      steps: [
        { text: "Selectionnez un canal dans la barre laterale : General, Urgent, Dossiers, Annonces, Technique" },
        { text: "Ecrivez votre message et appuyez Entree pour envoyer" },
        { text: "Utilisez les messages directs pour les conversations privees" },
        { text: "Joignez des fichiers avec le bouton trombone" },
        { text: "Utilisez les emojis et les mentions pour rester organise" },
      ],
      bestPractices: [
        "Canal #Urgent : UNIQUEMENT pour les situations qui necessitent une action immediate",
        "Canal #Dossiers : discutez des cas specifiques avec l'equipe",
        "Canal #General : annonces et discussions generales",
        "Repondez aux messages urgents dans l'heure",
        "Pour les dossiers sensibles, utilisez les messages directs",
      ],
      screenshot: "Interface messagerie avec canaux et messages directs",
    },
  },
  {
    id: "facturation",
    title: "8. Facturation",
    icon: Receipt,
    color: "bg-green-50 border-green-200 text-green-700",
    description: "Creer des factures et suivre les paiements",
    path: "/crm/facturation",
    content: {
      overview: "Le module Facturation gere les factures clients : creation, envoi, suivi des paiements, rappels et journal comptable. Les taxes sont incluses dans le tarif (pratique standard QC).",
      steps: [
        { text: "Cliquez '+ Nouvelle facture' pour creer une facture" },
        { text: "Selectionnez le client et ajoutez les lignes de service" },
        { text: "Les montants TPS/TVQ s'affichent a 0$ (taxes incluses dans le tarif)" },
        { text: "Enregistrez et envoyez la facture au client" },
        { text: "Suivez les paiements dans l'onglet 'Journal des paiements'" },
        { text: "Utilisez 'Rappels' pour les factures en retard" },
      ],
      bestPractices: [
        "Les taxes sont INCLUSES dans nos tarifs — les lignes TPS/TVQ a 0$ sont normales",
        "Utilisez le Grand livre et le Tableau financier pour votre comptabilite",
        "Exportez les factures en CSV pour votre comptable",
        "Faites un rappel apres 7 jours, puis 14, puis 30 jours de retard",
      ],
      screenshot: "Module facturation avec KPI revenus, liste de factures et onglets comptables",
    },
  },
  {
    id: "contrats",
    title: "9. Contrats et tarification",
    icon: ClipboardList,
    color: "bg-orange-50 border-orange-200 text-orange-700",
    description: "Gerer les contrats de service et signatures",
    path: "/crm/contrats",
    content: {
      overview: "Le module Contrats gere les contrats de service : creation, signature electronique, suivi des paiements. La grille tarifaire 2026 est integree.",
      steps: [
        { text: "Cliquez '+ Nouveau contrat' pour creer un contrat" },
        { text: "Selectionnez le client, le service et les conditions" },
        { text: "Utilisez 'Grille tarifaire 2026' pour consulter les prix par programme" },
        { text: "Le contrat est genere automatiquement avec les informations du client" },
        { text: "Envoyez pour signature electronique au client" },
        { text: "Suivez le pourcentage percu vs le montant total" },
      ],
      bestPractices: [
        "Tout service doit commencer par un contrat signe",
        "Utilisez les modeles de contrat pre-configures par type de service",
        "Verifiez les montants avec la grille tarifaire avant d'envoyer",
        "Le suivi 'Montant percu' vs 'Solde a percevoir' est automatique",
      ],
      screenshot: "Module contrats avec liste, valeurs, montants percus et barres de progression",
    },
  },
  {
    id: "sosia",
    title: "10. SOSIA — Agent IA",
    icon: Bot,
    color: "bg-gradient-to-r from-[#1B2559]/10 to-[#D4A03C]/10 border-[#D4A03C]/30 text-[#1B2559]",
    description: "Votre assistant IA expert en immigration",
    path: "/crm/agent-ai",
    content: {
      overview: "SOSIA (SOS + IA) est votre consultante IA senior avec 10+ ans d'experience. Elle peut analyser des dossiers, recommander des programmes, verifier des documents et repondre a toute question d'immigration.",
      steps: [
        { text: "Selectionnez le contexte : General, Client ou Dossier", tip: "En mode Client ou Dossier, SOSIA a acces aux informations specifiques du client" },
        { text: "Posez votre question dans la barre de saisie" },
        { text: "Utilisez les Actions rapides pour les taches courantes (Resume client, Checklist, etc.)" },
        { text: "Joignez des documents pour analyse avec le bouton trombone", tip: "PDF, images, texte — SOSIA lit et analyse le contenu" },
        { text: "Cliquez le bouton dossier (dore) pour analyser les documents du client selectionne" },
        { text: "Consultez la Base de connaissances a gauche pour les references IRCC/MIFI" },
      ],
      bestPractices: [
        "SOSIA est un OUTIL D'AIDE — validez toujours ses recommandations avec un RCIC",
        "Pour analyser une lettre de refus : joignez le PDF et demandez 'Analyse ce refus et propose des solutions'",
        "En mode Dossier, SOSIA connait le programme, le statut et les documents du client",
        "SOSIA connait les donnees 2025-2026 : PSTQ, CRS, EIMT, permis d'etudes, asile",
        "Utilisez 'Verifier admissibilite' pour une evaluation rapide d'eligibilite",
        "Les reponses incluent des references aux lois, reglements et jurisprudence",
      ],
      screenshot: "Interface SOSIA avec contexte, actions rapides, base de connaissances et zone de chat avec upload",
    },
  },
  {
    id: "marketing",
    title: "11. Marketing et courriels",
    icon: Mail,
    color: "bg-pink-50 border-pink-200 text-pink-700",
    description: "Campagnes email et communication client",
    path: "/crm/marketing",
    content: {
      overview: "Le module Marketing gere les campagnes email, les templates de courriel et l'historique d'envoi. Conforme a la loi CASL (anti-pourriel).",
      steps: [
        { text: "Consultez les templates disponibles dans l'onglet 'Templates'" },
        { text: "Creez une campagne avec '+ Nouvelle campagne'" },
        { text: "Selectionnez les destinataires (par statut, programme, source)" },
        { text: "Choisissez un template et personnalisez le contenu" },
        { text: "Verifiez l'apercu et envoyez" },
        { text: "Suivez les statistiques dans l'onglet 'Historique'" },
      ],
      bestPractices: [
        "CASL : envoyez UNIQUEMENT aux clients qui ont donne leur consentement",
        "Chaque courriel doit avoir un lien de desinscription",
        "Personnalisez les templates avec le nom du client et son programme",
        "Frequence recommandee : max 2 courriels par mois par client",
      ],
      screenshot: "Module marketing avec KPI, campagnes et templates",
    },
  },
  {
    id: "rapports",
    title: "12. Rapports et statistiques",
    icon: BarChart3,
    color: "bg-violet-50 border-violet-200 text-violet-700",
    description: "Analyser la performance du cabinet",
    path: "/crm/rapports",
    content: {
      overview: "Le module Rapports fournit une vue d'ensemble de l'activite : clients, dossiers, revenus, taux d'approbation, delais. Exportable en CSV.",
      steps: [
        { text: "Selectionnez la periode avec les filtres de date" },
        { text: "Consultez les KPI : clients totaux, dossiers ouverts, taux d'approbation, revenus" },
        { text: "Analysez les graphiques : Top 5 programmes, revenus par programme" },
        { text: "Consultez le pipeline (entonnoir) pour voir ou sont bloques les dossiers" },
        { text: "Exportez les donnees : Clients CSV, Dossiers CSV, Factures CSV" },
        { text: "Utilisez 'Rapport complet' pour un export global" },
      ],
      bestPractices: [
        "Generez un rapport mensuel pour le suivi de performance",
        "Le taux d'approbation est un indicateur cle de qualite",
        "Le delai moyen vous aide a estimer les timelines pour les clients",
        "Imprimez le rapport pour les reunions d'equipe",
      ],
      screenshot: "Page rapports avec KPI, graphiques et pipeline en entonnoir",
    },
  },
  {
    id: "rh",
    title: "13. Ressources humaines",
    icon: Briefcase,
    color: "bg-slate-50 border-slate-200 text-slate-700",
    description: "Gestion du personnel et presences",
    path: "/crm/ressources-humaines",
    content: {
      overview: "Le module RH gere les employes, documents RH, conges, evaluations et presences (punch in/out). Reserve aux administrateurs et coordonnatrices.",
      steps: [
        { text: "Consultez la liste des employes dans l'onglet 'Employes'" },
        { text: "Gerez les documents RH dans l'onglet 'Documents'" },
        { text: "Approuvez les conges dans 'Conges & Absences'" },
        { text: "Suivez les evaluations dans 'Suivi & Evaluations'" },
        { text: "Verifiez les presences (punch in/out) dans l'onglet 'Presences'" },
      ],
      bestPractices: [
        "Les numeros d'assurance sociale (NAS) sont masques pour la confidentialite (PIPEDA)",
        "Verifiez les presences quotidiennement",
        "Les evaluations doivent etre faites trimestriellement",
        "Les documents RH sensibles sont accessibles uniquement aux admins",
      ],
      screenshot: "Module RH avec cartes employes, onglets documents/conges/presences",
    },
  },
];

const ROLE_GUIDE = [
  { role: "Super Admin", permissions: "Acces complet a tous les modules, gestion des utilisateurs, parametres systeme", icon: Shield, color: "text-red-600" },
  { role: "Coordinatrice", permissions: "Gestion clients, dossiers, calendrier, facturation, contrats, messagerie, SOSIA, marketing", icon: Star, color: "text-amber-600" },
  { role: "Technicienne juridique", permissions: "Gestion clients, dossiers, documents, formulaires, SOSIA (analyse de dossiers)", icon: FileText, color: "text-blue-600" },
  { role: "Receptionniste", permissions: "Consultation clients (lecture), calendrier, messagerie", icon: Clock, color: "text-green-600" },
];

export default function GuideStaffPage() {
  const { currentUser } = useCrm();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ connexion: true });
  const [activeTab, setActiveTab] = useState<"guide" | "roles" | "raccourcis" | "faq">("guide");

  if (!currentUser) return null;

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    GUIDE_SECTIONS.forEach(s => { all[s.id] = true; });
    setExpandedSections(all);
  };

  const collapseAll = () => setExpandedSections({});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B2559] to-[#2A3670] text-white px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <BookOpen size={24} className="text-[#D4A03C]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Guide rapide — Onboarding Staff</h1>
              <p className="text-white/70 text-sm">CRM Immigration SOS Hub Canada — Formation nouveau personnel</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {(["guide", "roles", "raccourcis", "faq"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab ? "bg-white text-[#1B2559]" : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {tab === "guide" ? "Guide pas-a-pas" : tab === "roles" ? "Roles et permissions" : tab === "raccourcis" ? "Raccourcis" : "FAQ"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-6">
        {/* ===== TAB: GUIDE ===== */}
        {activeTab === "guide" && (
          <>
            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{GUIDE_SECTIONS.length} modules — Cliquez sur chaque section pour voir les details</p>
              <div className="flex gap-2">
                <button onClick={expandAll} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                  Tout ouvrir
                </button>
                <button onClick={collapseAll} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                  Tout fermer
                </button>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              {GUIDE_SECTIONS.map(section => {
                const isExpanded = expandedSections[section.id];
                const Icon = section.icon;
                return (
                  <div key={section.id} className={`bg-white rounded-xl border overflow-hidden transition-shadow ${isExpanded ? "shadow-md" : "shadow-sm hover:shadow-md"}`}>
                    {/* Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${section.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
                        <p className="text-xs text-gray-500">{section.description}</p>
                      </div>
                      {section.path && (
                        <a
                          href={section.path}
                          onClick={e => e.stopPropagation()}
                          className="text-[10px] px-2.5 py-1 bg-[#1B2559] text-white rounded-md hover:bg-[#242E6B] transition hidden sm:block"
                        >
                          Ouvrir le module
                        </a>
                      )}
                      {isExpanded ? <ChevronDown size={18} className="text-gray-400 shrink-0" /> : <ChevronRight size={18} className="text-gray-400 shrink-0" />}
                    </button>

                    {/* Content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-100">
                        {/* Overview */}
                        <p className="text-sm text-gray-700 mt-4 mb-4 leading-relaxed bg-gray-50 rounded-lg p-3">
                          {section.content.overview}
                        </p>

                        {/* Steps */}
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Etapes</h4>
                          <div className="space-y-2">
                            {section.content.steps.map((step, idx) => (
                              <div key={idx} className="flex gap-3 items-start">
                                <span className="w-6 h-6 rounded-full bg-[#1B2559] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800">{step.text}</p>
                                  {step.tip && (
                                    <p className="text-xs text-[#D4A03C] mt-0.5 flex items-center gap-1">
                                      <Lightbulb size={10} /> {step.tip}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Best Practices */}
                        {section.content.bestPractices && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Star size={12} /> Bonnes pratiques
                            </h4>
                            <ul className="space-y-1">
                              {section.content.bestPractices.map((bp, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-amber-900">
                                  <CheckCircle2 size={12} className="text-amber-600 shrink-0 mt-0.5" />
                                  {bp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Visual reference */}
                        {section.content.screenshot && (
                          <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
                            <Eye size={10} /> Ref. visuelle : {section.content.screenshot}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== TAB: ROLES ===== */}
        {activeTab === "roles" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Roles et permissions</h2>
            <p className="text-sm text-gray-500 mb-4">
              Chaque membre du personnel a un role qui determine ses acces dans le CRM. Votre role actuel : <strong className="text-[#1B2559]">{currentUser.role}</strong>
            </p>

            <div className="grid gap-4">
              {ROLE_GUIDE.map(r => {
                const Icon = r.icon;
                return (
                  <div key={r.role} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Icon size={20} className={r.color} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{r.role}</h3>
                      <p className="text-sm text-gray-600 mt-1">{r.permissions}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                <Lock size={16} /> Securite et confidentialite
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="shrink-0 mt-0.5" /> Les donnees clients sont protegees par la loi PIPEDA (vie privee federale)</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="shrink-0 mt-0.5" /> Les NAS et informations sensibles sont masques par defaut</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="shrink-0 mt-0.5" /> Ne partagez JAMAIS des informations client par courriel non securise</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="shrink-0 mt-0.5" /> Deconnectez-vous a la fin de chaque journee de travail</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={14} className="shrink-0 mt-0.5" /> Signalez toute activite suspecte a l'administrateur immediatement</li>
              </ul>
            </div>
          </div>
        )}

        {/* ===== TAB: RACCOURCIS ===== */}
        {activeTab === "raccourcis" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Raccourcis et astuces</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Search size={16} className="text-[#D4A03C]" /> Recherche globale</h3>
                <p className="text-sm text-gray-600 mb-2">La barre de recherche en haut (Cmd+K) cherche dans :</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>- Clients (nom, courriel, telephone)</li>
                  <li>- Dossiers (titre, programme)</li>
                  <li>- Factures (numero, client)</li>
                  <li>- Contrats (client, service)</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Zap size={16} className="text-[#D4A03C]" /> Actions rapides</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>- <strong>Nouveau client</strong> : depuis n'importe quelle page clients</li>
                  <li>- <strong>Nouveau dossier</strong> : depuis la fiche client ou la page dossiers</li>
                  <li>- <strong>Nouvelle facture</strong> : depuis la page facturation</li>
                  <li>- <strong>SOSIA</strong> : accessible depuis le sidebar a tout moment</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Bell size={16} className="text-[#D4A03C]" /> Notifications</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>- Documents expirants (alerte 30 jours avant)</li>
                  <li>- Echeances dossiers proches</li>
                  <li>- Factures en retard</li>
                  <li>- Nouveaux messages dans la messagerie</li>
                  <li>- Demandes de RDV en attente</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Target size={16} className="text-[#D4A03C]" /> Workflow quotidien recommande</h3>
                <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
                  <li>Consultez le <strong>Tableau de bord</strong> et les alertes</li>
                  <li>Verifiez la <strong>Messagerie</strong> (#Urgent d'abord)</li>
                  <li>Confirmez les <strong>RDV</strong> du jour dans le Calendrier</li>
                  <li>Traitez vos <strong>Dossiers</strong> prioritaires</li>
                  <li>Mettez a jour les <strong>statuts</strong> et <strong>notes</strong></li>
                  <li>Avant de partir : verifiez les taches du lendemain</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: FAQ ===== */}
        {activeTab === "faq" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Questions frequentes</h2>

            {[
              { q: "Comment ajouter un document a un client ?", a: "Allez dans la fiche client > section Documents > '+ Ajouter un document'. Selectionnez la categorie et televersez le fichier." },
              { q: "Comment generer une facture a partir d'un contrat ?", a: "Allez dans Facturation > '+ Nouvelle facture'. Selectionnez le client — les services du contrat actif seront pre-remplis." },
              { q: "Comment utiliser SOSIA pour analyser un refus ?", a: "Allez dans SOSIA > selectionnez le contexte 'Dossier' > joignez la lettre de refus (PDF/image) avec le bouton trombone > demandez 'Analyse ce refus et propose des solutions'." },
              { q: "Pourquoi les taxes sont a 0$ sur les factures ?", a: "SOS Hub Canada est un petit fournisseur au Quebec. Les taxes (TPS/TVQ) sont incluses dans le tarif. Les lignes a 0$ sont normales et conformes a la pratique standard." },
              { q: "Comment voir les dossiers de mon collegue ?", a: "Si vous avez les permissions (Coordinatrice ou Admin), utilisez le filtre 'Assigne a' dans la page Dossiers. Les techniciennes voient uniquement leurs dossiers assignes." },
              { q: "Comment envoyer un courriel a un client depuis le CRM ?", a: "Allez dans Marketing > creez une campagne ou utilisez un template. Pour un courriel individuel, utilisez le bouton 'Envoyer courriel' dans la fiche client." },
              { q: "Comment partager un dossier avec un collegue ?", a: "Dans le dossier, changez le champ 'Assigne a' pour reassigner. Vous pouvez aussi discuter du dossier dans le canal #Dossiers de la messagerie." },
              { q: "Qui contacter en cas de probleme technique ?", a: "Utilisez le canal #Technique dans la messagerie interne, ou contactez l'administrateur (P. Cadet) directement." },
              { q: "Comment fonctionne l'analyse de documents par SOSIA ?", a: "SOSIA utilise l'IA pour lire le contenu des PDF et images. Pour les PDF : le texte est extrait page par page. Pour les images : l'IA analyse visuellement le document (lettres scannees, formulaires, etc.)." },
              { q: "Le CRM est-il accessible sur mobile ?", a: "Oui, le CRM est responsive et accessible sur tablette et mobile via le navigateur. L'experience est optimisee pour desktop." },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 text-sm flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1B2559] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">?</span>
                  {faq.q}
                </h3>
                <p className="text-sm text-gray-600 mt-2 ml-7">{faq.a}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 mb-4 text-center">
          <p className="text-xs text-gray-400">
            Guide d'onboarding v1.0 — SOS Hub Canada — CRM Immigration — Mars 2026
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Pour toute question, contactez l'equipe technique via la messagerie interne canal #Technique
          </p>
        </div>
      </div>
    </div>
  );
}
