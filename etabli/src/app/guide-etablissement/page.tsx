"use client";
import Shell from "@/components/Shell";
import { useLang } from "@/lib/i18n";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Home,
  Briefcase,
  FileCheck,
  Heart,
  Sun,
  Globe,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  Circle,
  BookOpen,
  Clock,
  AlertTriangle,
  Lightbulb,
  MapPin,
  Phone,
  Info,
  Search,
} from "lucide-react";

/* ─────────────────── types ─────────────────── */

interface VocabItem {
  term: string;
  definitionFr: string;
  definitionEn: string;
}

interface ChecklistItem {
  id: string;
  labelFr: string;
  labelEn: string;
  detailFr: string;
  detailEn: string;
}

interface ResourceLink {
  labelFr: string;
  labelEn: string;
  url: string;
  category?: string;
}

interface TipItem {
  fr: string;
  en: string;
}

interface Pillar {
  id: string;
  icon: typeof Home;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  checklist: ChecklistItem[];
  vocab: VocabItem[];
  resources: ResourceLink[];
  tips: TipItem[];
}

/* ─────────────────── data ─────────────────── */

const pillars: Pillar[] = [
  /* ── 1. Logement ── */
  {
    id: "logement",
    icon: Home,
    titleFr: "Logement",
    titleEn: "Housing",
    descFr:
      "Comprendre le march\u00e9 locatif qu\u00e9b\u00e9cois, vos droits comme locataire, le format des logements et le processus de signature du bail.",
    descEn:
      "Understand the Quebec rental market, your tenant rights, apartment size formats, and the lease signing process.",
    checklist: [
      {
        id: "log-1",
        labelFr: "Comprendre le format des logements",
        labelEn: "Understand apartment size format",
        detailFr:
          "Au Qu\u00e9bec, un 4\u00bd signifie 4 pi\u00e8ces et demie (salon, cuisine, 2 chambres + salle de bain). Un 3\u00bd = 1 chambre, un 5\u00bd = 3 chambres.",
        detailEn:
          "In Quebec, a 4\u00bd means 4 and a half rooms (living room, kitchen, 2 bedrooms + bathroom). 3\u00bd = 1 bedroom, 5\u00bd = 3 bedrooms.",
      },
      {
        id: "log-2",
        labelFr: "Rechercher un logement",
        labelEn: "Search for an apartment",
        detailFr:
          "Sites principaux : Kijiji, Facebook Marketplace, Rentals.ca, Zumper, Realtor.ca. \u00c9vitez les arnaques (ne jamais payer avant visite).",
        detailEn:
          "Main sites: Kijiji, Facebook Marketplace, Rentals.ca, Zumper, Realtor.ca. Avoid scams (never pay before visiting).",
      },
      {
        id: "log-3",
        labelFr: "Visiter des appartements",
        labelEn: "Visit apartments",
        detailFr:
          "V\u00e9rifiez : chauffage inclus ou non, eau chaude, buanderie, stationnement, proximit\u00e9 m\u00e9tro/bus. Prenez des photos.",
        detailEn:
          "Check: heating included or not, hot water, laundry, parking, proximity to metro/bus. Take photos.",
      },
      {
        id: "log-4",
        labelFr: "Comprendre le bail (contrat de location)",
        labelEn: "Understand the lease",
        detailFr:
          "Le bail standard du Qu\u00e9bec est obligatoire. Lisez chaque clause. Dur\u00e9e typique : 12 mois (1er juillet au 30 juin). Le propri\u00e9taire ne peut PAS exiger un d\u00e9p\u00f4t de garantie.",
        detailEn:
          "The standard Quebec lease is mandatory. Read every clause. Typical term: 12 months (July 1 to June 30). Landlord CANNOT require a security deposit.",
      },
      {
        id: "log-5",
        labelFr: "Signer le bail",
        labelEn: "Sign the lease",
        detailFr:
          "Vous avez droit \u00e0 une copie dans les 10 jours. Conservez-la pr\u00e9cieusement. Le bail se renouvelle automatiquement sauf avis contraire.",
        detailEn:
          "You have the right to a copy within 10 days. Keep it safe. The lease renews automatically unless notice is given.",
      },
      {
        id: "log-6",
        labelFr: "Conna\u00eetre vos droits locataires",
        labelEn: "Know your tenant rights",
        detailFr:
          "Pas de d\u00e9p\u00f4t de garantie. Le propri\u00e9taire doit donner un pr\u00e9avis de 24h pour entrer. Augmentation de loyer contr\u00f4l\u00e9e. Recours au TAL (Tribunal administratif du logement).",
        detailEn:
          "No security deposit. Landlord must give 24h notice to enter. Rent increases are controlled. Recourse through the TAL (Housing Administrative Tribunal).",
      },
      {
        id: "log-7",
        labelFr: "Ouvrir un compte Hydro-Qu\u00e9bec",
        labelEn: "Set up Hydro-Qu\u00e9bec account",
        detailFr:
          "L\u2019\u00e9lectricit\u00e9 au Qu\u00e9bec est fournie par Hydro-Qu\u00e9bec. Inscrivez-vous en ligne ou par t\u00e9l\u00e9phone d\u00e8s la signature du bail.",
        detailEn:
          "Electricity in Quebec is provided by Hydro-Qu\u00e9bec. Register online or by phone as soon as you sign the lease.",
      },
      {
        id: "log-8",
        labelFr: "Installer internet",
        labelEn: "Set up internet",
        detailFr:
          "Fournisseurs : Bell, Vid\u00e9otron, Fizz, Virgin, Oxio. Comparez les prix. Fizz offre souvent les meilleurs tarifs.",
        detailEn:
          "Providers: Bell, Vid\u00e9otron, Fizz, Virgin, Oxio. Compare prices. Fizz often has the best rates.",
      },
      {
        id: "log-9",
        labelFr: "Souscrire une assurance habitation",
        labelEn: "Get renter\u2019s insurance",
        detailFr:
          "Fortement recommand\u00e9e (parfois exig\u00e9e par le propri\u00e9taire). Couvre vol, incendie, d\u00e9g\u00e2ts d\u2019eau. ~25-50$/mois.",
        detailEn:
          "Highly recommended (sometimes required by landlord). Covers theft, fire, water damage. ~$25-50/month.",
      },
      {
        id: "log-10",
        labelFr: "Mettre \u00e0 jour votre adresse (RAMQ, SAAQ, Poste Canada)",
        labelEn: "Update your address (RAMQ, SAAQ, Canada Post)",
        detailFr:
          "D\u00e8s votre emm\u00e9nagement, mettez \u00e0 jour votre adresse aupr\u00e8s de la RAMQ, SAAQ, banque et effectuez un suivi de courrier.",
        detailEn:
          "Once you move in, update your address with RAMQ, SAAQ, bank, and set up mail forwarding.",
      },
      {
        id: "log-11",
        labelFr: "Comprendre le jour du d\u00e9m\u00e9nagement (1er juillet)",
        labelEn: "Understand Moving Day (July 1st)",
        detailFr:
          "Au Qu\u00e9bec, la majorit\u00e9 des baux se terminent le 30 juin. Le 1er juillet est le \u00ab jour du d\u00e9m\u00e9nagement \u00bb national. R\u00e9servez un camion tr\u00e8s t\u00f4t!",
        detailEn:
          "In Quebec, most leases end June 30. July 1st is the national \u201cMoving Day.\u201d Book a truck very early!",
      },
      {
        id: "log-12",
        labelFr: "\u00c9tat des lieux (inspection d\u2019entr\u00e9e)",
        labelEn: "Move-in inspection",
        detailFr:
          "Photographiez tout d\u00e9faut existant et envoyez la liste au propri\u00e9taire par \u00e9crit dans les premiers jours.",
        detailEn:
          "Photograph all existing defects and send the list to the landlord in writing within the first few days.",
      },
    ],
    vocab: [
      { term: "bail", definitionFr: "Contrat de location", definitionEn: "Lease agreement" },
      { term: "loyer", definitionFr: "Montant mensuel \u00e0 payer", definitionEn: "Monthly rent" },
      { term: "chauffage inclus", definitionFr: "Le co\u00fbt du chauffage est dans le loyer", definitionEn: "Heating included in rent" },
      { term: "4\u00bd", definitionFr: "Appartement \u00e0 2 chambres (4 pi\u00e8ces + salle de bain)", definitionEn: "2-bedroom apartment (4 rooms + bathroom)" },
      { term: "propri\u00e9taire", definitionFr: "Celui qui poss\u00e8de le logement", definitionEn: "Landlord/owner" },
      { term: "locataire", definitionFr: "Celui qui loue le logement", definitionEn: "Tenant/renter" },
      { term: "concierge", definitionFr: "Gardien de l\u2019immeuble", definitionEn: "Building superintendent" },
      { term: "TAL", definitionFr: "Tribunal administratif du logement", definitionEn: "Housing Administrative Tribunal" },
      { term: "d\u00e9p\u00f4t", definitionFr: "Somme d\u2019argent vers\u00e9e en garantie (interdit au QC!)", definitionEn: "Security deposit (illegal in QC!)" },
      { term: "avis de non-renouvellement", definitionFr: "Lettre pour quitter \u00e0 la fin du bail", definitionEn: "Notice of non-renewal" },
    ],
    resources: [
      { labelFr: "Tribunal administratif du logement (TAL)", labelEn: "Housing Administrative Tribunal (TAL)", url: "https://www.tal.gouv.qc.ca/" },
      { labelFr: "Hydro-Qu\u00e9bec \u2013 Ouvrir un compte", labelEn: "Hydro-Qu\u00e9bec \u2013 Open an account", url: "https://www.hydroquebec.com/" },
      { labelFr: "Kijiji \u2013 Logements", labelEn: "Kijiji \u2013 Apartments", url: "https://www.kijiji.ca/b-apartments-condos/ville-de-montreal/c37l1700281" },
      { labelFr: "Rentals.ca", labelEn: "Rentals.ca", url: "https://rentals.ca/" },
      { labelFr: "\u00c9ducaloi \u2013 Droits des locataires", labelEn: "\u00c9ducaloi \u2013 Tenant rights", url: "https://educaloi.qc.ca/capsules/le-bail-de-logement/" },
    ],
    tips: [
      { fr: "Ne payez JAMAIS un d\u00e9p\u00f4t de garantie \u2013 c\u2019est ill\u00e9gal au Qu\u00e9bec.", en: "NEVER pay a security deposit \u2013 it\u2019s illegal in Quebec." },
      { fr: "M\u00e9fiez-vous des offres trop belles pour \u00eatre vraies sur Kijiji. Visitez toujours avant de payer.", en: "Beware of too-good-to-be-true offers on Kijiji. Always visit before paying." },
      { fr: "Le 1er juillet, il est presque impossible de trouver un camion. R\u00e9servez en mars!", en: "On July 1st, it\u2019s nearly impossible to find a truck. Book in March!" },
    ],
  },

  /* ── 2. Administration ── */
  {
    id: "administration",
    icon: FileCheck,
    titleFr: "Administration",
    titleEn: "Administration",
    descFr:
      "Les d\u00e9marches administratives essentielles \u00e0 effectuer dans vos premi\u00e8res semaines au Qu\u00e9bec : NAS, RAMQ, banque, t\u00e9l\u00e9phone et transport.",
    descEn:
      "Essential administrative steps to complete in your first weeks in Quebec: SIN, RAMQ, bank, phone, and transit.",
    checklist: [
      {
        id: "adm-1",
        labelFr: "Obtenir votre NAS (Num\u00e9ro d\u2019assurance sociale)",
        labelEn: "Get your SIN (Social Insurance Number)",
        detailFr:
          "Rendez-vous \u00e0 un bureau de Service Canada avec votre permis de travail/\u00e9tude et passeport. Gratuit. Pr\u00e9voyez 1-2h d\u2019attente.",
        detailEn:
          "Go to a Service Canada office with your work/study permit and passport. Free. Expect 1-2h wait.",
      },
      {
        id: "adm-2",
        labelFr: "Demander la carte RAMQ (assurance maladie)",
        labelEn: "Apply for RAMQ card (health insurance)",
        detailFr:
          "Rendez-vous en ligne ou en personne. Apportez : permis de travail, passeport, preuve d\u2019adresse, NAS. ATTENTION : d\u00e9lai de carence de 3 mois pour les r\u00e9sidents permanents.",
        detailEn:
          "Apply online or in person. Bring: work permit, passport, proof of address, SIN. WARNING: 3-month waiting period for permanent residents.",
      },
      {
        id: "adm-3",
        labelFr: "Ouvrir un compte bancaire",
        labelEn: "Open a bank account",
        detailFr:
          "Banques populaires : Desjardins, Banque Nationale, RBC, TD. Apportez passeport + permis de travail. Desjardins offre souvent des comptes gratuits pour nouveaux arrivants.",
        detailEn:
          "Popular banks: Desjardins, National Bank, RBC, TD. Bring passport + work permit. Desjardins often offers free accounts for newcomers.",
      },
      {
        id: "adm-4",
        labelFr: "Obtenir un forfait cellulaire",
        labelEn: "Get a cell phone plan",
        detailFr:
          "Forfaits abordables : Fizz, Koodo, Public Mobile, Lucky Mobile. Comparez sur redflagdeals.com. Apportez votre propre t\u00e9l\u00e9phone pour \u00e9conomiser.",
        detailEn:
          "Affordable plans: Fizz, Koodo, Public Mobile, Lucky Mobile. Compare on redflagdeals.com. Bring your own phone to save.",
      },
      {
        id: "adm-5",
        labelFr: "Obtenir une carte OPUS (transport en commun)",
        labelEn: "Get an OPUS card (public transit)",
        detailFr:
          "Carte rechargeable pour le m\u00e9tro/bus STM (Montr\u00e9al) ou RTC (Qu\u00e9bec). Achetez dans une station de m\u00e9tro. Tarif r\u00e9duit pour \u00e9tudiants.",
        detailEn:
          "Rechargeable card for STM metro/bus (Montreal) or RTC (Quebec City). Buy at any metro station. Reduced rate for students.",
      },
      {
        id: "adm-6",
        labelFr: "Faire votre d\u00e9claration d\u2019imp\u00f4ts",
        labelEn: "File your tax return",
        detailFr:
          "M\u00eame si vous arrivez en cours d\u2019ann\u00e9e, vous devez d\u00e9clarer vos revenus. Date limite : 30 avril. Utilisez Wealthsimple Tax (gratuit) ou un comptable.",
        detailEn:
          "Even if you arrive mid-year, you must file. Deadline: April 30. Use Wealthsimple Tax (free) or an accountant.",
      },
      {
        id: "adm-7",
        labelFr: "S\u2019inscrire \u00e0 l\u2019allocation canadienne pour enfants (si applicable)",
        labelEn: "Register for Canada Child Benefit (if applicable)",
        detailFr:
          "Si vous avez des enfants de moins de 18 ans, inscrivez-vous d\u00e8s r\u00e9ception du NAS. Jusqu\u2019\u00e0 ~600$/mois par enfant.",
        detailEn:
          "If you have children under 18, register as soon as you have your SIN. Up to ~$600/month per child.",
      },
      {
        id: "adm-8",
        labelFr: "Obtenir un permis de conduire (si n\u00e9cessaire)",
        labelEn: "Get a driver\u2019s license (if needed)",
        detailFr:
          "Vous avez 6 mois pour \u00e9changer un permis \u00e9tranger (selon les ententes). Rendez-vous \u00e0 la SAAQ avec permis original, passeport, preuve d\u2019adresse.",
        detailEn:
          "You have 6 months to exchange a foreign license (depending on agreements). Go to SAAQ with original license, passport, proof of address.",
      },
      {
        id: "adm-9",
        labelFr: "Obtenir un relev\u00e9 de cr\u00e9dit / b\u00e2tir votre cr\u00e9dit",
        labelEn: "Build your credit history",
        detailFr:
          "Demandez une carte de cr\u00e9dit garantie (secured) pour commencer. Payez toujours le solde complet. V\u00e9rifiez votre score sur Borrowell (gratuit).",
        detailEn:
          "Apply for a secured credit card to start. Always pay the full balance. Check your score on Borrowell (free).",
      },
      {
        id: "adm-10",
        labelFr: "S\u2019inscrire \u00e0 Mon dossier Service Canada et Revenu Qu\u00e9bec",
        labelEn: "Register for My Service Canada Account and Revenu Qu\u00e9bec",
        detailFr:
          "Cr\u00e9ez vos comptes en ligne pour suivre vos prestations, imp\u00f4ts et d\u00e9marches gouvernementales.",
        detailEn:
          "Create your online accounts to track your benefits, taxes, and government services.",
      },
      {
        id: "adm-11",
        labelFr: "Trouver un comptable (CPA) pour la première déclaration",
        labelEn: "Find an accountant (CPA) for your first tax return",
        detailFr:
          "Pour les revenus étrangers, biens immobiliers à l'étranger ou crédit d'impôt pour frais de scolarité, un CPA spécialisé en immigration peut maximiser vos remboursements. Trouvez-en un sur cpaquebec.ca.",
        detailEn:
          "For foreign income, overseas real estate, or tuition tax credits, an immigration-specialized CPA can maximize your refunds. Find one at cpaquebec.ca.",
      },
      {
        id: "adm-12",
        labelFr: "Consulter un avocat en immigration (si nécessaire)",
        labelEn: "Consult an immigration lawyer (if needed)",
        detailFr:
          "Pour les cas complexes (refus, parrainage, demande d'asile), consultez un avocat membre du Barreau du Québec. Aide juridique gratuite disponible pour les revenus modestes.",
        detailEn:
          "For complex cases (refusals, sponsorship, asylum), consult a lawyer who is a member of the Quebec Bar. Free legal aid available for low-income individuals.",
      },
      {
        id: "adm-13",
        labelFr: "S'inscrire à un organisme communautaire d'aide aux immigrants",
        labelEn: "Register with a community immigrant aid organization",
        detailFr:
          "PROMIS, CACI, YMCA, Carrefour BLE offrent des services GRATUITS : aide administrative, ateliers emploi, jumelage, cours de français. Trouvez le plus proche sur quebec.ca.",
        detailEn:
          "PROMIS, CACI, YMCA, Carrefour BLE offer FREE services: admin help, employment workshops, mentoring, French classes. Find the nearest on quebec.ca.",
      },
      {
        id: "adm-14",
        labelFr: "Souscrire une assurance habitation",
        labelEn: "Get tenant/home insurance",
        detailFr:
          "Obligatoire pour la plupart des baux. Comparez sur kanetix.ca ou hellosafe.ca. Environ 30-50$/mois. Protège contre incendie, vol, dégâts d'eau.",
        detailEn:
          "Required by most leases. Compare on kanetix.ca or hellosafe.ca. About $30-50/month. Covers fire, theft, water damage.",
      },
      {
        id: "adm-15",
        labelFr: "Vérifier la reconnaissance de votre diplôme (ECA/WES)",
        labelEn: "Check your credential recognition (ECA/WES)",
        detailFr:
          "Pour l'immigration (Express Entry, PSTQ) : obtenez une évaluation comparative via WES, IQAS ou un organisme désigné. Pour exercer une profession réglementée au QC : contactez l'ordre professionnel concerné.",
        detailEn:
          "For immigration (Express Entry, PSTQ): get a comparative assessment via WES, IQAS, or a designated organization. To practice a regulated profession in QC: contact the relevant professional order.",
      },
    ],
    vocab: [
      { term: "NAS", definitionFr: "Num\u00e9ro d\u2019assurance sociale", definitionEn: "Social Insurance Number (SIN)" },
      { term: "RAMQ", definitionFr: "R\u00e9gie de l\u2019assurance maladie du Qu\u00e9bec", definitionEn: "Quebec Health Insurance Board" },
      { term: "carte soleil", definitionFr: "Surnom de la carte d\u2019assurance maladie (jaune)", definitionEn: "Nickname for the health insurance card (yellow)" },
      { term: "formulaire", definitionFr: "Document \u00e0 remplir", definitionEn: "Form to fill out" },
      { term: "rendez-vous", definitionFr: "Rencontre planifi\u00e9e", definitionEn: "Appointment" },
      { term: "d\u00e9lai de carence", definitionFr: "P\u00e9riode d\u2019attente avant couverture RAMQ", definitionEn: "Waiting period before RAMQ coverage" },
      { term: "preuve d\u2019adresse", definitionFr: "Document confirmant votre domicile", definitionEn: "Proof of address document" },
      { term: "SAAQ", definitionFr: "Soci\u00e9t\u00e9 de l\u2019assurance automobile du Qu\u00e9bec", definitionEn: "Quebec Automobile Insurance Corporation" },
    ],
    resources: [
      { labelFr: "Service Canada — NAS", labelEn: "Service Canada — SIN", url: "https://www.canada.ca/fr/emploi-developpement-social/services/numero-assurance-sociale.html", category: "federal" },
      { labelFr: "IRCC — Mon dossier immigration", labelEn: "IRCC — My immigration account", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/demande/comptes.html", category: "federal" },
      { labelFr: "ARC — Mon dossier (impôts fédéraux)", labelEn: "CRA — My Account (federal taxes)", url: "https://www.canada.ca/fr/agence-revenu/services/services-electroniques/services-numeriques-particuliers/dossier-particuliers.html", category: "federal" },
      { labelFr: "Allocation canadienne pour enfants (ACE)", labelEn: "Canada Child Benefit (CCB)", url: "https://www.canada.ca/fr/agence-revenu/services/prestations-enfants-familles/allocation-canadienne-enfants-apercu.html", category: "federal" },
      { labelFr: "Assurance-emploi (AE)", labelEn: "Employment Insurance (EI)", url: "https://www.canada.ca/fr/services/prestations/ae.html", category: "federal" },
      { labelFr: "Passeport Canada", labelEn: "Passport Canada", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/passeports-canadiens.html", category: "federal" },
      { labelFr: "RAMQ — Inscription assurance maladie", labelEn: "RAMQ — Health insurance registration", url: "https://www.ramq.gouv.qc.ca/fr/citoyens/assurance-maladie/sinscrire", category: "provincial" },
      { labelFr: "SAAQ — Permis de conduire et immatriculation", labelEn: "SAAQ — Driver's license and registration", url: "https://saaq.gouv.qc.ca/permis-de-conduire/", category: "provincial" },
      { labelFr: "Revenu Québec — Mon dossier (impôts QC)", labelEn: "Revenu Québec — My Account (QC taxes)", url: "https://www.revenuquebec.ca/fr/services-en-ligne/mon-dossier/", category: "provincial" },
      { labelFr: "MIFI — Accompagnement Québec", labelEn: "MIFI — Accompagnement Québec", url: "https://www.quebec.ca/immigration/s-installer-et-s-integrer-au-quebec", category: "provincial" },
      { labelFr: "Arrima — Portail immigration Québec", labelEn: "Arrima — Quebec immigration portal", url: "https://www.quebec.ca/immigration/arrima", category: "provincial" },
      { labelFr: "Qualifications Québec — Diplômes", labelEn: "Qualifications Québec — Credentials", url: "https://www.quebec.ca/emploi/reconnaissance-etudes-experience/faire-reconnaitre-competences-acquises", category: "provincial" },
      { labelFr: "TAL — Tribunal du logement", labelEn: "TAL — Housing Tribunal", url: "https://www.tal.gouv.qc.ca/", category: "provincial" },
      { labelFr: "CNESST — Normes du travail", labelEn: "CNESST — Labour standards", url: "https://www.cnesst.gouv.qc.ca/", category: "provincial" },
      { labelFr: "OPC — Protection du consommateur", labelEn: "OPC — Consumer Protection", url: "https://www.opc.gouv.qc.ca/", category: "provincial" },
      { labelFr: "RBQ — Régie du bâtiment", labelEn: "RBQ — Building Board", url: "https://www.rbq.gouv.qc.ca/", category: "provincial" },
      { labelFr: "STM — Transport Montréal", labelEn: "STM — Montreal transit", url: "https://www.stm.info/fr/infos/titres-et-tarifs/carte-opus", category: "municipal" },
      { labelFr: "RTC — Transport Québec (ville)", labelEn: "RTC — Quebec City transit", url: "https://www.rtcquebec.ca/", category: "municipal" },
      { labelFr: "Info-311 — Montréal", labelEn: "Info-311 — Montreal", url: "https://montreal.ca/311", category: "municipal" },
      { labelFr: "Bibliothèques de Montréal", labelEn: "Montreal Public Libraries", url: "https://bibliomontreal.com/", category: "municipal" },
      { labelFr: "Desjardins — Nouveaux arrivants", labelEn: "Desjardins — Newcomers", url: "https://www.desjardins.com/ca/nouveaux-arrivants/index.jsp", category: "banques" },
      { labelFr: "Banque Nationale — Nouveaux arrivants", labelEn: "National Bank — Newcomers", url: "https://www.bnc.ca/fr/particuliers/comptes/nouveaux-arrivants.html", category: "banques" },
      { labelFr: "RBC — Nouveaux arrivants", labelEn: "RBC — Newcomers", url: "https://www.rbcroyalbank.com/fr/newcomers-to-canada/", category: "banques" },
      { labelFr: "TD — Bienvenue au Canada", labelEn: "TD — Welcome to Canada", url: "https://www.td.com/ca/fr/services-bancaires-personnels/nouveau-au-canada", category: "banques" },
      { labelFr: "Borrowell — Cote de crédit gratuit", labelEn: "Borrowell — Free credit score", url: "https://borrowell.com/", category: "banques" },
      { labelFr: "Ordre des CPA — Comptable", labelEn: "CPA Order — Accountant", url: "https://cpaquebec.ca/fr/le-public/trouver-un-cpa/", category: "pros" },
      { labelFr: "Wealthsimple Tax — Impôts gratuits", labelEn: "Wealthsimple Tax — Free filing", url: "https://www.wealthsimple.com/fr-ca/tax", category: "pros" },
      { labelFr: "H&R Block — Fiscalité immigrants", labelEn: "H&R Block — Immigrant taxes", url: "https://www.hrblock.ca/fr/", category: "pros" },
      { labelFr: "Barreau du Québec — Avocat", labelEn: "Quebec Bar — Lawyer", url: "https://www.barreau.qc.ca/fr/trouver-avocat/", category: "pros" },
      { labelFr: "Chambre des notaires", labelEn: "Chamber of Notaries", url: "https://www.cnq.org/fr/trouver-un-notaire.html", category: "pros" },
      { labelFr: "Aide juridique Québec (gratuit)", labelEn: "Quebec Legal Aid (free)", url: "https://www.justice.gouv.qc.ca/aide-juridique/", category: "pros" },
      { labelFr: "Ordres professionnels du Québec", labelEn: "Quebec Professional Orders", url: "https://www.opq.gouv.qc.ca/", category: "pros" },
      { labelFr: "Fizz — Forfaits mobiles", labelEn: "Fizz — Mobile plans", url: "https://fizz.ca/", category: "telecom" },
      { labelFr: "Public Mobile — Prépayé", labelEn: "Public Mobile — Prepaid", url: "https://www.publicmobile.ca/fr", category: "telecom" },
      { labelFr: "Koodo — Forfaits compétitifs", labelEn: "Koodo — Competitive plans", url: "https://www.koodomobile.com/fr", category: "telecom" },
      { labelFr: "PROMIS — Aide immigrants MTL", labelEn: "PROMIS — Immigrant aid MTL", url: "https://promis.qc.ca/", category: "communautaire" },
      { labelFr: "CACI — Appui communautés immigrantes", labelEn: "CACI — Immigrant community support", url: "https://caci-bc.org/", category: "communautaire" },
      { labelFr: "YMCA — Nouveaux arrivants", labelEn: "YMCA — Newcomer services", url: "https://www.ymcaquebec.org/", category: "communautaire" },
      { labelFr: "Objectif Intégration — MIFI gratuit", labelEn: "Objectif Intégration — Free MIFI", url: "https://www.quebec.ca/immigration/s-installer-et-s-integrer-au-quebec/apprendre-le-francais/objectif-integration", category: "communautaire" },
    ],
    tips: [
      { fr: "Obtenez votre NAS EN PREMIER — vous en aurez besoin pour presque tout le reste (banque, emploi, impôts).", en: "Get your SIN FIRST — you'll need it for almost everything else (bank, employment, taxes)." },
      { fr: "Si vous êtes résident permanent, souscrivez une assurance privée temporaire pendant le délai de carence RAMQ de 3 mois (Croix Bleue, Manuvie).", en: "If you're a permanent resident, get temporary private insurance during the 3-month RAMQ waiting period (Blue Cross, Manulife)." },
      { fr: "Bâtir du crédit dès le début est crucial. Demandez une carte de crédit garantie (secured) et payez toujours le solde complet.", en: "Building credit from the start is crucial. Get a secured credit card and always pay the full balance." },
      { fr: "Utilisez Wealthsimple Tax (gratuit) pour votre première déclaration d'impôts. Pour les situations complexes (revenus étrangers, biens à l'étranger), consultez un CPA.", en: "Use Wealthsimple Tax (free) for your first tax return. For complex situations (foreign income, overseas assets), consult a CPA." },
      { fr: "Inscrivez-vous aux comptes en ligne du gouvernement (Mon dossier ARC, Mon dossier Revenu Québec, Mon dossier Service Canada) dès que possible.", en: "Register for government online accounts (My CRA Account, My Revenu Québec Account, My Service Canada Account) as soon as possible." },
      { fr: "Comparez les forfaits bancaires sur ratehub.ca — les banques offrent souvent des promotions pour nouveaux arrivants (aucuns frais la première année).", en: "Compare banking packages on ratehub.ca — banks often offer promotions for newcomers (no fees for the first year)." },
      { fr: "Pour les ordres professionnels (ingénieur, infirmier, comptable), commencez votre demande de reconnaissance AVANT d'arriver si possible.", en: "For professional orders (engineer, nurse, accountant), start your credential recognition application BEFORE arriving if possible." },
    ],
  },

  /* ── 3. Emploi ── */
  {
    id: "emploi",
    icon: Briefcase,
    titleFr: "Emploi",
    titleEn: "Employment",
    descFr:
      "Trouver un emploi au Qu\u00e9bec : format du CV, o\u00f9 chercher, culture d\u2019entrevue, reconnaissance des dipl\u00f4mes et permis de travail.",
    descEn:
      "Finding a job in Quebec: CV format, where to search, interview culture, credential recognition, and work permits.",
    checklist: [
      {
        id: "emp-1",
        labelFr: "Adapter votre CV au format qu\u00e9b\u00e9cois",
        labelEn: "Adapt your CV to Quebec format",
        detailFr:
          "Pas de photo, pas d\u2019\u00e2ge, pas de situation familiale. Focus sur les r\u00e9alisations chiffr\u00e9es. 2 pages maximum. Utilisez des verbes d\u2019action.",
        detailEn:
          "No photo, no age, no marital status. Focus on quantified achievements. 2 pages maximum. Use action verbs.",
      },
      {
        id: "emp-2",
        labelFr: "R\u00e9diger une lettre de pr\u00e9sentation",
        labelEn: "Write a cover letter",
        detailFr:
          "Toujours personnalis\u00e9e pour chaque poste. Montrez que vous connaissez l\u2019entreprise. 1 page maximum.",
        detailEn:
          "Always personalized for each position. Show you know the company. 1 page maximum.",
      },
      {
        id: "emp-3",
        labelFr: "Faire \u00e9valuer vos dipl\u00f4mes (\u00c9CA / WES)",
        labelEn: "Get your credentials evaluated (ECA / WES)",
        detailFr:
          "WES (World Education Services) ou Qualifications Qu\u00e9bec pour l\u2019\u00e9quivalence de vos dipl\u00f4mes. D\u00e9lai : 4-12 semaines.",
        detailEn:
          "WES (World Education Services) or Qualifications Qu\u00e9bec for diploma equivalency. Timeline: 4-12 weeks.",
      },
      {
        id: "emp-4",
        labelFr: "S\u2019inscrire sur les sites d\u2019emploi",
        labelEn: "Register on job sites",
        detailFr:
          "Indeed, LinkedIn, Jobillico, Emploi Qu\u00e9bec (Placement en ligne), Jobboom. Activez les alertes emploi.",
        detailEn:
          "Indeed, LinkedIn, Jobillico, Emploi Qu\u00e9bec (Placement en ligne), Jobboom. Set up job alerts.",
      },
      {
        id: "emp-5",
        labelFr: "S\u2019inscrire \u00e0 Emploi Qu\u00e9bec",
        labelEn: "Register with Emploi Qu\u00e9bec",
        detailFr:
          "Acc\u00e8s \u00e0 des formations, ateliers de recherche d\u2019emploi, et accompagnement personnalis\u00e9. Service gratuit.",
        detailEn:
          "Access to training, job search workshops, and personalized support. Free service.",
      },
      {
        id: "emp-6",
        labelFr: "Cr\u00e9er / optimiser votre profil LinkedIn",
        labelEn: "Create / optimize your LinkedIn profile",
        detailFr:
          "Photo professionnelle, titre accrocheur, r\u00e9sum\u00e9 bilingue. Connectez-vous avec des professionnels de votre domaine au Qu\u00e9bec.",
        detailEn:
          "Professional photo, catchy headline, bilingual summary. Connect with professionals in your field in Quebec.",
      },
      {
        id: "emp-7",
        labelFr: "Pr\u00e9parer les entrevues \u00e0 la qu\u00e9b\u00e9coise",
        labelEn: "Prepare for Quebec-style interviews",
        detailFr:
          "Tutoiement fr\u00e9quent mais attendez que l\u2019intervieweur commence. Poign\u00e9e de main ferme, contact visuel. Questions comportementales (STAR method).",
        detailEn:
          "Informal \u2018tu\u2019 is frequent but wait for the interviewer to start. Firm handshake, eye contact. Behavioral questions (STAR method).",
      },
      {
        id: "emp-8",
        labelFr: "Postuler \u00e0 au moins 10 offres d\u2019emploi",
        labelEn: "Apply to at least 10 job offers",
        detailFr:
          "La recherche d\u2019emploi est un jeu de nombres. Personnalisez chaque candidature. Suivez vos candidatures dans un tableau.",
        detailEn:
          "Job searching is a numbers game. Personalize each application. Track your applications in a spreadsheet.",
      },
      {
        id: "emp-9",
        labelFr: "V\u00e9rifier votre permis de travail",
        labelEn: "Verify your work permit",
        detailFr:
          "Types : EIMT (employeur-sp\u00e9cifique), exempt\u00e9 EIMT, PTO (ouvert). V\u00e9rifiez les conditions et la date d\u2019expiration de votre permis.",
        detailEn:
          "Types: LMIA (employer-specific), LMIA-exempt, OWP (open). Check the conditions and expiry date of your permit.",
      },
      {
        id: "emp-10",
        labelFr: "Participer \u00e0 des \u00e9v\u00e9nements de r\u00e9seautage",
        labelEn: "Attend networking events",
        detailFr:
          "Journ\u00e9es de l\u2019emploi, 5\u00e0@7, chambres de commerce, associations professionnelles. Le r\u00e9seautage est cl\u00e9 au Qu\u00e9bec.",
        detailEn:
          "Job fairs, 5\u00e0@7 (after-work networking), chambers of commerce, professional associations. Networking is key in Quebec.",
      },
      {
        id: "emp-11",
        labelFr: "Pratiquer le fran\u00e7ais pour les entrevues",
        labelEn: "Practice French for interviews",
        detailFr:
          "M\u00eame si le poste est bilingue, montrer que vous faites l\u2019effort en fran\u00e7ais fait une \u00e9norme diff\u00e9rence.",
        detailEn:
          "Even if the position is bilingual, showing you make the effort in French makes a huge difference.",
      },
    ],
    vocab: [
      { term: "CV", definitionFr: "Curriculum vitae (r\u00e9sum\u00e9)", definitionEn: "Resume" },
      { term: "entrevue", definitionFr: "Entretien d\u2019embauche", definitionEn: "Job interview" },
      { term: "poste", definitionFr: "Position / emploi", definitionEn: "Position / job" },
      { term: "salaire", definitionFr: "R\u00e9mun\u00e9ration", definitionEn: "Salary" },
      { term: "avantages sociaux", definitionFr: "B\u00e9n\u00e9fices (assurance, vacances, etc.)", definitionEn: "Benefits (insurance, vacation, etc.)" },
      { term: "temps plein", definitionFr: "35-40 heures par semaine", definitionEn: "Full-time (35-40 hours/week)" },
      { term: "temps partiel", definitionFr: "Moins de 30 heures par semaine", definitionEn: "Part-time (under 30 hours/week)" },
      { term: "EIMT", definitionFr: "\u00c9tude d\u2019impact sur le march\u00e9 du travail", definitionEn: "Labour Market Impact Assessment (LMIA)" },
      { term: "r\u00e9seautage", definitionFr: "Cr\u00e9er des contacts professionnels", definitionEn: "Networking" },
    ],
    resources: [
      // ── Guichet-Emplois et services gouvernementaux ──
      { labelFr: "Guichet-Emplois (fédéral)", labelEn: "Job Bank (federal)", url: "https://www.guichetemplois.gc.ca/", category: "gouvernement" },
      { labelFr: "Emploi Québec — Placement en ligne", labelEn: "Emploi Québec — Online placement", url: "https://www.emploiquebec.gouv.qc.ca/", category: "gouvernement" },
      { labelFr: "Québec en tête — Recrutement international", labelEn: "Québec en tête — International recruitment", url: "https://www.quebecentete.com/", category: "gouvernement" },
      { labelFr: "Services Québec — Aide à l'emploi", labelEn: "Services Québec — Employment help", url: "https://www.quebec.ca/emploi/", category: "gouvernement" },
      { labelFr: "IRCC — Permis de travail", labelEn: "IRCC — Work permits", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/travailler-canada.html", category: "gouvernement" },
      { labelFr: "CNESST — Normes du travail", labelEn: "CNESST — Labour standards", url: "https://www.cnesst.gouv.qc.ca/fr/conditions-travail", category: "gouvernement" },
      // ── Sites d'emploi majeurs ──
      { labelFr: "Indeed Québec", labelEn: "Indeed Quebec", url: "https://emplois.ca.indeed.com/", category: "sites-emploi" },
      { labelFr: "LinkedIn Jobs", labelEn: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs/", category: "sites-emploi" },
      { labelFr: "Jobillico", labelEn: "Jobillico", url: "https://www.jobillico.com/", category: "sites-emploi" },
      { labelFr: "Jobboom", labelEn: "Jobboom", url: "https://www.jobboom.com/", category: "sites-emploi" },
      { labelFr: "Glassdoor Canada", labelEn: "Glassdoor Canada", url: "https://www.glassdoor.ca/", category: "sites-emploi" },
      { labelFr: "Monster Canada", labelEn: "Monster Canada", url: "https://www.monster.ca/", category: "sites-emploi" },
      { labelFr: "Workopolis / Talent.com", labelEn: "Workopolis / Talent.com", url: "https://www.talent.com/", category: "sites-emploi" },
      { labelFr: "ZipRecruiter Canada", labelEn: "ZipRecruiter Canada", url: "https://www.ziprecruiter.com/", category: "sites-emploi" },
      { labelFr: "SimplyHired", labelEn: "SimplyHired", url: "https://www.simplyhired.ca/", category: "sites-emploi" },
      // ── Sites spécialisés immigrants/bilingues ──
      { labelFr: "Immigrant Québec — Emploi", labelEn: "Immigrant Québec — Jobs", url: "https://immigrantquebec.com/fr/travailler", category: "immigrants" },
      { labelFr: "Hire Immigrants — Employeurs", labelEn: "Hire Immigrants — Employers", url: "https://www.hireimmigrants.ca/", category: "immigrants" },
      { labelFr: "Newcomer Jobs Canada", labelEn: "Newcomer Jobs Canada", url: "https://newcomerjobs.ca/", category: "immigrants" },
      { labelFr: "Immploy — Emploi immigrants", labelEn: "Immploy — Immigrant jobs", url: "https://immploy.ca/", category: "immigrants" },
      // ── Reconnaissance des diplômes ──
      { labelFr: "WES — Évaluation diplômes", labelEn: "WES — Credential evaluation", url: "https://www.wes.org/ca/", category: "diplomes" },
      { labelFr: "Qualifications Québec", labelEn: "Qualifications Québec", url: "https://www.qualificationsquebec.com/", category: "diplomes" },
      { labelFr: "Ordres professionnels du Québec", labelEn: "Quebec Professional Orders", url: "https://www.opq.gouv.qc.ca/", category: "diplomes" },
      { labelFr: "Conseil interprofessionnel du QC", labelEn: "Quebec Interprofessional Council", url: "https://professions-quebec.org/", category: "diplomes" },
      // ── Organismes d'aide à l'emploi ──
      { labelFr: "PROMIS — Aide emploi immigrants MTL", labelEn: "PROMIS — Immigrant job help MTL", url: "https://promis.qc.ca/", category: "organismes" },
      { labelFr: "Carrefour BLE — Recherche d'emploi", labelEn: "Carrefour BLE — Job search help", url: "https://carrefourble.qc.ca/", category: "organismes" },
      { labelFr: "SAJE — Accompagnement entrepreneurs", labelEn: "SAJE — Entrepreneur support", url: "https://www.sajeenaffaires.org/", category: "organismes" },
      { labelFr: "Futurpreneur — Financement jeunes", labelEn: "Futurpreneur — Youth funding", url: "https://www.futurpreneur.ca/fr/", category: "organismes" },
      { labelFr: "Chambre de commerce du MTL métro", labelEn: "Montreal Chamber of Commerce", url: "https://www.ccmm.ca/", category: "organismes" },
      // ── etabli. Marketplace ──
      { labelFr: "etabli. Marketplace — Professionnels", labelEn: "etabli. Marketplace — Professionals", url: "/marketplace", category: "etabli" },
    ],
    tips: [
      { fr: "Au Québec, le réseautage représente 60-80% des embauches. Ne comptez pas uniquement sur les offres en ligne — participez aux 5 à 7, salons de l'emploi et événements de votre secteur.", en: "In Quebec, networking accounts for 60-80% of hires. Don't rely solely on online postings — attend networking events, job fairs, and industry events." },
      { fr: "Le salaire minimum au Québec est de 15,75$/h (2024). Vérifiez le taux en vigueur sur le site de la CNESST.", en: "Quebec minimum wage is $15.75/h (2024). Check the current rate on the CNESST website." },
      { fr: "Les ordres professionnels réglementent certains métiers (ingénieur, médecin, infirmier, comptable, avocat). Vérifiez si votre profession en fait partie AVANT de chercher un emploi.", en: "Professional orders regulate certain professions (engineer, doctor, nurse, accountant, lawyer). Check if yours is regulated BEFORE job searching." },
      { fr: "Inscrivez-vous au Guichet-Emplois (fédéral) ET à Emploi Québec (provincial) — ce sont deux systèmes différents avec des offres différentes.", en: "Register with Job Bank (federal) AND Emploi Québec (provincial) — these are two different systems with different job listings." },
      { fr: "Créez des alertes emploi sur Indeed, LinkedIn ET Jobillico avec vos mots-clés. La rapidité de réponse est cruciale — postulez dans les 48h.", en: "Set up job alerts on Indeed, LinkedIn AND Jobillico with your keywords. Speed matters — apply within 48 hours." },
      { fr: "Pour les travailleurs temporaires : vérifiez si votre permis est ouvert (tout employeur) ou fermé (employeur spécifique). Un permis fermé ne permet PAS de changer d'employeur sans nouveau permis.", en: "For temporary workers: check if your permit is open (any employer) or closed (specific employer). A closed permit does NOT allow changing employers without a new permit." },
    ],
  },

  /* ── 4. Sant\u00e9 ── */
  {
    id: "sante",
    icon: Heart,
    titleFr: "Sant\u00e9",
    titleEn: "Healthcare",
    descFr:
      "Le syst\u00e8me de sant\u00e9 qu\u00e9b\u00e9cois : RAMQ, m\u00e9decin de famille, cliniques sans rendez-vous, urgences et ressources en sant\u00e9 mentale.",
    descEn:
      "The Quebec healthcare system: RAMQ, family doctor, walk-in clinics, emergencies, and mental health resources.",
    checklist: [
      {
        id: "san-1",
        labelFr: "Demander votre carte RAMQ (carte soleil)",
        labelEn: "Apply for your RAMQ card (carte soleil)",
        detailFr:
          "La RAMQ couvre les soins m\u00e9dicaux essentiels gratuitement. R\u00e9sidents permanents : d\u00e9lai de carence de 3 mois. Travailleurs temporaires : couverture possible imm\u00e9diate.",
        detailEn:
          "RAMQ covers essential medical care for free. Permanent residents: 3-month waiting period. Temporary workers: possible immediate coverage.",
      },
      {
        id: "san-2",
        labelFr: "Souscrire une assurance temporaire (si d\u00e9lai de carence)",
        labelEn: "Get temporary insurance (if waiting period applies)",
        detailFr:
          "Assurances priv\u00e9es : Blue Cross, Manulife, Guard.me, Destination Canada. Couvre m\u00e9decin, urgences, m\u00e9dicaments.",
        detailEn:
          "Private insurance: Blue Cross, Manulife, Guard.me, Destination Canada. Covers doctor, emergencies, medication.",
      },
      {
        id: "san-3",
        labelFr: "S\u2019inscrire au RVSQ (Rendez-vous sant\u00e9 Qu\u00e9bec)",
        labelEn: "Register with RVSQ for a family doctor",
        detailFr:
          "Le guichet d\u2019acc\u00e8s \u00e0 un m\u00e9decin de famille (GAMF). L\u2019attente peut \u00eatre longue (6 mois \u00e0 2 ans). Inscrivez-vous d\u00e8s que possible.",
        detailEn:
          "The family doctor access gateway (GAMF). Wait can be long (6 months to 2 years). Register as soon as possible.",
      },
      {
        id: "san-4",
        labelFr: "Localiser votre CLSC le plus proche",
        labelEn: "Locate your nearest CLSC",
        detailFr:
          "Centres locaux de services communautaires : soins infirmiers, services sociaux, vaccination, aide aux nouveaux arrivants. Services gratuits.",
        detailEn:
          "Local community service centers: nursing care, social services, vaccination, newcomer assistance. Free services.",
      },
      {
        id: "san-5",
        labelFr: "Rep\u00e9rer les cliniques sans rendez-vous",
        labelEn: "Find walk-in clinics",
        detailFr:
          "Utilisez le site RVSQ ou Bonjour-sant\u00e9 pour r\u00e9server. Certaines cliniques fonctionnent en acc\u00e8s libre le matin.",
        detailEn:
          "Use the RVSQ website or Bonjour-sant\u00e9 to book. Some clinics operate on a first-come basis in the morning.",
      },
      {
        id: "san-6",
        labelFr: "Sauvegarder les num\u00e9ros d\u2019urgence",
        labelEn: "Save emergency numbers",
        detailFr:
          "911 : urgence (police, ambulance, pompiers). 811 : Info-Sant\u00e9 (infirmi\u00e8re 24/7 pour conseils m\u00e9dicaux). 988 : ligne de crise en sant\u00e9 mentale.",
        detailEn:
          "911: emergency (police, ambulance, fire). 811: Info-Sant\u00e9 (nurse 24/7 for medical advice). 988: mental health crisis line.",
      },
      {
        id: "san-7",
        labelFr: "Comprendre le syst\u00e8me de pharmacie",
        labelEn: "Understand the pharmacy system",
        detailFr:
          "Pharmacies principales : Jean Coutu, Pharmaprix (Shoppers), Brunet, Uniprix. Le pharmacien peut prescrire certains m\u00e9dicaments et renouveler des ordonnances.",
        detailEn:
          "Main pharmacies: Jean Coutu, Pharmaprix (Shoppers), Brunet, Uniprix. Pharmacists can prescribe certain medications and renew prescriptions.",
      },
      {
        id: "san-8",
        labelFr: "V\u00e9rifier votre couverture dentaire",
        labelEn: "Check your dental coverage",
        detailFr:
          "La RAMQ ne couvre PAS les soins dentaires pour les adultes (sauf urgences). V\u00e9rifiez si votre employeur offre une assurance dentaire.",
        detailEn:
          "RAMQ does NOT cover dental care for adults (except emergencies). Check if your employer offers dental insurance.",
      },
      {
        id: "san-9",
        labelFr: "Se faire vacciner (grippe, COVID)",
        labelEn: "Get vaccinated (flu, COVID)",
        detailFr:
          "Vaccins gratuits en pharmacie ou au CLSC. Apportez votre carte RAMQ. Carnet de vaccination disponible en ligne.",
        detailEn:
          "Free vaccines at pharmacies or CLSC. Bring your RAMQ card. Vaccination record available online.",
      },
      {
        id: "san-10",
        labelFr: "Conna\u00eetre les ressources en sant\u00e9 mentale",
        labelEn: "Know mental health resources",
        detailFr:
          "CLSC (psychologue gratuit, attente variable), Tel-Aide (514-935-1101), Ligne de crise 988, programmes d\u2019aide aux employ\u00e9s (PAE) via l\u2019employeur.",
        detailEn:
          "CLSC (free psychologist, variable wait), Tel-Aide (514-935-1101), Crisis Line 988, Employee Assistance Programs (EAP) through employer.",
      },
    ],
    vocab: [
      { term: "carte soleil", definitionFr: "Carte d\u2019assurance maladie du Qu\u00e9bec", definitionEn: "Quebec health insurance card" },
      { term: "CLSC", definitionFr: "Centre local de services communautaires", definitionEn: "Local community service center" },
      { term: "urgence", definitionFr: "Service d\u2019urgence hospitalier", definitionEn: "Hospital emergency room" },
      { term: "m\u00e9decin", definitionFr: "Docteur", definitionEn: "Doctor/physician" },
      { term: "pharmacie", definitionFr: "Lieu pour acheter des m\u00e9dicaments", definitionEn: "Pharmacy/drugstore" },
      { term: "ordonnance", definitionFr: "Prescription du m\u00e9decin", definitionEn: "Medical prescription" },
      { term: "rendez-vous", definitionFr: "Rencontre planifi\u00e9e avec un professionnel", definitionEn: "Scheduled appointment" },
      { term: "d\u00e9lai de carence", definitionFr: "P\u00e9riode d\u2019attente de 3 mois pour la RAMQ", definitionEn: "3-month RAMQ waiting period" },
      { term: "infirmi\u00e8re", definitionFr: "Professionnelle de soins de sant\u00e9", definitionEn: "Nurse" },
    ],
    resources: [
      { labelFr: "RAMQ \u2013 Admissibilit\u00e9", labelEn: "RAMQ \u2013 Eligibility", url: "https://www.ramq.gouv.qc.ca/fr/citoyens/assurance-maladie/connaitre-conditions-admissibilite" },
      { labelFr: "RVSQ \u2013 Guichet d\u2019acc\u00e8s m\u00e9decin de famille", labelEn: "RVSQ \u2013 Family doctor access", url: "https://www.rvsq.gouv.qc.ca/" },
      { labelFr: "Info-Sant\u00e9 811", labelEn: "Info-Sant\u00e9 811", url: "https://www.quebec.ca/sante/trouver-une-ressource/info-sante-811" },
      { labelFr: "Tel-Aide \u2013 \u00c9coute et soutien", labelEn: "Tel-Aide \u2013 Listening and support", url: "https://www.telaide.org/" },
      { labelFr: "Bonjour-sant\u00e9 \u2013 R\u00e9servation clinique", labelEn: "Bonjour-sant\u00e9 \u2013 Clinic booking", url: "https://bonjour-sante.ca/" },
    ],
    tips: [
      { fr: "Appelez le 811 AVANT d\u2019aller aux urgences \u2013 une infirmi\u00e8re peut vous orienter vers la bonne ressource.", en: "Call 811 BEFORE going to the ER \u2013 a nurse can direct you to the right resource." },
      { fr: "Les CLSC offrent des services gratuits en sant\u00e9 mentale. N\u2019h\u00e9sitez pas \u00e0 demander de l\u2019aide.", en: "CLSCs offer free mental health services. Don\u2019t hesitate to ask for help." },
      { fr: "Au Qu\u00e9bec, le pharmacien est un alli\u00e9 puissant : il peut prescrire pour des probl\u00e8mes courants (infection urinaire, allergies, etc.).", en: "In Quebec, the pharmacist is a powerful ally: they can prescribe for common issues (UTI, allergies, etc.)." },
    ],
  },

  /* ── 5. Vie quotidienne ── */
  {
    id: "vie-quotidienne",
    icon: Sun,
    titleFr: "Vie quotidienne",
    titleEn: "Daily Life",
    descFr:
      "Transport, hiver, \u00e9lectricit\u00e9, \u00e9picerie, recyclage et culture qu\u00e9b\u00e9coise : tout ce qu\u2019il faut savoir pour votre vie de tous les jours.",
    descEn:
      "Transit, winter, electricity, groceries, recycling, and Quebec culture: everything you need for everyday life.",
    checklist: [
      {
        id: "vie-1",
        labelFr: "Obtenir une carte OPUS et comprendre le r\u00e9seau",
        labelEn: "Get an OPUS card and understand the network",
        detailFr:
          "STM (Montr\u00e9al) : m\u00e9tro + bus. RTC (Qu\u00e9bec). T\u00e9l\u00e9chargez l\u2019app Transit pour les horaires en temps r\u00e9el.",
        detailEn:
          "STM (Montreal): metro + bus. RTC (Quebec City). Download the Transit app for real-time schedules.",
      },
      {
        id: "vie-2",
        labelFr: "Acheter l\u2019\u00e9quipement d\u2019hiver",
        labelEn: "Buy winter gear",
        detailFr:
          "Manteau d\u2019hiver (-30\u00b0C), bottes imperm\u00e9ables, tuque, gants, foulard. Magasins : Costco, Canadian Tire, Winners, Sports Experts. Budget : ~300-600$.",
        detailEn:
          "Winter coat (-30\u00b0C), waterproof boots, toque, gloves, scarf. Stores: Costco, Canadian Tire, Winners, Sports Experts. Budget: ~$300-600.",
      },
      {
        id: "vie-3",
        labelFr: "Comprendre le syst\u00e8me de couches vestimentaires",
        labelEn: "Understand the layering system",
        detailFr:
          "3 couches : base (laine m\u00e9rinos), isolation (polaire/duvet), coquille ext\u00e9rieure (coupe-vent imperm\u00e9able). \u00c9vitez le coton en hiver.",
        detailEn:
          "3 layers: base (merino wool), insulation (fleece/down), outer shell (waterproof windbreaker). Avoid cotton in winter.",
      },
      {
        id: "vie-4",
        labelFr: "Configurer votre compte Hydro-Qu\u00e9bec",
        labelEn: "Set up your Hydro-Qu\u00e9bec account",
        detailFr:
          "L\u2019\u00e9lectricit\u00e9 est moins ch\u00e8re qu\u2019ailleurs au Canada. En hiver, les factures augmentent (chauffage \u00e9lectrique). Optez pour le versement \u00e9gal.",
        detailEn:
          "Electricity is cheaper than elsewhere in Canada. In winter, bills increase (electric heating). Opt for equalized payments.",
      },
      {
        id: "vie-5",
        labelFr: "Conna\u00eetre les \u00e9piceries et le co\u00fbt de la vie",
        labelEn: "Know grocery stores and cost of living",
        detailFr:
          "IGA et Metro : prix moyen. Maxi et Super C : prix bas. Costco : en gros (carte membre ~60$/an). Circulaires hebdomadaires sur Flipp pour les aubaines.",
        detailEn:
          "IGA and Metro: average prices. Maxi and Super C: low prices. Costco: bulk (membership ~$60/year). Weekly flyers on Flipp for deals.",
      },
      {
        id: "vie-6",
        labelFr: "Comprendre le recyclage et la collecte des d\u00e9chets",
        labelEn: "Understand recycling and garbage collection",
        detailFr:
          "Bac bleu : recyclage. Bac brun : compost. Poubelle : d\u00e9chets. Consultez le calendrier de votre arrondissement. Amendes possibles en cas d\u2019erreur.",
        detailEn:
          "Blue bin: recycling. Brown bin: compost. Garbage bin: waste. Check your borough\u2019s schedule. Fines possible for errors.",
      },
      {
        id: "vie-7",
        labelFr: "Installer les pneus d\u2019hiver (si vous avez un v\u00e9hicule)",
        labelEn: "Install winter tires (if you have a vehicle)",
        detailFr:
          "OBLIGATOIRES du 1er d\u00e9cembre au 15 mars (recommand\u00e9 d\u00e8s octobre). Amende : 200-300$ si non install\u00e9s.",
        detailEn:
          "MANDATORY from December 1 to March 15 (recommended from October). Fine: $200-300 if not installed.",
      },
      {
        id: "vie-8",
        labelFr: "D\u00e9couvrir votre quartier",
        labelEn: "Explore your neighborhood",
        detailFr:
          "Rep\u00e9rez la biblioth\u00e8que (carte gratuite!), le d\u00e9panneur, la pharmacie, le parc, le CLSC et les lieux de culte.",
        detailEn:
          "Find the library (free card!), the corner store, pharmacy, park, CLSC, and places of worship.",
      },
      {
        id: "vie-9",
        labelFr: "D\u00e9couvrir la SAQ et la SQDC",
        labelEn: "Discover the SAQ and SQDC",
        detailFr:
          "SAQ : seul endroit pour acheter du vin et des spiritueux (monopole d\u2019\u00c9tat). SQDC : cannabis l\u00e9gal. Bi\u00e8re disponible au d\u00e9panneur et \u00e0 l\u2019\u00e9picerie.",
        detailEn:
          "SAQ: only place to buy wine and spirits (state monopoly). SQDC: legal cannabis. Beer available at corner stores and grocery stores.",
      },
      {
        id: "vie-10",
        labelFr: "Conna\u00eetre les f\u00eates et traditions qu\u00e9b\u00e9coises",
        labelEn: "Know Quebec holidays and traditions",
        detailFr:
          "Saint-Jean-Baptiste (24 juin \u2013 f\u00eate nationale), Carnaval de Qu\u00e9bec (f\u00e9vrier), cabane \u00e0 sucre (mars-avril), d\u00e9m\u00e9nagement (1er juillet), hockey (passion nationale!).",
        detailEn:
          "Saint-Jean-Baptiste (June 24 \u2013 national holiday), Quebec Carnival (February), sugar shack (March-April), Moving Day (July 1), hockey (national passion!).",
      },
      {
        id: "vie-11",
        labelFr: "Acc\u00e9der aux banques alimentaires (si besoin)",
        labelEn: "Access food banks (if needed)",
        detailFr:
          "Moisson Montr\u00e9al, Les Banques alimentaires du Qu\u00e9bec. Aucune honte \u00e0 demander de l\u2019aide. Apportez une preuve d\u2019adresse.",
        detailEn:
          "Moisson Montreal, Les Banques alimentaires du Qu\u00e9bec. No shame in asking for help. Bring proof of address.",
      },
      {
        id: "vie-12",
        labelFr: "Apprendre les expressions qu\u00e9b\u00e9coises",
        labelEn: "Learn Quebec expressions",
        detailFr:
          "Bienvenue = \u00ab de rien \u00bb, magasiner = faire du shopping, d\u00e9panneur = petite \u00e9picerie de quartier, char = voiture, tabarnak = juron (ne pas utiliser!).",
        detailEn:
          "Bienvenue = \u201cyou\u2019re welcome,\u201d magasiner = to shop, d\u00e9panneur = corner store, char = car, tabarnak = swear word (don\u2019t use!).",
      },
    ],
    vocab: [
      { term: "d\u00e9panneur", definitionFr: "Petite \u00e9picerie de quartier ouverte tard", definitionEn: "Corner store / convenience store" },
      { term: "\u00e9picerie", definitionFr: "March\u00e9 d\u2019alimentation", definitionEn: "Grocery store" },
      { term: "SAQ", definitionFr: "Soci\u00e9t\u00e9 des alcools du Qu\u00e9bec (magasin d\u2019alcool)", definitionEn: "Quebec Liquor Corporation (liquor store)" },
      { term: "SQDC", definitionFr: "Soci\u00e9t\u00e9 qu\u00e9b\u00e9coise du cannabis", definitionEn: "Quebec Cannabis Corporation" },
      { term: "autobus", definitionFr: "Bus de transport en commun", definitionEn: "Public transit bus" },
      { term: "m\u00e9tro", definitionFr: "Syst\u00e8me de transport souterrain", definitionEn: "Subway system" },
      { term: "d\u00e9neigement", definitionFr: "Op\u00e9ration de nettoyage de la neige", definitionEn: "Snow removal operation" },
      { term: "recyclage", definitionFr: "Tri des mati\u00e8res r\u00e9cup\u00e9rables (bac bleu)", definitionEn: "Sorting recyclable materials (blue bin)" },
      { term: "tuque", definitionFr: "Bonnet d\u2019hiver", definitionEn: "Winter hat / beanie" },
      { term: "cabane \u00e0 sucre", definitionFr: "Restaurant traditionnel du temps des sucres", definitionEn: "Sugar shack (maple syrup season restaurant)" },
    ],
    resources: [
      { labelFr: "STM \u2013 Plan du r\u00e9seau", labelEn: "STM \u2013 Network map", url: "https://www.stm.info/fr/infos/reseaux/plan-du-reseau" },
      { labelFr: "Hydro-Qu\u00e9bec \u2013 Mon compte", labelEn: "Hydro-Qu\u00e9bec \u2013 My account", url: "https://www.hydroquebec.com/mon-compte/" },
      { labelFr: "Ville de Montr\u00e9al \u2013 Collectes", labelEn: "City of Montreal \u2013 Collections", url: "https://montreal.ca/sujets/collectes-des-matieres-residuelles" },
      { labelFr: "Flipp \u2013 Circulaires", labelEn: "Flipp \u2013 Flyers", url: "https://flipp.com/" },
      { labelFr: "Banques alimentaires du Qu\u00e9bec", labelEn: "Food Banks of Quebec", url: "https://www.banquesalimentaires.org/" },
    ],
    tips: [
      { fr: "T\u00e9l\u00e9chargez l\u2019application Flipp pour comparer les prix des \u00e9piceries chaque semaine.", en: "Download the Flipp app to compare grocery prices every week." },
      { fr: "La carte de biblioth\u00e8que est GRATUITE et donne acc\u00e8s \u00e0 des livres, films, jeux vid\u00e9o et m\u00eame des outils!", en: "The library card is FREE and gives access to books, movies, video games, and even tools!" },
      { fr: "Le d\u00e9neigement peut impliquer un interdiction de stationnement temporaire. Surveillez les panneaux!", en: "Snow removal may involve temporary no-parking zones. Watch the signs!" },
    ],
  },

  /* ── 6. Parcours immigration ── */
  {
    id: "immigration",
    icon: Globe,
    titleFr: "Parcours immigration",
    titleEn: "Immigration Path",
    descFr:
      "Vue d\u2019ensemble des programmes d\u2019immigration, niveaux de fran\u00e7ais requis, syst\u00e8mes de points et parcours vers la citoyennet\u00e9 canadienne.",
    descEn:
      "Overview of immigration programs, French language requirements, points systems, and the path to Canadian citizenship.",
    checklist: [
      {
        id: "imm-1",
        labelFr: "D\u00e9terminer votre statut actuel et votre objectif",
        labelEn: "Determine your current status and goal",
        detailFr:
          "Temporaire (travail, \u00e9tudes, asile) vers permanent. Permanent vers citoyennet\u00e9. Chaque parcours a ses exigences sp\u00e9cifiques.",
        detailEn:
          "Temporary (work, study, asylum) to permanent. Permanent to citizenship. Each pathway has specific requirements.",
      },
      {
        id: "imm-2",
        labelFr: "Comprendre les programmes qu\u00e9b\u00e9cois",
        labelEn: "Understand Quebec programs",
        detailFr:
          "PSTQ (Programme de s\u00e9lection des travailleurs qualifi\u00e9s via Arrima), PEQ (Programme de l\u2019exp\u00e9rience qu\u00e9b\u00e9coise : travailleurs et \u00e9tudiants au QC).",
        detailEn:
          "PSTQ (Skilled Worker Selection Program via Arrima), PEQ (Quebec Experience Program: workers and students in QC).",
      },
      {
        id: "imm-3",
        labelFr: "Comprendre les programmes f\u00e9d\u00e9raux",
        labelEn: "Understand federal programs",
        detailFr:
          "Entr\u00e9e express (CRS), Programme des travailleurs qualifi\u00e9s f\u00e9d\u00e9ral, Cat\u00e9gorie de l\u2019exp\u00e9rience canadienne (CEC), M\u00e9tiers sp\u00e9cialis\u00e9s.",
        detailEn:
          "Express Entry (CRS), Federal Skilled Worker Program, Canadian Experience Class (CEC), Skilled Trades.",
      },
      {
        id: "imm-4",
        labelFr: "V\u00e9rifier vos exigences en fran\u00e7ais (NCLC)",
        labelEn: "Check your French requirements (NCLC)",
        detailFr:
          "PEQ : NCLC 7 (4 comp\u00e9tences). PSTQ : points pour NCLC 5-10+. Entr\u00e9e express : bonus pour fran\u00e7ais. Tests accept\u00e9s : TCF Canada, TEF Canada.",
        detailEn:
          "PEQ: NCLC 7 (all 4 skills). PSTQ: points for NCLC 5-10+. Express Entry: bonus for French. Accepted tests: TCF Canada, TEF Canada.",
      },
      {
        id: "imm-5",
        labelFr: "R\u00e9server un test de fran\u00e7ais (TCF/TEF)",
        labelEn: "Book a French test (TCF/TEF)",
        detailFr:
          "TCF Canada (par France \u00c9ducation international) ou TEF Canada (par la CCIP). R\u00e9sultats valides 2 ans. Inscrivez-vous t\u00f4t \u2013 les places partent vite.",
        detailEn:
          "TCF Canada (by France \u00c9ducation international) or TEF Canada (by CCIP). Results valid 2 years. Register early \u2013 spots fill fast.",
      },
      {
        id: "imm-6",
        labelFr: "Cr\u00e9er votre profil Arrima (programmes QC)",
        labelEn: "Create your Arrima profile (QC programs)",
        detailFr:
          "Syst\u00e8me de d\u00e9claration d\u2019int\u00e9r\u00eat du Qu\u00e9bec. Points pour : \u00e2ge, fran\u00e7ais, anglais, exp\u00e9rience, dipl\u00f4me, offre d\u2019emploi valid\u00e9e, enfants, conjoint.",
        detailEn:
          "Quebec\u2019s expression of interest system. Points for: age, French, English, experience, education, validated job offer, children, spouse.",
      },
      {
        id: "imm-7",
        labelFr: "Cr\u00e9er votre profil Entr\u00e9e express (si applicable)",
        labelEn: "Create your Express Entry profile (if applicable)",
        detailFr:
          "Syst\u00e8me de classement global (CRS). Points : \u00e2ge, \u00e9ducation, exp\u00e9rience, langues, offre d\u2019emploi. Score minimum variable (rondes d\u2019invitations).",
        detailEn:
          "Comprehensive Ranking System (CRS). Points: age, education, experience, languages, job offer. Minimum score varies (invitation rounds).",
      },
      {
        id: "imm-8",
        labelFr: "Rassembler tous les documents requis",
        labelEn: "Gather all required documents",
        detailFr:
          "Passeport, certificat de naissance, dipl\u00f4mes, \u00e9valuation ECA/WES, r\u00e9sultats TCF/TEF, lettres d\u2019emploi, casier judiciaire, examen m\u00e9dical.",
        detailEn:
          "Passport, birth certificate, diplomas, ECA/WES evaluation, TCF/TEF results, employment letters, police clearance, medical exam.",
      },
      {
        id: "imm-9",
        labelFr: "Soumettre votre demande de r\u00e9sidence permanente",
        labelEn: "Submit your permanent residence application",
        detailFr:
          "Via Arrima (QC) ou IRCC (f\u00e9d\u00e9ral). Frais : ~1 500-2 000$ par adulte. D\u00e9lai : 6-18 mois selon le programme.",
        detailEn:
          "Via Arrima (QC) or IRCC (federal). Fees: ~$1,500-2,000 per adult. Timeline: 6-18 months depending on program.",
      },
      {
        id: "imm-10",
        labelFr: "Suivre l\u2019\u00e9tat de votre demande",
        labelEn: "Track your application status",
        detailFr:
          "V\u00e9rifiez r\u00e9guli\u00e8rement sur le portail en ligne IRCC ou Arrima. R\u00e9pondez rapidement \u00e0 toute demande de documents suppl\u00e9mentaires.",
        detailEn:
          "Check regularly on the IRCC or Arrima online portal. Respond quickly to any request for additional documents.",
      },
      {
        id: "imm-11",
        labelFr: "Planifier le parcours vers la citoyennet\u00e9",
        labelEn: "Plan the path to citizenship",
        detailFr:
          "Apr\u00e8s 3 ans de r\u00e9sidence permanente (1 095 jours sur 5 ans), vous pouvez demander la citoyennet\u00e9. Test de citoyennet\u00e9 + examen de fran\u00e7ais ou anglais.",
        detailEn:
          "After 3 years of permanent residence (1,095 days in 5 years), you can apply for citizenship. Citizenship test + French or English exam.",
      },
    ],
    vocab: [
      { term: "CSQ", definitionFr: "Certificat de s\u00e9lection du Qu\u00e9bec", definitionEn: "Quebec Selection Certificate" },
      { term: "CAQ", definitionFr: "Certificat d\u2019acceptation du Qu\u00e9bec (\u00e9tudiants)", definitionEn: "Quebec Acceptance Certificate (students)" },
      { term: "r\u00e9sidence permanente", definitionFr: "Statut de r\u00e9sident permanent au Canada", definitionEn: "Permanent resident status in Canada" },
      { term: "citoyennet\u00e9", definitionFr: "Statut de citoyen canadien", definitionEn: "Canadian citizenship status" },
      { term: "parrainage", definitionFr: "Sponsorship d\u2019un membre de la famille", definitionEn: "Family sponsorship" },
      { term: "demande d\u2019asile", definitionFr: "Requ\u00eate de protection comme r\u00e9fugi\u00e9", definitionEn: "Refugee/asylum claim" },
      { term: "NCLC", definitionFr: "Niveaux de comp\u00e9tence linguistique canadiens", definitionEn: "Canadian Language Benchmarks (CLB)" },
      { term: "Arrima", definitionFr: "Portail d\u2019immigration du Qu\u00e9bec", definitionEn: "Quebec immigration portal" },
      { term: "IRCC", definitionFr: "Immigration, R\u00e9fugi\u00e9s et Citoyennet\u00e9 Canada", definitionEn: "Immigration, Refugees and Citizenship Canada" },
    ],
    resources: [
      { labelFr: "MIFI \u2013 Immigration Qu\u00e9bec", labelEn: "MIFI \u2013 Immigration Quebec", url: "https://www.quebec.ca/immigration" },
      { labelFr: "IRCC \u2013 Entr\u00e9e express", labelEn: "IRCC \u2013 Express Entry", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express.html" },
      { labelFr: "Arrima \u2013 Mon projet Qu\u00e9bec", labelEn: "Arrima \u2013 Mon projet Qu\u00e9bec", url: "https://www.quebec.ca/immigration/arrima" },
      { labelFr: "TCF Canada \u2013 Inscription", labelEn: "TCF Canada \u2013 Registration", url: "https://www.france-education-international.fr/test/tcf-canada" },
      { labelFr: "TEF Canada \u2013 Inscription", labelEn: "TEF Canada \u2013 Registration", url: "https://www.lefrancaisdesaffaires.fr/tests-diplomes/test-evaluation-francais-tef/tef-canada/" },
    ],
    tips: [
      { fr: "Le fran\u00e7ais est le facteur num\u00e9ro 1 pour l\u2019immigration au Qu\u00e9bec. Investissez dans votre francisation!", en: "French is the #1 factor for Quebec immigration. Invest in your francisation!" },
      { fr: "Les r\u00e9sultats TCF/TEF expirent apr\u00e8s 2 ans. Planifiez votre test en fonction de votre demande.", en: "TCF/TEF results expire after 2 years. Plan your test based on your application timeline." },
      { fr: "Consultez un consultant en immigration r\u00e9glement\u00e9 (RCIC) pour les cas complexes. M\u00e9fiez-vous des \u00ab consultants fantômes \u00bb.", en: "Consult a regulated immigration consultant (RCIC) for complex cases. Beware of \u201cghost consultants.\u201d" },
    ],
  },
];

/* ─────────────────── helpers ─────────────────── */

const STORAGE_PREFIX = "etabli_settlement_";

function loadChecked(pillarId: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${pillarId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecked(pillarId: string, data: Record<string, boolean>) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${pillarId}`, JSON.stringify(data));
  } catch {
    /* quota exceeded – silent */
  }
}

/* ─────────────────── components ─────────────────── */

function ProgressBar({ checked, total, fr: isFr }: { checked: number; total: number; fr: boolean }) {
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: "#085041" }}>
          {isFr ? "Progression globale" : "Overall Progress"}
        </span>
        <span className="text-sm font-semibold" style={{ color: "#1D9E75" }}>
          {checked}/{total} ({pct}%)
        </span>
      </div>
      <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #1D9E75, #085041)" }}
        />
      </div>
    </div>
  );
}

/* ─── Categorized resource directory with search + filter ─── */

const RESOURCE_CATEGORIES: Record<string, { fr: string; en: string; color: string }> = {
  federal: { fr: "Fédéral", en: "Federal", color: "bg-red-50 text-red-700 border-red-200" },
  provincial: { fr: "Québec", en: "Québec", color: "bg-blue-50 text-blue-700 border-blue-200" },
  municipal: { fr: "Municipal", en: "Municipal", color: "bg-purple-50 text-purple-700 border-purple-200" },
  banques: { fr: "Banques", en: "Banks", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pros: { fr: "Professionnels", en: "Professionals", color: "bg-amber-50 text-amber-700 border-amber-200" },
  telecom: { fr: "Télécom", en: "Telecom", color: "bg-sky-50 text-sky-700 border-sky-200" },
  communautaire: { fr: "Communautaire", en: "Community", color: "bg-pink-50 text-pink-700 border-pink-200" },
  gouvernement: { fr: "Gouvernement", en: "Government", color: "bg-red-50 text-red-700 border-red-200" },
  "sites-emploi": { fr: "Sites d'emploi", en: "Job boards", color: "bg-blue-50 text-blue-700 border-blue-200" },
  immigrants: { fr: "Immigrants", en: "Immigrants", color: "bg-teal-50 text-teal-700 border-teal-200" },
  diplomes: { fr: "Diplômes", en: "Credentials", color: "bg-amber-50 text-amber-700 border-amber-200" },
  organismes: { fr: "Organismes", en: "Organizations", color: "bg-pink-50 text-pink-700 border-pink-200" },
  etabli: { fr: "etabli.", en: "etabli.", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

function ResourceDirectory({ resources, isFr, pillarId }: { resources: ResourceLink[]; isFr: boolean; pillarId: string }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Determine which categories exist for this pillar
  const categories = useMemo(() => {
    const cats = new Set<string>();
    resources.forEach((r) => { if (r.category) cats.add(r.category); });
    return Array.from(cats);
  }, [resources]);

  const hasCats = categories.length > 1;

  // Filter resources by search + category
  const filtered = useMemo(() => {
    let list = resources;
    if (activeCategory) list = list.filter((r) => r.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.labelFr.toLowerCase().includes(q) ||
        r.labelEn.toLowerCase().includes(q) ||
        (r.category || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [resources, activeCategory, search]);

  // Group by category
  const grouped = useMemo(() => {
    if (!hasCats) return null;
    const groups: Record<string, ResourceLink[]> = {};
    filtered.forEach((r) => {
      const cat = r.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(r);
    });
    return groups;
  }, [filtered, hasCats]);

  return (
    <div className="px-6 pb-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "#085041" }}>
        <ExternalLink className="w-4 h-4" />
        {isFr ? "Ressources et liens utiles" : "Resources & Useful Links"}
        <span className="text-xs font-normal normal-case text-gray-400 ml-1">({resources.length})</span>
      </h4>

      {/* Search + category filter bar */}
      {hasCats && (
        <div className="mb-3 space-y-2">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isFr ? "Rechercher un service..." : "Search a service..."}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] outline-none transition-colors"
            />
          </div>

          {/* Category chips — horizontal scroll on mobile */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === null
                  ? "bg-[#085041] text-white border-[#085041]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {isFr ? "Tout" : "All"} ({resources.length})
            </button>
            {categories.map((cat) => {
              const meta = RESOURCE_CATEGORIES[cat];
              const count = resources.filter((r) => r.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    activeCategory === cat
                      ? "bg-[#085041] text-white border-[#085041]"
                      : meta ? meta.color + " hover:opacity-80" : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {meta ? (isFr ? meta.fr : meta.en) : cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Resource list — scrollable on mobile */}
      <div className={hasCats ? "max-h-72 overflow-y-auto rounded-lg border border-gray-100 divide-y divide-gray-50" : "flex flex-wrap gap-2"}>
        {hasCats && grouped ? (
          Object.entries(grouped).map(([cat, links]) => {
            const meta = RESOURCE_CATEGORIES[cat];
            return (
              <div key={cat}>
                {/* Category header inside list */}
                {!activeCategory && (
                  <div className="sticky top-0 z-10 px-3 py-1.5 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta ? meta.color : "bg-gray-100 text-gray-600"}`}>
                      {meta ? (isFr ? meta.fr : meta.en) : cat}
                    </span>
                  </div>
                )}
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-[#f0fdf8] hover:text-[#085041] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
                    <span className="flex-1 min-w-0 truncate">{isFr ? link.labelFr : link.labelEn}</span>
                    {activeCategory && meta && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${meta.color} flex-shrink-0`}>
                        {isFr ? meta.fr : meta.en}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            );
          })
        ) : (
          filtered.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors hover:border-[#1D9E75] hover:text-[#085041] hover:bg-[#f0fdf8]"
              style={{ borderColor: "#e5e7eb", color: "#374151" }}
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />
              {isFr ? link.labelFr : link.labelEn}
            </a>
          ))
        )}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">
            {isFr ? "Aucun résultat pour cette recherche." : "No results for this search."}
          </p>
        )}
      </div>
    </div>
  );
}

function PillarCard({
  pillar,
  isOpen,
  onToggle,
  checkedItems,
  onCheck,
  fr: isFr,
}: {
  pillar: Pillar;
  isOpen: boolean;
  onToggle: () => void;
  checkedItems: Record<string, boolean>;
  onCheck: (itemId: string) => void;
  fr: boolean;
}) {
  const [vocabOpen, setVocabOpen] = useState(false);
  const Icon = pillar.icon;
  const checkedCount = pillar.checklist.filter((c) => checkedItems[c.id]).length;
  const totalCount = pillar.checklist.length;
  const pct = Math.round((checkedCount / totalCount) * 100);

  return (
    <div
      className="rounded-2xl border transition-all duration-300 overflow-hidden"
      style={{
        borderColor: isOpen ? "#1D9E75" : "#e5e7eb",
        boxShadow: isOpen ? "0 4px 24px rgba(8,80,65,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Card header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-gray-50/60 transition-colors"
      >
        <div
          className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#085041" }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-xl font-semibold font-[family-name:var(--font-heading)]"
            style={{ color: "#085041" }}
          >
            {isFr ? pillar.titleFr : pillar.titleEn}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
            {isFr ? pillar.descFr : pillar.descEn}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Mini progress */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#1D9E75" : "#D97706" }}
              />
            </div>
            <span className="text-xs font-medium text-gray-400 w-10 text-right">
              {checkedCount}/{totalCount}
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t" style={{ borderColor: "#e5e7eb" }}>
          {/* Tips */}
          {pillar.tips.length > 0 && (
            <div className="px-6 pt-5 pb-2">
              <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFBEB" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4" style={{ color: "#D97706" }} />
                  <span className="text-sm font-semibold" style={{ color: "#D97706" }}>
                    {isFr ? "Conseils pratiques" : "Practical Tips"}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {pillar.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span style={{ color: "#D97706" }} className="mt-0.5 flex-shrink-0">
                        &bull;
                      </span>
                      {isFr ? tip.fr : tip.en}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Checklist */}
          <div className="px-6 py-4">
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
              style={{ color: "#085041" }}
            >
              <ClipboardIcon className="w-4 h-4" />
              {isFr ? "Liste de v\u00e9rification" : "Checklist"}
            </h4>
            <div className="space-y-1">
              {pillar.checklist.map((item) => {
                const done = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    className="group rounded-xl p-3 transition-colors cursor-pointer hover:bg-gray-50"
                    onClick={() => onCheck(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {done ? (
                          <CheckCircle2
                            className="w-5 h-5 transition-colors"
                            style={{ color: "#1D9E75" }}
                          />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium transition-colors ${
                            done ? "line-through text-gray-400" : "text-gray-800"
                          }`}
                        >
                          {isFr ? item.labelFr : item.labelEn}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isFr ? item.detailFr : item.detailEn}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resources — categorized, searchable, scrollable */}
          <ResourceDirectory resources={pillar.resources} isFr={isFr} pillarId={pillar.id} />

          {/* Vocabulary collapsible */}
          <div className="px-6 pb-5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVocabOpen((v) => !v);
              }}
              className="w-full flex items-center justify-between py-3 px-4 rounded-xl border transition-colors"
              style={{
                borderColor: vocabOpen ? "#1D9E75" : "#e5e7eb",
                backgroundColor: vocabOpen ? "#f0fdf8" : "transparent",
              }}
            >
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#085041" }}>
                <BookOpen className="w-4 h-4" />
                {isFr
                  ? `Vocabulaire pour cette section (${pillar.vocab.length} termes)`
                  : `Vocabulary for this section (${pillar.vocab.length} terms)`}
              </span>
              {vocabOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {vocabOpen && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {pillar.vocab.map((v, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-3"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <p className="text-sm font-bold" style={{ color: "#085041" }}>
                      {v.term}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isFr ? v.definitionFr : v.definitionEn}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

/* ─────────────────── main page ─────────────────── */

export default function GuideEtablissementPage() {
  const { lang } = useLang();
  const fr = lang === "fr";

  const [openPillar, setOpenPillar] = useState<string | null>(null);
  const [allChecked, setAllChecked] = useState<Record<string, Record<string, boolean>>>({});

  /* Load from localStorage on mount */
  useEffect(() => {
    const data: Record<string, Record<string, boolean>> = {};
    pillars.forEach((p) => {
      data[p.id] = loadChecked(p.id);
    });
    setAllChecked(data);
  }, []);

  const handleCheck = useCallback((pillarId: string, itemId: string) => {
    setAllChecked((prev) => {
      const pillarData = { ...prev[pillarId] };
      pillarData[itemId] = !pillarData[itemId];
      saveChecked(pillarId, pillarData);
      return { ...prev, [pillarId]: pillarData };
    });
  }, []);

  /* Compute totals */
  const totalItems = useMemo(() => pillars.reduce((s, p) => s + p.checklist.length, 0), []);
  const totalChecked = useMemo(
    () =>
      pillars.reduce(
        (s, p) => s + p.checklist.filter((c) => allChecked[p.id]?.[c.id]).length,
        0
      ),
    [allChecked]
  );

  return (
    <Shell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero section */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-5"
            style={{ backgroundColor: "#f0fdf8", color: "#1D9E75" }}
          >
            <MapPin className="w-4 h-4" />
            {fr ? "Guide pour nouveaux arrivants" : "Guide for Newcomers"}
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-heading)] leading-tight"
            style={{ color: "#085041" }}
          >
            {fr ? "Les 6 piliers de l\u2019\u00e9tablissement" : "The 6 Pillars of Settlement"}
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            {fr
              ? "Votre feuille de route compl\u00e8te pour vous \u00e9tablir au Qu\u00e9bec. Cochez chaque \u00e9tape au fur et \u00e0 mesure de votre progression."
              : "Your complete roadmap for settling in Quebec. Check off each step as you make progress."}
          </p>
        </div>

        {/* Overall progress */}
        <div className="mb-10 p-5 rounded-2xl border" style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}>
          <ProgressBar checked={totalChecked} total={totalItems} fr={fr} />
          {totalChecked === totalItems && totalItems > 0 && (
            <div
              className="mt-3 text-center text-sm font-medium rounded-lg py-2"
              style={{ backgroundColor: "#f0fdf8", color: "#1D9E75" }}
            >
              {fr
                ? "F\u00e9licitations! Vous avez compl\u00e9t\u00e9 toutes les \u00e9tapes!"
                : "Congratulations! You have completed all the steps!"}
            </div>
          )}
        </div>

        {/* Important notice */}
        <div
          className="mb-8 flex items-start gap-3 p-4 rounded-xl border"
          style={{ borderColor: "#FDE68A", backgroundColor: "#FFFBEB" }}
        >
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#D97706" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#D97706" }}>
              {fr ? "Important" : "Important"}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              {fr
                ? "Ce guide est \u00e0 titre informatif. Les r\u00e8glements changent r\u00e9guli\u00e8rement. V\u00e9rifiez toujours les informations sur les sites officiels du gouvernement avant de prendre une d\u00e9cision."
                : "This guide is for informational purposes. Regulations change regularly. Always verify information on official government websites before making decisions."}
            </p>
          </div>
        </div>

        {/* Pillar cards */}
        <div className="space-y-4">
          {pillars.map((pillar) => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}
              isOpen={openPillar === pillar.id}
              onToggle={() => setOpenPillar(openPillar === pillar.id ? null : pillar.id)}
              checkedItems={allChecked[pillar.id] || {}}
              onCheck={(itemId) => handleCheck(pillar.id, itemId)}
              fr={fr}
            />
          ))}
        </div>

        {/* Emergency contacts footer */}
        <div
          className="mt-12 rounded-2xl p-6 text-center"
          style={{ backgroundColor: "#085041" }}
        >
          <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-heading)] mb-4">
            {fr ? "Num\u00e9ros d\u2019urgence" : "Emergency Numbers"}
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { number: "911", labelFr: "Urgence", labelEn: "Emergency" },
              { number: "811", labelFr: "Info-Sant\u00e9", labelEn: "Health Info" },
              { number: "988", labelFr: "Crise sant\u00e9 mentale", labelEn: "Mental Health Crisis" },
              { number: "211", labelFr: "Services communautaires", labelEn: "Community Services" },
            ].map((item) => (
              <div key={item.number} className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white/60" />
                <span className="text-white font-bold">{item.number}</span>
                <span className="text-white/70 text-sm">
                  {fr ? item.labelFr : item.labelEn}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-gray-400">
          {fr
            ? "Derni\u00e8re mise \u00e0 jour : mars 2026. Les informations sont fournies \u00e0 titre indicatif et peuvent changer."
            : "Last updated: March 2026. Information is provided as a guide and may change."}
        </p>
      </div>
    </Shell>
  );
}
