'use client';

import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, TrendingUp, Award, Briefcase,
  GraduationCap, Heart, Plane, Building2, FileText, Globe2,
  Users, Shield, Clock, Star
} from 'lucide-react';

const services = [
  {
    icon: TrendingUp,
    title: 'Entrée Express',
    subtitle: 'Résidence permanente fédérale',
    color: 'from-blue-500 to-blue-700',
    desc: 'Le programme Entrée Express est la voie la plus rapide vers la résidence permanente au Canada pour les travailleurs qualifiés.',
    includes: [
      'Évaluation du profil et calcul CRS',
      'Création du profil Entrée Express',
      'Préparation de la demande de RP',
      'Suivi des tirages et optimisation du score',
      'Assistance pour l\'ECA et les tests de langue',
    ],
    programs: ['Travailleurs qualifiés fédéraux (FSW)', 'Classe de l\'expérience canadienne (CEC)', 'Métiers spécialisés fédéraux (FST)'],
    timeline: '6-12 mois',
  },
  {
    icon: Award,
    title: 'Programmes du Québec',
    subtitle: 'PEQ, PRTQ, Arrima',
    color: 'from-emerald-500 to-emerald-700',
    desc: 'Programmes d\'immigration spécifiques au Québec, offrant des voies privilégiées pour les francophones et les diplômés québécois.',
    includes: [
      'PEQ: diplômés et travailleurs temporaires',
      'PRTQ via le portail Arrima',
      'Demande de CSQ (Certificat de sélection)',
      'Transition du CSQ vers la RP fédérale',
      'Accompagnement francisation si nécessaire',
    ],
    programs: ['PEQ Diplômés', 'PEQ Travailleurs', 'PRTQ / Arrima', 'PTQF'],
    timeline: '6-18 mois',
  },
  {
    icon: Briefcase,
    title: 'Permis de travail',
    subtitle: 'Ouvert et fermé',
    color: 'from-purple-500 to-purple-700',
    desc: 'Obtenez votre permis de travail au Canada, que ce soit pour un employeur spécifique ou un permis ouvert.',
    includes: [
      'EIMT/LMIA pour l\'employeur',
      'Permis fermé (employeur spécifique)',
      'Permis ouvert (PTMO, conjoint)',
      'Mobilité francophone',
      'PGWP (Permis post-diplôme)',
    ],
    programs: ['EIMT/LMIA', 'Mobilité francophone', 'Jeunes professionnels (EIC)', 'PGWP'],
    timeline: '2-6 mois',
  },
  {
    icon: GraduationCap,
    title: 'Permis d\'études',
    subtitle: 'Étudier au Canada',
    color: 'from-amber-500 to-amber-700',
    desc: 'Étudiez au Canada et ouvrez la porte à l\'immigration permanente grâce à un diplôme canadien.',
    includes: [
      'Choix du programme et de l\'établissement',
      'CAQ (Certificat d\'acceptation du Québec)',
      'Demande de permis d\'études',
      'Permis de travail étudiant (20h/sem)',
      'Planification post-diplôme (PGWP → RP)',
    ],
    programs: ['CAQ + Permis d\'études', 'Co-op/Stage', 'Programme court', 'Cycles supérieurs'],
    timeline: '3-6 mois',
  },
  {
    icon: Heart,
    title: 'Parrainage familial',
    subtitle: 'Réunification familiale',
    color: 'from-rose-500 to-rose-700',
    desc: 'Réunissez votre famille au Canada en parrainant votre conjoint, vos parents ou vos enfants.',
    includes: [
      'Parrainage de conjoint/conjointe',
      'Parrainage de parents et grands-parents',
      'Super visa pour parents',
      'Parrainage d\'enfants à charge',
      'Accompagnement complet du processus',
    ],
    programs: ['Conjoint/Partenaire', 'Parents et grands-parents', 'Enfants à charge', 'Super Visa'],
    timeline: '6-24 mois',
  },
  {
    icon: Plane,
    title: 'Relocalisation et intégration',
    subtitle: 'Service clé en main',
    color: 'from-cyan-500 to-cyan-700',
    desc: 'Un accompagnement complet pour votre installation au Canada: logement, emploi, démarches administratives et intégration.',
    includes: [
      'Recherche de logement',
      'Ouverture de compte bancaire',
      'Inscription scolaire des enfants',
      'Obtention du NAS et RAMQ',
      'Orientation professionnelle et réseautage',
    ],
    programs: ['Package Arrivée', 'Intégration professionnelle', 'Installation familiale', 'Accompagnement continu'],
    timeline: '1-3 mois',
  },
  {
    icon: Building2,
    title: 'Services aux employeurs',
    subtitle: 'Recrutement international',
    color: 'from-indigo-500 to-indigo-700',
    desc: 'Nous aidons les employeurs canadiens à recruter des travailleurs étrangers qualifiés en toute conformité.',
    includes: [
      'Demande d\'EIMT/LMIA',
      'Conformité au programme TET',
      'Recrutement international ciblé',
      'Gestion des permis de travail',
      'Accompagnement en intégration des employés',
    ],
    programs: ['EIMT volet hauts salaires', 'EIMT volet bas salaires', 'PTET', 'Mobilité internationale'],
    timeline: '3-6 mois',
  },
  {
    icon: Globe2,
    title: 'Visa et résidence temporaire',
    subtitle: 'Visiter le Canada',
    color: 'from-teal-500 to-teal-700',
    desc: 'Obtenez votre visa de résident temporaire, super visa, ou autorisation de voyage électronique (AVE/eTA).',
    includes: [
      'Visa de résident temporaire (VRT)',
      'Super Visa (parents/grands-parents)',
      'AVE / eTA',
      'Prolongation de séjour',
      'Restauration de statut',
    ],
    programs: ['VRT', 'Super Visa', 'AVE/eTA', 'Prolongation'],
    timeline: '2-8 semaines',
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">Expertise complète</span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">Nos services d&apos;immigration</h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Un accompagnement professionnel et personnalisé pour chaque étape de votre parcours d&apos;immigration au Canada.
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { icon: Shield, label: 'Confidentialité garantie' },
            { icon: Users, label: 'Équipe multilingue' },
            { icon: Clock, label: 'Suivi personnalisé' },
            { icon: Star, label: 'Satisfaction 95%' },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-400">
              <t.icon className="w-5 h-5 text-gold" />
              <span className="text-sm font-medium">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {services.map((service, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Icon + Title */}
                  <div className="shrink-0">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-md`}>
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <div>
                        <h2 className="text-xl font-bold text-navy">{service.title}</h2>
                        <p className="text-sm text-gold font-medium">{service.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Délai: {service.timeline}</span>
                      </div>
                    </div>

                    <p className="text-gray-500 mb-5">{service.desc}</p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-navy mb-3">Services inclus</h4>
                        <ul className="space-y-2">
                          {service.includes.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-gray-500">
                              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-navy mb-3">Programmes couverts</h4>
                        <div className="flex flex-wrap gap-2">
                          {service.programs.map((p, j) => (
                            <span key={j} className="text-xs px-3 py-1.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing intro */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FileText className="w-10 h-10 text-gold mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">Tarification transparente</h2>
          <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
            Nos honoraires sont établis sur devis selon votre programme et la complexité de votre dossier.
            Les frais d&apos;ouverture de dossier de <strong className="text-navy">250$ CAD</strong> sont non remboursables et couvrent
            l&apos;analyse initiale de votre profil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admissibilite"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-white font-bold rounded-xl hover:bg-gold-dark transition-colors"
            >
              Évaluation gratuite <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-colors"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
