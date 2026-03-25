import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, CheckCircle2, Shield, Clock, Star, Users, FileText,
} from 'lucide-react';
import { services } from '@/lib/services-data';

export const metadata: Metadata = {
  title: 'Nos services d\'immigration au Canada',
  description:
    'Entrée Express, PEQ Québec, permis de travail, permis d\'études, parrainage familial, relocalisation et services aux employeurs. Accompagnement professionnel par SOS Hub Canada.',
  openGraph: {
    title: 'Services d\'immigration — SOS Hub Canada',
    description:
      'Découvrez nos 8 services d\'immigration: Entrée Express, PEQ, permis de travail et d\'études, parrainage, relocalisation et services aux employeurs.',
    url: 'https://soshubcanada.com/services',
  },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1462536943532-57a629f6cc60?w=1920&h=600&fit=crop"
          alt="Services d'immigration"
          fill
          priority
          sizes="100vw"
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
              key={service.id}
              id={service.id}
              className="scroll-hidden bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-premium"
            >
              {/* Image header */}
              <div className="relative h-48 md:h-56 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 800px"
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
            Commencez par une <strong className="text-navy">évaluation gratuite</strong> de votre admissibilité, puis recevez un devis personnalisé.
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
