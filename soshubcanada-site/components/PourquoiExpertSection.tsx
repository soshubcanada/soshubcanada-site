'use client';

import Link from 'next/link';
import { ShieldAlert, AlertTriangle, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

const stats = [
  {
    icon: ShieldAlert,
    value: '35%',
    label: 'des demandes refusées',
    description: 'Plus d\'un tiers des demandes d\'immigration sont refusées chaque année.',
    source: 'Source : IRCC',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
  },
  {
    icon: AlertTriangle,
    value: '6-12 mois',
    label: 'de retard pour 1 erreur',
    description: 'Une seule erreur sur un formulaire peut retarder votre dossier de 6 à 12 mois.',
    source: '',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
  },
  {
    icon: FileText,
    value: '+50',
    label: 'programmes d\'immigration',
    description: 'Plus de 50 programmes d\'immigration au Canada — difficile de s\'y retrouver seul.',
    source: '',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  {
    icon: CheckCircle2,
    value: '95%',
    label: 'de taux de satisfaction',
    description: 'Nos clients accompagnés par un expert obtiennent des résultats concrets.',
    source: '',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
  },
];

export function PourquoiExpertSection() {
  return (
    <section className="py-24 md:py-32 bg-navy relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-16 scroll-hidden">
          <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">
            Pourquoi un expert
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">
            Ne laissez pas votre avenir{' '}
            <span className="text-gradient-gold">au hasard</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto font-sans">
            L&apos;immigration est un processus complexe. Un accompagnement professionnel fait toute la différence entre un dossier accepté et un refus coûteux.
          </p>
          <div className="divider-gold mx-auto mt-6" />
        </div>

        {/* Stat cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="scroll-hidden group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 hover:border-gold/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${stat.bgColor} rounded-2xl mb-5`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 font-sans">
                  {stat.value}
                </div>
                <div className="text-gold font-semibold text-sm uppercase tracking-wider mb-3 font-sans">
                  {stat.label}
                </div>
                <p className="text-white/50 text-sm leading-relaxed font-sans">
                  {stat.description}
                </p>
                {stat.source && (
                  <p className="text-white/30 text-xs mt-3 font-sans italic">
                    {stat.source}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center scroll-hidden">
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto font-sans">
            Faites confiance à nos experts certifiés pour maximiser vos chances de succès.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admissibilite"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-gold/30 transition-all text-lg hover:scale-105 font-sans glow-gold"
            >
              Évaluer mon admissibilité <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/book-online"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 glass text-white font-semibold rounded-xl hover:bg-white/20 transition-all font-sans"
            >
              Parler à un expert
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
