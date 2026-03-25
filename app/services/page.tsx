'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, CheckCircle2, TrendingUp, Award, Briefcase,
  GraduationCap, Heart, Plane, Building2, Globe2,
  Shield, Clock, Star, Users, FileText
} from 'lucide-react';

const services = [
  {
    id: 'entree-express',
    icon: TrendingUp,
    title: 'Entrée Express',
    subtitle: 'Résidence permanente fédérale',
    color: 'from-blue-500 to-blue-700',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&h=400&fit=crop',
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
    id: 'peq',
    icon: Award,
    title: 'Programmes du Québec',
    subtitle: 'PEQ, PRTQ, Arrima',
    color: 'from-emerald-500 to-emerald-700',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop',
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
    id: 'permis-travail',
    icon: Briefcase,
    title: 'Permis de travail',
    subtitle: 'Ouvert et fermé',
    color: 'from-purple-500 to-purple-700',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop',
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
    id: 'permis-etudes',
    icon: GraduationCap,
    title: 'Permis d\'études',
    subtitle: 'Étudier au Canada',
    color: 'from-amber-500 to-amber-700',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop',
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
    id: 'parrainage',
    icon: Heart,
    title: 'Parrainage familial',
    subtitle: 'Réunification familiale',
    color: 'from-rose-500 to-rose-700',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=400&fit=crop',
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
    id: 'relocalisation',
    icon: Plane,
    title: 'Relocalisation et intégration',
    subtitle: 'Service clé en main',
    color: 'from-cyan-500 to-cyan-700',
    image: 'https://images.unsplash.com/photo-1519832979-6fa011b87667?w=800&h=400&fit=crop',
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
    id: 'employeurs',
    icon: Building2,
    title: 'Services aux employeurs',
    subtitle: 'Accompagnement des employeurs',
    color: 'from-indigo-500 to-indigo-700',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop',
    desc: 'Nous aidons les employeurs canadiens à recruter des travailleurs étrangers qualifiés en toute conformité.',
    includes: [
      'Demande d\'EIMT/LMIA',
      'Conformité au programme TET',
      'Accompagnement à l\'embauche de travailleurs étrangers',
      'Gestion des permis de travail',
      'Accompagnement en intégration des employés',
    ],
    programs: ['EIMT volet hauts salaires', 'EIMT volet bas salaires', 'PTET', 'Mobilité internationale'],
    timeline: '3-6 mois',
  },
  {
    id: 'visa',
    icon: Globe2,
    title: 'Visa et résidence temporaire',
    subtitle: 'Visiter le Canada',
    color: 'from-teal-500 to-teal-700',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=400&fit=crop',
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
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1462536943532-57a629f6cc60?w=1920&h=600&fit=crop"
          alt="Services d'immigration"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Expertise complète</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mt-3 mb-4">Nos services d&apos;immigration</h1>
          <div className="divider-gold mx-auto mt-4 mb-6" />
          <p className="text-white/60 max-w-2xl mx-auto text-lg font-sans">
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
              <span className="text-sm font-medium font-sans">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          {services.map((service, i) => (
            <div
              key={i}
              id={service.id}
              className="scroll-hidden bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-premium"
            >
              {/* Image header */}
              <div className="relative h-48 md:h-56 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 md:left-8 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{service.title}</h2>
                    <p className="text-sm text-gold font-medium font-sans">{service.subtitle}</p>
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 md:right-8 flex items-center gap-2 glass rounded-lg px-3 py-2">
                  <Clock className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white/70 font-sans">Délai: {service.timeline}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <p className="text-gray-500 mb-6 text-lg font-sans">{service.desc}</p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold text-navy mb-4 uppercase tracking-wider font-sans">Services inclus</h4>
                    <ul className="space-y-3">
                      {service.includes.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-gray-500 font-sans">
                          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy mb-4 uppercase tracking-wider font-sans">Programmes couverts</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.programs.map((p, j) => (
                        <span key={j} className="text-xs px-4 py-2 bg-cream text-gray-500 rounded-full border border-gray-100 font-sans font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center scroll-hidden">
          <FileText className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">Tarification transparente</h2>
          <div className="divider-gold mx-auto mt-4 mb-6" />
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto font-sans text-lg">
            Nos honoraires sont établis sur devis selon votre programme et la complexité de votre dossier.
            Les frais d&apos;ouverture de dossier de <strong className="text-navy">250$ CAD</strong> sont non remboursables et couvrent
            l&apos;analyse initiale de votre profil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admissibilite"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all font-sans"
            >
              Évaluation gratuite <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-all font-sans"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
