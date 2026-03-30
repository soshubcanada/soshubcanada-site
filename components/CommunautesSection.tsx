'use client';

import { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const communities = [
  {
    id: 'maghreb',
    label: 'Maghreb',
    emoji: '🇲🇦🇩🇿🇹🇳',
    title: 'Vous venez du Maghreb?',
    desc: 'Vous êtes du Maroc, d\'Algérie ou de Tunisie? Le Canada est la destination #1 pour les francophones du Maghreb. Notre équipe arabophone et francophone comprend votre parcours.',
    points: [
      'Équipe qui parle arabe et français',
      'Avantage mobilité francophone',
      'Communauté maghrébine forte à Montréal',
      'Reconnaissance des diplômes (Maroc, Algérie, Tunisie)',
      'Accompagnement respectueux de vos valeurs',
    ],
    color: 'from-emerald-600 to-emerald-800',
  },
  {
    id: 'afrique',
    label: 'Afrique',
    emoji: '🇨🇲🇨🇮🇸🇳',
    title: 'Vous venez d\'Afrique francophone?',
    desc: 'Du Cameroun, de la Côte d\'Ivoire, du Sénégal, du Congo ou de Madagascar? Le Canada accueille les talents francophones d\'Afrique.',
    points: [
      'Programme spécial francophones',
      'Points bonus pour le français',
      'Communauté africaine dynamique à Montréal',
      'Aide à l\'équivalence des diplômes',
      'Réseau d\'entraide et d\'intégration',
    ],
    color: 'from-amber-500 to-amber-700',
  },
  {
    id: 'latino',
    label: 'Latino',
    emoji: '🇨🇴🇧🇷🇲🇽',
    title: 'Vous venez d\'Amérique latine?',
    desc: 'De Colombie, du Brésil, du Mexique, du Venezuela? Le Canada ouvre ses portes aux talents latino-américains. Notre équipe hispanophone vous comprend.',
    points: [
      'Equipo que habla español',
      'Communauté latino grandissante à Montréal',
      'Voies d\'accès pour les professionnels',
      'Aide à l\'apprentissage du français',
      'Intégration culturelle facilitée',
    ],
    color: 'from-orange-500 to-orange-700',
  },
  {
    id: 'moyen-orient',
    label: 'Moyen-Orient',
    emoji: '🇱🇧🇪🇬🇯🇴',
    title: 'Vous venez du Moyen-Orient?',
    desc: 'Du Liban, de l\'Égypte, de la Jordanie, de l\'Irak? Le Canada est reconnu pour son ouverture et sa diversité. Notre équipe arabophone est là pour vous.',
    points: [
      'فريق يتحدث العربية',
      'Communauté moyen-orientale établie',
      'Respect de votre culture et de vos valeurs',
      'Reconnaissance des qualifications',
      'Accompagnement familial complet',
    ],
    color: 'from-navy to-navy-light',
  },
];

export function CommunautesSection() {
  const [active, setActive] = useState(0);
  const c = communities[active];

  return (
    <section className="py-24 md:py-32 bg-cream" id="communautes">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 scroll-hidden">
          <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Nos communautés</span>
          <h2 className="text-3xl md:text-5xl font-bold text-navy mt-3 mb-4">D&apos;où que vous veniez, on vous comprend</h2>
          <div className="divider-gold mx-auto mt-4 mb-6" />
          <p className="text-gray-500 max-w-2xl mx-auto font-sans">
            Notre équipe multilingue accompagne des familles du Maghreb, d&apos;Afrique, d&apos;Amérique latine et du Moyen-Orient.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {communities.map((com, i) => (
            <button
              key={com.id}
              onClick={() => setActive(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold font-sans transition-all ${
                i === active
                  ? 'bg-gradient-to-r from-gold to-gold-dark text-white shadow-lg shadow-gold/25'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gold/30 hover:text-navy'
              }`}
            >
              {com.emoji} {com.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-hidden">
          <div className={`bg-gradient-to-r ${c.color} px-8 py-8`}>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{c.title}</h3>
            <p className="text-white/80 font-sans max-w-2xl">{c.desc}</p>
          </div>
          <div className="p-8">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {c.points.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 font-sans">{point}</span>
                </div>
              ))}
            </div>
            <Link
              href="/admissibilite"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all font-sans"
            >
              Tester mon admissibilité <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
