'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatedCounter } from '@/components/AnimatedCounter';
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
  { name: 'Équipe Immigration', role: 'Accompagnement en immigration', desc: 'Orientation et soutien pour les programmes fédéraux et provinciaux, Entrée Express, PEQ et permis de travail.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face' },
  { name: 'Équipe Juridique', role: 'Techniciens juridiques', desc: 'Préparation méticuleuse des dossiers, vérification documentaire et conformité réglementaire.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face' },
  { name: 'Équipe Intégration', role: 'Services de relocalisation', desc: 'Accompagnement pour l\'installation: logement, emploi, inscriptions et démarches administratives.', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=300&fit=crop&crop=face' },
  { name: 'Équipe Employeurs', role: 'Services aux entreprises', desc: 'EIMT, accompagnement des employeurs et conformité au programme des travailleurs étrangers temporaires.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=1920&h=600&fit=crop"
          alt="Montréal skyline"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">À propos</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-3 mb-6">
              Votre partenaire de confiance en immigration
            </h1>
            <div className="divider-gold mt-4 mb-6" />
            <p className="text-white/60 text-lg leading-relaxed font-sans">
              SOS Hub Canada Inc. est un service de relocalisation et d&apos;intégration situé à Montréal, Québec.
              Nous accompagnons les individus et les entreprises dans tous les aspects de l&apos;immigration
              et de la relocalisation au Canada.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="scroll-hidden-left">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-gold" />
              <h2 className="text-3xl md:text-4xl font-bold text-navy">Notre mission</h2>
            </div>
            <div className="divider-gold mb-6" />
            <p className="text-gray-500 leading-relaxed mb-6 font-sans text-lg">
              Faciliter l&apos;immigration et l&apos;intégration au Canada en offrant un accompagnement
              professionnel, transparent et personnalisé.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8 font-sans">
              Notre équipe multilingue (français, anglais, arabe, espagnol) comprend les défis
              auxquels font face les nouveaux arrivants et s&apos;engage à rendre le processus aussi
              fluide que possible.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Dossiers traités', value: 500, suffix: '+' },
                { label: 'Taux de satisfaction', value: 95, suffix: '%' },
                { label: 'Langues parlées', value: 4, suffix: '' },
                { label: 'Programmes couverts', value: 50, suffix: '+' },
              ].map((s, i) => (
                <div key={i} className="bg-cream rounded-xl p-5 text-center">
                  <div className="text-2xl font-bold text-navy">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-gray-400 font-sans mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-hidden-right">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=700&fit=crop"
                alt="Notre équipe"
                width={600}
                height={700}
                className="object-cover w-full h-[500px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <Lightbulb className="w-8 h-8 text-gold mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Notre vision</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4 font-sans">
                  Être la référence en relocalisation et intégration au Canada, reconnu pour notre expertise,
                  son éthique et la qualité de son accompagnement.
                </p>
                <ul className="space-y-2">
                  {[
                    'Démocratiser l\'accès à l\'information en immigration',
                    'Offrir des outils gratuits pour guider les candidats',
                    'Maintenir les plus hauts standards de qualité',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/60 font-sans">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 scroll-hidden">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">Nos valeurs</h2>
            <div className="divider-gold mx-auto mt-4 mb-6" />
            <p className="text-gray-500 max-w-xl mx-auto font-sans">Les principes qui guident chacune de nos actions.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="scroll-hidden bg-white rounded-2xl p-6 border border-gray-100 text-center card-premium" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center mx-auto mb-4 border border-gold/20">
                  <v.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-bold text-navy mb-2 text-lg">{v.title}</h3>
                <p className="text-sm text-gray-500 font-sans">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 scroll-hidden">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">Notre équipe</h2>
            <div className="divider-gold mx-auto mt-4 mb-6" />
            <p className="text-gray-500 max-w-xl mx-auto font-sans">
              Des professionnels dévoués à votre réussite.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((t, i) => (
              <div key={i} className="scroll-hidden text-center card-premium" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="relative w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden shadow-xl">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-bold text-navy text-lg">{t.name}</h3>
                <p className="text-sm text-gold font-medium mb-2 font-sans">{t.role}</p>
                <p className="text-xs text-gray-400 font-sans">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1920&h=600&fit=crop"
          alt="Montréal"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy/90" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <MapPin className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 scroll-hidden">Situé à Montréal</h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto font-sans text-lg scroll-hidden">
            Notre bureau est situé à Montréal, au coeur du Québec. Nous offrons des consultations
            en personne et à distance pour les clients partout dans le monde.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center scroll-hidden">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg transition-all font-sans"
            >
              Nous contacter <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admissibilite"
              className="inline-flex items-center gap-2 px-8 py-4 glass text-white font-semibold rounded-xl hover:bg-white/20 transition-all font-sans"
            >
              Évaluation gratuite
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
