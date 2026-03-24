'use client';

import Link from 'next/link';
import {
  ArrowRight, Award, Users, Shield, Globe2, Heart,
  CheckCircle2, MapPin, Target, Lightbulb
} from 'lucide-react';

const values = [
  { icon: Shield, title: 'Intégrité', desc: 'Transparence totale dans nos démarches et nos honoraires. Aucune promesse de résultat.' },
  { icon: Users, title: 'Accompagnement', desc: 'Suivi personnalisé de chaque dossier, du début à la fin de votre parcours.' },
  { icon: Award, title: 'Excellence', desc: 'Connaissance approfondie des programmes fédéraux et provinciaux, mise à jour continue.' },
  { icon: Heart, title: 'Humanité', desc: 'Nous comprenons l\'importance de votre projet. Chaque dossier est traité avec soin et empathie.' },
];

const team = [
  { name: 'Équipe Immigration', role: 'Conseillers en immigration', desc: 'Experts en programmes fédéraux et provinciaux, Entrée Express, PEQ et permis de travail.' },
  { name: 'Équipe Juridique', role: 'Techniciens juridiques', desc: 'Préparation méticuleuse des dossiers, vérification documentaire et conformité réglementaire.' },
  { name: 'Équipe Intégration', role: 'Services de relocalisation', desc: 'Accompagnement pour l\'installation: logement, emploi, inscriptions et démarches administratives.' },
  { name: 'Équipe Employeurs', role: 'Services aux entreprises', desc: 'EIMT, recrutement international et conformité au programme des travailleurs étrangers temporaires.' },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">À propos</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-6">
              Votre partenaire de confiance en immigration
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              SOS Hub Canada Inc. est un cabinet de consultation en immigration situé à Montréal, Québec.
              Nous accompagnons les individus et les entreprises dans tous les aspects de l&apos;immigration
              et de la relocalisation au Canada.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-gold" />
              <h2 className="text-3xl font-bold text-navy">Notre mission</h2>
            </div>
            <p className="text-gray-500 leading-relaxed mb-6">
              Faciliter l&apos;immigration et l&apos;intégration au Canada en offrant un accompagnement
              professionnel, transparent et personnalisé. Nous croyons que chaque projet d&apos;immigration
              mérite une attention particulière et une expertise rigoureuse.
            </p>
            <p className="text-gray-500 leading-relaxed mb-6">
              Notre équipe multilingue (français, anglais, arabe, espagnol) comprend les défis
              auxquels font face les nouveaux arrivants et s&apos;engage à rendre le processus aussi
              fluide que possible.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Dossiers traités', value: '500+' },
                { label: 'Taux de satisfaction', value: '95%' },
                { label: 'Langues parlées', value: '4' },
                { label: 'Programmes couverts', value: '50+' },
              ].map((s, i) => (
                <div key={i} className="bg-cream rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-navy">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gold/5 to-gold/10 rounded-2xl p-8 border border-gold/20">
            <Lightbulb className="w-8 h-8 text-gold mb-4" />
            <h3 className="text-xl font-bold text-navy mb-4">Notre vision</h3>
            <p className="text-gray-500 leading-relaxed mb-4">
              Être le cabinet de référence en immigration canadienne, reconnu pour son expertise,
              son éthique et la qualité de son accompagnement.
            </p>
            <ul className="space-y-3">
              {[
                'Démocratiser l\'accès à l\'information en immigration',
                'Offrir des outils gratuits pour guider les candidats',
                'Maintenir les plus hauts standards de qualité',
                'Contribuer à l\'intégration réussie des nouveaux arrivants',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-navy mb-4">Nos valeurs</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Les principes qui guident chacune de nos actions.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-bold text-navy mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-navy mb-4">Notre équipe</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Des professionnels dévoués à votre réussite.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t, i) => (
              <div key={i} className="bg-cream rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-navy/40" />
                </div>
                <h3 className="font-bold text-navy">{t.name}</h3>
                <p className="text-sm text-gold font-medium mb-2">{t.role}</p>
                <p className="text-xs text-gray-400">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <MapPin className="w-10 h-10 text-gold mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-navy mb-4">Situé à Montréal</h2>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Notre bureau est situé à Montréal, au coeur du Québec. Nous offrons des consultations
            en personne et à distance pour les clients partout dans le monde.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-white font-bold rounded-xl hover:bg-gold-dark transition-colors"
            >
              Nous contacter <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admissibilite"
              className="inline-flex items-center gap-2 px-8 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-colors"
            >
              Évaluation gratuite
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
